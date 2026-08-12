import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, AdaptiveDpr } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import ElicaScena from './ElicaScena'
import Vetrina from './Vetrina'
import { scroll, clamp, morbida, mescola } from '../lib/scroll'
import { schermo, scena } from '../lib/schermo'

/* ═══════════════════════════════════════════════════════════════
   LA SCENA
   Sta fissa dietro tutto il sito. Non scorre: è lo scorrimento
   che la attraversa.

   Le distanze non sono a occhio. Con un obiettivo da 34 gradi
   l'altezza inquadrata vale 0,61 volte la distanza. L'elica di
   frutta è alta quasi 9 unità e ne chiede almeno 15; i disegni
   sono alti 5 e stanno comodi a 12. Ogni riga è calcolata così.
   ═══════════════════════════════════════════════════════════════ */

const INQUADRATURE = [
  { z: 13.6, y: 0.15 },   // apertura — l'elica da vicino, che deborda
  { z: 12.0, y: 0.00 },   // chi sono
  { z: 12.0, y: 0.00 },   // strumentazione
  { z: 12.0, y: 0.00 },   // condizioni
  { z: 15.5, y: 0.00 },   // prenota e recensioni — torna l'elica
]

const TANG = Math.tan((34 / 2) * Math.PI / 180)

function Telecamera() {
  useFrame(({ camera, size }, dt) => {
    const cap = scroll.capitolo
    const q = morbida(scroll.q)
    const aspetto = size.width / Math.max(1, size.height)

    let z, y
    if (schermo.stretto) {
      /* In verticale la scena non può stare accanto al testo: sale
         nella fascia alta. La distanza si ricava dalla larghezza —
         il disegno più largo misura 5,6 unità e ne vuole 6,2 con
         il margine — e non scende mai sotto 16, altrimenti in
         orizzontale diventerebbe minuscola. */
      z = Math.max(16, 6.2 / (2 * TANG * aspetto))
      y = 0
    } else if (cap === 0) {
      /* L'apertura ADDOSSA, non arretra. Prima faceva il contrario:
         partiva a 17,5 e andava a 22,5 per far stare tutta l'elica
         dentro il fotogramma. Ma un'elica che ci sta tutta comoda è
         un logo, e da lontano il filamento davanti e quello dietro
         distano uguale — cioè non c'è profondità.

         Adesso si va da diciotto e mezzo, dove il campo sparso è
         costruito, a tredici e sei, dove l'elica esce sopra e sotto
         e i due filamenti stanno a cinque unità di scarto su tredici
         di distanza. È lì che si vede chi è davanti e chi è dietro. */
      z = mescola(18.5, INQUADRATURE[0].z, morbida(clamp(scroll.q / 0.72)))
      y = mescola(-0.5, INQUADRATURE[0].y, q)
    } else {
      const A = INQUADRATURE[Math.min(INQUADRATURE.length - 1, cap)]
      const B = INQUADRATURE[Math.min(INQUADRATURE.length - 1, cap + 1)]
      z = mescola(A.z, B.z, q)
      y = mescola(A.y, B.y, q)
    }

    const k = 1 - Math.exp(-dt * 3)
    camera.position.z += (z - camera.position.z) * k
    camera.position.y += (y - camera.position.y) * k
    camera.lookAt(0, 0, 0)

    /* i due sistemi della scena leggono da qui dove possono stare */
    scena.z = camera.position.z
    scena.altezza = 2 * camera.position.z * TANG
    scena.larghezza = scena.altezza * aspetto
    scena.alto = schermo.stretto ? scena.altezza * 0.30 : 0
  })
  return null
}

/* La nebbia si dirada man mano che l'ordine si forma: il caos è
   opaco, la figura composta è nitida.

   Le distanze sono in proporzione a quanto è lontana la telecamera,
   non fisse. Con distanze fisse, su telefono — dove la telecamera
   arretra a ventidue unità per far stare la scena in verticale —
   i frutti finivano tutti oltre il fondo della nebbia, e il primo
   schermo restava vuoto. */
function Atmosfera() {
  const nebbia = useRef()
  useFrame(({ camera }) => {
    if (!nebbia.current) return
    const p = morbida(clamp(scroll.schermate / 3.4))
    const z = camera.position.z
    nebbia.current.near = z * mescola(0.45, 0.80, p)
    nebbia.current.far = z * mescola(1.90, 2.60, p)
  })
  return <fog ref={nebbia} attach="fog" args={['#04120D', 7, 23]} />
}

export default function Scena({ mouse }) {
  return (
    <Canvas
      dpr={schermo.leggero ? [1, 1.5] : [1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, -0.5, 17.5], fov: 34 }}
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
    >
      <color attach="background" args={['#04120D']} />
      <Atmosfera />
      <Telecamera />

      <ambientLight intensity={0.48} color="#FFE9C8" />
      <directionalLight position={[6, 9, 6]} intensity={2.3} color="#FFEFD0" />
      <pointLight position={[-8, -1, -4]} intensity={38} color="#FF6A1F" distance={30} />
      <pointLight position={[7, -5, 6]} intensity={16} color="#FFB35C" distance={28} />

      {/* ambiente costruito a mano: nessun file da scaricare, e i riflessi
          sui punti vengono da queste sorgenti */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3.2} color="#FFEFD6" position={[0, 7, -9]} scale={[16, 9, 1]} />
        <Lightformer form="circle" intensity={2.4} color="#FFB067" position={[-9, 2, 5]} scale={7} />
        <Lightformer form="circle" intensity={2.0} color="#FFC98A" position={[9, -2, 4]} scale={6} />
        <Lightformer form="rect" intensity={1.1} color="#2A5A44" position={[0, -8, 0]} scale={[16, 9, 1]} rotation={[Math.PI / 2, 0, 0]} />
      </Environment>

      {/* Le sfere ci sono sempre: si radunano nell'apertura, poi
          si sciolgono e restano come fondo del sito. La vetrina
          compare solo sulla strumentazione. */}
      <ElicaScena mouse={mouse} />
      <Vetrina />

      {/* il bagliore costa caro: sui dispositivi leggeri resta solo
          la vignettatura, che non pesa nulla */}
      <EffectComposer disableNormalPass multisampling={0}>
        {schermo.leggero
          ? <Vignette offset={0.28} darkness={0.74} />
          : (
            <>
              <Bloom intensity={0.78} luminanceThreshold={0.66} luminanceSmoothing={0.22} mipmapBlur radius={0.72} />
              <Vignette offset={0.28} darkness={0.74} />
            </>
          )}
      </EffectComposer>

      <AdaptiveDpr pixelated={false} />
    </Canvas>
  )
}
