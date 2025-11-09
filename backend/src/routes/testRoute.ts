import express from "express";
import { auth } from "firebase-admin";
import { signIn, signUp } from "../controllers/authController.js";

const testRouter = express.Router();

testRouter.get("/test", (req: express.Request, res: express.Response) => {
    const token = req.headers.authorization?.split(" ")[1];
    return res.status(200).json({ message: "Auth route is working!", token: `Bearer ${token}` });
});

export default testRouter;
