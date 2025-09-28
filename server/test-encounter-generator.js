// Test Encounter Generator - Comprehensive Testing of D&D Encounter Balancing with XP Budget Math
import OpenAI from 'openai';

// Set up environment for testing
process.env.OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY'; // Replace with your actual API key or use environment variables

console.log('⚔️ Testing Mythwright Encounter Generator...\n');

// Test cases covering different encounter types and difficulties
const testCases = [
  {
    name: 'Medium Combat Encounter',
    request: {
      name: 'Goblin Ambush',
      encounterType: 'combat',
      difficulty: 'medium',
      partyLevel: 3,
      partySize: 4,
      primaryObjective: 'eliminate_enemies',
      terrain: 'forest',
      environment: 'outdoor',
      monsterTypes: ['humanoid'],
      tacticalComplexity: 'moderate',
      cover: 'partial',
      elevation: true,
      theme: 'ambush',
      narrative: 'Goblins have set up an ambush along a forest path, using trees and elevation for tactical advantage.',
      mustInclude: ['ranged attacks', 'tactical positioning', 'environmental cover']
    },
    expectedFeatures: ['goblin', 'ambush tactics', 'forest terrain', 'cover']
  },
  {
    name: 'Hard Boss Encounter',
    request: {
      encounterType: 'combat',
      difficulty: 'hard',
      partyLevel: 8,
      partySize: 5,
      primaryObjective: 'eliminate_enemies',
      secondaryObjectives: ['protect_target'],
      terrain: 'dungeon',
      environment: 'indoor',
      monsterTypes: ['fiend', 'undead'],
      boss: true,
      minions: true,
      tacticalComplexity: 'complex',
      hazards: true,
      cover: 'mixed',
      theme: 'cult_ritual',
      narrative: 'A powerful cult leader is conducting a dark ritual, protected by undead minions and environmental hazards.',
      mustInclude: ['boss monster', 'minion support', 'ritual mechanics', 'environmental hazards'],
      restrictions: ['no instant death effects']
    },
    expectedFeatures: ['boss monster', 'minions', 'ritual', 'hazards']
  },
  {
    name: 'Deadly High-Level Encounter',
    request: {
      name: 'Dragon\'s Lair Assault',
      encounterType: 'combat',
      difficulty: 'deadly',
      partyLevel: 15,
      partySize: 4,
      primaryObjective: 'eliminate_enemies',
      secondaryObjectives: ['survive_duration', 'reach_destination'],
      terrain: 'cave',
      environment: 'underground',
      monsterTypes: ['dragon', 'construct'],
      boss: true,
      elites: true,
      tacticalComplexity: 'advanced',
      hazards: true,
      cover: 'three_quarters',
      elevation: true,
      specialFeatures: ['lair actions', 'legendary resistance', 'breath weapon'],
      theme: 'dragon_lair',
      narrative: 'The ancient red dragon defends its lair with magical constructs and environmental hazards.',
      mustInclude: ['dragon boss', 'lair actions', 'legendary actions', 'breath weapon', 'treasure hoard'],
      crRange: { min: 10, max: 17 }
    },
    expectedFeatures: ['dragon', 'lair actions', 'legendary actions', 'breath weapon', 'constructs']
  },
  {
    name: 'Easy Mixed Encounter',
    request: {
      name: 'Merchant Negotiation',
      encounterType: 'mixed',
      difficulty: 'easy',
      partyLevel: 5,
      partySize: 4,
      primaryObjective: 'negotiate',
      secondaryObjectives: ['gather_information'],
      terrain: 'urban',
      environment: 'indoor',
      monsterTypes: ['humanoid'],
      tacticalComplexity: 'simple',
      theme: 'political_intrigue',
      narrative: 'A tense negotiation with a merchant that could turn violent if handled poorly.',
      mustInclude: ['social mechanics', 'negotiation options', 'potential combat', 'information gathering'],
      restrictions: ['no deadly violence unless provoked']
    },
    expectedFeatures: ['negotiation', 'social encounter', 'merchant', 'information']
  }
];

// Test encounter generation with comprehensive analysis
async function testEncounterGeneration() {
  console.log('🧪 Starting Encounter Generator Tests...\n');
  
  try {
    let successCount = 0;
    let totalCost = 0;
    let totalTokens = 0;
    const results = [];
    
    for (const testCase of testCases) {
      console.log(`🎯 Test Case: ${testCase.name}`);
      console.log(`⚔️ Type: ${testCase.request.encounterType}, Difficulty: ${testCase.request.difficulty}`);
      console.log(`🎲 Level: ${testCase.request.partyLevel}, Party Size: ${testCase.request.partySize}`);
      console.log(`🌍 Terrain: ${testCase.request.terrain}, Environment: ${testCase.request.environment}`);
      
      try {
        const startTime = Date.now();
        
        // Create AI service mock for testing
        const mockAIService = {
          async generateContent(request) {
            const openai = new OpenAI({
              apiKey: process.env.OPENAI_API_KEY
            });
            
            console.log('🤖 Sending Encounter request to OpenAI...');
            console.log(`📝 Prompt length: ${request.prompt.length} characters`);
            
            try {
              const response = await openai.chat.completions.create({
                model: 'gpt-4o', // Use good model for complex encounters
                messages: [
                  { role: 'system', content: 'You are an expert D&D 5e encounter designer specializing in balanced, engaging encounters that challenge players while maintaining fair play and tactical depth.' },
                  { role: 'user', content: request.prompt }
                ],
                temperature: 0.7,
                max_tokens: 2500,
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
                  duration: Date.now() - startTime,
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
                  duration: Date.now() - startTime,
                  timestamp: new Date()
                }
              };
            }
          }
        };
        
        // Build encounter prompt
        const prompt = buildEncounterPrompt(testCase.request);
        
        // Generate encounter using AI
        const aiRequest = {
          type: 'encounter',
          prompt: prompt,
          context: {
            additionalContext: {
              encounterType: testCase.request.encounterType,
              difficulty: testCase.request.difficulty,
              partyLevel: testCase.request.partyLevel,
              partySize: testCase.request.partySize,
              xpBudget: calculateXPBudget(testCase.request),
              terrain: testCase.request.terrain
            }
          },
          options: {
            temperature: 0.7,
            maxTokens: 2500
          }
        };
        
        const aiResponse = await mockAIService.generateContent(aiRequest);
        const duration = Date.now() - startTime;
        
        if (aiResponse.success) {
          console.log('✅ Encounter Generation Successful!');
          console.log(`⏱️ Generation Time: ${duration}ms`);
          
          // Analyze the generated encounter
          const analysis = analyzeGeneratedEncounter(aiResponse.content, testCase);
          console.log('📋 Encounter Analysis:');
          console.log(`   - Name: ${aiResponse.content.name || 'Generated Encounter'}`);
          console.log(`   - Monster Count: ${getMonsterCount(aiResponse.content)}`);
          console.log(`   - Balance Score: ${analysis.balanceScore}/100`);
          console.log(`   - XP Accuracy: ${analysis.xpAccuracy}/100`);
          console.log(`   - Feature Match: ${analysis.featureMatchScore}/100`);
          
          // Show monsters
          if (aiResponse.content.monsters && aiResponse.content.monsters.length > 0) {
            const monsterList = aiResponse.content.monsters.map(m => 
              `${m.quantity || 1}x ${m.name} (CR ${m.challengeRating || '?'})`
            ).join(', ');
            console.log(`🐉 Monsters: ${monsterList}`);
          }
          
          // Show objectives
          if (aiResponse.content.objectives) {
            const objectives = Array.isArray(aiResponse.content.objectives) ? 
              aiResponse.content.objectives : [aiResponse.content.objectives];
            console.log(`🎯 Objectives: ${objectives.slice(0, 2).join(', ')}`);
          }
          
          // Show description excerpt
          if (aiResponse.content.description) {
            console.log(`📖 Description: ${aiResponse.content.description.substring(0, 120)}...`);
          }
          
          // Perform XP validation
          const xpValidation = performXPValidation(aiResponse.content, testCase.request);
          console.log('💰 XP Budget Validation:');
          console.log(`   - Target XP: ${xpValidation.targetXP}`);
          console.log(`   - Calculated XP: ${xpValidation.calculatedXP}`);
          console.log(`   - Adjusted XP: ${xpValidation.adjustedXP}`);
          console.log(`   - Budget Accuracy: ${xpValidation.accurate ? '✅' : '❌'}`);
          console.log(`   - Budget Used: ${xpValidation.budgetUsed.toFixed(1)}%`);
          
          if (xpValidation.issues.length > 0) {
            console.log(`⚠️ XP Issues: ${xpValidation.issues.slice(0, 2).join(', ')}`);
          }
          
          // Track metadata
          totalCost += aiResponse.metadata.cost || 0;
          totalTokens += aiResponse.metadata.tokensUsed || 0;
          
          results.push({
            testCase: testCase.name,
            success: true,
            analysis,
            xpValidation,
            duration,
            encounter: aiResponse.content
          });
          
          successCount++;
          
        } else {
          console.error('❌ Encounter Generation Failed:', aiResponse.error?.message);
          results.push({
            testCase: testCase.name,
            success: false,
            error: aiResponse.error?.message
          });
        }
        
      } catch (error) {
        console.error('❌ Encounter Generation Failed:', error.message);
        results.push({
          testCase: testCase.name,
          success: false,
          error: error.message
        });
      }
      
      console.log('─'.repeat(80));
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Generate comprehensive report
    generateEncounterTestReport(results, successCount, testCases.length, totalCost, totalTokens);
    
    return successCount === testCases.length;
    
  } catch (error) {
    console.error('❌ Encounter Generator Test Failed:', error.message);
    return false;
  }
}

// Calculate XP budget for encounter
function calculateXPBudget(request) {
  const xpThresholds = {
    1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
    3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
    5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
    8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
    15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 }
  };
  
  const thresholds = xpThresholds[request.partyLevel] || xpThresholds[5];
  return thresholds[request.difficulty] * request.partySize;
}

// Build encounter prompt (simplified version)
function buildEncounterPrompt(request) {
  const xpBudget = calculateXPBudget(request);
  const xpThresholds = {
    1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
    3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
    5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
    8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
    15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 }
  };
  
  const thresholds = xpThresholds[request.partyLevel] || xpThresholds[5];
  
  let prompt = `Create a D&D 5e encounter with precise XP budget balance:

CORE REQUIREMENTS:
- Encounter Type: ${request.encounterType}
- Difficulty: ${request.difficulty}
- XP Budget: ${xpBudget} XP`;

  if (request.name) prompt += `\n- Name: ${request.name}`;

  prompt += `\n\nPARTY CONFIGURATION:`;
  prompt += `\n- Party Level: ${request.partyLevel}`;
  prompt += `\n- Party Size: ${request.partySize}`;
  prompt += `\n- Primary Objective: ${request.primaryObjective}`;

  if (request.secondaryObjectives && request.secondaryObjectives.length > 0) {
    prompt += `\n- Secondary Objectives: ${request.secondaryObjectives.join(', ')}`;
  }

  prompt += `\n\nENVIRONMENT:`;
  prompt += `\n- Terrain: ${request.terrain}`;
  prompt += `\n- Environment Type: ${request.environment}`;
  prompt += `\n- Tactical Complexity: ${request.tacticalComplexity}`;

  if (request.cover) prompt += `\n- Cover Available: ${request.cover}`;
  if (request.elevation) prompt += `\n- Elevation Changes: Yes`;
  if (request.hazards) prompt += `\n- Environmental Hazards: Yes`;

  if (request.monsterTypes || request.boss || request.minions || request.elites) {
    prompt += `\n\nMONSTER REQUIREMENTS:`;
    
    if (request.monsterTypes && request.monsterTypes.length > 0) {
      prompt += `\n- Preferred Types: ${request.monsterTypes.join(', ')}`;
    }
    
    if (request.boss) prompt += `\n- Include Boss Monster: Yes`;
    if (request.elites) prompt += `\n- Include Elite Monsters: Yes`;
    if (request.minions) prompt += `\n- Include Minion Monsters: Yes`;
    
    if (request.crRange) {
      prompt += `\n- CR Range: ${request.crRange.min} to ${request.crRange.max}`;
    }
  }

  prompt += `\n\nXP BUDGET GUIDELINES:`;
  prompt += `\n- Target XP Budget: ${xpBudget}`;
  prompt += `\n- Difficulty Thresholds (per character):`;
  prompt += `\n  • Easy: ${thresholds.easy} XP`;
  prompt += `\n  • Medium: ${thresholds.medium} XP`;
  prompt += `\n  • Hard: ${thresholds.hard} XP`;
  prompt += `\n  • Deadly: ${thresholds.deadly} XP`;
  prompt += `\n- Party Total Thresholds:`;
  prompt += `\n  • Easy: ${thresholds.easy * request.partySize} XP`;
  prompt += `\n  • Medium: ${thresholds.medium * request.partySize} XP`;
  prompt += `\n  • Hard: ${thresholds.hard * request.partySize} XP`;
  prompt += `\n  • Deadly: ${thresholds.deadly * request.partySize} XP`;

  prompt += `\n\nENCOUNTER MULTIPLIER GUIDANCE:`;
  prompt += `\n- 1 monster: x1 multiplier`;
  prompt += `\n- 2 monsters: x1.5 multiplier`;
  prompt += `\n- 3-6 monsters: x2-2.5 multiplier`;
  prompt += `\n- 7-10 monsters: x3-3.5 multiplier`;
  prompt += `\n- Formula: (Total Base XP × Multiplier) should equal target XP budget`;

  if (request.theme) {
    prompt += `\n\nTHEME & NARRATIVE:`;
    prompt += `\n- Theme: ${request.theme}`;
  }

  if (request.narrative) {
    prompt += `\n- Narrative Context: ${request.narrative}`;
  }

  if (request.specialFeatures && request.specialFeatures.length > 0) {
    prompt += `\n- Special Features: ${request.specialFeatures.join(', ')}`;
  }

  if (request.mustInclude && request.mustInclude.length > 0) {
    prompt += `\n\nMUST INCLUDE:`;
    request.mustInclude.forEach(requirement => {
      prompt += `\n- ${requirement}`;
    });
  }

  if (request.restrictions && request.restrictions.length > 0) {
    prompt += `\n\nRESTRICTIONS:`;
    request.restrictions.forEach(restriction => {
      prompt += `\n- ${restriction}`;
    });
  }

  prompt += `\n\nCRITICAL REQUIREMENTS:
1. Follow D&D 5e encounter building rules exactly
2. Ensure XP budget matches difficulty precisely using DMG guidelines
3. Include specific monster stat blocks or references
4. Provide detailed tactical map description
5. Balance action economy between party and monsters
6. Create engaging tactical challenges with counterplay options
7. Use only SRD-safe content (no Product Identity terms)
8. Include initiative order and round-by-round guidance
9. Consider resource management and attrition
10. Ensure encounter serves narrative purpose

Return a complete encounter in JSON format with: name, description, monsters (array with name, challengeRating, quantity), environment, objectives, tactics, and XP calculations.`;

  return prompt;
}

// Get monster count from encounter
function getMonsterCount(encounter) {
  if (!encounter.monsters || !Array.isArray(encounter.monsters)) return 0;
  return encounter.monsters.reduce((sum, monster) => sum + (monster.quantity || 1), 0);
}

// Analyze generated encounter quality
function analyzeGeneratedEncounter(encounter, testCase) {
  let balanceScore = 100;
  let xpAccuracy = 100;
  let featureMatchScore = 100;

  // Check basic completeness
  if (!encounter.name) balanceScore -= 15;
  if (!encounter.description) balanceScore -= 20;
  if (!encounter.monsters || encounter.monsters.length === 0) balanceScore -= 30;
  if (!encounter.environment) balanceScore -= 15;
  if (!encounter.objectives) balanceScore -= 15;

  // Check XP budget accuracy
  const xpValidation = performXPValidation(encounter, testCase.request);
  const budgetDeviation = Math.abs(xpValidation.budgetUsed - 100);
  if (budgetDeviation > 20) {
    xpAccuracy -= budgetDeviation > 50 ? 50 : 25;
  }

  // Feature matching analysis
  const expectedFeatures = testCase.expectedFeatures || [];
  const encounterText = JSON.stringify(encounter).toLowerCase();
  
  let matchedFeatures = 0;
  for (const feature of expectedFeatures) {
    if (encounterText.includes(feature.toLowerCase().replace(' ', ''))) {
      matchedFeatures++;
    }
  }

  if (expectedFeatures.length > 0) {
    featureMatchScore = Math.round((matchedFeatures / expectedFeatures.length) * 100);
  }

  // Check must-include requirements
  if (testCase.request.mustInclude) {
    for (const requirement of testCase.request.mustInclude) {
      if (!encounterText.includes(requirement.toLowerCase())) {
        featureMatchScore -= 15;
      }
    }
  }

  return {
    balanceScore: Math.max(0, Math.min(100, balanceScore)),
    xpAccuracy: Math.max(0, Math.min(100, xpAccuracy)),
    featureMatchScore: Math.max(0, Math.min(100, featureMatchScore)),
    matchedFeatures,
    totalFeatures: expectedFeatures.length
  };
}

// Perform XP validation
function performXPValidation(encounter, request) {
  const targetXP = calculateXPBudget(request);
  
  // Calculate base XP from monsters
  let calculatedXP = 0;
  let totalMonsters = 0;
  
  const crToXP = {
    0: 10, 0.125: 25, 0.25: 50, 0.5: 100,
    1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800,
    6: 2300, 7: 2900, 8: 3900, 9: 5000, 10: 5900,
    11: 7200, 12: 8400, 13: 10000, 14: 11500, 15: 13000,
    16: 15000, 17: 18000, 18: 20000, 19: 22000, 20: 25000
  };
  
  if (encounter.monsters && Array.isArray(encounter.monsters)) {
    encounter.monsters.forEach(monster => {
      const cr = monster.challengeRating || 1;
      const quantity = monster.quantity || 1;
      const xp = crToXP[cr] || 200;
      calculatedXP += xp * quantity;
      totalMonsters += quantity;
    });
  }
  
  // Apply encounter multiplier
  const encounterMultipliers = {
    1: 1, 2: 1.5, 3: 2, 4: 2, 5: 2.5, 6: 2.5, 7: 3, 8: 3, 9: 3.5, 10: 3.5,
    11: 4, 12: 4, 13: 4.5, 14: 4.5, 15: 5
  };
  
  let multiplier = encounterMultipliers[Math.min(totalMonsters, 15)] || 5;
  
  // Adjust for party size
  if (request.partySize < 3) multiplier *= 1.5;
  else if (request.partySize > 5) multiplier *= 0.5;
  
  const adjustedXP = calculatedXP * multiplier;
  const budgetUsed = (adjustedXP / targetXP) * 100;
  const accurate = Math.abs(budgetUsed - 100) <= 25; // Within 25% is acceptable
  
  const issues = [];
  if (!accurate) {
    if (budgetUsed < 75) {
      issues.push(`Encounter too easy (${budgetUsed.toFixed(1)}% of budget)`);
    } else if (budgetUsed > 125) {
      issues.push(`Encounter too hard (${budgetUsed.toFixed(1)}% of budget)`);
    }
  }
  
  if (totalMonsters === 0) {
    issues.push('No monsters found in encounter');
  }
  
  return {
    targetXP,
    calculatedXP,
    adjustedXP,
    budgetUsed,
    accurate,
    issues,
    totalMonsters,
    multiplier
  };
}

// Generate comprehensive test report
function generateEncounterTestReport(results, successCount, totalTests, totalCost, totalTokens) {
  console.log('\n📊 COMPREHENSIVE ENCOUNTER GENERATOR TEST REPORT');
  console.log('='.repeat(70));
  
  // Overall statistics
  console.log(`📈 Overall Results:`);
  console.log(`   Success Rate: ${successCount}/${totalTests} (${Math.round(successCount/totalTests*100)}%)`);
  console.log(`   Total Cost: $${totalCost.toFixed(6)}`);
  console.log(`   Total Tokens: ${totalTokens}`);
  console.log(`   Average Cost: $${(totalCost/successCount || 0).toFixed(6)} per encounter`);
  
  // Quality analysis
  const successfulResults = results.filter(r => r.success);
  if (successfulResults.length > 0) {
    const avgBalanceScore = successfulResults.reduce((sum, r) => sum + r.analysis.balanceScore, 0) / successfulResults.length;
    const avgXPAccuracy = successfulResults.reduce((sum, r) => sum + r.analysis.xpAccuracy, 0) / successfulResults.length;
    const avgFeatureScore = successfulResults.reduce((sum, r) => sum + r.analysis.featureMatchScore, 0) / successfulResults.length;
    const xpAccurateCount = successfulResults.filter(r => r.xpValidation.accurate).length;
    
    console.log(`\n⚔️ Encounter Quality:`);
    console.log(`   Average Balance Score: ${avgBalanceScore.toFixed(1)}/100`);
    console.log(`   Average XP Accuracy: ${avgXPAccuracy.toFixed(1)}/100`);
    console.log(`   Average Feature Match: ${avgFeatureScore.toFixed(1)}/100`);
    console.log(`   XP Budget Accuracy Rate: ${xpAccurateCount}/${successfulResults.length} (${Math.round(xpAccurateCount/successfulResults.length*100)}%)`);
  }
  
  // Individual test results
  console.log(`\n📋 Individual Test Results:`);
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const qualityInfo = result.success ? 
      ` (Balance: ${result.analysis.balanceScore}/100, XP: ${result.analysis.xpAccuracy}/100, Budget: ${result.xpValidation.accurate ? '✅' : '❌'})` : 
      ` (${result.error})`;
    
    console.log(`   ${status} ${result.testCase}${qualityInfo}`);
  });
  
  // Performance analysis
  const avgDuration = successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length;
  console.log(`\n⚡ Performance:`);
  console.log(`   Average Generation Time: ${avgDuration.toFixed(0)}ms`);
  console.log(`   Fastest Generation: ${Math.min(...successfulResults.map(r => r.duration))}ms`);
  console.log(`   Slowest Generation: ${Math.max(...successfulResults.map(r => r.duration))}ms`);
  
  // Encounter examples
  console.log(`\n⚔️ Generated Encounter Examples:`);
  successfulResults.slice(0, 2).forEach(result => {
    const encounter = result.encounter;
    const monsterCount = getMonsterCount(encounter);
    console.log(`   🎯 ${encounter.name || 'Generated Encounter'}`);
    console.log(`      Monsters: ${monsterCount}, XP Budget: ${result.xpValidation.budgetUsed.toFixed(1)}%`);
    if (encounter.monsters && encounter.monsters.length > 0) {
      const firstMonster = encounter.monsters[0];
      console.log(`      Lead Monster: ${firstMonster.quantity || 1}x ${firstMonster.name} (CR ${firstMonster.challengeRating || '?'})`);
    }
  });
  
  // Quality assessment
  const finalAvgBalanceScore = successfulResults.length > 0 ? successfulResults.reduce((sum, r) => sum + r.analysis.balanceScore, 0) / successfulResults.length : 0;
  const finalAvgXPAccuracy = successfulResults.length > 0 ? successfulResults.reduce((sum, r) => sum + r.analysis.xpAccuracy, 0) / successfulResults.length : 0;
  const finalBudgetAccuracy = successfulResults.length > 0 ? xpAccurateCount / successfulResults.length : 0;
  const qualityGrade = getEncounterQualityGrade(successCount/totalTests, finalAvgBalanceScore, finalAvgXPAccuracy, finalBudgetAccuracy);
  console.log(`\n🏆 Overall Quality Grade: ${qualityGrade}`);
  
  console.log(`\n🎉 Encounter Generator ${successCount === totalTests ? 'PASSED' : 'NEEDS IMPROVEMENT'} - Ready for ${successCount === totalTests ? 'production' : 'further development'}!`);
}

// Calculate quality grade
function getEncounterQualityGrade(successRate, balanceScore, xpAccuracy, budgetAccuracy) {
  const overallScore = (successRate * 100 * 0.3) + (balanceScore * 0.25) + (xpAccuracy * 0.25) + (budgetAccuracy * 100 * 0.2);
  
  if (overallScore >= 90) return 'A+ (Excellent)';
  if (overallScore >= 80) return 'A (Very Good)';
  if (overallScore >= 70) return 'B (Good)';
  if (overallScore >= 60) return 'C (Acceptable)';
  return 'D (Needs Improvement)';
}

// Handle errors gracefully
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

// Run the tests
testEncounterGeneration().catch(console.error);
