import React from 'react';
import { Request } from '../../lib/firebase';
import { CheckSquare, Square, Image } from 'lucide-react';

interface RequestItemProps {
  request: Request;
  onClick: () => void;
  isSelected: boolean;
  onToggleSelect: () => void;
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

export const RequestItem: React.FC<RequestItemProps> = ({ request, onClick, isSelected, onToggleSelect }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect();
  };

  return (
    <div
      className={`grid grid-cols-[50px_120px_1fr_120px_140px_140px_160px_160px] gap-4 px-6 py-4 hover:bg-slate-50 transition ${
        isSelected ? 'bg-blue-50' : ''
      }`}
    >
      <button
        onClick={handleCheckboxClick}
        className="flex items-center justify-center text-slate-600 hover:text-blue-600 transition"
      >
        {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
      </button>
      <div onClick={onClick} className="text-sm font-medium text-slate-900 cursor-pointer">{request.request_number}</div>
      <div onClick={onClick} className="text-sm text-slate-900 truncate cursor-pointer flex items-center gap-2">
        {request.title}
        {request.uploaded_images && request.uploaded_images.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-slate-500" title={`${request.uploaded_images.length} image(s) attached`}>
            <Image className="w-3.5 h-3.5" />
            {request.uploaded_images.length}
          </span>
        )}
      </div>
      <div onClick={onClick} className="text-sm text-slate-600 cursor-pointer">{formatDate(request.due_date)}</div>
      <div onClick={onClick} className="cursor-pointer">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[request.status]}`}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </div>
      <div onClick={onClick} className="text-sm text-slate-600 cursor-pointer">{request.request_type}</div>
      <div onClick={onClick} className="text-sm text-slate-600 cursor-pointer">{(request as any).creator_name || '-'}</div>
      <div onClick={onClick} className="text-sm text-slate-600 cursor-pointer">{(request as any).assigned_to_name || '-'}</div>
    </div>
  );
};
