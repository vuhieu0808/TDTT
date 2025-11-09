import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "./config/firebase.js";
import testRouter from "./routes/testRoute.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL }));

// Public routes
app.use("/api/test", testRouter);

// Private routes
app.use(authMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
