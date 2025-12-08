import express from 'express';
import { fetchMe, updateMe } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get("/me", fetchMe);
userRouter.put("/me", updateMe);

export default userRouter;