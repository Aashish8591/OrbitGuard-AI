import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowUpRight, FiPlay, FiSearch, FiX } from "react-icons/fi";

const VIDEO_SRC = "/images/About/about_vid.mp4";

/* ============================================================= */
/* VIDEO CARD                                                     */
/* ============================================================= */

function VideoCard({ onOpen }) {
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onOpen}
        aria-label="Watch OrbitGuard cinematic video"
        className="
          group
          block
          w-full
          cursor-pointer
          text-left
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-cyan-300/70
          focus-visible:ring-offset-2
          focus-visible:ring-offset-[#020611]
        "
      >
        <div
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-white/[0.17]
            bg-black/40
            shadow-[0_30px_90px_rgba(0,0,0,0.6)]
            backdrop-blur-sm
          "
        >
          <div className="relative aspect-video overflow-hidden">
            <video
              src={VIDEO_SRC}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              tabIndex={-1}
              className="
                pointer-events-none
                h-full
                w-full
                object-cover
                transition-transform
                duration-700
                group-hover:scale-[1.035]
              "
            />

            {/* Cinematic overlay */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-t
                from-black/85
                via-black/10
                to-black/10
              "
            />

            {/* Play button */}
            <div
              className="
                absolute
                left-1/2
                top-1/2
                flex
                h-11
                w-11
                -translate-x-1/2
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/25
                bg-black/30
                text-white/90
                backdrop-blur-md
                transition-all
                duration-300
                group-hover:scale-110
                group-hover:border-cyan-300/60
                group-hover:bg-cyan-300/10
              "
            >
              <FiPlay className="ml-0.5 text-xs" />
            </div>

            {/* Video metadata */}
            <div
              className="
                absolute
                bottom-4
                left-4
                right-4
                flex
                items-end
                justify-between
                gap-3
              "
            >
              <div>
                <p
                  className="
                    font-orbitron
                    text-[7px]
                    uppercase
                    tracking-[0.26em]
                    text-white/45
                  "
                >
                  A view from orbit
                </p>

                <p
                  className="
                    mt-1
                    font-inter
                    text-[10px]
                    font-medium
                    text-white/90
                  "
                >
                  The environment we monitor.
                </p>
              </div>

              <span
                className="
                  font-orbitron
                  text-[7px]
                  uppercase
                  tracking-[0.18em]
                  text-white/30
                "
              >
                WATCH
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Video caption */}
      <div
        className="
          mt-2
          flex
          items-center
          justify-between
          px-1
        "
      >
        <span
          className="
            font-orbitron
            text-[7px]
            uppercase
            tracking-[0.22em]
            text-white/25
          "
        >
          Click to watch
        </span>

        <span
          className="
            font-orbitron
            text-[7px]
            uppercase
            tracking-[0.18em]
            text-white/20
          "
        >
          01:59
        </span>
      </div>
    </div>
  );
}

/* ============================================================= */
/* EXPLORE PANEL                                                  */
/* ============================================================= */

function ExplorePanel() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.65,
        delay: 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        mt-5
        border-t
        border-white/[0.10]
        pt-4
      "
    >
      {/* Heading */}
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div className="min-w-0">
          <p
            className="
              font-orbitron
              text-[9px]
              uppercase
              tracking-[0.28em]
              text-cyan-300/60
            "
          >
            Explore & discover
          </p>

          <p
            className="
              mt-2
              max-w-[290px]
              font-inter
              text-[14px]
              font-light
              leading-5
              text-white/65
            "
          >
            Search satellites, debris and the orbital environment around Earth.
          </p>
        </div>

        {/* Search indicator */}
        <motion.div
          animate={{
            x: [0, 3, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-white/[0.12]
            bg-white/[0.025]
            text-cyan-300/70
          "
        >
          <FiSearch className="text-xs" />
        </motion.div>
      </div>

      {/* Action */}
      <Link
        to="/satellites"
        className="
          group
          mt-4
          inline-flex
          items-center
          gap-2
          border-b
          border-white/[0.16]
          pb-1.5
          font-orbitron
          text-[9px]
          font-medium
          uppercase
          tracking-[0.22em]
          text-white/60
          transition-colors
          duration-300
          hover:border-cyan-300/50
          hover:text-white
        "
      >
        Explore orbital data

        <FiArrowUpRight
          className="
            text-cyan-300/70
            transition-transform
            duration-300
            group-hover:-translate-y-0.5
            group-hover:translate-x-0.5
          "
        />
      </Link>
    </motion.div>
  );
}

/* ============================================================= */
/* EDITORIAL CONTENT                                              */
/* ============================================================= */

function EditorialContent() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -24,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      viewport={{
        once: true,
        amount: 0.25,
      }}
      transition={{
        duration: 0.85,
        delay: 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        relative
        w-full

        lg:absolute
        lg:left-10
        lg:top-32
        lg:z-30
        lg:max-w-[430px]

        xl:left-14
        xl:top-36
      "
    >
      <p
        className="
          mb-4
          font-orbitron
          text-[8px]
          uppercase
          tracking-[0.32em]
          text-cyan-300/65
          sm:text-[9px]
        "
      >
        The orbital environment
      </p>

      <h2
        className="
          font-orbitron
          text-[clamp(2.6rem,10vw,5.2rem)]
          font-light
          leading-[0.9]
          tracking-[-0.055em]
          text-white
          lg:text-[clamp(3rem,5vw,5.2rem)]
        "
      >
        Space never
        <br />
        stands still.
      </h2>

      <p
        className="
          mt-5
          max-w-[390px]
          font-inter
          text-xs
          font-light
          leading-6
          text-slate-200/60
          sm:text-sm
          sm:leading-7
        "
      >
        Satellites move. Debris travels. Orbital relationships change.
        OrbitGuard brings these movements into one intelligent operational view.
      </p>

      <motion.a
        href="#capabilities"
        whileHover={{ x: 5 }}
        transition={{ duration: 0.25 }}
        className="
          group
          mt-6
          inline-flex
          items-center
          gap-2.5
          border-b
          border-white/20
          pb-2
          font-orbitron
          text-[9px]
          font-medium
          uppercase
          tracking-[0.24em]
          text-white/75
          transition-colors
          hover:border-cyan-300/50
          hover:text-white
          sm:text-[10px]
        "
      >
        Explore OrbitGuard

        <FiArrowUpRight
          className="
            text-cyan-300
            transition-transform
            duration-300
            group-hover:-translate-y-0.5
            group-hover:translate-x-0.5
          "
        />
      </motion.a>
    </motion.div>
  );
}

/* ============================================================= */
/* CENTER LOGO                                                    */
/* ============================================================= */

function OrbitGuardLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 1,
        delay: 0.25,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        relative
        hidden
        items-center
        justify-center

        lg:absolute
        lg:left-1/2
        lg:top-[50%]
        lg:z-30
        lg:flex
        lg:-translate-x-1/2
        lg:-translate-y-1/2
      "
    >
      <motion.div
        aria-hidden="true"
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.22, 0.38, 0.22],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          h-28
          w-52
          rounded-full
          bg-cyan-300/[0.055]
          blur-[55px]

          sm:h-36
          sm:w-64

          lg:h-48
          lg:w-[360px]
        "
      />

      <img
        src="/images/branding/orbitguard-full.png"
        alt="OrbitGuard AI"
        className="
          relative
          z-10
          w-[270px]
          object-contain
          drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)]

          xl:w-[310px]
        "
      />
    </motion.div>
  );
}

/* ============================================================= */
/* BOTTOM EDITORIAL MESSAGE                                      */
/* ============================================================= */

function BottomEditorial() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 14,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.8,
        delay: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        relative
        mt-10
        w-full
        border-t
        border-white/[0.08]
        pt-4

        lg:absolute
        lg:bottom-15
        lg:right-10
        lg:mt-0
        lg:w-auto
        lg:max-w-[280px]
        lg:border-t-0
        lg:pt-0
        lg:text-right
      "
    >
      <div
        className="
          mb-3
          h-px
          w-10
          bg-cyan-300/40
          lg:ml-auto
        "
      />

      <p
        className="
          font-orbitron
          text-[7px]
          uppercase
          tracking-[0.28em]
          text-cyan-300/55
        "
      >
        Explore the orbit
      </p>

      <p
        className="
          mt-2
          max-w-[280px]
          font-inter
          text-[11px]
          font-light
          leading-5
          text-white/55
          sm:text-xs
        "
      >
        Discover what is moving above us, and understand the environment around
        Earth.
      </p>

      <Link
        to="/satellites"
        className="
          group
          mt-3
          inline-flex
          items-center
          gap-2
          font-orbitron
          text-[7px]
          uppercase
          tracking-[0.2em]
          text-white/45
          transition-colors
          hover:text-white
        "
      >
        Enter orbital explorer

        <FiArrowUpRight
          className="
            text-cyan-300/70
            transition-transform
            duration-300
            group-hover:-translate-y-0.5
            group-hover:translate-x-0.5
          "
        />
      </Link>
    </motion.div>
  );
}

/* ============================================================= */
/* ABOUT                                                          */
/* ============================================================= */

function About() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  /*
   * Lock page scrolling while the cinematic video modal is open.
   * Escape closes the modal.
   */
  useEffect(() => {
    if (!isVideoOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsVideoOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVideoOpen]);

  const openVideo = () => {
    setIsVideoOpen(true);
  };

  const closeVideo = () => {
    setIsVideoOpen(false);
  };

  return (
    <>
      <section
        id="about"
        className="
          relative
          w-full
          overflow-hidden
          px-3
          py-6
          sm:px-5
          sm:py-8
          lg:min-h-svh
          lg:px-8
          lg:py-12
        "
      >
        {/* ===================================================== */}
        {/* MAIN CINEMATIC FRAME                                   */}
        {/* ===================================================== */}

        <div
          className="
            relative
            mx-auto
            min-h-0
            w-full
            max-w-[1700px]
            overflow-hidden
            rounded-[24px]
            border
            border-white/[0.12]
            bg-[#020611]
            shadow-[0_35px_120px_rgba(0,0,0,0.55)]

            lg:min-h-[820px]
            lg:rounded-[40px]
          "
        >
          {/* =================================================== */}
          {/* CINEMATIC BACKGROUND                                */}
          {/* =================================================== */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              overflow-hidden
            "
          >
            {/* Main image */}
            <div
              className="
                absolute
                inset-0
                scale-[1.04]
                bg-[url('/images/About/about_bg.png')]
                bg-cover
                bg-[center_top]
                bg-no-repeat
                opacity-[0.9]
                lg:bg-center
              "
            />

            {/* Overall grade */}
            <div
              className="
                absolute
                inset-0
                bg-[#020611]/30
              "
            />

            {/* Top darkness */}
            <div
              className="
                absolute
                inset-x-0
                top-0
                h-[35%]
                bg-gradient-to-b
                from-[#020611]/85
                via-[#020611]/25
                to-transparent
              "
            />

            {/* Bottom darkness */}
            <div
              className="
                absolute
                inset-x-0
                bottom-0
                h-[48%]
                bg-gradient-to-t
                from-[#020611]/95
                via-[#020611]/45
                to-transparent
              "
            />

            {/* Mobile left readability */}
            <div
              className="
                absolute
                inset-y-0
                left-0
                w-full
                bg-gradient-to-r
                from-[#020611]/75
                via-[#020611]/25
                to-transparent
                lg:w-[48%]
                lg:from-[#020611]/70
                lg:via-[#020611]/30
              "
            />

            {/* Center atmosphere */}
            <div
              className="
                absolute
                left-1/2
                top-[45%]
                h-[300px]
                w-[300px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-cyan-400/[0.035]
                blur-[100px]
                sm:h-[360px]
                sm:w-[360px]
                lg:top-[48%]
              "
            />
          </div>

          {/* =================================================== */}
          {/* FRAME                                               */}
          {/* =================================================== */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              z-50
              rounded-[24px]
              ring-1
              ring-inset
              ring-white/[0.08]
              lg:rounded-[40px]
            "
          />

          {/* =================================================== */}
          {/* CONTENT                                              */}
          {/* =================================================== */}

          <div
            className="
              relative
              z-20

              flex
              flex-col
              px-5
              pb-8
              pt-6

              sm:px-7
              sm:pb-10
              sm:pt-7

              lg:block
              lg:min-h-[820px]
              lg:px-0
              lg:pb-0
              lg:pt-0
            "
          >
            {/* ================================================= */}
            {/* TOP META                                           */}
            {/* ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: -12,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.25,
              }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                relative
                flex
                w-full
                items-center
                justify-between

                lg:absolute
                lg:left-10
                lg:right-10
                lg:top-9
                lg:z-30
                lg:w-auto
              "
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-cyan-300
                    shadow-[0_0_14px_rgba(103,232,249,0.85)]
                  "
                />

                <span
                  className="
                    font-orbitron
                    text-[8px]
                    font-medium
                    uppercase
                    tracking-[0.3em]
                    text-white/50
                    sm:text-[9px]
                  "
                >
                  OrbitGuard Intelligence
                </span>
              </div>

              <span
                className="
                  font-orbitron
                  text-[9px]
                  uppercase
                  tracking-[0.28em]
                  text-white/30
                "
              >
                05
              </span>
            </motion.div>

            {/* ================================================= */}
            {/* EDITORIAL                                         */}
            {/* ================================================= */}

            <div
              className="
                mt-16
                w-full

                lg:mt-0
              "
            >
              <EditorialContent />
            </div>

            {/* ================================================= */}
            {/* MOBILE / TABLET LOGO                               */}
            {/* ================================================= */}

            <div className="hidden lg:block">
              <OrbitGuardLogo />
            </div>

            {/* ================================================= */}
            {/* VIDEO + EXPLORE                                    */}
            {/* ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                relative
                mt-10
                w-full
                max-w-[390px]
                self-center

                lg:absolute
                lg:right-10
                lg:top-32
                lg:z-30
                lg:mt-0
                lg:w-[350px]
                lg:max-w-none

                xl:right-14
                xl:top-36
                xl:w-[390px]
              "
            >
              <VideoCard onOpen={openVideo} />

              <ExplorePanel />
            </motion.div>

            {/* ================================================= */}
            {/* BOTTOM LEFT                                       */}
            {/* ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
                x: -10,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.7,
                delay: 0.35,
              }}
              className="
                relative
                mt-10
                border-t
                border-white/[0.08]
                pt-4

                lg:absolute
                lg:bottom-12
                lg:left-10
                lg:mt-0
                lg:border-t-0
                lg:pt-0
              "
            >
              <div className="hidden lg:block">
                <p
                  className="
                    font-orbitron
                    text-[7px]
                    uppercase
                    tracking-[0.25em]
                    text-white/25
                  "
                >
                  Orbital environment
                </p>

                <p
                  className="
                    mt-1
                    font-orbitron
                    text-[7px]
                    uppercase
                    tracking-[0.18em]
                    text-cyan-300/40
                  "
                >
                  Observe what moves
                </p>
              </div>
            </motion.div>

            {/* ================================================= */}
            {/* BOTTOM RIGHT                                      */}
            {/* ================================================= */}

            <BottomEditorial />
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/* CINEMATIC VIDEO MODAL                                    */}
      {/* ======================================================= */}

      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.25,
            }}
            className="
              fixed
              inset-0
              z-[999]
              flex
              items-center
              justify-center
              bg-[#01030a]/[0.94]
              p-4
              backdrop-blur-md
              sm:p-8
            "
            role="dialog"
            aria-modal="true"
            aria-label="OrbitGuard cinematic video"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeVideo();
              }
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.94,
                y: 18,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 10,
              }}
              transition={{
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                relative
                w-full
                max-w-[1200px]
              "
              onMouseDown={(event) => {
                event.stopPropagation();
              }}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={closeVideo}
                aria-label="Close video"
                className="
                  absolute
                  -top-12
                  right-0
                  z-20
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/15
                  bg-white/[0.06]
                  text-white/70
                  backdrop-blur-md
                  transition-all
                  duration-200
                  hover:border-cyan-300/40
                  hover:bg-cyan-300/10
                  hover:text-white
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-cyan-300/70
                  sm:-right-1
                "
              >
                <FiX className="text-base" />
              </button>

              {/* Video */}
              <div
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/[0.15]
                  bg-black
                  shadow-[0_40px_120px_rgba(0,0,0,0.7)]
                "
              >
                <video
                  key={VIDEO_SRC}
                  src={VIDEO_SRC}
                  autoPlay
                  controls
                  playsInline
                  preload="auto"
                  className="
                    block
                    aspect-video
                    h-auto
                    max-h-[78vh]
                    w-full
                    object-contain
                    bg-black
                  "
                />
              </div>

              {/* Modal footer */}
              <div
                className="
                  mt-3
                  flex
                  items-center
                  justify-between
                  px-1
                "
              >
                <span
                  className="
                    font-orbitron
                    text-[8px]
                    uppercase
                    tracking-[0.24em]
                    text-white/35
                  "
                >
                  A view from orbit
                </span>

                <span
                  className="
                    font-orbitron
                    text-[8px]
                    uppercase
                    tracking-[0.2em]
                    text-white/25
                  "
                >
                  ESC / CLOSE
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default About;