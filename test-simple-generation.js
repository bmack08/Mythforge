// Test simple generation without JSON mode
import OpenAI from 'openai';

async function testOpenAI() {
  console.log('🧪 Testing direct OpenAI connection...');
  
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: 'Say hello and tell me you are working!' }
      ],
      max_tokens: 50,
      temperature: 0.7
    });
    
    console.log('✅ OpenAI API working!');
    console.log('Response:', response.choices[0]?.message?.content);
    console.log('Tokens used:', response.usage?.total_tokens);
    
  } catch (error) {
    console.error('❌ OpenAI API failed:', error.message);
  }
}

testOpenAI().catch(console.error);