
import { memo, useMemo } from "react";

import {
  FiCheckCircle,
  FiSettings,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI — Capabilities Panel
 * ================================================================
 *
 * RESPONSIBILITIES
 * - Display supported AI capability areas.
 * - Preserve the OrbitGuard mission-control visual identity.
 * - Keep content compact, readable, and responsive.
 *
 * Presentation only. No backend requests or operational claims.
 * ================================================================
 */

const DEFAULT_CAPABILITIES = Object.freeze([
  "Satellite and orbital domain knowledge",
  "Clear technical explanations",
  "Collision risk and debris insights",
  "Educational and analytical support",
  "Mission operations guidance",
]);

const CapabilitiesPanel = memo(function CapabilitiesPanel({
  capabilities = DEFAULT_CAPABILITIES,
}) {
  const items = useMemo(() => {
    const source = Array.isArray(capabilities)
      ? capabilities
      : DEFAULT_CAPABILITIES;

    return [
      ...new Set(
        source
          .filter(
            (item) =>
              typeof item === "string" &&
              item.trim().length > 0,
          )
          .map((item) => item.trim()),
      ),
    ];
  }, [capabilities]);

  return (
    <section
      aria-labelledby="ai-capabilities-heading"
      className="
        relative
        w-full
        min-w-0
        rounded-xl
        border
        border-cyan-500/25
        bg-[#061321]/95
        p-3
        shadow-[0_0_22px_rgba(0,190,255,0.035)]
        sm:rounded-2xl
        sm:p-3.5
      "
    >
      {/* PANEL HEADER */}

      <header className="mb-3 flex min-w-0 items-center gap-2">
        <FiSettings
          aria-hidden="true"
          className="
            h-[18px]
            w-[18px]
            shrink-0
            text-cyan-400
            drop-shadow-[0_0_7px_rgba(34,211,238,0.3)]
            sm:h-5
            sm:w-5
          "
        />

        <h2
          id="ai-capabilities-heading"
          className="
            min-w-0
            font-['Orbitron']
            text-[11px]
            font-semibold
            leading-5
            tracking-wide
            text-slate-100
          "
        >
          Capabilities
        </h2>
      </header>

      {/* CAPABILITY LIST */}

      {items.length > 0 ? (
        <ul className="flex min-w-0 flex-col gap-2.5 sm:gap-3">
          {items.map((capability) => (
            <li
              key={capability}
              className="group flex min-w-0 items-start gap-2"
            >
              <FiCheckCircle
                aria-hidden="true"
                className="
                  mt-0.5
                  h-4
                  w-4
                  shrink-0
                  text-emerald-400
                  transition-colors
                  duration-200
                  group-hover:text-emerald-300
                "
              />

              <span
                className="
                  min-w-0
                  flex-1
                  font-['Inter']
                  text-[11px]
                  leading-[1.55]
                  text-slate-300
                  transition-colors
                  duration-200
                  group-hover:text-slate-100
                  [overflow-wrap:break-word]
                "
              >
                {capability}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p
          role="status"
          className="
            py-2
            font-['Inter']
            text-xs
            leading-5
            text-slate-400
          "
        >
          No capabilities available.
        </p>
      )}
    </section>
  );
});

CapabilitiesPanel.displayName = "CapabilitiesPanel";

export default CapabilitiesPanel;
