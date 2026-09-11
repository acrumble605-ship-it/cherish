import React, { useState, useMemo } from 'react';
import { 
  Mood, 
  BankedCraving,
  FoodOption
} from '../types';
import { 
  Clock, 
  Sparkles, 
  Lock, 
  BookmarkCheck, 
  MapPin, 
  ExternalLink,
  Navigation,
  Utensils,
  Car,
  Footprints,
  RotateCcw,
  CheckCircle2,
  Info,
  ChevronRight,
  ShieldCheck,
  Flame,
  Soup,
  Leaf,
  Layers,
  Sparkle,
  Zap
} from 'lucide-react';
import { SINGAPORE_HAWKER_DATABASE } from '../data/hawkerData';
import { 
  POPULAR_SINGAPORE_LOCATIONS, 
  UserLocation, 
  TransportMode, 
  calculateTravelEstimate, 
  getInVenueRecommendation 
} from '../data/locationService';

interface SquadViewProps {
  onBankCraving: (craving: BankedCraving) => void;
  onOpenSoloWithFallback?: (dish: string) => void;
  userDiet?: string;
  userBudget?: string;
  userPriorities?: string[];
  currentLocation?: UserLocation;
  setCurrentLocation?: (loc: UserLocation) => void;
  transportMode?: TransportMode;
  setTransportMode?: (mode: TransportMode) => void;
  onDetectGPS?: () => void;
  isLocating?: boolean;
  onOpenLogMeal?: () => void;
}

interface CravingChipOption {
  id: Mood;
  label: string;
  sublabel: string;
  defaultDish: string;
  icon: React.ReactNode;
}

const CRAVING_CHIPS: CravingChipOption[] = [
  {
    id: 'light',
    label: 'Clean & Light',
    sublabel: 'Clear Broth & Protein',
    defaultDish: 'Double Sliced Mackerel Fish Soup with Bittergourd',
    icon: <Leaf className="w-4 h-4 text-[#8ce2ad]" />
  },
  {
    id: 'comfort',
    label: 'Warm Comfort',
    sublabel: 'Silky Broth & Porridge',
    defaultDish: 'Century Egg & Shredded Chicken Congee',
    icon: <Soup className="w-4 h-4 text-[#f6bd7a]" />
  },
  {
    id: 'spicy',
    label: 'Spicy & Punchy',
    sublabel: 'Fiery Sambal & Spices',
    defaultDish: 'Famous Sungei Road Trishaw Laksa with Crayfish',
    icon: <Flame className="w-4 h-4 text-[#ff7a59]" />
  },
  {
    id: 'something_new',
    label: 'Wok Char & Noodles',
    sublabel: 'Smoky Mee & Char Kway',
    defaultDish: 'Outram Park Charcoal Char Kway Teow with Cockles',
    icon: <Layers className="w-4 h-4 text-[#e28448]" />
  },
  {
    id: 'surprise',
    label: 'Cherish Surprise',
    sublabel: 'Chef-Grade Heritage Gem',
    defaultDish: 'Liao Fan Soya Sauce Chicken Breast & Braised Tofu',
    icon: <Sparkle className="w-4 h-4 text-[#c5a059]" />
  }
];

export const SquadView: React.FC<SquadViewProps> = ({ 
  onBankCraving, 
  onOpenSoloWithFallback,
  userDiet = 'Low Carb / High Protein',
  userBudget = '$',
  userPriorities = ['Health & Longevity', 'Calorie Control (<500 kcal)'],
  currentLocation,
  setCurrentLocation,
  transportMode,
  setTransportMode,
  onDetectGPS,
  isLocating,
  onOpenLogMeal
}) => {
  // State 1 vs State 2: 'pending' (waiting on group) vs 'settled' (where we are eating + what to get)
  const [decisionState, setDecisionState] = useState<'pending' | 'settled'>('pending');

  // Squad Decision Multi-Step Flow: 'pick' -> 'waiting' (leaving user hanging with gambling excitement) -> 'voting_view'
  const [squadPhase, setSquadPhase] = useState<'pick' | 'waiting' | 'voting_view'>('pick');

  // Interactive Craving Slot Machine State (Gambling / Odds Excitement)
  const [isSpinning, setIsSpinning] = useState(false);
  const [slotReels, setSlotReels] = useState<string[]>(['🌶️', '🥟', '🍗']);
  const [slotJackpot, setSlotJackpot] = useState<string | null>(null);
  const [spinCount, setSpinCount] = useState<number>(0);
  const [nudgeStatus, setNudgeStatus] = useState<string | null>(null);
  
  // User location & transport mode (internal fallback if not passed as props)
  const [internalLocation, setInternalLocation] = useState<UserLocation>(POPULAR_SINGAPORE_LOCATIONS[0]);
  const [internalTransportMode, setInternalTransportMode] = useState<TransportMode>('walking');
  const [internalIsLocating, setInternalIsLocating] = useState<boolean>(false);

  const activeLocation = currentLocation || internalLocation;
  const activeTransportMode = transportMode || internalTransportMode;
  const activeIsLocating = isLocating ?? internalIsLocating;

  const updateLocation = (loc: UserLocation) => {
    if (setCurrentLocation) setCurrentLocation(loc);
    setInternalLocation(loc);
  };

  const updateTransportMode = (mode: TransportMode) => {
    if (setTransportMode) setTransportMode(mode);
    setInternalTransportMode(mode);
  };

  // User's private craving selection (single-tap chip, strictly private)
  const [privateCraving, setPrivateCraving] = useState<Mood>('light');
  const [hasSubmittedMood, setHasSubmittedMood] = useState<boolean>(true);
  
  // Settled venue state
  const [settledVenue, setSettledVenue] = useState<FoodOption>(SINGAPORE_HAWKER_DATABASE[0]); // Amoy Street Food Centre
  
  // Post-decision rejection & banking state
  const [showBankModal, setShowBankModal] = useState<boolean>(false);
  const [customSacrificedCraving, setCustomSacrificedCraving] = useState<string>('');
  const [hasPostRejected, setHasPostRejected] = useState(false);
  const [postRejectNotification, setPostRejectNotification] = useState<string | null>(null);

  // Calculate travel estimate dynamically based on current location, venue, and walking/driving
  const travelEstimate = useMemo(() => {
    return calculateTravelEstimate(activeLocation, settledVenue, activeTransportMode);
  }, [activeLocation, settledVenue, activeTransportMode]);

  // Retrieve private in-venue dish order crafted for the user at that EXACT hawker location with priority awareness
  const inVenueOrder = useMemo(() => {
    return getInVenueRecommendation(settledVenue, privateCraving, userDiet, userBudget, userPriorities);
  }, [settledVenue, privateCraving, userDiet, userBudget, userPriorities]);

  // Handle GPS location detection
  const handleDetectGPS = () => {
    if (onDetectGPS) {
      onDetectGPS();
      return;
    }
    if (!navigator.geolocation) return;
    setInternalIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Find closest preset or create dynamic location
        let closest = POPULAR_SINGAPORE_LOCATIONS[0];
        let minDiff = Infinity;
        POPULAR_SINGAPORE_LOCATIONS.forEach(loc => {
          const diff = Math.hypot(loc.lat - latitude, loc.lng - longitude);
          if (diff < minDiff) {
            minDiff = diff;
            closest = loc;
          }
        });
        updateLocation(closest);
        setInternalIsLocating(false);
      },
      () => {
        setInternalIsLocating(false);
      },
      { timeout: 5000 }
    );
  };

  // User taps a private craving chip
  const handleSelectPrivateCraving = (mood: Mood) => {
    setPrivateCraving(mood);
    setHasSubmittedMood(true);
  };

  // Confirm pick and move to waiting phase (leaves user hanging with gambling excitement!)
  const handleConfirmPick = () => {
    setSquadPhase('waiting');
  };

  // Interactive Craving Slot Machine Spin Handler
  const FOOD_ICONS = ['🌶️', '🥟', '🍗', '🍲', '🥗', '☕', '🍜', '🍱'];

  const handleSpinSlots = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSlotJackpot(null);

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setSlotReels([
        FOOD_ICONS[Math.floor(Math.random() * FOOD_ICONS.length)],
        FOOD_ICONS[Math.floor(Math.random() * FOOD_ICONS.length)],
        FOOD_ICONS[Math.floor(Math.random() * FOOD_ICONS.length)]
      ]);

      if (count >= 9) {
        clearInterval(interval);
        setIsSpinning(false);
        setSpinCount(c => c + 1);

        // Calculate thrilling casino payoff
        const isJackpot = Math.random() < 0.45;
        const iconA = FOOD_ICONS[Math.floor(Math.random() * 4)];
        const result = isJackpot 
          ? [iconA, iconA, iconA]
          : [iconA, FOOD_ICONS[Math.floor(Math.random() * FOOD_ICONS.length)], iconA];
        
        setSlotReels(result);

        if (result[0] === result[1] && result[1] === result[2]) {
          setSlotJackpot(`🎰 JACKPOT! 3x ${result[0]}! The food universe commands this craving! (+500 Squad Karma)`);
        } else if (result[0] === result[2]) {
          setSlotJackpot(`🎲 DOUBLE HIT! 2x ${result[0]}! Odds are swinging heavily towards this flavor!`);
        } else {
          setSlotJackpot(`✨ Hot spin! Craving tension dialed up!`);
        }
      }
    }, 85);
  };

  const handleSendNudge = (type: 'hurry' | 'double_down') => {
    if (type === 'hurry') {
      setNudgeStatus('⚡ Sent spicy smoke signal to Sarah & Wei Ming: "Faster pick la, lunch queue getting long!" 🏃');
    } else {
      setNudgeStatus('💰 Doubled down! You added +2 heat tokens to your craving in the squad pool! 🔥');
    }
    setTimeout(() => setNudgeStatus(null), 3500);
  };

  // Group settles on a pick (triggered or resolved)
  const handleSettleGroupDecision = () => {
    // Determine the optimal hawker centre based on user location and transport mode:
    // When walking, prioritize nearby centres (< 1000m)
    let candidates = [...SINGAPORE_HAWKER_DATABASE];
    if (activeTransportMode === 'walking') {
      const nearVenues = candidates.filter(v => {
        const est = calculateTravelEstimate(activeLocation, v, 'walking');
        return est.durationMinutes <= 12;
      });
      if (nearVenues.length > 0) {
        candidates = nearVenues;
      }
    }

    // Match candidate with user's selected craving or general popular consensus
    const matching = candidates.filter(opt => opt.tags.includes(privateCraving));
    const selected = matching.length > 0 ? matching[0] : candidates[0];

    setSettledVenue(selected);
    setDecisionState('settled');
    setHasPostRejected(false);
    setPostRejectNotification(null);
  };

  // Post-decision individual rejection rule:
  // Post-decision individual rejection never reopens the group vote.
  // If the user rejects the settled pick, quietly bank their craving for a future solo suggestion.
  const handlePostReject = () => {
    setHasPostRejected(true);
    
    const banked: BankedCraving = {
      id: `craving-${Date.now()}`,
      dishOrCraving: inVenueOrder.dishName,
      origin: 'group_compromise',
      originDetails: `Saved when squad settled on ${settledVenue.hawkerCentre}`,
      savedDate: 'Today',
      fallbackStallName: inVenueOrder.backupStallName,
      fallbackDish: inVenueOrder.backupDish
    };

    onBankCraving(banked);

    setPostRejectNotification(
      `Your craving for ${inVenueOrder.dishName} has been quietly banked. The squad's decision remains settled. Cherish will surface this for your next solo lunch.`
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-4 px-3 sm:px-4 space-y-5 font-sans" id="squad-screen-root">
      
      {/* SQUAD HEADER & UNIFIED CONTEXT */}
      <div className="rounded-3xl bg-[#200615] border border-[#c5a059]/40 p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#ea580c] animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a059] font-medium">
                Cherish Squad Concierge
              </span>
            </div>
            <h2 className="font-serif-lux text-2xl sm:text-3xl font-light italic text-[#f5f2ed] tracking-tight">
              CBD Lunch Collective
            </h2>
            <p className="text-xs text-[#f5f2ed]/60 tracking-wide mt-0.5">
              Private individual consensus &bull; Zero awkward lunch chats
            </p>
          </div>

          {/* Location & Transport Context Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:self-auto self-stretch">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2b081c] border border-white/10 text-xs">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c5a059] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c5a059]"></span>
              </span>
              <span className="text-[#c5a059] text-[11px] font-medium">
                📍 {activeLocation.shortName || activeLocation.name}
              </span>
            </div>

            <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-[#2b081c] border border-white/10 text-[11px]">
              <button
                onClick={() => updateTransportMode('walking')}
                className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTransportMode === 'walking'
                    ? 'bg-[#c5a059] text-black font-semibold shadow-sm'
                    : 'text-[#f5f2ed]/60 hover:text-white'
                }`}
              >
                🚶 Walk
              </button>
              <button
                onClick={() => updateTransportMode('driving')}
                className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTransportMode === 'driving'
                    ? 'bg-[#c5a059] text-black font-semibold shadow-sm'
                    : 'text-[#f5f2ed]/60 hover:text-white'
                }`}
              >
                🚗 Drive
              </button>
            </div>
          </div>
        </div>

        {/* 1-GLANCE 4-STEP SQUAD PROGRESS STEPPER */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-[#15040d] border border-white/10 text-xs font-medium">
            <button
              id="step-squad-pick"
              onClick={() => { setDecisionState('pending'); setSquadPhase('pick'); }}
              className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                decisionState === 'pending' && squadPhase === 'pick'
                  ? 'bg-gradient-to-r from-[#edd49a] via-[#c5a059] to-[#a3792b] text-black font-semibold shadow-md'
                  : 'text-[#f5f2ed]/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/20 text-[10px] flex items-center justify-center font-bold">1</span>
              <span className="truncate">Your Craving</span>
            </button>

            <button
              id="step-squad-waiting"
              onClick={() => { setDecisionState('pending'); setSquadPhase('waiting'); }}
              className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                decisionState === 'pending' && squadPhase === 'waiting'
                  ? 'bg-gradient-to-r from-[#edd49a] via-[#c5a059] to-[#a3792b] text-black font-semibold shadow-md'
                  : 'text-[#f5f2ed]/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/20 text-[10px] flex items-center justify-center font-bold">2</span>
              <span className="truncate">Squad Odds</span>
            </button>

            <button
              id="step-squad-voting"
              onClick={() => { setDecisionState('pending'); setSquadPhase('voting_view'); }}
              className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                decisionState === 'pending' && squadPhase === 'voting_view'
                  ? 'bg-gradient-to-r from-[#edd49a] via-[#c5a059] to-[#a3792b] text-black font-semibold shadow-md'
                  : 'text-[#f5f2ed]/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/20 text-[10px] flex items-center justify-center font-bold">3</span>
              <span className="truncate">Live Tally</span>
            </button>

            <button
              id="step-squad-settled"
              onClick={handleSettleGroupDecision}
              className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                decisionState === 'settled'
                  ? 'bg-gradient-to-r from-[#edd49a] via-[#c5a059] to-[#a3792b] text-black font-semibold shadow-md'
                  : 'text-[#f5f2ed]/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/20 text-[10px] flex items-center justify-center font-bold">4</span>
              <span className="truncate">Settled Venue</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          STATE 1: WAITING ON THE GROUP (PENDING)
          Multi-Step Flow: 
          1. 'pick': Select and confirm pick
          2. 'waiting': Leaves user hanging with gambling/casino excitement, odds board, slot machine
          3. 'voting_view': Detailed heatmap and tally with settle button
          ========================================================================= */}
      {decisionState === 'pending' && (
        <div className="space-y-6 animate-fadeIn" id="state-pending">
          
          {/* STEP 1: PICK & CONFIRM PICK */}
          {squadPhase === 'pick' && (
            <div className="rounded-3xl bg-[#190510] border border-white/20 p-6 sm:p-8 shadow-2xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-[#c5a059] text-xs font-sans mb-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span className="uppercase tracking-[0.25em] font-medium">Private Pick</span>
                  </div>
                  <h3 className="font-serif-lux text-2xl sm:text-3xl font-light italic text-[#f5f2ed]">
                    Pick Your Craving 🍜
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-[#f5f2ed]/70 font-sans italic bg-[#250717] px-3 py-1.5 rounded-full border border-white/10 self-start sm:self-auto">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8ce2ad]" />
                  <span>Confidential &bull; Not leaked to group</span>
                </div>
              </div>

              {/* Quick Single-Tap Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" id="private-craving-chips">
                {CRAVING_CHIPS.map(chip => {
                  const isSelected = privateCraving === chip.id;
                  return (
                    <button
                      key={chip.id}
                      id={`chip-craving-${chip.id}`}
                      onClick={() => handleSelectPrivateCraving(chip.id)}
                      className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#3b0d24] border-[#c5a059] text-[#f5f2ed] shadow-lg ring-1 ring-[#c5a059]/50'
                          : 'bg-[#250717] border-white/15 text-[#f5f2ed]/80 hover:border-[#c5a059]/60 hover:bg-[#320a20] hover:text-[#f5f2ed]'
                      }`}
                    >
                      <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${
                        isSelected 
                          ? 'bg-[#c5a059]/30 border-[#c5a059]/60' 
                          : 'bg-black/30 border-white/10'
                      }`}>
                        {chip.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-sans font-medium text-[#f5f2ed]">
                            {chip.label}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-[#c5a059]" />
                          )}
                        </div>
                        <span className="text-[11px] font-sans text-[#f5f2ed]/60 block mt-0.5 truncate">
                          {chip.sublabel}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Confirm Pick Action Bar */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#250717] border border-[#c5a059]/40 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                <div>
                  <div className="text-xs text-[#f5f2ed]">
                    Selected Craving: <strong className="text-[#c5a059] font-semibold">{CRAVING_CHIPS.find(c => c.id === privateCraving)?.label}</strong>
                  </div>
                  <div className="text-[10px] text-[#f5f2ed]/60 mt-0.5">
                    Locking this in places your vote into the squad pot.
                  </div>
                </div>

                <button
                  id="btn-confirm-pick"
                  onClick={handleConfirmPick}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#c5a059] hover:bg-[#b58f48] text-black text-xs uppercase tracking-wider font-semibold glow shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confirm Pick &amp; Lock Craving 🔒</span>
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: LEAVE USER HANGING & GAMBLING EXCITEMENT */}
          {squadPhase === 'waiting' && (
            <div className="space-y-5 animate-fadeIn" id="squad-waiting-screen">
              
              {/* Status Header: Leaving user hanging */}
              <div className="rounded-3xl bg-[#1d0513] border border-[#c5a059]/60 p-6 sm:p-8 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-[#c5a059] text-xs font-sans mb-1">
                      <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-ping" />
                      <span className="uppercase tracking-[0.25em] font-medium">Squad Pot In Play</span>
                    </div>
                    <h3 className="font-serif-lux text-2xl sm:text-3xl md:text-4xl font-light italic text-[#f5f2ed]">
                      Waiting for Group Picking... ⏳
                    </h3>
                    <p className="text-xs text-[#f5f2ed]/80 font-sans mt-1">
                      Your craving is locked in! 3 of 5 friends have placed their meal choices. The consensus pot is heating up.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      onClick={() => setSquadPhase('pick')}
                      className="px-3 py-2 rounded-xl bg-[#250717] border border-white/20 hover:border-white/40 text-[11px] text-[#f5f2ed]/70 hover:text-white transition-all font-sans cursor-pointer"
                    >
                      Change Pick ↩️
                    </button>

                    {/* REDIRECT BUTTON TO VIEW GROUP VOTING */}
                    <button
                      id="btn-redirect-view-voting"
                      onClick={() => setSquadPhase('voting_view')}
                      className="px-4 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#b58f48] text-xs text-black font-sans font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg transition-all active:scale-95"
                    >
                      <span>🗳️ View Group Voting</span>
                      <ChevronRight className="w-3.5 h-3.5 text-black" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar of Pending Votes */}
                <div className="space-y-1.5 pt-2 border-t border-white/10 font-sans">
                  <div className="flex items-center justify-between text-xs text-[#f5f2ed]/80">
                    <span>Group Quorum</span>
                    <span className="text-[#c5a059] font-semibold">3 of 5 Locked In (60%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-black/40 overflow-hidden border border-white/10">
                    <div className="h-full bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#c5a059] w-[60%] rounded-full animate-pulse" />
                  </div>
                </div>

                {/* Subtle decision nudge */}
                <div className="pt-1 flex items-center gap-2 text-[11px] text-[#f5f2ed]/70 font-sans">
                  <Zap className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                  <span>Consensus Tip: Locking choices before hunger peaks prevents the group from defaulting to oily fast-food compromises.</span>
                </div>
              </div>

              {/* GAMBLING ELEMENT 1: LIVE CRAVING ODDS & LEANING TOTE BOARD */}
              <div className="rounded-3xl bg-[#190510] border border-white/20 p-5 sm:p-7 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎲</span>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.25em] font-sans text-[#c5a059] font-bold">
                        Live Sportsbook Odds
                      </div>
                      <h4 className="font-serif-lux text-xl sm:text-2xl font-light italic text-[#f5f2ed]">
                        Where the Squad is Leaning 🔥
                      </h4>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-[10px] uppercase tracking-wider font-mono animate-pulse">
                    Live Tote
                  </span>
                </div>

                {/* Leaning Odds Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
                  {/* #1 Hot Favorite */}
                  <div className="p-3.5 rounded-2xl bg-[#3b0d24] border border-[#c5a059] shadow-lg relative overflow-hidden">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#c5a059] text-black">
                        🔥 Heavy Favorite
                      </span>
                      <span className="font-mono text-xs text-[#f5f2ed] font-bold">1.8x Odds</span>
                    </div>
                    <div className="text-base font-semibold text-[#f5f2ed] flex items-center gap-1.5 mt-1">
                      <span>🌶️</span>
                      <span>Spicy Laksa / Mala</span>
                    </div>
                    <div className="text-[11px] text-[#f5f2ed]/70 mt-0.5">
                      54% Squad Consensus Lean
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/40 mt-2.5 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-500 to-[#c5a059] w-[54%]" />
                    </div>
                    <p className="text-[10px] text-[#c5a059] italic mt-2">
                      &bull; 2 lunchmates placed hot bets on fiery sambal!
                    </p>
                  </div>

                  {/* #2 Challenger */}
                  <div className="p-3.5 rounded-2xl bg-[#250717] border border-white/15">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-medium tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/90">
                        📈 Challenger
                      </span>
                      <span className="font-mono text-xs text-[#c5a059] font-bold">3.2x Odds</span>
                    </div>
                    <div className="text-base font-semibold text-[#f5f2ed] flex items-center gap-1.5 mt-1">
                      <span>🥟</span>
                      <span>Wok Char Noodles</span>
                    </div>
                    <div className="text-[11px] text-[#f5f2ed]/70 mt-0.5">
                      32% Squad Consensus Lean
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/40 mt-2.5 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-[#c5a059] w-[32%]" />
                    </div>
                    <p className="text-[10px] text-[#f5f2ed]/60 italic mt-2">
                      &bull; High heat momentum in CBD crowd
                    </p>
                  </div>

                  {/* #3 Underdog */}
                  <div className="p-3.5 rounded-2xl bg-[#250717] border border-white/15">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-medium tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/90">
                        🧊 Underdog
                      </span>
                      <span className="font-mono text-xs text-[#8ce2ad] font-bold">7.2x Odds</span>
                    </div>
                    <div className="text-base font-semibold text-[#f5f2ed] flex items-center gap-1.5 mt-1">
                      <span>🥗</span>
                      <span>Clean Fish Broth</span>
                    </div>
                    <div className="text-[11px] text-[#f5f2ed]/70 mt-0.5">
                      14% Squad Consensus Lean
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/40 mt-2.5 overflow-hidden">
                      <div className="h-full bg-[#8ce2ad] w-[14%]" />
                    </div>
                    <p className="text-[10px] text-[#f5f2ed]/60 italic mt-2">
                      &bull; Dark horse healthy compromise
                    </p>
                  </div>
                </div>

                {/* Live ticker bar */}
                <div className="p-3 rounded-xl bg-[#230716] border border-white/10 flex items-center gap-2 text-xs font-sans text-[#f5f2ed]/80">
                  <Flame className="w-4 h-4 text-[#c5a059] shrink-0 animate-bounce" />
                  <span className="truncate">
                    <strong className="text-[#f5f2ed]">Consensus Forecast:</strong> Squad has an 86% probability of settling near Amoy / Maxwell Food Centre.
                  </span>
                </div>
              </div>

              {/* GAMBLING ELEMENT 2: INTERACTIVE CRAVING SLOT MACHINE */}
              <div className="rounded-3xl bg-gradient-to-br from-[#190510] via-[#28081a] to-[#190510] border border-[#c5a059]/60 p-6 sm:p-7 space-y-4 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎰</span>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.25em] font-sans text-[#c5a059] font-bold">
                        Casino Mini-Game
                      </div>
                      <h4 className="font-serif-lux text-xl sm:text-2xl font-light italic text-[#f5f2ed]">
                        Craving Roulette Slots 🎰
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs font-sans text-[#f5f2ed]/70">
                    Pull the lever while waiting on friends!
                  </span>
                </div>

                {/* 3-Reel Slot Box */}
                <div className="flex items-center justify-center gap-3 sm:gap-6 py-4">
                  {slotReels.map((icon, idx) => (
                    <div
                      key={idx}
                      className={`w-20 sm:w-28 h-24 sm:h-32 rounded-2xl border flex items-center justify-center text-4xl sm:text-5xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] transition-all ${
                        isSpinning 
                          ? 'animate-pulse scale-95 border-amber-400 bg-black/90' 
                          : 'border-[#c5a059]/70 bg-[#16040d]'
                      }`}
                    >
                      <span className={isSpinning ? 'blur-[1px]' : ''}>{icon}</span>
                    </div>
                  ))}
                </div>

                {/* Jackpot / Spin result banner */}
                {slotJackpot && (
                  <div className="p-3 rounded-xl bg-[#c5a059]/20 border border-[#c5a059] text-center text-xs font-sans text-[#f5f2ed] font-medium animate-fadeIn">
                    {slotJackpot}
                  </div>
                )}

                {/* Action Buttons: Spin & Nudge */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 font-sans">
                  <button
                    id="btn-spin-slots"
                    onClick={handleSpinSlots}
                    disabled={isSpinning}
                    className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-[#c5a059] to-[#e28448] text-black font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>🎲 {isSpinning ? 'Spinning Reels... 🎰' : 'Spin Craving Slots 🎰'}</span>
                    {spinCount > 0 && <span className="text-[10px] font-mono bg-black/30 text-white px-2 py-0.5 rounded-full">{spinCount}</span>}
                  </button>

                  <button
                    id="btn-nudge-hurry"
                    onClick={() => handleSendNudge('hurry')}
                    className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-[#250717] border border-white/20 hover:border-[#c5a059] text-xs text-[#f5f2ed] flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-[#340a20]"
                  >
                    <span>⚡ Nudge Slow Friends</span>
                  </button>

                  <button
                    id="btn-double-down"
                    onClick={() => handleSendNudge('double_down')}
                    className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-[#250717] border border-[#c5a059]/50 hover:border-[#c5a059] text-xs text-[#c5a059] flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-[#340a20]"
                  >
                    <span>💰 Double Down My Bet</span>
                  </button>
                </div>

                {nudgeStatus && (
                  <div className="p-2.5 rounded-xl bg-[#c5a059]/20 border border-[#c5a059]/50 text-center text-xs font-sans text-[#f5f2ed] animate-fadeIn">
                    {nudgeStatus}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* STEP 3: VIEW GROUP VOTING SCREEN */}
          {squadPhase === 'voting_view' && (
            <div className="rounded-3xl glass bg-white/[0.03] border border-white/15 p-6 sm:p-8 glow space-y-6 animate-fadeIn" id="squad-voting-view">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-[#c5a059] text-xs font-sans mb-1">
                    <span className="uppercase tracking-[0.25em] font-medium">Consensus Heatmap</span>
                  </div>
                  <h3 className="font-serif-lux text-2xl sm:text-3xl font-light italic text-[#f5f2ed]">
                    Group Voting Heatmap 🗳️
                  </h3>
                  <p className="text-xs text-[#f5f2ed]/60 font-sans mt-0.5">
                    Live tally of current member submissions while awaiting full quorum.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSquadPhase('waiting')}
                    className="px-3.5 py-2 rounded-xl glass border border-white/15 hover:border-white/30 text-xs text-[#f5f2ed]/80 hover:text-white transition-all font-sans cursor-pointer"
                  >
                    &larr; Back to Waiting &amp; Slots 🎰
                  </button>

                  <button
                    id="btn-settle-group-now"
                    onClick={handleSettleGroupDecision}
                    className="px-5 py-2 rounded-xl glass bg-[#ea580c] hover:bg-[#d94e07] text-white text-xs uppercase tracking-wider font-semibold glow shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Settle Consensus Now</span>
                  </button>
                </div>
              </div>

              {/* Anonymous Member Token Status */}
              <div className="space-y-3 font-sans">
                <div className="text-xs uppercase tracking-wider text-[#c5a059] font-medium">
                  Member Pick Status (Anonymous Tokens)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl glass border border-[#ea580c]/50 bg-[#ea580c]/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#ea580c] text-white font-bold flex items-center justify-center text-xs">
                        You
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#f5f2ed]">
                          {CRAVING_CHIPS.find(c => c.id === privateCraving)?.label}
                        </div>
                        <div className="text-[10px] text-[#f5f2ed]/50">Your Confidential Pick</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-medium">
                      Locked In 🔒
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl glass border border-white/10 bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/15 text-white font-bold flex items-center justify-center text-xs">
                        M2
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#f5f2ed]">🌶️ Spicy &amp; Fiery</div>
                        <div className="text-[10px] text-[#f5f2ed]/50">Lunchmate 2</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-medium">
                      Locked In 🔒
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl glass border border-white/10 bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/15 text-white font-bold flex items-center justify-center text-xs">
                        M3
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#f5f2ed]">🥟 Smoky Wok Char</div>
                        <div className="text-[10px] text-[#f5f2ed]/50">Lunchmate 3</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-medium">
                      Locked In 🔒
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl glass border border-white/10 bg-white/[0.01] flex items-center justify-between opacity-70">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 text-white/50 font-bold flex items-center justify-center text-xs">
                        M4
                      </div>
                      <div>
                        <div className="text-xs text-[#f5f2ed]/70">⏳ Deliberating...</div>
                        <div className="text-[10px] text-[#f5f2ed]/40">Lunchmate 4</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-medium animate-pulse">
                      Pending
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl glass border border-white/10 bg-white/[0.01] flex items-center justify-between opacity-70">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 text-white/50 font-bold flex items-center justify-center text-xs">
                        M5
                      </div>
                      <div>
                        <div className="text-xs text-[#f5f2ed]/70">⏳ Deliberating...</div>
                        <div className="text-[10px] text-[#f5f2ed]/40">Lunchmate 5</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-medium animate-pulse">
                      Pending
                    </span>
                  </div>
                </div>
              </div>

              {/* Settle early notice */}
              <div className="p-4 rounded-xl glass bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans text-[#f5f2ed]/70">
                <span>Want to skip waiting for remaining members and settle immediately?</span>
                <button
                  onClick={handleSettleGroupDecision}
                  className="text-xs text-[#c5a059] font-medium underline hover:text-white cursor-pointer"
                >
                  Finalize Consensus Now &rarr;
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* =========================================================================
          STATE 2: HERE'S WHERE WE'RE EATING + WHAT TO GET (SETTLED)
          1. Shows the settled restaurant/hawker clearly (no how it was chosen, no names).
          2. Right below the result: Kale/Cherish Concierge gives ME a private recommendation
             of specific dishes to order at that place, based on my craving/diet/budget.
          ========================================================================= */}
      {decisionState === 'settled' && (
        <div className="space-y-6 animate-fadeIn" id="state-settled">
          
          {/* Main Destination Card */}
          <div className="rounded-3xl glass bg-white/[0.03] border border-white/15 p-6 sm:p-8 glow space-y-5 relative overflow-hidden" id="settled-destination-card">
            
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-[0.35em] font-sans text-[#ea580c] font-medium flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Squad Settled Destination
                </span>
                <h3 className="font-serif-lux text-3xl sm:text-4xl font-light italic text-[#f5f2ed] tracking-tight">
                  {settledVenue.hawkerCentre}
                </h3>
                <p className="text-xs text-[#f5f2ed]/70 font-sans mt-1">
                  {settledVenue.location}
                </p>
              </div>

              {/* Reopen or change input button */}
              <button
                onClick={() => setDecisionState('pending')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border border-white/15 hover:border-white/30 text-xs font-sans text-[#f5f2ed]/70 hover:text-[#f5f2ed] transition-colors cursor-pointer self-start"
                title="Change your private craving and re-evaluate"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Adjust Craving</span>
              </button>
            </div>

            {/* Travel Estimate & Navigation Bar */}
            <div className="p-4 rounded-2xl glass bg-[#2d0b1b]/50 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#ea580c]/20 border border-[#ea580c]/40 text-[#ea580c] font-medium text-[11px]">
                    {travelEstimate.durationDisplay} ({travelEstimate.distanceDisplay})
                  </span>
                  <span className="text-[#f5f2ed]/80">from {activeLocation.shortName}</span>
                </div>
                <p className="text-[11px] text-[#f5f2ed]/60">
                  {travelEstimate.routeTip}
                </p>
              </div>

              {/* Direct Google Maps Directions Pill with walking/driving travelmode */}
              <a
                href={travelEstimate.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass bg-[#ea580c] hover:bg-[#d94e07] text-white font-medium text-xs shadow-md transition-all shrink-0 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Open in Maps ({activeTransportMode === 'walking' ? 'Walk' : 'Drive'})</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

            </div>

            {/* Settled Venue Hero Visual with Direct Maps Overlay */}
            {settledVenue.imageUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/40 shadow-xl group">
                <div className="aspect-[16/9] w-full overflow-hidden relative">
                  <img
                    src={settledVenue.imageUrl}
                    alt={settledVenue.hawkerCentre}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a050d] via-[#1a050d]/30 to-transparent pointer-events-none" />

                  {/* Top-Right Maps Quick Badge */}
                  <a
                    href={travelEstimate.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-white/20 bg-black/70 text-[#f5f2ed] hover:bg-[#ea580c] text-[11px] font-sans font-medium transition-all backdrop-blur-md shadow-lg z-10 cursor-pointer"
                  >
                    <MapPin className="w-3 h-3 text-[#ea580c]" />
                    <span>View Location</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>

                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3 pointer-events-none">
                    <div>
                      <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[#ea580c] font-medium drop-shadow">
                        Signature Specialty
                      </span>
                      <p className="font-serif-lux text-xl sm:text-2xl text-[#f5f2ed] font-light italic leading-snug drop-shadow-md">
                        {settledVenue.dishHighlights[0]}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full glass border border-white/20 bg-black/50 text-xs font-sans text-[#f5f2ed]/90 backdrop-blur-sm">
                      {settledVenue.priceRange}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* =========================================================================
              THE MAIN PAYOFF:
              Right below the result, Cherish Concierge / Kale gives ME a private recommendation
              of specific dishes to order at that place, based on my own craving/diet/budget.
              Guaranteed available at that exact location.
              ========================================================================= */}
          <div 
            className="rounded-3xl glass bg-gradient-to-br from-[#2d0b1b]/80 via-[#1a050d] to-[#4a0e2e]/40 border-2 border-[#ea580c]/50 p-6 sm:p-8 glow shadow-2xl space-y-6 relative"
            id="private-order-payoff"
          >
            {/* Header with Private Lock & Burnt-Orange Glow */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1 text-[#ea580c]">
                  <Lock className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-sans font-medium">
                    Private Recommendation &bull; Exclusively For You
                  </span>
                </div>
                <h4 className="font-serif-lux text-2xl sm:text-3xl font-light italic text-[#f5f2ed]">
                  What to Order at {settledVenue.hawkerCentre}
                </h4>
              </div>

              <div className="text-[11px] font-sans text-[#ea580c] bg-[#ea580c]/10 border border-[#ea580c]/30 px-3 py-1 rounded-full self-start sm:self-auto">
                Tailored to your {userDiet} &bull; {userBudget} tier
              </div>
            </div>

            {/* Exact Recommended Dish Box */}
            <div className="p-5 sm:p-6 rounded-2xl glass bg-white/[0.02] border border-[#ea580c]/30 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-sans text-[#ea580c] font-medium mb-1">
                    <Utensils className="w-3.5 h-3.5" />
                    <span>{inVenueOrder.stallName}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white font-mono">
                      {inVenueOrder.unitNumber}
                    </span>
                  </div>
                  <h5 className="font-serif-lux text-2xl sm:text-3xl font-light italic text-[#f5f2ed] leading-snug">
                    {inVenueOrder.dishName}
                  </h5>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-sans font-medium text-[#ea580c]">
                    {inVenueOrder.price}
                  </div>
                  <div className="text-[10px] font-sans text-[#8ce2ad]">
                    {inVenueOrder.dietMatch}
                  </div>
                </div>
              </div>

              {/* Exact Ordering Phrase */}
              <div className="p-4 rounded-xl glass bg-black/40 border border-white/10 space-y-1.5">
                <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#ea580c] font-medium block">
                  How to order at the counter:
                </span>
                <p className="text-xs sm:text-sm font-sans text-[#f5f2ed] font-mono leading-relaxed bg-white/5 p-2.5 rounded-lg border border-white/5">
                  &ldquo;{inVenueOrder.howToOrder.replace(/^Say:\s*/i, '')}&rdquo;
                </p>
              </div>

              {/* Why This Fits You */}
              <div className="text-xs sm:text-sm font-sans font-light text-[#f5f2ed]/85 leading-relaxed">
                <strong className="text-[#ea580c] font-medium">Why Cherish picked this for you: </strong>
                {inVenueOrder.whyFits}
              </div>

            </div>

            {/* In-Venue Backup Option (If queue is long) */}
            <div className="p-4 rounded-2xl glass bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider text-[#f5f2ed]/50 font-medium">
                  Queue Too Long? Backup Stall in Same Food Centre:
                </span>
                <p className="text-[#f5f2ed] font-medium">
                  {inVenueOrder.backupStallName} ({inVenueOrder.backupUnit}) &bull; {inVenueOrder.backupDish}
                </p>
              </div>
              <span className="text-[10px] text-[#8ce2ad] px-2.5 py-1 rounded-full bg-[#8ce2ad]/10 border border-[#8ce2ad]/30 shrink-0">
                Verified Available Here
              </span>
            </div>

            {/* Decision Actions & Post-Decision Rejection Handling */}
            {!hasPostRejected ? (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
                <div className="text-xs text-[#f5f2ed]/60 font-sans">
                  Ready to go with the squad? Or not feeling this dish today?
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  <a
                    href={travelEstimate.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl glass bg-[#ea580c] hover:bg-[#d94e07] text-white text-xs font-sans uppercase tracking-wider font-medium glow shadow-md transition-all text-center cursor-pointer"
                  >
                    Go with Squad
                  </a>

                  {onOpenLogMeal && (
                    <button
                      onClick={onOpenLogMeal}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl glass bg-[#c5a059] hover:bg-[#b08b45] text-black text-xs font-sans uppercase tracking-wider font-semibold shadow-md transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Log Meal 📸</span>
                    </button>
                  )}

                  <button
                    id="btn-squad-individual-reject"
                    onClick={handlePostReject}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl glass border border-white/15 hover:border-[#ea580c]/60 text-xs font-sans text-[#f5f2ed]/70 hover:text-[#f5f2ed] hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Bank Craving for Solo
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl glass bg-[#4a0e2e]/35 border border-[#ea580c]/50 space-y-2.5 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-sans text-[#ea580c]">
                  <BookmarkCheck className="w-4 h-4 text-[#8ce2ad]" />
                  <span className="uppercase tracking-wider font-medium">Craving Quietly Banked &bull; Squad Vote Intact</span>
                </div>
                <p className="text-xs text-[#f5f2ed]/80 font-sans leading-relaxed">
                  {postRejectNotification}
                </p>
                
                {onOpenSoloWithFallback && (
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs text-[#f5f2ed]/60 font-sans">
                      Want to view a solo alternative right now?
                    </span>
                    <button
                      onClick={() => onOpenSoloWithFallback(inVenueOrder.dishName)}
                      className="inline-flex items-center gap-1 text-xs text-[#ea580c] hover:underline font-sans font-medium"
                    >
                      <span>Explore Solo Recommendation</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
