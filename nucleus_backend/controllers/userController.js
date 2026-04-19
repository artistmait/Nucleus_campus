import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
// import validator from 'validator';
import prisma from "../config/prismaClient.js";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
        moodle_id: user.moodle_id,
        user_email: user.user_email,
        role_id: user.role_id,
        department_id: user.department_id,
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
        moodle_id: user.moodle_id,
        user_email: user.user_email,
        role_id: user.role_id,
        role_name: user.role?.role_name,
        department_id: user.department_id,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    return res.json({ success: false, message: "Google verification failed" });
  }
};

// export { loginUser, signupUser, createToken };
