"use client";

import { useState } from "react";
import { useOBSIDIANIntel } from "../hooks/useOBSIDIANIntel";

export function AlphaFeed() {
  const {
    requestNewsAlpha,
    requestWhaleAlert,
    requestDEXAnomaly,
    requestNarrativeIntel,
    alphaFeed,
    txStatus,
  } = useOBSIDIANIntel();

  const [activeModal, setActiveModal] = useState<"NEWS" | "WHALE" | "DEX" | "NARRATIVE" | null>(null);
  const [inputValue, setInputValue] = useState("");

  const handleOpenModal = (type: "NEWS" | "WHALE" | "DEX" | "NARRATIVE") => {
    setActiveModal(type);
    setInputValue("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeModal) return;

    try {
      if (activeModal === "NEWS") await requestNewsAlpha(inputValue);
      if (activeModal === "WHALE") await requestWhaleAlert(inputValue);
      if (activeModal === "DEX") await requestDEXAnomaly(inputValue);
      if (activeModal === "NARRATIVE") await requestNarrativeIntel(inputValue);
      
      setActiveModal(null);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = () => {
    switch (txStatus) {
      case "idle": return "text-gray-500";
      case "submitting": return "text-yellow-400";
      case "pending": return "text-yellow-500 animate-pulse";
      case "committed": return "text-blue-400";
      case "processing": return "text-purple-400 animate-pulse";
      case "settled": return "text-[#00ff41]";
      case "failed": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="w-full h-full bg-[#0a0a0a] text-white font-mono flex flex-col border border-[#333]">
      {/* Header & Triggers */}
      <div className="p-4 border-b border-[#333] flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg tracking-widest text-[#00ff41] font-bold uppercase">
            &gt; OBSIDIAN_INTEL_NETWORK
          </h2>
          <div className="flex items-center gap-2 text-xs">
            <span>TX_STATUS:</span>
            <span className={`uppercase font-bold ${getStatusColor()}`}>
              [{txStatus}]
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => handleOpenModal("NEWS")} className="px-4 py-2 border border-[#333] hover:border-[#00ff41] hover:text-[#00ff41] bg-black text-xs uppercase transition-colors">
            [FETCH NEWS]
          </button>
          <button onClick={() => handleOpenModal("WHALE")} className="px-4 py-2 border border-[#333] hover:border-[#00ff41] hover:text-[#00ff41] bg-black text-xs uppercase transition-colors">
            [WHALE ALERT]
          </button>
          <button onClick={() => handleOpenModal("DEX")} className="px-4 py-2 border border-[#333] hover:border-[#00ff41] hover:text-[#00ff41] bg-black text-xs uppercase transition-colors">
            [DEX SCAN]
          </button>
          <button onClick={() => handleOpenModal("NARRATIVE")} className="px-4 py-2 border border-[#333] hover:border-[#00ff41] hover:text-[#00ff41] bg-black text-xs uppercase transition-colors">
            [NARRATIVE]
          </button>
        </div>
      </div>

      {/* Live Feed */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
        {alphaFeed.length === 0 ? (
          <div className="text-[#444] text-xs uppercase text-center mt-10">
            No intel items found in the network.
          </div>
        ) : (
          alphaFeed.map((intel, idx) => (
            <div key={idx} className="border border-[#222] bg-[#0d0d0d] p-4 flex flex-col gap-3 hover:border-[#444] transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-[10px] font-bold border ${
                    intel.alphaType === 'NEWS' ? 'border-blue-500 text-blue-500' :
                    intel.alphaType === 'WHALE' ? 'border-purple-500 text-purple-500' :
                    intel.alphaType === 'DEX' ? 'border-yellow-500 text-yellow-500' :
                    'border-pink-500 text-pink-500'
                  }`}>
                    {intel.alphaType}
                  </span>
                  <span className="text-[10px] text-[#555] uppercase">
                    SRC: {intel.source}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#888]">
                    {new Date(intel.timestamp * 1000).toLocaleTimeString()}
                  </span>
                  <span className={`text-[10px] flex items-center gap-1 ${intel.settled ? 'text-[#00ff41]' : 'text-yellow-500'}`}>
                    {intel.settled ? '● SETTLED' : '◌ PROCESSING'}
                  </span>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-gray-300">
                {intel.summary}
              </p>

              {intel.settled && (
                <div className="text-xs flex items-center gap-2">
                  <span className="text-[#555]">CONFIDENCE:</span>
                  <span className={intel.confidence > 80 ? 'text-[#00ff41]' : 'text-yellow-400'}>
                    {intel.confidence}%
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input Modal */}
      {activeModal && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="border border-[#00ff41] bg-[#0a0a0a] p-6 w-full max-w-md shadow-[0_0_15px_rgba(0,255,65,0.2)]">
            <h3 className="text-[#00ff41] text-sm uppercase font-bold mb-4">
              &gt; INITIALIZE {activeModal} QUERY
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  activeModal === "NEWS" ? "Enter RSS URL..." :
                  activeModal === "WHALE" ? "Enter Wallet Address..." :
                  activeModal === "DEX" ? "Enter Asset Symbol (e.g. ETH)..." :
                  "Enter Narrative Keyword..."
                }
                className="bg-black border border-[#333] text-white p-3 text-sm focus:outline-none focus:border-[#00ff41] transition-colors"
                autoFocus
              />
              <div className="flex justify-end gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-[#333] text-[#888] hover:text-white text-xs uppercase"
                >
                  [CANCEL]
                </button>
                <button 
                  type="submit"
                  disabled={!inputValue.trim() || txStatus === "submitting"}
                  className="px-4 py-2 bg-[#00ff41] text-black font-bold text-xs uppercase hover:bg-[#00cc33] disabled:opacity-50"
                >
                  {txStatus === "submitting" ? "[AWAITING SIGNATURE...]" : "[EXECUTE]"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
