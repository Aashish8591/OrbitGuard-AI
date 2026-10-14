
import { useEffect, useMemo, useRef, useState } from "react";

import {
  FiActivity,
  FiAlertTriangle,
  FiBell,
  FiCheck,
  FiCheckCircle,
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

const PRIORITY_STYLES = {
  CRITICAL: {
    label: "Critical",
    text: "text-rose-300",
    border: "border-rose-400/30",
    surface: "bg-rose-400/10",
    Icon: FiAlertTriangle,
  },
  HIGH: {
    label: "High",
    text: "text-amber-300",
    border: "border-amber-400/30",
    surface: "bg-amber-400/10",
    Icon: FiAlertTriangle,
  },
  MEDIUM: {
    label: "Medium",
    text: "text-cyan-300",
    border: "border-cyan-400/30",
    surface: "bg-cyan-400/10",
    Icon: FiActivity,
  },
  LOW: {
    label: "Low",
    text: "text-sky-300",
    border: "border-sky-400/30",
    surface: "bg-sky-400/10",
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
  WARNING: {
    label: "Warning",
    Icon: FiAlertTriangle,
    color: "text-orange-300",
    surface: "bg-orange-400/10",
    border: "border-orange-400/20",
  },
  INFO: {
    label: "Information",
    Icon: FiInfo,
    color: "text-sky-300",
    surface: "bg-sky-400/10",
    border: "border-sky-400/20",
  },
};

function getPriorityStyle(priority) {
  const normalized = String(priority ?? "").trim().toUpperCase();

  return (
    PRIORITY_STYLES[normalized] ?? {
      label: priority || "Unspecified",
      text: "text-slate-300",
      border: "border-slate-500/30",
      surface: "bg-slate-400/10",
      Icon: FiInfo,
    }
  );
}

function getTypeStyle(type) {
  const normalized = String(type ?? "").trim().toUpperCase();

  if (TYPE_STYLES[normalized]) {
    return TYPE_STYLES[normalized];
  }

  if (normalized.includes("REPORT")) {
    return {
      ...TYPE_STYLES.INFO,
      label: "Report",
      Icon: FiFileText,
    };
  }

  return {
    label: type || "Notification",
    Icon: FiBell,
    color: "text-slate-300",
    surface: "bg-slate-400/10",
    border: "border-slate-500/20",
  };
}

function parseDate(value) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    typeof value === "boolean"
  ) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateTime(value) {
  const date = parseDate(value);

  if (!date) return "Not available";

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
  const date = parseDate(value);

  if (!date) return null;

  const elapsedSeconds = Math.round(
    (date.getTime() - Date.now()) / 1000
  );

  const absoluteSeconds = Math.abs(elapsedSeconds);

  if (absoluteSeconds < 60) return "Just now";

  const units = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [unit, seconds] of units) {
    const amount = Math.floor(absoluteSeconds / seconds);

    if (amount >= 1) {
      const formatted = `${amount} ${unit}${amount === 1 ? "" : "s"}`;

      return elapsedSeconds < 0
        ? `${formatted} ago`
        : `In ${formatted}`;
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
      <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.13em] text-slate-400">
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
  disabled = false,
}) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (
      disabled ||
      !value ||
      typeof navigator === "undefined" ||
      !navigator.clipboard?.writeText
    ) {
      return;
    }

    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);

      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current);
      }

      resetTimer.current = window.setTimeout(() => {
        setCopied(false);
        resetTimer.current = null;
      }, 1600);
    } catch {
      setCopied(false);
    }
  };

  const handleOpen = () => {
    if (disabled || typeof onOpen !== "function" || !value) {
      return;
    }

    onOpen(value);
  };

  return (
    <div className="group min-w-0 rounded-xl border border-white/[0.09] bg-[#071323]/90 p-3 transition-colors hover:border-cyan-400/25">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/[0.09] text-cyan-300">
          <Icon size={16} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>

          <p className="break-all font-mono text-[11px] leading-5 text-slate-200">
            {value}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          disabled={disabled || !value}
          title={copied ? "Copied" : `Copy ${label}`}
          aria-label={copied ? `${label} copied` : `Copy ${label}`}
          className="shrink-0 rounded-md p-1.5 text-slate-400 transition hover:bg-white/[0.08] hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {copied ? (
            <FiCheck size={14} aria-hidden="true" />
          ) : (
            <FiCopy size={14} aria-hidden="true" />
          )}
        </button>
      </div>

      {typeof onOpen === "function" && (
        <button
          type="button"
          onClick={handleOpen}
          disabled={disabled || !value}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-cyan-300 transition hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Open related record
          <FiExternalLink size={12} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function NotificationDetailPanel({
  notification = null,
  onClose,
  onMarkRead,
  onMarkUnread,
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
        className="relative isolate flex h-full min-h-[360px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/[0.14] bg-[#050D19] px-6 py-12 text-center"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[url('/images/Notification/streambg.png')] bg-cover bg-center bg-no-repeat opacity-40"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[#020914]/65"
        />

        <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/25 bg-[#061323]/80 text-cyan-300">
          <FiBell size={27} aria-hidden="true" />
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#050D19] bg-cyan-400" />
        </div>

        <h2 className="relative text-base font-semibold text-slate-100">
          Select a notification
        </h2>

        <p className="relative mt-2 max-w-[260px] text-sm leading-6 text-slate-300">
          Choose an item from your inbox to inspect its message, status, and
          related operational records.
        </p>

        <div className="relative mt-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
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

  const normalizedStatus = String(status ?? "").trim().toUpperCase();

  const isRead = normalizedStatus === "READ";
  const isUnread = normalizedStatus === "UNREAD";
  const hasKnownStatus = isRead || isUnread;

  const TypeIcon = typeStyle.Icon;
  const PriorityIcon = priorityStyle.Icon;

  const hasRelatedRecords = Boolean(alertId || collisionRiskId);

  const canMarkRead = isUnread && typeof onMarkRead === "function";

  const canMarkUnread =
    isRead &&
    (typeof onMarkUnread === "function" ||
      typeof onMarkRead === "function");

  const actionsDisabled = isUpdating || isDeleting;

  const handleToggleRead = () => {
    if (actionsDisabled) return;

    if (isUnread && typeof onMarkRead === "function") {
      onMarkRead(notification, "READ");
      return;
    }

    if (isRead && typeof onMarkUnread === "function") {
      onMarkUnread(notification, "UNREAD");
      return;
    }

    if (isRead && typeof onMarkRead === "function") {
      onMarkRead(notification, "UNREAD");
    }
  };

  const handleDelete = () => {
    if (actionsDisabled || typeof onDelete !== "function") return;

    onDelete(notification);
  };

  return (
    <aside
      aria-label="Notification details"
      className="
        relative isolate flex h-full min-h-0 min-w-0 flex-col
        overflow-hidden rounded-2xl
        border border-cyan-400/[0.15]
        bg-[#050D19]
        shadow-[0_18px_70px_rgba(0,0,0,0.28)]
      "
    >
      {/* Background image layer */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 z-10
          bg-[url('/images/Notification/streambg.png')]
          bg-cover bg-center bg-no-repeat
          opacity-400
        "
      />

      {/* Contrast overlay */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 -z-10
          bg-gradient-to-b
          from-[#020914]/75
          via-[#020914]/60
          to-[#020914]/85
        "
      />

      {/* Top action bar */}
      <div className="relative z-10 flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.08] bg-[#050D19]/55 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.65)]" />

          <span className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
            Notification details
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {(canMarkRead || canMarkUnread) && (
            <button
              type="button"
              onClick={handleToggleRead}
              disabled={actionsDisabled}
              title={isRead ? "Mark as unread" : "Mark as read"}
              aria-label={isRead ? "Mark as unread" : "Mark as read"}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.10] bg-[#071323]/80 px-2.5 text-[11px] font-medium text-slate-200 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.08] hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              {isRead ? (
                <FiMail size={13} aria-hidden="true" />
              ) : (
                <FiCheck size={13} aria-hidden="true" />
              )}

              <span className="hidden sm:inline">
                {isUpdating
                  ? "Updating..."
                  : isRead
                    ? "Mark unread"
                    : "Mark read"}
              </span>
            </button>
          )}

          {typeof onDelete === "function" && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={actionsDisabled}
              title="Delete notification"
              aria-label="Delete notification"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.10] bg-[#071323]/70 text-slate-300 transition hover:border-rose-400/30 hover:bg-rose-400/[0.09] hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <FiTrash2 size={14} aria-hidden="true" />
            </button>
          )}

          {typeof onClose === "function" && (
            <button
              type="button"
              onClick={onClose}
              title="Close details"
              aria-label="Close notification details"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.10] bg-[#071323]/70 text-slate-300 transition hover:bg-white/[0.10] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <FiX size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable detail content */}
      <div className="relative z-10 min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
        {/* Notification identity */}
        <section className="bg-[#030d1b]/25 px-4 pb-5 pt-5 sm:px-5">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${typeStyle.border} ${typeStyle.surface} ${typeStyle.color}`}
            >
              <TypeIcon size={23} strokeWidth={1.8} aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.13em] ${typeStyle.border} ${typeStyle.surface} ${typeStyle.color}`}
                >
                  {typeStyle.label}
                </span>

                {isUnread && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-cyan-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    Unread
                  </span>
                )}

                {!hasKnownStatus && (
                  <span className="text-[10px] font-medium text-slate-400">
                    Status unavailable
                  </span>
                )}
              </div>

              <h2 className="break-words text-base font-semibold leading-6 text-white">
                {title || "Untitled notification"}
              </h2>

              <p className="mt-1.5 text-[11px] text-slate-300">
                {formatDateTime(createdAt)}
              </p>
            </div>
          </div>

          {/* Priority and read state */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div
              className={`rounded-xl border p-3 ${priorityStyle.border} ${priorityStyle.surface}`}
            >
              <div className="mb-2 flex items-center gap-1.5">
                <PriorityIcon
                  size={13}
                  className={priorityStyle.text}
                  aria-hidden="true"
                />
                <span className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                  Priority
                </span>
              </div>

              <p className={`text-sm font-semibold ${priorityStyle.text}`}>
                {priorityStyle.label}
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.10] bg-[#071323]/80 p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <FiCheckCircle
                  size={13}
                  className={
                    isRead
                      ? "text-emerald-300"
                      : isUnread
                        ? "text-cyan-300"
                        : "text-slate-400"
                  }
                  aria-hidden="true"
                />

                <span className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                  Read status
                </span>
              </div>

              <p
                className={`break-words text-sm font-semibold ${
                  isRead
                    ? "text-emerald-300"
                    : isUnread
                      ? "text-cyan-300"
                      : "text-slate-300"
                }`}
              >
                {hasKnownStatus ? normalizedStatus : "Unknown"}
              </p>
            </div>
          </div>
        </section>

        {/* Full message */}
        <section className="border-t border-white/[0.08] bg-[#030d1b]/25 px-4 py-5 sm:px-5">
          <div className="mb-3 flex items-center gap-2">
            <FiActivity size={14} className="text-cyan-300" aria-hidden="true" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.17em] text-slate-300">
              Message
            </h3>
          </div>

          <div className="rounded-xl border border-white/[0.09] bg-[#071323]/90 p-4">
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">
              {message || "No message content is available."}
            </p>
          </div>
        </section>

        {/* Notification metadata */}
        <section className="border-t border-white/[0.08] bg-[#030d1b]/25 px-4 py-5 sm:px-5">
          <div className="mb-2 flex items-center gap-2">
            <FiClock size={14} className="text-cyan-300" aria-hidden="true" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.17em] text-slate-300">
              Record information
            </h3>
          </div>

          <div className="divide-y divide-white/[0.07]">
            <MetadataRow label="Notification code" value={notificationCode} mono />
            <MetadataRow label="Created" value={formatDateTime(createdAt)} />
            <MetadataRow label="Last updated" value={formatDateTime(updatedAt)} />
            <MetadataRow
              label="Read at"
              value={readAt ? formatDateTime(readAt) : null}
            />
            <MetadataRow label="Recipient" value={recipientId} mono />
            <MetadataRow label="Document ID" value={id} mono />
          </div>
        </section>

        {/* Related records */}
        {hasRelatedRecords ? (
          <section className="border-t border-white/[0.08] bg-[#030d1b]/25 px-4 py-5 sm:px-5">
            <div className="mb-3 flex items-center gap-2">
              <FiExternalLink
                size={14}
                className="text-cyan-300"
                aria-hidden="true"
              />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.17em] text-slate-300">
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
                  disabled={actionsDisabled}
                />
              )}

              {collisionRiskId && (
                <ReferenceCard
                  label="Collision risk reference"
                  value={collisionRiskId}
                  Icon={FiActivity}
                  onOpen={onOpenRisk}
                  disabled={actionsDisabled}
                />
              )}
            </div>
          </section>
        ) : (
          <section className="border-t border-white/[0.08] bg-[#030d1b]/25 px-4 py-4 sm:px-5">
            <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.09] bg-[#071323]/85 p-3">
              <FiInfo
                size={15}
                className="mt-0.5 shrink-0 text-slate-400"
                aria-hidden="true"
              />
              <p className="text-xs leading-5 text-slate-300">
                No related alert or collision risk is linked to this notification.
              </p>
            </div>
          </section>
        )}
      </div>

      {/* Bottom context bar */}
      <div className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-t border-white/[0.08] bg-[#060F1D]/85 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-30" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
          </span>

          <span className="truncate text-[10px] uppercase tracking-[0.12em] text-slate-300">
            Record details
          </span>
        </div>

        <span className="shrink-0 text-[10px] text-slate-400">
          {formatRelativeTime(createdAt) || "Timestamp unavailable"}
        </span>
      </div>
    </aside>
  );
}

export default NotificationDetailPanel;
