"use client";

import {
  Activity,
  AlertTriangle,
  BarChart2,
  Database,
  HelpCircle,
  Moon,
  Newspaper,
  RefreshCw,
  Sun,
  TrendingUp,
  Wifi,
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BloombergButton } from "../core/bloomberg-button";
import { useMarketDataQuery } from "../hooks";
import { bloombergColors } from "../lib/theme-config";

type TerminalHeaderProps = {
  isDarkMode: boolean;
  onCancelClick: () => void;
  onNewClick: () => void;
  onBlancClick: () => void;
  onNewsClick: () => void;
  onMoversClick: () => void;
  onVolatilityClick: () => void;
  onRmiClick: () => void;
  onHelpClick: () => void;
  onThemeToggle: () => void;
};

export function TerminalHeader({
  isDarkMode,
  onCancelClick,
  onNewClick,
  onBlancClick,
  onNewsClick,
  onMoversClick,
  onVolatilityClick,
  onRmiClick,
  onHelpClick,
  onThemeToggle,
}: TerminalHeaderProps) {
  const {
    isLoading,
    isRealTimeEnabled,
    isFromRedis,
    dataSource,
    lastUpdated,
    refreshData,
    toggleRealTimeUpdates,
  } = useMarketDataQuery();

  const colors = isDarkMode ? bloombergColors.dark : bloombergColors.light;

  // Calculate how fresh the data is
  const getDataFreshnessIndicator = () => {
    if (!lastUpdated) return null;

    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);

    let color = "bg-green-500"; // Fresh data (< 10 seconds)
    let pulseClass = "animate-pulse";

    if (diffSeconds > 60) {
      color = "bg-red-500"; // Stale data (> 60 seconds)
      pulseClass = "";
    } else if (diffSeconds > 30) {
      color = "bg-yellow-500"; // Aging data (30-60 seconds)
      pulseClass = "animate-pulse";
    } else if (diffSeconds > 10) {
      color = "bg-green-500"; // Slightly aged data (10-30 seconds)
      pulseClass = "";
    }

    return (
      <div className="flex items-center gap-1">
        <div className={`h-2 w-2 rounded-full ${color} ${pulseClass}`} />
        <span className="text-xs">{diffSeconds}s</span>
      </div>
    );
  };

  return (
    <div className="bg-[#050505] sticky top-0 z-50 flex flex-wrap gap-4 px-8 py-4 items-center border-b border-[#222]">
      <div className="mr-8 font-semibold text-xl tracking-wide text-white flex items-center gap-2">
        <Activity className="h-5 w-5 text-white" />
        OBSIDIAN
      </div>
      
      <BloombergButton color="red" onClick={onCancelClick} className="px-3 py-1.5 text-xs font-semibold rounded bg-red-950/50 text-red-400 border border-red-900/50 hover:bg-red-900/50 transition-colors">
        CANCEL
      </BloombergButton>
      <BloombergButton color="accent" onClick={onNewClick} className="px-3 py-1.5 text-xs font-medium rounded bg-[#111] text-[#888] border border-[#333] hover:text-white transition-colors">
        NEW
      </BloombergButton>
      <BloombergButton color="accent" onClick={onBlancClick} className="px-3 py-1.5 text-xs font-medium rounded bg-[#111] text-[#888] border border-[#333] hover:text-white transition-colors">
        BLANC
      </BloombergButton>
      <BloombergButton color="accent" onClick={onNewsClick} className="px-3 py-1.5 text-xs font-medium rounded bg-[#111] text-[#888] border border-[#333] hover:text-white transition-colors flex items-center gap-1">
        <Newspaper className="h-3 w-3" />
        NEWS
      </BloombergButton>
      <BloombergButton color="accent" onClick={onMoversClick} className="px-3 py-1.5 text-xs font-medium rounded bg-[#111] text-[#888] border border-[#333] hover:text-white transition-colors flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        MOVERS
      </BloombergButton>
      <BloombergButton color="accent" onClick={onVolatilityClick} className="px-3 py-1.5 text-xs font-medium rounded bg-[#111] text-[#888] border border-[#333] hover:text-white transition-colors flex items-center gap-1">
        <BarChart2 className="h-3 w-3" />
        VOLATILITY
      </BloombergButton>
      <BloombergButton color="accent" onClick={onRmiClick} className="px-3 py-1.5 text-xs font-medium rounded bg-[#111] text-[#888] border border-[#333] hover:text-white transition-colors flex items-center gap-1">
        <Activity className="h-3 w-3" />
        RMI
      </BloombergButton>

      <div className="flex gap-2 ml-4">
        <BloombergButton color="accent" onClick={onHelpClick} className="px-2 py-1.5 rounded bg-transparent text-[#666] hover:text-white transition-colors">
          <HelpCircle className="h-4 w-4" />
        </BloombergButton>
      </div>

      {/* Connect Wallet Button */}
      <div className="ml-2 flex items-center">
        <ConnectButton showBalance={false} />
      </div>

      {/* Control Buttons */}
      <div className="ml-auto flex items-center gap-3">
        <BloombergButton color="accent" onClick={refreshData} disabled={isLoading} className="text-[#666] hover:text-white transition-colors">
          {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </BloombergButton>
        <BloombergButton
          color={isRealTimeEnabled ? "red" : "green"}
          onClick={toggleRealTimeUpdates}
          disabled={isLoading}
          className={`px-3 py-1.5 text-xs font-bold rounded border transition-colors ${isRealTimeEnabled ? 'bg-red-950/30 text-red-500 border-red-900/50' : 'bg-emerald-950/30 text-emerald-500 border-emerald-900/50'}`}
        >
          {isRealTimeEnabled ? "LIVE: ON" : "LIVE: OFF"}
        </BloombergButton>

        {/* Data Status */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {isRealTimeEnabled ? (
            <Wifi className="h-3 w-3 text-emerald-500" />
          ) : isFromRedis ? (
            <Database className="h-3 w-3 text-emerald-500" />
          ) : (
            <AlertTriangle className="h-3 w-3 text-amber-500" />
          )}
          <span className={isFromRedis ? "text-emerald-500" : "text-amber-500"}>
            {dataSource === "alpha-vantage" ? "API" : isFromRedis ? "CACHE" : "LOCAL"}
          </span>
          {getDataFreshnessIndicator()}
          {lastUpdated && <span className="text-[#555]">{lastUpdated.toLocaleTimeString()}</span>}
        </div>
      </div>
    </div>
  );
}
