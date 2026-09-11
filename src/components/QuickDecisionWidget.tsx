import React, { useState } from 'react';
import { KaleService } from '../services/kaleService';
import { QuickDecision } from '../types';

export function QuickDecisionWidget() {
  const [q, setQ] = useState('');
  const [result, setResult] = useState<QuickDecision | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await KaleService.getQuickDecision(q.trim());
      setResult(res);
    } catch (err) {
      console.error('Failed to get quick decision:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 space-y-3 max-w-md mx-auto">
      <p className="text-xs uppercase tracking-[0.25em] text-[#c5a059]/80">Small Decision?</p>
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask()}
          placeholder="e.g. window seat or aisle?"
          className="flex-1 bg-transparent border border-[#ffffff20] rounded-lg px-3 py-2 text-sm text-[#f5f2ed] placeholder-[#f5f2ed]/40 focus:outline-none focus:border-[#c5a059]"
        />
        <button
          onClick={ask}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-[#4a0e2e] text-sm text-[#f5f2ed] hover:bg-[#c5a059] hover:text-[#1a050d] transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? '...' : 'Ask'}
        </button>
      </div>
      {result && (
        <p className="text-sm text-[#f5f2ed]/90">
          <span className="text-[#c5a059] font-semibold">{result.pick}</span> — {result.oneLiner}
        </p>
      )}
    </div>
  );
}
