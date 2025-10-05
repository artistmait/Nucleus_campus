import pool from "../config/dbConfig.js";

export const getDepartmentApplications = async (req, res) => {
  const { department_id } = req.params; // coming from route param

  try {
    const query = `
      SELECT 
        a.id,
        a.type,
        a.status,
        a.priority,
        a.deadline,
        a.created_at,
        a.student_id,
        doc.document_type,
        doc.cloudinary_url
      FROM applications a
      LEFT JOIN users u ON a.student_id = u.id
      LEFT JOIN department d ON a.department_id = d.id
      LEFT JOIN documents doc ON a.document_id = doc.id
      WHERE a.department_id = $1
      ORDER BY a.created_at DESC;
    `;

    const result = await pool.query(query, [department_id]);

    res.json({
      success: true,
      applications: result.rows,
    });
  } catch (error) {
    console.error("Error fetching department applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch department applications",
    });
  }
};
