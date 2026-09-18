import { Routes, Route } from "react-router-dom";

import Landing from "../pages/public/Landing";
import Register from "../pages/public/Register";
import Login from "../pages/public/Login";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";

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
          {/* Dashboard */}

          <Route
            path="/dashboard"
            element={<div>Dashboard</div>}
          />

          {/* Satellites */}

          <Route
            path="/satellites"
            element={<div>Satellites</div>}
          />

          <Route
            path="/satellites/:id"
            element={<div>Satellite Details</div>}
          />

          {/* Debris */}

          <Route
            path="/debris"
            element={<div>Debris</div>}
          />

          <Route
            path="/debris/:id"
            element={<div>Debris Details</div>}
          />

          {/* Risks */}

          <Route
            path="/risks"
            element={<div>Risks</div>}
          />

          <Route
            path="/risks/:id"
            element={<div>Risk Details</div>}
          />

          {/* Visualization */}

          <Route
            path="/visualization"
            element={<div>Visualization</div>}
          />

          {/* Alerts */}

          <Route
            path="/alerts"
            element={<div>Alerts</div>}
          />

          {/* Notifications */}

          <Route
            path="/notifications"
            element={<div>Notifications</div>}
          />

          {/* Reports */}

          <Route
            path="/reports"
            element={<div>Reports</div>}
          />

          {/* AI Assistant */}

          <Route
            path="/ai-assistant"
            element={<div>AI Assistant</div>}
          />

          {/* Settings */}

          <Route
            path="/settings"
            element={<div>Settings</div>}
          />
        </Route>
      </Route>

      {/* =========================================================
          FALLBACK
          ========================================================= */}

      <Route
        path="*"
        element={<div>Page Not Found</div>}
      />
    </Routes>
  );
}

export default AppRoutes;