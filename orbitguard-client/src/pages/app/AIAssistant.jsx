
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  FiMessageSquare,
  FiGrid,
  FiX,
} from "react-icons/fi";

import ConversationSidebar from "../../features/ai/components/ConversationSidebar";
import AIWelcomeHero from "../../features/ai/components/AIWelcomeHero";
import ChatWorkspace from "../../features/ai/components/ChatWorkspace";
import ChatComposer from "../../features/ai/components/ChatComposer";
import SuggestedQuestions from "../../features/ai/components/SuggestedQuestions";
import CapabilitiesPanel from "../../features/ai/components/CapabilitiesPanel";
import ProfessionalGuidance from "../../features/ai/components/ProfessionalGuidance";
import ProtectedBackground from "../../components/common/ProtectedBackground";

import aiService from "../../services/aiService";

const PAGE_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },
};

const NAVBAR_HEIGHT = 68;
const MIN_MESSAGE_LENGTH = 2;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_TITLE_LENGTH = 48;
const MAX_PREVIEW_LENGTH = 100;

const createMessageId = (prefix) => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
};

const createConversationTitle = (message) => {
  const text = message.replace(/\s+/g, " ").trim();

  return text.length > MAX_TITLE_LENGTH
    ? `${text.slice(0, MAX_TITLE_LENGTH - 1).trimEnd()}…`
    : text;
};

const createPreview = (message) => {
  const text = message.replace(/\s+/g, " ").trim();

  return text.length > MAX_PREVIEW_LENGTH
    ? `${text.slice(0, MAX_PREVIEW_LENGTH - 1).trimEnd()}…`
    : text;
};

const formatConversationTime = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  return isToday
    ? date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
};

const getChatErrorMessage = (error) => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Unable to contact OrbitGuard AI. Please try again.";
};

const AIAssistant = () => {
  const reduceMotion = useReducedMotion();
  const instanceId = useId();

  // ------------------------------------------------------------
  // State
  // ------------------------------------------------------------

  const [conversations, setConversations] = useState([]);

  // Single source of truth for all conversation messages.
  // Each conversation owns its own message array.
  const [messagesByConversation, setMessagesByConversation] =
    useState({});

  const [activeConversationId, setActiveConversationId] =
    useState(null);

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [chatNotice, setChatNotice] = useState("");
  const [mobileDrawer, setMobileDrawer] = useState(null);

  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [failedMessage, setFailedMessage] = useState(null);

  // Prevent two requests from being submitted simultaneously.
  const requestInProgressRef = useRef(false);

  // A response may update the UI only if its request is still current.
  const currentRequestIdRef = useRef(null);

  const conversationsDrawerId =
    `conversations-${instanceId}`;

  const resourcesDrawerId =
    `resources-${instanceId}`;

  // Derive the displayed transcript from the active conversation.
  // Do not maintain a second, independently updated messages state.
  const messages = activeConversationId
    ? messagesByConversation[activeConversationId] || []
    : [];

  // ------------------------------------------------------------
  // Mobile drawer behavior
  // ------------------------------------------------------------

  useEffect(() => {
    if (!mobileDrawer) {
      return undefined;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow =
      document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileDrawer(null);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow =
        previousHtmlOverflow;

      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileDrawer]);

  const closeDrawer = useCallback(() => {
    setMobileDrawer(null);
  }, []);

  const toggleDrawer = useCallback((drawerName) => {
    setMobileDrawer((current) =>
      current === drawerName ? null : drawerName,
    );
  }, []);

  // ------------------------------------------------------------
  // Append a message exactly once to its conversation
  // ------------------------------------------------------------

  const appendMessageToConversation = useCallback(
    (conversationId, message) => {
      setMessagesByConversation((current) => {
        const previous = current[conversationId] || [];

        // This updater is deliberately pure.
        // Do not call another state setter inside this updater.
        return {
          ...current,
          [conversationId]: [...previous, message],
        };
      });
    },
    [],
  );

  // ------------------------------------------------------------
  // Recent conversation metadata
  // ------------------------------------------------------------

  const updateConversation = useCallback(
    (conversationId, message, isFirstMessage = false) => {
      const timestamp =
        message.timestamp || new Date().toISOString();

      setConversations((current) => {
        const exists = current.some(
          (conversation) =>
            String(conversation.id) === String(conversationId),
        );

        let updated;

        if (exists) {
          updated = current.map((conversation) =>
            String(conversation.id) === String(conversationId)
              ? {
                  ...conversation,
                  preview: createPreview(message.content),
                  timestamp: formatConversationTime(timestamp),
                  updatedAt: timestamp,
                }
              : conversation,
          );
        } else {
          // Only a user message should create a conversation.
          if (!isFirstMessage) {
            return current;
          }

          updated = [
            {
              id: conversationId,
              title: createConversationTitle(message.content),
              preview: createPreview(message.content),
              timestamp: formatConversationTime(timestamp),
              updatedAt: timestamp,
            },
            ...current,
          ];
        }

        return updated.sort(
          (a, b) =>
            new Date(b.updatedAt || 0).getTime() -
            new Date(a.updatedAt || 0).getTime(),
        );
      });
    },
    [],
  );

  // ------------------------------------------------------------
  // Start a new conversation
  // ------------------------------------------------------------

  const handleNewChat = useCallback(() => {
    // Invalidate any response belonging to the previous view.
    currentRequestIdRef.current = null;

    setActiveConversationId(null);
    setSelectedTopic(null);
    setChatNotice("");
    setChatError(null);
    setFailedMessage(null);
    setMobileDrawer(null);

    // Keep previous conversations and their messages intact.
    // The next message will create a new conversation ID.
  }, []);

  // ------------------------------------------------------------
  // Select a conversation
  // ------------------------------------------------------------

  const handleSelectConversation = useCallback((conversation) => {
    if (
      !conversation ||
      conversation.id === undefined ||
      conversation.id === null
    ) {
      return;
    }

    currentRequestIdRef.current = null;

    setActiveConversationId(String(conversation.id));
    setSelectedTopic(null);
    setChatError(null);
    setChatNotice("");
    setFailedMessage(null);
    setMobileDrawer(null);

    // `messages` automatically changes to the selected
    // conversation's transcript through derived state.
  }, []);

  // ------------------------------------------------------------
  // Suggested questions
  // ------------------------------------------------------------

  const handleSelectQuestion = useCallback((question) => {
    const questionText =
      typeof question === "string"
        ? question
        : question?.question ??
          question?.text ??
          question?.label ??
          "";

    if (
      typeof questionText !== "string" ||
      !questionText.trim()
    ) {
      return;
    }

    setSelectedTopic(questionText.trim());
    setChatNotice("");
    setChatError(null);
    setMobileDrawer(null);
  }, []);

  // ------------------------------------------------------------
  // Submit a message
  // ------------------------------------------------------------

  const submitMessage = useCallback(
    async (rawMessage, options = {}) => {
      const {
        isRetry = false,
        retryConversationId = null,
      } = options;

      const normalizedMessage =
        typeof rawMessage === "string"
          ? rawMessage.trim()
          : "";

      if (
        normalizedMessage.length < MIN_MESSAGE_LENGTH ||
        normalizedMessage.length > MAX_MESSAGE_LENGTH
      ) {
        setChatError(
          `Enter a message between ${MIN_MESSAGE_LENGTH} and ${MAX_MESSAGE_LENGTH} characters.`,
        );
        setChatNotice("");
        return;
      }

      if (requestInProgressRef.current) {
        return;
      }

      requestInProgressRef.current = true;

      const requestId = createMessageId("request");

      currentRequestIdRef.current = requestId;

      // Reuse the original conversation for retries.
      // A normal submission creates a conversation only when needed.
      const conversationId = String(
        isRetry
          ? retryConversationId
          : activeConversationId || createMessageId("conversation"),
      );

      setChatLoading(true);
      setChatError(null);
      setChatNotice("");
      setSelectedTopic(null);

      if (!isRetry) {
        const timestamp = new Date().toISOString();

        const userMessage = {
          id: createMessageId("user"),
          role: "user",
          content: normalizedMessage,
          timestamp,
        };

        // Set the active ID first. The transcript is derived from it.
        setActiveConversationId(conversationId);

        // Append the user message once to the single source of truth.
        appendMessageToConversation(
          conversationId,
          userMessage,
        );

        // Update the sidebar independently of the message transcript.
        updateConversation(
          conversationId,
          userMessage,
          true,
        );

        setFailedMessage(null);
      }

      try {
        // Existing backend contract:
        // POST /api/ai/chat
        // Request:  { message: "..." }
        // Response: { response: "Generated AI answer..." }
        const result = await aiService.sendMessage(
          normalizedMessage,
        );

        const answer =
          typeof result?.response === "string"
            ? result.response.trim()
            : "";

        if (!answer) {
          throw new Error(
            "OrbitGuard AI returned an empty answer. Please try again.",
          );
        }

        // Ignore an old response after a conversation switch or
        // after the user starts a new chat.
        if (currentRequestIdRef.current !== requestId) {
          return;
        }

        const assistantMessage = {
          id: createMessageId("assistant"),
          role: "assistant",
          content: answer,
          timestamp: new Date().toISOString(),
        };

        // The assistant response is appended once, in one place.
        appendMessageToConversation(
          conversationId,
          assistantMessage,
        );

        updateConversation(
          conversationId,
          assistantMessage,
        );

        setFailedMessage(null);
        setChatError(null);
      } catch (error) {
        console.error(
          "[OrbitGuard AI] Message request failed:",
          error,
        );

        if (currentRequestIdRef.current !== requestId) {
          return;
        }

        setFailedMessage({
          content: normalizedMessage,
          conversationId,
        });

        setChatError(getChatErrorMessage(error));
      } finally {
        requestInProgressRef.current = false;

        if (currentRequestIdRef.current === requestId) {
          setChatLoading(false);
        }
      }
    },
    [
      activeConversationId,
      appendMessageToConversation,
      updateConversation,
    ],
  );

  const handleSendMessage = useCallback(
    async (message) => {
      await submitMessage(message);
    },
    [submitMessage],
  );

  // ------------------------------------------------------------
  // Retry without adding the user message again
  // ------------------------------------------------------------

  const handleRetry = useCallback(async () => {
    if (
      !failedMessage ||
      requestInProgressRef.current
    ) {
      return;
    }

    const { content, conversationId } = failedMessage;

    // Invalidate the previous failed request before retrying.
    currentRequestIdRef.current = null;

    setActiveConversationId(conversationId);
    setChatError(null);
    setChatNotice("");

    await submitMessage(content, {
      isRetry: true,
      retryConversationId: conversationId,
    });
  }, [failedMessage, submitMessage]);

  // ------------------------------------------------------------
  // Animation
  // ------------------------------------------------------------

  const pageAnimation = reduceMotion
    ? {}
    : {
        initial: "hidden",
        animate: "visible",
        variants: PAGE_VARIANTS,
      };

  // ------------------------------------------------------------
  // Shared conversation sidebar
  // ------------------------------------------------------------

  const conversationSidebar = (
    <ConversationSidebar
      conversations={conversations}
      activeConversationId={activeConversationId}
      onNewChat={handleNewChat}
      onSelectConversation={handleSelectConversation}
    />
  );

  // ------------------------------------------------------------
  // Shared assistant resources
  // ------------------------------------------------------------

  const assistantResources = (
    <>
      <SuggestedQuestions
        onSelectQuestion={handleSelectQuestion}
        disabled={chatLoading}
      />

      <CapabilitiesPanel />

      <ProfessionalGuidance />
    </>
  );

  // ------------------------------------------------------------
  // Shared mobile drawer header
  // ------------------------------------------------------------

  const renderDrawerHeader = (title, subtitle) => (
    <div
      className="
        flex shrink-0 items-center justify-between gap-3
        border-b border-cyan-500/15
        bg-[#061321] px-3 py-2.5
      "
    >
      <div className="min-w-0">
        <p
          className="
            font-['Orbitron'] text-[11px] font-semibold
            tracking-wide text-cyan-300
          "
        >
          {title}
        </p>

        <p className="mt-1 font-['Inter'] text-[10px] text-slate-500">
          {subtitle}
        </p>
      </div>

      <button
        type="button"
        onClick={closeDrawer}
        aria-label={`Close ${title}`}
        className="
          inline-flex h-8 w-8 shrink-0 items-center justify-center
          rounded-full border border-slate-700 bg-slate-900
          text-slate-300 transition-colors
          hover:border-cyan-400/50 hover:bg-cyan-400/10
          hover:text-cyan-300
          focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-cyan-400
        "
      >
        <FiX size={17} aria-hidden="true" />
      </button>
    </div>
  );

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  return (
    <motion.main
      {...pageAnimation}
      aria-label="OrbitGuard AI assistant"
      className="
        relative isolate
        flex h-[calc(100dvh-68px)]
        min-h-0 w-full min-w-0
        flex-col overflow-hidden
        bg-[#020914] text-slate-100
      "
    >
      <ProtectedBackground />

      {/* Main responsive workspace */}
      <div
        className="
          relative z-10 mx-auto
          grid min-h-0 w-full max-w-[1920px]
          min-w-0 flex-1 grid-cols-1
          gap-2 overflow-hidden p-2
          sm:gap-3 sm:p-3
          xl:grid-cols-[220px_minmax(0,1fr)_270px]
          xl:gap-3 xl:p-3
          2xl:grid-cols-[240px_minmax(0,1fr)_300px]
          2xl:gap-4 2xl:p-4
        "
      >
        {/* Desktop conversation sidebar */}
        <aside
          aria-label="Conversation history"
          className="
            hidden min-h-0 min-w-0
            xl:block xl:overflow-x-hidden
            xl:overflow-y-auto xl:overscroll-y-contain
            xl:scrollbar-thin
            xl:scrollbar-thumb-cyan-500/30
          "
        >
          {conversationSidebar}
        </aside>

        {/* Main chat workspace */}
        <section
          aria-label="AI chat workspace"
          className="
            flex h-full min-h-0 min-w-0
            flex-col gap-2 overflow-hidden
          "
        >
          {/* Hero and mobile drawer controls */}
          <div className="relative min-w-0 shrink-0">
            <div
              className="
                absolute right-2 top-2 z-20
                flex items-center gap-2
                xl:hidden
              "
            >
              <button
                type="button"
                onClick={() => toggleDrawer("conversations")}
                aria-label={
                  mobileDrawer === "conversations"
                    ? "Close recent conversations"
                    : "Open recent conversations"
                }
                aria-expanded={mobileDrawer === "conversations"}
                aria-controls={conversationsDrawerId}
                className="
                  inline-flex h-9 w-9 shrink-0
                  items-center justify-center
                  rounded-xl border border-cyan-500/30
                  bg-[#041321]/95 text-cyan-300
                  shadow-lg backdrop-blur-md transition-colors
                  hover:border-cyan-300/60 hover:bg-cyan-400/10
                  focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-cyan-400
                "
              >
                {mobileDrawer === "conversations" ? (
                  <FiX size={18} aria-hidden="true" />
                ) : (
                  <FiMessageSquare size={18} aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                onClick={() => toggleDrawer("resources")}
                aria-label={
                  mobileDrawer === "resources"
                    ? "Close assistant resources"
                    : "Open assistant resources"
                }
                aria-expanded={mobileDrawer === "resources"}
                aria-controls={resourcesDrawerId}
                className="
                  inline-flex h-9 w-9 shrink-0
                  items-center justify-center
                  rounded-xl border border-cyan-500/30
                  bg-[#041321]/95 text-cyan-300
                  shadow-lg backdrop-blur-md transition-colors
                  hover:border-cyan-300/60 hover:bg-cyan-400/10
                  focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-cyan-400
                "
              >
                {mobileDrawer === "resources" ? (
                  <FiX size={18} aria-hidden="true" />
                ) : (
                  <FiGrid size={18} aria-hidden="true" />
                )}
              </button>
            </div>

            <div className="min-w-0 max-w-full">
              <AIWelcomeHero />
            </div>
          </div>

          {/* Selected suggested question */}
          {selectedTopic && (
            <div
              className="
                flex min-w-0 shrink-0
                items-start justify-between gap-3
                rounded-xl border border-cyan-500/20
                bg-[#061321]/90 px-3 py-2
                backdrop-blur-sm
              "
            >
              <div className="min-w-0 flex-1">
                <p
                  className="
                    font-['Orbitron'] text-[9px]
                    uppercase tracking-wider text-cyan-300
                  "
                >
                  Selected question
                </p>

                <p
                  className="
                    mt-1 break-words font-['Inter']
                    text-xs leading-5 text-slate-200
                  "
                >
                  {selectedTopic}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTopic(null)}
                aria-label="Clear selected question"
                className="
                  shrink-0 rounded-lg px-2 py-1
                  text-xs text-slate-400 transition-colors
                  hover:bg-white/5 hover:text-cyan-300
                  focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-cyan-400
                "
              >
                Clear
              </button>
            </div>
          )}

          {/* Only the message region scrolls */}
          <div
            className="
              min-h-0 min-w-0 flex-1
              overflow-x-hidden overflow-y-auto
              overscroll-y-contain rounded-xl
              [scrollbar-width:thin]
              [scrollbar-color:rgba(34,211,238,0.25)_transparent]
            "
          >
            <ChatWorkspace
              messages={messages}
              loading={chatLoading}
              error={chatError}
              onRetry={handleRetry}
              onRateMessage={() => {
                // Feedback persistence requires a verified backend endpoint.
              }}
            />
          </div>

          {/* Request error/notice */}
          {(chatNotice || chatError) && (
            <div
              role={chatError ? "alert" : "status"}
              aria-live={chatError ? "assertive" : "polite"}
              className="
                flex min-w-0 shrink-0 items-start gap-2
                rounded-lg border border-cyan-400/15
                bg-[#061321]/95 px-3 py-1.5
                font-['Inter'] text-[11px]
                leading-4 text-slate-300
              "
            >
              <span
                aria-hidden="true"
                className="
                  mt-1 h-1.5 w-1.5 shrink-0
                  rounded-full bg-cyan-400
                "
              />

              <span className="min-w-0 flex-1 break-words">
                {chatError || chatNotice}
              </span>

              <button
                type="button"
                onClick={() => {
                  setChatNotice("");
                  setChatError(null);
                }}
                aria-label="Dismiss notification"
                className="
                  shrink-0 rounded px-1 text-slate-500
                  hover:text-cyan-300
                  focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-cyan-400
                "
              >
                ×
              </button>
            </div>
          )}

          {/* Composer stays outside the message scroll region */}
          <footer
            className="
              relative z-20 shrink-0
              bg-[#020914]/90 pt-1
              pb-[max(0.125rem,env(safe-area-inset-bottom))]
              backdrop-blur-md
            "
          >
            <ChatComposer
              onSendMessage={handleSendMessage}
              isLoading={chatLoading}
            />

            <p
              className="
                mt-1 px-1 text-center
                font-['Inter'] text-[9px]
                leading-3 text-slate-400
              "
            >
              OrbitGuard AI provides informational support.
              Verify operational decisions using authoritative
              sources.
            </p>
          </footer>
        </section>

        {/* Desktop assistant resources */}
        <aside
          aria-label="AI assistant resources"
          className="
            hidden min-h-0 min-w-0
            flex-col gap-3 overflow-x-hidden
            overflow-y-auto overscroll-y-contain
            xl:flex xl:scrollbar-thin
            xl:scrollbar-thumb-cyan-500/30
            xl:scrollbar-track-transparent
          "
        >
          {assistantResources}
        </aside>
      </div>

      {/* Mobile backdrop */}
      {mobileDrawer && (
        <button
          type="button"
          aria-label="Close open panel"
          onClick={closeDrawer}
          className="
            fixed inset-x-0 bottom-0 z-40
            bg-black/55 backdrop-blur-[2px]
            xl:hidden
          "
          style={{ top: `${NAVBAR_HEIGHT}px` }}
        />
      )}

      {/* Compact left drawer: recent conversations */}
      <aside
        id={conversationsDrawerId}
        aria-label="Recent conversations"
        aria-hidden={mobileDrawer !== "conversations"}
        inert={mobileDrawer !== "conversations"}
        className={`
          fixed left-3 z-50
          flex w-[min(76vw,290px)] flex-col
          overflow-hidden
          rounded-2xl border border-cyan-500/30
          bg-[#030b18]/[0.98]
          shadow-[0_12px_40px_rgba(0,0,0,0.55)]
          backdrop-blur-xl
          transition-[transform,opacity] duration-200 ease-out
          max-h-[min(68dvh,520px)]
          ${
            mobileDrawer === "conversations"
              ? "translate-x-0 opacity-100"
              : "-translate-x-[120%] opacity-0 pointer-events-none"
          }
          xl:hidden
        `}
        style={{ top: `${NAVBAR_HEIGHT + 16}px` }}
      >
        {renderDrawerHeader(
          "Recent Conversations",
          "Your conversation history",
        )}

        <div
          className="
            min-h-0 flex-1 overflow-x-hidden
            overflow-y-auto overscroll-y-contain p-2.5
            [scrollbar-width:thin]
            [scrollbar-color:rgba(34,211,238,0.3)_transparent]
          "
        >
          {conversationSidebar}
        </div>
      </aside>

      {/* Compact right drawer: assistant resources */}
      <aside
        id={resourcesDrawerId}
        aria-label="Assistant resources"
        aria-hidden={mobileDrawer !== "resources"}
        inert={mobileDrawer !== "resources"}
        className={`
          fixed right-3 z-50
          flex w-[min(82vw,320px)] flex-col
          overflow-hidden
          rounded-2xl border border-cyan-500/30
          bg-[#030b18]/[0.98]
          shadow-[0_12px_40px_rgba(0,0,0,0.55)]
          backdrop-blur-xl
          transition-[transform,opacity] duration-200 ease-out
          max-h-[min(72dvh,560px)]
          ${
            mobileDrawer === "resources"
              ? "translate-x-0 opacity-100"
              : "translate-x-[120%] opacity-0 pointer-events-none"
          }
          xl:hidden
        `}
        style={{ top: `${NAVBAR_HEIGHT + 16}px` }}
      >
        {renderDrawerHeader(
          "Assistant Resources",
          "Questions, capabilities and guidance",
        )}

        <div
          className="
            min-h-0 flex-1 space-y-3
            overflow-x-hidden overflow-y-auto
            overscroll-y-contain p-2.5
            [scrollbar-width:thin]
            [scrollbar-color:rgba(34,211,238,0.3)_transparent]
          "
        >
          {assistantResources}
        </div>
      </aside>
    </motion.main>
  );
};

export default AIAssistant;
