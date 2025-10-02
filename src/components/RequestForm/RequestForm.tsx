import React, { useState, useEffect } from 'react';
import { db, Request, RequestLink } from '../../lib/firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { X, Save, Copy, Trash2 } from 'lucide-react';
import { ClientSelector } from './ClientSelector';
import { LinksSection } from './LinksSection';
import { CommentsSection } from './CommentsSection';
import { CostTrackerSection } from './CostTrackerSection';
import { RichTextEditor } from '../RichTextEditor/RichTextEditor';

interface RequestFormProps {
  requestId?: string;
  onClose: () => void;
  onSave: (newRequestId?: string) => void;
}

const REQUEST_TYPES = ['animation', 'web design', 'edit', 'social media', 'presentation', 'text copy'];
const STATUS_OPTIONS = ['submitted', 'draft', 'in progress', 'awaiting feedback', 'pending approval', 'completed', 'canceled'];

export const RequestForm: React.FC<RequestFormProps> = ({ requestId, onClose, onSave }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showCloseWarning, setShowCloseWarning] = useState(false);

  const [requestNumber, setRequestNumber] = useState('');
  const [title, setTitle] = useState('');
  const [requestType, setRequestType] = useState<string>(REQUEST_TYPES[0]);
  const [status, setStatus] = useState<string>('submitted');
  const [dueDate, setDueDate] = useState('');
  const [details, setDetails] = useState('');
  const [clientId, setClientId] = useState<string>('');
  const [createdAt, setCreatedAt] = useState('');
  const [pendingLinks, setPendingLinks] = useState<RequestLink[]>([]);

  useEffect(() => {
    if (requestId) {
      loadRequest();
    } else {
      generateRequestNumber();
      setCreatedAt(new Date().toISOString());
      setPendingLinks([]);
    }
  }, [requestId]);

  const generateRequestNumber = async () => {
    try {
      const q = query(collection(db, 'requests'), orderBy('request_number', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);

      let nextNumber = 1;
      if (!querySnapshot.empty) {
        const lastDoc = querySnapshot.docs[0];
        const lastNumber = parseInt(lastDoc.data().request_number);
        nextNumber = lastNumber + 1;
      }

      setRequestNumber(String(nextNumber).padStart(4, '0'));
    } catch (error) {
      console.error('Error generating request number:', error);
      setRequestNumber('0001');
    }
  };

  const loadRequest = async () => {
    if (!requestId) return;

    setLoading(true);
    try {
      const requestDoc = await getDoc(doc(db, 'requests', requestId));
      if (requestDoc.exists()) {
        const data = requestDoc.data();
        setRequestNumber(data.request_number);
        setTitle(data.title);
        setRequestType(data.request_type);
        setStatus(data.status);
        setDueDate(data.due_date || '');
        setDetails(data.details || '');
        setClientId(data.client_id || '');
        setCreatedAt(data.created_at);
        setPendingLinks(data.links || []);
      }
    } catch (error) {
      console.error('Error loading request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClone = async () => {
    if (!requestId) {
      alert('Request must be saved before cloning.');
      return;
    }

    if (hasChanges) {
      alert('Please save your changes before cloning this request.');
      return;
    }

    try {
      setLoading(true);

      await updateDoc(doc(db, 'requests', requestId), {
        status: 'completed',
        updated_at: new Date().toISOString(),
      });

      const newRequestNumber = await getNextRequestNumber();

      const newRequestData = {
        request_number: newRequestNumber,
        title,
        request_type: requestType,
        status: 'submitted',
        due_date: dueDate || '',
        details,
        client_id: clientId || '',
        links: pendingLinks,
        created_by: user!.uid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'requests'), newRequestData);

      setLoading(false);
      alert('Request Successfully Cloned.');
      onSave(docRef.id);
    } catch (error) {
      console.error('Error cloning request:', error);
      alert('Failed to clone request. Please try again.');
      setLoading(false);
    }
  };

  const getNextRequestNumber = async () => {
    try {
      const q = query(collection(db, 'requests'), orderBy('request_number', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);

      let nextNumber = 1;
      if (!querySnapshot.empty) {
        const lastDoc = querySnapshot.docs[0];
        const lastNumber = parseInt(lastDoc.data().request_number);
        nextNumber = lastNumber + 1;
      }

      return String(nextNumber).padStart(4, '0');
    } catch (error) {
      console.error('Error generating request number:', error);
      return '0001';
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a request title');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        request_number: requestNumber,
        title,
        request_type: requestType,
        status,
        due_date: dueDate || '',
        details,
        client_id: clientId || '',
        links: pendingLinks,
        created_by: user!.uid,
        updated_at: new Date().toISOString(),
      };

      if (requestId) {
        await updateDoc(doc(db, 'requests', requestId), requestData);
        setHasChanges(false);
        onSave();
      } else {
        const docRef = await addDoc(collection(db, 'requests'), {
          ...requestData,
          created_at: createdAt,
        });

        setHasChanges(false);
        onSave(docRef.id);
      }
    } catch (error) {
      console.error('Error saving request:', error);
      alert('Failed to save request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowCloseWarning(true);
    } else {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!requestId) return;

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this request? This action cannot be undone.'
    );

    if (!confirmDelete) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, 'requests', requestId));
      alert('Request deleted successfully');
      onClose();
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Failed to delete request. Please try again.');
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {requestId ? `Request #${requestNumber}` : 'New Request'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">Created: {formatDate(createdAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              {requestId && (
                <>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  <button
                    onClick={handleClone}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium disabled:opacity-50"
                  >
                    <Copy className="w-4 h-4" />
                    Clone
                  </button>
                </>
              )}
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleClose}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
              >
                <X className="w-4 h-4" />
                Close
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Request Information</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Request Title *
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          setHasChanges(true);
                        }}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter request title"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Request Type *
                        </label>
                        <select
                          value={requestType}
                          onChange={(e) => {
                            setRequestType(e.target.value);
                            setHasChanges(true);
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize"
                        >
                          {REQUEST_TYPES.map((type) => (
                            <option key={type} value={type} className="capitalize">
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Status
                        </label>
                        <select
                          value={status}
                          onChange={(e) => {
                            setStatus(e.target.value);
                            setHasChanges(true);
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} className="capitalize">
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => {
                          setDueDate(e.target.value);
                          setHasChanges(true);
                        }}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Request Details</h3>
                  <RichTextEditor
                    value={details}
                    onChange={(value) => {
                      setDetails(value);
                      setHasChanges(true);
                    }}
                    placeholder="Enter detailed description of the request..."
                  />
                </div>

                <LinksSection
                  requestId={requestId}
                  links={pendingLinks}
                  onLinksChange={(links) => {
                    setPendingLinks(links);
                    setHasChanges(true);
                  }}
                />
              </div>

              <div className="space-y-6">
                <ClientSelector
                  selectedClientId={clientId}
                  onChange={(id) => {
                    setClientId(id);
                    setHasChanges(true);
                  }}
                />

                {requestId && <CommentsSection requestId={requestId} />}

                {requestId && <CostTrackerSection requestId={requestId} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCloseWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Unsaved Changes</h3>
            <p className="text-slate-600 mb-6">
              You have unsaved changes. Are you sure you want to close without saving?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCloseWarning(false)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCloseWarning(false);
                  onClose();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Close Without Saving
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
