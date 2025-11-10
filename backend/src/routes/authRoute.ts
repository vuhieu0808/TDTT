import express from "express";
import { auth } from "firebase-admin";
import {
  checkUserExistence,
  testEndpoint,
} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.get("/test", testEndpoint);
authRouter.get("/checkUserExistence/:uid", checkUserExistence);

export default authRouter;
