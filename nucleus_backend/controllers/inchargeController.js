import pool from "../config/dbConfig.js";

// Get applications assigned to a specific incharge
export const getInchargeApplications = async (req, res) => {
  const { incharge_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
         a.application_id,
         a.type,
         a.status,
         a.priority,
         a.deadline,
         a.created_at,
         a.student_id,
         a.app_notes,
         u.username AS student_name,
         u.moodle_id,
         d.document_type,
         d.cloudinary_url
       FROM applications a
       LEFT JOIN users u ON a.student_id = u.id
       LEFT JOIN documents d ON a.document_id = d.id
       WHERE a.incharge_id = $1
       ORDER BY a.created_at DESC`,
      [incharge_id]
    );

    res.json({ success: true, applications: result.rows });
  } catch (error) {
    console.error("Error fetching incharge applications:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch incharge applications",
      });
  }
};

// Update application status or priority
export const updateApplicationStatus = async (req, res) => {
  const { application_id } = req.params;
  const { status, priority } = req.body;

  try {
    const updateFields = [];
    const values = [];
    let index = 1;

    if (status) {
      updateFields.push(`status = $${index++}`);
      values.push(status);
    }

    if (priority) {
      updateFields.push(`priority = $${index++}`);
      values.push(priority);
    }

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
     a.priority,
     a.deadline,
     a.created_at,
     a.student_id,
     u.username AS student_name,
     u.moodle_id,
     d.document_type,
     d.cloudinary_url
   FROM applications a
   LEFT JOIN users u ON a.student_id = u.id
   LEFT JOIN documents d ON a.document_id = d.id
   WHERE a.application_id = $1`,
      [application_id]
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
      [app_notes, application_id]
    );

    if (result.rowCount === 0)
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });

    res.json({ success: true, message: "Notes updated", app_notes: result.rows[0].app_notes });
  } catch (error) {
    console.error("Error updating notes:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update notes" });
  }
};
