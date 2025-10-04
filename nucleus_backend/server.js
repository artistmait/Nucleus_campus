import express from 'express';
import cors from 'cors';
import userRouter from './routes/authRoute.js';
import dotenv from "dotenv";


dotenv.config();


const app = express();
app.use(cors());
app.use(express.json())

//auth routes
app.use('/api/auth',userRouter);

app.listen(5000,()=>{
    console.log("Server started on port 5000");
})