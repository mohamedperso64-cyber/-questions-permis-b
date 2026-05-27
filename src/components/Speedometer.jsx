import { forwardRef, useImperativeHandle, useRef } from 'react'
import './Speedometer.css'

// === Géométrie ===
const SIZE = 320
const CENTER = SIZE / 2

const START_ANGLE = 225
const SWEEP = 270
const MAX_KMH = 180

const R_BEZEL_OUTER = 156
const R_BEZEL_INNER = 152
const R_DIAL = 148
const R_TICK_OUTER = 140
const R_TICK_MAJOR_INNER = 122
const R_TICK_MINOR_INNER = 132
const R_NUMBER = 108
const R_NEEDLE_TIP = 132

const MAJOR_VALUES = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180]
const MINOR_VALUES = [10, 30, 50, 70, 90, 110, 130, 150, 170]

// Odomètre
const DIGIT_W = 18
const DIGIT_H = 22
// Strip de chiffres pour les rouleaux (assez long pour plusieurs rotations)
const STRIP_REPEAT = 6
const STRIP_LENGTH = STRIP_REPEAT * 10  // 60 chiffres
const STRIP_PIXEL_HEIGHT = STRIP_LENGTH * DIGIT_H

function angleFor(value) {
  const v = Math.max(0, Math.min(MAX_KMH, value))
  return START_ANGLE + (v / MAX_KMH) * SWEEP
}

function polar(radius, angleDeg) {
  const rad = angleDeg * Math.PI / 180
  return {
    x: CENTER + radius * Math.sin(rad),
    y: CENTER - radius * Math.cos(rad),
  }
}

const Speedometer = forwardRef(function Speedometer(
  { digits = '00047', highlightLast = 2, needleValue = 0, size = SIZE },
  ref
) {
  const needleAngle = angleFor(needleValue)
  const digitsArr = digits.split('')

  const needleRef = useRef(null)
  const digitRefs = useRef([])              // <text> pour les chiffres non dorés
  const rollerRefs = useRef([])             // <g> pour les rouleaux des chiffres dorés
  const containerRef = useRef(null)
  const spinningRef = useRef(false)

  // Position Y initiale de chaque rouleau (déduite de la prop digits → affiche
  // le bon chiffre dès le premier rendu, pas de flash sur "0").
  const rollerYRef = useRef(
    Array.from({ length: highlightLast }, (_, k) => {
      const idx = digitsArr.length - highlightLast + k
      return (parseInt(digitsArr[idx], 10) || 0) * DIGIT_H
    })
  )

  useImperativeHandle(ref, () => ({
    setSpeed(kmh) {
      if (!needleRef.current) return
      const angle = angleFor(kmh)
      needleRef.current.setAttribute('transform', `rotate(${angle} ${CENTER} ${CENTER})`)
    },
    setOdometer(units) {
      const nonAccent = digitsArr.length - highlightLast
      const intUnits = Math.floor(Math.max(0, units))
      const newDigits = String(intUnits).padStart(nonAccent, '0').slice(-nonAccent)
      for (let i = 0; i < nonAccent; i++) {
        const el = digitRefs.current[i]
        if (el && el.textContent !== newDigits[i]) {
          el.textContent = newDigits[i]
        }
      }
    },
    /**
     * Anime les rouleaux des chiffres dorés comme une vraie slot machine,
     * scrolling verticalement à travers les chiffres, puis ralentissant
     * et atterrissant pile sur la valeur cible.
     */
    spinSelector(finalId) {
      return new Promise((resolve) => {
        if (spinningRef.current) { resolve(); return }
        spinningRef.current = true
        if (containerRef.current) containerRef.current.classList.add('is-spinning')

        const finalDisplay = String(finalId % 100).padStart(highlightLast, '0')

        // Pour chaque rouleau : calcule la position cible et lance la transition
        const durations = []
        rollerRefs.current.forEach((roller, k) => {
          if (!roller) return

          const targetDigit = parseInt(finalDisplay[k], 10)
          const currentY = rollerYRef.current[k] || 0
          const currentDigit = Math.round(currentY / DIGIT_H) % 10

          // Nombre de rotations complètes avant d'atterrir.
          // Le 2e rouleau fait plus de tours pour s'arrêter visiblement plus tard.
          const rotations = 3 + k

          // Différence à parcourir pour atterrir sur le bon chiffre (en avant uniquement)
          const digitDelta = (targetDigit - currentDigit + 10) % 10
          const forwardScroll = (rotations * 10 + digitDelta) * DIGIT_H
          const newY = currentY + forwardScroll
          rollerYRef.current[k] = newY

          // Durée échelonnée : le 1er rouleau s'arrête à 4 s, le 2e à 5,2 s
          const duration = 4.0 + k * 1.2
          durations.push(duration)

          // Reset éventuel de la transition pour appliquer la nouvelle
          roller.style.transition = `transform ${duration}s cubic-bezier(0.15, 0.45, 0.2, 1)`
          roller.style.transform = `translate(0px, -${newY}px)`
        })

        const longest = Math.max(...durations, 0)

        // Attend la fin de la transition la plus longue, puis réduit
        // les Y pour éviter qu'ils ne croissent indéfiniment
        setTimeout(() => {
          rollerRefs.current.forEach((roller, k) => {
            if (!roller) return
            const y = rollerYRef.current[k] || 0
            const reduced = y % (10 * DIGIT_H)
            if (reduced !== y) {
              rollerYRef.current[k] = reduced
              roller.style.transition = 'none'
              roller.style.transform = `translate(0px, -${reduced}px)`
              // Force reflow pour appliquer le reset sans transition visible
              void roller.getBoundingClientRect()
            }
          })

          if (containerRef.current) containerRef.current.classList.remove('is-spinning')
          spinningRef.current = false
          resolve()
        }, longest * 1000 + 80)
      })
    },
  }), [digitsArr, highlightLast])

  // Odomètre : positions
  const odoWidth = digitsArr.length * DIGIT_W + 6
  const odoX = CENTER - odoWidth / 2
  const odoY = CENTER - 50

  return (
    <div className="speedo" ref={containerRef} style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="speedo__svg"
        role="img"
        aria-label="Compteur kilométrique avec odomètre"
      >
        <defs>
          <radialGradient id="dialBg" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#2a2d36" />
            <stop offset="55%" stopColor="#0E1014" />
            <stop offset="100%" stopColor="#040506" />
          </radialGradient>
          <linearGradient id="chrome" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e9e6dc" />
            <stop offset="40%" stopColor="#b8b3a4" />
            <stop offset="60%" stopColor="#8c8779" />
            <stop offset="100%" stopColor="#5d584a" />
          </linearGradient>
          <linearGradient id="needle" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E64A4A" />
            <stop offset="100%" stopColor="#9F1F1F" />
          </linearGradient>

          {/* Clips pour les rouleaux des chiffres dorés (les masques de fenêtres) */}
          {Array.from({ length: highlightLast }).map((_, k) => {
            const i = (digitsArr.length - highlightLast) + k
            const x = odoX + i * DIGIT_W + 3
            const y = odoY + 3
            return (
              <clipPath key={`clip-${k}`} id={`roller-clip-${k}`}>
                <rect x={x} y={y} width={DIGIT_W - 1} height={DIGIT_H - 2} rx="1.5" />
              </clipPath>
            )
          })}
        </defs>

        {/* Cadran et liseré */}
        <circle cx={CENTER} cy={CENTER} r={R_BEZEL_OUTER} fill="url(#chrome)" />
        <circle cx={CENTER} cy={CENTER} r={R_BEZEL_INNER} fill="#0a0a0c" />
        <circle cx={CENTER} cy={CENTER} r={R_DIAL} fill="url(#dialBg)" />
        <ellipse cx={CENTER} cy={CENTER - 90} rx={90} ry={26} fill="rgba(255,255,255,0.04)" />

        {/* Ticks majeurs */}
        {MAJOR_VALUES.map(v => {
          const a = angleFor(v)
          const o = polar(R_TICK_OUTER, a)
          const i = polar(R_TICK_MAJOR_INNER, a)
          return (
            <line key={`maj-${v}`}
              x1={o.x} y1={o.y} x2={i.x} y2={i.y}
              stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"
            />
          )
        })}

        {/* Ticks mineurs */}
        {MINOR_VALUES.map(v => {
          const a = angleFor(v)
          const o = polar(R_TICK_OUTER, a)
          const i = polar(R_TICK_MINOR_INNER, a)
          return (
            <line key={`min-${v}`}
              x1={o.x} y1={o.y} x2={i.x} y2={i.y}
              stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round"
            />
          )
        })}

        {/* Numéros */}
        {MAJOR_VALUES.map(v => {
          const a = angleFor(v)
          const p = polar(R_NUMBER, a)
          return (
            <text key={`num-${v}`}
              x={p.x} y={p.y}
              fill="#FFFFFF"
              fontFamily="Roboto Mono, monospace"
              fontSize="15" fontWeight="600"
              textAnchor="middle" dominantBaseline="middle"
            >
              {v}
            </text>
          )
        })}

        {/* Odomètre : boîtier */}
        <rect x={odoX} y={odoY} width={odoWidth} height={DIGIT_H + 4} rx="3"
              fill="#000" stroke="#3a3a3a" strokeWidth="1" />

        {/* Chiffres non-dorés : <text> statique mis à jour via setOdometer */}
        {digitsArr.map((d, i) => {
          const isAccent = i >= digitsArr.length - highlightLast
          if (isAccent) return null
          return (
            <g key={i}>
              <rect
                x={odoX + i * DIGIT_W + 3} y={odoY + 3}
                width={DIGIT_W - 1} height={DIGIT_H - 2}
                rx="1.5"
                fill="#0d0d0d"
              />
              <text
                ref={el => { digitRefs.current[i] = el }}
                x={odoX + i * DIGIT_W + 3 + (DIGIT_W - 1) / 2}
                y={odoY + 3 + (DIGIT_H - 2) / 2 + 1}
                fill="#F4F1E8"
                fontFamily="Roboto Mono, monospace"
                fontSize="16" fontWeight="700"
                textAnchor="middle" dominantBaseline="middle"
              >
                {d}
              </text>
            </g>
          )
        })}

        {/* Chiffres dorés → rouleaux scrollables (bleu ciel + glow blanc) */}
        {Array.from({ length: highlightLast }).map((_, k) => {
          const i = (digitsArr.length - highlightLast) + k
          const x = odoX + i * DIGIT_W + 3
          const y = odoY + 3
          return (
            <g key={`roller-${k}`}>
              {/* Fond bleu ciel */}
              <rect
                className="speedo__digit-bg--accent"
                x={x} y={y}
                width={DIGIT_W - 1} height={DIGIT_H - 2}
                rx="1.5"
                fill="#A8D5F0"
                stroke="#5A8AA8"
                strokeWidth={0.8}
              />
              {/* Strip clippé qui défile */}
              <g clipPath={`url(#roller-clip-${k})`}>
                <g
                  ref={el => { rollerRefs.current[k] = el }}
                  style={{
                    willChange: 'transform',
                    transform: `translate(0px, -${rollerYRef.current[k] || 0}px)`,
                  }}
                >
                  {Array.from({ length: STRIP_LENGTH }).map((_, j) => (
                    <text
                      key={j}
                      x={x + (DIGIT_W - 1) / 2}
                      y={y + (DIGIT_H - 2) / 2 + 1 + j * DIGIT_H}
                      fill="#0a0a0a"
                      fontFamily="Roboto Mono, monospace"
                      fontSize="16" fontWeight="700"
                      textAnchor="middle" dominantBaseline="middle"
                    >
                      {j % 10}
                    </text>
                  ))}
                </g>
              </g>
            </g>
          )
        })}

        {/* km/h */}
        <text
          x={CENTER} y={CENTER + 70}
          fill="rgba(255,255,255,0.55)"
          fontFamily="Inter, sans-serif"
          fontSize="11" letterSpacing="2"
          textAnchor="middle"
        >
          km/h
        </text>

        {/* Aiguille */}
        <g
          ref={needleRef}
          transform={`rotate(${needleAngle} ${CENTER} ${CENTER})`}
        >
          <polygon
            points={`${CENTER - 4.5},${CENTER + 16} ${CENTER + 4.5},${CENTER + 16} ${CENTER + 1.2},${CENTER - R_NEEDLE_TIP} ${CENTER - 1.2},${CENTER - R_NEEDLE_TIP}`}
            fill="url(#needle)"
          />
          <circle cx={CENTER} cy={CENTER + 12} r="5" fill="#7a1414" />
        </g>

        {/* Moyeu central */}
        <circle cx={CENTER} cy={CENTER} r="13" fill="#1a1a1c" />
        <circle cx={CENTER} cy={CENTER} r="13" fill="none" stroke="url(#chrome)" strokeWidth="1.5" />
        <circle cx={CENTER} cy={CENTER} r="4" fill="#3a3a3c" />
      </svg>
    </div>
  )
})

export default Speedometer
