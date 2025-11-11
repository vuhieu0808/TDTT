import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";

export const fetchMe = (req: AuthRequest, res: Response) => {
  const dataUser = req.user;
  if (!dataUser) {
    return res.status(401).json({ error: "Unauthorized. No token provided" });
  }
  const { uid } = dataUser;
  
};
