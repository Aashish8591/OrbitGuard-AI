import SatelliteOverviewPage from "../../features/satellites/pages/SatelliteOverviewPage";

/**
 * Satellite
 *
 * Application-level route entry for the Satellite module.
 *
 * This component intentionally remains lightweight.
 * Feature-specific UI, state, and backend integration belong inside:
 *
 * features/satellites/
 *
 * The page component is responsible for composing the
 * Satellite Overview experience.
 */
const Satellite = () => {
    return <SatelliteOverviewPage />;
};

export default Satellite;