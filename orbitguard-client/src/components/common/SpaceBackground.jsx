import { motion } from 'framer-motion'

/*
 * ============================================================
 * STAR FIELD
 *
 * Three depth layers:
 *
 * FAR    -> tiny + slow
 * MID    -> slightly larger + faster
 * NEAR   -> brighter + noticeably faster
 *
 * The different movement speeds create a subtle depth/parallax
 * effect so the background feels like moving through space.
 * ============================================================
 */

const stars = [
  // ==========================================================
  // FAR FIELD
  // ==========================================================

  { id: 'far-01', left: '2%', top: '8%', size: 1, duration: 18, delay: 0, opacity: 0.42 },
  { id: 'far-02', left: '5%', top: '26%', size: 1, duration: 21, delay: 2, opacity: 0.34 },
  { id: 'far-03', left: '8%', top: '48%', size: 1.2, duration: 19, delay: 4, opacity: 0.38 },
  { id: 'far-04', left: '11%', top: '74%', size: 1, duration: 23, delay: 1, opacity: 0.3 },
  { id: 'far-05', left: '15%', top: '15%', size: 1, duration: 20, delay: 5, opacity: 0.4 },
  { id: 'far-06', left: '18%', top: '39%', size: 1, duration: 22, delay: 3, opacity: 0.32 },
  { id: 'far-07', left: '21%', top: '67%', size: 1.2, duration: 19, delay: 6, opacity: 0.36 },
  { id: 'far-08', left: '24%', top: '91%', size: 1, duration: 24, delay: 2, opacity: 0.28 },
  { id: 'far-09', left: '28%', top: '10%', size: 1, duration: 21, delay: 7, opacity: 0.4 },
  { id: 'far-10', left: '31%', top: '32%', size: 1.1, duration: 20, delay: 4, opacity: 0.34 },
  { id: 'far-11', left: '34%', top: '58%', size: 1, duration: 23, delay: 1, opacity: 0.3 },
  { id: 'far-12', left: '37%', top: '83%', size: 1.2, duration: 19, delay: 5, opacity: 0.36 },
  { id: 'far-13', left: '41%', top: '18%', size: 1, duration: 22, delay: 3, opacity: 0.32 },
  { id: 'far-14', left: '44%', top: '43%', size: 1, duration: 24, delay: 6, opacity: 0.3 },
  { id: 'far-15', left: '47%', top: '72%', size: 1.1, duration: 20, delay: 2, opacity: 0.38 },
  { id: 'far-16', left: '50%', top: '6%', size: 1, duration: 21, delay: 8, opacity: 0.34 },
  { id: 'far-17', left: '53%', top: '28%', size: 1.2, duration: 23, delay: 4, opacity: 0.36 },
  { id: 'far-18', left: '56%', top: '52%', size: 1, duration: 19, delay: 1, opacity: 0.3 },
  { id: 'far-19', left: '59%', top: '87%', size: 1, duration: 22, delay: 7, opacity: 0.34 },
  { id: 'far-20', left: '62%', top: '14%', size: 1, duration: 24, delay: 3, opacity: 0.32 },
  { id: 'far-21', left: '65%', top: '39%', size: 1.1, duration: 20, delay: 5, opacity: 0.36 },
  { id: 'far-22', left: '68%', top: '68%', size: 1, duration: 23, delay: 2, opacity: 0.3 },
  { id: 'far-23', left: '71%', top: '94%', size: 1.2, duration: 21, delay: 6, opacity: 0.34 },
  { id: 'far-24', left: '74%', top: '22%', size: 1, duration: 19, delay: 4, opacity: 0.38 },
  { id: 'far-25', left: '77%', top: '51%', size: 1, duration: 24, delay: 1, opacity: 0.3 },
  { id: 'far-26', left: '80%', top: '78%', size: 1.1, duration: 22, delay: 7, opacity: 0.36 },
  { id: 'far-27', left: '84%', top: '9%', size: 1, duration: 20, delay: 3, opacity: 0.34 },
  { id: 'far-28', left: '87%', top: '34%', size: 1.2, duration: 23, delay: 5, opacity: 0.4 },
  { id: 'far-29', left: '90%', top: '62%', size: 1, duration: 21, delay: 2, opacity: 0.32 },
  { id: 'far-30', left: '94%', top: '87%', size: 1, duration: 24, delay: 6, opacity: 0.36 },
  { id: 'far-31', left: '97%', top: '19%', size: 1.1, duration: 19, delay: 4, opacity: 0.34 },

  // ==========================================================
  // MID FIELD
  // ==========================================================

  { id: 'mid-01', left: '4%', top: '58%', size: 1.7, duration: 12, delay: 1, opacity: 0.62 },
  { id: 'mid-02', left: '9%', top: '17%', size: 1.5, duration: 14, delay: 4, opacity: 0.55 },
  { id: 'mid-03', left: '14%', top: '88%', size: 2, duration: 11, delay: 2, opacity: 0.58 },
  { id: 'mid-04', left: '19%', top: '48%', size: 1.6, duration: 13, delay: 5, opacity: 0.5 },
  { id: 'mid-05', left: '24%', top: '24%', size: 1.8, duration: 10, delay: 3, opacity: 0.6 },
  { id: 'mid-06', left: '29%', top: '73%', size: 1.5, duration: 14, delay: 6, opacity: 0.52 },
  { id: 'mid-07', left: '34%', top: '41%', size: 2, duration: 12, delay: 1, opacity: 0.58 },
  { id: 'mid-08', left: '39%', top: '8%', size: 1.6, duration: 11, delay: 4, opacity: 0.54 },
  { id: 'mid-09', left: '44%', top: '64%', size: 1.8, duration: 13, delay: 2, opacity: 0.6 },
  { id: 'mid-10', left: '49%', top: '36%', size: 1.5, duration: 10, delay: 7, opacity: 0.52 },
  { id: 'mid-11', left: '54%', top: '81%', size: 2, duration: 12, delay: 3, opacity: 0.58 },
  { id: 'mid-12', left: '59%', top: '21%', size: 1.7, duration: 14, delay: 5, opacity: 0.55 },
  { id: 'mid-13', left: '64%', top: '55%', size: 1.5, duration: 11, delay: 1, opacity: 0.62 },
  { id: 'mid-14', left: '69%', top: '76%', size: 1.9, duration: 13, delay: 6, opacity: 0.54 },
  { id: 'mid-15', left: '74%', top: '43%', size: 1.6, duration: 10, delay: 2, opacity: 0.6 },
  { id: 'mid-16', left: '79%', top: '14%', size: 2, duration: 12, delay: 4, opacity: 0.56 },
  { id: 'mid-17', left: '84%', top: '66%', size: 1.5, duration: 14, delay: 7, opacity: 0.58 },
  { id: 'mid-18', left: '89%', top: '31%', size: 1.8, duration: 11, delay: 3, opacity: 0.62 },
  { id: 'mid-19', left: '94%', top: '53%', size: 1.6, duration: 13, delay: 5, opacity: 0.54 },
  { id: 'mid-20', left: '98%', top: '82%', size: 2, duration: 10, delay: 1, opacity: 0.58 },

  // ==========================================================
  // NEAR FIELD
  //
  // These are intentionally still small.
  // They create depth rather than looking like planets.
  // ==========================================================

  { id: 'near-01', left: '7%', top: '6%', size: 2.4, duration: 7, delay: 0, opacity: 0.78 },
  { id: 'near-02', left: '17%', top: '57%', size: 2.2, duration: 6, delay: 2, opacity: 0.72 },
  { id: 'near-03', left: '27%', top: '15%', size: 2.8, duration: 8, delay: 4, opacity: 0.76 },
  { id: 'near-04', left: '36%', top: '91%', size: 2.3, duration: 5.5, delay: 1, opacity: 0.7 },
  { id: 'near-05', left: '46%', top: '9%', size: 2.6, duration: 7, delay: 3, opacity: 0.8 },
  { id: 'near-06', left: '55%', top: '61%', size: 2.4, duration: 6, delay: 0.5, opacity: 0.74 },
  { id: 'near-07', left: '66%', top: '18%', size: 2.8, duration: 8, delay: 2.5, opacity: 0.76 },
  { id: 'near-08', left: '76%', top: '89%', size: 2.3, duration: 5.5, delay: 1.5, opacity: 0.72 },
  { id: 'near-09', left: '86%', top: '47%', size: 2.7, duration: 7, delay: 3.5, opacity: 0.8 },
  { id: 'near-10', left: '95%', top: '11%', size: 2.2, duration: 6, delay: 2, opacity: 0.74 },

  // ==========================================================
  // DISTANT BRIGHT STARS
  //
  // Very few large stars to reproduce the natural visual
  // variation from the reference image.
  // ==========================================================

  { id: 'bright-01', left: '12%', top: '22%', size: 3.2, duration: 9, delay: 1, opacity: 0.82 },
  { id: 'bright-02', left: '33%', top: '36%', size: 3.5, duration: 11, delay: 4, opacity: 0.78 },
  { id: 'bright-03', left: '58%', top: '14%', size: 3.8, duration: 10, delay: 2, opacity: 0.86 },
  { id: 'bright-04', left: '72%', top: '58%', size: 3.3, duration: 12, delay: 5, opacity: 0.8 },
  { id: 'bright-05', left: '91%', top: '27%', size: 3.6, duration: 9, delay: 3, opacity: 0.84 },
]

function SpaceBackground({ children }) {
  return (
    <div className="relative min-h-screen bg-[#050816]">
      {/* =========================================================
          GLOBAL SPACE ENVIRONMENT
      ========================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {/* =====================================================
            DEEP SPACE ATMOSPHERE
        ====================================================== */}

        <div className="absolute left-[50%] top-[25%] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[#172554]/20 blur-[170px]" />

        <div className="absolute right-[5%] top-[42%] h-[480px] w-[480px] rounded-full bg-cyan-500/[0.035] blur-[150px]" />

        <div className="absolute bottom-[-15%] left-[10%] h-[500px] w-[500px] rounded-full bg-blue-900/[0.08] blur-[160px]" />

        {/* =====================================================
            STAR FIELD
        ====================================================== */}

        {stars.map((star) => (
          <motion.span
            key={star.id}
            aria-hidden="true"
            className="absolute rounded-full bg-white"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              boxShadow:
                star.size >= 3
                  ? '0 0 8px rgba(255,255,255,0.55)'
                  : 'none',
            }}
            animate={{
              /*
               * Small horizontal movement creates the feeling
               * that the viewer is moving through the star field.
               */
              x: [0, 5, -3, 0],

              /*
               * Vertical movement is slightly stronger than
               * horizontal movement.
               */
              y: [0, -12, 6, 0],

              /*
               * Very subtle scaling gives near stars more depth.
               */
              scale:
                star.size >= 2.2
                  ? [1, 1.12, 0.94, 1]
                  : [1, 1.05, 0.97, 1],

              /*
               * Natural star twinkle.
               */
              opacity: [
                star.opacity * 0.55,
                star.opacity,
                star.opacity * 0.72,
                star.opacity * 0.55,
              ],
            }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* =========================================================
          LANDING CONTENT
      ========================================================== */}

      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export default SpaceBackground