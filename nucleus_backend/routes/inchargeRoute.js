import express from 'express';
import { getInchargeApplications, updateApplicationStatus , updateApplicationNotes, getInchargeDashboard, notifyStudentCompletion} from '../controllers/inchargeController.js';



const inchargeRouter = express.Router();

inchargeRouter.get('/getApplication/:incharge_id',getInchargeApplications);
inchargeRouter.put('/updateApplication/:application_id',updateApplicationStatus);
inchargeRouter.put("/updateNotes/:application_id", updateApplicationNotes);
inchargeRouter.get('/getInchargeDashboard', getInchargeDashboard);
inchargeRouter.post('/notify/:application_id', notifyStudentCompletion);


export default inchargeRouter;