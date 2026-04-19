import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../../main/Navbar";
import Footer from "../../main/Footer";
import api from "../../../config/api";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export default function MarksheetCorrectionForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_id: "",
    moodle_id: "",
    department: "",
    department_id: "",
    type: "marksheet_correction",
    documents: null,
  });

  const departmentMap = useMemo(
    () => ({
      1: "IT",
    }),
    []
  );

  // Autofill student details from logged-in user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setFormData((prev) => ({
        ...prev,
        student_id: user.id || "",
        moodle_id: user.moodle_id || "",
        department: departmentMap[user.department_id] || "",
        department_id: user.department_id || "",
      }));
    }
  }, [departmentMap]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        student_id: formData.student_id,
        type: formData.type,
        documents: formData.documents,
        department_id: formData.department_id,
      };

      const res = await api.post(
        "/api/student/submitApplication",
        payload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (res.data.success) {
        toast.success("Application Successfully Submitted");
        setTimeout(() => {
          navigate("/student/myapplications");
        }, 1000);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleCancel = () => {
    setFormData((prev) => ({
      ...prev,
      reason: "",
      documents: null,
    }));
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#f7f9fb]">
      <Navbar />
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12 pb-24">
        <ToastContainer position="top-right" autoClose={3000} />
        <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#191c1e] tracking-tight leading-tight mb-8">
          Marksheet Correction Request
        </h1>
        {/* Required Documents Info */}
        <div className="mb-10 bg-white shadow-[0_4px_20px_rgba(49,46,129,0.04)] rounded-[24px] p-8 border-none">
          <h2 className="text-xl font-bold text-[#191c1e] mb-3">
            Required Documents
          </h2>
          <ul className="list-disc list-inside text-[#464554] leading-relaxed">
            <li>Scanned copy of your latest marksheet.</li>
            {/* <li>
              Supporting proof (if applicable) such as corrected marks from
              faculty or HoD.
            </li>
            <li>Any official communication or email evidence (if relevant).</li> */}
          </ul>
          <div className="mt-4 flex items-start gap-2 text-sm text-[#464554] bg-[#f7f9fb] p-4 rounded-xl">
            <AlertTriangle className="size-5 text-amber-600 flex-shrink-0" /> 
            <p>Ensure all documents are clear and in PDF or image format (JPEG/PNG). Maximum file size: 5MB.</p>
          </div>
        </div>

        <div className="bg-white shadow-[0_4px_20px_rgba(49,46,129,0.04)] rounded-[24px] p-8 lg:p-10 border-none">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8"
          >
            {/* Student ID */}
            <div>
              <label className="block text-[13px] font-semibold text-[#464554] uppercase tracking-wide mb-2">Student ID</label>
              <input
                type="text"
                name="student_id"
                value={formData.student_id}
                disabled
                className="w-full h-14 px-4 rounded-xl bg-[#f7f9fb] border-none text-[#191c1e] shadow-inner"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-[13px] font-semibold text-[#464554] uppercase tracking-wide mb-2">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                disabled
                className="w-full h-14 px-4 rounded-xl bg-[#f7f9fb] border-none text-[#191c1e] shadow-inner"
              />
            </div>

            {/* Application Type */}
            <div>
              <label className="block text-[13px] font-semibold text-[#464554] uppercase tracking-wide mb-2">Application Type</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                disabled
                className="w-full h-14 px-4 rounded-xl bg-[#f7f9fb] border-none text-[#191c1e] shadow-inner"
              />
            </div>
            <div>
              <label htmlFor="moodle_id" className="block text-[13px] font-semibold text-[#464554] uppercase tracking-wide mb-2">Moodle ID</label>
              <input
                type="text"
                name="moodle_id"
                id="moodle_id"
                value={formData.moodle_id}
                disabled
                className="w-full h-14 px-4 rounded-xl bg-[#f7f9fb] border-none text-[#191c1e] shadow-inner"
              />
            </div>

            {/* Upload Documents */}
            <div className="md:col-span-2 mt-4">
              <label className="block text-[14px] font-bold text-[#191c1e] mb-4">
                Upload Required Documents
              </label>
              <label className="flex items-center justify-center w-full h-24 px-4 border-2 border-dashed border-[#c7c4d7] rounded-[16px] cursor-pointer bg-[#f7f9fb] hover:bg-[#e3dfff]/30 transition-colors group">
                <span className="text-[#464554] font-medium group-hover:text-[#2a14b4]">
                  {formData.documents ? formData.documents.name : "Click to select or drop file here"}
                </span>
                <input
                  type="file"
                  name="documents"
                  onChange={handleChange}
                  className="hidden"
                  accept="image/jpeg,image/png,application/pdf"
                  required
                />
              </label>
            </div>

            {/* Buttons */}
            <div className="md:col-span-2 flex justify-end gap-4 mt-8 pt-6 border-t border-[#f2f4f6]">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 rounded-xl bg-transparent text-[#464554] font-semibold hover:bg-[#f2f4f6] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-8 py-3 rounded-xl font-bold shadow-[0_4px_12px_rgba(42,20,180,0.3)] transition-all ${
                  loading
                    ? "bg-[#c7c4d7] text-white cursor-not-allowed shadow-none"
                    : "bg-gradient-to-br from-[#2a14b4] to-[#4338ca] text-white hover:shadow-[0_6px_20px_rgba(42,20,180,0.4)] hover:-translate-y-0.5"
                }`}
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
