"use client";

import { useMarketDataQuery } from "../hooks";
import { bloombergColors } from "../lib/theme-config";
import { MarketTable } from "../ui";
import { AiMarketAnalysis } from "../ui/ai-market-analysis";
import { NewsPanel } from "../ui/news-panel";
import { ShieldAlert } from "lucide-react";

type MarketViewProps = {
  isDarkMode: boolean;
};

export function MarketView({ isDarkMode }: MarketViewProps) {
  const { marketData: data, isLoading, error } = useMarketDataQuery();
  const colors = isDarkMode ? bloombergColors.dark : bloombergColors.light;

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-[80vh]">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-400 font-mono">Initializing OBSIDIAN Core...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center glass-panel m-4 rounded-xl">
        <p className="neon-text-red font-mono text-xl">System Error Detected</p>
        <p className="text-sm mt-2 text-gray-400">{error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[85vh]">
      {/* Sisi Kiri: Live News */}
      <div className="lg:col-span-3">
        <NewsPanel colors={colors} />
      </div>

      {/* Tengah: OBSIDIAN AI Core (Dominant) */}
      <div className="lg:col-span-6 flex flex-col h-full">
        <AiMarketAnalysis colors={colors as any} />
        <div className="mt-6 glass-panel p-4 rounded-xl flex-1 overflow-x-auto custom-scrollbar">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: colors.accent }}>
                MARKET OVERVIEW
            </h3>
            <MarketTable data={data} isDarkMode={isDarkMode} />
        </div>
      </div>

      {/* Sisi Kanan: Smart Auditor & Market Movers */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        {/* Smart Auditor Module */}
        <div className="glass-panel p-4 rounded-xl border-l-4 border-l-emerald-500">
          <h3 className="text-sm font-bold flex items-center gap-2 mb-3 text-emerald-400">
            <ShieldAlert className="h-4 w-4" />
            SMART AUDITOR
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-xs text-emerald-400 font-mono mb-1">Status: SECURE</p>
              <p className="text-[10px] text-gray-400">No vulnerabilities detected in connected wallet.</p>
            </div>
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              <p className="text-xs text-rose-400 font-mono mb-1">Risk Alert</p>
              <p className="text-[10px] text-gray-400">High volatility detected in IBOVESPA index.</p>
            </div>
          </div>
        </div>

        {/* Market Movers Summary */}
        <div className="glass-panel p-4 rounded-xl flex-1">
          <h3 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: colors.accent }}>
            MARKET MOVERS
          </h3>
          <div className="space-y-2">
            {data?.americas?.slice(0, 5).map((item) => (
              <div key={item.id} className="flex justify-between items-center p-2 hover:bg-white/5 rounded-md transition-colors border border-white/5">
                <div>
                  <p className="text-xs font-bold" style={{ color: colors.text }}>{item.id}</p>
                  <p className="text-[10px] text-gray-500">{item.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono">{item.value.toFixed(2)}</p>
                  <p className={`text-[10px] font-mono ${item.pctChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.pctChange >= 0 ? '+' : ''}{item.pctChange.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
