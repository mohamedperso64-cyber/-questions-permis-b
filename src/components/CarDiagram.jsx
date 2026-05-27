import { useState } from 'react'
import { GESTURE_ZONES, ZONE_LABELS } from '../lib/gesteZones'

// ─── Voyant labels ────────────────────────────────────────────────

const GESTE_TO_VOYANT = {
  'indicateur-carburant':             'fuel',
  'voyant-ceinture':                  'seatbelt',
  'voyant-defaut-batterie':           'battery',
  'voyant-portiere':                  'door',
  'voyant-pression-huile':            'oil',
  'voyant-pression-pneu':             'tpms',
  'voyant-temperature':               'temp',
  'feux-brouillard-arriere-controle': 'fog-rear',
  'feux-detresse-controle':           'hazard',
  'feux-route-controle':              'highbeam',
}

const VOYANT_LABELS = {
  'fuel':     'Indicateur carburant bas — penser à refaire le plein',
  'battery':  'Défaut de charge batterie — vérifier l\'alternateur',
  'oil':      'Pression d\'huile insuffisante — couper le moteur',
  'temp':     'Température anormale du liquide de refroidissement',
  'seatbelt': 'Ceinture de sécurité non bouclée',
  'door':     'Portière ou coffre mal fermé',
  'tpms':     'Pression d\'un ou plusieurs pneus anormale (TPMS)',
  'fog-rear': 'Feux de brouillard arrière allumés',
  'highbeam': 'Feux de route (pleins phares) allumés — voyant bleu',
  'hazard':   'Feux de détresse activés — voyant rouge clignotant',
}

// ─── Hotspots photo intérieur ─────────────────────────────────────
// Positions en % du conteneur (image dashboard2.jpg affichée en entier)
// Photo : vue depuis le siège conducteur — Peugeot 206

const INTERIOR_HOTSPOTS = {
  'rearview-mirror':    { left: 34, top:  2, w: 30, h:  6 },
  'instrument-cluster': { left: 12, top:  8, w: 34, h: 22 },
  'hazard-button':      { left: 66, top:  6, w: 14, h: 14 },
  'dash-center':        { left: 50, top:  5, w: 44, h: 32 },
  'headrest':           { left: 72, top:  2, w: 26, h:  9 },
  'passenger-area':     { left: 72, top: 10, w: 26, h: 26 },
  'stalk-left':         { left:  3, top: 43, w: 19, h: 10 },
  'stalk-right':        { left: 67, top: 39, w: 19, h: 10 },
  'steering-wheel':     { left: 15, top: 22, w: 64, h: 50 },
  'door-panel':         { left:  0, top: 28, w:  5, h: 46 },
  'left-lower-dash':    { left:  2, top: 50, w: 18, h: 18 },
  'steering-column':    { left: 37, top: 68, w: 24, h:  9 },
  'climate-controls':   { left: 51, top: 57, w: 43, h: 20 },
  'speed-controls':     { left: 51, top: 57, w: 43, h: 20 },
  'brake-pedal':        { left:  2, top: 74, w: 20, h: 12 },
  'documents':          { left: 67, top: 62, w: 29, h: 22 },
  'center-console':     { left: 30, top: 80, w: 38, h: 14 },
  'gear-lever':         { left: 34, top: 80, w: 28, h: 12 },
  'rear-seat':          { left: 60, top: 80, w: 36, h: 16 },
}

// ─── Photo Intérieur ──────────────────────────────────────────────

function PhotoInterior({ activeZone, onZoneClick }) {
  return (
    <div className="photo-diagram">
      <img
        src="/images/car/dashboard2.jpg"
        className="photo-diagram__img"
        alt="Habitacle Peugeot 206 — tableau de bord"
        draggable="false"
      />
      {Object.entries(INTERIOR_HOTSPOTS).map(([id, pos]) => (
        <div
          key={id}
          role="button"
          tabIndex={0}
          className={`photo-diagram__zone${id === activeZone ? ' photo-diagram__zone--active' : ''}`}
          style={{
            left:   pos.left + '%',
            top:    pos.top  + '%',
            width:  pos.w    + '%',
            height: pos.h    + '%',
          }}
          onClick={() => onZoneClick?.(id)}
          onKeyDown={(e) => { if (e.key === 'Enter') onZoneClick?.(id) }}
          title={ZONE_LABELS[id] || id}
          aria-label={ZONE_LABELS[id] || id}
          aria-pressed={id === activeZone}
        />
      ))}
    </div>
  )
}

// ─── Zone helper (SVG extérieur) ──────────────────────────────────

function Zone({ id, def, active, onZoneClick }) {
  const [hovered, setHovered] = useState(false)

  const fill   = active   ? 'rgba(27,107,160,0.25)'
                : hovered ? 'rgba(27,107,160,0.10)'
                :           'transparent'
  const stroke = active   ? '#1B6BA0'
                : hovered ? 'rgba(27,107,160,0.45)'
                :           'transparent'
  const sw     = active   ? 2.5 : hovered ? 1.5 : 0
  const cls    = active   ? 'car-zone car-zone--active' : 'car-zone'

  const handlers = {
    style:        { cursor: 'pointer' },
    className:    cls,
    fill,
    stroke,
    strokeWidth:  sw,
    onClick:      () => onZoneClick && onZoneClick(id),
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  }

  if (def.shape === 'rect')
    return <rect   x={def.x} y={def.y} width={def.w} height={def.h} rx={def.rx||0} {...handlers}/>
  if (def.shape === 'circle')
    return <circle cx={def.cx} cy={def.cy} r={def.r} {...handlers}/>
  return null
}

// ─── Zones extérieur ─────────────────────────────────────────────

const EXTERIOR_ZONES = {
  'hood':               { shape: 'rect',   x: 30,  y: 143, w: 190, h: 112, rx: 6  },
  'front-lights':       { shape: 'rect',   x: 30,  y: 157, w: 50,  h: 74,  rx: 5  },
  'windshield':         { shape: 'rect',   x: 218, y: 68,  w: 82,  h: 88,  rx: 8  },
  'front-wheel':        { shape: 'circle', cx: 146, cy: 255, r: 60          },
  'rear-wheel':         { shape: 'circle', cx: 454, cy: 255, r: 60          },
  'fuel-cap':           { shape: 'circle', cx: 494, cy: 192, r: 22          },
  'trunk':              { shape: 'rect',   x: 468, y: 143, w: 102, h: 112, rx: 6  },
  'rear-lights':        { shape: 'rect',   x: 520, y: 151, w: 50,  h: 76,  rx: 5  },
  'license-plate':      { shape: 'rect',   x: 484, y: 230, w: 78,  h: 22,  rx: 3  },
  'license-plate-front':{ shape: 'rect',   x: 32,  y: 230, w: 78,  h: 22,  rx: 3  },
  'turn-signal':        { shape: 'rect',   x: 30,  y: 211, w: 50,  h: 22,  rx: 3  },
  'reflectors':         { shape: 'rect',   x: 520, y: 213, w: 50,  h: 22,  rx: 3  },
}

// ─── Extérieur 206 hatchback (600 × 340) ─────────────────────────

function ExteriorSVG({ activeZone, onZoneClick }) {
  const lugs = Array.from({ length: 5 }, (_, i) => (i*72-90)*Math.PI/180)
  return (
    <svg viewBox="0 0 600 340" className="car-diagram__svg" aria-hidden="true">
      <rect width="600" height="340" fill="#F0EDE6" rx="10"/>

      <path
        d="M 30 255 L 30 185 L 210 145 L 242 70 L 420 70 L 460 145 L 570 145 L 570 255
           L 514 255 A 60 60 0 0 0 394 255 L 206 255 A 60 60 0 0 0 86 255 Z"
        fill="#E8E3D8" stroke="#B8B2A3" strokeWidth="2"
      />
      <path d="M 213 148 L 244 72 L 318 72 L 318 148 Z" fill="#C8DCE8" stroke="#A8B8C8" strokeWidth="1" opacity="0.72"/>
      <path d="M 360 148 L 370 72 L 418 72 L 458 148 Z" fill="#C8DCE8" stroke="#A8B8C8" strokeWidth="1" opacity="0.72"/>
      <rect x="320" y="74" width="48" height="68" rx="2" fill="#C8DCE8" stroke="#A8B8C8" strokeWidth="1" opacity="0.72"/>
      <line x1="213" y1="148" x2="213" y2="255" stroke="#A8A098" strokeWidth="1.2" strokeDasharray="4,3"/>
      <line x1="458" y1="148" x2="458" y2="255" stroke="#A8A098" strokeWidth="1.2" strokeDasharray="4,3"/>
      <line x1="30"  y1="200" x2="570" y2="200" stroke="#A8A098" strokeWidth="0.8" strokeDasharray="6,4"/>

      <rect x="30"  y="158" width="50" height="70" rx="4" fill="#F4E88C" stroke="#C8B840" strokeWidth="1" opacity="0.9"/>
      <rect x="32"  y="162" width="26" height="32" rx="2" fill="#F8F0A0" opacity="0.9"/>
      <rect x="32"  y="198" width="26" height="12" rx="2" fill="#FFD080" opacity="0.8"/>

      <rect x="520" y="150" width="50" height="78" rx="4" fill="#E82020" stroke="#B81010" strokeWidth="1" opacity="0.9"/>
      <rect x="522" y="154" width="26" height="36" rx="2" fill="#FF5050" opacity="0.9"/>
      <rect x="522" y="194" width="26" height="14" rx="2" fill="#FFAA40" opacity="0.8"/>

      <rect x="30"  y="196" width="14" height="44" rx="3" fill="#C0BAB0" stroke="#A8A098" strokeWidth="1"/>
      {[0,1,2].map(i => <line key={i} x1="30" y1={207+i*11} x2="44" y2={207+i*11} stroke="#B0A898" strokeWidth="0.8"/>)}

      <circle cx="494" cy="192" r="20" fill="#DEDED8" stroke="#B0A898" strokeWidth="1.5"/>
      <circle cx="494" cy="192" r="12" fill="#C8C0B0" stroke="#A8A098" strokeWidth="1"/>
      <circle cx="494" cy="192" r="4"  fill="#A8A098"/>

      <rect x="32"  y="228" width="76" height="22" rx="3" fill="white"   stroke="#C0B9AC" strokeWidth="1"/>
      <text x="70"  y="243" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1A1D24" fontFamily="monospace">AB-123-CD</text>
      <rect x="490" y="228" width="76" height="22" rx="3" fill="#FFFAE0" stroke="#C0B9AC" strokeWidth="1"/>
      <text x="528" y="243" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1A1D24" fontFamily="monospace">AB-123-CD</text>

      <rect x="30"  y="212" width="50" height="18" rx="3" fill="#FFB830" stroke="#E09010" strokeWidth="1" opacity="0.9"/>
      <rect x="520" y="226" width="50" height="14" rx="2" fill="#FF4444" stroke="#CC2222" strokeWidth="0.8" opacity="0.9"/>

      <circle cx="146" cy="255" r="56" fill="#333028" stroke="#222018" strokeWidth="1.5"/>
      <circle cx="146" cy="255" r="38" fill="#3A3830" stroke="#484640" strokeWidth="1"/>
      <circle cx="146" cy="255" r="26" fill="#E8E3D8" stroke="#C8C0B0" strokeWidth="1.5"/>
      <circle cx="146" cy="255" r="6"  fill="#C0B8A8"/>
      {lugs.map((a,i) => <circle key={i} cx={146+17*Math.cos(a)} cy={255+17*Math.sin(a)} r="3" fill="#A8A098"/>)}

      <circle cx="454" cy="255" r="56" fill="#333028" stroke="#222018" strokeWidth="1.5"/>
      <circle cx="454" cy="255" r="38" fill="#3A3830" stroke="#484640" strokeWidth="1"/>
      <circle cx="454" cy="255" r="26" fill="#E8E3D8" stroke="#C8C0B0" strokeWidth="1.5"/>
      <circle cx="454" cy="255" r="6"  fill="#C0B8A8"/>
      {lugs.map((a,i) => <circle key={i} cx={454+17*Math.cos(a)} cy={255+17*Math.sin(a)} r="3" fill="#A8A098"/>)}

      {Object.entries(EXTERIOR_ZONES).map(([id, def]) => (
        <Zone key={id} id={id} def={def} active={id === activeZone} onZoneClick={onZoneClick}/>
      ))}
    </svg>
  )
}

// ─── Composant principal ──────────────────────────────────────────

export default function CarDiagram({ gesteKey, selectedZone, onZoneClick }) {
  const mapping = GESTURE_ZONES[gesteKey]
  if (!mapping) return null

  const { view } = mapping

  const voyantId = selectedZone === 'instrument-cluster' ? GESTE_TO_VOYANT[gesteKey] : null
  const label = voyantId
    ? VOYANT_LABELS[voyantId]
    : selectedZone
    ? ZONE_LABELS[selectedZone]
    : null

  return (
    <div className="car-diagram">
      {view === 'interior'
        ? <PhotoInterior activeZone={selectedZone} onZoneClick={onZoneClick} />
        : <ExteriorSVG   activeZone={selectedZone} onZoneClick={onZoneClick} />
      }
      <div className="car-diagram__label">
        {label
          ? <>📍 {label}</>
          : <span className="car-diagram__hint">🖱️ Clique sur une zone pour explorer</span>
        }
      </div>
    </div>
  )
}
