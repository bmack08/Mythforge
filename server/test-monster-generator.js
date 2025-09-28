// Test Monster Generator - Comprehensive Testing of Specialized D&D Monster Generation
import OpenAI from 'openai';

// Set up environment for testing
process.env.OPENAI_API_KEY = ''; // Add your OpenAI API key here for testing

console.log('🐉 Testing Mythwright Monster Generator...\n');

// Test cases covering different monster types and CRs
const testCases = [
  {
    name: 'Low CR Beast',
    request: {
      challengeRating: 0.5,
      creatureType: 'beast',
      size: 'Medium',
      name: 'Shadowfang Wolf',
      theme: 'nature',
      environment: 'forest',
      role: 'skirmisher',
      abilities: ['pack_tactics'],
      partyLevel: 2,
      partySize: 4,
      encounterDifficulty: 'medium',
      flavorText: 'A wolf that has been touched by shadow magic, making it more cunning and dangerous than its mundane cousins.'
    },
    expectedFeatures: ['pack tactics', 'bite attack', 'keen senses']
  },
  {
    name: 'Mid CR Fiend',
    request: {
      challengeRating: 5,
      creatureType: 'fiend',
      size: 'Large',
      theme: 'fiendish',
      environment: 'any',
      role: 'brute',
      abilities: ['flight', 'resistance', 'multiattack'],
      alignment: 'chaotic evil',
      partyLevel: 5,
      partySize: 4,
      encounterDifficulty: 'hard',
      mustHave: ['fire damage', 'intimidating presence'],
      restrictions: ['no instant death effects', 'no charm abilities']
    },
    expectedFeatures: ['multiattack', 'fire damage', 'damage resistance']
  },
  {
    name: 'High CR Aberration',
    request: {
      challengeRating: 12,
      creatureType: 'aberration',
      size: 'Huge',
      theme: 'aberrant',
      environment: 'underdark',
      role: 'controller',
      abilities: ['telepathy', 'legendary_actions', 'spellcasting'],
      alignment: 'chaotic neutral',
      partyLevel: 12,
      partySize: 5,
      encounterDifficulty: 'deadly',
      flavorText: 'An ancient entity from beyond the stars, its very presence warps reality around it.',
      mustHave: ['psychic damage', 'mind control abilities', 'legendary resistance']
    },
    expectedFeatures: ['legendary actions', 'spellcasting', 'psychic abilities']
  },
  {
    name: 'Construct Guardian',
    request: {
      challengeRating: 8,
      creatureType: 'construct',
      size: 'Large',
      theme: 'construct',
      environment: 'urban',
      role: 'soldier',
      abilities: ['immunity', 'multiattack'],
      alignment: 'unaligned',
      partyLevel: 8,
      partySize: 4,
      encounterDifficulty: 'hard',
      mustHave: ['slam attacks', 'damage immunities'],
      restrictions: ['no spellcasting', 'no charm or fear effects']
    },
    expectedFeatures: ['construct immunities', 'slam attack', 'high AC']
  }
];

// Test monster generation with comprehensive analysis
async function testMonsterGeneration() {
  console.log('🧪 Starting Monster Generator Tests...\n');
  
  try {
    // Dynamic import to handle ES modules
    const { aiService } = await import('./dist/services/ai/index.js');
    
    let successCount = 0;
    let totalCost = 0;
    let totalTokens = 0;
    const results = [];
    
    for (const testCase of testCases) {
      console.log(`🎯 Test Case: ${testCase.name}`);
      console.log(`📊 CR: ${testCase.request.challengeRating}, Type: ${testCase.request.creatureType}, Size: ${testCase.request.size}`);
      console.log(`🎭 Role: ${testCase.request.role}, Theme: ${testCase.request.theme}`);
      
      try {
        const startTime = Date.now();
        
        // Generate monster using specialized generator
        const result = await aiService.generateMonster(testCase.request);
        
        const duration = Date.now() - startTime;
        
        console.log('✅ Monster Generation Successful!');
        console.log(`⏱️ Generation Time: ${duration}ms`);
        
        // Analyze the generated monster
        const analysis = analyzeGeneratedMonster(result, testCase);
        console.log('📋 Monster Analysis:');
        console.log(`   - Name: ${result.statBlock.name}`);
        console.log(`   - CR: ${result.statBlock.challengeRating} (Target: ${testCase.request.challengeRating})`);
        console.log(`   - HP: ${result.statBlock.hitPoints}, AC: ${result.statBlock.armorClass}`);
        console.log(`   - Balance Score: ${analysis.balanceScore}/100`);
        console.log(`   - Feature Match: ${analysis.featureMatchScore}/100`);
        
        // Show balance report
        console.log('⚖️ Balance Report:');
        console.log(`   - CR Accurate: ${result.balanceReport.crAccurate ? '✅' : '❌'}`);
        console.log(`   - Offensive CR: ${result.balanceReport.offensiveCR}`);
        console.log(`   - Defensive CR: ${result.balanceReport.defensiveCR}`);
        console.log(`   - Final CR: ${result.balanceReport.finalCR}`);
        
        if (result.balanceReport.balanceIssues.length > 0) {
          console.log('⚠️ Balance Issues:');
          result.balanceReport.balanceIssues.forEach(issue => 
            console.log(`     • ${issue}`)
          );
        }
        
        if (result.balanceReport.recommendations.length > 0) {
          console.log('💡 Recommendations:');
          result.balanceReport.recommendations.forEach(rec => 
            console.log(`     • ${rec}`)
          );
        }
        
        // Show tactical guidance
        console.log('⚔️ Tactical Guidance:');
        console.log(`   - Combat Role: ${result.tactics.combatRole}`);
        console.log(`   - Preferred Range: ${result.tactics.preferredRange}`);
        console.log(`   - Key Tactics: ${result.tactics.tactics.slice(0, 2).join(', ')}`);
        
        // Show variants
        console.log('🔄 Generated Variants:');
        result.variants.forEach(variant => 
          console.log(`   - ${variant.name} (CR ${testCase.request.challengeRating + variant.crChange})`)
        );
        
        // Track metadata if available
        const metadata = result.metadata || { cost: 0, tokensUsed: 0 };
        totalCost += metadata.cost || 0;
        totalTokens += metadata.tokensUsed || 0;
        
        results.push({
          testCase: testCase.name,
          success: true,
          analysis,
          duration,
          balanceReport: result.balanceReport
        });
        
        successCount++;
        
      } catch (error) {
        console.error('❌ Monster Generation Failed:', error.message);
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
    generateTestReport(results, successCount, testCases.length, totalCost, totalTokens);
    
    return successCount === testCases.length;
    
  } catch (error) {
    console.error('❌ Monster Generator Test Failed:', error.message);
    return false;
  }
}

// Analyze generated monster quality
function analyzeGeneratedMonster(result, testCase) {
  const { statBlock, balanceReport } = result;
  let balanceScore = 100;
  let featureMatchScore = 100;
  
  // Balance analysis
  if (!balanceReport.crAccurate) {
    balanceScore -= 30;
  }
  
  const crGap = Math.abs(balanceReport.defensiveCR - balanceReport.offensiveCR);
  if (crGap > 1) {
    balanceScore -= 20;
  }
  
  if (balanceReport.balanceIssues.length > 0) {
    balanceScore -= balanceReport.balanceIssues.length * 10;
  }
  
  // Feature matching analysis
  const expectedFeatures = testCase.expectedFeatures || [];
  const statBlockText = JSON.stringify(statBlock).toLowerCase();
  
  let matchedFeatures = 0;
  for (const feature of expectedFeatures) {
    if (statBlockText.includes(feature.toLowerCase().replace(' ', ''))) {
      matchedFeatures++;
    }
  }
  
  if (expectedFeatures.length > 0) {
    featureMatchScore = Math.round((matchedFeatures / expectedFeatures.length) * 100);
  }
  
  // Check required elements
  if (testCase.request.mustHave) {
    for (const requirement of testCase.request.mustHave) {
      if (!statBlockText.includes(requirement.toLowerCase())) {
        featureMatchScore -= 20;
      }
    }
  }
  
  // Check restrictions compliance
  if (testCase.request.restrictions) {
    for (const restriction of testCase.request.restrictions) {
      if (statBlockText.includes(restriction.toLowerCase().replace('no ', ''))) {
        featureMatchScore -= 15;
      }
    }
  }
  
  return {
    balanceScore: Math.max(0, balanceScore),
    featureMatchScore: Math.max(0, featureMatchScore),
    matchedFeatures,
    totalFeatures: expectedFeatures.length
  };
}

// Generate comprehensive test report
function generateTestReport(results, successCount, totalTests, totalCost, totalTokens) {
  console.log('\n📊 COMPREHENSIVE MONSTER GENERATOR TEST REPORT');
  console.log('='.repeat(60));
  
  // Overall statistics
  console.log(`📈 Overall Results:`);
  console.log(`   Success Rate: ${successCount}/${totalTests} (${Math.round(successCount/totalTests*100)}%)`);
  console.log(`   Total Cost: $${totalCost.toFixed(6)}`);
  console.log(`   Total Tokens: ${totalTokens}`);
  console.log(`   Average Cost: $${(totalCost/successCount || 0).toFixed(6)} per monster`);
  
  // Balance analysis
  const successfulResults = results.filter(r => r.success);
  if (successfulResults.length > 0) {
    const avgBalanceScore = successfulResults.reduce((sum, r) => sum + r.analysis.balanceScore, 0) / successfulResults.length;
    const avgFeatureScore = successfulResults.reduce((sum, r) => sum + r.analysis.featureMatchScore, 0) / successfulResults.length;
    const crAccurateCount = successfulResults.filter(r => r.balanceReport.crAccurate).length;
    
    console.log(`\n⚖️ Balance Quality:`);
    console.log(`   Average Balance Score: ${avgBalanceScore.toFixed(1)}/100`);
    console.log(`   Average Feature Match: ${avgFeatureScore.toFixed(1)}/100`);
    console.log(`   CR Accuracy Rate: ${crAccurateCount}/${successfulResults.length} (${Math.round(crAccurateCount/successfulResults.length*100)}%)`);
  }
  
  // Individual test results
  console.log(`\n📋 Individual Test Results:`);
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const balanceInfo = result.success ? 
      ` (Balance: ${result.analysis.balanceScore}/100, Features: ${result.analysis.featureMatchScore}/100)` : 
      ` (${result.error})`;
    
    console.log(`   ${status} ${result.testCase}${balanceInfo}`);
  });
  
  // Performance analysis
  const avgDuration = successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length;
  console.log(`\n⚡ Performance:`);
  console.log(`   Average Generation Time: ${avgDuration.toFixed(0)}ms`);
  console.log(`   Fastest Generation: ${Math.min(...successfulResults.map(r => r.duration))}ms`);
  console.log(`   Slowest Generation: ${Math.max(...successfulResults.map(r => r.duration))}ms`);
  
  // Quality assessment
  const qualityGrade = getQualityGrade(successCount/totalTests, avgBalanceScore || 0, avgFeatureScore || 0);
  console.log(`\n🏆 Overall Quality Grade: ${qualityGrade}`);
  
  // Recommendations
  console.log(`\n💡 System Recommendations:`);
  if (successCount < totalTests) {
    console.log(`   • Investigate generation failures to improve reliability`);
  }
  if (avgBalanceScore < 80) {
    console.log(`   • Fine-tune CR calculation algorithms for better balance`);
  }
  if (avgFeatureScore < 80) {
    console.log(`   • Improve prompt engineering for better feature matching`);
  }
  if (avgDuration > 10000) {
    console.log(`   • Consider optimization for faster generation times`);
  }
  
  console.log(`\n🎉 Monster Generator ${successCount === totalTests ? 'PASSED' : 'NEEDS IMPROVEMENT'} - Ready for ${successCount === totalTests ? 'production' : 'further development'}!`);
}

// Calculate quality grade
function getQualityGrade(successRate, balanceScore, featureScore) {
  const overallScore = (successRate * 100 * 0.4) + (balanceScore * 0.3) + (featureScore * 0.3);
  
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
testMonsterGeneration().catch(console.error);
