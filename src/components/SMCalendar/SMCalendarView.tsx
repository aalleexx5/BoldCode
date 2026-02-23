import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { NoteModal } from './NoteModal';

interface Note {
  id: string;
  user_id: string;
  note_date: string;
  title: string;
  body: string;
  note_number: number;
  created_at: string;
  updated_at: string;
}

interface SMCalendarViewProps {
  onBack: () => void;
}

export const SMCalendarView: React.FC<SMCalendarViewProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user, currentDate]);

  const loadNotes = async () => {
    if (!user) return;

    setLoading(true);
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .gte('note_date', startOfMonth.toISOString().split('T')[0])
      .lte('note_date', endOfMonth.toISOString().split('T')[0])
      .order('note_date', { ascending: true });

    if (error) {
      console.error('Error loading notes:', error);
    } else {
      setNotes(data || []);
    }
    setLoading(false);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleAddNote = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedNote(null);
    setShowNoteModal(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setSelectedDate(note.note_date);
    setShowNoteModal(true);
  };

  const handleCloseModal = () => {
    setShowNoteModal(false);
    setSelectedNote(null);
    setSelectedDate(null);
  };

  const handleSaveNote = async () => {
    await loadNotes();
    handleCloseModal();
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayNotes = notes.filter(note => note.note_date === dateStr);

      days.push({
        date,
        dateStr,
        day,
        notes: dayNotes
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h2 className="text-2xl font-bold text-slate-800">SM Calendar</h2>
          <div className="w-20" />
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>

          <h3 className="text-xl font-semibold text-slate-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>

          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ChevronRight className="w-6 h-6 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
            {dayNames.map(day => (
              <div key={day} className="p-3 text-center text-sm font-semibold text-slate-600 border-r border-slate-200 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((dayData, index) => (
              <div
                key={index}
                className="min-h-32 border-r border-b border-slate-200 last:border-r-0 p-2 bg-white hover:bg-slate-50 transition"
              >
                {dayData && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{dayData.day}</span>
                      <button
                        onClick={() => handleAddNote(dayData.dateStr)}
                        className="p-1 hover:bg-blue-100 rounded transition group"
                        title="Add note"
                      >
                        <Plus className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      {dayData.notes.map(note => (
                        <button
                          key={note.id}
                          onClick={() => handleEditNote(note)}
                          className="w-full text-left p-2 bg-blue-50 hover:bg-blue-100 rounded text-xs transition border border-blue-200"
                        >
                          <div className="font-semibold text-blue-900 truncate">
                            #{note.note_number} {note.title || 'Untitled'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showNoteModal && (
        <NoteModal
          note={selectedNote}
          noteDate={selectedDate || ''}
          onClose={handleCloseModal}
          onSave={handleSaveNote}
        />
      )}
    </div>
  );
};
