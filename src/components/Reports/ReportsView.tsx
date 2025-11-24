import React, { useState, useEffect } from 'react';
import { db, Request, CostTracker, Profile, Client } from '../../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ArrowLeft, FileText } from 'lucide-react';

interface ReportsViewProps {
  onBack: () => void;
}

interface ReportEntry {
  requestNumber: string;
  teamMember: string;
  client: string;
  hoursSpent: number;
  lastNotes: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onBack }) => {
  const [reportType, setReportType] = useState<'all' | 'single-member' | 'single-client'>('all');
  const [reportData, setReportData] = useState<ReportEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reportType === 'all') {
      loadAllTeamMembersReport();
    }
  }, [reportType]);

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

      const entriesMap = new Map<string, ReportEntry>();

      costTrackersSnapshot.docs.forEach(doc => {
        const tracker = doc.data() as CostTracker;
        const request = requests.get(tracker.request_id);

        if (request) {
          const key = `${tracker.request_id}-${tracker.user_id}`;
          const existingEntry = entriesMap.get(key);

          const client = request.client_id ? clients.get(request.client_id) : null;

          if (existingEntry) {
            existingEntry.hoursSpent += tracker.time_spent;
            if (tracker.notes && tracker.notes.trim()) {
              existingEntry.lastNotes = tracker.notes;
            }
          } else {
            entriesMap.set(key, {
              requestNumber: request.request_number,
              teamMember: tracker.user_name,
              client: client?.company || 'No Client',
              hoursSpent: tracker.time_spent,
              lastNotes: tracker.notes || '',
            });
          }
        }
      });

      const entries = Array.from(entriesMap.values());
      entries.sort((a, b) => b.hoursSpent - a.hoursSpent);

      setReportData(entries);
    } catch (error) {
      console.error('Error loading report:', error);
      alert('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <div className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              title="Back to requests"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-slate-700" />
              <h2 className="text-xl font-semibold text-slate-800">Reports</h2>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
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
                      Last Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {reportData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        No time entries found
                      </td>
                    </tr>
                  ) : (
                    reportData.map((entry, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {entry.requestNumber}
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
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {entry.lastNotes || '-'}
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
