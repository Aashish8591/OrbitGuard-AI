import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FiAlertCircle,
  FiCpu,
  FiMessageCircle,
  FiSend,
  FiTrash2,
} from "react-icons/fi";

/**
 * OrbitGuard AI Assistant
 *
 * Responsibility:
 * - Render the AI Assistant workspace.
 * - Manage local input state.
 * - Display real conversation messages supplied by the data layer.
 * - Provide a clean empty state when no conversation exists.
 *
 * This component intentionally does NOT:
 * - contain dummy conversations
 * - contain fake AI responses
 * - invent orbital data
 * - calculate risk
 * - call Gemini directly
 * - contain backend business logic
 *
 * Expected message shape:
 *
 * {
 *   id: string | number,
 *   role: "user" | "assistant",
 *   content: string,
 *   createdAt?: string
 * }
 *
 * Backend integration can later provide:
 *
 * messages
 * loading
 * error
 * onSendMessage
 */

const AIAssistant = ({
  messages = [],
  loading = false,
  error = null,
  onSendMessage,
  onClearConversation,
}) => {
  const [input, setInput] = useState("");

  const normalizedMessages = useMemo(() => {
    if (!Array.isArray(messages)) {
      return [];
    }

    return messages.filter(
      (message) =>
        message &&
        typeof message === "object" &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim() !== ""
    );
  }, [messages]);

  const hasMessages = normalizedMessages.length > 0;

  const canSubmit =
    input.trim().length > 0 &&
    !loading &&
    typeof onSendMessage === "function";

  const handleSubmit = async (event) => {
    event.preventDefault();

    const message = input.trim();

    if (!message || loading) {
      return;
    }

    if (typeof onSendMessage !== "function") {
      return;
    }

    try {
      await onSendMessage(message);
      setInput("");
    } catch {
      /*
       * The data layer owns the actual error handling.
       * We intentionally do not create a fake response here.
       */
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (canSubmit) {
        handleSubmit(event);
      }
    }
  };

  const handleClear = () => {
    if (typeof onClearConversation === "function") {
      onClearConversation();
    }
  };

  return (
    <main
      className="
        min-h-full
        w-full
        bg-[#020914]
        text-slate-100
      "
    >
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-[1500px]
          flex-col
          px-3
          py-3
          sm:px-4
          sm:py-4
          lg:px-6
          lg:py-6
          2xl:px-8
        "
      >
        {/* =========================================================
            HEADER
        ========================================================= */}

        <section
          className="
            relative
            overflow-hidden
            border
            border-cyan-300/[0.10]
            bg-[#06101c]/90
          "
        >
          {/* Technical accent */}

          <div
            className="
              pointer-events-none
              absolute
              left-0
              top-0
              h-px
              w-48
              bg-gradient-to-r
              from-cyan-300/70
              to-transparent
            "
            aria-hidden="true"
          />

          <div
            className="
              flex
              flex-col
              gap-5
              px-4
              py-5
              sm:px-6
              sm:py-6
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div className="flex min-w-0 items-start gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  border
                  border-cyan-300/15
                  bg-cyan-400/[0.05]
                "
              >
                <FiCpu
                  className="h-4 w-4 text-cyan-300"
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1
                    className="
                      font-['Orbitron']
                      text-sm
                      font-semibold
                      uppercase
                      tracking-[0.16em]
                      text-slate-100
                      sm:text-base
                    "
                  >
                    OrbitGuard AI
                  </h1>

                  <span
                    className="
                      border
                      border-cyan-300/10
                      bg-cyan-400/[0.035]
                      px-2
                      py-1
                      font-['Orbitron']
                      text-[7px]
                      uppercase
                      tracking-[0.14em]
                      text-cyan-300/70
                    "
                  >
                    Assistant
                  </span>
                </div>

                <p
                  className="
                    mt-2
                    max-w-[680px]
                    font-['Inter']
                    text-xs
                    leading-5
                    text-slate-500
                    sm:text-sm
                  "
                >
                  Ask questions about orbital intelligence, satellite
                  monitoring, debris, risk assessments, and available
                  OrbitGuard data.
                </p>
              </div>
            </div>

            {/* Conversation action */}

            {hasMessages && (
              <button
                type="button"
                onClick={handleClear}
                disabled={
                  typeof onClearConversation !== "function"
                }
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-2
                  border
                  border-white/[0.08]
                  bg-white/[0.02]
                  px-3
                  py-2
                  font-['Orbitron']
                  text-[7px]
                  uppercase
                  tracking-[0.12em]
                  text-slate-500
                  transition
                  duration-200
                  hover:border-red-300/20
                  hover:bg-red-400/[0.04]
                  hover:text-red-300
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <FiTrash2
                  className="h-3 w-3"
                  aria-hidden="true"
                />

                Clear
              </button>
            )}
          </div>
        </section>

        {/* =========================================================
            ASSISTANT WORKSPACE
        ========================================================= */}

        <section
          className="
            mt-4
            flex
            min-h-[620px]
            flex-col
            overflow-hidden
            border
            border-white/[0.08]
            bg-[#040c17]/95
            sm:min-h-[680px]
            lg:min-h-[720px]
          "
        >
          {/* Workspace header */}

          <div
            className="
              flex
              min-h-[52px]
              items-center
              justify-between
              border-b
              border-white/[0.055]
              px-4
              sm:px-5
            "
          >
            <div className="flex items-center gap-2">
              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-cyan-300
                  shadow-[0_0_8px_rgba(103,232,249,0.8)]
                "
                aria-hidden="true"
              />

              <span
                className="
                  font-['Orbitron']
                  text-[8px]
                  font-medium
                  uppercase
                  tracking-[0.18em]
                  text-slate-400
                "
              >
                Intelligence Session
              </span>
            </div>

            <span
              className="
                font-['Orbitron']
                text-[7px]
                uppercase
                tracking-[0.14em]
                text-slate-700
              "
            >
              OG / AI
            </span>
          </div>

          {/* =======================================================
              MESSAGES
          ======================================================= */}

          <div
            className="
              flex-1
              overflow-y-auto
              px-4
              py-5
              sm:px-6
              sm:py-6
            "
          >
            {loading && !hasMessages ? (
              <AssistantLoadingState />
            ) : hasMessages ? (
              <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5">
                {normalizedMessages.map((message, index) => (
                  <AssistantMessage
                    key={
                      message.id ??
                      `${message.role}-${index}`
                    }
                    message={message}
                  />
                ))}

                {loading && <AssistantThinkingState />}
              </div>
            ) : (
              <AssistantEmptyState />
            )}

            {/* Backend error */}

            {error && (
              <div className="mx-auto mt-5 w-full max-w-[900px]">
                <div
                  className="
                    flex
                    items-start
                    gap-3
                    border
                    border-red-300/15
                    bg-red-400/[0.035]
                    px-4
                    py-3
                  "
                >
                  <FiAlertCircle
                    className="
                      mt-0.5
                      h-4
                      w-4
                      shrink-0
                      text-red-300
                    "
                    aria-hidden="true"
                  />

                  <div>
                    <p
                      className="
                        font-['Orbitron']
                        text-[8px]
                        font-semibold
                        uppercase
                        tracking-[0.12em]
                        text-red-300
                      "
                    >
                      AI Service Error
                    </p>

                    <p
                      className="
                        mt-1
                        font-['Inter']
                        text-[10px]
                        leading-5
                        text-slate-500
                      "
                    >
                      {typeof error === "string"
                        ? error
                        : "The AI service could not process the request."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================
              INPUT
          ========================================================= */}

          <div
            className="
              border-t
              border-white/[0.055]
              bg-[#030a13]/80
              p-3
              sm:p-4
            "
          >
            <form
              onSubmit={handleSubmit}
              className="
                mx-auto
                w-full
                max-w-[900px]
              "
            >
              <div
                className="
                  relative
                  flex
                  items-end
                  gap-2
                  border
                  border-cyan-300/10
                  bg-[#06111f]
                  p-2
                  transition
                  duration-200
                  focus-within:border-cyan-300/25
                  focus-within:shadow-[0_0_30px_rgba(34,211,238,0.04)]
                "
              >
                <textarea
                  value={input}
                  onChange={(event) =>
                    setInput(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  rows={2}
                  maxLength={4000}
                  disabled={loading}
                  placeholder="Ask OrbitGuard AI..."
                  className="
                    min-h-[46px]
                    flex-1
                    resize-none
                    bg-transparent
                    px-2
                    py-2
                    font-['Inter']
                    text-xs
                    leading-5
                    text-slate-200
                    outline-none
                    placeholder:text-slate-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    sm:text-sm
                  "
                  aria-label="Ask OrbitGuard AI"
                />

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    border
                    border-cyan-300/15
                    bg-cyan-400/[0.06]
                    text-cyan-300
                    transition
                    duration-200
                    hover:border-cyan-300/30
                    hover:bg-cyan-400/[0.10]
                    disabled:cursor-not-allowed
                    disabled:border-white/[0.05]
                    disabled:bg-white/[0.02]
                    disabled:text-slate-700
                  "
                  aria-label="Send message"
                >
                  <FiSend
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                </button>
              </div>

              <div
                className="
                  mt-2
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <span
                  className="
                    font-['Inter']
                    text-[8px]
                    text-slate-700
                  "
                >
                  Press Enter to send · Shift + Enter for a new line
                </span>

                <span
                  className="
                    shrink-0
                    font-['Orbitron']
                    text-[7px]
                    tabular-nums
                    text-slate-700
                  "
                >
                  {input.length}/4000
                </span>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
};

/* ===============================================================
   MESSAGE
   =============================================================== */

const AssistantMessage = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`
          flex
          w-full
          max-w-[760px]
          gap-3
          ${
            isUser
              ? "flex-row-reverse"
              : "flex-row"
          }
        `}
      >
        <div
          className={`
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            border
            ${
              isUser
                ? "border-slate-300/10 bg-slate-300/[0.035]"
                : "border-cyan-300/15 bg-cyan-400/[0.05]"
            }
          `}
        >
          {isUser ? (
            <FiMessageCircle
              className="h-3.5 w-3.5 text-slate-400"
              aria-hidden="true"
            />
          ) : (
            <FiCpu
              className="h-3.5 w-3.5 text-cyan-300"
              aria-hidden="true"
            />
          )}
        </div>

        <div
          className={`
            min-w-0
            border
            px-4
            py-3
            ${
              isUser
                ? "border-white/[0.07] bg-white/[0.025]"
                : "border-cyan-300/[0.08] bg-cyan-400/[0.025]"
            }
          `}
        >
          <div className="flex items-center gap-2">
            <span
              className="
                font-['Orbitron']
                text-[7px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-slate-500
              "
            >
              {isUser ? "Operator" : "OrbitGuard AI"}
            </span>

            {message.createdAt && (
              <span
                className="
                  font-['Inter']
                  text-[8px]
                  text-slate-700
                "
              >
                {formatMessageTime(message.createdAt)}
              </span>
            )}
          </div>

          <p
            className="
              mt-2
              whitespace-pre-wrap
              break-words
              font-['Inter']
              text-xs
              leading-6
              text-slate-300
              sm:text-sm
            "
          >
            {message.content}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

/* ===============================================================
   EMPTY STATE
   =============================================================== */

const AssistantEmptyState = () => (
  <div
    className="
      flex
      min-h-[500px]
      flex-col
      items-center
      justify-center
      px-5
      text-center
    "
  >
    <div
      className="
        flex
        h-14
        w-14
        items-center
        justify-center
        border
        border-cyan-300/15
        bg-cyan-400/[0.04]
        shadow-[0_0_35px_rgba(34,211,238,0.04)]
      "
    >
      <FiCpu
        className="h-6 w-6 text-cyan-300/60"
        aria-hidden="true"
      />
    </div>

    <h2
      className="
        mt-5
        font-['Orbitron']
        text-xs
        font-semibold
        uppercase
        tracking-[0.16em]
        text-slate-400
        sm:text-sm
      "
    >
      Intelligence Session Ready
    </h2>

    <p
      className="
        mt-3
        max-w-[520px]
        font-['Inter']
        text-xs
        leading-6
        text-slate-600
        sm:text-sm
      "
    >
      Connect the AI Assistant to the OrbitGuard backend to
      begin a real intelligence session.
    </p>

    <div
      className="
        mt-5
        flex
        items-center
        gap-2
        font-['Orbitron']
        text-[7px]
        uppercase
        tracking-[0.14em]
        text-slate-700
      "
    >
      <span
        className="
          h-1.5
          w-1.5
          rounded-full
          bg-slate-700
        "
        aria-hidden="true"
      />

      Awaiting user query
    </div>
  </div>
);

/* ===============================================================
   LOADING STATES
   =============================================================== */

const AssistantLoadingState = () => (
  <div className="mx-auto flex min-h-[500px] w-full max-w-[900px] items-center justify-center">
    <div className="flex items-center gap-3">
      <span
        className="
          h-2
          w-2
          animate-pulse
          rounded-full
          bg-cyan-300
        "
      />

      <span
        className="
          font-['Orbitron']
          text-[8px]
          uppercase
          tracking-[0.18em]
          text-slate-600
        "
      >
        Connecting to intelligence service
      </span>
    </div>
  </div>
);

const AssistantThinkingState = () => (
  <div className="flex items-center gap-3">
    <div
      className="
        flex
        h-8
        w-8
        shrink-0
        items-center
        justify-center
        border
        border-cyan-300/15
        bg-cyan-400/[0.05]
      "
    >
      <FiCpu
        className="h-3.5 w-3.5 text-cyan-300"
        aria-hidden="true"
      />
    </div>

    <div
      className="
        border
        border-cyan-300/[0.08]
        bg-cyan-400/[0.025]
        px-4
        py-3
      "
    >
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300/70" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300/50 [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300/30 [animation-delay:300ms]" />
      </div>
    </div>
  </div>
);

/* ===============================================================
   HELPERS
   =============================================================== */

const formatMessageTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default AIAssistant;