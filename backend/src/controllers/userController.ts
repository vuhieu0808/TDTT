import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { admin } from "../config/firebase.js";
import { User } from "../models/User.js";
import { getLinkFileFromUser } from "../utils/userHelper.js";
import { userDB } from "../models/db.js";

export const fetchMe = async (req: AuthRequest, res: Response) => {
	try {
		const dataUser = req.user;
		if (!dataUser) {
			return res
				.status(401)
				.json({ error: "Unauthorized. No token provided" });
		}
		const { uid } = dataUser;
		const userDataDoc = userDB.doc(uid);
		const userDataRef = await userDataDoc.get();
		if (!userDataRef.exists) {
			return res.status(404).json({ error: "User not found" });
		}
		const userDataFetched = userDataRef.data() as User;
		const avatarUrl = await getLinkFileFromUser(
			uid,
			userDataFetched.avatarUrl || ""
		);

		if (avatarUrl !== userDataFetched.avatarUrl) {
			// Cập nhật lại avatarUrl trong Firestore nếu nó đã thay đổi
			await userDataDoc.update({ avatarUrl });
		}

		// Chuyển đổi các trường Timestamp sang chuỗi ISO
		const userData = {
			...userDataFetched,
			avatarUrl,
			createdAt: userDataFetched.createdAt.toDate().toISOString(),
			updatedAt: userDataFetched.updatedAt.toDate().toISOString(),
			lastActivity: userDataFetched.lastActivity.toDate().toISOString(),
		};
		return res.status(200).json({ data: userData });
	} catch (error) {
		console.error("Error fetching user profile:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

export const fetchUserById = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.params.id;
		if (!userId) {
			return res.status(400).json({ error: "User ID is required" });
		}
		const userDataDoc = userDB.doc(userId);
		const userDataRef = await userDataDoc.get();
		if (!userDataRef.exists) {
			return res.status(404).json({ error: "User not found" });
		}
		const userDataFetched = userDataRef.data() as User;
		const avatarUrl = await getLinkFileFromUser(
			userId,
			userDataFetched.avatarUrl || ""
		);
		const userData = {
			...userDataFetched,
			avatarUrl,
			createdAt: userDataFetched.createdAt.toDate().toISOString(),
			updatedAt: userDataFetched.updatedAt.toDate().toISOString(),
			lastActivity: userDataFetched.lastActivity.toDate().toISOString(),
		};
		return res.status(200).json({ data: userData });
	} catch (error) {
		console.error("Error fetching user by ID:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

export const updateMe = async (req: AuthRequest, res: Response) => {
	try {
		const uid = req.user?.uid;
		if (!uid) {
			return res
				.status(401)
				.json({ error: "Unauthorized. No token provided" });
		}
		const updateData: Partial<User> = req.body as User;

		// Cập nhật trường updatedAt
		updateData.updatedAt = admin.firestore.Timestamp.now();

		const userDataDoc = userDB.doc(uid);
		const userDataRef = await userDataDoc.get();
		if (!userDataRef.exists) {
			return res.status(404).json({ error: "User not found" });
		}

		const newUserData = {
			...(userDataRef.data() as User),
			...updateData,
		};
		if (
			newUserData.age !== undefined &&
			newUserData.interests !== undefined &&
			newUserData.interests.length > 0 &&
			newUserData.occupation !== undefined &&
			newUserData.location !== undefined &&
			newUserData.workVibe !== undefined
		) {
			newUserData.isReadyToMatch = true;
		} else {
			newUserData.isReadyToMatch = false;
		}
		await userDataDoc.update(newUserData);

		const updatedUserDataRef = await userDataDoc.get();
		const updatedUserData = updatedUserDataRef.data() as User;

		return res.status(200).json({
			message: "User profile updated successfully",
			data: {
				...updatedUserData,
				createdAt: updatedUserData.createdAt.toDate().toISOString(),
				updatedAt: updatedUserData.updatedAt.toDate().toISOString(),
				lastActivity: updatedUserData.lastActivity
					.toDate()
					.toISOString(),
			},
		});
	} catch (error) {
		console.error("Error updating user profile:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
	try {
	} catch (error) {
		console.error("Error uploading avatar:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};