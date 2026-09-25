import {
  FiAlertTriangle,
  FiBell,
  FiDatabase,
  FiRadio,
} from "react-icons/fi";

import DashboardStatCard from "./DashboardStatCard";

/**
 * ================================================================
 * OrbitGuard AI — Dashboard Stats
 * ================================================================
 *
 * Presentation layer for dashboard overview KPIs.
 *
 * Data flow:
 *
 * Dashboard.jsx
 *      ↓
 * dashboardService.getDashboard()
 *      ↓
 * DashboardResponse
 *      ↓
 * DashboardStats
 *      ↓
 * DashboardStatCard
 *
 * This component does not:
 * - call APIs
 * - calculate analytics
 * - create fallback business data
 * - modify backend values
 *
 * Backend remains the source of truth.
 * ================================================================
 */

const STAT_DEFINITIONS = [
  {
    key: "totalSatellites",
    label: "Active Satellites",
    description: "Tracked orbital assets",
    icon: FiRadio,
    variant: "cyan",
  },
  {
    key: "totalDebris",
    label: "Space Debris",
    description: "Tracked orbital objects",
    icon: FiDatabase,
    variant: "danger",
  },
  {
    key: "totalRisks",
    label: "Risk Assessments",
    description: "Collision-risk assessments",
    icon: FiAlertTriangle,
    variant: "warning",
  },
  {
    key: "totalAlerts",
    label: "Active Alerts",
    description: "Operational alerts",
    icon: FiBell,
    variant: "blue",
  },
];

/**
 * DashboardStats
 *
 * Receives the complete DashboardResponse from Dashboard.jsx.
 */
const DashboardStats = ({
  data = null,
  loading = false,
}) => {
  const overview = data?.overview;

  return (
    <section
      aria-labelledby="dashboard-stats-title"
      className="w-full"
    >
      <h2
        id="dashboard-stats-title"
        className="sr-only"
      >
        Operational statistics
      </h2>

      <div
        className="
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
          sm:gap-4
          xl:grid-cols-4
        "
      >
        {STAT_DEFINITIONS.map(
          ({
            key,
            label,
            description,
            icon,
            variant,
          }) => (
            <DashboardStatCard
              key={key}
              label={label}
              value={overview?.[key]}
              description={description}
              icon={icon}
              variant={variant}
              loading={loading}
            />
          ),
        )}
      </div>
    </section>
  );
};

export default DashboardStats;