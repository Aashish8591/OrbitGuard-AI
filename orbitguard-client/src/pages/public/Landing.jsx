
import { useEffect } from 'react'

import PublicNavbar from '../../components/layout/PublicNavbar'
import SpaceBackground from '../../components/common/SpaceBackground'
import Hero from '../../features/landing/components/Hero'
import PlatformIntro from '../../features/landing/components/PlatformIntro'
import Capabilities from '../../features/landing/components/Capabilities'
import Technology from '../../features/landing/components/Technology'
import About from '../../features/landing/components/About'
import PublicFooter from '../../features/landing/components/PublicFooter'

function Landing() {
  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
      ?.replace(/\/+$/, '')

    if (!apiBaseUrl) {
      console.warn(
        'Backend warm-up skipped: VITE_API_BASE_URL is not configured.'
      )
      return
    }

    // Wake the backend in the background.
    // Do not block the landing page while the service starts.
    fetch(`${apiBaseUrl}/api/health`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Health check failed with HTTP ${response.status}`
          )
        }

        return response.json()
      })
      .then((data) => {
        if (data?.status !== 'UP') {
          throw new Error('Backend health check returned an unexpected status.')
        }

        console.info('OrbitGuard backend is responding.')
      })
      .catch((error) => {
        // A sleeping or unavailable backend must not break the landing page.
        console.debug(
          'Backend is not ready yet or the health request failed.',
          error
        )
      })
  }, [])

  return (
    <SpaceBackground>
      <PublicNavbar />

      <main className="landing-page">
        <Hero />
        <PlatformIntro />
        <Capabilities />
        <Technology />
        <About />
        <PublicFooter />
      </main>
    </SpaceBackground>
  )
}

export default Landing
