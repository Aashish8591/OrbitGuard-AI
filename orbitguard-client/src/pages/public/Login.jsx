import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiArrowLeft,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
} from "react-icons/fi";

const EASE = [0.22, 1, 0.36, 1];

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");

  /* ================================================================
     FORM CHANGE
     ================================================================ */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      submit: "",
    }));
  };

  /* ================================================================
     FORM VALIDATION
     ================================================================ */

  const validateForm = () => {
    const nextErrors = {};

    const email = formData.email.trim();
    const password = formData.password;

    if (!email) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  /* ================================================================
     LOGIN / BACKEND CONNECTION
     ================================================================ */

  const handleSubmit = async (event) => {
    event.preventDefault();

    /*
     * Prevent duplicate API requests while login
     * is already being processed.
     */
    if (status !== "idle") {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setStatus("loading");

    try {
      /* ------------------------------------------------------------
         API BASE URL
         ------------------------------------------------------------ */

      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

      if (!baseUrl) {
        throw new Error(
          "API configuration is missing. Please configure VITE_API_BASE_URL.",
        );
      }

      /* ------------------------------------------------------------
         REQUEST PAYLOAD

         This matches the backend LoginRequest exactly:
         {
           email,
           password
         }
         ------------------------------------------------------------ */

      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      /* ------------------------------------------------------------
         LOGIN REQUEST
         ------------------------------------------------------------ */

      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      /* ------------------------------------------------------------
         READ BACKEND RESPONSE

         Success:
         {
           success: true,
           message: "Login successful.",
           data: {
             token: "...",
             tokenType: "Bearer"
           }
         }

         Error:
         {
           success: false,
           message: "Invalid email or password.",
           status: 401,
           timestamp: "..."
         }
         ------------------------------------------------------------ */

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      /* ------------------------------------------------------------
         BACKEND ERROR
         ------------------------------------------------------------ */

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to sign in. Please try again.",
        );
      }

      /* ------------------------------------------------------------
         VALIDATE SUCCESS RESPONSE
         ------------------------------------------------------------ */

      if (data?.success !== true || !data?.data?.token) {
        throw new Error(
          data?.message || "Login response is invalid. Please try again.",
        );
      }

      /* ------------------------------------------------------------
         STORE AUTHENTICATION DATA

         We store only:
         - JWT token
         - token type

         Password is NEVER stored.
         ------------------------------------------------------------ */

      login({
        token: data.data.token,
        tokenType: data.data.tokenType || "Bearer",
      });

      /* ------------------------------------------------------------
         LOGIN SUCCESS
         ------------------------------------------------------------ */

      setStatus("success");

      /*
       * Current authenticated destination.
       *
       * /satellites already exists in your current AppRoutes.
       * Later, once Dashboard is implemented, this can become:
       *
       * navigate('/dashboard', { replace: true })
       */
      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Login failed:", error);

      setStatus("idle");

      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Unable to sign in. Please try again.",
      });
    }
  };

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#050816] text-white">
      {/* =========================================================
          BACKGROUND
          ========================================================= */}

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
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
            bg-[#050816]/85
          "
        />

        {/* Cyan atmosphere */}

        <div
          className="
            absolute
            left-[-12%]
            top-[15%]
            h-[420px]
            w-[420px]
            rounded-full
            bg-cyan-400/[0.055]
            blur-[120px]
          "
        />

        {/* Blue atmosphere */}

        <div
          className="
            absolute
            bottom-[-15%]
            right-[-10%]
            h-[450px]
            w-[450px]
            rounded-full
            bg-blue-500/[0.055]
            blur-[130px]
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
          TOP NAVIGATION
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
          LOGIN CONTENT
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
          initial={{
            opacity: 0,
            y: 24,
            scale: 0.985,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.7,
            ease: EASE,
          }}
          className="w-full max-w-[1040px]"
        >
          {/* =====================================================
              OUTER CARD
              ===================================================== */}

          <div
            className="
              relative
              overflow-hidden
              rounded-[30px]
              border
              border-cyan-300/[0.10]
              bg-[#0a1020]/90
              p-2.5
              shadow-[18px_18px_45px_rgba(0,0,0,0.55),-12px_-12px_35px_rgba(255,255,255,0.025)]
            "
          >
            {/* Diamond accents */}

            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-[-32px]
                top-[-32px]
                h-24
                w-24
                rotate-45
                border
                border-cyan-300/[0.12]
              "
            />

            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                bottom-[-32px]
                right-[-32px]
                h-24
                w-24
                rotate-45
                border
                border-blue-400/[0.12]
              "
            />

            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-5
                top-5
                h-2
                w-2
                rotate-45
                border
                border-cyan-300/40
              "
            />

            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                bottom-5
                right-5
                h-2
                w-2
                rotate-45
                border
                border-blue-400/40
              "
            />

            {/* ===================================================
                INNER CARD
                =================================================== */}

            <div
              className="
                relative
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
                  initial={{
                    opacity: 0,
                    x: -18,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    duration: 0.65,
                    delay: 0.1,
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
                  {/* Orbital ring */}

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

                  {/* OrbitGuard mark */}

                  <div
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
                        className="h-9 w-9 object-contain"
                      />
                    </div>
                  </div>

                  {/* Heading */}

                  <div
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
                      Welcome
                      <span className="text-cyan-300/90"> Back</span>
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
                      Continue your journey with OrbitGuard AI and access your
                      space intelligence dashboard.
                    </p>
                  </div>

                  {/* Security status */}

                  <div
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
                      Secure authentication
                    </span>
                  </div>
                </motion.div>

                {/* =================================================
                    RIGHT PANEL
                    ================================================= */}

                <motion.div
                  initial={{
                    opacity: 0,
                    x: 18,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    duration: 0.65,
                    delay: 0.18,
                    ease: EASE,
                  }}
                  className="
                    px-6
                    py-8
                    sm:px-10
                    sm:py-10
                    lg:px-10
                    lg:py-12
                    xl:px-12
                  "
                >
                  {/* Form header */}

                  <div className="mb-7">
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

                    <div className="mt-2 h-px w-full bg-white/[0.06]" />
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-5"
                  >
                    {/* =================================================
                        EMAIL
                        ================================================= */}

                    <FormField
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

                    {/* =================================================
                        PASSWORD
                        ================================================= */}

                    <PasswordField
                      label="Password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      error={errors.password}
                      visible={showPassword}
                      setVisible={setShowPassword}
                      onChange={handleChange}
                      autoComplete="current-password"
                    />

                    {/* Backend / submit error */}

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
                          px-1
                          text-[10px]
                          leading-4
                          text-red-300/80
                        "
                      >
                        {errors.submit}
                      </motion.p>
                    )}

                    {/* Login button */}

                    <LoginButton status={status} />
                  </form>

                  {/* Register */}

                  <div
                    className="
                      mt-7
                      flex
                      items-center
                      justify-center
                      gap-2
                      text-xs
                      text-white/30
                    "
                  >
                    <span>Don't have an account?</span>

                    <Link
                      to="/register"
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
                      Create account
                      <FiArrowRight
                        size={11}
                        className="
                          transition-transform
                          duration-300
                          group-hover:translate-x-0.5
                        "
                      />
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* =====================================================
              SYSTEM LABEL
              ===================================================== */}

          <div
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

            <span>ORBITGUARD AI / AUTHENTICATION</span>

            <span className="h-px w-8 bg-white/10" />
          </div>
        </motion.div>
      </section>
    </main>
  );
}

/* =================================================================
   LOGIN BUTTON
   ================================================================= */

function LoginButton({ status }) {
  const isLoading = status === "loading";

  return (
    <motion.button
      type="submit"
      disabled={isLoading}
      whileHover={isLoading ? undefined : { y: -1 }}
      whileTap={isLoading ? undefined : { scale: 0.985 }}
      className="
        group
        relative
        mt-2
        h-[58px]
        w-full
        overflow-hidden
        rounded-2xl
        p-[1px]
        disabled:cursor-not-allowed
      "
    >
      {/* Moving border */}

      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -inset-[400%]
          rounded-full
          bg-[conic-gradient(from_0deg,transparent_0deg,transparent_320deg,rgba(34,211,238,1)_345deg,rgba(59,130,246,1)_360deg)]
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
          group-hover:animate-[spin_2s_linear_infinite]
        "
      />

      {/* Button surface */}

      <span
        className="
          absolute
          inset-[1px]
          rounded-[15px]
          bg-[#0d1527]
          transition-all
          duration-500
          ease-[cubic-bezier(0.22,1,0.36,1)]
          group-hover:bg-gradient-to-r
          group-hover:from-cyan-400
          group-hover:via-cyan-300
          group-hover:to-blue-500
        "
      />

      {/* Button content */}

      <span
        className="
          relative
          z-10
          flex
          h-full
          items-center
          justify-center
          gap-3
          text-sm
          font-medium
          text-white
          transition-colors
          duration-300
          group-hover:text-[#03101c]
        "
      >
        <span>{isLoading ? "Logging in..." : "Login"}</span>

        <span
          className="
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-full
            bg-[#050816]
            text-white/75
            transition-all
            duration-300
            group-hover:bg-[#03101c]
            group-hover:text-cyan-300
          "
        >
          {isLoading ? (
            <span
              className="
                h-3
                w-3
                animate-spin
                rounded-full
                border
                border-white/30
                border-t-cyan-300
              "
            />
          ) : (
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
  );
}

/* =================================================================
   FORM FIELD
   ================================================================= */

function FormField({
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
  const [active, setActive] = useState(false);

  return (
    <div>
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

      <div
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        className="relative"
      >
        {/* Moving border */}

        <motion.div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -inset-[1px]
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
              -inset-[400%]
              bg-[conic-gradient(from_0deg,transparent_0deg,transparent_315deg,rgba(34,211,238,0.12)_330deg,rgba(34,211,238,1)_345deg,rgba(59,130,246,1)_360deg)]
            "
            animate={active ? { rotate: 360 } : { rotate: 0 }}
            transition={
              active
                ? {
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "linear",
                  }
                : {
                    duration: 0.2,
                  }
            }
          />
        </motion.div>

        {/* Input surface */}

        <div
          className={`
            group
            relative
            flex
            items-center
            rounded-2xl
            border
            bg-[#070c18]
            shadow-[inset_5px_5px_12px_rgba(0,0,0,0.45),inset_-5px_-5px_12px_rgba(255,255,255,0.018)]
            ${error ? "border-red-400/35" : "border-transparent"}
          `}
        >
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
              auth-input
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
  );
}

/* =================================================================
   PASSWORD FIELD
   ================================================================= */

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
  const [active, setActive] = useState(false);

  return (
    <div>
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

      <div
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        className="relative"
      >
        {/* Moving border */}

        <motion.div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -inset-[1px]
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
              -inset-[400%]
              bg-[conic-gradient(from_0deg,transparent_0deg,transparent_315deg,rgba(34,211,238,0.12)_330deg,rgba(34,211,238,1)_345deg,rgba(59,130,246,1)_360deg)]
            "
            animate={active ? { rotate: 360 } : { rotate: 0 }}
            transition={
              active
                ? {
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "linear",
                  }
                : {
                    duration: 0.2,
                  }
            }
          />
        </motion.div>

        {/* Password surface */}

        <div
          className={`
            group
            relative
            flex
            items-center
            rounded-2xl
            border
            bg-[#070c18]
            shadow-[inset_5px_5px_12px_rgba(0,0,0,0.45),inset_-5px_-5px_12px_rgba(255,255,255,0.018)]
            ${error ? "border-red-400/35" : "border-transparent"}
          `}
        >
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

          <input
            id={name}
            name={name}
            type={visible ? "text" : "password"}
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

          <button
            type="button"
            onClick={() => setVisible((previous) => !previous)}
            aria-label={visible ? "Hide password" : "Show password"}
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
            {visible ? <FiEyeOff size={15} /> : <FiEye size={15} />}
          </button>
        </div>
      </div>

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
  );
}

export default Login;
