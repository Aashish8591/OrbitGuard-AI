import { useEffect, useState } from "react";
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

const SIDEBAR_IMAGE = "/images/About/about_bg.png";

const DESKTOP_IMAGE_STYLE = {
  backgroundImage: `
    linear-gradient(
      180deg,
      rgba(2, 9, 20, 0.84) 0%,
      rgba(2, 9, 20, 0.82) 48%,
      rgba(2, 9, 20, 0.92) 100%
    ),
    url("${SIDEBAR_IMAGE}")
  `,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};

const MOBILE_IMAGE_STYLE = {
  backgroundImage: `
    linear-gradient(
      180deg,
      rgba(2, 9, 20, 0.90) 0%,
      rgba(2, 9, 20, 0.80) 50%,
      rgba(2, 9, 20, 0.90) 100%
    ),
    url("${SIDEBAR_IMAGE}")
  `,
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

  /* ===============================================================
     MOBILE SCROLL LOCK AND ESCAPE KEY
     =============================================================== */

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow =
      document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onMobileClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow =
        previousHtmlOverflow;

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen, onMobileClose]);

  const handleNavigation = () => {
    onMobileClose();
  };

  const handleLogout = () => {
    onMobileClose();
    logout();
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
            onClick={onMobileClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="
              fixed inset-x-0 bottom-0 z-40
              cursor-default bg-[#02050c]/80
              md:hidden
            "
            style={{ top: NAVBAR_HEIGHT }}
          />
        )}
      </AnimatePresence>

      {/* =========================================================
          DESKTOP / TABLET SIDEBAR
          Desktop behavior intentionally preserved.
          ========================================================= */}

      <motion.aside
        initial={false}
        animate={{
          width: isExpanded
            ? SIDEBAR_WIDTH
            : SIDEBAR_COLLAPSED_WIDTH,
        }}
        transition={{
          width: {
            duration: 0.28,
            ease: EASE,
          },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Application navigation"
        className="
          fixed left-0 bottom-0 z-50 hidden
          isolate overflow-hidden
          rounded-r-[28px]
          border-r border-t border-white/[0.08]
          bg-[#020914]
          shadow-[12px_10px_40px_rgba(0,0,0,0.45)]
          md:flex md:flex-col
        "
        style={{
          top: NAVBAR_HEIGHT,
          borderTopRightRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        {/* Desktop image layer */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-0 z-0
            overflow-hidden rounded-r-[28px]
          "
        >
          <div
            className="absolute inset-0"
            style={DESKTOP_IMAGE_STYLE}
          />
        </div>

        {/* Desktop content */}
        <div className="relative z-10 flex min-h-0 flex-1 flex-col bg-[#020914]/10">
          <SidebarContent
            isExpanded={isExpanded}
            onNavigation={handleNavigation}
            onLogout={handleLogout}
          />
        </div>
      </motion.aside>

      {/* =========================================================
          MOBILE DRAWER
          The animated wrapper does not paint the background image.
          The inner panel clips all image pixels to its own bounds.
          ========================================================= */}

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              duration: 0.32,
              ease: EASE,
            }}
            className="
              fixed left-0 z-50
              w-[250px] max-w-[86vw]
              overflow-visible
              md:hidden
            "
            style={{
              top: NAVBAR_HEIGHT,
              height: `calc(100dvh - ${NAVBAR_HEIGHT}px)`,
              maxHeight: `calc(100dvh - ${NAVBAR_HEIGHT}px)`,
            }}
          >
            {/* Actual mobile drawer and clipping boundary */}
            <aside
              aria-label="Mobile application navigation"
              className="
                absolute inset-0
                isolate flex min-h-0 w-full flex-col
                overflow-hidden
                rounded-r-[28px]
                border-r border-t border-white/[0.08]
                bg-[#020914]
                shadow-[20px_10px_60px_rgba(0,0,0,0.55)]
              "
              style={{
                clipPath: "inset(0 round 0 28px 28px 0)",
              }}
            >
              {/* Mobile background: contained by the panel */}
              <div
                aria-hidden="true"
                className="
                  pointer-events-none absolute inset-0 z-0
                  overflow-hidden
                "
              >
                <div
                  className="absolute inset-0"
                  style={MOBILE_IMAGE_STYLE}
                />
              </div>

              {/* Mobile navigation content */}
              <div className="relative z-10 flex min-h-0 flex-1 flex-col">
                <SidebarContent
                  isExpanded
                  onNavigation={handleNavigation}
                  onLogout={handleLogout}
                />
              </div>
            </aside>

            {/* Close button stays outside the clipped panel */}
            <button
              type="button"
              onClick={onMobileClose}
              aria-label="Close navigation"
              title="Close navigation"
              className="
                absolute -right-11 top-4 z-20
                flex h-9 w-9 items-center justify-center
                rounded-full border border-white/[0.12]
                bg-[#020914] text-slate-300
                shadow-[0_8px_24px_rgba(0,0,0,0.45)]
                transition-colors duration-200
                hover:border-cyan-300/40
                hover:bg-[#0a1222]
                hover:text-cyan-300
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
      <div className="shrink-0 border-t border-white/[0.08] p-2">
        <button
          type="button"
          onClick={onLogout}
          title={!isExpanded ? "Sign out" : undefined}
          className={`
            group flex h-11 w-full items-center rounded-xl
            text-white/60 transition-colors duration-200
            hover:bg-red-400/[0.08] hover:text-red-300
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
                transition={{
                  duration: 0.16,
                  ease: EASE,
                }}
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
      <div className="mb-1.5 h-5 overflow-hidden px-2">
        <AnimatePresence initial={false}>
          {isExpanded ? (
            <motion.p
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{
                duration: 0.16,
                ease: EASE,
              }}
              className="
                font-display whitespace-nowrap
                text-[8px] font-medium uppercase
                tracking-[0.20em] text-white/45
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
        rounded-xl transition-colors duration-200
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
            : "text-white/65 hover:bg-white/[0.05] hover:text-white/90"
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
            transition={{
              duration: 0.18,
              ease: EASE,
            }}
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
              justify-center rounded-lg transition-colors duration-200
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
                transition={{
                  duration: 0.16,
                  ease: EASE,
                }}
                className={`
                  font-display min-w-0 flex-1 truncate
                  whitespace-nowrap text-[9px] font-medium
                  tracking-[0.035em]
                  ${
                    isActive
                      ? "text-cyan-100/90"
                      : "text-white/70 group-hover:text-white/90"
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
                transition={{
                  duration: 0.16,
                  ease: EASE,
                }}
                className="shrink-0 text-cyan-300/70"
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