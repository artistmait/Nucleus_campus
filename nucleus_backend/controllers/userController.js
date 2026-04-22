import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
// import validator from 'validator';
import prisma from "../config/prismaClient.js";
// import { transporter } from "../config/email.js";
import { resend } from "../config/email.js";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const OTP_EXPIRY_MINUTES = 10;
const EMAIL_DOMAIN_REGEX = /^[a-zA-Z0-9._%+-]+@apsit\.edu\.in$/;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

export const createToken = (id) => {
  const payload = {
    user: id,
  };
  return jwt.sign({ id }, process.env.JWT_SECRET);
};
console.log("secret ->", process.env.JWT_SECRET);
export const loginUser = async (req, res) => {
  try {
    const { user_email, password } = req.body;
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { user_email },
    });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    // Create token
    const token = createToken(user.id);
    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        moodle_id: user.moodle_id,
        user_email: user.user_email,
        role_id: user.role_id,
        department_id: user.department_id,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: err.message });
  }
};

export const signupUser = async (req, res) => {
  try {
    const {
      moodle_id,
      username,
      user_email,
      password,
      role_id,
      department_id,
    } = req.body;

    const exists = await prisma.user.findUnique({
      where: { user_email },
    });

    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    //validate password
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    //hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const now = new Date();
    const newUser = await prisma.user.create({
      data: {
        moodle_id,
        user_email,
        username,
        password: hashedPassword,
        role_id,
        department_id,
        created_at: now,
      },
    });

    const token = createToken(newUser.id);
    return res.json({
      success: true,
      message: "Registration Successful",
      token,
      user: newUser,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.json({ success: false, message: err.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    console.log("1. Credential received:", !!credential);

    if (!credential) {
      return res.json({
        success: false,
        message: "Google credential is required.",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.email_verified) {
      return res.json({
        success: false,
        message: "Google account email is not verified.",
      });
    }

    const email = payload.email.toLowerCase().trim();
    console.log("2. Email from Google:", email);

    // Domain check
    const allowedDomain = /^[a-zA-Z0-9._%+-]+@apsit\.edu\.in$/;
    if (!allowedDomain.test(email)) {
      console.log("3. Domain check FAILED");
      return res.json({ success: false, message: "Only @apsit.edu.in emails allowed." });
    }
    console.log("3. Domain check PASSED");

    const user = await prisma.user.findFirst({
      where: {
        user_email: {
          equals: email,
          mode: 'insensitive',
        },
      },
      include: {
        role: true,
      },
    });
    console.log("4. DB user found:", !!user);

    if (!user) {
      return res.json({ success: false, message: "No account found. Please register first." });
    }

    const token = createToken(user.id);
    return res.json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        moodle_id: user.moodle_id,
        user_email: user.user_email,
        role_id: user.role_id,
        role_name: user.role?.role_name,
        department_id: user.department_id,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    return res.json({ success: false, message: "Google verification failed" });
  }
};

const buildUserPayload = (user) => ({
  id: user.id,
  username: user.username,
  moodle_id: user.moodle_id,
  user_email: user.user_email,
  role_id: user.role_id,
  role_name: user.role?.role_name,
  department_id: user.department_id,
  department_name: user.department?.dept_name,
  created_at: user.created_at,
});

export const getUserProfile = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!userId) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, department: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user: buildUserPayload(user) });
  } catch (err) {
    console.error("Profile fetch error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!userId) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const { username, moodle_id, user_email, department_id } = req.body;
    const updateData = {};

    if (typeof username === "string" && username.trim()) {
      updateData.username = username.trim();
    }

    if (typeof moodle_id === "string" && moodle_id.trim()) {
      const moodleValue = moodle_id.trim();
      if (!/^[0-9]+$/.test(moodleValue)) {
        return res.status(400).json({
          success: false,
          message: "Moodle ID must contain only numbers.",
        });
      }
      updateData.moodle_id = moodleValue;
    }

    if (typeof user_email === "string" && user_email.trim()) {
      const emailValue = user_email.trim().toLowerCase();
      const allowedDomain = /^[a-zA-Z0-9._%+-]+@apsit\.edu\.in$/;
      if (!allowedDomain.test(emailValue)) {
        return res.status(400).json({
          success: false,
          message: "Only college email ID is permissible",
        });
      }
      updateData.user_email = emailValue;
    }

    if (department_id !== undefined && department_id !== null && department_id !== "") {
      const departmentValue = Number(department_id);
      if (Number.isNaN(departmentValue)) {
        return res.status(400).json({
          success: false,
          message: "Department must be a valid number.",
        });
      }
      updateData.department_id = departmentValue;
    }

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No fields to update" });
    }

    if (updateData.user_email) {
      const existingEmail = await prisma.user.findFirst({
        where: { user_email: updateData.user_email, NOT: { id: userId } },
      });
      if (existingEmail) {
        return res
          .status(409)
          .json({ success: false, message: "Email already in use" });
      }
    }

    if (updateData.moodle_id) {
      const existingMoodle = await prisma.user.findFirst({
        where: { moodle_id: updateData.moodle_id, NOT: { id: userId } },
      });
      if (existingMoodle) {
        return res
          .status(409)
          .json({ success: false, message: "Moodle ID already in use" });
      }
    }

    if (updateData.department_id) {
      const department = await prisma.department.findUnique({
        where: { id: updateData.department_id },
      });
      if (!department) {
        return res
          .status(404)
          .json({ success: false, message: "Department not found" });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { role: true, department: true },
    });

    return res.json({
      success: true,
      message: "Profile updated",
      user: buildUserPayload(updatedUser),
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ success: false, message: "Profile update failed" });
  }
};

export const requestForgotPasswordOtp = async (req, res) => {
  try {
    const { user_email } = req.body;
    if (!user_email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const email = normalizeEmail(user_email);
    if (!EMAIL_DOMAIN_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Only college email ID is permissible",
      });
    }

    const user = await prisma.user.findUnique({ where: { user_email: email } });
    if (!user) {
      return res.json({
        success: true,
        message: "If the account exists, an OTP has been sent.",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        reset_otp_hash: hashedOtp,
        reset_otp_expires_at: expiresAt,
      },
    });

    await resend.emails.send({
       from: process.env.EMAIL_USER,
       to: email,
       subject: "Your password reset OTP",
      html: `
        <div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
          <p>We received a request to reset your password.</p>
          <p>Your OTP is:</p>
          <div style="font-size:24px;font-weight:700;letter-spacing:4px;margin:16px 0">${otp}</div>
          <p>This OTP expires in ${OTP_EXPIRY_MINUTES} minutes. If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });

    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    console.error("Forgot password OTP error:", err);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

export const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { user_email, otp } = req.body;
    if (!user_email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const email = normalizeEmail(user_email);
    const user = await prisma.user.findUnique({ where: { user_email: email } });
    if (!user || !user.reset_otp_hash || !user.reset_otp_expires_at) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    if (new Date() > user.reset_otp_expires_at) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    const isMatch = await bcrypt.compare(String(otp), user.reset_otp_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    return res.json({ success: true, message: "OTP verified" });
  } catch (err) {
    console.error("OTP verify error:", err);
    return res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
};

export const resetForgotPassword = async (req, res) => {
  try {
    const { user_email, otp, password, confirm_password } = req.body;

    if (!user_email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    if (typeof password !== "string" || typeof confirm_password !== "string") {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password are required.",
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match.",
      });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include one uppercase letter, one number, and one special character.",
      });
    }

    const email = normalizeEmail(user_email);
    const user = await prisma.user.findUnique({ where: { user_email: email } });
    if (!user || !user.reset_otp_hash || !user.reset_otp_expires_at) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    if (new Date() > user.reset_otp_expires_at) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    const isOtpMatch = await bcrypt.compare(String(otp), user.reset_otp_hash);
    if (!isOtpMatch) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current password.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        reset_otp_hash: null,
        reset_otp_expires_at: null,
      },
    });

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ success: false, message: "Failed to reset password" });
  }
};

export const ChangePassword = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { current_password, password, confirm_password } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    if (typeof current_password !== "string" || !current_password) {
      return res.status(400).json({
        success: false,
        message: "Current password is required.",
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isCurrentMatch = await bcrypt.compare(current_password, user.password);
    if (!isCurrentMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    if (typeof password !== "string" || typeof confirm_password !== "string") {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password are required.",
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match.",
      });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include one uppercase letter, one number, and one special character.",
      });
    }

    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current password.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ success: false, message: "Failed to change password" });
  }
};


// export { loginUser, signupUser, createToken };
