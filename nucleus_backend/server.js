import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import cors from 'cors';
import userRouter from './routes/authRoute.js';
import applicationRouter from './routes/applicationRoute.js';
import inchargeRouter from './routes/inchargeRoute.js';
import higherauthRouter from './routes/higherauthRoutes.js';
import feedbackRouter from './routes/feedbackRoute.js';


const app = express();
app.use(cors());
app.use(express.json())

//auth routes
app.use('/api/auth',userRouter);
app.use('/api/student',applicationRouter);
app.use('/api/incharge',inchargeRouter);
app.use('/api/higher-authority',higherauthRouter);

//ml routes
app.use('/api/predict',feedbackRouter)


app.listen(5000,()=>{
    console.log("Server started on port 5000");
})