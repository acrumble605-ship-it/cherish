import { DailyChatMessage, DailyDecisionItem } from '../types';

export class DailyDecisionService {
  private static STORAGE_KEY = 'cherish_daily_decisions';

  /**
   * Send a chat message to the decision companion
   */
  static async sendChatMessage(params: {
    messages: { role: 'user' | 'assistant'; content: string }[];
    dilemmaA?: string;
    dilemmaB?: string;
    topic?: string;
  }): Promise<{ reply: string; verdict?: string }> {
    try {
      const response = await fetch('/api/daily/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.reply) {
          return {
            reply: data.reply,
            verdict: data.verdict,
          };
        }
      }
    } catch (e) {
      console.warn('Network issue calling /api/daily/chat, using local human heuristic:', e);
    }

    // Local Human Heuristic Fallback (Zero pros and cons, purely human conversational advice)
    return this.generateHumanFallback(params);
  }

  /**
   * Fallback engine that follows the exact same philosophy:
   * No pros and cons, warm human conversational tone, decisive takeaway.
   */
  private static generateHumanFallback(params: {
    messages: { role: 'user' | 'assistant'; content: string }[];
    dilemmaA?: string;
    dilemmaB?: string;
    topic?: string;
  }): { reply: string; verdict?: string } {
    const lastUserMsg = params.messages[params.messages.length - 1]?.content.toLowerCase() || '';
    const { dilemmaA, dilemmaB } = params;

    // 1. Direct A vs B Choice
    if (dilemmaA && dilemmaB) {
      const aLower = dilemmaA.toLowerCase();
      const bLower = dilemmaB.toLowerCase();
      
      // Cost or purchase comparison
      if (aLower.includes('buy') || bLower.includes('buy') || aLower.includes('cheap') || bLower.includes('save')) {
        return {
          reply: `Honestly, looking at "${dilemmaA}" versus "${dilemmaB}", don't get trapped comparing specs. If you're going to use it daily for more than six months, go with the higher quality one—cheap buys often cost double when you replace them. But if it's just a fleeting novelty, pick the simpler path. My gut says go with "${dilemmaA}".`,
          verdict: `Pick ${dilemmaA}—peace of mind beats buyer's hesitation.`
        };
      }

      // Action vs Rest / Sleep / Gym
      if (aLower.includes('rest') || aLower.includes('sleep') || bLower.includes('rest') || bLower.includes('sleep')) {
        return {
          reply: `Listen to your body. You can't out-discipline a deficit in rest. If your brain feels foggy and your eyes are heavy, pushing through will just give you subpar results. Take the rest now so you can bring genuine fire to tomorrow.`,
          verdict: `Choose rest tonight; recharge fully for tomorrow.`
        };
      }

      return {
        reply: `Between "${dilemmaA}" and "${dilemmaB}", they're both valid, but you're probably over-analyzing because you're scared of missing out on the other. Here's the test: pick "${dilemmaA}" right now for the next 10 seconds. Did your stomach drop? If not, lock it in and move forward with confidence.`,
        verdict: `Lock in ${dilemmaA} and don't look back.`
      };
    }

    // 2. Buying / Purchasing Dilemma
    if (lastUserMsg.includes('buy') || lastUserMsg.includes('purchase') || lastUserMsg.includes('spend') || lastUserMsg.includes('cost') || lastUserMsg.includes('worth it')) {
      return {
        reply: `Here's my golden rule for buying things: if it's not an immediate "hell yes", it's an automatic "not right now". Close the browser tab or walk out of the store for 24 hours. If you're still daydreaming about it tomorrow afternoon without any sales hype, treat yourself. Otherwise, you just saved yourself buyer's remorse.`,
        verdict: `Put it on a 24-hour hold; if you still crave it tomorrow, buy it.`
      };
    }

    // 3. Health, workout, exhaustion
    if (lastUserMsg.includes('gym') || lastUserMsg.includes('workout') || lastUserMsg.includes('tired') || lastUserMsg.includes('sleep')) {
      return {
        reply: `Here's how to tell: do a 5-minute stretch or walk outside. If you still feel completely drained after 5 minutes, go straight to sleep or take a warm shower—your nervous system is calling for a timeout. If you catch a second wind, do a light 20-minute workout, but don't force a brutal session.`,
        verdict: `Take the gentle route today—recovery is productive too.`
      };
    }

    // 4. Overthinking / General stalemate
    if (lastUserMsg.includes('overthink') || lastUserMsg.includes('decide') || lastUserMsg.includes('confused') || lastUserMsg.includes('stuck')) {
      return {
        reply: `Remember: 80% of our daily choices are reversible two-way doors. Pick whichever option brings you less cognitive noise by bedtime. Indecision burns more fuel than making a sub-optimal choice and adjusting course later.`,
        verdict: `Choose the path of least mental friction.`
      };
    }

    // General warm supportive advice
    return {
      reply: `I hear you. When things feel foggy, look at which option makes tomorrow morning easier for future-you. If both options have merit, pick the one that feels lighter in your chest right now. No spreadsheets or pros and cons needed.`,
      verdict: `Go with what gives you peace of mind tonight.`
    };
  }

  /**
   * Roll the dice for a quick 2-choice tie-breaker
   */
  static rollDiceDuel(choiceA: string, choiceB: string): {
    winner: 'A' | 'B';
    winnerTitle: string;
    humanInsight: string;
    gutCheckMessage: string;
  } {
    const isA = Math.random() >= 0.5;
    const winner = isA ? 'A' : 'B';
    const winnerTitle = isA ? choiceA : choiceB;
    const loserTitle = isA ? choiceB : choiceA;

    return {
      winner,
      winnerTitle,
      humanInsight: `The dice landed on "${winnerTitle}". Don't second-guess it—commit for today and see how liberating it feels to simply decide.`,
      gutCheckMessage: `Psychology check: While the dice was rolling, did you secretly hope it would land on "${loserTitle}"? If so, pick that instead! If you felt relief seeing "${winnerTitle}", that's your true answer.`
    };
  }

  /**
   * Local history management
   */
  static getSavedDecisions(): DailyDecisionItem[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'init-1',
        title: 'New headphones vs. Wait for sale',
        verdict: 'Wait 48 hours; sale starts next Friday anyway.',
        date: 'Yesterday',
        category: 'purchase'
      },
      {
        id: 'init-2',
        title: 'Evening jog vs. Early bedtime',
        verdict: 'Prioritized recovery sleep; woke up energized.',
        date: '2 days ago',
        category: 'lifestyle'
      }
    ];
  }

  static saveDecision(item: Omit<DailyDecisionItem, 'id' | 'date'>): DailyDecisionItem {
    const current = this.getSavedDecisions();
    const newItem: DailyDecisionItem = {
      ...item,
      id: `dec-${Date.now()}`,
      date: 'Just now'
    };
    const updated = [newItem, ...current.slice(0, 15)];
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    return newItem;
  }
}
