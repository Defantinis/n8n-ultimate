import express from 'express';
import { OptimizedAIAgent } from '../ai-agents/optimized-ai-agent.js';

const router = express.Router();
const agent = new OptimizedAIAgent();

/**
 * @route   POST /api/ai/summarize-error
 * @desc    Analyzes an n8n error JSON and returns a human-readable summary.
 * @access  Public // In a real app, this should be protected
 */
router.post('/summarize-error', async (req, res) => {
  const errorData = req.body;

  if (!errorData) {
    return res.status(400).json({ error: 'No error data provided.' });
  }

  try {
    const prompt = `You are an expert n8n troubleshooter. Analyze the following n8n error JSON and provide a concise, human-readable summary. Explain the root cause and suggest a likely fix. Keep the summary to 2-3 sentences. Error JSON: ${JSON.stringify(errorData, null, 2)}`;
    
    // Using the agent's underlying streaming client for a general-purpose prompt
    const streamingClient = agent['streamingClient'];
    const request = {
      id: `error-summary-${Date.now()}`,
      prompt: prompt,
      options: { temperature: 0.2 }
    };
    
    // We'll just execute a single request and get the full response
    const responseMap = await streamingClient.executeConcurrent([request], 1);
    const summary = responseMap.get(request.id) || 'Could not generate summary.';

    res.json({ summary });

  } catch (error) {
    console.error('Error during AI error analysis:', error);
    res.status(500).json({ error: 'Failed to analyze error with AI agent.' });
  }
});

export default router; 