import React from "react";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-50">
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
        <form className="space-y-7">
          {/* Moodle ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moodle Id
            </label>
            <input
              type="text"
              placeholder="Enter your Moodle ID"
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
              placeholder="Enter your password"
              className="w-full px-5 py-3 border border-gray-300 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="flex justify-center">
            {/* Submit */}
            <button
              type="submit"
              className="w-75 h-15 py-3 bg-indigo-900 text-white font-semibold rounded-full shadow-md hover:bg-indigo-800 transition"
            >
              Login
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/auth/login"
            className="text-indigo-900 font-semibold hover:underline"
          >
            Login here
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
