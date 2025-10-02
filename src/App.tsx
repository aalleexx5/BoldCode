import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Header } from './components/Header';
import { RequestList } from './components/RequestList/RequestList';
import { RequestForm } from './components/RequestForm/RequestForm';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentPage, setCurrentPage] = useState<'requests' | 'clients'>('requests');
  const [selectedRequestId, setSelectedRequestId] = useState<string | undefined>();
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <Login onToggleMode={() => setAuthMode('register')} />
    ) : (
      <Register onToggleMode={() => setAuthMode('login')} />
    );
  }

  const handleSaveRequest = () => {
    setSelectedRequestId(undefined);
    setShowNewRequest(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCloseRequest = () => {
    setSelectedRequestId(undefined);
    setShowNewRequest(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
      {currentPage === 'requests' ? (
        selectedRequestId || showNewRequest ? (
          <RequestForm
            requestId={selectedRequestId}
            onClose={handleCloseRequest}
            onSave={handleSaveRequest}
          />
        ) : (
          <RequestList
            onSelectRequest={setSelectedRequestId}
            onNewRequest={() => setShowNewRequest(true)}
            onNavigateToClients={() => setCurrentPage('clients')}
            refreshTrigger={refreshTrigger}
          />
        )
      ) : (
        <div>Clients Page Placeholder</div>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
