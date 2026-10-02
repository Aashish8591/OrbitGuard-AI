import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import DebrisDetailHero from "../components/DebrisDetailHero";
import DebrisInformationCard from "../components/DebrisInformationCard";
import DebrisOrbitalVisualCard from "../components/DebrisVisualCard";

import debrisService from "../../../services/debrisService";
import { getApiErrorMessage } from "../../../services/api";

/**
 * ================================================================
 * OrbitGuard AI - Debris Detail Page
 * ================================================================
 *
 * Route:
 *
 * /debris/:debrisId
 *
 * Backend source of truth:
 *
 * GET /api/v1/debris/{debrisId}
 *
 * DATA FLOW
 * ----------------------------------------------------------------
 *
 * Debris Registry
 *       ↓
 * /debris/:debrisId
 *       ↓
 * DebrisDetailPage
 *       ↓
 * debrisService.getDebrisById(debrisId)
 *       ↓
 * DebrisResponse
 *       ↓
 * ┌───────────────────────────────┐
 * │ DebrisDetailHero              │
 * │ DebrisInformationCard         │
 * │ DebrisOrbitalVisualCard       │
 * └───────────────────────────────┘
 *
 * RESPONSIBILITIES
 * ----------------------------------------------------------------
 * - Read debrisId from the route
 * - Reset scroll when debrisId changes
 * - Load the selected debris record from the backend
 * - Handle loading state
 * - Handle backend/API errors
 * - Pass the real backend response to child components
 * - Compose the Debris Detail UI
 *
 * IMPORTANT
 * ----------------------------------------------------------------
 * - No dummy debris data
 * - No hardcoded orbital values
 * - No frontend orbital calculations
 * - No Axios/API calls inside presentation components
 * - No duplicate debris request from child components
 * - No edit/deactivate actions
 * - No tabs
 *
 * The backend remains the single source of truth.
 * ================================================================
 */

const DebrisDetailPage = () => {
    const { debrisId } = useParams();

    /* ============================================================
       DEBRIS STATE
    ============================================================ */

    const [debris, setDebris] = useState(null);

    const [isLoading, setIsLoading] = useState(true);

    const [errorMessage, setErrorMessage] = useState("");

    /* ============================================================
       RESET PAGE SCROLL
    ============================================================ */

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto",
        });
    }, [debrisId]);

    /* ============================================================
       LOAD DEBRIS
    ============================================================ */

    const loadDebris = useCallback(async () => {
        if (!debrisId) {
            setDebris(null);
            setErrorMessage("Debris ID is missing.");
            setIsLoading(false);

            return;
        }

        setIsLoading(true);
        setErrorMessage("");

        try {
            /**
             * Backend detail endpoint:
             *
             * GET /api/v1/debris/{debrisId}
             *
             * debrisService is responsible for communicating
             * with the backend and returning the debris response
             * consumed by this page.
             */
            const result =
                await debrisService.getDebrisById(debrisId);

            /**
             * The detail page expects the service to return
             * the actual debris response object.
             */
            if (
                !result ||
                typeof result !== "object" ||
                Array.isArray(result)
            ) {
                throw new Error(
                    "Debris API returned invalid debris data."
                );
            }

            setDebris(result);
        } catch (error) {
            const message = getApiErrorMessage(
                error,
                "Unable to load debris details."
            );

            setDebris(null);
            setErrorMessage(message);

            if (import.meta.env.DEV) {
                console.error(
                    "[DebrisDetailPage] Failed to load debris:",
                    error
                );
            }
        } finally {
            setIsLoading(false);
        }
    }, [debrisId]);

    /* ============================================================
       INITIAL DATA LOAD
    ============================================================ */

    useEffect(() => {
        loadDebris();
    }, [loadDebris]);

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
                        DEBRIS HERO SKELETON
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
                            {/* Breadcrumb */}

                            <div
                                className="
                                    h-3
                                    w-36
                                    rounded
                                    bg-slate-800
                                "
                            />

                            {/* Identity */}

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-5
                                    lg:flex-row
                                    lg:items-center
                                "
                            >
                                {/* Debris image */}

                                <div
                                    className="
                                        h-28
                                        w-28
                                        shrink-0
                                        rounded-xl
                                        bg-slate-800
                                    "
                                />

                                {/* Identity content */}

                                <div
                                    className="
                                        flex-1
                                        space-y-3
                                    "
                                >
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

                                    <div
                                        className="
                                            h-5
                                            w-72
                                            rounded
                                            bg-slate-800
                                        "
                                    />
                                </div>
                            </div>

                            {/* Telemetry */}

                            <div
                                className="
                                    grid
                                    grid-cols-2
                                    gap-3
                                    lg:grid-cols-5
                                "
                            >
                                {[1, 2, 3, 4, 5].map(
                                    (item) => (
                                        <div
                                            key={item}
                                            className="
                                                h-20
                                                rounded-xl
                                                bg-slate-900/80
                                            "
                                        />
                                    )
                                )}
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
                        {/* Debris information */}

                        <div
                            className="
                                h-[420px]
                                animate-pulse
                                rounded-2xl
                                border
                                border-white/5
                                bg-slate-900/50
                                xl:col-span-7
                            "
                        />

                        {/* Orbital visualization */}

                        <div
                            className="
                                h-[420px]
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

    if (errorMessage || !debris) {
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
                        {/* Error icon */}

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
                                font-['Orbitron']
                                text-sm
                                font-semibold
                                text-red-300
                            "
                        >
                            !
                        </div>

                        {/* Error title */}

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
                            Debris Unavailable
                        </h1>

                        {/* Error message */}

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
                                "The requested debris object could not be found."}
                        </p>

                        {/* Retry */}

                        <button
                            type="button"
                            onClick={loadDebris}
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
                    h-[760px]
                    overflow-hidden
                "
            >
                {/* Cyan atmosphere */}

                <div
                    className="
                        absolute
                        left-[10%]
                        top-[8%]
                        h-[340px]
                        w-[540px]
                        rounded-full
                        bg-cyan-400/[0.025]
                        blur-[130px]
                    "
                />

                {/* Blue atmosphere */}

                <div
                    className="
                        absolute
                        right-[7%]
                        top-[12%]
                        h-[360px]
                        w-[440px]
                        rounded-full
                        bg-blue-500/[0.025]
                        blur-[140px]
                    "
                />

                {/* Top fade */}

                <div
                    className="
                        absolute
                        inset-x-0
                        top-0
                        h-[280px]
                        bg-gradient-to-b
                        from-[#020617]/40
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
                    1. DEBRIS DETAIL HERO
                ================================================= */}

                <DebrisDetailHero
                    debris={debris}
                />

                {/* =================================================
                    2. DEBRIS INFORMATION
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
                        DEBRIS INFORMATION
                    ------------------------------------------------- */}

                    <div
                        className="
                            min-w-0
                            xl:col-span-7
                        "
                    >
                        <DebrisInformationCard
                            debris={debris}
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
                        <DebrisOrbitalVisualCard
                            debris={debris}
                        />
                    </div>
                </section>
            </div>
        </main>
    );
};

export default DebrisDetailPage;