import React, { useState, useEffect } from 'react';
import { db, Request, CostTracker, Profile, Client } from '../../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ArrowLeft, FileText } from 'lucide-react';

interface ReportsViewProps {
  onBack: () => void;
  onSelectRequest?: (requestId: string) => void;
}

interface ReportEntry {
  requestId: string;
  requestNumber: string;
  teamMember: string;
  client: string;
  hoursSpent: number;
  date: string;
  notes: string;
}

const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  };
};

export const ReportsView: React.FC<ReportsViewProps> = ({ onBack, onSelectRequest }) => {
  const [reportType, setReportType] = useState<'all' | 'single-member' | 'single-client'>('all');
  const [reportData, setReportData] = useState<ReportEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const defaultRange = getDefaultDateRange();
  const [dateRange, setDateRange] = useState({
    start: defaultRange.start,
    end: defaultRange.end
  });

  useEffect(() => {
    if (reportType === 'all') {
      loadAllTeamMembersReport();
    }
  }, [reportType, dateRange]);

  const loadAllTeamMembersReport = async () => {
    setLoading(true);
    try {
      const costTrackersSnapshot = await getDocs(collection(db, 'cost_trackers'));
      const requestsSnapshot = await getDocs(collection(db, 'requests'));
      const clientsSnapshot = await getDocs(collection(db, 'clients'));

      const requests = new Map<string, Request>();
      requestsSnapshot.docs.forEach(doc => {
        requests.set(doc.id, { id: doc.id, ...doc.data() } as Request);
      });

      const clients = new Map<string, Client>();
      clientsSnapshot.docs.forEach(doc => {
        clients.set(doc.id, { id: doc.id, ...doc.data() } as Client);
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
            const client = request.client_id ? clients.get(request.client_id) : null;

            entries.push({
              requestId: tracker.request_id,
              requestNumber: request.request_number,
              teamMember: tracker.user_name,
              client: client?.company || 'No Client',
              hoursSpent: tracker.time_spent,
              date: tracker.date,
              notes: tracker.notes || '',
            });
          }
        }
      });

      entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <div className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-slate-700" />
            <h2 className="text-xl font-semibold text-slate-800">Reports</h2>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </button>
        </div>

        <div className="mt-4 flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="reportType"
                value="all"
                checked={reportType === 'all'}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-slate-700">All Team Members</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="reportType"
                value="single-member"
                checked={reportType === 'single-member'}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-slate-700">Single Team Member</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="reportType"
                value="single-client"
                checked={reportType === 'single-client'}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-slate-700">Single Client</span>
            </label>
          </div>

          {reportType === 'all' && (
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
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500">Loading report...</div>
          </div>
        ) : reportType === 'all' ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Request #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Team Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Hours Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {reportData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        No time entries found for the selected date range
                      </td>
                    </tr>
                  ) : (
                    reportData.map((entry, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleRequestClick(entry.requestId)}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {entry.requestNumber}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          {entry.teamMember}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          {entry.client}
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
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <p className="text-center text-slate-500">
              {reportType === 'single-member'
                ? 'Single Team Member report - Coming soon'
                : 'Single Client report - Coming soon'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
