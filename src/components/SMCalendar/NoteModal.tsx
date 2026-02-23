import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { SMCalendarNote } from '../../lib/firebase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface NoteModalProps {
  note?: SMCalendarNote;
  date: string;
  onClose: () => void;
  onSave: (noteData: Partial<SMCalendarNote>) => void;
  onDelete?: (noteId: string) => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  note,
  date,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [emoji, setEmoji] = useState(note?.emoji || '📝');
  const [color, setColor] = useState(note?.color || '#3b82f6');
  const [isSaving, setIsSaving] = useState(false);

  const emojiOptions = ['📝', '💼', '📱', '💻', '📊', '📈', '🎨', '🎯', '⭐', '🔔', '📅', '✅', '🚀', '💡', '📞', '✉️', '🎉', '⚡', '🔥', '💰'];
  const colorOptions = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Gray', value: '#6b7280' },
  ];

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link'],
      ['clean'],
    ],
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        id: note?.id,
        title: title.trim(),
        content,
        date,
        emoji,
        color,
      });
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!note?.id || !onDelete) return;

    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await onDelete(note.id);
        onClose();
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              {note ? 'Edit Note' : 'New Note'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {note?.note_number || 'New note'} - {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Icon
              </label>
              <div className="grid grid-cols-5 gap-2">
                {emojiOptions.map((emojiOption) => (
                  <button
                    key={emojiOption}
                    type="button"
                    onClick={() => setEmoji(emojiOption)}
                    className={`p-2 text-2xl rounded-lg border-2 transition ${
                      emoji === emojiOption
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {emojiOption}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    onClick={() => setColor(colorOption.value)}
                    className={`p-2 rounded-lg border-2 transition ${
                      color === colorOption.value
                        ? 'border-slate-800'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    style={{ backgroundColor: colorOption.value }}
                    title={colorOption.name}
                  >
                    {color === colorOption.value && (
                      <span className="text-white text-lg">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter note title"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Content
            </label>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <ReactQuill
                value={content}
                onChange={setContent}
                modules={modules}
                theme="snow"
                placeholder="Enter note content..."
                className="bg-white"
              />
            </div>
          </div>

          {note && (
            <div className="text-xs text-slate-500 pt-2 border-t border-slate-200">
              Created by {note.created_by_name} on {new Date(note.created_at).toLocaleDateString()} at {new Date(note.created_at).toLocaleTimeString()}
              {note.updated_at !== note.created_at && (
                <> • Last updated {new Date(note.updated_at).toLocaleDateString()} at {new Date(note.updated_at).toLocaleTimeString()}</>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-between">
          <div>
            {note && onDelete && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
