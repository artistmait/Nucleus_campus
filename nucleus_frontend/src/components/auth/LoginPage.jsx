import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleLoginSuccess = (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role_id", String(user.role_id));

    const role = Number(user.role_id);
    if (role === 1) navigate("/student/dashboard");
    else if (role === 2) navigate("/incharge/landingpage");
    else if (role === 3) navigate("/higher-authority/landingpage");
    else if (role === 4) navigate("/student/dashboard");
    else navigate("/");
  };

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
        formData,
      );

      if (res.data.success) {
        toast.success("Login successful!");
        setTimeout(() => {
          handleLoginSuccess(res.data.user, res.data.token);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/50 to-indigo-100/80 p-4 relative overflow-hidden">
      {/* Background Orbs for Glassmorphism Effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-indigo-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-purple-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-40"></div>
      
      <ToastContainer position="top-center" autoClose={2500} hideProgressBar />
      
      <div className="z-10 w-full max-w-xl bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/60 px-8 py-12 sm:px-14 sm:py-16 transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)]">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-900 to-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-6 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <span className="text-3xl font-bold text-white">L</span>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
          <p className="text-gray-500 mt-2 font-medium">Log in to your Nucleus account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 ml-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-5 py-4 bg-white/50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-300 shadow-sm"
            />
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-lg font-bold rounded-2xl shadow-lg transition-all duration-300 transform ${
                loading
                  ? "bg-gray-400 cursor-not-allowed scale-100"
                  : "bg-gradient-to-r from-indigo-900 to-indigo-700 text-white hover:shadow-indigo-500/30 hover:-translate-y-1 active:translate-y-0"
              }`}
            >
              {loading ? "Logging In..." : "Log In"}
            </button>
          </div>

          <div className="relative flex items-center my-8">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">OR CONTINUE WITH</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Google Login Section */}
          <div className="flex justify-center w-full px-2">
            <div className="w-full overflow-hidden rounded-2xl flex justify-center py-1">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    const res = await axios.post(
                      "http://localhost:5000/api/auth/google-login",
                      {
                        credential: credentialResponse.credential, // send the raw token
                      },
                    );

                    if (res.data.success) {
                      toast.success("Google Login successful!");
                      setTimeout(() => {
                        handleLoginSuccess(res.data.user, res.data.token);
                      }, 1000);
                    } else {
                      toast.error(res.data.message || "Google login failed");
                    }
                  } catch (error) {
                    toast.error(
                      error.response?.data?.message || "Google login failed",
                    );
                  }
                }}
                onError={() => toast.error("Google Login Failed")}
                theme="outline"
                size="large"
                shape="pill"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center text-sm text-gray-600 font-medium">
          Do not have an account?{" "}
          <Link
            to="/"
            className="text-indigo-700 font-bold hover:text-indigo-900 hover:underline transition-colors duration-200"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
