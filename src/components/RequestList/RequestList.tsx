import React, { useState, useEffect } from 'react';
import { db, Request } from '../../lib/firebase';
import { collection, query, orderBy, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Search, RefreshCw, Plus, Pin } from 'lucide-react';
import { RequestItem } from './RequestItem';

interface RequestListProps {
  onSelectRequest: (requestId: string) => void;
  onNewRequest: () => void;
  refreshTrigger: number;
}

const STATUS_OPTIONS = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'in progress', label: 'In Progress' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'pending approval', label: 'Pending Approval' },
  { value: 'awaiting feedback', label: 'Awaiting Feedback' },
  { value: 'completed', label: 'Completed' },
];

export const RequestList: React.FC<RequestListProps> = ({ onSelectRequest, onNewRequest, refreshTrigger }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (user) {
      loadPinnedFilters();
    }
  }, [user]);

  useEffect(() => {
    loadRequests();
  }, [refreshTrigger]);

  useEffect(() => {
    applyFilters();
  }, [requests, searchQuery, selectedFilters]);

  const loadPinnedFilters = async () => {
    try {
      const prefDoc = await getDoc(doc(db, 'user_filter_preferences', user!.uid));
      if (prefDoc.exists()) {
        const data = prefDoc.data();
        if (data.pinned_filters) {
          setSelectedFilters(data.pinned_filters as string[]);
          setIsPinned(true);
        }
      }
    } catch (error) {
      console.error('Error loading pinned filters:', error);
    }
  };

  const savePinnedFilters = async () => {
    try {
      await setDoc(doc(db, 'user_filter_preferences', user!.uid), {
        user_id: user!.uid,
        pinned_filters: selectedFilters,
        updated_at: new Date().toISOString(),
      });
      setIsPinned(true);
    } catch (error) {
      console.error('Error saving pinned filters:', error);
    }
  };

  const loadRequests = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'requests'), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      const requestsData: Request[] = [];
      querySnapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() } as Request);
      });
      setRequests(requestsData);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    if (selectedFilters.length > 0) {
      filtered = filtered.filter((req) => selectedFilters.includes(req.status));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.title.toLowerCase().includes(query) ||
          req.request_number.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  };

  const toggleFilter = (status: string) => {
    setSelectedFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
    setIsPinned(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Requests</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            <button
              onClick={loadRequests}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={onNewRequest}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Plus className="w-5 h-5" />
              New Request
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-wrap gap-3">
            {STATUS_OPTIONS.map((status) => (
              <label
                key={status.value}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={selectedFilters.includes(status.value)}
                  onChange={() => toggleFilter(status.value)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">{status.label}</span>
              </label>
            ))}
          </div>
          <button
            onClick={savePinnedFilters}
            disabled={isPinned}
            className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${
              isPinned
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Pin current filter selection"
          >
            <Pin className="w-4 h-4" />
            {isPinned ? 'Filters Pinned' : 'Pin Filters'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500">Loading requests...</div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <p className="text-lg mb-2">No requests found</p>
            <p className="text-sm">Try adjusting your filters or create a new request</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-[120px_1fr_120px_140px_140px] gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 font-medium text-sm text-slate-700">
              <div>Request #</div>
              <div>Title</div>
              <div>Due Date</div>
              <div>Status</div>
              <div>Type</div>
            </div>
            <div className="divide-y divide-slate-200">
              {filteredRequests.map((request) => (
                <RequestItem
                  key={request.id}
                  request={request}
                  onClick={() => onSelectRequest(request.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
