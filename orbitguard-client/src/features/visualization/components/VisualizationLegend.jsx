import { useState } from "react";

import {
  FiAlertTriangle,
  FiChevronDown,
  FiLayers,
  FiRadio,
} from "react-icons/fi";

/**
 * ============================================================================
 * OrbitGuard AI — Visualization Legend
 * ============================================================================
 *
 * PURPOSE
 * ----------------------------------------------------------------------------
 *
 * Provides the semantic visual language used by the orbital scene.
 *
 * Satellite → Cyan
 * Debris   → Amber
 * High Risk → Red
 * Selected → White / Cyan
 *
 * IMPORTANT
 * ----------------------------------------------------------------------------
 *
 * This component intentionally DOES NOT control its workspace position.
 *
 * Visualization.jsx is responsible for placing the legend inside the
 * visualization workspace.
 *
 * Therefore this component does NOT use:
 *
 * - fixed
 * - absolute
 * - sticky
 *
 * ============================================================================
 */

/* ============================================================================
 * LEGEND DATA
 * ========================================================================== */

const LEGEND_ITEMS = Object.freeze([
  {
    id: "satellite",
    label: "Satellite",
    description: "Tracked orbital satellite",
    color: "cyan",
    icon: "satellite",
  },

  {
    id: "debris",
    label: "Debris",
    description: "Tracked space debris",
    color: "amber",
    icon: "debris",
  },

  {
    id: "high-risk",
    label: "High Risk",
    description: "Elevated collision risk",
    color: "red",
    icon: "risk",
  },

  {
    id: "selected",
    label: "Selected",
    description: "Currently inspected object",
    color: "selected",
    icon: "selected",
  },
]);

/* ============================================================================
 * COLORS
 * ========================================================================== */

const COLOR_CONFIG = Object.freeze({
  cyan: {
    dot: "bg-cyan-400",
    glow: "shadow-[0_0_7px_rgba(34,211,238,0.65)]",
    text: "text-cyan-200",
  },

  amber: {
    dot: "bg-amber-400",
    glow: "shadow-[0_0_7px_rgba(251,191,36,0.65)]",
    text: "text-amber-200",
  },

  red: {
    dot: "bg-red-400",
    glow: "shadow-[0_0_7px_rgba(248,113,113,0.65)]",
    text: "text-red-200",
  },

  selected: {
    dot: "bg-white",
    glow: "shadow-[0_0_8px_rgba(255,255,255,0.8)]",
    text: "text-slate-100",
  },
});

/* ============================================================================
 * LEGEND ICON
 * ========================================================================== */

const LegendIcon = ({
  type,
  color,
}) => {
  const config =
    COLOR_CONFIG[color] ??
    COLOR_CONFIG.cyan;

  /* --------------------------------------------------------------------------
   * SATELLITE
   * ------------------------------------------------------------------------ */

  if (type === "satellite") {
    return (
      <span
        className="
          relative
          flex
          h-4
          w-4
          shrink-0
          items-center
          justify-center
        "
        aria-hidden="true"
      >
        <FiRadio
          className={`
            h-3.5
            w-3.5
            ${config.text}
          `}
          strokeWidth={1.5}
        />

        <span
          className={`
            absolute
            h-1
            w-1
            rounded-full
            ${config.dot}
            ${config.glow}
          `}
        />
      </span>
    );
  }

  /* --------------------------------------------------------------------------
   * DEBRIS
   * ------------------------------------------------------------------------ */

  if (type === "debris") {
    return (
      <span
        className="
          flex
          h-4
          w-4
          shrink-0
          items-center
          justify-center
        "
        aria-hidden="true"
      >
        <span
          className={`
            h-[7px]
            w-[7px]
            rotate-45
            rounded-[1.5px]
            ${config.dot}
            ${config.glow}
          `}
        />
      </span>
    );
  }

  /* --------------------------------------------------------------------------
   * HIGH RISK
   * ------------------------------------------------------------------------ */

  if (type === "risk") {
    return (
      <span
        className="
          flex
          h-4
          w-4
          shrink-0
          items-center
          justify-center
        "
        aria-hidden="true"
      >
        <FiAlertTriangle
          className={`
            h-3.5
            w-3.5
            ${config.text}
          `}
          strokeWidth={1.6}
        />
      </span>
    );
  }

  /* --------------------------------------------------------------------------
   * SELECTED
   * ------------------------------------------------------------------------ */

  return (
    <span
      className="
        flex
        h-4
        w-4
        shrink-0
        items-center
        justify-center
      "
      aria-hidden="true"
    >
      <span
        className="
          relative
          flex
          h-3.5
          w-3.5
          items-center
          justify-center
          rounded-full
          border
          border-cyan-300/80
        "
      >
        <span
          className="
            absolute
            h-[7px]
            w-[7px]
            rounded-full
            border
            border-white/80
          "
        />

        <span
          className={`
            h-[4px]
            w-[4px]
            rounded-full
            ${config.dot}
            ${config.glow}
          `}
        />
      </span>
    </span>
  );
};

/* ============================================================================
 * LEGEND ITEM
 * ========================================================================== */

const LegendItem = ({
  item,
}) => {
  const config =
    COLOR_CONFIG[item.color] ??
    COLOR_CONFIG.cyan;

  return (
    <div
      className="
        flex
        min-w-0
        items-center
        gap-2
        rounded-md
        px-1.5
        py-1.5
        transition-colors
        duration-150
        hover:bg-white/[0.025]
      "
      title={item.description}
    >
      <LegendIcon
        type={item.icon}
        color={item.color}
      />

      <span
        className={`
          min-w-0
          truncate
          font-['Inter']
          text-[9px]
          font-medium
          leading-none
          ${config.text}
          sm:text-[10px]
        `}
      >
        {item.label}
      </span>
    </div>
  );
};

/* ============================================================================
 * VISUALIZATION LEGEND
 * ========================================================================== */

const VisualizationLegend = ({
  items = LEGEND_ITEMS,
  defaultOpen = true,
  collapsible = true,
  className = "",
}) => {
  const [
    isOpen,
    setIsOpen,
  ] = useState(defaultOpen);

  const safeItems =
    Array.isArray(items) &&
    items.length > 0
      ? items
      : LEGEND_ITEMS;

  const contentOpen =
    collapsible
      ? isOpen
      : true;

  return (
    <aside
      aria-label="Visualization legend"
      className={`
        pointer-events-auto
        w-[178px]
        max-w-[calc(100vw-24px)]
        sm:w-[190px]
        ${className}
      `}
    >
      <div
        className="
          overflow-hidden
          rounded-lg
          border
          border-cyan-400/[0.12]
          bg-[#03101b]/90
          shadow-[0_12px_32px_rgba(0,0,0,0.38)]
          backdrop-blur-xl
        "
      >
        {/* ================================================================
            HEADER
            ================================================================ */}

        <button
          type="button"
          onClick={() => {
            if (!collapsible) {
              return;
            }

            setIsOpen(
              (current) =>
                !current,
            );
          }}
          aria-expanded={
            contentOpen
          }
          aria-controls="visualization-legend-content"
          disabled={!collapsible}
          className={`
            flex
            min-h-[30px]
            w-full
            items-center
            justify-between
            gap-2
            border-b
            border-cyan-400/[0.07]
            px-2.5
            py-1.5
            text-left

            ${
              collapsible
                ? `
                  cursor-pointer
                  hover:bg-white/[0.025]
                `
                : "cursor-default"
            }

            focus-visible:outline-none
            focus-visible:ring-1
            focus-visible:ring-inset
            focus-visible:ring-cyan-400/60

            disabled:pointer-events-none
          `}
        >
          <span
            className="
              flex
              min-w-0
              items-center
              gap-1.5
            "
          >
            <FiLayers
              className="
                h-3
                w-3
                shrink-0
                text-cyan-400/80
              "
              strokeWidth={1.6}
              aria-hidden="true"
            />

            <span
              className="
                truncate
                font-['Orbitron']
                text-[7px]
                font-medium
                uppercase
                tracking-[0.16em]
                text-slate-400
                sm:text-[8px]
              "
            >
              LEGEND
            </span>
          </span>

          {collapsible && (
            <FiChevronDown
              className={`
                h-3
                w-3
                shrink-0
                text-slate-600
                transition-transform
                duration-200
                ${
                  contentOpen
                    ? "rotate-180"
                    : ""
                }
              `}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          )}
        </button>

        {/* ================================================================
            CONTENT
            ================================================================ */}

        <div
          id="visualization-legend-content"
          className={`
            overflow-hidden
            transition-[max-height,opacity]
            duration-200
            ease-out

            ${
              contentOpen
                ? "max-h-[150px] opacity-100"
                : "max-h-0 opacity-0"
            }
          `}
        >
          <div
            className="
              px-1.5
              py-1.5
            "
          >
            <div
              className="
                grid
                grid-cols-2
                gap-0.5
              "
            >
              {safeItems.map(
                (item) => (
                  <LegendItem
                    key={
                      item.id
                    }
                    item={
                      item
                    }
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default VisualizationLegend;