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
          className="w-full text-left px-2 py-1.5 rounded text-xs transition group flex items-start justify-between gap-2 hover:opacity-80"
          style={{
            backgroundColor: `${note.color || '#3b82f6'}20`,
            borderLeft: `3px solid ${note.color || '#3b82f6'}`
          }}
        >
          <span className="flex items-center gap-1.5 flex-1 truncate font-medium" style={{ color: note.color || '#3b82f6' }}>
            <span className="text-sm">{note.emoji || '📝'}</span>
            <span>{note.title}</span>
          </span>
          <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition flex-shrink-0 mt-0.5" style={{ color: note.color || '#3b82f6' }} />
        </button>
      ))}
    </div>
  );
};
