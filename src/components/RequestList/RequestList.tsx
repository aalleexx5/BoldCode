import React, { useState, useEffect } from 'react';
import { db, Request, Client } from '../../lib/firebase';
import { collection, query, orderBy, getDocs, doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Search, RefreshCw, Plus, Pin, ArrowUpDown, CheckSquare, Square, Calendar, FileText } from 'lucide-react';
import { RequestItem } from './RequestItem';

type SortField = 'request_number' | 'title' | 'client_name' | 'due_date' | 'status' | 'request_type' | 'creator_name' | 'assigned_to_name';
type SortDirection = 'asc' | 'desc';

interface RequestListProps {
  onSelectRequest: (requestId: string) => void;
  onNewRequest: () => void;
  onNavigateToClients: () => void;
  onNavigateToCalendar: (filters: string[]) => void;
  onNavigateToReports: () => void;
  refreshTrigger: number;
}

const STATUS_OPTIONS = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'draft', label: 'Draft' },
  { value: 'in progress', label: 'In Progress' },
  { value: 'awaiting feedback', label: 'Awaiting Feedback' },
  { value: 'pending approval', label: 'Pending Approval' },
  { value: 'completed', label: 'Completed' },
  { value: 'canceled', label: 'Canceled' },
];

export const RequestList: React.FC<RequestListProps> = ({ onSelectRequest, onNewRequest, onNavigateToClients, onNavigateToCalendar, onNavigateToReports, refreshTrigger }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [sortField, setSortField] = useState<SortField>('request_number');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

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
  }, [requests, searchQuery, selectedFilters, sortField, sortDirection]);

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

      for (const docSnap of querySnapshot.docs) {
        const requestData = { id: docSnap.id, ...docSnap.data() } as Request;
        const userDoc = await getDoc(doc(db, 'profiles', requestData.created_by));
        if (userDoc.exists()) {
          (requestData as any).creator_name = userDoc.data().full_name;
        }

        if (requestData.assigned_to && requestData.assigned_to !== 'Everyone') {
          const assignedDoc = await getDoc(doc(db, 'profiles', requestData.assigned_to));
          if (assignedDoc.exists()) {
            (requestData as any).assigned_to_name = assignedDoc.data().full_name;
          }
        } else if (requestData.assigned_to === 'Everyone') {
          (requestData as any).assigned_to_name = 'Everyone';
        }

        if (requestData.client_id) {
          const clientDoc = await getDoc(doc(db, 'clients', requestData.client_id));
          if (clientDoc.exists()) {
            const clientData = clientDoc.data() as Client;
            (requestData as any).client_name = clientData.company;
          }
        }

        requestsData.push(requestData);
      }

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

    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'creator_name') {
        aValue = (a as any).creator_name || '';
        bValue = (b as any).creator_name || '';
      }

      if (sortField === 'assigned_to_name') {
        aValue = (a as any).assigned_to_name || '';
        bValue = (b as any).assigned_to_name || '';
      }

      if (sortField === 'client_name') {
        aValue = (a as any).client_name || '';
        bValue = (b as any).client_name || '';
      }

      if (!aValue) aValue = '';
      if (!bValue) bValue = '';

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredRequests(filtered);
  };

  const toggleFilter = (status: string) => {
    setSelectedFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
    setIsPinned(false);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleSelectRequest = (requestId: string) => {
    setSelectedRequests((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRequests.size === filteredRequests.length) {
      setSelectedRequests(new Set());
    } else {
      setSelectedRequests(new Set(filteredRequests.map((r) => r.id)));
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedRequests.size === 0) return;

    setIsUpdating(true);
    try {
      const batch = writeBatch(db);
      selectedRequests.forEach((requestId) => {
        const requestRef = doc(db, 'requests', requestId);
        batch.update(requestRef, { status: bulkStatus });
      });
      await batch.commit();
      setSelectedRequests(new Set());
      setBulkStatus('');
      await loadRequests();
    } catch (error) {
      console.error('Error updating requests:', error);
      alert('Failed to update requests. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Requests</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateToCalendar(selectedFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
            >
              <Calendar className="w-5 h-5" />
              Calendar
            </button>
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
            <button
              onClick={onNavigateToReports}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Reports
            </button>
            <button
              onClick={onNavigateToClients}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
            >
              Clients
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
            className={`p-2 rounded-lg transition ${
              isPinned
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Pin current filter selection"
          >
            <Pin className="w-4 h-4" />
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
            {selectedRequests.size > 0 && (
              <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedRequests.size} selected
                  </span>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Change status to...</option>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleBulkStatusUpdate}
                    disabled={!bulkStatus || isUpdating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-slate-300 disabled:cursor-not-allowed text-sm"
                  >
                    {isUpdating ? 'Updating...' : 'Update Status'}
                  </button>
                  <button
                    onClick={() => setSelectedRequests(new Set())}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium text-sm"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-[50px_120px_1fr_160px_120px_140px_140px_160px_160px] gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 font-medium text-sm text-slate-700">
              <button
                onClick={toggleSelectAll}
                className="flex items-center justify-center hover:text-blue-600 transition"
                title="Select all"
              >
                {selectedRequests.size === filteredRequests.length ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => handleSort('request_number')}
                className="flex items-center gap-1 hover:text-blue-600 transition text-left"
              >
                Request # <ArrowUpDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSort('title')}
                className="flex items-center gap-1 hover:text-blue-600 transition text-left"
              >
                Title <ArrowUpDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSort('client_name')}
                className="flex items-center gap-1 hover:text-blue-600 transition text-left"
              >
                Client <ArrowUpDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSort('due_date')}
                className="flex items-center gap-1 hover:text-blue-600 transition text-left"
              >
                Due Date <ArrowUpDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSort('status')}
                className="flex items-center gap-1 hover:text-blue-600 transition text-left"
              >
                Status <ArrowUpDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSort('request_type')}
                className="flex items-center gap-1 hover:text-blue-600 transition text-left"
              >
                Type <ArrowUpDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSort('creator_name')}
                className="flex items-center gap-1 hover:text-blue-600 transition text-left"
              >
                Created By <ArrowUpDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSort('assigned_to_name')}
                className="flex items-center gap-1 hover:text-blue-600 transition text-left"
              >
                Assigned To <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-slate-200">
              {filteredRequests.map((request) => (
                <RequestItem
                  key={request.id}
                  request={request}
                  onClick={() => onSelectRequest(request.id)}
                  isSelected={selectedRequests.has(request.id)}
                  onToggleSelect={() => toggleSelectRequest(request.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
