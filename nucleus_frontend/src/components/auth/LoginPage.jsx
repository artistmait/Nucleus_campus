import React from "react";
import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const location = useLocation();

  useEffect(() => {
    // check if redirected with state (React Router)
    if (location.state) {
      setFormData({
        user_email: location.state.user_email || "",
        password: location.state.password || "",
      });
    }

    // check if saved in localStorage
    const savedCreds = localStorage.getItem("signupCredentials");
    if (savedCreds) {
      const { user_email, password } = JSON.parse(savedCreds);
      setFormData({ user_email, password });
      localStorage.removeItem("signupCredentials");
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.user_email || !formData.password) {
      toast.error("Please fill all fields");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      if (res.data.success) {
        toast.success("Login successful!");
        // Store token if needed
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        const role = res.data.user.role_id;
        // Redirect after login
        setTimeout(() => {
          if (role === 1) navigate("/student/dashboard");
          else if (role === 2) navigate("/incharge/dashboard");
          else if (role === 3) navigate("/higher-authority/dashboard");
          else if (role === 4) navigate("/student/dashboard");
          else navigate("/");
        }, 1000);
      } else {
        toast.error(res.data.message || "Invalid credentials");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-50">
      <ToastContainer position="top-center" autoClose={2500} hideProgressBar />
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 px-12 py-14">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-full bg-indigo-900 flex items-center justify-center shadow-md mb-4">
            <span className="text-2xl font-bold text-white">L</span>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900">Login</h2>
          <p className="text-gray-500 mt-1">Login to your account below</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Moodle ID */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moodle Id
            </label>
            <input
              type="text"
              name="moodle_id"
              value={formData.moodle_id}
              onChange={handleChange}
              placeholder="Enter your Moodle ID"
              className="w-full px-5 py-3 border border-gray-300 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div> */}

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="text"
              name="user_email"
              value={formData.user_email}
              onChange={handleChange}
              placeholder="Enter your Email ID"
              className="w-full px-5 py-3 border border-gray-300 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-5 py-3 border border-gray-300 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            {/* <div className="mt-10 text-center text-sm text-gray-600">
              Forgot Password?{" "}
              <Link
                to="/auth/login"
                className="text-indigo-900 font-semibold hover:underline"
              >
                Reset Password
              </Link>
            </div> */}
          </div>

          <div className="flex justify-center">
            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-75 h-15 py-3 font-semibold rounded-full shadow-md transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-900 text-white hover:bg-indigo-800"
              }`}
            >
              {loading ? "Logging In..." : "Login"}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center text-sm text-gray-600">
          Do not have an account?{" "}
          <Link
            to="/"
            className="text-indigo-900 font-semibold hover:underline"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
