import { useId } from "react";
import {
  FiActivity,
  FiBell,
  FiBarChart2,
  FiCheck,
  FiFileText,
  FiLayers,
  FiShield,
  FiTarget,
} from "react-icons/fi";

const REPORT_TYPES = [
  {
    value: "SATELLITE_ANALYSIS",
    label: "Satellite Analysis",
    description: "Review satellite records and orbital information.",
    icon: FiTarget,
    accent: "cyan",
  },
  {
    value: "DEBRIS_ANALYSIS",
    label: "Debris Analysis",
    description: "Inspect tracked orbital debris information.",
    icon: FiLayers,
    accent: "violet",
  },
  {
    value: "RISK_ASSESSMENT",
    label: "Risk Assessment",
    description: "Review collision and conjunction risk results.",
    icon: FiShield,
    accent: "amber",
  },
  {
    value: "DASHBOARD_ANALYTICS",
    label: "Dashboard Analytics",
    description: "Summarize available dashboard analytics.",
    icon: FiBarChart2,
    accent: "blue",
  },
  {
    value: "ALERT_SUMMARY",
    label: "Alert Summary",
    description: "Review alert records and their statuses.",
    icon: FiBell,
    accent: "rose",
  },
  {
    value: "AI_ANALYSIS",
    label: "AI Analysis",
    description: "Create a report for AI analysis results.",
    icon: FiActivity,
    accent: "emerald",
  },
];

const ACCENT_STYLES = {
  cyan: {
    icon: "bg-cyan-400/10 text-cyan-300 ring-cyan-400/20",
    selected:
      "border-cyan-400/70 bg-cyan-400/[0.07] shadow-[0_0_24px_rgba(34,211,238,0.06)]",
    indicator: "border-cyan-300 bg-cyan-300",
    check: "text-slate-950",
  },
  violet: {
    icon: "bg-violet-400/10 text-violet-300 ring-violet-400/20",
    selected: "border-violet-400/70 bg-violet-400/[0.07]",
    indicator: "border-violet-300 bg-violet-300",
    check: "text-slate-950",
  },
  amber: {
    icon: "bg-amber-400/10 text-amber-300 ring-amber-400/20",
    selected: "border-amber-400/70 bg-amber-400/[0.07]",
    indicator: "border-amber-300 bg-amber-300",
    check: "text-slate-950",
  },
  blue: {
    icon: "bg-blue-400/10 text-blue-300 ring-blue-400/20",
    selected: "border-blue-400/70 bg-blue-400/[0.07]",
    indicator: "border-blue-300 bg-blue-300",
    check: "text-slate-950",
  },
  rose: {
    icon: "bg-rose-400/10 text-rose-300 ring-rose-400/20",
    selected: "border-rose-400/70 bg-rose-400/[0.07]",
    indicator: "border-rose-300 bg-rose-300",
    check: "text-slate-950",
  },
  emerald: {
    icon: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20",
    selected: "border-emerald-400/70 bg-emerald-400/[0.07]",
    indicator: "border-emerald-300 bg-emerald-300",
    check: "text-slate-950",
  },
};

const GRID_COLUMNS = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
};

const FIELDSET_CLASS =
  "min-w-0";

const CARD_BASE_CLASS = [
  "group relative flex min-h-[142px] min-w-0 flex-col",
  "rounded-xl border p-4 transition-all duration-200",
  "focus-within:ring-2 focus-within:ring-cyan-400/70",
  "focus-within:ring-offset-2 focus-within:ring-offset-slate-950",
  "motion-reduce:transition-none",
].join(" ");

function ReportTypeSelector({
  value = "",
  onChange,
  disabled = false,
  error = "",
  required = false,
  columns = 3,
  className = "",
}) {
  const generatedId = useId();
  const errorId = `${generatedId}-error`;
  const legendId = `${generatedId}-legend`;
  const descriptionId = `${generatedId}-description`;

  const hasError = Boolean(error);
  const selectedType = REPORT_TYPES.find(
    (reportType) => reportType.value === value,
  );

  const safeColumns = GRID_COLUMNS[columns] || GRID_COLUMNS[3];

  const describedBy = [
    descriptionId,
    hasError ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <fieldset
      className={`${FIELDSET_CLASS} ${className}`.trim()}
      disabled={disabled}
      aria-labelledby={legendId}
      aria-describedby={describedBy}
      aria-invalid={hasError || undefined}
    >
      <legend
        id={legendId}
        className="mb-3 block text-sm font-semibold text-slate-100"
      >
        Report type
        {required && (
          <span
            className="ml-1 text-rose-400"
            aria-hidden="true"
          >
            *
          </span>
        )}
      </legend>

      <p
        id={descriptionId}
        className="mb-4 text-xs leading-5 text-slate-400"
      >
        Choose the report category you want to generate.
      </p>

      <div
        className={`grid gap-3 ${safeColumns}`}
        role="radiogroup"
        aria-labelledby={legendId}
        aria-describedby={hasError ? errorId : descriptionId}
      >
        {REPORT_TYPES.map((reportType) => {
          const Icon = reportType.icon;
          const isSelected = value === reportType.value;
          const styles = ACCENT_STYLES[reportType.accent];
          const optionId = `${generatedId}-${reportType.value}`;

          const cardClassName = [
            CARD_BASE_CLASS,
            disabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:border-slate-600 hover:bg-slate-800/70",
            isSelected
              ? styles.selected
              : "border-slate-800 bg-slate-900/60",
            hasError && !isSelected
              ? "border-rose-400/50"
              : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <label
              key={reportType.value}
              htmlFor={optionId}
              className={cardClassName}
            >
              <input
                id={optionId}
                type="radio"
                name={`${generatedId}-report-type`}
                value={reportType.value}
                checked={isSelected}
                onChange={() => onChange?.(reportType.value)}
                disabled={disabled}
                required={required}
                aria-invalid={hasError || undefined}
                aria-describedby={hasError ? errorId : descriptionId}
                className="peer sr-only"
              />

              <div className="mb-3 flex items-start justify-between gap-3">
                <span
                  className={[
                    "inline-flex h-10 w-10 shrink-0 items-center justify-center",
                    "rounded-lg ring-1 ring-inset",
                    styles.icon,
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <Icon size={19} strokeWidth={1.8} />
                </span>

                <span
                  className={[
                    "flex h-5 w-5 shrink-0 items-center justify-center",
                    "rounded-full border transition-colors",
                    "motion-reduce:transition-none",
                    isSelected
                      ? `${styles.indicator} border-transparent`
                      : "border-slate-600 bg-slate-950/50",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <FiCheck
                      size={12}
                      strokeWidth={3}
                      className={styles.check}
                    />
                  )}
                </span>
              </div>

              <span className="text-sm font-semibold leading-5 text-slate-100">
                {reportType.label}
              </span>

              <span className="mt-1.5 text-xs leading-5 text-slate-400">
                {reportType.description}
              </span>
            </label>
          );
        })}
      </div>

      {hasError && (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          className="mt-3 flex items-start gap-2 text-xs leading-5 text-rose-300"
        >
          <FiFileText
            className="mt-0.5 shrink-0"
            size={14}
            aria-hidden="true"
          />
          <span>{error}</span>
        </p>
      )}

      {selectedType && !hasError && (
        <p className="mt-3 text-xs text-slate-500">
          Selected:{" "}
          <span className="font-medium text-slate-300">
            {selectedType.label}
          </span>
        </p>
      )}
    </fieldset>
  );
}

export { REPORT_TYPES };
export default ReportTypeSelector;
