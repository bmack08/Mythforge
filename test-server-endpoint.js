// Test the server endpoint directly
import express from 'express';

const app = express();
app.use(express.json());

// Test campaign generation endpoint
app.post('/api/mythwright/generate', async (req, res) => {
  console.log('📥 Received campaign generation request');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    // Import the API function and call it
    const apiModule = await import('./server/homebrew.api.js');
    const api = apiModule.default;
    await api.generateCampaign(req, res);
  } catch (error) {
    console.error('❌ Campaign generation failed:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Campaign generation failed',
      details: error.message
    });
  }
});

const port = 3333;
app.listen(port, () => {
  console.log(`🚀 Test server running on http://localhost:${port}`);
  console.log('📝 Test with:');
  console.log(`curl -X POST http://localhost:${port}/api/mythwright/generate \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"title":"Test Adventure","level":"low","adventureType":"dungeon","theme":"classic-fantasy","partySize":4,"sessionCount":1,"complexity":"moderate"}'`);
});