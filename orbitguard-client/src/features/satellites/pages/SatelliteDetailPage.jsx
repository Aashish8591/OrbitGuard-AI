import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import SatelliteDetailHero from "../components/SatelliteDetailHero";
import InformationCard from "../components/InformationCard";
import OrbitalVisualCard from "../components/OrbitalVisualCard";

import satelliteService from "../../../services/satelliteService";
import { getApiErrorMessage } from "../../../services/api";

/**
 * ================================================================
 * OrbitGuard AI - Satellite Detail Page
 * ================================================================
 *
 * Route:
 *
 * /satellites/:satelliteId
 *
 * Backend source of truth:
 *
 * GET /api/satellites/{satelliteId}
 *
 * Responsibilities:
 * - Read satelliteId from route
 * - Scroll to the beginning when a satellite is opened
 * - Fetch the selected satellite from backend
 * - Handle loading state
 * - Handle backend/API errors
 * - Pass the real SatelliteResponse to child components
 * - Compose Satellite Detail UI
 *
 * IMPORTANT:
 * - No dummy satellite data
 * - No hardcoded satellite information
 * - No changes to child component data contracts
 * - No edit/deactivate actions
 * - No tabs
 * ================================================================
 */

const SatelliteDetailPage = () => {
    const { satelliteId } = useParams();

    /* ============================================================
       SATELLITE STATE
    ============================================================ */

    const [satellite, setSatellite] = useState(null);

    const [isLoading, setIsLoading] = useState(true);

    const [errorMessage, setErrorMessage] = useState("");

    /* ============================================================
       RESET PAGE SCROLL
       
       When user clicks "View Satellite" and React Router
       navigates to another satellite detail page, force the
       document back to the beginning.

       This fixes the situation where the new detail page
       opens at the previous scroll position.
    ============================================================ */

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto",
        });
    }, [satelliteId]);

    /* ============================================================
       LOAD SATELLITE
    ============================================================ */

    const loadSatellite = useCallback(async () => {
        if (!satelliteId) {
            setSatellite(null);
            setErrorMessage("Satellite ID is missing.");
            setIsLoading(false);

            return;
        }

        setIsLoading(true);
        setErrorMessage("");

        try {
            const result =
                await satelliteService.getSatelliteById(
                    satelliteId
                );

            if (!result || typeof result !== "object") {
                throw new Error(
                    "Satellite API returned invalid satellite data."
                );
            }

            setSatellite(result);
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                "Unable to load satellite details."
            );

            setSatellite(null);
            setErrorMessage(message);

            if (import.meta.env.DEV) {
                console.error(
                    "[SatelliteDetailPage] Failed to load satellite:",
                    error
                );
            }
        } finally {
            setIsLoading(false);
        }
    }, [satelliteId]);

    /* ============================================================
       INITIAL DATA LOAD
    ============================================================ */

    useEffect(() => {
        loadSatellite();
    }, [loadSatellite]);

    /* ============================================================
       LOADING STATE
    ============================================================ */

    if (isLoading) {
        return (
            <main
                className="
                    min-h-screen
                    bg-[#020914]
                    text-slate-100
                "
            >
                <div
                    className="
                        mx-auto
                        w-full
                        max-w-[1680px]
                        px-3
                        py-3
                        sm:px-5
                        sm:py-4
                        lg:px-7
                        lg:py-5
                        xl:px-8
                    "
                >
                    {/* =================================================
                        HERO SKELETON
                    ================================================= */}

                    <section
                        className="
                            overflow-hidden
                            rounded-2xl
                            border
                            border-cyan-400/10
                            bg-[#03101f]/80
                            p-4
                            shadow-[0_0_40px_rgba(0,180,255,0.04)]
                            sm:p-5
                            lg:p-6
                        "
                    >
                        <div
                            className="
                                animate-pulse
                                space-y-4
                            "
                        >
                            <div
                                className="
                                    h-3
                                    w-36
                                    rounded
                                    bg-slate-800
                                "
                            />

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-5
                                    lg:flex-row
                                    lg:items-center
                                "
                            >
                                <div
                                    className="
                                        h-28
                                        w-28
                                        shrink-0
                                        rounded-xl
                                        bg-slate-800
                                    "
                                />

                                <div className="flex-1 space-y-3">
                                    <div
                                        className="
                                            h-8
                                            w-64
                                            rounded
                                            bg-slate-800
                                        "
                                    />

                                    <div
                                        className="
                                            h-4
                                            w-48
                                            rounded
                                            bg-slate-800
                                        "
                                    />
                                </div>
                            </div>

                            <div
                                className="
                                    grid
                                    grid-cols-2
                                    gap-3
                                    lg:grid-cols-4
                                "
                            >
                                {[1, 2, 3, 4].map((item) => (
                                    <div
                                        key={item}
                                        className="
                                            h-20
                                            rounded-xl
                                            bg-slate-900/80
                                        "
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* =================================================
                        CONTENT SKELETON
                    ================================================= */}

                    <section
                        className="
                            mt-4
                            grid
                            grid-cols-1
                            gap-4
                            xl:grid-cols-12
                        "
                    >
                        <div
                            className="
                                h-[360px]
                                animate-pulse
                                rounded-2xl
                                border
                                border-white/5
                                bg-slate-900/50
                                xl:col-span-7
                            "
                        />

                        <div
                            className="
                                h-[360px]
                                animate-pulse
                                rounded-2xl
                                border
                                border-white/5
                                bg-slate-900/50
                                xl:col-span-5
                            "
                        />
                    </section>
                </div>
            </main>
        );
    }

    /* ============================================================
       ERROR STATE
    ============================================================ */

    if (errorMessage || !satellite) {
        return (
            <main
                className="
                    min-h-screen
                    bg-[#020914]
                    text-slate-100
                "
            >
                <div
                    className="
                        mx-auto
                        flex
                        min-h-[70vh]
                        w-full
                        max-w-[1680px]
                        items-center
                        justify-center
                        px-4
                    "
                >
                    <section
                        className="
                            w-full
                            max-w-lg
                            rounded-2xl
                            border
                            border-red-400/15
                            bg-[#07111f]/90
                            p-6
                            text-center
                            shadow-[0_0_40px_rgba(255,60,60,0.04)]
                        "
                    >
                        <div
                            className="
                                mx-auto
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-red-400/20
                                bg-red-400/5
                                text-red-300
                            "
                        >
                            !
                        </div>

                        <h1
                            className="
                                mt-4
                                font-['Orbitron']
                                text-sm
                                font-semibold
                                uppercase
                                tracking-[0.16em]
                                text-white
                            "
                        >
                            Satellite Unavailable
                        </h1>

                        <p
                            className="
                                mt-2
                                font-['Inter']
                                text-sm
                                leading-6
                                text-slate-400
                            "
                        >
                            {errorMessage ||
                                "The requested satellite could not be found."}
                        </p>

                        <button
                            type="button"
                            onClick={loadSatellite}
                            className="
                                mt-5
                                rounded-lg
                                border
                                border-cyan-400/30
                                bg-cyan-400/10
                                px-4
                                py-2.5
                                font-['Inter']
                                text-xs
                                font-medium
                                text-cyan-300
                                transition
                                hover:border-cyan-400/50
                                hover:bg-cyan-400/15
                            "
                        >
                            Retry
                        </button>
                    </section>
                </div>
            </main>
        );
    }

    /* ============================================================
       MAIN DETAIL PAGE
    ============================================================ */

    return (
        <main
            className="
                relative
                min-h-screen
                overflow-x-hidden
                bg-[#020914]
                text-slate-100
            "
        >
            {/* =====================================================
                LOCAL SPACE ATMOSPHERE
            ===================================================== */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    top-0
                    z-0
                    h-[700px]
                    overflow-hidden
                "
            >
                <div
                    className="
                        absolute
                        left-[12%]
                        top-[8%]
                        h-[320px]
                        w-[520px]
                        rounded-full
                        bg-cyan-400/[0.025]
                        blur-[130px]
                    "
                />

                <div
                    className="
                        absolute
                        right-[8%]
                        top-[15%]
                        h-[340px]
                        w-[420px]
                        rounded-full
                        bg-blue-500/[0.025]
                        blur-[140px]
                    "
                />

                <div
                    className="
                        absolute
                        inset-x-0
                        top-0
                        h-[260px]
                        bg-gradient-to-b
                        from-[#020617]/30
                        to-transparent
                    "
                />
            </div>

            {/* =====================================================
                PAGE CONTENT
            ===================================================== */}

            <div
                className="
                    relative
                    z-10
                    mx-auto
                    w-full
                    max-w-[1680px]
                    px-3
                    py-3
                    sm:px-5
                    sm:py-4
                    lg:px-7
                    lg:py-5
                    xl:px-8
                "
            >
                {/* =================================================
                    1. SATELLITE HERO
                ================================================= */}

                <SatelliteDetailHero
                    satellite={satellite}
                />

                {/* =================================================
                    2. SATELLITE INFORMATION
                    +
                    3. ORBITAL VISUALIZATION
                ================================================= */}

                <section
                    className="
                        mt-4
                        grid
                        grid-cols-1
                        gap-4
                        xl:grid-cols-12
                    "
                >
                    {/* -------------------------------------------------
                        SATELLITE INFORMATION
                    ------------------------------------------------- */}

                    <div
                        className="
                            min-w-0
                            xl:col-span-7
                        "
                    >
                        <InformationCard
                            satellite={satellite}
                        />
                    </div>

                    {/* -------------------------------------------------
                        ORBITAL VISUALIZATION
                    ------------------------------------------------- */}

                    <div
                        className="
                            min-w-0
                            xl:col-span-5
                        "
                    >
                        <OrbitalVisualCard
                            satellite={satellite}
                        />
                    </div>
                </section>
            </div>
        </main>
    );
};

export default SatelliteDetailPage;