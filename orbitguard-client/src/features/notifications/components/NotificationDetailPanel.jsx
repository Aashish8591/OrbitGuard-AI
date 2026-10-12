
import { useMemo, useState } from "react";
import {
  FiActivity,
  FiAlertTriangle,
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiCopy,
  FiExternalLink,
  FiFileText,
  FiInfo,
  FiMail,
  FiShield,
  FiTrash2,
  FiX,
} from "react-icons/fi";

/* ================================================================
   NOTIFICATION DETAIL PANEL
   OrbitGuard AI — Notification Center

   Props:
   - notification: NotificationResponse | null
   - onClose: () => void
   - onMarkRead: (notification) => void
   - onDelete: (notification) => void
   - onOpenAlert: (alertId) => void
   - onOpenRisk: (collisionRiskId) => void
   - isUpdating: boolean
   - isDeleting: boolean

   This component does not make API calls.
   All data and mutations are owned by the parent page/hook.
   ================================================================ */

const PRIORITY_STYLES = {
  CRITICAL: {
    label: "Critical",
    text: "text-rose-300",
    border: "border-rose-400/30",
    surface: "bg-rose-400/10",
    dot: "bg-rose-400",
    Icon: FiAlertTriangle,
  },
  HIGH: {
    label: "High",
    text: "text-amber-300",
    border: "border-amber-400/30",
    surface: "bg-amber-400/10",
    dot: "bg-amber-400",
    Icon: FiAlertTriangle,
  },
  MEDIUM: {
    label: "Medium",
    text: "text-cyan-300",
    border: "border-cyan-400/30",
    surface: "bg-cyan-400/10",
    dot: "bg-cyan-400",
    Icon: FiActivity,
  },
  LOW: {
    label: "Low",
    text: "text-sky-300",
    border: "border-sky-400/30",
    surface: "bg-sky-400/10",
    dot: "bg-sky-400",
    Icon: FiInfo,
  },
};

const TYPE_STYLES = {
  ALERT: {
    label: "Alert",
    Icon: FiAlertTriangle,
    color: "text-rose-300",
    surface: "bg-rose-400/10",
    border: "border-rose-400/20",
  },
  COLLISION: {
    label: "Collision risk",
    Icon: FiActivity,
    color: "text-amber-300",
    surface: "bg-amber-400/10",
    border: "border-amber-400/20",
  },
  SYSTEM: {
    label: "System",
    Icon: FiShield,
    color: "text-cyan-300",
    surface: "bg-cyan-400/10",
    border: "border-cyan-400/20",
  },
  REPORT: {
    label: "Report",
    Icon: FiFileText,
    color: "text-violet-300",
    surface: "bg-violet-400/10",
    border: "border-violet-400/20",
  },
};

function getPriorityStyle(priority) {
  return PRIORITY_STYLES[String(priority ?? "").toUpperCase()] ?? {
    label: priority || "Unspecified",
    text: "text-slate-300",
    border: "border-slate-500/30",
    surface: "bg-slate-400/10",
    dot: "bg-slate-400",
    Icon: FiInfo,
  };
}

function getTypeStyle(type) {
  return TYPE_STYLES[String(type ?? "").toUpperCase()] ?? {
    label: type || "Notification",
    Icon: FiBell,
    color: "text-slate-300",
    surface: "bg-slate-400/10",
    border: "border-slate-500/20",
  };
}

function formatDateTime(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatRelativeTime(value) {
  if (!value) return null;

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) return null;

  const elapsedSeconds = Math.round((timestamp - Date.now()) / 1000);
  const absoluteSeconds = Math.abs(elapsedSeconds);

  if (absoluteSeconds < 60) {
    return elapsedSeconds >= 0 ? "Just now" : "Just now";
  }

  const units = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [unit, seconds] of units) {
    const amount = Math.floor(absoluteSeconds / seconds);

    if (amount >= 1) {
      const formatted = `${amount} ${unit}${amount !== 1 ? "s" : ""}`;
      return elapsedSeconds < 0 ? `${formatted} ago` : `In ${formatted}`;
    }
  }

  return "Just now";
}

function MetadataRow({ label, value, mono = false }) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div className="flex min-w-0 items-start justify-between gap-4 py-2.5">
      <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.13em] text-slate-500">
        {label}
      </span>

      <span
        className={`min-w-0 break-all text-right text-xs text-slate-200 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function ReferenceCard({
  label,
  value,
  Icon,
  onOpen,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value || typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="group min-w-0 rounded-xl border border-white/[0.07] bg-[#071323]/80 p-3 transition-colors hover:border-cyan-400/20">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/15 bg-cyan-400/[0.07] text-cyan-300">
          <Icon size={16} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {label}
          </p>

          <p className="break-all font-mono text-[11px] leading-5 text-slate-300">
            {value}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          title={copied ? "Copied" : `Copy ${label}`}
          aria-label={`Copy ${label}`}
          className="shrink-0 rounded-md p-1.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          {copied ? (
            <FiCheck size={14} />
          ) : (
            <FiCopy size={14} />
          )}
        </button>
      </div>

      {onOpen && (
        <button
          type="button"
          onClick={() => onOpen(value)}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-cyan-300 transition hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          Open related record
          <FiExternalLink size={12} />
        </button>
      )}
    </div>
  );
}

function NotificationDetailPanel({
  notification = null,
  onClose,
  onMarkRead,
  onDelete,
  onOpenAlert,
  onOpenRisk,
  isUpdating = false,
  isDeleting = false,
}) {
  const priorityStyle = useMemo(
    () => getPriorityStyle(notification?.priority),
    [notification?.priority]
  );

  const typeStyle = useMemo(
    () => getTypeStyle(notification?.type),
    [notification?.type]
  );

  if (!notification) {
    return (
      <aside
        aria-label="Notification details"
        className="flex min-h-[360px] h-full flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-[#050D19]/90 px-6 py-12 text-center"
      >
        <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300">
          <FiBell size={27} />

          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#050D19] bg-cyan-400" />
        </div>

        <h2 className="text-base font-semibold text-slate-100">
          Select a notification
        </h2>

        <p className="mt-2 max-w-[260px] text-sm leading-6 text-slate-500">
          Choose an item from your inbox to inspect its message, status, and
          related operational records.
        </p>

        <div className="mt-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/70" />
          Notification workspace
        </div>
      </aside>
    );
  }

  const {
    id,
    notificationCode,
    title,
    message,
    type,
    priority,
    status,
    recipientId,
    alertId,
    collisionRiskId,
    createdAt,
    updatedAt,
    readAt,
  } = notification;

  const normalizedStatus = String(status ?? "").toUpperCase();
  const isRead = normalizedStatus === "READ";
  const TypeIcon = typeStyle.Icon;
  const PriorityIcon = priorityStyle.Icon;

  const hasRelatedRecords = Boolean(alertId || collisionRiskId);

  const handleMarkRead = () => {
    if (!isUpdating && typeof onMarkRead === "function") {
      onMarkRead(notification);
    }
  };

  const handleDelete = () => {
    if (!isDeleting && typeof onDelete === "function") {
      onDelete(notification);
    }
  };

  return (
    <aside
      aria-label="Notification details"
      className="
        flex h-full min-h-0 flex-col overflow-hidden
        rounded-2xl border border-cyan-400/[0.12]
        bg-[#050D19]/95
        shadow-[0_18px_70px_rgba(0,0,0,0.24)]
      "
    >
      {/* ==========================================================
          TOP ACTION BAR
         ========================================================== */}

      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.07] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.65)]" />

          <span className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Notification details
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {typeof onMarkRead === "function" && (
            <button
              type="button"
              onClick={handleMarkRead}
              disabled={isUpdating}
              title={isRead ? "Mark as unread" : "Mark as read"}
              aria-label={isRead ? "Mark as unread" : "Mark as read"}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 text-[11px] font-medium text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.06] hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              {isRead ? <FiMail size={13} /> : <FiCheck size={13} />}
              <span className="hidden sm:inline">
                {isRead ? "Mark unread" : "Mark read"}
              </span>
            </button>
          )}

          {typeof onDelete === "function" && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete notification"
              aria-label="Delete notification"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-slate-500 transition hover:border-rose-400/30 hover:bg-rose-400/[0.07] hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <FiTrash2 size={14} />
            </button>
          )}

          {typeof onClose === "function" && (
            <button
              type="button"
              onClick={onClose}
              title="Close details"
              aria-label="Close notification details"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-slate-500 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <FiX size={15} />
            </button>
          )}
        </div>
      </div>

      {/* ==========================================================
          SCROLLABLE DETAIL CONTENT
         ========================================================== */}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {/* Notification identity */}

        <section className="px-4 pb-5 pt-5 sm:px-5">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${typeStyle.border} ${typeStyle.surface} ${typeStyle.color}`}
            >
              <TypeIcon size={23} strokeWidth={1.8} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.13em] ${typeStyle.border} ${typeStyle.surface} ${typeStyle.color}`}
                >
                  {typeStyle.label}
                </span>

                {!isRead && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-cyan-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    Unread
                  </span>
                )}
              </div>

              <h2 className="break-words text-base font-semibold leading-6 text-slate-100">
                {title || "Untitled notification"}
              </h2>

              <p className="mt-1.5 text-[11px] text-slate-500">
                {formatDateTime(createdAt)}
              </p>
            </div>
          </div>

          {/* Priority and read state */}

          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className={`rounded-xl border p-3 ${priorityStyle.border} ${priorityStyle.surface}`}>
              <div className="mb-2 flex items-center gap-1.5">
                <PriorityIcon size={13} className={priorityStyle.text} />

                <span className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                  Priority
                </span>
              </div>

              <p className={`text-sm font-semibold ${priorityStyle.text}`}>
                {priorityStyle.label}
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <FiCheckCircle
                  size={13}
                  className={isRead ? "text-emerald-300" : "text-cyan-300"}
                />

                <span className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                  Read status
                </span>
              </div>

              <p className={`text-sm font-semibold ${isRead ? "text-emerald-300" : "text-cyan-300"}`}>
                {status || "Unknown"}
              </p>
            </div>
          </div>
        </section>

        {/* Full message */}

        <section className="border-t border-white/[0.06] px-4 py-5 sm:px-5">
          <div className="mb-3 flex items-center gap-2">
            <FiActivity size={14} className="text-cyan-300" />

            <h3 className="text-[10px] font-bold uppercase tracking-[0.17em] text-slate-400">
              Message
            </h3>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#071323]/80 p-4">
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
              {message || "No message content is available."}
            </p>
          </div>
        </section>

        {/* Notification metadata */}

        <section className="border-t border-white/[0.06] px-4 py-5 sm:px-5">
          <div className="mb-2 flex items-center gap-2">
            <FiClock size={14} className="text-cyan-300" />

            <h3 className="text-[10px] font-bold uppercase tracking-[0.17em] text-slate-400">
              Record information
            </h3>
          </div>

          <div className="divide-y divide-white/[0.05]">
            <MetadataRow
              label="Notification code"
              value={notificationCode}
              mono
            />

            <MetadataRow
              label="Created"
              value={formatDateTime(createdAt)}
            />

            <MetadataRow
              label="Last updated"
              value={formatDateTime(updatedAt)}
            />

            <MetadataRow
              label="Read at"
              value={readAt ? formatDateTime(readAt) : null}
            />

            <MetadataRow
              label="Recipient"
              value={recipientId}
              mono
            />

            <MetadataRow
              label="Document ID"
              value={id}
              mono
            />
          </div>
        </section>

        {/* Related records */}

        {hasRelatedRecords && (
          <section className="border-t border-white/[0.06] px-4 py-5 sm:px-5">
            <div className="mb-3 flex items-center gap-2">
              <FiExternalLink size={14} className="text-cyan-300" />

              <h3 className="text-[10px] font-bold uppercase tracking-[0.17em] text-slate-400">
                Related records
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {alertId && (
                <ReferenceCard
                  label="Alert reference"
                  value={alertId}
                  Icon={FiBell}
                  onOpen={onOpenAlert}
                />
              )}

              {collisionRiskId && (
                <ReferenceCard
                  label="Collision risk reference"
                  value={collisionRiskId}
                  Icon={FiActivity}
                  onOpen={onOpenRisk}
                />
              )}
            </div>
          </section>
        )}

        {!hasRelatedRecords && (
          <section className="border-t border-white/[0.06] px-4 py-4 sm:px-5">
            <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <FiInfo size={15} className="mt-0.5 shrink-0 text-slate-500" />

              <p className="text-xs leading-5 text-slate-500">
                No related alert or collision risk is linked to this notification.
              </p>
            </div>
          </section>
        )}
      </div>

      {/* ==========================================================
          BOTTOM CONTEXT BAR
         ========================================================== */}

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/[0.07] bg-[#060F1D]/95 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-30" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
          </span>

          <span className="truncate text-[10px] uppercase tracking-[0.12em] text-slate-500">
            Record details
          </span>
        </div>

        <span className="shrink-0 text-[10px] text-slate-600">
          {formatRelativeTime(createdAt) || "Timestamp unavailable"}
        </span>
      </div>
    </aside>
  );
}

export default NotificationDetailPanel;