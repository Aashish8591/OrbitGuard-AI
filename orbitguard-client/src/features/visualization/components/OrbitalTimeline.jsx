import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

import {
  FiCalendar,
  FiChevronDown,
  FiClock,
  FiPause,
  FiPlay,
} from "react-icons/fi";

/**
 * ============================================================================
 * OrbitGuard AI — Orbital Timeline
 * ============================================================================
 *
 * PURPOSE
 * ----------------------------------------------------------------------------
 *
 * Mission-control style timeline for the 3D orbital visualization.
 *
 * Timeline:
 *
 *          -30m              NOW              +30m
 *            ─────────────────●─────────────────
 *
 * Responsibilities:
 * - timeline scrubbing
 * - play / pause UI state
 * - playback speed UI state
 * - LIVE mode
 * - current orbital time display
 * - visualization date display
 *
 * This component does NOT:
 * - calculate satellite positions
 * - propagate orbital states
 * - call the backend
 * - call CelesTrak
 * - calculate SGP4
 * - calculate Orekit
 * - modify Three.js objects
 *
 * The parent visualization layer remains responsible for applying the
 * requested timeline value to the actual orbital scene.
 *
 * ============================================================================
 */

/* ============================================================================
 * CONSTANTS
 * ========================================================================== */

const DEFAULT_MINUTES = -30;
const DEFAULT_MAX_MINUTES = 30;
const DEFAULT_STEP_MINUTES = 1;
const DEFAULT_VALUE = 0;
const DEFAULT_SPEED = 1;

const SPEED_OPTIONS = Object.freeze([
  0.5,
  1,
  2,
  5,
]);

/* ============================================================================
 * UTILITY FUNCTIONS
 * ========================================================================== */

const clamp = (
  value,
  minimum,
  maximum,
) =>
  Math.min(
    Math.max(
      value,
      minimum,
    ),
    maximum,
  );

const toFiniteNumber = (
  value,
  fallback,
) => {
  const numericValue = Number(value);

  return Number.isFinite(
    numericValue,
  )
    ? numericValue
    : fallback;
};

const formatTime = (date) => {
  if (
    !(date instanceof Date) ||
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "--:--:-- UTC";
  }

  return `${date
    .toISOString()
    .slice(11, 19)} UTC`;
};

const formatDate = (date) => {
  if (
    !(date instanceof Date) ||
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "-- --- ----";
  }

  return date
    .toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      },
    )
    .toUpperCase();
};

const createTimelineDate = (
  baseDate,
  offsetMinutes,
) => {
  if (
    !(baseDate instanceof Date) ||
    Number.isNaN(
      baseDate.getTime(),
    )
  ) {
    return null;
  }

  return new Date(
    baseDate.getTime() +
      offsetMinutes *
        60 *
        1000,
  );
};

const formatOffsetLabel = (
  minutes,
) => {
  if (minutes === 0) {
    return "NOW";
  }

  if (minutes > 0) {
    return `+${minutes}m`;
  }

  return `${minutes}m`;
};

/* ============================================================================
 * TIMELINE MARKER
 * ========================================================================== */

const TimelineMarker = ({
  label,
  position,
  active = false,
}) => (
  <span
    className="
      absolute
      top-[calc(100%+7px)]
      -translate-x-1/2
      whitespace-nowrap
      font-['Orbitron']
      text-[6px]
      uppercase
      tracking-[0.08em]
      sm:text-[7px]
    "
    style={{
      left: `${position}%`,
    }}
  >
    <span
      className={`
        transition-colors
        duration-200
        ${
          active
            ? "text-cyan-300"
            : "text-slate-600"
        }
      `}
    >
      {label}
    </span>
  </span>
);

/* ============================================================================
 * PLAYBACK SPEED SELECTOR
 * ========================================================================== */

const PlaybackSpeedSelector = ({
  value,
  onChange,
  disabled,
}) => (
  <label
    className="
      relative
      flex
      h-9
      shrink-0
      items-center
      rounded-lg
      border
      border-cyan-400/10
      bg-[#04111d]/90
      backdrop-blur-xl
      sm:h-10
    "
  >
    <span className="sr-only">
      Playback speed
    </span>

    <select
      value={value}
      onChange={(event) => {
        const nextValue = Number(
          event.target.value,
        );

        if (
          typeof onChange ===
            "function" &&
          Number.isFinite(
            nextValue,
          )
        ) {
          onChange(nextValue);
        }
      }}
      disabled={disabled}
      className="
        h-full
        cursor-pointer
        appearance-none
        bg-transparent
        pl-3
        pr-7
        font-['Orbitron']
        text-[8px]
        tracking-[0.08em]
        text-slate-300
        outline-none
        disabled:cursor-not-allowed
        disabled:text-slate-700
      "
    >
      {SPEED_OPTIONS.map(
        (speed) => (
          <option
            key={speed}
            value={speed}
            className="
              bg-[#03101b]
              text-slate-200
            "
          >
            {speed}x
          </option>
        ),
      )}
    </select>

    <FiChevronDown
      className="
        pointer-events-none
        absolute
        right-2
        h-3
        w-3
        text-slate-500
      "
      strokeWidth={1.5}
      aria-hidden="true"
    />
  </label>
);

/* ============================================================================
 * ORBITAL TIMELINE
 * ========================================================================== */

const OrbitalTimeline = ({
  value,
  onChange,

  epoch,

  isPlaying,
  onTogglePlay,

  playbackSpeed,
  onPlaybackSpeedChange,

  isLive,
  onLiveChange,

  minMinutes = DEFAULT_MINUTES,
  maxMinutes = DEFAULT_MAX_MINUTES,
  stepMinutes = DEFAULT_STEP_MINUTES,

  disabled = false,

  className = "",
}) => {
  /* ==========================================================================
     ID
     ======================================================================== */

  const sliderId = useId();

  /* ==========================================================================
     INTERNAL FALLBACK STATE
     ======================================================================== */

  const [
    internalValue,
    setInternalValue,
  ] = useState(
    DEFAULT_VALUE,
  );

  const [
    internalPlaying,
    setInternalPlaying,
  ] = useState(false);

  const [
    internalSpeed,
    setInternalSpeed,
  ] = useState(
    DEFAULT_SPEED,
  );

  const [
    internalLive,
    setInternalLive,
  ] = useState(true);

  /* ==========================================================================
     CONTROLLED / UNCONTROLLED DETECTION
     ======================================================================== */

  const valueIsControlled =
    value !== undefined &&
    value !== null;

  const playingIsControlled =
    isPlaying !== undefined &&
    isPlaying !== null;

  const speedIsControlled =
    playbackSpeed !== undefined &&
    playbackSpeed !== null;

  const liveIsControlled =
    isLive !== undefined &&
    isLive !== null;

  /* ==========================================================================
     NORMALIZED RANGE
     ======================================================================== */

  const rawMin = toFiniteNumber(
    minMinutes,
    DEFAULT_MINUTES,
  );

  const rawMax = toFiniteNumber(
    maxMinutes,
    DEFAULT_MAX_MINUTES,
  );

  const normalizedMin = Math.min(
    rawMin,
    rawMax,
  );

  const normalizedMax = Math.max(
    rawMin,
    rawMax,
  );

  const normalizedStep =
    Math.max(
      0.1,
      toFiniteNumber(
        stepMinutes,
        DEFAULT_STEP_MINUTES,
      ),
    );

  /* ==========================================================================
     NORMALIZED CURRENT VALUES
     ======================================================================== */

  const currentValue = clamp(
    toFiniteNumber(
      valueIsControlled
        ? value
        : internalValue,
      DEFAULT_VALUE,
    ),
    normalizedMin,
    normalizedMax,
  );

  const currentPlaying =
    playingIsControlled
      ? Boolean(isPlaying)
      : internalPlaying;

  const currentSpeed = SPEED_OPTIONS.includes(
    toFiniteNumber(
      speedIsControlled
        ? playbackSpeed
        : internalSpeed,
      DEFAULT_SPEED,
    ),
  )
    ? toFiniteNumber(
        speedIsControlled
          ? playbackSpeed
          : internalSpeed,
        DEFAULT_SPEED,
      )
    : DEFAULT_SPEED;

  const currentLive =
    liveIsControlled
      ? Boolean(isLive)
      : internalLive;

  /* ==========================================================================
     BASE EPOCH
     ======================================================================== */

  const normalizedEpoch =
    useMemo(() => {
      if (
        epoch instanceof Date
      ) {
        return Number.isNaN(
          epoch.getTime(),
        )
          ? new Date()
          : epoch;
      }

      if (
        typeof epoch ===
          "string" ||
        typeof epoch ===
          "number"
      ) {
        const parsed = new Date(
          epoch,
        );

        if (
          !Number.isNaN(
            parsed.getTime(),
          )
        ) {
          return parsed;
        }
      }

      return new Date();
    }, [epoch]);

  /* ==========================================================================
     CURRENT TIMELINE DATE
     ======================================================================== */

  const currentTimelineDate =
    useMemo(
      () =>
        createTimelineDate(
          normalizedEpoch,
          currentValue,
        ),
      [
        normalizedEpoch,
        currentValue,
      ],
    );

  const currentTimeLabel =
    formatTime(
      currentTimelineDate,
    );

  const currentDateLabel =
    formatDate(
      currentTimelineDate,
    );

  /* ==========================================================================
     RANGE / NOW POSITION
     ======================================================================== */

  const range =
    normalizedMax -
    normalizedMin;

  const nowIsInsideRange =
    normalizedMin <= 0 &&
    normalizedMax >= 0;

  const sliderPercentage =
    useMemo(() => {
      if (range <= 0) {
        return 50;
      }

      return (
        ((currentValue -
          normalizedMin) /
          range) *
        100
      );
    }, [
      currentValue,
      normalizedMin,
      range,
    ]);

  const nowPercentage =
    useMemo(() => {
      if (
        range <= 0 ||
        !nowIsInsideRange
      ) {
        return 50;
      }

      return (
        ((0 -
          normalizedMin) /
          range) *
        100
      );
    }, [
      normalizedMin,
      range,
      nowIsInsideRange,
    ]);

  /* ==========================================================================
     LIVE SYNCHRONIZATION
     ======================================================================== */

  useEffect(() => {
    if (
      !currentLive ||
      currentValue === 0 ||
      !nowIsInsideRange
    ) {
      return;
    }

    if (!valueIsControlled) {
      setInternalValue(0);
    }

    if (
      typeof onChange ===
      "function"
    ) {
      onChange(0);
    }
  }, [
    currentLive,
    currentValue,
    nowIsInsideRange,
    onChange,
    valueIsControlled,
  ]);

  /* ==========================================================================
     VALUE CHANGE
     ======================================================================== */

  const handleValueChange =
    useCallback(
      (nextValue) => {
        const normalizedValue =
          clamp(
            toFiniteNumber(
              nextValue,
              DEFAULT_VALUE,
            ),
            normalizedMin,
            normalizedMax,
          );

        if (
          !valueIsControlled
        ) {
          setInternalValue(
            normalizedValue,
          );
        }

        const nextLive =
          normalizedValue ===
          0;

        if (
          !liveIsControlled
        ) {
          setInternalLive(
            nextLive,
          );
        }

        if (
          typeof onLiveChange ===
          "function"
        ) {
          onLiveChange(
            nextLive,
          );
        }

        if (
          typeof onChange ===
          "function"
        ) {
          onChange(
            normalizedValue,
          );
        }
      },
      [
        liveIsControlled,
        normalizedMax,
        normalizedMin,
        onChange,
        onLiveChange,
        valueIsControlled,
      ],
    );

  /* ==========================================================================
     SLIDER CHANGE
     ======================================================================== */

  const handleSliderChange =
    useCallback(
      (event) => {
        handleValueChange(
          Number(
            event.target.value,
          ),
        );
      },
      [handleValueChange],
    );

  /* ==========================================================================
     PLAY / PAUSE
     ======================================================================== */

  const handleTogglePlay =
    useCallback(() => {
      const nextPlaying =
        !currentPlaying;

      if (
        !playingIsControlled
      ) {
        setInternalPlaying(
          nextPlaying,
        );
      }

      if (
        typeof onTogglePlay ===
        "function"
      ) {
        onTogglePlay(
          nextPlaying,
        );
      }
    }, [
      currentPlaying,
      onTogglePlay,
      playingIsControlled,
    ]);

  /* ==========================================================================
     SPEED CHANGE
     ======================================================================== */

  const handleSpeedChange =
    useCallback(
      (nextSpeed) => {
        const normalizedSpeed =
          SPEED_OPTIONS.includes(
            nextSpeed,
          )
            ? nextSpeed
            : DEFAULT_SPEED;

        if (
          !speedIsControlled
        ) {
          setInternalSpeed(
            normalizedSpeed,
          );
        }

        if (
          typeof onPlaybackSpeedChange ===
          "function"
        ) {
          onPlaybackSpeedChange(
            normalizedSpeed,
          );
        }
      },
      [
        onPlaybackSpeedChange,
        speedIsControlled,
      ],
    );

  /* ==========================================================================
     LIVE MODE
     ======================================================================== */

  const handleLiveChange =
    useCallback(() => {
      if (
        !nowIsInsideRange
      ) {
        return;
      }

      if (
        !liveIsControlled
      ) {
        setInternalLive(
          true,
        );
      }

      if (
        !valueIsControlled
      ) {
        setInternalValue(0);
      }

      if (
        typeof onLiveChange ===
        "function"
      ) {
        onLiveChange(true);
      }

      if (
        typeof onChange ===
        "function"
      ) {
        onChange(0);
      }

      if (
        currentPlaying
      ) {
        if (
          !playingIsControlled
        ) {
          setInternalPlaying(
            false,
          );
        }

        if (
          typeof onTogglePlay ===
          "function"
        ) {
          onTogglePlay(false);
        }
      }
    }, [
      currentPlaying,
      liveIsControlled,
      nowIsInsideRange,
      onChange,
      onLiveChange,
      onTogglePlay,
      playingIsControlled,
      valueIsControlled,
    ]);

  /* ==========================================================================
     TIMELINE MARKER POSITION
     ======================================================================== */

  const markerPosition =
    useCallback(
      (markerValue) => {
        if (range <= 0) {
          return 50;
        }

        return (
          ((markerValue -
            normalizedMin) /
            range) *
          100
        );
      },
      [
        normalizedMin,
        range,
      ],
    );

  /* ==========================================================================
     TRACK FILL
     ======================================================================== */

  const trackFillStyle =
    useMemo(() => {
      if (
        !nowIsInsideRange
      ) {
        return {
          left: "0%",
          width: `${sliderPercentage}%`,
        };
      }

      const start = Math.min(
        nowPercentage,
        sliderPercentage,
      );

      const end = Math.max(
        nowPercentage,
        sliderPercentage,
      );

      return {
        left: `${start}%`,
        width: `${end - start}%`,
      };
    }, [
      nowIsInsideRange,
      nowPercentage,
      sliderPercentage,
    ]);

  /* ==========================================================================
     RENDER
     ======================================================================== */

  return (
    <section
      aria-label="Orbital timeline"
      className={`
        pointer-events-auto
        w-full
        ${className}
      `}
    >
      <div
        className="
          w-full
          rounded-xl
          border
          border-cyan-400/10
          bg-[#03111d]/90
          px-3
          py-3
          shadow-[0_14px_50px_rgba(0,0,0,0.45)]
          backdrop-blur-xl

          sm:px-4
          sm:py-3

          lg:px-4
        "
      >
        {/* ================================================================
            MOBILE TIME HEADER
            ================================================================ */}

        <div
          className="
            mb-2
            flex
            items-center
            justify-between
            gap-3
            sm:hidden
          "
        >
          <div
            className="
              flex
              min-w-0
              items-center
              gap-2
            "
          >
            <FiClock
              className="
                h-3.5
                w-3.5
                shrink-0
                text-cyan-400
              "
              strokeWidth={1.5}
              aria-hidden="true"
            />

            <span
              className="
                truncate
                font-['Orbitron']
                text-[8px]
                tracking-[0.08em]
                text-slate-400
              "
            >
              ORBITAL TIME
            </span>
          </div>

          <span
            className="
              shrink-0
              font-['Orbitron']
              text-[10px]
              tracking-[0.04em]
              text-slate-200
            "
          >
            {currentTimeLabel}
          </span>
        </div>

        {/* ================================================================
            MAIN TIMELINE LAYOUT
            ================================================================ */}

        <div
          className="
            flex
            flex-col
            gap-3

            sm:flex-row
            sm:items-center
            sm:gap-4
          "
        >
          {/* ==============================================================
              ORBITAL TIME LABEL
              ============================================================== */}

          <div
            className="
              hidden
              shrink-0
              sm:block
              sm:w-[72px]
              lg:w-[88px]
            "
          >
            <div
              className="
                flex
                items-center
                gap-1.5
              "
            >
              <FiCalendar
                className="
                  h-3.5
                  w-3.5
                  shrink-0
                  text-cyan-400
                "
                strokeWidth={1.5}
                aria-hidden="true"
              />

              <span
                className="
                  font-['Orbitron']
                  text-[7px]
                  uppercase
                  tracking-[0.08em]
                  text-slate-400
                  lg:text-[8px]
                "
              >
                ORBITAL TIME
              </span>
            </div>

            <span
              className="
                mt-1
                block
                font-['Orbitron']
                text-[6px]
                uppercase
                tracking-[0.06em]
                text-cyan-400/70
                lg:text-[7px]
              "
            >
              {currentDateLabel}
            </span>
          </div>

          {/* ==============================================================
              TIMELINE CORE
              ============================================================== */}

          <div
            className="
              min-w-0
              flex-1
            "
          >
            {/* ============================================================
                CURRENT TIME
                ============================================================ */}

            <div
              className="
                mb-1
                flex
                items-center
                justify-center
              "
            >
              <span
                aria-live="polite"
                className="
                  font-['Orbitron']
                  text-[10px]
                  tracking-[0.05em]
                  text-slate-200
                  sm:text-[11px]
                  lg:text-xs
                "
              >
                {currentTimeLabel}
              </span>
            </div>

            {/* ============================================================
                RANGE TRACK
                ============================================================ */}

            <div
              className="
                relative
                px-1
                pb-5
                pt-1
              "
            >
              {/* ========================================================
                  TRACK
                  ======================================================== */}

              <div
                className="
                  pointer-events-none
                  absolute
                  left-1
                  right-1
                  top-1/2
                  h-1
                  -translate-y-1/2
                  overflow-hidden
                  rounded-full
                  bg-slate-800/80
                "
                aria-hidden="true"
              >
                <div
                  className="
                    absolute
                    inset-y-0
                    rounded-full
                    bg-cyan-400
                    shadow-[0_0_10px_rgba(34,211,238,0.35)]
                  "
                  style={
                    trackFillStyle
                  }
                />
              </div>

              {/* ========================================================
                  NOW MARKER
                  ======================================================== */}

              {nowIsInsideRange && (
                <span
                  className="
                    pointer-events-none
                    absolute
                    top-1/2
                    z-10
                    h-2.5
                    w-px
                    -translate-y-1/2
                    bg-white/20
                  "
                  style={{
                    left: `${nowPercentage}%`,
                  }}
                  aria-hidden="true"
                />
              )}

              {/* ========================================================
                  RANGE INPUT
                  ======================================================== */}

              <label
                htmlFor={sliderId}
                className="
                  block
                  cursor-pointer
                "
              >
                <span className="sr-only">
                  Orbital timeline
                </span>

                <input
                  id={sliderId}
                  type="range"
                  min={
                    normalizedMin
                  }
                  max={
                    normalizedMax
                  }
                  step={
                    normalizedStep
                  }
                  value={
                    currentValue
                  }
                  onChange={
                    handleSliderChange
                  }
                  disabled={
                    disabled
                  }
                  aria-valuemin={
                    normalizedMin
                  }
                  aria-valuemax={
                    normalizedMax
                  }
                  aria-valuenow={
                    currentValue
                  }
                  aria-label="Orbital timeline position"
                  className="
                    relative
                    z-20
                    block
                    h-3
                    w-full
                    cursor-pointer
                    appearance-none
                    bg-transparent
                    outline-none

                    disabled:cursor-not-allowed

                    [&::-webkit-slider-runnable-track]:h-1
                    [&::-webkit-slider-runnable-track]:rounded-full
                    [&::-webkit-slider-runnable-track]:bg-transparent

                    [&::-webkit-slider-thumb]:mt-[-5px]
                    [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:w-3
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:border-2
                    [&::-webkit-slider-thumb]:border-cyan-100
                    [&::-webkit-slider-thumb]:bg-cyan-400
                    [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(34,211,238,0.8)]

                    [&::-moz-range-track]:h-1
                    [&::-moz-range-track]:rounded-full
                    [&::-moz-range-track]:bg-transparent

                    [&::-moz-range-thumb]:h-3
                    [&::-moz-range-thumb]:w-3
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:border-2
                    [&::-moz-range-thumb]:border-cyan-100
                    [&::-moz-range-thumb]:bg-cyan-400
                    [&::-moz-range-thumb]:shadow-[0_0_12px_rgba(34,211,238,0.8)]

                    focus-visible:[&::-webkit-slider-thumb]:ring-2
                    focus-visible:[&::-webkit-slider-thumb]:ring-cyan-300/30

                    focus-visible:[&::-moz-range-thumb]:ring-2
                    focus-visible:[&::-moz-range-thumb]:ring-cyan-300/30
                  "
                />
              </label>

              {/* ========================================================
                  TIME MARKERS
                  ======================================================== */}

              <TimelineMarker
                label={formatOffsetLabel(
                  normalizedMin,
                )}
                position={markerPosition(
                  normalizedMin,
                )}
              />

              {nowIsInsideRange && (
                <TimelineMarker
                  label="NOW"
                  position={nowPercentage}
                  active={
                    currentValue === 0
                  }
                />
              )}

              <TimelineMarker
                label={formatOffsetLabel(
                  normalizedMax,
                )}
                position={markerPosition(
                  normalizedMax,
                )}
              />
            </div>
          </div>

          {/* ==============================================================
              PLAYBACK CONTROLS
              ============================================================== */}

          <div
            className="
              flex
              items-center
              justify-end
              gap-1.5
              sm:shrink-0
            "
          >
            {/* ============================================================
                PLAY / PAUSE
                ============================================================ */}

            <button
              type="button"
              aria-label={
                currentPlaying
                  ? "Pause timeline"
                  : "Play timeline"
              }
              aria-pressed={
                currentPlaying
              }
              title={
                currentPlaying
                  ? "Pause timeline"
                  : "Play timeline"
              }
              onClick={
                handleTogglePlay
              }
              disabled={disabled}
              className="
                group
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-cyan-400/25
                bg-cyan-400/[0.07]
                text-cyan-300
                shadow-[0_0_18px_rgba(34,211,238,0.08)]
                transition-all
                duration-200

                hover:border-cyan-300/50
                hover:bg-cyan-400/[0.12]

                active:scale-95

                disabled:cursor-not-allowed
                disabled:border-white/[0.05]
                disabled:bg-white/[0.02]
                disabled:text-slate-700

                focus-visible:outline-none
                focus-visible:ring-1
                focus-visible:ring-cyan-400/70
              "
            >
              {currentPlaying ? (
                <FiPause
                  className="h-4 w-4"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              ) : (
                <FiPlay
                  className="
                    ml-0.5
                    h-4
                    w-4
                  "
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              )}
            </button>

            {/* ============================================================
                SPEED
                ============================================================ */}

            <PlaybackSpeedSelector
              value={
                currentSpeed
              }
              onChange={
                handleSpeedChange
              }
              disabled={
                disabled
              }
            />

            {/* ============================================================
                LIVE
                ============================================================ */}

            <button
              type="button"
              aria-label="Return to live orbital time"
              aria-pressed={
                currentLive
              }
              onClick={
                handleLiveChange
              }
              disabled={
                disabled ||
                currentLive ||
                !nowIsInsideRange
              }
              className={`
                flex
                h-9
                shrink-0
                items-center
                rounded-lg
                border
                px-3
                font-['Orbitron']
                text-[8px]
                tracking-[0.08em]
                transition-all
                duration-200

                sm:h-10

                focus-visible:outline-none
                focus-visible:ring-1
                focus-visible:ring-cyan-400/70

                ${
                  currentLive
                    ? `
                      border-cyan-400/25
                      bg-cyan-400/[0.08]
                      text-cyan-300
                      shadow-[0_0_16px_rgba(34,211,238,0.07)]
                    `
                    : `
                      border-slate-700/60
                      bg-[#04111d]/90
                      text-slate-400

                      hover:border-cyan-400/25
                      hover:text-cyan-300
                    `
                }

                ${
                  disabled ||
                  !nowIsInsideRange
                    ? `
                      cursor-not-allowed
                      opacity-50
                    `
                    : currentLive
                      ? "cursor-default"
                      : "cursor-pointer"
                }
              `}
            >
              LIVE
            </button>
          </div>
        </div>

        {/* ================================================================
            TIMELINE STATUS
            ================================================================ */}

        <div
          className="
            mt-2
            flex
            items-center
            justify-between
            gap-3
            border-t
            border-cyan-400/[0.06]
            pt-2
          "
        >
          <div
            className="
              flex
              min-w-0
              items-center
              gap-1.5
            "
          >
            <span
              className={`
                h-1.5
                w-1.5
                shrink-0
                rounded-full
                ${
                  currentLive
                    ? `
                      bg-emerald-400
                      shadow-[0_0_7px_rgba(52,211,153,0.75)]
                    `
                    : `
                      bg-amber-400
                      shadow-[0_0_7px_rgba(251,191,36,0.55)]
                    `
                }
              `}
              aria-hidden="true"
            />

            <span
              className="
                truncate
                font-['Orbitron']
                text-[6px]
                uppercase
                tracking-[0.1em]
                text-slate-600
                sm:text-[7px]
              "
            >
              {currentLive
                ? "LIVE EPOCH"
                : "TIMELINE PREVIEW"}
            </span>
          </div>

          <span
            className="
              shrink-0
              font-['Inter']
              text-[7px]
              text-slate-600
              sm:text-[8px]
            "
          >
            {currentDateLabel}
          </span>
        </div>
      </div>
    </section>
  );
};

export default OrbitalTimeline;