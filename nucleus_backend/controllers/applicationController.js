import pool from "../config/dbConfig.js";
import cloudinary from "../config/cloudinaryConfig.js";
import fs from "fs";

export const submitApplication = async (req, res) => {
  const client = await pool.connect();
  try {
    const { student_id, type,department_id } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Document is required" });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "nucleus/student-documents",
      resource_type: "auto",
    });

    fs.unlinkSync(req.file.path);

    await client.query("BEGIN");

    // Step 1️⃣ → Insert into documents table
    const documentInsert = await client.query(
      `INSERT INTO documents (student_id, document_type, cloudinary_url)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [student_id, type, uploadResult.secure_url]
    );

    const document_id = documentInsert.rows[0].id;

    // Step 2️⃣ → Assign random incharge
    const incharge = await client.query(
      "SELECT id FROM users WHERE role_id = 2 ORDER BY RANDOM() LIMIT 1"
    );

    if (incharge.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.json({ success: false, message: "No incharge available" });
    }

    const incharge_id = incharge.rows[0].id;

    //Insert into applications table
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7); // 7-day deadline

    const newApp = await client.query(
      `INSERT INTO applications (student_id, incharge_id, document_id, type, status, priority, deadline,department_id)
       VALUES ($1, $2, $3, $4, 'pending', 'normal', $5,$6)
       RETURNING *`,
      [student_id, incharge_id, document_id, type, deadline,department_id]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Application submitted successfully",
      application: newApp.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Submit Application Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    client.release();
  }
};

//Get all applications submitted by a specific student
export const getMyApplications = async (req, res) => {
  const { student_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
         a.id AS application_id,
         a.type,
         a.status,
         a.priority,
         a.deadline,
         a.created_at,
         a.incharge_id,
         d.cloudinary_url,
         d.document_type
       FROM applications a
       LEFT JOIN users u ON a.incharge_id = u.id
       LEFT JOIN documents d ON a.document_id = d.id
       WHERE a.student_id = $1
       ORDER BY a.created_at DESC`,
      [student_id]
    );

    res.status(200).json({
      success: true,
      applications: result.rows,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
};