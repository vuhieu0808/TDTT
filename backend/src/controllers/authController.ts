import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { db, rtdb } from "../config/firebase.js";
import { User, UserStatus, FullUserProfile } from "../models/User.js";
import { Timestamp } from "firebase-admin/firestore";
import { ServerValue } from "firebase-admin/database";

export const testEndpoint = async (req: AuthRequest, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  return res
    .status(200)
    .json({ message: "Auth route is working!", token: `Bearer ${token}` });
};

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

export const createUser = async (req: AuthRequest, res: Response) => {
  const dataUser = req.user;
  if (!dataUser) {
    return res.status(401).json({ error: "Unauthorized. No token provided" });
  }
  const { uid, email, name, picture } = dataUser;
  if (!uid || !email || !name || !picture) {
    return res.status(400).json({ error: "Missing required user information" });
  }
  console.log("Creating user with UID:", uid);
  try {
    const now = Timestamp.now();
    const rtdbTimestamp = ServerValue.TIMESTAMP;

    const newUserForFirestore: User = {
      uid: uid,
      displayName: name,
      email: email,
      ...(picture && { avatarUrl: picture }),
      createdAt: now,
      updatedAt: now,
    };

    const newUserStatus: UserStatus = {
      uid: uid,
      status: "online",
      lastActivity: rtdbTimestamp as Object as number,
    };

    const userRef = db.collection("users").doc(uid);
    const userStatusRef = rtdb.ref(`UserStatus/${uid}`);

    const user: FullUserProfile = {
      ...newUserForFirestore,
      ...newUserStatus,
    };

    const userDoc = await userRef.get();
    if (userDoc.exists) {
      return res.status(200).json({ message: "User already exists", user: user });
    }

    await Promise.all([
      userRef.set(newUserForFirestore),
      userStatusRef.set(newUserStatus),
    ]);

    return res.status(201).json({
      message: "User created successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
