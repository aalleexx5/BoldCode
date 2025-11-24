import React, { useState, useEffect } from 'react';
import { db, CostTracker, Profile } from '../../lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Clock, Plus, Trash2 } from 'lucide-react';

interface CostTrackerSectionProps {
  requestId: string;
}

interface CostTrackerEntry extends CostTracker {
  user_name?: string;
  date: string;
}

export const CostTrackerSection: React.FC<CostTrackerSectionProps> = ({ requestId }) => {
  const [entries, setEntries] = useState<CostTrackerEntry[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const [newEntry, setNewEntry] = useState({
    user_id: '',
    date: new Date().toISOString().split('T')[0],
    time_spent: '',
    notes: '',
  });

  useEffect(() => {
    loadUsers();
    loadCostTrackers();
  }, [requestId]);

  const loadUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'profiles'));
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Profile));
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadCostTrackers = async () => {
    try {
      const q = query(
        collection(db, 'cost_trackers'),
        where('request_id', '==', requestId)
      );
      const querySnapshot = await getDocs(q);

      const entriesList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        } as CostTrackerEntry;
      });

      entriesList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEntries(entriesList);
    } catch (error) {
      console.error('Error loading cost trackers:', error);
    }
  };

  const handleAddEntry = async () => {
    const timeValue = parseFloat(newEntry.time_spent);

    if (!newEntry.user_id) {
      alert('Please select a team member');
      return;
    }

    if (!newEntry.date) {
      alert('Please select a date');
      return;
    }

    if (isNaN(timeValue) || timeValue <= 0) {
      alert('Please enter a valid time value (e.g., 1.5 for 1 hour 30 minutes)');
      return;
    }

    setLoading(true);
    try {
      const selectedUser = users.find(u => u.id === newEntry.user_id);

      await addDoc(collection(db, 'cost_trackers'), {
        request_id: requestId,
        user_id: newEntry.user_id,
        user_name: selectedUser?.full_name || selectedUser?.email || 'Unknown',
        date: newEntry.date,
        time_spent: timeValue,
        notes: newEntry.notes.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      setNewEntry({
        user_id: '',
        date: new Date().toISOString().split('T')[0],
        time_spent: '',
        notes: '',
      });

      await loadCostTrackers();
      alert('Time entry added successfully');
    } catch (error) {
      console.error('Error adding entry:', error);
      alert('Failed to add entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'cost_trackers', entryId));
      await loadCostTrackers();
      alert('Entry deleted successfully');
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry. Please try again.');
    }
  };

  const getTotalHours = () => {
    return entries.reduce((sum, entry) => sum + entry.time_spent, 0).toFixed(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-800">Cost Tracker</h3>
        </div>
        <div className="text-sm text-slate-600">
          Total: <span className="font-semibold text-slate-900">{getTotalHours()} hours</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
          <h4 className="font-medium text-slate-800 mb-3">Add Time Entry</h4>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Team Member
              </label>
              <select
                value={newEntry.user_id}
                onChange={(e) => setNewEntry({ ...newEntry, user_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select team member</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={newEntry.date}
                onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Hours spent on request:
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={newEntry.time_spent}
                onChange={(e) => setNewEntry({ ...newEntry, time_spent: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 1.5"
              />
              <p className="text-xs text-slate-500 mt-1">
                Enter time in hours (e.g., 1.5 = 1 hour 30 minutes)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes
              </label>
              <textarea
                value={newEntry.notes}
                onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Add notes about time spent..."
              />
            </div>

            <button
              onClick={handleAddEntry}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              {loading ? 'Adding...' : 'Add Entry'}
            </button>
          </div>
        </div>

        {entries.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-slate-800">Time Entries</h4>
            {entries.map((entry) => (
              <div key={entry.id} className="border border-slate-200 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-medium text-slate-900">{entry.user_name}</span>
                      <span className="text-sm text-slate-500">{formatDate(entry.date)}</span>
                      <span className="text-sm font-semibold text-blue-600">{entry.time_spent} hours</span>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-slate-600">{entry.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {entries.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-6">No time entries yet</p>
        )}
      </div>
    </div>
  );
};
