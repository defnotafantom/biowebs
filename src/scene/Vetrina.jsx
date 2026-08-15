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
  /* Il verde scurissimo di prima era un errore che si spiega da
     solo: colonna quasi nera su fondo quasi nero, in una scena
     dove l'unica luce forte è quella che deve uscire dal cuscino.
     A cursore fermo la vetrina non si vedeva proprio — non era
     "poco visibile", era invisibile, e infatti il committente ha
     detto che non c'era niente.

     Adesso è pietra chiara. Una colonna da museo non è nera: è
     travertino, e sta lì apposta perché la si veda anche quando
     sopra non c'è niente. */
  /* ── perché adesso sono EMISSIVE ────────────────────────────
     Il committente ha detto due volte che la vetrina non si vede,
     e la seconda volta con precisione: "niente, buio totale". Ho
     rifatto il conto della luce che le arriva, ed è un conto che
     perde a ogni passaggio.

     Il verde-pietra #6E7B6A in luce lineare vale 0,16. Ci arriva
     l'ambiente (0,48 diviso pi greco = 0,15) più la direzionale
     (2,3 per il coseno, diviso pi greco, cioè circa 0,5 sul lato
     illuminato). Fa 0,10 in uscita. Poi la nebbia si prende
     l'undici per cento, e la vignettatura — che a tre quarti di
     schermo, dove la vetrina sta, morde forte — quasi la metà.
     Resta un grigio che sul verde quasi nero del fondo non stacca.

     Nessuna delle tre cose si può alzare senza rovinare le sfere,
     che sono tarate su quelle stesse luci. Quindi la vetrina
     smette di dipenderne: una componente emissiva è luce che
     l'oggetto ha per conto suo, e non la toglie né la nebbia né
     la vignettatura. Una colonna da museo è illuminata comunque;
     qui lo è da dentro, ed è l'unico modo perché lo sia sempre. */
  const matColonna = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#8C9A86', roughness: 0.62, metalness: 0.02,
    emissive: new THREE.Color('#2E3B33'), emissiveIntensity: 1,
    clearcoat: 0.28, clearcoatRoughness: 0.5, envMapIntensity: 1.5,
  }), [])

  const matCuscino = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#B2521F', roughness: 0.92, metalness: 0,
    emissive: new THREE.Color('#5A2410'), emissiveIntensity: 1,
    sheen: 1, sheenRoughness: 0.3, sheenColor: new THREE.Color('#FF9A4E'),
    envMapIntensity: 1.1,
  }), [])

  /* un filo di luce sul bordo del collarino: è il dettaglio che
     stacca la colonna dal fondo senza doverla illuminare tutta */
  const matFilo0 = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#FFC177', transparent: true, opacity: 0.55,
  }), [])

  /* L'ologramma: emissivo, semitrasparente, e senza scrittura sul
     buffer di profondità. Quest'ultima è la riga che fa la
     differenza: senza, i pezzi trasparenti si nascondono a vicenda
     a seconda dell'ordine in cui capita di disegnarli, e l'oggetto
     lampeggia mentre gira. */
  /* Fusione normale, non additiva.

     Additiva vuol dire che il colore dell'oggetto si SOMMA a quello
     che ha dietro. Su fondo nero è perfetta ed è il motivo per cui
     l'avevo scelta. Ma qui dietro c'è il fascio di luce, che è a
     sua volta additivo: due additivi sovrapposti saturano, la
     sagoma si scioglie dentro il fascio, e non si distingue più
     l'oggetto dalla luce che lo dovrebbe proiettare. È
     letteralmente la frase del committente — "l'ologramma non si
     capisce bene, è attaccato al fascio di luce".

     Con la fusione normale e mezza opacità la sagoma copre il
     fascio invece di sommarcisi: si legge come una cosa DENTRO la
     luce. Il bagliore lo mette il fil di ferro, che resta additivo
     e da solo non satura mai. */
  const matOlo = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFC46A', emissive: new THREE.Color('#FF8A1E'), emissiveIntensity: 0.9,
    roughness: 0.3, metalness: 0.1,
    transparent: true, opacity: 0.52, depthWrite: false,
  }), [])

  /* la seconda passata a fil di ferro: è quella che lo fa leggere
     come proiezione e non come oggetto di plastica arancione */
  const matFilo = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#FFF0D2', wireframe: true,
    transparent: true, opacity: 0.6, depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [])

  /* Il fascio non può essere una tinta piatta: un cono di colore
     uniforme è un cono, non un fascio. Serve che si spenga salendo,
     e in un materiale semplice l'unico modo senza scrivere uno
     shader è dipingere i vertici — bianco in basso, nero in alto,
     e il colore per vertice fa da maschera. */
  /* Il fascio è più alto e si spegne più in fretta di prima.

     L'oggetto adesso sta in alto, dove la luce è quasi finita, e
     non più appoggiato sulla bocca del fascio dove era più
     luminosa. Nel museo è così: il faretto è in basso o dietro, e
     la cosa che guardi sta nella parte di luce che non ti acceca.

     L'esponente da 1,8 a 2,8 è quello che libera lo spazio: il
     bagliore forte resta nel primo terzo — sopra il cuscino, dove
     serve a dire "la luce esce da qui" — e nei due terzi alti
     rimane un velo, che è dove l'ologramma può leggersi. */
  const geoFascio = useMemo(() => {
    /* Un e ottantacinque in cima: il cono deve CONTENERE l'oggetto
       alla quota in cui l'oggetto sta, se no si vede un ologramma
       che sborda dalla luce che lo proietta — e un proiettore che
       proietta fuori dal proprio fascio non si guarda, si nota.
       Il bioimpedenziometro è il più largo dei cinque: due e otto
       per due, cioè un e quindici di semilarghezza a scala 0,82.
       A quella altezza il cono ne misura un e sedici. */
    const g = new THREE.CylinderGeometry(1.85, 0.28, 3.4, 36, 14, true)
    const pos = g.attributes.position
    const col = new Float32Array(pos.count * 3)
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) / 3.4 + 0.5          // 0 in basso, 1 in alto
      const f = Math.pow(1 - y, 2.8) * 0.95 + 0.03
      col[i * 3] = f; col[i * 3 + 1] = f; col[i * 3 + 2] = f
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  }, [])

  const matFascio = useMemo(() => new THREE.MeshBasicMaterial({
    color: LUCE, vertexColors: true,
    /* Il fascio si vede sempre, anche senza niente dentro: è
       quello che dice "qui sopra ci va qualcosa". Con l'oggetto
       acceso raddoppia. */
    transparent: true, opacity: 0.09,
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
        /* Un'unità e mezza sopra il cuscino, non un terzo.

           Prima l'oggetto era appoggiato sulla bocca del fascio: la
           parte più stretta e più accesa, larga mezza unità contro
           un oggetto largo quasi tre. Metà dell'oggetto era fuori
           dalla luce e l'altra metà ci sguazzava dentro. Ecco
           perché "è attaccato al fascio": lo era davvero.

           A un e cinquanta galleggia nella parte alta e larga, dove
           la luce è un velo, e fra la sua base e il cuscino c'è
           un'unità di fascio pulito che si legge come proiezione. */
        og.position.y = 1.50 + Math.sin(tempo * 0.9) * 0.05
        /* nasce dal basso: mentre compare è schiacciato e sale,
           come se la luce lo stesse costruendo dal piano */
        const m = morbida(v)
        og.scale.set(m * 0.82, m * m * 0.82, m * 0.82)
      }
    }

    /* ── il fascio ── */
    if (fascio.current) {
      const acceso = mescola(0.5, 1, v)
      fascio.current.scale.set(acceso, 1, acceso)
      /* il tremolio: un fascio perfettamente stabile sembra un
         solido, uno che respira sembra luce nell'aria */
      fascio.current.material.opacity = (0.085 + 0.075 * v) * presenza
        * (0.84 + Math.sin(tempo * 1.7) * 0.16)
    }
    if (alone.current) {
      alone.current.material.opacity = (0.34 + 0.34 * v) * presenza
    }
    if (lampada.current) {
      lampada.current.intensity = (16 + 26 * v) * presenza
    }

    /* ── l'insieme ── */
    /* sta a destra come tutto il resto della scena, e in verticale
       sale nella fascia alta con il testo sotto */
    const kx = 1 - Math.exp(-dt * 3)
    /* Due e sei, non tre e tre. La larghezza inquadrata dipende
       dalla forma della finestra: su uno schermo alto e stretto —
       un portatile a 1366 per 768 con le barre del browser — la
       scena è larga meno di nove unità, e tre e tre finiscono al
       settantacinque per cento dello schermo, cioè in pieno morso
       della vignettatura. Due e sei tiene la colonna dentro il
       fotogramma su qualunque proporzione, e resta comunque a
       destra della colonna di testo, che non supera mai i 33 rem. */
    const bx = schermo.stretto ? 0 : 2.6
    /* Mezz'unità più in basso di prima: con l'ologramma salito a
       un e cinquanta, il baricentro di quello che si guarda — la
       sagoma, non la colonna — cade adesso al centro esatto
       dell'inquadratura invece che nel terzo alto. */
    const by = (schermo.stretto ? scena.alto - 1.1 : -1.95)
    gr.position.x += (bx - gr.position.x) * kx
    gr.position.y += (by - gr.position.y) * kx
    const bs = (schermo.stretto ? 0.62 : 1.15) * mescola(0.86, 1, presenza)
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
      {/* il filo di luce sul bordo */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} material={matFilo0}>
        <ringGeometry args={[0.74, 0.79, 48]} />
      </mesh>

      {/* Due luci dedicate alla colonna. Le luci della scena sono
          tarate sulle sfere, che stanno molto più avanti: qui
          arrivava un terzo di niente e la pietra restava grigia.

          La seconda sta DIETRO e in basso, e serve al contorno: è
          il filo di luce lungo il bordo che stacca una forma scura
          da un fondo scuro. Illuminare di più il davanti non
          bastava — una colonna piatta e chiara su fondo nero resta
          una macchia; è il bordo acceso a dirti che è un solido. */}
      <pointLight position={[-2.2, 2.4, 3.2]} color="#FFE3BC" distance={12} intensity={38} />
      <pointLight position={[1.6, -1.4, -2.6]} color="#FFB067" distance={9} intensity={26} />

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
      {/* il fascio: un tronco di cono che si apre verso l'alto.
          Parte da un quarto di unità sopra il cuscino — non da
          dentro il cuscino, come faceva prima: la bocca sepolta
          nella stoffa toglieva proprio il punto in cui si capisce
          che la luce esce da lì. */}
      <mesh ref={fascio} position={[0, 1.95, 0]} geometry={geoFascio} material={matFascio} />

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
