import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const AUTH_STORAGE_KEY = 'orbitguard_auth'

const AuthContext = createContext(null)

/* ================================================================
   READ STORED AUTH DATA
   ================================================================ */

function readStoredAuth() {
  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)

    if (!storedAuth) {
      return null
    }

    const parsedAuth = JSON.parse(storedAuth)

    /*
     * A valid OrbitGuard auth object must contain a JWT.
     */
    if (!parsedAuth?.token) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }

    return {
      token: parsedAuth.token,
      tokenType: parsedAuth.tokenType || 'Bearer',
    }
  } catch (error) {
    console.error('Failed to restore authentication:', error)

    localStorage.removeItem(AUTH_STORAGE_KEY)

    return null
  }
}

/* ================================================================
   AUTH PROVIDER
   ================================================================ */

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => readStoredAuth())
  const [isInitializing, setIsInitializing] = useState(true)

  /* ==============================================================
     INITIALIZE AUTHENTICATION
     ============================================================== */

  useEffect(() => {
    /*
     * The initial state is already restored synchronously.
     *
     * This effect gives the application a clear initialization
     * lifecycle so ProtectedRoute can later wait before deciding
     * whether the user should be redirected.
     */

    setIsInitializing(false)
  }, [])

  /* ==============================================================
     LOGIN
     ============================================================== */

  const login = useCallback((authResponse) => {
    /*
     * Expected backend data:
     *
     * {
     *   token: "...",
     *   tokenType: "Bearer"
     * }
     */

    if (!authResponse?.token) {
      throw new Error(
        'Authentication token was not provided by the server.',
      )
    }

    const nextAuth = {
      token: authResponse.token,
      tokenType: authResponse.tokenType || 'Bearer',
    }

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify(nextAuth),
    )

    setAuth(nextAuth)

    return nextAuth
  }, [])

  /* ==============================================================
     LOGOUT
     ============================================================== */

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)

    setAuth(null)
  }, [])

  /* ==============================================================
     AUTHENTICATION STATE
     ============================================================== */

  const isAuthenticated = Boolean(auth?.token)

  /* ==============================================================
     CONTEXT VALUE
     ============================================================== */

  const value = useMemo(
    () => ({
      token: auth?.token || null,
      tokenType: auth?.tokenType || 'Bearer',

      isAuthenticated,
      isInitializing,

      login,
      logout,
    }),
    [
      auth,
      isAuthenticated,
      isInitializing,
      login,
      logout,
    ],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/* ================================================================
   USE AUTH
   ================================================================ */

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider.',
    )
  }

  return context
}