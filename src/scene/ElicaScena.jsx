import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scroll, clamp, fascia, morbida } from '../lib/scroll'
import { schermo, scena, quantita } from '../lib/schermo'
/* I nomi di questi due file sono scelti per non somigliarsi:
   "ElicaScena" il componente, "geometria-elica" i dati. Su Windows
   e macOS i nomi dei file non distinguono maiuscole da minuscole,
   e quando il componente si chiamava Elica.jsx un import di './elica'
   finiva per risolvere al file sbagliato. La pagina restava sullo
   spinner senza un errore in console e con una richiesta 503 che si
   vedeva solo guardando la rete. */
import { costruisciElica, caso } from './geometria-elica'
import { presenzaScena, CAMBIO_DA } from '../lib/capitoli'

/* ═══════════════════════════════════════════════════════════════
   L'ELICA
   Sfere vere, non ritagli fotografici. Geometria con materiale
   fisico: reagiscono alle luci, hanno un riflesso speculare e una
   velatura lucida sopra, e il bagliore le prende sui bordi.

   I ritagli di frutta erano immagini piatte con la luce bianca
   dello studio fotografico appiccicate su una scena verde scura:
   qualunque cosa gli si facesse restavano ritagli. Le sfere invece
   stanno dentro la scena perché sono fatte della stessa materia.

   Due misure, come nel logo: poche grandi sui filamenti — al posto
   dei frutti — e tante piccole a formare le corde e i pioli.
   ═══════════════════════════════════════════════════════════════ */

/* I colori sono quelli della frutta vera del logo, presi a occhio
   dall'immagine: pomodoro, pomodorino giallo, arancia, mela verde,
   mirtillo, melograno, dattero. Le sfere grandi ne pescano uno a
   testa — è questo che fa sembrare l'elica fatta di cibo invece che
   di biglie tutte uguali. */
/* Tutta la tavolozza sta fra il rosso e il giallo, con una sola
   incursione nel verde-lime — che è comunque un giallo che tende.
   Il mirtillo blu è uscito: era l'unico colore freddo e faceva
   scivolare l'insieme verso il grigio. Il fondo è verde scuro,
   e su un fondo freddo servono colori caldi, non equilibrati. */
const FRUTTA = [
  '#FF2E14', // pomodoro maturo
  '#FF6A00', // arancia
  '#FFA607', // ambra
  '#FFC81C', // susina gialla
  '#FF8A2B', // mandarino
  '#E80F3C', // melograno
  '#FF4D18', // peperone
  '#FFD93B', // pesca gialla
  '#F2701A', // rame
  '#C9D62A', // lime maturo — l'unico che tende al verde
].map((c) => new THREE.Color(c))

/* i chicchi: grano, avena, sesamo. Poca varietà, tutta calda. */
const CHICCHI = ['#F3D9A0', '#E8C482', '#FBEDCB', '#DCB870']
  .map((c) => new THREE.Color(c))

/* ── i due tempi dell'apertura ─────────────────────────────────
   Sono due, non uno, e prima erano confusi in uno solo.

   ARRIVO   quante sfere ci sono. Si parte da quattro in mezzo al
            nero e si arriva a seicentosessanta.
   RADUNO   quanto sono radunate. 0 sparse, 1 composte.

   Il primo mezzo schermo di rotellina fa solo comparire sfere: lo
   spazio si popola e resta disordinato. Poi, mentre le ultime
   arrivano, comincia il raduno. Il conto è preso dal video di
   riferimento: là il vuoto dura per il primo settimo, la nuvola è
   piena a metà strada, e la figura è composta poco dopo.

   Prima c'era solo il raduno, e le sfere c'erano tutte dall'inizio:
   si vedeva uno sciame che si stringe. Un vuoto che si popola è
   un'altra cosa. */
function arrivo(s, cap, q) {
  /* mai zero: a rotellina ferma devono esserci già quelle quattro
     sfere, se no il primo schermo del sito è nero e basta */
  if (cap === 0) return 0.36 + clamp(s / 1.30) * 0.64
  if (cap < 5) return 1
  return 0.36 + clamp(q / 0.42) * 0.64
}

/* Il raduno parte in ritardo sull'arrivo e finisce a 1,40
   schermate, che è esattamente quando compare il nome. Va LINEARE
   con lo scorrimento, non ammorbidito: con una curva a S sembrava
   scattare al superamento di una soglia invisibile invece di
   seguire la rotellina. */
function raduno(s, cap, q) {
  if (cap === 0) return clamp((s - 0.55) / 0.85)
  /* lo sgretolamento è affidato alla presenza, non al raduno:
     comincia quando comincia il capitolo dopo */
  if (cap < 5) return 1 - morbida(fascia(q, CAMBIO_DA, 1))
  return morbida(fascia(q, 0.26, 0.66))
}

/* quanto dura la comparsa di una singola sfera, in unità di arrivo */
const NASCITA = 0.11

export default function ElicaScena({ mouse }) {
  const gruppo = useRef()
  const rete = useRef()
  const inclina = useRef({ x: 0, z: 0 })

  const dati = useMemo(() => costruisciElica(quantita()), [])
  const nF = dati.nF, nC = dati.nC
  const n = nF + nC

  /* un solo insieme: le prime nF sono le grandi, le altre le piccole.
     Un solo disegno per la scheda grafica invece di ventotto. */
  const forme = useMemo(() => {
    const caosP = new Float32Array(n * 3)
    const eliP = new Float32Array(n * 3)
    const raggio = new Float32Array(n)
    const nascita = new Float32Array(n)
    caosP.set(dati.fCaos, 0); caosP.set(dati.cCaos, nF * 3)
    eliP.set(dati.fElica, 0); eliP.set(dati.cElica, nF * 3)
    nascita.set(dati.fNascita, 0); nascita.set(dati.cNascita, nF)
    /* le grandi un filo più piccole dei frutti fotografici: una sfera
       piena occupa più spazio visivo di un ritaglio con l'alone */
    for (let i = 0; i < nF; i++) raggio[i] = dati.fMisura[i] * 0.40
    for (let i = 0; i < nC; i++) raggio[nF + i] = dati.cMisura[i] * 0.52
    return { caosP, eliP, raggio, nascita }
  }, [dati, n, nF, nC])

  /* carattere di ogni sfera: ritardo, deriva, curva del viaggio */
  const tratti = useMemo(() => {
    const ritardo = new Float32Array(n)
    const fase = new Float32Array(n)
    const curva = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      /* ritardi piccoli: con ritardi grandi le sfere partono
         a ondate e il legame con la rotellina si perde */
      ritardo[i] = caso(i * 2.2 + 71) * 0.14
      fase[i] = caso(i * 3.3 + 72) * Math.PI * 2
      curva[i * 3] = (caso(i * 9.2 + 73) - 0.5) * 4.2
      curva[i * 3 + 1] = (caso(i * 4.6 + 74) - 0.5) * 3.6
      curva[i * 3 + 2] = (caso(i * 6.8 + 75) - 0.5) * 4.2
    }
    return { ritardo, fase, curva }
  }, [n])

  /* Ogni sfera grande è un frutto diverso, ogni chicco un cereale.
     Con due soli colori l'elica sembrava fatta di biglie: la varietà
     non è decorazione, è quello che la fa leggere come cibo. */
  const base = useMemo(() => {
    const c = new Float32Array(n * 3)
    const t = new THREE.Color()
    for (let i = 0; i < n; i++) {
      if (i < nF) {
        t.copy(FRUTTA[Math.floor(caso(i * 5.1 + 81) * FRUTTA.length) % FRUTTA.length])
        /* i frutti vicini fra loro non devono essere gemelli */
        t.offsetHSL((caso(i * 2.7 + 84) - 0.5) * 0.025, 0.12, (caso(i * 6.1 + 85) - 0.5) * 0.06)
      } else {
        t.copy(CHICCHI[Math.floor(caso(i * 7.3 + 82) * CHICCHI.length) % CHICCHI.length])
        t.offsetHSL(0, 0.06, (caso(i * 4.3 + 86) - 0.5) * 0.07)
      }
      const v = 1.10 + caso(i * 3.9 + 83) * 0.20
      c[i * 3] = t.r * v; c[i * 3 + 1] = t.g * v; c[i * 3 + 2] = t.b * v
    }
    return c
  }, [n, nF])

  useLayoutEffect(() => {
    const m = rete.current
    if (!m) return
    m.instanceMatrix.array.fill(0)
    const c = new THREE.Color()
    for (let i = 0; i < n; i++) {
      m.instanceMatrix.array[i * 16 + 15] = 1
      c.setRGB(base[i * 3], base[i * 3 + 1], base[i * 3 + 2])
      m.setColorAt(i, c)
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [n, base])

  useFrame(({ clock }, dt) => {
    const m = rete.current
    const gr = gruppo.current
    if (!m || !gr) return
    const tempo = clock.elapsedTime
    const cap = scroll.capitolo
    const r = raduno(scroll.schermate, cap, scroll.q)
    const a = arrivo(scroll.schermate, cap, scroll.q)
    const inScena = presenzaScena('elica', cap, scroll.q)
    gr.visible = inScena > 0.01
    if (!gr.visible) return

    const { caosP, eliP, raggio, nascita } = forme
    const { ritardo, fase, curva } = tratti
    const mat = m.instanceMatrix.array

    for (let i = 0; i < n; i++) {
      const j = i * 3
      /* nata o no. Chi non è ancora nata ha misura zero: c'è
         nell'elenco ma non si vede, e non costa niente. */
      const nato = clamp((a - nascita[i]) / NASCITA)
      if (nato <= 0) { mat[i * 16] = 0; mat[i * 16 + 5] = 0; mat[i * 16 + 10] = 0; continue }
      const vn = morbida(nato)

      const t = morbida(clamp((r - ritardo[i]) / (1 - ritardo[i])))
      const u = 1 - t

      const ax = caosP[j], ay = caosP[j + 1], az = caosP[j + 2]
      const bx = eliP[j], by = eliP[j + 1], bz = eliP[j + 2]
      const cx = (ax + bx) * 0.5 + curva[j]
      const cy = (ay + by) * 0.5 + curva[j + 1]
      const cz = (az + bz) * 0.5 + curva[j + 2]
      const w0 = u * u, w1 = 2 * u * t, w2 = t * t

      /* Il galleggiamento: forte da sparse, e a posto NON nullo.
         Una figura composta e perfettamente immobile sembra un
         rendering; con un respiro di 0,09 sembra tenuta insieme
         da qualcosa. È la differenza fra ferma e viva. */
      const vita = 0.26 * (1 - t) + 0.09
      /* mentre nasce sta più in fuori e scivola dentro: si entra
         in campo, non si appare sul posto */
      const fuori = 1 + (1 - vn) * 0.16
      const px = (ax * w0 + cx * w1 + bx * w2) * fuori + Math.sin(tempo * 0.5 + fase[i]) * vita
      const py = (ay * w0 + cy * w1 + by * w2) * fuori + Math.cos(tempo * 0.42 + fase[i]) * vita
      const pz = (az * w0 + cz * w1 + bz * w2) * fuori + Math.sin(tempo * 0.46 + fase[i] * 1.4) * vita

      const s = raggio[i] * inScena * vn
      const o = i * 16
      mat[o] = s; mat[o + 5] = s; mat[o + 10] = s
      mat[o + 12] = px; mat[o + 13] = py; mat[o + 14] = pz
    }
    m.instanceMatrix.needsUpdate = true

    /* ── l'insieme ── */
    /* Da sparse non gira. Un campo con questa profondità, se
       ruota, si vede ruotare: le lontane strisciano di traverso e
       lo spazio diventa una giostra. Nel video derivano appena.
       La rotazione entra man mano che si raduna, e sull'elica
       composta è quella di prima. */
    gr.rotation.y += dt * (0.012 + r * 0.148)
    const mx = schermo.tocco ? 0 : (mouse?.current?.x ?? 0)
    const my = schermo.tocco ? 0 : (mouse?.current?.y ?? 0)
    const kk = 1 - Math.exp(-dt * 2.2)
    inclina.current.x += (my * 0.10 - inclina.current.x) * kk
    inclina.current.z += (mx * 0.06 - inclina.current.z) * kk
    gr.rotation.x = inclina.current.x
    gr.rotation.z = inclina.current.z

    const kx = 1 - Math.exp(-dt * 2)
    /* Nell'apertura lo spostamento a destra segue il raduno: da
       sparse stanno al centro e occupano tutto lo schermo — il
       vuoto va riempito per intero, se no metà pagina è morta — e
       mentre si radunano scivolano a destra a fare posto al nome.
       Il compattarsi e il farsi da parte sono lo stesso gesto. */
    const bx2 = schermo.stretto ? 0 : (cap === 0 ? 3.1 * r : 3.1)
    const bs = schermo.stretto ? 0.46 : 1
    gr.position.x += (bx2 - gr.position.x) * kx
    gr.position.y += (scena.alto - gr.position.y) * kx
    gr.scale.setScalar(gr.scale.x + (bs - gr.scale.x) * kx)
  })

  return (
    <group ref={gruppo}>
      <instancedMesh ref={rete} args={[undefined, undefined, n]} frustumCulled={false}>
        <sphereGeometry args={[1, 14, 10]} />
        {/* la velatura lucida sopra è quello che le fa sembrare
            frutta e non biglie di plastica */}
        <meshPhysicalMaterial
          roughness={0.21}
          metalness={0.02}
          clearcoat={0.9}
          clearcoatRoughness={0.18}
          envMapIntensity={1.3}
          sheen={0.45}
          sheenRoughness={0.55}
        />
      </instancedMesh>
    </group>
  )
}
