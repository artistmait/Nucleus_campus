import express from 'express';
import {
	loginUser,
	signupUser,
	googleLogin,
	getUserProfile,
	updateUserProfile,
	ChangePassword,
	requestForgotPasswordOtp,
	verifyForgotPasswordOtp,
	resetForgotPassword,
} from '../controllers/userController.js';
import authUser from '../middleware/auth.js';
import { validateLogin, validateSignup } from '../middleware/validInfo.js';

const userRouter = express.Router();

userRouter.post('/login',validateLogin,loginUser);
userRouter.post('/signup', validateSignup,signupUser);
userRouter.post('/is-verify',authUser)
userRouter.post('/google-login',googleLogin)
userRouter.get('/profile/:id', getUserProfile);
userRouter.put('/profile/:id', updateUserProfile);
userRouter.put('/change-password/:id', ChangePassword);
userRouter.post('/forgot-password/request', requestForgotPasswordOtp);
userRouter.post('/forgot-password/verify', verifyForgotPasswordOtp);
userRouter.post('/forgot-password/reset', resetForgotPassword);

export default userRouter;