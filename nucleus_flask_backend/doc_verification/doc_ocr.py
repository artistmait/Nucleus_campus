import json
import os
import re
from typing import Any, Dict, List, Optional, Tuple

import cv2
import numpy as np
import pytesseract
from pdf2image import convert_from_path


# ─────────────────────────────────────────────
# 0.  Configuration
# ─────────────────────────────────────────────

DEFAULT_OCR_CONFIG = "--oem 3 --psm 6"


def configure_tesseract(cmd_path: Optional[str] = None) -> None:
    path = cmd_path or os.environ.get("TESSERACT_CMD")
    if path:
        pytesseract.pytesseract.tesseract_cmd = path


def get_poppler_path(explicit: Optional[str] = None) -> Optional[str]:
    return explicit or os.environ.get("POPPLER_PATH")


# ─────────────────────────────────────────────
# 1.  Image loading
# ─────────────────────────────────────────────

def convert_pdf_to_images(pdf_path: str, dpi: int = 300, poppler_path: Optional[str] = None):
    kw = {}
    resolved = get_poppler_path(poppler_path)
    if resolved:
        kw["poppler_path"] = resolved
    return convert_from_path(pdf_path, dpi=dpi, **kw)


def pil_to_bgr(pil_image) -> np.ndarray:
    return cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)


def load_image(file_path: str, page_index: int = 0, dpi: int = 300,
               poppler_path: Optional[str] = None) -> np.ndarray:
    if file_path.lower().endswith(".pdf"):
        pages = convert_pdf_to_images(file_path, dpi=dpi, poppler_path=poppler_path)
        if not pages:
            raise ValueError("No pages found in PDF.")
        if not (0 <= page_index < len(pages)):
            raise IndexError(f"Page index {page_index} out of range (PDF has {len(pages)} pages).")
        return pil_to_bgr(pages[page_index])
    img = cv2.imread(file_path)
    if img is None:
        raise ValueError(f"Cannot read image: {file_path}")
    return img


# ─────────────────────────────────────────────
# 2.  Preprocessing
# ─────────────────────────────────────────────

def save_debug(debug_dir: Optional[str], name: str, img: np.ndarray) -> None:
    if not debug_dir:
        return
    os.makedirs(debug_dir, exist_ok=True)
    cv2.imwrite(os.path.join(debug_dir, name), img)


def deskew(gray: np.ndarray) -> np.ndarray:
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    coords = np.column_stack(np.where(binary > 0))
    if coords.size == 0:
        return gray
    angle = cv2.minAreaRect(coords)[-1]
    angle = -(90 + angle) if angle < -45 else -angle
    if abs(angle) < 0.5:  # skip tiny corrections — they can make things worse
        return gray
    h, w = gray.shape[:2]
    M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
    return cv2.warpAffine(gray, M, (w, h), flags=cv2.INTER_CUBIC,
                          borderMode=cv2.BORDER_REPLICATE)


def percentile_stretch(gray: np.ndarray, p_low: int = 3, p_high: int = 97) -> np.ndarray:
    lo = float(np.percentile(gray, p_low))
    hi = float(np.percentile(gray, p_high))
    if hi <= lo:
        return gray
    stretched = np.clip((gray.astype(np.float32) - lo) / (hi - lo) * 255.0, 0, 255)
    return stretched.astype(np.uint8)


def preprocess_image(img_bgr: np.ndarray, debug_dir: Optional[str] = None) -> np.ndarray:
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    save_debug(debug_dir, "01_gray.png", gray)

    # Upscale if image is too small (phone photos, low-res scans)
    h, w = gray.shape
    if h < 2000:
        scale = 2400 / h
        gray = cv2.resize(gray, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)
        save_debug(debug_dir, "02_upscaled.png", gray)

    # Gentle denoise — do NOT use aggressive denoising, it removes table lines
    denoised = cv2.GaussianBlur(gray, (3, 3), 0)
    save_debug(debug_dir, "03_denoised.png", denoised)

    # Deskew
    deskewed = deskew(denoised)
    save_debug(debug_dir, "04_deskewed.png", deskewed)

    # Percentile stretch — maps actual content range to 0–255
    # Use rows 15%–95% of image to avoid header logo and bottom whitespace
    # skewing the percentile calculation
    h2 = deskewed.shape[0]
    content_region = deskewed[int(h2 * 0.05):int(h2 * 0.97), :]
    lo = float(np.percentile(content_region, 3))
    hi = float(np.percentile(content_region, 97))
    if hi > lo:
        stretched = np.clip((deskewed.astype(np.float32) - lo) / (hi - lo) * 255.0, 0, 255).astype(np.uint8)
    else:
        stretched = deskewed
    save_debug(debug_dir, "05_stretched.png", stretched)

    # Otsu threshold — now works correctly on stretched image
    _, binary = cv2.threshold(stretched, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    save_debug(debug_dir, "06_otsu.png", binary)

    # Light morphological open — removes only single-pixel speckle
    kernel = np.ones((2, 2), np.uint8)
    cleaned = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
    save_debug(debug_dir, "07_cleaned.png", cleaned)

    return cleaned


# ─────────────────────────────────────────────
# 3.  OCR
# ─────────────────────────────────────────────

def extract_text(img: np.ndarray, config: str = DEFAULT_OCR_CONFIG) -> str:
    return pytesseract.image_to_string(img, lang="eng", config=config)


def normalize_text(text: str) -> str:
    text = text.replace("\r", "\n").replace("\x0c", "")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


# ─────────────────────────────────────────────
# 4.  Field extraction  (Mumbai University)
# ─────────────────────────────────────────────

def _clean(v: str) -> str:
    return re.sub(r"\s+", " ", v).strip(" :|-\t/")


def extract_fields(lines: List[str]) -> Dict[str, str]:

    per_line_patterns: Dict[str, List[str]] = {
        "name": [
            r"Name\s*[:/]+\s*/+\s*([A-Z][A-Z\s\(\)]{5,})",
        ],
        "prn": [
            r"PRN\s*[:\-]?\s*(\d{13,16})",
        ],
        "seat_number": [
            r"Seat\s+(?:No\.?|Number)\s*[:\-]?\s*(\d{5,10})",
        ],
        "college": [
            r"College\s*[:\-]\s*(.+?)(?:\s*\(\d+\))?\s*$",
        ],
        "college_code": [
            r"College.*?\((\d{3,4})\)",
        ],
        "exam_center": [
            r"Exam(?:ination)?\s+[Cc]enter\s*[:\-]\s*(.+)",
        ],
        "semester": [
            r"Sem(?:ester)?\s+(VII|VI|V|IV|III|II|I)\b",
            r"\[.*(Sem\s+(?:VII|VI|V|IV|III|II|I))\b",
        ],
        "exam_session": [
            r"Examination\s*[:\-]?\s*((?:Winter|Summer)\s+(?:Session\s+)?\d{4})",
            r"((?:Winter|Summer)\s+(?:Session\s+)?\d{4})",
        ],
        "programme": [
            r"Statement of Grade for\s+(.+?)\s+(?:Sem|Information|Computer|Electronics)",
        ],
        "branch": [
            r"\b(Information Technology|Computer Engineering|Electronics|Mechanical|"
            r"Civil|Chemical|Electrical|Instrumentation|EXTC)\b",
        ],
        "statement_no": [
            r"Statement\s+No\s*[:\-]?\s*(\d+)",
        ],
        "date": [
            r"Date\s*[:\-]?\s*(\d{1,2}\s+\w+\s+\d{4})",
        ],
    }

    fields: Dict[str, str] = {}
    for line in lines:
        for key, pats in per_line_patterns.items():
            if key in fields:
                continue
            for pat in pats:
                m = re.search(pat, line, re.IGNORECASE)
                if m:
                    fields[key] = _clean(m.group(1) if m.lastindex else m.group(0))
                    break

    # Metrics — search joined text with fuzzy patterns to survive OCR noise
    joined = " ".join(lines)

    metric_patterns = {
        # Credits line: "Credit: 22.00" or "Credit: 18.00"
        "credits":      r"Credit\s*[:\s]+(\d+\.?\d*)",
        # CR X GP: may appear as "CR X GP: 205.00" or garbled "CRXGP" variants
        "cr_x_gp":      r"CR\s*[XxAU*]+\s*GP\s*[:\s]+(\d+\.?\d*)",
        # SGPI: "SGPI: 9.32" — Sem I card has it; Sem VII card the SGPI cell is OCR-garbled
        "sgpi":         r"SGPI\s*[:\s]+([0-9]+\.[0-9]+)",
        # CGPA if present
        "cgpa":         r"CGPA\s*[:\s]+([0-9]+\.[0-9]+)",
        # Grand Total: "Grand Total: 625/750" — OCR sometimes misreads digits
        "total_marks":  r"(?:Grand|Grond)\s+Total\s*[:\s]*(\d{3,4}/\d{3,4})",
        # Status: "Successful" or OCR noise variants
        "status":       r"\b(Successful|Soccisfel|Successfl|Siatel)\b",
        # Percentage
        "percentage":   r"Percentage\s*[:\s]+(\d+\.?\d*)",
    }

    for key, pat in metric_patterns.items():
        if key not in fields:
            m = re.search(pat, joined, re.IGNORECASE)
            if m:
                val = _clean(m.group(1))
                # Normalize OCR-garbled "Successful" variants
                if key == "status":
                    val = "Successful"
                fields[key] = val

    # If SGPI wasn't found in joined text, try the summary row specifically
    # (Sem VII: "Sem VII Credit: 22.00 CR... SGPI: 9.32 Status: Successful")
    if "sgpi" not in fields:
        for line in lines:
            if re.search(r"Sem\s+(?:VII|VI|V|IV|III|II|I)", line, re.IGNORECASE):
                m = re.search(r"(\d+\.\d{2})\s*(?:Status|$)", line)
                if m:
                    # Last float before "Status" on summary row is usually SGPI
                    floats = re.findall(r"(\d+\.\d{2})", line)
                    # Credits is usually 18 or 22, CR×GP is usually >100
                    # SGPI is 0–10 range, typically 5–10
                    for f in reversed(floats):
                        try:
                            v = float(f)
                            if 0.0 < v <= 10.0:
                                fields["sgpi"] = f
                                break
                        except ValueError:
                            pass

    return fields


# ─────────────────────────────────────────────
# 5.  Subject extraction  (numeric + alpha codes)
# ─────────────────────────────────────────────

def extract_subjects(lines: List[str]) -> List[Dict[str, Any]]:
    subjects: List[Dict[str, Any]] = []

    # Match at start of line: 5-digit number OR letter+digit code
    code_re = re.compile(r"^\s*(\d{5}|[A-Z]{2,4}\d{3,4}[A-Z]?)\b")
    grade_re = re.compile(r"\b(O|A\+?|B\+?|C\+?|D|F|P)\b")
    float_re = re.compile(r"\b(\d{1,3}\.\d{2})\b")

    for line in lines:
        m = code_re.match(line)
        if not m:
            continue

        code = m.group(1)
        rest = line[m.end():].strip()

        # Paper name: text before first Th/Pr/Tw/OR keyword
        name_m = re.match(r"^(.*?)\s+\b(Th|Pr|Tw|OR|Lab|TW)\b", rest, re.IGNORECASE)
        paper_name = _clean(name_m.group(1)) if name_m else None

        # Paper type
        type_m = re.search(r"\b(Th|Pr|Tw|OR|Lab|TW)\b", rest, re.IGNORECASE)
        paper_type = type_m.group(1).capitalize() if type_m else None

        # Grade
        grades = grade_re.findall(line)
        grade = grades[-1].upper() if grades else None

        # Float values on the line: [credits, gp, cr_x_gp]
        floats = [float(x) for x in float_re.findall(line)]

        # Max marks and obtained — look for "100 73", "75 50", "25 23", "50 38"
        max_obt = re.findall(r"\b(100|75|50|25)\s+(\d{1,3})\b", line)

        entry: Dict[str, Any] = {
            "code":  code,
            "name":  paper_name,
            "type":  paper_type,
            "grade": grade,
        }
        if max_obt:
            entry["max_marks"]      = int(max_obt[0][0])
            entry["marks_obtained"] = int(max_obt[0][1])
        if floats:
            # credits is usually 0.5–3, gp is 6–10, cr_x_gp is credits*gp
            entry["floats"] = floats

        subjects.append(entry)

    return subjects


# ─────────────────────────────────────────────
# 6.  Document structure verification
# ─────────────────────────────────────────────

def _crop(img_bgr: np.ndarray, x_pct: Tuple[float, float], y_pct: Tuple[float, float]) -> np.ndarray:
    h, w = img_bgr.shape[:2]
    return img_bgr[int(h*y_pct[0]):int(h*y_pct[1]), int(w*x_pct[0]):int(w*x_pct[1])]


def _has_content(region: np.ndarray, threshold: float = 0.03) -> bool:
    gray = cv2.cvtColor(region, cv2.COLOR_BGR2GRAY) if region.ndim == 3 else region
    # Stretch before checking — region may be low contrast like the rest of the PDF
    lo, hi = float(np.percentile(gray, 5)), float(np.percentile(gray, 95))
    if hi > lo:
        gray = np.clip((gray.astype(np.float32) - lo) / (hi - lo) * 255, 0, 255).astype(np.uint8)
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    dark_ratio = float(np.count_nonzero(binary)) / binary.size
    return bool(dark_ratio > threshold)


def verify_document_structure(img_bgr: np.ndarray) -> Dict[str, Any]:
    checks: Dict[str, Any] = {}

    # Logo (top-left shield)
    logo = _crop(img_bgr, (0.01, 0.11), (0.01, 0.11))
    checks["logo_present"] = _has_content(logo, threshold=0.04)

    # Header text — OCR a strip across the top
    header = _crop(img_bgr, (0.10, 0.90), (0.01, 0.09))
    header_gray = cv2.cvtColor(header, cv2.COLOR_BGR2GRAY)
    # Stretch header before OCR
    lo, hi = float(np.percentile(header_gray, 3)), float(np.percentile(header_gray, 97))
    if hi > lo:
        header_gray = np.clip((header_gray.astype(np.float32)-lo)/(hi-lo)*255, 0, 255).astype(np.uint8)
    _, header_bin = cv2.threshold(header_gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    header_text = pytesseract.image_to_string(header_bin, config="--oem 3 --psm 6")
    checks["header_text_found"] = bool(
        re.search(r"university|mumbai|grade\s*card", header_text, re.IGNORECASE)
    )
    checks["header_ocr_sample"] = header_text.strip()[:80].replace("\n", " ")

    # Student photo (top-right)
    photo = _crop(img_bgr, (0.82, 0.99), (0.07, 0.22))
    checks["photo_present"] = _has_content(photo, threshold=0.05)

    # Director signature (bottom-right)
    sig = _crop(img_bgr, (0.50, 0.99), (0.77, 0.93))
    checks["signature_present"] = _has_content(sig, threshold=0.02)

    # Barcode / Statement No (bottom-left)
    barcode = _crop(img_bgr, (0.01, 0.25), (0.85, 0.96))
    checks["barcode_present"] = _has_content(barcode, threshold=0.03)

    passed = sum(1 for k, v in checks.items()
                 if k not in ("structure_score", "structure_valid", "header_ocr_sample")
                 and v is True)
    total = 5
    checks["structure_score"] = f"{passed}/{total}"
    checks["structure_valid"] = bool(passed >= 3)

    return checks


# ─────────────────────────────────────────────
# 7.  Field-level verification
# ─────────────────────────────────────────────

def verify_fields(fields: Dict[str, str], subjects: List[Dict]) -> Dict[str, Any]:
    issues: List[str] = []
    warnings: List[str] = []

    # Required fields
    required = ["name", "prn", "semester", "college"]
    missing = [k for k in required if not fields.get(k)]
    if missing:
        issues.append(f"Missing required fields: {', '.join(missing)}")

    # PRN: 13–16 digits
    prn = fields.get("prn", "")
    if prn and not re.fullmatch(r"\d{13,16}", prn):
        issues.append(f"PRN format invalid: '{prn}' (expected 13-16 digits)")

    # Seat number
    seat = fields.get("seat_number", "")
    if seat and not re.fullmatch(r"\d{5,8}", seat):
        warnings.append(f"Seat number unusual: '{seat}'")

    # SGPI range
    sgpi = fields.get("sgpi", "")
    if sgpi:
        try:
            val = float(sgpi)
            if not (0.0 <= val <= 10.0):
                issues.append(f"SGPI out of valid range: {val}")
        except ValueError:
            warnings.append(f"SGPI not numeric: '{sgpi}'")

    # Grand total sanity
    total = fields.get("total_marks", "")
    if total:
        m = re.match(r"(\d+)/(\d+)", total)
        if m:
            obtained, maximum = int(m.group(1)), int(m.group(2))
            if obtained > maximum:
                issues.append(f"Grand total obtained ({obtained}) > maximum ({maximum})")
            # Typical Mumbai Uni totals are multiples of 25
            if maximum % 25 != 0:
                warnings.append(f"Grand total maximum ({maximum}) is not a multiple of 25")
        else:
            warnings.append(f"Grand total format unexpected: '{total}'")

    # Per-subject marks sanity
    for s in subjects:
        obt = s.get("marks_obtained")
        mx = s.get("max_marks")
        if obt is not None and mx is not None:
            if obt > mx:
                issues.append(f"Subject {s['code']}: obtained ({obt}) > max ({mx})")

    # Status cross-check
    status = fields.get("status", "")
    if status and sgpi:
        try:
            if "successful" in status.lower() and float(sgpi) < 4.0:
                warnings.append(f"Status Successful but SGPI ({sgpi}) is unusually low")
        except ValueError:
            pass

    return {
        "is_valid":  len(issues) == 0,
        "issues":    issues,
        "warnings":  warnings,
    }


# ─────────────────────────────────────────────
# 8.  JSON serialization helper
# ─────────────────────────────────────────────

class NumpySafeEncoder(json.JSONEncoder):
    """Converts numpy scalars to native Python types (required for json.dumps)."""
    def default(self, obj: Any) -> Any:
        if isinstance(obj, np.bool_):
            return bool(obj)
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)


# ─────────────────────────────────────────────
# 9.  Full pipeline
# ─────────────────────────────────────────────

def run_pipeline(
    file_path: str,
    page_index: int = 0,
    dpi: int = 300,
    debug_dir: Optional[str] = None,
    include_raw_text: bool = False,
    poppler_path: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Main entry point. Returns a dict with:
      - fields:                 extracted header fields (name, PRN, semester, etc.)
      - subjects:               list of subject rows with marks and grades
      - field_verification:     is_valid, issues, warnings
      - structure_verification: logo/header/photo/signature/barcode checks
      - overall_valid:          True only if both field and structure checks pass
    """
    configure_tesseract()

    # Load at original color depth — needed for structure checks
    raw_image = load_image(file_path, page_index=page_index, dpi=dpi,
                           poppler_path=poppler_path)

    # Preprocess for OCR
    processed = preprocess_image(raw_image, debug_dir=debug_dir)

    # OCR
    raw_text = extract_text(processed)
    text = normalize_text(raw_text)
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]

    # Extract structured data
    fields = extract_fields(lines)
    subjects = extract_subjects(lines)

    # Verify
    fv = verify_fields(fields, subjects)
    sv = verify_document_structure(raw_image)

    result: Dict[str, Any] = {
        "input":                  file_path,
        "page_index":             page_index,
        "fields":                 fields,
        "subjects":               subjects,
        "field_verification":     fv,
        "structure_verification": sv,
        "overall_valid":          bool(fv["is_valid"] and sv["structure_valid"]),
    }

    if include_raw_text:
        result["raw_text"] = text

    return result


# ─────────────────────────────────────────────
# 10. Entry point
# ─────────────────────────────────────────────

if __name__ == "__main__":
    import sys

    targets = sys.argv[1:] if len(sys.argv) > 1 else [
        os.path.abspath(os.path.join(
            os.path.dirname(__file__), "..", "sample",
            "Maitreyee Sem 7 report card.pdf"
        ))
    ]

    for pdf_path in targets:
        output = run_pipeline(
            pdf_path,
            page_index=0,
            dpi=300,
            debug_dir=None,          # Set to "debug_output" to save intermediate images
            include_raw_text=False,
            poppler_path=os.environ.get("POPPLER_PATH"),
        )
        print(json.dumps(output, indent=2, ensure_ascii=False, cls=NumpySafeEncoder))
        print()