import PublicNavbar from '../../components/layout/PublicNavbar'
import SpaceBackground from '../../components/common/SpaceBackground'
import Hero from '../../features/landing/components/Hero'
import PlatformIntro from '../../features/landing/components/PlatformIntro'
import Capabilities from '../../features/landing/components/Capabilities'
import Technology from '../../features/landing/components/Technology'
import About from '../../features/landing/components/About'
import PublicFooter from '../../features/landing/components/PublicFooter'

function Landing() {
  return (
    <SpaceBackground>
      <PublicNavbar />

      <main>
        <Hero />
        <PlatformIntro/>
        <Capabilities/>
        <Technology/>
        <About/>
        <PublicFooter/>
      </main>
    </SpaceBackground>
  )
}

export default Landing