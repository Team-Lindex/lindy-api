import express from 'express';
import { askAgentQuestion } from '../controllers/agentController';

const router = express.Router();

// POST /api/agent/ask - Ask the agent a question
router.post('/ask', askAgentQuestion);

export default router;
