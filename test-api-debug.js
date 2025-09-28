// Quick test to debug the API issue
import { ContentGenerationOrchestrator } from './server/services/ai/content-generation-orchestrator.js';
import { validateCampaignParameters } from './server/services/ai/campaign-types.js';
import { AIService } from './server/services/ai/index.js';

async function testCampaignGeneration() {
  console.log('🧪 Testing campaign generation with real AI...');
  
  const testParams = {
    title: 'Test Adventure',
    level: 'low',
    adventureType: 'dungeon',
    theme: 'classic-fantasy',
    partySize: 4,
    sessionCount: 3,
    complexity: 'moderate',
    playerExperience: 'mixed',
    goals: ['combat', 'exploration'],
    budgetPreferences: {
      combatWeight: 50,
      explorationWeight: 30,
      socialWeight: 20,
      treasureLevel: 'standard',
      difficultyVariance: 'moderate'
    },
    budgetCalculation: {
      totalXPBudget: 18000,
      xpPerSession: 6000,
      partyLevel: 3,
      combatBudget: 9000,
      explorationBudget: 5400,
      socialBudget: 3600
    },
    writingStyleRules: './server/services/ai/writing-style-rules.json'
  };

  console.log('📝 Validating parameters...');
  const validationErrors = validateCampaignParameters(testParams);
  if (validationErrors.length > 0) {
    console.error('❌ Validation errors:', validationErrors);
    return;
  }
  console.log('✅ Parameters valid');

  // Test AI service connection first
  try {
    console.log('🔌 Testing AI service connection...');
    const aiService = new AIService();
    const testResponse = await aiService.generateContent({
      type: 'custom',
      prompt: 'Say "Hello from AI!"',
      options: { temperature: 0.1, maxTokens: 10 }
    });
    console.log('✅ AI service connected:', testResponse.content);
  } catch (aiError) {
    console.error('❌ AI service connection failed:', aiError.message);
    console.log('📝 Using mock mode instead...');
  }

  try {
    console.log('🤖 Creating orchestrator...');
    const orchestrator = new ContentGenerationOrchestrator();
    
    console.log('⚡ Generating campaign...');
    const result = await orchestrator.generateCampaign(testParams);
    
    console.log('✨ Generation successful!');
    console.log('Title:', result.title);
    console.log('Chapters:', result.chapters.length);
    console.log('Total content length:', result.coverPage.length + result.chapters.reduce((sum, ch) => sum + ch.content.length, 0));
    
  } catch (error) {
    console.error('💥 Generation failed:', error);
    console.error('Stack:', error.stack);
  }
}

testCampaignGeneration();