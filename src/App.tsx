import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Header } from './components/Header';
import { RequestList } from './components/RequestList/RequestList';
import { RequestForm } from './components/RequestForm/RequestForm';
import { Profile } from './components/Profile/Profile';
import { ClientList } from './components/Clients/ClientList';
import { ClientDetail } from './components/Clients/ClientDetail';
import { NewClientModal } from './components/Clients/NewClientModal';
import { CalendarView } from './components/Calendar/CalendarView';
import { ReportTypeSelector } from './components/Reports/ReportTypeSelector';
import { ReportsView } from './components/Reports/ReportsView';
import { ClientReports } from './components/Reports/ClientReports';
import emailjs from '@emailjs/browser';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentPage, setCurrentPage] = useState<'requests' | 'clients' | 'calendar' | 'reports'>('requests');
  const [selectedRequestId, setSelectedRequestId] = useState<string | undefined>();
  const [calendarFilters, setCalendarFilters] = useState<string[]>([]);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>();
  const [showNewClient, setShowNewClient] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [reportType, setReportType] = useState<'selector' | 'team' | 'client'>('selector');

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

  const handleSaveRequest = (newRequestId?: string) => {
    if (newRequestId) {
      setSelectedRequestId(newRequestId);
      setShowNewRequest(false);
      setRefreshTrigger((prev) => prev + 1);
    } else {
      setSelectedRequestId(undefined);
      setShowNewRequest(false);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const handleCloseRequest = () => {
    setSelectedRequestId(undefined);
    setShowNewRequest(false);
  };

  const handleSaveClient = () => {
    setSelectedClientId(undefined);
    setShowNewClient(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCloseClient = () => {
    setSelectedClientId(undefined);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onOpenProfile={() => setShowProfile(true)}
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
            onNavigateToCalendar={(filters) => {
              setCalendarFilters(filters);
              setCurrentPage('calendar');
            }}
            onNavigateToReports={() => setCurrentPage('reports')}
            refreshTrigger={refreshTrigger}
          />
        )
      ) : currentPage === 'reports' ? (
        selectedRequestId ? (
          <RequestForm
            requestId={selectedRequestId}
            onClose={() => {
              setSelectedRequestId(undefined);
              setCurrentPage('reports');
            }}
            onSave={() => {
              setSelectedRequestId(undefined);
              setCurrentPage('reports');
              setRefreshTrigger((prev) => prev + 1);
            }}
          />
        ) : reportType === 'selector' ? (
          <ReportTypeSelector
            onSelectType={(type) => setReportType(type)}
            onBack={() => {
              setCurrentPage('requests');
              setReportType('selector');
            }}
          />
        ) : reportType === 'team' ? (
          <ReportsView
            onBack={() => {
              setCurrentPage('requests');
              setReportType('selector');
            }}
            onSelectRequest={setSelectedRequestId}
            onSwitchToClientReports={() => setReportType('client')}
          />
        ) : (
          <ClientReports
            onBack={() => {
              setCurrentPage('requests');
              setReportType('selector');
            }}
            onSelectRequest={setSelectedRequestId}
            onSwitchToTeamReports={() => setReportType('team')}
          />
        )
      ) : currentPage === 'calendar' ? (
        selectedRequestId ? (
          <RequestForm
            requestId={selectedRequestId}
            onClose={() => {
              setSelectedRequestId(undefined);
              setCurrentPage('calendar');
            }}
            onSave={() => {
              setSelectedRequestId(undefined);
              setCurrentPage('calendar');
              setRefreshTrigger((prev) => prev + 1);
            }}
          />
        ) : (
          <CalendarView
            onSelectRequest={setSelectedRequestId}
            onBack={() => setCurrentPage('requests')}
            selectedFilters={calendarFilters}
            onFiltersChange={setCalendarFilters}
          />
        )
      ) : selectedClientId ? (
        <ClientDetail
          clientId={selectedClientId}
          onClose={handleCloseClient}
          onSave={handleSaveClient}
        />
      ) : (
        <ClientList
          onSelectClient={setSelectedClientId}
          onNewClient={() => setShowNewClient(true)}
          onNavigateToRequests={() => setCurrentPage('requests')}
        />
      )}
      {showProfile && <Profile onClose={() => setShowProfile(false)} />}
      {showNewClient && (
        <NewClientModal
          onClose={() => setShowNewClient(false)}
          onSave={handleSaveClient}
        />
      )}
    </div>
  );
};

function App() {
  useEffect(() => {
    const emailjsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (emailjsPublicKey) {
      emailjs.init(emailjsPublicKey);
      console.log('✅ EmailJS initialized successfully');
    } else {
      console.error('❌ EmailJS public key not found in environment variables');
    }
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
