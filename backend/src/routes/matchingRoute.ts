import express from 'express';
import { findMatches } from '../controllers/matchingController.js';

const matchingRouter = express.Router();

matchingRouter.get("/matches", findMatches);

export default matchingRouter;