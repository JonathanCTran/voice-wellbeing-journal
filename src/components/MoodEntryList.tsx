
import React, { useState } from "react";
import { JournalEntry } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import SentimentBadge from "./SentimentBadge";
import { Trash, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJournal } from "@/contexts/JournalContext";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface MoodEntryListProps {
  entries: JournalEntry[];
}

const MoodEntryList: React.FC<MoodEntryListProps> = ({ entries }) => {
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [entryToEdit, setEntryToEdit] = useState<string | null>(null);
  const [editedTranscript, setEditedTranscript] = useState("");
  const { deleteEntry, updateEntry } = useJournal();

  const handleDeleteConfirm = () => {
    if (entryToDelete) {
      deleteEntry(entryToDelete);
      setEntryToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setEntryToDelete(null);
  };

  const handleEditStart = (entry: JournalEntry) => {
    setEntryToEdit(entry.id);
    setEditedTranscript(entry.transcript);
  };

  const handleEditSave = () => {
    if (entryToEdit && editedTranscript.trim()) {
      updateEntry(entryToEdit, editedTranscript.trim());
      setEntryToEdit(null);
    }
  };

  const handleEditCancel = () => {
    setEntryToEdit(null);
    setEditedTranscript("");
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
                    className="h-8 w-8 text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                    onClick={() => handleEditStart(entry)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
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

      {/* Delete confirmation dialog */}
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

      {/* Edit entry dialog */}
      <Dialog open={!!entryToEdit} onOpenChange={(open) => !open && handleEditCancel()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Journal Entry</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              value={editedTranscript}
              onChange={(e) => setEditedTranscript(e.target.value)}
              placeholder="Edit your journal entry..."
              className="min-h-[150px]"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={handleEditCancel}>Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleEditSave}
              disabled={!editedTranscript.trim()}
              className="bg-mood-blue hover:bg-mood-blue/90"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MoodEntryList;
