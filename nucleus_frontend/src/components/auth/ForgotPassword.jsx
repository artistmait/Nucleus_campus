import React, { useMemo, useState } from "react";
import { KeyRound, Save, X, Eye, EyeOff } from "lucide-react";
import api from "../../config/api";

const passwordRule = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const maskEmail = (email) => {
	if (!email || !email.includes("@")) return "";
	const [local, domain] = email.split("@");
	if (!local) return `***@${domain || ""}`;
	if (local.length <= 2) return `${local[0] || ""}***@${domain || ""}`;
	const start = local.slice(0, 2);
	const end = local.slice(-1);
	return `${start}***${end}@${domain}`;
};

export default function ForgotPassword({ isOpen, email, otp, onClose, onSuccess }) {
	const [formData, setFormData] = useState({ password: "", confirm_password: "" });
	const [saving, setSaving] = useState(false);
	const [status, setStatus] = useState(null);
	const [showPassword, setShowPassword] = useState(false);        
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const isDirty = useMemo(
		() => formData.password || formData.confirm_password,
		[formData.password, formData.confirm_password],
	);

	if (!isOpen) return null;

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setStatus(null);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setStatus(null);

		if (!formData.password || !formData.confirm_password) {
			setStatus({ type: "error", message: "Please fill all fields." });
			return;
		}
		if (formData.password !== formData.confirm_password) {
			setStatus({ type: "error", message: "Passwords do not match." });
			return;
		}
		if (!passwordRule.test(formData.password)) {
			setStatus({
				type: "error",
				message: "Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 special character.",
			});
			return;
		}

		try {
			setSaving(true);
			const res = await api.post("/api/auth/forgot-password/reset", {
				user_email: email,
				otp,
				password: formData.password,
				confirm_password: formData.confirm_password,
			});

			if (!res.data?.success) throw new Error(res.data?.message || "Failed to reset password");

			setStatus({ type: "success", message: res.data?.message || "Password updated" });
			setFormData({ password: "", confirm_password: "" });
			if (onSuccess) onSuccess();
		} catch (error) {
			setStatus({
				type: "error",
				message: error?.response?.data?.message || error?.message || "Failed to reset password",
			});
		} finally {
			setSaving(false);
		}
	};

	const labelClass = "block text-[12px] font-semibold text-[#464554] uppercase tracking-wide mb-2";
	const inputClass = "w-full h-12 px-4 rounded-xl border border-[#e5e7eb] bg-white text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-indigo-200";

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
			<div className="w-full max-w-lg bg-white rounded-[24px] shadow-[0_10px_40px_rgba(15,23,42,0.2)] p-6 sm:p-8 relative">
				<button type="button" onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close reset password">
					<X size={18} />
				</button>

				<div className="mb-6">
					<h3 className="text-2xl font-bold text-[#191c1e]">Reset Password</h3>
					<p className="mt-2 text-[#464554]">
						Enter a new password for the account linked to {maskEmail(email)}.
					</p>
				</div>

				<form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
					<div>
						<label className={labelClass}>New Password</label>
						<div className="relative">
							<KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-indigo-400" />
							<input
								type={showPassword ? "text" : "password"}   // 👈
								name="password"
								value={formData.password}
								onChange={handleChange}
								className={`${inputClass} pl-9 pr-10`}
								placeholder="Enter new password"
								autoComplete="new-password"
							/>
							<button
								type="button"
								onClick={() => setShowPassword((prev) => !prev)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
							>
								{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
							</button>
						</div>
					</div>

					<div>
						<label className={labelClass}>Confirm Password</label>
						<div className="relative">
							<KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-indigo-400" />
							<input
								type={showConfirmPassword ? "text" : "password"}   // 👈
								name="confirm_password"
								value={formData.confirm_password}
								onChange={handleChange}
								className={`${inputClass} pl-9 pr-10`}
								placeholder="Confirm new password"
								autoComplete="new-password"
							/>
							<button
								type="button"
								onClick={() => setShowConfirmPassword((prev) => !prev)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
							>
								{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
							</button>
						</div>
					</div>

					<div className="flex flex-wrap items-center justify-between gap-3 pt-2">
						<div className="text-sm">
							{status?.message ? (
								<span className={`font-medium ${status.type === "error" ? "text-red-600" : "text-emerald-600"}`}>
									{status.message}
								</span>
							) : null}
						</div>
						<div className="flex items-center gap-3 ml-auto">
							<button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-[#464554] font-semibold hover:bg-[#f2f4f6] transition-colors">
								Cancel
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
								{saving ? "Updating..." : "Update password"}
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}