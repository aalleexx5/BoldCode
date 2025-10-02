import React, { useState, useEffect } from 'react';
import { db, CostTracker } from '../../lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { Clock, Save } from 'lucide-react';

interface CostTrackerSectionProps {
  requestId: string;
}

export const CostTrackerSection: React.FC<CostTrackerSectionProps> = ({ requestId }) => {
  const [timeSpent, setTimeSpent] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [totalHours, setTotalHours] = useState<number>(0);
  const [trackerId, setTrackerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadCostTracker();
  }, [requestId]);

  const loadCostTracker = async () => {
    try {
      const q = query(
        collection(db, 'cost_trackers'),
        where('request_id', '==', requestId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const trackerDoc = querySnapshot.docs[0];
        const trackerData = trackerDoc.data() as CostTracker;
        setTrackerId(trackerDoc.id);
        setTimeSpent(trackerData.time_spent.toString());
        setNotes(trackerData.notes || '');
        setTotalHours(trackerData.time_spent);
      }
    } catch (error) {
      console.error('Error loading cost tracker:', error);
    }
  };

  const handleSave = async () => {
    const timeValue = parseFloat(timeSpent);

    if (isNaN(timeValue) || timeValue < 0) {
      alert('Please enter a valid time value (e.g., 1.5 for 1 hour 30 minutes)');
      return;
    }

    setLoading(true);
    try {
      const trackerData = {
        request_id: requestId,
        time_spent: timeValue,
        notes: notes.trim(),
        updated_at: new Date().toISOString(),
      };

      if (trackerId) {
        await updateDoc(doc(db, 'cost_trackers', trackerId), trackerData);
      } else {
        const docRef = await addDoc(collection(db, 'cost_trackers'), {
          ...trackerData,
          created_at: new Date().toISOString(),
        });
        setTrackerId(docRef.id);
      }

      setTotalHours(timeValue);
      setHasChanges(false);
      alert('Cost tracker updated successfully');
    } catch (error) {
      console.error('Error saving cost tracker:', error);
      alert('Failed to save cost tracker. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (value: string) => {
    setTimeSpent(value);
    setHasChanges(true);
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setHasChanges(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-800">Cost Tracker</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Hours spent on request:
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={timeSpent}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 1.5"
          />
          <p className="text-xs text-slate-500 mt-1">
            Enter time in hours (e.g., 1.5 = 1 hour 30 minutes)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Add notes about time spent..."
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading || !hasChanges}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
};
