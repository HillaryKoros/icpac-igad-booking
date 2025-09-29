import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AuthFlow from './components/auth/AuthFlow';
import Footer from './components/Footer';
import BookingBoard from './components/BookingBoard';
import DashboardPage from './components/DashboardPage';
import ProcurementRequisitionForm from './components/ProcurementRequisitionForm';

// Main App Content - Protected by AuthFlow
const AppContent = () => {
  return (
    <AuthFlow>
      <div className="App min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<BookingBoard />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/procurement"
              element={
                <div className="flex-1 flex items-center justify-center p-4">
                  <div className="max-w-4xl w-full">
                    <ProcurementRequisitionForm />
                  </div>
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthFlow>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;
