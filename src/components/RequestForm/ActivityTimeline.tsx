import React, { useState, useEffect } from 'react';
import { db, ActivityLog } from '../../lib/firebase';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { Clock } from 'lucide-react';

interface ActivityTimelineProps {
  requestId: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ requestId }) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [requestId]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'activity_logs'),
        where('request_id', '==', requestId),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const activitiesData: ActivityLog[] = [];

      for (const docSnap of querySnapshot.docs) {
        const activityData = { id: docSnap.id, ...docSnap.data() } as ActivityLog;

        const userDoc = await getDoc(doc(db, 'profiles', activityData.user_id));
        if (userDoc.exists()) {
          activityData.user = {
            id: userDoc.id,
            ...userDoc.data()
          } as any;
        }

        activitiesData.push(activityData);
      }

      setActivities(activitiesData);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getActivityMessage = (activity: ActivityLog) => {
    const userName = activity.user?.full_name || 'Unknown User';

    switch (activity.action_type) {
      case 'created':
        return `${userName} created this request`;
      case 'status_change':
        return `${userName} changed status from "${activity.old_value}" to "${activity.new_value}"`;
      case 'due_date_change':
        return `${userName} changed due date from "${activity.old_value || 'none'}" to "${activity.new_value || 'none'}"`;
      case 'details_change':
        return `${userName} updated the request details`;
      default:
        return `${userName} made a change`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Activity Timeline</h3>
        <div className="text-center text-slate-500 py-4">Loading activity...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Activity Timeline</h3>

      {activities.length === 0 ? (
        <div className="text-center text-slate-500 py-4">No activity recorded yet</div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                {index < activities.length - 1 && (
                  <div className="w-0.5 h-full bg-slate-200 mt-2"></div>
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className="text-sm text-slate-800 font-medium">
                  {getActivityMessage(activity)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {formatDate(activity.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
