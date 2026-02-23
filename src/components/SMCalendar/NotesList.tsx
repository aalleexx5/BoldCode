import React from 'react';
import { SMCalendarNote } from '../../lib/firebase';
import { Edit2 } from 'lucide-react';

interface NotesListProps {
  notes: SMCalendarNote[];
  onEditNote: (note: SMCalendarNote) => void;
}

export const NotesList: React.FC<NotesListProps> = ({ notes, onEditNote }) => {
  if (notes.length === 0) {
    return null;
  }

  return (
    <div className="mt-1 space-y-1">
      {notes.map((note) => (
        <button
          key={note.id}
          onClick={() => onEditNote(note)}
          className="w-full text-left px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded text-xs text-blue-700 transition group flex items-start justify-between gap-2"
        >
          <span className="flex-1 truncate font-medium">
            {note.note_number}: {note.title}
          </span>
          <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition flex-shrink-0 mt-0.5" />
        </button>
      ))}
    </div>
  );
};
