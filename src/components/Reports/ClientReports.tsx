import React, { useState, useEffect } from 'react';
import { db, Request, CostTracker, Client } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ArrowLeft, Building2, ArrowUpDown, Printer, FileText } from 'lucide-react';

interface ClientReportsProps {
  onBack: () => void;
  onSelectRequest?: (requestId: string) => void;
  onSwitchToTeamReports: () => void;
}

interface ReportEntry {
  requestId: string;
  requestNumber: string;
  client: string;
  teamMember: string;
  hoursSpent: number;
  date: string;
  notes: string;
}

interface ClientOption {
  id: string;
  name: string;
}

type SortField = 'request' | 'date';
type SortDirection = 'asc' | 'desc';

const getDefaultDateRange = () => {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
};

export const ClientReports: React.FC<ClientReportsProps> = ({ onBack, onSelectRequest, onSwitchToTeamReports }) => {
  const [reportData, setReportData] = useState<ReportEntry[]>([]);
  const [sortedData, setSortedData] = useState<ReportEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const defaultRange = getDefaultDateRange();
  const [dateRange, setDateRange] = useState({
    start: defaultRange.start,
    end: defaultRange.end
  });
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('all');

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    loadReport();
  }, [dateRange, selectedClient]);

  useEffect(() => {
    applySorting();
  }, [reportData, sortField, sortDirection]);

  const loadClients = async () => {
    try {
      const clientsSnapshot = await getDocs(collection(db, 'clients'));
      const clientList: ClientOption[] = [];

      clientsSnapshot.docs.forEach(doc => {
        const client = doc.data() as Client;
        clientList.push({
          id: doc.id,
          name: client.company
        });
      });

      clientList.sort((a, b) => a.name.localeCompare(b.name));
      setClients(clientList);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const applySorting = () => {
    const sorted = [...reportData].sort((a, b) => {
      let comparison = 0;

      if (sortField === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === 'request') {
        comparison = a.requestNumber.localeCompare(b.requestNumber);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setSortedData(sorted);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const loadReport = async () => {
    setLoading(true);
    try {
      const costTrackersSnapshot = await getDocs(collection(db, 'cost_trackers'));
      const requestsSnapshot = await getDocs(collection(db, 'requests'));
      const clientsSnapshot = await getDocs(collection(db, 'clients'));

      const requests = new Map<string, Request>();
      requestsSnapshot.docs.forEach(doc => {
        requests.set(doc.id, { id: doc.id, ...doc.data() } as Request);
      });

      const clientsMap = new Map<string, Client>();
      clientsSnapshot.docs.forEach(doc => {
        clientsMap.set(doc.id, { id: doc.id, ...doc.data() } as Client);
      });

      const startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);

      const entries: ReportEntry[] = [];

      costTrackersSnapshot.docs.forEach(doc => {
        const tracker = doc.data() as CostTracker;
        const trackerDate = new Date(tracker.date);

        if (trackerDate >= startDate && trackerDate <= endDate) {
          const request = requests.get(tracker.request_id);

          if (request) {
            const client = request.client_id ? clientsMap.get(request.client_id) : null;
            const clientName = client?.company || 'No Client';

            if (selectedClient === 'all' || request.client_id === selectedClient) {
              entries.push({
                requestId: tracker.request_id,
                requestNumber: request.request_number,
                client: clientName,
                teamMember: tracker.user_name,
                hoursSpent: tracker.time_spent,
                date: tracker.date,
                notes: tracker.notes || '',
              });
            }
          }
        }
      });

      setReportData(entries);
    } catch (error) {
      console.error('Error loading report:', error);
      alert('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleRequestClick = (requestId: string) => {
    if (onSelectRequest) {
      onSelectRequest(requestId);
    }
  };

  const calculateTotalHours = () => {
    return sortedData.reduce((total, entry) => total + entry.hoursSpent, 0);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <div className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 print:shadow-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-slate-700" />
            <h2 className="text-xl font-semibold text-slate-800">Client Reports</h2>
          </div>
          <div className="flex items-center gap-3 print:hidden">
            <button
              onClick={onSwitchToTeamReports}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
            >
              <FileText className="w-4 h-4" />
              Team Member Reports
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Requests
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-6 flex-wrap print:hidden">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-700 font-medium">Client:</span>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
            >
              <option value="all">All Clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-700 font-medium">Date Range:</span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500">Loading report...</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden print:shadow-none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('request')}
                          className="flex items-center gap-1 hover:text-blue-600 transition print:pointer-events-none"
                        >
                          Request # <ArrowUpDown className="w-4 h-4 print:hidden" />
                          {sortField === 'request' && (
                            <span className="text-xs print:hidden">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Team Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Hours Spent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('date')}
                          className="flex items-center gap-1 hover:text-blue-600 transition print:pointer-events-none"
                        >
                          Date <ArrowUpDown className="w-4 h-4 print:hidden" />
                          {sortField === 'date' && (
                            <span className="text-xs print:hidden">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {sortedData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          No time entries found for the selected date range
                        </td>
                      </tr>
                    ) : (
                      sortedData.map((entry, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleRequestClick(entry.requestId)}
                              className="text-blue-600 hover:text-blue-800 hover:underline print:text-slate-900 print:no-underline print:pointer-events-none"
                            >
                              {entry.requestNumber}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                            {entry.client}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                            {entry.teamMember}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                            {entry.hoursSpent.toFixed(1)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                            {formatDate(entry.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            {entry.notes || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {sortedData.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-6 py-4 print:shadow-none">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    Total Hours:
                  </span>
                  <span className="text-lg font-semibold text-slate-900">
                    {calculateTotalHours().toFixed(1)} hours
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
