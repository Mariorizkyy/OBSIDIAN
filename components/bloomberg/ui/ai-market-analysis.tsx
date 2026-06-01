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
    <div
      className="p-4 border rounded-sm"
      style={{ borderColor: colors.border, backgroundColor: colors.surface }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Lock className="h-4 w-4 text-green-500" />
          OBSIDIAN AI Core (Web3 Secured)
        </h3>
        <div className="flex gap-2">
          <BloombergButton
            color="accent"
            onClick={generateCommentary}
            disabled={isProcessing}
            className="flex items-center gap-1 text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            ANALYZE
          </BloombergButton>
          {messages.length > 0 && (
            <BloombergButton
              color="red"
              onClick={clearChat}
              disabled={isProcessing}
              className="flex items-center gap-1 text-xs"
            >
              <X className="h-3 w-3" />
              CLEAR
            </BloombergButton>
          )}
        </div>
      </div>

      {/* AI Commentary Section */}
      <div
        className="p-3 mb-4 border rounded-sm text-xs font-mono"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.background,
          minHeight: "120px",
          maxHeight: "300px",
          overflowY: "auto"
        }}
      >
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
            <Lock className="h-6 w-6" />
            <p>Wallet Not Connected</p>
            <p className="text-[10px]">Connect wallet to interact with Ritual AI.</p>
          </div>
        ) : isProcessing ? (
          <div className="flex flex-col gap-2">
            <p className="text-green-500">Waiting for wallet signature and Ritual TEE execution...</p>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : error ? (
          <p className="text-xs text-red-500">
            TRANSACTION FAILED: {error.message.split('\\n')[0]}
          </p>
        ) : messages.length > 0 ? (
          <div className="flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={msg.role === "user" ? "text-gray-400" : "text-green-400"}>
                <span className="font-bold opacity-50">{msg.role === "user" ? "> YOU:" : "> OBSIDIAN:"}</span>
                <p className="whitespace-pre-line mt-1">{msg.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            Connected to Ritual Testnet ({address?.slice(0,6)}...{address?.slice(-4)}).<br/>
            Ready to process on-chain AI queries.
          </p>
        )}
      </div>

      {/* Question and Answer Section */}
      <div className="mb-4">
        <h4 className="text-xs font-bold mb-2">Execute On-Chain Query</h4>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={isConnected ? "Enter prompt for Ritual LLM..." : "Connect wallet to type..."}
            className="flex-1 h-8 text-xs font-mono rounded-none border focus:ring-0 focus:ring-offset-0"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text,
            }}
            disabled={isProcessing || !isConnected}
          />
          <BloombergButton
            type="submit"
            color="accent"
            disabled={isProcessing || !input.trim() || !isConnected}
            className="flex items-center gap-1 text-xs"
          >
            <Send className="h-3 w-3" />
            SEND TX
          </BloombergButton>
        </form>
      </div>
    </div>
  );
}
