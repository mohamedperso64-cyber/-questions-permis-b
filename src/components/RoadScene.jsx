import { useEffect, useRef } from 'react'
import './RoadScene.css'

/**
 * Scène de route avec voiture rouge + feu tricolore.
 *
 * Animation pilotée par requestAnimationFrame avec un vrai compteur qui
 * s'écoule pendant le jaune. À chaque frame, la position de la voiture
 * est calculée à partir de la physique (décélération constante).
 *
 * Cycle (16 s total) :
 *   0     → 2,4 s  : VERT — croisière (vitesse constante)
 *   2,4   → 5,4 s  : JAUNE — décélération continue, compteur 3.0 → 0.0
 *   5,4   → 9,4 s  : ROUGE — arrêt complet, compteur 4.0 → 0.0
 *   9,4   → 16 s   : VERT — redémarrage progressif et sortie
 */

// === Timing du cycle ===
const T_GREEN_CRUISE_END = 2.4   // s
const T_YELLOW_END       = 5.4   // s
const T_RED_END          = 9.4   // s
const T_CYCLE            = 16.0  // s

const YELLOW_DURATION = T_YELLOW_END - T_GREEN_CRUISE_END  // 3 s
const RED_DURATION    = T_RED_END    - T_YELLOW_END         // 4 s
const ACCEL_DURATION  = T_CYCLE      - T_RED_END            // 6.6 s

// === Positions clés (vw) — toutes dérivées de la vitesse de croisière ===
const X_YELLOW_BEG_VW = 50    // position au moment où le feu passe au jaune
const X_STOP_VW       = 15    // position d'arrêt (en vw)
const X_STOP_PX       = 70    // offset px pour caler la voiture pile à côté du feu

// Vitesse de croisière : déduite de la physique (décélération constante
// pendant YELLOW_DURATION pour s'arrêter pile à X_STOP_VW).
//   distance = 0.5 × V × t  ⇒  V = 2 × distance / t
const YELLOW_DISTANCE_VW = X_YELLOW_BEG_VW - X_STOP_VW  // 35 vw
const V_CRUISE = (2 * YELLOW_DISTANCE_VW) / YELLOW_DURATION  // ≈ 23.33 vw/s

// X_START dérivé : la voiture doit pouvoir parcourir V_CRUISE × T_GREEN
// pendant la phase verte pour arriver pile à X_YELLOW_BEG_VW.
const X_START_VW = X_YELLOW_BEG_VW + V_CRUISE * T_GREEN_CRUISE_END  // ≈ 106 vw

// X_EXIT dérivé : la voiture doit accélérer (cubique) pour finir à V_CRUISE.
// Pour position p(t) = delta × t³, vitesse finale = 3 × delta / T = V_CRUISE
const X_EXIT_VW = X_STOP_VW - (V_CRUISE * ACCEL_DURATION / 3)  // ≈ -36.33 vw

export default function RoadScene({ onUpdate }) {
  const carRef        = useRef(null)
  const laneRef       = useRef(null)
  const bulbRedRef    = useRef(null)
  const bulbYellowRef = useRef(null)
  const bulbGreenRef  = useRef(null)

  useEffect(() => {
    let startTime = null
    let lastFrameTime = null
    let rafId = null
    let lastPhase = null
    let accumulatedDistanceVw = 0  // distance totale parcourue (persiste entre cycles)

    function tick(now) {
      if (startTime === null) startTime = now
      if (lastFrameTime === null) lastFrameTime = now
      const dt = (now - lastFrameTime) / 1000  // s
      lastFrameTime = now

      const elapsed = ((now - startTime) / 1000) % T_CYCLE

      let carXvw = 0
      let carXpx = 0
      let phase = ''
      let velocityVwPerS = 0  // vitesse instantanée en vw/s (positive = vers la gauche)

      if (elapsed < T_GREEN_CRUISE_END) {
        // === VERT — croisière (vitesse constante) ===
        phase = 'green'
        const progress = elapsed / T_GREEN_CRUISE_END
        carXvw = X_START_VW + (X_YELLOW_BEG_VW - X_START_VW) * progress
        carXpx = 0
        velocityVwPerS = (X_START_VW - X_YELLOW_BEG_VW) / T_GREEN_CRUISE_END  // ≈ 20.83
      }
      else if (elapsed < T_YELLOW_END) {
        // === JAUNE — décélération constante ===
        const t = elapsed - T_GREEN_CRUISE_END
        phase = 'yellow'
        const tn = t / YELLOW_DURATION
        // Position : p(tn) = 2*tn - tn²
        const posProgress = 2 * tn - tn * tn
        carXvw = X_YELLOW_BEG_VW + (X_STOP_VW - X_YELLOW_BEG_VW) * posProgress
        carXpx = X_STOP_PX * posProgress
        // Vitesse : v(tn) = V0 × (1 - tn)
        // V0 = (X_YELLOW_BEG_VW - X_STOP_VW) × 2 / YELLOW_DURATION  ≈ 23.3 vw/s
        const V0 = (X_YELLOW_BEG_VW - X_STOP_VW) * 2 / YELLOW_DURATION
        velocityVwPerS = V0 * (1 - tn)
      }
      else if (elapsed < T_RED_END) {
        // === ROUGE — arrêt complet ===
        phase = 'red'
        carXvw = X_STOP_VW
        carXpx = X_STOP_PX
        velocityVwPerS = 0
      }
      else {
        // === VERT — redémarrage et sortie ===
        phase = 'green'
        const t = elapsed - T_RED_END
        const progress = t / ACCEL_DURATION
        // Position : ease-in cubique
        const cubic = progress * progress * progress
        carXvw = X_STOP_VW + (X_EXIT_VW - X_STOP_VW) * cubic
        carXpx = X_STOP_PX * (1 - cubic)
        // Vitesse : d/dt(cubic) × distance / T = 3 * progress² × |X_EXIT - X_STOP| / T
        velocityVwPerS = 3 * progress * progress * (X_STOP_VW - X_EXIT_VW) / ACCEL_DURATION
      }

      // Accumule la distance parcourue
      accumulatedDistanceVw += velocityVwPerS * dt

      // Appliquer à la voiture
      if (carRef.current) {
        carRef.current.style.transform =
          `translateX(calc(${carXvw.toFixed(2)}vw + ${carXpx.toFixed(2)}px))`
      }

      // Ampoules + pointillés (toggle uniquement sur changement de phase)
      if (phase !== lastPhase) {
        lastPhase = phase
        if (bulbRedRef.current)    bulbRedRef.current.classList.toggle('on', phase === 'red')
        if (bulbYellowRef.current) bulbYellowRef.current.classList.toggle('on', phase === 'yellow')
        if (bulbGreenRef.current)  bulbGreenRef.current.classList.toggle('on', phase === 'green')
        if (laneRef.current) {
          laneRef.current.style.animationPlayState = (phase === 'red') ? 'paused' : 'running'
        }
      }

      // Notifie le parent (qui met à jour le compteur kilométrique du hero)
      if (onUpdate) {
        onUpdate({
          velocityVwPerS,
          distanceVw: accumulatedDistanceVw,
          phase,
        })
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [onUpdate])

  return (
    <div className="road" aria-hidden="true">
      <div className="road__lane" ref={laneRef} />

      {/* Feu tricolore */}
      <svg className="road__signal" viewBox="0 0 44 124" preserveAspectRatio="xMidYMax meet">
        <rect x="2"  y="9"  width="6" height="14" rx="1.5" fill="#0e1014" />
        <rect x="2"  y="39" width="6" height="14" rx="1.5" fill="#0e1014" />
        <rect x="2"  y="69" width="6" height="14" rx="1.5" fill="#0e1014" />
        <rect x="36" y="9"  width="6" height="14" rx="1.5" fill="#0e1014" />
        <rect x="36" y="39" width="6" height="14" rx="1.5" fill="#0e1014" />
        <rect x="36" y="69" width="6" height="14" rx="1.5" fill="#0e1014" />
        <rect x="7" y="2" width="30" height="89" rx="4" fill="#0e1014" stroke="#333" strokeWidth="0.6" />
        <circle ref={bulbRedRef}    className="signal__bulb signal__bulb--red"    cx="22" cy="16" r="8" />
        <circle ref={bulbYellowRef} className="signal__bulb signal__bulb--yellow" cx="22" cy="46" r="8" />
        <circle ref={bulbGreenRef}  className="signal__bulb signal__bulb--green"  cx="22" cy="76" r="8" />
        <rect x="20" y="91"  width="4"  height="29" fill="#3a3a3a" />
        <rect x="14" y="119" width="16" height="4"  rx="1" fill="#1a1a1a" />
      </svg>

      {/* Voiture rouge */}
      <svg className="road__car" ref={carRef} viewBox="0 0 92 38" preserveAspectRatio="xMidYMid meet">
        <ellipse cx="46" cy="36" rx="38" ry="2" fill="rgba(0,0,0,0.35)" />
        <path
          d="M 5,28 L 5,22 L 13,20 L 22,13 L 56,13 L 68,20 L 86,21 L 86,28 Z"
          fill="#C32A2A" stroke="#7E1818" strokeWidth="0.5"
        />
        <rect x="5" y="26" width="81" height="2" fill="#8B1F1F" />
        <path d="M 15,20 L 24,14.5 L 41,14.5 L 41,20 Z" fill="#1a1d24" />
        <path d="M 43,14.5 L 55,14.5 L 66,20 L 43,20 Z" fill="#1a1d24" />
        <line x1="42" y1="14.5" x2="42" y2="26" stroke="#7E1818" strokeWidth="0.7" />
        <ellipse cx="7"  cy="23" rx="2.5" ry="1.7" fill="#FFE08A" />
        <ellipse cx="84" cy="23" rx="2"   ry="1.5" fill="#7A0606" />
        <g>
          <circle cx="20" cy="29" r="6.5" fill="#0d0d10" />
          <circle cx="20" cy="29" r="3.3" fill="#404048" />
          <circle cx="20" cy="29" r="1.2" fill="#888" />
        </g>
        <g>
          <circle cx="71" cy="29" r="6.5" fill="#0d0d10" />
          <circle cx="71" cy="29" r="3.3" fill="#404048" />
          <circle cx="71" cy="29" r="1.2" fill="#888" />
        </g>
      </svg>
    </div>
  )
}
