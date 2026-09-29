import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import SatelliteDetailHero from "../components/SatelliteDetailHero";
import SatelliteIdentity from "../components/SatelliteIdentity";
import SatelliteOrbitalInformation from "../components/SatelliteOrbitalInformation";
import SatelliteMissionInformation from "../components/SatelliteMissionInformation";
import SatelliteOrbitalData from "../components/SatelliteOrbitalData";
import SatelliteDetailActions from "../components/SatelliteDetailActions";

/**
 * Satellite Detail Page
 *
 * Responsibility:
 * - Compose the complete satellite detail experience
 * - Read the satellite identifier from the route
 * - Provide the data contract required by child components
 * - Keep page-level layout/state separate from individual UI sections
 *
 * Backend integration will be added after the complete satellite
 * Overview + Detail UI has been finalized.
 *
 * Expected backend endpoint:
 *
 * GET /api/satellites/{satelliteId}
 *
 * Expected response:
 *
 * SatelliteResponse
 */
const SatelliteDetailPage = () => {
    const { satelliteId } = useParams();

    /*
     * UI development contract.
     *
     * This object represents the shape of SatelliteResponse
     * already defined by our Spring Boot backend.
     *
     * IMPORTANT:
     * This is only the page contract while we are building UI.
     * It will NOT remain as hard-coded data when API integration begins.
     */
    const satellite = useMemo(
        () => ({
            id: satelliteId,

            satelliteName: "",
            satelliteCode: "",
            operator: "",

            orbitType: null,

            altitude: null,
            velocity: null,

            noradCatalogId: null,

            launchDate: null,

            missionStatus: null,

            country: "",
            purpose: "",
            description: "",

            active: null,

            createdAt: null,
            updatedAt: null,
        }),
        [satelliteId]
    );

    /*
     * Orbital data is intentionally separated from SatelliteResponse.
     *
     * It will later come from:
     *
     * GET /api/satellites/{noradCatalogId}/orbital-data
     *
     * Backend DTO:
     * CelesTrakOrbitalData
     */
    const orbitalData = useMemo(
        () => null,
        []
    );

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
            {/* =========================================================
                SATELLITE DETAIL BACKGROUND
            ========================================================== */}

            <div className="pointer-events-none absolute inset-0 -z-10">
                <img
                    src="/images/satellite/satellite-detail-bg.png"
                    alt=""
                    className="h-full w-full object-cover object-center"
                />

                {/* Main cinematic darkness */}
                <div className="absolute inset-0 bg-[#020617]/76" />

                {/* Top atmospheric fade */}
                <div className="absolute inset-x-0 top-0 h-[440px] bg-gradient-to-b from-[#020617]/20 via-[#020617]/55 to-transparent" />

                {/* Bottom fade */}
                <div className="absolute inset-x-0 bottom-0 h-[420px] bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent" />

                {/* Center orbital glow */}
                <div className="absolute left-1/2 top-[18%] h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-cyan-400/[0.035] blur-[140px]" />
            </div>

            {/* =========================================================
                CONTENT
            ========================================================== */}

            <div className="relative z-10">
                {/* =====================================================
                    BACK NAVIGATION
                ====================================================== */}

                <div className="mx-auto w-full max-w-[1600px] px-4 pt-24 sm:px-6 lg:px-8">
                    <Link
                        to="/satellites"
                        className="
                            group
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            border
                            border-white/10
                            bg-slate-950/45
                            px-3
                            py-2
                            font-['Inter']
                            text-xs
                            font-medium
                            text-slate-400
                            backdrop-blur-xl
                            transition-all
                            duration-300
                            hover:border-cyan-400/30
                            hover:bg-cyan-400/[0.06]
                            hover:text-cyan-300
                        "
                    >
                        <span
                            aria-hidden="true"
                            className="transition-transform duration-300 group-hover:-translate-x-1"
                        >
                            ←
                        </span>

                        Back to Satellite Explorer
                    </Link>
                </div>

                {/* =====================================================
                    SATELLITE HERO
                ====================================================== */}

                <section className="mx-auto w-full max-w-[1600px] px-4 pt-8 sm:px-6 lg:px-8">
                    <SatelliteDetailHero
                        satellite={satellite}
                    />
                </section>

                {/* =====================================================
                    MAIN SATELLITE INFORMATION
                ====================================================== */}

                <section
                    aria-labelledby="satellite-information-heading"
                    className="
                        mx-auto
                        w-full
                        max-w-[1600px]
                        px-4
                        pb-20
                        pt-10
                        sm:px-6
                        lg:px-8
                    "
                >
                    <h2
                        id="satellite-information-heading"
                        className="sr-only"
                    >
                        Satellite Information
                    </h2>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                        {/* =================================================
                            IDENTITY
                        ================================================== */}

                        <div className="xl:col-span-4">
                            <SatelliteIdentity
                                satellite={satellite}
                            />
                        </div>

                        {/* =================================================
                            ORBITAL INFORMATION
                        ================================================== */}

                        <div className="xl:col-span-8">
                            <SatelliteOrbitalInformation
                                satellite={satellite}
                            />
                        </div>

                        {/* =================================================
                            MISSION INFORMATION
                        ================================================== */}

                        <div className="xl:col-span-5">
                            <SatelliteMissionInformation
                                satellite={satellite}
                            />
                        </div>

                        {/* =================================================
                            CURRENT ORBITAL DATA
                        ================================================== */}

                        <div className="xl:col-span-7">
                            <SatelliteOrbitalData
                                satellite={satellite}
                                orbitalData={orbitalData}
                            />
                        </div>
                    </div>

                    {/* =====================================================
                        ACTIONS
                    ====================================================== */}

                    <div className="mt-6">
                        <SatelliteDetailActions
                            satellite={satellite}
                        />
                    </div>
                </section>
            </div>
        </main>
    );
};

export default SatelliteDetailPage;