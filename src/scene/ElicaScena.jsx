import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scroll, clamp, fascia, morbida, mescola } from '../lib/scroll'
import { schermo, scena, quantita } from '../lib/schermo'
/* I nomi di questi due file sono scelti per non somigliarsi:
   "ElicaScena" il componente, "geometria-elica" i dati. Su Windows
   e macOS i nomi dei file non distinguono maiuscole da minuscole,
   e quando il componente si chiamava Elica.jsx un import di './elica'
   finiva per risolvere al file sbagliato. La pagina restava sullo
   spinner senza un errore in console e con una richiesta 503 che si
   vedeva solo guardando la rete. */
import { costruisciElica, caso } from './geometria-elica'


/* ═══════════════════════════════════════════════════════════════
   L'ELICA
   Centonovanta sfere e quattordici bastoncini.

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

/* I chicchi: grano, avena, sesamo. Poca varietà, tutta calda.

   Non sono un colore di servizio: sono il TRATTO. Le corde e i
   pioli sono fatti solo di questi, e devono leggersi come una
   linea chiara continua contro il verde scuro — chiara abbastanza
   da tenere il disegno, spenta abbastanza da non rubare la scena
   ai frutti. */
const CHICCHI = ['#F3D9A0', '#E8C482', '#FBEDCB', '#DCB870']
  .map((c) => new THREE.Color(c))

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
function arrivo(s, cap) {
  if (cap === 0) return 0.20 + clamp(s / 2.30) * 0.80
  return 1
}

/* RADUNO — 0 sfere sparse, 1 struttura composta.

   Si compone una volta sola nell'apertura, RESTA COMPOSTA per
   tutto il primo capitolo — è lì che il testo dell'apertura se ne
   va verso l'alto e la struttura si prolunga da una schermata
   all'altra — e si scioglie solo alla fine, tornando com'era
   all'inizio. Da lì in poi non si ricompone più.

   Sciogliersi e ricomporsi a ogni capitolo era un effetto: la
   figura si disfaceva perché sapevo farla disfare. Una cosa che
   accade una volta sola è un fatto. */
function raduno(s, cap, q) {
  if (cap === 0) return clamp((s - 1.00) / 1.70)
  if (cap === 1) return 1 - morbida(fascia(q, 0.52, 0.94))
  return 0
}

/* IL TAGLIO — quanto la struttura è già scomparsa dietro il bordo.

   Nel primo capitolo l'elica NON si muove. Prima la facevo salire
   fuori inquadratura, e il risultato era che si staccava dalla
   base e volava via: sembrava che l'oggetto se ne andasse, mentre
   quello che deve succedere è che il contenuto arrivi.

   Resta dov'è, e sotto una certa riga dello schermo semplicemente
   non c'è più. Il committente lo ha detto meglio di come lo avrei
   detto io: il taglio non si deve VEDERE, deve sembrare che la
   figura sia scomparsa dietro il bordo del box. Che è la stessa
   cosa detta due volte solo se il taglio è fatto bene. */
function taglio(cap, q) {
  if (cap !== 1) return 0
  /* La corsa finisce esattamente dove comincia lo scioglimento
     (0,52 del capitolo, vedi raduno()). Se finisse prima, restava
     un tratto di capitolo con la figura già tutta sotto il bordo e
     lo scioglimento non ancora partito: mezzo schermo vuoto, e un
     vuoto che non significa niente. Così invece il momento in cui
     sparisce dietro il bordo è lo stesso in cui comincia a
     disfarsi, e le due cose si leggono come una sola. */
  return morbida(fascia(q, 0.0, 0.52))
}

/* Da dove a dove viaggia la riga del taglio, in frazione
   dell'altezza dello schermo dal bordo alto.

   Parte a 1,18 — sotto il bordo basso, quindi non taglia niente —
   e arriva a 0,17, che è dove comincia il blocco di testo del
   capitolo 01. Non si ferma a metà: se si fermasse, resterebbe
   sullo schermo mezza elica appoggiata su una riga, ed è
   esattamente l'immagine che non vogliamo. */
const TAGLIO_DA = 1.18
const TAGLIO_A = 0.17

/* Quanto dura la comparsa di una singola sfera. Da 0,11 a 0,26:
   più del doppio, perché comparire deve essere un viaggio e non
   un'accensione. */
const NASCITA = 0.26

/* Da quanto lontano arriva una sfera appena nata.
   È il numero che risolve il difetto peggiore dell'apertura: le
   sfere sembravano spuntare dal nulla. Nascevano al loro posto e
   crescevano da misura zero — e una cosa che cresce sul posto non
   è arrivata, è APPARSA, e l'occhio se ne accorge subito.

   Adesso nascono ventotto unità più indietro, cioè ben oltre il
   fondo della nebbia, e vengono avanti mentre crescono. Non c'è
   nessun momento in cui appaiono: escono dal verde scuro come
   escono le cose dalla nebbia vera, e quando le vedi si stanno
   già muovendo da un pezzo. */
const DA_LONTANO = 28

/* riutilizzato a ogni fotogramma dal piano di taglio: allocarlo
   dentro il ciclo vorrebbe dire creare un oggetto sessanta volte
   al secondo per buttarlo via subito */
const _n = new THREE.Vector3()

/* ── la riga del taglio, e perché non era una riga ──────────────
   Il taglio si faceva con un piano orizzontale del mondo, y = k.
   Sembra la cosa ovvia, e invece è la cosa sbagliata: un piano
   orizzontale visto in prospettiva non si proietta su una riga
   dritta dello schermo, si proietta su un ventaglio che va verso
   l'orizzonte. Le sfere vicine venivano tagliate molto più in alto
   di quelle lontane, e la stessa quota del mondo cadeva su otto
   punti diversi dello schermo. Da lì "l'elica è tagliata male":
   non era il posto del taglio a essere sbagliato, era la forma.

   Un piano si proietta su una riga dritta solo se passa per il
   centro ottico della telecamera. Quindi si costruisce lì: nello
   spazio della telecamera, il piano che contiene l'origine e taglia
   all'altezza voluta ha normale (0, 1, m·tanα), dove m è la quota
   in coordinate normalizzate e alfa è mezzo angolo di campo. Lo si
   ruota come la telecamera, lo si fa passare per la telecamera, ed
   è fatto: una riga orizzontale perfetta, a qualunque profondità.

   Ed è quella riga che serve, perché sopra ci va incollata la
   fascia opaca del DOM. Se il taglio è un ventaglio non c'è nessuna
   fascia che lo possa nascondere. */
function orientaTaglio(piano, camera, frazione) {
  const m = (0.5 - frazione) * 2
  const tan = Math.tan((camera.fov / 2) * Math.PI / 180)
  _n.set(0, 1, m * tan).normalize().applyQuaternion(camera.quaternion)
  piano.normal.copy(_n)
  piano.constant = -_n.dot(camera.position)
}

export default function ElicaScena({ mouse }) {
  const gruppo = useRef()
  const rete = useRef()
  const inclina = useRef({ x: 0, z: 0 })

  /* Il piano che taglia. Si costruisce una volta e non si sostituisce
     mai: cambiare l'ELENCO dei piani di un materiale lo obbliga a
     ricompilare lo shader, cambiarne la posizione no. Quando non
     serve tagliare lo si manda mille unità sotto, dove non incontra
     niente. */
  const piano = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 1000), [])

  const dati = useMemo(() => costruisciElica(quantita()), [])
  const n = dati.n

  /* L'ultimo valore scritto nel CSS. Serve solo a non riscriverlo
     sessanta volte al secondo con lo stesso numero: cambiare una
     variabile CSS costa un ricalcolo di stile, e a taglio fermo
     sarebbe un ricalcolo per niente. */
  const rigaScritta = useRef(-1)
  /* la fascia opaca del DOM, cercata una volta e tenuta da parte */
  const fascia0 = useRef(null)

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

  /* Ogni frutto un frutto diverso, ogni chicco un cereale. Con due
     soli colori l'elica sembra fatta di biglie: la varietà non è
     decorazione, è quello che la fa leggere come cibo. */
  const base = useMemo(() => {
    const c = new Float32Array(n * 3)
    const t = new THREE.Color()
    for (let i = 0; i < n; i++) {
      if (dati.grande[i]) {
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
  }, [n, dati])

  useLayoutEffect(() => {
    const m = rete.current
    if (!m) return
    /* Assegnare i piani non basta: three costruisce lo shader in
       base a QUANTI piani ci sono, e se il numero cambia dopo la
       creazione bisogna dirglielo. Senza needsUpdate il taglio
       semplicemente non avviene, e non c'è nessun errore da
       leggere — è il tipo di riga che si scopre solo chiedendosi
       perché una cosa non succede. */
    m.material.clippingPlanes = [piano]
    m.material.needsUpdate = true
    m.instanceMatrix.array.fill(0)
    const c = new THREE.Color()
    for (let i = 0; i < n; i++) {
      m.instanceMatrix.array[i * 16 + 15] = 1
      c.setRGB(base[i * 3], base[i * 3 + 1], base[i * 3 + 2])
      m.setColorAt(i, c)
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [n, base, piano])

  useFrame(({ clock, camera }, dt) => {
    const m = rete.current
    const gr = gruppo.current
    if (!m || !gr) return
    const tempo = clock.elapsedTime
    const cap = scroll.capitolo
    const r = raduno(scroll.schermate, cap, scroll.q)
    const a = arrivo(scroll.schermate, cap)
    const tg = taglio(cap, scroll.q) * r
    /* Verso il fondale: le sfere disperse non tornano dove erano
       all'inizio ma in un campo diverso, con la fascia centrale
       vuota. È lo stesso disordine, sistemato in modo da non
       finire mai sopra una parola. */
    const versoFondo = cap === 0 ? 0 : cap === 1 ? morbida(fascia(scroll.q, 0.52, 1)) : 1
    /* Non si nasconde mai: da qui in poi le sfere SONO il fondo del
       sito. Sono centotrentaquattro, costano un disegno solo, e
       spegnerle per riaccenderle sarebbe più codice per un
       risultato peggiore. */
    gr.visible = true

    const { caos, fondo, elica, misura, nascita, ritardo, grande } = dati
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

      const vf = versoFondo
      const ax = caos[j] + (fondo[j] - caos[j]) * vf
      const ay = caos[j + 1] + (fondo[j + 1] - caos[j + 1]) * vf
      const az = caos[j + 2] + (fondo[j + 2] - caos[j + 2]) * vf
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
      /* mentre nasce sta un po' più larga e MOLTO più indietro:
         viene avanti attraversando la nebbia */
      const fuori = 1 + (1 - vn) * 0.22
      const dietro = (1 - vn) * DA_LONTANO
      const px = (ax * w0 + cx * w1 + bx * w2) * fuori + Math.sin(tempo * 0.5 + fase[i]) * vita
      const py = (ay * w0 + cy * w1 + by * w2) * fuori + Math.cos(tempo * 0.42 + fase[i]) * vita
      const pz = (az * w0 + cz * w1 + bz * w2) * fuori - dietro + Math.sin(tempo * 0.46 + fase[i] * 1.4) * vita

      /* Da fondale le sfere sono poco più di metà: devono esserci
         e non farsi notare. È l'unica cosa che le distingue dalle
         stesse sfere dell'apertura, dove riempivano lo schermo. */
      /* La misura non parte da zero ma dal settanta per cento: a
         quella distanza è comunque un puntino nella nebbia, e non
         serve rimpicciolirla anche. Se parte da zero, il momento
         in cui diventa visibile è anche il momento in cui è più
         piccola, e si legge come "pop". */
      /* Da fondale i frutti si ritirano a poco più di metà: devono
         esserci e non farsi notare. I chicchi no — sono già
         puntini, e rimpicciolirli ancora vorrebbe dire cancellarli.
         È la polvere fine sul fondo, e senza quella il fondale
         diventa una manciata di palle sospese nel nulla. */
      const s = misura[i] * mescola(0.7, 1, vn)
        * (grande[i] ? mescola(0.58, 1, r) : mescola(0.94, 1, r))
      mat[o] = s; mat[o + 5] = s; mat[o + 10] = s
      mat[o + 12] = px; mat[o + 13] = py; mat[o + 14] = pz
    }
    m.instanceMatrix.needsUpdate = true

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

    /* ── il taglio ──────────────────────────────────────────────
       Due righe che devono cadere sullo stesso pixel: quella del
       piano che taglia la scena, e quella della fascia opaca che
       sta nel DOM. Il piano si costruisce dalla telecamera perché
       venga dritto; la frazione la scrive nel CSS, e la fascia si
       posiziona da sola. Se le due righe si scostassero anche di
       due pixel si vedrebbe una fettina di sfera sopra il bordo, e
       tutto il trucco cadrebbe. */
    if (tg > 0.001) {
      /* In verticale il testo non sta a sinistra ma sotto la fascia
         della scena, che si prende il trenta per cento alto. Il
         bordo del box è quello, non un quinto dall'alto. */
      const fine = schermo.stretto ? 0.34 : TAGLIO_A
      const riga = mescola(TAGLIO_DA, fine, tg)
      orientaTaglio(piano, camera, riga)
      const el = fascia0.current || (fascia0.current = document.querySelector('.bordo'))
      if (el && Math.abs(riga - rigaScritta.current) > 0.0008) {
        rigaScritta.current = riga
        /* Le variabili si scrivono sull'elemento, non su :root.
           Su :root sarebbero valide ovunque — comodo — ma ogni
           scrittura invaliderebbe lo stile dell'intero documento
           sessanta volte al secondo mentre si scorre. Qui invalida
           una fascia vuota, e costa zero. */
        const st = el.style
        st.setProperty('--taglio', (riga * 100).toFixed(3) + '%')
        /* la fascia entra prestissimo e poi resta: deve esserci
           già prima che il piano incontri la prima sfera */
        st.setProperty('--taglio-op', Math.min(1, tg * 5).toFixed(3))
        /* Lo spigolo no. Il filo chiaro sul bordo alto compare solo
           alla fine della corsa, con il cubo: se fosse acceso da
           subito si vedrebbe una riga luminosa attraversare tutto
           lo schermo dal basso verso l'alto, e una riga che
           attraversa lo schermo è un effetto — mentre qui deve
           essere il ciglio di un piano che era già lì. */
        st.setProperty('--taglio-filo', (tg * tg * tg).toFixed(3))
      }
    } else {
      /* mille unità sotto: non incontra niente, e il materiale non
         ricompila perché l'elenco dei piani non cambia */
      piano.normal.set(0, 1, 0)
      piano.constant = 1000
      if (rigaScritta.current !== -1) {
        rigaScritta.current = -1
        const el = fascia0.current || (fascia0.current = document.querySelector('.bordo'))
        if (el) el.style.setProperty('--taglio-op', '0')
      }
    }

    const kx = 1 - Math.exp(-dt * 2)

    /* Lo spostamento a destra segue il raduno: da sparse stanno al
       centro e occupano tutto lo schermo — il vuoto va riempito
       per intero, se no metà pagina è morta — e mentre si radunano
       scivolano a destra a fare posto al nome. Il compattarsi e il
       farsi da parte sono lo stesso gesto.

       E quando si sciolgono tornano al centro da sole, perché r
       torna a zero: da fondale devono coprire tutto il fotogramma,
       che è il motivo per cui il campo del fondale ha la fascia
       centrale vuota invece di stare tutto da una parte. */
    const bx2 = schermo.stretto ? 0 : 2.7 * r

    /* Non si muove più: resta dove l'apertura l'ha lasciata. */
    const by = scena.alto
    const bs = schermo.stretto ? mescola(1, 0.40, r) : 1

    gr.position.x += (bx2 - gr.position.x) * kx
    gr.position.y += (by - gr.position.y) * kx
    gr.position.z += (0 - gr.position.z) * kx
    gr.scale.setScalar(gr.scale.x + (bs - gr.scale.x) * kx)
  })

  return (
    <group ref={gruppo}>
      <instancedMesh ref={rete} args={[undefined, undefined, n]} frustumCulled={false}>
        {/* Sedici per dodici. Seicentosessanta sfere di cui
            seicentoventi sono puntini da pochi pixel: lì gli
            spicchi non si contano, e spenderceli vorrebbe dire
            duecentomila triangoli buttati. I quaranta frutti sono
            gli unici che arrivano grossi, e a sedici spicchi il
            bordo regge finché non riempiono mezzo schermo — cosa
            che capita a uno o due, nel primo piano dell'apertura. */}
        <sphereGeometry args={[1, 16, 12]} />
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
