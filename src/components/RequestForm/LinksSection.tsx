import React, { useState } from 'react';
import { RequestLink } from '../../lib/firebase';
import { Plus, ExternalLink, Trash2, X, Copy } from 'lucide-react';

interface LinksSectionProps {
  requestId?: string;
  links: RequestLink[];
  onLinksChange: (links: RequestLink[]) => void;
}

export const LinksSection: React.FC<LinksSectionProps> = ({ requestId, links, onLinksChange }) => {
  const [showNewLinkForm, setShowNewLinkForm] = useState(false);
  const [newLink, setNewLink] = useState({
    name: '',
    url: '',
    comments: '',
  });

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

    onLinksChange([...links, newLinkData]);
    setNewLink({ name: '', url: '', comments: '' });
    setShowNewLinkForm(false);
  };

  const handleDeleteLink = (linkId: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    onLinksChange(links.filter(link => link.id !== linkId));
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy link:', err);
      alert('Failed to copy link');
    });
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
