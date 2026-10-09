
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  FiCopy,
  FiThumbsUp,
  FiThumbsDown,
  FiUser,
  FiCheck,
  FiAlertCircle,
  FiMessageSquare,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI — Chat Workspace
 * ================================================================
 *
 * RESPONSIBILITIES
 * - Render user and assistant messages.
 * - Display timestamps and message actions.
 * - Handle clipboard operations and response feedback.
 * - Show loading, error, and empty states.
 * - Follow new messages without interrupting users reading history.
 * - Support accessible, responsive conversation layouts.
 *
 * OUT OF SCOPE
 * - API requests and AI response generation.
 * - Conversation persistence.
 * - Backend retry implementation.
 *
 * MESSAGE CONTRACT
 * {
 *   id: string,
 *   role: "user" | "assistant",
 *   content: string,
 *   timestamp?: string | number | Date
 * }
 *
 * PROPS
 * messages: array
 * loading: boolean
 * error: string | null
 * onRetry: optional callback
 * onRateMessage: optional callback (message, rating)
 * ================================================================
 */

const formatTimestamp = (timestamp) => {
  if (
    timestamp === undefined ||
    timestamp === null ||
    timestamp === ""
  ) {
    return "";
  }

  const date =
    timestamp instanceof Date
      ? timestamp
      : new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return typeof timestamp === "string"
      ? timestamp
      : "";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * ================================================================
 * MESSAGE ACTION BUTTON
 * ================================================================
 */

const MessageAction = memo(function MessageAction({
  label,
  onClick,
  children,
  active = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex
        h-8
        w-8
        shrink-0
        items-center
        justify-center
        rounded-lg
        border
        transition-colors
        duration-200
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-cyan-300
        disabled:cursor-not-allowed
        disabled:opacity-40

        ${
          active
            ? "border-cyan-400/25 bg-cyan-400/10 text-cyan-300"
            : "border-transparent text-slate-400 hover:border-slate-700 hover:bg-white/[0.045] hover:text-cyan-300"
        }
      `}
    >
      {children}
    </button>
  );
});

/**
 * ================================================================
 * CHAT MESSAGE
 * ================================================================
 */

const ChatMessage = memo(function ChatMessage({
  message,
  onRateMessage,
}) {
  const shouldReduceMotion = useReducedMotion();

  const [copyStatus, setCopyStatus] = useState("idle");
  const [rating, setRating] = useState(null);

  const copyTimeoutRef = useRef(null);

  const isUser = message?.role === "user";

  const content =
    typeof message?.content === "string"
      ? message.content
      : "";

  const timestamp = formatTimestamp(message?.timestamp);

  /**
   * Clean up pending clipboard feedback timers.
   */
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Reset message-specific UI state if the message changes.
   */
  useEffect(() => {
    setCopyStatus("idle");
    setRating(null);

    if (copyTimeoutRef.current !== null) {
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }
  }, [message?.id, content]);

  /**
   * Copy message content.
   *
   * Clipboard access is performed only after a user action.
   * No clipboard data is sent to the backend.
   */
  const handleCopy = useCallback(async () => {
    if (!content || copyStatus === "copying") {
      return;
    }

    setCopyStatus("copying");

    try {
      if (
        typeof navigator === "undefined" ||
        !navigator.clipboard?.writeText
      ) {
        throw new Error(
          "Clipboard access is unavailable in this browser context.",
        );
      }

      await navigator.clipboard.writeText(content);

      setCopyStatus("copied");

      copyTimeoutRef.current = setTimeout(() => {
        setCopyStatus("idle");
        copyTimeoutRef.current = null;
      }, 1800);
    } catch (error) {
      console.error(
        "[OrbitGuard AI] Unable to copy message.",
        error,
      );

      setCopyStatus("failed");

      copyTimeoutRef.current = setTimeout(() => {
        setCopyStatus("idle");
        copyTimeoutRef.current = null;
      }, 2200);
    }
  }, [content, copyStatus]);

  /**
   * Toggle response feedback.
   */
  const handleRating = useCallback(
    (nextRating) => {
      const nextValue =
        rating === nextRating
          ? null
          : nextRating;

      setRating(nextValue);

      onRateMessage?.(message, nextValue);
    },
    [message, onRateMessage, rating],
  );

  return (
    <article
      className={`
        flex
        min-w-0
        gap-2
        sm:gap-3

        ${isUser ? "justify-end" : "justify-start"}
      `}
      aria-label={
        isUser
          ? "Your message"
          : "OrbitGuard AI response"
      }
    >
      {/* ASSISTANT IDENTITY */}

      {!isUser && (
        <div
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            self-start
            rounded-xl
            border
            border-cyan-400/20
            bg-[#06182a]
            text-cyan-300
            shadow-[0_0_16px_rgba(34,211,238,0.05)]
            sm:h-9
            sm:w-9
          "
          aria-hidden="true"
        >
          <span
            className="
              font-['Orbitron']
              text-[11px]
              font-bold
              tracking-tight
            "
          >
            OG
          </span>
        </div>
      )}

      {/* MESSAGE CONTENT */}

      <div
        className={`
          flex
          min-w-0
          max-w-[calc(100%-2.5rem)]
          flex-col

          sm:max-w-[88%]
          lg:max-w-[82%]

          ${isUser ? "items-end" : "items-start"}
        `}
      >
        {/* MESSAGE BUBBLE */}

        <div
          className={`
            min-w-0
            max-w-full
            overflow-hidden
            rounded-2xl
            border
            px-3.5
            py-3
            sm:px-4
            sm:py-3.5

            ${
              isUser
                ? "rounded-br-md border-cyan-400/20 bg-gradient-to-br from-[#075985]/90 to-[#123b64]/95 text-slate-100 shadow-[0_5px_20px_rgba(0,0,0,0.12)]"
                : "rounded-tl-md border-slate-700/65 bg-gradient-to-br from-[#101e30]/95 to-[#091523]/95 text-slate-200 shadow-[0_6px_24px_rgba(0,0,0,0.12)]"
            }
          `}
        >
          {content ? (
            <p
              className="
                whitespace-pre-wrap
                break-words
                [overflow-wrap:anywhere]
                font-['Inter']
                text-[12px]
                leading-[1.75]
                sm:text-[13px]
                sm:leading-[1.8]
              "
            >
              {content}
            </p>
          ) : (
            <p className="font-['Inter'] text-xs leading-5 text-slate-400">
              No message content available.
            </p>
          )}
        </div>

        {/* TIMESTAMP AND ACTIONS */}

        <div
          className={`
            mt-1.5
            flex
            min-h-8
            w-full
            min-w-0
            flex-wrap
            items-center
            gap-1.5

            ${
              isUser
                ? "justify-end"
                : "justify-between"
            }
          `}
        >
          {timestamp ? (
            <time
              dateTime={
                message.timestamp instanceof Date
                  ? message.timestamp.toISOString()
                  : typeof message.timestamp === "number" ||
                      (typeof message.timestamp === "string" &&
                        !Number.isNaN(
                          Date.parse(message.timestamp),
                        ))
                    ? new Date(
                        message.timestamp,
                      ).toISOString()
                    : undefined
              }
              className="
                px-1
                font-['Inter']
                text-[10px]
                tabular-nums
                text-slate-500
              "
            >
              {timestamp}
            </time>
          ) : (
            <span />
          )}

          {!isUser && (
            <div
              className="flex shrink-0 items-center gap-0.5"
              aria-label="Response actions"
            >
              <MessageAction
                label={
                  copyStatus === "copied"
                    ? "Message copied"
                    : copyStatus === "failed"
                      ? "Copy failed; try again"
                      : "Copy message"
                }
                onClick={handleCopy}
                active={copyStatus === "copied"}
                disabled={
                  !content || copyStatus === "copying"
                }
              >
                {copyStatus === "copied" ? (
                  <FiCheck
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                  />
                ) : (
                  <FiCopy
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                  />
                )}
              </MessageAction>

              <MessageAction
                label="Helpful response"
                onClick={() => handleRating("positive")}
                active={rating === "positive"}
              >
                <FiThumbsUp
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                />
              </MessageAction>

              <MessageAction
                label="Unhelpful response"
                onClick={() => handleRating("negative")}
                active={rating === "negative"}
              >
                <FiThumbsDown
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                />
              </MessageAction>
            </div>
          )}
        </div>
      </div>

      {/* USER IDENTITY */}

      {isUser && (
        <div
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            self-start
            rounded-full
            border
            border-cyan-400/20
            bg-[#0b2740]
            text-sky-300
            sm:h-9
            sm:w-9
          "
          aria-hidden="true"
        >
          <FiUser className="h-4 w-4" />
        </div>
      )}
    </article>
  );
});

ChatMessage.displayName = "ChatMessage";

/**
 * ================================================================
 * ASSISTANT TYPING INDICATOR
 * ================================================================
 */

const AssistantTypingIndicator = memo(
  function AssistantTypingIndicator() {
    const shouldReduceMotion = useReducedMotion();

    return (
      <div
        className="flex min-w-0 items-start gap-2 sm:gap-3"
        role="status"
        aria-label="OrbitGuard AI is generating a response"
      >
        <div
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-cyan-400/20
            bg-[#06182a]
            font-['Orbitron']
            text-[11px]
            font-bold
            text-cyan-300
            sm:h-9
            sm:w-9
          "
          aria-hidden="true"
        >
          OG
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
                  repeat: shouldReduceMotion
                    ? 0
                    : Infinity,
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

AssistantTypingIndicator.displayName =
  "AssistantTypingIndicator";

/**
 * ================================================================
 * CHAT WORKSPACE
 * ================================================================
 */

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

  /**
   * Remember whether the user was near the bottom BEFORE
   * messages change. This avoids calculating against the
   * already-expanded scroll height after rendering new messages.
   */
  const shouldFollowRef = useRef(true);

  const validMessages = Array.isArray(messages)
    ? messages.filter(
        (message) =>
          message &&
          (message.role === "user" ||
            message.role === "assistant"),
      )
    : [];

  /**
   * Track user scroll intent.
   */
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    shouldFollowRef.current =
      distanceFromBottom < 160;
  }, []);

  /**
   * Follow new messages only when the user was already
   * near the bottom. Reading older messages is not interrupted.
   */
  useEffect(() => {
    if (!shouldFollowRef.current) {
      return;
    }

    bottomAnchorRef.current?.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "end",
    });
  }, [
    validMessages.length,
    loading,
    error,
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
      {/* ======================================================
          MESSAGE HISTORY
          ====================================================== */}

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
              key={
                message.id ??
                `${message.role}-${index}`
              }
              initial={
                shouldReduceMotion
                  ? false
                  : { opacity: 0, y: 8 }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
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

          {error && (
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
                  {error}
                </p>
              </div>

              {typeof onRetry === "function" && (
                <button
                  type="button"
                  onClick={onRetry}
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
