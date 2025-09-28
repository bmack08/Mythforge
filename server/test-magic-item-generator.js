// Test Magic Item Generator - Comprehensive Testing of D&D Magic Item Generation with Rarity Validation
import OpenAI from 'openai';

// Set up environment for testing
process.env.OPENAI_API_KEY = ''; // Add your OpenAI API key here for testing

console.log('🪄 Testing Mythwright Magic Item Generator...\n');

// Test cases covering different rarities and item types
const testCases = [
  {
    name: 'Uncommon Combat Weapon',
    request: {
      name: 'Flamebrand Sword',
      rarity: 'uncommon',
      itemType: 'weapon',
      category: 'combat',
      primaryFunction: 'damage_boost',
      theme: 'elemental',
      bonusType: 'enhancement',
      bonusValue: 1,
      targetLevel: 5,
      campaignPowerLevel: 'standard',
      flavorText: 'A sword that flickers with inner flame, forged in the heart of a volcano.',
      mustHave: ['fire damage', '+1 enhancement bonus'],
      mustNotHave: ['instant death effects']
    },
    expectedFeatures: ['fire damage', 'enhancement bonus', 'weapon properties']
  },
  {
    name: 'Rare Utility Wondrous Item',
    request: {
      rarity: 'rare',
      itemType: 'wondrous_item',
      category: 'utility',
      primaryFunction: 'transportation',
      secondaryFunctions: ['detection'],
      theme: 'arcane',
      attunementRequired: true,
      charges: {
        maxCharges: 7,
        rechargeRate: '1d6+1 at dawn',
        rechargeCondition: 'must be exposed to moonlight'
      },
      targetLevel: 10,
      campaignPowerLevel: 'standard',
      origin: 'arcane_experiment',
      creator: 'archmage',
      materials: ['mithril', 'sapphire', 'phoenix feather'],
      flavorText: 'An intricate compass that points not north, but toward whatever the user most desires to find.'
    },
    expectedFeatures: ['transportation', 'detection', 'charges', 'attunement']
  },
  {
    name: 'Very Rare Defensive Armor',
    request: {
      name: 'Dragonscale Aegis',
      rarity: 'very_rare',
      itemType: 'armor',
      category: 'defensive',
      primaryFunction: 'defense_boost',
      secondaryFunctions: ['protection'],
      theme: 'draconic',
      bonusType: 'enhancement',
      bonusValue: 2,
      attunementRequired: true,
      targetLevel: 15,
      campaignPowerLevel: 'standard',
      origin: 'dragon_hoard',
      creator: 'dragon',
      sentience: 'semi_sentient',
      flavorText: 'Armor crafted from the scales of an ancient gold dragon, it pulses with draconic magic.',
      mustHave: ['damage resistance', 'AC bonus', 'draconic theme'],
      restrictions: ['no evil alignment corruption']
    },
    expectedFeatures: ['armor class bonus', 'damage resistance', 'draconic powers']
  },
  {
    name: 'Legendary Artifact Staff',
    request: {
      name: 'Staff of the Eternal Flame',
      rarity: 'legendary',
      itemType: 'staff',
      category: 'offensive',
      primaryFunction: 'spell_casting',
      secondaryFunctions: ['damage_boost', 'protection'],
      powerLevel: 'supreme',
      theme: 'elemental',
      attunementRequired: true,
      charges: {
        maxCharges: 20,
        rechargeRate: '2d10 at dawn',
        overchargeRisk: 'Staff might explode if all charges used'
      },
      targetLevel: 18,
      campaignPowerLevel: 'high_magic',
      origin: 'divine_gift',
      creator: 'deity',
      sentience: 'highly_intelligent',
      curseChance: 25,
      flavorText: 'A staff of pure crystallized fire, said to contain a fragment of the Elemental Plane of Fire itself.',
      mustHave: ['high-level spell effects', 'legendary resistance', 'multiple abilities'],
      restrictions: ['no world-ending powers']
    },
    expectedFeatures: ['spell casting', 'legendary powers', 'sentience', 'multiple functions']
  }
];

// Test magic item generation with comprehensive analysis
async function testMagicItemGeneration() {
  console.log('🧪 Starting Magic Item Generator Tests...\n');
  
  try {
    let successCount = 0;
    let totalCost = 0;
    let totalTokens = 0;
    const results = [];
    
    for (const testCase of testCases) {
      console.log(`🎯 Test Case: ${testCase.name}`);
      console.log(`💎 Rarity: ${testCase.request.rarity}, Type: ${testCase.request.itemType}`);
      console.log(`⚔️ Category: ${testCase.request.category}, Function: ${testCase.request.primaryFunction}`);
      console.log(`🎨 Theme: ${testCase.request.theme || 'Generic'}, Level: ${testCase.request.targetLevel || 'Any'}`);
      
      try {
        const startTime = Date.now();
        
        // Create AI service mock for testing
        const mockAIService = {
          async generateContent(request) {
            const openai = new OpenAI({
              apiKey: process.env.OPENAI_API_KEY
            });
            
            console.log('🤖 Sending Magic Item request to OpenAI...');
            console.log(`📝 Prompt length: ${request.prompt.length} characters`);
            
            try {
              const response = await openai.chat.completions.create({
                model: 'gpt-4o', // Use good model for complex items
                messages: [
                  { role: 'system', content: 'You are an expert D&D 5e magic item designer specializing in balanced, flavorful items that enhance gameplay without breaking it.' },
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
        
        // Build magic item prompt
        const prompt = buildMagicItemPrompt(testCase.request);
        
        // Generate magic item using AI
        const aiRequest = {
          type: 'magic_item',
          prompt: prompt,
          context: {
            additionalContext: {
              rarity: testCase.request.rarity,
              itemType: testCase.request.itemType,
              primaryFunction: testCase.request.primaryFunction,
              theme: testCase.request.theme,
              powerLevel: testCase.request.powerLevel
            }
          },
          options: {
            temperature: 0.7,
            maxTokens: 2000
          }
        };
        
        const aiResponse = await mockAIService.generateContent(aiRequest);
        const duration = Date.now() - startTime;
        
        if (aiResponse.success) {
          console.log('✅ Magic Item Generation Successful!');
          console.log(`⏱️ Generation Time: ${duration}ms`);
          
          // Analyze the generated magic item
          const analysis = analyzeGeneratedMagicItem(aiResponse.content, testCase);
          console.log('📋 Magic Item Analysis:');
          console.log(`   - Name: ${aiResponse.content.name || 'Generated Item'}`);
          console.log(`   - Rarity: ${aiResponse.content.rarity || 'Unknown'}`);
          console.log(`   - Type: ${aiResponse.content.itemType || 'Unknown'}`);
          console.log(`   - Attunement: ${aiResponse.content.attunement ? 'Required' : 'Not Required'}`);
          console.log(`   - Balance Score: ${analysis.balanceScore}/100`);
          console.log(`   - Power Level: ${analysis.powerLevel}/100`);
          console.log(`   - Feature Match: ${analysis.featureMatchScore}/100`);
          
          // Show key properties
          if (aiResponse.content.properties && aiResponse.content.properties.length > 0) {
            console.log(`⚡ Properties: ${aiResponse.content.properties.slice(0, 2).join(', ')}`);
          }
          
          // Show description excerpt
          if (aiResponse.content.description) {
            console.log(`📖 Description: ${aiResponse.content.description.substring(0, 120)}...`);
          }
          
          // Perform rarity validation
          const rarityValidation = performRarityValidation(aiResponse.content, testCase.request);
          console.log('💎 Rarity Validation:');
          console.log(`   - Target Rarity: ${testCase.request.rarity}`);
          console.log(`   - Calculated Rarity: ${rarityValidation.calculatedRarity}`);
          console.log(`   - Rarity Accurate: ${rarityValidation.accurate ? '✅' : '❌'}`);
          console.log(`   - Market Value: ${rarityValidation.marketValue} gp`);
          
          if (rarityValidation.issues.length > 0) {
            console.log(`⚠️ Rarity Issues: ${rarityValidation.issues.slice(0, 2).join(', ')}`);
          }
          
          // Track metadata
          totalCost += aiResponse.metadata.cost || 0;
          totalTokens += aiResponse.metadata.tokensUsed || 0;
          
          results.push({
            testCase: testCase.name,
            success: true,
            analysis,
            rarityValidation,
            duration,
            magicItem: aiResponse.content
          });
          
          successCount++;
          
        } else {
          console.error('❌ Magic Item Generation Failed:', aiResponse.error?.message);
          results.push({
            testCase: testCase.name,
            success: false,
            error: aiResponse.error?.message
          });
        }
        
      } catch (error) {
        console.error('❌ Magic Item Generation Failed:', error.message);
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
    generateMagicItemTestReport(results, successCount, testCases.length, totalCost, totalTokens);
    
    return successCount === testCases.length;
    
  } catch (error) {
    console.error('❌ Magic Item Generator Test Failed:', error.message);
    return false;
  }
}

// Build magic item prompt (simplified version)
function buildMagicItemPrompt(request) {
  const rarityGuidelines = {
    common: { marketValue: [50, 100], powerLevel: 'minor', spellLevel: [0, 1] },
    uncommon: { marketValue: [101, 500], powerLevel: 'minor', spellLevel: [1, 3] },
    rare: { marketValue: [501, 5000], powerLevel: 'moderate', spellLevel: [3, 5] },
    very_rare: { marketValue: [5001, 50000], powerLevel: 'major', spellLevel: [5, 8] },
    legendary: { marketValue: [50001, 200000], powerLevel: 'supreme', spellLevel: [6, 9] },
    artifact: { marketValue: [200000, 1000000], powerLevel: 'supreme', spellLevel: [7, 9] }
  };
  
  const guidelines = rarityGuidelines[request.rarity];
  
  let prompt = `Create a D&D 5e magic item with the following specifications:

CORE REQUIREMENTS:
- Rarity: ${request.rarity} (Market Value: ${guidelines.marketValue[0]}-${guidelines.marketValue[1]} gp)
- Item Type: ${request.itemType}
- Category: ${request.category}
- Primary Function: ${request.primaryFunction}`;

  if (request.name) prompt += `\n- Name: ${request.name}`;
  if (request.secondaryFunctions) prompt += `\n- Secondary Functions: ${request.secondaryFunctions.join(', ')}`;
  if (request.powerLevel) prompt += `\n- Power Level: ${request.powerLevel}`;
  if (request.theme) prompt += `\n- Theme: ${request.theme}`;
  if (request.origin) prompt += `\n- Origin: ${request.origin}`;
  if (request.creator) prompt += `\n- Creator: ${request.creator}`;

  if (request.targetLevel || request.campaignPowerLevel) {
    prompt += `\n\nCAMPAIGN CONTEXT:`;
    if (request.targetLevel) prompt += `\n- Target Character Level: ${request.targetLevel}`;
    if (request.campaignPowerLevel) prompt += `\n- Campaign Power Level: ${request.campaignPowerLevel}`;
  }

  prompt += `\n\nMECHANICAL GUIDELINES (${request.rarity.toUpperCase()}):`;
  prompt += `\n- Market Value Range: ${guidelines.marketValue[0]}-${guidelines.marketValue[1]} gp`;
  prompt += `\n- Power Level: ${guidelines.powerLevel}`;
  prompt += `\n- Spell Level Equivalent: ${guidelines.spellLevel[0]}-${guidelines.spellLevel[1]}`;

  if (request.bonusType && request.bonusValue) {
    prompt += `\n\nSPECIFIC REQUIREMENTS:`;
    prompt += `\n- Bonus Type: ${request.bonusType}`;
    prompt += `\n- Bonus Value: +${request.bonusValue}`;
  }

  if (request.attunementRequired !== undefined) {
    prompt += `\n- Attunement Required: ${request.attunementRequired ? 'Yes' : 'No'}`;
  }

  if (request.charges) {
    prompt += `\n- Charge System: ${request.charges.maxCharges} charges, recharges ${request.charges.rechargeRate}`;
  }

  if (request.materials && request.materials.length > 0) {
    prompt += `\n\nMATERIALS & CRAFTING:`;
    request.materials.forEach(material => {
      prompt += `\n- ${material}`;
    });
  }

  if (request.curseChance && request.curseChance > 0) {
    prompt += `\n\nCURSE SYSTEM:`;
    prompt += `\n- Curse Chance: ${request.curseChance}%`;
    prompt += `\n- Include balanced curse that doesn't make item useless`;
  }

  if (request.sentience && request.sentience !== 'none') {
    prompt += `\n\nSENTIENCE:`;
    prompt += `\n- Sentience Level: ${request.sentience}`;
    prompt += `\n- Include personality, goals, and communication method`;
  }

  if (request.mustHave && request.mustHave.length > 0) {
    prompt += `\n\nMUST INCLUDE:`;
    request.mustHave.forEach(feature => {
      prompt += `\n- ${feature}`;
    });
  }

  if (request.mustNotHave && request.mustNotHave.length > 0) {
    prompt += `\n\nMUST NOT INCLUDE:`;
    request.mustNotHave.forEach(restriction => {
      prompt += `\n- ${restriction}`;
    });
  }

  if (request.restrictions && request.restrictions.length > 0) {
    prompt += `\n\nADDITIONAL RESTRICTIONS:`;
    request.restrictions.forEach(restriction => {
      prompt += `\n- ${restriction}`;
    });
  }

  if (request.flavorText) {
    prompt += `\n\nFLAVOR GUIDANCE:
${request.flavorText}`;
  }

  prompt += `\n\nCRITICAL REQUIREMENTS:
1. Follow D&D 5e magic item format exactly
2. Ensure power level matches rarity precisely
3. Include clear mechanical benefits and limitations
4. Balance power with interesting restrictions or costs
5. Make the item memorable and flavorful
6. Use only SRD-safe content (no Product Identity terms)
7. Include proper activation requirements and conditions
8. Consider attunement requirements for balance
9. Add rich description and lore elements
10. Ensure the item enhances gameplay without breaking it

Return a complete magic item in JSON format with: name, rarity, itemType, description, properties (array), attunement (boolean), activation, weight, and any other relevant mechanical details.`;

  return prompt;
}

// Analyze generated magic item quality
function analyzeGeneratedMagicItem(magicItem, testCase) {
  let balanceScore = 100;
  let powerLevel = 50;
  let featureMatchScore = 100;

  // Check basic completeness
  if (!magicItem.name) balanceScore -= 15;
  if (!magicItem.description) balanceScore -= 20;
  if (!magicItem.properties || magicItem.properties.length === 0) balanceScore -= 25;

  // Assess power level based on rarity
  const expectedPower = {
    common: 20, uncommon: 35, rare: 50, very_rare: 65, legendary: 80, artifact: 95
  };
  
  const targetPower = expectedPower[testCase.request.rarity] || 50;
  
  // Analyze power indicators
  if (magicItem.description) {
    const text = magicItem.description.toLowerCase();
    
    // Enhancement bonuses
    const bonusMatch = text.match(/\+(\d+)/);
    if (bonusMatch) {
      const bonus = parseInt(bonusMatch[1]);
      powerLevel += bonus * 15;
    }
    
    // Spell effects
    if (text.includes('spell') || text.includes('magic')) {
      powerLevel += 20;
    }
    
    // Resistances/immunities
    if (text.includes('resistance')) powerLevel += 15;
    if (text.includes('immunity')) powerLevel += 25;
    
    // Charges
    if (text.includes('charge')) powerLevel += 10;
  }

  // Check attunement appropriateness
  const shouldRequireAttunement = ['rare', 'very_rare', 'legendary', 'artifact'].includes(testCase.request.rarity);
  if (shouldRequireAttunement && !magicItem.attunement) {
    balanceScore -= 15;
  }

  // Feature matching analysis
  const expectedFeatures = testCase.expectedFeatures || [];
  const itemText = JSON.stringify(magicItem).toLowerCase();
  
  let matchedFeatures = 0;
  for (const feature of expectedFeatures) {
    if (itemText.includes(feature.toLowerCase().replace(' ', ''))) {
      matchedFeatures++;
    }
  }

  if (expectedFeatures.length > 0) {
    featureMatchScore = Math.round((matchedFeatures / expectedFeatures.length) * 100);
  }

  // Check must-have requirements
  if (testCase.request.mustHave) {
    for (const requirement of testCase.request.mustHave) {
      if (!itemText.includes(requirement.toLowerCase())) {
        featureMatchScore -= 20;
      }
    }
  }

  // Power level balance check
  const powerDifference = Math.abs(powerLevel - targetPower);
  if (powerDifference > 20) {
    balanceScore -= powerDifference / 2;
  }

  return {
    balanceScore: Math.max(0, Math.min(100, balanceScore)),
    powerLevel: Math.max(0, Math.min(100, powerLevel)),
    featureMatchScore: Math.max(0, Math.min(100, featureMatchScore)),
    matchedFeatures,
    totalFeatures: expectedFeatures.length
  };
}

// Perform rarity validation
function performRarityValidation(magicItem, request) {
  const rarityScores = {
    common: 0, uncommon: 1, rare: 2, very_rare: 3, legendary: 4, artifact: 5
  };
  
  let calculatedScore = rarityScores[request.rarity] || 1;
  const issues = [];
  
  // Analyze power factors
  if (magicItem.description) {
    const text = magicItem.description.toLowerCase();
    
    // Enhancement bonus analysis
    const bonusMatch = text.match(/\+(\d+)/);
    if (bonusMatch) {
      const bonus = parseInt(bonusMatch[1]);
      calculatedScore += Math.max(0, bonus - 1) * 0.5;
    }
    
    // Spell level analysis
    const spellMatch = text.match(/(\d+)(?:st|nd|rd|th)-level spell/);
    if (spellMatch) {
      const spellLevel = parseInt(spellMatch[1]);
      if (spellLevel <= 2) calculatedScore += 0;
      else if (spellLevel <= 4) calculatedScore += 0.5;
      else if (spellLevel <= 6) calculatedScore += 1;
      else calculatedScore += 1.5;
    }
    
    // Special abilities
    if (text.includes('resistance')) calculatedScore += 0.5;
    if (text.includes('immunity')) calculatedScore += 1;
    if (text.includes('legendary')) calculatedScore += 1;
  }
  
  // Attunement adjustment
  if (magicItem.attunement) {
    calculatedScore -= 0.25; // Attunement reduces effective power
  }
  
  // Convert score back to rarity
  const calculatedRarity = Object.keys(rarityScores).find(rarity => 
    rarityScores[rarity] === Math.round(calculatedScore)
  ) || request.rarity;
  
  const accurate = calculatedRarity === request.rarity;
  
  if (!accurate) {
    issues.push(`Power level suggests ${calculatedRarity} rarity instead of ${request.rarity}`);
  }
  
  // Market value calculation
  const marketValueRanges = {
    common: 75, uncommon: 300, rare: 2750, very_rare: 27500, legendary: 125000, artifact: 600000
  };
  
  const marketValue = marketValueRanges[calculatedRarity] || 1000;
  
  return {
    calculatedRarity,
    accurate,
    issues,
    marketValue,
    powerScore: calculatedScore
  };
}

// Generate comprehensive test report
function generateMagicItemTestReport(results, successCount, totalTests, totalCost, totalTokens) {
  console.log('\n📊 COMPREHENSIVE MAGIC ITEM GENERATOR TEST REPORT');
  console.log('='.repeat(70));
  
  // Overall statistics
  console.log(`📈 Overall Results:`);
  console.log(`   Success Rate: ${successCount}/${totalTests} (${Math.round(successCount/totalTests*100)}%)`);
  console.log(`   Total Cost: $${totalCost.toFixed(6)}`);
  console.log(`   Total Tokens: ${totalTokens}`);
  console.log(`   Average Cost: $${(totalCost/successCount || 0).toFixed(6)} per magic item`);
  
  // Quality analysis
  const successfulResults = results.filter(r => r.success);
  if (successfulResults.length > 0) {
    const avgBalanceScore = successfulResults.reduce((sum, r) => sum + r.analysis.balanceScore, 0) / successfulResults.length;
    const avgPowerLevel = successfulResults.reduce((sum, r) => sum + r.analysis.powerLevel, 0) / successfulResults.length;
    const avgFeatureScore = successfulResults.reduce((sum, r) => sum + r.analysis.featureMatchScore, 0) / successfulResults.length;
    const rarityAccurateCount = successfulResults.filter(r => r.rarityValidation.accurate).length;
    
    console.log(`\n💎 Item Quality:`);
    console.log(`   Average Balance Score: ${avgBalanceScore.toFixed(1)}/100`);
    console.log(`   Average Power Level: ${avgPowerLevel.toFixed(1)}/100`);
    console.log(`   Average Feature Match: ${avgFeatureScore.toFixed(1)}/100`);
    console.log(`   Rarity Accuracy Rate: ${rarityAccurateCount}/${successfulResults.length} (${Math.round(rarityAccurateCount/successfulResults.length*100)}%)`);
  }
  
  // Individual test results
  console.log(`\n📋 Individual Test Results:`);
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const qualityInfo = result.success ? 
      ` (Balance: ${result.analysis.balanceScore}/100, Power: ${result.analysis.powerLevel}/100, Rarity: ${result.rarityValidation.accurate ? '✅' : '❌'})` : 
      ` (${result.error})`;
    
    console.log(`   ${status} ${result.testCase}${qualityInfo}`);
  });
  
  // Performance analysis
  const avgDuration = successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length;
  console.log(`\n⚡ Performance:`);
  console.log(`   Average Generation Time: ${avgDuration.toFixed(0)}ms`);
  console.log(`   Fastest Generation: ${Math.min(...successfulResults.map(r => r.duration))}ms`);
  console.log(`   Slowest Generation: ${Math.max(...successfulResults.map(r => r.duration))}ms`);
  
  // Magic item examples
  console.log(`\n🪄 Generated Magic Item Examples:`);
  successfulResults.slice(0, 2).forEach(result => {
    const item = result.magicItem;
    console.log(`   ✨ ${item.name || 'Generated Item'} (${item.rarity || 'Unknown'} ${item.itemType || 'item'})`);
    console.log(`      Attunement: ${item.attunement ? 'Required' : 'Not Required'}`);
    if (item.properties && item.properties.length > 0) {
      console.log(`      Key Property: ${item.properties[0]}`);
    }
    if (result.rarityValidation.marketValue) {
      console.log(`      Market Value: ${result.rarityValidation.marketValue} gp`);
    }
  });
  
  // Quality assessment
  const finalAvgBalanceScore = successfulResults.length > 0 ? successfulResults.reduce((sum, r) => sum + r.analysis.balanceScore, 0) / successfulResults.length : 0;
  const finalAvgPowerLevel = successfulResults.length > 0 ? successfulResults.reduce((sum, r) => sum + r.analysis.powerLevel, 0) / successfulResults.length : 0;
  const finalRarityAccuracy = successfulResults.length > 0 ? rarityAccurateCount / successfulResults.length : 0;
  const qualityGrade = getMagicItemQualityGrade(successCount/totalTests, finalAvgBalanceScore, finalAvgPowerLevel, finalRarityAccuracy);
  console.log(`\n🏆 Overall Quality Grade: ${qualityGrade}`);
  
  console.log(`\n🎉 Magic Item Generator ${successCount === totalTests ? 'PASSED' : 'NEEDS IMPROVEMENT'} - Ready for ${successCount === totalTests ? 'production' : 'further development'}!`);
}

// Calculate quality grade
function getMagicItemQualityGrade(successRate, balanceScore, powerLevel, rarityAccuracy) {
  const overallScore = (successRate * 100 * 0.3) + (balanceScore * 0.25) + (powerLevel * 0.25) + (rarityAccuracy * 100 * 0.2);
  
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
testMagicItemGeneration().catch(console.error);
