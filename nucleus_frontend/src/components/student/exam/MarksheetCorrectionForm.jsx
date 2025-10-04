import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "../../main/Navbar";
import Footer from "../../main/Footer";

export default function MarksheetCorrectionForm() {
  const [formData, setFormData] = useState({
    studentName: "",
    studentId: "",
    email: "",
    phone: "",
    semester: "",
    department: "",
    reason: "",
    documents: null,
  });

  const [openDropdown, setOpenDropdown] = useState(null);

  const handleDropdownToggle = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
  };

  const handleCancel = () => {
    setFormData({
      studentName: "",
      studentId: "",
      email: "",
      phone: "",
      semester: "",
      department: "",
      reason: "",
      documents: null,
    });
  };

  // Dropdown options
  const semesters = Array.from({ length: 8 }, (_, i) => `${i + 1}`);
  const departments = ["CS", "IT", "CS-AIML", "CS-DS", "Mechanical", "Civil"];

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow w-full max-w-5xl mx-auto px-6 md:px-10 lg:px-14 py-12">
        {/* Page Title */}
        <div className="text-center md:text-left mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-3">
            Marksheet Request
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl">
            Fill in your details below to request a corrected or duplicate marksheet.
          </p>
        </div>

        {/* Required Documents Notice */}
        <div className="bg-indigo-50 border-l-4 border-indigo-500 text-indigo-900 p-8 rounded-xl mb-12">
          <h2 className="text-xl font-semibold mb-3">Required Documents</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Any previous semester marksheet</li>
            <li>
              Document showing your full correct name (e.g., hall ticket, admit card)
            </li>
            <li>Valid student ID card</li>
            <li>Fee payment receipt (if applicable)</li>
          </ul>
        </div>

        {/* Application Form */}
        <div className="bg-white shadow-xl rounded-2xl p-10">
          <h2 className="text-2xl font-semibold text-indigo-900 mb-4">
            Application Form
          </h2>
          <p className="text-gray-600 mb-8">
            Please fill in all required information and upload necessary documents.
          </p>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
          >
            {/* Student Name */}
            <div>
              <label className="block font-medium mb-2">
                Student Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full h-12 px-4 rounded-lg bg-gray-100 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                required
              />
            </div>

            {/* Student ID */}
            <div>
              <label className="block font-medium mb-2">
                Student ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="Enter Student ID"
                className="w-full h-12 px-4 rounded-lg bg-gray-100 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full h-12 px-4 rounded-lg bg-gray-100 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block font-medium mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full h-12 px-4 rounded-lg bg-gray-100 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                required
              />
            </div>

            {/* Semester Dropdown */}
            <div className="relative">
              <label className="block font-medium mb-2">
                Semester <span className="text-red-500">*</span>
              </label>
              <div
                className="relative w-full"
                onClick={() => handleDropdownToggle("semester")}
              >
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  onBlur={() => setOpenDropdown(null)}
                  className="w-full h-12 pl-4 pr-10 rounded-lg bg-gray-100 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer transition"
                  required
                >
                  <option value="">Select Semester</option>
                  {semesters.map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 top-3 text-gray-500 pointer-events-none">
                  {openDropdown === "semester" ? (
                    <ChevronUp className="h-5 w-5 transition-transform duration-300" />
                  ) : (
                    <ChevronDown className="h-5 w-5 transition-transform duration-300" />
                  )}
                </span>
              </div>
            </div>

            {/* Department Dropdown */}
            <div className="relative">
              <label className="block font-medium mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <div
                className="relative w-full"
                onClick={() => handleDropdownToggle("department")}
              >
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  onBlur={() => setOpenDropdown(null)}
                  className="w-full h-12 pl-4 pr-10 rounded-lg bg-gray-100 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer transition"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 top-3 text-gray-500 pointer-events-none">
                  {openDropdown === "department" ? (
                    <ChevronUp className="h-5 w-5 transition-transform duration-300" />
                  ) : (
                    <ChevronDown className="h-5 w-5 transition-transform duration-300" />
                  )}
                </span>
              </div>
            </div>

            {/* Reason */}
            <div className="md:col-span-2">
              <label className="block font-medium mb-2">
                Reason for Application <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Please provide a detailed reason for your application..."
                className="w-full h-32 px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none transition"
                required
              />
            </div>

            {/* Upload Documents */}
            <div className="md:col-span-2">
              <label className="block font-medium mb-2">
                Upload Required Documents <span className="text-red-500">*</span>
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
                  required
                />
              </label>
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
                className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
