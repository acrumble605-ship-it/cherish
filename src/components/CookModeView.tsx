import React, { useState } from 'react';
import { CookItem, CookRecipe } from '../types';
import { INITIAL_EXPIRING_PANTRY } from '../data/hawkerData';
import { KaleService } from '../services/kaleService';
import { 
  ChefHat, 
  Clock, 
  PiggyBank, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Sparkles, 
  Flame, 
  X,
  ChevronRight
} from 'lucide-react';

interface CookModeViewProps {
  totalSavedDollars: number;
  homeCookedCount: number;
  onCookMealLogged: (savings: number) => void;
}

export const CookModeView: React.FC<CookModeViewProps> = ({
  totalSavedDollars,
  homeCookedCount,
  onCookMealLogged
}) => {
  const [pantryItems, setPantryItems] = useState<CookItem[]>(INITIAL_EXPIRING_PANTRY);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDays, setNewItemDays] = useState(2);
  const [recipes, setRecipes] = useState<CookRecipe[]>(() => {
    const tagged = INITIAL_EXPIRING_PANTRY.filter(i => i.isTagged).map(i => i.name);
    return KaleService.generateCookRecipes(tagged);
  });
  const [cookedSuccessMessage, setCookedSuccessMessage] = useState<string | null>(null);

  // Toggle item tag (limit to 2-3 items to avoid inventory fatigue)
  const toggleItemTag = (id: string) => {
    setPantryItems(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          // Check limit of 3
          const currentlyTaggedCount = prev.filter(i => i.isTagged && i.id !== id).length;
          if (!item.isTagged && currentlyTaggedCount >= 3) {
            alert('Keep it lightweight! Tagging just 2–3 expiring items keeps decision fatigue low.');
            return item;
          }
          return { ...item, isTagged: !item.isTagged };
        }
        return item;
      });

      const newlyTagged = updated.filter(i => i.isTagged).map(i => i.name);
      if (newlyTagged.length > 0) {
        setRecipes(KaleService.generateCookRecipes(newlyTagged));
      }
      return updated;
    });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const newItem: CookItem = {
      id: `item-${Date.now()}`,
      name: newItemName.trim(),
      category: 'produce',
      daysLeft: Number(newItemDays) || 2,
      isTagged: true
    };
    const updated = [newItem, ...pantryItems];
    setPantryItems(updated);
    setNewItemName('');
    const tagged = updated.filter(i => i.isTagged).map(i => i.name);
    setRecipes(KaleService.generateCookRecipes(tagged));
  };

  const handleMarkCooked = (recipe: CookRecipe) => {
    onCookMealLogged(recipe.estimatedSavings);
    setCookedSuccessMessage(`Delicious! Saved ~$${recipe.estimatedSavings.toFixed(2)} SGD vs. delivery & hawker dining.`);
    setTimeout(() => setCookedSuccessMessage(null), 5000);
  };

  const taggedCount = pantryItems.filter(i => i.isTagged).length;

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 space-y-8" id="cook-mode-experience">
      
      {/* Cook Mode Header with Savings Tracker */}
      <div className="rounded-3xl glass bg-white/[0.03] border border-white/15 p-6 sm:p-8 glow flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <ChefHat className="w-4 h-4 text-[#c5a059]" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-sans text-[#c5a059]">
              Lightweight Cook Mode
            </span>
          </div>
          <h2 className="font-serif-lux text-3xl sm:text-4xl font-light italic text-[#f5f2ed]">
            Cook with What&apos;s Expiring Soon
          </h2>
          <p className="text-xs text-[#f5f2ed]/60 max-w-md font-sans tracking-wide mt-1 leading-relaxed">
            No spreadsheets or tedious logging. Tag just 2&ndash;3 items nearing their date, and Kale serves simple FIFO recipes to preserve freshness and save money.
          </p>
        </div>

        {/* RUNNING SAVINGS TRACKER */}
        <div className="glass p-5 rounded-2xl border border-[#c5a059]/40 flex items-center gap-4 shrink-0 glow" id="savings-tracker-widget">
          <div className="w-12 h-12 rounded-xl glass border border-[#c5a059]/50 flex items-center justify-center bg-[#4a0e2e]/30 shadow-[0_0_15px_rgba(74,14,46,0.4)]">
            <PiggyBank className="w-6 h-6 text-[#c5a059]" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#c5a059]">
              Dining Savings
            </div>
            <div className="font-serif-lux text-2xl sm:text-3xl font-light italic text-[#f5f2ed]">
              ${totalSavedDollars.toFixed(2)} <span className="text-xs font-sans not-italic text-[#c5a059]/80">SGD</span>
            </div>
            <div className="text-[10px] text-[#f5f2ed]/50 font-sans">
              {homeCookedCount} meals cooked at home
            </div>
          </div>
        </div>
      </div>

      {cookedSuccessMessage && (
        <div className="p-4 rounded-2xl glass bg-white/5 border border-[#8ce2ad]/50 text-xs sm:text-sm text-[#8ce2ad] flex items-center gap-3 animate-fadeIn font-sans">
          <CheckCircle2 className="w-5 h-5 text-[#8ce2ad] shrink-0" />
          <span>{cookedSuccessMessage}</span>
        </div>
      )}

      {/* SECTION 1: TAG 2-3 ITEMS EXPIRING SOON */}
      <div className="rounded-2xl glass border border-white/10 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-serif-lux text-2xl font-light italic text-[#f5f2ed] flex items-center gap-2">
              <span>What&apos;s Nearing Expiry?</span>
              <span className="text-[10px] uppercase font-sans tracking-wider px-2.5 py-0.5 rounded-full glass text-[#c5a059] border border-[#c5a059]/30">
                {taggedCount}/3 tagged
              </span>
            </h3>
            <p className="text-xs text-[#f5f2ed]/60 font-sans">
              Select 2 or 3 items that need to be eaten first (FIFO priority).
            </p>
          </div>

          {/* Quick Add Pill */}
          <form onSubmit={handleAddItem} className="flex items-center gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Tag item (e.g. Salmon fillet)..."
              className="glass border border-white/15 px-3 py-2 rounded-xl text-xs text-[#f5f2ed] placeholder-[#f5f2ed]/40 focus:outline-none focus:border-[#c5a059]/60 font-sans"
            />
            <button
              type="submit"
              disabled={!newItemName.trim()}
              className="px-4 py-2 rounded-xl glass bg-white/10 hover:bg-white/15 text-xs font-sans uppercase tracking-wider text-[#f5f2ed] border border-[#c5a059]/40 disabled:opacity-40 cursor-pointer"
            >
              Add
            </button>
          </form>
        </div>

        {/* Expiring Items Quick Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {pantryItems.map(item => {
            const isUrgent = item.daysLeft <= 1;
            return (
              <button
                key={item.id}
                onClick={() => toggleItemTag(item.id)}
                className={`p-3.5 rounded-xl glass border text-left transition-all relative cursor-pointer ${
                  item.isTagged
                    ? 'border-[#c5a059] bg-white/10 glow'
                    : 'border-white/10 hover:border-[#c5a059]/60 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] mb-1 font-sans">
                  <span className={`px-1.5 py-0.5 rounded font-medium ${
                    isUrgent ? 'glass bg-white/5 text-[#f799a4] border border-[#f799a4]/30' : 'text-[#c5a059]'
                  }`}>
                    {item.daysLeft}d left
                  </span>
                  {item.isTagged && (
                    <span className="w-2 h-2 rounded-full bg-[#c5a059]" />
                  )}
                </div>
                <div className="text-xs font-sans text-[#f5f2ed] truncate">
                  {item.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: FIFO-BASED RECIPE SUGGESTIONS */}
      <div className="space-y-4">
        <div>
          <h3 className="font-serif-lux text-2xl font-light italic text-[#f5f2ed] flex items-center gap-2">
            <span>FIFO Expiry-First Recipes</span>
            <Sparkles className="w-4 h-4 text-[#c5a059]" />
          </h3>
          <p className="text-xs text-[#f5f2ed]/60 font-sans">
            Calculated to consume your expiring items first, saving you from food waste and delivery costs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map(recipe => (
            <div
              key={recipe.id}
              className="p-6 rounded-3xl glass bg-white/[0.03] border border-white/15 glow space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-serif-lux text-2xl font-light italic text-[#f5f2ed]">
                    {recipe.title}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full glass text-[#8ce2ad] border border-[#8ce2ad]/30 shrink-0 font-sans">
                    <PiggyBank className="w-3 h-3" />
                    Saves ~${recipe.estimatedSavings.toFixed(2)}
                  </span>
                </div>

                <p className="text-xs text-[#f5f2ed]/70 mb-3 font-sans leading-relaxed font-light">
                  {recipe.description}
                </p>

                {/* Expiring Ingredients Used */}
                <div className="mb-3 flex flex-wrap items-center gap-1.5 font-sans">
                  <span className="text-[10px] uppercase tracking-wider text-[#c5a059]">
                    Consumes:
                  </span>
                  {recipe.expiringItemsUsed.map(ing => (
                    <span
                      key={ing}
                      className="text-[10px] px-2 py-0.5 rounded-md glass border border-white/10 text-[#f5f2ed]"
                    >
                      {ing}
                    </span>
                  ))}
                  <span className="text-[10px] text-[#c5a059] ml-auto flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {recipe.cookTime}
                  </span>
                </div>

                {/* Steps */}
                <div className="space-y-1.5 glass bg-white/[0.02] p-4 rounded-xl border border-white/10 text-xs font-sans font-light text-[#f5f2ed]/90">
                  <div className="text-[10px] uppercase tracking-wider font-sans text-[#c5a059] mb-1">
                    Preparation Steps:
                  </div>
                  {recipe.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="font-medium text-[#c5a059] shrink-0">{idx + 1}.</span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mark as Cooked */}
              <button
                onClick={() => handleMarkCooked(recipe)}
                className="w-full py-3.5 px-4 rounded-2xl glass bg-white/10 hover:bg-white/15 border border-[#c5a059] text-xs font-sans uppercase tracking-wider text-[#f5f2ed] glow hover:border-[#f5f2ed] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#c5a059]" />
                <span>Cooked This! Log ${recipe.estimatedSavings.toFixed(2)} Saved</span>
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
