import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
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
    const { mood, fastLaneQuery, previousRejectedIds, lastRejectionReason, rejectionCount, userDiet, userBudget } = req.body;
    const ai = getGemini();

    if (ai) {
      const prompt = `You are Kale, the mindful food concierge for 'Cherish', a Singapore hawker food app.
User context:
- Mood: ${mood || 'None specified'}
- Fast-lane search: ${fastLaneQuery || 'None'}
- Diet preference: ${userDiet || 'Healthy hawker food'}
- Budget: ${userBudget || '$'}
- Rejections count: ${rejectionCount || 0} (Max is 3)
- Last rejection reason: ${lastRejectionReason || 'None'}

Rules:
1. Suggest ONE specific real Singapore hawker stall at a known centre (e.g., Amoy Street, Maxwell, Chinatown Complex, Hong Lim, Lau Pa Sat, etc.).
2. Locked 3-line format for Pro/Con/Opinion:
   Pro: (exact 1 line stating a health or flavor benefit)
   Con: (exact 1 line stating a minor trade-off like queue or spice)
   Opinion: (exact 1 line giving a definitive pick, no waffle)
3. Provide a private personalized note:
   - whyFits: why this fits the user
   - whatToOrder: specific dish and custom modification
   - budgetMatch: budget fit
Return purely valid JSON with keys: stallName, hawkerCentre, location, neighborhood, cuisine, priceRange, healthScore, pro, con, opinion, personalNote (with whyFits, whatToOrder, budgetMatch).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json({
          recommendation: {
            option: {
              id: `gemini-${Date.now()}`,
              stallName: parsed.stallName,
              hawkerCentre: parsed.hawkerCentre,
              location: parsed.location || `${parsed.hawkerCentre}, Singapore`,
              neighborhood: parsed.neighborhood || 'Central Singapore',
              cuisine: parsed.cuisine || 'Singapore Hawker',
              dishHighlights: [parsed.personalNote?.whatToOrder || 'Signature Dish'],
              priceRange: parsed.priceRange || '$5.50 - $7.50',
              healthScore: parsed.healthScore || 'Nutritious & Fresh',
              walkTimeMinutes: 5,
              tags: [mood || 'comfort']
            },
            pro: parsed.pro,
            con: parsed.con,
            opinion: parsed.opinion,
            personalNote: parsed.personalNote,
            rejectionCount: rejectionCount || 0,
            sourceType: fastLaneQuery ? 'fast_lane' : (mood ? 'mood' : 'mystery')
          }
        });
      }
    }
  } catch (err) {
    console.warn('Gemini API call skipped or encountered error, fallback will be used:', err);
  }

  // If no Gemini key or error, client will handle gracefully with local curated engine
  return res.json({ status: 'fallback_to_local_curated' });
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
