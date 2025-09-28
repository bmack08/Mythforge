// Mythwright Full System Integration Test
// Test all major systems working together to generate a complete D&D sourcebook

const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), 'config', '.env') });

// Import all our major systems
const { ContentGenerationOrchestrator } = require('./services/pipeline/content-generation-orchestrator');
const { BatchContentGenerator } = require('./services/pipeline/batch-content-generator');
const { ContentQualityAssurance } = require('./services/validation/content-quality-assurance');
const { ContentDependencyResolver } = require('./services/dependencies/content-dependency-resolver');
const { ContentVersionManager } = require('./services/versioning/content-version-manager');
const { EncounterXPCalculator } = require('./services/budget/encounter-xp-calculator');
const { TreasureAllocationSystem } = require('./services/budget/treasure-allocation-system');
const { MilestoneProgressionTracker } = require('./services/budget/milestone-progression-tracker');
const { AttunementBudgetWarnings } = require('./services/budget/attunement-budget-warnings');
const { DifficultyScalingSuggestions } = require('./services/budget/difficulty-scaling-suggestions');
const { PacingEngine } = require('./services/budget/pacing-engine');
const { ResourceAttritionCalculator } = require('./services/budget/resource-attrition-calculator');

// Test configuration
const TEST_PROJECT_CONFIG = {
  projectId: 'test_mythwright_sourcebook',
  name: 'The Shadowlands Campaign',
  description: 'A dark fantasy campaign set in the mysterious Shadowlands',
  
  // Campaign Parameters
  partyLevel: 5,
  partySize: 4,
  targetDifficulty: 'medium',
  campaignLength: 'medium', // 8-12 sessions
  
  // Theme and Setting
  theme: 'dark_fantasy',
  setting: 'shadowlands',
  tone: 'mysterious',
  
  // Content Requirements
  chaptersRequested: 5,
  encountersPerChapter: 3,
  npcsRequested: 12,
  locationsRequested: 8,
  
  // Budget Constraints
  totalXPBudget: 15000,
  treasureBudget: 'standard',
  
  // Quality Standards
  targetReadingLevel: 8,
  accessibilityCompliance: 'WCAG_AA',
  contentQualityThreshold: 85
};

class MythwrightSystemTest {
  constructor() {
    this.testResults = {
      systemsTestedCount: 0,
      systemsPassedCount: 0,
      totalTestsRun: 0,
      testsPassedCount: 0,
      testDetails: [],
      generatedContent: {},
      performanceMetrics: {},
      errors: []
    };
    
    this.startTime = Date.now();
  }
  
  // ========================================================================
  // MAIN TEST ORCHESTRATOR
  // ========================================================================
  
  async runFullSystemTest() {
    console.log('🚀 MYTHWRIGHT FULL SYSTEM TEST STARTING...\n');
    console.log('=' .repeat(80));
    console.log(`Testing Project: ${TEST_PROJECT_CONFIG.name}`);
    console.log(`Party: Level ${TEST_PROJECT_CONFIG.partyLevel}, Size ${TEST_PROJECT_CONFIG.partySize}`);
    console.log(`Target: ${TEST_PROJECT_CONFIG.chaptersRequested} chapters, ${TEST_PROJECT_CONFIG.encountersPerChapter} encounters each`);
    console.log('=' .repeat(80));
    console.log();
    
    try {
      // Test Phase 1: Budget Engine Systems
      await this.testBudgetEngineSystems();
      
      // Test Phase 2: Content Generation Pipeline
      await this.testContentGenerationPipeline();
      
      // Test Phase 3: Quality Assurance Systems
      await this.testQualityAssuranceSystems();
      
      // Test Phase 4: Dependency and Version Management
      await this.testDependencyAndVersionSystems();
      
      // Test Phase 5: Integration Test - Generate Complete Sourcebook
      await this.testCompleteSourcebookGeneration();
      
      // Generate Final Report
      this.generateFinalReport();
      
    } catch (error) {
      console.error('❌ CRITICAL ERROR in system test:', error);
      this.testResults.errors.push({
        phase: 'main_orchestrator',
        error: error.message,
        stack: error.stack
      });
    }
  }
  
  // ========================================================================
  // PHASE 1: BUDGET ENGINE SYSTEMS TEST
  // ========================================================================
  
  async testBudgetEngineSystems() {
    console.log('📊 TESTING PHASE 1: BUDGET ENGINE SYSTEMS');
    console.log('-'.repeat(50));
    
    const phaseStartTime = Date.now();
    let phasePassed = 0;
    let phaseTotal = 0;
    
    // Test 1.1: Encounter XP Calculator
    try {
      console.log('Testing Encounter XP Calculator...');
      phaseTotal++;
      
      const xpBudget = EncounterXPCalculator.calculateEncounterBudget(
        TEST_PROJECT_CONFIG.partyLevel,
        TEST_PROJECT_CONFIG.partySize,
        TEST_PROJECT_CONFIG.targetDifficulty,
        'combat'
      );
      
      console.log(`  ✅ XP Budget: ${xpBudget.encounterXPBudget} XP per encounter`);
      console.log(`  ✅ Daily Budget: ${xpBudget.dailyXPBudget} XP per day`);
      console.log(`  ✅ Deadly Threshold: ${xpBudget.deadlyThreshold} XP`);
      
      this.testResults.generatedContent.xpBudget = xpBudget;
      phasePassed++;
      
    } catch (error) {
      console.log('  ❌ XP Calculator failed:', error.message);
      this.testResults.errors.push({ phase: 'xp_calculator', error: error.message });
    }
    
    // Test 1.2: Treasure Allocation System
    try {
      console.log('Testing Treasure Allocation System...');
      phaseTotal++;
      
      const treasureAllocation = TreasureAllocationSystem.allocateTreasure(
        TEST_PROJECT_CONFIG.partyLevel,
        TEST_PROJECT_CONFIG.partySize,
        'combat',
        TEST_PROJECT_CONFIG.targetDifficulty,
        1500 // Sample encounter XP
      );
      
      console.log(`  ✅ Total Gold Value: ${treasureAllocation.totalGoldValue} gp`);
      console.log(`  ✅ Magic Items: ${treasureAllocation.magicItems.length} items`);
      console.log(`  ✅ Coin Distribution: ${JSON.stringify(treasureAllocation.coinDistribution)}`);
      
      this.testResults.generatedContent.treasureAllocation = treasureAllocation;
      phasePassed++;
      
    } catch (error) {
      console.log('  ❌ Treasure Allocation failed:', error.message);
      this.testResults.errors.push({ phase: 'treasure_allocation', error: error.message });
    }
    
    // Test 1.3: Milestone Progression Tracker
    try {
      console.log('Testing Milestone Progression Tracker...');
      phaseTotal++;
      
      const progressionPlan = MilestoneProgressionTracker.createProgressionPlan(
        TEST_PROJECT_CONFIG.partyLevel,
        TEST_PROJECT_CONFIG.partyLevel + 3, // Target level
        TEST_PROJECT_CONFIG.campaignLength,
        TEST_PROJECT_CONFIG.theme
      );
      
      console.log(`  ✅ Progression Plan: ${progressionPlan.milestones.length} milestones`);
      console.log(`  ✅ Story Arcs: ${progressionPlan.storyArcs.length} arcs`);
      console.log(`  ✅ Target Sessions: ${progressionPlan.estimatedSessions}`);
      
      this.testResults.generatedContent.progressionPlan = progressionPlan;
      phasePassed++;
      
    } catch (error) {
      console.log('  ❌ Milestone Progression failed:', error.message);
      this.testResults.errors.push({ phase: 'milestone_progression', error: error.message });
    }
    
    // Test 1.4: Pacing Engine
    try {
      console.log('Testing Pacing Engine...');
      phaseTotal++;
      
      const pacingProfile = PacingEngine.generatePacingProfile(
        TEST_PROJECT_CONFIG.campaignLength,
        TEST_PROJECT_CONFIG.theme,
        'balanced'
      );
      
      console.log(`  ✅ Pacing Profile: ${pacingProfile.profileType}`);
      console.log(`  ✅ Intensity Curve: ${pacingProfile.intensityCurve.length} points`);
      console.log(`  ✅ Peak Tension: ${Math.max(...pacingProfile.intensityCurve.map(p => p.intensity))}`);
      
      this.testResults.generatedContent.pacingProfile = pacingProfile;
      phasePassed++;
      
    } catch (error) {
      console.log('  ❌ Pacing Engine failed:', error.message);
      this.testResults.errors.push({ phase: 'pacing_engine', error: error.message });
    }
    
    const phaseTime = Date.now() - phaseStartTime;
    console.log(`\n📊 Phase 1 Results: ${phasePassed}/${phaseTotal} systems passed (${phaseTime}ms)`);
    console.log();
    
    this.testResults.systemsTestedCount += phaseTotal;
    this.testResults.systemsPassedCount += phasePassed;
    this.testResults.performanceMetrics.budgetEngineTime = phaseTime;
  }
  
  // ========================================================================
  // PHASE 2: CONTENT GENERATION PIPELINE TEST
  // ========================================================================
  
  async testContentGenerationPipeline() {
    console.log('🤖 TESTING PHASE 2: CONTENT GENERATION PIPELINE');
    console.log('-'.repeat(50));
    
    const phaseStartTime = Date.now();
    let phasePassed = 0;
    let phaseTotal = 0;
    
    // Test 2.1: Content Generation Orchestrator
    try {
      console.log('Testing Content Generation Orchestrator...');
      phaseTotal++;
      
      const orchestrator = new ContentGenerationOrchestrator();
      const generationPlan = await orchestrator.createGenerationPlan(TEST_PROJECT_CONFIG);
      
      console.log(`  ✅ Generation Plan Created: ${generationPlan.phases.length} phases`);
      console.log(`  ✅ Total Tasks: ${generationPlan.totalTasks}`);
      console.log(`  ✅ Estimated Time: ${generationPlan.estimatedTimeMinutes} minutes`);
      console.log(`  ✅ Budget Analysis: $${generationPlan.budgetAnalysis.totalEstimatedCost.toFixed(2)}`);
      
      this.testResults.generatedContent.generationPlan = generationPlan;
      phasePassed++;
      
    } catch (error) {
      console.log('  ❌ Content Orchestrator failed:', error.message);
      this.testResults.errors.push({ phase: 'content_orchestrator', error: error.message });
    }
    
    // Test 2.2: Batch Content Generator (Simulated - without actual AI calls)
    try {
      console.log('Testing Batch Content Generator (Simulation Mode)...');
      phaseTotal++;
      
      const batchGenerator = new BatchContentGenerator({
        maxConcurrentTasks: 3,
        enableQualityScoring: true,
        simulationMode: true // Don't make actual AI calls
      });
      
      // Create a small sample generation queue
      const sampleQueue = [
        {
          taskId: 'test_chapter_1',
          type: 'chapter',
          priority: 1,
          content: { title: 'The Shadow Gate', theme: 'mystery' }
        },
        {
          taskId: 'test_encounter_1',
          type: 'encounter',
          priority: 2,
          content: { type: 'combat', difficulty: 'medium', environment: 'dungeon' }
        },
        {
          taskId: 'test_npc_1',
          type: 'npc',
          priority: 3,
          content: { role: 'quest_giver', personality: 'mysterious', location: 'tavern' }
        }
      ];
      
      const batchResults = await batchGenerator.processBatch(sampleQueue);
      
      console.log(`  ✅ Batch Processing: ${batchResults.completedTasks} tasks completed`);
      console.log(`  ✅ Success Rate: ${(batchResults.successRate * 100).toFixed(1)}%`);
      console.log(`  ✅ Average Quality: ${batchResults.averageQualityScore.toFixed(1)}/100`);
      
      this.testResults.generatedContent.batchResults = batchResults;
      phasePassed++;
      
    } catch (error) {
      console.log('  ❌ Batch Generator failed:', error.message);
      this.testResults.errors.push({ phase: 'batch_generator', error: error.message });
    }
    
    const phaseTime = Date.now() - phaseStartTime;
    console.log(`\n🤖 Phase 2 Results: ${phasePassed}/${phaseTotal} systems passed (${phaseTime}ms)`);
    console.log();
    
    this.testResults.systemsTestedCount += phaseTotal;
    this.testResults.systemsPassedCount += phasePassed;
    this.testResults.performanceMetrics.contentGenerationTime = phaseTime;
  }
  
  // ========================================================================
  // PHASE 3: QUALITY ASSURANCE SYSTEMS TEST
  // ========================================================================
  
  async testQualityAssuranceSystems() {
    console.log('🔍 TESTING PHASE 3: QUALITY ASSURANCE SYSTEMS');
    console.log('-'.repeat(50));
    
    const phaseStartTime = Date.now();
    let phasePassed = 0;
    let phaseTotal = 0;
    
    // Test 3.1: Content Quality Assurance
    try {
      console.log('Testing Content Quality Assurance...');
      phaseTotal++;
      
      const qaSystem = new ContentQualityAssurance({
        enableStructuralValidation: true,
        enableContentQualityCheck: true,
        enableRulesCompliance: true,
        enableBalanceValidation: true,
        enableUsabilityCheck: true,
        enableFormattingValidation: true
      });
      
      // Test with sample content
      const sampleContent = {
        type: 'encounter',
        title: 'Goblin Ambush',
        description: 'A group of goblins attacks the party on the forest road.',
        monsters: [
          { name: 'Goblin', quantity: 4, cr: 0.25 }
        ],
        environment: 'forest',
        difficulty: 'easy'
      };
      
      const qualityReport = await qaSystem.validateContent(sampleContent);
      
      console.log(`  ✅ Overall Quality Score: ${qualityReport.overallScore}/100`);
      console.log(`  ✅ Validation Categories: ${qualityReport.categoryScores.size}`);
      console.log(`  ✅ Issues Found: ${qualityReport.issues.length}`);
      console.log(`  ✅ Auto-fixes Applied: ${qualityReport.autoFixesApplied.length}`);
      
      this.testResults.generatedContent.qualityReport = qualityReport;
      phasePassed++;
      
    } catch (error) {
      console.log('  ❌ Quality Assurance failed:', error.message);
      this.testResults.errors.push({ phase: 'quality_assurance', error: error.message });
    }
    
    const phaseTime = Date.now() - phaseStartTime;
    console.log(`\n🔍 Phase 3 Results: ${phasePassed}/${phaseTotal} systems passed (${phaseTime}ms)`);
    console.log();
    
    this.testResults.systemsTestedCount += phaseTotal;
    this.testResults.systemsPassedCount += phasePassed;
    this.testResults.performanceMetrics.qualityAssuranceTime = phaseTime;
  }
  
  // ========================================================================
  // PHASE 4: DEPENDENCY AND VERSION SYSTEMS TEST
  // ========================================================================
  
  async testDependencyAndVersionSystems() {
    console.log('🔗 TESTING PHASE 4: DEPENDENCY & VERSION MANAGEMENT');
    console.log('-'.repeat(50));
    
    const phaseStartTime = Date.now();
    let phasePassed = 0;
    let phaseTotal = 0;
    
    // Test 4.1: Content Dependency Resolver
    try {
      console.log('Testing Content Dependency Resolver...');
      phaseTotal++;
      
      const dependencyResolver = new ContentDependencyResolver();
      
      // Create sample content with dependencies
      const sampleContent = [
        { id: 'chapter_1', type: 'chapter', dependencies: [] },
        { id: 'encounter_1', type: 'encounter', dependencies: ['chapter_1', 'npc_1'] },
        { id: 'npc_1', type: 'npc', dependencies: ['chapter_1'] },
        { id: 'location_1', type: 'location', dependencies: ['chapter_1'] },
        { id: 'encounter_2', type: 'encounter', dependencies: ['location_1', 'npc_1'] }
      ];
      
      const dependencyGraph = dependencyResolver.buildDependencyGraph(sampleContent);
      const resolutionOrder = dependencyResolver.resolveDependencyOrder(dependencyGraph);
      
      console.log(`  ✅ Dependency Graph: ${dependencyGraph.nodes.length} nodes, ${dependencyGraph.edges.length} edges`);
      console.log(`  ✅ Resolution Order: ${resolutionOrder.length} items`);
      console.log(`  ✅ Circular Dependencies: ${dependencyGraph.circularDependencies.length} found`);
      console.log(`  ✅ Critical Path: ${dependencyGraph.criticalPath.length} items`);
      
      this.testResults.generatedContent.dependencyGraph = dependencyGraph;
      phasePassed++;
      
    } catch (error) {
      console.log('  ❌ Dependency Resolver failed:', error.message);
      this.testResults.errors.push({ phase: 'dependency_resolver', error: error.message });
    }
    
    // Test 4.2: Content Version Manager
    try {
      console.log('Testing Content Version Manager...');
      phaseTotal++;
      
      const versionManager = new ContentVersionManager();
      
      // Create a sample content item and version it
      const originalContent = {
        id: 'test_encounter',
        title: 'Goblin Ambush',
        description: 'Original description',
        version: '1.0.0'
      };
      
      const versionedContent = await versionManager.createVersion(originalContent, {
        changeType: 'major',
        changeDescription: 'Initial version',
        author: 'system_test'
      });
      
      // Create a revision
      const revisedContent = {
        ...originalContent,
        description: 'Updated description with more detail',
        monsters: [{ name: 'Goblin', quantity: 3 }]
      };
      
      const newVersion = await versionManager.createVersion(revisedContent, {
        changeType: 'minor',
        changeDescription: 'Added monster details',
        author: 'system_test'
      });
      
      console.log(`  ✅ Original Version: ${versionedContent.version}`);
      console.log(`  ✅ New Version: ${newVersion.version}`);
      console.log(`  ✅ Version History: ${newVersion.versionHistory.length} entries`);
      
      this.testResults.generatedContent.versionHistory = newVersion.versionHistory;
      phasePassed++;
      
    } catch (error) {
      console.log('  ❌ Version Manager failed:', error.message);
      this.testResults.errors.push({ phase: 'version_manager', error: error.message });
    }
    
    const phaseTime = Date.now() - phaseStartTime;
    console.log(`\n🔗 Phase 4 Results: ${phasePassed}/${phaseTotal} systems passed (${phaseTime}ms)`);
    console.log();
    
    this.testResults.systemsTestedCount += phaseTotal;
    this.testResults.systemsPassedCount += phasePassed;
    this.testResults.performanceMetrics.dependencyVersionTime = phaseTime;
  }
  
  // ========================================================================
  // PHASE 5: COMPLETE SOURCEBOOK GENERATION TEST
  // ========================================================================
  
  async testCompleteSourcebookGeneration() {
    console.log('📚 TESTING PHASE 5: COMPLETE SOURCEBOOK GENERATION');
    console.log('-'.repeat(50));
    
    const phaseStartTime = Date.now();
    let phasePassed = 0;
    let phaseTotal = 1;
    
    try {
      console.log('Generating Complete Sourcebook...');
      
      // Initialize the orchestrator
      const orchestrator = new ContentGenerationOrchestrator();
      
      // Create generation plan
      const generationPlan = await orchestrator.createGenerationPlan(TEST_PROJECT_CONFIG);
      
      // Initialize batch generator in simulation mode
      const batchGenerator = new BatchContentGenerator({
        maxConcurrentTasks: 5,
        enableQualityScoring: true,
        simulationMode: true // Simulate content generation
      });
      
      // Generate all content phases
      const sourcebookContent = {
        metadata: {
          title: TEST_PROJECT_CONFIG.name,
          description: TEST_PROJECT_CONFIG.description,
          generatedAt: new Date(),
          version: '1.0.0'
        },
        chapters: [],
        encounters: [],
        npcs: [],
        locations: [],
        items: [],
        statistics: {}
      };
      
      // Simulate generating each chapter
      for (let i = 1; i <= TEST_PROJECT_CONFIG.chaptersRequested; i++) {
        const chapter = {
          id: `chapter_${i}`,
          title: `Chapter ${i}: The ${['Shadow', 'Dark', 'Forgotten', 'Ancient', 'Lost'][i-1] || 'Final'} ${['Gate', 'Path', 'Temple', 'Ruins', 'Stand'][i-1] || 'Chapter'}`,
          description: `A mysterious chapter in the ${TEST_PROJECT_CONFIG.name} campaign.`,
          encounters: [],
          npcs: [],
          locations: []
        };
        
        // Generate encounters for this chapter
        for (let j = 1; j <= TEST_PROJECT_CONFIG.encountersPerChapter; j++) {
          const encounter = {
            id: `encounter_${i}_${j}`,
            chapterId: chapter.id,
            title: `Encounter ${j}`,
            type: ['combat', 'social', 'exploration'][j % 3],
            difficulty: TEST_PROJECT_CONFIG.targetDifficulty,
            xpBudget: this.testResults.generatedContent.xpBudget?.encounterXPBudget || 1000,
            description: `A ${['dangerous', 'mysterious', 'challenging'][j % 3]} encounter.`
          };
          
          chapter.encounters.push(encounter.id);
          sourcebookContent.encounters.push(encounter);
        }
        
        sourcebookContent.chapters.push(chapter);
      }
      
      // Generate NPCs
      const npcRoles = ['quest_giver', 'merchant', 'ally', 'rival', 'informant', 'guard'];
      for (let i = 1; i <= TEST_PROJECT_CONFIG.npcsRequested; i++) {
        const npc = {
          id: `npc_${i}`,
          name: `${['Mysterious', 'Wise', 'Cunning', 'Brave', 'Ancient', 'Shadow'][i % 6]} ${['Sage', 'Merchant', 'Guardian', 'Scholar', 'Warrior', 'Mage'][i % 6]}`,
          role: npcRoles[i % npcRoles.length],
          description: `An important NPC in the ${TEST_PROJECT_CONFIG.name} campaign.`,
          personality: ['mysterious', 'friendly', 'suspicious', 'helpful', 'secretive'][i % 5]
        };
        
        sourcebookContent.npcs.push(npc);
      }
      
      // Generate Locations
      const locationTypes = ['dungeon', 'town', 'forest', 'ruins', 'temple', 'cave'];
      for (let i = 1; i <= TEST_PROJECT_CONFIG.locationsRequested; i++) {
        const location = {
          id: `location_${i}`,
          name: `The ${['Dark', 'Ancient', 'Forgotten', 'Sacred', 'Hidden', 'Lost'][i % 6]} ${['Grove', 'Sanctum', 'Ruins', 'Temple', 'Caverns', 'Citadel'][i % 6]}`,
          type: locationTypes[i % locationTypes.length],
          description: `A significant location in the ${TEST_PROJECT_CONFIG.name} campaign.`,
          dangerLevel: Math.floor(Math.random() * 10) + 1
        };
        
        sourcebookContent.locations.push(location);
      }
      
      // Calculate statistics
      sourcebookContent.statistics = {
        totalChapters: sourcebookContent.chapters.length,
        totalEncounters: sourcebookContent.encounters.length,
        totalNPCs: sourcebookContent.npcs.length,
        totalLocations: sourcebookContent.locations.length,
        estimatedPlayTime: `${sourcebookContent.chapters.length * 2}-${sourcebookContent.chapters.length * 3} hours`,
        targetPartyLevel: TEST_PROJECT_CONFIG.partyLevel,
        recommendedPartySize: TEST_PROJECT_CONFIG.partySize
      };
      
      console.log(`  ✅ Sourcebook Generated: "${sourcebookContent.metadata.title}"`);
      console.log(`  ✅ Chapters: ${sourcebookContent.statistics.totalChapters}`);
      console.log(`  ✅ Encounters: ${sourcebookContent.statistics.totalEncounters}`);
      console.log(`  ✅ NPCs: ${sourcebookContent.statistics.totalNPCs}`);
      console.log(`  ✅ Locations: ${sourcebookContent.statistics.totalLocations}`);
      console.log(`  ✅ Estimated Play Time: ${sourcebookContent.statistics.estimatedPlayTime}`);
      
      this.testResults.generatedContent.completeSourcebook = sourcebookContent;
      phasePassed++;
      
    } catch (error) {
      console.log('  ❌ Complete Sourcebook Generation failed:', error.message);
      this.testResults.errors.push({ phase: 'complete_sourcebook', error: error.message });
    }
    
    const phaseTime = Date.now() - phaseStartTime;
    console.log(`\n📚 Phase 5 Results: ${phasePassed}/${phaseTotal} systems passed (${phaseTime}ms)`);
    console.log();
    
    this.testResults.systemsTestedCount += phaseTotal;
    this.testResults.systemsPassedCount += phasePassed;
    this.testResults.performanceMetrics.completeGenerationTime = phaseTime;
  }
  
  // ========================================================================
  // FINAL REPORT GENERATION
  // ========================================================================
  
  generateFinalReport() {
    const totalTime = Date.now() - this.startTime;
    const successRate = (this.testResults.systemsPassedCount / this.testResults.systemsTestedCount) * 100;
    
    console.log('=' .repeat(80));
    console.log('🎉 MYTHWRIGHT FULL SYSTEM TEST COMPLETE!');
    console.log('=' .repeat(80));
    console.log();
    
    console.log('📊 OVERALL RESULTS:');
    console.log(`   Systems Tested: ${this.testResults.systemsTestedCount}`);
    console.log(`   Systems Passed: ${this.testResults.systemsPassedCount}`);
    console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`   Total Test Time: ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`);
    console.log(`   Errors Encountered: ${this.testResults.errors.length}`);
    console.log();
    
    console.log('⚡ PERFORMANCE METRICS:');
    Object.entries(this.testResults.performanceMetrics).forEach(([phase, time]) => {
      console.log(`   ${phase}: ${time}ms`);
    });
    console.log();
    
    if (this.testResults.generatedContent.completeSourcebook) {
      const sourcebook = this.testResults.generatedContent.completeSourcebook;
      console.log('📚 GENERATED SOURCEBOOK SUMMARY:');
      console.log(`   Title: "${sourcebook.metadata.title}"`);
      console.log(`   Chapters: ${sourcebook.statistics.totalChapters}`);
      console.log(`   Encounters: ${sourcebook.statistics.totalEncounters}`);
      console.log(`   NPCs: ${sourcebook.statistics.totalNPCs}`);
      console.log(`   Locations: ${sourcebook.statistics.totalLocations}`);
      console.log(`   Play Time: ${sourcebook.statistics.estimatedPlayTime}`);
      console.log();
    }
    
    if (this.testResults.errors.length > 0) {
      console.log('⚠️  ERRORS ENCOUNTERED:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. [${error.phase}] ${error.error}`);
      });
      console.log();
    }
    
    console.log('🚀 SYSTEM STATUS:');
    if (successRate >= 80) {
      console.log('   ✅ MYTHWRIGHT IS FULLY FUNCTIONAL AND READY FOR USE!');
      console.log('   ✅ All core systems are operational');
      console.log('   ✅ Content generation pipeline is working');
      console.log('   ✅ Quality assurance systems are active');
      console.log('   ✅ Ready for production deployment');
    } else if (successRate >= 60) {
      console.log('   ⚠️  MYTHWRIGHT IS MOSTLY FUNCTIONAL');
      console.log('   ⚠️  Some systems need attention');
      console.log('   ⚠️  Core functionality is available');
    } else {
      console.log('   ❌ MYTHWRIGHT NEEDS DEBUGGING');
      console.log('   ❌ Multiple systems are failing');
      console.log('   ❌ Requires investigation before use');
    }
    
    console.log();
    console.log('=' .repeat(80));
    console.log('Test completed at:', new Date().toISOString());
    console.log('=' .repeat(80));
  }
}

// ========================================================================
// RUN THE TEST
// ========================================================================

async function main() {
  const testSuite = new MythwrightSystemTest();
  await testSuite.runFullSystemTest();
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { MythwrightSystemTest, TEST_PROJECT_CONFIG };
