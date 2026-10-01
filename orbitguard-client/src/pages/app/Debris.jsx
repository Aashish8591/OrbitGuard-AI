import DebrisOverviewPage from "../../features/debris/pages/DebrisOverviewPage";

/**
 * Debris
 *
 * Application-level route entry for the Debris module.
 *
 * This component intentionally remains lightweight.
 * Feature-specific UI, state, and backend integration belong inside:
 *
 * features/debris/
 *
 * The page component is responsible for composing the
 * Debris Overview experience.
 */
const Debris = () => {
  return <DebrisOverviewPage />;
};

export default Debris;