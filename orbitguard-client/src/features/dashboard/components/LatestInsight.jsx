import { motion } from "framer-motion";
import {
  FiArrowUpRight,
  FiCpu,
  FiCrosshair,
  FiRadio,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI — Latest Insight
 * ================================================================
 *
 * Presentation-only dashboard component.
 *
 * BACKEND CONTRACT
 * ----------------------------------------------------------------
 * DashboardResponse now provides:
 *
 * data.latestInsight
 *
 * Example:
 *
 * {
 *   type: "RISK_ASSESSMENT",
 *   title: "Latest Collision Risk Assessment",
 *   message: "Latest collision-risk assessment is LOW with status ANALYZED.",
 *   riskLevel: "LOW",
 *   status: "ANALYZED",
 *   assessedAt: null
 * }
 *
 * BACKEND IS THE SINGLE SOURCE OF TRUTH.
 *
 * This component:
 * - Reads latestInsight directly from backend data
 * - Does not calculate risk
 * - Does not generate insight text
 * - Does not infer severity
 * - Does not call another API
 * - Does not create fallback production data
 *
 * ================================================================
 */

const LatestInsight = ({
  data = null,
  loading = false,
  onViewDetails,
}) => {
  /**
   * --------------------------------------------------------------
   * BACKEND LATEST INSIGHT
   * --------------------------------------------------------------
   *
   * The dashboard service already unwraps:
   *
   * ApiResponse.data
   *
   * Therefore `data` here is DashboardResponse directly.
   *
   * We can safely consume:
   *
   * data.latestInsight
   */

  const insight = data?.latestInsight ?? null;

  /**
   * --------------------------------------------------------------
   * INSIGHT AVAILABILITY
   * --------------------------------------------------------------
   */

  const hasInsight =
    Boolean(
      insight &&
      typeof insight === "object",
    );

  /**
   * --------------------------------------------------------------
   * NORMALIZED DISPLAY VALUES
   * --------------------------------------------------------------
   *
   * These are NOT calculated values.
   *
   * They are only safe presentation fallbacks for missing optional
   * backend fields.
   */

  const insightType =
    typeof insight?.type === "string"
      ? insight.type
      : null;

  const title =
    typeof insight?.title === "string" &&
    insight.title.trim()
      ? insight.title
      : "Latest Intelligence";

  const message =
    typeof insight?.message === "string" &&
    insight.message.trim()
      ? insight.message
      : null;

  const riskLevel =
    typeof insight?.riskLevel === "string"
      ? insight.riskLevel
      : null;

  const status =
    typeof insight?.status === "string"
      ? insight.status
      : null;

  const assessedAt =
    typeof insight?.assessedAt === "string" &&
    insight.assessedAt.trim()
      ? insight.assessedAt
      : null;


  /**
   * --------------------------------------------------------------
   * DISPLAY HELPERS
   * --------------------------------------------------------------
   */

  const formatLabel = (value) => {
    if (!value) {
      return null;
    }

    return value
      .replaceAll("_", " ")
      .trim();
  };


  /**
   * --------------------------------------------------------------
   * ASSESSED TIME
   * --------------------------------------------------------------
   *
   * Backend currently returns null for assessedAt in the provided
   * response.
   *
   * Therefore we do NOT invent a timestamp.
   */

  const formattedAssessedAt =
    assessedAt
      ? formatAssessedAt(assessedAt)
      : null;


  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
        ease: "easeOut",
      }}
      aria-labelledby="latest-insight-title"
      className="
        relative
        h-full
        min-h-[300px]
        overflow-hidden
        border
        border-white/[0.08]
        bg-[#06101c]/90
        backdrop-blur-md
      "
    >

      {/* =========================================================
          BACKGROUND TECHNICAL VISUAL
          ========================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-y-0
          right-0
          w-[48%]
          opacity-50
        "
        aria-hidden="true"
      >
        <OrbitalVisual />
      </div>


      {/* =========================================================
          TOP TECHNICAL ACCENT
          ========================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          left-0
          top-0
          h-px
          w-36
          bg-gradient-to-r
          from-cyan-300/70
          to-transparent
        "
        aria-hidden="true"
      />


      {/* =========================================================
          HEADER
          ========================================================= */}

      <div
        className="
          relative
          z-10
          flex
          items-start
          justify-between
          gap-4
          border-b
          border-white/[0.055]
          px-4
          py-4
          sm:px-5
          sm:py-5
        "
      >

        <div className="flex min-w-0 items-center gap-3">

          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              border
              border-cyan-300/15
              bg-cyan-400/[0.05]
            "
          >
            <FiCpu
              className="h-3.5 w-3.5 text-cyan-300"
              aria-hidden="true"
            />
          </div>


          <div className="min-w-0">

            <div className="flex items-center gap-2">

              <h2
                id="latest-insight-title"
                className="
                  font-['Orbitron']
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-slate-200
                  sm:text-[11px]
                "
              >
                Latest Insight
              </h2>


              <span
                className="
                  hidden
                  font-['Orbitron']
                  text-[7px]
                  uppercase
                  tracking-[0.15em]
                  text-slate-600
                  sm:inline
                "
              >
                Intelligence
              </span>

            </div>


            <p
              className="
                mt-1.5
                font-['Inter']
                text-[10px]
                leading-4
                text-slate-500
                sm:text-[11px]
              "
            >
              Latest orbital intelligence from the connected backend.
            </p>

          </div>

        </div>


        {/* Feed indicator */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-1.5
          "
        >

          <span
            className={`
              h-1.5
              w-1.5
              rounded-full
              ${
                loading
                  ? "bg-amber-300 shadow-[0_0_7px_rgba(252,211,77,0.55)]"
                  : hasInsight
                    ? "bg-cyan-300 shadow-[0_0_7px_rgba(103,232,249,0.65)]"
                    : "bg-slate-600"
              }
            `}
            aria-hidden="true"
          />


          <span
            className="
              font-['Orbitron']
              text-[7px]
              uppercase
              tracking-[0.13em]
              text-slate-600
            "
          >
            {loading
              ? "Sync"
              : hasInsight
                ? "Live"
                : "Feed"}
          </span>

        </div>

      </div>


      {/* =========================================================
          CONTENT
          ========================================================= */}

      <div
        className="
          relative
          z-10
          flex
          min-h-[220px]
          flex-col
          justify-between
          px-4
          py-5
          sm:px-5
          sm:py-6
        "
      >

        {loading ? (
          <InsightLoadingState />
        ) : hasInsight ? (
          <InsightContent
            insightType={insightType}
            title={title}
            message={message}
            riskLevel={riskLevel}
            status={status}
            formattedAssessedAt={formattedAssessedAt}
            onViewDetails={onViewDetails}
          />
        ) : (
          <InsightUnavailableState />
        )}

      </div>


      {/* =========================================================
          FOOTER
          ========================================================= */}

      <div
        className="
          relative
          z-10
          flex
          min-h-[48px]
          items-center
          justify-between
          gap-3
          border-t
          border-white/[0.045]
          px-4
          py-3
          sm:px-5
        "
      >

        <div
          className="
            flex
            min-w-0
            items-center
            gap-2
          "
        >

          <FiRadio
            className="h-3 w-3 shrink-0 text-slate-600"
            aria-hidden="true"
          />

          <span
            className="
              truncate
              font-['Inter']
              text-[9px]
              text-slate-600
            "
          >
            Dashboard intelligence feed
          </span>

        </div>


        <span
          className="
            shrink-0
            font-['Orbitron']
            text-[7px]
            uppercase
            tracking-[0.12em]
            text-slate-600
          "
        >
          OG / INTEL
        </span>

      </div>

    </motion.section>
  );
};


/**
 * ================================================================
 * INSIGHT CONTENT
 * ================================================================
 */

const InsightContent = ({
  insightType,
  title,
  message,
  riskLevel,
  status,
  formattedAssessedAt,
  onViewDetails,
}) => (
  <div
    className="
      flex
      min-h-[205px]
      flex-col
      justify-center
      sm:max-w-[540px]
    "
  >

    {/* =========================================================
        TYPE
        ========================================================= */}

    {insightType && (
      <div
        className="
          flex
          items-center
          gap-2
          font-['Orbitron']
          text-[7px]
          uppercase
          tracking-[0.15em]
          text-cyan-300/60
        "
      >

        <span
          className="
            h-1
            w-1
            rounded-full
            bg-cyan-300
          "
          aria-hidden="true"
        />

        {formatLabel(insightType)}

      </div>
    )}


    {/* =========================================================
        TITLE
        ========================================================= */}

    <h3
      className="
        mt-3
        max-w-[500px]
        font-['Orbitron']
        text-sm
        font-semibold
        uppercase
        leading-6
        tracking-[0.08em]
        text-slate-200
        sm:text-base
      "
    >
      {title}
    </h3>


    {/* =========================================================
        MESSAGE
        ========================================================= */}

    {message && (
      <p
        className="
          mt-3
          max-w-[520px]
          font-['Inter']
          text-xs
          leading-6
          text-slate-400
          sm:text-[13px]
        "
      >
        {message}
      </p>
    )}


    {/* =========================================================
        TELEMETRY
        ========================================================= */}

    {(riskLevel || status || formattedAssessedAt) && (
      <div
        className="
          mt-5
          flex
          flex-wrap
          items-center
          gap-x-5
          gap-y-2
        "
      >

        {riskLevel && (
          <InsightMeta
            label="Risk"
            value={riskLevel}
            emphasis={getRiskTone(riskLevel)}
          />
        )}


        {status && (
          <InsightMeta
            label="Status"
            value={status}
          />
        )}


        {formattedAssessedAt && (
          <InsightMeta
            label="Assessed"
            value={formattedAssessedAt}
          />
        )}

      </div>
    )}


    {/* =========================================================
        DETAILS ACTION
        ========================================================= */}

    {typeof onViewDetails === "function" && (
      <button
        type="button"
        onClick={onViewDetails}
        className="
          mt-6
          inline-flex
          w-fit
          items-center
          gap-2
          border
          border-cyan-300/15
          bg-cyan-400/[0.035]
          px-3
          py-2
          font-['Orbitron']
          text-[7px]
          uppercase
          tracking-[0.12em]
          text-cyan-300/70
          transition
          duration-200
          hover:border-cyan-300/30
          hover:bg-cyan-400/[0.07]
          hover:text-cyan-200
          focus:outline-none
          focus:ring-1
          focus:ring-cyan-300/30
        "
      >
        View Details

        <FiArrowUpRight
          className="h-3 w-3"
          aria-hidden="true"
        />
      </button>
    )}

  </div>
);


/**
 * ================================================================
 * INSIGHT META
 * ================================================================
 */

const InsightMeta = ({
  label,
  value,
  emphasis = "default",
}) => (
  <div className="flex flex-col gap-1">

    <span
      className="
        font-['Orbitron']
        text-[6px]
        uppercase
        tracking-[0.14em]
        text-slate-600
      "
    >
      {label}
    </span>

    <span
      className={`
        font-['Orbitron']
        text-[8px]
        font-medium
        uppercase
        tracking-[0.1em]
        ${emphasis}
      `}
    >
      {formatLabel(value)}
    </span>

  </div>
);


/**
 * ================================================================
 * RISK DISPLAY TONE
 * ================================================================
 *
 * This is presentation styling only.
 *
 * It does NOT determine or modify the backend risk level.
 * ================================================================
 */

const getRiskTone = (riskLevel) => {
  switch (riskLevel?.toUpperCase()) {
    case "CRITICAL":
      return "text-red-300";

    case "HIGH":
      return "text-orange-300";

    case "MEDIUM":
      return "text-amber-300";

    case "LOW":
      return "text-emerald-300";

    default:
      return "text-slate-300";
  }
};


/**
 * ================================================================
 * FORMAT LABEL
 * ================================================================
 */

const formatLabel = (value) => {
  if (!value) {
    return "";
  }

  return value
    .replaceAll("_", " ")
    .trim();
};


/**
 * ================================================================
 * FORMAT ASSESSED AT
 * ================================================================
 *
 * Backend currently returns:
 *
 * assessedAt: null
 *
 * Therefore this function is only used when the backend eventually
 * supplies a timestamp.
 * ================================================================
 */

const formatAssessedAt = (value) => {
  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
      },
    ).format(date);
  } catch {
    return value;
  }
};


/**
 * ================================================================
 * UNAVAILABLE STATE
 * ================================================================
 */

const InsightUnavailableState = () => (
  <div
    className="
      flex
      min-h-[205px]
      flex-col
      justify-center
      sm:max-w-[470px]
    "
  >

    <div
      className="
        flex
        h-10
        w-10
        items-center
        justify-center
        border
        border-cyan-300/10
        bg-cyan-400/[0.035]
      "
    >
      <FiCrosshair
        className="h-4 w-4 text-cyan-300/40"
        aria-hidden="true"
      />
    </div>


    <h3
      className="
        mt-4
        font-['Orbitron']
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.16em]
        text-slate-500
      "
    >
      Intelligence Feed Unavailable
    </h3>


    <p
      className="
        mt-2
        max-w-[420px]
        font-['Inter']
        text-[10px]
        leading-5
        text-slate-600
      "
    >
      No latest orbital intelligence insight is currently
      available from the dashboard backend.
    </p>


    <div
      className="
        mt-5
        flex
        items-center
        gap-2
        font-['Orbitron']
        text-[7px]
        uppercase
        tracking-[0.12em]
        text-slate-700
      "
    >

      <span
        className="
          h-1.5
          w-1.5
          rounded-full
          bg-slate-700
        "
        aria-hidden="true"
      />

      Awaiting backend intelligence data

    </div>

  </div>
);


/**
 * ================================================================
 * LOADING STATE
 * ================================================================
 */

const InsightLoadingState = () => (
  <div
    className="animate-pulse"
    aria-label="Loading latest intelligence"
    role="status"
  >

    <div className="h-3 w-24 bg-white/[0.04]" />

    <div
      className="
        mt-4
        h-6
        max-w-[470px]
        bg-white/[0.045]
      "
    />

    <div
      className="
        mt-2
        h-6
        w-[70%]
        bg-white/[0.03]
      "
    />

    <div
      className="
        mt-5
        h-3
        max-w-[520px]
        bg-white/[0.025]
      "
    />

    <div
      className="
        mt-2
        h-3
        max-w-[420px]
        bg-white/[0.025]
      "
    />

    <div
      className="
        mt-6
        h-9
        w-28
        bg-white/[0.035]
      "
    />

  </div>
);


/**
 * ================================================================
 * ORBITAL VISUAL
 * ================================================================
 */

const OrbitalVisual = () => (
  <svg
    viewBox="0 0 420 300"
    className="h-full w-full"
    fill="none"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >

    <ellipse
      cx="255"
      cy="150"
      rx="150"
      ry="76"
      stroke="rgba(34,211,238,0.08)"
      strokeWidth="1"
    />

    <ellipse
      cx="255"
      cy="150"
      rx="135"
      ry="52"
      transform="rotate(-28 255 150)"
      stroke="rgba(103,232,249,0.09)"
      strokeWidth="1"
    />

    <ellipse
      cx="255"
      cy="150"
      rx="105"
      ry="36"
      transform="rotate(32 255 150)"
      stroke="rgba(59,130,246,0.07)"
      strokeWidth="1"
    />

    <circle
      cx="255"
      cy="150"
      r="36"
      fill="rgba(14,116,144,0.055)"
      stroke="rgba(34,211,238,0.15)"
      strokeWidth="1"
    />

    <circle
      cx="255"
      cy="150"
      r="24"
      fill="rgba(34,211,238,0.025)"
      stroke="rgba(103,232,249,0.08)"
      strokeWidth="1"
    />

    <path
      d="M255 103V117M255 183V197M208 150H222M288 150H302"
      stroke="rgba(103,232,249,0.18)"
      strokeWidth="1"
    />

    <circle
      cx="380"
      cy="126"
      r="3"
      fill="#67e8f9"
      fillOpacity="0.65"
    />

    <circle
      cx="380"
      cy="126"
      r="8"
      stroke="rgba(103,232,249,0.12)"
      strokeWidth="1"
    />

    <circle
      cx="155"
      cy="199"
      r="2"
      fill="#38bdf8"
      fillOpacity="0.5"
    />

    <path
      d="M104 150H160M350 150H408"
      stroke="rgba(148,163,184,0.06)"
      strokeWidth="1"
      strokeDasharray="3 6"
    />

    <path
      d="M255 47V87M255 213V253"
      stroke="rgba(148,163,184,0.05)"
      strokeWidth="1"
      strokeDasharray="3 6"
    />

    <circle
      cx="330"
      cy="77"
      r="1.5"
      fill="rgba(103,232,249,0.4)"
    />

    <circle
      cx="170"
      cy="95"
      r="1.5"
      fill="rgba(103,232,249,0.3)"
    />

    <circle
      cx="340"
      cy="218"
      r="1.5"
      fill="rgba(103,232,249,0.3)"
    />

  </svg>
);


export default LatestInsight;