// Test Trap Generator - Comprehensive Testing of D&D Trap Generation with DC Calculations
import OpenAI from 'openai';

// Set up environment for testing
process.env.OPENAI_API_KEY = 'your-test-api-key-here';

console.log('⚡ Testing Mythwright Trap Generator...\n');

// Test cases covering different trap types and difficulties
const testCases = [
  {
    name: 'Simple Mechanical Damage Trap',
    request: {
      name: 'Poison Dart Trap',
      trapType: 'mechanical',
      category: 'damage',
      complexity: 'simple',
      partyLevel: 3,
      partySize: 4,
      difficulty: 'dangerous',
      triggerMechanism: 'pressure_plate',
      damageType: 'poison',
      environment: 'dungeon',
      location: 'corridor',
      purpose: 'guard_passage',
      creator: 'dungeon_architect',
      flavorText: 'Ancient darts coated with a paralytic toxin, designed to stop intruders in their tracks.',
      mustHave: ['poison damage', 'saving throw', 'detection clues']
    },
    expectedFeatures: ['poison damage', 'dexterity save', 'mechanical trigger']
  },
  {
    name: 'Complex Magical Area Trap',
    request: {
      trapType: 'magical',
      category: 'area_denial',
      complexity: 'complex',
      partyLevel: 8,
      partySize: 5,
      difficulty: 'deadly',
      triggerMechanism: 'proximity',
      damageType: 'fire',
      environment: 'dungeon',
      location: 'treasure_room',
      purpose: 'protect_treasure',
      creator: 'mad_wizard',
      multipleTargets: true,
      escalatingDanger: true,
      resetMechanism: 'automatic',
      theme: 'elemental_fury',
      materials: ['ruby crystals', 'gold inlay', 'elemental essence'],
      flavorText: 'A chamber that erupts in cascading flames when intruders approach the treasure.',
      mustHave: ['area effect', 'escalating damage', 'magical detection'],
      restrictions: ['no instant death']
    },
    expectedFeatures: ['area effect', 'fire damage', 'magical trigger', 'escalating']
  },
  {
    name: 'Environmental Hazard Trap',
    request: {
      name: 'Collapsing Bridge',
      trapType: 'environmental',
      category: 'transportation',
      complexity: 'moderate',
      partyLevel: 6,
      partySize: 4,
      difficulty: 'dangerous',
      triggerMechanism: 'pressure_plate',
      damageType: 'bludgeoning',
      environment: 'mountain',
      location: 'bridge',
      purpose: 'delay_progress',
      creator: 'ancient_civilization',
      delayedEffect: true,
      flavorText: 'An ancient stone bridge weakened by time, ready to collapse under too much weight.',
      mustHave: ['structural damage', 'falling hazard', 'weight limit'],
      restrictions: ['no magical effects']
    },
    expectedFeatures: ['environmental hazard', 'structural collapse', 'weight trigger']
  },
  {
    name: 'Deadly Puzzle Trap',
    request: {
      name: 'Chamber of Trials',
      trapType: 'hybrid',
      category: 'puzzle',
      complexity: 'deadly',
      partyLevel: 12,
      partySize: 4,
      difficulty: 'deadly',
      triggerMechanism: 'specific_action',
      damageType: 'necrotic',
      environment: 'dungeon',
      location: 'altar',
      purpose: 'test_worthiness',
      creator: 'ancient_civilization',
      multipleTargets: true,
      escalatingDanger: true,
      resetMechanism: 'manual',
      theme: 'divine_trial',
      sentience: 'semi_sentient',
      flavorText: 'A divine trial that tests the worth of those who would claim ancient power.',
      mustHave: ['puzzle elements', 'escalating consequences', 'divine theme'],
      restrictions: ['must have solution', 'no unfair mechanics']
    },
    expectedFeatures: ['puzzle mechanics', 'divine trial', 'escalating danger', 'multiple stages']
  }
];

// Test trap generation with comprehensive analysis
async function testTrapGeneration() {
  console.log('🧪 Starting Trap Generator Tests...\n');
  
  try {
    let successCount = 0;
    let totalCost = 0;
    let totalTokens = 0;
    const results = [];
    
    for (const testCase of testCases) {
      console.log(`🎯 Test Case: ${testCase.name}`);
      console.log(`⚡ Type: ${testCase.request.trapType}, Complexity: ${testCase.request.complexity}`);
      console.log(`🎲 Difficulty: ${testCase.request.difficulty}, Level: ${testCase.request.partyLevel}`);
      console.log(`🌍 Environment: ${testCase.request.environment}, Location: ${testCase.request.location}`);
      
      try {
        const startTime = Date.now();
        
        // Create AI service mock for testing
        const mockAIService = {
          async generateContent(request) {
            const openai = new OpenAI({
              apiKey: process.env.OPENAI_API_KEY
            });
            
            console.log('🤖 Sending Trap request to OpenAI...');
            console.log(`📝 Prompt length: ${request.prompt.length} characters`);
            
            try {
              const response = await openai.chat.completions.create({
                model: 'gpt-4o', // Use good model for complex traps
                messages: [
                  { role: 'system', content: 'You are an expert D&D 5e trap designer specializing in balanced, engaging challenges that test players without being unfair.' },
                  { role: 'user', content: request.prompt }
                ],
                temperature: 0.6,
                max_tokens: 2200,
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
        
        // Build trap prompt
        const prompt = buildTrapPrompt(testCase.request);
        
        // Generate trap using AI
        const aiRequest = {
          type: 'trap',
          prompt: prompt,
          context: {
            additionalContext: {
              trapType: testCase.request.trapType,
              complexity: testCase.request.complexity,
              partyLevel: testCase.request.partyLevel,
              difficulty: testCase.request.difficulty,
              environment: testCase.request.environment
            }
          },
          options: {
            temperature: 0.6,
            maxTokens: 2200
          }
        };
        
        const aiResponse = await mockAIService.generateContent(aiRequest);
        const duration = Date.now() - startTime;
        
        if (aiResponse.success) {
          console.log('✅ Trap Generation Successful!');
          console.log(`⏱️ Generation Time: ${duration}ms`);
          
          // Analyze the generated trap
          const analysis = analyzeGeneratedTrap(aiResponse.content, testCase);
          console.log('📋 Trap Analysis:');
          console.log(`   - Name: ${aiResponse.content.name || 'Generated Trap'}`);
          console.log(`   - Detection DC: ${aiResponse.content.detectionDC || 'Unknown'}`);
          console.log(`   - Disarm DC: ${aiResponse.content.disarmDC || 'Unknown'}`);
          console.log(`   - Damage: ${aiResponse.content.damage || 'Unknown'}`);
          console.log(`   - Balance Score: ${analysis.balanceScore}/100`);
          console.log(`   - DC Accuracy: ${analysis.dcAccuracy}/100`);
          console.log(`   - Feature Match: ${analysis.featureMatchScore}/100`);
          
          // Show trigger and effect
          if (aiResponse.content.trigger) {
            console.log(`⚡ Trigger: ${aiResponse.content.trigger}`);
          }
          if (aiResponse.content.effect) {
            const effect = typeof aiResponse.content.effect === 'string' ? aiResponse.content.effect : String(aiResponse.content.effect);
            console.log(`💥 Effect: ${effect.substring(0, 100)}...`);
          }
          
          // Show description excerpt
          if (aiResponse.content.description) {
            console.log(`📖 Description: ${aiResponse.content.description.substring(0, 120)}...`);
          }
          
          // Perform difficulty validation
          const difficultyValidation = performDifficultyValidation(aiResponse.content, testCase.request);
          console.log('🎲 Difficulty Validation:');
          console.log(`   - Target Difficulty: ${testCase.request.difficulty} (Level ${testCase.request.partyLevel})`);
          console.log(`   - Calculated Difficulty: ${difficultyValidation.calculatedDifficulty}`);
          console.log(`   - Difficulty Accurate: ${difficultyValidation.accurate ? '✅' : '❌'}`);
          console.log(`   - Expected Damage: ${difficultyValidation.expectedDamage}`);
          
          if (difficultyValidation.issues.length > 0) {
            console.log(`⚠️ Balance Issues: ${difficultyValidation.issues.slice(0, 2).join(', ')}`);
          }
          
          // Track metadata
          totalCost += aiResponse.metadata.cost || 0;
          totalTokens += aiResponse.metadata.tokensUsed || 0;
          
          results.push({
            testCase: testCase.name,
            success: true,
            analysis,
            difficultyValidation,
            duration,
            trap: aiResponse.content
          });
          
          successCount++;
          
        } else {
          console.error('❌ Trap Generation Failed:', aiResponse.error?.message);
          results.push({
            testCase: testCase.name,
            success: false,
            error: aiResponse.error?.message
          });
        }
        
      } catch (error) {
        console.error('❌ Trap Generation Failed:', error.message);
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
    generateTrapTestReport(results, successCount, testCases.length, totalCost, totalTokens);
    
    return successCount === testCases.length;
    
  } catch (error) {
    console.error('❌ Trap Generator Test Failed:', error.message);
    return false;
  }
}

// Build trap prompt (simplified version)
function buildTrapPrompt(request) {
  const trapDamageByLevel = {
    1: { setback: '1d10', dangerous: '2d10', deadly: '4d10' },
    3: { setback: '2d10', dangerous: '4d10', deadly: '10d10' },
    6: { setback: '4d10', dangerous: '10d10', deadly: '18d10' },
    8: { setback: '4d10', dangerous: '10d10', deadly: '18d10' },
    12: { setback: '10d10', dangerous: '18d10', deadly: '24d10' }
  };
  
  const dcByLevel = {
    3: { easy: 5, medium: 10, hard: 15 },
    6: { easy: 10, medium: 15, hard: 20 },
    8: { easy: 10, medium: 15, hard: 20 },
    12: { easy: 15, medium: 20, hard: 25 }
  };
  
  const saveDCByLevel = { 3: 13, 6: 15, 8: 16, 12: 16 };
  const attackBonusByLevel = { 3: 4, 6: 6, 8: 7, 12: 8 };
  
  const expectedDamage = trapDamageByLevel[request.partyLevel]?.[request.difficulty] || '2d10';
  const dcGuidelines = dcByLevel[request.partyLevel] || { easy: 10, medium: 15, hard: 20 };
  const saveDC = saveDCByLevel[request.partyLevel] || 15;
  const attackBonus = attackBonusByLevel[request.partyLevel] || 5;
  
  let prompt = `Create a D&D 5e trap with precise mechanical balance:

CORE REQUIREMENTS:
- Trap Type: ${request.trapType}
- Category: ${request.category}
- Complexity: ${request.complexity}
- Difficulty: ${request.difficulty} (for level ${request.partyLevel} party)`;

  if (request.name) prompt += `\n- Name: ${request.name}`;
  prompt += `\n- Environment: ${request.environment}`;
  prompt += `\n- Location: ${request.location}`;
  prompt += `\n- Purpose: ${request.purpose}`;
  prompt += `\n- Trigger: ${request.triggerMechanism}`;
  if (request.creator) prompt += `\n- Creator: ${request.creator}`;

  prompt += `\n\nPARTY CONTEXT:`;
  prompt += `\n- Target Level: ${request.partyLevel}`;
  if (request.partySize) prompt += `\n- Party Size: ${request.partySize}`;

  prompt += `\n\nMECHANICAL GUIDELINES (Level ${request.partyLevel}, ${request.difficulty.toUpperCase()}):`;
  prompt += `\n- Expected Damage: ${expectedDamage} (average: ${calculateAverageDamage(expectedDamage)})`;
  prompt += `\n- Save DC Range: ${saveDC - 2} to ${saveDC + 2} (recommended: ${saveDC})`;
  prompt += `\n- Detection DC: ${dcGuidelines.medium} (medium difficulty)`;
  prompt += `\n- Disarm DC: ${dcGuidelines.hard} (hard difficulty)`;
  prompt += `\n- Attack Bonus: +${attackBonus}`;

  if (request.detectionDC) {
    prompt += `\n\nSPECIFIC REQUIREMENTS:`;
    prompt += `\n- Detection DC: ${request.detectionDC}`;
  }
  if (request.disarmDC) prompt += `\n- Disarm DC: ${request.disarmDC}`;
  if (request.damageType) prompt += `\n- Damage Type: ${request.damageType}`;
  if (request.damageAmount) prompt += `\n- Damage Amount: ${request.damageAmount}`;

  if (request.multipleTargets || request.delayedEffect || request.escalatingDanger || request.resetMechanism) {
    prompt += `\n\nADVANCED FEATURES:`;
    if (request.multipleTargets) prompt += `\n- Multiple Targets: Affects multiple party members`;
    if (request.delayedEffect) prompt += `\n- Delayed Effect: Effect occurs after a delay`;
    if (request.escalatingDanger) prompt += `\n- Escalating Danger: Becomes more dangerous over time`;
    if (request.resetMechanism) prompt += `\n- Reset Mechanism: ${request.resetMechanism}`;
  }

  if (request.theme) {
    prompt += `\n\nTHEME & AESTHETICS:`;
    prompt += `\n- Theme: ${request.theme}`;
  }
  if (request.materials && request.materials.length > 0) {
    prompt += `\n- Materials: ${request.materials.join(', ')}`;
  }

  if (request.mustHave && request.mustHave.length > 0) {
    prompt += `\n\nMUST INCLUDE:`;
    request.mustHave.forEach(feature => {
      prompt += `\n- ${feature}`;
    });
  }

  if (request.restrictions && request.restrictions.length > 0) {
    prompt += `\n\nRESTRICTIONS:`;
    request.restrictions.forEach(restriction => {
      prompt += `\n- ${restriction}`;
    });
  }

  if (request.flavorText) {
    prompt += `\n\nFLAVOR GUIDANCE:
${request.flavorText}`;
  }

  prompt += `\n\nCRITICAL REQUIREMENTS:
1. Follow D&D 5e trap mechanics exactly
2. Ensure difficulty matches party level precisely
3. Include clear trigger conditions and mechanics
4. Provide multiple detection and disarm methods
5. Balance challenge with fair counterplay options
6. Use only SRD-safe content (no Product Identity terms)
7. Include specific DCs, damage formulas, and save requirements
8. Consider environmental factors and tactical positioning
9. Make the trap engaging and memorable
10. Ensure the trap serves its narrative purpose

Return a complete trap in JSON format with: name, description, detectionDC, disarmDC, trigger, effect, damage, damageType, saveDC (if applicable), and any other relevant mechanical details.`;

  return prompt;
}

// Calculate average damage from dice formula
function calculateAverageDamage(diceFormula) {
  const match = diceFormula.match(/(\d+)d(\d+)/);
  if (match) {
    const numDice = parseInt(match[1]);
    const dieSize = parseInt(match[2]);
    return numDice * (dieSize + 1) / 2;
  }
  return 10; // Default fallback
}

// Analyze generated trap quality
function analyzeGeneratedTrap(trap, testCase) {
  let balanceScore = 100;
  let dcAccuracy = 100;
  let featureMatchScore = 100;

  // Check basic completeness
  if (!trap.name) balanceScore -= 15;
  if (!trap.description) balanceScore -= 20;
  if (!trap.detectionDC) balanceScore -= 25;
  if (!trap.disarmDC) balanceScore -= 25;
  if (!trap.damage) balanceScore -= 20;

  // Check DC appropriateness
  const expectedDetectionDC = getDCForLevel(testCase.request.partyLevel).medium;
  const expectedDisarmDC = getDCForLevel(testCase.request.partyLevel).hard;
  
  if (trap.detectionDC) {
    const detectionDiff = Math.abs(trap.detectionDC - expectedDetectionDC);
    if (detectionDiff > 5) dcAccuracy -= 25;
    else if (detectionDiff > 2) dcAccuracy -= 10;
  }
  
  if (trap.disarmDC) {
    const disarmDiff = Math.abs(trap.disarmDC - expectedDisarmDC);
    if (disarmDiff > 5) dcAccuracy -= 25;
    else if (disarmDiff > 2) dcAccuracy -= 10;
  }

  // Feature matching analysis
  const expectedFeatures = testCase.expectedFeatures || [];
  const trapText = JSON.stringify(trap).toLowerCase();
  
  let matchedFeatures = 0;
  for (const feature of expectedFeatures) {
    if (trapText.includes(feature.toLowerCase().replace(' ', ''))) {
      matchedFeatures++;
    }
  }

  if (expectedFeatures.length > 0) {
    featureMatchScore = Math.round((matchedFeatures / expectedFeatures.length) * 100);
  }

  // Check must-have requirements
  if (testCase.request.mustHave) {
    for (const requirement of testCase.request.mustHave) {
      if (!trapText.includes(requirement.toLowerCase())) {
        featureMatchScore -= 20;
      }
    }
  }

  return {
    balanceScore: Math.max(0, Math.min(100, balanceScore)),
    dcAccuracy: Math.max(0, Math.min(100, dcAccuracy)),
    featureMatchScore: Math.max(0, Math.min(100, featureMatchScore)),
    matchedFeatures,
    totalFeatures: expectedFeatures.length
  };
}

// Get DC guidelines for level
function getDCForLevel(level) {
  if (level <= 4) return { easy: 5, medium: 10, hard: 15 };
  if (level <= 10) return { easy: 10, medium: 15, hard: 20 };
  return { easy: 15, medium: 20, hard: 25 };
}

// Perform difficulty validation
function performDifficultyValidation(trap, request) {
  const expectedDamageFormulas = {
    3: { setback: '2d10', dangerous: '4d10', deadly: '10d10' },
    6: { setback: '4d10', dangerous: '10d10', deadly: '18d10' },
    8: { setback: '4d10', dangerous: '10d10', deadly: '18d10' },
    12: { setback: '10d10', dangerous: '18d10', deadly: '24d10' }
  };
  
  const expectedDamage = expectedDamageFormulas[request.partyLevel]?.[request.difficulty] || '2d10';
  const expectedAvg = calculateAverageDamage(expectedDamage);
  const actualAvg = calculateAverageDamage(trap.damage || '1d4');
  
  const issues = [];
  let calculatedDifficulty = request.difficulty;
  
  // Check damage scaling
  const damageRatio = actualAvg / expectedAvg;
  if (damageRatio < 0.7) {
    issues.push(`Damage too low (${actualAvg} vs expected ${expectedAvg})`);
    if (damageRatio < 0.5) calculatedDifficulty = 'setback';
  } else if (damageRatio > 1.5) {
    issues.push(`Damage too high (${actualAvg} vs expected ${expectedAvg})`);
    if (damageRatio > 2) calculatedDifficulty = 'deadly';
  }
  
  // Check DC appropriateness
  const dcGuidelines = getDCForLevel(request.partyLevel);
  if (trap.detectionDC && (trap.detectionDC < dcGuidelines.easy || trap.detectionDC > dcGuidelines.hard + 5)) {
    issues.push(`Detection DC (${trap.detectionDC}) outside reasonable range`);
  }
  
  if (trap.disarmDC && (trap.disarmDC < dcGuidelines.medium || trap.disarmDC > dcGuidelines.hard + 5)) {
    issues.push(`Disarm DC (${trap.disarmDC}) outside reasonable range`);
  }
  
  const accurate = calculatedDifficulty === request.difficulty && issues.length === 0;
  
  return {
    calculatedDifficulty,
    accurate,
    issues,
    expectedDamage: expectedAvg,
    actualDamage: actualAvg
  };
}

// Generate comprehensive test report
function generateTrapTestReport(results, successCount, totalTests, totalCost, totalTokens) {
  console.log('\n📊 COMPREHENSIVE TRAP GENERATOR TEST REPORT');
  console.log('='.repeat(70));
  
  // Overall statistics
  console.log(`📈 Overall Results:`);
  console.log(`   Success Rate: ${successCount}/${totalTests} (${Math.round(successCount/totalTests*100)}%)`);
  console.log(`   Total Cost: $${totalCost.toFixed(6)}`);
  console.log(`   Total Tokens: ${totalTokens}`);
  console.log(`   Average Cost: $${(totalCost/successCount || 0).toFixed(6)} per trap`);
  
  // Quality analysis
  const successfulResults = results.filter(r => r.success);
  if (successfulResults.length > 0) {
    const avgBalanceScore = successfulResults.reduce((sum, r) => sum + r.analysis.balanceScore, 0) / successfulResults.length;
    const avgDCAccuracy = successfulResults.reduce((sum, r) => sum + r.analysis.dcAccuracy, 0) / successfulResults.length;
    const avgFeatureScore = successfulResults.reduce((sum, r) => sum + r.analysis.featureMatchScore, 0) / successfulResults.length;
    const difficultyAccurateCount = successfulResults.filter(r => r.difficultyValidation.accurate).length;
    
    console.log(`\n⚡ Trap Quality:`);
    console.log(`   Average Balance Score: ${avgBalanceScore.toFixed(1)}/100`);
    console.log(`   Average DC Accuracy: ${avgDCAccuracy.toFixed(1)}/100`);
    console.log(`   Average Feature Match: ${avgFeatureScore.toFixed(1)}/100`);
    console.log(`   Difficulty Accuracy Rate: ${difficultyAccurateCount}/${successfulResults.length} (${Math.round(difficultyAccurateCount/successfulResults.length*100)}%)`);
  }
  
  // Individual test results
  console.log(`\n📋 Individual Test Results:`);
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const qualityInfo = result.success ? 
      ` (Balance: ${result.analysis.balanceScore}/100, DC: ${result.analysis.dcAccuracy}/100, Difficulty: ${result.difficultyValidation.accurate ? '✅' : '❌'})` : 
      ` (${result.error})`;
    
    console.log(`   ${status} ${result.testCase}${qualityInfo}`);
  });
  
  // Performance analysis
  const avgDuration = successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length;
  console.log(`\n⚡ Performance:`);
  console.log(`   Average Generation Time: ${avgDuration.toFixed(0)}ms`);
  console.log(`   Fastest Generation: ${Math.min(...successfulResults.map(r => r.duration))}ms`);
  console.log(`   Slowest Generation: ${Math.max(...successfulResults.map(r => r.duration))}ms`);
  
  // Trap examples
  console.log(`\n⚡ Generated Trap Examples:`);
  successfulResults.slice(0, 2).forEach(result => {
    const trap = result.trap;
    console.log(`   🎯 ${trap.name || 'Generated Trap'}`);
    console.log(`      Detection DC: ${trap.detectionDC || 'Unknown'}, Disarm DC: ${trap.disarmDC || 'Unknown'}`);
    console.log(`      Damage: ${trap.damage || 'Unknown'} ${trap.damageType || ''}`);
    if (result.difficultyValidation.expectedDamage) {
      console.log(`      Expected Damage: ${result.difficultyValidation.expectedDamage} average`);
    }
  });
  
  // Quality assessment
  const finalAvgBalanceScore = successfulResults.length > 0 ? successfulResults.reduce((sum, r) => sum + r.analysis.balanceScore, 0) / successfulResults.length : 0;
  const finalAvgDCAccuracy = successfulResults.length > 0 ? successfulResults.reduce((sum, r) => sum + r.analysis.dcAccuracy, 0) / successfulResults.length : 0;
  const finalDifficultyAccuracy = successfulResults.length > 0 ? difficultyAccurateCount / successfulResults.length : 0;
  const qualityGrade = getTrapQualityGrade(successCount/totalTests, finalAvgBalanceScore, finalAvgDCAccuracy, finalDifficultyAccuracy);
  console.log(`\n🏆 Overall Quality Grade: ${qualityGrade}`);
  
  console.log(`\n🎉 Trap Generator ${successCount === totalTests ? 'PASSED' : 'NEEDS IMPROVEMENT'} - Ready for ${successCount === totalTests ? 'production' : 'further development'}!`);
}

// Calculate quality grade
function getTrapQualityGrade(successRate, balanceScore, dcAccuracy, difficultyAccuracy) {
  const overallScore = (successRate * 100 * 0.3) + (balanceScore * 0.25) + (dcAccuracy * 0.25) + (difficultyAccuracy * 100 * 0.2);
  
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
testTrapGeneration().catch(console.error);
