
import React, { useState } from "react";
import { JournalEntry } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import SentimentBadge from "./SentimentBadge";
import { Button } from "@/components/ui/button";
import { Trash, Pencil } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useJournal } from "../contexts/JournalContext";

interface MoodEntryListProps {
  entries: JournalEntry[];
}

const MoodEntryList: React.FC<MoodEntryListProps> = ({ entries }) => {
  const { deleteEntry, updateEntry } = useJournal();
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [editedText, setEditedText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEditClick = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setEditedText(entry.transcript);
    setIsDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (editingEntry && editedText.trim() !== "") {
      await updateEntry(editingEntry.id, editedText);
      setIsDialogOpen(false);
      setEditingEntry(null);
    }
  };

  const handleDeleteEntry = (id: string) => {
    deleteEntry(id);
  };

  // Sort entries in chronological order (oldest to newest)
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <>
      <div className="space-y-3">
        {sortedEntries.map((entry) => (
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
              
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditClick(entry)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-500 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete
                        this journal entry.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Journal Entry</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="min-h-[150px]"
            placeholder="Edit your journal entry..."
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MoodEntryList;
