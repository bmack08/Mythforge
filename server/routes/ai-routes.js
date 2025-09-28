// AI-related route handlers
import express from 'express';
import asyncHandler from 'express-async-handler';
import { AIService } from '../services/ai/index.js';

const router = express.Router();
const aiService = AIService.getInstance();

// Handle AI requests
router.post('/api/ai-request', asyncHandler(async (req, res) => {
    const { prompt, type, options = {} } = req.body;

    const response = await aiService.generateContent({
        type: type || 'text',
        prompt,
        options: {
            ...options,
            provider: 'openai',
            model: process.env.OPENAI_DEFAULT_MODEL
        }
    });

    // Return the response in the format expected by the frontend
    if (response.success) {
        res.json({
            success: true,
            content: response.content,
            metadata: response.metadata
        });
    } else {
        res.status(500).json({
            success: false,
            error: response.error?.message || 'AI service error',
            details: response.error
        });
    }
}));

// Story assistant route (more specialized handling)
router.post('/api/story-assistant', asyncHandler(async (req, res) => {
    const {
        message,
        documentText = '',
        metadata = {},
        chatHistory = [],
        references = [],
        storyState = {}
    } = req.body;

    if (!message?.trim()) {
        return res.status(400).json({
            success: false,
            error: 'Message is required'
        });
    }

    // Build context for story assistant
    let contextPrompt = `You are a helpful D&D story assistant. Respond naturally to the user's message.`;
    
    if (documentText) {
        contextPrompt += `\n\nDocument Context:\n${documentText}`;
    }
    
    if (chatHistory && chatHistory.length > 0) {
        contextPrompt += `\n\nChat History:\n${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`;
    }

    const response = await aiService.generateContent({
        type: 'custom',
        prompt: `${contextPrompt}\n\nUser: ${message}`,
        context: {
            document: documentText,
            metadata,
            chatHistory,
            references,
            storyState,
            responseFormat: 'text' // Don't force JSON for story assistant
        },
        options: {
            provider: 'openai',
            model: process.env.OPENAI_DEFAULT_MODEL,
            temperature: 0.7
        }
    });

    // Return the response in the format expected by the frontend
    if (response.success) {
        res.json({
            success: true,
            message: typeof response.content === 'string' ? response.content : response.content.content || 'No response',
            metadata: response.metadata
        });
    } else {
        res.status(500).json({
            success: false,
            error: response.error?.message || 'AI service error',
            details: response.error
        });
    }
}));

// Insert chunk route (uses existing knowledge graph service)
router.post('/api/insertChunk', asyncHandler(async (req, res) => {
    const { storyId, chunk } = req.body;

    if (!storyId || !chunk) {
        return res.status(400).json({
            success: false,
            error: 'Story ID and chunk are required'
        });
    }

    const knowledgeGraph = req.app.locals.knowledgeGraph;
    const result = await knowledgeGraph.insertChunk(storyId, chunk);

    res.json({
        success: true,
        chunk: result
    });
}));

export default router;
