import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import {
  FaCloudArrowDown,
  FaMagnifyingGlass,
  FaRotate,
  FaChevronDown,
} from "react-icons/fa6";

/**
 * ================================================================
 * OrbitGuard AI - Responsive Toolbar Dropdown
 * ================================================================
 *
 * Shared presentation dropdown used for:
 * - Debris sort field
 * - Sort direction
 *
 * IMPORTANT:
 * This component does not perform sorting.
 * The parent page owns sorting state.
 * ================================================================
 */

const ToolbarDropdown = ({
  id,
  value,
  options,
  onChange,
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 288,
    openUpward: false,
  });

  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  /* ============================================================
     FIND SELECTED OPTION
  ============================================================ */

  const selectedOption =
    options.find(
      (option) => option.value === value
    ) ?? options[0];

  /* ============================================================
     CALCULATE DROPDOWN POSITION
  ============================================================ */

  const updateMenuPosition = () => {
    const trigger = triggerRef.current;

    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const viewportPadding = 12;
    const menuGap = 6;

    const availableWidth =
      viewportWidth - viewportPadding * 2;

    const menuWidth = Math.min(
      rect.width,
      availableWidth
    );

    let left = rect.left;

    if (
      left + menuWidth >
      viewportWidth - viewportPadding
    ) {
      left =
        viewportWidth -
        viewportPadding -
        menuWidth;
    }

    if (left < viewportPadding) {
      left = viewportPadding;
    }

    /* ========================================================
       VERTICAL POSITIONING
    ======================================================== */

    const spaceBelow =
      viewportHeight -
      rect.bottom -
      menuGap -
      viewportPadding;

    const spaceAbove =
      rect.top -
      menuGap -
      viewportPadding;

    const preferredMaxHeight = Math.min(
      288,
      Math.max(
        160,
        viewportHeight * 0.45
      )
    );

    const shouldOpenUpward =
      spaceBelow < 180 &&
      spaceAbove > spaceBelow;

    if (shouldOpenUpward) {
      const maxHeight = Math.min(
        preferredMaxHeight,
        spaceAbove
      );

      setMenuPosition({
        top: Math.max(
          viewportPadding,
          rect.top -
            menuGap -
            maxHeight
        ),
        left,
        width: menuWidth,
        maxHeight,
        openUpward: true,
      });

      return;
    }

    const maxHeight = Math.min(
      preferredMaxHeight,
      Math.max(
        120,
        spaceBelow
      )
    );

    setMenuPosition({
      top: rect.bottom + menuGap,
      left,
      width: menuWidth,
      maxHeight,
      openUpward: false,
    });
  };

  /* ============================================================
     UPDATE POSITION WHEN OPEN
  ============================================================ */

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    updateMenuPosition();

    const handleViewportChange = () => {
      updateMenuPosition();
    };

    window.addEventListener(
      "scroll",
      handleViewportChange,
      true
    );

    window.addEventListener(
      "resize",
      handleViewportChange
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleViewportChange,
        true
      );

      window.removeEventListener(
        "resize",
        handleViewportChange
      );
    };
  }, [isOpen]);

  /* ============================================================
     CLOSE WHEN CLICKING OUTSIDE
  ============================================================ */

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      const target = event.target;

      const clickedTrigger =
        dropdownRef.current?.contains(target);

      const clickedMenu =
        menuRef.current?.contains(target);

      if (
        !clickedTrigger &&
        !clickedMenu
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
    };
  }, [isOpen]);

  /* ============================================================
     CLOSE WITH ESCAPE
  ============================================================ */

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);

        triggerRef.current?.focus();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen]);

  /* ============================================================
     OPTION SELECTION
  ============================================================ */

  const handleOptionSelect = (optionValue) => {
    onChange?.(optionValue);

    setIsOpen(false);

    triggerRef.current?.focus();
  };

  /* ============================================================
     TOGGLE DROPDOWN
  ============================================================ */

  const handleToggle = () => {
    if (!isOpen) {
      requestAnimationFrame(() => {
        updateMenuPosition();
      });
    }

    setIsOpen((previous) => !previous);
  };

  return (
    <>
      {/* ========================================================
          DROPDOWN TRIGGER
      ======================================================== */}

      <div
        ref={dropdownRef}
        id={id}
        className="
          relative
          w-full
        "
      >
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={ariaLabel}
          aria-controls={
            isOpen
              ? `${id}-menu`
              : undefined
          }
          onClick={handleToggle}
          className={`
            flex
            h-11
            w-full
            items-center
            justify-between
            gap-3
            rounded-lg
            border
            bg-slate-950/70
            px-4
            pr-3

            font-['Inter']
            text-xs
            font-medium
            text-slate-200

            outline-none
            transition-all
            duration-200

            ${
              isOpen
                ? "border-cyan-400/60 bg-slate-950 ring-2 ring-cyan-400/10"
                : "border-slate-700/80"
            }

            hover:border-slate-600

            focus:border-cyan-400/60
            focus:bg-slate-950
            focus:ring-2
            focus:ring-cyan-400/10

            sm:h-12
          `}
        >
          <span
            className="
              min-w-0
              truncate
              text-left
            "
          >
            {selectedOption?.label}
          </span>

          <FaChevronDown
            aria-hidden="true"
            className={`
              shrink-0
              text-[10px]
              text-slate-400
              transition-transform
              duration-200

              ${
                isOpen
                  ? "rotate-180 text-cyan-300"
                  : ""
              }
            `}
          />
        </button>
      </div>

      {/* ========================================================
          PORTAL DROPDOWN MENU
      ======================================================== */}

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            id={`${id}-menu`}
            role="listbox"
            aria-label={ariaLabel}
            style={{
              position: "fixed",
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              width: `${menuPosition.width}px`,
              maxHeight: `${menuPosition.maxHeight}px`,
            }}
            className="
              z-[99999]
              overflow-x-hidden
              overflow-y-auto
              overscroll-contain
              rounded-lg
              border
              border-slate-700/90
              bg-[#020817]
              p-1
              shadow-[0_16px_40px_rgba(0,0,0,0.65)]
              scrollbar-thin
              scrollbar-track-transparent
              scrollbar-thumb-slate-700
            "
          >
            {options.map((option) => {
              const isSelected =
                option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() =>
                    handleOptionSelect(
                      option.value
                    )
                  }
                  className={`
                    flex
                    min-h-10
                    w-full
                    items-center
                    rounded-md
                    px-3
                    py-2
                    text-left
                    font-['Inter']
                    text-xs
                    transition-colors
                    duration-150

                    ${
                      isSelected
                        ? "bg-cyan-500/10 text-cyan-300"
                        : "text-slate-300"
                    }

                    hover:bg-slate-800/80
                    hover:text-cyan-200

                    focus:bg-slate-800/80
                    focus:text-cyan-200
                    focus:outline-none
                  `}
                >
                  <span className="truncate">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
};

/**
 * ================================================================
 * OrbitGuard AI - Debris Toolbar
 * ================================================================
 *
 * Presentation-only component for the Debris Registry.
 *
 * Responsibilities:
 * - Render debris search control
 * - Render backend-compatible sorting controls
 * - Trigger CelesTrak synchronization
 *
 * IMPORTANT:
 * - No Axios
 * - No API calls
 * - No filtering
 * - No sorting calculations
 * - No pagination
 *
 * DebrisOverviewPage owns:
 * - Search state
 * - Sort state
 * - Pagination
 * - Synchronization request
 *
 * ================================================================
 */

const DebrisToolbar = ({
  /* ============================================================
     SEARCH
  ============================================================ */

  searchQuery = "",
  onSearchChange,

  /* ============================================================
     SORTING
  ============================================================ */

  sortBy = "createdAt",
  onSortChange,

  sortDirection = "desc",
  onSortDirectionChange,

  /* ============================================================
     CELESTRAK SYNC
  ============================================================ */

  onSync,
  isSyncing = false,
}) => {
  const searchId = useId();
  const sortId = useId();
  const directionId = useId();

  /* ============================================================
     SORT FIELD OPTIONS
  ============================================================ */

  const sortOptions = [
    {
      value: "createdAt",
      label: "Created At",
    },
    {
      value: "debrisName",
      label: "Debris Name",
    },
    {
      value: "debrisCode",
      label: "Debris Code",
    },
    {
      value: "updatedAt",
      label: "Updated At",
    },
  ];

  /* ============================================================
     SORT DIRECTION OPTIONS
  ============================================================ */

  const directionOptions = [
    {
      value: "desc",
      label: "Desc",
    },
    {
      value: "asc",
      label: "Asc",
    },
  ];

  /* ============================================================
     EVENT HANDLERS
  ============================================================ */

  const handleSearchChange = (event) => {
    onSearchChange?.(
      event.target.value
    );
  };

  const handleSortChange = (value) => {
    onSortChange?.(value);
  };

  const handleDirectionChange = (value) => {
    onSortDirectionChange?.(value);
  };

  const handleSync = () => {
    if (isSyncing) {
      return;
    }

    onSync?.();
  };

  return (
    <section
      aria-label="Debris registry controls"
      className="
        relative
        w-full
      "
    >
      {/* ======================================================
          RESPONSIVE TOOLBAR
      ======================================================= */}

      <div
        className="
          flex
          w-full
          flex-col
          gap-3

          lg:flex-row
          lg:items-center
          lg:gap-4
        "
      >
        {/* ====================================================
            LEFT / PRIMARY CONTROLS
        ===================================================== */}

        <div
          className="
            grid
            w-full
            min-w-0
            grid-cols-2
            gap-3

            lg:flex-1
            lg:grid-cols-[minmax(260px,390px)_170px_120px]
            lg:items-center
          "
        >
          {/* ==================================================
              SEARCH
          =================================================== */}

          <div
            className="
              relative
              col-span-2
              min-w-0
              w-full

              lg:col-span-1
            "
          >
            <label
              htmlFor={searchId}
              className="sr-only"
            >
              Search debris
            </label>

            <FaMagnifyingGlass
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                z-10
                -translate-y-1/2
                text-sm
                text-slate-400
              "
              aria-hidden="true"
            />

            <input
              id={searchId}
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search debris by name..."
              autoComplete="off"
              spellCheck="false"
              className="
                h-11
                w-full
                rounded-lg
                border
                border-slate-700/80
                bg-slate-950/70
                pl-11
                pr-4
                font-['Inter']
                text-sm
                text-slate-200
                outline-none
                placeholder:text-slate-500
                transition-all
                duration-200
                hover:border-slate-600
                focus:border-cyan-400/60
                focus:bg-slate-950
                focus:ring-2
                focus:ring-cyan-400/10
                sm:h-12
              "
            />
          </div>

          {/* ==================================================
              SORT FIELD
          =================================================== */}

          <div
            className="
              min-w-0
              w-full
            "
          >
            <ToolbarDropdown
              id={sortId}
              value={sortBy}
              options={sortOptions}
              onChange={handleSortChange}
              ariaLabel="Sort debris by"
            />
          </div>

          {/* ==================================================
              SORT DIRECTION
          =================================================== */}

          <div
            className="
              min-w-0
              w-full
            "
          >
            <ToolbarDropdown
              id={directionId}
              value={sortDirection}
              options={directionOptions}
              onChange={handleDirectionChange}
              ariaLabel="Sort direction"
            />
          </div>
        </div>

        {/* ====================================================
            RIGHT ACTION
        ===================================================== */}

        <div
          className="
            flex
            w-full
            lg:w-auto
            lg:shrink-0
          "
        >
          {/* ==================================================
              SYNC CELESTRAK
          =================================================== */}

          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            aria-busy={isSyncing}
            className="
              group
              inline-flex
              h-11
              w-full
              items-center
              justify-center
              gap-3
              rounded-lg
              border
              border-cyan-500/70
              bg-cyan-500/5
              px-5
              text-left
              transition-all
              duration-200
              hover:border-cyan-400
              hover:bg-cyan-500/10
              hover:shadow-[0_0_24px_rgba(34,211,238,0.10)]
              focus:outline-none
              focus:ring-2
              focus:ring-cyan-400/40
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:h-12
              sm:w-auto
              sm:min-w-[210px]
              lg:min-w-[205px]
            "
          >
            <span
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-cyan-400/10
                text-cyan-400
                transition-transform
                duration-300
                group-hover:scale-105
              "
            >
              {isSyncing ? (
                <FaRotate
                  className="animate-spin text-sm"
                  aria-hidden="true"
                />
              ) : (
                <FaCloudArrowDown
                  className="text-sm"
                  aria-hidden="true"
                />
              )}
            </span>

            <span
              className="
                flex
                min-w-0
                flex-col
              "
            >
              <span
                className="
                  font-['Orbitron']
                  text-[10px]
                  font-semibold
                  tracking-[0.04em]
                  text-cyan-300
                "
              >
                {isSyncing
                  ? "SYNCING..."
                  : "SYNC CELESTRAK"}
              </span>

              <span
                className="
                  mt-0.5
                  font-['Inter']
                  text-[9px]
                  text-slate-400
                "
              >
                {isSyncing
                  ? "Importing debris data..."
                  : "Import debris from CelesTrak"}
              </span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default DebrisToolbar;