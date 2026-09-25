import {
  useEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  FiArrowUpRight,
  FiCpu,
  FiSend,
  FiUser,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI — Dashboard AI Assistant
 * ================================================================
 *
 * PRESENTATION COMPONENT
 * ----------------------------------------------------------------
 *
 * Responsibilities:
 * - Render the dashboard AI assistant
 * - Render locally maintained message history
 * - Accept user input
 * - Validate basic UI input constraints
 * - Submit messages through onSendMessage
 * - Display loading state
 * - Display backend communication errors
 * - Provide navigation to the full AI Assistant page
 *
 * This component does NOT:
 * - Call Axios
 * - Call the AI backend directly
 * - Generate AI responses
 * - Build AI prompts
 * - Store persistent conversation history
 * - Manage AI/business logic
 *
 *
 * BACKEND CONTRACT
 * ----------------------------------------------------------------
 *
 * POST /api/ai/chat
 *
 * Request:
 *
 * {
 *   "message": "What is a collision risk?"
 * }
 *
 * Backend validation:
 *
 * - Minimum: 2 characters
 * - Maximum: 4000 characters
 * - Must not be blank
 *
 * Backend response:
 *
 * {
 *   "success": true,
 *   "message": "AI response generated successfully.",
 *   "data": {
 *     "response": "..."
 *   }
 * }
 *
 *
 * IMPORTANT
 * ----------------------------------------------------------------
 *
 * The current backend receives ONLY the current user message.
 *
 * The `messages` array displayed here is therefore local UI
 * history only. It is not sent to the backend as conversation
 * context.
 *
 * Dashboard.jsx remains responsible for:
 *
 * DashboardAIAssistant
 *        ↓
 * Dashboard.jsx
 *        ↓
 * sendAiMessage()
 *        ↓
 * aiService.js
 *        ↓
 * POST /api/ai/chat
 *
 * ================================================================
 */


/**
 * ================================================================
 * AI INPUT CONTRACT
 * ================================================================
 *
 * These values mirror the confirmed backend AiChatRequest
 * validation contract.
 *
 * Keep them here only for presentation-level validation.
 *
 * Backend remains the final authority.
 * ================================================================
 */

const MIN_AI_MESSAGE_LENGTH = 2;

const MAX_AI_MESSAGE_LENGTH = 4000;


/**
 * ================================================================
 * DASHBOARD AI ASSISTANT
 * ================================================================
 */

const DashboardAIAssistant = ({
  messages = [],
  loading = false,
  error = null,
  onSendMessage,
}) => {
  const [input, setInput] = useState("");

  const conversationRef = useRef(null);

  const inputRef = useRef(null);


  /**
   * --------------------------------------------------------------
   * MESSAGE CHECK
   * --------------------------------------------------------------
   */

  const hasMessages =
    Array.isArray(messages) &&
    messages.length > 0;


  /**
   * --------------------------------------------------------------
   * NORMALIZED INPUT
   * --------------------------------------------------------------
   *
   * Keep the raw input in state so the user's typing experience
   * remains natural.
   *
   * Validation uses the trimmed value.
   * --------------------------------------------------------------
   */

  const normalizedInput =
    input.trim();


  const inputLength =
    normalizedInput.length;


  const canSubmit =
    inputLength >= MIN_AI_MESSAGE_LENGTH &&
    inputLength <= MAX_AI_MESSAGE_LENGTH &&
    !loading &&
    typeof onSendMessage === "function";


  /**
   * --------------------------------------------------------------
   * AUTO-SCROLL
   * --------------------------------------------------------------
   *
   * Keep the newest message visible.
   *
   * The backend is not responsible for conversation history;
   * this is purely a dashboard UI behavior.
   * --------------------------------------------------------------
   */

  useEffect(() => {
    const container =
      conversationRef.current;

    if (!container) {
      return;
    }

    container.scrollTop =
      container.scrollHeight;
  }, [messages, loading]);


  /**
   * --------------------------------------------------------------
   * SUBMIT MESSAGE
   * --------------------------------------------------------------
   */

  const handleSubmit = (event) => {
    event.preventDefault();

    const message =
      input.trim();


    /**
     * ------------------------------------------------------------
     * Defensive validation
     * ------------------------------------------------------------
     *
     * The backend performs authoritative validation.
     * This prevents obviously invalid requests from reaching it.
     * ------------------------------------------------------------
     */

    if (
      message.length <
        MIN_AI_MESSAGE_LENGTH ||
      message.length >
        MAX_AI_MESSAGE_LENGTH
    ) {
      return;
    }


    if (loading) {
      return;
    }


    if (
      typeof onSendMessage !==
      "function"
    ) {
      return;
    }


    /**
     * ------------------------------------------------------------
     * Send message to page-level coordinator
     * ------------------------------------------------------------
     */

    onSendMessage(message);


    /**
     * ------------------------------------------------------------
     * Clear input immediately after successful submission
     * ------------------------------------------------------------
     */

    setInput("");
  };


  /**
   * --------------------------------------------------------------
   * INPUT CHANGE
   * --------------------------------------------------------------
   */

  const handleInputChange = (
    event,
  ) => {
    const nextValue =
      event.target.value;

    /**
     * HTML maxLength provides the first
     * protection against oversized input.
     *
     * This additional slice keeps the state
     * bounded even if the component is reused
     * programmatically.
     */

    setInput(
      nextValue.slice(
        0,
        MAX_AI_MESSAGE_LENGTH,
      ),
    );
  };


  return (
    <section
      aria-labelledby="dashboard-ai-assistant-title"
      aria-busy={loading}
      className="
        relative
        flex
        min-h-[450px]
        flex-col
        overflow-hidden
        border
        border-cyan-300/[0.10]
        bg-[#06101c]/90
        shadow-[0_0_45px_rgba(14,165,233,0.035)]
        backdrop-blur-md
      "
    >

      {/* =========================================================
          BACKGROUND TECHNICAL VISUAL
          ========================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
          opacity-40
        "
        aria-hidden="true"
      >
        <div
          className="
            absolute
            -right-24
            top-1/2
            h-72
            w-72
            -translate-y-1/2
            rounded-full
            border
            border-cyan-300/[0.08]
          "
        />

        <div
          className="
            absolute
            -right-16
            top-1/2
            h-52
            w-52
            -translate-y-1/2
            rounded-full
            border
            border-cyan-300/[0.06]
          "
        />

        <div
          className="
            absolute
            right-12
            top-1/2
            h-px
            w-40
            rotate-[25deg]
            bg-gradient-to-r
            from-transparent
            via-cyan-300/10
            to-transparent
          "
        />
      </div>


      {/* =========================================================
          TOP ACCENT
          ========================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          left-0
          top-0
          h-px
          w-40
          bg-gradient-to-r
          from-cyan-300/70
          to-transparent
        "
        aria-hidden="true"
      />


      {/* =========================================================
          HEADER
          ========================================================= */}

      <header
        className="
          relative
          z-10
          flex
          items-start
          justify-between
          gap-4
          border-b
          border-white/[0.055]
          px-4
          py-4
          sm:px-5
          sm:py-5
        "
      >

        <div className="flex min-w-0 items-center gap-3">

          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              border
              border-cyan-300/15
              bg-cyan-400/[0.045]
              shadow-[0_0_18px_rgba(34,211,238,0.04)]
            "
          >
            <FiCpu
              className="h-4 w-4 text-cyan-300"
              aria-hidden="true"
            />
          </div>


          <div className="min-w-0">

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >
              <h2
                id="dashboard-ai-assistant-title"
                className="
                  font-['Orbitron']
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-slate-200
                  sm:text-[11px]
                "
              >
                AI Assistant
              </h2>

              <span
                className="
                  hidden
                  font-['Orbitron']
                  text-[7px]
                  uppercase
                  tracking-[0.14em]
                  text-slate-600
                  sm:inline
                "
              >
                Orbital Intelligence
              </span>
            </div>


            <p
              className="
                mt-1.5
                font-['Inter']
                text-[10px]
                leading-4
                text-slate-500
                sm:text-[11px]
              "
            >
              Ask OrbitGuard AI about orbital intelligence.
            </p>

          </div>

        </div>


        {/* =======================================================
            OPEN FULL AI ASSISTANT
            ======================================================= */}

        <Link
          to="/ai-assistant"
          aria-label="Open full AI Assistant"
          title="Open AI Assistant"
          className="
            group
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            border
            border-cyan-300/15
            bg-cyan-400/[0.035]
            text-cyan-300
            transition
            duration-200
            hover:border-cyan-300/30
            hover:bg-cyan-400/[0.08]
            hover:text-cyan-200
            focus:outline-none
            focus:ring-1
            focus:ring-cyan-300/30
          "
        >
          <FiArrowUpRight
            className="
              h-3.5
              w-3.5
              transition-transform
              duration-200
              group-hover:-translate-y-0.5
              group-hover:translate-x-0.5
            "
            aria-hidden="true"
          />
        </Link>

      </header>


      {/* =========================================================
          CONVERSATION
          ========================================================= */}

      <div
        className="
          relative
          z-10
          flex
          min-h-0
          flex-1
          flex-col
        "
      >

        <div
          ref={conversationRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
          className="
            flex
            min-h-[190px]
            flex-1
            flex-col
            gap-3
            overflow-y-auto
            px-4
            py-4
            sm:px-5
          "
        >

          {!hasMessages ? (
            <EmptyAssistantState />
          ) : (
            messages.map(
              (message, index) => (
                <AssistantMessage
                  key={
                    message?.id ??
                    `dashboard-ai-${index}`
                  }
                  message={message}
                />
              ),
            )
          )}


          {loading && (
            <AssistantTypingState />
          )}

        </div>


        {/* =======================================================
            ERROR
            ======================================================= */}

        {error && (
          <div
            role="alert"
            className="
              mx-4
              mb-3
              border
              border-red-400/15
              bg-red-400/[0.025]
              px-3
              py-2
              font-['Inter']
              text-[9px]
              leading-4
              text-red-300/80
              sm:mx-5
            "
          >
            {error}
          </div>
        )}


        {/* =======================================================
            INPUT
            ======================================================= */}

        <div
          className="
            border-t
            border-white/[0.055]
            px-4
            py-3
            sm:px-5
          "
        >

          <form
            onSubmit={handleSubmit}
            noValidate
            className="
              flex
              items-center
              gap-2
              border
              border-white/[0.08]
              bg-[#020914]/75
              p-1.5
              transition
              duration-200
              focus-within:border-cyan-300/20
              focus-within:bg-[#020914]/90
            "
          >

            <label
              htmlFor="dashboard-ai-message"
              className="sr-only"
            >
              Ask OrbitGuard AI
            </label>

            <input
              ref={inputRef}
              id="dashboard-ai-message"
              name="message"
              type="text"
              value={input}
              onChange={handleInputChange}
              disabled={loading}
              maxLength={MAX_AI_MESSAGE_LENGTH}
              minLength={MIN_AI_MESSAGE_LENGTH}
              autoComplete="off"
              spellCheck="true"
              placeholder="Ask OrbitGuard AI..."
              aria-label="Ask OrbitGuard AI"
              aria-describedby="dashboard-ai-input-meta"
              className="
                min-w-0
                flex-1
                bg-transparent
                px-2
                py-2
                font-['Inter']
                text-[11px]
                text-slate-200
                outline-none
                placeholder:text-slate-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            />


            <button
              type="submit"
              disabled={!canSubmit}
              aria-label="Send message"
              title={
                loading
                  ? "Waiting for OrbitGuard AI"
                  : !normalizedInput
                    ? "Enter a message"
                    : inputLength <
                        MIN_AI_MESSAGE_LENGTH
                      ? "Message is too short"
                      : "Send message"
              }
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
                text-cyan-300
                transition
                duration-200
                hover:border-cyan-300/30
                hover:bg-cyan-400/[0.10]
                focus:outline-none
                focus:ring-1
                focus:ring-cyan-300/30
                disabled:cursor-not-allowed
                disabled:border-white/[0.05]
                disabled:bg-white/[0.02]
                disabled:text-slate-700
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
              mt-2
              flex
              items-center
              justify-between
              gap-3
            "
          >

            <span
              className="
                min-w-0
                font-['Inter']
                text-[8px]
                text-slate-700
              "
            >
              {loading
                ? "OrbitGuard AI is processing your request..."
                : "Connected to the OrbitGuard AI backend."}
            </span>


            <span
              className="
                shrink-0
                font-['Orbitron']
                text-[7px]
                uppercase
                tracking-[0.12em]
                text-slate-700
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


/* ===============================================================
   EMPTY STATE
   =============================================================== */

const EmptyAssistantState = () => (
  <div
    className="
      flex
      flex-1
      flex-col
      items-start
      justify-center
      py-6
    "
  >

    <div
      className="
        flex
        h-9
        w-9
        items-center
        justify-center
        border
        border-cyan-300/10
        bg-cyan-400/[0.035]
      "
    >
      <FiCpu
        className="h-4 w-4 text-cyan-300/45"
        aria-hidden="true"
      />
    </div>


    <h3
      className="
        mt-4
        font-['Orbitron']
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.15em]
        text-slate-500
      "
    >
      OrbitGuard AI
    </h3>


    <p
      className="
        mt-2
        max-w-[440px]
        font-['Inter']
        text-[10px]
        leading-5
        text-slate-600
      "
    >
      Ask the assistant about satellites,
      debris, risk assessments, orbital
      activity, or other OrbitGuard topics.
    </p>

  </div>
);


/* ===============================================================
   MESSAGE
   =============================================================== */

const AssistantMessage = ({
  message,
}) => {

  const isUser =
    message?.role === "user";


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
        flex
        max-w-[92%]
        gap-2.5
        ${
          isUser
            ? "ml-auto flex-row-reverse"
            : "mr-auto"
        }
      `}
    >

      {/* Avatar */}

      <div
        className={`
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          border
          ${
            isUser
              ? "border-slate-300/10 bg-slate-300/[0.035]"
              : "border-cyan-300/15 bg-cyan-400/[0.04]"
          }
        `}
      >

        {isUser ? (
          <FiUser
            className="h-3 w-3 text-slate-500"
            aria-hidden="true"
          />
        ) : (
          <FiCpu
            className="h-3 w-3 text-cyan-300"
            aria-hidden="true"
          />
        )}

      </div>


      {/* Message */}

      <div
        className={`
          min-w-0
          border
          px-3
          py-2.5
          ${
            isUser
              ? "border-white/[0.07] bg-white/[0.025]"
              : "border-cyan-300/[0.08] bg-cyan-400/[0.025]"
          }
        `}
      >

        <div
          className="
            mb-1
            font-['Orbitron']
            text-[7px]
            uppercase
            tracking-[0.12em]
            text-slate-700
          "
        >
          {isUser
            ? "You"
            : "OrbitGuard AI"}
        </div>


        <p
          className="
            whitespace-pre-wrap
            break-words
            font-['Inter']
            text-[10px]
            leading-5
            text-slate-400
          "
        >
          {content}
        </p>

      </div>

    </div>
  );
};


/* ===============================================================
   LOADING / TYPING STATE
   =============================================================== */

const AssistantTypingState = () => (
  <div
    className="
      mr-auto
      flex
      max-w-[92%]
      gap-2.5
    "
    role="status"
    aria-label="OrbitGuard AI is generating a response"
  >

    <div
      className="
        flex
        h-7
        w-7
        shrink-0
        items-center
        justify-center
        border
        border-cyan-300/15
        bg-cyan-400/[0.04]
      "
    >
      <FiCpu
        className="h-3 w-3 text-cyan-300"
        aria-hidden="true"
      />
    </div>


    <div
      className="
        border
        border-cyan-300/[0.08]
        bg-cyan-400/[0.025]
        px-3
        py-2.5
      "
    >
      <div className="flex items-center gap-1">
        <span className="h-1 w-1 animate-pulse rounded-full bg-cyan-300/70" />
        <span className="h-1 w-1 animate-pulse rounded-full bg-cyan-300/50 [animation-delay:150ms]" />
        <span className="h-1 w-1 animate-pulse rounded-full bg-cyan-300/30 [animation-delay:300ms]" />
      </div>
    </div>

  </div>
);


export default DashboardAIAssistant;