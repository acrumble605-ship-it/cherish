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
  Sparkle
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
  currentLocation: UserLocation;
  setCurrentLocation: (loc: UserLocation) => void;
  transportMode: TransportMode;
  setTransportMode: (mode: TransportMode) => void;
  onDetectGPS: () => void;
  isLocating?: boolean;
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
  isLocating = false
}) => {
  // State 1 vs State 2: 'pending' (waiting on group) vs 'settled' (where we are eating + what to get)
  const [decisionState, setDecisionState] = useState<'pending' | 'settled'>('pending');
  
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
    return calculateTravelEstimate(currentLocation, settledVenue, transportMode);
  }, [currentLocation, settledVenue, transportMode]);

  // Retrieve private in-venue dish order crafted for the user at that EXACT hawker location with priority awareness
  const inVenueOrder = useMemo(() => {
    return getInVenueRecommendation(settledVenue, privateCraving, userDiet, userBudget, userPriorities);
  }, [settledVenue, privateCraving, userDiet, userBudget, userPriorities]);

  // Handle GPS location detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
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
        setCurrentLocation(closest);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 5000 }
    );
  };

  // User taps a private craving chip
  const handleSelectPrivateCraving = (mood: Mood) => {
    setPrivateCraving(mood);
    setHasSubmittedMood(true);
  };

  // Group settles on a pick (triggered or resolved)
  const handleSettleGroupDecision = () => {
    // Determine the optimal hawker centre based on user location and transport mode:
    // When walking, prioritize nearby centres (< 1000m)
    let candidates = [...SINGAPORE_HAWKER_DATABASE];
    if (transportMode === 'walking') {
      const nearVenues = candidates.filter(v => {
        const est = calculateTravelEstimate(currentLocation, v, 'walking');
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
    <div className="w-full max-w-3xl mx-auto py-6 px-4 space-y-7" id="squad-screen-root">
      
      {/* =========================================================================
          SQUAD HEADER & CONCIERGE IDENTITY
          Refined dark theme with burnt-orange & gold highlights
          ========================================================================= */}
      <div className="rounded-3xl glass bg-[#2d0b1b]/35 border border-white/10 p-6 sm:p-7 glow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ea580c]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ea580c] animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.35em] font-sans text-[#ea580c] font-medium">
                Cherish Concierge &bull; Squad Decision
              </span>
            </div>
            <h2 className="font-serif-lux text-3xl sm:text-4xl font-light italic text-[#f5f2ed] tracking-tight">
              CBD Lunch Collective
            </h2>
            <p className="text-xs text-[#f5f2ed]/60 font-sans tracking-wide mt-1">
              Private single-person consensus &bull; Zero awkward coordination.
            </p>
          </div>

          {/* Simple Group Status Pill */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl glass bg-white/[0.04] border border-white/10 shrink-0">
            <Clock className="w-4 h-4 text-[#ea580c]" />
            <div className="text-right font-sans">
              <div className="text-[9px] text-[#ea580c] uppercase tracking-[0.2em] font-medium">
                {decisionState === 'pending' ? 'Decision Window' : 'Status'}
              </div>
              <div className="text-xs font-light text-[#f5f2ed]">
                {decisionState === 'pending' ? 'Active &bull; Closes in 18m' : 'Consensus Settled'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          LOCATION & TRANSPORT MODE CONTEXT
          Considers walking vs driving and user's current Singapore hub
          ========================================================================= */}
      <div className="rounded-2xl glass bg-white/[0.02] border border-white/10 p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
          
          {/* User Starting Location */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#ea580c] shrink-0" />
            <span className="text-[10px] uppercase tracking-wider text-[#f5f2ed]/60">Starting Point:</span>
            <div className="relative inline-block">
              <select
                id="select-user-location"
                value={currentLocation.id}
                onChange={(e) => {
                  const found = POPULAR_SINGAPORE_LOCATIONS.find(l => l.id === e.target.value);
                  if (found) setCurrentLocation(found);
                }}
                className="bg-[#2d0b1b] border border-white/20 text-[#f5f2ed] text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#ea580c] font-sans appearance-none pr-7 cursor-pointer"
              >
                {POPULAR_SINGAPORE_LOCATIONS.map(loc => (
                  <option key={loc.id} value={loc.id} className="bg-[#1a050d] text-[#f5f2ed]">
                    {loc.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#ea580c]">
                <ChevronRight className="w-3.5 h-3.5 rotate-90" />
              </div>
            </div>

            <button
              onClick={handleDetectGPS}
              disabled={isLocating}
              title="Detect nearest Singapore lunch hub"
              className="p-1.5 rounded-lg glass border border-white/10 hover:border-[#ea580c]/60 text-[#f5f2ed]/70 hover:text-[#ea580c] transition-colors"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-[#ea580c]' : ''}`} />
            </button>
          </div>

          {/* Transport Mode Toggle: Walking vs Driving */}
          <div className="flex items-center gap-1.5 glass bg-black/30 p-1 rounded-xl border border-white/10">
            <button
              id="btn-mode-walking"
              onClick={() => setTransportMode('walking')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-sans transition-all cursor-pointer ${
                transportMode === 'walking'
                  ? 'bg-[#ea580c] text-white shadow-sm font-medium'
                  : 'text-[#f5f2ed]/60 hover:text-[#f5f2ed]'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Walking</span>
            </button>

            <button
              id="btn-mode-driving"
              onClick={() => setTransportMode('driving')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-sans transition-all cursor-pointer ${
                transportMode === 'driving'
                  ? 'bg-[#ea580c] text-white shadow-sm font-medium'
                  : 'text-[#f5f2ed]/60 hover:text-[#f5f2ed]'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Driving / Grab</span>
            </button>
          </div>

        </div>

        {/* Dynamic Route Context Note */}
        <div className="text-[11px] font-sans text-[#f5f2ed]/65 flex items-center gap-2 pt-1 border-t border-white/5">
          <Info className="w-3.5 h-3.5 text-[#ea580c] shrink-0" />
          <span>
            {transportMode === 'walking' 
              ? `Walking radius calibrated from ${currentLocation.shortName} &bull; Sheltered MRT walkways prioritized`
              : `Driving radius calibrated from ${currentLocation.shortName} &bull; Parking garages & URA surface lots mapped`}
          </span>
        </div>
      </div>

      {/* =========================================================================
          STATE 1: WAITING ON THE GROUP (PENDING)
          Single-person POV: User inputs their craving privately with a single tap.
          A clean status indicates that group decision is pending (no names, no other choices).
          ========================================================================= */}
      {decisionState === 'pending' && (
        <div className="space-y-6 animate-fadeIn" id="state-pending">
          
          {/* Private Craving Input Card */}
          <div className="rounded-3xl glass bg-white/[0.03] border border-white/15 p-6 sm:p-8 glow space-y-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 text-[#ea580c] text-xs font-sans mb-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-[0.25em] font-medium">Your Private Input</span>
                </div>
                <h3 className="font-serif-lux text-2xl sm:text-3xl font-light italic text-[#f5f2ed]">
                  What are you craving for lunch today?
                </h3>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-[#f5f2ed]/50 font-sans italic bg-white/5 px-3 py-1.5 rounded-full border border-white/5 self-start sm:self-auto">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8ce2ad]" />
                <span>100% Confidential &bull; Not shown to squad</span>
              </div>
            </div>

            {/* Quick Single-Tap Chips (No Form) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" id="private-craving-chips">
              {CRAVING_CHIPS.map(chip => {
                const isSelected = privateCraving === chip.id;
                return (
                  <button
                    key={chip.id}
                    id={`chip-craving-${chip.id}`}
                    onClick={() => handleSelectPrivateCraving(chip.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'glass bg-gradient-to-br from-[#ea580c]/25 to-[#4a0e2e]/40 border-[#ea580c] text-[#f5f2ed] glow shadow-lg ring-1 ring-[#ea580c]/50'
                        : 'glass bg-white/[0.02] border-white/10 text-[#f5f2ed]/70 hover:border-[#ea580c]/50 hover:bg-white/[0.05] hover:text-[#f5f2ed]'
                    }`}
                  >
                    <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${
                      isSelected 
                        ? 'bg-[#ea580c]/30 border-[#ea580c]/50' 
                        : 'bg-white/5 border-white/10'
                    }`}>
                      {chip.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-sans font-medium text-[#f5f2ed]">
                          {chip.label}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#ea580c]" />
                        )}
                      </div>
                      <span className="text-[11px] font-sans text-[#f5f2ed]/50 block mt-0.5 truncate">
                        {chip.sublabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Private Preference Summary Strip */}
            <div className="p-3.5 rounded-xl glass bg-[#4a0e2e]/25 border border-[#ea580c]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-sans">
              <div className="flex items-center gap-2 text-[#f5f2ed]/80">
                <span className="text-[#ea580c] font-medium">Your Diet Profile:</span>
                <span>{userDiet} &bull; Target {userBudget} tier</span>
              </div>
              <span className="text-[10px] text-[#f5f2ed]/45 italic">
                Cherish Concierge will match this quietly to the final venue
              </span>
            </div>

          </div>

          {/* Simple Group Status Card (No per-member detail, no names, no other people's choices) */}
          <div className="rounded-3xl glass bg-white/[0.02] border border-white/10 p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[#ea580c] font-medium block mb-1">
                  Squad Poll Status
                </span>
                <h4 className="font-serif-lux text-xl sm:text-2xl font-light italic text-[#f5f2ed]">
                  Decision pending &bull; Aggregating lunch consensus
                </h4>
                <p className="text-xs text-[#f5f2ed]/60 font-sans mt-1">
                  Your private craving is locked in. The squad will settle on a single destination shortly.
                </p>
              </div>

              {/* Action Button: Fast-track group pick */}
              <button
                id="btn-fast-track-squad"
                onClick={handleSettleGroupDecision}
                className="px-5 py-3 rounded-2xl glass bg-[#ea580c] hover:bg-[#d94e07] text-white text-xs font-sans uppercase tracking-wider font-medium glow shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Settle Group Decision Now</span>
              </button>
            </div>

            {/* Clean Progress Indicator (No names or leaked choices) */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-[11px] font-sans text-[#f5f2ed]/60">
                <span>Consensus status</span>
                <span className="text-[#ea580c] font-medium">4 of 5 members accounted for</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#ea580c] to-[#f97316] w-[80%] rounded-full" />
              </div>
            </div>

          </div>

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
                  <span className="text-[#f5f2ed]/80">from {currentLocation.shortName}</span>
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
                <span>Open in Maps ({transportMode === 'walking' ? 'Walk' : 'Drive'})</span>
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

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <a
                    href={travelEstimate.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl glass bg-[#ea580c] hover:bg-[#d94e07] text-white text-xs font-sans uppercase tracking-wider font-medium glow shadow-md transition-all text-center cursor-pointer"
                  >
                    Go with Squad
                  </a>

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
