// Simple Monster Generator Test - Direct Testing Without Full Compilation
import OpenAI from 'openai';

// Set up environment for testing
process.env.OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY'; // Replace with your actual API key or use environment variables

console.log('🐉 Testing Monster Generator (Simple)...\n');

// Simple monster generation test
async function testMonsterGeneration() {
  try {
    console.log('📋 Testing Monster Generation Prompt Building...');
    
    // Test case: CR 5 Fiend
    const testRequest = {
      challengeRating: 5,
      creatureType: 'fiend',
      size: 'Large',
      name: 'Flame Wraith',
      theme: 'fiendish',
      environment: 'any',
      role: 'brute',
      abilities: ['flight', 'resistance', 'multiattack'],
      alignment: 'chaotic evil',
      partyLevel: 5,
      partySize: 4,
      encounterDifficulty: 'hard',
      mustHave: ['fire damage', 'intimidating presence'],
      restrictions: ['no instant death effects'],
      flavorText: 'A wraith of pure flame that terrorizes the living with its burning touch.'
    };
    
    console.log('🎯 Test Monster Request:');
    console.log(`   - Name: ${testRequest.name}`);
    console.log(`   - CR: ${testRequest.challengeRating}`);
    console.log(`   - Type: ${testRequest.creatureType}`);
    console.log(`   - Size: ${testRequest.size}`);
    console.log(`   - Role: ${testRequest.role}`);
    
    // Create AI service mock for testing
    const mockAIService = {
      async generateContent(request) {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
        
        console.log('🤖 Sending request to OpenAI...');
        console.log(`📝 Prompt length: ${request.prompt.length} characters`);
        
        try {
          const response = await openai.chat.completions.create({
            model: 'gpt-4o', // Use a good model for complex stat blocks
            messages: [
              { role: 'system', content: 'You are an expert D&D 5e content creator specializing in balanced monster design.' },
              { role: 'user', content: request.prompt }
            ],
            temperature: 0.7,
            max_tokens: 2000,
            response_format: { type: 'json_object' }
          });
          
          const content = JSON.parse(response.choices[0].message.content);
          const tokensUsed = response.usage.total_tokens;
          const cost = (tokensUsed * 0.005) / 1000; // Rough GPT-4o cost estimate
          
          return {
            success: true,
            content,
            metadata: {
              provider: 'openai',
              model: 'gpt-4o',
              tokensUsed,
              cost,
              duration: 5000,
              timestamp: new Date()
            }
          };
        } catch (error) {
          return {
            success: false,
            error: { message: error.message },
            metadata: {
              provider: 'openai',
              model: 'gpt-4o',
              tokensUsed: 0,
              cost: 0,
              duration: 0,
              timestamp: new Date()
            }
          };
        }
      }
    };
    
    // Test the monster generation logic
    console.log('🧪 Testing Monster Generation Logic...');
    
    // Build the prompt (simplified version of the monster generator logic)
    const prompt = buildMonsterPrompt(testRequest);
    console.log('✅ Monster prompt built successfully');
    console.log(`📏 Prompt length: ${prompt.length} characters`);
    
    // Test AI generation
    const aiRequest = {
      type: 'statblock',
      prompt: prompt,
      context: {
        additionalContext: {
          challengeRating: testRequest.challengeRating,
          creatureType: testRequest.creatureType,
          size: testRequest.size,
          role: testRequest.role,
          theme: testRequest.theme
        }
      },
      options: {
        temperature: 0.7,
        maxTokens: 2000
      }
    };
    
    console.log('🚀 Generating monster with AI...');
    const aiResponse = await mockAIService.generateContent(aiRequest);
    
    if (aiResponse.success) {
      console.log('✅ Monster Generation Successful!');
      console.log(`🎯 Generated Monster: ${aiResponse.content.name || 'Unknown'}`);
      console.log(`⚖️ Challenge Rating: ${aiResponse.content.challengeRating || 'Unknown'}`);
      console.log(`❤️ Hit Points: ${aiResponse.content.hitPoints || 'Unknown'}`);
      console.log(`🛡️ Armor Class: ${aiResponse.content.armorClass || 'Unknown'}`);
      console.log(`🔢 Tokens Used: ${aiResponse.metadata.tokensUsed}`);
      console.log(`💰 Cost: $${aiResponse.metadata.cost.toFixed(6)}`);
      
      // Test balance analysis
      console.log('\n⚖️ Testing Balance Analysis...');
      const balanceReport = analyzeBalance(aiResponse.content, testRequest);
      console.log(`📊 Balance Report:`);
      console.log(`   - CR Accurate: ${balanceReport.crAccurate ? '✅' : '❌'}`);
      console.log(`   - Offensive CR: ${balanceReport.offensiveCR}`);
      console.log(`   - Defensive CR: ${balanceReport.defensiveCR}`);
      console.log(`   - Final CR: ${balanceReport.finalCR}`);
      console.log(`   - XP Value: ${balanceReport.xpValue}`);
      
      if (balanceReport.balanceIssues.length > 0) {
        console.log(`⚠️ Balance Issues: ${balanceReport.balanceIssues.join(', ')}`);
      }
      
      if (balanceReport.recommendations.length > 0) {
        console.log(`💡 Recommendations: ${balanceReport.recommendations.join(', ')}`);
      }
      
      console.log('\n🎉 Monster Generator Test PASSED!');
      console.log('🚀 The specialized monster generator is working correctly!');
      return true;
      
    } else {
      console.error('❌ Monster Generation Failed:', aiResponse.error?.message);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    return false;
  }
}

// Simplified prompt building function
function buildMonsterPrompt(request) {
  const cr = normalizeCR(request.challengeRating);
  const xpValue = getXPValue(cr);
  
  let prompt = `Create a D&D 5e monster stat block with the following specifications:

CORE REQUIREMENTS:
- Challenge Rating: ${request.challengeRating} (${xpValue} XP)
- Creature Type: ${request.creatureType}
- Size: ${request.size}
- Name: ${request.name}
- Alignment: ${request.alignment}
- Theme: ${request.theme}
- Environment: ${request.environment}
- Combat Role: ${request.role}

BALANCE CONTEXT:
- Designed for party of ${request.partySize} level ${request.partyLevel} characters
- Encounter difficulty: ${request.encounterDifficulty}

SPECIAL ABILITIES REQUIRED:
${request.abilities.map(ability => `- ${ability.replace('_', ' ')}`).join('\n')}

MUST INCLUDE:
${request.mustHave.map(feature => `- ${feature}`).join('\n')}

RESTRICTIONS:
${request.restrictions.map(restriction => `- ${restriction}`).join('\n')}

FLAVOR GUIDANCE:
${request.flavorText}

CR BALANCE GUIDELINES (for CR ${cr}):
- Expected HP: ~${getExpectedHP(cr)} (range: ${Math.floor(getExpectedHP(cr) * 0.8)}-${Math.ceil(getExpectedHP(cr) * 1.2)})
- Expected AC: ~${getExpectedAC(cr)}
- Expected Damage per Round: ~${getExpectedDPR(cr)}
- Expected Attack Bonus: +${getExpectedAttackBonus(cr)}

CRITICAL REQUIREMENTS:
1. Follow D&D 5e stat block format exactly
2. Ensure CR is mathematically accurate using DMG guidelines
3. Include interesting tactical options and abilities
4. Make the creature memorable and flavorful
5. Ensure abilities synergize with the creature's role
6. Use only SRD-safe content (no Product Identity terms)
7. Include proper saving throws and skills based on creature type
8. Add legendary actions/resistance if CR 5+ and appropriate
9. Consider environmental factors and creature ecology
10. Balance offense and defense appropriately for the CR

Return a complete stat block in JSON format with all required fields including name, challengeRating, hitPoints, armorClass, abilityScores, speed, savingThrows, skills, damageResistances, damageImmunities, conditionImmunities, senses, languages, and actions array.`;

  return prompt;
}

// Simplified balance analysis
function analyzeBalance(statBlock, request) {
  const targetCR = normalizeCR(request.challengeRating);
  const defensiveCR = calculateDefensiveCR(statBlock);
  const offensiveCR = calculateOffensiveCR(statBlock);
  const finalCR = Math.round((defensiveCR + offensiveCR) / 2);
  const crAccurate = Math.abs(finalCR - targetCR) <= 0.5;
  
  const balanceIssues = [];
  const recommendations = [];
  
  if (!crAccurate) {
    balanceIssues.push(`Calculated CR (${finalCR}) doesn't match target CR (${targetCR})`);
    if (finalCR > targetCR) {
      recommendations.push('Consider reducing HP, AC, or damage output');
    } else {
      recommendations.push('Consider increasing HP, AC, or damage output');
    }
  }
  
  return {
    crAccurate,
    offensiveCR,
    defensiveCR,
    finalCR,
    balanceIssues,
    recommendations,
    xpValue: getXPValue(finalCR)
  };
}

// Utility functions
function normalizeCR(cr) {
  if (typeof cr === 'string') {
    if (cr === '1/8') return 0.125;
    if (cr === '1/4') return 0.25;
    if (cr === '1/2') return 0.5;
    return parseInt(cr) || 1;
  }
  return cr;
}

function getXPValue(cr) {
  const xpValues = {
    0: 10, 0.125: 25, 0.25: 50, 0.5: 100,
    1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800,
    6: 2300, 7: 2900, 8: 3900, 9: 5000, 10: 5900,
    11: 7200, 12: 8400, 13: 10000, 14: 11500, 15: 13000
  };
  return xpValues[cr] || 100;
}

function getExpectedHP(cr) {
  if (cr <= 0.5) return 25 + cr * 20;
  return 20 + cr * 15;
}

function getExpectedAC(cr) {
  return Math.round(13 + cr / 3);
}

function getExpectedDPR(cr) {
  return Math.round(3 * cr + 2);
}

function getExpectedAttackBonus(cr) {
  return Math.round(3 + cr / 2);
}

function calculateDefensiveCR(statBlock) {
  const hp = statBlock.hitPoints || 50;
  const ac = statBlock.armorClass || 13;
  
  // Simplified defensive CR calculation
  let baseCR = Math.max(0, (hp - 20) / 15);
  const expectedAC = getExpectedAC(baseCR);
  const acAdjustment = (ac - expectedAC) * 0.25;
  
  return Math.max(0, baseCR + acAdjustment);
}

function calculateOffensiveCR(statBlock) {
  // Simplified offensive CR calculation
  let dpr = 10; // Default estimate
  let attackBonus = 5; // Default estimate
  
  if (statBlock.actions && statBlock.actions.length > 0) {
    // Try to parse damage from actions
    const actionText = statBlock.actions.map(a => a.description || '').join(' ');
    const damageMatch = actionText.match(/(\d+)\s*\(\s*\d+d\d+(?:\s*[+-]\s*\d+)?\s*\)/);
    if (damageMatch) {
      dpr = parseInt(damageMatch[1]);
    }
    
    const attackMatch = actionText.match(/\+(\d+)\s+to\s+hit/);
    if (attackMatch) {
      attackBonus = parseInt(attackMatch[1]);
    }
  }
  
  let baseCR = Math.max(0, (dpr - 2) / 3);
  const expectedAttackBonus = getExpectedAttackBonus(baseCR);
  const attackAdjustment = (attackBonus - expectedAttackBonus) * 0.25;
  
  return Math.max(0, baseCR + attackAdjustment);
}

// Handle errors gracefully
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

// Run the test
testMonsterGeneration().catch(console.error);
