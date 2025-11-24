import React, { useState, useEffect } from 'react';
import { db, ActivityLog } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, limit, startAfter, QueryDocumentSnapshot } from 'firebase/firestore';
import { ArrowLeft, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

interface ActivityLogProps {
  onBack: () => void;
}

const ITEMS_PER_PAGE = 100;

export const ActivityLogView: React.FC<ActivityLogProps> = ({ onBack }) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [firstVisible, setFirstVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pageSnapshots, setPageSnapshots] = useState<Map<number, QueryDocumentSnapshot>>(new Map());

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async (direction?: 'next' | 'prev') => {
    setLoading(true);
    try {
      const activitiesRef = collection(db, 'activity_logs');
      let q;

      if (direction === 'next' && lastVisible) {
        q = query(
          activitiesRef,
          orderBy('created_at', 'desc'),
          startAfter(lastVisible),
          limit(ITEMS_PER_PAGE + 1)
        );
      } else if (direction === 'prev' && pageSnapshots.has(currentPage - 1)) {
        const snapshot = pageSnapshots.get(currentPage - 1);
        q = query(
          activitiesRef,
          orderBy('created_at', 'desc'),
          startAfter(snapshot),
          limit(ITEMS_PER_PAGE + 1)
        );
      } else {
        q = query(
          activitiesRef,
          orderBy('created_at', 'desc'),
          limit(ITEMS_PER_PAGE + 1)
        );
      }

      const snapshot = await getDocs(q);
      const docs = snapshot.docs;

      if (docs.length > ITEMS_PER_PAGE) {
        setHasMore(true);
        docs.pop();
      } else {
        setHasMore(false);
      }

      if (docs.length > 0) {
        setFirstVisible(docs[0]);
        setLastVisible(docs[docs.length - 1]);

        if (direction === 'next') {
          const newSnapshots = new Map(pageSnapshots);
          newSnapshots.set(currentPage, docs[0]);
          setPageSnapshots(newSnapshots);
        }
      }

      const activityData: ActivityLog[] = docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ActivityLog));

      setActivities(activityData);
    } catch (error) {
      console.error('Error loading activities:', error);
      alert('Failed to load activity log');
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
      loadActivities('next');
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      loadActivities('prev');
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
  };

  const getActionColor = (action: string) => {
    if (action.toLowerCase().includes('create')) return 'text-green-600';
    if (action.toLowerCase().includes('update') || action.toLowerCase().includes('edit')) return 'text-blue-600';
    if (action.toLowerCase().includes('delete')) return 'text-red-600';
    if (action.toLowerCase().includes('status')) return 'text-purple-600';
    return 'text-slate-600';
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <div className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-slate-700" />
            <h2 className="text-xl font-semibold text-slate-800">Activity Log</h2>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Requests
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500">Loading activities...</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {activities.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          No activities recorded yet
                        </td>
                      </tr>
                    ) : (
                      activities.map((activity) => {
                        const { date, time } = formatDateTime(activity.created_at);
                        return (
                          <tr key={activity.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                              {date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                              {time}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                              {activity.user_name}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getActionColor(activity.action)}`}>
                              {activity.action}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700">
                              {activity.details}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {activities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Page {currentPage}
                    {hasMore && ' of many'}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition ${
                        currentPage === 1
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={!hasMore}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition ${
                        !hasMore
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
