import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowDown, 
  SlidersHorizontal,
  BookmarkCheck,
  ChevronDown,
  Footprints,
  Compass
} from 'lucide-react';
import { Mood, UserProfile } from '../types';

interface MysteryBoxHeroProps {
  onSelectMood: (mood: Mood) => void;
  isLoading: boolean;
  bankedCount: number;
  onOpenBanked: () => void;
  onOpenPersonalisation: () => void;
  currentLocationName?: string;
  weatherSummary?: string;
  userProfile: UserProfile;
}

export const MysteryBoxHero: React.FC<MysteryBoxHeroProps> = ({
  onSelectMood,
  isLoading,
  bankedCount,
  onOpenBanked,
  onOpenPersonalisation,
  currentLocationName = 'Singapore Central',
  weatherSummary = '⛅ 29°C Pleasant',
  userProfile
}) => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [isAnticipating, setIsAnticipating] = useState(false);

  const moodOptions: { mood: Mood; label: string; icon: string; teaser: string }[] = [
    { 
      mood: 'comfort', 
      label: 'Comfort', 
      icon: '🍲', 
      teaser: 'Sheltered, restorative broth that hits like a warm hug.'
    },
    { 
      mood: 'spicy', 
      label: 'Fiery & Bold', 
      icon: '🌶️', 
      teaser: 'Serious wok-hei flame action to wake up every nerve.'
    },
    { 
      mood: 'light', 
      label: 'Clean & Lean', 
      icon: '🥗', 
      teaser: '100% clean nutrition and lean fuel without the 3 PM food coma.'
    },
    { 
      mood: 'surprise', 
      label: 'Mystery Wildcard', 
      icon: '🔮', 
      teaser: 'You thought you’d be predictable today? Let’s test your palate.'
    },
    { 
      mood: 'something_new', 
      label: 'Artisanal Gem', 
      icon: '🗝️', 
      teaser: 'Hidden shophouse craft verified for supreme taste.'
    }
  ];

  const handleMoodClick = (mood: Mood) => {
    setSelectedMood(mood);
  };

  const handleUnveilClick = () => {
    const moodToUse = selectedMood || 'comfort';
    if (isLoading) return;
    setIsAnticipating(true);
    setTimeout(() => {
      onSelectMood(moodToUse);
      setIsAnticipating(false);
    }, 250);
  };

  return (
    <div className="w-full max-w-xl mx-auto py-2 sm:py-4 flex flex-col items-center text-center font-sans" id="mystery-box-section">
      
      {/* 1. Tracked Context Pill: Only Live & Temperature (No 10-20m walk redundancy) */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#200412] border border-[#c5a059]/40 text-xs text-[#f5f2ed] mb-3 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
        <span className="font-medium text-[#edd49a]">{currentLocationName}</span>
        <span className="text-[#f5f2ed]/40">&bull;</span>
        <span className="text-[#f5f2ed]/90">{weatherSummary}</span>
      </div>

      {/* 2. Uncluttered Hero Title */}
      <div className="mb-4 px-2">
        <h2 className="font-serif-lux text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-[#f5f2ed] italic">
          What are you craving?
        </h2>
      </div>

      {/* 3. Personalisation Quick Link */}
      <button
        onClick={onOpenPersonalisation}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-[#f5f2ed]/70 hover:text-white transition-all mb-4 cursor-pointer"
        title="Customise venue, diet, and budget preferences"
      >
        <SlidersHorizontal className="w-3 h-3 text-[#c5a059]" />
        <span>
          {userProfile.venuePreference === 'restaurant' ? '🍽️ Restaurant' : userProfile.venuePreference === 'cafe' ? '☕ Cafe' : '🍜 Hawker'}
          {' &bull; '}
          {userProfile.budgetTier}
          {' &bull; '}
          {userProfile.diet.split(' ')[0]}
        </span>
        <span className="text-[#c5a059] font-medium ml-1">Edit ⚙️</span>
      </button>

      {/* 4. Mood Selector Cards */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2 px-2 mb-4">
        {moodOptions.map(option => {
          const isSelected = selectedMood === option.mood;
          return (
            <button
              key={option.mood}
              id={`mood-option-${option.mood}`}
              onClick={() => handleMoodClick(option.mood)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 relative ${
                isSelected
                  ? 'border-[#c5a059] bg-[#3a0922] text-white shadow-[0_0_15px_rgba(197,160,89,0.35)] scale-[1.02]'
                  : 'border-white/10 bg-[#1e0413] text-[#f5f2ed]/80 hover:bg-[#28071a] hover:border-white/20'
              }`}
            >
              <span className="text-xl shrink-0 p-1 rounded-lg bg-black/20">
                {option.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-[#f5f2ed] truncate">
                  {option.label}
                </div>
                {isSelected && (
                  <div className="text-[10px] text-[#c5a059] font-bold">Selected ✓</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 5. Direct Simple CTA Button (Selection Down - No Drop Down Drawer) */}
      <div className="w-full px-2">
        <button
          id="btn-unveil-dish"
          onClick={handleUnveilClick}
          disabled={isLoading || isAnticipating}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#edd49a] via-[#c5a059] to-[#a3792b] text-black font-semibold text-sm shadow-[0_0_20px_rgba(197,160,89,0.35)] hover:shadow-[0_0_30px_rgba(197,160,89,0.55)] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {isAnticipating || isLoading ? (
            <>
              <span className="animate-spin text-sm">🔮</span>
              <span>Finding today&apos;s dish...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-black" />
              <span>Unveil Today&apos;s Dish</span>
            </>
          )}
        </button>
      </div>

      {/* Banked Cravings Reminder */}
      {bankedCount > 0 && (
        <button
          onClick={onOpenBanked}
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#c5a059] hover:text-[#f5f2ed] transition-colors cursor-pointer"
        >
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span>{bankedCount} banked craving{bankedCount > 1 ? 's' : ''} saved &rarr;</span>
        </button>
      )}

    </div>
  );
};
