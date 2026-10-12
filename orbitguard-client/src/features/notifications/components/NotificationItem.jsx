
import {
  FiActivity,
  FiAlertTriangle,
  FiBell,
  FiCheckCircle,
  FiClock,
  FiDatabase,
  FiFileText,
  FiMessageSquare,
  FiShield,
  FiTool,
  FiUsers,
} from "react-icons/fi";

/* ================================================================
   NOTIFICATION ITEM
   OrbitGuard AI — Notification Center

   Responsibilities:
   - Render one notification in the inbox feed
   - Show type, priority, unread state and timestamp
   - Report selection and optional quick actions to the parent

   No API calls or backend mutations belong in this component.
   ================================================================ */

const CATEGORY_CONFIG = {
  ALERT: {
    label: "Alert",
    Icon: FiAlertTriangle,
    accent: "border-l-rose-400",
    iconColor: "text-rose-300",
    iconSurface: "border-rose-400/20 bg-rose-400/10",
    badge: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  },
  COLLISION: {
    label: "Risk",
    Icon: FiActivity,
    accent: "border-l-rose-400",
    iconColor: "text-rose-300",
    iconSurface: "border-rose-400/20 bg-rose-400/10",
    badge: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  },
  SYSTEM: {
    label: "System",
    Icon: FiShield,
    accent: "border-l-cyan-400",
    iconColor: "text-cyan-300",
    iconSurface: "border-cyan-400/20 bg-cyan-400/10",
    badge: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
  },
  REPORT: {
    label: "Reports",
    Icon: FiFileText,
    accent: "border-l-violet-400",
    iconColor: "text-violet-300",
    iconSurface: "border-violet-400/20 bg-violet-400/10",
    badge: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  },
  COMMENT: {
    label: "Collaboration",
    Icon: FiMessageSquare,
    accent: "border-l-sky-300",
    iconColor: "text-sky-200",
    iconSurface: "border-sky-300/20 bg-sky-300/10",
    badge: "border-sky-300/20 bg-sky-300/10 text-sky-200",
  },
  DATA_UPDATE: {
    label: "Data Update",
    Icon: FiDatabase,
    accent: "border-l-teal-400",
    iconColor: "text-teal-300",
    iconSurface: "border-teal-400/20 bg-teal-400/10",
    badge: "border-teal-400/20 bg-teal-400/10 text-teal-300",
  },
  REMINDER: {
    label: "Reminder",
    Icon: FiClock,
    accent: "border-l-amber-400",
    iconColor: "text-amber-300",
    iconSurface: "border-amber-400/20 bg-amber-400/10",
    badge: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  },
  MAINTENANCE: {
    label: "Maintenance",
    Icon: FiTool,
    accent: "border-l-blue-400",
    iconColor: "text-blue-300",
    iconSurface: "border-blue-400/20 bg-blue-400/10",
    badge: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  },
  ACCESS: {
    label: "Access",
    Icon: FiUsers,
    accent: "border-l-purple-400",
    iconColor: "text-purple-300",
    iconSurface: "border-purple-400/20 bg-purple-400/10",
    badge: "border-purple-400/20 bg-purple-400/10 text-purple-300",
  },
};

const PRIORITY_CONFIG = {
  CRITICAL: {
    label: "Critical",
    dot: "bg-rose-400",
  },
  HIGH: {
    label: "High",
    dot: "bg-orange-400",
  },
  MEDIUM: {
    label: "Medium",
    dot: "bg-cyan-400",
  },
  LOW: {
    label: "Low",
    dot: "bg-slate-400",
  },
};

function getCategoryConfig(type) {
  const normalizedType = String(type ?? "").toUpperCase();

  if (CATEGORY_CONFIG[normalizedType]) {
    return CATEGORY_CONFIG[normalizedType];
  }

  // Support common naming variations from notification APIs.
  if (
    normalizedType.includes("COLLISION") ||
    normalizedType.includes("RISK")
  ) {
    return CATEGORY_CONFIG.COLLISION;
  }

  if (normalizedType.includes("REPORT")) {
    return CATEGORY_CONFIG.REPORT;
  }

  if (
    normalizedType.includes("COMMENT") ||
    normalizedType.includes("MENTION")
  ) {
    return CATEGORY_CONFIG.COMMENT;
  }

  if (
    normalizedType.includes("SATELLITE") ||
    normalizedType.includes("DEBRIS") ||
    normalizedType.includes("DATA")
  ) {
    return CATEGORY_CONFIG.DATA_UPDATE;
  }

  if (
    normalizedType.includes("MAINTENANCE") ||
    normalizedType.includes("SERVICE")
  ) {
    return CATEGORY_CONFIG.MAINTENANCE;
  }

  if (
    normalizedType.includes("ACCESS") ||
    normalizedType.includes("USER")
  ) {
    return CATEGORY_CONFIG.ACCESS;
  }

  if (normalizedType.includes("ALERT")) {
    return CATEGORY_CONFIG.ALERT;
  }

  return CATEGORY_CONFIG.SYSTEM;
}

function formatTime(value) {
  if (!value) return "Time unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  if (sameDay) {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date)}`;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function getStableKey(notification) {
  return (
    notification?.id ??
    notification?.notificationCode ??
    notification?.notificationId ??
    ""
  );
}

function NotificationItem({
  notification,
  selected = false,
  onClick,
  onMarkRead,
  showPriority = false,
  compact = false,
  disabled = false,
}) {
  if (!notification) return null;

  const {
    title,
    message,
    type,
    priority,
    status,
    createdAt,
    readAt,
  } = notification;

  const category = getCategoryConfig(type);
  const CategoryIcon = category.Icon;

  const normalizedStatus = String(status ?? "").toUpperCase();
  const isRead =
    normalizedStatus === "READ" ||
    Boolean(readAt);

  const priorityConfig =
    PRIORITY_CONFIG[String(priority ?? "").toUpperCase()];

  const handleMarkRead = (event) => {
    event.stopPropagation();

    if (typeof onMarkRead === "function" && !isRead) {
      onMarkRead(notification);
    }
  };

  const handleKeyDown = (event) => {
    if (disabled || !onClick) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick(notification);
    }
  };

  return (
    <article
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`Open notification: ${title || "Untitled notification"}`}
      aria-pressed={selected}
      aria-current={selected ? "true" : undefined}
      onClick={() => {
        if (!disabled && typeof onClick === "function") {
          onClick(notification);
        }
      }}
      onKeyDown={handleKeyDown}
      className={`
        group relative flex w-full min-w-0 items-center gap-3
        overflow-hidden rounded-xl border border-l-[3px]
        px-2.5 py-3 text-left
        transition duration-200 ease-out
        sm:gap-3.5 sm:px-3
        ${category.accent}
        ${
          selected
            ? "border-cyan-400/40 bg-gradient-to-r from-cyan-400/[0.10] via-[#081b2e]/95 to-[#071426]/95 shadow-[0_0_24px_rgba(34,211,238,0.07)]"
            : "border-white/[0.07] bg-[#061323]/75 hover:border-white/[0.14] hover:bg-[#0a1a2c]/95"
        }
        ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer"
        }
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-inset focus-visible:ring-cyan-400/70
      `}
    >
      {/* Category icon */}

      <div
        className={`
          flex h-10 w-10 shrink-0 items-center justify-center
          rounded-lg border transition-colors duration-200
          sm:h-11 sm:w-11
          ${category.iconSurface}
          ${selected ? "shadow-[0_0_16px_rgba(34,211,238,0.08)]" : ""}
        `}
      >
        <CategoryIcon
          size={19}
          strokeWidth={1.8}
          className={category.iconColor}
        />
      </div>

      {/* Main notification content */}

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <h3
            className={`
              min-w-0 flex-1 truncate text-[12px] leading-5
              sm:text-[12px]
              ${
                isRead
                  ? "font-medium text-slate-300"
                  : "font-semibold text-slate-100"
              }
            `}
            title={title || "Untitled notification"}
          >
            {title || "Untitled notification"}
          </h3>

          <time
            dateTime={createdAt || undefined}
            className="shrink-0 pt-0.5 text-[9px] tabular-nums text-slate-500 sm:text-[10px]"
            title={createdAt ? new Date(createdAt).toLocaleString() : undefined}
          >
            {formatTime(createdAt)}
          </time>
        </div>

        <p
          className={`
            mt-0.5 overflow-hidden text-ellipsis
            text-[10px] leading-[1.55] text-slate-500
            ${compact ? "line-clamp-1" : "line-clamp-2"}
          `}
          title={message || ""}
        >
          {message || "No message content available."}
        </p>

        {/* Category badge and optional priority */}

        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
          <span
            className={`
              inline-flex max-w-full items-center rounded-md border
              px-2 py-0.5 text-[9px] font-medium
              ${category.badge}
            `}
          >
            <span className="truncate">{category.label}</span>
          </span>

          {showPriority && priorityConfig && (
            <span className="inline-flex items-center gap-1.5 text-[9px] text-slate-400">
              <span
                className={`h-1.5 w-1.5 rounded-full ${priorityConfig.dot}`}
              />
              {priorityConfig.label}
            </span>
          )}
        </div>
      </div>

      {/* Unread indicator / read state */}

      <div className="flex h-full shrink-0 items-center justify-center self-stretch">
        {!isRead ? (
          <span
            className={`
              h-2.5 w-2.5 rounded-full bg-rose-400
              shadow-[0_0_10px_rgba(251,113,133,0.24)]
              ${selected ? "ring-2 ring-rose-400/15" : ""}
            `}
            aria-label="Unread"
            title="Unread notification"
          />
        ) : (
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-slate-700 opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Read notification"
            title="Read notification"
          >
            <FiCheckCircle size={13} />
          </span>
        )}
      </div>

      {/* Optional quick action, shown on hover/focus */}

      {!isRead && typeof onMarkRead === "function" && (
        <button
          type="button"
          onClick={handleMarkRead}
          disabled={disabled}
          title="Mark as read"
          aria-label={`Mark ${title || "notification"} as read`}
          className="
            absolute right-8 top-2 hidden rounded-md
            border border-cyan-400/20 bg-[#071323]
            p-1.5 text-cyan-300 shadow-lg
            transition hover:bg-cyan-400/10
            group-hover:flex group-focus-within:flex
            focus-visible:flex focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-cyan-400
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          <FiCheckCircle size={13} />
        </button>
      )}
    </article>
  );
}

export default NotificationItem;
