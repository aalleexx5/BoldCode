import React from 'react';
import { SMCalendarNote } from '../../lib/firebase';
import { Edit2, Copy } from 'lucide-react';

interface NotesListProps {
  notes: SMCalendarNote[];
  onEditNote: (note: SMCalendarNote) => void;
  onDragStart: (e: React.DragEvent, noteId: string) => void;
  onDuplicateNote: (note: SMCalendarNote) => void;
}

export const NotesList: React.FC<NotesListProps> = ({ notes, onEditNote, onDragStart, onDuplicateNote }) => {
  if (notes.length === 0) {
    return null;
  }

  const handleDuplicateClick = (e: React.MouseEvent, note: SMCalendarNote) => {
    e.stopPropagation();
    onDuplicateNote(note);
  };

  return (
    <div className="mt-1 space-y-1">
      {notes.map((note) => (
        <div
          key={note.id}
          draggable
          onDragStart={(e) => onDragStart(e, note.id)}
          onClick={() => onEditNote(note)}
          className="w-full text-left px-2 py-1.5 rounded text-xs transition group flex items-start justify-between gap-2 hover:opacity-80 cursor-move"
          style={{
            backgroundColor: `${note.color || '#3b82f6'}20`,
            borderLeft: `3px solid ${note.color || '#3b82f6'}`
          }}
        >
          <span className="flex items-center gap-1.5 flex-1 truncate font-medium" style={{ color: note.color || '#3b82f6' }}>
            <span className="text-sm">{note.emoji || '📝'}</span>
            <span>{note.title}</span>
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
            <button
              onClick={(e) => handleDuplicateClick(e, note)}
              className="p-1 hover:bg-white/50 rounded"
              title="Duplicate note"
            >
              <Copy className="w-3 h-3" style={{ color: note.color || '#3b82f6' }} />
            </button>
            <Edit2 className="w-3 h-3 mt-0.5" style={{ color: note.color || '#3b82f6' }} />
          </div>
        </div>
      ))}
    </div>
  );
};
