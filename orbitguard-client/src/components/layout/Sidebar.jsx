import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import {
  FiActivity,
  FiAlertTriangle,
  FiBell,
  FiChevronRight,
  FiCpu,
  FiDatabase,
  FiFileText,
  FiGlobe,
  FiGrid,
  FiLogOut,
  FiRadio,
  FiSettings,
  FiX,
} from "react-icons/fi";

import { RiRobot3Line } from "react-icons/ri";


import { useAuth } from "../../context/AuthContext";

/* =================================================================
   CONSTANTS
   ================================================================= */

const SIDEBAR_WIDTH = 245;
const SIDEBAR_COLLAPSED_WIDTH = 72;

const EASE = [0.22, 1, 0.36, 1];

/* =================================================================
   NAVIGATION CONFIGURATION
   ================================================================= */

const PRIMARY_NAVIGATION = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: FiGrid,
  },
  {
    label: "Live Satellites",
    path: "/satellites",
    icon: FiRadio,
  },
  {
    label: "Space Debris",
    path: "/debris",
    icon: FiDatabase,
  },
  {
    label: "Collision Risks",
    path: "/risks",
    icon: FiAlertTriangle,
  },
  {
    label: "3D Visualization",
    path: "/visualization",
    icon: FiGlobe,
  },
];

const OPERATIONS_NAVIGATION = [
  {
    label: "Alerts",
    path: "/alerts",
    icon: FiBell,
  },
  {
    label: "Notifications",
    path: "/notifications",
    icon: FiActivity,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: FiFileText,
  },
];

const INTELLIGENCE_NAVIGATION = [
  {
    label: "AI Assistant",
    path: "/ai-assistant",
    icon: RiRobot3Line,
  },
];

const SYSTEM_NAVIGATION = [
  {
    label: "Settings",
    path: "/settings",
    icon: FiSettings,
  },
];

/* =================================================================
   SIDEBAR
   ================================================================= */

/**
 * OrbitGuard application sidebar.
 *
 * Desktop / tablet:
 * - Collapsed by default
 * - Expands on mouse enter
 * - Collapses on mouse leave
 *
 * Mobile:
 * - Controlled through mobileOpen
 * - Appears as a slide-in drawer
 *
 * @param {boolean} mobileOpen
 * @param {Function} onMobileClose
 */
function Sidebar({
  mobileOpen = false,
  onMobileClose = () => {},
}) {
  const { logout } = useAuth();

  const [isHovered, setIsHovered] = useState(false);

  /*
   * Desktop sidebar is expanded only while hovered.
   *
   * Mobile uses a separate drawer state supplied
   * by AppLayout later.
   */
  const isExpanded = isHovered;

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleNavigation = () => {
    /*
     * On mobile, close the drawer after selecting
     * a navigation item.
     *
     * On desktop this callback does nothing.
     */
    onMobileClose();
  };

  const handleLogout = () => {
    logout();
    onMobileClose();
  };

  return (
    <>
      {/* =========================================================
          MOBILE BACKDROP
          ========================================================= */}

      <AnimatePresence>
        {mobileOpen && (
          <motion.button
            type="button"
            aria-label="Close navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onMobileClose}
            className="
              fixed
              inset-0
              z-40
              cursor-default
              bg-[#02050c]/70
              backdrop-blur-[2px]
              md:hidden
            "
          />
        )}
      </AnimatePresence>

      {/* =========================================================
          SIDEBAR
          ========================================================= */}

      <motion.aside
        initial={false}
        animate={{
          width: isExpanded
            ? SIDEBAR_WIDTH
            : SIDEBAR_COLLAPSED_WIDTH,
          x: mobileOpen ? 0 : undefined,
        }}
        transition={{
          width: {
            duration: 0.28,
            ease: EASE,
          },
          x: {
            duration: 0.32,
            ease: EASE,
          },
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="
          fixed
          inset-y-0
          left-0
          z-50
          hidden
          overflow-hidden
          border-r
          border-white/[0.07]
          bg-[#070c18]/95
          shadow-[12px_0_40px_rgba(0,0,0,0.30)]
          backdrop-blur-xl
          md:flex
          md:flex-col
        "
        style={{
          minWidth: isExpanded
            ? SIDEBAR_WIDTH
            : SIDEBAR_COLLAPSED_WIDTH,
        }}
      >
        <SidebarContent
          isExpanded={isExpanded}
          onNavigation={handleNavigation}
          onLogout={handleLogout}
        />
      </motion.aside>

      {/* =========================================================
          MOBILE DRAWER
          ========================================================= */}

      <motion.aside
        initial={false}
        animate={{
          x: mobileOpen ? 0 : "-100%",
        }}
        transition={{
          duration: 0.32,
          ease: EASE,
        }}
        className="
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-[220px]
          max-w-[86vw]
          flex-col
          overflow-hidden
          border-r
          border-white/[0.08]
          bg-[#070c18]
          shadow-[20px_0_60px_rgba(0,0,0,0.55)]
          md:hidden
        "
      >
        {/* Mobile close button */}

        <div
          className="
            flex
            h-[76px]
            shrink-0
            items-center
            justify-between
            border-b
            border-white/[0.07]
            px-5
          "
        >
          <div className="flex items-center">
            <img
              src="/images/branding/orbitguard-minimal.png"
              alt="OrbitGuard AI"
              className="h-7 w-auto object-contain"
            />
          </div>

          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close navigation"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              border
              border-white/[0.06]
              bg-white/[0.025]
              text-white/45
              transition-colors
              duration-200
              hover:bg-white/[0.06]
              hover:text-white
            "
          >
            <FiX size={17} />
          </button>
        </div>

        <SidebarContent
          isExpanded
          onNavigation={handleNavigation}
          onLogout={handleLogout}
        />
      </motion.aside>
    </>
  );
}

/* =================================================================
   SIDEBAR CONTENT
   ================================================================= */

function SidebarContent({
  isExpanded,
  onNavigation,
  onLogout,
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* =========================================================
          DESKTOP BRANDING
          ========================================================= */}

      <div
        className={`
          hidden
          h-[76px]
          shrink-0
          items-center
          border-b
          border-white/[0.07]
          md:flex
          ${isExpanded ? "px-5" : "justify-center px-2"}
        `}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isExpanded ? (
            <motion.img
              key="full-logo"
              src="/images/branding/orbitguard-minimal.png"
              alt="OrbitGuard AI"
              initial={{
                opacity: 0,
                x: -8,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -8,
              }}
              transition={{
                duration: 0.18,
                ease: EASE,
              }}
              className="h-7 w-auto max-w-[190px] object-contain"
            />
          ) : (
            <motion.img
              key="mark-logo"
              src="/images/branding/orbitguard-mark.png"
              alt="OrbitGuard AI"
              initial={{
                opacity: 0,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
              }}
              transition={{
                duration: 0.18,
                ease: EASE,
              }}
              className="h-8 w-8 object-contain"
            />
          )}
        </AnimatePresence>
      </div>

      {/* =========================================================
          NAVIGATION
          ========================================================= */}

      <nav
        aria-label="Primary navigation"
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overflow-x-hidden
          px-2
          py-4
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        <SidebarSection
          title="Primary"
          items={PRIMARY_NAVIGATION}
          isExpanded={isExpanded}
          onNavigation={onNavigation}
        />

        <SidebarSection
          title="Operations"
          items={OPERATIONS_NAVIGATION}
          isExpanded={isExpanded}
          onNavigation={onNavigation}
        />

        <SidebarSection
          title="Intelligence"
          items={INTELLIGENCE_NAVIGATION}
          isExpanded={isExpanded}
          onNavigation={onNavigation}
        />

        <SidebarSection
          title="System"
          items={SYSTEM_NAVIGATION}
          isExpanded={isExpanded}
          onNavigation={onNavigation}
        />
      </nav>

      {/* =========================================================
          LOGOUT
          ========================================================= */}

      <div
        className="
          shrink-0
          border-t
          border-white/[0.07]
          p-2
        "
      >
        <button
          type="button"
          onClick={onLogout}
          title={!isExpanded ? "Sign out" : undefined}
          className={`
            group
            flex
            h-11
            w-full
            items-center
            rounded-xl
            text-white/35
            transition-all
            duration-200
            hover:bg-red-400/[0.06]
            hover:text-red-300/80
            ${isExpanded ? "gap-3 px-3" : "justify-center px-0"}
          `}
        >
          <span
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              transition-colors
              duration-200
              group-hover:bg-red-400/[0.06]
            "
          >
            <FiLogOut size={16} />
          </span>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.span
                initial={{
                  opacity: 0,
                  x: -6,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -6,
                }}
                transition={{
                  duration: 0.16,
                  ease: EASE,
                }}
                className="
                  whitespace-nowrap
                  text-[11px]
                  font-medium
                  uppercase
                  tracking-[0.16em]
                "
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}

/* =================================================================
   SIDEBAR SECTION
   ================================================================= */

function SidebarSection({
  title,
  items,
  isExpanded,
  onNavigation,
}) {
  return (
    <div className="mb-5 last:mb-0">
      {/* Section heading */}

      <div className="mb-1.5 h-5 overflow-hidden px-2">
        <AnimatePresence initial={false}>
          {isExpanded ? (
            <motion.p
              initial={{
                opacity: 0,
                x: -6,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -6,
              }}
              transition={{
                duration: 0.16,
                ease: EASE,
              }}
              className="
                whitespace-nowrap
                text-[8px]
                font-medium
                uppercase
                tracking-[0.24em]
                text-white/20
              "
            >
              {title}
            </motion.p>
          ) : (
            <span
              aria-hidden="true"
              className="
                mx-auto
                mt-2
                block
                h-px
                w-5
                bg-white/[0.08]
              "
            />
          )}
        </AnimatePresence>
      </div>

      {/* Items */}

      <div className="space-y-1">
        {items.map((item) => (
          <SidebarItem
            key={item.path}
            item={item}
            isExpanded={isExpanded}
            onNavigation={onNavigation}
          />
        ))}
      </div>
    </div>
  );
}

/* =================================================================
   SIDEBAR ITEM
   ================================================================= */

function SidebarItem({
  item,
  isExpanded,
  onNavigation,
}) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      onClick={onNavigation}
      title={!isExpanded ? item.label : undefined}
      className={({ isActive }) =>
        `
          group
          relative
          flex
          h-11
          w-full
          items-center
          rounded-xl
          transition-all
          duration-200
          ${isExpanded ? "gap-3 px-2.5" : "justify-center px-0"}
          ${
            isActive
              ? "bg-cyan-300/[0.08] text-cyan-200"
              : "text-white/35 hover:bg-white/[0.035] hover:text-white/75"
          }
        `
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator */}

          <motion.span
            initial={false}
            animate={{
              opacity: isActive ? 1 : 0,
              scaleY: isActive ? 1 : 0.5,
            }}
            className="
              absolute
              left-0
              top-2
              h-7
              w-[2px]
              origin-center
              rounded-full
              bg-cyan-300
              shadow-[0_0_10px_rgba(103,232,249,0.55)]
            "
          />

          {/* Icon container */}

          <span
            className={`
              relative
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              transition-all
              duration-200
              ${
                isActive
                  ? "bg-cyan-300/[0.08] text-cyan-300"
                  : "text-inherit group-hover:bg-white/[0.035]"
              }
            `}
          >
            <Icon size={17} strokeWidth={1.8} />
          </span>

          {/* Label */}

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.span
                initial={{
                  opacity: 0,
                  x: -7,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -7,
                }}
                transition={{
                  duration: 0.16,
                  ease: EASE,
                }}
                className={`
                  min-w-0
                  flex-1
                  truncate
                  whitespace-nowrap
                  text-[11px]
                  font-medium
                  tracking-[0.01em]
                  ${
                    isActive
                      ? "text-cyan-100/90"
                      : "text-white/45 group-hover:text-white/75"
                  }
                `}
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Active route arrow */}

          <AnimatePresence initial={false}>
            {isExpanded && isActive && (
              <motion.span
                initial={{
                  opacity: 0,
                  x: -4,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -4,
                }}
                transition={{
                  duration: 0.16,
                }}
                className="text-cyan-300/50"
              >
                <FiChevronRight size={13} />
              </motion.span>
            )}
          </AnimatePresence>
        </>
      )}
    </NavLink>
  );
}

export default Sidebar;