import express from 'express';
import { getInchargeApplications, updateApplicationStatus } from '../controllers/inchargeController.js';



const inchargeRouter = express.Router();

inchargeRouter.get('/getApplication/:incharge_id',getInchargeApplications)
inchargeRouter.put('/updateApplication/:id',updateApplicationStatus)

export default inchargeRouter;