import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import useSync from './hooks/useSync';
import OfflineBanner from './components/OfflineBanner';
import BackgroundEffect from './components/BackgroundEffect';
import Login     from './pages/Login';
import Home      from './pages/Home';
import SOSForm   from './pages/SOSForm';
import VictimLog from './pages/VictimLog';
import Dashboard from './pages/Dashboard';
import MapView   from './pages/MapView';

const Guard = ({ children, roles }) => {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  useSync();
  return (
    <BrowserRouter>
      <BackgroundEffect />
      <OfflineBanner />
      <Routes>
        <Route path="/login"  element={<Login />} />
        <Route path="/"       element={<Home />} />
        <Route path="/sos"    element={<SOSForm />} />
        <Route path="/victims/new" element={
          <Guard roles={['field_worker', 'admin']}><VictimLog /></Guard>
        } />
        <Route path="/dashboard" element={
          <Guard roles={['field_worker', 'command', 'admin']}><Dashboard /></Guard>
        } />
        <Route path="/map" element={
          <Guard roles={['field_worker', 'command', 'admin']}><MapView /></Guard>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
