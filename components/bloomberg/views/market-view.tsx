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
    <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[85vh] mt-4">
      {/* Sisi Kiri: Live News */}
      <div className="lg:col-span-3">
        <NewsPanel colors={colors} />
      </div>

      {/* Tengah: OBSIDIAN AI Core (Dominant) */}
      <div className="lg:col-span-6 flex flex-col h-full gap-8">
        <AiMarketAnalysis colors={colors as any} />
        <div className="glass-panel p-6 rounded-3xl flex-1 overflow-x-auto custom-scrollbar shadow-2xl">
            <h3 className="text-lg font-extrabold flex items-center gap-3 mb-6 tracking-wide" style={{ color: colors.accent }}>
                MARKET OVERVIEW
            </h3>
            <div className="text-base">
                <MarketTable data={data} isDarkMode={isDarkMode} />
            </div>
        </div>
      </div>

      {/* Sisi Kanan: Smart Auditor & Market Movers */}
      <div className="lg:col-span-3 flex flex-col gap-8">
        {/* Smart Auditor Module */}
        <div className="glass-panel p-6 rounded-3xl border-l-4 border-l-emerald-500 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <h3 className="text-lg font-extrabold flex items-center gap-3 mb-5 text-emerald-400 tracking-wide z-10 relative">
            <ShieldAlert className="h-5 w-5" />
            SMART AUDITOR
          </h3>
          <div className="space-y-4 z-10 relative">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl shadow-lg backdrop-blur-sm transition-transform hover:scale-105">
              <p className="text-sm text-emerald-400 font-bold mb-2 tracking-widest">STATUS: SECURE</p>
              <p className="text-xs text-gray-300 leading-relaxed">No vulnerabilities detected in connected wallet.</p>
            </div>
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl shadow-lg backdrop-blur-sm transition-transform hover:scale-105">
              <p className="text-sm text-rose-400 font-bold mb-2 tracking-widest">RISK ALERT</p>
              <p className="text-xs text-gray-300 leading-relaxed">High volatility detected in RITUAL network operations.</p>
            </div>
          </div>
        </div>

        {/* Market Movers Summary */}
        <div className="glass-panel p-6 rounded-3xl flex-1 shadow-2xl relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
          <h3 className="text-lg font-extrabold flex items-center gap-3 mb-5 tracking-wide z-10 relative" style={{ color: colors.accent }}>
            MARKET MOVERS
          </h3>
          <div className="space-y-3 z-10 relative">
            {data?.americas?.slice(0, 5).map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/5 hover:border-emerald-500/30 shadow-sm cursor-pointer group">
                <div>
                  <p className="text-sm font-bold group-hover:text-emerald-400 transition-colors" style={{ color: colors.text }}>{item.id}</p>
                  <p className="text-xs text-gray-400">{item.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{item.value.toFixed(2)}</p>
                  <p className={`text-xs font-bold ${item.pctChange >= 0 ? 'text-emerald-400 drop-shadow-md' : 'text-rose-400 drop-shadow-md'}`}>
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
