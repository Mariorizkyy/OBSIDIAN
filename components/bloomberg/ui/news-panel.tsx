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
    <div className="glass-panel p-4 rounded-xl flex flex-col h-full h-[800px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Newspaper className="h-4 w-4" style={{ color: colors.accent }} />
          LIVE NEWS
        </h3>
        <BloombergButton color="accent" onClick={() => fetchNews()} disabled={isLoading} className="text-xs">
          {isLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
        </BloombergButton>
      </div>

      <div className="overflow-y-auto pr-2 space-y-4 flex-1 custom-scrollbar">
        {error && <div className="p-2 text-xs text-rose-400 bg-rose-500/10 rounded-md">{error}</div>}
        {news.length === 0 && !isLoading && !error && (
          <div className="text-center py-8 text-xs text-gray-400">No news found</div>
        )}
        
        {news.map((item) => (
          <div
            key={item.url}
            className="p-3 border rounded-lg transition-all hover:bg-white/5 cursor-pointer"
            style={{ borderColor: colors.border, backgroundColor: colors.surface }}
            onClick={() => window.open(item.url, '_blank')}
          >
            <h4 className="text-xs font-bold mb-1 line-clamp-2 hover:text-emerald-400 transition-colors" style={{ color: colors.text }}>
              {item.title}
            </h4>
            <p className="text-[10px] mb-2 line-clamp-2 text-gray-400">{item.summary}</p>
            <div className="flex justify-between text-[9px] text-gray-500">
              <span className="font-semibold" style={{ color: colors.accent }}>{item.source}</span>
              <span>{formatPublishedTime(item.time_published)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
