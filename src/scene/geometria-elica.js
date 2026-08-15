import { campoProspettico } from '../lib/nuvola'

/* ═══════════════════════════════════════════════════════════════
   L'ELICA
   Due popolazioni, come nel logo del dottore:

     · i FRUTTI   pochi e grossi, appoggiati sui due filamenti
     · i CHICCHI  tanti e minuscoli, e sono LORO a disegnare

   I chicchi fanno due corde continue che si avvitano, e nove file
   trasversali da una corda all'altra. I frutti stanno sopra, uno
   ogni tanto, come le perle su un filo.

   ── perché si torna qui ────────────────────────────────────────
   Questa è la costruzione del 12 agosto, ed è quella che il
   committente aveva approvato. Nel frattempo l'ho rifatta due
   volte con le sfere grandi in catena, e tutte e due le volte è
   stata respinta — la seconda con le parole "riproduzione di
   scarsissima qualità della precedente". Erano giuste.

   Il punto che avevo mancato è nella sua prima frase: "le linee
   che collegano le sfere sono diverse". Le LINEE. Nella versione
   buona i collegamenti non erano oggetti — erano file di chicchi,
   cioè tratti di matita. Sostituirli con otto cilindri ha
   cambiato il disegno da "una cosa disegnata" a "una cosa
   montata", e nessuna quantità di ritocchi ai cilindri poteva
   rimediare, perché il difetto era la loro esistenza.

   Un filamento di chicchi è una LINEA: la leggi come tratto. Un
   filamento di sfere grandi è una CATENA: la leggi come oggetti
   in fila. Il logo è disegnato, quindi vuole linee.
   ═══════════════════════════════════════════════════════════════ */

const BASE_FRUTTI = 40
const BASE_CHICCHI = 620

/* Le proporzioni contano più di tutto il resto: con i frutti troppo
   grossi, o troppi, i due filamenti si toccano e l'elica diventa una
   colonna. Deve restare il vuoto in mezzo — è quello a farla leggere
   come un'elica invece che come un grappolo.

   E i chicchi devono essere fitti al punto da toccarsi: due filamenti
   punteggiati sembrano due file di puntini, due filamenti continui
   sembrano due corde che si avvitano. */
const GIRI = 2.2
const ALTEZZA = 8.2
const RAGGIO = 1.78
const PIOLI = 9

/* Due terzi di giro, non mezzo: è lo sfasamento che dà i due
   solchi del DNA, uno largo e uno stretto. A mezzo giro esatto i
   filamenti sono opposti e la figura diventa simmetrica in un modo
   che il DNA non ha. */
const SFASAMENTO = Math.PI * 0.66

export function caso(i) {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

const suElica = (t, filo) => {
  const a = t * GIRI * Math.PI * 2 + (filo ? SFASAMENTO : 0)
  return [Math.cos(a) * RAGGIO, (t - 0.5) * ALTEZZA, Math.sin(a) * RAGGIO]
}

/**
 * @param {number} fattore 1 sul computer, meno sui telefoni.
 */
export function costruisciElica(fattore = 1) {
  const nF = Math.max(18, Math.round(BASE_FRUTTI * Math.sqrt(fattore)))
  const nC = Math.max(180, Math.round(BASE_CHICCHI * fattore))
  const n = nF + nC

  /* Un solo elenco per tutte: prima i frutti, poi i chicchi. La
     scheda grafica disegna un oggetto solo, e il resto del codice
     non deve sapere che ci sono due popolazioni — gli basta
     `grande` per scegliere la tavolozza. */
  const elica = new Float32Array(n * 3)
  const misura = new Float32Array(n)
  const nascita = new Float32Array(n)
  const ritardo = new Float32Array(n)
  const grande = new Uint8Array(n)

  /* ── i frutti sui filamenti ─────────────────────────────────── */
  const LIBERI_F = Math.round(nF * 0.3)
  const attaccati = nF - LIBERI_F
  const fPerFilo = Math.ceil(attaccati / 2)
  for (let i = 0; i < attaccati; i++) {
    const filo = i % 2
    const j = Math.floor(i / 2)
    const t = (j + 0.5) / fPerFilo
    const [x, y, z] = suElica(t, filo)
    /* un filo fuori asse: i frutti non sono infilzati su un tubo */
    elica[i * 3] = x * (1 + (caso(i * 2.3 + 5) - 0.5) * 0.16)
    elica[i * 3 + 1] = y + (caso(i * 4.1 + 6) - 0.5) * 0.22
    elica[i * 3 + 2] = z * (1 + (caso(i * 6.7 + 7) - 0.5) * 0.16)
    ritardo[i] = Math.abs(t - 0.5) * 2 * 0.16
  }
  /* quelli che restano a fluttuare, vicini ma staccati */
  for (let i = attaccati; i < nF; i++) {
    const k = i - attaccati
    const a = caso(k * 7.3 + 21) * Math.PI * 2
    const r = 2.4 + caso(k * 3.9 + 22) * 2.6
    elica[i * 3] = Math.cos(a) * r
    elica[i * 3 + 1] = (caso(k * 5.1 + 23) - 0.5) * ALTEZZA * 1.15
    elica[i * 3 + 2] = Math.sin(a) * r * 0.7
    ritardo[i] = 0.18 + caso(k * 9.3 + 24) * 0.14
  }
  for (let i = 0; i < nF; i++) {
    grande[i] = 1
    /* la misura è già quella finale: 0,18–0,28 di raggio */
    misura[i] = 0.176 + caso(i * 8.1 + 61) * 0.104
    /* I frutti nascono per primi. Sono pochi e grossi, e quattro
       sfere grandi in mezzo al nero reggono uno schermo — quattro
       granelli no. */
    nascita[i] = caso(i * 3.7 + 91) * 0.55
  }

  /* ── i chicchi: le corde e i pioli ──────────────────────────── */
  const LIBERI_C = Math.round(nC * 0.065)
  const legati = nC - LIBERI_C
  const suiFili = Math.round(legati * 0.60)
  const cPerFilo = Math.floor(suiFili / 2)
  let k = 0
  const metti = (x, y, z) => {
    const i = nF + k
    elica[i * 3] = x; elica[i * 3 + 1] = y; elica[i * 3 + 2] = z
    k++
    return i
  }

  /* le due corde. Con cento e passa chicchi per filamento la
     distanza fra l'uno e l'altro è meno del loro diametro: si
     sovrappongono appena, ed è esattamente quello che serve
     perché si legga un tratto continuo e non una fila di punti. */
  for (let filo = 0; filo < 2; filo++) {
    for (let j = 0; j < cPerFilo; j++) {
      const t = (j + 0.5) / cPerFilo
      const [x, y, z] = suElica(t, filo)
      const s = 0.085
      const i = metti(
        x + (caso(k * 1.3 + 31) - 0.5) * s,
        y + (caso(k * 2.7 + 32) - 0.5) * s,
        z + (caso(k * 4.1 + 33) - 0.5) * s
      )
      ritardo[i] = Math.abs(t - 0.5) * 2 * 0.20
    }
  }

  /* I pioli, e sono la risposta a "le linee non sono nemmeno
     collegate sfera-sfera, alcune vanno nel vuoto".

     Un piolo non è un oggetto teso fra due punti: è una fila di
     chicchi interpolati fra un punto dell'elica e l'altro, con
     gli stessi chicchi delle corde. Parte da dentro una corda e
     arriva dentro l'altra, perché il primo e l'ultimo cadono
     esattamente sopra la corda. Non c'è nessun modo in cui possa
     finire nel vuoto: è fatto della corda stessa. */
  const suiPioli = legati - k
  const perPiolo = Math.ceil(suiPioli / PIOLI)
  for (let j = 0; j < suiPioli; j++) {
    const nodo = Math.floor((j / suiPioli) * PIOLI)
    const t = (nodo + 0.5) / PIOLI
    const A = suElica(t, 0), B = suElica(t, 1)
    const u = (j % perPiolo + 0.5) / perPiolo
    const i = metti(
      A[0] + (B[0] - A[0]) * u,
      A[1] + (B[1] - A[1]) * u + (caso(j * 9.4 + 34) - 0.5) * 0.07,
      A[2] + (B[2] - A[2]) * u
    )
    /* i pioli arrivano dopo le corde: prima le due spirali, poi
       quello che le tiene insieme */
    ritardo[i] = 0.22 + Math.abs(t - 0.5) * 2 * 0.14
  }

  /* i chicchi che non si legano a niente e restano a fluttuare */
  for (let j = k; j < nC; j++) {
    const i = nF + j
    const a = caso(j * 7.7 + 51) * Math.PI * 2
    const r = 2.2 + caso(j * 3.3 + 52) * 3.4
    elica[i * 3] = Math.cos(a) * r
    elica[i * 3 + 1] = (caso(j * 5.9 + 53) - 0.5) * ALTEZZA * 1.3
    elica[i * 3 + 2] = Math.sin(a) * r * 0.7
    ritardo[i] = 0.20 + caso(j * 9.1 + 54) * 0.16
  }

  for (let j = 0; j < nC; j++) {
    const i = nF + j
    misura[i] = 0.068 + caso(j * 9.7 + 62) * 0.052
    /* I chicchi tardi, e con una curva: sono seicentoventi, e se
       entrano in fila indiana riempiono lo schermo in un attimo.
       L'esponente li accumula verso la fine. */
    nascita[i] = 0.10 + Math.pow(caso(j * 5.3 + 92), 0.38) * 0.90
  }

  /* ── il campo sparso di partenza ──────────────────────────────
     I frutti possono venire vicini — uno a otto unità e mezzo
     riempie mezzo schermo, ed è l'accento in primo piano. I
     chicchi cominciano più lontano: sono già piccoli di loro, e
     uno grosso davanti si legge come un frutto sbagliato. */
  const caos = new Float32Array(n * 3)
  caos.set(campoProspettico(nF, 11, 18, 8.5, 32, 1.16), 0)
  caos.set(campoProspettico(nC, 41, 18, 12.0, 36, 1.16), nF * 3)

  /* ── il fondale ───────────────────────────────────────────────
     Dove finiscono le sfere quando l'elica si è dissolta, e dove
     restano per tutto il resto del sito. Stesso campo prospettico,
     con la fascia centrale dello schermo vuota al quarantaquattro
     per cento: lì ci vanno i testi, e una sfera dietro una parola
     resta un disturbo anche a fondo scala. */
  const fondo = new Float32Array(n * 3)
  fondo.set(campoProspettico(nF, 305, 18, 13.0, 40, 1.24, 0.44), 0)
  fondo.set(campoProspettico(nC, 407, 18, 15.0, 44, 1.24, 0.44), nF * 3)

  return { n, nF, caos, fondo, elica, misura, nascita, ritardo, grande }
}
