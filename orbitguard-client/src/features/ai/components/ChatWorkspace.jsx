import {
  memo,
  useCallback,
  useEffect,
  useRef,
} from "react";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  FiAlertCircle,
  FiMessageSquare,
} from "react-icons/fi";

import ChatMessage from "./ChatMessage";

const ORBITGUARD_LOGO = "/images/branding/orbitguard-mark.png";

const AssistantTypingIndicator = memo(
  function AssistantTypingIndicator() {
    const shouldReduceMotion = useReducedMotion();

    return (
      <div
        className="flex min-w-0 items-start gap-2 sm:gap-3"
        role="status"
        aria-label="OrbitGuard AI is generating a response"
      >
        {/* OrbitGuard logo replaces the OG text badge */}
        <div
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            overflow-hidden
            rounded-xl
            border
            border-cyan-400/20
            bg-[#06182a]
            p-1
            sm:h-9
            sm:w-9
          "
        >
          <img
            src={ORBITGUARD_LOGO}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-contain"
            draggable="false"
          />
        </div>

        <div
          className="
            flex
            min-h-12
            min-w-0
            items-center
            gap-2.5
            rounded-2xl
            rounded-tl-md
            border
            border-slate-700/65
            bg-[#0b1726]/95
            px-3.5
            sm:px-4
          "
        >
          <span className="font-['Inter'] text-xs text-slate-400">
            OrbitGuard AI is thinking
          </span>

          <span
            className="flex shrink-0 items-center gap-1"
            aria-hidden="true"
          >
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="h-1.5 w-1.5 rounded-full bg-cyan-400"
                animate={
                  shouldReduceMotion
                    ? { opacity: 0.8 }
                    : {
                        opacity: [0.35, 1, 0.35],
                        y: [0, -3, 0],
                      }
                }
                transition={{
                  duration: 0.9,
                  repeat: shouldReduceMotion ? 0 : Infinity,
                  delay: dot * 0.15,
                }}
              />
            ))}
          </span>
        </div>
      </div>
    );
  },
);

AssistantTypingIndicator.displayName = "AssistantTypingIndicator";

const ChatWorkspace = memo(function ChatWorkspace({
  messages = [],
  loading = false,
  error = null,
  onRetry,
  onRateMessage,
}) {
  const shouldReduceMotion = useReducedMotion();

  const scrollContainerRef = useRef(null);
  const bottomAnchorRef = useRef(null);
  const shouldFollowRef = useRef(true);

  const validMessages = Array.isArray(messages)
    ? messages.filter(
        (message) =>
          message &&
          (message.role === "user" ||
            message.role === "assistant") &&
          typeof message.content === "string",
      )
    : [];

  const normalizedError =
    typeof error === "string" && error.trim()
      ? error.trim()
      : null;

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;

    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    shouldFollowRef.current = distanceFromBottom < 160;
  }, []);

  useEffect(() => {
    if (!shouldFollowRef.current) return;

    bottomAnchorRef.current?.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "end",
    });
  }, [
    validMessages.length,
    loading,
    normalizedError,
    shouldReduceMotion,
  ]);

  return (
    <section
      aria-label="AI conversation"
      className="
        flex
        h-full
        min-h-0
        w-full
        min-w-0
        flex-col
        overflow-hidden
      "
    >
      {/* MESSAGE HISTORY */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="
          min-h-0
          flex-1
          overflow-x-hidden
          overflow-y-auto
          overscroll-contain
          px-3
          py-4
          [scrollbar-color:rgba(71,85,105,0.5)_transparent]
          [scrollbar-width:thin]
          sm:px-4
          sm:py-5
          lg:px-5
        "
        role="log"
        aria-label="Conversation messages"
        aria-live="polite"
        aria-relevant="additions"
        aria-busy={loading}
      >
        <div
          className="
            mx-auto
            flex
            min-h-full
            w-full
            max-w-4xl
            flex-col
            gap-4
            sm:gap-5
          "
        >
          {/* EMPTY STATE */}
          {validMessages.length === 0 && !loading && (
            <div
              className="
                flex
                flex-1
                flex-col
                items-center
                justify-center
                px-4
                py-10
                text-center
              "
            >
              <div
                className="
                  mb-4
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-cyan-400/20
                  bg-cyan-400/[0.05]
                  text-cyan-300
                  shadow-[0_0_30px_rgba(34,211,238,0.06)]
                "
              >
                <FiMessageSquare
                  aria-hidden="true"
                  className="h-6 w-6"
                />
              </div>

              <h2
                className="
                  font-['Orbitron']
                  text-sm
                  font-semibold
                  leading-6
                  tracking-wide
                  text-slate-100
                  sm:text-base
                "
              >
                Ready for your next question
              </h2>

              <p
                className="
                  mt-2
                  max-w-sm
                  font-['Inter']
                  text-xs
                  leading-6
                  text-slate-400
                  sm:text-sm
                "
              >
                Explore satellite intelligence, orbital
                mechanics, collision risks, and space debris.
              </p>
            </div>
          )}

          {/* MESSAGES */}
          {validMessages.map((message, index) => (
            <motion.div
              key={message.id ?? `${message.role}-${index}`}
              initial={
                shouldReduceMotion
                  ? false
                  : { opacity: 0, y: 8 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.25,
              }}
              className="min-w-0"
            >
              <ChatMessage
                message={message}
                onRateMessage={onRateMessage}
              />
            </motion.div>
          ))}

          {/* LOADING */}
          {loading && <AssistantTypingIndicator />}

          {/* ERROR */}
          {normalizedError && (
            <div
              role="alert"
              className="
                flex
                min-w-0
                flex-col
                gap-3
                rounded-xl
                border
                border-red-400/20
                bg-red-400/[0.045]
                p-3.5
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:p-4
              "
            >
              <div className="flex min-w-0 items-start gap-2.5">
                <FiAlertCircle
                  aria-hidden="true"
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                    text-red-300
                  "
                />

                <p
                  className="
                    min-w-0
                    break-words
                    [overflow-wrap:anywhere]
                    font-['Inter']
                    text-xs
                    leading-5
                    text-red-200
                  "
                >
                  {normalizedError}
                </p>
              </div>

              {typeof onRetry === "function" && (
                <button
                  type="button"
                  onClick={onRetry}
                  disabled={loading}
                  className="
                    min-h-9
                    shrink-0
                    self-start
                    rounded-lg
                    border
                    border-red-300/20
                    px-3
                    font-['Inter']
                    text-xs
                    font-medium
                    text-red-200
                    transition-colors
                    hover:bg-red-300/[0.08]
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-red-300
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    sm:self-center
                  "
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {/* SCROLL ANCHOR */}
          <div
            ref={bottomAnchorRef}
            aria-hidden="true"
            className="h-px w-full shrink-0"
          />
        </div>
      </div>
    </section>
  );
});

ChatWorkspace.displayName = "ChatWorkspace";

export default ChatWorkspace;
