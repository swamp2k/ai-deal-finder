import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { prompt, answers, shops, model } = await request.json();
    
    // Check if we have real keys or dummy
    const isDummyGemini = !process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY === 'dummy_gemini_key';
    const isDummyClaude = !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'dummy_anthropic_key';
    
    if ((model === 'gemini' && isDummyGemini) || (model === 'claude' && isDummyClaude)) {
      return NextResponse.json({
        products: [
          {
            rank: 1,
            badge: "Bedst til prisen",
            name: "Radeon RX 6600 8GB",
            price: 1599,
            shop: shops[0] || "Proshop",
            url: "#",
            image: "https://via.placeholder.com/300x200/8a2be2/ffffff?text=RX+6600",
            performanceGain: "+35% ift. dit nuværende",
            vram: "8GB GDDR6",
            argument: "Fremragende pris/ydelse-forhold. Anbefales til 1080p/1440p gaming."
          },
          {
            rank: 2,
            badge: "Bedst performer",
            name: "GeForce RTX 4060 8GB",
            price: 2499,
            shop: shops[0] || "Proshop",
            url: "#",
            image: "https://via.placeholder.com/300x200/ff007f/ffffff?text=RTX+4060",
            performanceGain: "+50% ift. dit nuværende",
            vram: "8GB GDDR6",
            argument: "DLSS 3 og Frame Generation giver enorm boost ved DLSS-kompatible spil."
          },
          {
            rank: 3,
            badge: "Bedste deal",
            name: "Radeon RX 7600 8GB",
            price: 2299,
            shop: shops[1] || shops[0] || "Komplett",
            url: "#",
            image: "https://via.placeholder.com/300x200/00aa88/ffffff?text=RX+7600",
            performanceGain: "+45% ift. dit nuværende",
            vram: "8GB GDDR6",
            argument: "Bedste AMD alternativ i klassen med god rasterisering og lavt strømforbrug."
          },
          {
            rank: 4,
            badge: "Fremtidssikret",
            name: "GeForce RTX 4060 Ti 16GB",
            price: 3299,
            shop: shops[1] || shops[0] || "Komplett",
            url: "#",
            image: "https://via.placeholder.com/300x200/9933ff/ffffff?text=RTX+4060Ti",
            performanceGain: "+60% ift. dit nuværende",
            vram: "16GB GDDR6",
            argument: "16GB VRAM sikrer dig de næste mange år, selv til 4K teksturer."
          },
          {
            rank: 5,
            badge: "Budget pick",
            name: "Radeon RX 6500 XT 4GB",
            price: 999,
            shop: shops[0] || "Proshop",
            url: "#",
            image: "https://via.placeholder.com/300x200/888888/ffffff?text=RX+6500XT",
            performanceGain: "+10% ift. dit nuværende",
            vram: "4GB GDDR6",
            argument: "Absolut billigste mulighed for en lille ydelsesforøgelse, men kun 4GB VRAM er begrænsende."
          }
        ]
      });
    }

    // Mock search results (replace with SerpApi in production)
    const mockSearchResults = `
    Proshop: RX 6500 XT 4GB (999 kr), RX 6600 8GB (1599 kr), RTX 4060 8GB (2499 kr), RTX 4060 Ti 16GB (3299 kr)
    Komplett: RX 7600 8GB (2299 kr), RTX 4060 Ti 16GB (3199 kr), RTX 4070 12GB (4499 kr)
    `;

    const systemPrompt = `Du er en AI hardware ekspert der hjælper brugere med at finde de bedste PC-komponent tilbud.
Bruger prompt: "${prompt}"
Bruger svar på spørgsmål: ${JSON.stringify(answers)}
Søgeresultater fundet på ${shops.join(', ')}: ${mockSearchResults}

Analyser alle produkterne og ranger dem som en TOP 5 liste. Tildel hvert produkt et passende badge (f.eks. "Bedst til prisen", "Bedst performer", "Bedste deal", "Fremtidssikret", "Budget pick").

Returner KUN et JSON objekt i dette præcise format (ingen anden tekst):
{
  "products": [
    {
      "rank": 1,
      "badge": "Bedst til prisen",
      "name": "Produktnavn",
      "price": 1599,
      "shop": "Butikkens navn",
      "url": "https://eksempel.dk",
      "image": "https://via.placeholder.com/300x200/8a2be2/ffffff?text=Produkt",
      "performanceGain": "+35% ift. GTX 1080",
      "vram": "8GB GDDR6",
      "argument": "Detaljeret begrundelse for placeringen."
    }
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
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: "user", content: "Generer TOP 5 JSON listen nu." }]
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
    return NextResponse.json({ error: "Failed to evaluate products" }, { status: 500 });
  }
}
