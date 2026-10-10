import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiLoader,
  FiMessageSquare,
  FiShield,
  FiX,
} from "react-icons/fi";

import AlertStatusBadge from "./AlertStatusBadge";

const STATUS_TRANSITIONS = {
  PENDING: {
    nextStatus: "ACKNOWLEDGED",
    label: "Acknowledge alert",
    description: "Confirm that an operator has reviewed this alert.",
    buttonLabel: "Acknowledge",
    icon: FiShield,
    buttonClass:
      "border-cyan-300/20 bg-cyan-300/[0.09] text-cyan-100 hover:bg-cyan-300/[0.15]",
  },

  ACKNOWLEDGED: {
    nextStatus: "RESOLVED",
    label: "Resolve alert",
    description: "Mark this alert as addressed after reviewing the incident.",
    buttonLabel: "Mark resolved",
    icon: FiCheckCircle,
    buttonClass:
      "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-200 hover:bg-emerald-300/[0.14]",
  },

  RESOLVED: {
    nextStatus: "CLOSED",
    label: "Close alert",
    description: "Complete the workflow and close this alert.",
    buttonLabel: "Close alert",
    icon: FiShield,
    buttonClass:
      "border-slate-300/15 bg-white/[0.05] text-slate-200 hover:bg-white/[0.09]",
  },
};

const TERMINAL_STATUSES = new Set(["CLOSED"]);

const MAX_REMARKS_LENGTH = 1000;

function normalizeStatus(status) {
  return typeof status === "string"
    ? status.trim().toUpperCase()
    : "";
}

/**
 * OrbitGuard AI — Alert Status Actions
 *
 * This component provides UI for the existing backend workflow.
 * It does not make API requests directly.
 *
 * Expected parent callback:
 * onStatusChange(nextStatus, remarks)
 *
 * The parent is responsible for calling the backend and reporting
 * success or failure through the returned promise.
 *
 * @param {Object} props
 * @param {Object|null} props.alert Selected alert.
 * @param {Function} props.onStatusChange Status update callback.
 * @param {boolean} [props.isUpdating=false] External API loading state.
 * @param {string|null} [props.error=null] API error message.
 * @param {Function} [props.onCancel] Optional close/cancel callback.
 * @param {boolean} [props.requireRemarks=false] Require remarks before submission.
 */
export default function AlertStatusActions({
  alert,
  onStatusChange,
  isUpdating = false,
  error = null,
  onCancel,
  requireRemarks = false,
}) {
  const shouldReduceMotion = useReducedMotion();

  const [remarks, setRemarks] = useState("");
  const [validationError, setValidationError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const alertId = alert?.id ?? alert?._id ?? null;
  const currentStatus = normalizeStatus(alert?.status);

  const transition = STATUS_TRANSITIONS[currentStatus] ?? null;
  const isTerminal = TERMINAL_STATUSES.has(currentStatus);
  const isBusy = isUpdating || isSubmitting;

  useEffect(() => {
    setRemarks("");
    setValidationError("");
    setSubmitError("");
    setIsSubmitting(false);
  }, [alertId, currentStatus]);

  const handleRemarksChange = (event) => {
    const value = event.target.value;

    if (value.length > MAX_REMARKS_LENGTH) return;

    setRemarks(value);
    setValidationError("");
    setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isBusy || !transition || typeof onStatusChange !== "function") {
      return;
    }

    const normalizedRemarks = remarks.trim();

    if (requireRemarks && !normalizedRemarks) {
      setValidationError("Please enter remarks before continuing.");
      return;
    }

    if (normalizedRemarks.length > MAX_REMARKS_LENGTH) {
      setValidationError(
        `Remarks cannot exceed ${MAX_REMARKS_LENGTH} characters.`
      );
      return;
    }

    setValidationError("");
    setSubmitError("");
    setIsSubmitting(true);

    try {
      // The parent callback should resolve only after the backend
      // confirms the status transition.
      await onStatusChange(
        transition.nextStatus,
        normalizedRemarks
      );

      setRemarks("");
    } catch (submitException) {
      setSubmitError(
        typeof submitException?.message === "string" &&
          submitException.message.trim()
          ? submitException.message
          : "The status update failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!alert) {
    return null;
  }

  if (!transition) {
    return (
      <section
        aria-label="Alert workflow"
        className="rounded-xl border border-white/[0.07] bg-[#07111f] p-4 sm:p-5"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400">
            {isTerminal ? (
              <FiCheckCircle aria-hidden="true" className="h-4 w-4" />
            ) : (
              <FiAlertCircle aria-hidden="true" className="h-4 w-4" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-200">
              {isTerminal ? "Workflow complete" : "Status transition unavailable"}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {isTerminal
                ? "This alert is closed. No further status transitions are available."
                : "This alert has an unrecognized status. Check the alert record before making changes."}
            </p>

            <div className="mt-3">
              <AlertStatusBadge status={alert.status} size="md" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const ActionIcon = transition.icon;
  const displayedError = submitError || error;

  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
      aria-labelledby="alert-status-actions-heading"
      className="rounded-xl border border-white/[0.08] bg-[#07111f] p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-200">
          <FiClock aria-hidden="true" className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h3
            id="alert-status-actions-heading"
            className="text-sm font-semibold text-slate-100"
          >
            Manage alert workflow
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Advance the alert to the next permitted status.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Current
        </span>

        <AlertStatusBadge status={alert.status} />

        <FiArrowRight
          aria-hidden="true"
          className="h-3.5 w-3.5 text-slate-600"
        />

        <AlertStatusBadge status={transition.nextStatus} />
      </div>

      <div className="mt-4 rounded-lg border border-white/[0.06] bg-[#020914]/50 p-3">
        <p className="text-xs font-semibold text-slate-200">
          {transition.label}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {transition.description}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="alert-operator-remarks"
            className="flex items-center gap-2 text-xs font-semibold text-slate-300"
          >
            <FiMessageSquare
              aria-hidden="true"
              className="h-3.5 w-3.5 text-slate-500"
            />
            Operator remarks
          </label>

          <span className="text-[10px] tabular-nums text-slate-600">
            {remarks.length}/{MAX_REMARKS_LENGTH}
          </span>
        </div>

        <textarea
          id="alert-operator-remarks"
          value={remarks}
          onChange={handleRemarksChange}
          placeholder="Record your findings or actions taken..."
          rows={3}
          maxLength={MAX_REMARKS_LENGTH}
          disabled={isBusy}
          aria-invalid={Boolean(validationError)}
          aria-describedby={
            validationError
              ? "alert-remarks-error"
              : "alert-remarks-help"
          }
          className="mt-2 min-h-24 w-full resize-y rounded-lg border border-white/[0.09] bg-[#020914]/70 px-3 py-2.5 text-sm leading-5 text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-300/35 focus:ring-2 focus:ring-cyan-300/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
        />

        {validationError ? (
          <p
            id="alert-remarks-error"
            role="alert"
            className="mt-1.5 text-xs text-rose-300"
          >
            {validationError}
          </p>
        ) : (
          <p
            id="alert-remarks-help"
            className="mt-1.5 text-[10px] leading-4 text-slate-600"
          >
            {requireRemarks
              ? "Remarks are required for this action."
              : "Optional. Your remarks will be submitted with the status update."}
          </p>
        )}

        {displayedError && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-lg border border-rose-400/15 bg-rose-400/[0.05] p-3 text-xs leading-5 text-rose-200"
          >
            <FiAlertCircle
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0"
            />

            <span className="break-words">{displayedError}</span>
          </div>
        )}

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {typeof onCancel === "function" && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isBusy}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/[0.09] px-4 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiX aria-hidden="true" className="h-3.5 w-3.5" />
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={
              isBusy ||
              typeof onStatusChange !== "function"
            }
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-50 ${transition.buttonClass}`}
          >
            {isBusy ? (
              <>
                <FiLoader
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin"
                />
                Updating status...
              </>
            ) : (
              <>
                <ActionIcon aria-hidden="true" className="h-4 w-4" />
                {transition.buttonLabel}
                <FiArrowRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.section>
  );
}
