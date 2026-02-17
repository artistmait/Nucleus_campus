import pool from "../config/dbConfig.js";
import { transporter } from "../config/email.js";

// Get applications assigned to a specific incharge
export const getInchargeApplications = async (req, res) => {
  const { incharge_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
         a.application_id,
         a.type,
         a.status,
         a.stage,
         a.priority,
         a.deadline,
         a.created_at,
         a.student_id,
         a.app_notes,
         u.username AS student_name,
         u.moodle_id,
         d.document_type,
         d.cloudinary_url,
         dept.dept_name AS branch
       FROM applications a
       LEFT JOIN users u ON a.student_id = u.id
       LEFT JOIN documents d ON a.document_id = d.id
       LEFT JOIN department dept ON u.department_id = dept.id
       WHERE a.incharge_id = $1
       ORDER BY a.created_at DESC`,
      [incharge_id],
    );

    res.json({ success: true, applications: result.rows });
  } catch (error) {
    console.error("Error fetching incharge applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch incharge applications",
    });
  }
};

// Update application status or priority
export const updateApplicationStatus = async (req, res) => {
  const { application_id } = req.params;
  const { status, priority, markCompleted } = req.body;

  try {
    let stage = null;
    const updateFields = [];
    const values = [];
    let index = 1;

    if (status) {
      updateFields.push(`status = $${index++}`);
      values.push(status);

      if (status === "approved") {
        stage = "reviewed";
      } else if (status === "rejected") {
        stage = "closed";
      }
    }

    // If explicitly marking completed
    if (markCompleted === true) {
      stage = "completed";
    }
    if (stage) {
      updateFields.push(`stage = $${index++}`);
      values.push(stage);
    }

    if (priority) {
      updateFields.push(`priority = $${index++}`);
      values.push(priority);
    }
    //update stage based on status

    if (updateFields.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No fields to update" });
    }

    values.push(application_id);

    const query = `
      UPDATE applications
      SET ${updateFields.join(", ")}
      WHERE application_id = $${index}
      RETURNING *;
    `;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    const fullData = await pool.query(
      `SELECT 
         a.application_id,
         a.type,
         a.status,
         a.stage,
         a.priority,
         a.deadline,
         a.created_at,
         a.student_id,
         a.app_notes,
         u.username AS student_name,
         u.moodle_id,
         u.user_email,
         d.document_type,
         d.cloudinary_url,
         dept.dept_name AS branch
       FROM applications a
       LEFT JOIN users u ON a.student_id = u.id
       LEFT JOIN documents d ON a.document_id = d.id
       LEFT JOIN department dept ON u.department_id = dept.id
       WHERE a.application_id = $1`,
      [application_id],
    );

    res.json({
      success: true,
      message: "Application updated successfully",
      application: fullData.rows[0],
    });
  } catch (error) {
    console.error("Error updating application:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update application" });
  }
};

export const updateApplicationNotes = async (req, res) => {
  const { application_id } = req.params;
  const { app_notes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE applications 
       SET app_notes = $1 
       WHERE application_id = $2 
       RETURNING *`,
      [app_notes, application_id],
    );

    if (result.rowCount === 0)
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });

    res.json({
      success: true,
      message: "Notes updated",
      app_notes: result.rows[0].app_notes,
    });
  } catch (error) {
    console.error("Error updating notes:", error);
    res.status(500).json({ success: false, message: "Failed to update notes" });
  }
};

//controller for visuals

export const getInchargeDashboard = async (req, res) => {
  const { incharge_id } = req.params;

  try {
    const studentsByBranch = await pool.query(`
  SELECT
    d.dept_name AS branch,
    COUNT(u.id) AS total_students
  FROM users u
  JOIN department d ON u.department_id = d.id
  JOIN roles r ON u.role_id = r.id
  WHERE r.role_name = 'student'
  GROUP BY d.dept_name
  ORDER BY d.dept_name
`);

    const applicationsByBranch = await pool.query(
      `
  SELECT
    d.dept_name AS branch,
    COUNT(a.id) AS total_applications
  FROM applications a
  JOIN users u ON a.student_id = u.id
  JOIN department d ON u.department_id = d.id
  WHERE a.incharge_id = $1
  GROUP BY d.dept_name
  `,
      [incharge_id],
    );

    res.json({
      studentsByBranch: studentsByBranch.rows,
      applicationsByBranch: applicationsByBranch.rows,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
};


export const notifyStudentCompletion = async (req, res) => {
  const { application_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
         a.application_id,
         a.type,
         a.stage,
         u.user_email,
         u.moodle_id,
         u.username
       FROM applications a
       JOIN users u ON a.student_id = u.id
       WHERE a.application_id = $1`,
      [application_id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const app = result.rows[0];

    if (app.stage !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Application is not yet completed",
      });
    }

    await transporter.sendMail({
      from: `"Application Portal" <${process.env.EMAIL_USER}>`,
      to: app.user_email,
      subject: "Application Completed - Document Ready",
      html: `
        <h2>Your Application is Completed. Please Collect your Documents from the Exam Section.</h2>
        <p><b>Name:</b> ${app.username}</p>
        <p><b>Moodle ID:</b> ${app.moodle_id}</p>
        <p><b>Application ID:</b> ${app.application_id}</p>
        <p><b>Type:</b> ${app.type}</p>
        <p>Your document is ready for collection from the department office.</p>
      `,
    });

    res.json({
      success: true,
      message: "Student notified successfully",
    });

  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send notification",
    });
  }
};