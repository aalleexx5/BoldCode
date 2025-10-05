import React, { useState, useEffect } from 'react';
import { db, Profile } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Users } from 'lucide-react';

interface AssignedToSelectorProps {
  selectedValue: string;
  onChange: (value: string) => void;
}

export const AssignedToSelector: React.FC<AssignedToSelectorProps> = ({ selectedValue, onChange }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const q = query(collection(db, 'profiles'), orderBy('full_name', 'asc'));
      const querySnapshot = await getDocs(q);
      const profilesData: Profile[] = [];

      querySnapshot.forEach((doc) => {
        profilesData.push({ id: doc.id, ...doc.data() } as Profile);
      });

      setProfiles(profilesData);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

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
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.full_name}
          </option>
        ))}
      </select>
    </div>
  );
};
