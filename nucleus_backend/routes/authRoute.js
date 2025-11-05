import express from 'express';
import { loginUser, signupUser } from '../controllers/userController.js';
import authUser from '../middleware/auth.js';
import { validateLogin, validateSignup } from '../middleware/validInfo.js';

const userRouter = express.Router();

userRouter.post('/login',validateLogin,loginUser);
userRouter.post('/signup', validateSignup,signupUser);
userRouter.post('/is-verify',authUser)

export default userRouter;