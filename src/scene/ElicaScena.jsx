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
import { costruisciElica, caso, PIOLI } from './geometria-elica'
import { presenzaScena, CAMBIO_DA } from '../lib/capitoli'

/* ═══════════════════════════════════════════════════════════════
   L'ELICA
   Centotrentaquattro sfere e otto bastoncini.

   Le sfere sono grandi e di misure molto diverse. Non è vezzo: è
   quello che fa la profondità. Sfere tutte uguali a distanze
   diverse l'occhio le legge come sfere uguali lontane; sfere
   diverse a distanze diverse le legge come uno spazio. E siccome
   sono grandi si coprono a vicenda, e ogni sovrapposizione dice
   chi sta davanti e chi dietro.

   I bastoncini sono cilindri veri, orientati da una sfera
   all'altra. Costano otto matrici per fotogramma — niente — e
   sono la differenza fra due catene appese e una struttura.
   ═══════════════════════════════════════════════════════════════ */

/* La tavolozza sta fra il rosso e il giallo: niente freddi, che su
   un fondo verde scuro fanno scivolare tutto verso il grigio.

   Ma la ricchezza del fotogramma di riferimento non viene dalle
   tinte, viene dal CHIARO E SCURO: una marrone quasi nera accanto
   a una gialla accesa. Prima variavo la luminosità di sei
   centesimi e sembravano lo stesso frutto in copie; adesso di
   venti, e ogni sfera ha il suo peso. */
const FRUTTA = [
  '#FF2E14', // pomodoro maturo
  '#FF6A00', // arancia
  '#FFA607', // ambra
  '#FFC81C', // susina gialla
  '#FF8A2B', // mandarino
  '#E80F3C', // melograno
  '#FF4D18', // peperone
  '#FFD93B', // pesca gialla
  '#C25A18', // rame
  '#A8481B', // dattero
  '#C9D62A', // lime maturo
  '#8E9B24', // oliva matura
].map((c) => new THREE.Color(c))

/* i bastoncini: paglia. Una tinta sola, non devono chiedere
   attenzione — devono solo esserci. */
const PAGLIA = new THREE.Color('#DCCDA2')

/* ── i due tempi ───────────────────────────────────────────────
   ARRIVO   quante sfere ci sono. Da una ventina a centotrentaquattro.
   RADUNO   quanto sono radunate. 0 sparse, 1 composte.

   La PRIMA SCHERMATA INTERA fa solo comparire sfere: si parte da
   dieci in mezzo al nero e lo spazio si popola restando
   disordinato. Solo dopo comincia il raduno, che si prende un'altra
   schermata e settanta, e i bastoncini arrivano per ultimi.

   In numeri, sulle tre schermate e otto dell'apertura:
     0,0 → 1,0   dieci sfere che diventano cinquanta. Nessun ordine.
     1,0 → 2,3   arrivano le altre mentre le prime si radunano.
     2,3 → 2,7   ci sono tutte, l'elica si chiude, crescono i pioli.
     2,7 → 3,3   ferma e viva. È qui che compare il nome.
     3,3 → 3,8   si sfalda verso il capitolo dopo. */
function arrivo(s, cap, q) {
  if (cap === 0) return 0.20 + clamp(s / 2.30) * 0.80
  if (cap < 5) return 1
  return 0.20 + clamp(q / 0.44) * 0.80
}

function raduno(s, cap, q) {
  if (cap === 0) return clamp((s - 1.00) / 1.70)
  /* lo sgretolamento è affidato alla presenza, non al raduno:
     comincia quando comincia il capitolo dopo */
  if (cap < 5) return 1 - morbida(fascia(q, CAMBIO_DA, 1))
  return morbida(fascia(q, 0.26, 0.66))
}

/* quanto dura la comparsa di una singola sfera, in unità di arrivo */
const NASCITA = 0.11

/* riutilizzati a ogni fotogramma per i bastoncini: allocarli dentro
   il ciclo vorrebbe dire creare oggetti sessanta volte al secondo */
const _a = new THREE.Vector3()
const _b = new THREE.Vector3()
const _dir = new THREE.Vector3()
const _su = new THREE.Vector3(0, 1, 0)
const _pos = new THREE.Vector3()
const _rot = new THREE.Quaternion()
const _sc = new THREE.Vector3()
const _mat4 = new THREE.Matrix4()

export default function ElicaScena({ mouse }) {
  const gruppo = useRef()
  const rete = useRef()
  const barre = useRef()
  const inclina = useRef({ x: 0, z: 0 })

  const dati = useMemo(() => costruisciElica(quantita()), [])
  const n = dati.n

  /* carattere di ogni sfera: fase del galleggiamento e curva del
     viaggio. Il viaggio non è una retta: una retta sembra una
     macchina che consegna, una curva sembra attrazione. */
  const tratti = useMemo(() => {
    const fase = new Float32Array(n)
    const curva = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      fase[i] = caso(i * 3.3 + 72) * Math.PI * 2
      curva[i * 3] = (caso(i * 9.2 + 73) - 0.5) * 4.6
      curva[i * 3 + 1] = (caso(i * 4.6 + 74) - 0.5) * 3.8
      curva[i * 3 + 2] = (caso(i * 6.8 + 75) - 0.5) * 4.6
    }
    return { fase, curva }
  }, [n])

  const base = useMemo(() => {
    const c = new Float32Array(n * 3)
    const t = new THREE.Color()
    for (let i = 0; i < n; i++) {
      t.copy(FRUTTA[Math.floor(caso(i * 5.1 + 81) * FRUTTA.length) % FRUTTA.length])
      /* venti centesimi di scarto sul chiaro: è questo a dare la
         varietà, non il numero di tinte in tavolozza */
      t.offsetHSL((caso(i * 2.7 + 84) - 0.5) * 0.03, 0.10, (caso(i * 6.1 + 85) - 0.5) * 0.20)
      const v = 1.06 + caso(i * 3.9 + 83) * 0.16
      c[i * 3] = t.r * v; c[i * 3 + 1] = t.g * v; c[i * 3 + 2] = t.b * v
    }
    return c
  }, [n])

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

    const bb = barre.current
    if (bb) {
      for (let i = 0; i < PIOLI; i++) bb.setColorAt(i, PAGLIA)
      if (bb.instanceColor) bb.instanceColor.needsUpdate = true
    }
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

    const { caos, elica, misura, nascita, ritardo } = dati
    const { fase, curva } = tratti
    const mat = m.instanceMatrix.array

    for (let i = 0; i < n; i++) {
      const j = i * 3
      const o = i * 16

      /* nata o no: chi non è ancora arrivata ha misura zero */
      const nato = clamp((a - nascita[i]) / NASCITA)
      if (nato <= 0) { mat[o] = 0; mat[o + 5] = 0; mat[o + 10] = 0; continue }
      const vn = morbida(nato)

      const t = morbida(clamp((r - ritardo[i]) / (1 - ritardo[i])))
      const u = 1 - t

      const ax = caos[j], ay = caos[j + 1], az = caos[j + 2]
      const bx = elica[j], by = elica[j + 1], bz = elica[j + 2]
      const cx = (ax + bx) * 0.5 + curva[j]
      const cy = (ay + by) * 0.5 + curva[j + 1]
      const cz = (az + bz) * 0.5 + curva[j + 2]
      const w0 = u * u, w1 = 2 * u * t, w2 = t * t

      /* Il galleggiamento: forte da sparse, e a posto NON nullo.
         Una figura composta e perfettamente immobile sembra un
         rendering; con un respiro di 0,07 sembra tenuta insieme
         da qualcosa. È la differenza fra ferma e viva. */
      const vita = 0.26 * (1 - t) + 0.07
      const fuori = 1 + (1 - vn) * 0.16
      const px = (ax * w0 + cx * w1 + bx * w2) * fuori + Math.sin(tempo * 0.5 + fase[i]) * vita
      const py = (ay * w0 + cy * w1 + by * w2) * fuori + Math.cos(tempo * 0.42 + fase[i]) * vita
      const pz = (az * w0 + cz * w1 + bz * w2) * fuori + Math.sin(tempo * 0.46 + fase[i] * 1.4) * vita

      const s = misura[i] * inScena * vn
      mat[o] = s; mat[o + 5] = s; mat[o + 10] = s
      mat[o + 12] = px; mat[o + 13] = py; mat[o + 14] = pz
    }
    m.instanceMatrix.needsUpdate = true

    /* ── i bastoncini ──────────────────────────────────────────
       Ognuno cresce dalla propria metà verso le due estremità, e
       quelli al centro dell'elica partono per primi: la struttura
       si costruisce dal mezzo. Prima di essere cresciuti hanno
       lunghezza zero, cioè non ci sono. */
    const bb = barre.current
    if (bb) {
      const { pA, pB, pRitardo } = dati
      for (let i = 0; i < PIOLI; i++) {
        const cresce = morbida(clamp((r - pRitardo[i]) / 0.22))
        if (cresce <= 0.001) {
          _mat4.makeScale(0, 0, 0)
          bb.setMatrixAt(i, _mat4)
          continue
        }
        _a.set(pA[i * 3], pA[i * 3 + 1], pA[i * 3 + 2])
        _b.set(pB[i * 3], pB[i * 3 + 1], pB[i * 3 + 2])
        /* respirano insieme alle sfere, se no la struttura sembra
           un modellino incollato mentre tutto il resto vibra */
        const w = Math.sin(tempo * 0.5 + i * 1.7) * 0.05
        _a.y += w; _b.y -= w
        _pos.addVectors(_a, _b).multiplyScalar(0.5)
        _dir.subVectors(_b, _a)
        const lungo = _dir.length()
        _dir.normalize()
        _rot.setFromUnitVectors(_su, _dir)
        _sc.set(0.042 * inScena, lungo * cresce, 0.042 * inScena)
        _mat4.compose(_pos, _rot, _sc)
        bb.setMatrixAt(i, _mat4)
      }
      bb.instanceMatrix.needsUpdate = true
    }

    /* ── l'insieme ── */
    /* Da sparse non gira. Un campo con questa profondità, se ruota,
       si vede ruotare: le lontane strisciano di traverso e lo
       spazio diventa una giostra. La rotazione entra man mano che
       si raduna, e sull'elica composta è quella di sempre. */
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
    const bx2 = schermo.stretto ? 0 : (cap === 0 ? 2.7 * r : 2.7)
    const bs = schermo.stretto ? 0.40 : 1
    gr.position.x += (bx2 - gr.position.x) * kx
    gr.position.y += (scena.alto - gr.position.y) * kx
    gr.scale.setScalar(gr.scale.x + (bs - gr.scale.x) * kx)
  })

  return (
    <group ref={gruppo}>
      <instancedMesh ref={rete} args={[undefined, undefined, n]} frustumCulled={false}>
        {/* Sfere grandi: qui i poligoni contano. A quattordici
            spicchi il bordo si vedeva sfaccettato quando una
            riempie mezzo schermo. Sono centotrentaquattro, non
            seicentosessanta: il conto se lo può permettere. */}
        <sphereGeometry args={[1, 28, 20]} />
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

      <instancedMesh ref={barre} args={[undefined, undefined, PIOLI]} frustumCulled={false}>
        {/* cilindro di raggio e altezza uno: la matrice lo allunga
            e lo orienta da una sfera all'altra */}
        <cylinderGeometry args={[1, 1, 1, 10, 1]} />
        <meshPhysicalMaterial
          roughness={0.42}
          metalness={0}
          clearcoat={0.35}
          envMapIntensity={1.0}
          sheen={0.3}
        />
      </instancedMesh>
    </group>
  )
}
