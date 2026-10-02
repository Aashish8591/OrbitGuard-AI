import DebrisDetailPage from "../../features/debris/pages/DebrisDetailPage";

/**
 * ================================================================
 * OrbitGuard AI - Debris Details
 * ================================================================
 *
 * Application-level route entry for the Debris Detail module.
 *
 * This component intentionally remains lightweight.
 *
 * Feature-specific UI, state, backend integration, loading,
 * error handling, and detail-page composition belong inside:
 *
 * features/debris/
 *
 * The actual detail experience is composed by:
 *
 * features/debris/pages/DebrisDetailPage
 *
 * Route:
 *
 * /debris/:debrisId
 * ================================================================
 */

const DebrisDetails = () => {
  return <DebrisDetailPage />;
};

export default DebrisDetails;