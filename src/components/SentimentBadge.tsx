
import React from "react";
import { Sentiment } from "../types";
import { cn } from "@/lib/utils";

interface SentimentBadgeProps {
  sentiment: Sentiment;
  size?: "sm" | "md" | "lg";
}

const SentimentBadge: React.FC<SentimentBadgeProps> = ({ sentiment, size = "md" }) => {
  const { label, score } = sentiment;

  const getColor = () => {
    if (label === "positive") return "bg-mood-green text-green-900";
    if (label === "negative") return "bg-mood-red text-red-900";
    return "bg-gray-200 text-gray-700";
  };

  const getSize = () => {
    switch (size) {
      case "sm": return "text-xs px-2 py-0.5";
      case "md": return "text-sm px-2.5 py-0.5";
      case "lg": return "text-base px-3 py-1";
    }
  };

  const getEmoji = () => {
    if (score > 0.7) return "😄";
    if (score > 0.3) return "🙂";
    if (score > -0.3) return "😐";
    if (score > -0.7) return "😕";
    return "😢";
  };

  return (
    <div 
      className={cn(
        "rounded-full font-medium flex items-center",
        getColor(),
        getSize()
      )}
    >
      <span className="mr-1">{getEmoji()}</span>
      <span className="capitalize">{label}</span>
    </div>
  );
};

export default SentimentBadge;
