import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowUpRight,
  FiCpu,
  FiSend,
  FiUser,
} from "react-icons/fi";

/**
 * OrbitGuard AI — Dashboard AI Assistant
 *
 * Presentation component.
 *
 * The parent dashboard remains responsible for communicating with
 * the existing AI service and backend.
 *
 * Background asset:
 * public/images/dashboard/ai-assistant-bg.png
 *
 * Public URL:
 * /images/dashboard/ai-assistant-bg.png
 */

const MIN_AI_MESSAGE_LENGTH = 2;
const MAX_AI_MESSAGE_LENGTH = 4000;

const AI_ASSISTANT_BACKGROUND =
  "/images/dashboard/ai-assistant-bg.png";

/* ================================================================
   DASHBOARD AI ASSISTANT
   ================================================================ */

const DashboardAIAssistant = ({
  messages = [],
  loading = false,
  error = null,
  onSendMessage,
}) => {
  const [input, setInput] = useState("");
  const conversationRef = useRef(null);

  const hasMessages =
    Array.isArray(messages) && messages.length > 0;

  const normalizedInput = input.trim();
  const inputLength = normalizedInput.length;

  const canSubmit =
    inputLength >= MIN_AI_MESSAGE_LENGTH &&
    inputLength <= MAX_AI_MESSAGE_LENGTH &&
    !loading &&
    typeof onSendMessage === "function";

  /* Keep the latest conversation activity visible. */
  useEffect(() => {
    const container = conversationRef.current;

    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [messages, loading]);

  /* Submit through the existing parent callback. */
  const handleSubmit = (event) => {
    event.preventDefault();

    const message = input.trim();

    if (
      message.length < MIN_AI_MESSAGE_LENGTH ||
      message.length > MAX_AI_MESSAGE_LENGTH ||
      loading ||
      typeof onSendMessage !== "function"
    ) {
      return;
    }

    onSendMessage(message);
    setInput("");
  };

  const handleInputChange = (event) => {
    setInput(
      event.target.value.slice(0, MAX_AI_MESSAGE_LENGTH),
    );
  };

  return (
    <section
      aria-labelledby="dashboard-ai-assistant-title"
      aria-busy={loading}
      className="
        relative isolate flex min-h-[450px] min-w-0
        flex-col overflow-hidden
        border border-cyan-300/[0.12]
        bg-[#030914]
        shadow-[0_0_45px_rgba(14,165,233,0.045)]
      "
    >
      {/* =========================================================
          SPACE BACKGROUND
          ========================================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 z-0
          bg-cover bg-center bg-no-repeat
        "
        style={{
          backgroundImage: `url("${AI_ASSISTANT_BACKGROUND}")`,
        }}
      />

      {/* Darken the image to preserve text readability. */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 z-[1]
          bg-[#020914]/55
        "
      />

      {/* Additional contrast near the content edges. */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 z-[1]
          bg-gradient-to-b
          from-[#020914]/35
          via-[#020914]/15
          to-[#020914]/80
        "
      />

      {/* Subtle cyan accent at the top edge. */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute left-0 top-0 z-[2]
          h-px w-44
          bg-gradient-to-r from-cyan-300/80 to-transparent
        "
      />

      {/* =========================================================
          HEADER
          ========================================================= */}

      <header
        className="
          relative z-10 flex items-start justify-between gap-3
          border-b border-white/[0.08]
          bg-[#030914]/35
          px-4 py-4
          backdrop-blur-[2px]
          sm:gap-4 sm:px-5 sm:py-5
        "
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="
              flex h-9 w-9 shrink-0 items-center justify-center
              border border-cyan-300/20
              bg-[#061321]/85
              shadow-[0_0_18px_rgba(34,211,238,0.06)]
              sm:h-10 sm:w-10
            "
            aria-hidden="true"
          >
            <FiCpu
              className="h-4 w-4 text-cyan-300 sm:h-[18px] sm:w-[18px]"
              strokeWidth={1.7}
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2
                id="dashboard-ai-assistant-title"
                className="
                  font-['Orbitron'] text-[10px] font-semibold
                  uppercase tracking-[0.16em] text-slate-100
                  sm:text-[11px] sm:tracking-[0.18em]
                "
              >
                AI Assistant
              </h2>

              <span
                className="
                  hidden font-['Orbitron'] text-[7px]
                  uppercase tracking-[0.12em] text-slate-500
                  sm:inline
                "
              >
                Orbital Intelligence
              </span>
            </div>

            <p
              className="
                mt-1.5 font-['Inter'] text-[10px]
                leading-4 text-slate-300/75
                sm:text-[11px]
              "
            >
              Ask OrbitGuard AI about orbital intelligence.
            </p>
          </div>
        </div>

        <Link
          to="/ai-assistant"
          aria-label="Open full AI Assistant"
          title="Open AI Assistant"
          className="
            group flex h-9 w-9 shrink-0 items-center justify-center
            border border-cyan-300/20
            bg-[#061321]/80 text-cyan-300
            transition-colors duration-200
            hover:border-cyan-300/40 hover:bg-cyan-400/10
            hover:text-cyan-100
            focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-cyan-300/60
            motion-reduce:transition-none
          "
        >
          <FiArrowUpRight
            className="
              h-4 w-4 transition-transform duration-200
              group-hover:-translate-y-0.5
              group-hover:translate-x-0.5
              motion-reduce:transition-none
            "
            aria-hidden="true"
          />
        </Link>
      </header>

      {/* =========================================================
          CONVERSATION
          ========================================================= */}

      <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
        <div
          ref={conversationRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
          className="
            flex min-h-[190px] min-w-0 flex-1 flex-col gap-3
            overflow-y-auto overscroll-contain
            px-4 py-4 sm:px-5
          "
        >
          {!hasMessages ? (
            <EmptyAssistantState />
          ) : (
            messages.map((message, index) => (
              <AssistantMessage
                key={
                  message?.id ??
                  message?.messageId ??
                  `dashboard-ai-${index}`
                }
                message={message}
              />
            ))
          )}

          {loading && <AssistantTypingState />}
        </div>

        {/* =======================================================
            ERROR
            ======================================================= */}

        {error && (
          <div
            role="alert"
            className="
              relative z-10 mx-4 mb-3
              border border-red-400/25
              bg-[#260F18]/90
              px-3 py-2
              font-['Inter'] text-[10px]
              leading-5 text-red-200
              sm:mx-5
            "
          >
            {typeof error === "string"
              ? error
              : error?.message || "Unable to contact OrbitGuard AI. Please try again."}
          </div>
        )}

        {/* =======================================================
            INPUT
            ======================================================= */}

        <div
          className="
            relative z-10 border-t border-white/[0.08]
            bg-[#020914]/55
            px-4 py-3 backdrop-blur-sm
            sm:px-5
          "
        >
          <form
            onSubmit={handleSubmit}
            noValidate
            className="
              flex min-w-0 items-center gap-2
              border border-white/[0.12]
              bg-[#020914]/90 p-1.5
              transition-colors duration-200
              focus-within:border-cyan-300/35
              focus-within:shadow-[0_0_18px_rgba(34,211,238,0.04)]
              motion-reduce:transition-none
            "
          >
            <label
              htmlFor="dashboard-ai-message"
              className="sr-only"
            >
              Ask OrbitGuard AI
            </label>

            <input
              id="dashboard-ai-message"
              name="message"
              type="text"
              value={input}
              onChange={handleInputChange}
              disabled={loading}
              maxLength={MAX_AI_MESSAGE_LENGTH}
              autoComplete="off"
              spellCheck
              placeholder="Ask OrbitGuard AI..."
              aria-describedby="dashboard-ai-input-meta"
              className="
                min-h-8 min-w-0 flex-1
                bg-transparent px-2 py-2
                font-['Inter'] text-[11px] leading-5
                text-slate-100 outline-none
                placeholder:text-slate-500
                disabled:cursor-not-allowed disabled:opacity-50
              "
            />

            <button
              type="submit"
              disabled={!canSubmit}
              aria-label="Send message"
              title={
                loading
                  ? "Waiting for OrbitGuard AI"
                  : inputLength < MIN_AI_MESSAGE_LENGTH
                    ? "Enter at least 2 characters"
                    : "Send message"
              }
              className="
                flex h-9 w-9 shrink-0 items-center justify-center
                border border-cyan-300/20
                bg-cyan-400/[0.07] text-cyan-200
                transition-colors duration-200
                hover:border-cyan-300/40 hover:bg-cyan-400/15
                focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-cyan-300/50
                disabled:cursor-not-allowed
                disabled:border-white/[0.06]
                disabled:bg-white/[0.02]
                disabled:text-slate-600
                motion-reduce:transition-none
              "
            >
              <FiSend
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
            </button>
          </form>

          <div
            id="dashboard-ai-input-meta"
            className="
              mt-2 flex min-w-0 items-center
              justify-between gap-3
            "
          >
            <span
              className="
                min-w-0 font-['Inter'] text-[8px]
                leading-4 text-slate-400/80 sm:text-[9px]
              "
            >
              {loading
                ? "OrbitGuard AI is processing your request..."
                : "Connected to the OrbitGuard AI backend."}
            </span>

            <span
              className="
                shrink-0 font-['Orbitron'] text-[7px]
                uppercase tracking-[0.1em] text-slate-500
              "
            >
              {inputLength}/{MAX_AI_MESSAGE_LENGTH}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ================================================================
   EMPTY STATE
   ================================================================ */

const EmptyAssistantState = () => (
  <div
    className="
      relative flex flex-1 flex-col items-start justify-center
      py-6
    "
  >
    <div
      className="
        flex h-9 w-9 items-center justify-center
        border border-cyan-300/20
        bg-[#061321]/85
        shadow-[0_0_20px_rgba(34,211,238,0.05)]
      "
      aria-hidden="true"
    >
      <FiCpu className="h-4 w-4 text-cyan-300/80" />
    </div>

    <h3
      className="
        mt-4 font-['Orbitron'] text-[9px] font-semibold
        uppercase tracking-[0.15em] text-slate-200
      "
    >
      OrbitGuard AI
    </h3>

    <p
      className="
        mt-2 max-w-[440px]
        font-['Inter'] text-[10px] leading-5
        text-slate-300/80 sm:text-[11px]
      "
    >
      Ask the assistant about satellites, debris, risk assessments,
      orbital activity, or other OrbitGuard topics.
    </p>

    <span
      className="
        mt-4 inline-flex items-center gap-2
        font-['Inter'] text-[8px]
        uppercase tracking-[0.12em] text-cyan-200/70
      "
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-cyan-300/80"
        aria-hidden="true"
      />
      Ready for your question
    </span>
  </div>
);

/* ================================================================
   MESSAGE
   ================================================================ */

const AssistantMessage = ({ message }) => {
  const isUser = message?.role === "user";

  const content =
    typeof message?.content === "string"
      ? message.content
      : "";

  if (!content) {
    return null;
  }

  return (
    <div
      className={`
        flex min-w-0 max-w-[95%] gap-2.5 sm:max-w-[92%]
        ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}
      `}
    >
      <div
        className={`
          flex h-7 w-7 shrink-0 items-center justify-center
          border
          ${
            isUser
              ? "border-white/10 bg-[#101A2A]/90"
              : "border-cyan-300/20 bg-[#061321]/90"
          }
        `}
        aria-hidden="true"
      >
        {isUser ? (
          <FiUser className="h-3 w-3 text-slate-300" />
        ) : (
          <FiCpu className="h-3 w-3 text-cyan-300" />
        )}
      </div>

      <div
        className={`
          min-w-0 max-w-full border px-3 py-2.5
          backdrop-blur-sm
          ${
            isUser
              ? "border-white/[0.10] bg-[#07111F]/90"
              : "border-cyan-300/[0.12] bg-[#061321]/90"
          }
        `}
      >
        <div
          className="
            mb-1 font-['Orbitron'] text-[7px]
            uppercase tracking-[0.12em] text-slate-400
          "
        >
          {isUser ? "You" : "OrbitGuard AI"}
        </div>

        <p
          className="
            whitespace-pre-wrap break-words
            font-['Inter'] text-[10px]
            leading-5 text-slate-200/90 sm:text-[11px]
          "
        >
          {content}
        </p>
      </div>
    </div>
  );
};

/* ================================================================
   LOADING / TYPING STATE
   ================================================================ */

const AssistantTypingState = () => (
  <div
    className="mr-auto flex max-w-[92%] gap-2.5"
    role="status"
    aria-label="OrbitGuard AI is generating a response"
  >
    <div
      className="
        flex h-7 w-7 shrink-0 items-center justify-center
        border border-cyan-300/20 bg-[#061321]/90
      "
      aria-hidden="true"
    >
      <FiCpu className="h-3 w-3 text-cyan-300" />
    </div>

    <div
      className="
        border border-cyan-300/[0.12]
        bg-[#061321]/90 px-3 py-3
      "
    >
      <div className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300/80 motion-reduce:animate-none" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300/60 [animation-delay:150ms] motion-reduce:animate-none" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300/40 [animation-delay:300ms] motion-reduce:animate-none" />
      </div>
    </div>
  </div>
);

export default DashboardAIAssistant;
