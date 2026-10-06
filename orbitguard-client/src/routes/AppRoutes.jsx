import { Routes, Route } from "react-router-dom";

import Landing from "../pages/public/Landing";
import Register from "../pages/public/Register";
import Login from "../pages/public/Login";

import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";

import Dashboard from "../pages/app/Dashboard";
import AIAssistant from "../pages/app/AIAssistant";

import Satellites from "../pages/app/Satellites";
import SatelliteDetails from "../pages/app/SatelliteDetails";

import Debris from "../pages/app/Debris";
import DebrisDetails from "../pages/app/DebrisDetails";

import Risks from "../pages/app/Risks";
import RiskDetails from "../pages/app/RiskDetails";

function AppRoutes() {
  return (
    <Routes>
      {/* =========================================================
          PUBLIC ROUTES
          ========================================================= */}

      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      {/* =========================================================
          PROTECTED APPLICATION
          ========================================================= */}

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* =====================================================
              DASHBOARD
              ===================================================== */}

          <Route path="/dashboard" element={<Dashboard />} />

          {/* =====================================================
              SATELLITES
              ===================================================== */}

          <Route path="/satellites" element={<Satellites />} />

          <Route
            path="/satellites/:satelliteId"
            element={<SatelliteDetails />}
          />

          {/* =====================================================
              DEBRIS
              ===================================================== */}

          <Route path="/debris" element={<Debris />} />

          <Route path="/debris/:debrisId" element={<DebrisDetails />} />

          {/* =====================================================
              RISKS
              ===================================================== */}

          <Route path="/risks" element={<Risks />} />

          <Route path="/risks/:id" element={<RiskDetails />} />

          {/* =====================================================
              VISUALIZATION
              ===================================================== */}

          <Route path="/visualization" element={<div>Visualization</div>} />

          {/* =====================================================
              ALERTS
              ===================================================== */}

          <Route path="/alerts" element={<div>Alerts</div>} />

          {/* =====================================================
              NOTIFICATIONS
              ===================================================== */}

          <Route path="/notifications" element={<div>Notifications</div>} />

          {/* =====================================================
              REPORTS
              ===================================================== */}

          <Route path="/reports" element={<div>Reports</div>} />

          {/* =====================================================
              AI ASSISTANT
              ===================================================== */}

          <Route path="/ai-assistant" element={<AIAssistant />} />

          {/* =====================================================
              SETTINGS
              ===================================================== */}

          <Route path="/settings" element={<div>Settings</div>} />
        </Route>
      </Route>

      {/* =========================================================
          FALLBACK
          ========================================================= */}

      <Route path="*" element={<div>Page Not Found</div>} />
    </Routes>
  );
}

export default AppRoutes;
