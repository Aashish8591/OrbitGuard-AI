import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  /*
   * Wait until AuthContext has restored the
   * authentication state from localStorage.
   */
  if (isInitializing) {
    return null;
  }

  /*
   * User is not authenticated.
   *
   * Redirect to login and remember the page
   * they originally tried to access.
   */
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  /*
   * User is authenticated.
   * Render the protected child route.
   */
  return <Outlet />;
}

export default ProtectedRoute;