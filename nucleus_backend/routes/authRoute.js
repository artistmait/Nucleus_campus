import express from 'express';
import { loginUser, signupUser, googleLogin } from '../controllers/userController.js';
import authUser from '../middleware/auth.js';
import { validateLogin, validateSignup } from '../middleware/validInfo.js';

const userRouter = express.Router();

userRouter.post('/login',validateLogin,loginUser);
userRouter.post('/signup', validateSignup,signupUser);
userRouter.post('/is-verify',authUser)
userRouter.post('/google-login',googleLogin)

export default userRouter;