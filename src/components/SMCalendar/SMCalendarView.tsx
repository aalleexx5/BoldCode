import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { db, SMCalendarNote } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, onSnapshot, orderBy } from 'firebase/firestore';
import { NoteModal } from './NoteModal';
import { NotesList } from './NotesList';

interface SMCalendarViewProps {
  onBack: () => void;
}

export const SMCalendarView: React.FC<SMCalendarViewProps> = ({ onBack }) => {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<SMCalendarNote[]>([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<SMCalendarNote | undefined>();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [visibleMonths, setVisibleMonths] = useState<Date[]>([]);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = new Date();
    const months: Date[] = [];

    for (let i = -3; i <= 3; i++) {
      months.push(new Date(today.getFullYear(), today.getMonth() + i, 1));
    }

    setVisibleMonths(months);
  }, []);

  useEffect(() => {
    const notesQuery = query(
      collection(db, 'sm_calendar_notes'),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
      const notesData: SMCalendarNote[] = [];
      snapshot.forEach((doc) => {
        notesData.push({ id: doc.id, ...doc.data() } as SMCalendarNote);
      });
      setNotes(notesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getMonthData = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = Array(startingDayOfWeek).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(new Date(year, month, day));
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const getNotesForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return notes.filter(note => note.date === dateStr);
  };

  const generateNoteNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const time = now.getTime().toString().slice(-4);
    return `SM${year}${month}${day}-${time}`;
  };

  const handleAddNote = (date: Date) => {
    setSelectedDate(date.toISOString().split('T')[0]);
    setSelectedNote(undefined);
    setShowNoteModal(true);
  };

  const handleEditNote = (note: SMCalendarNote) => {
    setSelectedNote(note);
    setSelectedDate(note.date);
    setShowNoteModal(true);
  };

  const handleSaveNote = async (noteData: Partial<SMCalendarNote>) => {
    if (!profile) return;

    try {
      if (noteData.id) {
        const noteRef = doc(db, 'sm_calendar_notes', noteData.id);
        await updateDoc(noteRef, {
          title: noteData.title,
          content: noteData.content,
          emoji: noteData.emoji,
          color: noteData.color,
          request_id: noteData.request_id || null,
          updated_at: new Date().toISOString(),
        });
      } else {
        await addDoc(collection(db, 'sm_calendar_notes'), {
          note_number: generateNoteNumber(),
          title: noteData.title,
          content: noteData.content,
          date: noteData.date,
          emoji: noteData.emoji || '📝',
          color: noteData.color || '#3b82f6',
          request_id: noteData.request_id || null,
          created_by: profile.id,
          created_by_name: profile.full_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
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

  const handleDuplicateNote = async (note: SMCalendarNote) => {
    if (!profile) return;

    try {
      await addDoc(collection(db, 'sm_calendar_notes'), {
        note_number: generateNoteNumber(),
        title: `${note.title}-copy`,
        content: note.content,
        date: note.date,
        emoji: note.emoji || '📝',
        color: note.color || '#3b82f6',
        request_id: note.request_id || null,
        created_by: profile.id,
        created_by_name: profile.full_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error duplicating note:', error);
      throw error;
    }
  };

  const handleNoteDrop = async (noteId: string, newDate: string) => {
    try {
      const noteRef = doc(db, 'sm_calendar_notes', noteId);
      await updateDoc(noteRef, {
        date: newDate,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating note date:', error);
      throw error;
    }
  };

  const handleDragStart = (e: React.DragEvent, noteId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('noteId', noteId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData('noteId');
    if (noteId) {
      const newDate = date.toISOString().split('T')[0];
      handleNoteDrop(noteId, newDate);
    }
  };

  const loadMoreMonths = (direction: 'before' | 'after') => {
    setVisibleMonths((prev) => {
      if (direction === 'before') {
        const firstMonth = prev[0];
        const newMonths: Date[] = [];
        for (let i = 3; i >= 1; i--) {
          newMonths.push(
            new Date(firstMonth.getFullYear(), firstMonth.getMonth() - i, 1)
          );
        }
        return [...newMonths, ...prev];
      } else {
        const lastMonth = prev[prev.length - 1];
        const newMonths: Date[] = [];
        for (let i = 1; i <= 3; i++) {
          newMonths.push(
            new Date(lastMonth.getFullYear(), lastMonth.getMonth() + i, 1)
          );
        }
        return [...prev, ...newMonths];
      }
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (scrollTop < 200) {
      loadMoreMonths('before');
      e.currentTarget.scrollTop = scrollTop + 600;
    }

    if (scrollHeight - scrollTop - clientHeight < 200) {
      loadMoreMonths('after');
    }
  };

  const goToToday = () => {
    const today = new Date();
    const todayMonthIndex = visibleMonths.findIndex(
      (m) => m.getMonth() === today.getMonth() && m.getFullYear() === today.getFullYear()
    );

    if (todayMonthIndex !== -1 && scrollContainerRef.current) {
      const monthElements = scrollContainerRef.current.querySelectorAll('[data-month]');
      if (monthElements[todayMonthIndex]) {
        monthElements[todayMonthIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-slate-600">Loading SM Calendar...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="text-2xl font-bold text-slate-800">SM Calendar</h2>
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Jump to Today
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto p-6"
        onScroll={handleScroll}
      >
        <div className="space-y-8 max-w-7xl mx-auto">
          {visibleMonths.map((monthDate, monthIndex) => {
            const weeks = getMonthData(monthDate);
            const isCurrentMonth =
              monthDate.getMonth() === new Date().getMonth() &&
              monthDate.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={`${monthDate.getFullYear()}-${monthDate.getMonth()}`}
                data-month={monthIndex}
                className={`bg-white rounded-lg shadow-sm border-2 ${
                  isCurrentMonth ? 'border-blue-400' : 'border-slate-200'
                } overflow-hidden`}
              >
                <div className={`px-6 py-4 ${
                  isCurrentMonth ? 'bg-blue-50 border-b-2 border-blue-200' : 'bg-slate-50 border-b border-slate-200'
                }`}>
                  <h3 className={`text-xl font-semibold ${
                    isCurrentMonth ? 'text-blue-900' : 'text-slate-800'
                  }`}>
                    {monthNames[monthDate.getMonth()]} {monthDate.getFullYear()}
                  </h3>
                </div>

                <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="px-4 py-3 text-center text-sm font-semibold text-slate-600 border-r border-slate-200 last:border-r-0"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="divide-y divide-slate-200">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7 divide-x divide-slate-200">
                      {week.map((date, dayIndex) => {
                        const dayNotes = getNotesForDate(date);
                        return (
                          <div
                            key={dayIndex}
                            className={`min-h-[120px] p-3 ${
                              date ? 'bg-white hover:bg-slate-50' : 'bg-slate-50'
                            } ${isToday(date) ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
                            onDragOver={date ? handleDragOver : undefined}
                            onDrop={date ? (e) => handleDrop(e, date) : undefined}
                          >
                            {date && (
                              <>
                                <div className="flex items-center justify-between mb-2">
                                  <span
                                    className={`text-sm font-medium ${
                                      isToday(date)
                                        ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                                        : 'text-slate-700'
                                    }`}
                                  >
                                    {date.getDate()}
                                  </span>
                                  <button
                                    onClick={() => handleAddNote(date)}
                                    className="p-1 hover:bg-blue-100 rounded transition opacity-60 hover:opacity-100"
                                  >
                                    <Plus className="w-4 h-4 text-blue-600" />
                                  </button>
                                </div>
                                <NotesList
                                  notes={dayNotes}
                                  onEditNote={handleEditNote}
                                  onDragStart={handleDragStart}
                                  onDuplicateNote={handleDuplicateNote}
                                />
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showNoteModal && (
        <NoteModal
          note={selectedNote}
          date={selectedDate}
          onClose={() => {
            setShowNoteModal(false);
            setSelectedNote(undefined);
            setSelectedDate('');
          }}
          onSave={handleSaveNote}
          onDelete={selectedNote ? handleDeleteNote : undefined}
        />
      )}
    </div>
  );
};
