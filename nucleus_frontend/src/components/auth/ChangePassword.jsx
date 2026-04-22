import React, { useEffect, useMemo, useState } from "react";
import { KeyRound, Lock, Mail, Save } from "lucide-react";
import api from "../../config/api";

const defaultForm = {
  id: "",
  user_email: "",
  current_password: "",
  password: "",
  confirm_password: "",
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
const buildInitialForm = (user) => ({
  ...defaultForm,
  id: user?.id || "",
  user_email: user?.user_email || "",
  current_password: "",
  password: "",
  confirm_password: "",
});

export default function ChangePassword() {
  const [formData, setFormData] = useState(defaultForm);
  const [originalData, setOriginalData] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const passwordRule = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const isDirty = useMemo(() => {
    const keys = ["current_password", "password", "confirm_password"];
    return keys.some(
      (key) => String(formData[key] || "") !== String(originalData[key] || ""),
    );
  }, [formData, originalData]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (!storedUser) return;

    const initial = buildInitialForm(storedUser);
    setFormData(initial);
    setOriginalData(initial);

    const fetchProfile = async () => {
      if (!storedUser.id) return;
      try {
        const res = await api.get(`/api/auth/profile/${storedUser.id}`);
        if (res.data?.success && res.data.user) {
          const merged = buildInitialForm({ ...storedUser, ...res.data.user });
          setFormData(merged);
          setOriginalData(merged);
          const nextUser = { ...storedUser, ...res.data.user };
          localStorage.setItem("user", JSON.stringify(nextUser));
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setStatus(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setStatus(null);
      if (!formData.id) return;
      if (!isDirty) return;
      if (!formData.current_password || !formData.password || !formData.confirm_password) {
        setStatus({ type: "error", message: "All password fields are required." });
        return;
      }

      if (formData.password !== formData.confirm_password) {
        setStatus({ type: "error", message: "New password and confirm password do not match." });
        return;
      }

      if (!passwordRule.test(formData.password)) {
        setStatus({
          type: "error",
          message:
            "Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 special character.",
        });
        return;
      }

      setSaving(true);
      const res = await api.put(`/api/auth/change-password/${formData.id}`, {
        current_password: formData.current_password,
        password: formData.password,
        confirm_password: formData.confirm_password,
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to change password");
      }

      setStatus({ type: "success", message: res.data?.message || "Password updated" });
      const nextForm = buildInitialForm({
        id: formData.id,
        user_email: formData.user_email,
      });
      setFormData(nextForm);
      setOriginalData(nextForm);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update password",
      });
    } finally {
      setSaving(false);
    }
  };

  const labelClass =
    "block text-[12px] font-semibold text-[#464554] uppercase tracking-wide mb-2";
  const inputClass =
    "w-full h-12 px-4 rounded-xl border border-[#e5e7eb] bg-white text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-[#f7f9fb] disabled:text-[#464554] disabled:cursor-not-allowed";
  const readOnlyClass = "bg-[#f7f9fb] text-[#464554]";

  return (
    <section className="bg-white shadow-[0_4px_20px_rgba(49,46,129,0.04)] rounded-[24px] p-6 sm:p-8 lg:p-10">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#191c1e] tracking-tight">
          Change Password
        </h2>
        <p className="mt-2 text-[#464554]">
          Update your password to keep your account secure. Use a strong password
          that you haven’t used before.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        <div>
          <label className={labelClass}>Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-indigo-400" />
            <input
              disabled
              type="text"
              value={maskEmail(formData.user_email)}
              readOnly
              className={`${inputClass} ${readOnlyClass} pl-9`}
              placeholder="Email hidden"
            />
          </div>
          <p className="mt-1 text-[11px] text-[#6b7280]">
            Email is hidden for privacy.
          </p>
        </div>

         <div>
          <label className={labelClass}>Current Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-indigo-400" />
            <input
              type="password"
              name="current_password"
              value={formData.current_password}
              onChange={handleChange}
              className={`${inputClass} pl-9`}
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>New Password</label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-indigo-400" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`${inputClass} pl-9`}
              placeholder="Enter new password"
              autoComplete="new-password"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Confirm New Password</label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-indigo-400" />
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              className={`${inputClass} pl-9`}
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-sm">
            {status?.message ? (
              <span
                className={`font-medium ${
                  status.type === "error"
                    ? "text-red-600"
                    : "text-emerald-600"
                }`}
              >
                {status.message}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl font-semibold inline-flex items-center gap-2 transition-all ${
                saving || !isDirty
                  ? "bg-[#c7c4d7] text-white cursor-not-allowed"
                  : "bg-gradient-to-br from-[#2a14b4] to-[#4338ca] text-white hover:shadow-[0_6px_20px_rgba(42,20,180,0.3)]"
              }`}
              disabled={saving || !isDirty}
            >
              <Save className="size-4" />
              {saving ? "Updating..." : "Update password"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
