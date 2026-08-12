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

/* Che cosa c'è in scena, capitolo per capitolo.

     elica    1 la struttura è composta e in primo piano
              0 le sfere sono disperse e fanno da fondale
     vetrina  la colonna con l'ologramma dello strumento

   Le sfere ci sono SEMPRE. Non è più "compaiono e spariscono": si
   radunano una volta nell'apertura, restano composte per tutto il
   primo capitolo, e poi si sciolgono — e da lì in avanti sono il
   fondo del sito, per sempre.

   È la differenza fra un effetto e un ambiente. Un effetto lo
   accendi e lo spegni; un ambiente c'è e basta, e ogni tanto ti
   accorgi che c'è. */
export const SCENA = [
  { elica: 1, vetrina: 0 },   // 0 · apertura — si radunano
  { elica: 1, vetrina: 0 },   // 1 · chi sono — resta, poi si scioglie
  { elica: 0, vetrina: 1 },   // 2 · strumentazione — la vetrina
  { elica: 0, vetrina: 0 },   // 3 · la tua condizione — solo fondale
  { elica: 0, vetrina: 0 },   // 4 · prenota — solo fondale
  { elica: 0, vetrina: 0 },   // 5 · recensioni — solo fondale
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
