import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FiPaperclip,
  FiSend,
  FiCornerDownLeft,
} from "react-icons/fi";

const DEFAULT_MAX_LENGTH = 4000;
const MAX_TEXTAREA_HEIGHT = 120;

const ChatComposer = memo(function ChatComposer({
  onSendMessage,
  disabled = false,
  isLoading = false,
  maxLength = DEFAULT_MAX_LENGTH,
  placeholder = "Ask OrbitGuard AI a question...",
  onAttachFiles,
}) {
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const submittingRef = useRef(false);

  const normalizedDraft = draft.trim();

  const isBusy = disabled || isLoading || submitting;

  const canSend =
    normalizedDraft.length > 0 &&
    draft.length <= maxLength &&
    !isBusy &&
    typeof onSendMessage === "function";

  // Resize the textarea only as needed.
  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      MAX_TEXTAREA_HEIGHT,
    )}px`;
  }, [draft]);

  const handleDraftChange = useCallback(
    (event) => {
      const nextValue = event.target.value;

      if (nextValue.length <= maxLength) {
        setDraft(nextValue);
      }
    },
    [maxLength],
  );

  // Submit a single message.
  const handleSubmit = useCallback(
    async (event) => {
      event?.preventDefault();

      if (
        !normalizedDraft ||
        isBusy ||
        submittingRef.current ||
        typeof onSendMessage !== "function"
      ) {
        return;
      }

      submittingRef.current = true;
      setSubmitting(true);

      try {
        await onSendMessage(normalizedDraft);
        setDraft("");

        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      } catch (error) {
        // Preserve the draft when submission fails.
        console.error(
          "[OrbitGuard AI] Message submission failed.",
          error,
        );
      } finally {
        submittingRef.current = false;
        setSubmitting(false);
      }
    },
    [normalizedDraft, isBusy, onSendMessage],
  );

  // Enter sends; Shift + Enter inserts a newline.
  const handleKeyDown = useCallback(
    (event) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.nativeEvent.isComposing
      ) {
        event.preventDefault();
        handleSubmit(event);
      }
    },
    [handleSubmit],
  );

  const handleAttachmentClick = useCallback(() => {
    if (!isBusy && onAttachFiles) {
      fileInputRef.current?.click();
    }
  }, [isBusy, onAttachFiles]);

  const handleFilesSelected = useCallback(
    (event) => {
      const files = Array.from(event.target.files ?? []);

      // Allow the same file to be selected again.
      event.target.value = "";

      if (files.length > 0 && onAttachFiles) {
        onAttachFiles(files);
      }
    },
    [onAttachFiles],
  );

  return (
    <section
      aria-label="Message composer"
      className="relative z-10 w-full min-w-0"
    >
      <form
        onSubmit={handleSubmit}
        className="
          relative
          w-full
          min-w-0
          overflow-hidden
          rounded-xl
          border
          border-cyan-400/60
          bg-gradient-to-br
          from-[#091a2a]/98
          via-[#071321]/98
          to-[#050d18]/98
          shadow-[0_0_18px_rgba(0,190,255,0.06)]
          transition-shadow
          duration-200
          focus-within:border-cyan-300
          focus-within:shadow-[0_0_22px_rgba(0,190,255,0.12)]
        "
      >
        {/* Message input */}
        <div className="px-3 pt-2 sm:px-4 sm:pt-2.5">
          <label
            htmlFor="orbitguard-chat-input"
            className="sr-only"
          >
            Ask OrbitGuard AI a question
          </label>

          <textarea
            ref={textareaRef}
            id="orbitguard-chat-input"
            name="message"
            value={draft}
            onChange={handleDraftChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={1}
            disabled={isBusy}
            autoComplete="off"
            aria-describedby="orbitguard-composer-hint"
            className="
              block
              min-h-[34px]
              max-h-[120px]
              w-full
              resize-none
              overflow-y-auto
              bg-transparent
              py-1
              font-['Inter']
              text-[13px]
              leading-5
              text-slate-100
              outline-none
              placeholder:text-slate-400
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:text-sm
              [scrollbar-width:thin]
            "
          />
        </div>

        {/* Compact toolbar */}
        <div
          className="
            flex
            min-h-[38px]
            min-w-0
            items-center
            justify-between
            gap-2
            px-2.5
            pb-2
            pt-1
            sm:px-3
          "
        >
          {/* Attachment: disabled until upload is connected */}
          <div className="flex min-w-0 items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              tabIndex={-1}
              aria-label="Choose attachments"
              className="hidden"
              onChange={handleFilesSelected}
            />

            <button
              type="button"
              onClick={handleAttachmentClick}
              disabled={isBusy || !onAttachFiles}
              aria-label="Attach files"
              title={
                onAttachFiles
                  ? "Attach files"
                  : "File upload is not connected"
              }
              className="
                inline-flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                text-slate-400
                transition-colors
                hover:bg-white/[0.05]
                hover:text-cyan-300
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-cyan-400
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <FiPaperclip
                aria-hidden="true"
                className="h-4 w-4"
              />
            </button>

            <span
              id="orbitguard-composer-hint"
              className="
                hidden
                items-center
                gap-1
                pl-1
                font-['Inter']
                text-[10px]
                text-slate-500
                md:inline-flex
              "
            >
              <FiCornerDownLeft
                aria-hidden="true"
                className="h-3 w-3"
              />
              Shift + Enter for a new line
            </span>
          </div>

          {/* Character counter and send */}
          <div className="flex shrink-0 items-center gap-2">
            <span
              aria-live="polite"
              className={`
                font-['Inter']
                text-[10px]
                tabular-nums
                ${
                  draft.length >= maxLength
                    ? "text-amber-300"
                    : "text-slate-500"
                }
              `}
            >
              {draft.length} / {maxLength}
            </span>

            <button
              type="submit"
              disabled={!canSend}
              aria-label={
                isLoading || submitting
                  ? "Sending message"
                  : "Send message"
              }
              title="Send message"
              className="
                inline-flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-cyan-300/25
                bg-cyan-400
                text-[#03111d]
                transition-colors
                hover:bg-cyan-300
                active:scale-95
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-cyan-200
                disabled:cursor-not-allowed
                disabled:border-slate-700/60
                disabled:bg-slate-800
                disabled:text-slate-500
              "
            >
              <FiSend
                aria-hidden="true"
                className="h-4 w-4"
              />
            </button>
          </div>
        </div>
      </form>
    </section>
  );
});

ChatComposer.displayName = "ChatComposer";

export default ChatComposer;
