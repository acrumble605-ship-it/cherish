import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, SlidersHorizontal, Check, Footprints, Car, Train, UtensilsCrossed, Store, Coffee } from 'lucide-react';

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

  const [activeSubTab, setActiveSubTab] = useState<'transit' | 'diet' | 'priorities'>('transit');

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
    { label: '$$ ($7.00 - $12.00 SGD)', value: '$$' },
    { label: '$$$ ($12.00 - $20.00 SGD)', value: '$$$' },
    { label: '$$$$ ($20.00 - $30.00+ SGD)', value: '$$$$' }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto font-sans">
      <div className="w-full max-w-lg my-auto rounded-3xl bg-[#17040e] border-2 border-[#c5a059]/40 shadow-[0_25px_70px_rgba(0,0,0,0.95)] p-4 sm:p-6 space-y-4 overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-1 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#c5a059] flex items-center justify-center bg-[#4a0e2e]/40 shadow-[0_0_15px_rgba(74,14,46,0.4)] shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-[#c5a059]" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] font-sans text-[#c5a059]">Personalised Settings</div>
              <h3 className="font-serif-lux text-xl sm:text-2xl font-light italic text-[#f5f2ed] leading-tight">
                Dining &amp; Mobility Profile
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl glass border border-white/10 text-[#f5f2ed]/60 hover:text-[#f5f2ed] hover:border-[#c5a059]/50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex rounded-xl bg-black/40 p-1 border border-white/10 text-xs">
          <button
            onClick={() => setActiveSubTab('transit')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer ${
              activeSubTab === 'transit'
                ? 'bg-[#c5a059] text-black font-semibold shadow'
                : 'text-[#f5f2ed]/60 hover:text-white'
            }`}
          >
            🚗 Transport &amp; Venues
          </button>
          <button
            onClick={() => setActiveSubTab('diet')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer ${
              activeSubTab === 'diet'
                ? 'bg-[#c5a059] text-black font-semibold shadow'
                : 'text-[#f5f2ed]/60 hover:text-white'
            }`}
          >
            🥗 Diet &amp; Budget
          </button>
          <button
            onClick={() => setActiveSubTab('priorities')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer ${
              activeSubTab === 'priorities'
                ? 'bg-[#c5a059] text-black font-semibold shadow'
                : 'text-[#f5f2ed]/60 hover:text-white'
            }`}
          >
            🎯 Priorities
          </button>
        </div>

        {/* TAB 1: TRANSPORT & VENUE PREFERENCES */}
        {activeSubTab === 'transit' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* 1. Transport Mode */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#c5a059] block">
                Preferred Mode of Transport
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'walking', label: 'Walk', desc: '<15 min walk', icon: Footprints },
                  { id: 'public_transport', label: 'Public Transit', desc: 'MRT / Bus', icon: Train },
                  { id: 'driving', label: 'Drive / Grab', desc: 'Car & Parking', icon: Car }
                ].map(t => {
                  const Icon = t.icon;
                  const isSelected = (userProfile.transportPreference || 'walking') === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => onUpdateProfile({ ...userProfile, transportPreference: t.id as any })}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'border-[#c5a059] bg-[#3c0c24] text-[#f5f2ed] shadow-[0_0_15px_rgba(197,160,89,0.3)]'
                          : 'border-white/10 bg-white/5 text-[#f5f2ed]/70 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#c5a059]' : 'text-[#f5f2ed]/60'}`} />
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#c5a059]" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{t.label}</div>
                        <div className="text-[10px] text-[#f5f2ed]/50">{t.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Venue Preference: Cafe vs Hawker vs Restaurant */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#c5a059] block">
                Venue Preference
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cafe', label: 'Cafes', desc: 'Coffee, brunch & chill', icon: Coffee },
                  { id: 'hawker', label: 'Hawkers Only', desc: 'Authentic stalls', icon: UtensilsCrossed },
                  { id: 'restaurant', label: 'Restaurants', desc: 'Air-conditioned dining', icon: Store }
                ].map(v => {
                  const Icon = v.icon;
                  const isSelected = (userProfile.venuePreference || 'cafe') === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => onUpdateProfile({ ...userProfile, venuePreference: v.id as any })}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'border-[#c5a059] bg-[#3c0c24] text-[#f5f2ed] shadow-[0_0_15px_rgba(197,160,89,0.3)]'
                          : 'border-white/10 bg-white/5 text-[#f5f2ed]/70 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#c5a059]' : 'text-[#f5f2ed]/60'}`} />
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#c5a059]" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{v.label}</div>
                        <div className="text-[10px] text-[#f5f2ed]/50">{v.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIETARY RESTRICTIONS & BUDGET */}
        {activeSubTab === 'diet' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Dietary Preferences */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#c5a059] block">
                Primary Dietary Preference
              </label>
              <div className="space-y-1">
                {dietOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => onUpdateProfile({ ...userProfile, diet: option })}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-sans flex items-center justify-between transition-all cursor-pointer ${
                      userProfile.diet === option
                        ? 'border-[#c5a059] bg-[#3c0c24] text-[#f5f2ed] font-medium'
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
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#c5a059] block">
                Budget Range
              </label>
              <div className="grid grid-cols-1 gap-1">
                {budgetOptions.map(b => (
                  <button
                    key={b.value}
                    onClick={() => onUpdateProfile({ ...userProfile, budgetTier: b.value })}
                    className={`p-2.5 rounded-xl border text-left text-xs font-sans flex items-center justify-between transition-all cursor-pointer ${
                      userProfile.budgetTier === b.value
                        ? 'border-[#c5a059] bg-[#3c0c24] text-[#f5f2ed] font-medium'
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
          </div>
        )}

        {/* TAB 3: USER PRIORITIES */}
        {activeSubTab === 'priorities' && (
          <div className="space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#c5a059]">
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
                    className={`p-2.5 sm:p-3 rounded-xl border text-left text-xs font-sans flex items-start justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#c5a059] bg-[#3c0c24] text-[#f5f2ed]'
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
        )}

        {/* Save button */}
        <div className="pt-2 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#edd49a] via-[#c5a059] to-[#a3792b] text-black text-xs font-bold font-sans uppercase tracking-wider shadow-lg hover:shadow-[0_0_20px_rgba(197,160,89,0.5)] active:scale-98 transition-all cursor-pointer"
          >
            Apply Personalised Settings
          </button>
        </div>

      </div>
    </div>
  );
};
