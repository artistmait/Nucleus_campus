import express from 'express';
import { getMyApplications, submitApplication } from "../controllers/applicationController.js";
import upload from '../middleware/uploadMiddleware.js';


const applicationRouter = express.Router();

applicationRouter.post('/submitApplication',upload.single("documents"),submitApplication)
applicationRouter.get('/getApplications/:student_id',getMyApplications)

export default applicationRouter;