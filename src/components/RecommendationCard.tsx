import React, { useState } from 'react';
import { 
  KaleRecommendation, 
  RejectionReason 
} from '../types';
import { 
  MapPin, 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  Utensils,
  ExternalLink,
  Camera,
  Scale,
  Zap,
  Coins,
  ShieldCheck,
  Award
} from 'lucide-react';
import { getGoogleMapsUrl } from '../data/hawkerData';

interface RecommendationCardProps {
  recommendation: KaleRecommendation;
  onAccept: (recommendation: KaleRecommendation) => void;
  onRejectAndRefine: (reason: RejectionReason) => void;
  onSwitchToFastLane: () => void;
  onResetToNewMystery: () => void;
  isLoading: boolean;
  onOpenLogMeal?: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onAccept,
  onRejectAndRefine,
  onSwitchToFastLane,
  onResetToNewMystery,
  isLoading,
  onOpenLogMeal
}) => {
  const [showRejectDrawer, setShowRejectDrawer] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const { option, personalNote, rejectionCount, sourceType, dualChoiceComparison, energyNudge } = recommendation;
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
    <div className="w-full max-w-2xl mx-auto py-2 sm:py-4 px-1 sm:px-4" id="recommendation-view">
      
      {/* Top Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-ping shrink-0" />
          <span className="text-[10px] uppercase tracking-[0.25em] font-sans text-[#c5a059] font-medium">
            Velvet Pick
          </span>
          {dualChoiceComparison ? (
            <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#380b23] text-[#c5a059] border border-[#c5a059]/40 flex items-center gap-1 font-sans">
              <Scale className="w-3 h-3" />
              Deadlock Resolved
            </span>
          ) : sourceType === 'fast_lane' ? (
            <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#380b23] text-[#c5a059] border border-[#c5a059]/40 font-sans">
              Fast Lane
            </span>
          ) : null}
        </div>

        {/* Rejection indicator bar */}
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-sans text-[#f5f2ed]/70">
          <span>Rejections:</span>
          <div className="flex gap-1">
            {[1, 2, 3].map(dot => (
              <span 
                key={dot}
                className={`w-2 h-2 rounded-full transition-colors ${
                  dot <= rejectionCount ? 'bg-[#c5a059]' : 'border border-white/20 bg-transparent'
                }`}
              />
            ))}
          </div>
          <span className="opacity-70">({rejectionCount}/3)</span>
        </div>
      </div>

      {/* Main Pick Card */}
      <div className="relative rounded-3xl bg-[#190510] border border-white/20 shadow-[0_15px_50px_rgba(0,0,0,0.7)] p-4 sm:p-7 overflow-hidden">
        
        {/* Stall & Hawker Location Header */}
        <div className="pb-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase tracking-[0.25em] font-sans text-[#c5a059] font-medium block truncate">
                🍜 {option.cuisine}
              </span>
              <h3 className="font-serif-lux text-2xl sm:text-3xl md:text-4xl font-light italic text-[#f5f2ed] tracking-tight mt-0.5 leading-snug">
                {option.stallName}
              </h3>
            </div>
          </div>

          {/* Interactive Google Maps Turn-by-Turn Route Link */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-sans mt-2">
            <a
              href={recommendation.travelEstimate?.googleMapsUrl || getGoogleMapsUrl(option)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2e091d] border border-[#c5a059]/40 text-[#f5f2ed] hover:text-[#c5a059] hover:border-[#c5a059] transition-all group/map cursor-pointer shadow-sm text-xs"
              id="recommendation-google-maps-link"
              title="Open turn-by-turn route in Google Maps"
            >
              <MapPin className="w-3.5 h-3.5 text-[#c5a059] shrink-0 group-hover/map:scale-110 transition-transform" />
              <span className="font-medium underline underline-offset-2 decoration-[#c5a059]/40 group-hover/map:decoration-[#c5a059] truncate max-w-[200px] sm:max-w-none">
                📍 {option.location}
              </span>
              <ExternalLink className="w-3 h-3 text-[#c5a059]/70 group-hover/map:text-[#c5a059] shrink-0" />
            </a>

            {recommendation.travelEstimate?.routeTip && (
              <span className="text-[11px] text-[#f5f2ed]/70 font-sans">
                {recommendation.travelEstimate.routeTip}
              </span>
            )}
          </div>

          {/* Mischievous Curiosity Teaser & Weather Spark */}
          {(recommendation.curiosityTeaser || recommendation.weatherAdvice) && (
            <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-[#380b22] to-[#250716] border border-[#c5a059]/40 shadow-sm space-y-1">
              {recommendation.curiosityTeaser && (
                <div className="flex items-start gap-2">
                  <span className="text-base shrink-0">😏</span>
                  <p className="text-xs text-[#edd49a] font-medium italic leading-relaxed">
                    {recommendation.curiosityTeaser}
                  </p>
                </div>
              )}
              {recommendation.weatherAdvice && (
                <div className="text-[11px] text-[#f5f2ed]/70 pl-6 flex items-center gap-1.5">
                  <span>🌦️ {recommendation.weatherAdvice}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SPACIOUS, UN-CRAMPED VITAL STATS BAR (Budget, Calories, Nutrition, Walk) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 font-sans" id="spacious-vital-metrics">
          {/* 1. Budget */}
          <div className="p-3 rounded-2xl bg-[#250717] border border-white/15 flex items-center gap-3 shadow-sm">
            <span className="text-2xl shrink-0">💰</span>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-[#c5a059] font-medium">Budget</div>
              <div className="text-sm font-semibold text-[#f5f2ed] truncate mt-0.5">{option.priceRange}</div>
            </div>
          </div>

          {/* 2. Calories (Generously spaced & clearly separated) */}
          <div className="p-3 rounded-2xl bg-[#250717] border border-white/15 flex items-center gap-3 shadow-sm">
            <span className="text-2xl shrink-0">⚖️</span>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-[#8ce2ad] font-medium">Calories</div>
              <div className="text-sm font-semibold text-[#f5f2ed] truncate mt-0.5">
                {personalNote.calorieEstimate || '~420 kcal'}
              </div>
            </div>
          </div>

          {/* 3. Nutrition Grade */}
          <div className="p-3 rounded-2xl bg-[#250717] border border-white/15 flex items-center gap-3 shadow-sm">
            <span className="text-2xl shrink-0">🥗</span>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-[#8ce2ad] font-medium">Nutrition</div>
              <div className="text-sm font-semibold text-[#f5f2ed] truncate mt-0.5">{option.healthScore}</div>
            </div>
          </div>

          {/* 4. Travel / ETA */}
          <div className="p-3 rounded-2xl bg-[#250717] border border-white/15 flex items-center gap-3 shadow-sm">
            <span className="text-2xl shrink-0">🚶</span>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-[#c5a059] font-medium">Travel</div>
              <div className="text-sm font-semibold text-[#f5f2ed] truncate mt-0.5">
                {(() => {
                  const est = recommendation.travelEstimate;
                  if (est) {
                    if (est.transportMode === 'walking' && est.durationMinutes > 20) {
                      return '12 min walk';
                    }
                    return est.durationDisplay;
                  }
                  return `~${Math.min(20, option.walkTimeMinutes || 10)}m walk`;
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Drop Down Arrow Toggle for Extra Notes (Zero-Scroll UI) */}
        <div className="my-3 text-center">
          <button
            id="btn-toggle-extra-details"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-[#edd49a] transition-all cursor-pointer shadow-sm hover:border-[#c5a059]/40"
          >
            <span>{showDetails ? 'Hide Detailed Notes' : 'Drop Down for Nutrition & Details'}</span>
            <span className={`transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>

        {/* Collapsible Deep Notes Section */}
        {showDetails && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* SUBTLE DECISION PSYCHOLOGY & 3 PM ENERGY NUDGE */}
            {energyNudge && (
              <div className="p-3.5 rounded-2xl bg-[#230716] border border-[#c5a059]/40 shadow-sm font-sans space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#c5a059]" />
                    <span className="text-xs font-semibold text-[#f5f2ed] uppercase tracking-wider">
                      ⚡ 3 PM Alertness Forecast
                    </span>
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium border ${
                    (energyNudge.slumpRiskLevel === 'low' || (energyNudge as any).slumpRisk === 'Low')
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : (energyNudge.slumpRiskLevel === 'moderate' || (energyNudge as any).slumpRisk === 'Moderate')
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}>
                    {energyNudge.forecastLabel || ((energyNudge as any).slumpRisk === 'Low' ? '🟢 Peak Clarity' : '🟡 Balanced')}
                  </span>
                </div>

                <p className="text-xs text-[#f5f2ed]/80 leading-relaxed">
                  {energyNudge.forecastDetail || (energyNudge as any).message}
                </p>

                {(energyNudge.counterHack || (energyNudge as any).microNudge) && (
                  <div className="p-2 rounded-xl bg-black/30 border border-white/10 text-[11px] text-[#f5f2ed]/90 flex items-start gap-2">
                    <span className="text-[#c5a059] font-bold shrink-0">💡 Hack:</span>
                    <span>{energyNudge.counterHack || (energyNudge as any).microNudge}</span>
                  </div>
                )}
              </div>
            )}

            {/* WHY CHOSEN / PRIVATE DIETARY NOTE */}
            <div className="p-4 rounded-2xl bg-[#28081a] border border-[#c5a059]/50 relative space-y-2.5" id="personalized-private-note">
              <div className="flex items-center justify-between border-b border-[#c5a059]/20 pb-1.5">
                <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-[#c5a059] font-medium">
                  Why Picked For You
                </span>
                {personalNote.calorieEstimate && (
                  <span className="px-2 py-0.5 rounded-full border border-[#c5a059]/40 bg-[#c5a059]/10 text-xs font-sans text-[#c5a059]">
                    {personalNote.calorieEstimate}
                  </span>
                )}
              </div>
              
              <p className="text-xs text-[#f5f2ed] leading-relaxed">
                {personalNote.priorityAlignment?.details || personalNote.whyFits}
              </p>

              {personalNote.macroBreakdown && (
                <div className="p-2 rounded-xl bg-black/20 border border-white/10 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="text-[#8ce2ad] font-medium text-[11px]">🥩 {personalNote.macroBreakdown.protein}</span>
                  <span className="text-[#c5a059] font-medium text-[11px]">🌾 {personalNote.macroBreakdown.carbs}</span>
                  <span className="text-[#f5f2ed]/80 font-medium text-[11px]">🥑 {personalNote.macroBreakdown.fats}</span>
                </div>
              )}

              <div className="text-xs">
                <strong className="text-[#c5a059]">Order: </strong>
                <span>{personalNote.whatToOrder}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3RD REJECTION CAP BANNER */}
        {isCapped && (
          <div className="mb-6 p-5 rounded-2xl bg-[#3b0d24] border border-[#c5a059]/60 text-xs text-[#f5f2ed] space-y-2">
            <div className="font-serif-lux italic text-base text-[#c5a059] flex items-center gap-1.5">
              <span>Kale commits:</span>
              <span>&ldquo;Alright, going with this one &mdash; you&apos;ve got to eat sometime!&rdquo;</span>
            </div>
            <p className="text-[11px] text-[#f5f2ed]/70 font-sans">
              We have hit 3 rejections to protect you from decision paralysis. Alternatively, switch to the Fast Lane if you want to compare two cravings.
            </p>
            <button
              onClick={onSwitchToFastLane}
              className="inline-flex items-center gap-1.5 text-xs text-[#c5a059] hover:underline font-sans cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Clearly I&apos;m not reading your mind today &mdash; let&apos;s pick between two dishes?</span>
            </button>
          </div>
        )}

        {/* ACTION BUTTONS: ACCEPT OR REJECT-AND-REFINE */}
        {accepted ? (
          <div className="p-5 rounded-2xl bg-[#260819] border border-[#8ce2ad]/50 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm font-sans font-medium text-[#8ce2ad]">
              <CheckCircle2 className="w-4 h-4 text-[#8ce2ad]" />
              <span>Choice Sealed &bull; Enjoy your hawker lunch!</span>
            </div>
            <p className="text-xs text-[#f5f2ed]/70 font-sans">
              Decision fatigue eliminated. Want to log this meal and decorate your photo?
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
              {onOpenLogMeal && (
                <button
                  onClick={onOpenLogMeal}
                  className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-[#c5a059] hover:bg-[#b08b45] text-black font-semibold text-xs font-sans uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-98"
                >
                  <Camera className="w-4 h-4 text-black" />
                  <span>Log Meal &amp; Decorate Photo 📸</span>
                </button>
              )}

              <button
                onClick={onResetToNewMystery}
                className="text-xs text-[#c5a059] underline hover:text-[#f5f2ed] font-sans py-1.5 px-3 cursor-pointer"
              >
                Start fresh for another meal
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Primary Accept CTA */}
              <button
                id="btn-accept-pick"
                onClick={handleAcceptClick}
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#edd49a] via-[#c5a059] to-[#a3792b] hover:from-[#f3deab] hover:to-[#b68835] text-black font-sans text-xs uppercase tracking-[0.25em] font-bold shadow-[0_4px_25px_rgba(197,160,89,0.35)] hover:shadow-[0_6px_35px_rgba(197,160,89,0.55)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#f5e2b8]/60"
              >
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>I&apos;m Going Here ✨</span>
              </button>

              {/* Secondary Reject & Refine CTA */}
              <button
                id="btn-reject-refine"
                onClick={() => setShowRejectDrawer(!showRejectDrawer)}
                disabled={isLoading || isCapped}
                className={`w-full py-4 px-6 rounded-2xl font-sans text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                  isCapped
                    ? 'opacity-40 cursor-not-allowed border border-white/5 text-[#f5f2ed]/30 bg-transparent'
                    : 'bg-[#250717] border border-white/20 hover:border-[#c5a059] text-[#f5f2ed] hover:bg-[#320a20] cursor-pointer'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#c5a059] ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isCapped ? 'Cap Reached' : 'Not Feeling This (Refine) 🔄'}</span>
              </button>
            </div>

            {/* Quick Log Meal Option even before finishing */}
            {onOpenLogMeal && (
              <div className="text-center pt-1">
                <button
                  onClick={onOpenLogMeal}
                  className="inline-flex items-center gap-1.5 text-xs text-[#c5a059]/90 hover:text-[#c5a059] hover:underline font-sans cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Log this dish to Food Journal &amp; share story 📸</span>
                </button>
              </div>
            )}

            {/* REJECT & REFINE LIGHTWEIGHT 1-TAP REASON DRAWER */}
            {showRejectDrawer && !isCapped && (
              <div className="mt-4 p-5 rounded-2xl bg-[#230716] border border-white/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-sans text-[#c5a059]">
                    1-Tap Calibration
                  </span>
                  <span className="text-[10px] text-[#f5f2ed]/60 font-sans">Kale recalibrates next pick</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {rejectionReasons.map(r => (
                    <button
                      key={r.key}
                      id={`reason-${r.key}`}
                      onClick={() => handleReasonClick(r.key)}
                      className="text-left p-3 rounded-xl bg-[#1d0513] border border-white/10 hover:border-[#c5a059] transition-all group cursor-pointer"
                    >
                      <div className="text-xs font-sans text-[#f5f2ed] group-hover:text-[#c5a059]">
                        {r.label}
                      </div>
                      <div className="text-[10px] text-[#f5f2ed]/60 font-sans">
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
