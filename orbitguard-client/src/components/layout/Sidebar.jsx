import { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { NavLink } from "react-router-dom";

import {
  FiActivity,
  FiAlertTriangle,
  FiBell,
  FiChevronRight,
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
const NAVBAR_HEIGHT = 68;

const EASE = [0.22, 1, 0.36, 1];

const SIDEBAR_BACKGROUND = {
  backgroundImage:
    "linear-gradient(rgba(2, 9, 20, 0.82), rgba(2, 9, 20, 0.92)), url('/images/background/space-sidebar-bg.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};

/* =================================================================
   NAVIGATION CONFIGURATION
   ================================================================= */

const PRIMARY_NAVIGATION = [
  { label: "Dashboard", path: "/dashboard", icon: FiGrid },
  { label: "Live Satellites", path: "/satellites", icon: FiRadio },
  { label: "Space Debris", path: "/debris", icon: FiDatabase },
  { label: "Collision Risks", path: "/risks", icon: FiAlertTriangle },
  { label: "3D Visualization", path: "/visualization", icon: FiGlobe },
];

const OPERATIONS_NAVIGATION = [
  { label: "Alerts", path: "/alerts", icon: FiBell },
  { label: "Notifications", path: "/notifications", icon: FiActivity },
  { label: "Reports", path: "/reports", icon: FiFileText },
];

const INTELLIGENCE_NAVIGATION = [
  { label: "AI Assistant", path: "/ai-assistant", icon: RiRobot3Line },
];

const SYSTEM_NAVIGATION = [
  { label: "Settings", path: "/settings", icon: FiSettings },
];

/* =================================================================
   SIDEBAR
   ================================================================= */

function Sidebar({
  mobileOpen = false,
  onMobileClose = () => {},
}) {
  const { logout } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isHovered;

  const handleNavigation = () => {
    onMobileClose();
  };

  const handleLogout = () => {
    onMobileClose();
    logout();
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.button
            type="button"
            aria-label="Close navigation"
            onClick={onMobileClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="
              fixed inset-x-0 bottom-0 z-40
              cursor-default bg-[#02050c]/70
              backdrop-blur-[2px] md:hidden
            "
            style={{ top: NAVBAR_HEIGHT }}
          />
        )}
      </AnimatePresence>

      {/* Desktop / tablet sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isExpanded
            ? SIDEBAR_WIDTH
            : SIDEBAR_COLLAPSED_WIDTH,
        }}
        transition={{
          width: { duration: 0.28, ease: EASE },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Application navigation"
        className="
          fixed left-0 bottom-0 z-50 hidden
          overflow-hidden rounded-r-[28px]
          border-r border-t border-white/[0.07]
          bg-[#070c18]/95
          shadow-[12px_10px_40px_rgba(0,0,0,0.32)]
          backdrop-blur-xl md:flex md:flex-col
        "
        style={{
          top: NAVBAR_HEIGHT,
          ...SIDEBAR_BACKGROUND,
        }}
      >
        <SidebarContent
          isExpanded={isExpanded}
          onNavigation={handleNavigation}
          onLogout={handleLogout}
        />
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.32, ease: EASE }}
            className="
              fixed left-0 bottom-0 z-50
              w-[250px] max-w-[86vw]
              pointer-events-auto md:hidden
            "
            style={{ top: NAVBAR_HEIGHT }}
          >
            {/* Mobile sidebar panel */}
            <aside
              aria-label="Mobile application navigation"
              className="
                relative flex h-full w-full flex-col
                overflow-hidden rounded-r-[28px]
                border-r border-t border-white/[0.08]
                bg-[#070c18]
                shadow-[20px_10px_60px_rgba(0,0,0,0.55)]
                backdrop-blur-xl
              "
              style={SIDEBAR_BACKGROUND}
            >
              <SidebarContent
                isExpanded
                onNavigation={handleNavigation}
                onLogout={handleLogout}
              />
            </aside>

            {/* Close button outside the drawer */}
            <button
              type="button"
              onClick={onMobileClose}
              aria-label="Close navigation"
              title="Close navigation"
              className="
                pointer-events-auto absolute -right-11 top-4
                flex h-9 w-9 shrink-0 items-center justify-center
                rounded-full border border-white/[0.10]
                bg-[#070c18]/95 text-white/70
                shadow-[0_8px_24px_rgba(0,0,0,0.35)]
                backdrop-blur-xl transition-all duration-200
                hover:border-cyan-300/[0.20]
                hover:bg-[#0a1222] hover:text-cyan-300
                focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-cyan-400
              "
            >
              <FiX size={17} strokeWidth={1.8} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
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
      {/* Navigation */}
      <nav
        aria-label="Application navigation"
        className="
          min-h-0 flex-1 overflow-y-auto overflow-x-hidden
          px-3 py-5
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

      {/* Logout */}
      <div className="shrink-0 border-t border-white/[0.07] p-2">
        <button
          type="button"
          onClick={onLogout}
          title={!isExpanded ? "Sign out" : undefined}
          className={`
            group flex h-11 w-full items-center rounded-xl
            text-white/50 transition-all duration-200
            hover:bg-red-400/[0.06] hover:text-red-300/90
            focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-cyan-400
            ${
              isExpanded
                ? "gap-3 px-3"
                : "justify-center px-0"
            }
          `}
        >
          <span
            className="
              flex h-8 w-8 shrink-0 items-center justify-center
              rounded-lg transition-colors duration-200
              group-hover:bg-red-400/[0.06]
            "
          >
            <FiLogOut size={16} strokeWidth={1.8} />
          </span>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.16, ease: EASE }}
                className="
                  font-display whitespace-nowrap
                  text-[9px] font-medium uppercase tracking-[0.14em]
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
    <section className="mb-5 last:mb-0">
      {/* Section heading */}
      <div className="mb-1.5 h-5 overflow-hidden px-2">
        <AnimatePresence initial={false}>
          {isExpanded ? (
            <motion.p
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.16, ease: EASE }}
              className="
                font-display whitespace-nowrap
                text-[8px] font-medium uppercase
                tracking-[0.20em] text-white/40
              "
            >
              {title}
            </motion.p>
          ) : (
            <span
              aria-hidden="true"
              className="
                mx-auto mt-2 block h-px w-5
                bg-white/[0.15]
              "
            />
          )}
        </AnimatePresence>
      </div>

      {/* Section items */}
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
    </section>
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
      className={({ isActive }) => `
        group relative flex h-11 w-full items-center
        rounded-xl transition-all duration-200
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-cyan-400
        ${
          isExpanded
            ? "gap-3 px-2.5"
            : "justify-center px-0"
        }
        ${
          isActive
            ? "bg-cyan-300/[0.10] text-cyan-200"
            : "text-white/60 hover:bg-white/[0.05] hover:text-white/90"
        }
      `}
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
            transition={{ duration: 0.18, ease: EASE }}
            className="
              absolute left-0 top-2 h-7 w-[2px]
              origin-center rounded-full bg-cyan-300
              shadow-[0_0_10px_rgba(103,232,249,0.55)]
            "
          />

          {/* Icon */}
          <span
            className={`
              relative flex h-8 w-8 shrink-0 items-center
              justify-center rounded-lg transition-all duration-200
              ${
                isActive
                  ? "bg-cyan-300/[0.10] text-cyan-300"
                  : "text-inherit group-hover:bg-white/[0.05]"
              }
            `}
          >
            <Icon size={17} strokeWidth={1.8} />
          </span>

          {/* Label */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -7 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -7 }}
                transition={{ duration: 0.16, ease: EASE }}
                className={`
                  font-display min-w-0 flex-1 truncate
                  whitespace-nowrap text-[9px] font-medium
                  tracking-[0.035em]
                  ${
                    isActive
                      ? "text-cyan-100/90"
                      : "text-white/65 group-hover:text-white/90"
                  }
                `}
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Active arrow */}
          <AnimatePresence initial={false}>
            {isExpanded && isActive && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.16, ease: EASE }}
                className="text-cyan-300/70"
              >
                <FiChevronRight size={13} strokeWidth={1.8} />
              </motion.span>
            )}
          </AnimatePresence>
        </>
      )}
    </NavLink>
  );
}

export default Sidebar;
