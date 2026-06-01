"use client";

import { ExternalLink, RefreshCw, Newspaper } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { BloombergButton } from "../core/bloomberg-button";

interface NewsItem {
  title: string;
  summary: string;
  url: string;
  time_published: string;
  source: string;
}

interface NewsPanelProps {
  colors: any;
}

export function NewsPanel({ colors }: NewsPanelProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch("/api/news", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("API error");
      }
      const newsData = await response.json();
      
      if (newsData && newsData.length > 0) {
        setNews(newsData.slice(0, 10)); // Only show top 10 to save space
      } else {
        setError("Could not fetch news data.");
      }
    } catch (err) {
      setError("Failed to fetch news");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const formatPublishedTime = (timeString: string) => {
    const alphaVantageFormat = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/;
    const match = timeString.match(alphaVantageFormat);
    let date: Date;
    if (match) {
      const [, year, month, day, hour, minute, second] = match;
      date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second)
      );
    } else {
      date = new Date(timeString);
    }
    if (Number.isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return (
    <div className="bg-[#0A0A0A] p-5 rounded-xl flex flex-col h-full lg:h-[800px] border border-[#222] shadow-sm relative overflow-hidden">
      
      <div className="flex justify-between items-center mb-5 z-10 relative">
        <h3 className="text-xs font-semibold flex items-center gap-2 text-[#888] uppercase tracking-wider">
          <Newspaper className="h-4 w-4" />
          Intelligence Feed
        </h3>
        <BloombergButton color="accent" onClick={() => fetchNews()} disabled={isLoading} className="h-6 w-6 p-0 flex items-center justify-center rounded bg-[#111] text-[#888] hover:text-white border border-[#333]">
          {isLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
        </BloombergButton>
      </div>

      <div className="overflow-y-auto pr-2 space-y-2 flex-1 custom-scrollbar z-10 relative">
        {error && <div className="p-3 text-xs font-medium text-red-500 bg-red-950/20 border border-red-900/30 rounded-md">{error}</div>}
        {news.length === 0 && !isLoading && !error && (
          <div className="text-center py-10 text-xs text-[#555]">No intelligence found</div>
        )}
        
        {news.map((item) => (
          <div
            key={item.url}
            className="p-3 bg-[#0f0f0f] border border-[#222] rounded-lg transition-colors duration-200 hover:bg-[#1a1a1a] hover:border-[#333] cursor-pointer group"
            onClick={() => window.open(item.url, '_blank')}
          >
            <h4 className="text-sm font-medium mb-1 line-clamp-2 text-[#e5e5e5] group-hover:text-white transition-colors leading-snug">
              {item.title}
            </h4>
            <p className="text-[11px] mb-2 line-clamp-2 text-[#888] leading-relaxed">{item.summary}</p>
            <div className="flex justify-between text-[10px] text-[#666] font-medium uppercase tracking-wider">
              <span className="text-white">{item.source}</span>
              <span>{formatPublishedTime(item.time_published)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
