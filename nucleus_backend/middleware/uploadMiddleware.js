import multer from "multer";
import path from "path";

// Store files temporarily before uploading to Cloudinary
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique name
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type. Only JPG, PNG, and PDF allowed."));
};

const upload = multer({ storage, fileFilter });
export default upload;
