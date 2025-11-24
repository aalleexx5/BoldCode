import React from 'react';
import { Users, Building2, FileText, ArrowLeft } from 'lucide-react';

interface ReportTypeSelectorProps {
  onSelectType: (type: 'team' | 'client') => void;
  onBack: () => void;
}

export const ReportTypeSelector: React.FC<ReportTypeSelectorProps> = ({ onSelectType, onBack }) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <div className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-slate-700" />
            <h2 className="text-xl font-semibold text-slate-800">Select Report Type</h2>
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

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          <button
            onClick={() => onSelectType('team')}
            className="group bg-white rounded-xl shadow-sm border-2 border-slate-200 p-8 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition">
                <Users className="w-8 h-8 text-blue-600 group-hover:text-white transition" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Team Member Reports</h3>
                <p className="text-sm text-slate-600">
                  View time entries and hours worked by individual team members or across the entire team
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelectType('client')}
            className="group bg-white rounded-xl shadow-sm border-2 border-slate-200 p-8 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-500 transition">
                <Building2 className="w-8 h-8 text-green-600 group-hover:text-white transition" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Client Reports</h3>
                <p className="text-sm text-slate-600">
                  View time entries and hours worked for specific clients or across all clients
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
