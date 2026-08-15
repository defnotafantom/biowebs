import { campoProspettico } from '../lib/nuvola'

/* ═══════════════════════════════════════════════════════════════
   L'ELICA
   Due filamenti di sfere grandi, tenuti insieme da bastoncini che
   li attraversano. Attorno, altre sfere che non si legano a niente
   e restano a fluttuare.

   Questa è la costruzione della versione che il committente
   ricordava, e che avevo perso per strada. Nel frattempo l'avevo
   rifatta con quaranta sfere grosse e seicentoventi granelli: i
   granelli facevano due corde continue, che di lontano sembravano
   una treccia. Sembrava un'altra cosa, e infatti lo era.

   La differenza non è di quantità. Un filamento di granelli è una
   LINEA — la leggi come tratto, come disegno. Un filamento di sfere
   grandi è una CATENA — la leggi come oggetti separati che si
   toccano. E se sono oggetti separati, allora hanno un davanti e un
   dietro: quella vicina copre quella lontana, ed è da lì che nasce
   la profondità. Con i granelli non c'è niente da coprire.

   I bastoncini fanno il resto. Senza, le due catene sono due catene
   e basta; con, diventano una struttura, e si capisce che le sfere
   stanno lì perché qualcosa le tiene.

   ── la revisione del 15 agosto ─────────────────────────────────
   Tre difetti, che erano poi lo stesso difetto guardato da tre
   lati: i bastoncini non toccavano le sfere, le catene erano
   rade, e l'elica era tirata per il lungo.

   Il primo era il grave. I bastoncini si calcolavano dalla
   formula dell'elica, le sfere dalla formula PIÙ uno scarto
   casuale, e per giunta erano otto contro trentanove sfere per
   filamento: non potevano che cadere nel vuoto. Adesso un
   bastoncino non ha coordinate proprie — prende due sfere e va
   dall'una all'altra.

   Gli altri due sono numeri: più sfere per filamento (sessantasei
   invece di trentanove, così si sovrappongono invece di
   distanziarsi) e passo uguale al diametro (quattro e quattro,
   invece di cinque e tre contro cinque e uno).
   ═══════════════════════════════════════════════════════════════ */

const BASE = 190

/* ── le proporzioni ───────────────────────────────────────────
   Sono quelle della prima versione, e ci sono tornato per una
   ragione precisa: il passo dell'elica dev'essere circa uguale al
   suo diametro.

   Con due giri su dieci e sei di altezza il passo era cinque e
   tre, contro un diametro di cinque e uno: l'elica veniva tirata
   per il lungo, i due filamenti si incrociavano a un angolo troppo
   aperto, e da lontano sembravano due onde parallele invece che
   una cosa avvolta. È il difetto che il committente ha visto
   subito e ha chiamato "non sembra un'elica di DNA".

   Adesso passo quattro, diametro quattro: rapporto uno. Ogni giro
   si chiude visibilmente su sé stesso, e la figura si legge come
   avvolta anche ferma e anche di profilo. */
const GIRI = 2.3
const ALTEZZA = 9.2
const RAGGIO = 2.0

/* Sfasati di poco più di mezzo giro, non di mezzo esatto.

   A mezzo giro esatto i due filamenti sono diametralmente opposti,
   i pioli passano tutti per il centro, e la figura è simmetrica in
   un modo che il DNA non ha: sopra e sotto si somigliano troppo e
   l'occhio non trova l'avvitamento.

   A 0,62 di giro nascono i due solchi — uno largo e uno stretto,
   come nel DNA vero. Costa un numero e cambia tutto: è il solco
   asimmetrico a dire "questa cosa gira". */
const SFASAMENTO = Math.PI * 0.62

/* Quanti pioli si vogliono vedere, all'incirca. Il numero esatto
   lo decide la spaziatura delle sfere, perché ogni piolo deve
   partire e arrivare sul CENTRO di una sfera vera. */
const PIOLI_VOLUTI = 14

export function caso(i) {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

function suElica(t, filo) {
  const a = t * GIRI * Math.PI * 2 + (filo ? SFASAMENTO : 0)
  return [Math.cos(a) * RAGGIO, (t - 0.5) * ALTEZZA, Math.sin(a) * RAGGIO]
}

/**
 * @param {number} fattore 1 sul computer, meno sui telefoni.
 */
export function costruisciElica(fattore = 1) {
  const N = Math.max(72, Math.round(BASE * Math.sqrt(fattore)))
  /* Trenta per cento non si lega a niente. Sono quelle che nel
     fotogramma stanno fuori dalla struttura, alcune enormi in
     primo piano, altre minuscole sul fondo: senza di loro l'elica
     è un oggetto sospeso nel nulla, con loro è dentro qualcosa.

     Trenta e non quarantadue: con quarantadue le catene restavano
     di trentanove sfere l'una su trenta unità di percorso, cioè
     una ogni ottantasei centesimi contro un diametro di settanta.
     Sedici centesimi di buco fra una sfera e l'altra, moltiplicati
     per settantotto sfere — ed è esattamente questo che il
     committente ha chiamato "la figura è meno compatta".

     Con trenta le catene tornano a sessantasei sfere l'una, una
     ogni quarantasei centesimi: si sovrappongono di un quarto, e
     il filamento torna a essere una cosa sola invece di una fila
     di cose. */
  const LIBERE = Math.round(N * 0.30)
  const SU_FILO = N - LIBERE
  const perFilo = Math.floor(SU_FILO / 2)

  /* NASCITA — quando compare ognuna, da 0 a 1.
     L'esponente sotto l'uno spinge quasi tutte verso la fine: con
     le nascite distribuite in modo uniforme, al primo fotogramma
     ce n'erano già una quarantina e il vuoto non c'era. Con 0,62
     ce ne sono dieci, e il resto arriva piano. */
  const elica = new Float32Array(N * 3)
  const misura = new Float32Array(N)
  const nascita = new Float32Array(N)
  const ritardo = new Float32Array(N)

  let k = 0

  /* ── i due filamenti ──────────────────────────────────────────
     Le sfere del filamento 0 stanno agli indici 0…perFilo-1, quelle
     del filamento 1 subito dopo. Serve saperlo: i pioli, più sotto,
     vanno a prendere le posizioni QUI DENTRO — non le ricalcolano.
     È tutta la differenza fra un piolo che parte da una sfera e uno
     che parte da dove la sfera dovrebbe essere. */
  for (let filo = 0; filo < 2; filo++) {
    for (let j = 0; j < perFilo; j++) {
      const t = (j + 0.5) / perFilo
      const [x, y, z] = suElica(t, filo)
      /* Fuori asse di poco: infilzate su un tubo perfetto
         sembrerebbero una collana di perle da mercatino.

         Otto centesimi e non quattordici. Lo scarto lo pagano i
         pioli: sono loro a doversi appoggiare sui centri, e con
         quattordici centesimi in tre direzioni due sfere affacciate
         potevano trovarsi sfalsate di quasi mezza sfera — e il
         piolo, pur partendo da un centro vero, si vedeva entrare
         storto. */
      const sp = 0.08
      elica[k * 3] = x + (caso(k * 2.3 + 5) - 0.5) * sp
      elica[k * 3 + 1] = y + (caso(k * 4.1 + 6) - 0.5) * sp * 1.6
      elica[k * 3 + 2] = z + (caso(k * 6.7 + 7) - 0.5) * sp

      /* Le misure sulle catene variano parecchio ma non troppo:
         devono toccarsi. Con lo scarto pieno una piccola in mezzo
         a due grandi lascia un buco e la catena si spezza. */
      misura[k] = 0.24 + caso(k * 8.1 + 61) * 0.17

      /* Il ritardo del raduno: le sfere al centro dell'elica si
         mettono a posto per prime, e la struttura cresce verso
         le estremità. È un dettaglio che si nota solo se manca —
         con i ritardi a caso sembra che si radunino alla rinfusa,
         con questo sembra che si costruisca. */
      ritardo[k] = Math.abs(t - 0.5) * 2 * 0.26
      nascita[k] = Math.pow(caso(k * 3.7 + 91), 0.62)
      k++
    }
  }

  /* ── quelle che restano fuori ── */
  for (let j = k; j < N; j++) {
    const a = caso(j * 7.3 + 21) * Math.PI * 2
    const r = RAGGIO * (1.15 + caso(j * 3.9 + 22) * 1.5)
    elica[j * 3] = Math.cos(a) * r
    elica[j * 3 + 1] = (caso(j * 5.1 + 23) - 0.5) * ALTEZZA * 1.35
    elica[j * 3 + 2] = Math.sin(a) * r * 0.85
    /* Qui invece lo scarto è pieno: il quadrato tiene basse quasi
       tutte e ne lascia due o tre grosse. Sono quelle che nel
       fotogramma entrano da un bordo e occupano un quarto di
       schermo — servono a dire quanto è vicino il primo piano. */
    const g = caso(j * 8.1 + 62)
    misura[j] = 0.05 + g * g * 0.42
    ritardo[j] = 0.26 + caso(j * 9.3 + 24) * 0.22
    nascita[j] = Math.pow(caso(j * 3.7 + 91), 0.62)
  }

  /* ── i pioli ─────────────────────────────────────────────────
     Qui stava il difetto che si vedeva più di tutti.

     Prima i pioli si calcolavano da capo con suElica(): partivano
     dal punto MATEMATICO dell'elica, mentre le sfere stavano al
     punto matematico più uno scarto casuale, e per giunta erano
     otto contro trentanove sfere per filamento, cioè cadevano fra
     una sfera e l'altra quasi sempre. Il risultato è quello che il
     committente ha descritto senza mezzi termini: "le linee non
     sono nemmeno collegate sfera-sfera, alcune vanno nel vuoto".
     Aveva ragione, e non era un'impressione: erano proprio nel
     vuoto, per costruzione.

     Adesso un piolo non ha coordinate proprie. Prende la sfera j
     del filamento 0 e la sfera j del filamento 1 dall'array che
     abbiamo appena riempito, e va dall'una all'altra. Qualunque
     scarto casuale abbiano le sfere, il piolo ci finisce dentro:
     non può andare nel vuoto perché non sa dove sia il vuoto —
     conosce solo due centri di sfera.

     E siccome le due sfere di una coppia stanno alla stessa altezza
     (i filamenti sono sfasati in giro, non in quota), i pioli
     escono orizzontali: la scala a pioli del DNA, non una rete. */
  const passo = Math.max(2, Math.round(perFilo / PIOLI_VOLUTI))
  const nPioli = Math.floor((perFilo - 1) / passo) + 1
  const pA = new Float32Array(nPioli * 3)
  const pB = new Float32Array(nPioli * 3)
  const pRitardo = new Float32Array(nPioli)
  for (let i = 0; i < nPioli; i++) {
    const j = i * passo
    const a = j                 // sfera j del filamento 0
    const b = perFilo + j       // la sua gemella sul filamento 1
    pA[i * 3] = elica[a * 3]; pA[i * 3 + 1] = elica[a * 3 + 1]; pA[i * 3 + 2] = elica[a * 3 + 2]
    pB[i * 3] = elica[b * 3]; pB[i * 3 + 1] = elica[b * 3 + 1]; pB[i * 3 + 2] = elica[b * 3 + 2]
    /* dopo le sfere, e dal centro verso le estremità come loro */
    const t = (j + 0.5) / perFilo
    pRitardo[i] = 0.34 + Math.abs(t - 0.5) * 2 * 0.30
  }

  /* Il campo sparso di partenza: costruito nel cono della
     telecamera, così le misure apparenti nascono dalla distanza. */
  const caos = campoProspettico(N, 11, 18, 8.0, 32, 1.16)

  /* ── il fondale ───────────────────────────────────────────────
     Dove finiscono le sfere quando l'elica si è dissolta, e dove
     restano per tutto il resto del sito.

     È lo stesso campo prospettico del caos iniziale, con due
     differenze. La fascia centrale dello schermo è vuota al
     quarantaquattro per cento — lì ci vanno i testi, e una sfera
     dietro una parola resta un disturbo anche a fondo scala. E le
     distanze partono da più lontano, così le poche che arrivano in
     primo piano restano poche e stanno negli angoli.

     È l'unico modo onesto per avere insieme le due cose che ha
     chiesto: profondità vera e testo che si legge. */
  const fondo = campoProspettico(N, 305, 18, 11.0, 40, 1.24, 0.44)

  return { n: N, nPioli, caos, fondo, elica, misura, nascita, ritardo, pA, pB, pRitardo }
}
