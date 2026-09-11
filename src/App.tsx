/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Mood, 
  RejectionReason, 
  KaleRecommendation, 
  BankedCraving, 
  UserProfile,
  JournalEntry,
  FoodOption
} from './types';
import { KaleService } from './services/kaleService';
import { 
  POPULAR_SINGAPORE_LOCATIONS, 
  UserLocation, 
  TransportMode,
  detectLiveLocation
} from './data/locationService';
import { Navbar } from './components/Navbar';
import { MysteryBoxHero } from './components/MysteryBoxHero';
import { RecommendationCard } from './components/RecommendationCard';
import { SquadView } from './components/SquadView';
import { DailyView } from './components/DailyView';
import { CommunityView } from './components/CommunityView';
import { QuickDecisionWidget } from './components/QuickDecisionWidget';
import { usePersistedState } from './hooks/usePersistedState';
import { BankedCravingsModal } from './components/BankedCravingsModal';
import { ProfileModal } from './components/ProfileModal';
import { FoodJournalModal } from './components/FoodJournalModal';
import { LogMealModal } from './components/LogMealModal';
import { Sparkles, HeartHandshake, Compass } from 'lucide-react';

const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'journal-1',
    dishName: 'Authentic Seafood Laksa',
    stallName: 'Janggut Laksa',
    hawkerCentre: 'Queensway Shopping Centre',
    timestamp: 'Yesterday, 12:45 PM',
    dateIso: new Date(Date.now() - 86400000).toISOString(),
    photoUrl: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600&auto=format&fit=crop&q=80',
    stickers: ['🇸🇬 Shiok!', '🔥 Wok Hei 10/10'],
    rating: 5,
    price: '$5.50',
    calories: '~480 kcal',
    note: 'Thick creamy coconut gravy with generous fresh cockles and sambal punch!',
    spiceLevel: 'Extra Shiok 🌶️🌶️🌶️',
    frameStyle: 'gold',
    source: 'solo'
  },
  {
    id: 'journal-2',
    dishName: 'Charred Wok Hei Hokkien Mee',
    stallName: 'Nam Sing Hokkien Fried Mee',
    hawkerCentre: 'Old Airport Road Food Centre',
    timestamp: '3 days ago, 1:15 PM',
    dateIso: new Date(Date.now() - 3 * 86400000).toISOString(),
    photoUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80',
    stickers: ['🏆 Hawker Legend', '🤤 Cheat Meal'],
    rating: 5,
    price: '$6.00',
    calories: '~520 kcal',
    note: 'Deep prawn stock reduction with crispy pork lardons and fresh cut calamansi.',
    spiceLevel: 'Medium 🌶️🌶️',
    frameStyle: 'neon',
    source: 'squad'
  },
  {
    id: 'journal-3',
    dishName: 'Silken Hainanese Chicken Rice',
    stallName: 'Tian Tian Hainanese Chicken Rice',
    hawkerCentre: 'Maxwell Food Centre',
    timestamp: 'Last week',
    dateIso: new Date(Date.now() - 7 * 86400000).toISOString(),
    photoUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=600&auto=format&fit=crop&q=80',
    stickers: ['✨ Cherish Pick', '🥗 Clean & Lean'],
    rating: 4,
    price: '$5.00',
    calories: '~430 kcal',
    note: 'Aromatic pandan-infused rice with ginger-scallion dipping puree.',
    spiceLevel: 'Mild 🌶️',
    frameStyle: 'clean',
    source: 'solo'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'solo' | 'community' | 'squads' | 'daily'>('solo');
  const [currentRecommendation, setCurrentRecommendation] = useState<KaleRecommendation | null>(null);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [rejectionCount, setRejectionCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentMood, setCurrentMood] = useState<Mood | undefined>(undefined);
  const [fastLaneActive, setFastLaneActive] = useState<boolean>(false);

  // User location and live weather tracking
  const [currentLocation, setCurrentLocation] = useState<UserLocation>(POPULAR_SINGAPORE_LOCATIONS[0]);
  const [transportMode, setTransportMode] = useState<TransportMode>('walking');
  const [venueTypePreference, setVenueTypePreference] = useState<'all' | 'hawker' | 'restaurant' | 'cafe'>('cafe');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [weatherSummary, setWeatherSummary] = useState<string>('⛅ 29°C Pleasant');

  // User Profile
  const [userProfile, setUserProfile] = usePersistedState<UserProfile>('cherish_profile', {
    name: 'Singapore Gourmet',
    diet: 'Low Carb / High Protein',
    budgetTier: '$',
    priorities: ['Health & Longevity', 'Calorie Control (<500 kcal)'],
    totalSavedDollars: 74.50,
    mealsDecidedCount: 18,
    homeCookedCount: 5,
    transportPreference: 'walking',
    venuePreference: 'cafe'
  });

  // Auto-track location & weather on mount
  useEffect(() => {
    setIsLocating(true);
    detectLiveLocation().then(async (loc) => {
      setCurrentLocation(loc);
      setUserProfile(prev => ({
        ...prev,
        lastLat: loc.lat,
        lastLng: loc.lng
      }));
      setIsLocating(false);

      try {
        const res = await fetch(`/api/weather?lat=${loc.lat}&lng=${loc.lng}`);
        const data = await res.json();
        if (data && data.summary) {
          setWeatherSummary(data.summary);
        }
      } catch (err) {
        console.warn('Weather fetch warning:', err);
      }
    });
  }, []);

  // Journal Modal & Log Meal State
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isLogMealOpen, setIsLogMealOpen] = useState(false);
  const [activeLogOption, setActiveLogOption] = useState<FoodOption | null>(null);
  const [activeLogCalorie, setActiveLogCalorie] = useState<string>('~440 kcal');

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem('cherish_journal_entries');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_JOURNAL_ENTRIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('cherish_journal_entries', JSON.stringify(journalEntries));
    } catch (e) {
      console.error(e);
    }
  }, [journalEntries]);

  // Initial Banked Cravings
  const [bankedCravings, setBankedCravings] = usePersistedState<BankedCraving[]>('cherish_banked', [
    {
      id: 'craving-init-1',
      dishOrCraving: 'Spicy Nyonya Seafood Laksa',
      origin: 'group_compromise',
      originDetails: 'Banked during Friday CBD Squad lunch when the squad chose herbal soup',
      savedDate: 'Yesterday',
      fallbackStallName: 'Famous Sungei Road Trishaw Laksa',
      fallbackDish: 'Spicy Nyonya Seafood Laksa'
    }
  ]);

  const [isBankedModalOpen, setIsBankedModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Trigger recommendation from Mood
  const handleSelectMood = async (mood: Mood) => {
    setIsLoading(true);
    setCurrentMood(mood);
    setRejectionCount(0);
    setRejectedIds([]);

    try {
      const rec = await KaleService.getRecommendation({
        mood,
        rejectionCount: 0,
        userDiet: userProfile.diet,
        userBudget: userProfile.budgetTier,
        userPriorities: userProfile.priorities,
        userLocation: currentLocation,
        transportMode: userProfile.transportPreference || transportMode,
        venueTypePreference: userProfile.venuePreference || venueTypePreference,
        lat: userProfile.lastLat,
        lng: userProfile.lastLng,
        weatherSummary: weatherSummary
      });
      setCurrentRecommendation(rec);
    } catch (err) {
      console.error('Failed to get recommendation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger recommendation from Fast Lane
  const handleFastLaneSearch = async (query: string) => {
    setIsLoading(true);
    setRejectionCount(0);
    setRejectedIds([]);
    setFastLaneActive(true);

    try {
      const rec = await KaleService.getRecommendation({
        fastLaneQuery: query,
        rejectionCount: 0,
        userDiet: userProfile.diet,
        userBudget: userProfile.budgetTier,
        userPriorities: userProfile.priorities,
        userLocation: currentLocation,
        transportMode: transportMode,
        venueTypePreference: venueTypePreference,
        lat: userProfile.lastLat,
        lng: userProfile.lastLng
      });
      setCurrentRecommendation(rec);
    } catch (err) {
      console.error('Failed to get fast lane pick:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Fast Lane 2-Choice Deadlock Resolution
  const handleFastLaneDuel = async (choiceA: string, choiceB: string, isCoinFlip = false) => {
    setIsLoading(true);
    setRejectionCount(0);
    setRejectedIds([]);
    setFastLaneActive(true);

    try {
      const rec = await KaleService.resolveDualChoice({
        choiceA,
        choiceB,
        userDiet: userProfile.diet,
        userBudget: userProfile.budgetTier,
        userPriorities: userProfile.priorities,
        userLocation: currentLocation,
        transportMode: transportMode,
        isCoinFlip,
        venueTypePreference: venueTypePreference
      });
      setCurrentRecommendation(rec);
    } catch (err) {
      console.error('Failed to resolve 2-choice duel:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reject and refine loop (capped at 3)
  const handleRejectAndRefine = async (reason: RejectionReason) => {
    if (!currentRecommendation) return;
    
    const newCount = rejectionCount + 1;
    const newRejected = [...rejectedIds, currentRecommendation.option.id];
    setRejectionCount(newCount);
    setRejectedIds(newRejected);
    setIsLoading(true);

    try {
      const rec = await KaleService.getRecommendation({
        mood: currentMood,
        previousRejectedIds: newRejected,
        lastRejectionReason: reason,
        rejectionCount: newCount,
        userDiet: userProfile.diet,
        userBudget: userProfile.budgetTier,
        userPriorities: userProfile.priorities,
        userLocation: currentLocation,
        transportMode: userProfile.transportPreference || transportMode,
        venueTypePreference: userProfile.venuePreference || venueTypePreference,
        lat: userProfile.lastLat,
        lng: userProfile.lastLng
      });
      setCurrentRecommendation(rec);
    } catch (err) {
      console.error('Failed to refine pick:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Accept pick
  const handleAcceptPick = (rec: KaleRecommendation) => {
    setUserProfile(prev => ({
      ...prev,
      mealsDecidedCount: prev.mealsDecidedCount + 1
    }));
  };

  // Switch to fast lane after cap
  const handleSwitchToFastLane = () => {
    setCurrentRecommendation(null);
    setFastLaneActive(true);
  };

  // Reset to brand new mystery box
  const handleResetMystery = () => {
    setCurrentRecommendation(null);
    setRejectionCount(0);
    setRejectedIds([]);
    setCurrentMood(undefined);
  };

  // Bank a craving (from squad flow)
  const handleBankCraving = (craving: BankedCraving) => {
    setBankedCravings(prev => [craving, ...prev]);
  };

  const handleRemoveBankedCraving = (id: string) => {
    setBankedCravings(prev => prev.filter(c => c.id !== id));
  };

  const handleFulfillBankedCraving = (cravingText: string) => {
    setActiveTab('solo');
    handleFastLaneSearch(cravingText);
  };

  const handleLogHomeCookedMeal = (savings: number) => {
    setUserProfile(prev => ({
      ...prev,
      totalSavedDollars: prev.totalSavedDollars + savings,
      homeCookedCount: prev.homeCookedCount + 1
    }));
  };

  const handleOpenLogMeal = (option?: FoodOption | null, calorie?: string) => {
    setActiveLogOption(option || null);
    setActiveLogCalorie(calorie || '~440 kcal');
    setIsLogMealOpen(true);
  };

  const handleSaveJournalEntry = (entry: JournalEntry) => {
    setJournalEntries(prev => [entry, ...(prev || [])]);
    setIsLogMealOpen(false);
    setIsJournalOpen(true);
  };

  const handleDeleteJournalEntry = (id: string) => {
    setJournalEntries(prev => (prev || []).filter(e => e.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#1a050d] text-[#f5f2ed] flex flex-col relative overflow-x-hidden atmosphere selection:bg-[#4a0e2e] selection:text-[#f5f2ed]">
      {/* Immersive UI ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4a0e2e] rounded-full blur-[100px] opacity-30 pointer-events-none -z-10" />
      <div className="absolute top-2/3 right-1/5 w-80 h-80 bg-[#2d0b1b] rounded-full blur-[120px] opacity-25 pointer-events-none -z-10" />
      
      {/* Cherish Luxurious Brand Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bankedCravings={bankedCravings}
        onOpenBankedModal={() => setIsBankedModalOpen(true)}
        userProfile={userProfile}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenJournalModal={() => setIsJournalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-28 md:pb-16 relative z-10">
        
        {/* TAB 1: SOLO FLOW (Uncluttered Mood Flow, Anticipation Arrow Down, Locked Recommendation) */}
        {activeTab === 'solo' && (
          <div className="space-y-6">
            {!currentRecommendation ? (
              <MysteryBoxHero
                onSelectMood={handleSelectMood}
                isLoading={isLoading}
                bankedCount={(bankedCravings || []).length}
                onOpenBanked={() => setIsBankedModalOpen(true)}
                onOpenPersonalisation={() => setIsProfileModalOpen(true)}
                currentLocationName={currentLocation.shortName || currentLocation.name}
                weatherSummary={weatherSummary}
                userProfile={userProfile}
              />
            ) : (
              <div className="space-y-4">
                {/* Minimalist Back CTA */}
                <div className="max-w-2xl mx-auto flex items-center justify-start">
                  <button
                    id="btn-back-mystery"
                    onClick={handleResetMystery}
                    className="text-xs text-[#c5a059] hover:text-[#f5f2ed] transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#240715] border border-white/10 hover:border-[#c5a059] font-sans cursor-pointer shadow-sm active:scale-95"
                  >
                    <span>👈 🎁</span>
                    <span className="font-medium">Change Mood &bull; Back to Pick</span>
                  </button>
                </div>

                <RecommendationCard
                  recommendation={currentRecommendation}
                  onAccept={handleAcceptPick}
                  onRejectAndRefine={handleRejectAndRefine}
                  onSwitchToFastLane={handleSwitchToFastLane}
                  onResetToNewMystery={handleResetMystery}
                  isLoading={isLoading}
                  onOpenLogMeal={() => handleOpenLogMeal(currentRecommendation.option, currentRecommendation.option.calorieEstimate)}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SQUADS (Single-Person POV, Private Craving, Location & In-Venue Payoff) */}
        {activeTab === 'squads' && (
          <SquadView
            onBankCraving={handleBankCraving}
            onOpenSoloWithFallback={(fallbackDish) => {
              setActiveTab('solo');
              handleFastLaneSearch(fallbackDish);
            }}
            userDiet={userProfile.diet}
            userBudget={userProfile.budgetTier}
            userPriorities={userProfile.priorities}
            currentLocation={currentLocation}
            setCurrentLocation={setCurrentLocation}
            transportMode={transportMode}
            setTransportMode={setTransportMode}
            isLocating={isLocating}
            onOpenLogMeal={() => handleOpenLogMeal(null, '~450 kcal')}
          />
        )}

        {/* TAB 3: HONEST BITES (Social Platform - Recommendations & Places to Avoid) */}
        {activeTab === 'community' && (
          <CommunityView
            userProfile={userProfile}
            onBankCraving={(option) => {
              handleBankCraving({
                id: `craving-${Date.now()}`,
                dishOrCraving: option.dishHighlights[0] || option.stallName,
                origin: 'solo_saved',
                originDetails: `Banked from Honest Bites review (${option.stallName})`,
                savedDate: 'Today',
                fallbackStallName: option.stallName,
                fallbackDish: option.dishHighlights[0] || option.stallName
              });
              setIsBankedModalOpen(true);
            }}
          />
        )}

        {/* TAB 3: DAILY DECISIONS (General everyday dilemmas, 2-Choice Duel, Chat Concierge) */}
        {activeTab === 'daily' && (
          <DailyView />
        )}

      </main>

      {/* Footer / Minimalist Status Bar */}
      <footer className="border-t border-[#ffffff10] py-6 mb-16 md:mb-0 bg-[#1a050d]/80 backdrop-blur-md text-[10px] uppercase tracking-[0.35em] text-[#f5f2ed]/40 font-sans z-20">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif-lux italic text-base tracking-widest text-[#f5f2ed]">Cherish</span>
            <span className="text-[#c5a059]">&bull;</span>
            <span className="tracking-[0.25em]">Maison de Cherish &bull; Singapore</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[#c5a059]/80">{userProfile.mealsDecidedCount} Decisions Settled</span>
            <span>&bull;</span>
            <span>Zero Fatigue</span>
          </div>
        </div>
      </footer>

      {/* Banked Cravings Vault Modal */}
      <BankedCravingsModal
        isOpen={isBankedModalOpen}
        onClose={() => setIsBankedModalOpen(false)}
        bankedCravings={bankedCravings}
        onSelectCravingForSolo={handleFulfillBankedCraving}
        onRemoveCraving={handleRemoveBankedCraving}
      />

      {/* Dietary & Budget Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={setUserProfile}
      />

      {/* Food Journal Modal (View Past Meals & Stats) */}
      <FoodJournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        entries={journalEntries}
        onDeleteEntry={handleDeleteJournalEntry}
        onOpenLogModal={() => {
          setIsJournalOpen(false);
          handleOpenLogMeal(currentRecommendation ? currentRecommendation.option : null);
        }}
      />

      {/* Log Meal & Social Media Photo Decorator Modal */}
      <LogMealModal
        isOpen={isLogMealOpen}
        onClose={() => setIsLogMealOpen(false)}
        onSaveEntry={handleSaveJournalEntry}
        initialOption={activeLogOption}
        calorieEstimate={activeLogCalorie}
      />

    </div>
  );
}
