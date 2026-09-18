import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";

/* =================================================================
   APP LAYOUT
   ================================================================= */

/**
 * Main layout for all authenticated OrbitGuard pages.
 *
 * Responsibilities:
 * - Render the persistent application sidebar
 * - Provide the authenticated page content area
 * - Manage the mobile sidebar drawer state
 *
 * The layout intentionally does NOT contain:
 * - Dashboard logic
 * - API calls
 * - Authentication logic
 * - Page-specific UI
 *
 * Those responsibilities belong to their respective modules.
 */
function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleOpenMobileSidebar = () => {
    setMobileSidebarOpen(true);
  };

  const handleCloseMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-[100svh] bg-[#050816] text-white">
      {/* =========================================================
          SIDEBAR
          ========================================================= */}

      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={handleCloseMobileSidebar}
      />

      {/* =========================================================
          APPLICATION CONTENT
          ========================================================= */}

      <main
        className="
          min-h-[100svh]
          md:pl-[72px]
        "
      >
        {/* -------------------------------------------------------
            Mobile menu trigger

            Temporary until Topbar is created.

            This allows us to test the mobile drawer now without
            introducing the Topbar component prematurely.
        ------------------------------------------------------- */}

        <button
          type="button"
          onClick={handleOpenMobileSidebar}
          aria-label="Open navigation"
          className="
            fixed
            left-4
            top-4
            z-30
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-white/[0.08]
            bg-[#0a1020]/90
            text-white/65
            shadow-[0_8px_25px_rgba(0,0,0,0.30)]
            backdrop-blur-xl
            transition-all
            duration-200
            hover:border-cyan-300/[0.18]
            hover:bg-[#0d1527]
            hover:text-cyan-300
            md:hidden
          "
        >
          <span className="flex flex-col gap-1">
            <span className="h-px w-4 bg-current" />
            <span className="h-px w-4 bg-current" />
            <span className="h-px w-3 bg-current" />
          </span>
        </button>

        {/* -------------------------------------------------------
            Nested authenticated page
        ------------------------------------------------------- */}

        <div className="min-h-[100svh]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AppLayout;