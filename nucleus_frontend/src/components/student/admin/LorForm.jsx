import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../../main/Navbar";
import Footer from "../../main/Footer";
import api from "../../../config/api";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Plus, X } from "lucide-react";

export default function LorForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_name: "",
    address: "",
    student_id: "",
    moodle_id: "",
    department: "",
    department_id: "",
    mobile_no: "",
    email: "",
    yr_admission: "",
    dse_ornot: "",
    current_status: "",
    current_yr: "",
    lor_staff: [""],
    no_of_lors: "",
    payment_date: "",
    documents: null,
    type: "lor_request",
  });

  const staffLimit = 6;

  const departmentMap = useMemo(
    () => ({
      1: "IT",
    }),
    [],
  );

  // Autofill student details from logged-in user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setFormData((prev) => ({
        ...prev,
        student_name: user.username || user.name || "",
        email: user.email || "",
        mobile_no: user.mobile_no || user.phone || "",
        student_id: user.id || "",
        moodle_id: user.moodle_id || "",
        department: departmentMap[user.department_id] || "",
        department_id: user.department_id || "",
      }));
    }
  }, [departmentMap]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStaffChange = (index, value) => {
    setFormData((prev) => {
      const nextStaff = [...prev.lor_staff];
      nextStaff[index] = value;
      return { ...prev, lor_staff: nextStaff };
    });
  };

  const addStaffField = () => {
    setFormData((prev) => {
      if (prev.lor_staff.length >= staffLimit) return prev;
      return { ...prev, lor_staff: [...prev.lor_staff, ""] };
    });
  };

  const removeStaffField = (index) => {
    setFormData((prev) => {
      if (prev.lor_staff.length <= 1) return prev;
      return {
        ...prev,
        lor_staff: prev.lor_staff.filter((_, i) => i !== index),
      };
    });
  };

  const totalAmount = useMemo(() => {
    const copies = parseInt(formData.no_of_lors, 10);
    if (Number.isNaN(copies) || copies <= 0) return "";
    return `${copies * 10}`;
  }, [formData.no_of_lors]);

  const inputBase =
    "w-full h-14 px-4 rounded-xl bg-white border border-[#e5e7eb] text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-indigo-200";
  const readOnlyBase =
    "w-full h-14 px-4 rounded-xl bg-[#f7f9fb] border-none text-[#191c1e] shadow-inner";
  const textareaBase =
    "w-full min-h-[120px] px-4 py-3 rounded-xl bg-white border border-[#e5e7eb] text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-indigo-200";

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = new FormData();
      payload.append("student_id", formData.student_id);
      payload.append("type", formData.type);
      payload.append("department_id", formData.department_id);
      payload.append("department", formData.department);
      payload.append("student_name", formData.student_name);
      payload.append("address", formData.address);
      payload.append("mobile_no", formData.mobile_no);
      payload.append("email", formData.email);
      payload.append("yr_admission", formData.yr_admission);
      payload.append("dse_ornot", formData.dse_ornot);
      payload.append("current_status", formData.current_status);
      payload.append("current_yr", formData.current_yr);
      payload.append("lor_staff", JSON.stringify(formData.lor_staff));
      payload.append("no_of_lors", formData.no_of_lors);
      payload.append("payment_date", formData.payment_date);
      if (formData.documents) {
        payload.append("documents", formData.documents);
      }

      const res = await api.post("/api/student/submitApplication", payload);

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
      student_name: "",
      address: "",
      mobile_no: "",
      email: "",
      yr_admission: "",
      dse_ornot: "",
      current_status: "",
      current_yr: "",
      lor_staff: [""],
      no_of_lors: "",
      payment_date: "",
      documents: null,
    }));
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#f7f9fb]">
      <Navbar />
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12 pb-24">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#464554] font-semibold shadow-[0_4px_20px_rgba(49,46,129,0.04)] hover:bg-[#f2f4f6] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#191c1e] tracking-tight leading-tight mb-8">
          Letter of Recommendation (LOR) Request
        </h1>
        {/* Required Documents Info */}
        <div className="mb-10 bg-white shadow-[0_4px_20px_rgba(49,46,129,0.04)] rounded-[24px] p-8 border-none">
          <h2 className="text-xl font-bold text-[#191c1e] mb-3">
            Required Procedure
          </h2>
          <ul className="list-disc list-inside text-[#464554] leading-relaxed">
            <li>Scanned copy of your latest marksheet.</li>
            <li>
              Submit Application form to receptionist along with Xerox copies of
              LOR with staff signature
            </li>
            <li>Rs. 10/- per copy per letter head will be charges.</li>
            <li>
              In response to your request, demand for payment to be paid will be
              made available in your admission portal. Payment has to be
              credited through debit card, credit card or by net banking only.
            </li>
            <li>
              Pay the demand generated online and submit the receipt of payment
            </li>
            <li>
              LOR will be issued within 05 working days after submission of
              payment receipt.
            </li>

            {/* <li>
              Supporting proof (if applicable) such as corrected marks from
              faculty or HoD.
            </li>
            <li>Any official communication or email evidence (if relevant).</li> */}
          </ul>
          <div className="mt-4 flex items-start gap-2 text-sm text-[#464554] bg-[#f7f9fb] p-4 rounded-xl">
            <AlertTriangle className="size-5 text-amber-600 flex-shrink-0" />
            <p>
              Ensure all documents are clear and in PDF or image format
              (JPEG/PNG). Maximum file size: 5MB.
            </p>
          </div>
        </div>

        <div className="bg-white shadow-[0_4px_20px_rgba(49,46,129,0.04)] rounded-[24px] p-8 lg:p-10 border-none">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8"
          >
            {/* Student Name */}
            <div>
              <label className="block text-[13px] font-semibold text-[#464554] uppercase tracking-wide mb-2">
                Name of the Student
              </label>
              <input
                type="text"
                name="student_name"
                value={formData.student_name}
                onChange={handleChange}
                className={inputBase}
                placeholder="SURNAME FIRSTNAME MIDDLENAME"
              />
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-[13px] font-semibold text-[#464554] uppercase tracking-wide mb-2">
                Student ID
              </label>
              <input
                type="text"
                name="student_id"
                value={formData.student_id}
                disabled
                className={readOnlyBase}
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-[13px] font-semibold text-[#464554] uppercase tracking-wide mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={textareaBase}
                placeholder="House no, street, area, city, state, pincode"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label
                htmlFor="mobile_no"
                className="block text-[13px] font-semibold text-[#464554] uppercase tracking-wide mb-2"
              >
                Mobile Number
              </label>
              <input
                type="tel"
                name="mobile_no"
                id="mobile_no"
                value={formData.mobile_no}
                onChange={handleChange}
                className={inputBase}
                placeholder="10-digit mobile number"
              />
            </div>

            {/* Email ID */}
            <div>
              <label className="block text-[13px] font-semibold text-[#464554] uppercase tracking-wide mb-2">
                Email ID
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputBase}
                placeholder="name@example.com"
              />
            </div>

            {/* Year of Admission */}
            <div>
              <label className="block text-[13px] font-semibold text-[#464554] uppercase tracking-wide mb-2">
                Year of Admission
              </label>
              <input
                type="number"
                name="yr_admission"
                value={formData.yr_admission}
                onChange={handleChange}
                className={inputBase}
                placeholder="YYYY"
              />
            </div>

            {/* Admission Type */}
            <div>
              <label className="block text-[13px] font-semibold text-[#464554] uppercase tracking-wide mb-2">
                Joined in First Year or Direct Second Year
              </label>
              <select
                name="dse_ornot"
                value={formData.dse_ornot}
                onChange={handleChange}
                className={inputBase}
              >
                <option value="">Select</option>
                <option value="first_year">First Year</option>
                <option value="direct_second_year">Direct Second Year</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-[13px] font-semibold text-[#464554] uppercase tracking-wide mb-2">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                disabled
                className={readOnlyBase}
              />
            </div>

            {/* Moodle ID */}
            <div>
              <label
                htmlFor="moodle_id"
                className="block text-[13px] font-semibold text-[#464554] uppercase tracking-wide mb-2"
              >
                Moodle ID
              </label>
              <input
                type="text"
                name="moodle_id"
                id="moodle_id"
                value={formData.moodle_id}
                disabled
                className={readOnlyBase}
              />
            </div>

            {/* Application Type */}
            <div>
              <label className="block text-[13px] font-semibold text-[#464554] uppercase tracking-wide mb-2">
                Application Type
              </label>
              <input
                type="text"
                name="type"
                value={formData.type}
                disabled
                className={readOnlyBase}
              />
            </div>

            {/* Currently Studying In */}
            <div>
              <label className="block text-[13px] font-semibold text-[#464554] uppercase tracking-wide mb-2">
                Currently Studying In
              </label>
              <select
                name="current_status"
                value={formData.current_status}
                onChange={handleChange}
                className={inputBase}
              >
                <option value="">Select</option>
                <option value="PASSOUT">PASSOUT</option>
                <option value="BE">BE</option>
                <option value="TE">TE</option>
                <option value="SE">SE</option>
                <option value="FE">FE</option>
                <option value="DROP">DROP</option>
              </select>
            </div>

            {/* Current Year */}
            <div>
              <label className="block text-[13px] font-semibold text-[#464554] uppercase tracking-wide mb-2">
                Year
              </label>
              <input
                type="text"
                name="current_yr"
                value={formData.current_yr}
                onChange={handleChange}
                className={inputBase}
                placeholder="Year"
              />
            </div>

            {/* LOR FROM STAFF */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-[14px] font-bold text-[#191c1e]">
                  LOR FROM STAFF
                </label>
                <button
                  type="button"
                  onClick={addStaffField}
                  disabled={formData.lor_staff.length >= staffLimit}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f2f4f6] text-[#464554] font-semibold hover:bg-[#e0e3e5] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
              <div className="space-y-3">
                {formData.lor_staff.map((staff, index) => (
                  <div key={`lor-staff-${index}`} className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={staff}
                        onChange={(e) => handleStaffChange(index, e.target.value)}
                        className={inputBase}
                        placeholder={`Staff member ${index + 1}`}
                      />
                    </div>
                    {formData.lor_staff.length > 1 && index > 0 ? (
                      <button
                        type="button"
                        onClick={() => removeStaffField(index)}
                        className="inline-flex items-center justify-center h-12 w-12 rounded-lg border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f2f4f6] transition-colors"
                        aria-label={`Remove staff member ${index + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-[#6b7280]">
                Add up to {staffLimit} staff members.
              </p>
            </div>

            {/* No of LOR copies */}
            <div>
              <label className="block text-[13px] font-semibold text-[#464554] uppercase tracking-wide mb-2">
                No. of LOR copies required
              </label>
              <input
                type="number"
                name="no_of_lors"
                value={formData.no_of_lors}
                onChange={handleChange}
                className={inputBase}
                min="1"
                placeholder="Enter copies"
              />
            </div>

            <div className="md:col-span-2 mt-2 pt-2 border-t border-[#f2f4f6]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9aa0a6]">
                For Office Use
              </p>
            </div>

            {/* Amount to be generated */}
            <div>
              <label className="block text-[13px] font-semibold text-[#464554] uppercase tracking-wide mb-2">
                Amount to be generated
              </label>
              <input
                type="text"
                value={totalAmount}
                readOnly
                className={readOnlyBase}
                placeholder="Auto-calculated (Rs. 10 per copy)"
              />
            </div>

            {/* Date of Payment */}
            <div>
              <label className="block text-[13px] font-semibold text-[#464554] uppercase tracking-wide mb-2">
                Date of Payment
              </label>
              <input
                type="text"
                name="payment_date"
                value={formData.payment_date}
                readOnly
                className={readOnlyBase}
                placeholder="Auto-filled after payment"
              />
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
