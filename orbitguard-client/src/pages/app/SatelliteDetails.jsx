import SatelliteDetailPage from "../../features/satellites/pages/SatelliteDetailPage";

/**
 * Satellite Details
 *
 * Application-level route entry for the Satellite Detail module.
 *
 * This component intentionally remains lightweight.
 * Feature-specific UI, state, and backend integration belong inside:
 *
 * features/satellites/
 *
 * The SatelliteDetailPage is responsible for composing the
 * complete Satellite Detail experience.
 */
const SatelliteDetails = () => {
    return <SatelliteDetailPage />;
};

export default SatelliteDetails;