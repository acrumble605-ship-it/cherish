import React from 'react';
import { BankedCraving } from '../types';
import { BookmarkCheck, X, ArrowRight, Sparkles, Trash2 } from 'lucide-react';

interface BankedCravingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankedCravings?: BankedCraving[];
  onSelectCravingForSolo: (cravingText: string) => void;
  onRemoveCraving: (id: string) => void;
}

export const BankedCravingsModal: React.FC<BankedCravingsModalProps> = ({
  isOpen,
  onClose,
  bankedCravings = [],
  onSelectCravingForSolo,
  onRemoveCraving
}) => {
  if (!isOpen) return null;

  const safeCravings = Array.isArray(bankedCravings) ? bankedCravings : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl glass bg-white/[0.04] border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] glow p-4 sm:p-7 space-y-4 max-h-[92vh] flex flex-col relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-1 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl glass border border-[#c5a059]/50 flex items-center justify-center bg-[#4a0e2e]/30 shadow-[0_0_15px_rgba(74,14,46,0.4)] shrink-0">
              <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#c5a059]" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] font-sans text-[#c5a059]">Vault</div>
              <h3 className="font-serif-lux text-xl sm:text-2xl font-light italic text-[#f5f2ed] leading-tight">
                Banked Cravings
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

        {/* Gold hairline accent */}
        <div className="h-[1px] w-full bg-[#c5a059] opacity-30 my-0 shrink-0"></div>

        {/* Content List */}
        {safeCravings.length === 0 ? (
          <div className="py-8 text-center space-y-2 font-sans overflow-y-auto">
            <BookmarkCheck className="w-8 h-8 text-[#c5a059]/40 mx-auto" />
            <p className="text-sm text-[#f5f2ed]/90 font-light">
              Your vault is currently clear.
            </p>
            <p className="text-xs text-[#f5f2ed]/50 max-w-xs mx-auto leading-relaxed">
              Whenever a squad vote picks a spot you don&apos;t prefer, we quietly bank your craving here so Kale can suggest it for your next solo meal!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
            {safeCravings.map(craving => (
              <div
                key={craving.id}
                className="p-3 sm:p-4 rounded-2xl glass border border-white/10 hover:border-[#c5a059]/70 transition-all flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-2.5 group"
              >
                <div className="space-y-1 flex-1 font-sans">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-sans uppercase tracking-wider text-[#c5a059] font-medium">
                      {craving.dishOrCraving}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded glass text-[#f5f2ed]/60">
                      {craving.savedDate}
                    </span>
                  </div>

                  <p className="text-xs text-[#f5f2ed]/80 font-light leading-relaxed">
                    {craving.originDetails}
                  </p>

                  {craving.fallbackStallName && (
                    <div className="pt-0.5 text-[11px] text-[#f5f2ed]/90 flex items-center gap-1">
                      <span className="text-[#c5a059]">Stored spot:</span>
                      <span>{craving.fallbackStallName}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <button
                    onClick={() => {
                      onSelectCravingForSolo(craving.dishOrCraving);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass bg-white/10 hover:bg-white/15 text-xs font-sans uppercase tracking-wider text-[#f5f2ed] border border-[#c5a059] shadow-sm glow cursor-pointer"
                  >
                    <span>Fulfill Now</span>
                    <ArrowRight className="w-3 h-3 text-[#c5a059]" />
                  </button>

                  <button
                    onClick={() => onRemoveCraving(craving.id)}
                    className="text-[#f5f2ed]/40 hover:text-[#f799a4] text-[11px] p-1 cursor-pointer transition-colors"
                    title="Remove from bank"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Note */}
        <div className="pt-2 border-t border-white/10 text-center text-[10px] sm:text-[11px] font-sans text-[#f5f2ed]/50 shrink-0">
          Kale periodically surfaces these during your Solo reveals.
        </div>

      </div>
    </div>
  );
};
