
import { memo } from "react";

import {
  FiGlobe,
  FiShield,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI — Professional Guidance
 * ================================================================
 *
 * RESPONSIBILITIES
 * - Display the professional-use disclaimer.
 * - Maintain the right-sidebar visual design.
 * - Prevent content overflow and awkward text wrapping.
 * - Keep spacing compact across screen sizes.
 *
 * Presentation only. Does not validate operational decisions.
 * ================================================================
 */

const DEFAULT_TITLE = "Professional Guidance";

const DEFAULT_DESCRIPTION =
  "OrbitGuard AI provides general information and explanations. " +
  "It does not replace official mission analysis, real-time data, " +
  "or operational decision-making.";

const ProfessionalGuidance = memo(function ProfessionalGuidance({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
}) {
  const safeTitle =
    typeof title === "string" && title.trim()
      ? title.trim()
      : DEFAULT_TITLE;

  const safeDescription =
    typeof description === "string"
      ? description.trim()
      : DEFAULT_DESCRIPTION;

  return (
    <section
      aria-labelledby="professional-guidance-heading"
      className="
        relative
        isolate
        w-full
        min-w-0
        rounded-xl
        border
        border-cyan-500/20
        bg-gradient-to-br
        from-[#071626]/95
        via-[#081523]/95
        to-[#040c17]/95
        p-3
        shadow-[0_8px_28px_rgba(0,0,0,0.16)]
        sm:rounded-2xl
        sm:p-3.5
      "
    >
      {/* SUBTLE AMBIENT LIGHT */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-8
          -top-8
          -z-10
          h-24
          w-24
          rounded-full
          bg-cyan-400/[0.06]
          blur-3xl
        "
      />

      {/* GUIDANCE HEADER */}

      <header className="relative min-w-0">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="
              relative
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-cyan-400/20
              bg-[#071b2c]
              text-cyan-300
              shadow-[0_0_12px_rgba(34,211,238,0.08)]
            "
            aria-hidden="true"
          >
            <FiGlobe className="h-[17px] w-[17px]" />

            <span
              className="
                absolute
                -right-0.5
                top-0
                h-1.5
                w-1.5
                rounded-full
                bg-cyan-300
                shadow-[0_0_6px_rgba(34,211,238,0.7)]
              "
            />
          </div>

          <h2
            id="professional-guidance-heading"
            className="
              min-w-0
              flex-1
              font-['Orbitron']
              text-[10px]
              font-semibold
              leading-[1.6]
              tracking-wide
              text-slate-100
              sm:text-[11px]
            "
          >
            {safeTitle}
          </h2>
        </div>

        {/* HEADING ACCENT */}

        <div
          aria-hidden="true"
          className="
            ml-10
            mt-1.5
            h-px
            w-12
            bg-gradient-to-r
            from-cyan-400
            to-transparent
          "
        />
      </header>

      {/* PROFESSIONAL DISCLAIMER */}

      <div className="relative mt-2.5 flex min-w-0 items-start gap-2">
        <FiShield
          aria-hidden="true"
          className="
            mt-0.5
            h-3.5
            w-3.5
            shrink-0
            text-cyan-400/75
          "
        />

        <p
          className="
            min-w-0
            flex-1
            font-['Inter']
            text-[11px]
            leading-[1.65]
            text-slate-300
            [overflow-wrap:anywhere]
          "
        >
          {safeDescription || DEFAULT_DESCRIPTION}
        </p>
      </div>
    </section>
  );
});

ProfessionalGuidance.displayName = "ProfessionalGuidance";

export default ProfessionalGuidance;
