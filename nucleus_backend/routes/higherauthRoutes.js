import express from 'express';
import { getDepartmentApplications, gethaDashboard, updateApplicationPriority } from '../controllers/higherauthController.js';



const higherauthRouter = express.Router();

higherauthRouter.get('/getApplications/:department_id',getDepartmentApplications)
higherauthRouter.get('/gethaDashboard/:department_id',gethaDashboard)
higherauthRouter.put('/updatePriority/:department_id',updateApplicationPriority)

export default higherauthRouter;