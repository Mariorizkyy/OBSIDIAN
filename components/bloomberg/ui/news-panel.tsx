"use client";

import { fetchFinancialNews } from "@/lib/alpha-vantage";
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
      const newsData = await fetchFinancialNews("crypto market");
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
    <div className="glass-panel p-6 rounded-3xl flex flex-col h-full h-[800px] shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
      
      <div className="flex justify-between items-center mb-6 z-10 relative">
        <h3 className="text-lg font-extrabold flex items-center gap-3 tracking-wide" style={{ color: colors.accent }}>
          <Newspaper className="h-5 w-5" />
          LIVE NEWS
        </h3>
        <BloombergButton color="accent" onClick={() => fetchNews()} disabled={isLoading} className="p-2 rounded-xl transition-transform hover:scale-110">
          {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </BloombergButton>
      </div>

      <div className="overflow-y-auto pr-3 space-y-4 flex-1 custom-scrollbar z-10 relative">
        {error && <div className="p-3 text-sm font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl shadow-lg">{error}</div>}
        {news.length === 0 && !isLoading && !error && (
          <div className="text-center py-10 text-sm text-gray-400">No news found</div>
        )}
        
        {news.map((item) => (
          <div
            key={item.url}
            className="p-4 border border-white/5 rounded-2xl transition-all duration-300 hover:bg-white/10 hover:border-emerald-500/30 cursor-pointer shadow-sm group"
            onClick={() => window.open(item.url, '_blank')}
          >
            <h4 className="text-sm font-bold mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors drop-shadow-sm leading-relaxed" style={{ color: colors.text }}>
              {item.title}
            </h4>
            <p className="text-xs mb-3 line-clamp-2 text-gray-400 leading-relaxed">{item.summary}</p>
            <div className="flex justify-between text-[10px] text-gray-500 font-medium">
              <span className="font-bold tracking-wider" style={{ color: colors.accent }}>{item.source}</span>
              <span>{formatPublishedTime(item.time_published)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
