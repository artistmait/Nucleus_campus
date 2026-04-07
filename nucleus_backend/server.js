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
const PORT = Number(process.env.PORT) || 5000;
app.use(cors());
app.use(express.json())
// in server.js, before your routes

app.get('/health', (req, res) => {
    res.status(200).json({ ok: true });
});

//auth routes
app.use('/api/auth',userRouter);
app.use('/api/student',applicationRouter);
app.use('/api/incharge',inchargeRouter);
app.use('/api/higher-authority',higherauthRouter);

//ml routes
app.use('/api/predict',feedbackRouter)


const server = app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
});

server.on('error', (err) => {
    console.error('HTTP server error:', err);
});

server.on('close', () => {
    console.log('HTTP server closed');
});

process.on('beforeExit', (code) => {
    console.log(`Process beforeExit with code ${code}`);
});

process.on('exit', (code) => {
    console.log(`Process exited with code ${code}`);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM');
    process.exit(0);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
});