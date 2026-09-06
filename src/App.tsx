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
  UserProfile 
} from './types';
import { KaleService } from './services/kaleService';
import { Navbar } from './components/Navbar';
import { MysteryBoxHero } from './components/MysteryBoxHero';
import { RecommendationCard } from './components/RecommendationCard';
import { SquadView } from './components/SquadView';
import { CookModeView } from './components/CookModeView';
import { BankedCravingsModal } from './components/BankedCravingsModal';
import { ProfileModal } from './components/ProfileModal';
import { Sparkles, HeartHandshake, Compass } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'solo' | 'squads' | 'cook'>('solo');
  const [currentRecommendation, setCurrentRecommendation] = useState<KaleRecommendation | null>(null);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [rejectionCount, setRejectionCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentMood, setCurrentMood] = useState<Mood | undefined>(undefined);
  const [fastLaneActive, setFastLaneActive] = useState<boolean>(false);

  // Initial Banked Cravings
  const [bankedCravings, setBankedCravings] = useState<BankedCraving[]>([
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

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Singapore Gourmet',
    diet: 'Low Carb / High Protein',
    budgetTier: '$',
    totalSavedDollars: 74.50,
    mealsDecidedCount: 18,
    homeCookedCount: 5
  });

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
        userBudget: userProfile.budgetTier
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
        userBudget: userProfile.budgetTier
      });
      setCurrentRecommendation(rec);
    } catch (err) {
      console.error('Failed to get fast lane pick:', err);
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
        userBudget: userProfile.budgetTier
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
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 pb-20 relative z-10">
        
        {/* TAB 1: SOLO FLOW (Mystery Box, Mood Chips, Fast Lane, Locked Recommendation) */}
        {activeTab === 'solo' && (
          <div className="space-y-6">
            {!currentRecommendation ? (
              <MysteryBoxHero
                onSelectMood={handleSelectMood}
                onFastLaneSearch={handleFastLaneSearch}
                isLoading={isLoading}
                bankedCount={bankedCravings.length}
                onOpenBanked={() => setIsBankedModalOpen(true)}
              />
            ) : (
              <div className="space-y-4">
                {/* Back to Home CTA */}
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                  <button
                    onClick={handleResetMystery}
                    className="text-xs text-[#c5a059] hover:text-[#f5f2ed] transition-colors flex items-center gap-1.5"
                  >
                    <span>&larr;</span>
                    <span className="underline underline-offset-4 decoration-[#c5a059]/40">Back to Mystery Box &amp; Moods</span>
                  </button>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#c5a059]/80 font-sans">
                    Decision Concierge Active
                  </span>
                </div>

                <RecommendationCard
                  recommendation={currentRecommendation}
                  onAccept={handleAcceptPick}
                  onRejectAndRefine={handleRejectAndRefine}
                  onSwitchToFastLane={handleSwitchToFastLane}
                  onResetToNewMystery={handleResetMystery}
                  isLoading={isLoading}
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
          />
        )}

        {/* TAB 3: COOK MODE (Lightweight FIFO Expiring Items, Practical Recipes, Savings Tracker) */}
        {activeTab === 'cook' && (
          <CookModeView
            totalSavedDollars={userProfile.totalSavedDollars}
            homeCookedCount={userProfile.homeCookedCount}
            onCookMealLogged={handleLogHomeCookedMeal}
          />
        )}

      </main>

      {/* Footer / Minimalist Status Bar */}
      <footer className="border-t border-[#ffffff10] py-6 bg-[#1a050d]/80 backdrop-blur-md text-[10px] uppercase tracking-[0.35em] text-[#f5f2ed]/40 font-sans z-20">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif-lux lowercase italic text-base tracking-widest text-[#f5f2ed]">cherish</span>
            <span className="text-[#c5a059]">&bull;</span>
            <span className="tracking-[0.25em]">Maison de Cherish &bull; Singapore</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[#c5a059]/80">{userProfile.mealsDecidedCount} Decisions Settled</span>
            <span>&bull;</span>
            <span>Kale Concierge</span>
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

    </div>
  );
}
