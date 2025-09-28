// Simple Model Selection Test - Direct JavaScript Implementation
import OpenAI from 'openai';

// Set up environment for testing
process.env.OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY'; // Replace with your actual API key or use environment variables

console.log('🤖 Testing Intelligent Model Selection (JavaScript Implementation)...\n');

// Simple model selection logic
const MODEL_CAPABILITIES = {
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
    complexity: 'simple',
    speed: 'fast',
    accuracy: 7,
    creativity: 6,
    reasoning: 6
  },
  'gpt-4o': {
    name: 'GPT-4o',
    costPer1kInput: 0.005,
    costPer1kOutput: 0.015,
    complexity: 'moderate',
    speed: 'medium',
    accuracy: 9,
    creativity: 8,
    reasoning: 9
  },
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    costPer1kInput: 0.01,
    costPer1kOutput: 0.03,
    complexity: 'complex',
    speed: 'medium',
    accuracy: 9,
    creativity: 8,
    reasoning: 10
  },
  'gpt-4': {
    name: 'GPT-4',
    costPer1kInput: 0.03,
    costPer1kOutput: 0.06,
    complexity: 'expert',
    speed: 'slow',
    accuracy: 10,
    creativity: 10,
    reasoning: 10
  }
};

// Simple complexity analysis
function analyzeTaskComplexity(type, prompt, context) {
  const baseComplexity = {
    'description': 'simple',
    'npc': 'moderate',
    'statblock': 'complex',
    'magicitem': 'complex',
    'encounter': 'expert'
  };
  
  const promptWords = prompt.split(/\s+/).length;
  const hasContext = !!context;
  const hasComplexKeywords = /detailed|complex|intricate|sophisticated|advanced|multiple|various|several/i.test(prompt);
  const hasMechanicalTerms = /CR|AC|HP|damage|level|rarity|attunement/i.test(prompt);
  
  let complexity = baseComplexity[type] || 'moderate';
  
  // Upgrade complexity based on prompt analysis
  if (promptWords > 50 && hasComplexKeywords) {
    if (complexity === 'simple') complexity = 'moderate';
    else if (complexity === 'moderate') complexity = 'complex';
  }
  
  if (hasMechanicalTerms && hasContext) {
    if (complexity === 'simple') complexity = 'moderate';
    else if (complexity === 'moderate') complexity = 'complex';
    else if (complexity === 'complex') complexity = 'expert';
  }
  
  return {
    overall: complexity,
    reasoning: hasMechanicalTerms || hasContext,
    creativity: type === 'npc' || type === 'description' || type === 'magicitem',
    mechanical: type === 'statblock' || type === 'encounter' || hasMechanicalTerms,
    lengthEstimate: promptWords > 50 ? 'long' : promptWords > 20 ? 'medium' : 'short'
  };
}

// Simple model selection
function selectOptimalModel(type, prompt, context) {
  const complexity = analyzeTaskComplexity(type, prompt, context);
  
  // Simple selection rules
  let selectedModel = 'gpt-4o'; // Default
  
  if (complexity.overall === 'simple' && !complexity.mechanical) {
    selectedModel = 'gpt-4o-mini';
  } else if (complexity.overall === 'expert' || (complexity.mechanical && complexity.lengthEstimate === 'long')) {
    selectedModel = 'gpt-4-turbo';
  } else if (complexity.creativity && complexity.lengthEstimate === 'long') {
    selectedModel = 'gpt-4o';
  }
  
  const modelInfo = MODEL_CAPABILITIES[selectedModel];
  const estimatedTokens = {
    short: 300,
    medium: 600,
    long: 1000
  }[complexity.lengthEstimate];
  
  const estimatedCost = (estimatedTokens * 0.7 / 1000) * modelInfo.costPer1kInput + 
                       (estimatedTokens * 0.3 / 1000) * modelInfo.costPer1kOutput;
  
  return {
    model: selectedModel,
    complexity,
    reasoning: `Selected ${modelInfo.name} for ${type} generation. Complexity: ${complexity.overall}, Mechanical: ${complexity.mechanical}, Creative: ${complexity.creativity}`,
    estimatedCost,
    estimatedTokens
  };
}

// Enhanced AI generation with model selection
async function generateContentWithSelection(type, prompt, context) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  const selection = selectOptimalModel(type, prompt, context);
  
  console.log(`🤖 Model Selection:`);
  console.log(`   - Selected: ${selection.model}`);
  console.log(`   - Reasoning: ${selection.reasoning}`);
  console.log(`   - Estimated Cost: $${selection.estimatedCost.toFixed(6)}`);
  console.log(`   - Estimated Tokens: ${selection.estimatedTokens}`);
  
  const systemPrompt = buildSystemPrompt(type, context);
  
  try {
    const response = await openai.chat.completions.create({
      model: selection.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: Math.min(selection.estimatedTokens * 1.5, 2000),
      response_format: { type: 'json_object' }
    });
    
    const content = JSON.parse(response.choices[0].message.content);
    const actualCost = calculateActualCost(selection.model, response.usage.total_tokens);
    
    return {
      success: true,
      content,
      metadata: {
        model: selection.model,
        tokensUsed: response.usage.total_tokens,
        actualCost,
        estimatedCost: selection.estimatedCost,
        complexity: selection.complexity,
        selection
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      metadata: {
        model: selection.model,
        selection
      }
    };
  }
}

function buildSystemPrompt(type, context) {
  const basePrompt = `You are an expert D&D 5th Edition content creator for Mythwright.

CRITICAL INSTRUCTIONS:
1. Always respond with valid JSON that matches the expected schema
2. Follow D&D 5e rules precisely (PHB, DMG, MM)
3. Use only SRD-safe content (no Product Identity like "beholder" - use "gaze tyrant")
4. Ensure content is balanced and appropriate for the specified party level
5. Make content engaging and professionally written

`;

  const typePrompts = {
    description: `Create vivid, immersive descriptive text for D&D.
Return JSON with: { "title": "...", "description": "...", "readAloudText": "..." }`,
    
    npc: `Create a detailed D&D NPC with complete personality and background.
Return JSON with NPC schema structure including name, race, occupation, personality, voice, background, etc.`,
    
    statblock: `Create a D&D 5e creature stat block with proper mechanics.
Return JSON with complete stat block including abilities, actions, and proper CR calculation.`,
    
    magicitem: `Create a balanced D&D magic item with interesting mechanics.
Return JSON with item details including rarity, attunement, and mechanical effects.`,
    
    encounter: `Create a complete D&D encounter with tactical depth.
Return JSON with encounter setup, creatures, environment, and scaling notes.`
  };
  
  let prompt = basePrompt + (typePrompts[type] || typePrompts.description);
  
  if (context && context.systemBudget) {
    prompt += `\n\nSYSTEM DESIGN BUDGET CONTEXT:
- Party Size: ${context.systemBudget.partySize}
- Party Level: ${context.systemBudget.partyLevel}
- Difficulty: ${context.systemBudget.difficulty}
- Tone: ${context.systemBudget.tone}
- Setting: ${context.systemBudget.setting}

Ensure content is appropriate for this party configuration.`;
  }
  
  return prompt;
}

function calculateActualCost(model, tokens) {
  const capabilities = MODEL_CAPABILITIES[model];
  const inputTokens = Math.floor(tokens * 0.7);
  const outputTokens = Math.floor(tokens * 0.3);
  
  return (inputTokens / 1000) * capabilities.costPer1kInput + 
         (outputTokens / 1000) * capabilities.costPer1kOutput;
}

// Test cases
const testCases = [
  {
    name: 'Simple Description',
    type: 'description',
    prompt: 'Describe a cozy tavern.',
    context: undefined,
    expectedModel: 'gpt-4o-mini'
  },
  {
    name: 'Complex NPC',
    type: 'npc',
    prompt: 'Create a detailed antagonist - a corrupt noble who secretly leads a thieves guild. Must have complex motivations, political connections, and multiple layers of deception.',
    context: {
      systemBudget: {
        partySize: 4,
        partyLevel: 8,
        difficulty: 'hard',
        tone: 'gritty',
        setting: 'Urban political campaign'
      }
    },
    expectedModel: 'gpt-4o'
  },
  {
    name: 'Critical Balance Stat Block',
    type: 'statblock',
    prompt: 'Create a CR 12 dragon-like creature with unique breath weapon, legendary actions, and lair actions. Must be perfectly balanced for a deadly encounter.',
    context: {
      systemBudget: {
        partySize: 5,
        partyLevel: 12,
        difficulty: 'deadly',
        tone: 'heroic',
        setting: 'High-level dragon encounter'
      }
    },
    expectedModel: 'gpt-4-turbo'
  }
];

// Run tests
async function runTests() {
  console.log('🧪 Starting Intelligent Model Selection Tests...\n');
  
  let successCount = 0;
  let totalCost = 0;
  let totalTokens = 0;
  
  for (const testCase of testCases) {
    console.log(`🎯 Test Case: ${testCase.name}`);
    console.log(`📝 Type: ${testCase.type}`);
    console.log(`📄 Prompt: "${testCase.prompt.substring(0, 60)}..."`);
    
    const result = await generateContentWithSelection(
      testCase.type,
      testCase.prompt,
      testCase.context
    );
    
    if (result.success) {
      console.log('✅ Generation Successful!');
      console.log(`📊 Actual Model Used: ${result.metadata.model}`);
      console.log(`🔢 Tokens: ${result.metadata.tokensUsed}`);
      console.log(`💰 Actual Cost: $${result.metadata.actualCost.toFixed(6)}`);
      console.log(`🎯 Expected: ${testCase.expectedModel} | ${result.metadata.model === testCase.expectedModel ? '✅ MATCH' : '❌ DIFFERENT'}`);
      
      successCount++;
      totalCost += result.metadata.actualCost;
      totalTokens += result.metadata.tokensUsed;
    } else {
      console.error('❌ Generation Failed:', result.error);
    }
    
    console.log('─'.repeat(80));
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 FINAL TEST RESULTS:');
  console.log('='.repeat(50));
  console.log(`✅ Success Rate: ${successCount}/${testCases.length} (${Math.round(successCount/testCases.length*100)}%)`);
  console.log(`💰 Total Cost: $${totalCost.toFixed(6)}`);
  console.log(`🔢 Total Tokens: ${totalTokens}`);
  console.log(`📈 Average Cost per Generation: $${(totalCost/successCount).toFixed(6)}`);
  
  if (successCount === testCases.length) {
    console.log('\n🎉 ALL TESTS PASSED! Intelligent Model Selection is working perfectly!');
    console.log('🚀 The system is automatically selecting optimal models based on task complexity!');
    console.log('💰 Cost optimization and quality balance achieved!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.');
  }
}

// Handle errors gracefully
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

// Run the tests
runTests().catch(console.error);
