
import React from "react";
import { JournalEntry } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import SentimentBadge from "./SentimentBadge";

interface MoodEntryListProps {
  entries: JournalEntry[];
}

const MoodEntryList: React.FC<MoodEntryListProps> = ({ entries }) => {
  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <Card key={entry.id} className="bg-white/90 backdrop-blur shadow-sm transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 mr-4">
                <p className="text-sm text-gray-500 mb-1">
                  {format(new Date(entry.createdAt), "MMMM d, yyyy • h:mm a")}
                </p>
                <p className="line-clamp-3">{entry.transcript}</p>
              </div>
              <SentimentBadge sentiment={entry.sentiment} />
            </div>
            {entry.audioUrl && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <audio controls src={entry.audioUrl} className="w-full h-8" />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MoodEntryList;
