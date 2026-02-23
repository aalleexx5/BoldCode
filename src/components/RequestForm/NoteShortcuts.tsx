import React, { useState, useEffect } from 'react';
import { SMCalendarNote } from '../../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { StickyNote } from 'lucide-react';
import { NoteModal } from '../SMCalendar/NoteModal';

interface NoteShortcutsProps {
  requestId: string;
}

export const NoteShortcuts: React.FC<NoteShortcutsProps> = ({ requestId }) => {
  const [notes, setNotes] = useState<SMCalendarNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<SMCalendarNote | undefined>();
  const [showNoteModal, setShowNoteModal] = useState(false);

  useEffect(() => {
    const notesQuery = query(
      collection(db, 'sm_calendar_notes'),
      where('request_id', '==', requestId)
    );

    const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
      const notesData: SMCalendarNote[] = [];
      snapshot.forEach((doc) => {
        notesData.push({ id: doc.id, ...doc.data() } as SMCalendarNote);
      });
      setNotes(notesData.sort((a, b) => a.date.localeCompare(b.date)));
    });

    return () => unsubscribe();
  }, [requestId]);

  const handleNoteClick = (note: SMCalendarNote) => {
    setSelectedNote(note);
    setShowNoteModal(true);
  };

  const handleSaveNote = async (noteData: Partial<SMCalendarNote>) => {
    if (!noteData.id) return;

    try {
      const noteRef = doc(db, 'sm_calendar_notes', noteData.id);
      await updateDoc(noteRef, {
        title: noteData.title,
        content: noteData.content,
        emoji: noteData.emoji,
        color: noteData.color,
        request_id: noteData.request_id || null,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving note:', error);
      throw error;
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteDoc(doc(db, 'sm_calendar_notes', noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  };

  if (notes.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <StickyNote className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-800">SM Calendar Notes</h3>
        </div>
        <div className="space-y-2">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => handleNoteClick(note)}
              className="w-full text-left px-3 py-2 rounded-lg transition group flex items-start justify-between gap-3 hover:opacity-80"
              style={{
                backgroundColor: `${note.color || '#3b82f6'}20`,
                borderLeft: `3px solid ${note.color || '#3b82f6'}`
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{note.emoji || '📝'}</span>
                  <span className="font-medium text-sm truncate" style={{ color: note.color || '#3b82f6' }}>
                    {note.title}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(note.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })} • {note.note_number}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {showNoteModal && selectedNote && (
        <NoteModal
          note={selectedNote}
          date={selectedNote.date}
          onClose={() => {
            setShowNoteModal(false);
            setSelectedNote(undefined);
          }}
          onSave={handleSaveNote}
          onDelete={handleDeleteNote}
        />
      )}
    </>
  );
};
