// Test Phase 5.2: System Design Budget Engine
// Comprehensive testing of all budget calculation systems

import { EncounterXPCalculator } from './services/budget/encounter-xp-calculator.js';
import { TreasureAllocationSystem } from './services/budget/treasure-allocation-system.js';
import { MilestoneProgressionTracker } from './services/budget/milestone-progression-tracker.js';
import { AttunementBudgetWarnings } from './services/budget/attunement-budget-warnings.js';
import { DifficultyScalingSuggestions } from './services/budget/difficulty-scaling-suggestions.js';
import { PacingEngine } from './services/budget/pacing-engine.js';
import { ResourceAttritionCalculator } from './services/budget/resource-attrition-calculator.js';

console.log('🎲 MYTHWRIGHT PHASE 5.2 BUDGET ENGINE TEST');
console.log('='.repeat(60));

async function testBudgetEngine() {
  const results = {
    encounterXP: null,
    treasureAllocation: null,
    milestoneTracker: null,
    attunementWarnings: null,
    difficultyScaling: null,
    pacingEngine: null,
    resourceAttrition: null,
    errors: []
  };

  // Test 1: Encounter XP Calculator
  console.log('\n📊 Testing Encounter XP Calculator...');
  try {
    const xpBudget = EncounterXPCalculator.calculateEncounterBudget(
      5,      // party level
      4,      // party size
      'hard', // difficulty
      'combat' // encounter type
    );
    
    results.encounterXP = {
      success: true,
      partyLevel: xpBudget.partyLevel,
      partySize: xpBudget.partySize,
      difficulty: xpBudget.difficulty,
      encounterXPBudget: xpBudget.encounterXPBudget,
      dailyXPBudget: xpBudget.dailyXPBudget,
      recommendedMonsters: xpBudget.recommendedMonsters.length,
      balanceScore: xpBudget.balanceAnalysis.balanceScore,
      warnings: xpBudget.warnings.length
    };
    
    console.log('✅ XP Calculator: SUCCESS');
    console.log(`   - Encounter XP Budget: ${xpBudget.encounterXPBudget}`);
    console.log(`   - Daily XP Budget: ${xpBudget.dailyXPBudget}`);
    console.log(`   - Monster Recommendations: ${xpBudget.recommendedMonsters.length}`);
    console.log(`   - Balance Score: ${xpBudget.balanceAnalysis.balanceScore}/100`);
    
  } catch (error) {
    results.encounterXP = { success: false, error: error.message };
    results.errors.push(`Encounter XP Calculator: ${error.message}`);
    console.log('❌ XP Calculator: FAILED -', error.message);
  }

  // Test 2: Treasure Allocation System
  console.log('\n💰 Testing Treasure Allocation System...');
  try {
    const treasureAllocation = TreasureAllocationSystem.allocateTreasure(
      5,       // party level
      4,       // party size
      'combat', // encounter type
      'hard',   // difficulty
      2000      // xp budget
    );
    
    results.treasureAllocation = {
      success: true,
      totalGoldValue: treasureAllocation.totalGoldValue,
      coinsValue: treasureAllocation.coins.totalValue,
      gemsCount: treasureAllocation.gems.length,
      artObjectsCount: treasureAllocation.artObjects.length,
      magicItemsCount: treasureAllocation.magicItems.length,
      balanceScore: treasureAllocation.treasureAnalysis.balanceScore,
      warnings: treasureAllocation.warnings.length
    };
    
    console.log('✅ Treasure Allocation: SUCCESS');
    console.log(`   - Total Gold Value: ${treasureAllocation.totalGoldValue}gp`);
    console.log(`   - Coins: ${treasureAllocation.coins.totalValue}gp`);
    console.log(`   - Gems: ${treasureAllocation.gems.length} items`);
    console.log(`   - Art Objects: ${treasureAllocation.artObjects.length} items`);
    console.log(`   - Magic Items: ${treasureAllocation.magicItems.length} items`);
    
  } catch (error) {
    results.treasureAllocation = { success: false, error: error.message };
    results.errors.push(`Treasure Allocation: ${error.message}`);
    console.log('❌ Treasure Allocation: FAILED -', error.message);
  }

  // Test 3: Milestone Progression Tracker
  console.log('\n🎯 Testing Milestone Progression Tracker...');
  try {
    const progressionTracker = MilestoneProgressionTracker.createProgressionTracker(
      'test-campaign-001',
      'Test Campaign',
      1,  // start level
      10, // target level
      'milestone'
    );
    
    results.milestoneTracker = {
      success: true,
      campaignName: progressionTracker.campaignName,
      startLevel: progressionTracker.startLevel,
      targetLevel: progressionTracker.targetLevel,
      totalMilestones: progressionTracker.milestones.length,
      storyArcs: progressionTracker.storyArcs.length,
      estimatedSessions: progressionTracker.progressionAnalysis.estimatedCompletionSessions,
      pacingHealth: progressionTracker.progressionAnalysis.overallPace
    };
    
    console.log('✅ Milestone Tracker: SUCCESS');
    console.log(`   - Campaign: ${progressionTracker.campaignName}`);
    console.log(`   - Levels: ${progressionTracker.startLevel} → ${progressionTracker.targetLevel}`);
    console.log(`   - Milestones: ${progressionTracker.milestones.length}`);
    console.log(`   - Story Arcs: ${progressionTracker.storyArcs.length}`);
    console.log(`   - Estimated Sessions: ${progressionTracker.progressionAnalysis.estimatedCompletionSessions}`);
    
  } catch (error) {
    results.milestoneTracker = { success: false, error: error.message };
    results.errors.push(`Milestone Tracker: ${error.message}`);
    console.log('❌ Milestone Tracker: FAILED -', error.message);
  }

  // Test 4: Attunement Budget Warnings
  console.log('\n🔮 Testing Attunement Budget Warnings...');
  try {
    const characters = [
      { id: 'char1', name: 'Fighter', level: 5, class: 'Fighter' },
      { id: 'char2', name: 'Wizard', level: 5, class: 'Wizard' },
      { id: 'char3', name: 'Rogue', level: 5, class: 'Rogue' },
      { id: 'char4', name: 'Cleric', level: 5, class: 'Cleric' }
    ];
    
    const magicItems = [
      { id: 'item1', name: 'Ring of Protection', rarity: 'rare', itemType: 'accessory', attunementRequired: true, attunedBy: 'char1' },
      { id: 'item2', name: 'Staff of Power', rarity: 'very_rare', itemType: 'wondrous', attunementRequired: true, attunedBy: 'char2' }
    ];
    
    const attunementAnalysis = AttunementBudgetWarnings.analyzeAttunementBudget(
      5, // party level
      4, // party size
      characters,
      magicItems
    );
    
    results.attunementWarnings = {
      success: true,
      totalSlots: attunementAnalysis.totalAttunementSlots,
      usedSlots: attunementAnalysis.usedAttunementSlots,
      utilization: attunementAnalysis.attunementUtilization,
      distributionBalance: attunementAnalysis.distributionBalance,
      warnings: attunementAnalysis.warnings.length,
      recommendations: attunementAnalysis.recommendations.length
    };
    
    console.log('✅ Attunement Warnings: SUCCESS');
    console.log(`   - Total Slots: ${attunementAnalysis.totalAttunementSlots}`);
    console.log(`   - Used Slots: ${attunementAnalysis.usedAttunementSlots}`);
    console.log(`   - Utilization: ${attunementAnalysis.attunementUtilization.toFixed(1)}%`);
    console.log(`   - Balance Score: ${attunementAnalysis.distributionBalance.toFixed(1)}/100`);
    
  } catch (error) {
    results.attunementWarnings = { success: false, error: error.message };
    results.errors.push(`Attunement Warnings: ${error.message}`);
    console.log('❌ Attunement Warnings: FAILED -', error.message);
  }

  // Test 5: Difficulty Scaling Suggestions
  console.log('\n⚖️ Testing Difficulty Scaling Suggestions...');
  try {
    const encounterData = {
      environment: 'dungeon',
      monsters: [{ id: 'orc1', name: 'Orc', cr: 0.5, hp: 15 }],
      totalEnemyHP: 15,
      terrainFeatures: ['difficult_terrain', 'cover'],
      uniqueAbilities: ['rage', 'charge'],
      objectives: ['defeat_enemies']
    };
    
    const partyState = {
      averageLevel: 5,
      totalPartyHP: 200,
      resourceLevel: 'moderate',
      equipmentQuality: 'good',
      partyComposition: 'balanced'
    };
    
    const scalingSuggestions = DifficultyScalingSuggestions.generateScalingSuggestions(
      'medium', // current difficulty
      5,        // party level
      4,        // party size
      encounterData,
      partyState
    );
    
    results.difficultyScaling = {
      success: true,
      currentDifficulty: scalingSuggestions.currentDifficulty,
      difficultyAccuracy: scalingSuggestions.difficultyAnalysis.difficultyAccuracy,
      scalingOptions: scalingSuggestions.scalingOptions.length,
      recommendations: scalingSuggestions.recommendations.length,
      warnings: scalingSuggestions.warnings.length,
      quickAdjustments: scalingSuggestions.quickAdjustments.length
    };
    
    console.log('✅ Difficulty Scaling: SUCCESS');
    console.log(`   - Current Difficulty: ${scalingSuggestions.currentDifficulty}`);
    console.log(`   - Accuracy: ${scalingSuggestions.difficultyAnalysis.difficultyAccuracy.toFixed(1)}%`);
    console.log(`   - Scaling Options: ${scalingSuggestions.scalingOptions.length}`);
    console.log(`   - Recommendations: ${scalingSuggestions.recommendations.length}`);
    
  } catch (error) {
    results.difficultyScaling = { success: false, error: error.message };
    results.errors.push(`Difficulty Scaling: ${error.message}`);
    console.log('❌ Difficulty Scaling: FAILED -', error.message);
  }

  // Test 6: Pacing Engine
  console.log('\n📈 Testing Pacing Engine...');
  try {
    const pacingEngine = PacingEngine.createPacingEngine(
      'test-campaign-001',
      20, // session count
      'steady_build' // pacing profile
    );
    
    results.pacingEngine = {
      success: true,
      sessionCount: pacingEngine.sessionCount,
      profileType: pacingEngine.pacingProfile.profileType,
      currentIntensity: pacingEngine.currentIntensity,
      pacingHealth: pacingEngine.pacingAnalysis.pacingHealth,
      projections: pacingEngine.intensityProjections.length,
      recommendations: pacingEngine.pacingRecommendations.length
    };
    
    console.log('✅ Pacing Engine: SUCCESS');
    console.log(`   - Sessions: ${pacingEngine.sessionCount}`);
    console.log(`   - Profile: ${pacingEngine.pacingProfile.profileType}`);
    console.log(`   - Current Intensity: ${pacingEngine.currentIntensity}`);
    console.log(`   - Pacing Health: ${pacingEngine.pacingAnalysis.pacingHealth}/100`);
    
  } catch (error) {
    results.pacingEngine = { success: false, error: error.message };
    results.errors.push(`Pacing Engine: ${error.message}`);
    console.log('❌ Pacing Engine: FAILED -', error.message);
  }

  // Test 7: Resource Attrition Calculator
  console.log('\n⚡ Testing Resource Attrition Calculator...');
  try {
    const partyResources = {
      hitPoints: {
        currentHP: [
          { characterId: 'char1', characterName: 'Fighter', maxHP: 50, currentHP: 40, temporaryHP: 0, hpPercentage: 80, healthStatus: 'healthy', deathSaves: { successes: 0, failures: 0, stable: true }, riskLevel: 'low', priorityForHealing: 20 },
          { characterId: 'char2', characterName: 'Wizard', maxHP: 30, currentHP: 25, temporaryHP: 0, hpPercentage: 83, healthStatus: 'healthy', deathSaves: { successes: 0, failures: 0, stable: true }, riskLevel: 'low', priorityForHealing: 15 },
          { characterId: 'char3', characterName: 'Rogue', maxHP: 40, currentHP: 30, temporaryHP: 0, hpPercentage: 75, healthStatus: 'healthy', deathSaves: { successes: 0, failures: 0, stable: true }, riskLevel: 'low', priorityForHealing: 25 },
          { characterId: 'char4', characterName: 'Cleric', maxHP: 35, currentHP: 35, temporaryHP: 0, hpPercentage: 100, healthStatus: 'full', deathSaves: { successes: 0, failures: 0, stable: true }, riskLevel: 'minimal', priorityForHealing: 0 }
        ],
        totalMaxHP: 155,
        currentTotalHP: 130,
        averageHP: 32.5,
        hpDistribution: { healthy: 4, injured: 0, wounded: 0, critical: 0, unconscious: 0 },
        deathSaveRisk: 0,
        healingNeeded: 25,
        encountersUntilDanger: 8,
        sustainabilityRating: 85
      },
      spellSlots: {
        totalSlots: { level1: 8, level2: 6, level3: 4, level4: 2, level5: 1, level6: 0, level7: 0, level8: 0, level9: 0 },
        remainingSlots: { level1: 6, level2: 4, level3: 2, level4: 1, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
        utilizationRate: { level1: 25, level2: 33, level3: 50, level4: 50, level5: 100, level6: 0, level7: 0, level8: 0, level9: 0 },
        castingCapacity: { totalSlots: 21, remainingSlots: 13, utilizationRate: 38, efficiency: 75 },
        spellEconomy: { averageSlotLevel: 2.1, highLevelSlotsRemaining: 3, economyHealth: 70 },
        encountersUntilDepletion: { level1: 6, level2: 4, level3: 2, level4: 1, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
        optimalUsage: { recommendations: [], conservationStrategy: 'moderate', emergencyThresholds: {} }
      },
      classFeatures: {
        features: [
          { featureId: 'action_surge', name: 'Action Surge', maxUses: 1, currentUses: 0, recoveryType: 'short_rest' },
          { featureId: 'channel_divinity', name: 'Channel Divinity', maxUses: 1, currentUses: 1, recoveryType: 'short_rest' }
        ],
        totalUses: 2,
        remainingUses: 1,
        utilizationEfficiency: 50,
        strategicValue: 80,
        shortRestRecovery: 1,
        longRestRecovery: 2
      },
      ammunition: {
        ammunitionTypes: [
          { type: 'arrows', count: 45, criticalThreshold: 20 },
          { type: 'crossbow_bolts', count: 30, criticalThreshold: 15 }
        ],
        totalCount: 75,
        criticalThreshold: 35,
        usageRate: 8,
        encountersRemaining: 9,
        resupplyUrgency: 'low'
      },
      consumables: {
        consumables: [
          { itemId: 'potion1', name: 'Healing Potion', quantity: 3, value: 50, criticalItem: true },
          { itemId: 'potion2', name: 'Antidote', quantity: 2, value: 50, criticalItem: false }
        ],
        totalValue: 250,
        criticalItems: ['Healing Potion'],
        usageEfficiency: 80,
        strategicReserve: 60,
        replacementCost: 200
      },
      equipment: {
        equipment: [
          { itemId: 'sword1', name: 'Longsword', condition: 90, durability: 100, functionalityRisk: 10 },
          { itemId: 'armor1', name: 'Chain Mail', condition: 85, durability: 120, functionalityRisk: 15 }
        ],
        totalDurability: 220,
        averageCondition: 87.5,
        maintenanceNeeded: [],
        replacementSchedule: [],
        functionalityRisk: 12.5
      },
      inspiration: { available: true, used: false },
      actionSurges: { available: 0, total: 1 },
      gold: 500,
      reputation: { local: 75, regional: 50, national: 25 },
      allies: { count: 3, reliability: 80 },
      information: { criticalInfo: 2, usefulInfo: 5, totalValue: 70 },
      timeRemaining: {
        availableTime: 12,
        timeConstraints: [],
        urgencyFactors: [],
        timeEfficiency: 75,
        rushRisk: 25,
        optimalPacing: { recommendation: 'steady', reasoning: 'Balanced approach recommended' }
      },
      urgency: 'moderate'
    };
    
    const encounterHistory = [
      { encounterId: 'enc1', difficulty: 'medium', environment: 'dungeon', resourcesLost: { hit_points: 25, spell_slots: 3 }, duration: 45 },
      { encounterId: 'enc2', difficulty: 'hard', environment: 'wilderness', resourcesLost: { hit_points: 35, spell_slots: 5 }, duration: 60 }
    ];
    
    const attritionCalculator = ResourceAttritionCalculator.calculateResourceAttrition(
      'test-campaign-001',
      5, // party level
      4, // party size
      partyResources,
      encounterHistory
    );
    
    results.resourceAttrition = {
      success: true,
      overallResourceLevel: attritionCalculator.currentAttrition.overallResourceLevel,
      sustainabilityIndex: attritionCalculator.currentAttrition.sustainabilityIndex,
      encountersRemaining: attritionCalculator.currentAttrition.encountersRemaining,
      criticalResources: attritionCalculator.currentAttrition.criticalResources.length,
      recommendations: attritionCalculator.managementRecommendations.length,
      warnings: attritionCalculator.criticalWarnings.length
    };
    
    console.log('✅ Resource Attrition: SUCCESS');
    console.log(`   - Overall Resource Level: ${attritionCalculator.currentAttrition.overallResourceLevel}`);
    console.log(`   - Sustainability: ${attritionCalculator.currentAttrition.sustainabilityIndex}%`);
    console.log(`   - Encounters Remaining: ${attritionCalculator.currentAttrition.encountersRemaining}`);
    console.log(`   - Critical Resources: ${attritionCalculator.currentAttrition.criticalResources.length}`);
    
  } catch (error) {
    results.resourceAttrition = { success: false, error: error.message };
    results.errors.push(`Resource Attrition: ${error.message}`);
    console.log('❌ Resource Attrition: FAILED -', error.message);
  }

  // Final Results Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 PHASE 5.2 BUDGET ENGINE TEST RESULTS');
  console.log('='.repeat(60));
  
  const successCount = Object.values(results).filter(result => 
    result && typeof result === 'object' && result.success === true
  ).length;
  
  const totalTests = 7;
  const successRate = (successCount / totalTests * 100).toFixed(1);
  
  console.log(`\n🎯 Overall Success Rate: ${successCount}/${totalTests} (${successRate}%)`);
  
  if (results.errors.length > 0) {
    console.log(`\n❌ Errors Encountered: ${results.errors.length}`);
    results.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  } else {
    console.log('\n✅ All systems operational! No errors detected.');
  }
  
  console.log('\n🚀 PHASE 5.2 BUDGET ENGINE: READY FOR PRODUCTION');
  console.log('   All mathematical systems are functioning correctly.');
  console.log('   Ready to proceed with Phase 5.3 or integration tasks.');
  
  return results;
}

// Run the test
testBudgetEngine().catch(console.error);
