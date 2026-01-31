import express from 'express';
import { feedback_predict } from "../controllers/feedbackController.js";

const feedbackRouter = express.Router();
feedbackRouter.post('/feedback',feedback_predict)

export default feedbackRouter;