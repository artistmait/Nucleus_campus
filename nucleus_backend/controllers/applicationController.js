import prisma from "../config/prismaClient.js";
import cloudinary from "../config/cloudinaryConfig.js";
import { Readable } from "stream";
import { transporter } from "../config/email.js";
import notificationService from "../services/notificationService.js";

export const STATUS_MESSAGES = {
    under_review:  (appLabel) => `Your ${appLabel} application is now under review. We'll notify you once a decision is made.`,
    approved:      (appLabel) => `Great news! Your ${appLabel} application has been approved.`,
    rejected:      (appLabel, reason) => `Your ${appLabel} application was not approved${reason ? ': ' + reason : '. Please contact the office for details'}.`,
    completed:     (appLabel) => `Your ${appLabel} application is fully processed and completed. You may collect your documents.`,
    critical:      (appLabel) => `Action needed: Your ${appLabel} application has been escalated to CRITICAL priority — please visit the office.`,
};

const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "nucleus/student-documents",
        resource_type: "auto",
        access_mode: "public",
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      },
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });


export const submitApplication = async (req, res) => {
  try {
    const { student_id, type, department_id } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Document is required" });
    }

    // Upload to Cloudinary from memory buffer
    const uploadResult = await uploadToCloudinary(req.file);

    // Use Prisma interactive transaction
    const application = await prisma.$transaction(async (tx) => {
      // Check user role
      const userRecord = await tx.user.findUnique({
        where: { id: parseInt(student_id) },
        select: { role_id: true },
      });

      if (!userRecord) {
        throw new Error("USER_NOT_FOUND");
      }

      const role_id = userRecord.role_id;
      // If role_id is 4 (Alumni) - set priority high
      const priority = role_id === 4 ? "high" : "normal";

      // Insert into documents table
      const newDocument = await tx.document.create({
        data: {
          student_id: parseInt(student_id),
          document_type: type,
          cloudinary_url: uploadResult.secure_url,
        },
      });

      // Assign random incharge
      const incharges = await tx.user.findMany({
        where: { role_id: 2 },
        select: { id: true },
      });

      if (incharges.length === 0) {
        throw new Error("NO_INCHARGE");
      }

      const incharge_id = incharges[Math.floor(Math.random() * incharges.length)].id;

      // Generate application sequence ID
      const seqResult = await tx.$queryRaw`SELECT nextval('application_seq') AS seq`;
      const seq = seqResult[0].seq;
      const newapp_id = `APN-${String(seq).padStart(4, "0")}`;

      // Deadline: 7 days from now
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 7);

      // Insert application
      const newApp = await tx.application.create({
        data: {
          student_id: parseInt(student_id),
          incharge_id,
          document_id: newDocument.id,
          type,
          status: "pending",
          stage: "submitted",
          priority,
          deadline,
          department_id: parseInt(department_id),
          application_id: newapp_id,
        },
      });

      return newApp;
    });

    // Get email from backend (outside transaction)
    const studentUser = await prisma.user.findUnique({
      where: { id: parseInt(student_id) },
      select: { user_email: true, moodle_id: true },
    });

    if (!studentUser) {
      throw new Error("Student not found");
    }

    // Send email notif on submit
    try {
      await transporter.sendMail({
        from: `"Application Portal" <${process.env.EMAIL_USER}>`,
        to: studentUser.user_email,
        subject: "Application Submitted Successfully",
        html: `
      <h2>Application Submitted Successfully</h2>
      <p><b>Moodle ID:</b> ${studentUser.moodle_id}</p>
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
    } catch (mailError) {
      console.error("Email send failed:", mailError);
    }

    res.json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (error.message === "NO_INCHARGE") {
      return res.json({ success: false, message: "No incharge available" });
    }
    console.error("Submit Application Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//Get all applications submitted by a specific student
export const getMyApplications = async (req, res) => {
  const { student_id } = req.params;

  try {
    const applications = await prisma.application.findMany({
      where: { student_id: parseInt(student_id) },
      include: {
        document: {
          select: {
            cloudinary_url: true,
            document_type: true,
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
      incharge_id: app.incharge_id,
      app_notes: app.app_notes,
      cloudinary_url: app.document?.cloudinary_url || null,
      document_type: app.document?.document_type || null,
    }));

    res.status(200).json({
      success: true,
      applications: formattedApps,
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
  try {
    const { application_id } = req.params;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "File is required" });
    }

    // Upload new file to Cloudinary from memory buffer
    const uploadResult = await uploadToCloudinary(req.file);

    // Use Prisma interactive transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find the existing application with its document
      const existingApp = await tx.application.findFirst({
        where: { application_id },
        include: {
          document: {
            select: { document_type: true },
          },
        },
      });

      if (!existingApp) {
        throw new Error("APP_NOT_FOUND");
      }

      // Create new document entry
      const newDoc = await tx.document.create({
        data: {
          student_id: existingApp.student_id,
          document_type: existingApp.document?.document_type || 'unknown',
          cloudinary_url: uploadResult.secure_url,
        },
      });

      // Update the application with the new document id
      await tx.application.update({
        where: { id: existingApp.id },
        data: { document_id: newDoc.id },
      });

      return newDoc;
    });

    res.json({
      success: true,
      message: "Document updated successfully",
      newUrl: uploadResult.secure_url,
    });
  } catch (error) {
    if (error.message === "APP_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
    console.error("Error updating document:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update document" });
  }
};