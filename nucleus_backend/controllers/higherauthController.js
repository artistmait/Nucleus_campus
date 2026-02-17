import pool from "../config/dbConfig.js";

export const getDepartmentApplications = async (req, res) => {
  const { department_id } = req.params; // coming from route param

  try {
    const query = `
      SELECT 
        a.application_id,
        a.type,
        a.status,
        a.priority,
        a.deadline,
        a.created_at,
        a.student_id,
        u.moodle_id,
        u.username,
        doc.document_type,
        doc.cloudinary_url,
        inc.id AS incharge_id,
        inc.username AS incharge_name
      FROM applications a
      LEFT JOIN users u ON a.student_id = u.id
      LEFT JOIN department d ON a.department_id = d.id
      LEFT JOIN users inc ON a.incharge_id = inc.id
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

export const getHADashboard = async (req, res) => {
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

export const gethaDashboard = async (req, res) => {
  const { department_id } = req.params;

  try {
    const studentsCount = await pool.query(
      `
      SELECT COUNT(u.id) AS total_students
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.department_id = $1
      AND r.role_name = 'student'
      `,
      [department_id],
    );

    const applicationsCount = await pool.query(
      `
      SELECT COUNT(a.id) AS total_applications
      FROM applications a
      JOIN users u ON a.student_id = u.id
      WHERE u.department_id = $1
      `,
      [department_id],
    );

    const sentimentData = await pool.query(
      `
      SELECT 
        f.sentiment,
        COUNT(f.id) AS count
      FROM feedback f
      JOIN applications a ON f.application_id = a.id
      JOIN users u ON a.student_id = u.id
      WHERE u.department_id = $1
      GROUP BY f.sentiment
      `,
      [department_id],
    );

    res.json({
      success: true,
      totalStudents: studentsCount.rows[0].total_students,
      totalApplications: applicationsCount.rows[0].total_applications,
      sentimentDistribution: sentimentData.rows,
    });
  } catch (error) {
    console.error("HA Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch HA dashboard data",
    });
  }
};

export const updateApplicationPriority = async (req, res) => {
  const { application_id } = req.params;
  const { priority } = req.body;

  try {
    const validPriorities = ["low", "high", "critical"];

    if (!validPriorities.includes(priority.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority value",
      });
    }

    const result = await pool.query(
      `UPDATE applications
   SET priority = $1
   WHERE application_id = $2
   RETURNING *`,
      [priority.toLowerCase(), application_id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({
      success: true,
      message: "Priority updated successfully",
    });
  } catch (error) {
    console.error("Priority update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update priority",
    });
  }
};
