"use client";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Send, X, Lock } from "lucide-react";
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
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { isConnected, address } = useAccount();
  const { sendTransactionAsync, data: hash } = useSendTransaction();
  const { isLoading: isWaitingForTx } = useWaitForTransactionReceipt({ hash });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!isConnected) {
      alert("⚠️ SECURITY NO 1: Please CONNECT WALLET first in the top right corner to access OBSIDIAN AI.");
      return;
    }

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      // Prompt MetaMask to sign the AI Request Transaction to Ritual Network
      const txHash = await sendTransactionAsync({
        to: "0x0000000000000000000000000000000000000802", // Ritual LLM Precompile
        value: 0n,
        data: "0x" // Dummy payload for demo purposes
      });
      
      // We simulate waiting for the AI response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: `[RITUAL ON-CHAIN RESPONSE]\nTX Hash: ${txHash.slice(0,10)}...\n\nI have analyzed ${selectedSecurity?.id || 'the market'} using the GLM-4.7-FP8 model on Ritual Testnet. The sentiment is highly volatile. Proceed with caution, agent.` 
        }]);
        setIsLoading(false);
      }, 4000);

    } catch (err: any) {
      setError(err);
      setIsLoading(false);
    }
  };

  const generateCommentary = async () => {
    if (!isConnected) {
      alert("⚠️ SECURITY NO 1: Please CONNECT WALLET first to request on-chain commentary.");
      return;
    }
    const prompt = `Provide a brief market commentary on ${selectedSecurity?.id} compared to ${benchmarkSecurity?.id}.`;
    setInput(prompt);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const isProcessing = isLoading || isWaitingFo  return (
    <div className="glass-panel p-8 rounded-3xl shadow-2xl relative overflow-hidden">
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
      
      <div className="flex justify-between items-center mb-6 z-10 relative">
        <h3 className="text-xl font-extrabold flex items-center gap-3 tracking-wide neon-text-green">
          <Lock className="h-6 w-6 text-emerald-400" />
          OBSIDIAN AI Core <span className="text-xs text-emerald-500 font-mono tracking-normal border border-emerald-500/30 px-2 py-1 rounded-full bg-emerald-500/10">WEB3 SECURED</span>
        </h3>
        <div className="flex gap-3">
          <BloombergButton
            color="accent"
            onClick={generateCommentary}
            disabled={isProcessing}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)]"
          >
            <RefreshCw className="h-4 w-4" />
            ANALYZE
          </BloombergButton>
          {messages.length > 0 && (
            <BloombergButton
              color="red"
              onClick={clearChat}
              disabled={isProcessing}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all hover:scale-105"
            >
              <X className="h-4 w-4" />
              CLEAR
            </BloombergButton>
          )}
        </div>
      </div>

      {/* AI Commentary Section */}
      <div
        className="p-6 mb-6 border border-white/10 rounded-2xl text-sm font-mono shadow-inner z-10 relative bg-black/50 custom-scrollbar"
        style={{
          minHeight: "200px",
          maxHeight: "350px",
          overflowY: "auto"
        }}
      >
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3 py-10">
            <Lock className="h-10 w-10 text-rose-500/50 mb-2" />
            <p className="text-lg font-bold text-gray-400 tracking-wider">WALLET NOT CONNECTED</p>
            <p className="text-xs text-gray-500">Connect wallet to interact with Ritual AI.</p>
          </div>
        ) : isProcessing ? (
          <div className="flex flex-col gap-3 py-4">
            <p className="text-emerald-400 font-bold tracking-widest animate-pulse mb-2">WAITING FOR WALLET SIGNATURE & RITUAL TEE EXECUTION...</p>
            <Skeleton className="h-5 w-3/4 bg-emerald-500/20" />
            <Skeleton className="h-5 w-1/2 bg-emerald-500/20" />
            <Skeleton className="h-5 w-5/6 bg-emerald-500/20" />
          </div>
        ) : error ? (
          <p className="text-sm font-bold text-rose-400 bg-rose-500/10 p-4 rounded-xl border border-rose-500/30">
            TRANSACTION FAILED: {error.message.split('\n')[0]}
          </p>
        ) : messages.length > 0 ? (
          <div className="flex flex-col gap-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={msg.role === "user" ? "text-gray-300" : "text-emerald-400"}>
                <span className="font-extrabold opacity-60 tracking-widest block mb-1">{msg.role === "user" ? "> YOU:" : "> OBSIDIAN:"}</span>
                <p className="whitespace-pre-line leading-relaxed text-base">{msg.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col h-full justify-center opacity-70">
            <p className="text-emerald-400 mb-2 font-bold tracking-widest">SYSTEM ONLINE.</p>
            <p className="text-gray-400">
              Connected to Ritual Testnet ({address?.slice(0,6)}...{address?.slice(-4)}).<br/>
              Ready to process on-chain AI queries.
            </p>
          </div>
        )}
      </div>

      {/* Question and Answer Section */}
      <div className="z-10 relative">
        <h4 className="text-sm font-extrabold mb-3 text-gray-300 tracking-widest">EXECUTE ON-CHAIN QUERY</h4>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={isConnected ? "Enter prompt for Ritual LLM..." : "Connect wallet to type..."}
            className="flex-1 h-14 text-sm font-mono rounded-2xl border-white/20 bg-black/40 focus:ring-emerald-500 focus:border-emerald-500 px-4 transition-colors"
            style={{ color: colors.text }}
            disabled={isProcessing || !isConnected}
          />
          <BloombergButton
            type="submit"
            color="accent"
            disabled={isProcessing || !input.trim() || !isConnected}
            className="flex items-center gap-2 text-sm px-6 font-bold rounded-2xl transition-all hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
"use client";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Send, X, Lock } from "lucide-react";
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
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { isConnected, address } = useAccount();
  const { sendTransactionAsync, data: hash } = useSendTransaction();
  const { isLoading: isWaitingForTx } = useWaitForTransactionReceipt({ hash });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!isConnected) {
      alert("⚠️ SECURITY NO 1: Please CONNECT WALLET first in the top right corner to access OBSIDIAN AI.");
      return;
    }

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      // Prompt MetaMask to sign the AI Request Transaction to Ritual Network
      const txHash = await sendTransactionAsync({
        to: "0x0000000000000000000000000000000000000802", // Ritual LLM Precompile
        value: 0n,
        data: "0x" // Dummy payload for demo purposes
      });
      
      // We simulate waiting for the AI response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: `[RITUAL ON-CHAIN RESPONSE]\nTX Hash: ${txHash.slice(0,10)}...\n\nI have analyzed ${selectedSecurity?.id || 'the market'} using the GLM-4.7-FP8 model on Ritual Testnet. The sentiment is highly volatile. Proceed with caution, agent.` 
        }]);
        setIsLoading(false);
      }, 4000);

    } catch (err: any) {
      setError(err);
      setIsLoading(false);
    }
  };

  const generateCommentary = async () => {
    if (!isConnected) {
      alert("⚠️ SECURITY NO 1: Please CONNECT WALLET first to request on-chain commentary.");
      return;
    }
    const prompt = `Provide a brief market commentary on ${selectedSecurity?.id} compared to ${benchmarkSecurity?.id}.`;
    setInput(prompt);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const isProcessing = isLoading || isWaitingForTx;

  return (
    <div className="glass-panel p-8 rounded-3xl shadow-2xl relative overflow-hidden">
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
      
      <div className="flex justify-between items-center mb-6 z-10 relative">
        <h3 className="text-xl font-extrabold flex items-center gap-3 tracking-wide neon-text-green">
          <Lock className="h-6 w-6 text-emerald-400" />
          OBSIDIAN AI Core <span className="text-xs text-emerald-500 font-mono tracking-normal border border-emerald-500/30 px-2 py-1 rounded-full bg-emerald-500/10">WEB3 SECURED</span>
        </h3>
        <div className="flex gap-3">
          <BloombergButton
            color="accent"
            onClick={generateCommentary}
            disabled={isProcessing}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)]"
          >
            <RefreshCw className="h-4 w-4" />
            ANALYZE
          </BloombergButton>
          {messages.length > 0 && (
            <BloombergButton
              color="red"
              onClick={clearChat}
              disabled={isProcessing}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all hover:scale-105"
            >
              <X className="h-4 w-4" />
              CLEAR
            </BloombergButton>
          )}
        </div>
      </div>

      {/* AI Commentary Section */}
      <div
        className="p-6 mb-6 border border-white/10 rounded-2xl text-sm font-mono shadow-inner z-10 relative bg-black/50 custom-scrollbar"
        style={{
          minHeight: "200px",
          maxHeight: "350px",
          overflowY: "auto"
        }}
      >
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3 py-10">
            <Lock className="h-10 w-10 text-rose-500/50 mb-2" />
            <p className="text-lg font-bold text-gray-400 tracking-wider">WALLET NOT CONNECTED</p>
            <p className="text-xs text-gray-500">Connect wallet to interact with Ritual AI.</p>
          </div>
        ) : isProcessing ? (
          <div className="flex flex-col gap-3 py-4">
            <p className="text-emerald-400 font-bold tracking-widest animate-pulse mb-2">WAITING FOR WALLET SIGNATURE & RITUAL TEE EXECUTION...</p>
            <Skeleton className="h-5 w-3/4 bg-emerald-500/20" />
            <Skeleton className="h-5 w-1/2 bg-emerald-500/20" />
            <Skeleton className="h-5 w-5/6 bg-emerald-500/20" />
          </div>
        ) : error ? (
          <p className="text-sm font-bold text-rose-400 bg-rose-500/10 p-4 rounded-xl border border-rose-500/30">
            TRANSACTION FAILED: {error.message.split('\n')[0]}
          </p>
        ) : messages.length > 0 ? (
          <div className="flex flex-col gap-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={msg.role === "user" ? "text-gray-300" : "text-emerald-400"}>
                <span className="font-extrabold opacity-60 tracking-widest block mb-1">{msg.role === "user" ? "> YOU:" : "> OBSIDIAN:"}</span>
                <p className="whitespace-pre-line leading-relaxed text-base">{msg.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col h-full justify-center opacity-70">
            <p className="text-emerald-400 mb-2 font-bold tracking-widest">SYSTEM ONLINE.</p>
            <p className="text-gray-400">
              Connected to Ritual Testnet ({address?.slice(0,6)}...{address?.slice(-4)}).<br/>
              Ready to process on-chain AI queries.
            </p>
          </div>
        )}
      </div>

      {/* Question and Answer Section */}
      <div className="z-10 relative">
        <h4 className="text-sm font-extrabold mb-3 text-gray-300 tracking-widest">EXECUTE ON-CHAIN QUERY</h4>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={isConnected ? "Enter prompt for Ritual LLM..." : "Connect wallet to type..."}
            className="flex-1 h-14 text-sm font-mono rounded-2xl border-white/20 bg-black/40 focus:ring-emerald-500 focus:border-emerald-500 px-4 transition-colors"
            style={{ color: colors.text }}
            disabled={isProcessing || !isConnected}
          />
          <BloombergButton
            type="submit"
            color="accent"
            disabled={isProcessing || !input.trim() || !isConnected}
            className="flex items-center gap-2 text-sm px-6 font-bold rounded-2xl transition-all hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
          >
            <Send className="h-5 w-5" />
            SEND TX
          </BloombergButton>
        </form>
      </div>
    </div>
  );
}
