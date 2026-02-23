import React, { useMemo } from 'react';
import { Users } from 'lucide-react';
import { useProfiles } from '../../hooks/useProfiles';

interface AssignedToSelectorProps {
  selectedValue: string;
  onChange: (value: string) => void;
}

export const AssignedToSelector: React.FC<AssignedToSelectorProps> = ({ selectedValue, onChange }) => {
  const { profiles, loading } = useProfiles();

  const sortedProfiles = useMemo(() => {
    return [...profiles].sort((a, b) =>
      (a.full_name || '').localeCompare(b.full_name || '')
    );
  }, [profiles]);

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        <Users className="inline w-4 h-4 mr-1" />
        Assigned To
      </label>
      <select
        value={selectedValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={loading}
      >
        <option value="">Select assignee...</option>
        <option value="Everyone">Everyone</option>
        {sortedProfiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.full_name}
          </option>
        ))}
      </select>
    </div>
  );
};
