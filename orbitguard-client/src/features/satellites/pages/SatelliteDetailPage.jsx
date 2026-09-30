import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiRefreshCw,
} from "react-icons/fi";

import api, { getApiErrorMessage } from "../../../services/api";

import SatelliteDetailHero from "../components/SatelliteDetailHero";
import SatelliteInformationCard from "../components/SatelliteInformationCard";
import SatelliteOrbitalView from "../components/SatelliteOrbitalView";
import SatelliteOrbitalParameters from "../components/SatelliteOrbitalParameters";
import SatelliteStatusCard from "../components/SatelliteStatusCard";


/* ================================================================
 * Loading Skeleton
 * ================================================================ */

const SatelliteDetailSkeleton = () => {
  return (
    <div className="space-y-5 animate-pulse">

      {/* Hero skeleton */}
      <div className="h-[250px] rounded-2xl border border-slate-800/80 bg-slate-950/70" />

      {/* Main cards */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">

        <div className="h-[300px] rounded-2xl border border-slate-800/80 bg-slate-950/70 xl:col-span-4" />

        <div className="h-[300px] rounded-2xl border border-slate-800/80 bg-slate-950/70 xl:col-span-4" />

        <div className="h-[300px] rounded-2xl border border-slate-800/80 bg-slate-950/70 xl:col-span-4" />
      </div>

      {/* Orbital parameters */}
      <div className="h-[250px] rounded-2xl border border-slate-800/80 bg-slate-950/70" />
    </div>
  );
};


/* ================================================================
 * Error State
 * ================================================================ */

const SatelliteDetailError = ({
  message,
  onRetry,
  onBack,
}) => {
  return (
    <div className="flex min-h-[65vh] items-center justify-center px-4">

      <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-[#07111f]/90 p-6 text-center shadow-2xl shadow-black/30">

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
          <FiAlertCircle className="text-2xl text-red-400" />
        </div>

        <h2 className="font-['Orbitron'] text-lg font-semibold tracking-wide text-white">
          SATELLITE DATA UNAVAILABLE
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          {message || "Unable to retrieve satellite information."}
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">

          <button
            type="button"
            onClick={onRetry}
            className="
              inline-flex items-center justify-center gap-2
              rounded-lg border border-cyan-400/30
              bg-cyan-400/10
              px-4 py-2.5
              text-sm font-medium text-cyan-300
              transition
              hover:border-cyan-300/50
              hover:bg-cyan-400/15
            "
          >
            <FiRefreshCw />
            Retry
          </button>

          <button
            type="button"
            onClick={onBack}
            className="
              inline-flex items-center justify-center gap-2
              rounded-lg border border-slate-700
              bg-slate-900/70
              px-4 py-2.5
              text-sm font-medium text-slate-300
              transition
              hover:border-slate-600
              hover:bg-slate-800
            "
          >
            <FiArrowLeft />
            Back to Satellites
          </button>

        </div>
      </div>
    </div>
  );
};


/* ================================================================
 * Satellite Detail Page
 * ================================================================ */

const SatelliteDetailPage = () => {

  const { satelliteId } = useParams();

  const navigate = useNavigate();

  const [satellite, setSatellite] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  /* ==============================================================
   * Fetch Satellite
   * ============================================================== */

  const fetchSatellite = useCallback(async () => {

    if (!satelliteId) {
      setError("Satellite ID is missing.");
      setLoading(false);
      return;
    }

    try {

      setLoading(true);
      setError("");

      /*
       * Backend endpoint:
       *
       * GET /api/satellites/{satelliteId}
       *
       * Controller returns:
       *
       * ApiResponse<SatelliteResponse>
       */

      const response = await api.get(
        `/api/satellites/${encodeURIComponent(satelliteId)}`
      );

      const responseBody = response?.data;

      /*
       * Expected backend structure is approximately:
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: {
       *      id: "...",
       *      satelliteName: "...",
       *      satelliteCode: "...",
       *      noradCatalogId: 25544,
       *      ...
       *   }
       * }
       *
       * We only use the actual SatelliteResponse object.
       */

      const satelliteData =
        responseBody?.data ??
        responseBody?.result ??
        null;

      if (!satelliteData) {
        throw new Error(
          "Satellite data was not returned by the backend."
        );
      }

      setSatellite(satelliteData);

    } catch (requestError) {

      console.error(
        "[SatelliteDetailPage] Failed to load satellite:",
        requestError
      );

      setSatellite(null);

      setError(
        getApiErrorMessage(
          requestError,
          "Unable to load satellite details. Please try again."
        )
      );

    } finally {

      setLoading(false);
    }

  }, [satelliteId]);


  /* ==============================================================
   * Initial / ID-change fetch
   * ============================================================== */

  useEffect(() => {
    fetchSatellite();
  }, [fetchSatellite]);


  /* ==============================================================
   * Navigation
   * ============================================================== */

  const handleBack = () => {
    navigate("/satellites");
  };


  /* ==============================================================
   * Loading
   * ============================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020914] px-3 py-5 text-slate-100 sm:px-5 lg:px-6">
        <SatelliteDetailSkeleton />
      </main>
    );
  }


  /* ==============================================================
   * Error
   * ============================================================== */

  if (error || !satellite) {
    return (
      <main className="min-h-screen bg-[#020914] text-slate-100">

        <SatelliteDetailError
          message={error}
          onRetry={fetchSatellite}
          onBack={handleBack}
        />

      </main>
    );
  }


  /* ==============================================================
   * Page
   * ============================================================== */

  return (
    <main className="min-h-screen bg-[#020914] text-slate-100">

      <div
        className="
          mx-auto
          w-full
          max-w-[1800px]
          px-3
          pb-8
          pt-4
          sm:px-5
          md:px-6
          lg:px-8
        "
      >

        {/* ======================================================
         * HERO
         * ====================================================== */}

        <SatelliteDetailHero
          satellite={satellite}
          onBack={handleBack}
        />


        {/* ======================================================
         * STATUS
         *
         * Small operational summary.
         * ====================================================== */}

        <div className="mt-4">
          <SatelliteStatusCard
            satellite={satellite}
          />
        </div>


        {/* ======================================================
         * INFORMATION + ORBITAL VIEW
         *
         * Desktop:
         *
         * Information | Status | Orbital View
         *
         * Mobile:
         *
         * Information
         * Status
         * Orbital View
         * ====================================================== */}

        <section
          className="
            mt-5
            grid
            grid-cols-1
            gap-5
            xl:grid-cols-12
          "
        >

          {/* Satellite information */}

          <div className="xl:col-span-4">
            <SatelliteInformationCard
              satellite={satellite}
            />
          </div>


          {/* Mission / status information */}

          <div className="xl:col-span-4">
            <SatelliteStatusCard
              satellite={satellite}
              detailed
            />
          </div>


          {/* Orbital visualization */}

          <div className="min-h-[320px] xl:col-span-4">
            <SatelliteOrbitalView
              satellite={satellite}
            />
          </div>

        </section>


        {/* ======================================================
         * ORBITAL PARAMETERS
         *
         * TLE / SGP4 values returned by SatelliteResponse.
         * ====================================================== */}

        <section className="mt-5">

          <SatelliteOrbitalParameters
            satellite={satellite}
          />

        </section>

      </div>
    </main>
  );
};


export default SatelliteDetailPage;