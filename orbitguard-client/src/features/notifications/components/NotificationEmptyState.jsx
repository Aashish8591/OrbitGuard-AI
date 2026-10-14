
import { useId } from "react";

import {
  FiBell,
  FiCheckCircle,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiShield,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI — Notification Empty State
 * ================================================================
 *
 * Responsive, accessible presentation component.
 *
 * Supported states:
 * - empty
 * - search
 * - unread
 * - filtered
 *
 * Responsibilities:
 * - Display contextual empty-state information.
 * - Render available actions.
 * - Handle loading presentation.
 *
 * The parent owns:
 * - Notification API requests.
 * - Search and filter state.
 * - Refresh and reset behavior.
 * - Error handling.
 *
 * No API requests are made here.
 * ================================================================
 */

const EMPTY_STATE_CONFIG = {
  empty: {
    eyebrow: "INBOX INITIALIZED",
    title: "Your notification feed is quiet",
    description:
      "System events, orbital updates, security messages, and mission activity will appear here when available.",
    icon: FiBell,
    accent: "cyan",
    primaryLabel: "Refresh notifications",
    primaryAction: "refresh",
    secondaryLabel: "",
    secondaryAction: null,
  },

  search: {
    eyebrow: "SEARCH COMPLETE",
    title: "No matching signals found",
    description:
      "We couldn't find notifications matching your search. Try another keyword or search for a notification code, event, or related record.",
    icon: FiSearch,
    accent: "blue",
    primaryLabel: "Clear search",
    primaryAction: "search",
    secondaryLabel: "Refresh notifications",
    secondaryAction: "refresh",
  },

  unread: {
    eyebrow: "INBOX UP TO DATE",
    title: "You're all caught up",
    description:
      "There are no unread notifications requiring your attention. New system activity will appear here when available.",
    icon: FiCheckCircle,
    accent: "emerald",
    primaryLabel: "View all notifications",
    primaryAction: "all",
    secondaryLabel: "",
    secondaryAction: null,
  },

  filtered: {
    eyebrow: "FILTER ANALYSIS",
    title: "No notifications in this selection",
    description:
      "No notifications match the selected categories, priorities, or date range. Adjust your filters to explore other events.",
    icon: FiFilter,
    accent: "violet",
    primaryLabel: "Clear filters",
    primaryAction: "filter",
    secondaryLabel: "Refresh notifications",
    secondaryAction: "refresh",
  },
};

const ACCENT_STYLES = {
  cyan: {
    icon:
      "border-cyan-300/25 bg-cyan-400/[0.09] text-cyan-200",
    glow: "bg-cyan-400/[0.12]",
    badge:
      "border-cyan-300/20 bg-cyan-400/[0.06] text-cyan-200",
    button:
      "border-cyan-300/30 bg-cyan-400/[0.09] text-cyan-100 hover:bg-cyan-400/[0.16]",
    line: "via-cyan-300/60",
  },

  blue: {
    icon:
      "border-blue-300/25 bg-blue-400/[0.09] text-blue-200",
    glow: "bg-blue-400/[0.12]",
    badge:
      "border-blue-300/20 bg-blue-400/[0.06] text-blue-200",
    button:
      "border-blue-300/30 bg-blue-400/[0.09] text-blue-100 hover:bg-blue-400/[0.16]",
    line: "via-blue-300/60",
  },

  emerald: {
    icon:
      "border-emerald-300/25 bg-emerald-400/[0.09] text-emerald-200",
    glow: "bg-emerald-400/[0.12]",
    badge:
      "border-emerald-300/20 bg-emerald-400/[0.06] text-emerald-200",
    button:
      "border-emerald-300/30 bg-emerald-400/[0.09] text-emerald-100 hover:bg-emerald-400/[0.16]",
    line: "via-emerald-300/60",
  },

  violet: {
    icon:
      "border-violet-300/25 bg-violet-400/[0.09] text-violet-200",
    glow: "bg-violet-400/[0.12]",
    badge:
      "border-violet-300/20 bg-violet-400/[0.06] text-violet-200",
    button:
      "border-violet-300/30 bg-violet-400/[0.09] text-violet-100 hover:bg-violet-400/[0.16]",
    line: "via-violet-300/60",
  },
};

function getActionIcon(action) {
  switch (action) {
    case "refresh":
      return FiRefreshCw;

    case "search":
      return FiSearch;

    case "all":
      return FiCheckCircle;

    case "filter":
      return FiFilter;

    default:
      return FiBell;
  }
}

function resolveText(value, fallback) {
  return typeof value === "string" && value.trim()
    ? value
    : fallback;
}

function NotificationEmptyState({
  type = "empty",
  title,
  description,
  onPrimaryAction,
  onSecondaryAction,
  loading = false,
  disabled = false,
  primaryLabel,
  secondaryLabel,
  className = "",
}) {
  const generatedId = useId();

  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;
  const statusId = `${generatedId}-status`;

  const config =
    EMPTY_STATE_CONFIG[type] ??
    EMPTY_STATE_CONFIG.empty;

  const accent =
    ACCENT_STYLES[config.accent] ??
    ACCENT_STYLES.cyan;

  const Icon = config.icon;

  const PrimaryActionIcon = getActionIcon(
    config.primaryAction
  );

  const SecondaryActionIcon = getActionIcon(
    config.secondaryAction
  );

  const resolvedTitle = resolveText(
    title,
    config.title
  );

  const resolvedDescription = resolveText(
    description,
    config.description
  );

  const resolvedPrimaryLabel = resolveText(
    primaryLabel,
    config.primaryLabel
  );

  const resolvedSecondaryLabel = resolveText(
    secondaryLabel,
    config.secondaryLabel
  );

  const showPrimary =
    Boolean(config.primaryAction) &&
    typeof onPrimaryAction === "function";

  const showSecondary =
    Boolean(config.secondaryAction) &&
    typeof onSecondaryAction === "function";

  const hasActions = showPrimary || showSecondary;

  const actionsDisabled = loading || disabled;

  return (
    <section
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={loading}
      className={`
        relative isolate flex w-full
        min-h-[320px] flex-col
        items-center justify-center
        overflow-hidden rounded-xl
        border border-white/[0.07]
        bg-[#050e1c]/85
        px-4 py-10 text-center
        sm:min-h-[370px] sm:px-8 sm:py-12
        lg:min-h-[410px]
        ${className}
      `}
    >
      {/* Decorative orbital background */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0 z-0
          overflow-hidden
        "
      >
        <div
          className="
            absolute inset-0
            bg-[radial-gradient(ellipse_at_50%_42%,rgba(8,145,178,0.09),transparent_52%)]
          "
        />

        <div
          className="
            absolute left-1/2 top-[42%]
            h-44 w-44
            -translate-x-1/2 -translate-y-1/2
            rounded-full
            border border-cyan-300/[0.07]
            sm:h-56 sm:w-56
          "
        />

        <div
          className="
            absolute left-1/2 top-[42%]
            h-60 w-60
            -translate-x-1/2 -translate-y-1/2
            rotate-[-24deg]
            rounded-[50%]
            border border-dashed
            border-blue-300/[0.07]
            sm:h-72 sm:w-72
          "
        />

        <div
          className="
            absolute left-1/2 top-[42%]
            h-72 w-72
            -translate-x-1/2 -translate-y-1/2
            rounded-full
            border border-white/[0.035]
            sm:h-96 sm:w-96
          "
        />

        <span
          className="
            absolute left-[22%] top-[23%]
            h-1 w-1 rounded-full
            bg-cyan-200/70
            shadow-[0_0_10px_rgba(103,232,249,0.65)]
          "
        />

        <span
          className="
            absolute right-[22%] top-[30%]
            h-1.5 w-1.5 rounded-full
            bg-blue-200/60
            shadow-[0_0_12px_rgba(147,197,253,0.6)]
          "
        />

        <span
          className="
            absolute bottom-[25%] left-[31%]
            h-1 w-1 rounded-full
            bg-cyan-100/50
          "
        />

        <span
          className="
            absolute bottom-[30%] right-[28%]
            h-1 w-1 rounded-full
            bg-blue-100/50
          "
        />
      </div>

      {/* Main content */}
      <div
        className="
          relative z-10 flex w-full
          max-w-2xl flex-col
          items-center
        "
      >
        {/* Central icon */}
        <div className="relative mb-6">
          <div
            aria-hidden="true"
            className={`
              pointer-events-none
              absolute inset-[-13px]
              rounded-full blur-2xl
              ${accent.glow}
            `}
          />

          <div
            className={`
              relative flex
              h-[76px] w-[76px]
              items-center justify-center
              rounded-2xl border
              shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
              sm:h-[88px] sm:w-[88px]
              ${accent.icon}
            `}
          >
            <Icon
              size={32}
              strokeWidth={1.6}
              aria-hidden="true"
            />

            <span
              aria-hidden="true"
              className="
                absolute -right-1.5 -top-1.5
                flex h-5 w-5
                items-center justify-center
                rounded-full
                border border-[#071323]
                bg-[#0b2435]
              "
            >
              {loading ? (
                <FiRefreshCw
                  size={10}
                  className="
                    animate-spin
                    text-cyan-200
                  "
                />
              ) : (
                <span
                  className="
                    h-1.5 w-1.5
                    rounded-full
                    bg-cyan-300
                    shadow-[0_0_7px_rgba(103,232,249,0.8)]
                  "
                />
              )}
            </span>
          </div>
        </div>

        {/* Status label */}
        <div
          className={`
            mb-3 inline-flex
            max-w-full items-center
            justify-center gap-2
            rounded-full border
            px-3 py-1.5
            text-[9px] font-semibold
            uppercase tracking-[0.17em]
            sm:text-[10px]
            ${accent.badge}
          `}
        >
          <FiShield
            size={11}
            className="shrink-0"
            aria-hidden="true"
          />

          <span>{config.eyebrow}</span>
        </div>

        {/* Heading */}
        <h2
          id={titleId}
          className="
            max-w-xl
            font-['Orbitron',sans-serif]
            text-base font-semibold
            leading-relaxed tracking-tight
            text-slate-100
            sm:text-xl lg:text-2xl
          "
        >
          {resolvedTitle}
        </h2>

        {/* Description */}
        <p
          id={descriptionId}
          className="
            mt-3 max-w-lg
            text-xs leading-6
            text-slate-400
            sm:text-sm sm:leading-7
          "
        >
          {resolvedDescription}
        </p>

        {/* Accessible loading announcement */}
        {loading && (
          <p
            id={statusId}
            role="status"
            aria-live="polite"
            className="
              mt-4 text-xs
              text-cyan-300
            "
          >
            Processing your request…
          </p>
        )}

        {/* Action buttons */}
        {hasActions && (
          <div
            className="
              mt-6 flex w-full
              flex-col items-stretch
              justify-center gap-2.5
              sm:w-auto sm:flex-row
              sm:items-center
            "
          >
            {showPrimary && (
              <button
                type="button"
                onClick={onPrimaryAction}
                disabled={actionsDisabled}
                className={`
                  inline-flex min-h-11
                  w-full items-center
                  justify-center gap-2
                  rounded-lg border
                  px-4 py-2
                  text-xs font-medium
                  transition-colors duration-200
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-cyan-300
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  sm:w-auto
                  ${accent.button}
                `}
              >
                {loading ? (
                  <FiRefreshCw
                    size={14}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <PrimaryActionIcon
                    size={14}
                    aria-hidden="true"
                  />
                )}

                <span>
                  {loading
                    ? "Please wait…"
                    : resolvedPrimaryLabel}
                </span>
              </button>
            )}

            {showSecondary && (
              <button
                type="button"
                onClick={onSecondaryAction}
                disabled={actionsDisabled}
                className="
                  inline-flex min-h-11
                  w-full items-center
                  justify-center gap-2
                  rounded-lg border
                  border-white/[0.09]
                  bg-white/[0.025]
                  px-4 py-2
                  text-xs font-medium
                  text-slate-300
                  transition-colors duration-200
                  hover:border-white/[0.16]
                  hover:bg-white/[0.055]
                  hover:text-white
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-cyan-300
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  sm:w-auto
                "
              >
                <SecondaryActionIcon
                  size={13}
                  aria-hidden="true"
                />

                <span>
                  {loading
                    ? "Please wait…"
                    : resolvedSecondaryLabel}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Decorative bottom accents */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute bottom-0 left-0 right-0
          z-0 h-px
          bg-gradient-to-r
          from-transparent
          via-cyan-400/50
          to-transparent
          opacity-60
        "
      />

      <div
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute bottom-0 left-1/2
          z-0 h-px w-20
          -translate-x-1/2
          bg-gradient-to-r
          from-transparent
          ${accent.line}
          to-transparent
        `}
      />
    </section>
  );
}

export default NotificationEmptyState;
