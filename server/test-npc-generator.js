// Test NPC Generator - Comprehensive Testing of D&D NPC Generation with Rich Personalities
import OpenAI from 'openai';

// Set up environment for testing
process.env.OPENAI_API_KEY = 'sYOUR_OPENAI_API_KEY'; // Replace with your actual API key or use environment variables

console.log('🎭 Testing Mythwright NPC Generator...\n');

// Test cases covering different NPC types and importance levels
const testCases = [
  {
    name: 'Tavern Keeper (Supporting Character)',
    request: {
      name: 'Marta Goldenbrew',
      race: 'halfling',
      class: 'commoner',
      role: 'innkeeper',
      importance: 'supporting',
      location: 'The Prancing Pony Tavern',
      occupation: 'tavern owner and brewmaster',
      age: 'middle_aged',
      gender: 'female',
      socialClass: 'merchant',
      wealth: 'comfortable',
      reputation: 'local',
      alignment: 'neutral good',
      personalityTraits: ['friendly', 'hardworking', 'gossip-loving'],
      ideals: ['Community', 'Hospitality'],
      bonds: ['My tavern is my life\'s work'],
      flaws: ['I can\'t keep a secret to save my life'],
      campaignTheme: 'heroic',
      settingType: 'tavern',
      plotHooks: ['Strange travelers asking odd questions', 'Missing brewery supplies'],
      flavorText: 'A warm, motherly figure who knows everyone\'s business and loves to share stories over a pint.'
    },
    expectedFeatures: ['hospitality', 'local knowledge', 'brewing skills']
  },
  {
    name: 'Noble Conspirator (Major Character)',
    request: {
      race: 'human',
      class: 'aristocrat',
      level: 8,
      role: 'noble',
      importance: 'major',
      location: 'Royal Court',
      occupation: 'court advisor',
      age: 'adult',
      socialClass: 'noble',
      wealth: 'wealthy',
      reputation: 'national',
      alignment: 'lawful evil',
      personalityTraits: ['charming', 'manipulative', 'intelligent'],
      ideals: ['Power', 'Order'],
      bonds: ['My family\'s ancient bloodline must be preserved'],
      flaws: ['I believe I am superior to commoners'],
      campaignTheme: 'intrigue',
      settingType: 'court',
      relationships: [
        { type: 'rival', target: 'Duke Aldric', description: 'Competing for the king\'s favor' },
        { type: 'ally', target: 'Spymaster Vex', description: 'Secret partnership in information gathering' }
      ],
      secrets: ['Plotting to overthrow the current dynasty', 'Has a bastard child hidden away'],
      plotHooks: ['Needs adventurers for a "diplomatic mission"', 'Blackmail evidence has gone missing'],
      flavorText: 'A silver-tongued politician who smiles while plotting your downfall.'
    },
    expectedFeatures: ['political intrigue', 'manipulation', 'court connections']
  },
  {
    name: 'Mysterious Scholar (Central Character)',
    request: {
      name: 'Professor Thaddeus Nightwhisper',
      race: 'half-elf',
      class: 'wizard',
      level: 12,
      role: 'scholar',
      importance: 'central',
      location: 'Ancient Library of Mysteries',
      occupation: 'arcane researcher',
      age: 'middle_aged',
      socialClass: 'commoner',
      wealth: 'modest',
      reputation: 'regional',
      alignment: 'chaotic neutral',
      personalityTraits: ['obsessive', 'brilliant', 'absent-minded'],
      ideals: ['Knowledge', 'Discovery'],
      bonds: ['The truth behind the Sundering must be uncovered'],
      flaws: ['I pursue knowledge regardless of the consequences'],
      abilities: ['spellcasting', 'telepathy'],
      campaignTheme: 'mystery',
      settingType: 'academy',
      physicalTraits: ['ink-stained fingers', 'wild grey hair', 'spectacles'],
      clothing: ['tattered robes', 'component pouches', 'ancient amulet'],
      secrets: ['Discovered a prophecy about the party', 'Made a pact with an otherworldly entity for knowledge'],
      plotHooks: ['Ancient artifact needs deciphering', 'Forbidden research requires dangerous components'],
      mustHave: ['extensive library', 'magical research notes', 'connection to ancient mysteries'],
      flavorText: 'A brilliant but eccentric scholar whose pursuit of forbidden knowledge may doom or save the world.'
    },
    expectedFeatures: ['arcane knowledge', 'research abilities', 'mysterious connections']
  },
  {
    name: 'Street Criminal (Minor Character)',
    request: {
      race: 'human',
      class: 'rogue',
      level: 3,
      role: 'criminal',
      importance: 'minor',
      location: 'Thieves\' Quarter',
      occupation: 'pickpocket and informant',
      age: 'young_adult',
      gender: 'male',
      socialClass: 'peasant',
      wealth: 'poor',
      reputation: 'local',
      alignment: 'chaotic neutral',
      personalityTraits: ['quick-witted', 'paranoid', 'street-smart'],
      ideals: ['Survival', 'Freedom'],
      bonds: ['My little sister depends on me'],
      flaws: ['I can\'t resist taking risks for easy money'],
      campaignTheme: 'urban',
      settingType: 'criminal',
      plotHooks: ['Witnessed something he shouldn\'t have'],
      restrictions: ['no murder', 'not completely evil'],
      flavorText: 'A young thief trying to survive on the streets while protecting his family.'
    },
    expectedFeatures: ['street knowledge', 'stealth skills', 'criminal contacts']
  }
];

// Test NPC generation with comprehensive analysis
async function testNPCGeneration() {
  console.log('🧪 Starting NPC Generator Tests...\n');
  
  try {
    let successCount = 0;
    let totalCost = 0;
    let totalTokens = 0;
    const results = [];
    
    for (const testCase of testCases) {
      console.log(`🎯 Test Case: ${testCase.name}`);
      console.log(`👤 Role: ${testCase.request.role}, Importance: ${testCase.request.importance}`);
      console.log(`🎭 Race: ${testCase.request.race || 'Any'}, Class: ${testCase.request.class || 'Any'}`);
      console.log(`🌍 Setting: ${testCase.request.settingType || 'General'}, Theme: ${testCase.request.campaignTheme || 'General'}`);
      
      try {
        const startTime = Date.now();
        
        // Create AI service mock for testing
        const mockAIService = {
          async generateContent(request) {
            const openai = new OpenAI({
              apiKey: process.env.OPENAI_API_KEY
            });
            
            console.log('🤖 Sending NPC request to OpenAI...');
            console.log(`📝 Prompt length: ${request.prompt.length} characters`);
            
            try {
              const response = await openai.chat.completions.create({
                model: 'gpt-4o', // Use good model for complex NPCs
                messages: [
                  { role: 'system', content: 'You are an expert D&D 5e NPC creator specializing in rich, memorable characters with deep personalities and compelling backgrounds.' },
                  { role: 'user', content: request.prompt }
                ],
                temperature: 0.8, // Higher creativity for personalities
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
        
        // Build NPC prompt
        const prompt = buildNPCPrompt(testCase.request);
        
        // Generate NPC using AI
        const aiRequest = {
          type: 'npc',
          prompt: prompt,
          context: {
            additionalContext: {
              role: testCase.request.role,
              importance: testCase.request.importance,
              campaignTheme: testCase.request.campaignTheme,
              settingType: testCase.request.settingType
            }
          },
          options: {
            temperature: 0.8,
            maxTokens: 2500
          }
        };
        
        const aiResponse = await mockAIService.generateContent(aiRequest);
        const duration = Date.now() - startTime;
        
        if (aiResponse.success) {
          console.log('✅ NPC Generation Successful!');
          console.log(`⏱️ Generation Time: ${duration}ms`);
          
          // Analyze the generated NPC
          const analysis = analyzeGeneratedNPC(aiResponse.content, testCase);
          console.log('📋 NPC Analysis:');
          console.log(`   - Name: ${aiResponse.content.name || 'Generated'}`);
          console.log(`   - Race: ${aiResponse.content.race || 'Unknown'}`);
          console.log(`   - Class: ${aiResponse.content.class || 'Unknown'}`);
          console.log(`   - Alignment: ${aiResponse.content.alignment || 'Unknown'}`);
          console.log(`   - Personality Score: ${analysis.personalityScore}/100`);
          console.log(`   - Roleplay Utility: ${analysis.roleplayScore}/100`);
          console.log(`   - Plot Integration: ${analysis.plotScore}/100`);
          
          // Show personality highlights
          if (aiResponse.content.personalityTraits) {
            console.log(`🎭 Personality Traits: ${aiResponse.content.personalityTraits.slice(0, 3).join(', ')}`);
          }
          if (aiResponse.content.ideals) {
            console.log(`💭 Ideals: ${aiResponse.content.ideals.slice(0, 2).join(', ')}`);
          }
          if (aiResponse.content.bonds) {
            console.log(`🔗 Bonds: ${aiResponse.content.bonds.slice(0, 1).join(', ')}`);
          }
          if (aiResponse.content.flaws) {
            console.log(`⚠️ Flaws: ${aiResponse.content.flaws.slice(0, 1).join(', ')}`);
          }
          
          // Show background and appearance
          if (aiResponse.content.background) {
            console.log(`📖 Background: ${aiResponse.content.background.substring(0, 100)}...`);
          }
          if (aiResponse.content.appearance) {
            console.log(`👁️ Appearance: ${aiResponse.content.appearance.substring(0, 100)}...`);
          }
          
          // Show mannerisms and speech
          if (aiResponse.content.mannerisms) {
            console.log(`🤲 Mannerisms: ${aiResponse.content.mannerisms.slice(0, 2).join(', ')}`);
          }
          
          // Track metadata
          totalCost += aiResponse.metadata.cost || 0;
          totalTokens += aiResponse.metadata.tokensUsed || 0;
          
          results.push({
            testCase: testCase.name,
            success: true,
            analysis,
            duration,
            npc: aiResponse.content
          });
          
          successCount++;
          
        } else {
          console.error('❌ NPC Generation Failed:', aiResponse.error?.message);
          results.push({
            testCase: testCase.name,
            success: false,
            error: aiResponse.error?.message
          });
        }
        
      } catch (error) {
        console.error('❌ NPC Generation Failed:', error.message);
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
    generateNPCTestReport(results, successCount, testCases.length, totalCost, totalTokens);
    
    return successCount === testCases.length;
    
  } catch (error) {
    console.error('❌ NPC Generator Test Failed:', error.message);
    return false;
  }
}

// Build NPC prompt (simplified version)
function buildNPCPrompt(request) {
  let prompt = `Create a detailed D&D 5e NPC with rich personality and background:

CORE REQUIREMENTS:
- Role: ${request.role}
- Importance: ${request.importance}`;

  if (request.name) prompt += `\n- Name: ${request.name}`;
  if (request.race) prompt += `\n- Race: ${request.race}`;
  if (request.class) prompt += `\n- Class: ${request.class}`;
  if (request.level) prompt += `\n- Level: ${request.level}`;
  if (request.location) prompt += `\n- Location: ${request.location}`;
  if (request.occupation) prompt += `\n- Occupation: ${request.occupation}`;
  if (request.alignment) prompt += `\n- Alignment: ${request.alignment}`;

  if (request.campaignTheme || request.settingType) {
    prompt += `\n\nCAMPAIGN CONTEXT:`;
    if (request.campaignTheme) prompt += `\n- Theme: ${request.campaignTheme}`;
    if (request.settingType) prompt += `\n- Setting: ${request.settingType}`;
  }

  if (request.age || request.gender || request.socialClass || request.wealth) {
    prompt += `\n\nDEMOGRAPHICS:`;
    if (request.age) prompt += `\n- Age Category: ${request.age}`;
    if (request.gender) prompt += `\n- Gender: ${request.gender}`;
    if (request.socialClass) prompt += `\n- Social Class: ${request.socialClass}`;
    if (request.wealth) prompt += `\n- Wealth Level: ${request.wealth}`;
    if (request.reputation) prompt += `\n- Reputation: ${request.reputation}`;
  }

  if (request.personalityTraits || request.ideals || request.bonds || request.flaws) {
    prompt += `\n\nPERSONALITY SEEDS:`;
    if (request.personalityTraits) prompt += `\n- Traits: ${request.personalityTraits.join(', ')}`;
    if (request.ideals) prompt += `\n- Ideals: ${request.ideals.join(', ')}`;
    if (request.bonds) prompt += `\n- Bonds: ${request.bonds.join(', ')}`;
    if (request.flaws) prompt += `\n- Flaws: ${request.flaws.join(', ')}`;
  }

  if (request.physicalTraits || request.clothing) {
    prompt += `\n\nAPPEARANCE HINTS:`;
    if (request.physicalTraits) prompt += `\n- Physical: ${request.physicalTraits.join(', ')}`;
    if (request.clothing) prompt += `\n- Clothing: ${request.clothing.join(', ')}`;
  }

  if (request.relationships && request.relationships.length > 0) {
    prompt += `\n\nRELATIONSHIP SEEDS:`;
    request.relationships.forEach(rel => {
      prompt += `\n- ${rel.type} with ${rel.target}: ${rel.description}`;
    });
  }

  if (request.plotHooks && request.plotHooks.length > 0) {
    prompt += `\n\nPLOT HOOK SEEDS:`;
    request.plotHooks.forEach(hook => {
      prompt += `\n- ${hook}`;
    });
  }

  if (request.secrets && request.secrets.length > 0) {
    prompt += `\n\nSECRET SEEDS:`;
    request.secrets.forEach(secret => {
      prompt += `\n- ${secret}`;
    });
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
1. Create a memorable, three-dimensional character with clear motivations
2. Include specific personality traits, ideals, bonds, and flaws
3. Provide detailed physical description and mannerisms
4. Generate appropriate background and history
5. Include speech patterns and voice characteristics
6. Create meaningful relationships and connections
7. Ensure the character fits their role and social position
8. Add interesting secrets or hidden depths
9. Make them useful for roleplay and story development
10. Use only SRD-safe content (no Product Identity terms)
11. Include appropriate ability scores for their role and level
12. Add skills, equipment, and other details as needed

Return a complete NPC in JSON format with: name, race, class, level, alignment, abilityScores, personalityTraits (array), ideals (array), bonds (array), flaws (array), appearance (string), mannerisms (array), background (string), equipment (array), relationships (array), and any other relevant details.`;

  return prompt;
}

// Analyze generated NPC quality
function analyzeGeneratedNPC(npc, testCase) {
  let personalityScore = 100;
  let roleplayScore = 100;
  let plotScore = 100;

  // Check personality completeness
  if (!npc.personalityTraits || npc.personalityTraits.length < 2) personalityScore -= 20;
  if (!npc.ideals || npc.ideals.length < 1) personalityScore -= 15;
  if (!npc.bonds || npc.bonds.length < 1) personalityScore -= 15;
  if (!npc.flaws || npc.flaws.length < 1) personalityScore -= 15;

  // Check roleplay utility
  if (!npc.appearance) roleplayScore -= 20;
  if (!npc.mannerisms || npc.mannerisms.length < 2) roleplayScore -= 15;
  if (!npc.background) roleplayScore -= 15;

  // Check plot integration
  if (!npc.relationships || npc.relationships.length < 1) plotScore -= 20;
  if (testCase.request.importance === 'major' || testCase.request.importance === 'central') {
    if (!npc.secrets || npc.secrets?.length < 1) plotScore -= 15;
  }

  // Check feature matching
  const expectedFeatures = testCase.expectedFeatures || [];
  const npcText = JSON.stringify(npc).toLowerCase();
  
  let matchedFeatures = 0;
  for (const feature of expectedFeatures) {
    if (npcText.includes(feature.toLowerCase().replace(' ', ''))) {
      matchedFeatures++;
    }
  }

  if (expectedFeatures.length > 0) {
    const featureMatchRate = matchedFeatures / expectedFeatures.length;
    personalityScore = Math.round(personalityScore * (0.8 + 0.2 * featureMatchRate));
  }

  return {
    personalityScore: Math.max(0, personalityScore),
    roleplayScore: Math.max(0, roleplayScore),
    plotScore: Math.max(0, plotScore),
    matchedFeatures,
    totalFeatures: expectedFeatures.length
  };
}

// Generate comprehensive test report
function generateNPCTestReport(results, successCount, totalTests, totalCost, totalTokens) {
  console.log('\n📊 COMPREHENSIVE NPC GENERATOR TEST REPORT');
  console.log('='.repeat(60));
  
  // Overall statistics
  console.log(`📈 Overall Results:`);
  console.log(`   Success Rate: ${successCount}/${totalTests} (${Math.round(successCount/totalTests*100)}%)`);
  console.log(`   Total Cost: $${totalCost.toFixed(6)}`);
  console.log(`   Total Tokens: ${totalTokens}`);
  console.log(`   Average Cost: $${(totalCost/successCount || 0).toFixed(6)} per NPC`);
  
  // Quality analysis
  const successfulResults = results.filter(r => r.success);
  if (successfulResults.length > 0) {
    const avgPersonalityScore = successfulResults.reduce((sum, r) => sum + r.analysis.personalityScore, 0) / successfulResults.length;
    const avgRoleplayScore = successfulResults.reduce((sum, r) => sum + r.analysis.roleplayScore, 0) / successfulResults.length;
    const avgPlotScore = successfulResults.reduce((sum, r) => sum + r.analysis.plotScore, 0) / successfulResults.length;
    
    console.log(`\n🎭 Character Quality:`);
    console.log(`   Average Personality Score: ${avgPersonalityScore.toFixed(1)}/100`);
    console.log(`   Average Roleplay Utility: ${avgRoleplayScore.toFixed(1)}/100`);
    console.log(`   Average Plot Integration: ${avgPlotScore.toFixed(1)}/100`);
  }
  
  // Individual test results
  console.log(`\n📋 Individual Test Results:`);
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const qualityInfo = result.success ? 
      ` (Personality: ${result.analysis.personalityScore}/100, Roleplay: ${result.analysis.roleplayScore}/100, Plot: ${result.analysis.plotScore}/100)` : 
      ` (${result.error})`;
    
    console.log(`   ${status} ${result.testCase}${qualityInfo}`);
  });
  
  // Performance analysis
  const avgDuration = successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length;
  console.log(`\n⚡ Performance:`);
  console.log(`   Average Generation Time: ${avgDuration.toFixed(0)}ms`);
  console.log(`   Fastest Generation: ${Math.min(...successfulResults.map(r => r.duration))}ms`);
  console.log(`   Slowest Generation: ${Math.max(...successfulResults.map(r => r.duration))}ms`);
  
  // Character examples
  console.log(`\n🎭 Generated Character Examples:`);
  successfulResults.slice(0, 2).forEach(result => {
    const npc = result.npc;
    console.log(`   📝 ${npc.name || 'Generated NPC'} (${npc.race || 'Unknown'} ${npc.class || 'Unknown'})`);
    console.log(`      Personality: ${(npc.personalityTraits || []).slice(0, 2).join(', ')}`);
    console.log(`      Ideal: ${(npc.ideals || [])[0] || 'Unknown'}`);
    console.log(`      Flaw: ${(npc.flaws || [])[0] || 'Unknown'}`);
  });
  
  // Quality assessment
  const avgPersonalityScore = successfulResults.length > 0 ? successfulResults.reduce((sum, r) => sum + r.analysis.personalityScore, 0) / successfulResults.length : 0;
  const avgRoleplayScore = successfulResults.length > 0 ? successfulResults.reduce((sum, r) => sum + r.analysis.roleplayScore, 0) / successfulResults.length : 0;
  const avgPlotScore = successfulResults.length > 0 ? successfulResults.reduce((sum, r) => sum + r.analysis.plotScore, 0) / successfulResults.length : 0;
  const qualityGrade = getNPCQualityGrade(successCount/totalTests, avgPersonalityScore, avgRoleplayScore, avgPlotScore);
  console.log(`\n🏆 Overall Quality Grade: ${qualityGrade}`);
  
  console.log(`\n🎉 NPC Generator ${successCount === totalTests ? 'PASSED' : 'NEEDS IMPROVEMENT'} - Ready for ${successCount === totalTests ? 'production' : 'further development'}!`);
}

// Calculate quality grade
function getNPCQualityGrade(successRate, personalityScore, roleplayScore, plotScore) {
  const overallScore = (successRate * 100 * 0.3) + (personalityScore * 0.25) + (roleplayScore * 0.25) + (plotScore * 0.2);
  
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
testNPCGeneration().catch(console.error);
