import React, { useState } from 'react';
import { CookItem, CookRecipe } from '../types';
import { INITIAL_EXPIRING_PANTRY } from '../data/hawkerData';
import { KaleService } from '../services/kaleService';
import { 
  ChefHat, 
  Clock, 
  PiggyBank, 
  CheckCircle2, 
  Sparkles, 
  ChevronDown,
  ChevronUp,
  Plus
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
  const [recipes, setRecipes] = useState<CookRecipe[]>(() => {
    const tagged = INITIAL_EXPIRING_PANTRY.filter(i => i.isTagged).map(i => i.name);
    return KaleService.generateCookRecipes(tagged);
  });
  const [cookedSuccessMessage, setCookedSuccessMessage] = useState<string | null>(null);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  // Toggle item tag (limit to 2-3 items to avoid inventory fatigue)
  const toggleItemTag = (id: string) => {
    setPantryItems(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          const currentlyTaggedCount = prev.filter(i => i.isTagged && i.id !== id).length;
          if (!item.isTagged && currentlyTaggedCount >= 3) {
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
      daysLeft: 2,
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
    setCookedSuccessMessage(`Delicious! Saved ~$${recipe.estimatedSavings.toFixed(2)} SGD vs. delivery.`);
    setTimeout(() => setCookedSuccessMessage(null), 5000);
  };

  const taggedCount = pantryItems.filter(i => i.isTagged).length;

  return (
    <div className="w-full max-w-3xl mx-auto py-3 px-3 sm:px-4 space-y-5 font-sans" id="cook-mode-experience">
      
      {/* 1-GLANCE HEADER & SAVINGS SUMMARY */}
      <div className="rounded-3xl bg-[#200615] border border-[#c5a059]/40 p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ChefHat className="w-4 h-4 text-[#c5a059]" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a059] font-medium">
                FIFO Cook Mode
              </span>
            </div>
            <h2 className="font-serif-lux text-2xl sm:text-3xl font-light italic text-[#f5f2ed] tracking-tight">
              Cook What&apos;s Expiring Soon
            </h2>
            <p className="text-xs text-[#f5f2ed]/60 max-w-md mt-0.5">
              Tag 2&ndash;3 expiring groceries. Cherish generates quick FIFO recipes to stop food waste.
            </p>
          </div>

          {/* Savings Metric Widget */}
          <div className="p-3 sm:p-4 rounded-2xl bg-[#2b081c] border border-[#c5a059]/40 flex items-center gap-3 w-full sm:w-auto shrink-0 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-[#4a0e2e]/60 border border-[#c5a059]/50 flex items-center justify-center shrink-0">
              <PiggyBank className="w-5 h-5 text-[#c5a059]" />
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-[#c5a059] font-medium">
                Saved Total
              </div>
              <div className="font-serif-lux text-xl sm:text-2xl font-light italic text-[#f5f2ed]">
                ${totalSavedDollars.toFixed(2)} <span className="text-[10px] font-sans text-[#c5a059]">SGD</span>
              </div>
              <div className="text-[10px] text-[#f5f2ed]/50">
                {homeCookedCount} home meals logged
              </div>
            </div>
          </div>
        </div>
      </div>

      {cookedSuccessMessage && (
        <div className="p-3 rounded-2xl bg-[#14281e] border border-[#8ce2ad]/50 text-xs sm:text-sm text-[#8ce2ad] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#8ce2ad] shrink-0" />
          <span>{cookedSuccessMessage}</span>
        </div>
      )}

      {/* SECTION 1: TAG 2-3 ITEMS (Lightweight, single tap) */}
      <div className="rounded-3xl bg-[#190510] border border-white/10 p-4 sm:p-5 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#f5f2ed]">
              Expiring Pantry / Fridge
            </h3>
            <span className="text-[10px] uppercase font-sans tracking-wider px-2 py-0.5 rounded-full bg-[#c5a059]/20 text-[#c5a059] font-medium">
              {taggedCount}/3 selected
            </span>
          </div>

          {/* Quick Add Pill */}
          <form onSubmit={handleAddItem} className="flex items-center gap-1.5 w-full sm:w-auto">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Add item (e.g. Tofu)..."
              className="flex-1 sm:w-40 bg-[#280718] border border-white/15 px-3 py-1.5 rounded-xl text-xs text-[#f5f2ed] placeholder-[#f5f2ed]/40 focus:outline-none focus:border-[#c5a059]"
            />
            <button
              type="submit"
              disabled={!newItemName.trim()}
              className="p-2 rounded-xl bg-[#c5a059] hover:bg-[#b58f48] text-black text-xs font-semibold disabled:opacity-40 cursor-pointer shrink-0 transition-all"
              title="Add grocery"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Expiring Items Quick Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {pantryItems.map(item => {
            const isUrgent = item.daysLeft <= 1;
            return (
              <button
                key={item.id}
                onClick={() => toggleItemTag(item.id)}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  item.isTagged
                    ? 'border-[#c5a059] bg-[#3b0d24] text-[#f5f2ed] shadow-md ring-1 ring-[#c5a059]/40'
                    : 'border-white/10 bg-[#250717] text-[#f5f2ed]/70 hover:border-[#c5a059]/40 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className={`px-1.5 py-0.5 rounded font-medium ${
                    isUrgent ? 'bg-red-500/20 text-red-300' : 'text-[#c5a059]'
                  }`}>
                    {item.daysLeft}d left
                  </span>
                  {item.isTagged && (
                    <span className="w-2 h-2 rounded-full bg-[#c5a059]" />
                  )}
                </div>
                <div className="text-xs font-medium text-[#f5f2ed] truncate">
                  {item.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: FIFO RECIPE MATCHES (Compact, Expandable Steps) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#c5a059]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#f5f2ed]">
              FIFO Fast Recipes
            </h3>
          </div>
          <span className="text-[11px] text-[#f5f2ed]/50">
            {recipes.length} matches
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recipes.map(recipe => {
            const isExpanded = expandedRecipeId === recipe.id;
            return (
              <div
                key={recipe.id}
                className="p-4 rounded-3xl bg-[#190510] border border-white/15 shadow-xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-serif-lux text-xl font-light italic text-[#f5f2ed]">
                      {recipe.title}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#8ce2ad]/15 text-[#8ce2ad] border border-[#8ce2ad]/30 shrink-0 font-medium">
                      <PiggyBank className="w-3 h-3" />
                      Save ~${recipe.estimatedSavings.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-xs text-[#f5f2ed]/70 font-light leading-relaxed line-clamp-2">
                    {recipe.description}
                  </p>

                  {/* Consumes Tags & Time */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] uppercase text-[#c5a059] font-medium">Uses:</span>
                    {recipe.expiringItemsUsed.map(ing => (
                      <span
                        key={ing}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-[#280718] border border-white/10 text-[#f5f2ed]"
                      >
                        {ing}
                      </span>
                    ))}
                    <span className="text-[10px] text-[#c5a059] ml-auto flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {recipe.cookTime}
                    </span>
                  </div>

                  {/* Expandable Preparation Steps */}
                  <div className="pt-2 border-t border-white/10">
                    <button
                      onClick={() => setExpandedRecipeId(isExpanded ? null : recipe.id)}
                      className="w-full flex items-center justify-between text-[11px] text-[#c5a059] hover:text-white transition-colors cursor-pointer py-1"
                    >
                      <span className="font-medium">
                        {isExpanded ? 'Hide preparation steps' : `View ${recipe.steps.length} cooking steps`}
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-1.5 p-3 rounded-2xl bg-[#280718] border border-white/10 text-xs text-[#f5f2ed]/90 animate-in fade-in">
                        {recipe.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="font-semibold text-[#c5a059] shrink-0">{idx + 1}.</span>
                            <span className="leading-relaxed font-light">{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mark as Cooked */}
                <button
                  onClick={() => handleMarkCooked(recipe)}
                  className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#edd49a] via-[#c5a059] to-[#a3792b] text-black text-xs uppercase tracking-wider font-semibold shadow-md hover:shadow-[0_0_15px_rgba(197,160,89,0.5)] active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Cooked This &bull; Save ${recipe.estimatedSavings.toFixed(2)}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
