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

export function avviaScroll() {
  if (avviato) return
  avviato = true

  const leggi = () => {
    scroll.grezzo = window.scrollY / Math.max(1, window.innerHeight)
  }
  leggi()
  window.addEventListener('scroll', leggi, { passive: true })
  window.addEventListener('resize', leggi)

  let precedente = performance.now()
  const passo = (ora) => {
    const dt = Math.min(0.05, (ora - precedente) / 1000)
    precedente = ora
    scroll.schermate += (scroll.grezzo - scroll.schermate) * (1 - Math.exp(-dt * 5.5))
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
