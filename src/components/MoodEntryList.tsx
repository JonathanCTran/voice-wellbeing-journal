
import React, { useState } from "react";
import { JournalEntry } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import SentimentBadge from "./SentimentBadge";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJournal } from "@/contexts/JournalContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MoodEntryListProps {
  entries: JournalEntry[];
}

const MoodEntryList: React.FC<MoodEntryListProps> = ({ entries }) => {
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const { deleteEntry } = useJournal();

  const handleDeleteConfirm = () => {
    if (entryToDelete) {
      deleteEntry(entryToDelete);
      setEntryToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setEntryToDelete(null);
  };

  return (
    <>
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
                <div className="flex items-center space-x-2">
                  <SentimentBadge sentiment={entry.sentiment} />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                    onClick={() => setEntryToDelete(entry.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {entry.audioUrl && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <audio controls src={entry.audioUrl} className="w-full h-8" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {entries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No journal entries yet. Start recording to create your first entry.</p>
          </div>
        )}
      </div>

      <AlertDialog open={!!entryToDelete} onOpenChange={() => setEntryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MoodEntryList;
