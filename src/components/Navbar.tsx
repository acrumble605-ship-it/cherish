import React, { useState } from 'react';
import { Sparkles, Users, ChefHat, BookmarkCheck, SlidersHorizontal, Menu, BookOpen, X, MessageSquare, MessageCircle } from 'lucide-react';
import { UserProfile, BankedCraving } from '../types';

interface NavbarProps {
  activeTab: 'solo' | 'community' | 'squads' | 'daily';
  setActiveTab: (tab: 'solo' | 'community' | 'squads' | 'daily') => void;
  bankedCravings?: BankedCraving[];
  onOpenBankedModal: () => void;
  userProfile: UserProfile;
  onOpenProfileModal: () => void;
  onOpenJournalModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  bankedCravings = [],
  onOpenBankedModal,
  userProfile,
  onOpenProfileModal,
  onOpenJournalModal
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const safeBanked = Array.isArray(bankedCravings) ? bankedCravings : [];

  return (
    <>
      {/* Top Header Bar */}
      <header className="border-b border-[#ffffff10] bg-[#1a050d]/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-5xl mx-auto px-3.5 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Brand Identity: Cherish */}
          <div 
            onClick={() => setActiveTab('solo')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
            id="brand-header"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#c5a059] bg-[#4a0e2e]/40 flex items-center justify-center glow transition-all group-hover:border-[#f5f2ed]/80 shrink-0">
              <span className="font-serif-lux text-lg sm:text-xl italic text-[#f5f2ed]">C</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-serif-lux text-xl sm:text-2xl md:text-3xl font-light italic tracking-wider text-[#f5f2ed]">
                  Cherish
                </h1>
                <span className="text-[10px] font-sans px-2 py-0.5 rounded-full glass text-[#c5a059] border border-[#c5a059]/30 flex items-center gap-1">
                  <span>🇸🇬 🍜</span>
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-[#f5f2ed]/50 font-sans tracking-wide">
                Hawker Decisions &bull; Zero Fatigue
              </p>
            </div>
          </div>

          {/* Desktop Navigation Modes (hidden on mobile to prevent squishing) */}
          <nav className="hidden md:flex items-center gap-1 glass p-1.5 rounded-2xl border border-white/[0.08]" id="main-nav-tabs">
            <button
              id="tab-solo"
              onClick={() => setActiveTab('solo')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'solo'
                  ? 'bg-white/10 text-[#f5f2ed] border border-[#c5a059]/40 glow'
                  : 'text-[#f5f2ed]/60 hover:text-[#f5f2ed] hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
              <span className="tracking-wide">Solo 🍱</span>
            </button>

            <button
              id="tab-squads"
              onClick={() => setActiveTab('squads')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'squads'
                  ? 'bg-white/10 text-[#f5f2ed] border border-[#c5a059]/40 glow'
                  : 'text-[#f5f2ed]/60 hover:text-[#f5f2ed] hover:bg-white/5'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#c5a059]" />
              <span className="tracking-wide">Squads 👥</span>
            </button>

            <button
              id="tab-community"
              onClick={() => setActiveTab('community')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'community'
                  ? 'bg-white/10 text-[#f5f2ed] border border-[#c5a059]/40 glow'
                  : 'text-[#f5f2ed]/60 hover:text-[#f5f2ed] hover:bg-white/5'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#c5a059]" />
              <span className="tracking-wide">Honest Bites 🗣️</span>
            </button>

            <button
              id="tab-daily"
              onClick={() => setActiveTab('daily')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'daily'
                  ? 'bg-white/10 text-[#f5f2ed] border border-[#c5a059]/40 glow'
                  : 'text-[#f5f2ed]/60 hover:text-[#f5f2ed] hover:bg-white/5'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#c5a059]" />
              <span className="tracking-wide">Daily 💬</span>
            </button>
          </nav>

          {/* Action Icons: 3-Row Menu Button (Holds the Food Journal) & Quick Badges */}
          <div className="flex items-center gap-2 relative">
            <button
              id="btn-banked-cravings"
              onClick={onOpenBankedModal}
              className="relative hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl glass border border-white/10 hover:border-[#c5a059]/60 text-xs text-[#f5f2ed]/80 hover:text-[#f5f2ed] transition-all cursor-pointer"
              title="Banked Cravings"
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-[#c5a059]" />
              <span className="text-[11px] font-sans">Banked 🔖</span>
              {safeBanked.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#ea580c] text-white text-[9px] font-bold flex items-center justify-center">
                  {safeBanked.length}
                </span>
              )}
            </button>

            <button
              id="btn-profile-settings"
              onClick={onOpenProfileModal}
              className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl glass border border-white/10 hover:border-[#c5a059]/60 text-xs text-[#f5f2ed]/80 hover:text-[#f5f2ed] transition-all cursor-pointer"
              title="Diet Filter"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#c5a059]" />
              <span className="font-sans text-[11px] tracking-wide text-[#f5f2ed]/70 truncate max-w-[80px]">
                {userProfile.diet.split(' ')[0]} 🥗
              </span>
            </button>

            {/* The 3-Row Button (Menu Hamburger holding the Journal) */}
            <button
              id="btn-3-row-menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass border border-white/15 hover:border-[#c5a059] text-xs text-[#f5f2ed] hover:bg-white/10 transition-all cursor-pointer glow shadow-md"
              title="Menu & Journal"
              aria-label="3 row menu"
            >
              <Menu className="w-4 h-4 text-[#c5a059]" />
              <span className="text-xs font-sans font-medium text-[#f5f2ed]">Menu 📖</span>
            </button>

            {/* 3-Row Dropdown Drawer Menu */}
            {isMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs" 
                  onClick={() => setIsMenuOpen(false)} 
                />
                <div 
                  className="absolute right-0 top-12 z-50 w-72 rounded-2xl bg-[#13030b] border-2 border-[#c5a059] p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.98)] space-y-2.5 animate-fadeIn font-sans"
                  id="menu-drawer-popup"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#c5a059]/30">
                    <div className="flex items-center gap-1.5 text-xs text-[#c5a059] font-bold tracking-wide uppercase">
                      <Menu className="w-3.5 h-3.5" />
                      <span>Cherish Menu</span>
                    </div>
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="p-1 rounded-lg text-[#f5f2ed]/60 hover:text-white hover:bg-white/10 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Primary Item: The Food Journal */}
                  <button
                    id="menu-item-journal"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenJournalModal();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-[#280617] border border-[#ea580c] hover:bg-[#380922] text-left transition-all cursor-pointer group shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#ea580c]/30 border border-[#ea580c] flex items-center justify-center text-xl shrink-0">
                        📖
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Food Journal</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-[#ea580c] text-white">📸 Stickers</span>
                        </div>
                        <div className="text-[11px] text-[#f5f2ed]/80 mt-0.5 font-light">
                          Log meals, snap photos &amp; share ✨
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#ea580c] group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                  </button>

                  {/* Secondary Item: Banked Cravings */}
                  <button
                    id="menu-item-banked"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenBankedModal();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#200412] border border-white/15 hover:border-[#c5a059] hover:bg-[#2c071a] text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <BookmarkCheck className="w-4 h-4 text-[#c5a059]" />
                      <div>
                        <div className="text-xs font-medium text-[#f5f2ed]">Banked Cravings 🔖</div>
                        <div className="text-[10px] text-[#f5f2ed]/70">{safeBanked.length} dishes saved from squads</div>
                      </div>
                    </div>
                    <span className="text-xs text-[#c5a059]">&rarr;</span>
                  </button>

                  {/* Tertiary Item: Personalised Customisation (Transport, Venue, Diet, Budget) */}
                  <button
                    id="menu-item-profile"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenProfileModal();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#200412] border border-[#c5a059]/40 hover:border-[#c5a059] hover:bg-[#2c071a] text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <SlidersHorizontal className="w-4 h-4 text-[#c5a059]" />
                      <div>
                        <div className="text-xs font-semibold text-[#edd49a]">Personalisation ⚙️</div>
                        <div className="text-[10px] text-[#f5f2ed]/80">
                          {userProfile.transportPreference === 'driving' ? '🚗 Drive' : userProfile.transportPreference === 'public_transport' ? '🚇 Transit' : '🚶 Walk'} &bull; {userProfile.venuePreference === 'restaurant' ? '🍽️ Restaurant' : userProfile.venuePreference === 'cafe' ? '☕ Cafe' : '🍜 Hawker'} &bull; {userProfile.budgetTier}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-[#c5a059]">&rarr;</span>
                  </button>

                  {/* Quaternary Item: Honest Bites Community (Replaces Daily Chat under menu) */}
                  <button
                    id="menu-item-community"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setActiveTab('community');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#200412] border border-white/15 hover:border-[#c5a059] hover:bg-[#2c071a] text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageCircle className="w-4 h-4 text-[#c5a059]" />
                      <div>
                        <div className="text-xs font-medium text-[#f5f2ed]">Honest Bites 🗣️</div>
                        <div className="text-[10px] text-[#f5f2ed]/70">Community reviews & places to avoid</div>
                      </div>
                    </div>
                    <span className="text-xs text-[#c5a059]">&rarr;</span>
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Solo, Community, Squads, Daily) */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#1a050d]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-[0_-8px_24px_rgba(0,0,0,0.5)]"
        id="mobile-nav-tabs"
      >
        <button
          id="mobile-tab-solo"
          onClick={() => setActiveTab('solo')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer min-h-[46px] ${
            activeTab === 'solo'
              ? 'text-[#f5f2ed] bg-white/10 border border-[#c5a059]/40'
              : 'text-[#f5f2ed]/50 hover:text-[#f5f2ed]'
          }`}
        >
          <Sparkles className={`w-4 h-4 mb-0.5 ${activeTab === 'solo' ? 'text-[#c5a059]' : 'text-[#f5f2ed]/50'}`} />
          <span className="text-[10px] font-sans font-medium tracking-wide">Solo</span>
        </button>

        <button
          id="mobile-tab-squads"
          onClick={() => setActiveTab('squads')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer min-h-[46px] ${
            activeTab === 'squads'
              ? 'text-[#f5f2ed] bg-white/10 border border-[#c5a059]/40'
              : 'text-[#f5f2ed]/50 hover:text-[#f5f2ed]'
          }`}
        >
          <Users className={`w-4 h-4 mb-0.5 ${activeTab === 'squads' ? 'text-[#c5a059]' : 'text-[#f5f2ed]/50'}`} />
          <span className="text-[10px] font-sans font-medium tracking-wide">Squads</span>
        </button>

        <button
          id="mobile-tab-community"
          onClick={() => setActiveTab('community')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer min-h-[46px] ${
            activeTab === 'community'
              ? 'text-[#f5f2ed] bg-white/10 border border-[#c5a059]/40'
              : 'text-[#f5f2ed]/50 hover:text-[#f5f2ed]'
          }`}
        >
          <MessageCircle className={`w-4 h-4 mb-0.5 ${activeTab === 'community' ? 'text-[#c5a059]' : 'text-[#f5f2ed]/50'}`} />
          <span className="text-[10px] font-sans font-medium tracking-wide">Honest Bites</span>
        </button>

        <button
          id="mobile-tab-daily"
          onClick={() => setActiveTab('daily')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer min-h-[46px] ${
            activeTab === 'daily'
              ? 'text-[#f5f2ed] bg-white/10 border border-[#c5a059]/40'
              : 'text-[#f5f2ed]/50 hover:text-[#f5f2ed]'
          }`}
        >
          <MessageSquare className={`w-4 h-4 mb-0.5 ${activeTab === 'daily' ? 'text-[#c5a059]' : 'text-[#f5f2ed]/50'}`} />
          <span className="text-[10px] font-sans font-medium tracking-wide">Daily 💬</span>
        </button>
      </nav>
    </>
  );
};
