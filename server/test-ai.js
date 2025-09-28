// Simple test script for AI service
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set environment variables directly for testing
process.env.OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY'; // Replace with your actual API key or use environment variables
process.env.OPENAI_DEFAULT_MODEL = 'gpt-4o-mini'; // Use cheaper model for testing
process.env.OPENAI_MAX_TOKENS = '1000';
process.env.OPENAI_TEMPERATURE = '0.8';

console.log('🚀 Testing Mythwright AI Service...\n');

// Test basic OpenAI connection
async function testOpenAIConnection() {
  console.log('📡 Testing OpenAI connection...');
  
  try {
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Respond with JSON.' },
        { role: 'user', content: 'Generate a simple test response with the format: {"test": true, "message": "Hello from OpenAI!"}' }
      ],
      max_tokens: 100,
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    console.log('✅ OpenAI connection successful!');
    console.log('📊 Response:', result);
    console.log('🔢 Tokens used:', response.usage?.total_tokens || 0);
    console.log('💰 Estimated cost: $' + ((response.usage?.total_tokens || 0) / 1000 * 0.00015).toFixed(6));
    
    return true;
  } catch (error) {
    console.error('❌ OpenAI connection failed:', error.message);
    return false;
  }
}

// Test AI service for D&D content generation
async function testAIService() {
  console.log('\n🎲 Testing D&D Content Generation...');
  
  try {
    // Dynamic import to handle ES modules
    const { aiService } = await import('./services/ai/index.js');
    
    // Test generating a simple NPC
    console.log('👥 Generating test NPC...');
    const npcResponse = await aiService.generateNPC(
      'Create a friendly tavern keeper named Gareth who serves adventurers in a small village.',
      {
        systemBudget: {
          partySize: 4,
          partyLevel: 3,
          difficulty: 'medium',
          encounterIntensity: 'medium',
          restFrequency: 'standard',
          combatWeight: 40,
          explorationWeight: 30,
          socialWeight: 30,
          treasureLevel: 'standard',
          magicPrevalence: 'normal',
          treasurePace: 'standard',
          tone: 'balanced',
          themes: ['village', 'tavern'],
          setting: 'Small farming village',
          targetLength: 'medium',
          complexity: 'medium'
        }
      },
      {
        model: 'gpt-4o-mini',
        temperature: 0.8,
        maxTokens: 1000
      }
    );
    
    if (npcResponse.success) {
      console.log('✅ NPC generation successful!');
      console.log('📊 Generated NPC:', JSON.stringify(npcResponse.content, null, 2));
      console.log('🔢 Tokens used:', npcResponse.metadata.tokensUsed);
      console.log('💰 Cost: $' + npcResponse.metadata.cost.toFixed(6));
      console.log('⏱️ Duration:', npcResponse.metadata.duration + 'ms');
    } else {
      console.error('❌ NPC generation failed:', npcResponse.error);
    }
    
    return npcResponse.success;
  } catch (error) {
    console.error('❌ AI Service test failed:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Starting AI Service Tests...\n');
  
  const connectionTest = await testOpenAIConnection();
  if (!connectionTest) {
    console.log('\n❌ Basic connection test failed. Stopping tests.');
    return;
  }
  
  const serviceTest = await testAIService();
  
  console.log('\n📊 Test Results:');
  console.log('- OpenAI Connection:', connectionTest ? '✅ PASS' : '❌ FAIL');
  console.log('- AI Service:', serviceTest ? '✅ PASS' : '❌ FAIL');
  
  if (connectionTest && serviceTest) {
    console.log('\n🎉 All tests passed! AI service is ready for D&D content generation.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.');
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Run the tests
runTests().catch(console.error);
