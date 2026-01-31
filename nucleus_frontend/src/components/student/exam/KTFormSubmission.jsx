import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../../main/Navbar";
import Footer from "../../main/Footer";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import KTTableWrapper from "./KTtable";
import PrevExamTableWrapper from "./PreviousExamDetailTable";

export default function KTFormSubmission() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_id: "",
    moodle_id: "",
    department: "",
    department_id: "",
    type: "KT_form",
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

      const res = await axios.post(
        "http://localhost:5000/api/student/submitApplication",
        payload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
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
    <div className="w-full min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow w-full max-w-5xl mx-auto px-6 md:px-10 lg:px-14 py-12">
        <ToastContainer position="top-right" autoClose={3000} />
        <h1 className="text-4xl font-bold text-indigo-900 mb-6">
          Marksheet Correction Request
        </h1>
        {/* Required Documents Info */}
        <div className="mb-8 bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-indigo-900 mb-2">
            Required Documents
          </h2>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed">
            <li>Scanned copy of your latest marksheet.</li>
            {/* <li>
              Supporting proof (if applicable) such as corrected marks from
              faculty or HoD.
            </li>
            <li>Any official communication or email evidence (if relevant).</li> */}
          </ul>
          <p className="mt-3 text-sm text-gray-600 italic">
            <AlertTriangle className="size-5" /> Ensure all documents are clear and in PDF or image format
            (JPEG/PNG). Maximum file size: 5MB.
            <span className="text-red text-sm">Under Testing</span>
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-10">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
          >
            {/* Student ID */}
            <div>
              <label className="block font-medium mb-2">Student ID</label>
              <input
                type="text"
                name="student_id"
                value={formData.student_id}
                disabled
                className="w-full h-12 px-4 rounded-lg bg-gray-100 border border-gray-300"
              />
            </div>

            {/* Department */}
            {/* <div>
              <label className="block font-medium mb-2">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-lg bg-white border border-gray-300"
                required
              >
                <option value="">Select Department</option>
                {Object.entries(departmentMap).map(([id, code]) => (
                  <option key={id} value={id}>
                    {code}
                  </option>
                ))}
              </select>
            </div> */}
            <div>
              <label className="block font-medium mb-2">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                disabled
                className="w-full h-12 px-4 rounded-lg bg-gray-100 border border-gray-300"
              />
            </div>

            {/* Application Type */}
            <div>
              <label className="block font-medium mb-2">Application Type</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                disabled
                className="w-full h-12 px-4 rounded-lg bg-gray-100 border border-gray-300"
              />
            </div>
            <div>
              <label htmlFor="moodle_id" className="block font-medium mb-2">Moodle ID</label>
              <input
                type="text"
                name="moodle_id"
                id="moodle_id"
                value={formData.moodle_id}
                disabled
                className="w-full h-12 px-4 rounded-lg bg-gray-100 border border-gray-300"
              />
            </div>
            <div>
              <label htmlFor="moodle_id" className="block font-medium mb-2">Mobile Number</label>
              <input
                type="text"
                name="mobile_no"
                id="mobile_no"
                className="w-full h-12 px-4 rounded-lg bg-gray-100 border border-gray-300"
              />
            </div>
            <div>
              <label htmlFor="moodle_id" className="block font-medium mb-2">Previous Seat Number</label>
              <input
                type="text"
                name="prev_seatno"
                id="prev_seatno"
                className="w-full h-12 px-4 rounded-lg bg-gray-100 border border-gray-300"
              />
            </div>

            {/* Reason */}
            {/* <div className="md:col-span-2">
              <label className="block font-medium mb-2">
                Reason for Application
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Please describe your reason..."
                className="w-full h-32 px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-indigo-500 resize-none"
                required
              />
            </div> */}


            {/* Full name input */}
            <div className="md:col-span-2">
              <label className="block font-medium mb-2">
                Student Name (in Full)
              </label>
              <input
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Surname Full-Name Father's-Name Mother's-Name"
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-indigo-500 resize-none"
                required
              />
            </div>
            

            {/* KT PAPER TABLE */}
             <div className="md:col-span-2">
              <label className="block font-medium mb-2">
                I would like to appear in the following exams...
              </label>
              <KTTableWrapper/>
            </div>

            {/* PREV EXAM DETAIL TABLE */}
             <div className="md:col-span-2">
              <label className="block font-medium mb-2">
                Details of Lower Examinations (Attach all Marksheets)
              </label>
              <PrevExamTableWrapper/>
            </div>
            
            {/* Upload Documents */}
            <div className="md:col-span-2">
              <label className="block font-medium mb-2">
                Upload Required Documents
              </label>
              <label className="flex items-center justify-center w-full h-14 px-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                <span className="text-gray-600">
                  {formData.documents ? formData.documents.name : "Choose File"}
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

            <div className="md:col-span-2 gap-4">
              <input type="checkbox" id="checkbox" className="gap-4"/>
              Also I am aware that if any from above subjects get cleared in revaluation, 
                I will immediately inform to Exam Section by submitting the proof.
            </div>
             

            {/* Buttons */}
            <div className="md:col-span-2 flex justify-end gap-4 mt-8">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-6 py-2.5 rounded-lg border ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-900 text-white hover:bg-indigo-800"
                }`}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
