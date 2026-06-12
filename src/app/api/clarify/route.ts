import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';


export async function POST(request: Request) {
  try {
    const { prompt, model } = await request.json();
    
    // Check if we have real keys or dummy
    const isDummyGemini = !process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY === 'dummy_gemini_key';
    const isDummyClaude = !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'dummy_anthropic_key';
    
    if ((model === 'gemini' && isDummyGemini) || (model === 'claude' && isDummyClaude)) {
      return NextResponse.json({
        questions: [
          {
            id: "q1",
            text: `[MOCK ${model.toUpperCase()}] Dit hardware kræver en vis strømforsyning. Hvor mange watt er din nuværende strømforsyning (PSU) på?`,
            options: ["Under 500W", "500W - 650W", "Over 650W", "Ved ikke"]
          },
          {
            id: "q2",
            text: "Hvilken opløsning spiller du primært i?",
            options: ["1080p (FHD)", "1440p (QHD)", "4K (UHD)"]
          }
        ]
      });
    }

    const systemPrompt = `Du er en AI hardware ekspert. Brugeren leder efter pc dele: "${prompt}".
Generer præcis 2 afklarende multiple-choice spørgsmål for at finde det bedste produkt til dem.
Returner KUN et JSON objekt i dette format:
{
  "questions": [
    { "id": "q1", "text": "Spørgsmål tekst her?", "options": ["Mulighed 1", "Mulighed 2", "Mulighed 3"] }
  ]
}`;

    let jsonResponseStr = "";

    if (model === 'gemini') {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await geminiModel.generateContent(systemPrompt);
      jsonResponseStr = result.response.text();
    } else if (model === 'claude') {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
      const msg = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: "Generer spørgsmålene som JSON." }]
      });
      // @ts-ignore
      jsonResponseStr = msg.content[0].text;
    }

    // Clean up potential markdown formatting from AI output
    const cleanedStr = jsonResponseStr.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedStr);
    
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}
