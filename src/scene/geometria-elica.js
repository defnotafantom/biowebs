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
   ═══════════════════════════════════════════════════════════════ */

const BASE = 134

/* L'elica è alta più dell'inquadratura, ed è voluto. A dieci virgola
   sei unità, con la telecamera dove sta al termine dell'apertura,
   esce sopra e sotto: se ne vedono due giri e il resto si immagina.
   Un'elica che ci sta tutta comoda dentro lo schermo è un logo;
   una che deborda è un posto in cui sei dentro.

   Il raggio è la misura che conta per la profondità: due virgola
   cinquantacinque vuol dire che il filamento davanti e quello
   dietro distano cinque unità, contro una distanza della
   telecamera di tredici e mezzo. Trentotto per cento di
   differenza, e la prospettiva fa il lavoro da sola. */
const GIRI = 2.0
const ALTEZZA = 10.6
const RAGGIO = 2.55

/* I due filamenti sono opposti — sfasati di mezzo giro — e non
   sfalsati come nel DNA vero. Così i bastoncini attraversano per
   il diametro invece che per una corda, si vedono lunghi, e la
   struttura si legge da qualunque angolo la si guardi. */
const SFASAMENTO = Math.PI

export const PIOLI = 8

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

     Quarantadue per cento e non trenta: con trenta le catene
     avevano quarantasette sfere l'una e si sovrapponevano fino a
     diventare un tubo. Nel fotogramma di riferimento fra una sfera
     e l'altra si vede il nero — sono oggetti in fila, non una
     salsiccia — e per averlo servono meno sfere e più grandi. */
  const LIBERE = Math.round(N * 0.42)
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

  /* ── i due filamenti ── */
  for (let filo = 0; filo < 2; filo++) {
    for (let j = 0; j < perFilo; j++) {
      const t = (j + 0.5) / perFilo
      const [x, y, z] = suElica(t, filo)
      /* fuori asse di poco: infilzate su un tubo perfetto
         sembrerebbero una collana di perle da mercatino */
      const sp = 0.14
      elica[k * 3] = x + (caso(k * 2.3 + 5) - 0.5) * sp
      elica[k * 3 + 1] = y + (caso(k * 4.1 + 6) - 0.5) * sp * 1.6
      elica[k * 3 + 2] = z + (caso(k * 6.7 + 7) - 0.5) * sp

      /* Le misure sulle catene variano parecchio ma non troppo:
         devono toccarsi. Con lo scarto pieno una piccola in mezzo
         a due grandi lascia un buco e la catena si spezza. */
      misura[k] = 0.25 + caso(k * 8.1 + 61) * 0.20

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

  /* ── i bastoncini ────────────────────────────────────────────
     Otto, uno ogni ottavo di elica, ciascuno da un filamento
     all'altro. Sono l'unica cosa della scena che non è una sfera,
     e bastano loro a far sembrare tutto il resto tenuto insieme. */
  const pA = new Float32Array(PIOLI * 3)
  const pB = new Float32Array(PIOLI * 3)
  const pRitardo = new Float32Array(PIOLI)
  for (let i = 0; i < PIOLI; i++) {
    const t = (i + 0.5) / PIOLI
    const A = suElica(t, 0), B = suElica(t, 1)
    pA[i * 3] = A[0]; pA[i * 3 + 1] = A[1]; pA[i * 3 + 2] = A[2]
    pB[i * 3] = B[0]; pB[i * 3 + 1] = B[1]; pB[i * 3 + 2] = B[2]
    /* dopo le sfere, e dal centro verso le estremità come loro */
    pRitardo[i] = 0.34 + Math.abs(t - 0.5) * 2 * 0.30
  }

  /* Il campo sparso di partenza: costruito nel cono della
     telecamera, così le misure apparenti nascono dalla distanza. */
  const caos = campoProspettico(N, 11, 18, 8.0, 32, 1.16)

  return { n: N, caos, elica, misura, nascita, ritardo, pA, pB, pRitardo }
}
