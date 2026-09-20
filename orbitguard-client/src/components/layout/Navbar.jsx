import {
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

/* =================================================================
   PAGE CONFIGURATION
   ================================================================= */

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

/* =================================================================
   FALLBACK PAGE
   ================================================================= */

const DEFAULT_PAGE = {
  title: "OrbitGuard AI",
  description: "Space domain intelligence",
};

/* =================================================================
   NAVBAR
   ================================================================= */

function Navbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  /* ===============================================================
     CURRENT PAGE
     =============================================================== */

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

  /* ===============================================================
     CLOSE PROFILE WHEN CLICKING OUTSIDE
     =============================================================== */

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

  /* ===============================================================
     CLOSE PROFILE WITH ESCAPE
     =============================================================== */

  useEffect(() => {
    if (!profileOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [profileOpen]);

  /* ===============================================================
     CLOSE PROFILE ON ROUTE CHANGE
     =============================================================== */

  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  /* ===============================================================
     HANDLERS
     =============================================================== */

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleNotifications = () => {
    navigate("/notifications");
  };

  const handleSettings = () => {
    setProfileOpen(false);
    navigate("/settings");
  };

  /*
   * Account currently uses the Settings page because
   * a dedicated Account page has not been created yet.
   *
   * We can separate this later when the Account page exists.
   */
  const handleAccount = () => {
    setProfileOpen(false);
    navigate("/settings");
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
  };

  return (
    <header
      className="
        fixed
        inset-x-0
        top-0
        z-40
        h-[68px]

        border-b
        border-white/[0.07]

        bg-[#050816]/95

        backdrop-blur-2xl
      "
    >
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
        {/* =========================================================
            MOBILE MENU BUTTON
            ========================================================= */}

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

            text-white/55

            transition-all
            duration-200

            hover:border-cyan-300/[0.15]
            hover:bg-cyan-300/[0.05]
            hover:text-cyan-300

            sm:left-5

            md:hidden
          "
        >
          <FiMenu
            size={18}
            strokeWidth={1.8}
          />
        </button>

        {/* =========================================================
            DESKTOP BRAND
            ========================================================= */}

        <button
          type="button"
          onClick={handleGoToDashboard}
          aria-label="Go to OrbitGuard dashboard"
          className="
            hidden
            shrink-0
            items-center

            md:flex
          "
        >
          <img
            src="/images/branding/orbitguard-minimal.png"
            alt="OrbitGuard AI"
            className="
              h-9
              w-auto
              max-w-[165px]
              object-contain
            "
          />
        </button>

        {/* =========================================================
            MOBILE CENTER BRAND
            ========================================================= */}

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
            className="
              h-7
              w-7
              shrink-0
              object-contain
            "
          />

          <div className="text-left">
            {/* Brand → Orbitron */}

            <p
              className="
                font-display

                whitespace-nowrap

                text-[10px]
                font-medium

                tracking-[0.055em]

                text-white/85
              "
            >
              OrbitGuard AI
            </p>

            {/* Supporting text → Inter */}

            <p
              className="
                font-body

                mt-0.5

                whitespace-nowrap

                text-[6px]
                font-medium
                uppercase

                tracking-[0.18em]

                text-cyan-300/35
              "
            >
              Space Intelligence
            </p>
          </div>
        </button>

        {/* =========================================================
            DESKTOP CENTER PAGE CONTEXT
            ========================================================= */}

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
            {/* =====================================================
                PAGE / TAB NAME
                Orbitron
                ===================================================== */}

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

            {/* =====================================================
                PAGE DESCRIPTION
                Inter
                ===================================================== */}

            <div
              className="
                mt-1

                flex
                items-center
                gap-2
              "
            >
              <span
                className="
                  h-1
                  w-1
                  shrink-0

                  rounded-full

                  bg-cyan-300/65

                  shadow-[0_0_8px_rgba(103,232,249,0.55)]
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

                  text-white/25

                  lg:text-[9px]
                "
              >
                {page.description}
              </p>

              <span
                className="
                  h-1
                  w-1
                  shrink-0

                  rounded-full

                  bg-cyan-300/65

                  shadow-[0_0_8px_rgba(103,232,249,0.55)]
                "
              />
            </div>
          </div>
        </div>

        {/* =========================================================
            RIGHT ACTIONS
            ========================================================= */}

        <div
          className="
            ml-auto

            flex
            items-center

            gap-2

            sm:gap-3
          "
        >
          {/* =======================================================
              NOTIFICATIONS
              ======================================================= */}

          <button
            type="button"
            onClick={handleNotifications}
            aria-label="Open notifications"
            className="
              relative

              flex
              h-10
              w-10
              shrink-0

              items-center
              justify-center

              rounded-xl

              border
              border-white/[0.06]

              bg-white/[0.02]

              text-white/40

              transition-all
              duration-200

              hover:border-cyan-300/[0.14]
              hover:bg-cyan-300/[0.04]
              hover:text-cyan-300
            "
          >
            <FiBell
              size={16}
              strokeWidth={1.8}
            />

            {/* Notification indicator */}

            <span
              aria-hidden="true"
              className="
                absolute

                right-[8px]
                top-[8px]

                h-1.5
                w-1.5

                rounded-full

                bg-cyan-300

                shadow-[0_0_8px_rgba(103,232,249,0.75)]
              "
            />
          </button>

          {/* =======================================================
              PROFILE
              ======================================================= */}

          <div
            ref={profileRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setProfileOpen(
                  (current) => !current,
                )
              }
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
                border-white/[0.06]

                bg-white/[0.02]

                px-1.5

                transition-all
                duration-200

                hover:border-white/[0.10]
                hover:bg-white/[0.04]

                sm:px-2
              "
            >
              {/* =================================================
                  OPERATOR INITIALS
                  ================================================= */}

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
                  border-cyan-300/[0.12]

                  bg-cyan-300/[0.06]

                  text-[8px]
                  font-semibold

                  tracking-[0.04em]

                  text-cyan-200/80
                "
              >
                OG
              </span>

              {/* =================================================
                  OPERATOR INFORMATION
                  Inter
                  ================================================= */}

              <span
                className="
                  hidden
                  min-w-0
                  text-left

                  lg:block
                "
              >
                <span
                  className="
                    font-body

                    block
                    max-w-[110px]
                    truncate

                    text-[10px]
                    font-medium
                    leading-tight

                    text-white/65
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

                    text-white/20
                  "
                >
                  Mission Control
                </span>
              </span>

              {/* =================================================
                  DROPDOWN ICON
                  ================================================= */}

              <FiChevronDown
                size={13}
                strokeWidth={1.8}
                className={`
                  hidden

                  text-white/20

                  transition-transform
                  duration-200

                  group-hover:text-white/45

                  lg:block

                  ${
                    profileOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              />
            </button>

            {/* =====================================================
                PROFILE MENU
                ===================================================== */}

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
                  border-white/[0.08]

                  bg-[#080e1c]/98

                  shadow-[0_20px_60px_rgba(0,0,0,0.45)]

                  backdrop-blur-2xl
                "
              >
                {/* =================================================
                    PROFILE INFORMATION
                    ================================================= */}

                <div
                  className="
                    border-b
                    border-white/[0.07]

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
                        border-cyan-300/[0.12]

                        bg-cyan-300/[0.06]

                        text-[9px]
                        font-semibold

                        tracking-[0.04em]

                        text-cyan-200/80
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

                          text-white/75
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

                          text-white/25
                        "
                      >
                        Mission Control
                      </p>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    MENU ITEMS
                    ================================================= */}

                <div className="p-1.5">
                  {/* Settings */}

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

                      text-white/45

                      transition-colors
                      duration-200

                      hover:bg-white/[0.04]
                      hover:text-white/80
                    "
                  >
                    <FiSettings
                      size={15}
                      strokeWidth={1.8}
                      className="text-white/30"
                    />

                    <span>Settings</span>
                  </button>

                  {/* Account */}

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

                      text-white/45

                      transition-colors
                      duration-200

                      hover:bg-white/[0.04]
                      hover:text-white/80
                    "
                  >
                    <FiUser
                      size={15}
                      strokeWidth={1.8}
                      className="text-white/30"
                    />

                    <span>Account</span>
                  </button>
                </div>

                {/* =================================================
                    LOGOUT
                    ================================================= */}

                <div
                  className="
                    border-t
                    border-white/[0.07]

                    p-1.5
                  "
                >
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

                      text-red-300/55

                      transition-colors
                      duration-200

                      hover:bg-red-400/[0.06]
                      hover:text-red-300/85
                    "
                  >
                    <FiLogOut
                      size={15}
                      strokeWidth={1.8}
                    />

                    <span>Sign out</span>
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