import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import DashboardHero from "../../features/dashboard/components/DashboardHero";
import DashboardStats from "../../features/dashboard/components/DashboardStats";
import RiskAssessmentTrend from "../../features/dashboard/components/RiskAssessmentTrend";
import RiskLevelPanel from "../../features/dashboard/components/RiskLevelPanel";
import DashboardAIAssistant from "../../features/dashboard/components/DashboardAIAssistant";
import LatestInsight from "../../features/dashboard/components/LatestInsight";
import DashboardStatusBar from "../../features/dashboard/components/DashboardStatusBar";

import {
  DEFAULT_TREND_DAYS,
  getDashboard,
} from "../../services/dashboardService";

import {
  sendAiMessage,
} from "../../services/aiService";

import {
  getApiErrorMessage,
} from "../../services/api";


/**
 * ================================================================
 * OrbitGuard AI — Mission Dashboard
 * ================================================================
 *
 * PAGE RESPONSIBILITIES
 * ----------------------------------------------------------------
 *
 * Dashboard owns:
 * - Dashboard API lifecycle
 * - Dashboard loading / refresh / error state
 * - Selected trend period
 * - AI conversation state
 * - AI loading / error state
 * - Passing backend data to presentation components
 * - Responsive layout
 * - Page-level animation
 *
 *
 * BACKEND IS THE SOURCE OF TRUTH.
 *
 * This component does NOT:
 * - Calculate analytics
 * - Calculate collision risk
 * - Generate AI responses
 * - Build AI prompts
 * - Call Axios directly
 * - Create fake production data
 * ================================================================
 */


/**
 * ================================================================
 * PAGE ANIMATION
 * ================================================================
 */

const DASHBOARD_CONTAINER_VARIANTS = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};


const DASHBOARD_SECTION_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 14,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};


/**
 * ================================================================
 * TREND PERIOD CONTRACT
 * ================================================================
 *
 * Backend supports 1–365 days.
 *
 * Dashboard UI intentionally exposes these supported presets.
 * ================================================================
 */

const PERIOD_TO_DAYS = Object.freeze({
  "7d": 7,
  "30d": 30,
  "90d": 90,
});


const DAYS_TO_PERIOD = Object.freeze({
  7: "7d",
  30: "30d",
  90: "90d",
});


const isSupportedTrendDays = (
  days,
) =>
  Object.values(
    PERIOD_TO_DAYS,
  ).includes(days);


/**
 * ================================================================
 * AI MESSAGE ID
 * ================================================================
 *
 * Client-only ID.
 *
 * Never sent to backend.
 * ================================================================
 */

const createMessageId = (
  prefix,
) => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
};


/**
 * ================================================================
 * DASHBOARD
 * ================================================================
 */

const Dashboard = () => {
  /**
   * ==============================================================
   * DASHBOARD DATA
   * ============================================================== */

  const [
    dashboardData,
    setDashboardData,
  ] = useState(null);


  /**
   * ==============================================================
   * DASHBOARD LOADING
   * ============================================================== */

  const [
    loading,
    setLoading,
  ] = useState(true);


  /**
   * ==============================================================
   * BACKGROUND REFRESH
   * ============================================================== */

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  /**
   * ==============================================================
   * DASHBOARD ERROR
   * ============================================================== */

  const [
    error,
    setError,
  ] = useState(null);


  /**
   * ==============================================================
   * TREND PERIOD
   * ============================================================== */

  const [
    trendDays,
    setTrendDays,
  ] = useState(
    DEFAULT_TREND_DAYS,
  );


  /**
   * ==============================================================
   * DASHBOARD REQUEST SEQUENCE
   * ============================================================== */

  const requestSequenceRef =
    useRef(0);


  /**
   * ==============================================================
   * AI CONVERSATION
   * ============================================================== */

  const [
    aiMessages,
    setAiMessages,
  ] = useState([]);


  /**
   * ==============================================================
   * AI LOADING
   * ============================================================== */

  const [
    aiLoading,
    setAiLoading,
  ] = useState(false);


  /**
   * ==============================================================
   * AI ERROR
   * ============================================================== */

  const [
    aiError,
    setAiError,
  ] = useState(null);


  /**
   * ==============================================================
   * ACCESSIBILITY
   * ============================================================== */

  const shouldReduceMotion =
    useReducedMotion();


  /**
   * ==============================================================
   * LOAD DASHBOARD
   * ==============================================================
   */

  const loadDashboard =
    useCallback(
      async (
        days,
        options = {},
      ) => {
        const {
          initial = false,
        } = options;


        /**
         * --------------------------------------------------------
         * Validate UI period.
         * --------------------------------------------------------
         */

        if (
          !isSupportedTrendDays(
            days,
          )
        ) {
          console.warn(
            `[OrbitGuard Dashboard] Unsupported trend days: ${days}`,
          );

          return;
        }


        /**
         * --------------------------------------------------------
         * Create request sequence.
         *
         * Prevents an older request from overwriting a newer one.
         * --------------------------------------------------------
         */

        const requestId =
          ++requestSequenceRef.current;


        /**
         * --------------------------------------------------------
         * Update loading state.
         * --------------------------------------------------------
         */

        if (initial) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError(null);


        try {
          /**
           * ------------------------------------------------------
           * Backend request.
           * ------------------------------------------------------
           */

          const response =
            await getDashboard(days);


          /**
           * ------------------------------------------------------
           * Ignore stale response.
           * ------------------------------------------------------
           */

          if (
            requestId !==
            requestSequenceRef.current
          ) {
            return;
          }


          /**
           * ------------------------------------------------------
           * Store backend response as-is.
           *
           * No frontend analytics calculation.
           * ------------------------------------------------------
           */

          setDashboardData(
            response,
          );

          setError(null);

        } catch (requestError) {
          /**
           * ------------------------------------------------------
           * Ignore stale error.
           * ------------------------------------------------------
           */

          if (
            requestId !==
            requestSequenceRef.current
          ) {
            return;
          }


          console.error(
            "[OrbitGuard Dashboard] Dashboard request failed.",
            requestError,
          );


          setError(
            getApiErrorMessage(
              requestError,
              "Failed to load dashboard data.",
            ),
          );

        } finally {
          /**
           * ------------------------------------------------------
           * Only latest request updates loading state.
           * ------------------------------------------------------
           */

          if (
            requestId !==
            requestSequenceRef.current
          ) {
            return;
          }


          if (initial) {
            setLoading(false);
          } else {
            setRefreshing(false);
          }
        }
      },
      [],
    );


  /**
   * ==============================================================
   * INITIAL DASHBOARD LOAD
   * ============================================================== */

  useEffect(() => {
    loadDashboard(
      DEFAULT_TREND_DAYS,
      {
        initial: true,
      },
    );
  }, [loadDashboard]);


  /**
   * ==============================================================
   * TREND PERIOD CHANGE
   * ============================================================== */

  const handleTrendPeriodChange =
    useCallback(
      (period) => {
        const days =
          PERIOD_TO_DAYS[period];


        if (!days) {
          console.warn(
            `[OrbitGuard Dashboard] Unsupported trend period: ${period}`,
          );

          return;
        }


        if (
          days === trendDays
        ) {
          return;
        }


        setTrendDays(days);

        loadDashboard(days);
      },
      [
        loadDashboard,
        trendDays,
      ],
    );


  /**
   * ==============================================================
   * CURRENT UI PERIOD
   * ============================================================== */

  const selectedPeriod =
    useMemo(
      () =>
        DAYS_TO_PERIOD[
          trendDays
        ] ??
        "7d",
      [trendDays],
    );


  /**
   * ==============================================================
   * SEND AI MESSAGE
   * ==============================================================
   */

  const handleAiSendMessage =
    useCallback(
      async (message) => {
        const normalizedMessage =
          typeof message === "string"
            ? message.trim()
            : "";


        /**
         * --------------------------------------------------------
         * Prevent invalid / duplicate request.
         * --------------------------------------------------------
         *
         * The UI should normally disable sending while loading.
         * This guard also protects the page if the callback is
         * triggered programmatically.
         * --------------------------------------------------------
         */

        if (
          !normalizedMessage ||
          aiLoading
        ) {
          return;
        }


        setAiError(null);


        /**
         * --------------------------------------------------------
         * Add user message immediately.
         * --------------------------------------------------------
         */

        const userMessage = {
          id: createMessageId(
            "user",
          ),
          role: "user",
          content:
            normalizedMessage,
        };


        setAiMessages(
          (currentMessages) => [
            ...currentMessages,
            userMessage,
          ],
        );


        setAiLoading(true);


        try {
          /**
           * ------------------------------------------------------
           * AI service owns backend communication.
           * ------------------------------------------------------
           */

          const generatedResponse =
            await sendAiMessage(
              normalizedMessage,
            );


          /**
           * ------------------------------------------------------
           * Add backend-generated response.
           * ------------------------------------------------------
           */

          const assistantMessage = {
            id: createMessageId(
              "assistant",
            ),
            role: "assistant",
            content:
              generatedResponse,
          };


          setAiMessages(
            (currentMessages) => [
              ...currentMessages,
              assistantMessage,
            ],
          );

        } catch (aiRequestError) {
          console.error(
            "[OrbitGuard AI] AI request failed.",
            aiRequestError,
          );


          setAiError(
            getApiErrorMessage(
              aiRequestError,
              "Unable to communicate with OrbitGuard AI.",
            ),
          );

        } finally {
          setAiLoading(false);
        }
      },
      [aiLoading],
    );


  /**
   * ==============================================================
   * PAGE MOTION
   * ============================================================== */

  const containerVariants =
    shouldReduceMotion
      ? undefined
      : DASHBOARD_CONTAINER_VARIANTS;


  const sectionVariants =
    shouldReduceMotion
      ? undefined
      : DASHBOARD_SECTION_VARIANTS;


  /**
   * ==============================================================
   * RENDER
   * ============================================================== */

  return (
    <main
      className="
        min-h-full
        w-full
        bg-[#020914]
        text-slate-100
      "
    >
      <motion.div
        initial={
          shouldReduceMotion
            ? false
            : "hidden"
        }
        animate="visible"
        variants={
          containerVariants
        }
        className="
          mx-auto
          flex
          w-full
          max-w-[1800px]
          flex-col
          gap-4
          px-3
          py-3
          sm:gap-5
          sm:px-4
          sm:py-4
          lg:gap-6
          lg:px-6
          lg:py-5
          2xl:px-8
        "
      >

        {/* =======================================================
            DASHBOARD CONNECTION STATUS
            ======================================================= */}

        {(loading ||
          refreshing ||
          error) && (
          <motion.div
            variants={
              sectionVariants
            }
            className="min-h-[32px]"
            aria-live="polite"
          >
            {loading && (
              <div
                className="
                  border
                  border-cyan-400/10
                  bg-cyan-400/[0.02]
                  px-4
                  py-2
                  font-['Orbitron']
                  text-[9px]
                  uppercase
                  tracking-[0.18em]
                  text-cyan-300/70
                "
              >
                Loading orbital intelligence...
              </div>
            )}


            {!loading &&
              refreshing && (
                <div
                  className="
                    border
                    border-cyan-400/10
                    bg-cyan-400/[0.02]
                    px-4
                    py-2
                    font-['Orbitron']
                    text-[9px]
                    uppercase
                    tracking-[0.18em]
                    text-cyan-300/70
                  "
                >
                  Updating orbital intelligence...
                </div>
              )}


            {error && (
              <div
                role="alert"
                className="
                  border
                  border-red-400/20
                  bg-red-400/[0.03]
                  px-4
                  py-2
                  font-['Inter']
                  text-xs
                  text-red-300
                "
              >
                Dashboard data unavailable:{" "}
                {error}
              </div>
            )}
          </motion.div>
        )}


        {/* =======================================================
            01. CINEMATIC ORBITAL OVERVIEW
            ======================================================= */}

        <motion.section
          aria-label="Orbital overview"
          variants={
            sectionVariants
          }
        >
          <DashboardHero
            data={dashboardData}
            loading={loading}
          />
        </motion.section>


        {/* =======================================================
            02. OPERATIONAL STATISTICS
            ======================================================= */}

        <motion.section
          aria-label="Operational statistics"
          variants={
            sectionVariants
          }
        >
          <DashboardStats
            data={dashboardData}
            loading={loading}
          />
        </motion.section>


        {/* =======================================================
            03. PRIMARY DASHBOARD WORKSPACE
            ======================================================= */}

        <motion.section
          aria-label="Dashboard intelligence workspace"
          variants={
            sectionVariants
          }
          className="
            grid
            grid-cols-1
            gap-4
            lg:grid-cols-12
            lg:gap-5
          "
        >

          {/* =====================================================
              RISK ASSESSMENT TREND
              ===================================================== */}

          <motion.div
            variants={
              sectionVariants
            }
            className="
              min-w-0
              lg:col-span-8
            "
          >
            <RiskAssessmentTrend
              data={dashboardData}
              loading={
                loading ||
                refreshing
              }
              selectedPeriod={
                selectedPeriod
              }
              onPeriodChange={
                handleTrendPeriodChange
              }
            />
          </motion.div>


          {/* =====================================================
              RISK LEVEL PANEL
              ===================================================== */}

          <motion.div
            variants={
              sectionVariants
            }
            className="
              min-w-0
              lg:col-span-4
            "
          >
            <RiskLevelPanel
              data={dashboardData}
              loading={loading}
            />
          </motion.div>


          {/* =====================================================
              LATEST INSIGHT
              ===================================================== */}

          <motion.div
            variants={
              sectionVariants
            }
            className="
              min-w-0
              lg:col-span-4
            "
          >
            <LatestInsight
              data={dashboardData}
              loading={loading}
            />
          </motion.div>


          {/* =====================================================
              AI ASSISTANT
              ===================================================== */}

          <motion.div
            variants={
              sectionVariants
            }
            className="
              min-w-0
              lg:col-span-8
            "
          >
            <DashboardAIAssistant
              messages={
                aiMessages
              }
              loading={
                aiLoading
              }
              error={
                aiError
              }
              onSendMessage={
                handleAiSendMessage
              }
            />
          </motion.div>

        </motion.section>


        {/* =======================================================
            04. SYSTEM STATUS
            ======================================================= */}

        <motion.section
          aria-label="System status"
          variants={
            sectionVariants
          }
        >
          <DashboardStatusBar
            data={dashboardData}
            loading={loading}
          />
        </motion.section>

      </motion.div>
    </main>
  );
};


export default Dashboard;