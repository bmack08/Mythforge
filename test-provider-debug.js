// Debug provider configuration
import { AIService } from './server/services/ai/index.js';

async function debugProviders() {
  console.log('🔍 Debugging AI provider configuration...');
  
  console.log('Environment variables:');
  console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET');
  console.log('OPENAI_DEFAULT_MODEL:', process.env.OPENAI_DEFAULT_MODEL);
  console.log('AI_MODEL_DEFAULT:', process.env.AI_MODEL_DEFAULT);
  
  const aiService = AIService.getInstance();
  console.log('AIService instance created');
  
  // Check if we can access the config
  const config = aiService.config;
  if (config) {
    console.log('Config available');
    const openaiConfig = config.getProvider?.('openai');
    console.log('OpenAI config:', openaiConfig ? 'EXISTS' : 'MISSING');
    if (openaiConfig) {
      console.log('OpenAI enabled:', openaiConfig.enabled);
      console.log('OpenAI model:', openaiConfig.defaultModel);
    }
  } else {
    console.log('Config not available');
  }
  
  // Check providers map
  console.log('Checking providers...');
  const providers = aiService.providers;
  if (providers) {
    console.log('Providers map size:', providers.size);
    console.log('Has openai provider:', providers.has('openai'));
    
    for (const [name, provider] of providers) {
      console.log(`Provider: ${name}`, provider.constructor.name);
    }
  } else {
    console.log('Providers not available');
  }
  
  // Test a simple generation
  try {
    console.log('Testing generation...');
    const result = await aiService.generateContent({
      type: 'description',
      prompt: 'Test prompt',
      options: { maxTokens: 10 }
    });
    
    console.log('Generation result:');
    console.log('Success:', result.success);
    console.log('Provider:', result.metadata?.provider);
    console.log('Model:', result.metadata?.model);
    if (result.error) {
      console.log('Error:', result.error);
    }
    if (result.content) {
      console.log('Content length:', typeof result.content === 'string' ? result.content.length : 'non-string');
    }
  } catch (error) {
    console.error('Generation test failed:', error.message);
  }
}

debugProviders().catch(console.error);