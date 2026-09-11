import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Dices, 
  RotateCcw, 
  MessageCircle, 
  CheckCircle2, 
  Scale, 
  Clock
} from 'lucide-react';
import { DailyChatMessage, DailyDecisionItem } from '../types';
import { DailyDecisionService } from '../services/dailyDecisionService';

export const DailyView: React.FC = () => {
  const [dailyMode, setDailyMode] = useState<'duel' | 'chat'>('duel');

  // Input states for quick duel
  const [choiceA, setChoiceA] = useState('');
  const [choiceB, setChoiceB] = useState('');
  const [duelResult, setDuelResult] = useState<{
    winner: 'A' | 'B';
    winnerTitle: string;
    humanInsight: string;
    gutCheckMessage: string;
  } | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  // Chat conversation state
  const [messages, setMessages] = useState<DailyChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hey! What's on your mind today? Whether you're debating which dish to eat, weighing a purchase, or feeling stuck—tell me what you're facing. No pros and cons lists here, just straight, honest conversation.",
      timestamp: 'Just now',
      verdict: 'Drop any dilemma below, or tap one of the prompts to start.'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dailyMode === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiThinking, dailyMode]);

  // Handle sending chat message
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text || isAiThinking) return;

    const userMsg: DailyChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsAiThinking(true);
    setDailyMode('chat');

    try {
      const response = await DailyDecisionService.sendChatMessage({
        messages: newMessages.map(m => ({ role: m.sender, content: m.text })),
        dilemmaA: choiceA.trim() || undefined,
        dilemmaB: choiceB.trim() || undefined
      });

      const assistantMsg: DailyChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        verdict: response.verdict
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Roll the dice tie breaker
  const handleRollDice = () => {
    if (!choiceA.trim() || !choiceB.trim() || isRolling) return;

    setIsRolling(true);
    setDuelResult(null);

    setTimeout(() => {
      const res = DailyDecisionService.rollDiceDuel(choiceA.trim(), choiceB.trim());
      setDuelResult(res);
      setIsRolling(false);
    }, 600);
  };

  // Transfer duel to chat
  const handleChatDuel = () => {
    if (!choiceA.trim() || !choiceB.trim()) return;
    const prompt = `I'm torn between "${choiceA.trim()}" and "${choiceB.trim()}". What should I choose?`;
    handleSendMessage(prompt);
  };

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-14 font-sans">
      {/* Header */}
      <div className="text-center space-y-1 pt-1 px-2">
        <h1 className="font-serif-lux text-2xl sm:text-3xl md:text-4xl italic text-[#f5f2ed] tracking-tight">
          Decisions &amp; Duels
        </h1>
        <p className="text-xs sm:text-sm text-[#f5f2ed]/70 max-w-md mx-auto leading-relaxed">
          Have an idea what to eat, or torn between buying this or that? Settle it instantly without pros &amp; cons fatigue.
        </p>
      </div>

      {/* 2-Segmented Selector */}
      <div className="p-1 rounded-2xl bg-[#1d0510] border border-white/10 flex items-center justify-between text-xs font-medium gap-1 shadow-inner">
        <button
          id="btn-daily-mode-duel"
          onClick={() => setDailyMode('duel')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            dailyMode === 'duel'
              ? 'bg-gradient-to-r from-[#edd49a] via-[#c5a059] to-[#a3792b] text-black font-semibold shadow-md'
              : 'text-[#f5f2ed]/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Scale className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate font-semibold">2-Choice Duel (Food or Life)</span>
        </button>

        <button
          id="btn-daily-mode-chat"
          onClick={() => setDailyMode('chat')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            dailyMode === 'chat'
              ? 'bg-gradient-to-r from-[#edd49a] via-[#c5a059] to-[#a3792b] text-black font-semibold shadow-md'
              : 'text-[#f5f2ed]/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate font-semibold">Chat Concierge</span>
        </button>
      </div>

      {/* VIEW 1: QUICK 2-CHOICE TIE-BREAKER */}
      {dailyMode === 'duel' && (
        <div className="rounded-3xl bg-[#1d0510] border border-[#c5a059]/30 p-5 sm:p-6 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-white/5 text-xs">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#c5a059]" />
              <h2 className="font-semibold text-[#f5f2ed] uppercase tracking-wider">
                Option A vs Option B
              </h2>
            </div>
            <span className="text-[#c5a059]/90 font-medium text-[11px]">
              Instant Resolution
            </span>
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[10px] text-[#f5f2ed]/40 shrink-0">Try food presets:</span>
            {[
              ['Chicken Rice', 'Fish Soup'],
              ['Laksa', 'Ban Mian'],
              ['Bak Chor Mee', 'Yong Tau Foo'],
              ['Buy mechanical keyboard', 'Save the $120']
            ].map(([a, b], idx) => (
              <button
                key={idx}
                onClick={() => {
                  setChoiceA(a);
                  setChoiceB(b);
                }}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 hover:border-[#c5a059] text-[#f5f2ed]/80 hover:text-white shrink-0 cursor-pointer"
              >
                {a} vs {b}
              </button>
            ))}
          </div>

          {/* Dual Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-[#c5a059] uppercase tracking-wider block">
                Option A (Dish or Plan)
              </label>
              <input
                id="input-daily-choice-a"
                type="text"
                placeholder="e.g. Hainanese Chicken Rice ($5.50)"
                value={choiceA}
                onChange={(e) => setChoiceA(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#280718] border border-white/10 focus:border-[#c5a059] focus:outline-none text-xs text-[#f5f2ed] placeholder-[#f5f2ed]/30 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-medium text-[#c5a059] uppercase tracking-wider block">
                Option B (Dish or Plan)
              </label>
              <input
                id="input-daily-choice-b"
                type="text"
                placeholder="e.g. Sliced Mackerel Soup ($7.00)"
                value={choiceB}
                onChange={(e) => setChoiceB(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#280718] border border-white/10 focus:border-[#c5a059] focus:outline-none text-xs text-[#f5f2ed] placeholder-[#f5f2ed]/30 transition-all"
              />
            </div>
          </div>

          {/* Dual Actions: Roll the Dice & Talk it Out */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            <button
              id="btn-daily-roll-dice"
              disabled={!choiceA.trim() || !choiceB.trim() || isRolling}
              onClick={handleRollDice}
              className={`w-full sm:w-1/2 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                !choiceA.trim() || !choiceB.trim() || isRolling
                  ? 'opacity-40 bg-white/5 text-[#f5f2ed]/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#edd49a] via-[#c5a059] to-[#a3792b] text-black hover:shadow-[0_0_20px_rgba(197,160,89,0.5)] active:scale-95'
              }`}
            >
              <Dices className={`w-3.5 h-3.5 ${isRolling ? 'animate-spin' : ''}`} />
              <span>{isRolling ? 'Rolling dice...' : 'Roll the dice 🎲'}</span>
            </button>

            <button
              id="btn-daily-chat-duel"
              disabled={!choiceA.trim() || !choiceB.trim()}
              onClick={handleChatDuel}
              className={`w-full sm:w-1/2 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                !choiceA.trim() || !choiceB.trim()
                  ? 'opacity-40 border-white/10 bg-white/5 text-[#f5f2ed]/50 cursor-not-allowed'
                  : 'border-[#c5a059]/60 bg-[#280718] text-[#f5f2ed] hover:border-[#c5a059] hover:bg-[#340920] active:scale-95'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Chat it through 💬</span>
            </button>
          </div>

          {/* Dice Result Card */}
          {duelResult && (
            <div className="mt-3 p-4 rounded-2xl bg-[#2b081a] border border-[#c5a059] shadow-lg space-y-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#c5a059] flex items-center gap-1.5">
                  <Dices className="w-3 h-3" />
                  The Verdict
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c5a059]/20 text-[#edd49a] font-medium">
                  Definitive
                </span>
              </div>

              <div className="text-lg font-bold text-[#f5f2ed] font-serif-lux italic">
                {duelResult.winnerTitle}
              </div>

              <p className="text-xs text-[#f5f2ed]/80 leading-relaxed">
                {duelResult.humanInsight}
              </p>

              <div className="pt-2 border-t border-white/10 text-xs text-[#c5a059] flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#c5a059]" />
                <span className="italic">{duelResult.gutCheckMessage}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: CONVERSATIONAL DECISION CHAT */}
      {dailyMode === 'chat' && (
        <div className="rounded-3xl bg-[#18040d] border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-200">
          {/* Chat Header */}
          <div className="p-3.5 sm:p-4 bg-[#230614] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#edd49a] to-[#a3792b] text-black flex items-center justify-center font-bold text-xs shadow-md">
                C
              </div>
              <div>
                <div className="text-xs font-semibold text-[#f5f2ed] flex items-center gap-1.5">
                  <span>Cherish Concierge</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <div className="text-[10px] text-[#f5f2ed]/60">
                  Direct human perspective &bull; No pros/cons fluff
                </div>
              </div>
            </div>

            <button
              id="btn-clear-daily-chat"
              onClick={() => setMessages([
                {
                  id: 'welcome-reset',
                  sender: 'assistant',
                  text: "Fresh slate! What decision or dish are you weighing right now?",
                  timestamp: 'Just now'
                }
              ])}
              className="text-[11px] text-[#f5f2ed]/50 hover:text-[#f5f2ed] transition-colors flex items-center gap-1 px-2.5 py-1 rounded-xl hover:bg-white/5 cursor-pointer"
              title="Start fresh conversation"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-[#1f0512] border-b border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-[#f5f2ed]/50 shrink-0 font-medium">Quick prompts:</span>
            {[
              '🏷️ Buy now or wait 48h?',
              '🍜 Chicken Rice vs Fish Soup today?',
              '😴 Workout or rest early?',
              '🛍️ Splurge on dinner or budget?'
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handlePromptClick(prompt)}
                className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#2c0819] hover:bg-[#3d0b23] border border-white/10 hover:border-[#c5a059]/50 text-[#f5f2ed]/80 hover:text-white transition-all shrink-0 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Message Stream */}
          <div className="p-4 sm:p-5 space-y-3.5 max-h-[380px] overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 shadow-md space-y-2 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#edd49a] via-[#c5a059] to-[#a3792b] text-black font-medium'
                      : 'bg-[#260716] border border-white/10 text-[#f5f2ed]'
                  }`}
                >
                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </div>

                  {msg.verdict && msg.sender === 'assistant' && (
                    <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a059] shrink-0 mt-0.5" />
                      <div className="text-xs font-semibold text-[#edd49a]">
                        {msg.verdict}
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-[#f5f2ed]/40 px-2 mt-0.5">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isAiThinking && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#260716] border border-white/10 text-xs text-[#f5f2ed]/70 w-fit">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c5a059] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c5a059]"></span>
                </span>
                <span>Thinking with you...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#200512] border-t border-white/10 flex items-center gap-2"
          >
            <input
              id="input-daily-chat-text"
              type="text"
              placeholder="What are you torn between deciding on?..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isAiThinking}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#16030c] border border-white/10 focus:border-[#c5a059] focus:outline-none text-xs text-[#f5f2ed] placeholder-[#f5f2ed]/40 transition-all"
            />

            <button
              id="btn-send-daily-chat"
              type="submit"
              disabled={!inputText.trim() || isAiThinking}
              className={`p-2.5 rounded-xl transition-all cursor-pointer shadow-md ${
                !inputText.trim() || isAiThinking
                  ? 'opacity-40 bg-white/5 text-[#f5f2ed]/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#edd49a] via-[#c5a059] to-[#a3792b] text-black hover:shadow-[0_0_15px_rgba(197,160,89,0.5)] active:scale-95'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
