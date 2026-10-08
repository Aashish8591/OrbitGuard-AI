import { useCallback, useEffect, useRef, useState } from "react";

import {
  FiCrosshair,
  FiMaximize,
  FiMinus,
  FiPlus,
  FiRefreshCw,
} from "react-icons/fi";

/**
 * ============================================================================
 * OrbitGuard AI — Visualization Camera Controls
 * ============================================================================
 *
 * PURPOSE
 * ----------------------------------------------------------------------------
 *
 * Compact presentation controls for the 3D orbital command center.
 *
 * Controls:
 * - Focus selected object
 * - Zoom in
 * - Zoom out
 * - Reset camera
 * - Fullscreen
 *
 * ============================================================================
 * ARCHITECTURE
 * ============================================================================
 *
 * This component does NOT:
 *
 * - access Three.js
 * - create a camera
 * - create OrbitControls
 * - manipulate orbital coordinates
 * - calculate object positions
 *
 * Camera behavior remains owned by VisualizationScene.
 *
 * Fullscreen is a browser UI concern and is handled safely here.
 *
 * ============================================================================
 */

const CameraControlButton = ({
  label,
  ariaLabel,
  icon: Icon,
  onClick,
  disabled = false,
  active = false,
}) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`
        group
        relative
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center
        rounded-lg
        border
        transition-all
        duration-200

        sm:h-10
        sm:w-10

        lg:h-11
        lg:w-11

        ${
          disabled
            ? `
              cursor-not-allowed
              border-white/[0.05]
              bg-[#04111d]/40
              text-slate-700
            `
            : `
              cursor-pointer
              border-cyan-400/10
              bg-[#04111d]/90
              text-slate-400
              shadow-[0_8px_24px_rgba(0,0,0,0.32)]
              backdrop-blur-xl

              hover:border-cyan-400/30
              hover:bg-cyan-400/[0.07]
              hover:text-cyan-300

              active:scale-[0.96]
            `
        }

        ${
          active
            ? `
              border-cyan-400/35
              bg-cyan-400/[0.09]
              text-cyan-300
              shadow-[0_0_18px_rgba(34,211,238,0.10)]
            `
            : ""
        }

        focus-visible:outline-none
        focus-visible:ring-1
        focus-visible:ring-cyan-400/70
        focus-visible:ring-offset-0
      `}
    >
      <Icon
        className="
          h-4
          w-4
          transition-transform
          duration-200

          group-hover:scale-105

          sm:h-[17px]
          sm:w-[17px]
        "
        strokeWidth={1.5}
        aria-hidden="true"
      />

      {active && !disabled && (
        <span
          className="
            absolute
            right-1.5
            top-1.5
            h-1
            w-1
            rounded-full
            bg-cyan-300
            shadow-[0_0_6px_rgba(103,232,249,0.9)]
          "
          aria-hidden="true"
        />
      )}
    </button>
  );
};

/* ============================================================================
 * CAMERA CONTROLS
 * ========================================================================== */

const CameraControls = ({
  onZoomIn,
  onZoomOut,
  onFocusSelected,
  onReset,

  /**
   * Optional external fullscreen callback.
   *
   * If Visualization.jsx provides this callback, it will be used.
   *
   * If it does not, this component uses the browser Fullscreen API
   * automatically on the nearest visualization <main> container.
   */
  onFullscreen,

  hasSelectedObject = false,

  fullscreen: controlledFullscreen,

  disabled = false,

  className = "",
}) => {
  const controlsRef = useRef(null);

  /**
   * Internal fullscreen state.
   *
   * This allows the component to work even when Visualization.jsx
   * does not yet provide an onFullscreen callback.
   */
  const [internalFullscreen, setInternalFullscreen] = useState(false);

  /**
   * If the parent controls fullscreen state, use that state.
   * Otherwise use our internal browser fullscreen state.
   */
  const fullscreen =
    typeof controlledFullscreen === "boolean"
      ? controlledFullscreen
      : internalFullscreen;

  /* ==========================================================================
   * FIND VISUALIZATION CONTAINER
   * ======================================================================== */

  const getFullscreenTarget = useCallback(() => {
    const controlsElement = controlsRef.current;

    if (!controlsElement) {
      return null;
    }

    /**
     * Current Visualization.jsx structure places CameraControls inside
     * the visualization <main> area.
     *
     * Prefer the closest main element so we fullscreen the visualization
     * area rather than the entire browser document.
     */
    const mainElement = controlsElement.closest("main");

    if (mainElement) {
      return mainElement;
    }

    /**
     * Fallback:
     *
     * Walk upward until we find a sufficiently large container.
     *
     * This protects the component if the surrounding JSX changes slightly.
     */
    let current = controlsElement.parentElement;

    while (current) {
      const rect = current.getBoundingClientRect();

      if (rect.width > 500 && rect.height > 300) {
        return current;
      }

      current = current.parentElement;
    }

    return null;
  }, []);

  /* ==========================================================================
   * FULLSCREEN STATE SYNCHRONIZATION
   * ======================================================================== */

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = Boolean(document.fullscreenElement);

      setInternalFullscreen(isFullscreen);
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    /**
     * Initial synchronization.
     */
    setInternalFullscreen(
      Boolean(document.fullscreenElement)
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  /* ==========================================================================
   * SAFE CALLBACKS
   * ======================================================================== */

  const handleZoomIn = () => {
    if (
      disabled ||
      typeof onZoomIn !== "function"
    ) {
      return;
    }

    onZoomIn();
  };

  const handleZoomOut = () => {
    if (
      disabled ||
      typeof onZoomOut !== "function"
    ) {
      return;
    }

    onZoomOut();
  };

  const handleFocusSelected = () => {
    if (
      disabled ||
      !hasSelectedObject ||
      typeof onFocusSelected !== "function"
    ) {
      return;
    }

    onFocusSelected();
  };

  const handleReset = () => {
    if (
      disabled ||
      typeof onReset !== "function"
    ) {
      return;
    }

    onReset();
  };

  /* ==========================================================================
   * FULLSCREEN
   * ======================================================================== */

  const handleFullscreen = async () => {
    if (disabled) {
      return;
    }

    /**
     * If parent already supplies its own fullscreen behavior,
     * preserve that existing contract.
     */
    if (typeof onFullscreen === "function") {
      onFullscreen();
      return;
    }

    /**
     * Browser Fullscreen API is not available.
     */
    if (
      typeof document === "undefined" ||
      !document.fullscreenEnabled
    ) {
      return;
    }

    try {
      /**
       * Currently fullscreen?
       *
       * Exit it.
       */
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      /**
       * Find the visualization container.
       */
      const target = getFullscreenTarget();

      if (!target) {
        return;
      }

      /**
       * Enter native browser fullscreen.
       */
      await target.requestFullscreen();
    } catch (error) {
      /**
       * Fullscreen can be rejected by the browser because of:
       *
       * - browser restrictions
       * - iframe permissions
       * - user gesture restrictions
       *
       * Do not throw the error into the React render tree.
       */
      setInternalFullscreen(
        Boolean(document.fullscreenElement)
      );
    }
  };

  /* ==========================================================================
   * RENDER
   * ======================================================================== */

  return (
    <div
      ref={controlsRef}
      className={`
        pointer-events-auto

        absolute
        bottom-5
        right-4
        z-30

        flex
        flex-row
        items-center
        gap-1.5

        sm:bottom-6
        sm:right-5
        sm:gap-2

        lg:bottom-7
        lg:right-6

        ${className}
      `}
      aria-label="3D camera controls"
    >
      {/* ==================================================================
          FOCUS SELECTED OBJECT
          ================================================================== */}

      <CameraControlButton
        label={
          hasSelectedObject
            ? "Focus selected object"
            : "Select an object to focus"
        }
        ariaLabel={
          hasSelectedObject
            ? "Focus selected object"
            : "Select an object to focus"
        }
        icon={FiCrosshair}
        onClick={handleFocusSelected}
        disabled={
          disabled ||
          !hasSelectedObject
        }
        active={hasSelectedObject}
      />

      {/* ==================================================================
          ZOOM IN
          ================================================================== */}

      <CameraControlButton
        label="Zoom in"
        ariaLabel="Zoom in"
        icon={FiPlus}
        onClick={handleZoomIn}
        disabled={disabled}
      />

      {/* ==================================================================
          ZOOM OUT
          ================================================================== */}

      <CameraControlButton
        label="Zoom out"
        ariaLabel="Zoom out"
        icon={FiMinus}
        onClick={handleZoomOut}
        disabled={disabled}
      />

      {/* ==================================================================
          RESET CAMERA
          ================================================================== */}

      <CameraControlButton
        label="Reset camera"
        ariaLabel="Reset camera"
        icon={FiRefreshCw}
        onClick={handleReset}
        disabled={
          disabled ||
          typeof onReset !== "function"
        }
      />

      {/* ==================================================================
          FULLSCREEN
          ================================================================== */}

      <CameraControlButton
        label={
          fullscreen
            ? "Exit fullscreen"
            : "Enter fullscreen"
        }
        ariaLabel={
          fullscreen
            ? "Exit fullscreen"
            : "Enter fullscreen"
        }
        icon={FiMaximize}
        onClick={handleFullscreen}
        disabled={disabled}
        active={fullscreen}
      />
    </div>
  );
};

export default CameraControls;