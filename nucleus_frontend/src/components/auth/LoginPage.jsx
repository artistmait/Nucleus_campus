import React, { useState, useEffect } from "react";
import api from "../../config/api";
import { toast, ToastContainer } from "react-toastify";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Mail, ShieldCheck, X } from "lucide-react";
import ForgotPassword from "./ForgotPassword";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState(null);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotStatus, setForgotStatus] = useState(null);
  const [forgotLoading, setForgotLoading] = useState(false);

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
      const res = await api.post(
        "/api/auth/login",
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

  const maskEmail = (email) => {
    if (!email || !email.includes("@")) return "";
    const [local, domain] = email.split("@");
    if (!local) return `***@${domain || ""}`;
    if (local.length <= 2) return `${local[0] || ""}***@${domain || ""}`;
    const start = local.slice(0, 2);
    const end = local.slice(-1);
    return `${start}***${end}@${domain}`;
  };

  const openForgot = () => {
    setForgotEmail(formData.user_email || "");
    setForgotOtp("");
    setForgotStatus(null);
    setForgotStep("email");
  };

  const closeForgot = () => {
    setForgotStep(null);
    setForgotEmail("");
    setForgotOtp("");
    setForgotStatus(null);
    setForgotLoading(false);
  };

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    if (!forgotEmail) {
      setForgotStatus({ type: "error", message: "Please enter your email." });
      return;
    }

    try {
      setForgotLoading(true);
      setForgotStatus(null);
      const res = await api.post("/api/auth/forgot-password/request", {
        user_email: forgotEmail,
      });
      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to send OTP");
      }
      setForgotStatus({ type: "success", message: res.data?.message || "OTP sent" });
      setForgotStep("otp");
    } catch (error) {
      setForgotStatus({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to send OTP",
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (!forgotOtp) {
      setForgotStatus({ type: "error", message: "Please enter the OTP." });
      return;
    }

    try {
      setForgotLoading(true);
      setForgotStatus(null);
      const res = await api.post("/api/auth/forgot-password/verify", {
        user_email: forgotEmail,
        otp: forgotOtp,
      });
      if (!res.data?.success) {
        throw new Error(res.data?.message || "Invalid OTP");
      }
      setForgotStatus({ type: "success", message: res.data?.message || "OTP verified" });
      setForgotStep("reset");
    } catch (error) {
      setForgotStatus({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to verify OTP",
      });
    } finally {
      setForgotLoading(false);
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
            <button
              type="button"
              onClick={openForgot}
              className="text-xs text-gray-400 hover:text-indigo-600 transition-colors ml-auto block"
            >
              Forgot password?
            </button>
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
                    const res = await api.post(
                      "/api/auth/google-login",
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

      {forgotStep === "email" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-[24px] shadow-[0_10px_40px_rgba(15,23,42,0.2)] p-6 sm:p-8 relative">
            <button
              type="button"
              onClick={closeForgot}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close forgot password"
            >
              <X size={18} />
            </button>
            <h3 className="text-2xl font-bold text-gray-900">Forgot Password</h3>
            <p className="mt-2 text-gray-500">
              Enter your college email to receive a one-time OTP.
            </p>
            <form onSubmit={handleRequestOtp} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-indigo-400" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(event) => setForgotEmail(event.target.value)}
                    className="w-full h-12 px-4 pl-9 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="name@apsit.edu.in"
                  />
                </div>
              </div>
              {forgotStatus?.message ? (
                <p
                  className={`text-sm font-medium ${
                    forgotStatus.type === "error" ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {forgotStatus.message}
                </p>
              ) : null}
              <button
                type="submit"
                className={`w-full py-3 rounded-2xl font-semibold transition-all ${
                  forgotLoading
                    ? "bg-gray-300 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-900 to-indigo-700 text-white hover:shadow-indigo-500/30"
                }`}
                disabled={forgotLoading}
              >
                {forgotLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {forgotStep === "otp" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-[24px] shadow-[0_10px_40px_rgba(15,23,42,0.2)] p-6 sm:p-8 relative">
            <button
              type="button"
              onClick={closeForgot}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close OTP"
            >
              <X size={18} />
            </button>
            <h3 className="text-2xl font-bold text-gray-900">Verify OTP</h3>
            <p className="mt-2 text-gray-500">
              Enter the OTP sent to {maskEmail(forgotEmail)}.
            </p>
            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  One-Time Password
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-indigo-400" />
                  <input
                    type="text"
                    value={forgotOtp}
                    onChange={(event) => setForgotOtp(event.target.value)}
                    className="w-full h-12 px-4 pl-9 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 tracking-[0.3em] text-center"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
              </div>
              {forgotStatus?.message ? (
                <p
                  className={`text-sm font-medium ${
                    forgotStatus.type === "error" ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {forgotStatus.message}
                </p>
              ) : null}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  className="text-xs text-gray-400 hover:text-indigo-600 transition-colors"
                  disabled={forgotLoading}
                >
                  Resend OTP
                </button>
                <button
                  type="submit"
                  className={`ml-auto px-5 py-3 rounded-2xl font-semibold transition-all ${
                    forgotLoading
                      ? "bg-gray-300 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-900 to-indigo-700 text-white hover:shadow-indigo-500/30"
                  }`}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ForgotPassword
        isOpen={forgotStep === "reset"}
        email={forgotEmail}
        otp={forgotOtp}
        onClose={closeForgot}
        onSuccess={() => {
          closeForgot();
          toast.success("Password updated successfully");
        }}
      />
    </div>
  );
};

export default LoginPage;
