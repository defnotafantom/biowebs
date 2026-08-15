import { CAPITOLI, TOTALE_SCHERMATE } from './capitoli'

/* ═══════════════════════════════════════════════════════════════
   LO SCORRIMENTO
   Un unico punto di verità, letto sia dalla scena 3D sia dai testi.
   Non passa da React: se aggiornassimo lo stato sessanta volte al
   secondo il sito scatterebbe. Qui scriviamo su un oggetto condiviso
   e chi ne ha bisogno lo legge quando gli serve.

     .schermate  a che punto siamo, misurato in altezze di finestra
     .capitolo   in quale capitolo di testo siamo (0 = apertura)
     .q          quanto siamo dentro il capitolo, da 0 a 1
     .chiave     fra quali due forme stiamo passando
     .t          quanto siamo avanti nel passaggio, da 0 a 1

   Tutto è già ammorbidito: i valori inseguono lo scorrimento reale
   con un ritardo elastico. È quel ritardo a dare il senso di peso.
   ═══════════════════════════════════════════════════════════════ */

export const scroll = {
  grezzo: 0,
  schermate: 0,
  capitolo: 0,
  q: 0,
  apertura: 0,
  totale: TOTALE_SCHERMATE,
}

/* Il canale fra la pagina e la scena.
   La pagina scrive qui, la scena legge: è così che passando il mouse
   su una voce dell'elenco il disegno accanto cambia soggetto.
   Non si azzerano all'uscita del mouse: l'ultima cosa che hai
   guardato resta disegnata, che è più gentile di uno schermo vuoto. */
export const stato = {
  frazione: 0.22,      // il cursore della composizione corporea
  strumento: 0,        // quale dei cinque strumenti
  area: 0,             // quale dei quattro percorsi
}

/* comodo per capire cosa sta succedendo: dalla console del browser
   si legge window.bio.scroll e si vede a che capitolo siamo */
if (typeof window !== 'undefined') window.bio = { scroll, stato }

let avviato = false

/* Quanto in fretta la scena raggiunge la posizione vera del dito.
   Era cinque e mezzo, cioè un ritardo di quasi due decimi: si
   scorreva, e la figura arrivava dopo. Su un sito dove l'unica
   cosa che accade È lo scorrimento, quel ritardo si legge come
   "il sito non mi sta ascoltando".

   Diciotto vuol dire cinquantacinque millesimi: tre fotogrammi.
   Abbastanza da togliere lo scatto della rotellina — che salta di
   cento pixel per volta e senza filtro farebbe sobbalzare la
   scena — e abbastanza poco da sembrare attaccato al dito. */
const INSEGUIMENTO = 18

/* Sotto questa soglia si smette di inseguire e ci si mette esatti.
   Senza, la differenza non arriva mai a zero e la scena continua a
   correggersi di millesimi per sempre: invisibile, ma tiene sveglia
   la scheda grafica anche a pagina ferma. */
const FERMO = 0.0004

export function avviaScroll() {
  if (avviato) return
  avviato = true

  scroll.grezzo = window.scrollY / Math.max(1, window.innerHeight)
  scroll.schermate = scroll.grezzo

  let precedente = performance.now()
  const passo = (ora) => {
    const dt = Math.min(0.05, (ora - precedente) / 1000)
    precedente = ora

    /* La posizione si legge QUI, dentro il fotogramma, e non
       nell'evento di scorrimento.

       È la riga che cambia il tatto del sito. L'evento arriva
       quando il browser ha voglia: su iOS, durante lo slancio del
       dito, arriva a raffica e in ritardo, e a volte non arriva
       affatto finché il dito non si stacca. scrollY invece è
       sempre il valore vero dell'istante in cui stiamo per
       disegnare — quindi la scena segue il dito e non gli eventi
       che lo raccontano. */
    scroll.grezzo = window.scrollY / Math.max(1, window.innerHeight)

    const d = scroll.grezzo - scroll.schermate
    if (Math.abs(d) < FERMO) scroll.schermate = scroll.grezzo
    else scroll.schermate += d * (1 - Math.exp(-dt * INSEGUIMENTO))

    aggiorna()
    requestAnimationFrame(passo)
  }
  requestAnimationFrame(passo)
}

/* isolata così i test possono chiamarla senza una finestra */
export function aggiorna() {
  const s = scroll.schermate

  let resto = s, i = 0
  while (i < CAPITOLI.length - 1 && resto >= CAPITOLI[i].h) { resto -= CAPITOLI[i].h; i++ }
  scroll.capitolo = i
  scroll.q = clamp(resto / CAPITOLI[i].h)
  scroll.apertura = clamp(s / CAPITOLI[0].h)
}

/* ── utilità di interpolazione ── */

export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v))

/* riporta un valore da un intervallo qualsiasi a 0–1 */
export const fascia = (v, da, a) => clamp((v - da) / (a - da))

/* accelera e poi rallenta: il movimento naturale */
export const morbida = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/* parte deciso e si posa piano: buona per gli arrivi */
export const arrivo = (t) => 1 - Math.pow(1 - t, 4)

export const mescola = (a, b, t) => a + (b - a) * t
