import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import api from "../../config/api";
import { Link, useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    moodle_id: "",
    user_email: "",
    role_id: "",
    department_id: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        username: formData.username,
        moodle_id: formData.moodle_id,
        user_email: formData.user_email,
        role_id: Number(formData.role_id),
        department_id: Number(formData.department_id),
        password: formData.password,
      };
      const res = await api.post(
        "/api/auth/signup",
        payload,
      );
      if (res.data.success) {
        toast.success(res.data?.message || "Registration Successful");
        localStorage.setItem(
          "signupCredentials",
          JSON.stringify({
            user_email: formData.user_email,
            moodle_id: formData.moodle_id,
            password: formData.password,
          })
        );
        setTimeout(() => {
          navigate("/auth/login");
        }, 1000);
      } else {
        toast.error(res.data.message || "Registration failed");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/50 to-indigo-100/80 p-4 sm:p-6 relative overflow-hidden">
      {/* Background Orbs for Glassmorphism Effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-indigo-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-purple-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-40"></div>

      <ToastContainer position="top-center" autoClose={2500} hideProgressBar />
      
      <div className="z-10 w-full max-w-2xl bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/60 px-8 py-10 sm:px-14 sm:py-12 transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] my-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-900 to-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-6 transform rotate-6 hover:rotate-0 transition-transform duration-300">
            <span className="text-3xl font-bold text-white">R</span>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight text-center">Create Account</h2>
          <p className="text-gray-500 mt-2 font-medium text-center">Join the Nucleus campus platform today</p>
        </div>

        {/* Form */}
        <form onSubmit={submitHandler} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NAME */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                Full Name
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your Name"
                className="w-full px-5 py-4 bg-white/50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-300 shadow-sm"
              />
            </div>
            {/* Moodle ID */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                Moodle ID
              </label>
              <input
                type="text"
                name="moodle_id"
                value={formData.moodle_id}
                onChange={handleChange}
                placeholder="Enter your Moodle ID"
                className="w-full px-5 py-4 bg-white/50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-300 shadow-sm"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 ml-1">
              Email Address
            </label>
            <input
              type="email"
              name="user_email"
              value={formData.user_email}
              onChange={handleChange}
              placeholder="Enter your Email ID"
              className="w-full px-5 py-4 bg-white/50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-300 shadow-sm"
            />
          </div>

          {/* Role + Department side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                Role
              </label>
              <select
                name="role_id"
                value={formData.role_id}
                onChange={handleChange}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-white/50 text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-300 shadow-sm appearance-none cursor-pointer"
              >
                <option value="" disabled>Select your role</option>
                <option value="1">Student</option>
                <option value="2">In-Charge</option>
                <option value="3">Higher Authority</option>
                <option value="4">Alumni</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                Department
              </label>
              <select
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-white/50 text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-300 shadow-sm appearance-none cursor-pointer"
              >
                <option value="" disabled>Select your department</option>
                <option value="1">IT</option>
                <option value="2">CS</option>
                <option value="3">CSAIML</option>
                <option value="4">DS</option>
              </select>
            </div>
          </div>

          {/* Password & Confirm Side by Side on MD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full px-5 py-4 pr-12 bg-white/50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full px-5 py-4 pr-12 bg-white/50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-lg font-bold rounded-2xl shadow-lg transition-all duration-300 transform ${
                loading
                  ? "bg-gray-400 cursor-not-allowed scale-100"
                  : "bg-gradient-to-r from-indigo-900 to-indigo-700 text-white hover:shadow-indigo-500/30 hover:-translate-y-1 active:translate-y-0"
              }`}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600 font-medium pt-2 border-t border-gray-100">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="text-indigo-700 font-bold hover:text-indigo-900 hover:underline transition-colors duration-200"
          >
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
