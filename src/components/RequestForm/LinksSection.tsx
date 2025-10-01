import React, { useState, useEffect } from 'react';
import { db, RequestLink } from '../../lib/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Plus, ExternalLink, Trash2, X } from 'lucide-react';

interface LinksSectionProps {
  requestId: string;
}

export const LinksSection: React.FC<LinksSectionProps> = ({ requestId }) => {
  const [links, setLinks] = useState<RequestLink[]>([]);
  const [showNewLinkForm, setShowNewLinkForm] = useState(false);
  const [newLink, setNewLink] = useState({
    name: '',
    url: '',
    comments: '',
  });

  useEffect(() => {
    loadLinks();
  }, [requestId]);

  const loadLinks = async () => {
    try {
      const q = query(
        collection(db, 'request_links'),
        where('request_id', '==', requestId),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const linksData: RequestLink[] = [];
      querySnapshot.forEach((doc) => {
        linksData.push({ id: doc.id, ...doc.data() } as RequestLink);
      });
      setLinks(linksData);
    } catch (error) {
      console.error('Error loading links:', error);
    }
  };

  const handleAddLink = async () => {
    if (!newLink.name.trim() || !newLink.url.trim()) {
      alert('Please enter both name and URL');
      return;
    }

    try {
      await addDoc(collection(db, 'request_links'), {
        request_id: requestId,
        ...newLink,
        created_at: new Date().toISOString(),
      });

      setNewLink({ name: '', url: '', comments: '' });
      setShowNewLinkForm(false);
      loadLinks();
    } catch (error) {
      console.error('Error adding link:', error);
      alert('Failed to add link. Please try again.');
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      await deleteDoc(doc(db, 'request_links', linkId));
      loadLinks();
    } catch (error) {
      console.error('Error deleting link:', error);
      alert('Failed to delete link. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Links</h3>
        <button
          onClick={() => setShowNewLinkForm(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      <div className="space-y-3">
        {links.map((link) => (
          <div key={link.id} className="border border-slate-200 rounded-lg p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <h4 className="font-medium text-slate-800 truncate">{link.name}</h4>
                </div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline truncate block mb-2"
                >
                  {link.url}
                </a>
                {link.comments && (
                  <p className="text-sm text-slate-600 mt-2">{link.comments}</p>
                )}
              </div>
              <button
                onClick={() => handleDeleteLink(link.id)}
                className="text-slate-400 hover:text-red-600 ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {links.length === 0 && !showNewLinkForm && (
          <p className="text-sm text-slate-500 text-center py-6">No links added yet</p>
        )}
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
