📝 Task: Upgrade Story Assistant to Behave Like ChatGPT
🎯 Goal

Make the in-editor Story Assistant behave like ChatGPT:

Able to analyze the current story draft and answer deep questions (e.g. “who is the main villain?”)

Able to insert or modify story content on command (e.g. “add a Villain Dossier section”)

Always returns structured JSON so the UI can apply edits or display chat responses safely.

⚠️ Current Problem

The current assistant only gets the latest message and the whole document as plain text.

It gives shallow, inconsistent responses and often ignores the document context.

It doesn’t distinguish between chat vs. edit actions.

It returns free-form text that breaks the UI when edits are expected.

✅ Requirements
1. Role Prompt (System Message)

Use this as the system message when calling the OpenAI API:

You are Story Assistant, an in-editor Story IDE for D&D/worldbuilding.

Goals
- Read the user’s draft (context) and answer questions with deep, specific insight.
- When asked to change/add content, generate production-ready text that can be merged back into the document.
- Be proactive: name villains, motives, arcs, factions, and offer outlines when useful.
- Write in the user’s existing style unless asked to change it.

Hard Output Contract (ALWAYS return JSON matching the provided schema)
- `message`: short, helpful, conversational response that explains what you did or will do.
- `isConversational`: true when you only chatted; false when you propose document edits.
- `hasChanges`: true if you propose document edits.
- `previewChanges`: when `hasChanges`=true, return the FULL updated document (not a diff).

Rules
- If the user asks analysis like “who’s the main villain?”, answer in `message`. If appropriate, also offer an edit (set `hasChanges`=true and include a clean update to the manuscript with the new notes/sections added in the correct place).
- If the user says “apply/insert/add …”, create the updated full document and set `hasChanges`=true.
- Never return partial fragments when doing edits—return the whole updated doc so the editor can replace it.
- Keep reasoning short in `message`; do not reveal chain-of-thought.

2. Enforce JSON Schema

Use response_format: json_schema when calling the OpenAI Responses API:

{
  "name": "story_assistant_response",
  "schema": {
    "type": "object",
    "required": ["message", "isConversational", "hasChanges"],
    "properties": {
      "message": {"type": "string"},
      "isConversational": {"type": "boolean"},
      "hasChanges": {"type": "boolean"},
      "previewChanges": {"type": "string"}
    },
    "additionalProperties": false
  },
  "strict": true
}

3. Preserve Conversation Context

Send the last ~10 turns from chatMessages to the API (user/assistant pairs).

Slice the document to first ~3–4k chars and last ~2k chars if it’s large.

Also send metadata (title, url, editId) along with the request.

4. Implement Server Route

Create /api/story-assistant:

Sends the system prompt, document context, metadata, and chat history to OpenAI

Receives JSON output and returns:

{
  "success": true,
  "message": "...",
  "isConversational": true,
  "hasChanges": false,
  "previewChanges": "..."
}


Implementation Template:
(use Node/Express + openai package)

// server/routes/story-assistant.js
import express from 'express';
import OpenAI from 'openai';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helpers
const MAX_DOC_HEAD = 4000;
const MAX_DOC_TAIL = 2000;
function sliceDoc(doc = '') {
  if (doc.length <= MAX_DOC_HEAD + MAX_DOC_TAIL) return doc;
  const head = doc.slice(0, MAX_DOC_HEAD);
  const tail = doc.slice(-MAX_DOC_TAIL);
  return `${head}\n\n...[snip]...\n\n${tail}`;
}
function toChatHistory(chatMessages = []) {
  return chatMessages.map(m => ({
    role: m.type === 'user' ? 'user' : 'assistant',
    content: m.content
  }));
}

router.post('/', async (req, res) => {
  try {
    const { message, documentText = '', metadata = {}, chatHistory = [] } = req.body;

    const system = `...<insert system prompt from step 1>...`;

    const docContext = sliceDoc(documentText);
    const metaBlock = `Title: ${metadata?.title || 'Untitled'}\nURL: ${metadata?.url || ''}\nEditId: ${metadata?.editId || ''}`;

    const messages = [
      { role: 'system', content: system },
      { role: 'user', content: `DOCUMENT CONTEXT START\n${docContext}\nDOCUMENT CONTEXT END\n\nMETADATA\n${metaBlock}` },
      ...toChatHistory(chatHistory).slice(-10),
      { role: 'user', content: message }
    ];

    const response = await openai.responses.create({
      model: 'gpt-4.1-mini',
      messages,
      temperature: 0.5,
      max_output_tokens: 1200,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'story_assistant_response',
          schema: {
            type: 'object',
            required: ['message', 'isConversational', 'hasChanges'],
            properties: {
              message: { type: 'string' },
              isConversational: { type: 'boolean' },
              hasChanges: { type: 'boolean' },
              previewChanges: { type: 'string' }
            },
            additionalProperties: false
          },
          strict: true
        }
      }
    });

    const tool = response.output[0];
    const payload = tool?.content?.[0]?.text ? JSON.parse(tool.content[0].text) : null;

    if (!payload) {
      return res.status(500).json({ success: false, error: 'Malformed model output' });
    }

    return res.json({
      success: true,
      message: payload.message,
      isConversational: !!payload.isConversational,
      hasChanges: !!payload.hasChanges,
      previewChanges: payload.previewChanges || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

export default router;

5. Frontend Integration

In aiSidebar.jsx and ai-assistant.navitem.jsx, when calling the API:

body: JSON.stringify({
  message,
  documentText,
  metadata,
  chatHistory: this.state.chatMessages.map(m => ({
    type: m.type,
    content: m.content
  }))
})

6. Model Settings

Model: gpt-4.1 or gpt-4.1-mini

Temperature: 0.4–0.7

Max tokens: 1200–2000

Top-p: default

Streaming: optional

✅ Expected Result

The assistant can now answer deep contextual questions about the story.

It can also generate full-document edits on command.

UI receives consistent structured JSON, preventing crashes.

Overall UX feels like ChatGPT inside the story editor.