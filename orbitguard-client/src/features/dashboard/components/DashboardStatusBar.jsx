import { motion } from "framer-motion";
import {
  FiActivity,
  FiRadio,
  FiCheckCircle,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI — Dashboard Status Bar
 * ================================================================
 *
 * Presentation-only dashboard footer.
 *
 * Current backend DashboardResponse provides:
 *
 * - overview
 * - satelliteAnalytics
 * - riskAnalytics
 * - alertAnalytics
 * - riskTrends
 *
 * It currently does NOT provide:
 *
 * - systemStatus
 * - version
 *
 * Therefore this component must NOT infer system health from:
 *
 * - successful dashboard API requests
 * - satellite counts
 * - debris counts
 * - risk counts
 * - alert counts
 *
 * When an explicit backend system status is introduced later,
 * this component can consume it directly.
 *
 * Backend remains the source of truth.
 * ================================================================
 */


/**
 * ================================================================
 * STATUS CONFIGURATION
 * ================================================================
 */

const STATUS_CONFIG = {
  OPERATIONAL: {
    label: "Operational",
    description: "All systems operational",
    icon: FiCheckCircle,
    dotClass: "bg-emerald-400",
    textClass: "text-emerald-300",
    borderClass: "border-emerald-300/15",
    backgroundClass: "bg-emerald-400/[0.035]",
    glowClass:
      "shadow-[0_0_8px_rgba(52,211,153,0.45)]",
  },

  DEGRADED: {
    label: "Degraded",
    description: "Some services require attention",
    icon: FiActivity,
    dotClass: "bg-amber-300",
    textClass: "text-amber-300",
    borderClass: "border-amber-300/15",
    backgroundClass: "bg-amber-400/[0.035]",
    glowClass:
      "shadow-[0_0_8px_rgba(252,211,77,0.4)]",
  },

  OFFLINE: {
    label: "Offline",
    description: "System services unavailable",
    icon: FiRadio,
    dotClass: "bg-red-400",
    textClass: "text-red-300",
    borderClass: "border-red-300/15",
    backgroundClass: "bg-red-400/[0.035]",
    glowClass:
      "shadow-[0_0_8px_rgba(248,113,113,0.4)]",
  },

  UNKNOWN: {
    label: "Unknown",
    description: "System status unavailable",
    icon: FiRadio,
    dotClass: "bg-slate-500",
    textClass: "text-slate-400",
    borderClass: "border-slate-500/15",
    backgroundClass: "bg-slate-500/[0.025]",
    glowClass: "",
  },
};


/**
 * ================================================================
 * DashboardStatusBar
 * ================================================================
 */

const DashboardStatusBar = ({
  data = null,
}) => {
  /**
   * --------------------------------------------------------------
   * Explicit backend status only
   * --------------------------------------------------------------
   *
   * At the moment the DashboardResponse does not contain
   * systemStatus.
   *
   * This lookup is intentionally future-compatible.
   *
   * We do NOT derive status from API success or analytics.
   * --------------------------------------------------------------
   */

  const status =
    normalizeStatus(data?.systemStatus);


  const config =
    STATUS_CONFIG[status] ??
    STATUS_CONFIG.UNKNOWN;


  const StatusIcon =
    config.icon;


  /**
   * --------------------------------------------------------------
   * Backend version
   * --------------------------------------------------------------
   *
   * The current DashboardResponse does not expose a version field.
   *
   * Therefore we display an unavailable state rather than
   * inventing a version number.
   * --------------------------------------------------------------
   */

  const version =
    data?.version ?? null;


  return (
    <motion.footer
      initial={{
        opacity: 0,
        y: 6,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
        ease: "easeOut",
        delay: 0.15,
      }}
      className="
        relative
        mt-6
        overflow-hidden
        border-y
        border-white/[0.055]
        bg-[#040b14]/75
      "
    >

      {/* =========================================================
          TOP TECHNICAL LINE
          ========================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          left-0
          top-0
          h-px
          w-32
          bg-gradient-to-r
          from-cyan-300/35
          to-transparent
        "
        aria-hidden="true"
      />


      {/* =========================================================
          MAIN STATUS CONTENT
          ========================================================= */}

      <div
        className="
          mx-auto
          flex
          min-h-[58px]
          w-full
          max-w-[1920px]
          flex-col
          justify-center
          gap-3
          px-4
          py-3
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-5
          lg:px-6
          xl:px-8
        "
      >

        {/* =======================================================
            BRAND / TAGLINE
            ======================================================= */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              border
              border-cyan-300/10
              bg-cyan-400/[0.025]
            "
            aria-hidden="true"
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-cyan-300
                shadow-[0_0_7px_rgba(103,232,249,0.55)]
              "
            />
          </div>


          <div
            className="
              flex
              min-w-0
              flex-col
              gap-0.5
              sm:flex-row
              sm:items-center
              sm:gap-3
            "
          >

            <span
              className="
                font-['Orbitron']
                text-[8px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-slate-300
                sm:text-[9px]
              "
            >
              OrbitGuard AI
            </span>


            <span
              className="
                hidden
                h-3
                w-px
                bg-white/[0.09]
                sm:block
              "
              aria-hidden="true"
            />


            <span
              className="
                truncate
                font-['Inter']
                text-[8px]
                uppercase
                tracking-[0.09em]
                text-slate-600
                sm:text-[9px]
              "
            >
              Orbital Intelligence. A Safer Tomorrow.
            </span>

          </div>

        </div>


        {/* =======================================================
            SYSTEM INFORMATION
            ======================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            sm:justify-end
            sm:gap-5
          "
        >

          <SystemStatus
            config={config}
            StatusIcon={StatusIcon}
          />


          <span
            className="
              hidden
              h-4
              w-px
              bg-white/[0.07]
              sm:block
            "
            aria-hidden="true"
          />


          {/* Version */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <span
              className="
                font-['Inter']
                text-[8px]
                uppercase
                tracking-[0.08em]
                text-slate-700
              "
            >
              Version
            </span>


            <span
              className="
                font-['Orbitron']
                text-[8px]
                font-medium
                tracking-[0.1em]
                text-slate-500
              "
            >
              {version || "—"}
            </span>

          </div>

        </div>

      </div>


      {/* =========================================================
          BOTTOM TECHNICAL DETAILS
          ========================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          right-0
          h-5
          w-24
          border-l
          border-t
          border-white/[0.025]
        "
        aria-hidden="true"
      />

    </motion.footer>
  );
};


/**
 * ================================================================
 * SystemStatus
 * ================================================================
 */

const SystemStatus = ({
  config,
  StatusIcon,
}) => {
  return (
    <div
      className={`
        flex
        items-center
        gap-2
        border
        px-2.5
        py-1.5
        ${config.borderClass}
        ${config.backgroundClass}
      `}
      title={config.description}
      aria-label={`System status: ${config.label}`}
    >

      <StatusIcon
        className={`
          h-3
          w-3
          shrink-0
          ${config.textClass}
        `}
        aria-hidden="true"
      />


      <span
        className={`
          h-1.5
          w-1.5
          shrink-0
          rounded-full
          ${config.dotClass}
          ${config.glowClass}
        `}
        aria-hidden="true"
      />


      <span
        className={`
          font-['Orbitron']
          text-[7px]
          font-medium
          uppercase
          tracking-[0.12em]
          ${config.textClass}
        `}
      >
        {config.label}
      </span>

    </div>
  );
};


/**
 * ================================================================
 * STATUS NORMALIZATION
 * ================================================================
 *
 * Supports future backend contract:
 *
 * systemStatus: "OPERATIONAL"
 *
 * or:
 *
 * systemStatus: {
 *   state: "OPERATIONAL",
 *   label: "All systems operational"
 * }
 *
 * Unknown/missing values remain UNKNOWN.
 * ================================================================
 */

const normalizeStatus = (
  systemStatus,
) => {

  if (!systemStatus) {
    return "UNKNOWN";
  }


  const rawState =
    typeof systemStatus === "string"
      ? systemStatus
      : systemStatus.state ??
        systemStatus.status;


  if (!rawState) {
    return "UNKNOWN";
  }


  const normalizedState =
    String(rawState).trim().toUpperCase();


  return STATUS_CONFIG[normalizedState]
    ? normalizedState
    : "UNKNOWN";
};


export default DashboardStatusBar;