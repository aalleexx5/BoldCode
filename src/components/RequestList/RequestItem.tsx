import React from 'react';
import { Request } from '../../lib/firebase';

interface RequestItemProps {
  request: Request;
  onClick: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  'submitted': 'bg-blue-100 text-blue-800',
  'draft': 'bg-gray-100 text-gray-800',
  'in progress': 'bg-yellow-100 text-yellow-800',
  'canceled': 'bg-red-100 text-red-800',
  'pending approval': 'bg-orange-100 text-orange-800',
  'awaiting feedback': 'bg-purple-100 text-purple-800',
  'completed': 'bg-green-100 text-green-800',
};

export const RequestItem: React.FC<RequestItemProps> = ({ request, onClick }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      onClick={onClick}
      className="grid grid-cols-[120px_1fr_120px_140px_140px_160px] gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition"
    >
      <div className="text-sm font-medium text-slate-900">{request.request_number}</div>
      <div className="text-sm text-slate-900 truncate">{request.title}</div>
      <div className="text-sm text-slate-600">{formatDate(request.due_date)}</div>
      <div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[request.status]}`}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </div>
      <div className="text-sm text-slate-600">{request.request_type}</div>
      <div className="text-sm text-slate-600">{(request as any).creator_name || '-'}</div>
    </div>
  );
};
