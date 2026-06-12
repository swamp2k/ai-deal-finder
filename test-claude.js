const Anthropic = require('@anthropic-ai/sdk');

async function test() {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const models = ['claude-haiku-4-5', 'claude-3-haiku-20240307', 'claude-3-5-haiku-20241022'];
  
  for (const m of models) {
    try {
      const msg = await client.messages.create({
        model: m,
        max_tokens: 20,
        messages: [{ role: 'user', content: 'Say hi' }]
      });
      console.log(`✓ Model ${m} works:`, msg.content[0].text);
    } catch (e) {
      console.log(`✗ Model ${m} failed:`, e.message.substring(0, 80));
    }
  }
}
test();
