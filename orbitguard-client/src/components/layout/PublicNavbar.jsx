import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowUpRight, FiMenu, FiX } from "react-icons/fi";

const navigationItems = [
  { label: "Home", href: "#home" },
  { label: "Platform", href: "#platform" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Technology", href: "#technology" },
  { label: "About", href: "#about" },
];

const NAVBAR_TOP_THRESHOLD = 40;
const SCROLL_DIRECTION_THRESHOLD = 8;

const navbarTransition = {
  duration: 0.32,
  ease: [0.22, 1, 0.36, 1],
};

function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavbarCompact, setIsNavbarCompact] = useState(false);

  const location = useLocation();

  /*
   * This ref stores the previous window scroll position.
   *
   * It is intentionally a ref instead of state because changing
   * scroll position should NOT cause a React render.
   */
  const lastScrollYRef = useRef(0);

  /*
   * Prevents the scroll handler from immediately undoing a
   * deliberate UI action such as clicking the compact menu.
   */
  const ignoreNextScrollDirectionRef = useRef(false);

  /* =========================================================
     INITIALIZE SCROLL POSITION
  ========================================================== */

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
  }, []);

  /* =========================================================
     RESET NAVBAR WHEN ROUTE CHANGES
  ========================================================== */

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNavbarCompact(false);

    lastScrollYRef.current = window.scrollY;
  }, [location.pathname]);

  /* =========================================================
     GLOBAL SCROLL BEHAVIOR

     TOP
       ↓
     FULL NAVBAR

     SCROLL DOWN
       ↓
     COMPACT NAVBAR

     SCROLL UP
       ↓
     FULL NAVBAR

     IMPORTANT:
     This uses window scroll position only.
     It does not depend on Hero, Platform, About, etc.
  ========================================================== */

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const previousScrollY = lastScrollYRef.current;

      /*
       * Always restore the full navbar near the top.
       */
      if (currentScrollY <= NAVBAR_TOP_THRESHOLD) {
        setIsNavbarCompact(false);

        lastScrollYRef.current = currentScrollY;
        return;
      }

      /*
       * If a click explicitly changed the navbar state,
       * consume the next scroll event before calculating
       * direction again.
       */
      if (ignoreNextScrollDirectionRef.current) {
        ignoreNextScrollDirectionRef.current = false;
        lastScrollYRef.current = currentScrollY;
        return;
      }

      const scrollDifference =
        currentScrollY - previousScrollY;

      /*
       * Ignore very small trackpad/touchpad movements.
       */
      if (
        Math.abs(scrollDifference) <
        SCROLL_DIRECTION_THRESHOLD
      ) {
        lastScrollYRef.current = currentScrollY;
        return;
      }

      /*
       * SCROLL DOWN
       *
       * Full → Compact
       */
      if (scrollDifference > 0) {
        setIsNavbarCompact(true);
      }

      /*
       * SCROLL UP
       *
       * Compact → Full
       */
      else if (scrollDifference < 0) {
        setIsNavbarCompact(false);
      }

      /*
       * Always update the previous position AFTER
       * determining the direction.
       */
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =========================================================
     NORMAL NAVIGATION
  ========================================================== */

  const handleNavigation = () => {
    setIsMobileMenuOpen(false);

    /*
     * Do not force compact/full here.
     * Scroll position remains the source of truth.
     */
    lastScrollYRef.current = window.scrollY;

    ignoreNextScrollDirectionRef.current = true;
  };

  /* =========================================================
     COMPACT DESKTOP MENU

     Desktop behavior:

     COMPACT
        ↓
     click ☰
        ↓
     FULL NAVBAR

     No popup is created.
  ========================================================== */

  const handleCompactMenuClick = () => {
    setIsNavbarCompact(false);
    setIsMobileMenuOpen(false);

    /*
     * Synchronize scroll tracking with the current position.
     *
     * This prevents the next scroll event from immediately
     * changing the navbar back to compact.
     */
    lastScrollYRef.current = window.scrollY;

    ignoreNextScrollDirectionRef.current = true;
  };

  /* =========================================================
     MOBILE MENU TOGGLE
  ========================================================== */

  const handleMobileMenuToggle = () => {
    const nextState = !isMobileMenuOpen;

    setIsMobileMenuOpen(nextState);

    /*
     * Mobile navigation should always keep the navbar visible.
     */
    setIsNavbarCompact(false);

    lastScrollYRef.current = window.scrollY;

    ignoreNextScrollDirectionRef.current = true;
  };

  /* =========================================================
     CLOSE MOBILE MENU WHEN RESIZED TO DESKTOP
  ========================================================== */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /* =========================================================
     LOCK BODY SCROLL WHEN MOBILE MENU IS OPEN
  ========================================================== */

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-[100] w-full px-4 pt-4 sm:px-6 lg:px-8">
      <nav
        aria-label="Main navigation"
        className="relative mx-auto min-h-[44px] max-w-7xl"
      >
        {/* =====================================================
            FULL NAVBAR

            We KEEP this element mounted.

            This is important.

            We animate visibility instead of destroying and
            recreating the whole navbar.
        ====================================================== */}

        <motion.div
          initial={false}
          animate={{
            opacity: isNavbarCompact ? 0 : 1,
            y: isNavbarCompact ? -10 : 0,
            scale: isNavbarCompact ? 0.985 : 1,
          }}
          transition={navbarTransition}
          className={`
            flex
            w-full
            items-center
            justify-between
            gap-4
            ${
              isNavbarCompact
                ? "pointer-events-none absolute inset-x-0 top-0"
                : "relative"
            }
          `}
        >
          {/* =================================================
              BRAND
          ================================================== */}

          <Link
            to="/"
            aria-label="OrbitGuard AI home"
            onClick={handleNavigation}
            className="relative z-20 shrink-0 transition-opacity duration-200 hover:opacity-80"
          >
            <img
              src="/images/branding/orbitguard-compact-navbar.png"
              alt="OrbitGuard AI"
              className="h-auto w-[145px] sm:w-[165px] lg:w-[180px]"
              loading="eager"
              decoding="async"
            />
          </Link>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================== */}

          <div className="hidden items-center rounded-full border border-white/[0.1] bg-[#070b16]/70 p-1.5 shadow-[0_8px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:flex">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={handleNavigation}
                className="group relative rounded-full px-5 py-2.5 text-sm font-medium text-white/55 transition-colors duration-200 hover:text-white"
              >
                <span className="relative z-10">
                  {item.label}
                </span>

                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-white/[0.055] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                />
              </a>
            ))}
          </div>

          {/* =================================================
              DESKTOP CTA
          ================================================== */}

          <Link
            to="/register"
            onClick={handleNavigation}
            className="group hidden items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 p-[1px] lg:flex"
          >
            <span className="flex items-center gap-2 rounded-full bg-[#050816] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 group-hover:bg-transparent">
              Get Started

              <FiArrowUpRight
                size={16}
                className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </span>
          </Link>

          {/* =================================================
              MOBILE MENU BUTTON
          ================================================== */}

          <button
            type="button"
            aria-label={
              isMobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isMobileMenuOpen}
            onClick={handleMobileMenuToggle}
            className="relative z-20 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-[#070b16]/75 text-white shadow-[0_8px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-white/10 lg:hidden"
          >
            <AnimatePresence
              mode="wait"
              initial={false}
            >
              {isMobileMenuOpen ? (
                <motion.span
                  key="close"
                  initial={{
                    opacity: 0,
                    rotate: -45,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 1,
                    rotate: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    rotate: 45,
                    scale: 0.8,
                  }}
                  transition={{ duration: 0.16 }}
                >
                  <FiX size={20} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{
                    opacity: 0,
                    rotate: 45,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 1,
                    rotate: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    rotate: -45,
                    scale: 0.8,
                  }}
                  transition={{ duration: 0.16 }}
                >
                  <FiMenu size={20} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.div>

        {/* =====================================================
            COMPACT NAVBAR

            This element stays mounted too.

            It simply fades/slides into view when compact mode
            becomes active.
        ====================================================== */}

        <motion.div
          initial={false}
          animate={{
            opacity: isNavbarCompact ? 1 : 0,
            y: isNavbarCompact ? 0 : -10,
            scale: isNavbarCompact ? 1 : 0.985,
          }}
          transition={navbarTransition}
          className={`
            absolute
            right-0
            top-0
            flex
            items-center
            gap-3
            ${
              isNavbarCompact
                ? "pointer-events-auto"
                : "pointer-events-none"
            }
          `}
        >
          {/* =================================================
              COMPACT GET STARTED
          ================================================== */}

          <Link
            to="/register"
            onClick={handleNavigation}
            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 p-[1px]"
          >
            <span className="flex items-center gap-2 rounded-full bg-[#050816] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 group-hover:bg-transparent">
              Get Started

              <FiArrowUpRight
                size={16}
                className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </span>
          </Link>

          {/* =================================================
              COMPACT MENU

              DESKTOP:
              Clicking this restores FULL navbar.

              It does NOT open another popup.
          ================================================== */}

          <button
            type="button"
            aria-label="Show full navigation"
            aria-expanded={!isNavbarCompact}
            onClick={handleCompactMenuClick}
            className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-[#070b16]/75 text-white shadow-[0_8px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-white/10 lg:flex"
          >
            <motion.span
              initial={{
                opacity: 0,
                scale: 0.85,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.2,
              }}
            >
              <FiMenu size={20} />
            </motion.span>
          </button>

          {/* =================================================
              COMPACT MOBILE MENU

              On mobile the compact controls should still give
              access to the existing mobile navigation.
          ================================================== */}

          <button
            type="button"
            aria-label={
              isMobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isMobileMenuOpen}
            onClick={handleMobileMenuToggle}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-[#070b16]/75 text-white shadow-[0_8px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-white/10 lg:hidden"
          >
            {isMobileMenuOpen ? (
              <FiX size={20} />
            ) : (
              <FiMenu size={20} />
            )}
          </button>
        </motion.div>
      </nav>

      {/* =========================================================
          MOBILE NAVIGATION PANEL

          This remains your existing mobile behavior.
      ========================================================== */}

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
            transition={{
              duration: 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative z-10 mx-auto mt-3 max-w-7xl lg:hidden"
          >
            <div className="overflow-hidden rounded-3xl border border-white/[0.1] bg-[#070b16]/95 p-3 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
              {/* Navigation links */}

              <div className="flex flex-col">
                {navigationItems.map((item, index) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    onClick={handleNavigation}
                    initial={{
                      opacity: 0,
                      x: -8,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.035,
                    }}
                    className="rounded-2xl px-4 py-3.5 text-sm font-medium text-white/65 transition-colors duration-200 hover:bg-white/[0.055] hover:text-white"
                  >
                    {item.label}
                  </motion.a>
                ))}
              </div>

              {/* Mobile CTA */}

              <div className="mt-2 border-t border-white/[0.08] pt-3">
                <Link
                  to="/register"
                  onClick={handleNavigation}
                  className="group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 p-[1px]"
                >
                  <span className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#050816] px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 group-hover:bg-transparent">
                    Get Started

                    <FiArrowUpRight
                      size={16}
                      className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default PublicNavbar;