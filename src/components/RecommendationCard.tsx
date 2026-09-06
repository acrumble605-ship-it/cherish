import React, { useState } from 'react';
import { 
  KaleRecommendation, 
  RejectionReason 
} from '../types';
import { 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  DollarSign, 
  Utensils,
  ExternalLink
} from 'lucide-react';
import { getGoogleMapsUrl } from '../data/hawkerData';

interface RecommendationCardProps {
  recommendation: KaleRecommendation;
  onAccept: (recommendation: KaleRecommendation) => void;
  onRejectAndRefine: (reason: RejectionReason) => void;
  onSwitchToFastLane: () => void;
  onResetToNewMystery: () => void;
  isLoading: boolean;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onAccept,
  onRejectAndRefine,
  onSwitchToFastLane,
  onResetToNewMystery,
  isLoading
}) => {
  const [showRejectDrawer, setShowRejectDrawer] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const { option, personalNote, rejectionCount, sourceType } = recommendation;
  const isCapped = rejectionCount >= 3;

  const rejectionReasons: { key: RejectionReason; label: string; sub: string }[] = [
    { key: 'too_heavy', label: 'Too heavy', sub: 'Pivot to ultra-light clean greens' },
    { key: 'had_recently', label: 'Had it recently', sub: 'Explore an alternative cuisine' },
    { key: 'too_far', label: 'Too far or slow', sub: 'Prioritize shortest walking time' },
    { key: 'want_punchier', label: 'Want something punchier', sub: 'Inject spice or bold aromatics' },
    { key: 'not_feeling_it', label: 'Not feeling it', sub: 'Kale will recalibrate intuition' },
  ];

  const handleAcceptClick = () => {
    setAccepted(true);
    onAccept(recommendation);
  };

  const handleReasonClick = (reason: RejectionReason) => {
    setShowRejectDrawer(false);
    onRejectAndRefine(reason);
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-4 px-4" id="recommendation-view">
      
      {/* Top Status Bar: Concierge Pick Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-ping" />
          <span className="text-[10px] uppercase tracking-[0.4em] font-sans text-[#c5a059]">
            Kale Concierge Pick
          </span>
          {sourceType === 'fast_lane' && (
            <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full glass text-[#c5a059] border border-[#c5a059]/30">
              Fast Lane
            </span>
          )}
        </div>

        {/* Rejection indicator bar */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-sans text-[#f5f2ed]/60">
          <span>Rejections:</span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map(dot => (
              <span 
                key={dot}
                className={`w-2 h-2 rounded-full transition-colors ${
                  dot <= rejectionCount ? 'bg-[#c5a059]' : 'border border-white/20 bg-transparent'
                }`}
              />
            ))}
          </div>
          <span className="opacity-60">({rejectionCount}/3)</span>
        </div>
      </div>

      {/* Main Pick Card */}
      <div className="relative rounded-3xl glass bg-white/[0.03] border border-white/15 glow p-6 sm:p-9 overflow-hidden">
        
        {/* Stall & Hawker Location Header */}
        <div className="pb-2">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
            <div>
              <span className="text-[10px] uppercase tracking-[0.35em] font-sans text-[#c5a059] opacity-90">
                {option.cuisine}
              </span>
              <h3 className="font-serif-lux text-3xl sm:text-4xl font-light italic text-[#f5f2ed] tracking-tight mt-1">
                {option.stallName}
              </h3>
            </div>
            
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full glass border border-[#c5a059]/40 text-xs font-sans text-[#c5a059]">
                <DollarSign className="w-3 h-3 text-[#c5a059]" />
                {option.priceRange}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-y-2.5 gap-x-3 text-xs font-sans">
            {/* Interactive Google Maps Link with Live Navigation Route */}
            <a
              href={recommendation.travelEstimate?.googleMapsUrl || getGoogleMapsUrl(option)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border border-[#c5a059]/40 bg-[#4a0e2e]/25 text-[#f5f2ed] hover:text-[#c5a059] hover:border-[#c5a059] transition-all group/map cursor-pointer shadow-sm"
              id="recommendation-google-maps-link"
              title="Open turn-by-turn route in Google Maps"
            >
              <MapPin className="w-3.5 h-3.5 text-[#c5a059] shrink-0 group-hover/map:scale-110 transition-transform" />
              <span className="font-medium underline underline-offset-2 decoration-[#c5a059]/40 group-hover/map:decoration-[#c5a059]">
                {option.location}
              </span>
              <ExternalLink className="w-3 h-3 text-[#c5a059]/70 group-hover/map:text-[#c5a059] shrink-0" />
            </a>

            <div className="flex items-center gap-1.5 text-[#f5f2ed]/80 px-2 py-1 rounded-lg glass border border-white/10">
              <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
              <span className="font-medium text-[#c5a059]">
                {recommendation.travelEstimate ? recommendation.travelEstimate.durationDisplay : `~${option.walkTimeMinutes} min walk`}
              </span>
              <span className="text-[#f5f2ed]/50">&bull;</span>
              <span className="text-[#f5f2ed]/70">
                {recommendation.travelEstimate ? recommendation.travelEstimate.distanceDisplay : 'near CBD'}
              </span>
            </div>
          </div>

          {recommendation.travelEstimate?.routeTip && (
            <div className="mt-2 text-[11px] text-[#f5f2ed]/70 font-sans flex items-center gap-1.5">
              <span>{recommendation.travelEstimate.routeTip}</span>
            </div>
          )}

          {/* Nutrition / Health Badge */}
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass border border-white/10 text-[11px] font-sans text-[#f5f2ed]/80">
              <ShieldCheck className="w-3 h-3 text-[#8ce2ad]" />
              {option.healthScore}
            </span>
          </div>
        </div>

        {/* Visual Image of the Recommended Dish */}
        {option.imageUrl && (
          <div className="relative my-5 rounded-2xl overflow-hidden border border-white/15 bg-[#2d0b1b]/40 shadow-xl group" id="dish-visual-preview">
            <div className="aspect-[16/9] w-full overflow-hidden relative">
              <img
                src={option.imageUrl}
                alt={option.dishHighlights[0] || option.stallName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {/* Subtle gradient vignette scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a050d]/90 via-[#1a050d]/20 to-transparent pointer-events-none" />
              
              {/* Direct Google Maps Direction Pill */}
              <a
                href={getGoogleMapsUrl(option)}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-white/20 bg-black/60 text-[#f5f2ed] hover:bg-[#4a0e2e]/90 hover:border-[#c5a059] text-[11px] font-sans font-medium transition-all backdrop-blur-md shadow-lg z-10"
                title="Open stall in Google Maps"
              >
                <MapPin className="w-3 h-3 text-[#c5a059]" />
                <span>Open in Maps</span>
                <ExternalLink className="w-3 h-3 text-[#f5f2ed]/70" />
              </a>

              {/* Featured Dish Badge */}
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 pointer-events-none">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[#c5a059] flex items-center gap-1 drop-shadow">
                    <Utensils className="w-3 h-3 text-[#c5a059]" />
                    Featured Dish
                  </span>
                  <p className="font-serif-lux text-xl sm:text-2xl text-[#f5f2ed] font-light italic leading-snug drop-shadow-md">
                    {option.dishHighlights[0]}
                  </p>
                </div>
                {option.dishHighlights[1] && (
                  <span className="hidden sm:inline-flex text-[11px] font-sans px-2.5 py-1 rounded-full glass border border-white/20 text-[#f5f2ed]/90 backdrop-blur-md shrink-0">
                    {option.dishHighlights[1]}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hairline gold accent from Immersive UI theme */}
        <div className="h-[1px] w-full bg-[#c5a059] opacity-30 mb-6 mt-2"></div>

        {/* STANDING RULE: PERSONALIZED PRIVATE NOTE & WHY CHOSEN */}
        <div className="mb-6 p-5 sm:p-6 rounded-2xl glass bg-[#4a0e2e]/30 border border-[#c5a059]/50 relative space-y-3.5" id="personalized-private-note">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#c5a059]/20 pb-2.5">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#c5a059]" />
              <span className="text-[10px] uppercase font-sans tracking-[0.3em] text-[#c5a059] font-medium">
                Why Cherish Picked This For You
              </span>
            </div>
            {personalNote.calorieEstimate && (
              <span className="px-2.5 py-0.5 rounded-full glass border border-[#c5a059]/40 bg-[#c5a059]/10 text-xs font-sans text-[#c5a059] font-medium">
                {personalNote.calorieEstimate}
              </span>
            )}
          </div>
          
          <div className="space-y-2.5 text-xs sm:text-sm text-[#f5f2ed]/90 font-sans font-light">
            {/* Priority alignment reason */}
            <div>
              <div className="text-[11px] uppercase tracking-wider text-[#c5a059] font-medium mb-0.5">
                Target Alignment
              </div>
              <p className="leading-relaxed text-[#f5f2ed]">
                {personalNote.priorityAlignment?.details || personalNote.whyFits}
              </p>
            </div>

            {/* Macro Breakdown */}
            {personalNote.macroBreakdown && (
              <div className="p-2.5 rounded-xl glass bg-white/[0.04] border border-white/10 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                <span className="text-[#f5f2ed]/60">Nutrient Split:</span>
                <span className="text-[#8ce2ad] font-medium">🥩 {personalNote.macroBreakdown.protein} Protein</span>
                <span className="text-[#c5a059] font-medium">🌾 {personalNote.macroBreakdown.carbs} Carbs</span>
                <span className="text-[#f5f2ed]/80 font-medium">🥑 {personalNote.macroBreakdown.fats} Fat</span>
              </div>
            )}

            {/* What to order & counter modification */}
            <div className="space-y-1">
              <p className="leading-relaxed">
                <strong className="text-[#c5a059] font-medium">What to order: </strong>
                {personalNote.whatToOrder}
              </p>
              {personalNote.counterModification && (
                <div className="p-2 rounded-lg glass bg-[#2d0b1b]/50 border border-[#c5a059]/30 text-[11px] text-[#f5f2ed]/90">
                  <span className="text-[#c5a059] font-medium">💡 Counter modification: </span>
                  <span>{personalNote.counterModification}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#c5a059]/80 italic pt-1 border-t border-white/5">
              <span>Budget fit: {personalNote.budgetMatch}</span>
              {recommendation.decisionPriority && (
                <span className="text-[10px] text-[#f5f2ed]/40 uppercase tracking-wider not-italic">
                  Weights: {recommendation.decisionPriority}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3RD REJECTION CAP BANNER */}
        {isCapped && (
          <div className="mb-6 p-5 rounded-2xl glass bg-[#4a0e2e]/40 border border-[#c5a059]/60 text-xs text-[#f5f2ed] space-y-2">
            <div className="font-serif-lux italic text-base text-[#c5a059] flex items-center gap-1.5">
              <span>Kale commits:</span>
              <span>&ldquo;Alright, going with this one &mdash; you&apos;ve got to eat sometime!&rdquo;</span>
            </div>
            <p className="text-[11px] text-[#f5f2ed]/70 font-sans">
              We have hit 3 rejections to protect you from decision paralysis. Alternatively, switch to the Fast Lane if you want to type an exact craving.
            </p>
            <button
              onClick={onSwitchToFastLane}
              className="inline-flex items-center gap-1.5 text-xs text-[#c5a059] hover:underline font-sans"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Clearly I&apos;m not reading your mind today &mdash; what are you actually craving?</span>
            </button>
          </div>
        )}

        {/* ACTION BUTTONS: ACCEPT OR REJECT-AND-REFINE */}
        {accepted ? (
          <div className="p-5 rounded-2xl glass bg-white/5 border border-[#8ce2ad]/50 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm font-sans font-medium text-[#8ce2ad]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Choice Sealed &bull; Enjoy your hawker lunch!</span>
            </div>
            <p className="text-xs text-[#f5f2ed]/70 font-sans">
              Decision fatigue avoided. Logged to your mindful dining record.
            </p>
            <button
              onClick={onResetToNewMystery}
              className="mt-2 text-xs text-[#c5a059] underline hover:text-[#f5f2ed] font-sans"
            >
              Start fresh for another meal
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Primary Accept CTA */}
              <button
                id="btn-accept-pick"
                onClick={handleAcceptClick}
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-2xl glass bg-white/10 hover:bg-white/15 border border-[#c5a059] text-[#f5f2ed] font-sans text-xs uppercase tracking-[0.25em] glow shadow-lg hover:border-[#f5f2ed] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#c5a059]" />
                <span>I&apos;m Going Here</span>
              </button>

              {/* Secondary Reject & Refine CTA */}
              <button
                id="btn-reject-refine"
                onClick={() => setShowRejectDrawer(!showRejectDrawer)}
                disabled={isLoading || isCapped}
                className={`w-full py-4 px-6 rounded-2xl glass font-sans text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                  isCapped
                    ? 'opacity-40 cursor-not-allowed border-white/5 text-[#f5f2ed]/30'
                    : 'border border-white/15 hover:border-[#c5a059]/60 text-[#f5f2ed]/80 hover:text-[#f5f2ed] hover:bg-white/5 cursor-pointer'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#c5a059] ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isCapped ? 'Cap Reached' : 'Not Feeling This (Refine)'}</span>
              </button>
            </div>

            {/* REJECT & REFINE LIGHTWEIGHT 1-TAP REASON DRAWER */}
            {showRejectDrawer && !isCapped && (
              <div className="mt-4 p-5 rounded-2xl glass border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-sans text-[#c5a059]">
                    1-Tap Calibration
                  </span>
                  <span className="text-[10px] text-[#f5f2ed]/50 font-sans">Kale recalibrates next pick</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {rejectionReasons.map(r => (
                    <button
                      key={r.key}
                      id={`reason-${r.key}`}
                      onClick={() => handleReasonClick(r.key)}
                      className="text-left p-3 rounded-xl glass border border-white/10 hover:border-[#c5a059]/60 hover:bg-white/5 transition-all group cursor-pointer"
                    >
                      <div className="text-xs font-sans text-[#f5f2ed] group-hover:text-[#c5a059]">
                        {r.label}
                      </div>
                      <div className="text-[10px] text-[#f5f2ed]/50 font-sans">
                        {r.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
