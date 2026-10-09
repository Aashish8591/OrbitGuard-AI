
import {
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  FiCopy,
  FiThumbsUp,
  FiThumbsDown,
  FiUser,
  FiCheck,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI — Chat Message
 * ================================================================
 *
 * Renders one message in the AI conversation.
 *
 * Responsibilities:
 * - Display user or assistant message content.
 * - Display optional timestamps.
 * - Provide assistant message copy and feedback actions.
 * - Preserve readable text wrapping on all screen sizes.
 *
 * This component does not:
 * - Make API requests.
 * - Generate AI responses.
 * - Manage the conversation history.
 * - Persist feedback.
 *
 * Expected message:
 * {
 *   id: string,
 *   role: "user" | "assistant",
 *   content: string,
 *   timestamp?: string | number | Date
 * }
 *
 * Optional callback:
 * onRateMessage(message, rating)
 *
 * rating: "positive" | "negative" | null
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
  active = false,
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
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
        ${
          active
            ? "border-cyan-400/25 bg-cyan-400/10 text-cyan-300"
            : "border-transparent text-slate-400 hover:border-slate-700/80 hover:bg-white/[0.04] hover:text-cyan-300"
        }
      `}
    >
      {label === "Copy message" ||
      label === "Message copied" ? (
        active ? (
          <FiCheck
            aria-hidden="true"
            className="h-3.5 w-3.5"
          />
        ) : (
          <FiCopy
            aria-hidden="true"
            className="h-3.5 w-3.5"
          />
        )
      ) : label === "Helpful response" ? (
        <FiThumbsUp
          aria-hidden="true"
          className="h-3.5 w-3.5"
        />
      ) : (
        <FiThumbsDown
          aria-hidden="true"
          className="h-3.5 w-3.5"
        />
      )}
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
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(null);

  const isUser = message?.role === "user";

  const content =
    typeof message?.content === "string"
      ? message.content
      : "";

  const timestamp = formatTimestamp(
    message?.timestamp,
  );

  /**
   * Reset local interaction state when the displayed message
   * changes. This does not modify the message itself.
   */
  useEffect(() => {
    setCopied(false);
    setRating(null);
  }, [message?.id, content]);

  /**
   * Copy the current message using the browser Clipboard API.
   */
  const handleCopy = useCallback(async () => {
    if (!content) {
      return;
    }

    try {
      if (
        !navigator.clipboard?.writeText
      ) {
        throw new Error(
          "Clipboard access is not available in this browser.",
        );
      }

      await navigator.clipboard.writeText(
        content,
      );

      setCopied(true);
    } catch (error) {
      console.error(
        "[OrbitGuard AI] Failed to copy message.",
        error,
      );
    }
  }, [content]);

  /**
   * Update local feedback state and notify the parent.
   * No feedback API is assumed or called here.
   */
  const handleRating = useCallback(
    (nextRating) => {
      const nextValue =
        rating === nextRating
          ? null
          : nextRating;

      setRating(nextValue);

      onRateMessage?.(
        message,
        nextValue,
      );
    },
    [message, onRateMessage, rating],
  );

  return (
    <article
      aria-label={
        isUser
          ? "Your message"
          : "OrbitGuard AI response"
      }
      className={`
        flex
        w-full
        min-w-0
        items-start
        gap-2
        sm:gap-3
        ${
          isUser
            ? "justify-end"
            : "justify-start"
        }
      `}
    >
      {/* ========================================================
          ORBITGUARD AI IDENTITY
          ======================================================== */}

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

          <span
            aria-hidden="true"
            className="
              relative
              font-['Orbitron']
              text-[10px]
              font-bold
              tracking-[-0.08em]
              text-cyan-300
              sm:text-xs
            "
          >
            OG
          </span>
        </div>
      )}

      {/* ========================================================
          MESSAGE BODY
          ======================================================== */}

      <div
        className={`
          flex
          min-w-0
          max-w-[calc(100%-2.75rem)]
          flex-col
          ${
            isUser
              ? "items-end"
              : "items-start"
          }
          sm:max-w-[88%]
          lg:max-w-[82%]
        `}
      >
        {/* Message bubble */}

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

        {/* ======================================================
            TIMESTAMP AND MESSAGE ACTIONS
            ====================================================== */}

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
          <time
            className="
              px-1
              font-['Inter']
              text-[9px]
              tabular-nums
              text-slate-500
            "
            dateTime={
              message?.timestamp
                ? new Date(
                    message.timestamp,
                  ).toISOString?.() ?? undefined
                : undefined
            }
          >
            {timestamp}
          </time>

          {!isUser && (
            <div
              className="flex items-center gap-0.5"
              aria-label="Message actions"
            >
              <MessageAction
                label={
                  copied
                    ? "Message copied"
                    : "Copy message"
                }
                active={copied}
                onClick={handleCopy}
              />

              <MessageAction
                label="Helpful response"
                active={rating === "positive"}
                onClick={() =>
                  handleRating("positive")
                }
              />

              <MessageAction
                label="Unhelpful response"
                active={rating === "negative"}
                onClick={() =>
                  handleRating("negative")
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          USER AVATAR
          ======================================================== */}

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