import express from "express";
import {
  getMyApplications,
  submitApplication,
  updateMyApplicationDocument,
} from "../controllers/applicationController.js";
import upload from "../middleware/uploadMiddleware.js";

const applicationRouter = express.Router();

applicationRouter.post(
  "/submitApplication",
  upload.single("documents"),
  submitApplication
);

applicationRouter.get("/getApplications/:student_id", getMyApplications);

applicationRouter.put(
  "/updateDocument/:application_id",
  upload.single("documents"),
  updateMyApplicationDocument
);

export default applicationRouter;
