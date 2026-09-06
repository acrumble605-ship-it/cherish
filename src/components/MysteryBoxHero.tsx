import React, { useState } from 'react';
import { Sparkles, Compass, Flame, Soup, Leaf, HelpCircle, Gift, Search, ArrowRight, X } from 'lucide-react';
import { Mood } from '../types';

interface MysteryBoxHeroProps {
  onSelectMood: (mood: Mood) => void;
  onFastLaneSearch: (query: string) => void;
  isLoading: boolean;
  bankedCount: number;
  onOpenBanked: () => void;
}

export const MysteryBoxHero: React.FC<MysteryBoxHeroProps> = ({
  onSelectMood,
  onFastLaneSearch,
  isLoading,
  bankedCount,
  onOpenBanked
}) => {
  const [fastLaneOpen, setFastLaneOpen] = useState(false);
  const [fastLaneQuery, setFastLaneQuery] = useState('');

  const moodChips: { mood: Mood; label: string; icon: React.ReactNode; desc: string }[] = [
    { mood: 'spicy', label: 'Spicy Heat', icon: <Flame className="w-3.5 h-3.5 text-[#ff8070]" />, desc: 'Capsaicin boost' },
    { mood: 'comfort', label: 'Comfort Broth', icon: <Soup className="w-3.5 h-3.5 text-[#f6bd7a]" />, desc: 'Soothing warm bowl' },
    { mood: 'light', label: 'Light & Clean', icon: <Leaf className="w-3.5 h-3.5 text-[#8ce2ad]" />, desc: 'Zero oil, high protein' },
    { mood: 'surprise', label: 'Surprise Me', icon: <Gift className="w-3.5 h-3.5 text-[#dca2f7]" />, desc: 'Kale AI choice' },
    { mood: 'something_new', label: 'Something New', icon: <HelpCircle className="w-3.5 h-3.5 text-[#f3cf7f]" />, desc: 'Hidden local gem' }
  ];

  const handleFastLaneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fastLaneQuery.trim()) {
      onFastLaneSearch(fastLaneQuery.trim());
    }
  };

  return (
    <div className="w-full py-8 md:py-14 flex flex-col items-center justify-center text-center relative overflow-hidden" id="mystery-box-section">
      {/* Immersive UI ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#4a0e2e] rounded-full blur-[100px] opacity-30 pointer-events-none -z-10" />

      {/* Header Eyebrow / Banked notification notice */}
      {bankedCount > 0 ? (
        <button
          onClick={onOpenBanked}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-[#c5a059]/50 text-xs text-[#f5f2ed] mb-6 hover:border-[#c5a059] hover:bg-white/5 transition-all font-sans"
        >
          <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" />
          <span className="tracking-wide">You have <strong className="text-[#c5a059]">{bankedCount} banked craving{bankedCount > 1 ? 's' : ''}</strong> from squad lunches</span>
          <ArrowRight className="w-3 h-3 text-[#c5a059]" />
        </button>
      ) : (
        <div className="text-[#c5a059] uppercase text-[10px] tracking-[0.7em] mb-4 opacity-80 font-sans">
          Exclusively Curated &bull; Singapore Hawker Decisions
        </div>
      )}

      {/* Thesis headline: Immersive UI display */}
      <div className="mb-6">
        <h2 className="font-serif-lux text-4xl sm:text-6xl lg:text-7xl font-thin tracking-tight mb-4 leading-none italic text-[#f5f2ed]">
          Velvet Decisions
        </h2>
        <p className="text-sm sm:text-base font-light text-[#f5f2ed]/60 max-w-lg mx-auto font-sans tracking-wide leading-relaxed">
          Zero decision fatigue. Experience the intersection of authentic culinary tradition and calm clarity with a single definitive hawker pick.
        </p>
      </div>

      {/* PRIMARY HOME MECHANIC: THE MYSTERY BOX */}
      <div className="relative group mb-12" id="mystery-box-container">
        {/* Ambient purplish glow behind box */}
        <div className="absolute -inset-1 bg-[#4a0e2e] rounded-3xl blur-2xl opacity-40 group-hover:opacity-75 transition duration-500" />

        <button
          id="btn-unveil-mystery-box"
          disabled={isLoading}
          onClick={() => onSelectMood('surprise')}
          className="relative px-8 sm:px-14 py-8 sm:py-10 rounded-3xl glass bg-white/[0.03] border border-white/15 hover:bg-white/[0.06] hover:border-[#c5a059]/70 glow flex flex-col items-center justify-center transition-all duration-500 transform active:scale-98 disabled:opacity-50 cursor-pointer"
        >
          {/* Box Emblem */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl glass border border-[#c5a059]/60 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(74,14,46,0.5)] group-hover:rotate-2 transition-transform">
            <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-[#c5a059]" />
          </div>

          <div className="text-center flex flex-col items-center">
            <div className="font-serif-lux text-2xl sm:text-4xl font-light italic tracking-wide text-[#f5f2ed] mb-1 flex items-center justify-center gap-2">
              <span>{isLoading ? 'Consulting Kale...' : "Unveil Today's Pick"}</span>
              <Sparkles className="w-4 h-4 text-[#c5a059]" />
            </div>
            
            {/* Hairline gold accent from theme */}
            <div className="h-[1px] w-40 bg-[#c5a059] opacity-30 my-3"></div>

            <p className="text-[10px] uppercase tracking-[0.3em] text-[#c5a059]/90 font-sans">
              Single locked pick &bull; Private dietary note
            </p>
          </div>
        </button>
      </div>

      {/* TWO PATHS FROM HOME */}
      <div className="w-full max-w-xl mx-auto space-y-6 px-4" id="two-paths-container">
        
        {/* PATH 1: MOOD CHIP TAP */}
        <div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-[1px] w-12 bg-[#c5a059] opacity-30" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#c5a059] font-sans opacity-80">
              Path 1: Tap Current Mood
            </span>
            <span className="h-[1px] w-12 bg-[#c5a059] opacity-30" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {moodChips.map(chip => (
              <button
                key={chip.mood}
                id={`mood-chip-${chip.mood}`}
                onClick={() => onSelectMood(chip.mood)}
                disabled={isLoading}
                className="glass px-4 py-2.5 rounded-xl border border-white/10 hover:border-[#c5a059]/60 hover:bg-white/5 text-xs text-[#f5f2ed]/90 hover:text-[#f5f2ed] transition-all duration-300 font-sans tracking-wide flex items-center gap-2 group"
              >
                {chip.icon}
                <span className="font-light group-hover:text-[#f5f2ed]">{chip.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* PATH 2: FAST LANE */}
        <div className="pt-2">
          {!fastLaneOpen ? (
            <button
              id="btn-open-fast-lane"
              onClick={() => setFastLaneOpen(true)}
              className="text-xs text-[#c5a059] hover:text-[#f5f2ed] underline underline-offset-4 decoration-[#c5a059]/40 transition-colors font-sans tracking-wide"
            >
              Path 2: Fast lane &mdash; Already have an exact craving? (e.g. &ldquo;laksa&rdquo;, &ldquo;sliced fish soup&rdquo;)
            </button>
          ) : (
            <form onSubmit={handleFastLaneSubmit} className="relative max-w-md mx-auto" id="form-fast-lane">
              <div className="flex items-center gap-2 p-1.5 rounded-2xl glass border border-[#c5a059]/50 shadow-[0_0_20px_rgba(74,14,46,0.3)]">
                <Search className="w-4 h-4 text-[#c5a059] ml-3 shrink-0" />
                <input
                  type="text"
                  id="input-fast-lane"
                  value={fastLaneQuery}
                  onChange={(e) => setFastLaneQuery(e.target.value)}
                  placeholder="Type your craving (e.g. laksa, porridge, tea rice)..."
                  className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-[#f5f2ed] placeholder-[#f5f2ed]/40 focus:outline-none font-sans"
                  autoFocus
                />
                <button
                  type="submit"
                  id="btn-submit-fast-lane"
                  disabled={!fastLaneQuery.trim() || isLoading}
                  className="px-4 py-2 rounded-xl glass bg-white/10 hover:bg-white/15 text-xs font-sans tracking-wider uppercase text-[#f5f2ed] border border-[#c5a059]/40 transition-all disabled:opacity-40"
                >
                  Find
                </button>
                <button
                  type="button"
                  onClick={() => setFastLaneOpen(false)}
                  className="p-1.5 text-[#f5f2ed]/50 hover:text-[#f5f2ed]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-[#f5f2ed]/50 mt-2 text-center font-sans tracking-wide">
                Skips straight to finding and fitting real hawker options with your personalized note.
              </p>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
