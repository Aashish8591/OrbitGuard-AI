import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FiCopy,
  FiThumbsUp,
  FiThumbsDown,
  FiUser,
  FiCheck,
} from "react-icons/fi";

// ================================================================
// OrbitGuard AI — Chat Message
// ================================================================

const LOGO_PATH = "/images/branding/orbitguard-mark.png";

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
    return typeof timestamp === "string" ? timestamp : "";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const toDateTime = (timestamp) => {
  if (
    timestamp === undefined ||
    timestamp === null ||
    timestamp === ""
  ) {
    return undefined;
  }

  const date =
    timestamp instanceof Date
      ? timestamp
      : new Date(timestamp);

  return Number.isNaN(date.getTime())
    ? undefined
    : date.toISOString();
};

// ================================================================
// Message action button
// ================================================================

const MessageAction = memo(function MessageAction({
  label,
  onClick,
  active = false,
  disabled = false,
  children,
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
            : "border-transparent text-slate-400 hover:border-slate-700/80 hover:bg-white/[0.04] hover:text-cyan-300"
        }
      `}
    >
      {children}
    </button>
  );
});

MessageAction.displayName = "MessageAction";

// ================================================================
// Chat message
// ================================================================

const ChatMessage = memo(function ChatMessage({
  message,
  onRateMessage,
}) {
  const [copyStatus, setCopyStatus] = useState("idle");
  const [rating, setRating] = useState(null);

  const copyTimeoutRef = useRef(null);

  const isUser = message?.role === "user";

  const content =
    typeof message?.content === "string"
      ? message.content
      : "";

  const timestamp = formatTimestamp(message?.timestamp);
  const dateTime = toDateTime(message?.timestamp);

  // Reset message-specific UI state when the displayed message changes.
  useEffect(() => {
    setCopyStatus("idle");
    setRating(null);

    return () => {
      if (copyTimeoutRef.current !== null) {
        clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = null;
      }
    };
  }, [message?.id, content]);

  // --------------------------------------------------------------
  // Copy message
  // --------------------------------------------------------------

  const handleCopy = useCallback(async () => {
    if (!content || copyStatus === "copying") {
      return;
    }

    if (copyTimeoutRef.current !== null) {
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }

    setCopyStatus("copying");

    try {
      if (
        typeof navigator === "undefined" ||
        !navigator.clipboard?.writeText
      ) {
        throw new Error("Clipboard access is unavailable.");
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

  // --------------------------------------------------------------
  // Message feedback
  // --------------------------------------------------------------

  const handleRating = useCallback(
    (nextRating) => {
      const nextValue =
        rating === nextRating ? null : nextRating;

      setRating(nextValue);

      // The parent owns any backend persistence.
      onRateMessage?.(message, nextValue);
    },
    [message, onRateMessage, rating],
  );

  // --------------------------------------------------------------
  // Render
  // --------------------------------------------------------------

  return (
    <article
      aria-label={
        isUser ? "Your message" : "OrbitGuard AI response"
      }
      className={`
        flex
        w-full
        min-w-0
        items-start
        gap-2
        sm:gap-3
        ${isUser ? "justify-end" : "justify-start"}
      `}
    >
      {/* OrbitGuard logo for completed assistant messages */}
      {!isUser && (
        <div
          className="
            relative
            mt-0.5
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            overflow-hidden
            rounded-full
            border
            border-cyan-400/20
            bg-[#071526]
            p-1
            shadow-[0_0_15px_rgba(34,211,238,0.06)]
            sm:h-10
            sm:w-10
          "
          aria-label="OrbitGuard AI"
          role="img"
        >
          <span
            aria-hidden="true"
            className="
              absolute
              inset-0
              bg-gradient-to-br
              from-cyan-400/[0.12]
              via-transparent
              to-blue-500/[0.08]
            "
          />

          <img
            src={LOGO_PATH}
            alt=""
            aria-hidden="true"
            draggable="false"
            className="
              relative
              z-10
              h-full
              w-full
              object-contain
            "
          />
        </div>
      )}

      {/* Message content */}
      <div
        className={`
          flex
          min-w-0
          max-w-[calc(100%-2.75rem)]
          flex-col
          sm:max-w-[88%]
          lg:max-w-[82%]
          ${isUser ? "items-end" : "items-start"}
        `}
      >
        <div
          className={`
            w-fit
            max-w-full
            min-w-0
            overflow-hidden
            rounded-2xl
            border
            px-3.5
            py-3
            sm:px-4
            sm:py-3.5
            ${
              isUser
                ? "rounded-br-md border-cyan-400/20 bg-gradient-to-br from-[#075985]/95 to-[#123b64]/95 text-slate-100 shadow-[0_5px_22px_rgba(0,0,0,0.14)]"
                : "rounded-tl-md border-slate-700/65 bg-gradient-to-br from-[#111f31]/95 to-[#091523]/95 text-slate-200 shadow-[0_5px_24px_rgba(0,0,0,0.12)]"
            }
          `}
        >
          <p
            className="
              whitespace-pre-wrap
              break-words
              font-['Inter']
              text-[12px]
              leading-[1.75]
              [overflow-wrap:anywhere]
              sm:text-[13px]
              sm:leading-[1.8]
            "
          >
            {content || "No message content available."}
          </p>
        </div>

        {/* Timestamp and assistant actions */}
        <div
          className={`
            mt-1
            flex
            min-h-8
            w-full
            min-w-0
            flex-wrap
            items-center
            gap-1
            ${
              isUser
                ? "justify-end"
                : "justify-between"
            }
          `}
        >
          {timestamp ? (
            <time
              dateTime={dateTime}
              className="
                px-1
                font-['Inter']
                text-[9px]
                tabular-nums
                text-slate-500
              "
            >
              {timestamp}
            </time>
          ) : (
            <span aria-hidden="true" />
          )}

          {!isUser && (
            <div
              className="flex items-center gap-0.5"
              aria-label="Message actions"
            >
              <MessageAction
                label={
                  copyStatus === "copied"
                    ? "Message copied"
                    : copyStatus === "failed"
                      ? "Copy failed; try again"
                      : "Copy message"
                }
                active={copyStatus === "copied"}
                disabled={
                  !content || copyStatus === "copying"
                }
                onClick={handleCopy}
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
                label={
                  rating === "positive"
                    ? "Remove helpful rating"
                    : "Helpful response"
                }
                active={rating === "positive"}
                onClick={() => handleRating("positive")}
              >
                <FiThumbsUp
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                />
              </MessageAction>

              <MessageAction
                label={
                  rating === "negative"
                    ? "Remove unhelpful rating"
                    : "Unhelpful response"
                }
                active={rating === "negative"}
                onClick={() => handleRating("negative")}
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

      {/* User avatar remains unchanged */}
      {isUser && (
        <div
          className="
            mt-0.5
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-cyan-400/20
            bg-gradient-to-br
            from-[#103453]
            to-[#07182b]
            text-sky-300
            sm:h-9
            sm:w-9
          "
          aria-label="You"
          role="img"
        >
          <FiUser
            aria-hidden="true"
            className="h-4 w-4"
          />
        </div>
      )}
    </article>
  );
});

ChatMessage.displayName = "ChatMessage";

export default ChatMessage;
