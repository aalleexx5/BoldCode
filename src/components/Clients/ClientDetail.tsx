import React, { useState, useEffect } from 'react';
import { db, Client, RequestLink } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { X, Save, Plus, ExternalLink, Trash2, Copy } from 'lucide-react';
import { formatPhoneNumber, validatePhoneNumber } from '../../utils/phoneFormatter';

interface ClientDetailProps {
  clientId: string;
  onClose: () => void;
  onSave: () => void;
}

export const ClientDetail: React.FC<ClientDetailProps> = ({ clientId, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [company, setCompany] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');
  const [links, setLinks] = useState<RequestLink[]>([]);
  const [showNewLinkForm, setShowNewLinkForm] = useState(false);
  const [newLink, setNewLink] = useState({
    name: '',
    url: '',
    comments: '',
  });

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPhone(formatted);

    if (formatted) {
      const validation = validatePhoneNumber(formatted);
      setPhoneError(validation.error || '');
    } else {
      setPhoneError('');
    }
  };

  useEffect(() => {
    loadClient();
  }, [clientId]);

  const loadClient = async () => {
    setLoading(true);
    try {
      const clientDoc = await getDoc(doc(db, 'clients', clientId));
      if (clientDoc.exists()) {
        const data = clientDoc.data() as Client;
        setCompany(data.company || '');
        setContactName(data.contact_name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
        setWebsite(data.website || '');
        setNotes(data.notes || '');
        setLinks(data.links || []);
      }
    } catch (error) {
      console.error('Error loading client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!company.trim()) {
      alert('Company name is required');
      return;
    }

    if (phone && phoneError) {
      alert(phoneError);
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'clients', clientId), {
        company,
        contact_name: contactName,
        email,
        phone,
        address,
        website,
        notes,
        links,
        updated_at: new Date().toISOString(),
      });

      setIsEditing(false);
      onSave();
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Failed to update client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = () => {
    if (!newLink.name.trim() || !newLink.url.trim()) {
      alert('Please enter both name and URL');
      return;
    }

    const newLinkData: RequestLink = {
      id: `link-${Date.now()}`,
      name: newLink.name,
      url: newLink.url,
      comments: newLink.comments,
      created_at: new Date().toISOString(),
    };

    setLinks([...links, newLinkData]);
    setNewLink({ name: '', url: '', comments: '' });
    setShowNewLinkForm(false);
  };

  const handleDeleteLink = (linkId: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    setLinks(links.filter(link => link.id !== linkId));
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy link:', err);
      alert('Failed to copy link');
    });
  };

  if (loading && !company) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Loading client...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Client Details</h2>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    loadClient();
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Company *
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Company name"
                />
              ) : (
                <p className="text-slate-900 text-lg">{company || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contact Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contact Name"
                />
              ) : (
                <p className="text-slate-900">{contactName || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="client@example.com"
                />
              ) : (
                <p className="text-slate-900">{email || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone
              </label>
              {isEditing ? (
                <>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      phoneError
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-slate-300 focus:ring-blue-500'
                    }`}
                    placeholder="714-270-8047"
                  />
                  {phoneError && (
                    <p className="text-sm text-red-600 mt-1">{phoneError}</p>
                  )}
                </>
              ) : (
                <p className="text-slate-900">{phone || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main St, City, State 12345"
                />
              ) : (
                <p className="text-slate-900">{address || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Website
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              ) : (
                <p className="text-slate-900">{website || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes
              </label>
              {isEditing ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Additional notes..."
                />
              ) : (
                <p className="text-slate-900 whitespace-pre-wrap">{notes || '-'}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-slate-700">
                  Links
                </label>
                <button
                  onClick={() => setShowNewLinkForm(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Link
                </button>
              </div>

              <div className="space-y-3">
                {links.map((link) => (
                  <div key={link.id} className="border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <h4 className="font-medium text-slate-800 truncate">{link.name}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open
                        </button>
                        <button
                          onClick={() => handleCopyLink(link.url)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm font-medium"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </button>
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                    {link.comments && (
                      <p className="text-sm text-slate-600 pl-6">{link.comments}</p>
                    )}
                  </div>
                ))}

                {links.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-6">No links added yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showNewLinkForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Add New Link</h3>
              <button
                onClick={() => {
                  setShowNewLinkForm(false);
                  setNewLink({ name: '', url: '', comments: '' });
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Link Name *
                </label>
                <input
                  type="text"
                  value={newLink.name}
                  onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Design Mockup"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Comments
                </label>
                <textarea
                  value={newLink.comments}
                  onChange={(e) => setNewLink({ ...newLink, comments: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Additional notes about this link..."
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddLink}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Add Link
                </button>
                <button
                  onClick={() => {
                    setShowNewLinkForm(false);
                    setNewLink({ name: '', url: '', comments: '' });
                  }}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
