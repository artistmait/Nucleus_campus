import prisma from "../config/prismaClient.js";
import { transporter } from "../config/email.js";
import notificationService from "../services/notificationService.js";
import { STATUS_MESSAGES } from "./applicationController.js";

// Get applications assigned to a specific incharge
export const getInchargeApplications = async (req, res) => {
  const { incharge_id } = req.params;

  try {
    const applications = await prisma.application.findMany({
      where: { incharge_id: parseInt(incharge_id) },
      include: {
        student: {
          select: {
            username: true,
            moodle_id: true,
            department: {
              select: { dept_name: true },
            },
          },
        },
        document: {
          select: {
            document_type: true,
            cloudinary_url: true,
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
      stage: app.stage || 'submitted',
      priority: app.priority,
      deadline: app.deadline,
      created_at: app.created_at,
      student_id: app.student_id,
      app_notes: app.app_notes,
      student_name: app.student?.username || null,
      moodle_id: app.student?.moodle_id || null,
      document_type: app.document?.document_type || null,
      cloudinary_url: app.document?.cloudinary_url || null,
      branch: app.student?.department?.dept_name || null,
    }));

    res.json({ success: true, applications: formattedApps });
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
    const updateData = {};
    let stage = null;

    if (status) {
      updateData.status = status;

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
      updateData.stage = stage;
    }

    if (priority) {
      updateData.priority = priority;
    }

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No fields to update" });
    }

    // Find the application first to ensure it exists
    const existingApp = await prisma.application.findFirst({
      where: { application_id },
    });

    if (!existingApp) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    // Update
    await prisma.application.update({
      where: { id: existingApp.id },
      data: updateData,
    });

    // Fetch full data with relations
    const fullApp = await prisma.application.findFirst({
      where: { application_id },
      include: {
        student: {
          select: {
            username: true,
            moodle_id: true,
            user_email: true,
            department: {
              select: { dept_name: true },
            },
          },
        },
        document: {
          select: {
            document_type: true,
            cloudinary_url: true,
          },
        },
      },
    });

    const application = {
      application_id: fullApp.application_id,
      type: fullApp.type,
      status: fullApp.status,
      stage: fullApp.stage,
      priority: fullApp.priority,
      deadline: fullApp.deadline,
      created_at: fullApp.created_at,
      student_id: fullApp.student_id,
      incharge_id: fullApp.incharge_id,
      department_id: fullApp.department_id,
      app_notes: fullApp.app_notes,
      student_name: fullApp.student?.username || null,
      moodle_id: fullApp.student?.moodle_id || null,
      user_email: fullApp.student?.user_email || null,
      document_type: fullApp.document?.document_type || null,
      cloudinary_url: fullApp.document?.cloudinary_url || null,
      branch: fullApp.student?.department?.dept_name || null,
    };

    const normalizedStatus =
      typeof status === "string" ? status.toLowerCase() : null;
    const appLabel = (application.type || "application")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const studentName = application.student_name || "A student";

    const statusMessageMap = {
      under_review: STATUS_MESSAGES.under_review,
      approved: STATUS_MESSAGES.approved,
      rejected: STATUS_MESSAGES.rejected,
    };
    const statusMessageFn = normalizedStatus
      ? statusMessageMap[normalizedStatus]
      : null;
    const shouldNotifyStatus = Boolean(statusMessageFn);
    const shouldNotifyCompletion = markCompleted === true;

    if (shouldNotifyStatus || shouldNotifyCompletion) {
      try {
        const notificationPromises = [];
        let haIds = [];

        if (application.department_id) {
          const haUsers = await prisma.user.findMany({
            where: { role_id: 3, department_id: application.department_id },
            select: { id: true },
          });
          haIds = haUsers.map((row) => row.id);
        }

        if (shouldNotifyStatus) {
          if (application.student_id) {
            notificationPromises.push(
              notificationService.sendNotification(
                application.student_id,
                statusMessageFn(appLabel),
                "info",
              ),
            );
          }

          const haActionMap = {
            under_review: "is now under review by the incharge",
            approved: "was approved by the incharge",
            rejected: "was rejected by the incharge",
          };
          const haAction = haActionMap[normalizedStatus];
          if (haAction && haIds.length > 0) {
            const haMessage = `${studentName}'s ${appLabel} application (#${application.application_id}) ${haAction}.`;
            haIds.forEach((haId) => {
              notificationPromises.push(
                notificationService.sendNotification(haId, haMessage, "info"),
              );
            });
          }
        }

        if (shouldNotifyCompletion) {
          if (application.student_id) {
            notificationPromises.push(
              notificationService.sendNotification(
                application.student_id,
                STATUS_MESSAGES.completed(appLabel),
                "info",
              ),
            );
          }

          if (haIds.length > 0) {
            const haMessage = `${studentName}'s ${appLabel} application (#${application.application_id}) was marked completed by the incharge.`;
            haIds.forEach((haId) => {
              notificationPromises.push(
                notificationService.sendNotification(haId, haMessage, "info"),
              );
            });
          }
        }

        if (notificationPromises.length > 0) {
          await Promise.all(notificationPromises);
        }
      } catch (notifyError) {
        console.error("Error sending notifications:", notifyError);
      }
    }

    res.json({
      success: true,
      message: "Application updated successfully",
      application,
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
    const existingApp = await prisma.application.findFirst({
      where: { application_id },
    });

    if (!existingApp) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    const updated = await prisma.application.update({
      where: { id: existingApp.id },
      data: { app_notes },
    });

    res.json({
      success: true,
      message: "Notes updated",
      app_notes: updated.app_notes,
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
    // Students by branch
    const studentsByBranchRaw = await prisma.user.groupBy({
      by: ['department_id'],
      where: {
        role: { role_name: 'student' },
        department_id: { not: null },
      },
      _count: { id: true },
    });

    // Get department names
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

    // Need department names for applications too
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


export const notifyStudentCompletion = async (req, res) => {
  const { application_id } = req.params;

  try {
    const app = await prisma.application.findFirst({
      where: { application_id },
      include: {
        student: {
          select: {
            user_email: true,
            moodle_id: true,
            username: true,
          },
        },
      },
    });

    if (!app) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (app.stage !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Application is not yet completed",
      });
    }

    await transporter.sendMail({
      from: `"Application Portal" <${process.env.EMAIL_USER}>`,
      to: app.student?.user_email,
      subject: "Application Completed - Document Ready",
      html: `
        <h2>Your Application is Completed. Please Collect your Documents from the Exam Section.</h2>
        <p><b>Name:</b> ${app.student?.username}</p>
        <p><b>Moodle ID:</b> ${app.student?.moodle_id}</p>
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