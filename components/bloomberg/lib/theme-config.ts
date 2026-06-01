import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper function to conditionally join class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Bloomberg terminal color scheme
export const bloombergColors = {
  dark: {
    background: "transparent",
    surface: "rgba(255, 255, 255, 0.03)",
    header: "rgba(0, 0, 0, 0.5)",
    text: "#ffffff",
    textSecondary: "#a1a1aa",
    accent: "#10b981", // Emerald 500
    border: "rgba(255, 255, 255, 0.1)",
    positive: "#34d399", // Emerald 400
    negative: "#fb7185", // Rose 400
    sparklineGray: "#52525b",
  },
  light: {
    background: "#f0f0f0",
    surface: "#ffffff",
    header: "#e4e4e7",
    text: "#000000",
    textSecondary: "#52525b",
    accent: "#10b981",
    border: "#d4d4d8",
    positive: "#059669",
    negative: "#e11d48",
    sparklineGray: "#a1a1aa",
  },
};
