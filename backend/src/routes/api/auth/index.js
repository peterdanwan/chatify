// backend/routes/api/auth/index.js

import express from 'express';
import { getSignup, getLogin, getLogout } from '#controllers/authController.js';

const authRouter = express.Router();

authRouter.get('/signup', getSignup);
// authRouter.get('/deleteaccount', get)
authRouter.get('/login', getLogin);
authRouter.get('/logout', getLogout);

export default authRouter;
