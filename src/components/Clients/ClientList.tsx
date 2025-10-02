import React, { useState, useEffect } from 'react';
import { db, Client } from '../../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Search, RefreshCw, Plus } from 'lucide-react';

interface ClientListProps {
  onSelectClient: (clientId: string) => void;
  onNewClient: () => void;
  onNavigateToRequests: () => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  onSelectClient,
  onNewClient,
  onNavigateToRequests,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [clients, searchQuery]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'clients'), orderBy('company', 'asc'));
      const querySnapshot = await getDocs(q);
      const clientsData: Client[] = [];
      querySnapshot.forEach((doc) => {
        clientsData.push({ id: doc.id, ...doc.data() } as Client);
      });
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...clients];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client.company.toLowerCase().includes(query) ||
          client.contact_name.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          client.phone.toLowerCase().includes(query)
      );
    }

    setFilteredClients(filtered);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Clients</h2>
          <div className="flex items-start gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            <button
              onClick={loadClients}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="flex flex-col gap-2">
              <button
                onClick={onNewClient}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Plus className="w-5 h-5" />
                New Client
              </button>
              <button
                onClick={onNavigateToRequests}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium text-center"
              >
                Requests
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500">Loading clients...</div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <p className="text-lg mb-2">No clients found</p>
            <p className="text-sm">Create a new client to get started</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-[1fr_280px_200px_1fr] gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 font-medium text-sm text-slate-700">
              <div>Company</div>
              <div>Contact Name</div>
              <div>Telephone</div>
              <div>Email</div>
            </div>
            <div className="divide-y divide-slate-200">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => onSelectClient(client.id)}
                  className="grid grid-cols-[1fr_280px_200px_1fr] gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition"
                >
                  <div className="text-sm font-medium text-slate-900">
                    {client.company || '-'}
                  </div>
                  <div className="text-sm text-slate-900">{client.contact_name || '-'}</div>
                  <div className="text-sm text-slate-600">{client.phone || '-'}</div>
                  <div className="text-sm text-slate-600">{client.email || '-'}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
