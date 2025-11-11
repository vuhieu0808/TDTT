import express from "express";
import 'dotenv/config';
import "./config/firebase.js";
import cors from "cors";
import authRouter from "./routes/authRoute.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import userRouter from "./routes/userRoute.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL }));

// Public routes

// Private routes
app.use(authMiddleware);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
