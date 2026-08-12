/* ═══════════════════════════════════════════════════════════════
   L'IMPIANTO DEL SITO
   Due elenchi, e da questi nasce tutto il resto.

   CAPITOLI  quanto spazio occupa ogni testo, misurato in schermate.
             Da qui vengono sia l'altezza del documento sia il
             momento in cui ogni sezione compare.

   SCENA     che cosa fa la scena 3D in ciascun capitolo. Prima
             questi tempi erano numeri assoluti sparsi in due file
             — "i frutti escono alla schermata 3,25" — e bastava
             aggiungere un capitolo per sfasare tutto. Adesso la
             scena segue i capitoli, e aggiungerne uno non rompe
             più niente.
   ═══════════════════════════════════════════════════════════════ */

export const CAPITOLI = [
  /* Quasi quattro schermate solo per l'apertura. Erano due e
     quattro, e la composizione ci stava dentro a fatica: le sfere
     arrivavano e si radunavano quasi insieme, e quello che nel
     video dura mezzo minuto qui durava tre secondi di rotellina.
     Un'apertura lunga si può sempre saltare col pulsante; una
     corta non si può allungare mentre la guardi. */
  { id: 'apertura', h: 3.8, nome: 'Apertura' },
  { id: 'chisono', h: 2.2, nome: 'Chi sono' },
  { id: 'strumenti', h: 2.2, nome: 'La strumentazione' },
  { id: 'condizioni', h: 2.2, nome: 'La tua condizione' },
  { id: 'prenota', h: 2.8, nome: 'Prenota' },
  { id: 'recensioni', h: 1.8, nome: 'Recensioni' },
]

/* una schermata vuota in fondo: senza, l'ultimo capitolo non
   arriverebbe mai a compimento — l'ultima schermata di un documento
   si vede ma non si scorre */
export const CODA = 1.0

/* Quanto ogni sistema sta in PRIMO PIANO, capitolo per capitolo.
   Non è più "c'è / non c'è": è una distanza.

     elica    1 protagonista · 0,2 fondale lontano · 0 assente
     disegno  0 assente · 1 presente

   Il cambio è quello chiesto guardando il video: l'elica non si
   sgretola quando finisce l'apertura. Resta composta e ARRETRA.
   Nella schermata dopo la si vede ancora, piccola e in fondo alla
   nebbia, dietro il testo; poi si fa da parte per i disegni degli
   strumenti; poi torna avanti sulle recensioni.

   Sgretolarsi e ricomporsi a ogni capitolo era un effetto: la
   figura si disfaceva perché sapevo farla disfare. Un oggetto che
   resta e si allontana è invece un posto — te lo lasci indietro,
   ma è sempre lì. */
export const SCENA = [
  { elica: 1.00, disegno: 0 },   // 0 · apertura — protagonista
  { elica: 0.28, disegno: 0 },   // 1 · chi sono — resta, ma lontana
  /* Nei due capitoli dei disegni l'elica sparisce del tutto. A
     0,16 restava un pulviscolo sparso su tutto lo schermo che si
     sommava alle particelle del disegno, e due nuvole insieme
     fanno confusione, non profondità. Qui il soggetto è lo
     strumento: tutto il resto si toglie di mezzo. */
  { elica: 0.00, disegno: 1 },   // 2 · strumentazione
  { elica: 0.00, disegno: 1 },   // 3 · la tua condizione
  { elica: 0.30, disegno: 0 },   // 4 · prenota — riaffiora
  /* Sulle recensioni torna, ma non del tutto in primo piano: qui
     c'è da leggere il giudizio di qualcuno, che è la cosa più
     importante della pagina per chi sta ancora decidendo. A uno
     l'elica riempiva mezzo schermo e la recensione diventava una
     didascalia. */
  { elica: 0.62, disegno: 0 },   // 5 · recensioni — torna la firma
]

export function inizioDi(indice) {
  return CAPITOLI.slice(0, indice).reduce((s, c) => s + c.h, 0)
}

export const TOTALE_SCHERMATE = CAPITOLI.reduce((s, c) => s + c.h, 0)

/* l'indice del capitolo a cui appartiene una data schermata */
export function capitoloA(schermate) {
  let resto = schermate, i = 0
  while (i < CAPITOLI.length - 1 && resto >= CAPITOLI[i].h) { resto -= CAPITOLI[i].h; i++ }
  return i
}

/* Da dove a dove avviene il cambio di scena, dentro un capitolo.
   Sta in fondo apposta: per i primi quattro quinti del capitolo la
   figura resta com'è — composta e viva — e comincia a sgretolarsi
   solo quando si sta già andando verso quello dopo. Prima partiva
   al 62% e la figura non stava mai ferma abbastanza da guardarla;
   poi all'82%, che con l'apertura allungata cadeva addirittura
   prima che la composizione fosse finita. All'88% ogni figura
   resta ferma e viva per oltre mezza schermata. */
export const CAMBIO_DA = 0.88
export const CAMBIO_A = 1.0

/**
 * Quanto un sistema della scena è presente adesso: si interpola fra
 * il capitolo corrente e il successivo, nella finestra qui sopra.
 */
export function presenzaScena(chiave, capitolo, q) {
  const a = SCENA[Math.min(SCENA.length - 1, capitolo)][chiave]
  const b = SCENA[Math.min(SCENA.length - 1, capitolo + 1)][chiave]
  if (a === b) return a
  const t = Math.max(0, Math.min(1, (q - CAMBIO_DA) / (CAMBIO_A - CAMBIO_DA)))
  const m = t * t * (3 - 2 * t)
  return a + (b - a) * m
}
