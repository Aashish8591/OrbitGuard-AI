import { Routes, Route } from "react-router-dom";

import Landing from "../pages/public/Landing";
import Register from "../pages/public/Register";
import Login from "../pages/public/Login";
import ProtectedRoute from "./ProtectedRoute";

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
          PROTECTED APPLICATION ROUTES
          ========================================================= */}

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<div>Dashboard</div>} />

        <Route path="/satellites" element={<div>Satellites</div>} />
        <Route
          path="/satellites/:id"
          element={<div>Satellite Details</div>}
        />

        <Route path="/debris" element={<div>Debris</div>} />
        <Route
          path="/debris/:id"
          element={<div>Debris Details</div>}
        />

        <Route path="/risks" element={<div>Risks</div>} />
        <Route
          path="/risks/:id"
          element={<div>Risk Details</div>}
        />

        <Route
          path="/visualization"
          element={<div>Visualization</div>}
        />

        <Route path="/alerts" element={<div>Alerts</div>} />

        <Route
          path="/notifications"
          element={<div>Notifications</div>}
        />

        <Route path="/reports" element={<div>Reports</div>} />

        <Route
          path="/ai-assistant"
          element={<div>AI Assistant</div>}
        />

        <Route path="/settings" element={<div>Settings</div>} />
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