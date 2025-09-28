// Simple AI Service for Testing - Mock Implementation
export class SimpleAIService {
  async generateContent(request) {
    console.log(`🤖 Mock AI generating ${request.type} content...`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock content based on type
    const mockContent = this.getMockContent(request.type, request.prompt);
    
    return {
      success: true,
      content: mockContent,
      rawResponse: JSON.stringify(mockContent),
      metadata: {
        provider: 'mock',
        model: 'mock-gpt-4',
        tokensUsed: 150,
        cost: 0.01,
        duration: 1000,
        timestamp: new Date()
      }
    };
  }

  getMockContent(type, prompt) {
    switch (type) {
      case 'description':
        return {
          title: "Chamber of Echoes",
          description: "A dimly lit chamber with ancient stone walls covered in mysterious runes. The air is thick with magical energy, and strange whispers seem to emanate from the shadows.",
          readAloudText: "As you enter the chamber, your footsteps echo ominously off the stone walls. Ancient runes glow faintly with an otherworldly blue light, and you can hear whispers in a language long forgotten."
        };
        
      case 'custom':
        if (prompt.includes('random table')) {
          return {
            content: `# Random Encounters
            
| d20 | Encounter |
|:---:|:----------|
| 1-4 | 2d4 Goblins emerge from hiding |
| 5-8 | A lost merchant seeks help |
| 9-12 | Ancient trap activates |
| 13-16 | Magical phenomenon occurs |
| 17-20 | Treasure discovery |

# NPC Personality Traits

| d10 | Trait |
|:---:|:------|
| 1 | Speaks in whispers |
| 2 | Collects shiny objects |
| 3 | Always optimistic |
| 4 | Superstitious |
| 5 | Forgetful but wise |`
          };
        }
        return {
          title: "Generated Content",
          description: "This is mock generated content for testing purposes.",
          content: prompt
        };
        
      default:
        return {
          title: `Mock ${type}`,
          description: `This is a mock ${type} generated for testing the content pipeline.`,
          content: `Generated ${type} content based on: ${prompt}`
        };
    }
  }

  async generateDescription(prompt, context, options) {
    return this.generateContent({
      type: 'description',
      prompt,
      context,
      options
    });
  }

  async generateRandomTable(prompt, context, options) {
    return this.generateContent({
      type: 'custom',
      prompt,
      context,
      options
    });
  }
}

// Create singleton instance
export const simpleAIService = new SimpleAIService();
export default SimpleAIService;