import React from 'react';
import { UserProfile } from '../types';
import { X, SlidersHorizontal, Check } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile
}) => {
  if (!isOpen) return null;

  const dietOptions = [
    'Balanced, High-Protein',
    'Low Carb / Keto Friendly',
    'Pescatarian (Fish & Seafood)',
    'Vegetarian (No Meat)',
    'Halal-Friendly Only',
    'No Pork & No Lard',
    'Gluten-Sensitive'
  ];

  const budgetOptions = [
    { label: '$ ($4.00 - $7.00 SGD)', value: '$' },
    { label: '$$ ($7.00 - $11.00 SGD)', value: '$$' },
    { label: '$$$ ($11.00+ SGD)', value: '$$$' }
  ];

  const priorityOptions = [
    { id: 'Calorie Control (<500 kcal)', label: 'Calorie Deficit (<500 kcal)', desc: 'Low density, zero hidden frying fats' },
    { id: 'High Protein (>30g)', label: 'High Protein (>30g)', desc: 'Lean fish, poached poultry, egg white' },
    { id: 'Health & Longevity', label: 'Gut Health & Longevity', desc: 'Prebiotics, bittergourd, ginger broths' },
    { id: 'Blood Sugar Stability', label: 'Blood Sugar Balance (Low GI)', desc: 'Skips post-lunch insulin spikes' },
    { id: 'Speed & Convenience', label: 'Quick Lunch (<15 min queue)', desc: 'Fast turnaround counters' },
    { id: 'Budget Value', label: 'Maximum Value Savings', desc: 'Michelin pedigree under $6.00 SGD' }
  ];

  const currentPriorities = userProfile.priorities || ['Health & Longevity', 'Calorie Control (<500 kcal)'];

  const togglePriority = (id: string) => {
    let updated: string[];
    if (currentPriorities.includes(id)) {
      if (currentPriorities.length === 1) return; // keep at least 1
      updated = currentPriorities.filter(p => p !== id);
    } else {
      updated = [...currentPriorities, id];
    }
    onUpdateProfile({ ...userProfile, priorities: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-md my-8 rounded-3xl glass bg-white/[0.04] border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] glow p-6 sm:p-8 space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl glass border border-[#c5a059]/50 flex items-center justify-center bg-[#4a0e2e]/30 shadow-[0_0_15px_rgba(74,14,46,0.4)]">
              <SlidersHorizontal className="w-4 h-4 text-[#c5a059]" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] font-sans text-[#c5a059]">Personalization Engine</div>
              <h3 className="font-serif-lux text-2xl sm:text-3xl font-light italic text-[#f5f2ed]">
                Taste &amp; Health Profile
              </h3>
              <p className="text-xs text-[#f5f2ed]/60 font-sans">
                Explains why Cherish recommends dishes tailored to you
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl glass border border-white/10 text-[#f5f2ed]/60 hover:text-[#f5f2ed] hover:border-[#c5a059]/50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gold hairline accent */}
        <div className="h-[1px] w-full bg-[#c5a059] opacity-30 my-1"></div>

        {/* User Priorities (Health, Calories, Protein, etc.) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase font-sans tracking-[0.25em] text-[#c5a059]">
              What You Prioritize
            </label>
            <span className="text-[10px] text-[#f5f2ed]/50">Select 1 or more</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {priorityOptions.map(p => {
              const isSelected = currentPriorities.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => togglePriority(p.id)}
                  className={`p-3 rounded-xl glass border text-left text-xs font-sans flex items-start justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#c5a059] bg-[#4a0e2e]/40 text-[#f5f2ed] glow'
                      : 'border-white/10 text-[#f5f2ed]/70 hover:bg-white/5 hover:border-[#c5a059]/40'
                  }`}
                >
                  <div>
                    <div className="font-medium text-[#f5f2ed]">{p.label}</div>
                    <div className="text-[10px] text-[#f5f2ed]/50 font-sans mt-0.5">{p.desc}</div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="space-y-2.5">
          <label className="text-[10px] uppercase font-sans tracking-[0.25em] text-[#c5a059]">
            Primary Dietary Restriction
          </label>
          <div className="space-y-1.5">
            {dietOptions.map(option => (
              <button
                key={option}
                onClick={() => onUpdateProfile({ ...userProfile, diet: option })}
                className={`w-full p-3 rounded-xl glass border text-left text-xs font-sans flex items-center justify-between transition-all cursor-pointer ${
                  userProfile.diet === option
                    ? 'border-[#c5a059] bg-white/10 text-[#f5f2ed] glow'
                    : 'border-white/10 text-[#f5f2ed]/70 hover:bg-white/5 hover:border-[#c5a059]/40'
                }`}
              >
                <span>{option}</span>
                {userProfile.diet === option && (
                  <Check className="w-4 h-4 text-[#c5a059]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Preference */}
        <div className="space-y-2.5">
          <label className="text-[10px] uppercase font-sans tracking-[0.25em] text-[#c5a059]">
            Hawker Budget Range
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {budgetOptions.map(b => (
              <button
                key={b.value}
                onClick={() => onUpdateProfile({ ...userProfile, budgetTier: b.value })}
                className={`p-3 rounded-xl glass border text-left text-xs font-sans flex items-center justify-between transition-all cursor-pointer ${
                  userProfile.budgetTier === b.value
                    ? 'border-[#c5a059] bg-white/10 text-[#f5f2ed] glow'
                    : 'border-white/10 text-[#f5f2ed]/70 hover:bg-white/5 hover:border-[#c5a059]/40'
                }`}
              >
                <span>{b.label}</span>
                {userProfile.budgetTier === b.value && (
                  <Check className="w-4 h-4 text-[#c5a059]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl glass bg-white/10 hover:bg-white/15 border border-[#c5a059] text-xs font-sans uppercase tracking-wider text-[#f5f2ed] glow hover:border-[#f5f2ed] active:scale-98 transition-all cursor-pointer"
          >
            Apply Preferences
          </button>
        </div>

      </div>
    </div>
  );
};
