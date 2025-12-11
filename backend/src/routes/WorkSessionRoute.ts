import express from "express";
import { verifyUserInSession } from "../middlewares/workSessionMiddleware.js";
import {
  confirmWorkSession,
  cancelWorkSession,
  createNewWorkSession,
  getWorkSessions,
  updateWorkSession,
  startWorkSession,
  completeWorkSession,
} from "../controllers/WorkSessionController.js";

const WorkSessionRoute = express.Router();

WorkSessionRoute.post("/", createNewWorkSession);
WorkSessionRoute.get("/", getWorkSessions);
WorkSessionRoute.put(
  "/update/:workSessionId",
  verifyUserInSession,
  updateWorkSession
);
WorkSessionRoute.put(
  "/confirm/:workSessionId",
  verifyUserInSession,
  confirmWorkSession
);
WorkSessionRoute.put(
  "/cancel/:workSessionId",
  verifyUserInSession,
  cancelWorkSession
);
WorkSessionRoute.put(
  "/complete/:workSessionId",
  verifyUserInSession,
  completeWorkSession
);
WorkSessionRoute.put(
  "/start/:workSessionId",
  verifyUserInSession,
  startWorkSession
);

export default WorkSessionRoute;
