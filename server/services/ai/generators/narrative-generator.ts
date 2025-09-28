// Mythwright Narrative Generator - Specialized D&D 5e Narrative Content Creation for Boxed Text & Descriptions
import type { AIGenerationRequest, AIGenerationResponse } from '../index.js';
import type { NarrativeContent, SystemDesignBudget } from '../../../types/content.types.js';
import { NarrativeContentSchema } from '../../../schemas/content.schemas.js';

// ============================================================================
// NARRATIVE GENERATION TYPES
// ============================================================================

export interface NarrativeGenerationRequest {
  // Basic Requirements
  contentType: NarrativeType;
  purpose: NarrativePurpose;
  length: NarrativeLength;
  
  // Context & Setting
  setting: SettingType;
  atmosphere: AtmosphereType;
  timeOfDay?: TimeOfDay;
  weather?: WeatherType;
  season?: Season;
  
  // Audience & Tone
  targetAudience: AudienceType;
  toneStyle: ToneStyle;
  voiceStyle: VoiceStyle;
  emotionalTone: EmotionalTone;
  
  // Content Parameters
  perspectiveType: PerspectiveType;
  sensoryFocus?: SensoryType[];
  keyElements?: string[];
  characterFocus?: string[];
  
  // Specific Requirements
  boxedTextStyle?: BoxedTextStyle;
  includeDialogue?: boolean;
  includeAction?: boolean;
  includeSensory?: boolean;
  includeEmotion?: boolean;
  
  // Customization
  theme?: NarrativeTheme;
  genre?: GenreStyle;
  culturalContext?: CulturalContext;
  languageStyle?: LanguageStyle;
  
  // Constraints
  avoidTopics?: string[];
  mustInclude?: string[];
  maxSentences?: number;
  readingLevel?: ReadingLevel;
  
  // System Integration
  systemBudget?: SystemDesignBudget;
}

export type NarrativeType = 
  | 'boxed_text' | 'room_description' | 'environmental_description' | 'character_description'
  | 'action_sequence' | 'dialogue_scene' | 'atmospheric_text' | 'transition_text'
  | 'opening_scene' | 'climax_moment' | 'resolution_text' | 'flavor_text';

export type NarrativePurpose = 
  | 'scene_setting' | 'mood_establishment' | 'information_delivery' | 'tension_building'
  | 'character_introduction' | 'plot_advancement' | 'world_building' | 'emotional_impact'
  | 'transition_bridging' | 'mystery_creation' | 'revelation_moment' | 'immersion_enhancement';

export type NarrativeLength = 
  | 'brief' | 'short' | 'medium' | 'long' | 'extended';

export type SettingType = 
  | 'dungeon' | 'forest' | 'city' | 'tavern' | 'castle' | 'wilderness' | 'underground'
  | 'coastal' | 'mountain' | 'desert' | 'swamp' | 'ruins' | 'temple' | 'library'
  | 'marketplace' | 'throne_room' | 'laboratory' | 'cemetery' | 'battlefield' | 'ship';

export type AtmosphereType = 
  | 'mysterious' | 'foreboding' | 'peaceful' | 'tense' | 'magical' | 'ancient'
  | 'bustling' | 'desolate' | 'majestic' | 'sinister' | 'welcoming' | 'ethereal'
  | 'oppressive' | 'hopeful' | 'melancholic' | 'energetic' | 'sacred' | 'profane';

export type TimeOfDay = 
  | 'dawn' | 'morning' | 'midday' | 'afternoon' | 'dusk' | 'evening' | 'night' | 'midnight';

export type WeatherType = 
  | 'clear' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'snowy' | 'windy' | 'misty';

export type Season = 
  | 'spring' | 'summer' | 'autumn' | 'winter';

export type AudienceType = 
  | 'players' | 'dungeon_master' | 'general_reader' | 'experienced_players' | 'newcomers';

export type ToneStyle = 
  | 'formal' | 'casual' | 'dramatic' | 'humorous' | 'serious' | 'whimsical'
  | 'epic' | 'intimate' | 'suspenseful' | 'informative' | 'poetic' | 'direct';

export type VoiceStyle = 
  | 'omniscient_narrator' | 'limited_narrator' | 'second_person' | 'descriptive'
  | 'cinematic' | 'literary' | 'conversational' | 'documentary' | 'immersive';

export type EmotionalTone = 
  | 'neutral' | 'excited' | 'fearful' | 'hopeful' | 'melancholic' | 'angry'
  | 'joyful' | 'anxious' | 'nostalgic' | 'determined' | 'curious' | 'reverent';

export type PerspectiveType = 
  | 'third_person_omniscient' | 'third_person_limited' | 'second_person'
  | 'first_person_observer' | 'environmental_focus' | 'character_focus';

export type SensoryType = 
  | 'visual' | 'auditory' | 'olfactory' | 'tactile' | 'gustatory' | 'kinesthetic';

export type BoxedTextStyle = 
  | 'read_aloud' | 'player_handout' | 'atmospheric_quote' | 'character_thoughts'
  | 'environmental_text' | 'narrative_hook' | 'dramatic_moment' | 'information_block';

export type NarrativeTheme = 
  | 'heroic_fantasy' | 'dark_fantasy' | 'high_fantasy' | 'low_fantasy' | 'gothic_horror'
  | 'sword_and_sorcery' | 'political_intrigue' | 'exploration_adventure' | 'urban_fantasy'
  | 'mythic_fantasy' | 'steampunk_fantasy' | 'cosmic_horror' | 'fairy_tale' | 'grimdark';

export type GenreStyle = 
  | 'classic_fantasy' | 'modern_fantasy' | 'horror' | 'adventure' | 'mystery'
  | 'political_thriller' | 'romance' | 'comedy' | 'tragedy' | 'epic' | 'slice_of_life';

export type CulturalContext = 
  | 'medieval_european' | 'ancient_greco_roman' | 'norse_viking' | 'celtic_gaelic'
  | 'middle_eastern' | 'far_eastern' | 'african_inspired' | 'indigenous_american'
  | 'renaissance_italian' | 'victorian_steampunk' | 'generic_fantasy' | 'multicultural';

export type LanguageStyle = 
  | 'modern_english' | 'archaic_english' | 'formal_prose' | 'colloquial_speech'
  | 'poetic_language' | 'simple_language' | 'rich_vocabulary' | 'technical_precise';

export type ReadingLevel = 
  | 'elementary' | 'middle_school' | 'high_school' | 'college' | 'advanced';

export interface NarrativeGenerationResult {
  narrativeContent: NarrativeContent;
  qualityAnalysis: QualityAnalysis;
  styleAnalysis: StyleAnalysis;
  usageGuidance: UsageGuidance;
  variants: NarrativeVariant[];
  adaptationSuggestions: AdaptationSuggestion[];
}

export interface QualityAnalysis {
  readabilityScore: number; // 0-100
  immersionScore: number; // 0-100
  clarityScore: number; // 0-100
  atmosphereScore: number; // 0-100
  engagementScore: number; // 0-100
  qualityFactors: QualityFactor[];
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface QualityFactor {
  factor: string;
  score: number; // 0-100
  feedback: string;
  suggestions: string[];
}

export interface StyleAnalysis {
  toneConsistency: number; // 0-100
  voiceStrength: number; // 0-100
  sensoryRichness: SensoryRichness;
  languageComplexity: LanguageComplexity;
  pacing: PacingAnalysis;
  literaryDevices: LiteraryDevice[];
}

export interface SensoryRichness {
  visual: number; // 0-100
  auditory: number; // 0-100
  olfactory: number; // 0-100
  tactile: number; // 0-100
  gustatory: number; // 0-100
  overall: number; // 0-100
}

export interface LanguageComplexity {
  vocabularyLevel: 'simple' | 'moderate' | 'advanced' | 'complex';
  sentenceVariety: number; // 0-100
  readingGrade: number; // Grade level
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
}

export interface PacingAnalysis {
  rhythm: 'fast' | 'moderate' | 'slow' | 'varied';
  tension: 'low' | 'medium' | 'high' | 'escalating';
  flow: number; // 0-100
  transitions: number; // 0-100
}

export interface LiteraryDevice {
  device: string;
  usage: 'light' | 'moderate' | 'heavy';
  effectiveness: number; // 0-100
  examples: string[];
}

export interface UsageGuidance {
  bestContexts: string[];
  dmTips: string[];
  playerEngagement: string[];
  adaptationNotes: string[];
  commonMistakes: string[];
}

export interface NarrativeVariant {
  name: string;
  description: string;
  modifications: string[];
  useCase: string;
  toneShift: string;
}

export interface AdaptationSuggestion {
  context: string;
  modification: string;
  reason: string;
  implementation: string;
}

// ============================================================================
// NARRATIVE TEMPLATES AND PATTERNS
// ============================================================================

const ATMOSPHERE_DESCRIPTORS = {
  mysterious: ['shrouded', 'enigmatic', 'veiled', 'cryptic', 'obscure', 'hidden'],
  foreboding: ['ominous', 'threatening', 'menacing', 'dark', 'sinister', 'brooding'],
  peaceful: ['serene', 'tranquil', 'calm', 'gentle', 'soothing', 'harmonious'],
  magical: ['enchanted', 'mystical', 'arcane', 'ethereal', 'otherworldly', 'luminous'],
  ancient: ['weathered', 'timeworn', 'venerable', 'primordial', 'forgotten', 'eternal'],
  majestic: ['grand', 'magnificent', 'imposing', 'regal', 'splendid', 'awe-inspiring']
};

const SENSORY_WORDS = {
  visual: ['gleaming', 'shadowed', 'brilliant', 'dim', 'colorful', 'stark', 'shimmering'],
  auditory: ['echoing', 'whispering', 'thundering', 'silent', 'melodic', 'harsh', 'resonant'],
  olfactory: ['fragrant', 'musty', 'acrid', 'sweet', 'earthy', 'pungent', 'fresh'],
  tactile: ['rough', 'smooth', 'cold', 'warm', 'soft', 'sharp', 'yielding'],
  gustatory: ['bitter', 'sweet', 'salty', 'metallic', 'savory', 'bland', 'rich']
};

const PACING_PATTERNS = {
  fast: { shortSentences: 0.7, actionWords: 0.6, punctuation: 'frequent' },
  moderate: { shortSentences: 0.5, actionWords: 0.4, punctuation: 'balanced' },
  slow: { shortSentences: 0.3, actionWords: 0.2, punctuation: 'flowing' }
};

// ============================================================================
// NARRATIVE GENERATOR CLASS
// ============================================================================

export class NarrativeGenerator {
  
  // ============================================================================
  // MAIN GENERATION METHOD
  // ============================================================================
  
  static async generateNarrative(
    request: NarrativeGenerationRequest,
    aiService: any // AIService type
  ): Promise<NarrativeGenerationResult> {
    
    // Step 1: Build the AI prompt
    const aiPrompt = this.buildNarrativePrompt(request);
    
    // Step 2: Create AI generation request
    const aiRequest: AIGenerationRequest = {
      type: 'narrative',
      prompt: aiPrompt,
      context: {
        systemBudget: request.systemBudget,
        additionalContext: {
          contentType: request.contentType,
          purpose: request.purpose,
          setting: request.setting,
          atmosphere: request.atmosphere,
          toneStyle: request.toneStyle,
          length: request.length
        }
      },
      options: {
        temperature: 0.8, // Higher creativity for narrative content
        maxTokens: this.getMaxTokensForLength(request.length)
      }
    };
    
    // Step 3: Generate with AI service
    const aiResponse = await aiService.generateContent(aiRequest);
    
    if (!aiResponse.success) {
      throw new Error(`Narrative generation failed: ${aiResponse.error?.message}`);
    }
    
    // Step 4: Validate and parse the narrative content
    const narrativeContent = this.validateAndParseNarrative(aiResponse.content);
    
    // Step 5: Analyze quality
    const qualityAnalysis = this.analyzeQuality(narrativeContent, request);
    
    // Step 6: Analyze style
    const styleAnalysis = this.analyzeStyle(narrativeContent, request);
    
    // Step 7: Generate usage guidance
    const usageGuidance = this.generateUsageGuidance(narrativeContent, request);
    
    // Step 8: Create variants
    const variants = this.generateVariants(narrativeContent, request);
    
    // Step 9: Generate adaptation suggestions
    const adaptationSuggestions = this.generateAdaptationSuggestions(narrativeContent, request);
    
    return {
      narrativeContent,
      qualityAnalysis,
      styleAnalysis,
      usageGuidance,
      variants,
      adaptationSuggestions
    };
  }
  
  // ============================================================================
  // PROMPT BUILDING
  // ============================================================================
  
  private static buildNarrativePrompt(request: NarrativeGenerationRequest): string {
    const lengthGuidance = this.getLengthGuidance(request.length);
    const atmosphereWords = ATMOSPHERE_DESCRIPTORS[request.atmosphere] || ['atmospheric'];
    
    let prompt = `Create immersive D&D 5e narrative content with rich atmospheric detail:

CORE REQUIREMENTS:
- Content Type: ${request.contentType}
- Purpose: ${request.purpose}
- Length: ${request.length} (${lengthGuidance})`;

    // Add setting and atmosphere
    prompt += `\n\nSETTING & ATMOSPHERE:`;
    prompt += `\n- Setting: ${request.setting}`;
    prompt += `\n- Atmosphere: ${request.atmosphere} (${atmosphereWords.slice(0, 3).join(', ')})`;
    
    if (request.timeOfDay) {
      prompt += `\n- Time of Day: ${request.timeOfDay}`;
    }
    
    if (request.weather) {
      prompt += `\n- Weather: ${request.weather}`;
    }
    
    if (request.season) {
      prompt += `\n- Season: ${request.season}`;
    }
    
    // Add tone and style requirements
    prompt += `\n\nTONE & STYLE:`;
    prompt += `\n- Target Audience: ${request.targetAudience}`;
    prompt += `\n- Tone Style: ${request.toneStyle}`;
    prompt += `\n- Voice Style: ${request.voiceStyle}`;
    prompt += `\n- Emotional Tone: ${request.emotionalTone}`;
    prompt += `\n- Perspective: ${request.perspectiveType}`;
    
    if (request.languageStyle) {
      prompt += `\n- Language Style: ${request.languageStyle}`;
    }
    
    if (request.readingLevel) {
      prompt += `\n- Reading Level: ${request.readingLevel}`;
    }
    
    // Add sensory focus
    if (request.sensoryFocus && request.sensoryFocus.length > 0) {
      prompt += `\n\nSENSORY FOCUS:`;
      request.sensoryFocus.forEach(sense => {
        const words = SENSORY_WORDS[sense] || [];
        prompt += `\n- ${sense}: Use words like ${words.slice(0, 3).join(', ')}`;
      });
    }
    
    // Add content parameters
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
    
    // Add specific requirements
    if (request.includeDialogue || request.includeAction || request.includeSensory || request.includeEmotion) {
      prompt += `\n\nSPECIFIC REQUIREMENTS:`;
      if (request.includeDialogue) prompt += `\n- Include dialogue or character speech`;
      if (request.includeAction) prompt += `\n- Include action and movement`;
      if (request.includeSensory) prompt += `\n- Rich sensory descriptions`;
      if (request.includeEmotion) prompt += `\n- Emotional depth and resonance`;
    }
    
    // Add boxed text style if specified
    if (request.boxedTextStyle) {
      prompt += `\n\nBOXED TEXT STYLE: ${request.boxedTextStyle}`;
      prompt += this.getBoxedTextGuidance(request.boxedTextStyle);
    }
    
    // Add theme and genre
    if (request.theme || request.genre) {
      prompt += `\n\nTHEME & GENRE:`;
      if (request.theme) prompt += `\n- Theme: ${request.theme}`;
      if (request.genre) prompt += `\n- Genre: ${request.genre}`;
    }
    
    if (request.culturalContext) {
      prompt += `\n- Cultural Context: ${request.culturalContext}`;
    }
    
    // Add must-include requirements
    if (request.mustInclude && request.mustInclude.length > 0) {
      prompt += `\n\nMUST INCLUDE:`;
      request.mustInclude.forEach(requirement => {
        prompt += `\n- ${requirement}`;
      });
    }
    
    // Add avoidance topics
    if (request.avoidTopics && request.avoidTopics.length > 0) {
      prompt += `\n\nAVOID TOPICS:`;
      request.avoidTopics.forEach(topic => {
        prompt += `\n- ${topic}`;
      });
    }
    
    // Add length constraints
    if (request.maxSentences) {
      prompt += `\n\nLENGTH CONSTRAINTS:`;
      prompt += `\n- Maximum sentences: ${request.maxSentences}`;
    }
    
    // Add content type specific guidance
    prompt += this.getContentTypeGuidance(request.contentType, request.purpose);
    
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
11. Use appropriate literary devices for atmosphere and engagement
12. Ensure content is suitable for the target audience

Return complete narrative content in JSON format following the NarrativeContent schema with the main text, optional boxed text sections, atmospheric elements, and any dialogue or special formatting.`;
    
    return prompt;
  }
  
  private static getLengthGuidance(length: NarrativeLength): string {
    switch (length) {
      case 'brief': return '1-2 sentences, concise and impactful';
      case 'short': return '3-5 sentences, focused and direct';
      case 'medium': return '1-2 paragraphs, balanced detail';
      case 'long': return '2-3 paragraphs, rich description';
      case 'extended': return '3+ paragraphs, comprehensive narrative';
      default: return '1-2 paragraphs, balanced detail';
    }
  }
  
  private static getMaxTokensForLength(length: NarrativeLength): number {
    switch (length) {
      case 'brief': return 150;
      case 'short': return 300;
      case 'medium': return 600;
      case 'long': return 1000;
      case 'extended': return 1500;
      default: return 600;
    }
  }
  
  private static getBoxedTextGuidance(style: BoxedTextStyle): string {
    let guidance = `\n\nBOXED TEXT GUIDANCE:`;
    
    switch (style) {
      case 'read_aloud':
        guidance += `\n- Write text meant to be read aloud to players
- Use second person ("you see", "you hear")
- Focus on immediate, observable details
- Create dramatic impact and atmosphere`;
        break;
      case 'player_handout':
        guidance += `\n- Write as if from an in-world document
- Use appropriate in-character voice and perspective
- Include specific details players can act upon
- Make it feel authentic to the game world`;
        break;
      case 'atmospheric_quote':
        guidance += `\n- Create evocative, mood-setting text
- Use literary language and imagery
- Focus on emotional and atmospheric impact
- Keep it memorable and quotable`;
        break;
      case 'character_thoughts':
        guidance += `\n- Write internal monologue or thoughts
- Use first person perspective
- Show personality and emotional state
- Reveal character motivations and feelings`;
        break;
      case 'environmental_text':
        guidance += `\n- Focus on setting and environment
- Use rich sensory descriptions
- Create sense of place and atmosphere
- Help players visualize the scene`;
        break;
      case 'narrative_hook':
        guidance += `\n- Create compelling opening or transition
- Build tension and interest
- Set up story elements and mysteries
- Engage player curiosity and investment`;
        break;
      case 'dramatic_moment':
        guidance += `\n- Emphasize high-stakes or emotional moments
- Use impactful language and imagery
- Create tension and excitement
- Make the moment memorable and significant`;
        break;
      case 'information_block':
        guidance += `\n- Present important information clearly
- Use organized, accessible language
- Balance detail with readability
- Ensure key information is memorable`;
        break;
    }
    
    return guidance;
  }
  
  private static getContentTypeGuidance(contentType: NarrativeType, purpose: NarrativePurpose): string {
    let guidance = `\n\nCONTENT TYPE GUIDANCE (${contentType.toUpperCase()}):`;
    
    switch (contentType) {
      case 'boxed_text':
        guidance += `\n- Format as distinct, highlighted text for DM reading
- Create immediate impact and atmosphere
- Use evocative language that sets the scene
- Make it easy to read aloud dramatically`;
        break;
      case 'room_description':
        guidance += `\n- Describe physical space, layout, and contents
- Include sensory details and atmosphere
- Note important features and potential interactions
- Balance detail with practical gameplay needs`;
        break;
      case 'environmental_description':
        guidance += `\n- Paint vivid picture of the broader environment
- Include weather, lighting, and atmospheric conditions
- Create sense of place and mood
- Consider how environment affects gameplay`;
        break;
      case 'character_description':
        guidance += `\n- Bring characters to life with vivid details
- Include appearance, mannerisms, and personality hints
- Show character through actions and dialogue
- Make characters memorable and distinctive`;
        break;
      case 'action_sequence':
        guidance += `\n- Create dynamic, engaging action narrative
- Use active voice and strong verbs
- Maintain clear sequence of events
- Build tension and excitement`;
        break;
      case 'dialogue_scene':
        guidance += `\n- Write natural, character-appropriate dialogue
- Include speaker tags and action beats
- Show personality through speech patterns
- Advance plot or reveal character`;
        break;
      case 'atmospheric_text':
        guidance += `\n- Focus on mood and emotional impact
- Use rich imagery and sensory details
- Create immersive atmosphere
- Support the overall narrative tone`;
        break;
      case 'transition_text':
        guidance += `\n- Smoothly bridge between scenes or locations
- Maintain narrative flow and continuity
- Set up new scenes or situations
- Keep momentum while providing necessary information`;
        break;
    }
    
    // Add purpose-specific guidance
    switch (purpose) {
      case 'scene_setting':
        guidance += `\n- Establish location, time, and basic situation
- Create clear mental picture for players
- Set appropriate mood and expectations`;
        break;
      case 'mood_establishment':
        guidance += `\n- Focus on emotional tone and atmosphere
- Use sensory details and imagery
- Create desired emotional response`;
        break;
      case 'tension_building':
        guidance += `\n- Gradually increase suspense and anticipation
- Use pacing and word choice to build tension
- Create sense of impending conflict or revelation`;
        break;
      case 'information_delivery':
        guidance += `\n- Present important facts or lore clearly
- Balance information with narrative flow
- Make exposition engaging and memorable`;
        break;
    }
    
    return guidance;
  }
  
  // ============================================================================
  // NARRATIVE VALIDATION
  // ============================================================================
  
  private static validateAndParseNarrative(content: any): NarrativeContent {
    // Validate against schema
    const validation = NarrativeContentSchema.safeParse(content);
    
    if (!validation.success) {
      // Try to fix common issues
      const fixed = this.attemptNarrativeFix(content);
      const revalidation = NarrativeContentSchema.safeParse(fixed);
      
      if (!revalidation.success) {
        throw new Error(`Invalid narrative content generated: ${validation.error.errors.map(e => e.message).join(', ')}`);
      }
      
      return fixed;
    }
    
    return validation.data;
  }
  
  private static attemptNarrativeFix(content: any): any {
    const fixed = { ...content };
    
    // Fix common issues
    if (!fixed.mainText) {
      fixed.mainText = content.text || content.content || 'Generated narrative content.';
    }
    
    if (!fixed.title) {
      fixed.title = 'Narrative Content';
    }
    
    if (!fixed.contentType) {
      fixed.contentType = 'atmospheric_text';
    }
    
    if (!fixed.atmosphere) {
      fixed.atmosphere = 'neutral';
    }
    
    if (!fixed.wordCount) {
      fixed.wordCount = this.countWords(fixed.mainText);
    }
    
    return fixed;
  }
  
  private static countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }
  
  // ============================================================================
  // QUALITY ANALYSIS
  // ============================================================================
  
  private static analyzeQuality(
    narrative: NarrativeContent, 
    request: NarrativeGenerationRequest
  ): QualityAnalysis {
    const qualityFactors = this.analyzeQualityFactors(narrative, request);
    
    const readabilityScore = this.calculateReadabilityScore(narrative);
    const immersionScore = this.calculateImmersionScore(narrative, request);
    const clarityScore = this.calculateClarityScore(narrative);
    const atmosphereScore = this.calculateAtmosphereScore(narrative, request);
    const engagementScore = this.calculateEngagementScore(narrative);
    
    const overallScore = (readabilityScore + immersionScore + clarityScore + atmosphereScore + engagementScore) / 5;
    const overallGrade = this.scoreToGrade(overallScore);
    
    return {
      readabilityScore,
      immersionScore,
      clarityScore,
      atmosphereScore,
      engagementScore,
      qualityFactors,
      overallGrade
    };
  }
  
  private static analyzeQualityFactors(
    narrative: NarrativeContent, 
    request: NarrativeGenerationRequest
  ): QualityFactor[] {
    const factors: QualityFactor[] = [];
    
    // Length appropriateness
    const wordCount = narrative.wordCount || this.countWords(narrative.mainText);
    const expectedLength = this.getExpectedWordCount(request.length);
    const lengthRatio = wordCount / expectedLength;
    
    factors.push({
      factor: 'Length Appropriateness',
      score: lengthRatio > 0.8 && lengthRatio < 1.2 ? 90 : Math.max(50, 90 - Math.abs(lengthRatio - 1) * 40),
      feedback: `Content is ${wordCount} words (expected ~${expectedLength})`,
      suggestions: lengthRatio < 0.8 ? ['Add more descriptive detail', 'Expand on key elements'] : 
                  lengthRatio > 1.2 ? ['Condense unnecessary details', 'Focus on essential elements'] : []
    });
    
    // Sensory richness
    const sensoryScore = this.analyzeSensoryContent(narrative.mainText);
    factors.push({
      factor: 'Sensory Richness',
      score: sensoryScore,
      feedback: `Includes ${sensoryScore > 70 ? 'rich' : sensoryScore > 40 ? 'moderate' : 'limited'} sensory details`,
      suggestions: sensoryScore < 60 ? ['Add more sensory descriptions', 'Include sounds, smells, textures'] : []
    });
    
    // Atmosphere consistency
    const atmosphereScore = this.checkAtmosphereConsistency(narrative, request);
    factors.push({
      factor: 'Atmosphere Consistency',
      score: atmosphereScore,
      feedback: `Atmosphere is ${atmosphereScore > 80 ? 'perfectly' : atmosphereScore > 60 ? 'well' : 'poorly'} maintained`,
      suggestions: atmosphereScore < 70 ? ['Strengthen atmospheric elements', 'Use more consistent mood words'] : []
    });
    
    return factors;
  }
  
  private static calculateReadabilityScore(narrative: NarrativeContent): number {
    const text = narrative.mainText;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    if (sentences.length === 0 || words.length === 0) return 50;
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = this.estimateAvgSyllables(words);
    
    // Simplified Flesch Reading Ease calculation
    const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    
    // Convert to 0-100 scale where higher is better
    return Math.max(0, Math.min(100, fleschScore));
  }
  
  private static calculateImmersionScore(
    narrative: NarrativeContent, 
    request: NarrativeGenerationRequest
  ): number {
    let score = 70; // Base score
    
    const text = narrative.mainText.toLowerCase();
    
    // Check for immersive elements
    const immersiveWords = ['you', 'see', 'hear', 'feel', 'smell', 'taste', 'sense', 'notice'];
    const immersiveCount = immersiveWords.reduce((count, word) => 
      count + (text.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length, 0);
    
    if (immersiveCount > 3) score += 15;
    else if (immersiveCount > 1) score += 10;
    
    // Check for specific atmosphere words
    const atmosphereWords = ATMOSPHERE_DESCRIPTORS[request.atmosphere] || [];
    const atmosphereCount = atmosphereWords.reduce((count, word) => 
      count + (text.includes(word.toLowerCase()) ? 1 : 0), 0);
    
    if (atmosphereCount > 2) score += 15;
    else if (atmosphereCount > 0) score += 10;
    
    return Math.min(100, score);
  }
  
  private static calculateClarityScore(narrative: NarrativeContent): number {
    const text = narrative.mainText;
    let score = 80; // Base score
    
    // Check sentence length variety
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    
    if (avgLength > 25) score -= 15; // Very long sentences hurt clarity
    if (avgLength < 8) score -= 10; // Very short sentences may lack detail
    
    // Check for transition words
    const transitionWords = ['however', 'meanwhile', 'suddenly', 'then', 'next', 'finally', 'as', 'while'];
    const transitionCount = transitionWords.reduce((count, word) => 
      count + (text.toLowerCase().includes(word) ? 1 : 0), 0);
    
    if (transitionCount > 2) score += 10;
    
    return Math.max(0, Math.min(100, score));
  }
  
  private static calculateAtmosphereScore(
    narrative: NarrativeContent, 
    request: NarrativeGenerationRequest
  ): number {
    return this.checkAtmosphereConsistency(narrative, request);
  }
  
  private static calculateEngagementScore(narrative: NarrativeContent): number {
    const text = narrative.mainText;
    let score = 70; // Base score
    
    // Check for engaging elements
    const engagingWords = ['mysterious', 'sudden', 'dramatic', 'intense', 'vivid', 'striking', 'remarkable'];
    const engagingCount = engagingWords.reduce((count, word) => 
      count + (text.toLowerCase().includes(word) ? 1 : 0), 0);
    
    score += engagingCount * 5;
    
    // Check for variety in sentence structure
    const sentences = text.split(/[.!?]+/);
    const hasVariety = sentences.some(s => s.includes(',')) && sentences.some(s => !s.includes(','));
    if (hasVariety) score += 10;
    
    return Math.min(100, score);
  }
  
  private static getExpectedWordCount(length: NarrativeLength): number {
    switch (length) {
      case 'brief': return 20;
      case 'short': return 50;
      case 'medium': return 100;
      case 'long': return 200;
      case 'extended': return 300;
      default: return 100;
    }
  }
  
  private static analyzeSensoryContent(text: string): number {
    const lowerText = text.toLowerCase();
    let sensoryScore = 0;
    
    Object.values(SENSORY_WORDS).forEach(words => {
      const senseCount = words.reduce((count, word) => 
        count + (lowerText.includes(word.toLowerCase()) ? 1 : 0), 0);
      sensoryScore += Math.min(20, senseCount * 5); // Max 20 points per sense
    });
    
    return Math.min(100, sensoryScore);
  }
  
  private static checkAtmosphereConsistency(
    narrative: NarrativeContent, 
    request: NarrativeGenerationRequest
  ): number {
    const text = narrative.mainText.toLowerCase();
    const atmosphereWords = ATMOSPHERE_DESCRIPTORS[request.atmosphere] || [];
    
    let consistencyScore = 70; // Base score
    
    // Check for appropriate atmosphere words
    const matchingWords = atmosphereWords.reduce((count, word) => 
      count + (text.includes(word.toLowerCase()) ? 1 : 0), 0);
    
    consistencyScore += matchingWords * 10;
    
    // Check for conflicting atmosphere words
    const conflictingAtmospheres = Object.keys(ATMOSPHERE_DESCRIPTORS)
      .filter(atm => atm !== request.atmosphere);
    
    let conflicts = 0;
    conflictingAtmospheres.forEach(atmosphere => {
      const words = ATMOSPHERE_DESCRIPTORS[atmosphere as keyof typeof ATMOSPHERE_DESCRIPTORS];
      conflicts += words.reduce((count, word) => 
        count + (text.includes(word.toLowerCase()) ? 1 : 0), 0);
    });
    
    consistencyScore -= conflicts * 5;
    
    return Math.max(0, Math.min(100, consistencyScore));
  }
  
  private static estimateAvgSyllables(words: string[]): number {
    // Simple syllable estimation
    const totalSyllables = words.reduce((sum, word) => {
      const syllables = word.toLowerCase().replace(/[^a-z]/g, '').replace(/e$/, '').match(/[aeiouy]+/g) || [];
      return sum + Math.max(1, syllables.length);
    }, 0);
    
    return totalSyllables / words.length;
  }
  
  private static scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
  
  // ============================================================================
  // STYLE ANALYSIS
  // ============================================================================
  
  private static analyzeStyle(
    narrative: NarrativeContent, 
    request: NarrativeGenerationRequest
  ): StyleAnalysis {
    const text = narrative.mainText;
    
    const toneConsistency = this.analyzeToneConsistency(text, request);
    const voiceStrength = this.analyzeVoiceStrength(text, request);
    const sensoryRichness = this.analyzeSensoryRichness(text);
    const languageComplexity = this.analyzeLanguageComplexity(text);
    const pacing = this.analyzePacing(text);
    const literaryDevices = this.analyzeLiteraryDevices(text);
    
    return {
      toneConsistency,
      voiceStrength,
      sensoryRichness,
      languageComplexity,
      pacing,
      literaryDevices
    };
  }
  
  private static analyzeToneConsistency(text: string, request: NarrativeGenerationRequest): number {
    // This is a simplified analysis - in a real implementation, this would be more sophisticated
    return this.checkAtmosphereConsistency({ mainText: text } as NarrativeContent, request);
  }
  
  private static analyzeVoiceStrength(text: string, request: NarrativeGenerationRequest): number {
    let strength = 70; // Base score
    
    // Check for consistent perspective
    const lowerText = text.toLowerCase();
    const hasSecondPerson = lowerText.includes('you ');
    const hasFirstPerson = lowerText.includes('i ') || lowerText.includes('my ');
    const hasThirdPerson = lowerText.includes('he ') || lowerText.includes('she ') || lowerText.includes('they ');
    
    // Consistency bonus
    const perspectiveCount = [hasSecondPerson, hasFirstPerson, hasThirdPerson].filter(Boolean).length;
    if (perspectiveCount === 1) strength += 15;
    else if (perspectiveCount > 2) strength -= 10;
    
    return Math.max(0, Math.min(100, strength));
  }
  
  private static analyzeSensoryRichness(text: string): SensoryRichness {
    const lowerText = text.toLowerCase();
    
    const visual = this.calculateSenseScore(lowerText, SENSORY_WORDS.visual);
    const auditory = this.calculateSenseScore(lowerText, SENSORY_WORDS.auditory);
    const olfactory = this.calculateSenseScore(lowerText, SENSORY_WORDS.olfactory);
    const tactile = this.calculateSenseScore(lowerText, SENSORY_WORDS.tactile);
    const gustatory = this.calculateSenseScore(lowerText, SENSORY_WORDS.gustatory);
    
    const overall = (visual + auditory + olfactory + tactile + gustatory) / 5;
    
    return {
      visual,
      auditory,
      olfactory,
      tactile,
      gustatory,
      overall
    };
  }
  
  private static calculateSenseScore(text: string, words: string[]): number {
    const matches = words.reduce((count, word) => 
      count + (text.includes(word.toLowerCase()) ? 1 : 0), 0);
    return Math.min(100, matches * 20);
  }
  
  private static analyzeLanguageComplexity(text: string): LanguageComplexity {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = this.estimateAvgSyllables(words);
    
    // Estimate vocabulary level
    const longWords = words.filter(w => w.length > 6).length;
    const longWordRatio = longWords / words.length;
    
    let vocabularyLevel: 'simple' | 'moderate' | 'advanced' | 'complex';
    if (longWordRatio < 0.1) vocabularyLevel = 'simple';
    else if (longWordRatio < 0.2) vocabularyLevel = 'moderate';
    else if (longWordRatio < 0.3) vocabularyLevel = 'advanced';
    else vocabularyLevel = 'complex';
    
    // Sentence variety (simplified)
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const lengthVariance = this.calculateVariance(sentenceLengths);
    const sentenceVariety = Math.min(100, lengthVariance * 2);
    
    // Reading grade (simplified Flesch-Kincaid)
    const readingGrade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
    
    return {
      vocabularyLevel,
      sentenceVariety,
      readingGrade: Math.max(1, Math.round(readingGrade)),
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 10) / 10
    };
  }
  
  private static analyzePacing(text: string): PacingAnalysis {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
    
    let rhythm: 'fast' | 'moderate' | 'slow' | 'varied';
    if (avgSentenceLength < 10) rhythm = 'fast';
    else if (avgSentenceLength < 20) rhythm = 'moderate';
    else rhythm = 'slow';
    
    // Check for variety
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const variance = this.calculateVariance(lengths);
    if (variance > 25) rhythm = 'varied';
    
    // Tension analysis (simplified)
    const tensionWords = ['sudden', 'sharp', 'quick', 'intense', 'urgent', 'dramatic'];
    const tensionCount = tensionWords.reduce((count, word) => 
      count + (text.toLowerCase().includes(word) ? 1 : 0), 0);
    
    let tension: 'low' | 'medium' | 'high' | 'escalating';
    if (tensionCount === 0) tension = 'low';
    else if (tensionCount < 3) tension = 'medium';
    else tension = 'high';
    
    return {
      rhythm,
      tension,
      flow: Math.max(60, 100 - Math.abs(avgSentenceLength - 15) * 2), // Optimal around 15 words
      transitions: 75 // Simplified score
    };
  }
  
  private static analyzeLiteraryDevices(text: string): LiteraryDevice[] {
    const devices: LiteraryDevice[] = [];
    const lowerText = text.toLowerCase();
    
    // Check for metaphors/similes
    const metaphorWords = ['like', 'as', 'resembles', 'seems', 'appears'];
    const metaphorCount = metaphorWords.reduce((count, word) => 
      count + (lowerText.includes(word) ? 1 : 0), 0);
    
    if (metaphorCount > 0) {
      devices.push({
        device: 'Metaphor/Simile',
        usage: metaphorCount > 2 ? 'heavy' : metaphorCount > 1 ? 'moderate' : 'light',
        effectiveness: Math.min(90, metaphorCount * 20 + 50),
        examples: [] // Would be populated with actual examples in full implementation
      });
    }
    
    // Check for alliteration (simplified)
    const alliterationScore = this.detectAlliteration(text);
    if (alliterationScore > 0) {
      devices.push({
        device: 'Alliteration',
        usage: alliterationScore > 2 ? 'moderate' : 'light',
        effectiveness: Math.min(85, alliterationScore * 25 + 40),
        examples: []
      });
    }
    
    return devices;
  }
  
  private static calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((sum, sq) => sum + sq, 0) / numbers.length;
  }
  
  private static detectAlliteration(text: string): number {
    // Simplified alliteration detection
    const words = text.toLowerCase().split(/\s+/).map(w => w.replace(/[^a-z]/g, ''));
    let alliterationCount = 0;
    
    for (let i = 0; i < words.length - 1; i++) {
      if (words[i][0] && words[i][0] === words[i + 1][0]) {
        alliterationCount++;
      }
    }
    
    return alliterationCount;
  }
  
  // ============================================================================
  // USAGE GUIDANCE GENERATION
  // ============================================================================
  
  private static generateUsageGuidance(
    narrative: NarrativeContent, 
    request: NarrativeGenerationRequest
  ): UsageGuidance {
    const bestContexts = this.identifyBestContexts(request);
    const dmTips = this.generateDMTips(request);
    const playerEngagement = this.generatePlayerEngagementTips(request);
    const adaptationNotes = this.generateAdaptationNotes(request);
    const commonMistakes = this.identifyCommonMistakes(request);
    
    return {
      bestContexts,
      dmTips,
      playerEngagement,
      adaptationNotes,
      commonMistakes
    };
  }
  
  private static identifyBestContexts(request: NarrativeGenerationRequest): string[] {
    const contexts: string[] = [];
    
    switch (request.contentType) {
      case 'boxed_text':
        contexts.push('Scene introductions and transitions');
        contexts.push('Dramatic moments and revelations');
        contexts.push('Atmospheric descriptions for key locations');
        break;
      case 'room_description':
        contexts.push('First entry into important locations');
        contexts.push('Detailed exploration of significant areas');
        contexts.push('Setting up tactical encounters');
        break;
      case 'character_description':
        contexts.push('First NPC introductions');
        contexts.push('Important character reveals');
        contexts.push('Memorable social encounters');
        break;
    }
    
    return contexts.slice(0, 4);
  }
  
  private static generateDMTips(request: NarrativeGenerationRequest): string[] {
    const tips: string[] = [];
    
    tips.push('Read with appropriate pacing and emphasis');
    tips.push('Allow players time to absorb atmospheric details');
    tips.push('Use the narrative to guide player attention and actions');
    
    if (request.includeDialogue) {
      tips.push('Practice character voices and speech patterns');
    }
    
    if (request.atmosphere === 'mysterious' || request.atmosphere === 'foreboding') {
      tips.push('Lower your voice and speak more slowly for atmosphere');
    }
    
    return tips.slice(0, 5);
  }
  
  private static generatePlayerEngagementTips(request: NarrativeGenerationRequest): string[] {
    const tips: string[] = [];
    
    tips.push('Encourage players to describe their character reactions');
    tips.push('Ask follow-up questions about what interests them');
    tips.push('Use the narrative as a springboard for player actions');
    
    if (request.sensoryFocus && request.sensoryFocus.length > 0) {
      tips.push('Ask players what their characters notice with different senses');
    }
    
    return tips.slice(0, 4);
  }
  
  private static generateAdaptationNotes(request: NarrativeGenerationRequest): string[] {
    const notes: string[] = [];
    
    notes.push('Adjust pacing based on player engagement');
    notes.push('Modify details to match your campaign setting');
    notes.push('Emphasize elements that connect to character backgrounds');
    
    return notes;
  }
  
  private static identifyCommonMistakes(request: NarrativeGenerationRequest): string[] {
    const mistakes: string[] = [];
    
    mistakes.push('Reading too quickly without dramatic pauses');
    mistakes.push('Not allowing time for player questions or reactions');
    mistakes.push('Overloading players with too much detail at once');
    
    if (request.contentType === 'boxed_text') {
      mistakes.push('Not distinguishing boxed text from regular narration');
    }
    
    return mistakes;
  }
  
  // ============================================================================
  // VARIANT GENERATION
  // ============================================================================
  
  private static generateVariants(
    narrative: NarrativeContent, 
    request: NarrativeGenerationRequest
  ): NarrativeVariant[] {
    const variants: NarrativeVariant[] = [];
    
    // Shorter variant
    variants.push({
      name: 'Concise Version',
      description: 'Streamlined version focusing on essential elements',
      modifications: [
        'Reduce descriptive detail by 40%',
        'Focus on most impactful sensory elements',
        'Maintain core atmosphere and mood'
      ],
      useCase: 'Fast-paced sessions or impatient players',
      toneShift: 'More direct and immediate'
    });
    
    // More atmospheric variant
    variants.push({
      name: 'Enhanced Atmosphere',
      description: 'Expanded version with richer atmospheric detail',
      modifications: [
        'Add more sensory descriptions',
        'Include additional mood-setting elements',
        'Expand on environmental details'
      ],
      useCase: 'Players who enjoy rich narrative immersion',
      toneShift: 'More immersive and detailed'
    });
    
    // Different emotional tone
    const alternateEmotion = this.getAlternateEmotion(request.emotionalTone);
    variants.push({
      name: `${alternateEmotion} Version`,
      description: `Rewritten with ${alternateEmotion.toLowerCase()} emotional tone`,
      modifications: [
        `Adjust word choices for ${alternateEmotion.toLowerCase()} mood`,
        'Modify pacing and rhythm accordingly',
        'Change emphasis and focus points'
      ],
      useCase: `When ${alternateEmotion.toLowerCase()} tone better fits the situation`,
      toneShift: `Shift from ${request.emotionalTone} to ${alternateEmotion.toLowerCase()}`
    });
    
    return variants;
  }
  
  private static getAlternateEmotion(currentEmotion: EmotionalTone): string {
    const alternatives: Record<EmotionalTone, string> = {
      neutral: 'Mysterious',
      excited: 'Tense',
      fearful: 'Hopeful',
      hopeful: 'Melancholic',
      melancholic: 'Peaceful',
      angry: 'Determined',
      joyful: 'Nostalgic',
      anxious: 'Curious',
      nostalgic: 'Excited',
      determined: 'Reverent',
      curious: 'Anxious',
      reverent: 'Joyful'
    };
    
    return alternatives[currentEmotion] || 'Mysterious';
  }
  
  // ============================================================================
  // ADAPTATION SUGGESTIONS
  // ============================================================================
  
  private static generateAdaptationSuggestions(
    narrative: NarrativeContent, 
    request: NarrativeGenerationRequest
  ): AdaptationSuggestion[] {
    const suggestions: AdaptationSuggestion[] = [];
    
    // Setting adaptation
    suggestions.push({
      context: 'Different campaign setting',
      modification: 'Replace setting-specific details with generic alternatives',
      reason: 'Make content adaptable to various campaign worlds',
      implementation: 'Substitute specific place names, cultural references, and architectural details'
    });
    
    // Tone adaptation
    suggestions.push({
      context: 'Different table atmosphere',
      modification: 'Adjust emotional intensity and descriptive density',
      reason: 'Match the preferred style and pace of your gaming group',
      implementation: 'Scale up detail for immersion-focused groups, scale down for action-focused groups'
    });
    
    // Length adaptation
    suggestions.push({
      context: 'Time constraints',
      modification: 'Create condensed version focusing on key elements',
      reason: 'Maintain narrative impact while respecting session time limits',
      implementation: 'Identify 2-3 most important details and build brief description around them'
    });
    
    return suggestions;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default NarrativeGenerator;
