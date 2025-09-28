// Test Background/Feat Generator - Comprehensive Testing of SRD-Safe Character Options
import OpenAI from 'openai';

// Set up environment for testing
process.env.OPENAI_API_KEY = ''; // Add your OpenAI API key here for testing

console.log('🎭 Testing Mythwright Background/Feat Generator...\n');

// Test cases covering different content types and themes
const testCases = [
  {
    name: 'Artisan Background',
    request: {
      contentType: 'background',
      name: 'Village Artisan',
      backgroundType: 'artisan',
      socialClass: 'artisan',
      profession: 'blacksmith',
      environment: 'rural',
      theme: 'classic_fantasy',
      culturalContext: 'medieval_european',
      complexity: 'moderate',
      balanceTarget: 'standard',
      skillFocus: ['Athletics', 'Investigation'],
      abilityScoreIncrease: false,
      languageOptions: true,
      toolProficiencies: true,
      srdCompliance: true,
      flavorText: true,
      mechanicalBenefit: true,
      roleplayHooks: true,
      mustIncludeElements: ['guild connections', 'crafting expertise', 'community ties']
    },
    expectedFeatures: ['artisan tools', 'guild', 'crafting', 'village community']
  },
  {
    name: 'Combat Feat',
    request: {
      contentType: 'feat',
      name: 'Tactical Striker',
      featCategory: 'combat',
      prerequisite: 'ability_score',
      powerLevel: 'moderate',
      theme: 'classic_fantasy',
      complexity: 'moderate',
      balanceTarget: 'standard',
      skillFocus: ['Athletics', 'Intimidation'],
      abilityScoreIncrease: true,
      srdCompliance: true,
      flavorText: true,
      mechanicalBenefit: true,
      mustIncludeElements: ['combat maneuver', 'tactical advantage', 'weapon proficiency']
    },
    expectedFeatures: ['combat benefit', 'tactical', 'weapon', 'ability score']
  },
  {
    name: 'Scholar Background',
    request: {
      contentType: 'background',
      name: 'Wandering Scholar',
      backgroundType: 'scholar',
      socialClass: 'clergy',
      profession: 'scholar',
      environment: 'urban',
      theme: 'high_magic',
      culturalContext: 'ancient_greco_roman',
      complexity: 'complex',
      balanceTarget: 'generous',
      skillFocus: ['Arcana', 'History', 'Investigation'],
      abilityScoreIncrease: false,
      languageOptions: true,
      toolProficiencies: false,
      srdCompliance: true,
      flavorText: true,
      mechanicalBenefit: true,
      roleplayHooks: true,
      mustIncludeElements: ['ancient knowledge', 'research network', 'scholarly reputation'],
      avoidProductIdentity: ['Candlekeep', 'Mystra', 'Waterdeep']
    },
    expectedFeatures: ['scholar', 'knowledge', 'research', 'ancient learning']
  },
  {
    name: 'Utility Feat',
    request: {
      contentType: 'feat',
      name: 'Master Craftsperson',
      featCategory: 'crafting',
      prerequisite: 'skill_proficiency',
      powerLevel: 'minor',
      theme: 'classic_fantasy',
      complexity: 'simple',
      balanceTarget: 'conservative',
      skillFocus: ['Investigation'],
      abilityScoreIncrease: false,
      toolProficiencies: true,
      srdCompliance: true,
      flavorText: true,
      mechanicalBenefit: true,
      mustIncludeElements: ['crafting bonus', 'tool expertise', 'quality improvement']
    },
    expectedFeatures: ['crafting', 'tools', 'expertise', 'quality']
  }
];

// Test background/feat generation with comprehensive analysis
async function testBackgroundFeatGeneration() {
  console.log('🧪 Starting Background/Feat Generator Tests...\n');
  
  try {
    let successCount = 0;
    let totalCost = 0;
    let totalTokens = 0;
    const results = [];
    
    for (const testCase of testCases) {
      console.log(`🎯 Test Case: ${testCase.name}`);
      console.log(`🎭 Type: ${testCase.request.contentType}, Theme: ${testCase.request.theme}`);
      console.log(`⚖️ Balance: ${testCase.request.balanceTarget}, Complexity: ${testCase.request.complexity}`);
      console.log(`🛡️ SRD Compliance: ${testCase.request.srdCompliance ? 'Required' : 'Optional'}`);
      
      try {
        const startTime = Date.now();
        
        // Create AI service mock for testing
        const mockAIService = {
          async generateContent(request) {
            const openai = new OpenAI({
              apiKey: process.env.OPENAI_API_KEY
            });
            
            console.log('🤖 Sending Background/Feat request to OpenAI...');
            console.log(`📝 Prompt length: ${request.prompt.length} characters`);
            
            try {
              const response = await openai.chat.completions.create({
                model: 'gpt-4o', // Use good model for structured content
                messages: [
                  { role: 'system', content: 'You are an expert D&D 5e content creator specializing in SRD-compliant character options that are balanced, engaging, and legally safe for publication.' },
                  { role: 'user', content: request.prompt }
                ],
                temperature: 0.6, // Moderate creativity for balanced content
                max_tokens: getMaxTokensForContent(testCase.request.contentType, testCase.request.complexity),
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
        
        // Build content prompt
        const prompt = buildContentPrompt(testCase.request);
        
        // Generate content using AI
        const aiRequest = {
          type: testCase.request.contentType,
          prompt: prompt,
          context: {
            additionalContext: {
              contentType: testCase.request.contentType,
              theme: testCase.request.theme,
              complexity: testCase.request.complexity,
              balanceTarget: testCase.request.balanceTarget,
              srdCompliance: testCase.request.srdCompliance
            }
          },
          options: {
            temperature: 0.6,
            maxTokens: getMaxTokensForContent(testCase.request.contentType, testCase.request.complexity)
          }
        };
        
        const aiResponse = await mockAIService.generateContent(aiRequest);
        const duration = Date.now() - startTime;
        
        if (aiResponse.success) {
          console.log('✅ Background/Feat Generation Successful!');
          console.log(`⏱️ Generation Time: ${duration}ms`);
          
          // Analyze the generated content
          const analysis = analyzeGeneratedContent(aiResponse.content, testCase);
          console.log('📋 Content Analysis:');
          console.log(`   - Name: ${aiResponse.content.name || 'Generated Content'}`);
          console.log(`   - Structure Score: ${analysis.structureScore}/100`);
          console.log(`   - Balance Score: ${analysis.balanceScore}/100`);
          console.log(`   - SRD Compliance: ${analysis.srdCompliance}/100`);
          console.log(`   - Feature Match: ${analysis.featureMatchScore}/100`);
          
          // Show content details
          if (aiResponse.content.description) {
            console.log(`📖 Description: ${aiResponse.content.description.substring(0, 120)}...`);
          }
          
          // Show type-specific details
          if (testCase.request.contentType === 'background') {
            if (aiResponse.content.skillProficiencies) {
              console.log(`🎯 Skills: ${aiResponse.content.skillProficiencies.slice(0, 3).join(', ')}`);
            }
            if (aiResponse.content.feature) {
              console.log(`⭐ Feature: ${aiResponse.content.feature.name}`);
            }
          } else if (testCase.request.contentType === 'feat') {
            if (aiResponse.content.benefits) {
              console.log(`💪 Benefits: ${aiResponse.content.benefits.length} mechanical benefits`);
            }
            if (aiResponse.content.prerequisite) {
              console.log(`📋 Prerequisite: ${aiResponse.content.prerequisite}`);
            }
          }
          
          // Perform content validation
          const contentValidation = performContentValidation(aiResponse.content, testCase.request);
          console.log('🛡️ Content Validation:');
          console.log(`   - Structure Valid: ${contentValidation.structureValid ? '✅' : '❌'}`);
          console.log(`   - SRD Compliant: ${contentValidation.srdCompliant ? '✅' : '❌'}`);
          console.log(`   - Balance Appropriate: ${contentValidation.balanceAppropriate ? '✅' : '❌'}`);
          console.log(`   - Overall Quality: ${contentValidation.overallQuality}`);
          
          if (contentValidation.issues.length > 0) {
            console.log(`⚠️ Content Issues: ${contentValidation.issues.slice(0, 2).join(', ')}`);
          }
          
          // Track metadata
          totalCost += aiResponse.metadata.cost || 0;
          totalTokens += aiResponse.metadata.tokensUsed || 0;
          
          results.push({
            testCase: testCase.name,
            success: true,
            analysis,
            contentValidation,
            duration,
            content: aiResponse.content
          });
          
          successCount++;
          
        } else {
          console.error('❌ Background/Feat Generation Failed:', aiResponse.error?.message);
          results.push({
            testCase: testCase.name,
            success: false,
            error: aiResponse.error?.message
          });
        }
        
      } catch (error) {
        console.error('❌ Background/Feat Generation Failed:', error.message);
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
    generateContentTestReport(results, successCount, testCases.length, totalCost, totalTokens);
    
    return successCount === testCases.length;
    
  } catch (error) {
    console.error('❌ Background/Feat Generator Test Failed:', error.message);
    return false;
  }
}

// Get max tokens for content
function getMaxTokensForContent(contentType, complexity) {
  let baseTokens = contentType === 'background' ? 800 : 400;
  
  switch (complexity) {
    case 'simple':
      baseTokens *= 0.8;
      break;
    case 'moderate':
      baseTokens *= 1.0;
      break;
    case 'complex':
      baseTokens *= 1.3;
      break;
    case 'advanced':
      baseTokens *= 1.6;
      break;
  }
  
  return Math.round(baseTokens);
}

// Build content prompt (simplified version)
function buildContentPrompt(request) {
  let prompt = `Create a D&D 5e ${request.contentType} that is completely SRD-compliant and legally safe:

CORE REQUIREMENTS:
- Content Type: ${request.contentType}
- Theme: ${request.theme}
- Complexity: ${request.complexity}
- Balance Target: ${request.balanceTarget}
- SRD COMPLIANCE: MANDATORY - Use only Open Game License content`;

  if (request.name) {
    prompt += `\n- Name: ${request.name}`;
  }

  // Add type-specific requirements
  if (request.contentType === 'background') {
    prompt += `\n\nBACKGROUND SPECIFIC:`;
    if (request.backgroundType) prompt += `\n- Background Type: ${request.backgroundType}`;
    if (request.socialClass) prompt += `\n- Social Class: ${request.socialClass}`;
    if (request.profession) prompt += `\n- Profession: ${request.profession}`;
    if (request.environment) prompt += `\n- Environment: ${request.environment}`;
    
    prompt += `\n\nBACKGROUND STRUCTURE REQUIREMENTS:`;
    prompt += `\n- Provide 2 skill proficiencies from SRD skill list`;
    prompt += `\n- Include tool proficiencies or language options`;
    prompt += `\n- Provide starting equipment appropriate to the background`;
    prompt += `\n- Include a background feature with clear mechanical benefit`;
    prompt += `\n- Provide personality trait, ideal, bond, and flaw tables`;
  } else if (request.contentType === 'feat') {
    prompt += `\n\nFEAT SPECIFIC:`;
    if (request.featCategory) prompt += `\n- Feat Category: ${request.featCategory}`;
    if (request.prerequisite) prompt += `\n- Prerequisite Type: ${request.prerequisite}`;
    if (request.powerLevel) prompt += `\n- Power Level: ${request.powerLevel}`;
    
    prompt += `\n\nFEAT STRUCTURE REQUIREMENTS:`;
    prompt += `\n- Provide clear, balanced mechanical benefits`;
    prompt += `\n- Include prerequisites if appropriate for balance`;
    prompt += `\n- Ensure feat fills a specific mechanical or thematic niche`;
    prompt += `\n- Balance power level with existing SRD feats`;
  }

  // Add mechanical requirements
  prompt += `\n\nMECHANICAL REQUIREMENTS:`;
  
  if (request.skillFocus && request.skillFocus.length > 0) {
    prompt += `\n- Skill Focus: ${request.skillFocus.join(', ')}`;
  }
  
  if (request.abilityScoreIncrease) {
    prompt += `\n- Include ability score increase options`;
  }
  
  if (request.languageOptions) {
    prompt += `\n- Include language learning options`;
  }
  
  if (request.toolProficiencies) {
    prompt += `\n- Include tool proficiency options`;
  }

  // Add cultural context
  if (request.culturalContext) {
    prompt += `\n\nCULTURAL CONTEXT: ${request.culturalContext}`;
  }

  // Add content requirements
  if (request.flavorText || request.mechanicalBenefit || request.roleplayHooks) {
    prompt += `\n\nCONTENT ELEMENTS:`;
    if (request.flavorText) prompt += `\n- Rich flavor text and background lore`;
    if (request.mechanicalBenefit) prompt += `\n- Clear mechanical benefits and rules`;
    if (request.roleplayHooks) prompt += `\n- Roleplay hooks and character development options`;
  }

  // Add must-include elements
  if (request.mustIncludeElements && request.mustIncludeElements.length > 0) {
    prompt += `\n\nMUST INCLUDE:`;
    request.mustIncludeElements.forEach(element => {
      prompt += `\n- ${element}`;
    });
  }

  // Add SRD compliance warnings
  prompt += `\n\nSRD COMPLIANCE REQUIREMENTS:`;
  prompt += `\n- Use ONLY Open Game License content`;
  prompt += `\n- NEVER use Product Identity terms`;
  prompt += `\n- Avoid specific D&D setting names, deities, or unique creatures`;
  prompt += `\n- Use generic fantasy terms and concepts`;
  prompt += `\n- Reference only SRD spells, equipment, and rules`;

  if (request.avoidProductIdentity && request.avoidProductIdentity.length > 0) {
    prompt += `\n\nAVOID THESE TERMS:`;
    request.avoidProductIdentity.forEach(term => {
      prompt += `\n- ${term}`;
    });
  }

  // Add balance guidance
  prompt += getBalanceGuidance(request.balanceTarget);

  prompt += `\n\nCRITICAL SRD COMPLIANCE RULES:
1. Use ONLY content from the System Reference Document (SRD)
2. NEVER reference specific D&D campaign settings or locations
3. NEVER use Product Identity creature names or unique terms
4. Use generic fantasy language and concepts only
5. All mechanical elements must be SRD-compatible
6. Avoid trademarked spell names or unique magical items
7. Use only SRD-listed skills, tools, and languages
8. Ensure all content can be legally published under OGL
9. Create original names that don't reference copyrighted material
10. Focus on universal fantasy themes and mechanics

Return a complete ${request.contentType} in JSON format with all required fields, mechanical benefits, and SRD-compliant content.`;

  return prompt;
}

// Get balance guidance
function getBalanceGuidance(target) {
  let guidance = `\n\nBALANCE GUIDANCE (${target.toUpperCase()}):`;
  
  switch (target) {
    case 'conservative':
      guidance += `\n- Err on the side of slightly underpowered
- Focus on utility and flavor over raw power
- Ensure no mechanical element is stronger than SRD equivalents`;
      break;
    case 'standard':
      guidance += `\n- Match power level of existing SRD content
- Balance mechanical benefits with appropriate costs or limitations
- Ensure content fills a distinct niche`;
      break;
    case 'generous':
      guidance += `\n- Allow slightly more powerful options while maintaining balance
- Provide multiple mechanical benefits that work together
- Ensure content is attractive and competitive with existing options`;
      break;
    case 'experimental':
      guidance += `\n- Explore new mechanical concepts while maintaining overall balance
- Allow for innovative combinations of existing mechanics
- Ensure experimental elements have clear limitations`;
      break;
  }
  
  return guidance;
}

// Analyze generated content quality
function analyzeGeneratedContent(content, testCase) {
  let structureScore = 100;
  let balanceScore = 100;
  let srdCompliance = 100;
  let featureMatchScore = 100;

  // Check basic structure
  if (!content.name) structureScore -= 15;
  if (!content.description) structureScore -= 20;

  // Type-specific structure checks
  if (testCase.request.contentType === 'background') {
    if (!content.skillProficiencies || !Array.isArray(content.skillProficiencies)) structureScore -= 25;
    if (!content.feature) structureScore -= 20;
    if (!content.personalityTraits) structureScore -= 10;
    if (!content.ideals) structureScore -= 10;
    if (!content.bonds) structureScore -= 10;
    if (!content.flaws) structureScore -= 10;
  } else if (testCase.request.contentType === 'feat') {
    if (!content.benefits || !Array.isArray(content.benefits)) structureScore -= 30;
  }

  // Balance assessment (simplified)
  if (testCase.request.contentType === 'background') {
    const skillCount = content.skillProficiencies ? content.skillProficiencies.length : 0;
    if (skillCount > 3) balanceScore -= 20;
    else if (skillCount < 2) balanceScore -= 15;
  } else if (testCase.request.contentType === 'feat') {
    const benefitCount = content.benefits ? content.benefits.length : 0;
    if (benefitCount > 4) balanceScore -= 25;
    else if (benefitCount < 1) balanceScore -= 30;
  }

  // SRD compliance check (simplified)
  const contentText = JSON.stringify(content).toLowerCase();
  const problematicTerms = ['waterdeep', 'neverwinter', 'mystra', 'tiamat', 'beholder'];
  
  for (const term of problematicTerms) {
    if (contentText.includes(term)) {
      srdCompliance -= 30;
      break;
    }
  }

  // Feature matching analysis
  const expectedFeatures = testCase.expectedFeatures || [];
  let matchedFeatures = 0;
  
  for (const feature of expectedFeatures) {
    if (contentText.includes(feature.toLowerCase().replace(' ', ''))) {
      matchedFeatures++;
    }
  }

  if (expectedFeatures.length > 0) {
    featureMatchScore = Math.round((matchedFeatures / expectedFeatures.length) * 100);
  }

  // Check must-include requirements
  if (testCase.request.mustIncludeElements) {
    for (const requirement of testCase.request.mustIncludeElements) {
      if (!contentText.includes(requirement.toLowerCase())) {
        featureMatchScore -= 15;
      }
    }
  }

  return {
    structureScore: Math.max(0, Math.min(100, structureScore)),
    balanceScore: Math.max(0, Math.min(100, balanceScore)),
    srdCompliance: Math.max(0, Math.min(100, srdCompliance)),
    featureMatchScore: Math.max(0, Math.min(100, featureMatchScore)),
    matchedFeatures,
    totalFeatures: expectedFeatures.length
  };
}

// Perform content validation
function performContentValidation(content, request) {
  const issues = [];
  
  // Structure validation
  const structureValid = content.name && content.description;
  if (!structureValid) {
    issues.push('Missing basic structure elements (name or description)');
  }

  // Type-specific validation
  if (request.contentType === 'background') {
    if (!content.skillProficiencies || content.skillProficiencies.length < 2) {
      issues.push('Background missing required skill proficiencies');
    }
    if (!content.feature) {
      issues.push('Background missing required feature');
    }
  } else if (request.contentType === 'feat') {
    if (!content.benefits || content.benefits.length < 1) {
      issues.push('Feat missing required benefits');
    }
  }

  // SRD compliance validation (simplified)
  const contentText = JSON.stringify(content).toLowerCase();
  const problematicTerms = ['waterdeep', 'neverwinter', 'mystra', 'tiamat', 'beholder'];
  const srdCompliant = !problematicTerms.some(term => contentText.includes(term));
  
  if (!srdCompliant) {
    issues.push('Contains potentially non-SRD compliant terms');
  }

  // Balance validation (simplified)
  let balanceAppropriate = true;
  if (request.contentType === 'background') {
    const skillCount = content.skillProficiencies ? content.skillProficiencies.length : 0;
    if (skillCount > 3) {
      balanceAppropriate = false;
      issues.push('Too many skill proficiencies for balance');
    }
  } else if (request.contentType === 'feat') {
    const benefitCount = content.benefits ? content.benefits.length : 0;
    if (benefitCount > 4) {
      balanceAppropriate = false;
      issues.push('Too many benefits for balance');
    }
  }

  // Overall quality assessment
  let overallQuality = 'Good';
  if (issues.length === 0) overallQuality = 'Excellent';
  else if (issues.length > 2) overallQuality = 'Needs Improvement';
  
  return {
    structureValid,
    srdCompliant,
    balanceAppropriate,
    overallQuality,
    issues
  };
}

// Generate comprehensive test report
function generateContentTestReport(results, successCount, totalTests, totalCost, totalTokens) {
  console.log('\n📊 COMPREHENSIVE BACKGROUND/FEAT GENERATOR TEST REPORT');
  console.log('='.repeat(70));
  
  // Overall statistics
  console.log(`📈 Overall Results:`);
  console.log(`   Success Rate: ${successCount}/${totalTests} (${Math.round(successCount/totalTests*100)}%)`);
  console.log(`   Total Cost: $${totalCost.toFixed(6)}`);
  console.log(`   Total Tokens: ${totalTokens}`);
  console.log(`   Average Cost: $${(totalCost/successCount || 0).toFixed(6)} per item`);
  
  // Quality analysis
  const successfulResults = results.filter(r => r.success);
  if (successfulResults.length > 0) {
    const avgStructureScore = successfulResults.reduce((sum, r) => sum + r.analysis.structureScore, 0) / successfulResults.length;
    const avgBalanceScore = successfulResults.reduce((sum, r) => sum + r.analysis.balanceScore, 0) / successfulResults.length;
    const avgSRDCompliance = successfulResults.reduce((sum, r) => sum + r.analysis.srdCompliance, 0) / successfulResults.length;
    const avgFeatureScore = successfulResults.reduce((sum, r) => sum + r.analysis.featureMatchScore, 0) / successfulResults.length;
    const validationPassCount = successfulResults.filter(r => r.contentValidation.overallQuality === 'Excellent' || r.contentValidation.overallQuality === 'Good').length;
    
    console.log(`\n🎭 Content Quality:`);
    console.log(`   Average Structure Score: ${avgStructureScore.toFixed(1)}/100`);
    console.log(`   Average Balance Score: ${avgBalanceScore.toFixed(1)}/100`);
    console.log(`   Average SRD Compliance: ${avgSRDCompliance.toFixed(1)}/100`);
    console.log(`   Average Feature Match: ${avgFeatureScore.toFixed(1)}/100`);
    console.log(`   Validation Pass Rate: ${validationPassCount}/${successfulResults.length} (${Math.round(validationPassCount/successfulResults.length*100)}%)`);
  }
  
  // Individual test results
  console.log(`\n📋 Individual Test Results:`);
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const qualityInfo = result.success ? 
      ` (Structure: ${result.analysis.structureScore}/100, Balance: ${result.analysis.balanceScore}/100, SRD: ${result.analysis.srdCompliance}/100, Validation: ${result.contentValidation.overallQuality})` : 
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
  
  // Content examples
  console.log(`\n🎭 Generated Content Examples:`);
  successfulResults.slice(0, 2).forEach(result => {
    const content = result.content;
    console.log(`   ⭐ ${content.name || 'Generated Content'}`);
    console.log(`      Type: ${result.testCase.includes('Background') ? 'Background' : 'Feat'}`);
    if (content.description) {
      console.log(`      Description: ${content.description.substring(0, 80)}...`);
    }
  });
  
  // Quality assessment
  const finalAvgStructureScore = successfulResults.length > 0 ? successfulResults.reduce((sum, r) => sum + r.analysis.structureScore, 0) / successfulResults.length : 0;
  const finalAvgBalanceScore = successfulResults.length > 0 ? successfulResults.reduce((sum, r) => sum + r.analysis.balanceScore, 0) / successfulResults.length : 0;
  const finalAvgSRDCompliance = successfulResults.length > 0 ? successfulResults.reduce((sum, r) => sum + r.analysis.srdCompliance, 0) / successfulResults.length : 0;
  const finalValidationPassCount = successfulResults.filter(r => r.contentValidation.overallQuality === 'Excellent' || r.contentValidation.overallQuality === 'Good').length;
  const finalValidationRate = successfulResults.length > 0 ? finalValidationPassCount / successfulResults.length : 0;
  const qualityGrade = getContentQualityGrade(successCount/totalTests, finalAvgStructureScore, finalAvgBalanceScore, finalAvgSRDCompliance, finalValidationRate);
  console.log(`\n🏆 Overall Quality Grade: ${qualityGrade}`);
  
  console.log(`\n🎉 Background/Feat Generator ${successCount === totalTests ? 'PASSED' : 'NEEDS IMPROVEMENT'} - Ready for ${successCount === totalTests ? 'production' : 'further development'}!`);
}

// Calculate quality grade
function getContentQualityGrade(successRate, structureScore, balanceScore, srdCompliance, validationRate) {
  const overallScore = (successRate * 100 * 0.25) + (structureScore * 0.2) + (balanceScore * 0.2) + (srdCompliance * 0.2) + (validationRate * 100 * 0.15);
  
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
testBackgroundFeatGeneration().catch(console.error);
