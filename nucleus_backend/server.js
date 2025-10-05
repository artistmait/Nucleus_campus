import express from 'express';
import cors from 'cors';
import userRouter from './routes/authRoute.js';
import dotenv from "dotenv";
import applicationRouter from './routes/applicationRoute.js';
import inchargeRouter from './routes/inchargeRoute.js';
import higherauthRouter from './routes/higherauthRoutes.js';


dotenv.config();


const app = express();
app.use(cors());
app.use(express.json())

//auth routes
app.use('/api/auth',userRouter);
app.use('/api/student',applicationRouter);
app.use('/api/incharge',inchargeRouter);
app.use('/api/higher-authority',higherauthRouter);


app.listen(5000,()=>{
    console.log("Server started on port 5000");
})