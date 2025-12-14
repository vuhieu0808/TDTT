import express from 'express';
import { fetchMe, fetchUserById, updateMe } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get("/me", fetchMe);
userRouter.get("/:id", fetchUserById);
userRouter.put("/me", updateMe);

export default userRouter;