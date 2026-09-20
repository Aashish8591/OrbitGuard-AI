import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import ProtectedBackground from "../common/ProtectedBackground";

/* =================================================================
   CONSTANTS
   ================================================================= */

const NAVBAR_HEIGHT = 68;
const SIDEBAR_COLLAPSED_WIDTH = 72;

/* =================================================================
   APP LAYOUT
   ================================================================= */

/**
 * Global layout for authenticated OrbitGuard pages.
 *
 * Responsibilities:
 * - Render the global Navbar
 * - Render the desktop/mobile Sidebar
 * - Manage mobile navigation state
 * - Render the active authenticated route through Outlet
 *
 * This component intentionally contains no:
 * - API calls
 * - authentication logic
 * - dashboard logic
 * - page-specific UI
 */
function AppLayout() {
  const location = useLocation();

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  /* ===============================================================
     MOBILE SIDEBAR
     =============================================================== */

  const openMobileSidebar = () => {
    setMobileSidebarOpen(true);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  /* ===============================================================
     CLOSE MOBILE SIDEBAR AFTER ROUTE CHANGE
     =============================================================== */

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div
      className="
        min-h-[100svh]
        overflow-x-hidden
        bg-[#050816]
        text-white
      "
    >

      {/* =========================================================
        PROTECTED SPACE ENVIRONMENT
      ========================================================= */}

      <ProtectedBackground />


      {/* =========================================================
          GLOBAL NAVBAR
          ========================================================= */}

      <Navbar onMenuClick={openMobileSidebar} />

      {/* =========================================================
          APPLICATION SIDEBAR
          ========================================================= */}

      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />

      {/* =========================================================
          MAIN APPLICATION CONTENT
          ========================================================= */}

      <main
        className="
          min-h-[100svh]
          pt-[68px]

          md:pl-[72px]
        "
        style={{
          paddingTop: NAVBAR_HEIGHT,
        }}
      >
        <div
          className="
            min-h-[calc(100svh-68px)]
            w-full
          "
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;