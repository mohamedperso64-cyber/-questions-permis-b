import { useState, useEffect } from 'react'
import { GESTURE_ZONES, ZONE_LABELS } from '../lib/gesteZones'

/**
 * CarDiagram — schéma SVG Peugeot 206, zones cliquables + voyants tableau de bord.
 * Props :
 *   gesteKey     : clé du geste (pour détecter interior/exterior + voyant actif)
 *   selectedZone : zone à mettre en surbrillance (null = aucune)
 *   onZoneClick  : (zoneId) => void — appelé quand l'utilisateur clique une zone
 */

// ─── Voyants du tableau de bord ───────────────────────────────────

/**
 * 10 voyants organisés en 2 rangées de 5 dans le bloc compteurs.
 * Rangée 0 (y≈191): voyants d'alarme / alerte rouges + orange critiques
 * Rangée 1 (y≈204): voyants de signalisation + feux
 */
const VOYANT_DEFS = [
  // rangée 0
  { id: 'fuel',     color: '#FF9500', row: 0, col: 0,
    draw: (x,y) => <>
      {/* pompe à carburant */}
      <rect x={x+1} y={y+2} width={7} height={6} rx={1} fill="currentColor"/>
      <rect x={x+3} y={y+1} width={3} height={2} rx={0.5} fill="currentColor"/>
      <rect x={x+8} y={y+2} width={3} height={1.5} rx={0.5} fill="currentColor"/>
      <line x1={x+11} y1={y+3.5} x2={x+11} y2={y+6.5} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1={x+11} y1={y+6.5} x2={x+13} y2={y+6.5} stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <circle cx={x+13} cy={x > 0 ? y+5.5 : y+5.5} r={1} fill="currentColor"/>
    </>
  },
  { id: 'battery',  color: '#FF3B30', row: 0, col: 1,
    draw: (x,y) => <>
      {/* batterie */}
      <rect x={x+2} y={y+2.5} width={12} height={5} rx={0.8} fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <rect x={x+5} y={y+1.2} width={2} height={1.5} rx={0.3} fill="currentColor"/>
      <rect x={x+10} y={y+1.2} width={2} height={1.5} rx={0.3} fill="currentColor"/>
      <text x={x+6.5} y={y+6.5} fontSize="3.5" fill="currentColor" fontFamily="sans-serif" fontWeight="bold">+</text>
      <text x={x+11} y={y+6.5} fontSize="4.5" fill="currentColor" fontFamily="sans-serif" fontWeight="bold">–</text>
    </>
  },
  { id: 'oil',      color: '#FF3B30', row: 0, col: 2,
    draw: (x,y) => <>
      {/* bidon d'huile stylisé */}
      <rect x={x+2} y={y+3} width={8} height={5} rx={1} fill="currentColor"/>
      <rect x={x+4} y={y+1.5} width={4} height={2} rx={0.5} fill="currentColor"/>
      <rect x={x+7} y={y+1.2} width={4} height={1.2} rx={0.4} fill="currentColor"/>
      {/* goutte */}
      <ellipse cx={x+14} cy={y+5.5} rx={1.8} ry={2.5} fill="currentColor"/>
      <polygon points={`${x+14},${y+1.5} ${x+12.6},${y+4} ${x+15.4},${y+4}`} fill="currentColor"/>
    </>
  },
  { id: 'temp',     color: '#FF3B30', row: 0, col: 3,
    draw: (x,y) => <>
      {/* thermomètre */}
      <rect x={x+6} y={y+1} width={3} height={5.5} rx={1.5} fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx={x+7.5} cy={y+7} r={2} fill="currentColor"/>
      <rect x={x+7} y={y+3.5} width={1} height={4} rx={0} fill="currentColor"/>
      {/* graduations */}
      <line x1={x+9} y1={y+2.5} x2={x+11} y2={y+2.5} stroke="currentColor" strokeWidth="0.8"/>
      <line x1={x+9} y1={y+4} x2={x+10} y2={y+4} stroke="currentColor" strokeWidth="0.8"/>
    </>
  },
  { id: 'seatbelt', color: '#FF3B30', row: 0, col: 4,
    draw: (x,y) => <>
      {/* silhouette ceinture */}
      <circle cx={x+7} cy={y+2.5} r={2} fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <line x1={x+7} y1={y+4.5} x2={x+7} y2={y+8} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1={x+5} y1={y+5} x2={x+12} y2={y+7.5} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </>
  },
  // rangée 1
  { id: 'door',     color: '#FF9500', row: 1, col: 0,
    draw: (x,y) => <>
      {/* portière ouverte */}
      <rect x={x+3} y={y+1} width={9} height={7} rx={1} fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <line x1={x+7} y1={y+1} x2={x+7} y2={y+8} stroke="currentColor" strokeWidth="0.8"/>
      <circle cx={x+11} cy={y+4.5} r={0.8} fill="currentColor"/>
      {/* porte ouverte */}
      <path d={`M${x+3},${y+2} L${x+1},${y+4.5} L${x+3},${y+7}`} fill="none" stroke="currentColor" strokeWidth="1.2"/>
    </>
  },
  { id: 'tpms',     color: '#FF9500', row: 1, col: 1,
    draw: (x,y) => <>
      {/* pneu vu de face */}
      <circle cx={x+6} cy={y+5.5} r={3.5} fill="none" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx={x+6} cy={y+5.5} r={1.5} fill="none" stroke="currentColor" strokeWidth="0.8"/>
      {/* ! */}
      <line x1={x+12} y1={y+1.5} x2={x+12} y2={y+5.5} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx={x+12} cy={y+7.5} r={0.9} fill="currentColor"/>
    </>
  },
  { id: 'fog-rear', color: '#FF9500', row: 1, col: 2,
    draw: (x,y) => <>
      {/* cercle feu + lignes brouillard */}
      <circle cx={x+5} cy={y+4.5} r={3} fill="none" stroke="currentColor" strokeWidth="1.3"/>
      <line x1={x+5} y1={y+4.5} x2={x+3} y2={y+4.5} stroke="currentColor" strokeWidth="1.2"/>
      {[0,1,2,3].map(i=>(
        <line key={i} x1={x+9} y1={y+1.5+i*1.8} x2={x+16} y2={y+1.5+i*1.8} stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      ))}
    </>
  },
  { id: 'highbeam', color: '#007AFF', row: 1, col: 3,
    draw: (x,y) => <>
      {/* feux route — cercle + faisceaux horizontaux */}
      <circle cx={x+5} cy={y+4.5} r={3} fill="none" stroke="currentColor" strokeWidth="1.3"/>
      {[0,1,2,3,4].map(i=>(
        <line key={i} x1={x+8} y1={y+1+i*1.6} x2={x+16} y2={y+1+i*1.6} stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/>
      ))}
    </>
  },
  { id: 'hazard',   color: '#FF6B35', row: 1, col: 4,
    draw: (x,y) => <>
      {/* triangle détresse */}
      <polygon points={`${x+8},${y+1} ${x+2},${y+8} ${x+14},${y+8}`} fill="none" stroke="currentColor" strokeWidth="1.3"/>
      <polygon points={`${x+8},${y+3} ${x+5},${y+7.5} ${x+11},${y+7.5}`} fill="none" stroke="currentColor" strokeWidth="0.8"/>
      <line x1={x+8} y1={y+4.5} x2={x+8} y2={y+6} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx={x+8} cy={y+7} r={0.6} fill="currentColor"/>
    </>
  },
]

// Mapping geste-key → id du voyant
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

// Labels détaillés par voyant (affiché quand le voyant est actif)
const VOYANT_LABELS = {
  'fuel':     'Indicateur carburant bas — penser à refaire le plein',
  'battery':  'Défaut de charge batterie — vérifier alternateur',
  'oil':      'Pression d\'huile insuffisante — couper le moteur',
  'temp':     'Température anormale du liquide de refroidissement',
  'seatbelt': 'Ceinture de sécurité non bouclée',
  'door':     'Portière ou coffre mal fermé',
  'tpms':     'Pression d\'un ou plusieurs pneus anormale',
  'fog-rear': 'Feux de brouillard arrière allumés',
  'highbeam': 'Feux de route (pleins phares) allumés — voyant bleu',
  'hazard':   'Feux de détresse activés — voyant rouge clignotant',
}

// ─── Zones intérieur ──────────────────────────────────────────────

const INTERIOR_ZONES = {
  'rearview-mirror':    { shape: 'rect',   x: 214, y: 10,  w: 172, h: 44,  rx: 7  },
  'instrument-cluster': { shape: 'rect',   x: 46,  y: 68,  w: 164, h: 150, rx: 8  },
  'left-lower-dash':    { shape: 'rect',   x: 46,  y: 230, w: 130, h: 96,  rx: 6  },
  'stalk-left':         { shape: 'rect',   x: 58,  y: 338, w: 88,  h: 18,  rx: 4  },
  'stalk-right':        { shape: 'rect',   x: 212, y: 338, w: 88,  h: 18,  rx: 4  },
  'steering-wheel':     { shape: 'circle', cx: 175, cy: 388, r: 76          },
  'steering-column':    { shape: 'rect',   x: 148, y: 460, w: 56,  h: 18,  rx: 5  },
  'dash-center':        { shape: 'rect',   x: 212, y: 68,  w: 228, h: 214, rx: 8  },
  'hazard-button':      { shape: 'circle', cx: 326, cy: 94, r: 30           },
  'climate-controls':   { shape: 'rect',   x: 212, y: 292, w: 228, h: 72,  rx: 6  },
  'speed-controls':     { shape: 'rect',   x: 212, y: 292, w: 228, h: 72,  rx: 6  },
  'headrest':           { shape: 'rect',   x: 444, y: 8,   w: 150, h: 58,  rx: 8  },
  'passenger-area':     { shape: 'rect',   x: 444, y: 72,  w: 150, h: 158, rx: 8  },
  'door-panel':         { shape: 'rect',   x: 4,   y: 150, w: 42,  h: 328, rx: 6  },
  'documents':          { shape: 'rect',   x: 444, y: 240, w: 150, h: 124, rx: 6  },
  'rear-seat':          { shape: 'rect',   x: 444, y: 374, w: 150, h: 104, rx: 6  },
  'center-console':     { shape: 'rect',   x: 222, y: 374, w: 206, h: 104, rx: 8  },
  'gear-lever':         { shape: 'circle', cx: 322, cy: 420, r: 28          },
  'brake-pedal':        { shape: 'rect',   x: 128, y: 454, w: 88,  h: 24,  rx: 4  },
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

// ─── Zone shape renderer ──────────────────────────────────────────

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

// ─── Voyant indicator ────────────────────────────────────────────

const VOYANT_W = 20
const VOYANT_H = 9
const VOYANT_GAP = 3
const VOYANT_X0 = 51   // left start
const VOYANT_Y0 = 192  // row 0
const VOYANT_DY = 13   // row spacing

function VoyantItem({ v, active, onVoyantClick }) {
  const [hovered, setHovered] = useState(false)
  const x = VOYANT_X0 + v.col * (VOYANT_W + VOYANT_GAP)
  const y = VOYANT_Y0 + v.row * VOYANT_DY

  return (
    <g
      style={{ cursor: 'pointer' }}
      onClick={() => onVoyantClick(v.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* zone de clic élargie (invisible) */}
      <rect x={x-1} y={y-1} width={VOYANT_W+2} height={VOYANT_H+2} rx={2} fill="transparent"/>
      {/* fond */}
      <rect
        x={x} y={y} width={VOYANT_W} height={VOYANT_H} rx={1.5}
        fill={active ? v.color : hovered ? '#2A3040' : '#111318'}
        stroke={active ? 'none' : hovered ? v.color : '#2A3040'}
        strokeWidth={active ? 0 : hovered ? 0.9 : 0.6}
        className={active ? 'car-zone--active' : undefined}
      />
      {/* icône */}
      <g style={{ color: active ? 'white' : v.color, opacity: active ? 1 : hovered ? 0.75 : 0.45 }}>
        {v.draw(x, y)}
      </g>
    </g>
  )
}

function VoyantBar({ activeVoyant, onVoyantClick }) {
  return (
    <>
      {VOYANT_DEFS.map(v => (
        <VoyantItem
          key={v.id}
          v={v}
          active={activeVoyant === v.id}
          onVoyantClick={onVoyantClick}
        />
      ))}
    </>
  )
}

// ─── Intérieur 206 (600 × 480) ───────────────────────────────────

function InteriorSVG({ activeZone, onZoneClick, activeVoyant, onVoyantClick }) {
  const ticks = Array.from({ length: 9 }, (_, i) => {
    const a = (-150 + i * 37.5) * Math.PI / 180
    return { x1: 88+30*Math.cos(a), y1: 140+30*Math.sin(a), x2: 88+36*Math.cos(a), y2: 140+36*Math.sin(a), b: i%2===0 }
  })
  const lugs = Array.from({ length: 5 }, (_, i) => (i*72-90)*Math.PI/180)

  return (
    <svg viewBox="0 0 600 480" className="car-diagram__svg" aria-hidden="true">
      {/* Fond page */}
      <rect width="600" height="480" fill="#F0EDE6" rx="10"/>

      {/* ══ Corps du tableau de bord ══ */}
      <rect x="28" y="62" width="544" height="306" rx="14" fill="#2A2D36" stroke="#1A1D24" strokeWidth="1.5"/>
      <rect x="28" y="62" width="544" height="14" rx="8" fill="#3A3D48"/>

      {/* ── Rétroviseur intérieur ── */}
      <rect x="216" y="10" width="168" height="44" rx="7" fill="#D0C8B8" stroke="#B0A890" strokeWidth="1"/>
      <line x1="262" y1="54" x2="300" y2="62" stroke="#B0A890" strokeWidth="1"/>
      <line x1="338" y1="54" x2="300" y2="62" stroke="#B0A890" strokeWidth="1"/>

      {/* ══ COLONNE GAUCHE ══ */}

      {/* Fond compteurs */}
      <rect x="46" y="70" width="164" height="150" rx="8" fill="#111318" stroke="#222530" strokeWidth="1"/>

      {/* Compteur vitesse */}
      <circle cx="88"  cy="140" r="46" fill="#FAFAF8" stroke="#2A2D36" strokeWidth="2.5"/>
      <circle cx="88"  cy="140" r="38" fill="#F5F5F0" stroke="#CCC" strokeWidth="0.5"/>
      {ticks.map((t,i) => <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#5A5A5A" strokeWidth={t.b?1.5:0.8}/>)}
      <line x1="88" y1="140" x2="110" y2="108" stroke="#CC2222" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="88" cy="140" r="6" fill="#2A2D36"/>

      {/* Tachymètre / Jauge */}
      <circle cx="172" cy="140" r="32" fill="#FAFAF8" stroke="#2A2D36" strokeWidth="2"/>
      <circle cx="172" cy="140" r="24" fill="#F5F5F0" stroke="#CCC" strokeWidth="0.5"/>
      <line x1="172" y1="140" x2="172" y2="116" stroke="#CC2222" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="172" cy="140" r="5" fill="#2A2D36"/>

      {/* ── Voyants tableau de bord (2 rangées × 5) ── */}
      <VoyantBar activeVoyant={activeVoyant} onVoyantClick={onVoyantClick}/>

      {/* ── Colonne de direction (visuelle) ── */}
      <rect x="152" y="226" width="56" height="74" rx="6" fill="#C0B9AC" stroke="#A8A098" strokeWidth="1"/>

      {/* ── Panneau gauche inférieur (réglage feux + airbag PASS) ── */}
      <rect x="46" y="234" width="130" height="92" rx="6" fill="#1C1F28" stroke="#2A2D36" strokeWidth="1"/>
      <rect x="56" y="248" width="58" height="38" rx="4" fill="#111318" stroke="#3A4050" strokeWidth="1"/>
      <circle cx="70"  cy="267" r="8"  fill="none" stroke="#B8B8B8" strokeWidth="1.4"/>
      <line x1="78"  y1="261" x2="90" y2="256" stroke="#B8B8B8" strokeWidth="1.2"/>
      <line x1="78"  y1="267" x2="92" y2="267" stroke="#B8B8B8" strokeWidth="1.2"/>
      <line x1="78"  y1="273" x2="90" y2="278" stroke="#B8B8B8" strokeWidth="1.2"/>
      <rect x="60"   y="288" width="50" height="6"  rx="2" fill="#3A4050"/>
      <circle cx="83" cy="291" r="7"  fill="#C0B8A8" stroke="#A0A0A0" strokeWidth="1"/>
      <circle cx="140" cy="269" r="24" fill="#BB1A1A" stroke="#991414" strokeWidth="1.5"/>
      <text x="140" y="263" textAnchor="middle" fontSize="6"   fill="white" fontFamily="sans-serif" fontWeight="bold">AIRBAG</text>
      <text x="140" y="273" textAnchor="middle" fontSize="6"   fill="white" fontFamily="sans-serif" fontWeight="bold">PASS</text>
      <text x="124" y="251" textAnchor="middle" fontSize="4.5" fill="white" fontFamily="sans-serif">OFF</text>
      <text x="156" y="251" textAnchor="middle" fontSize="4.5" fill="white" fontFamily="sans-serif">ON</text>
      <rect x="132" y="288" width="16" height="8" rx="2" fill="#991414"/>
      <circle cx="140" cy="287" r="5" fill="none" stroke="#991414" strokeWidth="1.5"/>

      {/* ── Commodo gauche (feux) ── */}
      <rect x="60"  y="338" width="86" height="18" rx="4" fill="#3A4050" stroke="#4A5060" strokeWidth="0.8"/>
      <rect x="66"  y="333" width="14" height="8"  rx="2" fill="#5A6070"/>
      <rect x="90"  y="333" width="14" height="8"  rx="2" fill="#5A6070"/>

      {/* ── Commodo droit (essuie-glaces) ── */}
      <rect x="214" y="338" width="86" height="18" rx="4" fill="#3A4050" stroke="#4A5060" strokeWidth="0.8"/>
      <rect x="276" y="333" width="14" height="8"  rx="2" fill="#5A6070"/>
      <rect x="254" y="333" width="14" height="8"  rx="2" fill="#5A6070"/>

      {/* ── Volant Peugeot 206 ── */}
      <circle cx="175" cy="388" r="76" fill="none" stroke="#111318" strokeWidth="10"/>
      <path d="M 175 314 L 175 366" stroke="#111318" strokeWidth="20" strokeLinecap="round"/>
      <path d="M 175 412 Q 152 432 133 450" stroke="#111318" strokeWidth="20" strokeLinecap="round"/>
      <path d="M 175 412 Q 198 432 217 450" stroke="#111318" strokeWidth="20" strokeLinecap="round"/>
      <circle cx="175" cy="388" r="30" fill="#1A1D24" stroke="#2A2D36" strokeWidth="1"/>
      <circle cx="175" cy="388" r="18" fill="#111318"/>
      <text x="175" y="395" textAnchor="middle" fontSize="18" fill="#C0A030" fontFamily="serif">♞</text>

      {/* ── Pédalier (sous le volant) ── */}
      <rect x="128" y="454" width="88"  height="24"  rx="4" fill="#B8B0A0" stroke="#A0988A" strokeWidth="1"/>
      <rect x="130" y="462" width="84"  height="4"   rx="1" fill="#A0988A"/>
      <rect x="130" y="470" width="84"  height="4"   rx="1" fill="#A0988A"/>

      {/* ── Colonne basse ── */}
      <rect x="154" y="462" width="42" height="16" rx="3" fill="#B0A898" stroke="#988F84" strokeWidth="1"/>

      {/* ── Panneau porte conducteur ── */}
      <rect x="5"   y="154" width="40" height="324" rx="6" fill="#2A2D36" stroke="#1A1D24" strokeWidth="1"/>
      <rect x="10"  y="214" width="30" height="56"  rx="4" fill="#1E2128" stroke="#3A3D48" strokeWidth="1"/>
      <circle cx="25" cy="332" r="14" fill="#1E2128" stroke="#3A3D48" strokeWidth="1"/>

      {/* ══ CONSOLE CENTRALE 206 ══ */}

      <circle cx="326" cy="94"  r="28" fill="#BB1A1A" stroke="#991414" strokeWidth="2"/>
      <circle cx="326" cy="94"  r="20" fill="#D02020"/>
      <polygon points="326,78 337,99 315,99" fill="white" opacity="0.9"/>

      <rect x="214" y="134" width="100" height="72" rx="6" fill="#111318" stroke="#222530" strokeWidth="1"/>
      {[0,1,2,3,4,5].map(i => <rect key={i} x="220" y={141+i*10} width="88" height="6" rx="2" fill="#1E2128"/>)}
      <rect x="258"  y="134" width="8"   height="72" rx="0" fill="#1C1F28"/>

      <rect x="322" y="134" width="106" height="72" rx="6" fill="#111318" stroke="#222530" strokeWidth="1"/>
      {[0,1,2,3,4,5].map(i => <rect key={i} x="328" y={141+i*10} width="94" height="6" rx="2" fill="#1E2128"/>)}

      <rect x="214" y="218" width="214" height="58" rx="4" fill="#0A0C12" stroke="#222530" strokeWidth="1"/>
      <rect x="218" y="222" width="128" height="50" rx="2" fill="#111318"/>
      <rect x="222" y="226" width="84"  height="22" rx="2" fill="#0D2A1A"/>
      <text x="264" y="242" textAnchor="middle" fontSize="8" fill="#40AA70" fontFamily="monospace">RDS  TA</text>
      {[0,1,2,3,4,5].map(i => (
        <circle key={i} cx={354+i*11} cy={247} r={5} fill="#1A1D24" stroke="#3A4050" strokeWidth="0.8"/>
      ))}
      {[0,1,2,3,4,5].map(i => (
        <text key={i} x={354+i*11} y={250} textAnchor="middle" fontSize="5" fill="#888" fontFamily="sans-serif">{i+1}</text>
      ))}
      <circle cx="352" cy="235" r="7" fill="#1A1D24" stroke="#3A4050" strokeWidth="0.8"/>

      <rect x="222" y="296" width="84"  height="38" rx="4" fill="#111318" stroke="#222530" strokeWidth="1"/>
      {[0,1,2].map(i => <rect key={i} x="228" y={303+i*10} width="72" height="5" rx="2" fill="#1E2128"/>)}
      <rect x="318" y="296" width="96"  height="38" rx="4" fill="#111318" stroke="#222530" strokeWidth="1"/>
      {[0,1,2].map(i => <rect key={i} x="324" y={303+i*10} width="84" height="5" rx="2" fill="#1E2128"/>)}

      {/* ── Commandes climatisation 206 (3 molettes) ── */}
      <rect x="214" y="344" width="214" height="24" rx="4" fill="#181A20" stroke="#2A2D36" strokeWidth="1"/>
      <circle cx="254" cy="344" r="28" fill="#111318" stroke="#3A4050" strokeWidth="1.5"/>
      <circle cx="254" cy="344" r="20" fill="#1E2128"/>
      <circle cx="254" cy="344" r="6"  fill="#4A5060"/>
      <text x="254"  y="323" textAnchor="middle" fontSize="9"  fill="#888">❄</text>
      <text x="254"  y="375" textAnchor="middle" fontSize="9"  fill="#888">☀</text>
      <circle cx="322" cy="344" r="28" fill="#111318" stroke="#3A4050" strokeWidth="1.5"/>
      <circle cx="322" cy="344" r="20" fill="#1E2128"/>
      <circle cx="322" cy="344" r="6"  fill="#4A5060"/>
      <text x="299"  y="347" textAnchor="middle" fontSize="5.5" fill="#888">OFF</text>
      <text x="345"  y="347" textAnchor="middle" fontSize="5.5" fill="#888">4</text>
      <rect x="314"  y="318" width="16" height="10" rx="2" fill="#1A3A5A" stroke="#2A5A8A" strokeWidth="0.8"/>
      <text x="322"  y="327" textAnchor="middle" fontSize="5"  fill="#70A0D0">A/C</text>
      <circle cx="390" cy="344" r="28" fill="#111318" stroke="#3A4050" strokeWidth="1.5"/>
      <circle cx="390" cy="344" r="20" fill="#1E2128"/>
      <circle cx="390" cy="344" r="6"  fill="#4A5060"/>
      <line x1="364" y1="344" x2="358" y2="344" stroke="#4080CC" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="416" y1="344" x2="422" y2="344" stroke="#CC3030" strokeWidth="3.5" strokeLinecap="round"/>

      {/* ══ COLONNE DROITE ══ */}
      <rect x="444" y="8"   width="150" height="58" rx="8" fill="#2A2D36" stroke="#1A1D24" strokeWidth="1"/>
      <rect x="456" y="18"  width="126" height="38" rx="4" fill="#1E2128"/>

      <rect x="444" y="72"  width="150" height="158" rx="8" fill="#2A2D36" stroke="#1A1D24" strokeWidth="1"/>
      <rect x="456" y="122" width="108" height="38"  rx="4" fill="#1A1D24" opacity="0.7"/>
      <text x="510" y="146" textAnchor="middle" fontSize="10" fill="#555" fontFamily="sans-serif">AIRBAG</text>

      <rect x="444" y="240" width="150" height="124" rx="6" fill="#2A2D36" stroke="#1A1D24" strokeWidth="1"/>
      <rect x="454" y="280" width="130" height="52"  rx="4" fill="#1E2128" stroke="#3A3D48" strokeWidth="1"/>
      <rect x="454" y="332" width="130" height="8"   rx="2" fill="#1A1D24"/>

      <rect x="444" y="374" width="150" height="104" rx="6" fill="#2A2D36" stroke="#1A1D24" strokeWidth="1"/>
      <rect x="456" y="390" width="126" height="44"  rx="4" fill="#1E2128"/>
      <circle cx="486" cy="450" r="12" fill="#1A1D24" stroke="#3A4050" strokeWidth="1.5"/>
      <circle cx="548" cy="450" r="12" fill="#1A1D24" stroke="#3A4050" strokeWidth="1.5"/>
      <text x="516"  y="454" textAnchor="middle" fontSize="7"  fill="#555" fontFamily="sans-serif">ISOFIX</text>

      {/* ══ CONSOLE CENTRALE BASSE ══ */}
      <rect x="224" y="374" width="202" height="104" rx="8" fill="#2A2D36" stroke="#1A1D24" strokeWidth="1"/>
      <rect x="318" y="380" width="12"  height="46"  rx="4" fill="#111318"/>
      <circle cx="324" cy="380" r="14" fill="#111318" stroke="#2A2D36" strokeWidth="1.5"/>
      <circle cx="324" cy="380" r="7"  fill="#1E2128"/>
      <rect x="285" y="400" width="10"  height="46"  rx="3" fill="#1E2128"/>
      <circle cx="290" cy="400" r="11" fill="#111318" stroke="#2A2D36" strokeWidth="1"/>

      {/* ══ Zones interactives (overlay) ══ */}
      {Object.entries(INTERIOR_ZONES).map(([id, def]) => (
        <Zone key={id} id={id} def={def} active={id === activeZone} onZoneClick={onZoneClick}/>
      ))}
    </svg>
  )
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
  // État du voyant actif — géré localement pour permettre le clic libre
  const [activeVoyant, setActiveVoyant] = useState(null)

  // Quand la zone instrument-cluster est sélectionnée (révélation), allume le bon voyant
  useEffect(() => {
    if (selectedZone === 'instrument-cluster') {
      setActiveVoyant(GESTE_TO_VOYANT[gesteKey] || null)
    }
  }, [selectedZone, gesteKey])

  const mapping = GESTURE_ZONES[gesteKey]
  if (!mapping) return null

  const { view } = mapping

  function handleVoyantClick(id) {
    // Toggle : re-cliquer le même voyant le désélectionne
    setActiveVoyant(prev => prev === id ? null : id)
    // Sélectionner aussi la zone instrument-cluster
    onZoneClick && onZoneClick('instrument-cluster')
  }

  // Label : priorité voyant > zone
  const label = activeVoyant
    ? VOYANT_LABELS[activeVoyant]
    : selectedZone ? ZONE_LABELS[selectedZone] : null

  return (
    <div className="car-diagram">
      {view === 'interior'
        ? <InteriorSVG activeZone={selectedZone} onZoneClick={onZoneClick} activeVoyant={activeVoyant} onVoyantClick={handleVoyantClick}/>
        : <ExteriorSVG activeZone={selectedZone} onZoneClick={onZoneClick}/>
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
