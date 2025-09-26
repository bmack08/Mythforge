// Mythwright Campaign Types - Type definitions for campaign creation and management

// ============================================================================
// CAMPAIGN PARAMETER TYPES
// ============================================================================

export interface CampaignParameters {
  title: string;
  level: CampaignLevel;
  adventureType: AdventureType;
  theme: CampaignTheme;
  partySize: number;
  sessionCount: number;
  complexity: CampaignComplexity;
}

export type CampaignLevel = 'low' | 'mid' | 'high' | 'epic';

export type AdventureType = 
  | 'dungeon'     // Classic dungeon crawl
  | 'mystery'     // Investigation and puzzle-solving
  | 'intrigue'    // Social encounters and politics
  | 'wilderness'  // Exploration and survival
  | 'city'        // Urban adventures
  | 'planar';     // Multiplanar travel

export type CampaignTheme = 
  | 'classic-fantasy' 
  | 'dark-fantasy' 
  | 'high-fantasy' 
  | 'steampunk' 
  | 'modern' 
  | 'sci-fi';

export type CampaignComplexity = 'simple' | 'moderate' | 'complex';

// ============================================================================
// LEVEL RANGES AND XP CALCULATIONS
// ============================================================================

export interface LevelRange {
  min: number;
  max: number;
  avgLevel: number;
  tier: 'local' | 'heroic' | 'paragon' | 'epic';
  description: string;
}

export const LEVEL_RANGES: Record<CampaignLevel, LevelRange> = {
  low: {
    min: 1,
    max: 5,
    avgLevel: 3,
    tier: 'local',
    description: 'Local Heroes (Levels 1-5)'
  },
  mid: {
    min: 6,
    max: 10,
    avgLevel: 8,
    tier: 'heroic',
    description: 'Heroes of the Realm (Levels 6-10)'
  },
  high: {
    min: 11,
    max: 16,
    avgLevel: 13,
    tier: 'paragon',
    description: 'Masters of the Realm (Levels 11-16)'
  },
  epic: {
    min: 17,
    max: 20,
    avgLevel: 18,
    tier: 'epic',
    description: 'Masters of the World (Levels 17-20)'
  }
};

// ============================================================================
// ADVENTURE TYPE CONFIGURATIONS
// ============================================================================

export interface AdventureTypeConfig {
  name: string;
  description: string;
  icon: string;
  primaryPillar: 'combat' | 'exploration' | 'social';
  pillarWeights: {
    combat: number;
    exploration: number;
    social: number;
  };
  typicalLocations: string[];
  commonChallenges: string[];
  suggestedLength: {
    oneShot: number;
    shortArc: number;
    longCampaign: number;
  };
}

export const ADVENTURE_TYPES: Record<AdventureType, AdventureTypeConfig> = {
  dungeon: {
    name: 'Dungeon Crawl',
    description: 'Classic dungeon exploration with traps, monsters, and treasure',
    icon: '🏰',
    primaryPillar: 'combat',
    pillarWeights: { combat: 50, exploration: 35, social: 15 },
    typicalLocations: ['Ancient ruins', 'Underground complexes', 'Forgotten temples', 'Monster lairs'],
    commonChallenges: ['Combat encounters', 'Traps and hazards', 'Puzzle rooms', 'Resource management'],
    suggestedLength: { oneShot: 1, shortArc: 3, longCampaign: 8 }
  },
  mystery: {
    name: 'Investigation Mystery',
    description: 'Solve crimes, uncover secrets, and piece together clues',
    icon: '🔍',
    primaryPillar: 'exploration',
    pillarWeights: { combat: 25, exploration: 40, social: 35 },
    typicalLocations: ['Crime scenes', 'Urban environments', 'Noble estates', 'Scholarly institutions'],
    commonChallenges: ['Gathering clues', 'Interviewing witnesses', 'Deductive reasoning', 'Uncovering conspiracies'],
    suggestedLength: { oneShot: 1, shortArc: 4, longCampaign: 10 }
  },
  intrigue: {
    name: 'Social Intrigue',
    description: 'Navigate politics, diplomacy, and court machinations',
    icon: '🎭',
    primaryPillar: 'social',
    pillarWeights: { combat: 15, exploration: 25, social: 60 },
    typicalLocations: ['Royal courts', 'Noble mansions', 'Diplomatic meetings', 'Secret societies'],
    commonChallenges: ['Political maneuvering', 'Social encounters', 'Information trading', 'Alliance building'],
    suggestedLength: { oneShot: 1, shortArc: 5, longCampaign: 12 }
  },
  wilderness: {
    name: 'Wilderness Exploration',
    description: 'Survive and explore the untamed wilds',
    icon: '🌲',
    primaryPillar: 'exploration',
    pillarWeights: { combat: 40, exploration: 45, social: 15 },
    typicalLocations: ['Dense forests', 'Mountain ranges', 'Deserts', 'Uncharted territories'],
    commonChallenges: ['Survival mechanics', 'Navigation', 'Weather hazards', 'Wild creatures'],
    suggestedLength: { oneShot: 1, shortArc: 4, longCampaign: 10 }
  },
  city: {
    name: 'City Adventure',
    description: 'Urban quests and metropolitan encounters',
    icon: '🏘️',
    primaryPillar: 'social',
    pillarWeights: { combat: 30, exploration: 30, social: 40 },
    typicalLocations: ['City districts', 'Taverns and shops', 'Underground networks', 'Guild halls'],
    commonChallenges: ['Urban exploration', 'Guild politics', 'Street encounters', 'City-specific obstacles'],
    suggestedLength: { oneShot: 1, shortArc: 3, longCampaign: 8 }
  },
  planar: {
    name: 'Planar Adventure',
    description: 'Travel between planes of existence',
    icon: '✨',
    primaryPillar: 'exploration',
    pillarWeights: { combat: 45, exploration: 40, social: 15 },
    typicalLocations: ['Elemental planes', 'Feywild', 'Shadowfell', 'Outer planes'],
    commonChallenges: ['Planar travel', 'Otherworldly encounters', 'Plane-specific hazards', 'Cosmic threats'],
    suggestedLength: { oneShot: 1, shortArc: 6, longCampaign: 15 }
  }
};

// ============================================================================
// THEME CONFIGURATIONS
// ============================================================================

export interface ThemeConfig {
  name: string;
  description: string;
  tone: string;
  setting: string;
  visualStyle: string;
  commonElements: string[];
  typicalNPCs: string[];
  suggestedMusic: string[];
}

export const CAMPAIGN_THEMES: Record<CampaignTheme, ThemeConfig> = {
  'classic-fantasy': {
    name: 'Classic Fantasy',
    description: 'Traditional D&D with knights, wizards, and dragons',
    tone: 'Heroic Adventure',
    setting: 'Medieval Fantasy',
    visualStyle: 'Bright colors, heroic imagery, medieval aesthetics',
    commonElements: ['Knights in shining armor', 'Wise wizards', 'Noble quests', 'Ancient magic'],
    typicalNPCs: ['Village elder', 'Court wizard', 'Noble knight', 'Tavern keeper'],
    suggestedMusic: ['Epic orchestral', 'Celtic folk', 'Medieval instruments']
  },
  'dark-fantasy': {
    name: 'Dark Fantasy',
    description: 'Gritty, horror-tinged adventures with moral ambiguity',
    tone: 'Gothic Horror',
    setting: 'Dark Medieval',
    visualStyle: 'Muted colors, gothic architecture, ominous shadows',
    commonElements: ['Moral ambiguity', 'Undead threats', 'Cursed lands', 'Desperate choices'],
    typicalNPCs: ['Haunted survivor', 'Corrupt official', 'Mad hermit', 'Desperate merchant'],
    suggestedMusic: ['Dark ambient', 'Gothic orchestral', 'Haunting melodies']
  },
  'high-fantasy': {
    name: 'High Fantasy',
    description: 'Epic adventures with powerful magic and cosmic stakes',
    tone: 'Epic Heroism',
    setting: 'Magical Realms',
    visualStyle: 'Vibrant magic, soaring architecture, otherworldly beauty',
    commonElements: ['Powerful magic', 'Epic quests', 'Cosmic threats', 'Legendary artifacts'],
    typicalNPCs: ['Archmage', 'Divine herald', 'Ancient dragon', 'Celestial being'],
    suggestedMusic: ['Epic orchestral', 'Choral arrangements', 'Mystical themes']
  },
  'steampunk': {
    name: 'Steampunk Fantasy',
    description: 'Industrial magic with steam-powered technology',
    tone: 'Industrial Adventure',
    setting: 'Magical Industrial',
    visualStyle: 'Brass and copper, steam and gears, Victorian aesthetics',
    commonElements: ['Steam technology', 'Industrial magic', 'Clockwork creatures', 'Scientific discovery'],
    typicalNPCs: ['Mad inventor', 'Factory owner', 'Airship captain', 'Mechanical construct'],
    suggestedMusic: ['Industrial themes', 'Victorian orchestral', 'Clockwork rhythms']
  },
  'modern': {
    name: 'Modern Fantasy',
    description: 'Magic hidden in the contemporary world',
    tone: 'Contemporary Action',
    setting: 'Hidden Modern World',
    visualStyle: 'Urban environments, hidden magic, technology blend',
    commonElements: ['Hidden supernatural', 'Urban adventures', 'Modern technology', 'Secret societies'],
    typicalNPCs: ['Corporate mage', 'Street informant', 'Government agent', 'Tech specialist'],
    suggestedMusic: ['Urban beats', 'Electronic ambient', 'Action themes']
  },
  'sci-fi': {
    name: 'Science Fantasy',
    description: 'Space-faring adventures with technology and magic',
    tone: 'Space Opera',
    setting: 'Galactic Fantasy',
    visualStyle: 'Futuristic technology, alien worlds, cosmic scope',
    commonElements: ['Space travel', 'Alien cultures', 'Advanced technology', 'Cosmic magic'],
    typicalNPCs: ['Alien diplomat', 'Space marine', 'AI construct', 'Galactic trader'],
    suggestedMusic: ['Sci-fi orchestral', 'Electronic ambient', 'Cosmic themes']
  }
};

// ============================================================================
// COMPLEXITY CONFIGURATIONS
// ============================================================================

export interface ComplexityConfig {
  name: string;
  description: string;
  plotThreads: number;
  npcDepth: 'basic' | 'moderate' | 'deep';
  politicalElements: 'minimal' | 'moderate' | 'complex';
  moralComplexity: 'clear' | 'nuanced' | 'ambiguous';
  preparationTime: 'low' | 'medium' | 'high';
  playerExperience: 'beginner' | 'intermediate' | 'advanced';
}

export const COMPLEXITY_LEVELS: Record<CampaignComplexity, ComplexityConfig> = {
  simple: {
    name: 'Simple',
    description: 'Straightforward plot with clear objectives',
    plotThreads: 1,
    npcDepth: 'basic',
    politicalElements: 'minimal',
    moralComplexity: 'clear',
    preparationTime: 'low',
    playerExperience: 'beginner'
  },
  moderate: {
    name: 'Moderate',
    description: 'Multiple plot threads with some interconnection',
    plotThreads: 3,
    npcDepth: 'moderate',
    politicalElements: 'moderate',
    moralComplexity: 'nuanced',
    preparationTime: 'medium',
    playerExperience: 'intermediate'
  },
  complex: {
    name: 'Complex',
    description: 'Intricate storylines with deep political intrigue',
    plotThreads: 5,
    npcDepth: 'deep',
    politicalElements: 'complex',
    moralComplexity: 'ambiguous',
    preparationTime: 'high',
    playerExperience: 'advanced'
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getLevelRangeDescription(level: CampaignLevel): string {
  return LEVEL_RANGES[level].description;
}

export function getAdventureTypeConfig(type: AdventureType): AdventureTypeConfig {
  return ADVENTURE_TYPES[type];
}

export function getThemeConfig(theme: CampaignTheme): ThemeConfig {
  return CAMPAIGN_THEMES[theme];
}

export function getComplexityConfig(complexity: CampaignComplexity): ComplexityConfig {
  return COMPLEXITY_LEVELS[complexity];
}

export function validateCampaignParameters(params: Partial<CampaignParameters>): string[] {
  const errors: string[] = [];

  if (!params.title || params.title.trim().length === 0) {
    errors.push('Campaign title is required');
  }

  if (params.title && params.title.length > 100) {
    errors.push('Campaign title must be 100 characters or less');
  }

  if (!params.level || !Object.keys(LEVEL_RANGES).includes(params.level)) {
    errors.push('Valid campaign level is required');
  }

  if (!params.adventureType || !Object.keys(ADVENTURE_TYPES).includes(params.adventureType)) {
    errors.push('Valid adventure type is required');
  }

  if (!params.theme || !Object.keys(CAMPAIGN_THEMES).includes(params.theme)) {
    errors.push('Valid campaign theme is required');
  }

  if (!params.partySize || params.partySize < 1 || params.partySize > 8) {
    errors.push('Party size must be between 1 and 8 players');
  }

  if (!params.sessionCount || params.sessionCount < 1 || params.sessionCount > 50) {
    errors.push('Session count must be between 1 and 50 sessions');
  }

  if (!params.complexity || !Object.keys(COMPLEXITY_LEVELS).includes(params.complexity)) {
    errors.push('Valid complexity level is required');
  }

  return errors;
}

export function calculateEstimatedPlayTime(sessionCount: number, hoursPerSession: number = 4): {
  totalHours: number;
  sessions: number;
  hoursPerSession: number;
  estimatedWeeks: number;
} {
  const totalHours = sessionCount * hoursPerSession;
  const estimatedWeeks = Math.ceil(sessionCount / 1); // Assuming weekly sessions

  return {
    totalHours,
    sessions: sessionCount,
    hoursPerSession,
    estimatedWeeks
  };
}

export function getRecommendedSessionCount(adventureType: AdventureType, complexity: CampaignComplexity): {
  oneShot: number;
  shortArc: number;
  longCampaign: number;
} {
  const baseRecommendations = ADVENTURE_TYPES[adventureType].suggestedLength;
  const complexityMultiplier = complexity === 'simple' ? 0.8 : complexity === 'complex' ? 1.5 : 1.0;

  return {
    oneShot: Math.max(1, Math.round(baseRecommendations.oneShot * complexityMultiplier)),
    shortArc: Math.max(2, Math.round(baseRecommendations.shortArc * complexityMultiplier)),
    longCampaign: Math.max(6, Math.round(baseRecommendations.longCampaign * complexityMultiplier))
  };
}