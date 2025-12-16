import "dotenv/config";
import { app, io, server } from "./socket/index.js";
import express from "express";
import "./config/firebase.js";
import "./config/ggdrive.js";
import "./services/matchingServices.js";
import cors from "cors";
import authRouter from "./routes/authRoute.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import userRouter from "./routes/userRoute.js";
import conversationRoute from "./routes/conversationsRoute.js";
import friendRoute from "./routes/friendRoute.js";
import messageRouter from "./routes/messageRoute.js";
import matchingRouter from "./routes/matchingRoute.js";
import llmSuggestRoute from "./routes/llmSuggestRoute.js";
import llmChatRoute from "./routes/llmChatRoute.js";
import venueRoute from "./routes/venueRoute.js";

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL!.split(",").map(url => url.trim()) }));

// Public routes

// Private routes
app.use(authMiddleware);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/friends", friendRoute);
app.use("/api/messages", messageRouter);
app.use("/api/conversations", conversationRoute);
app.use("/api/matching", matchingRouter);
app.use("/api/llmChat", llmChatRoute);
app.use("/api/llmSuggest", llmSuggestRoute);
app.use("/api/venues", venueRoute);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
