import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scroll, stato, clamp, morbida, mescola } from '../lib/scroll'
import { schermo, scena } from '../lib/schermo'
import { presenzaScena } from '../lib/capitoli'
import { STRUMENTI_3D, ORDINE_3D } from './strumenti3d'

/* ═══════════════════════════════════════════════════════════════
   LA VETRINA
   Una colonna con un cuscino sopra, un fascio di luce che sale
   dalla base del cuscino, e dentro il fascio l'oggetto — che non
   è appoggiato lì, è generato dalla luce.

   È il gesto del museo: l'oggetto sotto la campana di vetro, il
   faretto che lo isola dal resto della sala. Solo che la campana
   non c'è, e l'oggetto non c'è nemmeno — c'è la luce che lo
   disegna, e cambia quando cambi voce col cursore.

   Perché qui e non le particelle: le particelle sono la materia
   del sito, servono a dire "disordine che diventa ordine". Uno
   strumento non è disordine che diventa ordine, è un oggetto
   preciso, e disegnarlo a puntini lo rendeva un'illustrazione
   fatta con lo strumento sbagliato. La colonna invece dice
   un'altra cosa, che è vera: questa roba qui in giro non ce l'ha
   nessuno, guardatela.

   La colonna e il cuscino sono della stessa materia delle sfere —
   stesso materiale fisico, stessa velatura lucida — perché la
   scena deve restare una sola. L'ologramma no: quello è luce.
   ═══════════════════════════════════════════════════════════════ */

const OCRA = new THREE.Color('#E8A33A')
const LUCE = new THREE.Color('#FFC978')

/* Quanto è presente la vetrina, e quanto è "acceso" l'ologramma.
   Sono due cose diverse: la colonna c'è per tutto il capitolo, e
   sopra ci compare qualcosa solo se punti una voce. */
function apparizione(cap, q) {
  return presenzaScena('vetrina', cap, q)
}

/* un pezzo dell'oggetto: la forma giusta con le sue misure.
   Il materiale arriva da fuori come oggetto già costruito e
   condiviso fra tutti i pezzi: uno shader solo per tutta la
   vetrina invece di uno per pezzo. */
function Pezzo({ d, mat }) {
  const rot = d.r || [0, 0, 0]
  const sc = d.f === 'sfera' ? [1, d.m[1], 1] : [1, 1, 1]
  return (
    <mesh position={d.p} rotation={rot} scale={sc} material={mat}>
      {d.f === 'scatola' && <boxGeometry args={d.m} />}
      {d.f === 'cilindro' && <cylinderGeometry args={[d.m[0], d.m[1], d.m[2], 14, 1]} />}
      {d.f === 'sfera' && <sphereGeometry args={[d.m[0], 18, 14]} />}
      {d.f === 'anello' && <torusGeometry args={[d.m[0], d.m[1], 8, 30, d.m[2] * Math.PI * 2]} />}
    </mesh>
  )
}

export default function Vetrina() {
  const gruppo = useRef()
  const oggetto = useRef()
  const fascio = useRef()
  const alone = useRef()
  const lampada = useRef()

  /* Quale strumento è disegnato adesso. Questo deve passare da
     React — è l'unica cosa della scena che cambia la geometria, e
     la geometria la costruisce React. Tutto il resto (opacità,
     scala, rotazione) si scrive a mano nel ciclo, che è il motivo
     per cui questo sito non ridisegna mai niente scorrendo. */
  const [mostrato, setMostrato] = useState(-1)
  const quale = useRef(-1)
  const vivo = useRef(0)
  const uscita = useRef(0)

  /* i materiali si costruiscono una volta sola: crearli dentro il
     ciclo di disegno vorrebbe dire ricompilare uno shader per
     fotogramma, che è il modo più veloce per fare inginocchiare
     una scheda grafica */
  const matColonna = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#1A2B22', roughness: 0.42, metalness: 0.05,
    clearcoat: 0.5, clearcoatRoughness: 0.35, envMapIntensity: 0.9,
  }), [])

  const matCuscino = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#3A1E14', roughness: 0.95, metalness: 0,
    sheen: 1, sheenRoughness: 0.35, sheenColor: new THREE.Color('#C6702E'),
    envMapIntensity: 0.5,
  }), [])

  /* L'ologramma: emissivo, semitrasparente, e senza scrittura sul
     buffer di profondità. Quest'ultima è la riga che fa la
     differenza: senza, i pezzi trasparenti si nascondono a vicenda
     a seconda dell'ordine in cui capita di disegnarli, e l'oggetto
     lampeggia mentre gira. */
  const matOlo = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFB44E', emissive: new THREE.Color('#FF9A2E'), emissiveIntensity: 0.8,
    roughness: 0.3, metalness: 0.1,
    transparent: true, opacity: 0.2, depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [])

  /* la seconda passata a fil di ferro: è quella che lo fa leggere
     come proiezione e non come oggetto di plastica arancione */
  const matFilo = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#FFE2B4', wireframe: true,
    transparent: true, opacity: 0.34, depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [])

  /* Il fascio non può essere una tinta piatta: un cono di colore
     uniforme è un cono, non un fascio. Serve che si spenga salendo,
     e in un materiale semplice l'unico modo senza scrivere uno
     shader è dipingere i vertici — bianco in basso, nero in alto,
     e il colore per vertice fa da maschera. */
  const geoFascio = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.95, 0.26, 2.7, 36, 12, true)
    const pos = g.attributes.position
    const col = new Float32Array(pos.count * 3)
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) / 2.7 + 0.5          // 0 in basso, 1 in alto
      const f = Math.pow(1 - y, 1.8) * 0.9 + 0.05
      col[i * 3] = f; col[i * 3 + 1] = f; col[i * 3 + 2] = f
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  }, [])

  const matFascio = useMemo(() => new THREE.MeshBasicMaterial({
    color: LUCE, vertexColors: true,
    transparent: true, opacity: 0.05,
    depthWrite: false, side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  }), [])

  const matAlone = useMemo(() => new THREE.MeshBasicMaterial({
    color: OCRA, transparent: true, opacity: 0.5,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }), [])

  useFrame(({ clock }, dt) => {
    const gr = gruppo.current
    if (!gr) return
    const cap = scroll.capitolo
    const presenza = apparizione(cap, scroll.q)
    gr.visible = presenza > 0.01
    if (!gr.visible) return

    const tempo = clock.elapsedTime

    /* ── quale oggetto, e il cambio ──────────────────────────────
       Cambiando voce l'ologramma non si sostituisce di scatto: si
       spegne, cambia, si riaccende. Un ologramma che salta da un
       oggetto all'altro è un cambio di diapositiva; uno che si
       spegne e si riaccende è la luce che ridisegna. */
    const voluto = stato.strumento
    if (voluto !== quale.current) uscita.current = 1

    const bersaglio = uscita.current > 0 ? 0 : (quale.current >= 0 ? 1 : 0)
    const k = 1 - Math.exp(-dt * 6.5)
    vivo.current += (bersaglio - vivo.current) * k

    /* quando si è spento del tutto, si cambia oggetto e si
       riaccende: mai due sagome sovrapposte a mezza luce */
    if (uscita.current > 0 && vivo.current < 0.03) {
      quale.current = voluto
      uscita.current = 0
      setMostrato(voluto)
    }
    const v = clamp(vivo.current)

    /* ── l'oggetto ── */
    const og = oggetto.current
    if (og) {
      og.visible = mostrato >= 0 && v > 0.01
      if (og.visible) {
        /* gira piano su sé stesso e galleggia: fermo sembrerebbe
           una figura incollata sullo sfondo */
        og.rotation.y = tempo * 0.34
        og.position.y = 0.34 + Math.sin(tempo * 0.9) * 0.045
        /* nasce dal basso: mentre compare è schiacciato e sale,
           come se la luce lo stesse costruendo dal piano */
        const m = morbida(v)
        og.scale.set(m, m * m, m)
      }
    }

    /* ── il fascio ── */
    if (fascio.current) {
      const acceso = mescola(0.5, 1, v)
      fascio.current.scale.set(acceso, 1, acceso)
      /* il tremolio: un fascio perfettamente stabile sembra un
         solido, uno che respira sembra luce nell'aria */
      fascio.current.material.opacity = (0.022 + 0.030 * v) * presenza
        * (0.84 + Math.sin(tempo * 1.7) * 0.16)
    }
    if (alone.current) {
      alone.current.material.opacity = (0.16 + 0.26 * v) * presenza
    }
    if (lampada.current) {
      lampada.current.intensity = (5 + 20 * v) * presenza
    }

    /* ── l'insieme ── */
    /* sta a destra come tutto il resto della scena, e in verticale
       sale nella fascia alta con il testo sotto */
    const kx = 1 - Math.exp(-dt * 3)
    const bx = schermo.stretto ? 0 : 3.3
    const by = (schermo.stretto ? scena.alto - 0.5 : -1.45)
    gr.position.x += (bx - gr.position.x) * kx
    gr.position.y += (by - gr.position.y) * kx
    const bs = (schermo.stretto ? 0.62 : 1) * mescola(0.86, 1, presenza)
    gr.scale.setScalar(gr.scale.x + (bs - gr.scale.x) * kx)
  })

  const pezzi = mostrato >= 0 ? STRUMENTI_3D[ORDINE_3D[mostrato]] : null

  return (
    <group ref={gruppo} visible={false}>
      {/* ── la colonna ── */}
      <mesh position={[0, -1.25, 0]} material={matColonna}>
        <cylinderGeometry args={[0.6, 0.74, 2.3, 40, 1]} />
      </mesh>
      {/* il collarino sotto il cuscino: senza, la colonna sembra
          un tubo tagliato */}
      <mesh position={[0, -0.06, 0]} material={matColonna}>
        <cylinderGeometry args={[0.78, 0.68, 0.14, 40, 1]} />
      </mesh>

      {/* ── il cuscino ── */}
      <mesh position={[0, 0.05, 0]} material={matCuscino}>
        <sphereGeometry args={[0.62, 32, 20]} />
      </mesh>
      <mesh position={[0, 0.05, 0]} scale={[1, 0.34, 1]} material={matCuscino}>
        <sphereGeometry args={[0.62, 32, 20]} />
      </mesh>

      {/* ── la luce che sale dal cuscino ── */}
      <pointLight ref={lampada} position={[0, 0.35, 0]} color={LUCE} distance={7} intensity={6} />
      {/* l'alone sul cuscino: un disco piatto che finge il punto
          da cui la luce esce */}
      <mesh ref={alone} position={[0, 0.24, 0]} rotation={[-Math.PI / 2, 0, 0]} material={matAlone}>
        <circleGeometry args={[0.5, 32]} />
      </mesh>
      {/* il fascio: un tronco di cono che si apre verso l'alto */}
      <mesh ref={fascio} position={[0, 1.5, 0]} geometry={geoFascio} material={matFascio} />

      {/* ── l'ologramma ── */}
      <group ref={oggetto} visible={false}>
        {pezzi?.map((d, i) => (
          <group key={i}>
            <Pezzo d={d} mat={matOlo} />
            <Pezzo d={d} mat={matFilo} />
          </group>
        ))}
      </group>
    </group>
  )
}
