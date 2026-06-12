"use client";

import { useState } from "react";
import "./page.css";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [shops, setShops] = useState(["Proshop", "Komplett"]);
  const [model, setModel] = useState("gemini");
  const [step, setStep] = useState<"input" | "clarify" | "results">("input");
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleExportHtml = () => {
    const date = new Date().toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" });
    const modelName = model === "gemini" ? "Google Gemini" : "Claude Haiku";
    const rows = results.map(p => `
      <div class="product ${p.rank === 1 ? 'top-pick' : ''}">
        <div class="rank">#${p.rank}</div>
        <div class="info">
          <div class="top-line">
            <div>
              <span class="badge">${p.badge}</span>
              <h2>${p.name}</h2>
            </div>
            <div class="price-block">
              <div class="price">${p.price} kr.</div>
              <div class="shop">${p.shop}</div>
            </div>
          </div>
          <div class="meta">
            <span class="gain">${p.performanceGain}</span>
            <span class="vram">${p.vram}</span>
          </div>
          <p class="argument">${p.argument}</p>
          <a href="${p.url}" class="btn" target="_blank">Gå til butik &rarr;</a>
        </div>
      </div>`).join("");

    const html = `<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Deal Finder - Resultater ${date}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #0a0a0c; color: #f8f8f2; padding: 32px 16px; }
    .wrapper { max-width: 780px; margin: 0 auto; }
    header { margin-bottom: 32px; }
    header h1 { font-size: 2rem; background: linear-gradient(to right, #fff, #aaa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    header h1 span { background: linear-gradient(to right, #8a2be2, #ff007f); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .meta-line { margin-top: 8px; font-size: 0.85rem; opacity: 0.6; }
    .prompt-box { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px 20px; margin-bottom: 32px; font-style: italic; opacity: 0.8; }
    .product { display: flex; gap: 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; margin-bottom: 16px; transition: box-shadow 0.2s; }
    .product.top-pick { border-color: rgba(138,43,226,0.5); box-shadow: 0 0 0 1px rgba(138,43,226,0.3); }
    .rank { font-size: 2rem; font-weight: 900; min-width: 52px; text-align: center; background: linear-gradient(to bottom, #fff, rgba(255,255,255,0.3)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; padding-top: 4px; }
    .top-pick .rank { background: linear-gradient(to bottom, #8a2be2, #ff007f); -webkit-background-clip: text; }
    .info { flex: 1; display: flex; flex-direction: column; gap: 10px; }
    .top-line { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
    .badge { display: inline-block; background: #ff007f; color: white; padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; }
    .top-pick .badge { background: linear-gradient(135deg, #8a2be2, #ff007f); }
    h2 { font-size: 1.15rem; margin-top: 6px; }
    .price-block { text-align: right; flex-shrink: 0; }
    .price { font-size: 1.5rem; font-weight: 800; color: #8a2be2; }
    .shop { font-size: 0.85rem; opacity: 0.7; margin-top: 4px; }
    .meta { display: flex; gap: 12px; flex-wrap: wrap; }
    .gain { color: #00ff88; font-weight: bold; font-size: 0.9rem; }
    .vram { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); padding: 2px 10px; border-radius: 20px; font-size: 0.8rem; }
    .argument { font-size: 0.9rem; line-height: 1.6; opacity: 0.85; }
    .btn { display: inline-block; background: linear-gradient(135deg, #8a2be2, #ff007f); color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem; }
    footer { margin-top: 40px; text-align: center; font-size: 0.8rem; opacity: 0.4; }
  </style>
</head>
<body>
  <div class="wrapper">
    <header>
      <h1>AI <span>Deal Finder</span></h1>
      <div class="meta-line">Genereret ${date} &bull; AI: ${modelName} &bull; Shops: ${shops.join(", ")}</div>
    </header>
    <div class="prompt-box">&ldquo;${prompt}&rdquo;</div>
    ${rows}
    <footer>Genereret med AI Deal Finder</footer>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-deal-finder-resultater-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStartSearch = async () => {
    if (!prompt) return;
    setLoading(true);
    
    // Call clarify API
    try {
      const res = await fetch("/api/clarify", {
        method: "POST",
        body: JSON.stringify({ prompt, model })
      });
      const data = await res.json();
      
      if (res.ok && data.questions) {
        setQuestions(data.questions);
        setStep("clarify");
      } else {
        alert("Der opstod en fejl fra AI'en: " + (data.error || "Kunne ikke hente spørgsmål. Prøv evt. den anden AI model."));
      }
    } catch (err) {
      alert("Netværksfejl ved kald til API.");
    }
    setLoading(false);
  };

  const handleAnswer = (qId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [qId]: answer }));
  };

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        body: JSON.stringify({ prompt, answers, shops, model })
      });
      const data = await res.json();
      
      if (res.ok && data.products) {
        setResults(data.products);
        setStep("results");
      } else {
        alert("Der opstod en fejl fra AI'en: " + (data.error || "Kunne ikke hente resultater."));
      }
    } catch (err) {
      alert("Netværksfejl ved kald til API.");
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>AI <span>Deal Finder</span></h1>
      </header>
      
      <main className="main-content glass-panel">
        {step === "input" && (
          <div className="step-container">
            <h2>Find det bedste tilbud med AI</h2>
            <p>Beskriv hvad du leder efter, og hvad du har i dag.</p>
            
            <textarea 
              className="input-field" 
              rows={4}
              placeholder='F.eks. "Jeg har et GTX 1080 og vil gerne have et nyt under 2000 kr, med 8GB vram"'
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            
            <div className="model-selection" style={{ marginTop: '16px' }}>
              <h3>Vælg AI Model:</h3>
              <div className="options" style={{ marginTop: '12px' }}>
                <button 
                  className={`option-button ${model === "gemini" ? "selected" : ""}`}
                  onClick={() => setModel("gemini")}
                >
                  Google Gemini
                </button>
                <button 
                  className={`option-button ${model === "claude" ? "selected" : ""}`}
                  onClick={() => setModel("claude")}
                >
                  Claude Haiku
                </button>
              </div>
            </div>

            <div className="shops-selection">
              <h3>Vælg Webshops:</h3>
              <div className="checkboxes">
                {["Proshop", "Komplett", "Elgiganten"].map(shop => (
                  <label key={shop} className="shop-label">
                    <input 
                      type="checkbox" 
                      checked={shops.includes(shop)}
                      onChange={(e) => {
                        if (e.target.checked) setShops([...shops, shop]);
                        else setShops(shops.filter(s => s !== shop));
                      }}
                    />
                    {shop}
                  </label>
                ))}
              </div>
            </div>
            
            <button className="primary-button" onClick={handleStartSearch} disabled={loading || !prompt}>
              {loading ? "Analyserer..." : "Find Tilbud"}
            </button>
          </div>
        )}
        
        {step === "clarify" && (
          <div className="step-container">
            <h2>Lad os lige afklare et par detaljer</h2>
            
            {questions.map((q) => (
              <div key={q.id} className="question-box glass-panel">
                <p className="question-text">{q.text}</p>
                <div className="options">
                  {q.options.map((opt: string) => (
                    <button 
                      key={opt}
                      className={`option-button ${answers[q.id] === opt ? "selected" : ""}`}
                      onClick={() => handleAnswer(q.id, opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            <button className="primary-button" onClick={handleEvaluate} disabled={loading || Object.keys(answers).length < questions.length}>
              {loading ? "Søger & Vurderer..." : "Vis Resultater"}
            </button>
          </div>
        )}
        
        {step === "results" && (
          <div className="results-container">
            <div className="results-header">
              <h2>Top 5 anbefalinger</h2>
              <span className="model-tag">{model === "gemini" ? "Google Gemini" : "Claude Haiku"}</span>
            </div>
            <div className="results-list">
              {results.map((product: any) => (
                <div key={product.rank} className={`result-row glass-panel ${product.rank === 1 ? "top-pick" : ""}`}>
                  <div className="rank-number">#{product.rank}</div>
                  <div className="result-info">
                    <div className="result-top">
                      <div>
                        <span className="category-badge">{product.badge}</span>
                        <h3>{product.name}</h3>
                      </div>
                      <div className="result-price-block">
                        <div className="price">{product.price} kr.</div>
                        <div className="shop-name">{product.shop}</div>
                      </div>
                    </div>
                    <div className="result-meta">
                      <span className="performance">{product.performanceGain}</span>
                      <span className="vram-tag">{product.vram}</span>
                    </div>
                    <p className="argument">{product.argument}</p>
                    <a href={product.url} target="_blank" rel="noopener" className="primary-button buy-button">Gå til butik &rarr;</a>
                  </div>
                </div>
              ))}
            </div>
            <div className="results-actions">
              <button className="secondary-button" onClick={() => {
                setStep("input");
                setAnswers({});
                setResults([]);
              }}>← Start forfra</button>
              <button className="export-button" onClick={handleExportHtml}>
                ↓ Eksporter som HTML
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
