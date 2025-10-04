import express from 'express';
import { loginUser, signupUser } from '../controllers/userController.js';
import authUser from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/login',loginUser);
userRouter.post('/signup', signupUser);
userRouter.post('/is-verify',authUser)



export default userRouter;