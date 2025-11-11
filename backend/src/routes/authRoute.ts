import express from "express";
import {
  checkUserExistence,
  createUser,
  testEndpoint,
} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.get("/test", testEndpoint);
authRouter.get("/checkUserExistence/:uid", checkUserExistence);
authRouter.post("/createUser", createUser);

export default authRouter;
