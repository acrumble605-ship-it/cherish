import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily with recommended User-Agent
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Resilient multi-model fallback chain to smoothly handle 503 high demand spikes
const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

interface GenerateResult {
  text: string;
  modelUsed: string;
}

async function safeGenerateContent(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    models?: string[];
  }
): Promise<GenerateResult> {
  const models = params.models || FALLBACK_MODELS;
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const config = { ...(params.config || {}) };
        // For Gemini 3 series, low thinking level keeps latency minimal and prevents high demand timeouts
        if (model.startsWith('gemini-3')) {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
        }

        const res = await ai.models.generateContent({
          model,
          contents: params.contents,
          config,
        });

        if (res && res.text) {
          return { text: res.text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || err);
        const isTransient = 
          msg.includes('503') || 
          msg.includes('high demand') || 
          msg.includes('UNAVAILABLE') || 
          msg.includes('429') || 
          msg.includes('RESOURCE_EXHAUSTED');

        if (isTransient && attempt === 0) {
          await new Promise((r) => setTimeout(r, 300));
          continue;
        }
        break; // Try next fallback model in sequence
      }
    }
  }

  throw lastError;
}

// API Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    app: 'Cherish', 
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/kale/recommend', async (req: Request, res: Response) => {
  try {
    const { mood, fastLaneQuery, previousRejectedIds, lastRejectionReason, rejectionCount, userDiet, userBudget, weatherSummary, transportPreference, venuePreference } = req.body;
    const ai = getGemini();

    if (ai) {
      const prompt = `You are Kale, the mischievously honest food concierge for 'Cherish', a Singapore food app.
User context:
- Mood: ${mood || 'comfort'}
- Diet: ${userDiet || 'Healthy food'}
- Budget: ${userBudget || '$'}
- Weather: ${weatherSummary || 'Pleasant Singapore weather'}
- Transit preference: ${transportPreference || 'walking'}
- Venue preference: ${venuePreference || 'cafe'}
- Rejection count: ${rejectionCount || 0}

Rules:
1. STRICT LOCATION RULE: Suggest ONE real Singapore hawker, cafe, or dining spot strictly within 10 to 20 minutes walking distance (nowhere further!).
2. Venue respect: If venue is 'cafe', recommend a specialty cafe/brunch/coffee spot. If 'hawker', recommend a famous hawker stall. If 'restaurant', recommend a bistro or casual dining spot.
3. Keep it punchy and concise: Reduce the words and explanation, give only the necessary facts.
4. Keep the 3-line format crisp:
   Pro: (exact 1 short punchy line on why it's delicious)
   Con: (exact 1 short line on queue or wait)
   Opinion: (exact 1 decisive recommendation line)
5. Provide a personalNote with whyFits, whatToOrder, and budgetMatch, plus a curiosityTeaser (one teasing line before they take the bite).
Return valid JSON only with keys: stallName, hawkerCentre, location, neighborhood, cuisine, priceRange, healthScore, pro, con, opinion, personalNote (with whyFits, whatToOrder, budgetMatch), curiosityTeaser.`;

      const result = await safeGenerateContent(ai, {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      if (result && result.text) {
        const cleaned = result.text.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json({
          recommendation: {
            option: {
              id: `gemini-${Date.now()}`,
              stallName: parsed.stallName,
              hawkerCentre: parsed.hawkerCentre,
              location: parsed.location || `${parsed.hawkerCentre}, Singapore`,
              neighborhood: parsed.neighborhood || 'Central Singapore',
              cuisine: parsed.cuisine || 'Singapore Dining',
              dishHighlights: [parsed.personalNote?.whatToOrder || 'Signature Dish'],
              priceRange: parsed.priceRange || '$5.50 - $12.50',
              healthScore: parsed.healthScore || 'Nutritious & Fresh',
              walkTimeMinutes: 12,
              tags: [mood || 'comfort']
            },
            pro: parsed.pro,
            con: parsed.con,
            opinion: parsed.opinion,
            personalNote: parsed.personalNote,
            curiosityTeaser: parsed.curiosityTeaser || 'Kale whispers: You might have planned a plain salad, but today you feast like royalty.',
            rejectionCount: rejectionCount || 0,
            sourceType: fastLaneQuery ? 'fast_lane' : (mood ? 'mood' : 'mystery')
          }
        });
      }
    }
  } catch (err: any) {
    const isDemandSpike = String(err?.message || '').includes('503') || String(err?.message || '').includes('high demand');
    if (isDemandSpike) {
      console.log('Gemini model temporarily experiencing peak traffic; seamlessly utilizing Singapore curated database.');
    } else {
      console.log('Utilizing Singapore curated database fallback.');
    }
  }

  // If no Gemini key or temporary peak demand, client will handle gracefully with local curated engine
  return res.json({ status: 'fallback_to_local_curated' });
});

// Quick, low-stakes decisions — short, decisive, no paragraphs
app.post('/api/decide', async (req: Request, res: Response) => {
  const { question } = req.body;
  const ai = getGemini();
  if (!ai || !question) {
    return res.json({ question, options: [], pick: '', oneLiner: 'Trust your gut.' });
  }
  try {
    const prompt = `Answer in <=12 words, one sentence, no comparisons, no "on one hand". Give ONE decisive pick for max 2 realistic options for: "${question}". Return JSON with keys {options:[2 strings],pick:string,oneLiner:string}`;
    const result = await safeGenerateContent(ai, {
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    const cleaned = (result.text || '').replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
    const parsed = JSON.parse(cleaned || '{}');
    return res.json({ question, ...parsed });
  } catch {
    console.log('Decide fallback to intuitive verdict.');
    return res.json({ question, options: [], pick: '', oneLiner: 'Trust your gut.' });
  }
});

// Weather via Open-Meteo (no API key required)
app.get('/api/weather', async (req: Request, res: Response) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return res.json({ 
      summary: '⛅ 29°C Pleasant',
      condition: 'Pleasant',
      temperature: 29,
      isRain: false,
      tip: 'Great weather for discovering Singapore hawker gems.'
    });
  }
  try {
    const r = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,weather_code`
    );
    const d = await r.json();
    const t = Math.round(d.current?.temperature_2m ?? 29);
    const rain = d.current?.precipitation ?? 0;
    const code = d.current?.weather_code ?? 0;
    const isRain = rain > 0 || (code >= 51 && code <= 67) || (code >= 80 && code <= 99);
    const isHot = t >= 31;
    
    let summary = `${t}°C Pleasant`;
    let condition = 'Pleasant & Warm';
    let tip = 'Great weather for a quick hawker stroll.';
    
    if (isRain) {
      summary = `🌧️ ${t}°C Rainy`;
      condition = 'Rainy & Breezy';
      tip = 'Rain detected: Cherish recommends comforting warm broths & sheltered hawker centres.';
    } else if (isHot) {
      summary = `☀️ ${t}°C Hot & Sunny`;
      condition = 'Hot & Humid';
      tip = 'Tropical heat: Cherish recommends lighter, cooling dishes & iced drinks.';
    }

    res.json({ summary, condition, temperature: t, isRain, isHot, tip, raw: d.current });
  } catch {
    res.json({ 
      summary: '⛅ 29°C Pleasant',
      condition: 'Pleasant',
      temperature: 29,
      isRain: false,
      tip: 'Great weather for discovering Singapore hawker gems.'
    });
  }
});

app.post('/api/daily/chat', async (req: Request, res: Response) => {
  try {
    const { messages, dilemmaA, dilemmaB, topic } = req.body;
    const ai = getGemini();

    if (ai) {
      let prompt = `You are Cherish, a wise, warm, decisive, and grounded human friend helping someone make everyday daily decisions (e.g. buying this vs that, doing X vs Y, routines, everyday choices).

STRICT RULES:
1. ABSOLUTELY NO PROS AND CONS LISTS. Never output bullet lists of pros/cons or comparison tables. The user hates pro/con analysis paralysis.
2. TALK LIKE A REAL HUMAN FRIEND: Warm, conversational, grounded, empathetic, and gentle. Use 2 to 4 concise sentences.
3. BE DECISIVE: When torn between two choices or deciding whether to buy something, do not say "it depends on what you value". Take a stand with a clear, caring recommendation or an intuitive human heuristic (e.g. 48-hour rule for buying, 10/10/10 rule, cost-per-use, or gut check).
4. End your message with a separate line:
Verdict: <one punchy, memorable sentence giving your definitive advice>`;

      if (dilemmaA && dilemmaB) {
        prompt += `\n\nThe user is currently stuck between these two choices:
Choice A: "${dilemmaA}"
Choice B: "${dilemmaB}"`;
      } else if (topic) {
        prompt += `\n\nTopic / Dilemma: "${topic}"`;
      }

      const formattedContents = Array.isArray(messages) && messages.length > 0
        ? messages.map((m: { role: string; content: string }) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }))
        : [{ role: 'user', parts: [{ text: topic || (dilemmaA && dilemmaB ? `Help me choose between ${dilemmaA} and ${dilemmaB}` : 'Help me make a decision') }] }];

      const result = await safeGenerateContent(ai, {
        contents: formattedContents,
        config: {
          systemInstruction: prompt
        }
      });

      if (result && result.text) {
        const fullText = result.text.trim();
        let verdict = '';
        let replyText = fullText;

        const verdictMatch = fullText.match(/Verdict:\s*(.+)$/im);
        if (verdictMatch) {
          verdict = verdictMatch[1].trim();
          replyText = fullText.replace(/Verdict:\s*.+$/im, '').trim();
        }

        return res.json({
          success: true,
          reply: replyText,
          verdict: verdict || undefined
        });
      }
    }
  } catch {
    console.log('Daily chat fallback to intuitive heuristic engine.');
  }

  return res.json({ status: 'fallback_to_local_engine' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cherish server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
