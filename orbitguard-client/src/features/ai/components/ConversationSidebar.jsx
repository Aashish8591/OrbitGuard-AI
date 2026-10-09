import {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import { motion, useReducedMotion } from "framer-motion";

import {
  FiMessageSquare,
  FiPlus,
  FiSearch,
  FiX,
  FiClock,
} from "react-icons/fi";

/**
 * ================================================================
 * OrbitGuard AI — Conversation Sidebar
 * ================================================================
 *
 * RESPONSIBILITIES
 * - Start a new conversation.
 * - Search existing conversation titles and previews.
 * - Highlight the selected conversation.
 * - Display recent conversation history.
 * - Provide a readable, responsive empty state.
 *
 * DATA INTEGRITY
 * - No fabricated saved conversations.
 * - An explicitly supplied [] displays the empty state.
 * - The parent owns conversation lifecycle and persistence.
 *
 * RESPONSIVE DESIGN
 * - Desktop: full-height sidebar with independently scrolling
 *   conversation history.
 * - Mobile/tablet: naturally sized sidebar with a scrollable list.
 *
 * EXPECTED CONVERSATION SHAPE
 * {
 *   id: string,
 *   title: string,
 *   preview?: string,
 *   timestamp?: string
 * }
 * ================================================================
 */

const normalizeSearchText = (value) =>
  typeof value === "string"
    ? value.trim().toLocaleLowerCase()
    : "";

const ConversationSidebar = memo(function ConversationSidebar({
  conversations = [],
  activeConversationId = null,
  onNewChat,
  onSelectConversation,
}) {
  const shouldReduceMotion = useReducedMotion();

  const [searchQuery, setSearchQuery] = useState("");

  const conversationList = useMemo(() => {
    if (!Array.isArray(conversations)) {
      return [];
    }

    return conversations.filter(
      (conversation) =>
        conversation &&
        conversation.id !== undefined &&
        conversation.id !== null,
    );
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    const query = normalizeSearchText(searchQuery);

    if (!query) {
      return conversationList;
    }

    return conversationList.filter((conversation) => {
      const title = normalizeSearchText(conversation.title);
      const preview = normalizeSearchText(conversation.preview);

      return title.includes(query) || preview.includes(query);
    });
  }, [conversationList, searchQuery]);

  const handleNewChat = useCallback(() => {
    setSearchQuery("");
    onNewChat?.();
  }, [onNewChat]);

  const handleSelectConversation = useCallback(
    (conversation) => {
      if (
        !conversation ||
        conversation.id === undefined ||
        conversation.id === null
      ) {
        return;
      }

      onSelectConversation?.(conversation);
    },
    [onSelectConversation],
  );

  const hasSearchQuery = searchQuery.trim().length > 0;

  return (
    <motion.aside
      initial={
        shouldReduceMotion ? false : { opacity: 0, x: -6 }
      }
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.25,
        ease: "easeOut",
      }}
      aria-label="Conversation history"
      className="
        relative
        flex
        min-h-[360px]
        w-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-cyan-400/20
        bg-[#030b18]/95
        shadow-[0_12px_40px_rgba(0,0,0,0.22)]
        backdrop-blur-xl

        xl:h-full
        xl:min-h-0
      "
    >
      {/* ======================================================
          NEW CHAT
          ====================================================== */}

      <div className="shrink-0 px-3 pt-3 sm:px-3.5 sm:pt-3.5">
        <button
          type="button"
          onClick={handleNewChat}
          className="
            group
            flex
            min-h-11
            w-full
            min-w-0
            items-center
            gap-2.5
            rounded-xl
            border
            border-cyan-400/45
            bg-gradient-to-r
            from-cyan-500/[0.12]
            to-cyan-400/[0.035]
            px-3
            text-left
            text-cyan-300
            transition-colors
            duration-200
            hover:border-cyan-300/80
            hover:bg-cyan-400/[0.10]
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-cyan-300
            focus-visible:ring-offset-2
            focus-visible:ring-offset-[#030b18]
          "
        >
          <FiPlus
            aria-hidden="true"
            className="h-[17px] w-[17px] shrink-0"
          />

          <span className="min-w-0 flex-1 font-['Inter'] text-[13px] font-semibold">
            New Chat
          </span>

          <FiX
            aria-hidden="true"
            className="
              h-4
              w-4
              shrink-0
              text-cyan-400/65
              transition-transform
              duration-200
              group-hover:rotate-90
              group-hover:text-cyan-200
            "
          />
        </button>
      </div>

      {/* ======================================================
          SEARCH
          ====================================================== */}

      <div className="shrink-0 px-3 pt-2.5 sm:px-3.5">
        <label
          htmlFor="ai-conversation-search"
          className="
            flex
            min-h-11
            min-w-0
            items-center
            gap-2.5
            rounded-xl
            border
            border-slate-700/75
            bg-[#0a1728]/90
            px-3
            transition-colors
            focus-within:border-cyan-400/55
            focus-within:ring-1
            focus-within:ring-cyan-400/20
          "
        >
          <FiSearch
            aria-hidden="true"
            className="h-[17px] w-[17px] shrink-0 text-slate-400"
          />

          <input
            id="ai-conversation-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search conversations..."
            autoComplete="off"
            className="
              min-w-0
              flex-1
              bg-transparent
              py-2
              font-['Inter']
              text-[12px]
              leading-5
              text-slate-100
              outline-none
              placeholder:text-slate-400
              placeholder:opacity-100
            "
          />

          {hasSearchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear conversation search"
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-md
                text-slate-400
                hover:bg-white/5
                hover:text-cyan-300
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-cyan-300
              "
            >
              <FiX aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
        </label>
      </div>

      {/* ======================================================
          RECENT CONVERSATIONS HEADER
          ====================================================== */}

      <div
        className="
          flex
          shrink-0
          items-center
          justify-between
          gap-2
          px-3.5
          pb-2.5
          pt-5
          sm:px-3.5
        "
      >
        <h2
          className="
            min-w-0
            whitespace-nowrap
            font-['Orbitron']
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.055em]
            text-slate-300

            2xl:text-[10px]
            2xl:tracking-[0.07em]
          "
        >
          Recent Conversations
        </h2>

        <span
          aria-label={`${filteredConversations.length} conversations`}
          className="
            inline-flex
            h-[22px]
            min-w-[22px]
            shrink-0
            items-center
            justify-center
            rounded-md
            border
            border-slate-700/70
            bg-white/[0.025]
            px-1.5
            font-['Inter']
            text-[10px]
            font-medium
            tabular-nums
            text-slate-300
          "
        >
          {filteredConversations.length}
        </span>
      </div>

      {/* ======================================================
          CONVERSATION LIST
          ====================================================== */}

      <div
        className="
          min-h-0
          flex-1
          overflow-x-hidden
          overflow-y-auto
          overscroll-contain
          px-2
          pb-3
          [scrollbar-color:rgba(71,85,105,0.45)_transparent]
          [scrollbar-width:thin]
          sm:px-2.5
        "
      >
        {filteredConversations.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {filteredConversations.map((conversation, index) => {
              const isActive =
                activeConversationId === conversation.id;

              const title =
                typeof conversation.title === "string" &&
                conversation.title.trim()
                  ? conversation.title.trim()
                  : "Untitled conversation";

              const preview =
                typeof conversation.preview === "string"
                  ? conversation.preview
                  : "";

              const timestamp =
                typeof conversation.timestamp === "string"
                  ? conversation.timestamp
                  : "";

              return (
                <motion.button
                  key={conversation.id}
                  type="button"
                  initial={
                    shouldReduceMotion
                      ? false
                      : { opacity: 0, y: 4 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.18,
                    delay: shouldReduceMotion
                      ? 0
                      : Math.min(index * 0.02, 0.12),
                  }}
                  onClick={() =>
                    handleSelectConversation(conversation)
                  }
                  aria-current={isActive ? "true" : undefined}
                  className={`
                    group
                    relative
                    flex
                    min-h-[66px]
                    w-full
                    min-w-0
                    items-start
                    gap-2
                    overflow-hidden
                    rounded-xl
                    border
                    px-2.5
                    py-2.5
                    text-left
                    transition-colors
                    duration-200
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-inset
                    focus-visible:ring-cyan-300

                    ${
                      isActive
                        ? "border-cyan-400/20 bg-gradient-to-r from-cyan-400/[0.13] to-cyan-400/[0.035]"
                        : "border-transparent bg-transparent hover:border-slate-700/60 hover:bg-white/[0.035]"
                    }
                  `}
                >
                  {/* Active conversation indicator */}

                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="
                        absolute
                        bottom-2
                        left-0
                        top-2
                        w-[2px]
                        rounded-full
                        bg-cyan-400
                        shadow-[0_0_8px_rgba(34,211,238,0.55)]
                      "
                    />
                  )}

                  {/* Conversation icon */}

                  <span
                    className={`
                      mt-0.5
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      ${
                        isActive
                          ? "text-cyan-300"
                          : "text-slate-400 group-hover:text-cyan-300"
                      }
                    `}
                  >
                    <FiMessageSquare
                      aria-hidden="true"
                      className="h-[17px] w-[17px]"
                    />
                  </span>

                  {/* Title and preview */}

                  <span className="min-w-0 flex-1">
                    <span
                      title={title}
                      className={`
                        block
                        truncate
                        font-['Inter']
                        text-[12px]
                        font-semibold
                        leading-[1.55]
                        ${
                          isActive
                            ? "text-white"
                            : "text-slate-200 group-hover:text-white"
                        }
                      `}
                    >
                      {title}
                    </span>

                    {preview && (
                      <span
                        title={preview}
                        className="
                          mt-0.5
                          block
                          truncate
                          font-['Inter']
                          text-[11px]
                          leading-[1.5]
                          text-slate-400
                        "
                      >
                        {preview}
                      </span>
                    )}
                  </span>

                  {/* Timestamp */}

                  {timestamp && (
                    <span
                      title={timestamp}
                      className="
                        mt-1
                        max-w-[64px]
                        shrink-0
                        truncate
                        text-right
                        font-['Inter']
                        text-[10px]
                        leading-4
                        text-slate-400
                      "
                    >
                      {timestamp}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        ) : (
          /* Empty and search-no-results states */

          <div
            className="
              flex
              min-h-[190px]
              flex-col
              items-center
              justify-center
              px-3
              py-6
              text-center

              sm:min-h-[220px]
            "
            role="status"
            aria-live="polite"
          >
            <span
              className="
                mb-3.5
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                border
                border-cyan-400/20
                bg-cyan-400/[0.055]
                text-cyan-300
              "
            >
              <FiMessageSquare
                aria-hidden="true"
                className="h-6 w-6"
              />
            </span>

            <p
              className="
                font-['Inter']
                text-[13px]
                font-semibold
                leading-5
                text-slate-200
              "
            >
              {hasSearchQuery
                ? "No conversations found"
                : "No conversations yet"}
            </p>

            <p
              className="
                mt-1.5
                max-w-[220px]
                font-['Inter']
                text-[11px]
                leading-[1.8]
                text-slate-400
              "
            >
              {hasSearchQuery
                ? "Try another search term."
                : "Start a new chat to begin exploring orbital intelligence."}
            </p>
          </div>
        )}
      </div>

      {/* ======================================================
          SIDEBAR FOOTER
          ====================================================== */}

      <div
        className="
          flex
          shrink-0
          items-center
          gap-2.5
          border-t
          border-slate-800/80
          px-3.5
          py-3
        "
      >
        <span
          aria-hidden="true"
          className="
            h-1.5
            w-1.5
            shrink-0
            rounded-full
            bg-cyan-400/85
            shadow-[0_0_7px_rgba(34,211,238,0.4)]
          "
        />

        <span
          className="
            font-['Orbitron']
            text-[8px]
            uppercase
            tracking-[0.09em]
            text-slate-400
          "
        >
          AI Conversation Workspace
        </span>

        <span className="sr-only">
          Conversation history panel
        </span>
      </div>
    </motion.aside>
  );
});

ConversationSidebar.displayName = "ConversationSidebar";

export default ConversationSidebar;
