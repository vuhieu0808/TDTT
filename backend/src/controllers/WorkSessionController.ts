import { AuthRequest } from "../middlewares/authMiddleware.js";
import { Response } from "express";
import { WorkSessionServices } from "../services/WorkSessionServices.js";

export const createNewWorkSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. No token provided" });
    }
    const { participants, scheduledAt, location, goals } = req.body;
    if (!participants || !scheduledAt) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    await WorkSessionServices.createWorkSession(
      participants,
      new Date(scheduledAt),
      location,
      goals
    );
    return res
      .status(201)
      .json({ message: "Work session created successfully" });
  } catch (error) {
    console.error("Error creating work session:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getWorkSessions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. No token provided" });
    }
    const workSessions = await WorkSessionServices.getWorkSessionsForUser(
      userId
    );
    return res.status(200).json({ workSessions });
  } catch (error) {
    console.error("Error fetching work sessions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateWorkSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. No token provided" });
    }
    const { workSessionId } = req.params;
    if (!workSessionId) {
      return res.status(400).json({ error: "Missing workSessionId parameter" });
    }
    const updateData = req.body;
    await WorkSessionServices.updateWorkSession(workSessionId, updateData);
    return res
      .status(200)
      .json({ message: "Work session updated successfully" });
  } catch (error) {
    console.error("Error updating work session:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const confirmWorkSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. No token provided" });
    }
    const { workSessionId } = req.params;
    if (!workSessionId) {
      return res.status(400).json({ error: "Missing workSessionId parameter" });
    }
    await WorkSessionServices.confirmWorkSession(workSessionId, userId);
    return res
      .status(200)
      .json({ message: "Work session confirmed successfully" });
  } catch (error) {
    console.error("Error confirming work session:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const cancelWorkSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. No token provided" });
    }
    const { workSessionId } = req.params;
    if (!workSessionId) {
      return res.status(400).json({ error: "Missing workSessionId parameter" });
    }
    await WorkSessionServices.cancelWorkSession(workSessionId, userId);
    return res
      .status(200)
      .json({ message: "Work session canceled successfully" });
  } catch (error) {
    console.error("Error canceling work session:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const completeWorkSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. No token provided" });
    }
    const { workSessionId } = req.params;
    if (!workSessionId) {
      return res.status(400).json({ error: "Missing workSessionId parameter" });
    }
    await WorkSessionServices.completeWorkSession(workSessionId, userId);
    return res
      .status(200)
      .json({ message: "Work session completed successfully" });
  } catch (error) {
    console.error("Error completing work session:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const startWorkSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. No token provided" });
    }
    const { workSessionId } = req.params;
    if (!workSessionId) {
      return res.status(400).json({ error: "Missing workSessionId parameter" });
    }
    await WorkSessionServices.startWorkSession(workSessionId, userId);
    return res
      .status(200)
      .json({ message: "Work session started successfully" });
  } catch (error) {
    console.error("Error starting work session:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
