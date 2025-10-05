import React, { useState, useEffect } from 'react';
import { db, Request } from '../../lib/firebase';
import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

interface CalendarViewProps {
  onSelectRequest: (requestId: string) => void;
  onBack: () => void;
  selectedFilters: string[];
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const CalendarView: React.FC<CalendarViewProps> = ({ onSelectRequest, onBack, selectedFilters }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'requests'), orderBy('request_number', 'desc'));
      const querySnapshot = await getDocs(q);
      const requestsData: Request[] = [];

      for (const docSnap of querySnapshot.docs) {
        const requestData = { id: docSnap.id, ...docSnap.data() } as Request;
        requestsData.push(requestData);
      }

      setRequests(requestsData);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRequests = () => {
    if (selectedFilters.length === 0) {
      return requests;
    }
    return requests.filter((req) => selectedFilters.includes(req.status));
  };

  const getRequestsForDate = (date: Date) => {
    const filteredRequests = getFilteredRequests();
    return filteredRequests.filter((req) => {
      if (!req.due_date) return false;
      const dueDate = new Date(req.due_date);
      return (
        dueDate.getDate() === date.getDate() &&
        dueDate.getMonth() === date.getMonth() &&
        dueDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'awaiting feedback':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'pending approval':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to List
            </button>
            <h2 className="text-2xl font-bold text-slate-800">Calendar View</h2>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ChevronLeft className="w-6 h-6 text-slate-700" />
          </button>

          <div className="flex items-center gap-4">
            <h3 className="text-xl font-semibold text-slate-800">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button
              onClick={goToToday}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Today
            </button>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ChevronRight className="w-6 h-6 text-slate-700" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-slate-500">Loading calendar...</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-7 border-b border-slate-200">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className="px-4 py-3 text-center font-semibold text-slate-700 bg-slate-50 border-r border-slate-200 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((date, index) => {
                const dayRequests = date ? getRequestsForDate(date) : [];
                const isTodayDate = isToday(date);

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] border-r border-b border-slate-200 last:border-r-0 p-2 ${
                      !date ? 'bg-slate-50' : ''
                    } ${isTodayDate ? 'bg-blue-50' : ''}`}
                  >
                    {date && (
                      <>
                        <div className={`text-sm font-semibold mb-2 ${
                          isTodayDate ? 'text-blue-600' : 'text-slate-700'
                        }`}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayRequests.map((req) => (
                            <div
                              key={req.id}
                              onClick={() => onSelectRequest(req.id)}
                              className={`text-xs p-1.5 rounded border cursor-pointer hover:shadow-sm transition ${getStatusColor(
                                req.status
                              )}`}
                            >
                              <div className="font-medium truncate" title={req.title}>
                                {req.title}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
