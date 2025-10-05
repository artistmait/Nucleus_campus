import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
// import validator from 'validator';
import pool from "../config/dbConfig.js";

export const createToken = (id) => {
  const payload = {
    user: id,
  };
  return jwt.sign({ id }, process.env.JWT_SECRET);
};
console.log("secret ->", process.env.JWT_SECRET);
export const loginUser = async (req, res) => {
  try {
    const { moodle_id, password } = req.body;
    console.log("moodle_id->", moodle_id);
    // Find user by moodle_id
    const result = await pool.query(
      "SELECT * FROM users WHERE moodle_id = $1",
      [moodle_id]
    );
    console.log("result ->", result);
    if (result.rows.length === 0) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const user = result.rows[0];

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
      user :{
        id : user.id,
        moodle_id : user.moodle_id,
        role_id: user.role_id,
        department_id:user.department_id
      }
    });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: err.message });
  }
};

export const signupUser = async (req, res) => {
  try {
    const { moodle_id, password, role_id, department_id } = req.body;
    // console.log(moodle_id)
    const exists = await pool.query(
      "SELECT * FROM users WHERE moodle_id = $1",
      [moodle_id]
    );
    // console.log(exists)
    if (exists.rows.length > 0) {
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
    const newUser = await pool.query(
      "INSERT INTO users (moodle_id,password,role_id,department_id,created_at) VALUES ($1,$2,$3,$4,$5) RETURNING * ",
      [moodle_id, hashedPassword, role_id, department_id, now]
    );
    // res.json(newUser.rows[0])
    const token = createToken(newUser.rows[0].id);
    return res.json({
      success: true,
      message: "Registration Successful",
      token,
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.json({ success: false, message: err.message });
  }
};

// export { loginUser, signupUser, createToken };
