import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { db } from "../config/firebase.js";

export const testEndpoint = async (req: AuthRequest, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  return res
    .status(200)
    .json({ message: "Auth route is working!", token: `Bearer ${token}` });
}

export const checkUserExistence = async (req: AuthRequest, res: Response) => {
  const uid = req.params.uid;
  console.log("Received UID:", uid);

  if (!uid) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const userRef = db.collection("users").doc(uid);
    const userSnapshot = await userRef.get();
    if (userSnapshot.exists) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(404).json({ exists: false });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
