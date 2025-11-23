import React, { useState, useEffect } from 'react';
import { db, Client } from '../../lib/firebase';
import { collection, query, orderBy, getDocs, addDoc, getDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, X } from 'lucide-react';
import { formatPhoneNumber, validatePhoneNumber } from '../../utils/phoneFormatter';

interface ClientSelectorProps {
  selectedClientId: string;
  onChange: (clientId: string) => void;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({ selectedClientId, onChange }) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [showClientPopup, setShowClientPopup] = useState(false);
  const [popupClient, setPopupClient] = useState<Client | null>(null);
  const [phoneError, setPhoneError] = useState('');
  const [newClient, setNewClient] = useState({
    company: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    notes: '',
  });

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setNewClient({ ...newClient, phone: formatted });

    if (formatted) {
      const validation = validatePhoneNumber(formatted);
      setPhoneError(validation.error || '');
    } else {
      setPhoneError('');
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const q = query(collection(db, 'clients'), orderBy('company'));
      const querySnapshot = await getDocs(q);
      const clientsData: Client[] = [];
      querySnapshot.forEach((doc) => {
        clientsData.push({ id: doc.id, ...doc.data() } as Client);
      });
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleViewClient = async (clientId: string) => {
    try {
      const clientDoc = await getDoc(doc(db, 'clients', clientId));
      if (clientDoc.exists()) {
        setPopupClient({ id: clientDoc.id, ...clientDoc.data() } as Client);
        setShowClientPopup(true);
      }
    } catch (error) {
      console.error('Error loading client:', error);
    }
  };

  const handleAddClient = async () => {
    if (!newClient.company.trim()) {
      alert('Please enter a company name');
      return;
    }

    if (newClient.phone && phoneError) {
      alert(phoneError);
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'clients'), {
        ...newClient,
        created_by: user!.uid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const newClientData = {
        id: docRef.id,
        ...newClient,
        created_by: user!.uid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setClients([...clients, newClientData]);
      onChange(docRef.id);
      setShowNewClientForm(false);
      setNewClient({ company: '', contact_name: '', email: '', phone: '', notes: '' });
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
                {client.company} {client.contact_name && `- ${client.contact_name}`}
              </option>
            ))}
          </select>
        </div>

        {!showNewClientForm ? (
          <>
            <button
              onClick={() => setShowNewClientForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 text-slate-600 rounded-lg hover:border-slate-400 hover:text-slate-700 transition"
            >
              <Plus className="w-4 h-4" />
              Add New Client
            </button>

            {selectedClientId && clients.find(c => c.id === selectedClientId) && (
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <h4 className="font-medium text-slate-800 mb-3">Selected Client Details</h4>
                {(() => {
                  const client = clients.find(c => c.id === selectedClientId)!;
                  return (
                    <div className="space-y-2 text-sm">
                      {client.company && (
                        <div>
                          <span className="font-medium text-slate-700">Company:</span>
                          <button
                            onClick={() => handleViewClient(selectedClientId)}
                            className="ml-2 text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            {client.company}
                          </button>
                        </div>
                      )}
                      {client.contact_name && (
                        <div>
                          <span className="font-medium text-slate-700">Contact Name:</span>
                          <span className="ml-2 text-slate-600">{client.contact_name}</span>
                        </div>
                      )}
                      {client.email && (
                        <div>
                          <span className="font-medium text-slate-700">Email:</span>
                          <span className="ml-2 text-slate-600">{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div>
                          <span className="font-medium text-slate-700">Phone:</span>
                          <span className="ml-2 text-slate-600">{client.phone}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </>
        ) : (
          <div className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-slate-800">New Client</h4>
              <button
                onClick={() => {
                  setShowNewClientForm(false);
                  setNewClient({ company: '', contact_name: '', email: '', phone: '', address: '', website: '', notes: '' });
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Company *
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
                Contact Name
              </label>
              <input
                type="text"
                value={newClient.contact_name}
                onChange={(e) => setNewClient({ ...newClient, contact_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contact Name"
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
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent ${
                  phoneError
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-slate-300 focus:ring-blue-500'
                }`}
                placeholder="714-270-8047"
              />
              {phoneError && (
                <p className="text-xs text-red-600 mt-1">{phoneError}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={newClient.address}
                onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123 Main St, City, State 12345"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Website
              </label>
              <input
                type="url"
                value={newClient.website}
                onChange={(e) => setNewClient({ ...newClient, website: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
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

      {showClientPopup && popupClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">Client Details</h2>
              <button
                onClick={() => {
                  setShowClientPopup(false);
                  setPopupClient(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company
                </label>
                <p className="text-slate-900 text-lg">{popupClient.company || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contact Name
                </label>
                <p className="text-slate-900">{popupClient.contact_name || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <p className="text-slate-900">{popupClient.email || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone
                </label>
                <p className="text-slate-900">{popupClient.phone || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Address
                </label>
                <p className="text-slate-900">{popupClient.address || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Website
                </label>
                <p className="text-slate-900">{popupClient.website || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes
                </label>
                <p className="text-slate-900 whitespace-pre-wrap">{popupClient.notes || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
