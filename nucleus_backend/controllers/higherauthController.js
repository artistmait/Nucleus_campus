import prisma from "../config/prismaClient.js";
import notificationService from "../services/notificationService.js";

export const getDepartmentApplications = async (req, res) => {
  const { department_id } = req.params; // coming from route param

  try {
    const applications = await prisma.application.findMany({
      where: { department_id: parseInt(department_id) },
      include: {
        student: {
          select: {
            moodle_id: true,
            username: true,
          },
        },
        document: {
          select: {
            document_type: true,
            cloudinary_url: true,
          },
        },
        incharge: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Flatten to match the original response shape
    const formattedApps = applications.map((app) => ({
      application_id: app.application_id,
      type: app.type,
      status: app.status,
      priority: app.priority,
      deadline: app.deadline,
      created_at: app.created_at,
      student_id: app.student_id,
      moodle_id: app.student?.moodle_id || null,
      username: app.student?.username || null,
      document_type: app.document?.document_type || null,
      cloudinary_url: app.document?.cloudinary_url || null,
      incharge_id: app.incharge?.id || null,
      incharge_name: app.incharge?.username || null,
    }));

    res.json({
      success: true,
      applications: formattedApps,
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
    // Students by branch
    const studentsByBranchRaw = await prisma.user.groupBy({
      by: ['department_id'],
      where: {
        role: { role_name: 'student' },
        department_id: { not: null },
      },
      _count: { id: true },
    });

    const deptIds = studentsByBranchRaw.map((r) => r.department_id).filter(Boolean);
    const departments = await prisma.department.findMany({
      where: { id: { in: deptIds } },
    });
    const deptMap = Object.fromEntries(departments.map((d) => [d.id, d.dept_name]));

    const studentsByBranch = studentsByBranchRaw.map((r) => ({
      branch: deptMap[r.department_id] || 'Unknown',
      total_students: r._count.id,
    }));

    // Applications by branch for this incharge
    const applicationsByBranchRaw = await prisma.application.groupBy({
      by: ['department_id'],
      where: {
        incharge_id: parseInt(incharge_id),
        department_id: { not: null },
      },
      _count: { id: true },
    });

    const appDeptIds = applicationsByBranchRaw.map((r) => r.department_id).filter(Boolean);
    const appDepts = await prisma.department.findMany({
      where: { id: { in: appDeptIds } },
    });
    const appDeptMap = Object.fromEntries(appDepts.map((d) => [d.id, d.dept_name]));

    const applicationsByBranch = applicationsByBranchRaw.map((r) => ({
      branch: appDeptMap[r.department_id] || 'Unknown',
      total_applications: r._count.id,
    }));

    res.json({
      studentsByBranch,
      applicationsByBranch,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
};

export const gethaDashboard = async (req, res) => {
  const { department_id } = req.params;
  const deptId = parseInt(department_id);

  try {
    const totalStudents = await prisma.user.count({
      where: {
        department_id: deptId,
        role: { role_name: 'student' },
      },
    });

    const totalApplications = await prisma.application.count({
      where: {
        student: { department_id: deptId },
      },
    });

    // Sentiment distribution — use raw query since feedback doesn't have a direct
    // application relation in the introspected schema
    const sentimentData = await prisma.$queryRaw`
      SELECT 
        f.sentiment,
        COUNT(f.id)::int AS count
      FROM feedback f
      JOIN applications a ON f.application_id = a.id
      JOIN users u ON a.student_id = u.id
      WHERE u.department_id = ${deptId}
      GROUP BY f.sentiment
    `;

    res.json({
      success: true,
      totalStudents,
      totalApplications,
      sentimentDistribution: sentimentData,
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

    const normalizedPriority = (priority || "").toLowerCase();

    if (!validPriorities.includes(normalizedPriority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority value",
      });
    }

    // Find the application first
    const existingApp = await prisma.application.findFirst({
      where: { application_id },
    });

    if (!existingApp) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    await prisma.application.update({
      where: { id: existingApp.id },
      data: { priority: normalizedPriority },
    });

    // Get student name and app type for the message
    const appDetails = await prisma.application.findFirst({
      where: { application_id },
      include: {
        student: {
          select: { username: true },
        },
      },
    });

    if (appDetails) {
      const appLabel = (appDetails.type || "Application")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      const priorityMessages = {
        critical: {
          incharge: `${appDetails.student?.username}'s ${appLabel} application (#${application_id}) was manually escalated to CRITICAL by the HOD.`,
          student: `Your ${appLabel} application (#${application_id}) has been marked as CRITICAL priority by the HOD.`,
          type: "critical",
        },
        high: {
          incharge: `${appDetails.student?.username}'s ${appLabel} application (#${application_id}) has been escalated to HIGH priority by higher authorities.`,
          student: `Your application #${application_id} has been escalated to HIGH priority by higher authorities.`,
          type: "info",
        },
        low: {
          incharge: `${appDetails.student?.username}'s ${appLabel} application (#${application_id}) has been de-escalated to low priority by higher authorities.`,
          student: `Your application #${application_id} has been de-escalated to low priority by higher authorities.`,
          type: "info",
        },
      };

      const messages = priorityMessages[normalizedPriority];

      if (messages) {
        if (appDetails.incharge_id) {
          await notificationService.sendNotification(
            appDetails.incharge_id,
            messages.incharge,
            messages.type,
          );
        }

        if (appDetails.student_id) {
          await notificationService.sendNotification(
            appDetails.student_id,
            messages.student,
            messages.type,
          );
        }
      }
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
