import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scroll, stato, clamp, fascia, morbida, mescola } from '../lib/scroll'
import { schermo, scena, quantita } from '../lib/schermo'
import { presenzaScena } from '../lib/capitoli'
import {
  costruisciDisegni, sparso, PUNTI_DISEGNO,
  DISEGNI_STRUMENTI, DISEGNI_AREE,
} from './disegni'

/* ═══════════════════════════════════════════════════════════════
   IL DISEGNO
   Novecento punti che compongono l'illustrazione di quello che il
   cursore sta indicando. Passi sopra "plicometro" e i punti si
   riorganizzano in un plicometro; passi su "colon irritabile" e
   diventano un intestino.

   Il passaggio da un disegno all'altro non è una dissolvenza: ogni
   punto viaggia dalla sua vecchia posizione alla nuova, con un
   piccolo ritardo suo. Sembra che il disegno si ridisegni da solo.
   ═══════════════════════════════════════════════════════════════ */

const CREMA = new THREE.Color('#F2EFE1')
const ORO = new THREE.Color('#E8A33A')

/* ── i due tempi, come nell'elica ──────────────────────────────
   Vale qui la stessa cosa che vale per l'apertura: le particelle
   devono essere sparse PRIMA di compattarsi, e sparse vuol dire
   poche e larghe, non tante e strette.

   ARRIVO   quanti punti ci sono, lungo il primo terzo del capitolo
   COMPONE  quanto sono radunati nel disegno

   Prima erano milleduecento punti presenti dal primo fotogramma
   che si spostavano da una figura all'altra: non c'era nessun
   momento in cui la scena fosse disordinata. */
function arrivo(cap, q) {
  if (cap !== 2 && cap !== 3) return 1
  return 0.06 + clamp(q / 0.42) * 0.94
}
function compone(cap, q) {
  if (cap !== 2 && cap !== 3) return 1
  return morbida(clamp((q - 0.16) / 0.40))
}
/* quanto dura la comparsa di un singolo punto */
const NASCITA = 0.12

/* Quale disegno tocca a questo punto del sito. Gli indici sono
   quelli dei capitoli in lib/capitoli.js: se se ne aggiunge uno,
   si aggiorna qui e basta. */
function quale() {
  const c = scroll.capitolo
  if (c === 2) return DISEGNI_STRUMENTI[clamp(stato.strumento, 0, 4)]
  /* In "la tua condizione" i punti restano sparsi finché non si
     punta una voce: stato.area vale -1 e il disegno non si compone.
     È il gesto che voleva il committente — a mouse fermo la scena
     respira, a mouse su una voce prende forma. */
  if (c === 3) return stato.area >= 0 ? DISEGNI_AREE[clamp(stato.area, 0, 3)] : 'sparso'
  return null
}

export default function Disegno({ mouse }) {
  const gruppo = useRef()
  const rete = useRef()
  const inclina = useRef({ x: 0, z: 0 })

  /* meno punti sui telefoni: il tratto resta continuo fino a
     circa quattrocento, sotto comincia a punteggiarsi */
  const n = useMemo(() => Math.max(430, Math.round(PUNTI_DISEGNO * quantita())), [])
  const fissi = useMemo(() => costruisciDisegni(n), [n])

  /* il disegno da cui si parte, quello a cui si arriva, e il cammino */
  const da = useRef(new Float32Array(n * 3))
  const a = useRef(fissi[DISEGNI_STRUMENTI[0]])
  const nome = useRef(DISEGNI_STRUMENTI[0])
  const avanzamento = useRef(1)
  const disperso = useMemo(() => sparso(n), [n])

  const tratti = useMemo(() => {
    const r = new Float32Array(n)
    const f = new Float32Array(n)
    const nascita = new Float32Array(n)
    /* la bombatura: passando da un disegno all'altro i punti non
       vanno in linea retta, escono in fuori e rientrano. È il
       tratto che fa sembrare che il disegno si sfaldi e si
       ricomponga invece di scivolare */
    const curva = new Float32Array(n * 3)
    const caso = (k) => { const x = Math.sin(k) * 43758.5453; return x - Math.floor(x) }
    for (let i = 0; i < n; i++) {
      r[i] = caso(i * 78.233) * 0.34
      f[i] = i * 0.31
      nascita[i] = caso(i * 12.9898 + 4.1)
      curva[i * 3] = (caso(i * 9.21 + 11) - 0.5) * 3.4
      curva[i * 3 + 1] = (caso(i * 4.63 + 12) - 0.5) * 2.8
      curva[i * 3 + 2] = (caso(i * 6.81 + 13) - 0.5) * 1.6
    }
    return { r, f, nascita, curva }
  }, [n])

  useLayoutEffect(() => {
    const m = rete.current
    if (!m) return
    m.instanceMatrix.array.fill(0)
    const c = new THREE.Color()
    for (let i = 0; i < n; i++) {
      m.instanceMatrix.array[i * 16 + 15] = 1
      c.copy(CREMA).lerp(ORO, 0.18 + 0.5 * (i % 7 === 0 ? 1 : 0))
      m.setColorAt(i, c)
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    da.current.set(a.current)
  }, [n])

  useFrame(({ clock }, dt) => {
    const m = rete.current
    const gr = gruppo.current
    if (!m || !gr) return
    const tempo = clock.elapsedTime
    const capOra = scroll.capitolo
    const presenza = presenzaScena('disegno', capOra, scroll.q)
    const arr = arrivo(capOra, scroll.q)
    const comp = compone(capOra, scroll.q)
    gr.visible = presenza > 0.01
    if (!gr.visible) return

    /* cambio di disegno: si congela dove sono i punti adesso
       e si riparte da lì, così il passaggio non ha scatti */
    const voluto = quale()
    if (voluto && voluto !== nome.current) {
      const mat = m.instanceMatrix.array
      for (let i = 0; i < n; i++) {
        da.current[i * 3] = mat[i * 16 + 12]
        da.current[i * 3 + 1] = mat[i * 16 + 13]
        da.current[i * 3 + 2] = mat[i * 16 + 14]
      }
      nome.current = voluto
      a.current = voluto === 'sparso' ? disperso : fissi[voluto]
      avanzamento.current = 0
    }
    avanzamento.current = Math.min(1, avanzamento.current + dt / 0.85)
    const T = avanzamento.current

    const A = da.current, B = a.current
    const D = disperso
    const { r: rit, f: fasi, nascita, curva } = tratti
    const mat = m.instanceMatrix.array
    for (let i = 0; i < n; i++) {
      const j = i * 3
      const o = i * 16

      /* nato o no: chi non è ancora arrivato ha misura zero */
      const nato = clamp((arr - nascita[i]) / NASCITA)
      if (nato <= 0) { mat[o] = 0; mat[o + 5] = 0; mat[o + 10] = 0; continue }
      const vn = morbida(nato)

      const t = morbida(fascia(T, rit[i], rit[i] + 0.66))
      const u = 1 - t
      /* il punto dentro il disegno, con la bombatura a metà strada */
      const arco = u * t * 2
      const dx = A[j] * u + B[j] * t + curva[j] * arco
      const dy = A[j + 1] * u + B[j + 1] * t + curva[j + 1] * arco
      const dz = A[j + 2] * u + B[j + 2] * t + curva[j + 2] * arco

      /* e poi quanto è radunato: k = 0 sta nella nuvola larga,
         k = 1 sta nel disegno. Mentre nasce sta ancora in fuori. */
      const k = comp * vn
      const q1 = 1 - k
      const sciolto = nome.current === 'sparso' ? 1 : 0
      /* composto ma non congelato: 0,03 di respiro basta a
         far sembrare il disegno tenuto insieme e non stampato.
         Da sparso il respiro è dieci volte tanto. */
      const vita = 0.055 * (1 - t) + 0.03 + (sciolto + q1) * 0.15
      const x = D[j] * q1 + dx * k + Math.sin(tempo * 0.7 + fasi[i]) * vita
      const y = D[j + 1] * q1 + dy * k + Math.cos(tempo * 0.62 + fasi[i]) * vita
      const z = D[j + 2] * q1 + dz * k

      /* i punti nascono piccoli e prendono corpo: è quello a dare
         l'impressione che il disegno si scriva invece di apparire.
         La misura è calcolata: a questa distanza un raggio di 0,019
         vale poco più di quattro pixel. Il doppio, e il tratto
         sembrava fatto di salsicce. */
      /* Da sparsi sono grossi tre volte e mezzo, composti tornano
         fini. Il disegno tecnico ha bisogno di un tratto sottile —
         a raggio doppio sembrava fatto di salsicce — ma una nuvola
         di punti da un pixel non è una nuvola di particelle, è
         polvere: non si legge come materia che si raduna. La misura
         cambia mentre si compone, e il rimpicciolirsi fa parte del
         gesto. */
      const s = (0.019 + 0.009 * t * k) * (1 + (1 - k) * 2.5) * presenza * vn
      mat[o] = s; mat[o + 5] = s; mat[o + 10] = s
      mat[o + 12] = x; mat[o + 13] = y; mat[o + 14] = z
    }
    m.instanceMatrix.needsUpdate = true

    /* sul computer il disegno sta a destra, dove non c'è il testo;
       sul telefono sale nella fascia alta e il testo gli scorre sotto */
    const cap = scroll.capitolo
    const q = morbida(scroll.q)
    /* come per l'elica: sparso sta al centro e prende tutto lo
       schermo, composto si sposta a destra a lasciare il testo */
    const px = schermo.stretto ? 0 : 3.25 * (0.25 + 0.75 * comp)
    const k = 1 - Math.exp(-dt * 3)
    gr.position.x += (px - gr.position.x) * k
    gr.position.y += (scena.alto + Math.sin(tempo * 0.35) * 0.09 - gr.position.y) * k

    /* Sul computer il disegno accompagna il testo, non lo annuncia:
       a 0,78 l'occhio ci andava per primo e poi tornava indietro a
       leggere. Un quarto in meno e l'ordine si inverte. */
    const bersaglioS = schermo.stretto ? 0.74 : 0.60
    gr.scale.setScalar(gr.scale.x + (bersaglioS - gr.scale.x) * k)

    /* al tocco non c'è cursore: l'inclinazione si spegne da sola */
    const mx = schermo.tocco ? 0 : (mouse?.current?.x ?? 0)
    const my = schermo.tocco ? 0 : (mouse?.current?.y ?? 0)
    const kk = 1 - Math.exp(-dt * 2.4)
    inclina.current.x += (my * 0.16 - inclina.current.x) * kk
    inclina.current.z += (mx * 0.10 - inclina.current.z) * kk
    gr.rotation.x = inclina.current.x
    /* una rotazione appena accennata: il disegno deve restare leggibile,
       non fare la giostra */
    gr.rotation.y = mx * 0.24 + Math.sin(tempo * 0.28) * 0.05
    gr.rotation.z = inclina.current.z * 0.35
  })

  return (
    <group ref={gruppo}>
      <instancedMesh ref={rete} args={[undefined, undefined, n]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 4]} />
        <meshStandardMaterial
          roughness={0.3}
          metalness={0.05}
          envMapIntensity={1.4}
          emissive="#E8A33A"
          emissiveIntensity={0.35}
        />
      </instancedMesh>
    </group>
  )
}
