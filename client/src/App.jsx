import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import useAuthStore from "./store/authStore";
import useSync from "./hooks/useSync";

// Components
import OfflineBanner from "./components/OfflineBanner";
import BackgroundEffect from "./components/BackgroundEffect";

// Pages
import Login from "./pages/Login";
import Home from "./pages/Home";
import SOSForm from "./pages/SOSForm";
import VictimLog from "./pages/VictimLog";
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";

// 🔐 Route Guard
const Guard = ({ children, roles }) => {
  const { token, user } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;

  return children;
};

// 🔥 Main App Content (IMPORTANT)
function AppContent() {
  const location = useLocation();

  return (
    <>
      {/* 🌌 ONLY HOME PAGE BACKGROUND */}
      {location.pathname === "/" && <BackgroundEffect />}

      {/* 🧱 MAIN UI */}
      <div className="relative z-10">
        <OfflineBanner />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/sos" element={<SOSForm />} />

          {/* Protected Routes */}
          <Route
            path="/victims/new"
            element={
              <Guard roles={["field_worker", "admin"]}>
                <VictimLog />
              </Guard>
            }
          />

          <Route
            path="/dashboard"
            element={
              <Guard roles={["field_worker", "command", "admin"]}>
                <Dashboard />
              </Guard>
            }
          />

          <Route
            path="/map"
            element={
              <Guard roles={["field_worker", "command", "admin"]}>
                <MapView />
              </Guard>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  useSync();

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}