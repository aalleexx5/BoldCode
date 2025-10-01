import React, { useState, useEffect } from 'react';
import { supabase, Client } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, X } from 'lucide-react';

interface ClientSelectorProps {
  selectedClientId: string;
  onChange: (clientId: string) => void;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({ selectedClientId, onChange }) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleAddClient = async () => {
    if (!newClient.name.trim()) {
      alert('Please enter a client name');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...newClient,
          created_by: user!.id,
        })
        .select()
        .single();

      if (error) throw error;

      setClients([...clients, data]);
      onChange(data.id);
      setShowNewClientForm(false);
      setNewClient({ name: '', company: '', email: '', phone: '', notes: '' });
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Failed to add client. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Client Information</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Client
          </label>
          <select
            value={selectedClientId}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">No client selected</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} {client.company && `(${client.company})`}
              </option>
            ))}
          </select>
        </div>

        {!showNewClientForm ? (
          <button
            onClick={() => setShowNewClientForm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 text-slate-600 rounded-lg hover:border-slate-400 hover:text-slate-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add New Client
          </button>
        ) : (
          <div className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-slate-800">New Client</h4>
              <button
                onClick={() => {
                  setShowNewClientForm(false);
                  setNewClient({ name: '', company: '', email: '', phone: '', notes: '' });
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Client name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Company
              </label>
              <input
                type="text"
                value={newClient.company}
                onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Company name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="client@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Notes
              </label>
              <textarea
                value={newClient.notes}
                onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Additional notes..."
              />
            </div>

            <button
              onClick={handleAddClient}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              Add Client
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
