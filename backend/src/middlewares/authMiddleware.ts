import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";

export interface AuthRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("Không tìm thấy token");
    res.status(401).json({ message: "Không tìm thấy token" });
    return;
  }

  const idToken = authHeader.split("Bearer ")[1];
  if (!idToken) {
    console.error("Token hết hạn");
    res.status(403).json({ message: "Token hết hạn" });
    return;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Lỗi khi xác minh trong authMiddleware:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
