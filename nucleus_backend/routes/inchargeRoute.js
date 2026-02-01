import express from 'express';
import { getInchargeApplications, updateApplicationStatus , updateApplicationNotes, getInchargeDashboard} from '../controllers/inchargeController.js';



const inchargeRouter = express.Router();

inchargeRouter.get('/getApplication/:incharge_id',getInchargeApplications);
inchargeRouter.put('/updateApplication/:application_id',updateApplicationStatus);
inchargeRouter.put("/updateNotes/:application_id", updateApplicationNotes);
inchargeRouter.get('/getInchargeDashboard', getInchargeDashboard);


export default inchargeRouter;