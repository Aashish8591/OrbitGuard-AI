import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiArrowLeft,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiMail,
  FiUser,
  FiLock,
} from 'react-icons/fi'

const EASE = [0.22, 1, 0.36, 1]

function Register() {
  const shouldReduceMotion = useReducedMotion()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  /* ================================================================
     FORM CHANGE
     ================================================================ */

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    setErrors((previous) => ({
      ...previous,
      [name]: '',
      submit: '',
    }))
  }

  /* ================================================================
     FORM VALIDATION
     ================================================================ */

  const validateForm = () => {
    const nextErrors = {}

    const fullName = formData.fullName.trim()
    const email = formData.email.trim()
    const password = formData.password
    const confirmPassword = formData.confirmPassword

    /* Full Name */

    if (!fullName) {
      nextErrors.fullName = 'Full name is required.'
    } else if (
      fullName.length < 3 ||
      fullName.length > 50
    ) {
      nextErrors.fullName =
        'Full name must be between 3 and 50 characters.'
    }

    /* Email */

    if (!email) {
      nextErrors.email = 'Email is required.'
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      nextErrors.email =
        'Please enter a valid email address.'
    }

    /* Password */

    if (!password) {
      nextErrors.password = 'Password is required.'
    } else if (
      password.length < 8 ||
      password.length > 20
    ) {
      nextErrors.password =
        'Password must be between 8 and 20 characters.'
    }

    /* Confirm Password */

    if (!confirmPassword) {
      nextErrors.confirmPassword =
        'Please confirm your password.'
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword =
        'Passwords do not match.'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  /* ================================================================
     SUBMIT
     ================================================================ */

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (status !== 'idle') {
      return
    }

    if (!validateForm()) {
      return
    }

    setStatus('loading')

    try {
      /*
       * Only backend fields are sent.
       *
       * confirmPassword remains frontend-only.
       */

      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      }

      /*
       * Uses VITE_API_BASE_URL when frontend and backend
       * are deployed separately.
       *
       * Example:
       *
       * VITE_API_BASE_URL=http://localhost:8080
       *
       * Result:
       *
       * POST http://localhost:8080/api/auth/register
       */

      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || ''

      const response = await fetch(
        `${baseUrl}/api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      )

      let data = {}

      try {
        data = await response.json()
      } catch {
        data = {}
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            'Unable to create account.',
        )
      }

      /* Registration successful */

      setStatus('success')

      /*
       * Give the success state time to display
       * before navigating to Login.
       */

      setTimeout(() => {
        navigate('/login')
      }, shouldReduceMotion ? 0 : 1000)
    } catch (error) {
      console.error(
        'Registration failed:',
        error,
      )

      setStatus('idle')

      setErrors({
        submit:
          error.message ||
          'Unable to create account. Please try again.',
      })
    }
  }

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#050816] text-white">

      {/* =========================================================
          BACKGROUND
          ========================================================= */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >

        {/* Earth */}

        <div
          className="
            absolute
            inset-0
            bg-[url('/images/capabilities/01_background_earth.jpg')]
            bg-cover
            bg-center
            opacity-[0.50]
          "
        />

        {/* Dark overlay */}

        <div
          className="
            absolute
            inset-0
            bg-[#050816]/80
          "
        />

        {/* Cyan atmosphere */}

        <div
          className="
            absolute
            left-[-15%]
            top-[15%]
            h-[440px]
            w-[440px]
            rounded-full
            bg-cyan-400/[0.055]
            blur-[130px]
          "
        />

        {/* Blue atmosphere */}

        <div
          className="
            absolute
            bottom-[-20%]
            right-[-10%]
            h-[460px]
            w-[460px]
            rounded-full
            bg-blue-500/[0.055]
            blur-[140px]
          "
        />

        {/* Technical grid */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.04]
            [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)]
            [background-size:80px_80px]
          "
        />
      </div>

      {/* =========================================================
          HEADER
          ========================================================= */}

      <header
        className="
          relative
          z-20
          flex
          items-center
          justify-between
          px-5
          py-5
          sm:px-8
          sm:py-7
          lg:px-12
        "
      >

        {/* OrbitGuard Logo */}

        <Link
          to="/"
          className="
            group
            inline-flex
            items-center
          "
        >
          <img
            src="/images/branding/orbitguard-full.png"
            alt="OrbitGuard AI"
            className="
              h-7
              w-auto
              object-contain
              sm:h-8
            "
          />
        </Link>

        {/* Back to Home */}

        <Link
          to="/"
          className="
            group
            inline-flex
            items-center
            gap-2
            text-[10px]
            font-medium
            uppercase
            tracking-[0.18em]
            text-white/40
            transition-colors
            duration-300
            hover:text-white
          "
        >
          <FiArrowLeft
            size={13}
            className="
              transition-transform
              duration-300
              group-hover:-translate-x-1
            "
          />

          Back to home
        </Link>
      </header>

      {/* =========================================================
          REGISTER AREA
          ========================================================= */}

      <section
        className="
          relative
          z-10
          flex
          min-h-[calc(100svh-84px)]
          items-center
          justify-center
          px-4
          pb-10
          pt-2
          sm:px-6
          sm:pb-12
          lg:px-8
        "
      >
        <motion.div
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 22,
                  scale: 0.985,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.7,
            ease: EASE,
          }}
          className="w-full max-w-[1040px]"
        >

          {/* =======================================================
              MAIN AUTH CARD
              ======================================================= */}

          <div
            className="
              rounded-[30px]
              border
              border-cyan-300/[0.10]
              bg-[#0a1020]/90
              p-2.5
              shadow-[18px_18px_45px_rgba(0,0,0,0.55),-12px_-12px_35px_rgba(255,255,255,0.025)]
            "
          >

            {/* INNER CARD */}

            <div
              className="
                overflow-hidden
                rounded-[24px]
                border
                border-white/[0.07]
                bg-[#080d1a]/95
              "
            >

              <div className="grid lg:grid-cols-[0.72fr_1.28fr]">

                {/* =================================================
                    LEFT PANEL
                    ================================================= */}

                <motion.div
                  initial={
                    shouldReduceMotion
                      ? false
                      : {
                          opacity: 0,
                          x: -18,
                        }
                  }
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    duration: shouldReduceMotion
                      ? 0
                      : 0.65,
                    delay: shouldReduceMotion
                      ? 0
                      : 0.1,
                    ease: EASE,
                  }}
                  className="
                    relative
                    flex
                    flex-col
                    justify-center
                    border-b
                    border-white/[0.07]
                    px-7
                    py-9
                    sm:px-10
                    sm:py-10
                    lg:border-b-0
                    lg:border-r
                    lg:px-10
                    lg:py-12
                    xl:px-12
                  "
                >

                  {/* Orbital circle 1 */}

                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute
                      -left-24
                      top-1/2
                      hidden
                      h-56
                      w-56
                      -translate-y-1/2
                      rounded-full
                      border
                      border-cyan-300/[0.07]
                      lg:block
                    "
                  />

                  {/* Orbital circle 2 */}

                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute
                      -left-16
                      top-1/2
                      hidden
                      h-40
                      w-40
                      -translate-y-1/2
                      rounded-full
                      border
                      border-blue-400/[0.06]
                      lg:block
                    "
                  />

                  {/* Logo */}

                  <motion.div
                    initial={
                      shouldReduceMotion
                        ? false
                        : {
                            opacity: 0,
                            scale: 0.8,
                          }
                    }
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      duration: shouldReduceMotion
                        ? 0
                        : 0.5,
                      delay: shouldReduceMotion
                        ? 0
                        : 0.18,
                    }}
                    className="
                      relative
                      z-10
                      flex
                      justify-center
                      lg:justify-start
                    "
                  >
                    <div
                      className="
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/[0.08]
                        bg-[#0b1222]
                      "
                    >
                      <img
                        src="/images/branding/orbitguard-mark.png"
                        alt=""
                        className="
                          h-9
                          w-9
                          object-contain
                        "
                      />
                    </div>
                  </motion.div>

                  {/* Heading */}

                  <motion.div
                    initial={
                      shouldReduceMotion
                        ? false
                        : {
                            opacity: 0,
                            y: 10,
                          }
                    }
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: shouldReduceMotion
                        ? 0
                        : 0.55,
                      delay: shouldReduceMotion
                        ? 0
                        : 0.25,
                      ease: EASE,
                    }}
                    className="
                      relative
                      z-10
                      mt-6
                      text-center
                      lg:text-left
                    "
                  >
                    <p
                      className="
                        mb-3
                        text-[9px]
                        font-medium
                        uppercase
                        tracking-[0.28em]
                        text-cyan-300/55
                      "
                    >
                      Space Domain Intelligence
                    </p>

                    <h1
                      className="
                        text-3xl
                        font-light
                        tracking-[-0.04em]
                        text-white
                        sm:text-4xl
                      "
                    >
                      Create
                      <span className="text-cyan-300/90">
                        {' '}Account
                      </span>
                    </h1>

                    <p
                      className="
                        mx-auto
                        mt-3
                        max-w-[300px]
                        text-sm
                        leading-6
                        text-white/35
                        lg:mx-0
                      "
                    >
                      Start your journey with
                      OrbitGuard AI and explore
                      intelligent space awareness.
                    </p>
                  </motion.div>

                  {/* Security Status */}

                  <motion.div
                    initial={
                      shouldReduceMotion
                        ? false
                        : {
                            opacity: 0,
                          }
                    }
                    animate={{
                      opacity: 1,
                    }}
                    transition={{
                      duration: shouldReduceMotion
                        ? 0
                        : 0.5,
                      delay: shouldReduceMotion
                        ? 0
                        : 0.45,
                    }}
                    className="
                      relative
                      z-10
                      mt-8
                      flex
                      items-center
                      justify-center
                      gap-2
                      lg:justify-start
                    "
                  >
                    <span
                      className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-cyan-300
                        shadow-[0_0_10px_rgba(103,232,249,0.55)]
                      "
                    />

                    <span
                      className="
                        font-mono
                        text-[8px]
                        uppercase
                        tracking-[0.2em]
                        text-white/20
                      "
                    >
                      Secure registration
                    </span>
                  </motion.div>
                </motion.div>

                {/* =================================================
                    RIGHT FORM
                    ================================================= */}

                <motion.div
                  initial={
                    shouldReduceMotion
                      ? false
                      : {
                          opacity: 0,
                          x: 18,
                        }
                  }
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    duration: shouldReduceMotion
                      ? 0
                      : 0.65,
                    delay: shouldReduceMotion
                      ? 0
                      : 0.18,
                    ease: EASE,
                  }}
                  className="
                    px-6
                    py-8
                    sm:px-10
                    sm:py-10
                    lg:px-10
                    lg:py-10
                    xl:px-12
                  "
                >

                  <form
                    onSubmit={handleSubmit}
                    noValidate
                  >

                    {/* =================================================
                        FORM TITLE
                        ================================================= */}

                    <div className="mb-6">
                      <p
                        className="
                          text-[9px]
                          font-medium
                          uppercase
                          tracking-[0.24em]
                          text-white/25
                        "
                      >
                        Mission Control Access
                      </p>

                      <div
                        className="
                          mt-2
                          h-px
                          w-full
                          bg-white/[0.06]
                        "
                      />
                    </div>

                    {/* =================================================
                        FIELDS
                        ================================================= */}

                    <div
                      className="
                        grid
                        gap-4
                        md:grid-cols-2
                      "
                    >

                      {/* Full Name */}

                      <AnimatedField
                        label="Full Name"
                        name="fullName"
                        type="text"
                        placeholder="Your full name"
                        value={formData.fullName}
                        error={errors.fullName}
                        icon={FiUser}
                        onChange={handleChange}
                        autoComplete="name"
                      />

                      {/* Email */}

                      <AnimatedField
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        error={errors.email}
                        icon={FiMail}
                        onChange={handleChange}
                        autoComplete="email"
                      />

                      {/* Password */}

                      <PasswordField
                        label="Password"
                        name="password"
                        placeholder="Create a strong password"
                        value={formData.password}
                        error={errors.password}
                        visible={showPassword}
                        setVisible={setShowPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                      />

                      {/* Confirm Password */}

                      <PasswordField
                        label="Confirm Password"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        error={errors.confirmPassword}
                        visible={showConfirmPassword}
                        setVisible={setShowConfirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                      />

                    </div>

                    {/* =================================================
                        PASSWORD INFORMATION
                        ================================================= */}

                    <p
                      className="
                        mt-3
                        px-1
                        text-[10px]
                        leading-4
                        text-white/25
                      "
                    >
                      Password must be between
                      8 and 20 characters.
                    </p>

                    {/* =================================================
                        SUBMIT ERROR
                        ================================================= */}

                    {errors.submit && (
                      <motion.p
                        initial={{
                          opacity: 0,
                          y: -4,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className="
                          mt-3
                          px-1
                          text-[10px]
                          text-red-300/80
                        "
                      >
                        {errors.submit}
                      </motion.p>
                    )}

                    {/* =================================================
                        CREATE ACCOUNT BUTTON
                        ================================================= */}

                    <RegisterButton
                      status={status}
                      shouldReduceMotion={
                        shouldReduceMotion
                      }
                    />

                    {/* =================================================
                        LOGIN LINK
                        ================================================= */}

                    <motion.div
                      initial={
                        shouldReduceMotion
                          ? false
                          : {
                              opacity: 0,
                            }
                      }
                      animate={{
                        opacity: 1,
                      }}
                      transition={{
                        duration: shouldReduceMotion
                          ? 0
                          : 0.5,
                        delay: shouldReduceMotion
                          ? 0
                          : 0.6,
                      }}
                      className="
                        mt-6
                        flex
                        items-center
                        justify-center
                        gap-2
                        text-xs
                        text-white/30
                      "
                    >
                      <span>
                        Already have an account?
                      </span>

                      <Link
                        to="/login"
                        className="
                          group
                          inline-flex
                          items-center
                          gap-1.5
                          font-medium
                          text-cyan-300/70
                          transition-colors
                          duration-300
                          hover:text-cyan-200
                        "
                      >
                        Sign in

                        <FiArrowRight
                          size={11}
                          className="
                            transition-transform
                            duration-300
                            group-hover:translate-x-0.5
                          "
                        />
                      </Link>
                    </motion.div>

                  </form>
                </motion.div>
              </div>
            </div>
          </div>

          {/* =======================================================
              BOTTOM LABEL
              ======================================================= */}

          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : {
                    opacity: 0,
                  }
            }
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.5,
              delay: shouldReduceMotion ? 0 : 0.7,
            }}
            className="
              mt-5
              flex
              items-center
              justify-center
              gap-3
              font-mono
              text-[8px]
              uppercase
              tracking-[0.22em]
              text-white/15
            "
          >
            <span className="h-px w-8 bg-white/10" />

            <span>
              ORBITGUARD AI / AUTHENTICATION
            </span>

            <span className="h-px w-8 bg-white/10" />
          </motion.div>

        </motion.div>
      </section>
    </main>
  )
}


/* ==================================================================
   ANIMATED FIELD
   ================================================================== */

function AnimatedField({
  label,
  name,
  type,
  placeholder,
  value,
  error,
  icon: Icon,
  onChange,
  autoComplete,
}) {
  const [active, setActive] = useState(false)

  return (
    <div>
      {/* LABEL */}

      <label
        htmlFor={name}
        className="
          mb-2
          block
          px-1
          text-[9px]
          font-medium
          uppercase
          tracking-[0.18em]
          text-white/40
        "
      >
        {label}
      </label>

      {/* =========================================================
          FIELD CONTAINER
          ========================================================= */}

      <div
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        className="
          relative
          rounded-2xl
          p-[1px]
        "
      >

        {/* =======================================================
            MOVING BORDER
            ======================================================= */}

        <motion.div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            overflow-hidden
            rounded-2xl
          "
          animate={{
            opacity: active ? 1 : 0,
          }}
          transition={{
            duration: 0.2,
          }}
        >
          <motion.div
            className="
              absolute
              -inset-[100%]
              bg-[conic-gradient(from_0deg,transparent_0deg,transparent_315deg,rgba(34,211,238,0.12)_330deg,rgba(34,211,238,1)_345deg,rgba(59,130,246,1)_360deg)]
            "
            animate={
              active
                ? {
                    rotate: 360,
                  }
                : {
                    rotate: 0,
                  }
            }
            transition={
              active
                ? {
                    duration: 2.2,
                    repeat: Infinity,
                    ease: 'linear',
                  }
                : {
                    duration: 0.2,
                  }
            }
          />
        </motion.div>

        {/* =======================================================
            DARK INPUT SURFACE
            ======================================================= */}

        <div
          className={`
            group
            relative
            flex
            items-center
            rounded-[15px]
            border
            bg-[#070c18]

            shadow-[inset_5px_5px_12px_rgba(0,0,0,0.45),inset_-5px_-5px_12px_rgba(255,255,255,0.018)]

            transition-all
            duration-300

            ${
              error
                ? 'border-red-400/35'
                : 'border-white/[0.045]'
            }
          `}
        >

          {/* ICON */}

          <Icon
            size={16}
            className="
              ml-4
              shrink-0
              text-white/25
              transition-colors
              duration-300
              group-focus-within:text-cyan-300/70
            "
          />

          {/* INPUT */}

          <input
            id={name}
            name={name}
            type={type}
            value={value}
            placeholder={placeholder}
            autoComplete={autoComplete}
            onChange={onChange}
            onFocus={() => setActive(true)}
            onBlur={() => setActive(false)}
            className="
              h-14
              w-full
              bg-transparent
              px-3
              text-sm
              text-white
              outline-none
              placeholder:text-white/20
            "
          />

        </div>
      </div>

      {/* ERROR */}

      {error && (
        <motion.p
          initial={{
            opacity: 0,
            y: -3,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            mt-1.5
            px-1
            text-[10px]
            text-red-300/75
          "
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}


/* ==================================================================
   PASSWORD FIELD
   ================================================================== */

function PasswordField({
  label,
  name,
  placeholder,
  value,
  error,
  visible,
  setVisible,
  onChange,
  autoComplete,
}) {
  const [active, setActive] = useState(false)

  return (
    <div>
      {/* LABEL */}

      <label
        htmlFor={name}
        className="
          mb-2
          block
          px-1
          text-[9px]
          font-medium
          uppercase
          tracking-[0.18em]
          text-white/40
        "
      >
        {label}
      </label>

      {/* =========================================================
          FIELD CONTAINER
          ========================================================= */}

      <div
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        className="
          relative
          rounded-2xl
          p-[1px]
        "
      >

        {/* =======================================================
            MOVING BORDER
            ======================================================= */}

        <motion.div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            overflow-hidden
            rounded-2xl
          "
          animate={{
            opacity: active ? 1 : 0,
          }}
          transition={{
            duration: 0.2,
          }}
        >
          <motion.div
            className="
              absolute
              -inset-[100%]
              bg-[conic-gradient(from_0deg,transparent_0deg,transparent_315deg,rgba(34,211,238,0.12)_330deg,rgba(34,211,238,1)_345deg,rgba(59,130,246,1)_360deg)]
            "
            animate={
              active
                ? {
                    rotate: 360,
                  }
                : {
                    rotate: 0,
                  }
            }
            transition={
              active
                ? {
                    duration: 2.2,
                    repeat: Infinity,
                    ease: 'linear',
                  }
                : {
                    duration: 0.2,
                  }
            }
          />
        </motion.div>

        {/* =======================================================
            DARK PASSWORD SURFACE
            ======================================================= */}

        <div
          className={`
            group
            relative
            flex
            items-center
            rounded-[15px]
            border
            bg-[#070c18]

            shadow-[inset_5px_5px_12px_rgba(0,0,0,0.45),inset_-5px_-5px_12px_rgba(255,255,255,0.018)]

            transition-all
            duration-300

            ${
              error
                ? 'border-red-400/35'
                : 'border-white/[0.045]'
            }
          `}
        >

          {/* LOCK ICON */}

          <FiLock
            size={16}
            className="
              ml-4
              shrink-0
              text-white/25
              transition-colors
              duration-300
              group-focus-within:text-cyan-300/70
            "
          />

          {/* PASSWORD INPUT */}

          <input
            id={name}
            name={name}
            type={visible ? 'text' : 'password'}
            value={value}
            placeholder={placeholder}
            autoComplete={autoComplete}
            onChange={onChange}
            onFocus={() => setActive(true)}
            onBlur={() => setActive(false)}
            className="
              h-14
              w-full
              bg-transparent
              px-3
              text-sm
              text-white
              outline-none
              placeholder:text-white/20
            "
          />

          {/* =====================================================
              SHOW / HIDE PASSWORD
              ===================================================== */}

          <button
            type="button"
            onClick={() =>
              setVisible((previous) => !previous)
            }
            aria-label={
              visible
                ? `Hide ${label.toLowerCase()}`
                : `Show ${label.toLowerCase()}`
            }
            className="
              mr-3
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              text-white/25
              transition-all
              duration-300
              hover:bg-white/[0.05]
              hover:text-cyan-300/70
            "
          >
            {visible ? (
              <FiEyeOff size={15} />
            ) : (
              <FiEye size={15} />
            )}
          </button>

        </div>
      </div>

      {/* ERROR */}

      {error && (
        <motion.p
          initial={{
            opacity: 0,
            y: -3,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            mt-1.5
            px-1
            text-[10px]
            text-red-300/75
          "
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}


/* ==================================================================
   REGISTER BUTTON
   ================================================================== */

/* ==================================================================
   REGISTER BUTTON
   ================================================================== */

/* ==================================================================
   REGISTER BUTTON
   ================================================================== */

function RegisterButton({
  status,
  shouldReduceMotion,
}) {
  const isLoading = status === 'loading'
  const isSuccess = status === 'success'

  return (
    <motion.button
      type="submit"
      disabled={isLoading || isSuccess}
      whileHover={
        shouldReduceMotion || isLoading || isSuccess
          ? undefined
          : {
              y: -1,
            }
      }
      whileTap={
        shouldReduceMotion || isLoading || isSuccess
          ? undefined
          : {
              scale: 0.985,
            }
      }
      className="
        group
        relative
        mt-6
        h-[58px]
        w-full
        overflow-hidden
        rounded-2xl
        p-[1px]
        disabled:cursor-not-allowed
      "
    >

      {/* =========================================================
          MOVING BORDER
          ========================================================= */}

      {!isSuccess && (
        <motion.span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -inset-[100%]
            rounded-full
            bg-[conic-gradient(from_0deg,transparent_0deg,transparent_315deg,rgba(34,211,238,0.12)_330deg,rgba(34,211,238,1)_345deg,rgba(59,130,246,1)_360deg)]
            opacity-0
            transition-opacity
            duration-300
            group-hover:opacity-100
          "
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  rotate: 360,
                }
          }
          transition={{
            duration: isLoading ? 1.5 : 2.2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* =========================================================
          BUTTON SURFACE
          ========================================================= */}

      <span
        className={`
          absolute
          inset-[1px]
          rounded-[15px]
          transition-all
          duration-500
          ease-[cubic-bezier(0.22,1,0.36,1)]

          ${
            isSuccess
              ? 'bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500'
              : `
                bg-[#0d1527]
                group-hover:bg-gradient-to-r
                group-hover:from-cyan-400
                group-hover:via-cyan-300
                group-hover:to-blue-500
              `
          }
        `}
      />

      {/* =========================================================
          SUBTLE BOTTOM LIGHT
          ========================================================= */}

      {!isSuccess && (
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-0
            left-[15%]
            right-[15%]
            h-5
            rounded-full
            bg-cyan-400/0
            blur-xl
            transition-all
            duration-500
            group-hover:bg-cyan-300/25
          "
        />
      )}

      {/* =========================================================
          BUTTON CONTENT
          ========================================================= */}

      <span
        className={`
          relative
          z-10
          flex
          h-full
          items-center
          justify-center
          gap-3
          text-sm
          font-medium
          transition-colors
          duration-300

          ${
            isSuccess
              ? 'text-[#03101c]'
              : 'text-white group-hover:text-[#03101c]'
          }
        `}
      >

        {/* BUTTON TEXT */}

        <span>
          {isSuccess
            ? 'Account Created'
            : isLoading
              ? 'Creating Account...'
              : 'Create Account'}
        </span>

        {/* =====================================================
            ARROW / LOADING / SUCCESS
            ===================================================== */}

        <span
          className={`
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-full
            transition-all
            duration-300

            ${
              isSuccess
                ? 'bg-[#03101c] text-cyan-300'
                : 'bg-[#050816] text-white/75 group-hover:bg-[#03101c] group-hover:text-cyan-300'
            }
          `}
        >

          {/* SUCCESS */}

          {isSuccess ? (
            <motion.span
              initial={{
                scale: 0,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                duration: 0.3,
                ease: EASE,
              }}
              className="
                text-sm
                font-semibold
              "
            >
              ✓
            </motion.span>

          ) : isLoading ? (

            /* LOADING */

            <motion.span
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      rotate: 360,
                    }
              }
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="
                h-3
                w-3
                rounded-full
                border
                border-white/30
                border-t-cyan-300
              "
            />

          ) : (

            /* DEFAULT ARROW */

            <FiArrowRight
              size={13}
              className="
                transition-transform
                duration-300
                group-hover:translate-x-0.5
              "
            />
          )}

        </span>
      </span>
    </motion.button>
  )
}

export default Register