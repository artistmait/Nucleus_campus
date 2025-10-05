import express from 'express';
import { getDepartmentApplications } from '../controllers/higherauthController.js';



const higherauthRouter = express.Router();

higherauthRouter.get('/getApplications/:department_id',getDepartmentApplications)

export default higherauthRouter;