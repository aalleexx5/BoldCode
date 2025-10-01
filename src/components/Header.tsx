import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FileText, ChevronDown, LogOut, User } from 'lucide-react';

export const Header: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Request Tracker</h1>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-50 transition"
          >
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">{profile?.full_name}</p>
              <p className="text-xs text-slate-500">{profile?.email}</p>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-600 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-20">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <hr className="my-2 border-slate-200" />
                <button
                  onClick={() => {
                    signOut();
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
