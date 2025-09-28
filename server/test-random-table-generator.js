// Test Random Table Generator - Comprehensive Testing of D&D Random Table Creation
import OpenAI from 'openai';

// Set up environment for testing
process.env.OPENAI_API_KEY = 'your-test-api-key-here';

console.log('🎲 Testing Mythwright Random Table Generator...\n');

// Test cases covering different table types and purposes
const testCases = [
  {
    name: 'Tavern Encounters Table',
    request: {
      tableName: 'Random Tavern Encounters',
      tableType: 'random_event',
      purpose: 'improvisation_aid',
      diceType: 'd20',
      entryCount: 20,
      theme: 'classic_fantasy',
      setting: 'tavern',
      difficulty: 'moderate',
      partyLevel: 5,
      campaignStyle: 'heroic',
      weightingStyle: 'equal',
      resultFormat: 'detailed_description',
      toneStyle: 'light_hearted',
      complexity: 'moderate',
      reusability: 'campaign_long',
      narrative: true,
      mustInclude: ['friendly bard', 'mysterious stranger', 'bar fight', 'local gossip'],
      rarityDistribution: 'common_heavy',
      consequenceLevel: 'minor'
    },
    expectedFeatures: ['tavern setting', 'social encounters', 'd20 table', 'light hearted tone']
  },
  {
    name: 'Dungeon Complications',
    request: {
      tableName: 'Dungeon Exploration Complications',
      tableType: 'complication',
      purpose: 'encounter_spice',
      diceType: 'd10',
      entryCount: 10,
      theme: 'dark_fantasy',
      setting: 'dungeon',
      difficulty: 'challenging',
      partyLevel: 8,
      campaignStyle: 'gritty',
      weightingStyle: 'escalating',
      resultFormat: 'mechanical_effect',
      toneStyle: 'serious',
      complexity: 'complex',
      reusability: 'session_based',
      mechanical: true,
      mustInclude: ['trap activation', 'structural collapse', 'magical interference'],
      rarityDistribution: 'rare_emphasis',
      consequenceLevel: 'moderate'
    },
    expectedFeatures: ['dungeon complications', 'mechanical effects', 'serious tone', 'escalating difficulty']
  },
  {
    name: 'Wilderness Discoveries',
    request: {
      tableName: 'Strange Wilderness Discoveries',
      tableType: 'wilderness_discovery',
      purpose: 'world_building',
      diceType: 'd12',
      entryCount: 12,
      theme: 'high_fantasy',
      setting: 'wilderness',
      campaignStyle: 'exploration',
      culturalContext: 'celtic_gaelic',
      timeOfDay: 'any',
      season: 'autumn',
      weightingStyle: 'bell_curve',
      resultFormat: 'narrative_scene',
      includeSubtables: true,
      toneStyle: 'mysterious',
      complexity: 'layered',
      reusability: 'universal',
      narrative: true,
      mechanical: false,
      mustInclude: ['ancient ruins', 'magical phenomena', 'strange creatures', 'hidden treasures'],
      rarityDistribution: 'even',
      consequenceLevel: 'major'
    },
    expectedFeatures: ['wilderness setting', 'mysterious tone', 'narrative scenes', 'Celtic flavor']
  },
  {
    name: 'Quick Plot Hooks',
    request: {
      tableName: 'Urban Plot Hooks',
      tableType: 'plot_hook',
      purpose: 'session_preparation',
      diceType: 'd6',
      entryCount: 6,
      theme: 'political_intrigue',
      setting: 'city',
      difficulty: 'moderate',
      campaignStyle: 'political',
      culturalContext: 'renaissance_italian',
      weightingStyle: 'equal',
      resultFormat: 'simple_text',
      toneStyle: 'dramatic',
      complexity: 'simple',
      reusability: 'one_shot',
      narrative: true,
      mustInclude: ['noble conspiracy', 'merchant guild', 'corrupt official'],
      rarityDistribution: 'common_heavy',
      consequenceLevel: 'major',
      expandableEntries: true
    },
    expectedFeatures: ['plot hooks', 'political intrigue', 'urban setting', 'renaissance flavor']
  }
];

// Test random table generation with comprehensive analysis
async function testRandomTableGeneration() {
  console.log('🧪 Starting Random Table Generator Tests...\n');
  
  try {
    let successCount = 0;
    let totalCost = 0;
    let totalTokens = 0;
    const results = [];
    
    for (const testCase of testCases) {
      console.log(`🎯 Test Case: ${testCase.name}`);
      console.log(`🎲 Type: ${testCase.request.tableType}, Purpose: ${testCase.request.purpose}`);
      console.log(`🎯 Dice: ${testCase.request.diceType}, Entries: ${testCase.request.entryCount}`);
      console.log(`🌍 Setting: ${testCase.request.setting}, Theme: ${testCase.request.theme}`);
      
      try {
        const startTime = Date.now();
        
        // Create AI service mock for testing
        const mockAIService = {
          async generateContent(request) {
            const openai = new OpenAI({
              apiKey: process.env.OPENAI_API_KEY
            });
            
            console.log('🤖 Sending Random Table request to OpenAI...');
            console.log(`📝 Prompt length: ${request.prompt.length} characters`);
            
            try {
              const response = await openai.chat.completions.create({
                model: 'gpt-4o', // Use good model for structured content
                messages: [
                  { role: 'system', content: 'You are an expert D&D content creator specializing in random tables that enhance gameplay with balanced, engaging, and reusable results.' },
                  { role: 'user', content: request.prompt }
                ],
                temperature: 0.7,
                max_tokens: getMaxTokensForTable(testCase.request.entryCount, testCase.request.resultFormat),
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
        
        // Build table prompt
        const prompt = buildRandomTablePrompt(testCase.request);
        
        // Generate table using AI
        const aiRequest = {
          type: 'random_table',
          prompt: prompt,
          context: {
            additionalContext: {
              tableType: testCase.request.tableType,
              purpose: testCase.request.purpose,
              theme: testCase.request.theme,
              diceType: testCase.request.diceType,
              entryCount: testCase.request.entryCount,
              weightingStyle: testCase.request.weightingStyle
            }
          },
          options: {
            temperature: 0.7,
            maxTokens: getMaxTokensForTable(testCase.request.entryCount, testCase.request.resultFormat)
          }
        };
        
        const aiResponse = await mockAIService.generateContent(aiRequest);
        const duration = Date.now() - startTime;
        
        if (aiResponse.success) {
          console.log('✅ Random Table Generation Successful!');
          console.log(`⏱️ Generation Time: ${duration}ms`);
          
          // Analyze the generated table
          const analysis = analyzeGeneratedTable(aiResponse.content, testCase);
          console.log('📋 Table Analysis:');
          console.log(`   - Name: ${aiResponse.content.name || 'Generated Table'}`);
          console.log(`   - Entry Count: ${getEntryCount(aiResponse.content)}`);
          console.log(`   - Structure Score: ${analysis.structureScore}/100`);
          console.log(`   - Content Quality: ${analysis.contentQuality}/100`);
          console.log(`   - Feature Match: ${analysis.featureMatchScore}/100`);
          
          // Show sample entries
          if (aiResponse.content.entries && aiResponse.content.entries.length > 0) {
            const sampleEntries = aiResponse.content.entries.slice(0, 3);
            console.log(`🎲 Sample Entries:`);
            sampleEntries.forEach(entry => {
              console.log(`   ${entry.rollRange}: ${entry.result.substring(0, 80)}...`);
            });
          }
          
          // Show table info
          if (aiResponse.content.diceType) {
            console.log(`🎯 Dice Type: ${aiResponse.content.diceType}`);
          }
          
          if (aiResponse.content.theme) {
            console.log(`🎭 Theme: ${aiResponse.content.theme}`);
          }
          
          // Perform table validation
          const tableValidation = performTableValidation(aiResponse.content, testCase.request);
          console.log('🎲 Table Validation:');
          console.log(`   - Entry Count Match: ${tableValidation.entryCountMatch ? '✅' : '❌'}`);
          console.log(`   - Dice Type Match: ${tableValidation.diceTypeMatch ? '✅' : '❌'}`);
          console.log(`   - Structure Valid: ${tableValidation.structureValid ? '✅' : '❌'}`);
          console.log(`   - Overall Quality: ${tableValidation.overallQuality}`);
          
          if (tableValidation.issues.length > 0) {
            console.log(`⚠️ Table Issues: ${tableValidation.issues.slice(0, 2).join(', ')}`);
          }
          
          // Track metadata
          totalCost += aiResponse.metadata.cost || 0;
          totalTokens += aiResponse.metadata.tokensUsed || 0;
          
          results.push({
            testCase: testCase.name,
            success: true,
            analysis,
            tableValidation,
            duration,
            table: aiResponse.content
          });
          
          successCount++;
          
        } else {
          console.error('❌ Random Table Generation Failed:', aiResponse.error?.message);
          results.push({
            testCase: testCase.name,
            success: false,
            error: aiResponse.error?.message
          });
        }
        
      } catch (error) {
        console.error('❌ Random Table Generation Failed:', error.message);
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
    generateTableTestReport(results, successCount, testCases.length, totalCost, totalTokens);
    
    return successCount === testCases.length;
    
  } catch (error) {
    console.error('❌ Random Table Generator Test Failed:', error.message);
    return false;
  }
}

// Get max tokens for table
function getMaxTokensForTable(entryCount, format) {
  let baseTokens = entryCount * 30; // Base tokens per entry
  
  switch (format) {
    case 'simple_text':
      baseTokens *= 0.7;
      break;
    case 'detailed_description':
      baseTokens *= 1.5;
      break;
    case 'narrative_scene':
      baseTokens *= 1.8;
      break;
    case 'mechanical_effect':
      baseTokens *= 1.3;
      break;
    case 'mixed_format':
      baseTokens *= 1.4;
      break;
  }
  
  return Math.min(Math.max(Math.round(baseTokens), 500), 3000);
}

// Build random table prompt (simplified version)
function buildRandomTablePrompt(request) {
  let prompt = `Create a D&D 5e random table with balanced, engaging results:

CORE REQUIREMENTS:
- Table Type: ${request.tableType}
- Purpose: ${request.purpose}
- Dice Type: ${request.diceType}
- Entry Count: ${request.entryCount} entries`;

  if (request.tableName) {
    prompt += `\n- Table Name: ${request.tableName}`;
  }

  prompt += `\n\nTABLE STRUCTURE:`;
  prompt += `\n- Weighting Style: ${request.weightingStyle}`;
  prompt += `\n- Result Format: ${request.resultFormat}`;
  
  if (request.includeSubtables) prompt += `\n- Include Subtables: Yes`;
  if (request.crossReference) prompt += `\n- Cross-Reference Other Tables: Yes`;

  prompt += `\n\nTHEME & SETTING:`;
  prompt += `\n- Theme: ${request.theme}`;
  prompt += `\n- Setting: ${request.setting}`;
  prompt += `\n- Tone Style: ${request.toneStyle}`;
  prompt += `\n- Complexity: ${request.complexity}`;
  
  if (request.difficulty) prompt += `\n- Difficulty Level: ${request.difficulty}`;
  if (request.partyLevel) prompt += `\n- Target Party Level: ${request.partyLevel}`;

  if (request.campaignStyle || request.culturalContext || request.timeOfDay || request.season) {
    prompt += `\n\nCONTEXTUAL DETAILS:`;
    if (request.campaignStyle) prompt += `\n- Campaign Style: ${request.campaignStyle}`;
    if (request.culturalContext) prompt += `\n- Cultural Context: ${request.culturalContext}`;
    if (request.timeOfDay && request.timeOfDay !== 'any') prompt += `\n- Time of Day: ${request.timeOfDay}`;
    if (request.season && request.season !== 'any') prompt += `\n- Season: ${request.season}`;
  }

  if (request.narrative || request.mechanical) {
    prompt += `\n\nCONTENT REQUIREMENTS:`;
    if (request.narrative) prompt += `\n- Include narrative elements and storytelling hooks`;
    if (request.mechanical) prompt += `\n- Include mechanical effects and game rules`;
  }

  if (request.rarityDistribution || request.consequenceLevel) {
    prompt += `\n\nBALANCE REQUIREMENTS:`;
    if (request.rarityDistribution) {
      prompt += `\n- Rarity Distribution: ${request.rarityDistribution}`;
    }
    if (request.consequenceLevel) {
      prompt += `\n- Maximum Consequence Level: ${request.consequenceLevel}`;
    }
  }

  prompt += `\n\nREUSABILITY: ${request.reusability}`;

  if (request.mustInclude && request.mustInclude.length > 0) {
    prompt += `\n\nMUST INCLUDE:`;
    request.mustInclude.forEach(requirement => {
      prompt += `\n- ${requirement}`;
    });
  }

  if (request.avoidContent && request.avoidContent.length > 0) {
    prompt += `\n\nAVOID CONTENT:`;
    request.avoidContent.forEach(avoid => {
      prompt += `\n- ${avoid}`;
    });
  }

  prompt += getFormatGuidance(request.resultFormat);
  prompt += getTypeGuidance(request.tableType, request.purpose);

  prompt += `\n\nCRITICAL REQUIREMENTS:
1. Create exactly ${request.entryCount} distinct, engaging table entries
2. Number entries appropriately for ${request.diceType}
3. Ensure each entry is unique and interesting
4. Balance common and rare results appropriately
5. Make results immediately usable in gameplay
6. Use only SRD-safe content (no Product Identity terms)
7. Ensure thematic consistency across all entries
8. Provide clear, actionable results for DMs
9. Consider the impact and consequences of each result
10. Make the table reusable and engaging for players

Return a complete random table in JSON format with: name, description, diceType, entries (array with rollRange and result), purpose, theme, and usage notes.`;

  return prompt;
}

// Get format guidance
function getFormatGuidance(format) {
  let guidance = `\n\nRESULT FORMAT GUIDANCE (${format.toUpperCase()}):`;
  
  switch (format) {
    case 'simple_text':
      guidance += `\n- Keep results concise and immediately actionable
- Use clear, direct language
- Focus on essential information only`;
      break;
    case 'detailed_description':
      guidance += `\n- Provide rich, immersive descriptions
- Include sensory details and atmosphere
- Give DMs plenty of material to work with`;
      break;
    case 'narrative_scene':
      guidance += `\n- Create mini-scenes with story elements
- Include dialogue, action, and atmosphere
- Provide hooks for player engagement`;
      break;
    case 'mechanical_effect':
      guidance += `\n- Focus on game mechanics and rules effects
- Provide clear mechanical consequences
- Ensure balance with existing game systems`;
      break;
  }
  
  return guidance;
}

// Get type guidance
function getTypeGuidance(tableType, purpose) {
  let guidance = `\n\nTABLE TYPE GUIDANCE (${tableType.toUpperCase()}):`;
  
  switch (tableType) {
    case 'random_event':
      guidance += `\n- Create varied, interesting events
- Include different types of encounters and situations
- Consider both positive and negative outcomes`;
      break;
    case 'complication':
      guidance += `\n- Add interesting twists to ongoing situations
- Create challenges that require creative solutions
- Provide opportunities for character development`;
      break;
    case 'wilderness_discovery':
      guidance += `\n- Create unique, memorable discoveries
- Include both beneficial and dangerous findings
- Consider environmental and seasonal factors`;
      break;
    case 'plot_hook':
      guidance += `\n- Create compelling story starters
- Provide clear motivation for player action
- Include stakes and consequences`;
      break;
  }
  
  return guidance;
}

// Get entry count
function getEntryCount(table) {
  return table.entries ? table.entries.length : 0;
}

// Analyze generated table quality
function analyzeGeneratedTable(table, testCase) {
  let structureScore = 100;
  let contentQuality = 100;
  let featureMatchScore = 100;

  // Check basic structure
  if (!table.name) structureScore -= 15;
  if (!table.diceType) structureScore -= 20;
  if (!table.entries || !Array.isArray(table.entries)) structureScore -= 30;
  if (!table.theme) structureScore -= 10;

  // Check entry count
  const entryCount = getEntryCount(table);
  const expectedCount = testCase.request.entryCount;
  const countDiff = Math.abs(entryCount - expectedCount);
  
  if (countDiff > 2) {
    structureScore -= 20;
  } else if (countDiff > 0) {
    structureScore -= 10;
  }

  // Check content quality
  if (table.entries && table.entries.length > 0) {
    const hasGoodContent = table.entries.every(entry => 
      entry.rollRange && entry.result && entry.result.length > 10
    );
    
    if (!hasGoodContent) {
      contentQuality -= 25;
    }
    
    // Check for variety in entry lengths
    const lengths = table.entries.map(entry => entry.result.length);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const hasVariety = lengths.some(len => Math.abs(len - avgLength) > avgLength * 0.3);
    
    if (hasVariety) {
      contentQuality += 10;
    }
  }

  // Feature matching analysis
  const expectedFeatures = testCase.expectedFeatures || [];
  const tableText = JSON.stringify(table).toLowerCase();
  
  let matchedFeatures = 0;
  for (const feature of expectedFeatures) {
    if (tableText.includes(feature.toLowerCase().replace(' ', ''))) {
      matchedFeatures++;
    }
  }

  if (expectedFeatures.length > 0) {
    featureMatchScore = Math.round((matchedFeatures / expectedFeatures.length) * 100);
  }

  // Check must-include requirements
  if (testCase.request.mustInclude) {
    for (const requirement of testCase.request.mustInclude) {
      if (!tableText.includes(requirement.toLowerCase())) {
        featureMatchScore -= 15;
      }
    }
  }

  return {
    structureScore: Math.max(0, Math.min(100, structureScore)),
    contentQuality: Math.max(0, Math.min(100, contentQuality)),
    featureMatchScore: Math.max(0, Math.min(100, featureMatchScore)),
    matchedFeatures,
    totalFeatures: expectedFeatures.length
  };
}

// Perform table validation
function performTableValidation(table, request) {
  const issues = [];
  
  // Entry count validation
  const entryCount = getEntryCount(table);
  const expectedCount = request.entryCount;
  const entryCountMatch = Math.abs(entryCount - expectedCount) <= 2;
  
  if (!entryCountMatch) {
    issues.push(`Entry count mismatch: expected ${expectedCount}, got ${entryCount}`);
  }

  // Dice type validation
  const diceTypeMatch = table.diceType === request.diceType;
  if (!diceTypeMatch) {
    issues.push(`Dice type mismatch: expected ${request.diceType}, got ${table.diceType}`);
  }

  // Structure validation
  const structureValid = table.entries && Array.isArray(table.entries) && 
    table.entries.every(entry => entry.rollRange && entry.result);
  
  if (!structureValid) {
    issues.push('Invalid table structure or missing entries');
  }

  // Overall quality assessment
  let overallQuality = 'Good';
  if (issues.length === 0) overallQuality = 'Excellent';
  else if (issues.length > 2) overallQuality = 'Needs Improvement';
  
  return {
    entryCountMatch,
    diceTypeMatch,
    structureValid,
    overallQuality,
    issues
  };
}

// Generate comprehensive test report
function generateTableTestReport(results, successCount, totalTests, totalCost, totalTokens) {
  console.log('\n📊 COMPREHENSIVE RANDOM TABLE GENERATOR TEST REPORT');
  console.log('='.repeat(70));
  
  // Overall statistics
  console.log(`📈 Overall Results:`);
  console.log(`   Success Rate: ${successCount}/${totalTests} (${Math.round(successCount/totalTests*100)}%)`);
  console.log(`   Total Cost: $${totalCost.toFixed(6)}`);
  console.log(`   Total Tokens: ${totalTokens}`);
  console.log(`   Average Cost: $${(totalCost/successCount || 0).toFixed(6)} per table`);
  
  // Quality analysis
  const successfulResults = results.filter(r => r.success);
  if (successfulResults.length > 0) {
    const avgStructureScore = successfulResults.reduce((sum, r) => sum + r.analysis.structureScore, 0) / successfulResults.length;
    const avgContentQuality = successfulResults.reduce((sum, r) => sum + r.analysis.contentQuality, 0) / successfulResults.length;
    const avgFeatureScore = successfulResults.reduce((sum, r) => sum + r.analysis.featureMatchScore, 0) / successfulResults.length;
    const validationPassCount = successfulResults.filter(r => r.tableValidation.overallQuality === 'Excellent' || r.tableValidation.overallQuality === 'Good').length;
    
    console.log(`\n🎲 Table Quality:`);
    console.log(`   Average Structure Score: ${avgStructureScore.toFixed(1)}/100`);
    console.log(`   Average Content Quality: ${avgContentQuality.toFixed(1)}/100`);
    console.log(`   Average Feature Match: ${avgFeatureScore.toFixed(1)}/100`);
    console.log(`   Validation Pass Rate: ${validationPassCount}/${successfulResults.length} (${Math.round(validationPassCount/successfulResults.length*100)}%)`);
  }
  
  // Individual test results
  console.log(`\n📋 Individual Test Results:`);
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const qualityInfo = result.success ? 
      ` (Structure: ${result.analysis.structureScore}/100, Content: ${result.analysis.contentQuality}/100, Validation: ${result.tableValidation.overallQuality})` : 
      ` (${result.error})`;
    
    console.log(`   ${status} ${result.testCase}${qualityInfo}`);
  });
  
  // Performance analysis
  if (successfulResults.length > 0) {
    const avgDuration = successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length;
    console.log(`\n⚡ Performance:`);
    console.log(`   Average Generation Time: ${avgDuration.toFixed(0)}ms`);
    console.log(`   Fastest Generation: ${Math.min(...successfulResults.map(r => r.duration))}ms`);
    console.log(`   Slowest Generation: ${Math.max(...successfulResults.map(r => r.duration))}ms`);
  }
  
  // Table examples
  console.log(`\n🎲 Generated Table Examples:`);
  successfulResults.slice(0, 2).forEach(result => {
    const table = result.table;
    const entryCount = getEntryCount(table);
    console.log(`   🎯 ${table.name || 'Generated Table'}`);
    console.log(`      Type: ${table.diceType}, Entries: ${entryCount}, Theme: ${table.theme}`);
    if (table.entries && table.entries.length > 0) {
      console.log(`      Sample: ${table.entries[0].rollRange} - ${table.entries[0].result.substring(0, 60)}...`);
    }
  });
  
  // Quality assessment
  const finalAvgStructureScore = successfulResults.length > 0 ? successfulResults.reduce((sum, r) => sum + r.analysis.structureScore, 0) / successfulResults.length : 0;
  const finalAvgContentQuality = successfulResults.length > 0 ? successfulResults.reduce((sum, r) => sum + r.analysis.contentQuality, 0) / successfulResults.length : 0;
  const finalValidationPassCount = successfulResults.filter(r => r.tableValidation.overallQuality === 'Excellent' || r.tableValidation.overallQuality === 'Good').length;
  const finalValidationRate = successfulResults.length > 0 ? finalValidationPassCount / successfulResults.length : 0;
  const qualityGrade = getTableQualityGrade(successCount/totalTests, finalAvgStructureScore, finalAvgContentQuality, finalValidationRate);
  console.log(`\n🏆 Overall Quality Grade: ${qualityGrade}`);
  
  console.log(`\n🎉 Random Table Generator ${successCount === totalTests ? 'PASSED' : 'NEEDS IMPROVEMENT'} - Ready for ${successCount === totalTests ? 'production' : 'further development'}!`);
}

// Calculate quality grade
function getTableQualityGrade(successRate, structureScore, contentQuality, validationRate) {
  const overallScore = (successRate * 100 * 0.3) + (structureScore * 0.25) + (contentQuality * 0.25) + (validationRate * 100 * 0.2);
  
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
testRandomTableGeneration().catch(console.error);
