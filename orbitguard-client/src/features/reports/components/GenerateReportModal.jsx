import { useEffect, useId, useRef, useState } from "react";
import {
  FiX,
  FiFileText,
  FiSatellite,
  FiGitBranch,
  FiShield,
  FiBarChart2,
  FiBell,
  FiCpu,
  FiArrowRight,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";

/* ================================================================
   REPORT TYPES
   Must match the existing backend ReportType enum.
   ================================================================ */

const REPORT_TYPES = [
  {
    value: "SATELLITE_ANALYSIS",
    label: "Satellite Analysis",
    description: "Orbital assets and satellite intelligence",
    icon: FiSatellite,
  },
  {
    value: "DEBRIS_ANALYSIS",
    label: "Debris Analysis",
    description: "Space debris and tracked objects",
    icon: FiGitBranch,
  },
  {
    value: "RISK_ASSESSMENT",
    label: "Risk Assessment",
    description: "Collision and conjunction risk",
    icon: FiShield,
  },
  {
    value: "DASHBOARD_ANALYTICS",
    label: "Dashboard Analytics",
    description: "Operational metrics and summaries",
    icon: FiBarChart2,
  },
  {
    value: "ALERT_SUMMARY",
    label: "Alert Summary",
    description: "Space monitoring alert overview",
    icon: FiBell,
  },
  {
    value: "AI_ANALYSIS",
    label: "AI Analysis",
    description: "AI-assisted space intelligence",
    icon: FiCpu,
  },
];

const TITLE_MIN_LENGTH = 3;
const TITLE_MAX_LENGTH = 150;
const DESCRIPTION_MAX_LENGTH = 500;

/* ================================================================
   HELPERS
   ================================================================ */

function validateForm({ reportType, title, description }) {
  const errors = {};

  if (!reportType) {
    errors.reportType = "Select a report type.";
  } else if (!REPORT_TYPES.some((type) => type.value === reportType)) {
    errors.reportType = "Select a valid report type.";
  }

  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    errors.title = "Report title is required.";
  } else if (trimmedTitle.length < TITLE_MIN_LENGTH) {
    errors.title = `Enter at least ${TITLE_MIN_LENGTH} characters.`;
  } else if (trimmedTitle.length > TITLE_MAX_LENGTH) {
    errors.title = `Use no more than ${TITLE_MAX_LENGTH} characters.`;
  }

  if (description.length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `Use no more than ${DESCRIPTION_MAX_LENGTH} characters.`;
  }

  return errors;
}

/* ================================================================
   REPORT TYPE CARD
   ================================================================ */

function ReportTypeCard({
  type,
  selected,
  onSelect,
  disabled,
  groupName,
}) {
  const Icon = type.icon;

  return (
    <label
      className={`
        relative flex min-w-0 cursor-pointer items-start gap-3
        rounded-xl border p-3 transition-all duration-200
        ${
          selected
            ? "border-cyan-300/60 bg-cyan-400/[0.09] shadow-[0_0_20px_rgba(34,211,238,0.06)]"
            : "border-white/[0.08] bg-white/[0.015] hover:border-white/20 hover:bg-white/[0.035]"
        }
        ${disabled ? "cursor-not-allowed opacity-60" : ""}
      `}
    >
      <input
        type="radio"
        name={groupName}
        value={type.value}
        checked={selected}
        disabled={disabled}
        onChange={() => onSelect(type.value)}
        className="peer sr-only"
      />

      <span
        className={`
          flex h-10 w-10 shrink-0 items-center justify-center
          rounded-xl border transition-colors
          ${
            selected
              ? "border-cyan-300/25 bg-cyan-400/10 text-cyan-200"
              : "border-white/[0.07] bg-[#0B1726] text-slate-400"
          }
        `}
      >
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-5 text-slate-100">
          {type.label}
        </span>

        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {type.description}
        </span>
      </span>

      <span
        aria-hidden="true"
        className={`
          mt-1 flex h-4 w-4 shrink-0 items-center justify-center
          rounded-full border
          ${
            selected
              ? "border-cyan-300 bg-cyan-300"
              : "border-slate-600 bg-transparent"
          }
        `}
      >
        {selected && (
          <span className="h-1.5 w-1.5 rounded-full bg-[#04111D]" />
        )}
      </span>
    </label>
  );
}

/* ================================================================
   GENERATE REPORT MODAL
   ================================================================ */

/**
 * Props:
 * open: boolean
 * onClose: () => void
 * onSubmit: (payload) => Promise<void> | void
 * submitting: boolean
 * error: string | null
 *
 * The parent handles the API request and reports success/errors.
 */
function GenerateReportModal({
  open,
  onClose,
  onSubmit,
  submitting = false,
  error = null,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogTitleId = useId();
  const dialogDescriptionId = useId();
  const firstTypeRef = useRef(null);

  const [reportType, setReportType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  /* ==============================================================
     RESET FORM WHEN OPENING
     ============================================================== */

  useEffect(() => {
    if (!open) return;

    setReportType("");
    setTitle("");
    setDescription("");
    setErrors({});
    setSubmitAttempted(false);
  }, [open]);

  /* ==============================================================
     MODAL KEYBOARD BEHAVIOR
     ============================================================== */

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = requestAnimationFrame(() => {
      firstTypeRef.current?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, submitting, onClose]);

  if (!open) return null;

  /* ==============================================================
     FIELD VALIDATION
     ============================================================== */

  const validateCurrentForm = () => {
    const nextErrors = validateForm({
      reportType,
      title,
      description,
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitAttempted(true);

    if (submitting) return;
    if (!validateCurrentForm()) return;

    const payload = {
      reportType,
      title: title.trim(),
      description: description.trim(),
    };

    /*
     * Matches ReportGenerationRequest:
     * reportType: required enum
     * title: required string
     * description: optional string
     *
     * The parent owns the actual API request.
     */
    await onSubmit?.(payload);
  };

  const handleClose = () => {
    if (submitting) return;
    onClose?.();
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const updateField = (field, value) => {
    if (field === "reportType") setReportType(value);
    if (field === "title") setTitle(value);
    if (field === "description") setDescription(value);

    if (submitAttempted) {
      const nextValues = {
        reportType: field === "reportType" ? value : reportType,
        title: field === "title" ? value : title,
        description:
          field === "description" ? value : description,
      };

      setErrors(validateForm(nextValues));
    } else if (errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: undefined,
      }));
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        overflow-y-auto overscroll-contain
        bg-[#020611]/80 p-3 backdrop-blur-md
        sm:p-5
      "
      onMouseDown={handleBackdropClick}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescriptionId}
        className="
          relative my-auto flex max-h-[calc(100dvh-24px)]
          w-full max-w-3xl flex-col overflow-hidden
          rounded-2xl border border-cyan-300/15
          bg-[#07111F]
          shadow-[0_24px_100px_rgba(0,0,0,0.65)]
          sm:max-h-[calc(100dvh-40px)] sm:rounded-3xl
        "
      >
        {/* ======================================================
            MODAL HEADER
            ====================================================== */}

        <header className="relative shrink-0 border-b border-white/[0.07] px-4 py-4 sm:px-7 sm:py-5">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent"
          />

          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/[0.08]">
              <FiFileText
                aria-hidden="true"
                className="h-5 w-5 text-cyan-200"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                ORBITGUARD AI / REPORT CENTER
              </p>

              <h2
                id={dialogTitleId}
                className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-xl"
              >
                Generate new report
              </h2>

              <p
                id={dialogDescriptionId}
                className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm"
              >
                Configure a report and add it to your intelligence archive.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              aria-label="Close generate report dialog"
              className="
                flex h-9 w-9 shrink-0 items-center justify-center
                rounded-xl border border-white/[0.08]
                text-slate-400 transition-colors
                hover:border-white/20 hover:bg-white/[0.05]
                hover:text-white disabled:opacity-40
              "
            >
              <FiX aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* ======================================================
            FORM BODY
            ====================================================== */}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-5 sm:px-7 sm:py-6">
            {/* Report type */}
            <fieldset>
              <legend className="text-sm font-semibold text-slate-100">
                01. Choose report type
                <span className="ml-1 text-red-300">*</span>
              </legend>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Select the type of space intelligence report you need.
              </p>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {REPORT_TYPES.map((type, index) => (
                  <div key={type.value}>
                    <ReportTypeCard
                      type={type}
                      selected={reportType === type.value}
                      onSelect={(value) =>
                        updateField("reportType", value)
                      }
                      disabled={submitting}
                      groupName={dialogTitleId}
                    />

                    {index === 0 && (
                      <span
                        ref={firstTypeRef}
                        tabIndex={-1}
                        className="sr-only"
                      >
                        Report type selection
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {errors.reportType && (
                <p className="mt-2 flex items-center gap-2 text-xs text-red-300">
                  <FiAlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
                  {errors.reportType}
                </p>
              )}
            </fieldset>

            {/* Title */}
            <div>
              <label
                htmlFor={titleId}
                className="text-sm font-semibold text-slate-100"
              >
                02. Report title
                <span className="ml-1 text-red-300">*</span>
              </label>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Give this report a clear, identifiable name.
              </p>

              <input
                id={titleId}
                type="text"
                value={title}
                maxLength={TITLE_MAX_LENGTH}
                disabled={submitting}
                onChange={(event) =>
                  updateField("title", event.target.value)
                }
                placeholder="e.g. Weekly Orbital Risk Assessment"
                aria-invalid={Boolean(errors.title)}
                aria-describedby={
                  errors.title ? `${titleId}-error` : `${titleId}-hint`
                }
                className={`
                  mt-3 h-12 w-full rounded-xl border
                  bg-[#040C17] px-4 text-sm text-white
                  outline-none placeholder:text-slate-600
                  transition-colors
                  focus:border-cyan-300/60
                  focus:ring-2 focus:ring-cyan-300/10
                  disabled:cursor-not-allowed disabled:opacity-60
                  ${
                    errors.title
                      ? "border-red-400/60"
                      : "border-white/[0.09] hover:border-white/15"
                  }
                `}
              />

              <div className="mt-2 flex items-start justify-between gap-3">
                {errors.title ? (
                  <p
                    id={`${titleId}-error`}
                    className="text-xs text-red-300"
                  >
                    {errors.title}
                  </p>
                ) : (
                  <p id={`${titleId}-hint`} className="text-xs text-slate-500">
                    {TITLE_MIN_LENGTH}–{TITLE_MAX_LENGTH} characters
                  </p>
                )}

                <span className="shrink-0 text-[11px] tabular-nums text-slate-600">
                  {title.length}/{TITLE_MAX_LENGTH}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor={descriptionId}
                className="text-sm font-semibold text-slate-100"
              >
                03. Description
                <span className="ml-2 text-xs font-normal text-slate-500">
                  Optional
                </span>
              </label>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Add context to help identify the purpose of this report.
              </p>

              <textarea
                id={descriptionId}
                value={description}
                maxLength={DESCRIPTION_MAX_LENGTH}
                rows={3}
                disabled={submitting}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Describe the scope or objective of this report..."
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description
                    ? `${descriptionId}-error`
                    : `${descriptionId}-hint`
                }
                className={`
                  mt-3 min-h-[100px] w-full resize-y rounded-xl
                  border bg-[#040C17] px-4 py-3
                  text-sm leading-6 text-white outline-none
                  placeholder:text-slate-600
                  transition-colors
                  focus:border-cyan-300/60
                  focus:ring-2 focus:ring-cyan-300/10
                  disabled:cursor-not-allowed disabled:opacity-60
                  ${
                    errors.description
                      ? "border-red-400/60"
                      : "border-white/[0.09] hover:border-white/15"
                  }
                `}
              />

              <div className="mt-2 flex items-start justify-between gap-3">
                {errors.description ? (
                  <p
                    id={`${descriptionId}-error`}
                    className="text-xs text-red-300"
                  >
                    {errors.description}
                  </p>
                ) : (
                  <p
                    id={`${descriptionId}-hint`}
                    className="text-xs text-slate-500"
                  >
                    Additional context for your archive
                  </p>
                )}

                <span className="shrink-0 text-[11px] tabular-nums text-slate-600">
                  {description.length}/{DESCRIPTION_MAX_LENGTH}
                </span>
              </div>
            </div>

            {/* API error */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-3.5"
              >
                <FiAlertCircle
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-300"
                />

                <div className="min-w-0">
                  <p className="text-sm font-medium text-red-200">
                    Report generation request failed
                  </p>
                  <p className="mt-1 break-words text-xs leading-5 text-red-200/70">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Informational note */}
            <div className="flex items-start gap-3 rounded-xl border border-cyan-300/10 bg-cyan-400/[0.035] p-3.5">
              <FiCheckCircle
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300/80"
              />

              <p className="text-xs leading-5 text-slate-400">
                Your report will be registered in the archive. Its initial
                status is managed by the backend; creating a report does not
                by itself guarantee that its full analysis or PDF is ready.
              </p>
            </div>
          </div>

          {/* ====================================================
              MODAL FOOTER
              ==================================================== */}

          <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-white/[0.07] bg-[#060E19] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p className="hidden items-center gap-2 text-[11px] text-slate-500 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
              Fields marked * are required
            </p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="
                  inline-flex min-h-11 items-center justify-center
                  rounded-xl border border-white/10
                  px-5 py-2.5 text-sm font-medium text-slate-300
                  transition-colors hover:bg-white/[0.04]
                  hover:text-white disabled:opacity-40
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="
                  inline-flex min-h-11 items-center justify-center
                  gap-2 rounded-xl bg-gradient-to-r
                  from-cyan-400 to-sky-400 px-5 py-2.5
                  text-sm font-semibold text-[#04111D]
                  shadow-[0_4px_20px_rgba(34,211,238,0.12)]
                  transition-all hover:from-cyan-300
                  hover:to-sky-300
                  focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-cyan-300
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-[#07111F]
                  disabled:cursor-not-allowed disabled:opacity-60
                "
              >
                {submitting ? (
                  <>
                    <FiLoader
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin"
                    />
                    Creating report...
                  </>
                ) : (
                  <>
                    Generate report
                    <FiArrowRight aria-hidden="true" className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default GenerateReportModal;
