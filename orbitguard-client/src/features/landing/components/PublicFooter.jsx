import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FiArrowUpRight,
  FiChevronUp,
} from 'react-icons/fi'

const footerNavigation = [
  {
    title: 'Explore',
    links: [
      { label: 'Home', href: '#home' },
      { label: 'Platform', href: '#platform' },
      { label: 'Capabilities', href: '#capabilities' },
      { label: 'Technology', href: '#technology' },
      { label: 'About', href: '#about' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { label: 'Satellites', href: '/satellites' },
      { label: 'Space Debris', href: '/debris' },
      { label: 'Risk Assessment', href: '/risks' },
      { label: '3D Visualization', href: '/visualization' },
    ],
  },
  {
    title: 'Intelligence',
    links: [
      { label: 'AI Assistant', href: '/ai-assistant' },
      { label: 'Reports', href: '/reports' },
      { label: 'Alerts', href: '/alerts' },
      { label: 'Notifications', href: '/notifications' },
    ],
  },
]

function FooterLink({ href, children }) {
  const isInternalRoute = href.startsWith('/')

  const className = `
    group
    inline-flex
    w-fit
    items-center
    gap-1.5
    font-inter
    text-[13px]
    font-light
    leading-5
    text-white/50
    transition-colors
    duration-300
    hover:text-white
    sm:text-[14px]
  `

  const arrow = (
    <FiArrowUpRight
      className="
        text-[11px]
        text-cyan-300/0
        transition-all
        duration-300
        group-hover:-translate-y-0.5
        group-hover:translate-x-0.5
        group-hover:text-cyan-300/70
      "
    />
  )

  if (isInternalRoute) {
    return (
      <Link
        to={href}
        className={className}
      >
        <span>{children}</span>
        {arrow}
      </Link>
    )
  }

  return (
    <a
      href={href}
      className={className}
    >
      <span>{children}</span>
      {arrow}
    </a>
  )
}

function FooterColumn({ title, links }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
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
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <p
        className="
          mb-5
          font-orbitron
          text-[10px]
          font-medium
          uppercase
          tracking-[0.24em]
          text-cyan-300/60
          sm:text-[11px]
        "
      >
        {title}
      </p>

      <nav className="flex flex-col gap-3">
        {links.map((link) => (
          <FooterLink
            key={link.label}
            href={link.href}
          >
            {link.label}
          </FooterLink>
        ))}
      </nav>
    </motion.div>
  )
}

function MissionControlPanel() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 35,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.18,
      }}
      transition={{
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        group
        relative
        min-h-[430px]
        overflow-hidden
        rounded-[28px]
        border
        border-white/[0.13]
        bg-[#02050d]
        shadow-[0_35px_110px_rgba(0,0,0,0.65)]
        sm:min-h-[480px]
        sm:rounded-[34px]
        lg:min-h-[520px]
        lg:rounded-[40px]
      "
    >
      {/* =====================================================
          BACKGROUND IMAGE
          ===================================================== */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        <motion.div
          className="
            absolute
            inset-0
            bg-[url('/images/Footer/landing_footerBg.png')]
            bg-cover
            bg-center
            bg-no-repeat
          "
          initial={{
            scale: 1.02,
          }}
          whileInView={{
            scale: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 1.8,
            ease: [0.22, 1, 0.36, 1],
          }}
        />

        {/* Dark left side */}
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-[#02050d]
            via-[#02050d]/85
            via-[48%]
            to-[#02050d]/10
          "
        />

        {/* Bottom fade */}
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-[#02050d]/95
            via-[#02050d]/20
            to-transparent
          "
        />

        {/* Top fade */}
        <div
          className="
            absolute
            inset-x-0
            top-0
            h-32
            bg-gradient-to-b
            from-[#02050d]/70
            to-transparent
          "
        />

        {/* Cinematic cyan atmosphere */}
        <motion.div
          aria-hidden="true"
          animate={{
            opacity: [0.18, 0.28, 0.18],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="
            absolute
            right-[18%]
            top-[42%]
            h-[220px]
            w-[220px]
            rounded-full
            bg-cyan-400/[0.035]
            blur-[100px]
            sm:h-[300px]
            sm:w-[300px]
          "
        />

        {/* Fine inner frame */}
        <div
          className="
            absolute
            inset-0
            rounded-[28px]
            ring-1
            ring-inset
            ring-white/[0.07]
            sm:rounded-[34px]
            lg:rounded-[40px]
          "
        />
      </div>

      {/* =====================================================
          TOP LABEL
          ===================================================== */}
      <div
        className="
          absolute
          left-5
          right-5
          top-5
          z-20
          flex
          items-center
          justify-between
          sm:left-8
          sm:right-8
          sm:top-7
          lg:left-10
          lg:right-10
          lg:top-8
        "
      >
        <div className="flex items-center gap-2.5">
          <motion.span
            animate={{
              opacity: [0.45, 1, 0.45],
              scale: [0.9, 1.15, 0.9],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
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
              text-[9px]
              uppercase
              tracking-[0.3em]
              text-white/45
              sm:text-[10px]
            "
          >
            OrbitGuard AI
          </span>
        </div>

        <span
          className="
            font-orbitron
            text-[9px]
            uppercase
            tracking-[0.25em]
            text-white/25
            sm:text-[10px]
          "
        >
          2026
        </span>
      </div>

      {/* =====================================================
          CTA CONTENT
          ===================================================== */}
      <div
        className="
          relative
          z-10
          flex
          min-h-[430px]
          items-end
          px-5
          pb-9
          pt-28
          sm:min-h-[480px]
          sm:px-8
          sm:pb-11
          lg:min-h-[520px]
          lg:px-12
          lg:pb-12
        "
      >
        <motion.div
          initial={{
            opacity: 0,
            x: -30,
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
            max-w-[680px]
          "
        >
          {/* Eyebrow */}
          <div
            className="
              mb-5
              flex
              items-center
              gap-3
            "
          >
            <span
              className="
                h-px
                w-10
                bg-cyan-300/55
                sm:w-14
              "
            />

            <span
              className="
                font-orbitron
                text-[9px]
                uppercase
                tracking-[0.28em]
                text-cyan-300/70
                sm:text-[10px]
              "
            >
              Mission Control
            </span>
          </div>

          {/* Heading */}
          <h2
            className="
              font-inter
              max-w-[680px]
              text-[clamp(2.8rem,8vw,6rem)]
              font-light
              leading-[0.88]
              tracking-[-0.065em]
              text-white
            "
          >
            Know what is
            <br />
            above you.
          </h2>

          {/* Description */}
          <p
            className="
              font-inter
              mt-6
              max-w-[500px]
              text-[13px]
              font-light
              leading-6
              text-slate-200/65
              sm:text-[15px]
              sm:leading-7
            "
          >
            Bring satellites, debris, orbital movement, and
            collision intelligence into one operational view.
          </p>

          {/* CTA */}
          <Link
            to="/dashboard"
            className="
              group/cta
              mt-8
              inline-flex
              items-center
              gap-3
              rounded-full
              border
              border-white/[0.18]
              bg-[#02050d]/45
              px-5
              py-3
              font-orbitron
              text-[10px]
              font-medium
              uppercase
              tracking-[0.18em]
              text-white/80
              backdrop-blur-md
              transition-all
              duration-300
              hover:border-cyan-300/50
              hover:bg-cyan-300/[0.08]
              hover:text-white
              sm:px-6
              sm:py-3.5
              sm:text-[11px]
            "
          >
            Enter Mission Control

            <span
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-full
                border
                border-white/[0.14]
                transition-all
                duration-300
                group-hover/cta:border-cyan-300/50
                group-hover/cta:bg-cyan-300/[0.08]
              "
            >
              <FiArrowUpRight
                className="
                  text-cyan-300/75
                  transition-transform
                  duration-300
                  group-hover/cta:-translate-y-0.5
                  group-hover/cta:translate-x-0.5
                "
              />
            </span>
          </Link>
        </motion.div>
      </div>

      {/* Bottom technical marker */}
      <div
        className="
          absolute
          bottom-7
          right-7
          z-20
          hidden
          items-center
          gap-2
          lg:flex
        "
      >
        <span
          className="
            font-orbitron
            text-[8px]
            uppercase
            tracking-[0.2em]
            text-white/25
          "
        >
          Orbit / Intelligence / Action
        </span>
      </div>
    </motion.div>
  )
}

function PublicFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      id="footer"
      className="
        relative
        w-full
        overflow-hidden
        px-3
        pb-5
        pt-10
        sm:px-5
        sm:pb-7
        sm:pt-14
        lg:px-8
        lg:pt-20
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1700px]
        "
      >
        {/* =================================================
            FINAL MISSION CTA
            ================================================= */}
        <MissionControlPanel />

        {/* =================================================
            FOOTER BODY
            ================================================= */}
        <div
          className="
            relative
            mt-14
            border-t
            border-white/[0.08]
            pt-12
            sm:mt-16
            sm:pt-14
            lg:mt-20
            lg:pt-16
          "
        >
          <div
            className="
              grid
              gap-12
              lg:grid-cols-[1.7fr_1fr_1fr_1fr]
              lg:gap-10
            "
          >
            {/* =================================================
                BRAND
                ================================================= */}
            <motion.div
              initial={{
                opacity: 0,
                y: 15,
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
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                max-w-[430px]
              "
            >
              <Link
                to="/"
                className="
                  inline-flex
                  transition-opacity
                  duration-300
                  hover:opacity-80
                "
              >
                <img
                  src="/images/branding/orbitguard-compact-navbar.png"
                  alt="OrbitGuard AI"
                  className="
                    h-auto
                    w-[210px]
                    object-contain
                    sm:w-[240px]
                  "
                />
              </Link>

              <p
                className="
                  font-inter
                  mt-6
                  max-w-[400px]
                  text-[13px]
                  font-light
                  leading-6
                  text-slate-200/55
                  sm:text-[14px]
                  sm:leading-7
                "
              >
                A unified environment for observing orbital
                objects, understanding their movement, and
                identifying what matters.
              </p>
            </motion.div>

            {/* =================================================
                NAVIGATION
                ================================================= */}
            {footerNavigation.map((column) => (
              <FooterColumn
                key={column.title}
                title={column.title}
                links={column.links}
              />
            ))}
          </div>

          {/* =================================================
              BOTTOM BAR
              ================================================= */}
          <div
            className="
              mt-14
              flex
              flex-col
              gap-5
              border-t
              border-white/[0.07]
              pt-6
              sm:mt-16
              sm:flex-row
              sm:items-center
              sm:justify-between
              lg:mt-20
            "
          >
            <span
              className="
                font-inter
                text-[11px]
                font-light
                text-white/30
                sm:text-[12px]
              "
            >
              © {currentYear} OrbitGuard AI
            </span>

            <a
              href="#home"
              className="
                group
                inline-flex
                w-fit
                items-center
                gap-2
                font-orbitron
                text-[9px]
                uppercase
                tracking-[0.2em]
                text-white/30
                transition-colors
                duration-300
                hover:text-white/70
                sm:text-[10px]
              "
            >
              Back to top

              <span
                className="
                  flex
                  h-6
                  w-6
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/[0.10]
                  transition-all
                  duration-300
                  group-hover:border-cyan-300/40
                  group-hover:bg-cyan-300/[0.06]
                "
              >
                <FiChevronUp
                  className="
                    text-cyan-300/65
                    transition-transform
                    duration-300
                    group-hover:-translate-y-0.5
                  "
                />
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter