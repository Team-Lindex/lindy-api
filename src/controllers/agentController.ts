import { Request, Response } from 'express';
import { askAgent } from '../voltagent';
import logger from '../utils/logger';

// Define interface for the request body
interface AgentRequestBody {
  question: string;
}

/**
 * Ask the agent a question
 * @route POST /api/agent/ask
 */
export const askAgentQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { question } = req.body as AgentRequestBody;
    
    if (!question || typeof question !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Question is required and must be a string'
      });
      return;
    }

    // Call the askAgent function
    const answer = await askAgent(question);
    
    // Return the response
    res.status(200).json({
      success: true,
      data: {
        question,
        answer
      }
    });
  } catch (error) {
    logger.error(`Error asking agent: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Error processing your question'
    });
  }
};
