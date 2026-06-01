"use client";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Send, Lock, Activity } from "lucide-react";
import { useState } from "react";
import { BloombergButton } from "../core/bloomberg-button";
import type { MarketItem } from "../types";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";

interface AiMarketAnalysisProps {
  selectedSecurity?: MarketItem;
  benchmarkSecurity?: MarketItem;
  colors: {
    background: string;
    surface: string;
    text: string;
    border: string;
    accent: string;
    positive: string;
    negative: string;
  };
}

export function AiMarketAnalysis({
  selectedSecurity,
  benchmarkSecurity,
  colors,
}: AiMarketAnalysisProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{role: string, content: string, timestamp: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { isConnected, address } = useAccount();
  const { sendTransactionAsync, data: hash } = useSendTransaction();
  const { isLoading: isWaitingForTx } = useWaitForTransactionReceipt({ hash });

  const getTimestamp = () => new Date().toISOString().split('T')[1].slice(0, 8);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!isConnected) {
      alert("AUTH REQUIRED: Connect wallet to access intelligence terminal.");
      return;
    }

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage, timestamp: getTimestamp() }]);
    setIsLoading(true);
    setError(null);

    try {
      const txHash = await sendTransactionAsync({
        to: "0x0000000000000000000000000000000000000802",
        value: 0n,
        data: "0x" 
      });
      
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: "system", 
          content: `[TX: ${txHash.slice(0,10)}...] Analysis complete. Market sentiment for ${selectedSecurity?.id || 'target entity'} indicates significant institutional movement. Volatility index is elevated.`,
          timestamp: getTimestamp()
        }]);
        setIsLoading(false);
      }, 3500);

    } catch (err: any) {
      setError(err);
      setIsLoading(false);
    }
  };

  const isProcessing = isLoading || isWaitingForTx;

  return (
    <div className="glass-panel rounded-xl shadow-sm flex-1 flex flex-col h-full bg-[#050505]">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-[#222]">
        <div className="flex items-center gap-3">
          <Activity className="h-4 w-4 text-[#888]" />
          <h3 className="text-sm font-semibold tracking-tight text-white">
            Intelligence Terminal
          </h3>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium tracking-wider bg-[#111] border border-[#333] text-[#888]">
            {isConnected ? "CONNECTED" : "SECURED"}
          </span>
        </div>
        <div className="text-xs text-[#666] font-mono">
          {address ? `${address.slice(0,6)}...${address.slice(-4)}` : "Not Authenticated"}
        </div>
      </div>

      {/* Logs Section */}
      <div
        className="p-6 flex-1 bg-[#050505] custom-scrollbar text-sm"
        style={{ overflowY: "auto" }}
      >
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center h-full text-[#555] gap-3">
            <Lock className="h-6 w-6 mb-2 text-[#444]" />
            <p className="text-sm font-medium tracking-tight text-[#888]">AUTHENTICATION REQUIRED</p>
            <p className="text-xs text-[#555]">Wallet connection needed for on-chain intelligence queries.</p>
          </div>
        ) : isProcessing ? (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center gap-3 text-[#888] text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              AWAITING NETWORK SIGNATURE...
            </div>
            <Skeleton className="h-4 w-3/4 bg-[#1a1a1a]" />
            <Skeleton className="h-4 w-1/2 bg-[#1a1a1a]" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-md border border-red-900/30 bg-red-950/20 text-red-400 text-xs font-mono">
            ERR: {error.message.split('\n')[0]}
          </div>
        ) : messages.length > 0 ? (
          <div className="flex flex-col gap-5">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "text-[#aaa]" : "text-white"}`}>
                <div className="text-[10px] text-[#444] font-mono mt-1 w-16 shrink-0">{msg.timestamp}</div>
                <div className="flex-1">
                  <span className="font-semibold text-xs tracking-tight uppercase text-[#666] block mb-1">
                    {msg.role === "user" ? "Client" : "System"}
                  </span>
                  <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col h-full justify-end opacity-50">
            <div className="flex gap-4 text-[#888]">
              <div className="text-[10px] text-[#444] font-mono mt-1 w-16 shrink-0">{getTimestamp()}</div>
              <div>
                <span className="font-semibold text-xs tracking-tight uppercase text-[#666] block mb-1">System</span>
                <p>Connection established to intelligence network.</p>
                <p>Awaiting operational directives.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="p-4 border-t border-[#222] bg-[#0A0A0A] rounded-b-xl">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={isConnected ? "Enter query..." : "Connect wallet..."}
            className="flex-1 h-10 text-sm bg-[#050505] border-[#333] text-white focus:border-white focus:ring-0 rounded-md transition-colors placeholder:text-[#555]"
            disabled={isProcessing || !isConnected}
          />
          <BloombergButton
            type="submit"
            color="accent"
            disabled={isProcessing || !input.trim() || !isConnected}
            className="h-10 px-4 text-xs font-semibold rounded-md bg-white text-black hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Send className="h-3 w-3" />
            EXECUTE
          </BloombergButton>
        </form>
      </div>
    </div>
  );
}
