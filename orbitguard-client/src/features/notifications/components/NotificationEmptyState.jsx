
import {
  FiBell,
  FiCheckCircle,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiX,
} from "react-icons/fi";

/* ================================================================
   ORBITGUARD AI — NOTIFICATION EMPTY STATE

   Supported states:
   - empty: No notifications exist.
   - search: Search returned no matches.
   - unread: No unread notifications.
   - filtered: Active filters returned no matches.

   This component is presentational. The parent page controls
   actions and decides which state should be displayed.
   ================================================================ */

const EMPTY_STATE_CONFIG = {
  empty: {
    eyebrow: "INBOX INITIALIZED",
    title: "Your notification feed is quiet",
    description:
      "System events, orbital updates, security messages, and mission activity will appear here when available.",
    icon: FiBell,
    accent: "cyan",
    primaryLabel: "Refresh notifications",
    showPrimary: true,
    secondaryLabel: "",
    showSecondary: false,
  },

  search: {
    eyebrow: "SEARCH COMPLETE",
    title: "No matching signals found",
    description:
      "We couldn't find notifications matching your search. Try a different keyword or search for a satellite, event, or user.",
    icon: FiSearch,
    accent: "blue",
    primaryLabel: "Clear search",
    showPrimary: true,
    secondaryLabel: "Refresh notifications",
    showSecondary: true,
  },

  unread: {
    eyebrow: "INBOX UP TO DATE",
    title: "You're all caught up",
    description:
      "There are no unread notifications requiring your attention. New system activity will appear here when available.",
    icon: FiCheckCircle,
    accent: "emerald",
    primaryLabel: "View all notifications",
    showPrimary: true,
    secondaryLabel: "",
    showSecondary: false,
  },

  filtered: {
    eyebrow: "FILTER ANALYSIS",
    title: "No notifications in this selection",
    description:
      "No notifications match the selected categories, priority, or date range. Adjust your filters to explore other events.",
    icon: FiFilter,
    accent: "violet",
    primaryLabel: "Clear filters",
    showPrimary: true,
    secondaryLabel: "Refresh notifications",
    showSecondary: true,
  },
};

const ACCENT_STYLES = {
  cyan: {
    icon:
      "border-cyan-300/25 bg-cyan-400/[0.09] text-cyan-200",
    glow: "bg-cyan-400/[0.12]",
    line: "from-transparent via-cyan-300/60 to-transparent",
    badge:
      "border-cyan-300/20 bg-cyan-400/[0.06] text-cyan-200",
    button:
      "border-cyan-300/30 bg-cyan-400/[0.09] text-cyan-100 hover:bg-cyan-400/[0.16]",
  },

  blue: {
    icon:
      "border-blue-300/25 bg-blue-400/[0.09] text-blue-200",
    glow: "bg-blue-400/[0.12]",
    line: "from-transparent via-blue-300/60 to-transparent",
    badge:
      "border-blue-300/20 bg-blue-400/[0.06] text-blue-200",
    button:
      "border-blue-300/30 bg-blue-400/[0.09] text-blue-100 hover:bg-blue-400/[0.16]",
  },

  emerald: {
    icon:
      "border-emerald-300/25 bg-emerald-400/[0.09] text-emerald-200",
    glow: "bg-emerald-400/[0.12]",
    line:
      "from-transparent via-emerald-300/60 to-transparent",
    badge:
      "border-emerald-300/20 bg-emerald-400/[0.06] text-emerald-200",
    button:
      "border-emerald-300/30 bg-emerald-400/[0.09] text-emerald-100 hover:bg-emerald-400/[0.16]",
  },

  violet: {
    icon:
      "border-violet-300/25 bg-violet-400/[0.09] text-violet-200",
    glow: "bg-violet-400/[0.12]",
    line:
      "from-transparent via-violet-300/60 to-transparent",
    badge:
      "border-violet-300/20 bg-violet-400/[0.06] text-violet-200",
    button:
      "border-violet-300/30 bg-violet-400/[0.09] text-violet-100 hover:bg-violet-400/[0.16]",
  },
};

function NotificationEmptyState({
  type = "empty",
  title,
  description,
  onPrimaryAction,
  onSecondaryAction,
  loading = false,
  primaryLabel,
  secondaryLabel,
  className = "",
}) {
  const config =
    EMPTY_STATE_CONFIG[type] ?? EMPTY_STATE_CONFIG.empty;

  const accent =
    ACCENT_STYLES[config.accent] ?? ACCENT_STYLES.cyan;

  const Icon = config.icon;

  const resolvedTitle = title || config.title;
  const resolvedDescription =
    description || config.description;

  const resolvedPrimaryLabel =
    primaryLabel || config.primaryLabel;

  const resolvedSecondaryLabel =
    secondaryLabel || config.secondaryLabel;

  const showPrimary =
    config.showPrimary &&
    typeof onPrimaryAction === "function";

  const showSecondary =
    config.showSecondary &&
    typeof onSecondaryAction === "function";

  return (
    <section
      role="status"
      aria-live="polite"
      className={`
        relative isolate flex min-h-[320px]
        w-full flex-col items-center justify-center
        overflow-hidden rounded-xl
        border border-white/[0.07]
        bg-[#050e1c]/85 px-5 py-12
        text-center sm:min-h-[370px] sm:px-8
        lg:min-h-[410px]
        ${className}
      `}
    >
      {/* ========================================================
          BACKGROUND ORBITAL DETAIL
          Decorative only — no external image required.
          ======================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 -z-10
          overflow-hidden
        "
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(8,145,178,0.09),transparent_52%)]" />

        <div
          className="
            absolute left-1/2 top-[42%]
            h-44 w-44 -translate-x-1/2 -translate-y-1/2
            rounded-full border border-cyan-300/[0.07]
            sm:h-56 sm:w-56
          "
        />

        <div
          className="
            absolute left-1/2 top-[42%]
            h-60 w-60 -translate-x-1/2 -translate-y-1/2
            rotate-[-24deg] rounded-[50%]
            border border-dashed border-blue-300/[0.07]
            sm:h-72 sm:w-72
          "
        />

        <div
          className="
            absolute left-1/2 top-[42%]
            h-72 w-72 -translate-x-1/2 -translate-y-1/2
            rounded-full border border-white/[0.035]
            sm:h-96 sm:w-96
          "
        />

        <span className="absolute left-[22%] top-[23%] h-1 w-1 rounded-full bg-cyan-200/70 shadow-[0_0_10px_rgba(103,232,249,0.65)]" />
        <span className="absolute right-[22%] top-[30%] h-1.5 w-1.5 rounded-full bg-blue-200/60 shadow-[0_0_12px_rgba(147,197,253,0.6)]" />
        <span className="absolute bottom-[25%] left-[31%] h-1 w-1 rounded-full bg-cyan-100/50" />
        <span className="absolute bottom-[30%] right-[28%] h-1 w-1 rounded-full bg-blue-100/50" />
      </div>

      {/* ========================================================
          CENTRAL ICON
          ======================================================== */}

      <div className="relative mb-6">
        <div
          aria-hidden="true"
          className={`
            absolute inset-[-13px] rounded-full
            blur-2xl ${accent.glow}
          `}
        />

        <div
          className={`
            relative flex h-[76px] w-[76px]
            items-center justify-center rounded-2xl
            border shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
            sm:h-[88px] sm:w-[88px]
            ${accent.icon}
          `}
        >
          <Icon
            size={32}
            strokeWidth={1.6}
            className={loading ? "animate-pulse" : ""}
          />

          <span
            aria-hidden="true"
            className="
              absolute -right-1.5 -top-1.5
              flex h-5 w-5 items-center justify-center
              rounded-full border border-[#071323]
              bg-[#0b2435]
            "
          >
            {loading ? (
              <FiRefreshCw
                size={10}
                className="animate-spin text-cyan-200"
              />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_7px_rgba(103,232,249,0.8)]" />
            )}
          </span>
        </div>
      </div>

      {/* ========================================================
          STATUS LABEL
          ======================================================== */}

      <div
        className={`
          mb-3 inline-flex items-center gap-2
          rounded-full border px-3 py-1.5
          text-[9px] font-semibold uppercase
          tracking-[0.17em] sm:text-[10px]
          ${accent.badge}
        `}
      >
        <FiShield size={11} />
        {config.eyebrow}
      </div>

      {/* ========================================================
          TITLE AND DESCRIPTION
          ======================================================== */}

      <h2
        className="
          max-w-xl font-['Orbitron',sans-serif]
          text-lg font-semibold tracking-tight
          text-slate-100 sm:text-xl lg:text-2xl
        "
      >
        {resolvedTitle}
      </h2>

      <p
        className="
          mt-3 max-w-lg text-xs leading-6
          text-slate-400 sm:text-sm sm:leading-7
        "
      >
        {resolvedDescription}
      </p>

      {/* ========================================================
          ACTIONS
          ======================================================== */}

      {(showPrimary || showSecondary) && (
        <div className="mt-6 flex w-full flex-col justify-center gap-2.5 sm:w-auto sm:flex-row">
          {showPrimary && (
            <button
              type="button"
              onClick={onPrimaryAction}
              disabled={loading}
              className={`
                inline-flex min-h-10 items-center
                justify-center gap-2 rounded-lg
                border px-4 py-2 text-xs
                font-medium transition duration-200
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-cyan-300
                disabled:cursor-not-allowed
                disabled:opacity-50
                ${accent.button}
              `}
            >
              {loading ? (
                <FiRefreshCw
                  size={14}
                  className="animate-spin"
                />
              ) : type === "empty" ||
                resolvedPrimaryLabel.toLowerCase().includes("refresh") ? (
                <FiRefreshCw size={14} />
              ) : type === "unread" ? (
                <FiCheckCircle size={14} />
              ) : type === "filtered" ? (
                <FiFilter size={14} />
              ) : (
                <FiSearch size={14} />
              )}

              {loading ? "Synchronizing..." : resolvedPrimaryLabel}
            </button>
          )}

          {showSecondary && (
            <button
              type="button"
              onClick={onSecondaryAction}
              disabled={loading}
              className="
                inline-flex min-h-10 items-center
                justify-center gap-2 rounded-lg
                border border-white/[0.09]
                bg-white/[0.025] px-4 py-2
                text-xs font-medium text-slate-300
                transition hover:border-white/[0.16]
                hover:bg-white/[0.055] hover:text-white
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-cyan-300
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <FiRefreshCw size={13} />
              {resolvedSecondaryLabel}
            </button>
          )}
        </div>
      )}

      {/* ========================================================
          BOTTOM TELEMETRY ACCENT
          ======================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute bottom-0 left-0 right-0 h-px
          bg-gradient-to-r opacity-60
          from-transparent via-cyan-400/50 to-transparent
        "
      />

      <div
        aria-hidden="true"
        className={`
          absolute bottom-0 left-1/2 h-px
          w-20 -translate-x-1/2
          bg-gradient-to-r ${accent.line}
        `}
      />
    </section>
  );
}

export default NotificationEmptyState;
