import express from 'express';
import { fetchMe } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get("/me", fetchMe);

export default userRouter;