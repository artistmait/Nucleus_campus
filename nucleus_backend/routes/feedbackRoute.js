import express from 'express';
import { feedback_predict, getFeedbackAnalytics } from "../controllers/feedbackController.js";

const feedbackRouter = express.Router();
feedbackRouter.post('/feedback',feedback_predict)
feedbackRouter.get('/feedbackanalytics',getFeedbackAnalytics)

export default feedbackRouter;