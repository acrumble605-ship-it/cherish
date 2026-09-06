import React from 'react';
import { Sparkles, Users, ChefHat, BookmarkCheck, SlidersHorizontal } from 'lucide-react';
import { UserProfile, BankedCraving } from '../types';

interface NavbarProps {
  activeTab: 'solo' | 'squads' | 'cook';
  setActiveTab: (tab: 'solo' | 'squads' | 'cook') => void;
  bankedCravings: BankedCraving[];
  onOpenBankedModal: () => void;
  userProfile: UserProfile;
  onOpenProfileModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  bankedCravings,
  onOpenBankedModal,
  userProfile,
  onOpenProfileModal
}) => {
  return (
    <header className="border-b border-[#ffffff10] bg-[#1a050d]/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* Brand Identity: cherish */}
        <div 
          onClick={() => setActiveTab('solo')}
          className="flex items-center gap-3 cursor-pointer group"
          id="brand-header"
        >
          <div className="w-9 h-9 rounded-full border border-[#c5a059] bg-[#4a0e2e]/40 flex items-center justify-center glow transition-all group-hover:border-[#f5f2ed]/80">
            <span className="font-serif-lux text-xl italic text-[#f5f2ed]">c</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-lux text-2xl sm:text-3xl font-light italic lowercase tracking-wider text-[#f5f2ed]">
                cherish
              </h1>
              <span className="text-[9px] uppercase font-sans tracking-[0.3em] px-2 py-0.5 rounded-full glass text-[#c5a059] border border-[#c5a059]/30">
                Concierge
              </span>
            </div>
            <p className="text-[10px] text-[#f5f2ed]/50 font-sans tracking-wide">
              Singapore Hawker Decisions &bull; Zero Fatigue
            </p>
          </div>
        </div>

        {/* Navigation Modes */}
        <nav className="flex items-center gap-1 glass p-1.5 rounded-2xl border border-white/[0.08]" id="main-nav-tabs">
          <button
            id="tab-solo"
            onClick={() => setActiveTab('solo')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'solo'
                ? 'bg-white/10 text-[#f5f2ed] border border-[#c5a059]/40 glow'
                : 'text-[#f5f2ed]/60 hover:text-[#f5f2ed] hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
            <span className="tracking-wide">Solo Pick</span>
          </button>

          <button
            id="tab-squads"
            onClick={() => setActiveTab('squads')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'squads'
                ? 'bg-white/10 text-[#f5f2ed] border border-[#c5a059]/40 glow'
                : 'text-[#f5f2ed]/60 hover:text-[#f5f2ed] hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#c5a059]" />
            <span className="tracking-wide">Squads</span>
          </button>

          <button
            id="tab-cook"
            onClick={() => setActiveTab('cook')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'cook'
                ? 'bg-white/10 text-[#f5f2ed] border border-[#c5a059]/40 glow'
                : 'text-[#f5f2ed]/60 hover:text-[#f5f2ed] hover:bg-white/5'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5 text-[#c5a059]" />
            <span className="tracking-wide">Cook Mode</span>
          </button>
        </nav>

        {/* Secondary Actions: Banked Cravings & Profile */}
        <div className="flex items-center gap-2.5">
          <button
            id="btn-banked-cravings"
            onClick={onOpenBankedModal}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl glass border border-white/10 hover:border-[#c5a059]/60 text-xs text-[#f5f2ed]/80 hover:text-[#f5f2ed] transition-all"
            title="View your banked cravings"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-[#c5a059]" />
            <span className="hidden md:inline uppercase tracking-wider text-[11px] font-sans">Banked</span>
            {bankedCravings.length > 0 && (
              <span className="w-4.5 h-4.5 rounded-full bg-[#4a0e2e] text-[#f5f2ed] text-[10px] font-bold flex items-center justify-center border border-[#c5a059]/60">
                {bankedCravings.length}
              </span>
            )}
          </button>

          <button
            id="btn-profile-settings"
            onClick={onOpenProfileModal}
            className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-white/10 hover:border-[#c5a059]/60 text-xs text-[#f5f2ed]/80 hover:text-[#f5f2ed] transition-all"
            title="Edit diet & budget filters"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#c5a059]" />
            <span className="hidden sm:inline font-sans text-[11px] tracking-wide text-[#f5f2ed]/70">
              {userProfile.diet.split(',')[0]}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
