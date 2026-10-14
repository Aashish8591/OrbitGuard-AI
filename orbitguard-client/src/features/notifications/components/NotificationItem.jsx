
import {
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiDatabase,
  FiFileText,
  FiInfo,
  FiShield,
} from "react-icons/fi";

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
    label: "Collision risk",
    Icon: FiActivity,
    accent: "border-l-amber-400",
    iconColor: "text-amber-300",
    iconSurface: "border-amber-400/20 bg-amber-400/10",
    badge: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  },

  SYSTEM: {
    label: "System",
    Icon: FiShield,
    accent: "border-l-cyan-400",
    iconColor: "text-cyan-300",
    iconSurface: "border-cyan-400/20 bg-cyan-400/10",
    badge: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
  },

  WARNING: {
    label: "Warning",
    Icon: FiAlertTriangle,
    accent: "border-l-orange-400",
    iconColor: "text-orange-300",
    iconSurface: "border-orange-400/20 bg-orange-400/10",
    badge: "border-orange-400/20 bg-orange-400/10 text-orange-300",
  },

  INFO: {
    label: "Information",
    Icon: FiInfo,
    accent: "border-l-sky-400",
    iconColor: "text-sky-300",
    iconSurface: "border-sky-400/20 bg-sky-400/10",
    badge: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  },
};

const PRIORITY_CONFIG = {
  CRITICAL: {
    label: "Critical",
    dot: "bg-rose-400",
    text: "text-rose-300",
  },

  HIGH: {
    label: "High",
    dot: "bg-orange-400",
    text: "text-orange-300",
  },

  MEDIUM: {
    label: "Medium",
    dot: "bg-cyan-400",
    text: "text-cyan-300",
  },

  LOW: {
    label: "Low",
    dot: "bg-slate-400",
    text: "text-slate-300",
  },
};

function getCategoryConfig(type) {
  const normalizedType = String(type ?? "")
    .trim()
    .toUpperCase();

  if (CATEGORY_CONFIG[normalizedType]) {
    return CATEGORY_CONFIG[normalizedType];
  }

  if (
    normalizedType.includes("COLLISION") ||
    normalizedType.includes("RISK")
  ) {
    return CATEGORY_CONFIG.COLLISION;
  }

  if (normalizedType.includes("ALERT")) {
    return CATEGORY_CONFIG.ALERT;
  }

  if (normalizedType.includes("WARNING")) {
    return CATEGORY_CONFIG.WARNING;
  }

  if (normalizedType.includes("INFO")) {
    return CATEGORY_CONFIG.INFO;
  }

  if (normalizedType.includes("REPORT")) {
    return {
      ...CATEGORY_CONFIG.INFO,
      label: "Report",
      Icon: FiFileText,
    };
  }

  if (
    normalizedType.includes("SATELLITE") ||
    normalizedType.includes("DEBRIS") ||
    normalizedType.includes("DATA")
  ) {
    return {
      ...CATEGORY_CONFIG.SYSTEM,
      label: "Data update",
      Icon: FiDatabase,
    };
  }

  return CATEGORY_CONFIG.SYSTEM;
}

function parseDate(value) {
  if (
    value == null ||
    value === "" ||
    typeof value === "boolean"
  ) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTime(value) {
  const date = parseDate(value);

  if (!date) {
    return "Time unavailable";
  }

  const now = new Date();

  const timeFormatter = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  if (date.toDateString() === now.toDateString()) {
    return timeFormatter.format(date);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${timeFormatter.format(date)}`;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function getNotificationKey(notification) {
  return (
    notification?.id ??
    notification?.notificationId ??
    notification?.notificationCode ??
    notification?._id ??
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
  if (
    !notification ||
    typeof notification !== "object" ||
    Array.isArray(notification)
  ) {
    return null;
  }

  const {
    title,
    message,
    type,
    priority,
    status,
    createdAt,
  } = notification;

  const category = getCategoryConfig(type);
  const CategoryIcon = category.Icon;

  const normalizedStatus = String(status ?? "")
    .trim()
    .toUpperCase();

  const isRead = normalizedStatus === "READ";
  const isUnread = normalizedStatus === "UNREAD";

  const normalizedPriority = String(priority ?? "")
    .trim()
    .toUpperCase();

  const priorityConfig =
    PRIORITY_CONFIG[normalizedPriority];

  const notificationTitle =
    typeof title === "string" && title.trim()
      ? title.trim()
      : "Untitled notification";

  const notificationMessage =
    typeof message === "string" && message.trim()
      ? message.trim()
      : "No message content available.";

  const notificationKey = getNotificationKey(notification);
  const parsedCreatedAt = parseDate(createdAt);

  const canSelect = typeof onClick === "function";

  const canMarkRead =
    isUnread && typeof onMarkRead === "function";

  function handleSelect() {
    if (disabled || !canSelect) {
      return;
    }

    onClick(notification);
  }

  function handleMarkRead(event) {
    event.preventDefault();
    event.stopPropagation();

    if (disabled || !canMarkRead) {
      return;
    }

    onMarkRead(notification);
  }

  return (
    <article
      data-notification-id={
        notificationKey != null
          ? String(notificationKey)
          : undefined
      }
      data-notification-status={
        normalizedStatus || "UNKNOWN"
      }
      data-selected={selected ? "true" : "false"}
      className={`
        group relative flex w-full min-w-0
        items-stretch overflow-hidden
        rounded-xl border border-l-[3px]
        transition duration-200 ease-out
        ${category.accent}
        ${
          selected
            ? "border-cyan-400/40 bg-gradient-to-r from-cyan-400/[0.10] via-[#081b2e]/95 to-[#071426]/95 shadow-[0_0_24px_rgba(34,211,238,0.07)]"
            : "border-white/[0.07] bg-[#061323]/75 hover:border-white/[0.14] hover:bg-[#0a1a2c]/95"
        }
        ${disabled ? "opacity-60" : ""}
      `}
    >
      {/* Main selection button */}
      <button
        type="button"
        onClick={handleSelect}
        disabled={disabled || !canSelect}
        aria-label={`Open notification: ${notificationTitle}`}
        aria-pressed={selected}
        title={notificationTitle}
        className="
          flex min-w-0 flex-1
          cursor-pointer items-center gap-3
          px-2.5 py-3 text-left
          transition-colors
          sm:gap-3.5 sm:px-3
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-inset
          focus-visible:ring-cyan-400/70
          disabled:cursor-not-allowed
        "
      >
        {/* Category icon */}
        <span
          aria-hidden="true"
          className={`
            flex h-10 w-10 shrink-0
            items-center justify-center
            rounded-lg border
            transition-colors duration-200
            sm:h-11 sm:w-11
            ${category.iconSurface}
            ${
              selected
                ? "shadow-[0_0_16px_rgba(34,211,238,0.08)]"
                : ""
            }
          `}
        >
          <CategoryIcon
            size={19}
            strokeWidth={1.8}
            className={category.iconColor}
          />
        </span>

        {/* Notification content */}
        <span className="block min-w-0 flex-1">
          <span className="flex min-w-0 items-start justify-between gap-2">
            <span
              className={`
                min-w-0 flex-1 truncate
                text-[12px] leading-5
                ${
                  isRead
                    ? "font-medium text-slate-300"
                    : "font-semibold text-slate-100"
                }
              `}
            >
              {notificationTitle}
            </span>

            <time
              dateTime={
                parsedCreatedAt
                  ? parsedCreatedAt.toISOString()
                  : undefined
              }
              title={
                parsedCreatedAt
                  ? parsedCreatedAt.toLocaleString("en-IN")
                  : undefined
              }
              className="
                shrink-0 pt-0.5
                text-[9px] tabular-nums
                text-slate-500 sm:text-[10px]
              "
            >
              {formatTime(createdAt)}
            </time>
          </span>

          <span
            className={`
              mt-0.5 block overflow-hidden
              break-words text-ellipsis
              text-[10px] leading-[1.55]
              text-slate-500
              ${compact ? "line-clamp-1" : "line-clamp-2"}
            `}
          >
            {notificationMessage}
          </span>

          {/* Category and optional priority */}
          <span className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
            <span
              className={`
                inline-flex max-w-full items-center
                rounded-md border px-2 py-0.5
                text-[9px] font-medium
                ${category.badge}
              `}
            >
              <span className="truncate">
                {category.label}
              </span>
            </span>

            {showPriority &&
              (priorityConfig ? (
                <span
                  className={`
                    inline-flex items-center gap-1.5
                    text-[9px] ${priorityConfig.text}
                  `}
                >
                  <span
                    aria-hidden="true"
                    className={`
                      h-1.5 w-1.5 rounded-full
                      ${priorityConfig.dot}
                    `}
                  />
                  {priorityConfig.label}
                </span>
              ) : priority ? (
                <span className="text-[9px] text-slate-500">
                  {String(priority)}
                </span>
              ) : null)}
          </span>
        </span>

        {/* Read status indicator */}
        <span className="flex shrink-0 items-center justify-center self-stretch">
          {isUnread ? (
            <span
              className={`
                h-2.5 w-2.5 rounded-full
                bg-rose-400
                shadow-[0_0_10px_rgba(251,113,133,0.24)]
                ${selected ? "ring-2 ring-rose-400/15" : ""}
              `}
            >
              <span className="sr-only">Unread</span>
            </span>
          ) : isRead ? (
            <span
              className="
                flex h-6 w-6 items-center
                justify-center text-slate-600
              "
              title="Read notification"
            >
              <FiCheckCircle size={13} aria-hidden="true" />
              <span className="sr-only">Read</span>
            </span>
          ) : (
            <span
              className="h-2 w-2 rounded-full bg-slate-600"
              title="Status unavailable"
            >
              <span className="sr-only">
                Status unavailable
              </span>
            </span>
          )}
        </span>
      </button>

      {/* Independent mark-as-read action */}
      {canMarkRead && (
        <div className="flex shrink-0 items-center pr-2">
          <button
            type="button"
            onClick={handleMarkRead}
            disabled={disabled}
            title="Mark as read"
            aria-label={`Mark ${notificationTitle} as read`}
            className="
              inline-flex h-8 w-8
              items-center justify-center
              rounded-md border
              border-cyan-400/20
              bg-[#071323] text-cyan-300
              transition-colors
              hover:bg-cyan-400/10
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-cyan-400
              disabled:cursor-not-allowed
              disabled:opacity-50
              sm:opacity-70
              sm:group-hover:opacity-100
              sm:focus-visible:opacity-100
            "
          >
            <FiCheckCircle
              size={14}
              aria-hidden="true"
            />
          </button>
        </div>
      )}
    </article>
  );
}

export default NotificationItem;
