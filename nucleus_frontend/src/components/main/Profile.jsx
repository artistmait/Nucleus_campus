import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Edit, GraduationCap, IdCard, Mail, Save, School, UserRound } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import api from "../../config/api";
import ChangePassword from "../auth/ChangePassword";

const ROLE_LABELS = {
  1: "Student",
  2: "Incharge",
  3: "Higher Authority",
  4: "Alumni",
};

const DEPARTMENT_LABELS = {
  1: "IT",
  2: "CS",
  3: "CSAIML",
  4: "DS",
};

const YEAR_OPTIONS = ["FE", "SE", "TE", "BE"];

const defaultForm = {
  id: "",
  username: "",
  moodle_id: "",
  user_email: "",
  role_id: "",
  department_id: "",
  created_at: "",
  year: "",
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

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const buildInitialForm = (user, yearOverride) => ({
  ...defaultForm,
  id: user?.id || "",
  username: user?.username || "",
  moodle_id: user?.moodle_id || "",
  user_email: user?.user_email || "",
  role_id: user?.role_id ?? "",
  department_id: user?.department_id ?? "",
  created_at: user?.created_at || "",
  year: yearOverride || user?.year || "",
});

export default function Profile() {
  const [formData, setFormData] = useState(defaultForm);
  const [originalData, setOriginalData] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [editableFields, setEditableFields] = useState({
    username: false,
    moodle_id: false,
    department_id: false,
    year: false,
  });

  const showYear = Number(formData.role_id) === 1;

  const displayName = useMemo(() => {
    if (formData.username) return formData.username;
    if (formData.user_email) return formData.user_email.split("@")[0];
    return "User";
  }, [formData.username, formData.user_email]);

  const userInitial = useMemo(() => {
    const source = formData.username || formData.user_email || "U";
    return source.trim().charAt(0).toUpperCase() || "U";
  }, [formData.username, formData.user_email]);

  const isDirty = useMemo(() => {
    const keys = ["username", "moodle_id", "department_id", "year"];
    return keys.some(
      (key) => String(formData[key] || "") !== String(originalData[key] || ""),
    );
  }, [formData, originalData]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (!storedUser) return;

    const initial = buildInitialForm(storedUser, storedUser.year);
    setFormData(initial);
    setOriginalData(initial);

    const fetchProfile = async () => {
      if (!storedUser.id) return;
      try {
        const res = await api.get(`/api/auth/profile/${storedUser.id}`);
        if (res.data?.success && res.data.user) {
          const merged = buildInitialForm(
            { ...storedUser, ...res.data.user },
            storedUser.year,
          );
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

  const toggleEditable = (field) => {
    setEditableFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleReset = () => {
    setFormData(originalData);
    setStatus(null);
    setEditableFields({
      username: false,
      moodle_id: false,
      department_id: false,
      year: false,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.id) return;
    if (!isDirty) return;

    const payload = {};
    if (formData.username.trim() !== originalData.username) {
      payload.username = formData.username.trim();
    }
    if (formData.moodle_id.trim() !== originalData.moodle_id) {
      payload.moodle_id = formData.moodle_id.trim();
    }
    if (String(formData.department_id) !== String(originalData.department_id)) {
      payload.department_id = Number(formData.department_id);
    }

    try {
      setSaving(true);
      let updatedUser = null;

      if (Object.keys(payload).length > 0) {
        const res = await api.put(`/api/auth/profile/${formData.id}`, payload);
        if (!res.data?.success) {
          throw new Error(res.data?.message || "Failed to update profile");
        }
        updatedUser = res.data.user;
      }

      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
      const nextUser = {
        ...existingUser,
        ...(updatedUser || {}),
        year: formData.year,
      };
      localStorage.setItem("user", JSON.stringify(nextUser));

      const nextForm = buildInitialForm(nextUser, formData.year);
      setFormData(nextForm);
      setOriginalData(nextForm);
      setStatus({ type: "success", message: "Profile updated" });
      setEditableFields({
        username: false,
        moodle_id: false,
        department_id: false,
        year: false,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update profile",
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
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      <Navbar />
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#191c1e] tracking-tight">Your Profile</h1>
          <p className="mt-2 text-[#464554]">
            Keep your details updated for a smoother campus experience.
          </p>
        </div>

        <div className="bg-white shadow-[0_4px_20px_rgba(49,46,129,0.04)] rounded-[24px] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold">
                {userInitial}
              </div>
              <div>
                <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">Profile</p>
                <p className="text-lg font-bold text-[#191c1e]">{displayName}</p>
                <p className="text-[12px] text-[#464554]">
                  {ROLE_LABELS[Number(formData.role_id)] || "User"}
                  {formData.department_id
                    ? ` - ${DEPARTMENT_LABELS[Number(formData.department_id)] || ""}`
                    : ""}
                </p>
              </div>
            </div>
            <div className="text-sm text-[#6b7280]">
              {formData.created_at ? `Joined ${formatDate(formData.created_at)}` : ""}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <div>
              <label className={labelClass}>Full Name</label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-indigo-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!editableFields.username}
                  className={`${inputClass} pl-9 pr-10`}
                  placeholder="Enter your name"
                />
                <button
                  type="button"
                  onClick={() => toggleEditable("username")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-600 transition-colors"
                  aria-label="Edit full name"
                >
                  <Edit className={`size-4 ${editableFields.username ? "text-indigo-600" : "text-indigo-400"}`} />
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>Moodle ID</label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-indigo-400" />
                <input
                  type="text"
                  name="moodle_id"
                  value={formData.moodle_id}
                  onChange={handleChange}
                  disabled={!editableFields.moodle_id}
                  className={`${inputClass} pl-9 pr-10`}
                  placeholder="Enter Moodle ID"
                />
                <button
                  type="button"
                  onClick={() => toggleEditable("moodle_id")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-600 transition-colors"
                  aria-label="Edit Moodle ID"
                >
                  <Edit className={`size-4 ${editableFields.moodle_id ? "text-indigo-600" : "text-indigo-400"}`} />
                </button>
              </div>
            </div>

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
              <p className="mt-1 text-[11px] text-[#6b7280]">Email is hidden for privacy.</p>
            </div>

            <div>
              <label className={labelClass}>Role</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-indigo-400" />
                <input
                  disabled
                  type="text"
                  value={ROLE_LABELS[Number(formData.role_id)] || "User"}
                  readOnly
                  className={`${inputClass} ${readOnlyClass} pl-9`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Department</label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-indigo-400" />
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  disabled={!editableFields.department_id}
                  className={`${inputClass} pl-9 pr-10 appearance-none`}
                >
                  <option value="" disabled>
                    Select department
                  </option>
                  {Object.entries(DEPARTMENT_LABELS).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => toggleEditable("department_id")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-600 transition-colors"
                  aria-label="Edit department"
                >
                  <Edit className={`size-4 ${editableFields.department_id ? "text-indigo-600" : "text-indigo-400"}`} />
                </button>
              </div>
            </div>

            {showYear ? (
              <div>
                <label className={labelClass}>Year</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-indigo-400" />
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    disabled={!editableFields.year}
                    className={`${inputClass} pl-9 pr-10 appearance-none`}
                  >
                    <option value="" disabled>
                      Select year
                    </option>
                    {YEAR_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => toggleEditable("year")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-600 transition-colors"
                    aria-label="Edit year"
                  >
                    <Edit className={`size-4 ${editableFields.year ? "text-indigo-600" : "text-indigo-400"}`} />
                  </button>
                </div>
              </div>
            ) : null}

            <div>
              <label className={labelClass}>User ID</label>
              <input
                disabled
                type="text"
                value={formData.id}
                readOnly
                className={`${inputClass} ${readOnlyClass}`}
              />
            </div>

            <div>
              <label className={labelClass}>Joined</label>
              <input 
                disabled
                type="text"
                value={formatDate(formData.created_at)}
                readOnly
                className={`${inputClass} ${readOnlyClass}`}
              />
            </div>
            <div className="md:col-span-2 mt-4">
              <label className="block text-[14px] font-bold text-[#191c1e] mb-4">
                Upload Profile Picture (Coming Soon)
              </label>
              <label className="flex items-center justify-center w-full h-14 px-4 border-2 border-dashed border-[#c7c4d7] rounded-[16px] cursor-pointer bg-[#f7f9fb] hover:bg-[#e3dfff]/30 transition-colors group">
                <span className="text-[#464554] font-medium group-hover:text-[#2a14b4]">
                  {formData.documents ? formData.documents.name : "Click to select or drop file here"}
                </span>
                <input
                  type="file"
                  name="documents"
                  onChange={handleChange}
                  className="hidden"
                  accept="image/jpeg,image/png"
                  required
                />
              </label>
            </div>

            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-sm">
                {status?.message ? (
                  <span
                    className={`font-medium ${
                      status.type === "error" ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {status.message}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl text-[#464554] font-semibold hover:bg-[#f2f4f6] transition-colors"
                  disabled={!isDirty}
                >
                  Reset
                </button>
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
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-8">
          <ChangePassword />
        </div>
      </main>
      <Footer />
    </div>
  );
}
