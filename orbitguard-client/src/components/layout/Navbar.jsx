import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  FiBell,
  FiChevronDown,
  FiLogOut,
  FiMenu,
  FiSettings,
  FiUser,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";

/**
 * ================================================================
 * OrbitGuard AI — Mission Control Navbar
 * ================================================================
 *
 * Responsibilities:
 * - Display the current page context.
 * - Provide responsive navigation controls.
 * - Manage the operator dropdown.
 * - Show a notification indicator only when the notification
 *   count increases.
 * - Preserve existing authentication and navigation behavior.
 *
 * IMPORTANT:
 * notificationCount must be the total notification count from
 * the existing backend, not a fabricated frontend value.
 *
 * ================================================================
 */

const PAGE_CONFIG = {
  "/dashboard": {
    title: "Mission Dashboard",
    description: "Orbital intelligence overview",
  },
  "/satellites": {
    title: "Live Satellites",
    description: "Monitor active orbital assets",
  },
  "/debris": {
    title: "Space Debris",
    description: "Track orbital debris intelligence",
  },
  "/risks": {
    title: "Collision Risks",
    description: "Conjunction and risk assessment",
  },
  "/visualization": {
    title: "3D Visualization",
    description: "Explore orbital environments",
  },
  "/alerts": {
    title: "Alerts",
    description: "Monitor operational alerts",
  },
  "/notifications": {
    title: "Notifications",
    description: "Review system notifications",
  },
  "/reports": {
    title: "Reports",
    description: "Access orbital intelligence reports",
  },
  "/ai-assistant": {
    title: "AI Assistant",
    description: "OrbitGuard intelligence assistant",
  },
  "/settings": {
    title: "Settings",
    description: "Manage your OrbitGuard preferences",
  },
};

const DEFAULT_PAGE = {
  title: "OrbitGuard AI",
  description: "Space domain intelligence",
};

/**
 * Safely normalize the notification count received from the parent.
 */
const normalizeNotificationCount = (count) => {
  const normalized = Number(count);

  if (!Number.isFinite(normalized) || normalized < 0) {
    return 0;
  }

  return Math.floor(normalized);
};

function Navbar({
  onMenuClick,
  notificationCount = 0,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] =
    useState(false);

  const profileRef = useRef(null);

  const normalizedNotificationCount =
    normalizeNotificationCount(notificationCount);

  /**
   * CURRENT PAGE
   */

  const page = useMemo(() => {
    const currentPath = location.pathname;

    if (PAGE_CONFIG[currentPath]) {
      return PAGE_CONFIG[currentPath];
    }

    if (currentPath.startsWith("/satellites/")) {
      return {
        title: "Satellite Details",
        description: "Orbital asset intelligence",
      };
    }

    if (currentPath.startsWith("/debris/")) {
      return {
        title: "Debris Details",
        description: "Orbital debris intelligence",
      };
    }

    if (currentPath.startsWith("/risks/")) {
      return {
        title: "Risk Details",
        description: "Collision risk assessment",
      };
    }

    return DEFAULT_PAGE;
  }, [location.pathname]);

  /**
   * NOTIFICATION CHANGE DETECTION
   *
   * Establish the initial count as the baseline.
   * Only an increase after the initial render triggers the dot.
   *
   * Clicking the bell acknowledges the current count.
   * A subsequent increase makes the indicator visible again.
   */

  const previousNotificationCountRef = useRef(
    normalizedNotificationCount,
  );

  useEffect(() => {
    const previousCount =
      previousNotificationCountRef.current;

    if (normalizedNotificationCount > previousCount) {
      setHasNewNotifications(true);
    }

    previousNotificationCountRef.current =
      normalizedNotificationCount;
  }, [normalizedNotificationCount]);

  /**
   * CLOSE PROFILE WHEN CLICKING OUTSIDE
   */

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );
    };
  }, []);

  /**
   * CLOSE PROFILE WITH ESCAPE
   */

  useEffect(() => {
    if (!profileOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [profileOpen]);

  /**
   * CLOSE PROFILE ON ROUTE CHANGE
   */

  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  /**
   * NAVIGATION HANDLERS
   */

  const handleGoToDashboard = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  const handleNotifications = useCallback(() => {
    // Acknowledge the currently observed notification count.
    setHasNewNotifications(false);
    navigate("/notifications");
  }, [navigate]);

  const handleSettings = useCallback(() => {
    setProfileOpen(false);
    navigate("/settings");
  }, [navigate]);

  const handleAccount = useCallback(() => {
    setProfileOpen(false);
    navigate("/settings");
  }, [navigate]);

  const handleLogout = useCallback(() => {
    setProfileOpen(false);
    logout();
  }, [logout]);

  return (
    <header
      className="
        fixed
        inset-x-0
        top-0
        z-40
        h-[68px]
        border-b
        border-cyan-300/[0.09]
        bg-[#040916]/95
        shadow-[0_8px_35px_rgba(0,0,0,0.18)]
        backdrop-blur-2xl
      "
    >
      {/* Subtle mission-control accent line */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-cyan-300/25
          to-transparent
        "
      />

      <div
        className="
          relative
          flex
          h-full
          w-full
          items-center
          px-3
          sm:px-5
          lg:px-7
        "
      >
        {/* MOBILE NAVIGATION */}

        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="
            absolute
            left-3
            top-1/2
            flex
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center
            rounded-xl
            border
            border-white/[0.07]
            bg-white/[0.025]
            text-white/60
            transition-colors
            duration-200
            hover:border-cyan-300/20
            hover:bg-cyan-300/[0.06]
            hover:text-cyan-200
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-cyan-300/50
            sm:left-5
            md:hidden
          "
        >
          <FiMenu size={18} strokeWidth={1.8} />
        </button>

        {/* DESKTOP BRAND */}

        <button
          type="button"
          onClick={handleGoToDashboard}
          aria-label="Go to OrbitGuard dashboard"
          className="hidden shrink-0 items-center md:flex"
        >
          <img
            src="/images/branding/orbitguard-minimal.png"
            alt="OrbitGuard AI"
            className="
              h-9
              w-auto
              max-w-[165px]
              object-contain
              transition-opacity
              duration-200
              hover:opacity-90
            "
          />
        </button>

        {/* MOBILE BRAND */}

        <button
          type="button"
          onClick={handleGoToDashboard}
          aria-label="Go to OrbitGuard dashboard"
          className="
            absolute
            left-1/2
            top-1/2
            flex
            -translate-x-1/2
            -translate-y-1/2
            items-center
            gap-2.5
            md:hidden
          "
        >
          <img
            src="/images/branding/orbitguard-mark.png"
            alt=""
            aria-hidden="true"
            className="h-7 w-7 shrink-0 object-contain"
          />

          <div className="text-left">
            <p
              className="
                font-display
                whitespace-nowrap
                text-[10px]
                font-medium
                tracking-[0.055em]
                text-white/90
              "
            >
              OrbitGuard AI
            </p>

            <p
              className="
                font-body
                mt-0.5
                whitespace-nowrap
                text-[6px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-cyan-200/50
              "
            >
              Space Intelligence
            </p>
          </div>
        </button>

        {/* DESKTOP PAGE CONTEXT */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            hidden
            -translate-x-1/2
            -translate-y-1/2
            text-center
            md:block
          "
        >
          <div className="flex flex-col items-center">
            <h1
              className="
                font-display
                whitespace-nowrap
                text-[14px]
                font-medium
                leading-tight
                tracking-[0.025em]
                text-white/90
                lg:text-[15px]
              "
            >
              {page.title}
            </h1>

            <div className="mt-1 flex items-center gap-2">
              <span
                aria-hidden="true"
                className="
                  h-1
                  w-1
                  shrink-0
                  rounded-full
                  bg-cyan-300/75
                  shadow-[0_0_8px_rgba(103,232,249,0.5)]
                "
              />

              <p
                className="
                  font-body
                  whitespace-nowrap
                  text-[8px]
                  font-medium
                  uppercase
                  tracking-[0.18em]
                  text-white/35
                  lg:text-[9px]
                "
              >
                {page.description}
              </p>

              <span
                aria-hidden="true"
                className="
                  h-1
                  w-1
                  shrink-0
                  rounded-full
                  bg-cyan-300/75
                  shadow-[0_0_8px_rgba(103,232,249,0.5)]
                "
              />
            </div>
          </div>
        </div>

        {/* RIGHT ACTIONS */}

        <div
          className="
            ml-auto
            flex
            items-center
            gap-2
            sm:gap-3
          "
        >
          {/* NOTIFICATIONS */}

          <button
            type="button"
            onClick={handleNotifications}
            aria-label={
              hasNewNotifications
                ? "Open notifications. New notifications available."
                : "Open notifications"
            }
            aria-haspopup="false"
            title={
              hasNewNotifications
                ? "New notifications"
                : "Notifications"
            }
            className="
              group
              relative
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-white/[0.07]
              bg-white/[0.025]
              text-white/55
              transition-all
              duration-200
              hover:border-cyan-300/20
              hover:bg-cyan-300/[0.06]
              hover:text-cyan-200
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-cyan-300/50
            "
          >
            <FiBell
              size={17}
              strokeWidth={1.7}
              className="
                transition-transform
                duration-200
                group-hover:-rotate-6
              "
              aria-hidden="true"
            />

            {hasNewNotifications && (
              <span
                aria-hidden="true"
                className="
                  absolute
                  right-[7px]
                  top-[7px]
                  h-2
                  w-2
                  rounded-full
                  bg-cyan-300
                  ring-2
                  ring-[#040916]
                  shadow-[0_0_10px_rgba(103,232,249,0.9)]
                  motion-safe:animate-pulse
                  motion-reduce:animate-none
                "
              />
            )}
          </button>

          {/* OPERATOR PROFILE */}

          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((current) => !current);
              }}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              aria-label="Open operator menu"
              className="
                group
                flex
                h-10
                shrink-0
                items-center
                gap-2
                rounded-xl
                border
                border-white/[0.07]
                bg-white/[0.025]
                px-1.5
                transition-all
                duration-200
                hover:border-cyan-300/[0.16]
                hover:bg-white/[0.045]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-cyan-300/50
                sm:px-2
              "
            >
              <span
                className="
                  font-display
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-cyan-300/[0.16]
                  bg-cyan-300/[0.07]
                  text-[8px]
                  font-semibold
                  tracking-[0.04em]
                  text-cyan-200/90
                "
              >
                OG
              </span>

              <span className="hidden min-w-0 text-left lg:block">
                <span
                  className="
                    font-body
                    block
                    max-w-[110px]
                    truncate
                    text-[10px]
                    font-medium
                    leading-tight
                    text-white/75
                  "
                >
                  Operator
                </span>

                <span
                  className="
                    font-body
                    mt-0.5
                    block
                    text-[7px]
                    font-medium
                    uppercase
                    tracking-[0.14em]
                    text-white/30
                  "
                >
                  Mission Control
                </span>
              </span>

              <FiChevronDown
                size={13}
                strokeWidth={1.8}
                aria-hidden="true"
                className={`
                  hidden
                  text-white/35
                  transition-transform
                  duration-200
                  group-hover:text-white/60
                  lg:block
                  ${profileOpen ? "rotate-180" : ""}
                `}
              />
            </button>

            {/* PROFILE DROPDOWN */}

            {profileOpen && (
              <div
                role="menu"
                aria-label="Operator menu"
                className="
                  absolute
                  right-0
                  top-[calc(100%+10px)]
                  z-50
                  w-[220px]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-cyan-300/[0.12]
                  bg-[#080e1c]/[0.98]
                  shadow-[0_20px_60px_rgba(0,0,0,0.5)]
                  backdrop-blur-2xl
                "
              >
                <div
                  className="
                    border-b
                    border-white/[0.07]
                    bg-gradient-to-r
                    from-cyan-300/[0.04]
                    to-transparent
                    px-4
                    py-3.5
                  "
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="
                        font-display
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-cyan-300/[0.16]
                        bg-cyan-300/[0.07]
                        text-[9px]
                        font-semibold
                        tracking-[0.04em]
                        text-cyan-200/90
                      "
                    >
                      OG
                    </span>

                    <div className="min-w-0">
                      <p
                        className="
                          font-body
                          truncate
                          text-[11px]
                          font-medium
                          text-white/80
                        "
                      >
                        Operator
                      </p>

                      <p
                        className="
                          font-body
                          mt-0.5
                          text-[8px]
                          font-medium
                          uppercase
                          tracking-[0.14em]
                          text-white/35
                        "
                      >
                        Mission Control
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-1.5">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSettings}
                    className="
                      font-body
                      flex
                      h-10
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      text-left
                      text-[10px]
                      font-medium
                      text-white/55
                      transition-colors
                      duration-200
                      hover:bg-cyan-300/[0.06]
                      hover:text-cyan-100
                      focus-visible:outline-none
                      focus-visible:ring-1
                      focus-visible:ring-cyan-300/50
                    "
                  >
                    <FiSettings
                      size={15}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    Settings
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleAccount}
                    className="
                      font-body
                      flex
                      h-10
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      text-left
                      text-[10px]
                      font-medium
                      text-white/55
                      transition-colors
                      duration-200
                      hover:bg-cyan-300/[0.06]
                      hover:text-cyan-100
                      focus-visible:outline-none
                      focus-visible:ring-1
                      focus-visible:ring-cyan-300/50
                    "
                  >
                    <FiUser
                      size={15}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    Account
                  </button>
                </div>

                <div className="border-t border-white/[0.07] p-1.5">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="
                      font-body
                      flex
                      h-10
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      text-left
                      text-[10px]
                      font-medium
                      text-red-300/70
                      transition-colors
                      duration-200
                      hover:bg-red-400/[0.07]
                      hover:text-red-200
                      focus-visible:outline-none
                      focus-visible:ring-1
                      focus-visible:ring-red-300/50
                    "
                  >
                    <FiLogOut
                      size={15}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;