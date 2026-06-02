"use client";

import { useMarketDataQuery } from "../hooks";
import { bloombergColors } from "../lib/theme-config";
import { MarketTable } from "../ui";
import { AlphaFeed } from "../../../components/AlphaFeed";
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

      {/* Tengah: OBSIDIAN AI Core & Market Data */}
      <div className="lg:col-span-6 flex flex-col h-full gap-6">
        <div className="h-[400px]">
          <AlphaFeed />
        </div>
        
        <div className="bg-[#0A0A0A] p-5 rounded-xl border border-[#222] shadow-sm flex-1 overflow-hidden flex flex-col">
          <h3 className="text-xs font-semibold flex items-center gap-2 mb-4 text-[#888] uppercase tracking-wider">
            Live Market Infrastructure
          </h3>
          <div className="overflow-x-auto custom-scrollbar flex-1">
            <MarketTable data={data} isDarkMode={isDarkMode} />
          </div>
        </div>
      </div>

      {/* Sisi Kanan: Smart Auditor & Market Movers */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        {/* Smart Auditor Module */}
        <div className="bg-[#0A0A0A] p-5 rounded-xl border border-[#222] shadow-sm">
          <h3 className="text-xs font-semibold flex items-center gap-2 mb-4 text-[#888] uppercase tracking-wider">
            <ShieldAlert className="h-4 w-4" />
            System Status
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-[#111] border border-[#333] rounded-lg">
              <p className="text-[10px] text-emerald-500 font-medium mb-1 tracking-wider uppercase">Audit: Secure</p>
              <p className="text-xs text-[#888] leading-relaxed">No vulnerabilities detected in connected infrastructure.</p>
            </div>
            <div className="p-3 bg-[#111] border border-[#333] rounded-lg">
              <p className="text-[10px] text-amber-500 font-medium mb-1 tracking-wider uppercase">Network Alert</p>
              <p className="text-xs text-[#888] leading-relaxed">Elevated volatility in secondary liquidity pools.</p>
            </div>
          </div>
        </div>

        {/* Market Movers Summary */}
        <div className="bg-[#0A0A0A] p-5 rounded-xl border border-[#222] shadow-sm flex-1 flex flex-col">
          <h3 className="text-xs font-semibold flex items-center gap-2 mb-4 text-[#888] uppercase tracking-wider">
            Market Activity
          </h3>
          <div className="space-y-1 flex-1">
            {data?.americas?.slice(0, 5).map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 px-3 hover:bg-[#111] rounded-md transition-colors cursor-pointer border border-transparent hover:border-[#333]">
                <div>
                  <p className="text-sm font-medium text-white">{item.id}</p>
                  <p className="text-[10px] text-[#666] uppercase">{item.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{item.value.toFixed(2)}</p>
                  <p className={`text-[10px] font-medium ${item.pctChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
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
