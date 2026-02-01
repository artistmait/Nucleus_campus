import pool from "../config/dbConfig.js";
import cloudinary from "../config/cloudinaryConfig.js";
import fs from "fs";
import { transporter } from "../config/email.js";

export const submitApplication = async (req, res) => {
  const client = await pool.connect();
  try {
    const { student_id, type, department_id } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Document is required" });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "nucleus/student-documents",
      resource_type: "auto",
      access_mode: "public",
    });

    fs.unlinkSync(req.file.path);

    await client.query("BEGIN");

    // Insert into documents table
    const documentInsert = await client.query(
      `INSERT INTO documents (student_id, document_type, cloudinary_url)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [student_id, type, uploadResult.secure_url],
    );

    const document_id = documentInsert.rows[0].id;

    //Assign random incharge
    const incharge = await client.query(
      "SELECT id FROM users WHERE role_id = 2 ORDER BY RANDOM() LIMIT 1",
    );

    if (incharge.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.json({ success: false, message: "No incharge available" });
    }

    const incharge_id = incharge.rows[0].id;

    //Insert into applications table
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7); // 7-day deadline

    const seqResult = await client.query(
      "SELECT nextval('application_seq') AS seq",
    );
    const seq = seqResult.rows[0].seq;
    const newapp_id = `APN-${String(seq).padStart(4, "0")}`;

    const newApp = await client.query(
      `INSERT INTO applications (student_id, incharge_id, document_id, type, status, priority, deadline,department_id,application_id)
       VALUES ($1, $2, $3, $4, 'pending', 'normal', $5,$6,$7)
       RETURNING *`,
      [
        student_id,
        incharge_id,
        document_id,
        type,
        deadline,
        department_id,
        newapp_id,
      ],
    );

    await client.query("COMMIT");

    //get email from backend
    const studentResult = await pool.query(
      `SELECT user_email, moodle_id 
   FROM users 
   WHERE id = $1`,
      [student_id],
    );

    if (studentResult.rows.length === 0) {
      throw new Error("Student not found");
    }

    //send email notif on submit
    const { user_email, moodle_id } = studentResult.rows[0];
    const application = newApp.rows[0];

    await transporter.sendMail({
      from: `"Application Portal" <${process.env.EMAIL_USER}>`,
      to: user_email,
      subject: "Application Submitted Successfully",
      html: `
    <h2>Application Submitted Successfully</h2>
    <p><b>Moodle ID:</b> ${moodle_id}</p>
    <p><b>Application ID:</b> ${application.application_id}</p>
    <p><b>Application Type:</b> ${application.type}</p>
    <p><b>Status:</b> ${application.status}</p>
    <p><b>Deadline:</b> ${
      application.deadline
        ? new Date(application.deadline).toLocaleDateString()
        : "Not specified"
    }</p>
    <p><b>Submitted On:</b> ${new Date(application.created_at).toLocaleString()}</p>
  `,
    });

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
         a.application_id AS application_id,
         a.type,
         a.status,
         a.priority,
         a.deadline,
         a.created_at,
         a.incharge_id,
         a.app_notes,
         d.cloudinary_url,
         d.document_type
       FROM applications a
       LEFT JOIN users u ON a.incharge_id = u.id
       LEFT JOIN documents d ON a.document_id = d.id
       WHERE a.student_id = $1
       ORDER BY a.created_at DESC`,
      [student_id],
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

//update documents
export const updateMyApplicationDocument = async (req, res) => {
  const client = await pool.connect();

  try {
    const { application_id } = req.params;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "File is required" });
    }

    // Upload new file to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "nucleus/student-documents",
      resource_type: "auto",
      access_mode: "public",
    });

    fs.unlinkSync(req.file.path);

    await client.query("BEGIN");

    // Create new document entry
    const documentInsert = await client.query(
      `INSERT INTO documents (student_id, document_type, cloudinary_url)
   SELECT a.student_id, d.document_type, $1
   FROM applications a
   JOIN documents d ON a.document_id = d.id
   WHERE a.application_id = $2
   RETURNING *`,
      [uploadResult.secure_url, application_id],
    );

    const newDocumentId = documentInsert.rows[0].id;

    // Update the application with the new document id
    await client.query(
      `UPDATE applications SET document_id = $1 WHERE application_id = $2`,
      [newDocumentId, application_id],
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Document updated successfully",
      newUrl: uploadResult.secure_url,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating document:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update document" });
  } finally {
    client.release();
  }
};
