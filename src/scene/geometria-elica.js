import { campoProspettico } from '../lib/nuvola'

/* ═══════════════════════════════════════════════════════════════
   L'ELICA
   Sfere grandi, distanziate, con il nero fra l'una e l'altra, e
   bastoncini sottili che vanno da una sfera all'altra.

   ── le misure vengono dal video, non dal gusto ─────────────────
   Il committente ha mandato la registrazione della versione che
   vuole, e le proporzioni si possono leggere in pixel. Prendendo
   come metro il bastoncino più lungo — quello visto di taglio, che
   attraversa per il diametro, cioè 5,1 unità — viene:

     bastoncino  7 px   →  raggio 0,05
     sfera piccola  15 px →  raggio 0,12
     sfera media    40 px →  raggio 0,31
     sfera grande   65 px →  raggio 0,50

   E soprattutto viene la SPAZIATURA: fra una sfera e l'altra del
   filamento si vede il fondo. Non si toccano.

   È l'errore che ho fatto due volte. La frase "la figura è meno
   compatta" l'ho letta come "le sfere devono toccarsi", e ho
   portato il filamento da 39 sfere a 66, ottenendo un tubo — una
   salsiccia lucida. Ma nel video le sfere sono LONTANE fra loro:
   quello che è compatto è la FIGURA nel suo insieme, non la fila.
   Trenta sfere per filamento, distanti più di un diametro l'una
   dall'altra, e la struttura si legge perché la tengono i
   bastoncini — non perché le sfere si toccano.
   ═══════════════════════════════════════════════════════════════ */

const BASE = 150

/* Il raggio è la misura che conta per la profondità: due virgola
   cinquantacinque vuol dire che il filamento davanti e quello
   dietro distano cinque unità, contro una distanza della
   telecamera di tredici e mezzo. Trentotto per cento di
   differenza, e la prospettiva fa il lavoro da sola.

   L'elica è più alta dell'inquadratura, ed è voluto: se ne vedono
   due giri e il resto si immagina. Una che ci sta tutta comoda
   dentro lo schermo è un logo; una che deborda è un posto in cui
   sei dentro. */
const GIRI = 2.0
const ALTEZZA = 10.6
const RAGGIO = 2.55

/* Mezzo giro esatto: i due filamenti sono opposti. Nel video i
   bastoncini attraversano per il DIAMETRO — si vedono lunghi, da
   un bordo all'altro della figura — e questo si ottiene solo con
   i filamenti diametralmente opposti. Con lo sfasamento del DNA
   vero (due terzi di giro) diventerebbero corde, si accorcerebbero
   di un terzo, e la figura perderebbe la sua larghezza. */
const SFASAMENTO = Math.PI

/* Quanti bastoncini si vogliono vedere. Il numero esatto lo decide
   la spaziatura delle sfere, perché ognuno deve partire e arrivare
   sul CENTRO di una sfera vera. */
const PIOLI_VOLUTI = 10

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
  const N = Math.max(70, Math.round(BASE * Math.sqrt(fattore)))

  /* Sessanta per cento non si lega a niente. Sono quelle che nel
     video stanno fuori dalla struttura: due o tre enormi in primo
     piano che entrano da un bordo, e una nuvola di puntini sul
     fondo. Senza di loro l'elica è un oggetto sospeso nel nulla;
     con loro è dentro qualcosa.

     Ed è tanto, sessanta, apposta: sui filamenti ne restano
     sessanta in tutto, trenta per parte, che è esattamente quello
     che serve perché fra l'una e l'altra si veda il fondo. */
  const LIBERE = Math.round(N * 0.60)
  const SU_FILO = N - LIBERE
  const perFilo = Math.floor(SU_FILO / 2)

  const elica = new Float32Array(N * 3)
  const misura = new Float32Array(N)
  const nascita = new Float32Array(N)
  const ritardo = new Float32Array(N)

  let k = 0

  /* ── i due filamenti ──────────────────────────────────────────
     Le sfere del filamento 0 stanno agli indici 0…perFilo-1,
     quelle del filamento 1 subito dopo. Serve saperlo: i
     bastoncini, più sotto, vanno a prendere le posizioni QUI
     DENTRO — non le ricalcolano. */
  for (let filo = 0; filo < 2; filo++) {
    for (let j = 0; j < perFilo; j++) {
      const t = (j + 0.5) / perFilo
      const [x, y, z] = suElica(t, filo)
      /* fuori asse di poco: infilzate su un tubo perfetto
         sembrerebbero una collana di perle da mercatino */
      const sp = 0.16
      elica[k * 3] = x + (caso(k * 2.3 + 5) - 0.5) * sp
      elica[k * 3 + 1] = y + (caso(k * 4.1 + 6) - 0.5) * sp * 1.6
      elica[k * 3 + 2] = z + (caso(k * 6.7 + 7) - 0.5) * sp

      /* Da 0,18 a 0,36. Misurato: nel video la sfera più grossa del
         filamento occupa 84 px su un fotogramma da 1902, che con
         l'inquadratura larga 16 unità fa 0,70 di diametro — cioè
         0,35 di raggio. Non 0,50, che è quanto avevo messo al primo
         tentativo e faceva sfere una volta e mezza troppo grosse:
         il filamento tornava a chiudersi e si riperdeva il nero fra
         l'una e l'altra.

         Lo scarto resta largo: sfere tutte uguali a distanze
         diverse l'occhio le legge come sfere uguali lontane, sfere
         diverse a distanze diverse le legge come uno spazio. */
      misura[k] = 0.18 + caso(k * 8.1 + 61) * 0.18

      /* Il ritardo del raduno: le sfere al centro dell'elica si
         mettono a posto per prime, e la struttura cresce verso le
         estremità. Si nota solo se manca — con i ritardi a caso
         sembra che si radunino alla rinfusa, con questo sembra
         che si costruisca. */
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
    /* Qui lo scarto è pieno: il quadrato tiene basse quasi tutte e
       ne lascia due o tre grosse. Sono quelle che nel video entrano
       da un bordo e occupano un quarto di schermo — servono a dire
       quanto è vicino il primo piano. */
    const g = caso(j * 8.1 + 62)
    misura[j] = 0.04 + g * g * 0.34
    ritardo[j] = 0.26 + caso(j * 9.3 + 24) * 0.22
    nascita[j] = Math.pow(caso(j * 3.7 + 91), 0.62)
  }

  /* ── i bastoncini ────────────────────────────────────────────
     Un bastoncino non ha coordinate proprie. Prende la sfera j del
     filamento 0 e la sfera j del filamento 1 dall'array che
     abbiamo appena riempito, e va dall'una all'altra.

     Prima si calcolavano da capo con suElica(): partivano dal
     punto MATEMATICO dell'elica, mentre le sfere stanno al punto
     matematico più uno scarto casuale, e per giunta erano otto
     contro trentanove sfere per filamento — cadevano fra una
     sfera e l'altra quasi sempre. "Le linee non sono nemmeno
     collegate sfera-sfera, alcune vanno nel vuoto": era esatto, e
     per costruzione. Adesso non possono, perché non sanno dove sia
     il vuoto — conoscono solo due centri di sfera. */
  const passo = Math.max(1, Math.round(perFilo / PIOLI_VOLUTI))
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
    const t = (j + 0.5) / perFilo
    pRitardo[i] = 0.34 + Math.abs(t - 0.5) * 2 * 0.30
  }

  /* Il campo sparso di partenza: costruito nel cono della
     telecamera, così le misure apparenti nascono dalla distanza. */
  const caos = campoProspettico(N, 11, 18, 8.0, 32, 1.16)

  /* ── il fondale ───────────────────────────────────────────────
     Dove finiscono le sfere quando l'elica si è dissolta, e dove
     restano per tutto il resto del sito. Stesso campo prospettico,
     con la fascia centrale dello schermo vuota al quarantaquattro
     per cento: lì ci vanno i testi, e una sfera dietro una parola
     resta un disturbo anche a fondo scala. */
  const fondo = campoProspettico(N, 305, 18, 11.0, 40, 1.24, 0.44)

  return { n: N, nPioli, caos, fondo, elica, misura, nascita, ritardo, pA, pB, pRitardo }
}
