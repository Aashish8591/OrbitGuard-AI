
import {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  FiChevronRight,
  FiSun,
  FiRefreshCw,
} from "react-icons/fi";

import { useReducedMotion } from "framer-motion";

/**
 * ================================================================
 * OrbitGuard AI — Suggested Questions
 * ================================================================
 *
 * RESPONSIBILITIES
 * - Display suggested orbital-intelligence questions.
 * - Allow the user to select a suggested question.
 * - Rotate through locally supplied questions when possible.
 * - Delegate external refresh behavior to the parent.
 *
 * INTEGRATION
 * - Does not call Axios or the AI backend.
 * - Does not generate AI responses.
 * - Does not submit messages directly.
 * - Parent owns message submission and API communication.
 *
 * PROPS
 * - onSelectQuestion(question): called when a question is selected.
 * - questions: optional array of suggested question strings.
 * - onRefresh(): optional parent-controlled refresh callback.
 * - disabled: prevents selection and refresh actions.
 * ================================================================
 */

const DEFAULT_QUESTIONS = Object.freeze([
  "What is orbital debris?",
  "How do satellites avoid collisions?",
  "Explain orbital inclination.",
  "What is conjunction analysis?",
  "How accurate are TLE data?",
  "What are debris mitigation guidelines?",
]);

const MAX_VISIBLE_QUESTIONS = 6;

const normalizeQuestions = (source) => {
  if (!Array.isArray(source)) {
    return [];
  }

  return [
    ...new Set(
      source
        .filter(
          (question) =>
            typeof question === "string" &&
            question.trim().length > 0,
        )
        .map((question) => question.trim()),
    ),
  ];
};

const SuggestedQuestions = memo(
  function SuggestedQuestions({
    onSelectQuestion,
    questions,
    onRefresh,
    disabled = false,
  }) {
    const shouldReduceMotion = useReducedMotion();

    const [refreshIndex, setRefreshIndex] = useState(0);
    const [rotation, setRotation] = useState(0);

    /**
     * If questions is omitted, use the built-in suggestions.
     * An explicitly supplied [] remains an empty list.
     */
    const availableQuestions = useMemo(() => {
      const source =
        questions === undefined
          ? DEFAULT_QUESTIONS
          : questions;

      return normalizeQuestions(source);
    }, [questions]);

    /**
     * Keep the displayed questions within the configured limit.
     * Rotate through the supplied list when enough questions exist.
     */
    const visibleQuestions = useMemo(() => {
      const count = Math.min(
        MAX_VISIBLE_QUESTIONS,
        availableQuestions.length,
      );

      if (count === 0) {
        return [];
      }

      const start =
        refreshIndex % availableQuestions.length;

      return Array.from(
        { length: count },
        (_, index) =>
          availableQuestions[
            (start + index) % availableQuestions.length
          ],
      );
    }, [availableQuestions, refreshIndex]);

    /**
     * Selection is delegated to the parent.
     * This component never sends an API request itself.
     */
    const handleQuestionSelect = useCallback(
      (question) => {
        if (
          disabled ||
          typeof onSelectQuestion !== "function"
        ) {
          return;
        }

        onSelectQuestion(question);
      },
      [disabled, onSelectQuestion],
    );

    /**
     * Refresh behavior:
     *
     * 1. If the parent provides onRefresh, delegate refresh to it.
     * 2. Otherwise, rotate the local list when more than six
     *    distinct suggestions are available.
     * 3. Do not animate or imply a refresh when nothing can change.
     */
    const handleRefresh = useCallback(() => {
      if (disabled) {
        return;
      }

      if (typeof onRefresh === "function") {
        setRotation((current) => current + 180);
        onRefresh();
        return;
      }

      if (
        availableQuestions.length <=
        MAX_VISIBLE_QUESTIONS
      ) {
        return;
      }

      setRotation((current) => current + 180);

      setRefreshIndex(
        (current) =>
          (current + MAX_VISIBLE_QUESTIONS) %
          availableQuestions.length,
      );
    }, [
      disabled,
      onRefresh,
      availableQuestions.length,
    ]);

    const canSelectQuestions =
      !disabled &&
      typeof onSelectQuestion === "function";

    const canRefresh =
      !disabled &&
      (
        typeof onRefresh === "function" ||
        availableQuestions.length > MAX_VISIBLE_QUESTIONS
      );

    const hasQuestions =
      visibleQuestions.length > 0;

    return (
      <section
        aria-labelledby="suggested-questions-heading"
        aria-busy={disabled}
        className="
          flex
          w-full
          min-w-0
          flex-col
          rounded-xl
          border
          border-cyan-500/25
          bg-[#061321]/95
          p-2.5
          shadow-[0_0_22px_rgba(0,190,255,0.035)]
          sm:rounded-2xl
          sm:p-3
        "
      >
        {/* COMPACT HEADER */}

        <div
          className="
            flex
            min-w-0
            shrink-0
            items-center
            justify-between
            gap-2
            pb-2
          "
        >
          <div className="flex min-w-0 items-center gap-2">
            <FiSun
              aria-hidden="true"
              className="
                h-4
                w-4
                shrink-0
                text-cyan-300
                sm:h-[18px]
                sm:w-[18px]
              "
            />

            <h2
              id="suggested-questions-heading"
              className="
                min-w-0
                font-['Orbitron']
                text-[10px]
                font-semibold
                leading-4
                tracking-wide
                text-slate-100
                sm:text-[11px]
              "
            >
              Suggested Questions
            </h2>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={!canRefresh}
            aria-label="Refresh suggested questions"
            title={
              !canRefresh && !disabled
                ? "No additional suggestions to display"
                : "Refresh suggestions"
            }
            className="
              inline-flex
              h-7
              shrink-0
              items-center
              justify-center
              gap-1
              rounded-lg
              border
              border-cyan-500/35
              px-2
              font-['Inter']
              text-[10px]
              text-cyan-300
              transition-colors
              hover:bg-cyan-400/10
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-cyan-400
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <FiRefreshCw
              aria-hidden="true"
              className="h-3 w-3"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: shouldReduceMotion
                  ? "none"
                  : "transform 300ms ease",
              }}
            />

            <span>Refresh</span>
          </button>
        </div>

        {/* QUESTION LIST */}

        <div
          className="
            flex
            min-h-0
            min-w-0
            flex-col
            gap-1.5
            overflow-y-auto
            overscroll-contain
            pr-0.5
            [scrollbar-width:thin]
            [scrollbar-color:rgba(34,211,238,0.25)_transparent]
          "
          aria-label="Question suggestions"
        >
          {hasQuestions ? (
            visibleQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() =>
                  handleQuestionSelect(question)
                }
                disabled={!canSelectQuestions}
                className="
                  group
                  flex
                  min-h-9
                  w-full
                  min-w-0
                  shrink-0
                  items-center
                  justify-between
                  gap-2
                  rounded-lg
                  border
                  border-slate-700/60
                  bg-[#071827]/75
                  px-2.5
                  py-2
                  text-left
                  transition-colors
                  hover:border-cyan-500/45
                  hover:bg-cyan-400/[0.06]
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-cyan-400/70
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  sm:rounded-xl
                  sm:px-3
                "
              >
                <span
                  className="
                    min-w-0
                    flex-1
                    break-words
                    font-['Inter']
                    text-[11px]
                    leading-[1.5]
                    text-slate-300
                    group-hover:text-cyan-100
                  "
                >
                  {question}
                </span>

                <FiChevronRight
                  aria-hidden="true"
                  className="
                    h-3.5
                    w-3.5
                    shrink-0
                    text-slate-400
                    group-hover:text-cyan-300
                  "
                />
              </button>
            ))
          ) : (
            <p
              className="
                py-3
                text-center
                font-['Inter']
                text-xs
                leading-5
                text-slate-500
              "
              role="status"
              aria-live="polite"
            >
              No suggested questions available.
            </p>
          )}
        </div>
      </section>
    );
  },
);

SuggestedQuestions.displayName = "SuggestedQuestions";

export default SuggestedQuestions;
