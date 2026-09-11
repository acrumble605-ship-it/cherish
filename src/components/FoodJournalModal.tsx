import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Share2, 
  Trash2, 
  Plus, 
  Star, 
  Flame, 
  Calendar, 
  Sparkles,
  Camera,
  Check,
  Copy
} from 'lucide-react';
import { JournalEntry } from '../types';

interface FoodJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries?: JournalEntry[];
  onDeleteEntry?: (id: string) => void;
  onOpenLogModal?: () => void;
}

export const FoodJournalModal: React.FC<FoodJournalModalProps> = ({
  isOpen,
  onClose,
  entries = [],
  onDeleteEntry = (_id: string) => {},
  onOpenLogModal = () => {}
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'top_rated'>('all');

  if (!isOpen) return null;

  const safeEntries = Array.isArray(entries) ? entries : [];
  const filteredEntries = filter === 'top_rated' 
    ? safeEntries.filter(e => (e?.rating || 0) >= 4)
    : safeEntries;

  const handleShareEntry = async (entry: JournalEntry) => {
    const stickersList = Array.isArray(entry.stickers) ? entry.stickers.join(' ') : '';
    const text = `🍜 Logged: ${entry.dishName} at ${entry.stallName}! ${stickersList} - Found with Cherish SG ✨`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Cherish Hawker Log: ${entry.dishName}`,
          text,
          url: window.location.href
        });
      } catch (e) {
        console.log('Share dismissed', e);
      }
    } else {
      navigator.clipboard.writeText(text);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn overflow-y-auto" id="food-journal-modal">
      <div className="w-full max-w-3xl my-auto rounded-3xl bg-[#16040d] border border-[#c5a059]/40 shadow-[0_25px_80px_rgba(0,0,0,0.95)] glow p-4 sm:p-7 space-y-4 max-h-[92vh] flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 shrink-0 border-b border-white/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4a0e2e] border border-[#c5a059]/70 flex items-center justify-center shadow-[0_0_15px_rgba(74,14,46,0.6)] shrink-0">
              <BookOpen className="w-5 h-5 text-[#c5a059]" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] font-sans text-[#c5a059] font-medium">Food Diary</div>
              <h3 className="font-serif-lux text-2xl sm:text-3xl font-light italic text-[#f5f2ed] leading-tight">
                My Hawker Journal 📖
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLogModal}
              className="py-2 px-3.5 rounded-xl bg-[#c5a059] hover:bg-[#b58f48] text-black font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-black" />
              <span>Log Meal 📸</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[#f5f2ed] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-2.5 shrink-0">
          <div className="p-3 rounded-2xl bg-[#250717] border border-white/15 text-center shadow-md">
            <div className="text-[10px] uppercase tracking-wider text-[#c5a059] font-medium">Total Logged</div>
            <div className="font-serif-lux text-2xl text-[#f5f2ed] italic font-semibold">{safeEntries.length} 🍜</div>
          </div>
          <div className="p-3 rounded-2xl bg-[#250717] border border-white/15 text-center shadow-md">
            <div className="text-[10px] uppercase tracking-wider text-[#8ce2ad] font-medium">Top Rated</div>
            <div className="font-serif-lux text-2xl text-[#f5f2ed] italic font-semibold">
              {safeEntries.filter(e => (e?.rating || 0) >= 4).length} ⭐
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#250717] border border-white/15 text-center shadow-md">
            <div className="text-[10px] uppercase tracking-wider text-[#ea580c] font-medium">Avg Calories</div>
            <div className="font-serif-lux text-2xl text-[#f5f2ed] italic font-semibold">~440 kcal ⚖️</div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 text-xs shrink-0 font-sans">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#c5a059] text-black border-[#c5a059] font-semibold shadow-md'
                : 'bg-[#250717] border-white/20 text-[#f5f2ed]/80 hover:text-white hover:bg-[#320a20]'
            }`}
          >
            All Meals ({safeEntries.length})
          </button>
          <button
            onClick={() => setFilter('top_rated')}
            className={`px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
              filter === 'top_rated'
                ? 'bg-[#c5a059] text-black border-[#c5a059] font-semibold shadow-md'
                : 'bg-[#250717] border-white/20 text-[#f5f2ed]/80 hover:text-white hover:bg-[#320a20]'
            }`}
          >
            Favorites ⭐ 4+
          </button>
        </div>

        {/* Entries Feed */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="py-12 text-center space-y-3 font-sans bg-[#250717]/60 rounded-3xl p-6 border border-white/10">
              <div className="text-4xl">📸</div>
              <h4 className="text-sm font-medium text-[#f5f2ed]">No meals logged yet</h4>
              <p className="text-xs text-[#f5f2ed]/70 max-w-sm mx-auto">
                Snap or upload a photo of your hawker lunch, customize with stickers, and share with your friends or Instagram!
              </p>
              <button
                onClick={onOpenLogModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#b58f48] text-black font-semibold text-xs cursor-pointer shadow-md transition-all active:scale-95"
              >
                <Camera className="w-4 h-4 text-black" />
                <span>Log Your First Dish 🍜</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredEntries.map(entry => (
                <div
                  key={entry.id}
                  className={`rounded-2xl p-4 border transition-all flex flex-col justify-between shadow-xl ${
                    entry.frameStyle === 'gold'
                      ? 'border-[#c5a059] bg-[#2a0b1c]'
                      : entry.frameStyle === 'neon'
                      ? 'border-[#ea580c] bg-[#220614]'
                      : 'border-white/20 bg-[#250717]'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Image & Stickers */}
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-black/60 shadow-inner">
                      <img 
                        src={entry.photoUrl} 
                        alt={entry.dishName} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[90%]">
                        {(entry.stickers || []).map((s, idx) => (
                          <span 
                            key={idx} 
                            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/90 text-white backdrop-blur-md border border-white/30 shadow-md"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/90 px-2.5 py-1 rounded-md text-[11px] text-[#c5a059] font-bold backdrop-blur-md border border-white/20">
                        {entry.price}
                      </div>
                    </div>

                    {/* Dish & Stall Title */}
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-serif-lux text-xl font-light italic text-[#f5f2ed] leading-snug">
                          {entry.dishName}
                        </h4>
                        <div className="flex text-amber-400 text-xs shrink-0">
                          {'★'.repeat(Math.min(5, Math.max(1, entry.rating || 5)))}
                        </div>
                      </div>
                      <p className="text-xs text-[#f5f2ed]/80 truncate font-sans font-medium">
                        📍 {entry.stallName} &bull; {entry.hawkerCentre}
                      </p>
                    </div>

                    {/* User Note */}
                    {entry.note && (
                      <p className="text-xs text-[#f5f2ed] italic font-sans bg-[#17030e] p-2.5 rounded-xl border border-white/10 leading-relaxed">
                        &ldquo;{entry.note}&rdquo;
                      </p>
                    )}

                    {/* Meta info: time & calories */}
                    <div className="flex items-center justify-between text-[11px] text-[#f5f2ed]/70 font-sans pt-1.5 border-t border-white/15">
                      <span>🕒 {entry.timestamp}</span>
                      <span className="font-medium text-[#c5a059]">⚖️ {entry.calories}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-white/15 font-sans">
                    <button
                      onClick={() => handleShareEntry(entry)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#c5a059]/20 hover:bg-[#c5a059]/30 border border-[#c5a059]/60 text-xs text-[#f5f2ed] font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    >
                      {copiedId === entry.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#8ce2ad]" />
                          <span className="text-[#8ce2ad] font-semibold">Copied Caption!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-[#c5a059]" />
                          <span>Share Story 📤</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="p-2 rounded-xl bg-white/5 border border-white/15 hover:border-red-500 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 text-center text-[10px] sm:text-[11px] font-sans text-[#f5f2ed]/50 shrink-0">
          Cherish logs your Singapore hawker memories &bull; Zero clutter
        </div>

      </div>
    </div>
  );
};
