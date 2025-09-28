// Test Narrative Generator - Comprehensive Testing of D&D Narrative Content Generation
import OpenAI from 'openai';

// Set up environment for testing
process.env.OPENAI_API_KEY = ''; // Add your OpenAI API key here for testing

console.log('📖 Testing Mythwright Narrative Generator...\n');

// Test cases covering different narrative types and purposes
const testCases = [
  {
    name: 'Atmospheric Boxed Text',
    request: {
      contentType: 'boxed_text',
      purpose: 'scene_setting',
      length: 'medium',
      setting: 'dungeon',
      atmosphere: 'mysterious',
      timeOfDay: 'night',
      targetAudience: 'players',
      toneStyle: 'dramatic',
      voiceStyle: 'immersive',
      emotionalTone: 'curious',
      perspectiveType: 'second_person',
      sensoryFocus: ['visual', 'auditory', 'olfactory'],
      boxedTextStyle: 'read_aloud',
      includeSensory: true,
      theme: 'classic_fantasy',
      languageStyle: 'rich_vocabulary',
      mustInclude: ['ancient stone', 'flickering torchlight', 'echo of footsteps'],
      maxSentences: 6
    },
    expectedFeatures: ['second person', 'sensory details', 'mysterious atmosphere', 'dungeon setting']
  },
  {
    name: 'Character Introduction',
    request: {
      contentType: 'character_description',
      purpose: 'character_introduction',
      length: 'short',
      setting: 'tavern',
      atmosphere: 'welcoming',
      targetAudience: 'players',
      toneStyle: 'casual',
      voiceStyle: 'descriptive',
      emotionalTone: 'neutral',
      perspectiveType: 'third_person_limited',
      sensoryFocus: ['visual', 'auditory'],
      includeDialogue: true,
      includeSensory: true,
      theme: 'heroic_fantasy',
      characterFocus: ['tavern keeper', 'friendly demeanor'],
      mustInclude: ['warm smile', 'welcoming gesture', 'local accent'],
      readingLevel: 'high_school'
    },
    expectedFeatures: ['character description', 'dialogue', 'tavern setting', 'friendly tone']
  },
  {
    name: 'Environmental Description',
    request: {
      contentType: 'environmental_description',
      purpose: 'world_building',
      length: 'long',
      setting: 'forest',
      atmosphere: 'ancient',
      timeOfDay: 'dawn',
      weather: 'misty',
      season: 'autumn',
      targetAudience: 'dungeon_master',
      toneStyle: 'poetic',
      voiceStyle: 'literary',
      emotionalTone: 'nostalgic',
      perspectiveType: 'third_person_omniscient',
      sensoryFocus: ['visual', 'olfactory', 'tactile', 'auditory'],
      includeSensory: true,
      theme: 'high_fantasy',
      culturalContext: 'celtic_gaelic',
      languageStyle: 'poetic_language',
      keyElements: ['ancient oaks', 'morning mist', 'fallen leaves', 'wildlife sounds'],
      mustInclude: ['timeless quality', 'natural magic', 'peaceful atmosphere']
    },
    expectedFeatures: ['environmental focus', 'poetic language', 'sensory richness', 'ancient atmosphere']
  },
  {
    name: 'Dramatic Action Sequence',
    request: {
      contentType: 'action_sequence',
      purpose: 'tension_building',
      length: 'medium',
      setting: 'battlefield',
      atmosphere: 'tense',
      targetAudience: 'players',
      toneStyle: 'dramatic',
      voiceStyle: 'cinematic',
      emotionalTone: 'anxious',
      perspectiveType: 'second_person',
      sensoryFocus: ['visual', 'auditory', 'tactile'],
      includeAction: true,
      includeSensory: true,
      includeEmotion: true,
      theme: 'sword_and_sorcery',
      languageStyle: 'modern_english',
      keyElements: ['clashing weapons', 'battle cries', 'dust and smoke'],
      mustInclude: ['immediate danger', 'quick decisions', 'adrenaline rush'],
      maxSentences: 8
    },
    expectedFeatures: ['action focus', 'tension', 'second person', 'battlefield setting']
  }
];

// Test narrative generation with comprehensive analysis
async function testNarrativeGeneration() {
  console.log('🧪 Starting Narrative Generator Tests...\n');
  
  try {
    let successCount = 0;
    let totalCost = 0;
    let totalTokens = 0;
    const results = [];
    
    for (const testCase of testCases) {
      console.log(`🎯 Test Case: ${testCase.name}`);
      console.log(`📖 Type: ${testCase.request.contentType}, Purpose: ${testCase.request.purpose}`);
      console.log(`🎭 Length: ${testCase.request.length}, Tone: ${testCase.request.toneStyle}`);
      console.log(`🌍 Setting: ${testCase.request.setting}, Atmosphere: ${testCase.request.atmosphere}`);
      
      try {
        const startTime = Date.now();
        
        // Create AI service mock for testing
        const mockAIService = {
          async generateContent(request) {
            const openai = new OpenAI({
              apiKey: process.env.OPENAI_API_KEY
            });
            
            console.log('🤖 Sending Narrative request to OpenAI...');
            console.log(`📝 Prompt length: ${request.prompt.length} characters`);
            
            try {
              const response = await openai.chat.completions.create({
                model: 'gpt-4o', // Use good model for creative narrative
                messages: [
                  { role: 'system', content: 'You are an expert D&D narrative writer specializing in immersive, atmospheric content that enhances gameplay and storytelling.' },
                  { role: 'user', content: request.prompt }
                ],
                temperature: 0.8, // Higher creativity for narrative
                max_tokens: getMaxTokensForLength(testCase.request.length),
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
        
        // Build narrative prompt
        const prompt = buildNarrativePrompt(testCase.request);
        
        // Generate narrative using AI
        const aiRequest = {
          type: 'narrative',
          prompt: prompt,
          context: {
            additionalContext: {
              contentType: testCase.request.contentType,
              purpose: testCase.request.purpose,
              setting: testCase.request.setting,
              atmosphere: testCase.request.atmosphere,
              toneStyle: testCase.request.toneStyle,
              length: testCase.request.length
            }
          },
          options: {
            temperature: 0.8,
            maxTokens: getMaxTokensForLength(testCase.request.length)
          }
        };
        
        const aiResponse = await mockAIService.generateContent(aiRequest);
        const duration = Date.now() - startTime;
        
        if (aiResponse.success) {
          console.log('✅ Narrative Generation Successful!');
          console.log(`⏱️ Generation Time: ${duration}ms`);
          
          // Analyze the generated narrative
          const analysis = analyzeGeneratedNarrative(aiResponse.content, testCase);
          console.log('📋 Narrative Analysis:');
          console.log(`   - Title: ${aiResponse.content.title || 'Generated Narrative'}`);
          console.log(`   - Word Count: ${getWordCount(aiResponse.content)}`);
          console.log(`   - Quality Score: ${analysis.qualityScore}/100`);
          console.log(`   - Atmosphere Score: ${analysis.atmosphereScore}/100`);
          console.log(`   - Feature Match: ${analysis.featureMatchScore}/100`);
          
          // Show content excerpt
          if (aiResponse.content.mainText) {
            console.log(`📖 Content: ${aiResponse.content.mainText.substring(0, 150)}...`);
          }
          
          // Show atmosphere and tone
          if (aiResponse.content.atmosphere) {
            console.log(`🌟 Atmosphere: ${aiResponse.content.atmosphere}`);
          }
          
          // Perform quality validation
          const qualityValidation = performQualityValidation(aiResponse.content, testCase.request);
          console.log('🎭 Quality Validation:');
          console.log(`   - Length Appropriate: ${qualityValidation.lengthAppropriate ? '✅' : '❌'}`);
          console.log(`   - Tone Consistent: ${qualityValidation.toneConsistent ? '✅' : '❌'}`);
          console.log(`   - Sensory Rich: ${qualityValidation.sensoryRich ? '✅' : '❌'}`);
          console.log(`   - Overall Quality: ${qualityValidation.overallQuality}`);
          
          if (qualityValidation.issues.length > 0) {
            console.log(`⚠️ Quality Issues: ${qualityValidation.issues.slice(0, 2).join(', ')}`);
          }
          
          // Track metadata
          totalCost += aiResponse.metadata.cost || 0;
          totalTokens += aiResponse.metadata.tokensUsed || 0;
          
          results.push({
            testCase: testCase.name,
            success: true,
            analysis,
            qualityValidation,
            duration,
            narrative: aiResponse.content
          });
          
          successCount++;
          
        } else {
          console.error('❌ Narrative Generation Failed:', aiResponse.error?.message);
          results.push({
            testCase: testCase.name,
            success: false,
            error: aiResponse.error?.message
          });
        }
        
      } catch (error) {
        console.error('❌ Narrative Generation Failed:', error.message);
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
    generateNarrativeTestReport(results, successCount, testCases.length, totalCost, totalTokens);
    
    return successCount === testCases.length;
    
  } catch (error) {
    console.error('❌ Narrative Generator Test Failed:', error.message);
    return false;
  }
}

// Get max tokens for length
function getMaxTokensForLength(length) {
  switch (length) {
    case 'brief': return 150;
    case 'short': return 300;
    case 'medium': return 600;
    case 'long': return 1000;
    case 'extended': return 1500;
    default: return 600;
  }
}

// Build narrative prompt (simplified version)
function buildNarrativePrompt(request) {
  const lengthGuidance = getLengthGuidance(request.length);
  
  let prompt = `Create immersive D&D 5e narrative content with rich atmospheric detail:

CORE REQUIREMENTS:
- Content Type: ${request.contentType}
- Purpose: ${request.purpose}
- Length: ${request.length} (${lengthGuidance})`;

  prompt += `\n\nSETTING & ATMOSPHERE:`;
  prompt += `\n- Setting: ${request.setting}`;
  prompt += `\n- Atmosphere: ${request.atmosphere}`;
  
  if (request.timeOfDay) prompt += `\n- Time of Day: ${request.timeOfDay}`;
  if (request.weather) prompt += `\n- Weather: ${request.weather}`;
  if (request.season) prompt += `\n- Season: ${request.season}`;

  prompt += `\n\nTONE & STYLE:`;
  prompt += `\n- Target Audience: ${request.targetAudience}`;
  prompt += `\n- Tone Style: ${request.toneStyle}`;
  prompt += `\n- Voice Style: ${request.voiceStyle}`;
  prompt += `\n- Emotional Tone: ${request.emotionalTone}`;
  prompt += `\n- Perspective: ${request.perspectiveType}`;
  
  if (request.languageStyle) prompt += `\n- Language Style: ${request.languageStyle}`;
  if (request.readingLevel) prompt += `\n- Reading Level: ${request.readingLevel}`;

  if (request.sensoryFocus && request.sensoryFocus.length > 0) {
    prompt += `\n\nSENSORY FOCUS:`;
    request.sensoryFocus.forEach(sense => {
      prompt += `\n- ${sense}: Include ${sense} descriptions`;
    });
  }

  if (request.keyElements && request.keyElements.length > 0) {
    prompt += `\n\nKEY ELEMENTS TO INCLUDE:`;
    request.keyElements.forEach(element => {
      prompt += `\n- ${element}`;
    });
  }

  if (request.characterFocus && request.characterFocus.length > 0) {
    prompt += `\n\nCHARACTER FOCUS:`;
    request.characterFocus.forEach(character => {
      prompt += `\n- ${character}`;
    });
  }

  if (request.includeDialogue || request.includeAction || request.includeSensory || request.includeEmotion) {
    prompt += `\n\nSPECIFIC REQUIREMENTS:`;
    if (request.includeDialogue) prompt += `\n- Include dialogue or character speech`;
    if (request.includeAction) prompt += `\n- Include action and movement`;
    if (request.includeSensory) prompt += `\n- Rich sensory descriptions`;
    if (request.includeEmotion) prompt += `\n- Emotional depth and resonance`;
  }

  if (request.boxedTextStyle) {
    prompt += `\n\nBOXED TEXT STYLE: ${request.boxedTextStyle}`;
    prompt += getBoxedTextGuidance(request.boxedTextStyle);
  }

  if (request.theme || request.culturalContext) {
    prompt += `\n\nTHEME & CONTEXT:`;
    if (request.theme) prompt += `\n- Theme: ${request.theme}`;
    if (request.culturalContext) prompt += `\n- Cultural Context: ${request.culturalContext}`;
  }

  if (request.mustInclude && request.mustInclude.length > 0) {
    prompt += `\n\nMUST INCLUDE:`;
    request.mustInclude.forEach(requirement => {
      prompt += `\n- ${requirement}`;
    });
  }

  if (request.maxSentences) {
    prompt += `\n\nLENGTH CONSTRAINTS:`;
    prompt += `\n- Maximum sentences: ${request.maxSentences}`;
  }

  prompt += getContentTypeGuidance(request.contentType, request.purpose);

  prompt += `\n\nCRITICAL REQUIREMENTS:
1. Create immersive, atmospheric narrative that draws readers in
2. Match the specified tone, style, and emotional resonance perfectly
3. Use rich sensory details to bring scenes to life
4. Ensure appropriate pacing for the content type and purpose
5. Write in a style appropriate for D&D gameplay and storytelling
6. Use only SRD-safe content (no Product Identity terms)
7. Make the content engaging and memorable for players
8. Ensure the narrative serves its intended purpose effectively
9. Balance descriptive detail with readability and flow
10. Create content that enhances the gaming experience

Return complete narrative content in JSON format with: title, mainText, contentType, atmosphere, wordCount, and any other relevant details.`;

  return prompt;
}

// Get length guidance
function getLengthGuidance(length) {
  switch (length) {
    case 'brief': return '1-2 sentences, concise and impactful';
    case 'short': return '3-5 sentences, focused and direct';
    case 'medium': return '1-2 paragraphs, balanced detail';
    case 'long': return '2-3 paragraphs, rich description';
    case 'extended': return '3+ paragraphs, comprehensive narrative';
    default: return '1-2 paragraphs, balanced detail';
  }
}

// Get boxed text guidance
function getBoxedTextGuidance(style) {
  let guidance = `\n\nBOXED TEXT GUIDANCE:`;
  
  switch (style) {
    case 'read_aloud':
      guidance += `\n- Write text meant to be read aloud to players
- Use second person ("you see", "you hear")
- Focus on immediate, observable details
- Create dramatic impact and atmosphere`;
      break;
    case 'atmospheric_quote':
      guidance += `\n- Create evocative, mood-setting text
- Use literary language and imagery
- Focus on emotional and atmospheric impact
- Keep it memorable and quotable`;
      break;
    default:
      guidance += `\n- Create engaging, immersive content
- Match the specified style and purpose
- Ensure content enhances the gaming experience`;
  }
  
  return guidance;
}

// Get content type guidance
function getContentTypeGuidance(contentType, purpose) {
  let guidance = `\n\nCONTENT TYPE GUIDANCE (${contentType.toUpperCase()}):`;
  
  switch (contentType) {
    case 'boxed_text':
      guidance += `\n- Format as distinct, highlighted text for DM reading
- Create immediate impact and atmosphere
- Use evocative language that sets the scene
- Make it easy to read aloud dramatically`;
      break;
    case 'character_description':
      guidance += `\n- Bring characters to life with vivid details
- Include appearance, mannerisms, and personality hints
- Show character through actions and dialogue
- Make characters memorable and distinctive`;
      break;
    case 'environmental_description':
      guidance += `\n- Paint vivid picture of the broader environment
- Include weather, lighting, and atmospheric conditions
- Create sense of place and mood
- Consider how environment affects gameplay`;
      break;
    case 'action_sequence':
      guidance += `\n- Create dynamic, engaging action narrative
- Use active voice and strong verbs
- Maintain clear sequence of events
- Build tension and excitement`;
      break;
  }
  
  return guidance;
}

// Get word count
function getWordCount(narrative) {
  if (!narrative.mainText) return 0;
  return narrative.mainText.split(/\s+/).filter(word => word.length > 0).length;
}

// Analyze generated narrative quality
function analyzeGeneratedNarrative(narrative, testCase) {
  let qualityScore = 100;
  let atmosphereScore = 100;
  let featureMatchScore = 100;

  // Check basic completeness
  if (!narrative.title) qualityScore -= 10;
  if (!narrative.mainText) qualityScore -= 30;
  if (!narrative.contentType) qualityScore -= 10;
  if (!narrative.atmosphere) qualityScore -= 10;

  // Check word count appropriateness
  const wordCount = getWordCount(narrative);
  const expectedWordCount = getExpectedWordCount(testCase.request.length);
  const lengthRatio = wordCount / expectedWordCount;
  
  if (lengthRatio < 0.7 || lengthRatio > 1.5) {
    qualityScore -= 15;
  }

  // Check atmosphere consistency
  if (narrative.atmosphere !== testCase.request.atmosphere) {
    atmosphereScore -= 20;
  }

  // Feature matching analysis
  const expectedFeatures = testCase.expectedFeatures || [];
  const narrativeText = narrative.mainText?.toLowerCase() || '';
  
  let matchedFeatures = 0;
  for (const feature of expectedFeatures) {
    if (narrativeText.includes(feature.toLowerCase().replace(' ', ''))) {
      matchedFeatures++;
    }
  }

  if (expectedFeatures.length > 0) {
    featureMatchScore = Math.round((matchedFeatures / expectedFeatures.length) * 100);
  }

  // Check must-include requirements
  if (testCase.request.mustInclude) {
    for (const requirement of testCase.request.mustInclude) {
      if (!narrativeText.includes(requirement.toLowerCase())) {
        featureMatchScore -= 15;
      }
    }
  }

  return {
    qualityScore: Math.max(0, Math.min(100, qualityScore)),
    atmosphereScore: Math.max(0, Math.min(100, atmosphereScore)),
    featureMatchScore: Math.max(0, Math.min(100, featureMatchScore)),
    matchedFeatures,
    totalFeatures: expectedFeatures.length
  };
}

// Get expected word count
function getExpectedWordCount(length) {
  switch (length) {
    case 'brief': return 20;
    case 'short': return 50;
    case 'medium': return 100;
    case 'long': return 200;
    case 'extended': return 300;
    default: return 100;
  }
}

// Perform quality validation
function performQualityValidation(narrative, request) {
  const issues = [];
  
  // Length validation
  const wordCount = getWordCount(narrative);
  const expectedWordCount = getExpectedWordCount(request.length);
  const lengthAppropriate = wordCount >= expectedWordCount * 0.7 && wordCount <= expectedWordCount * 1.5;
  
  if (!lengthAppropriate) {
    issues.push(`Word count (${wordCount}) outside expected range (${Math.round(expectedWordCount * 0.7)}-${Math.round(expectedWordCount * 1.5)})`);
  }

  // Tone validation
  const toneConsistent = narrative.atmosphere === request.atmosphere;
  if (!toneConsistent) {
    issues.push(`Atmosphere mismatch: expected ${request.atmosphere}, got ${narrative.atmosphere}`);
  }

  // Sensory validation
  const narrativeText = narrative.mainText?.toLowerCase() || '';
  const sensoryWords = ['see', 'hear', 'smell', 'feel', 'taste', 'touch', 'sound', 'sight'];
  const sensoryCount = sensoryWords.reduce((count, word) => 
    count + (narrativeText.includes(word) ? 1 : 0), 0);
  const sensoryRich = sensoryCount >= 2;
  
  if (!sensoryRich && request.includeSensory) {
    issues.push('Limited sensory descriptions despite requirement');
  }

  // Overall quality assessment
  let overallQuality = 'Good';
  if (issues.length === 0) overallQuality = 'Excellent';
  else if (issues.length > 2) overallQuality = 'Needs Improvement';
  
  return {
    lengthAppropriate,
    toneConsistent,
    sensoryRich,
    overallQuality,
    issues
  };
}

// Generate comprehensive test report
function generateNarrativeTestReport(results, successCount, totalTests, totalCost, totalTokens) {
  console.log('\n📊 COMPREHENSIVE NARRATIVE GENERATOR TEST REPORT');
  console.log('='.repeat(70));
  
  // Overall statistics
  console.log(`📈 Overall Results:`);
  console.log(`   Success Rate: ${successCount}/${totalTests} (${Math.round(successCount/totalTests*100)}%)`);
  console.log(`   Total Cost: $${totalCost.toFixed(6)}`);
  console.log(`   Total Tokens: ${totalTokens}`);
  console.log(`   Average Cost: $${(totalCost/successCount || 0).toFixed(6)} per narrative`);
  
  // Quality analysis
  const successfulResults = results.filter(r => r.success);
  if (successfulResults.length > 0) {
    const avgQualityScore = successfulResults.reduce((sum, r) => sum + r.analysis.qualityScore, 0) / successfulResults.length;
    const avgAtmosphereScore = successfulResults.reduce((sum, r) => sum + r.analysis.atmosphereScore, 0) / successfulResults.length;
    const avgFeatureScore = successfulResults.reduce((sum, r) => sum + r.analysis.featureMatchScore, 0) / successfulResults.length;
    const qualityValidCount = successfulResults.filter(r => r.qualityValidation.overallQuality === 'Excellent' || r.qualityValidation.overallQuality === 'Good').length;
    
    console.log(`\n📖 Narrative Quality:`);
    console.log(`   Average Quality Score: ${avgQualityScore.toFixed(1)}/100`);
    console.log(`   Average Atmosphere Score: ${avgAtmosphereScore.toFixed(1)}/100`);
    console.log(`   Average Feature Match: ${avgFeatureScore.toFixed(1)}/100`);
    console.log(`   Quality Validation Rate: ${qualityValidCount}/${successfulResults.length} (${Math.round(qualityValidCount/successfulResults.length*100)}%)`);
  }
  
  // Individual test results
  console.log(`\n📋 Individual Test Results:`);
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const qualityInfo = result.success ? 
      ` (Quality: ${result.analysis.qualityScore}/100, Atmosphere: ${result.analysis.atmosphereScore}/100, Validation: ${result.qualityValidation.overallQuality})` : 
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
  
  // Narrative examples
  console.log(`\n📖 Generated Narrative Examples:`);
  successfulResults.slice(0, 2).forEach(result => {
    const narrative = result.narrative;
    const wordCount = getWordCount(narrative);
    console.log(`   ✨ ${narrative.title || 'Generated Narrative'}`);
    console.log(`      Type: ${narrative.contentType}, Words: ${wordCount}, Atmosphere: ${narrative.atmosphere}`);
    if (narrative.mainText) {
      console.log(`      Preview: ${narrative.mainText.substring(0, 100)}...`);
    }
  });
  
  // Quality assessment
  const finalAvgQualityScore = successfulResults.length > 0 ? successfulResults.reduce((sum, r) => sum + r.analysis.qualityScore, 0) / successfulResults.length : 0;
  const finalAvgAtmosphereScore = successfulResults.length > 0 ? successfulResults.reduce((sum, r) => sum + r.analysis.atmosphereScore, 0) / successfulResults.length : 0;
  const finalQualityValidCount = successfulResults.filter(r => r.qualityValidation.overallQuality === 'Excellent' || r.qualityValidation.overallQuality === 'Good').length;
  const finalValidationRate = successfulResults.length > 0 ? finalQualityValidCount / successfulResults.length : 0;
  const qualityGrade = getNarrativeQualityGrade(successCount/totalTests, finalAvgQualityScore, finalAvgAtmosphereScore, finalValidationRate);
  console.log(`\n🏆 Overall Quality Grade: ${qualityGrade}`);
  
  console.log(`\n🎉 Narrative Generator ${successCount === totalTests ? 'PASSED' : 'NEEDS IMPROVEMENT'} - Ready for ${successCount === totalTests ? 'production' : 'further development'}!`);
}

// Calculate quality grade
function getNarrativeQualityGrade(successRate, qualityScore, atmosphereScore, validationRate) {
  const overallScore = (successRate * 100 * 0.3) + (qualityScore * 0.25) + (atmosphereScore * 0.25) + (validationRate * 100 * 0.2);
  
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
testNarrativeGeneration().catch(console.error);
