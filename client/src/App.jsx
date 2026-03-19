import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell     from './components/AppShell';
import Login        from './pages/Login';
import Today        from './pages/Today';
import Customers    from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Alerts       from './pages/Alerts';
import Simulator    from './pages/Simulator';
import Chat         from './pages/Chat';
import Transactions from './pages/Transactions';
import AddCustomer  from './pages/AddCustomer';
import Audit        from './pages/Audit';
import { Branch, Training } from './pages/Other';
import { Spinner }  from './components/UI';
import './index.css';

function ProtectedRoute({ children }) {
  const { rm, loading } = useAuth();
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--ink-4)', fontSize: 13 }}>
      <Spinner /> Loading WealthOS…
    </div>
  );
  return rm ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute><AppShell /></ProtectedRoute>
      }>
        <Route index          element={<Today />} />
        <Route path="customers"          element={<Customers />} />
        <Route path="customers/:id"      element={<CustomerDetail />} />
        <Route path="alerts"             element={<Alerts />} />
        <Route path="simulator"          element={<Simulator />} />
        <Route path="chat"               element={<Chat />} />
        <Route path="transactions"       element={<Transactions />} />
        <Route path="add-customer"       element={<AddCustomer />} />
        <Route path="audit"              element={<Audit />} />
        <Route path="branch"             element={<Branch />} />
        <Route path="training"           element={<Training />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
