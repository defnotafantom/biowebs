/* ═══════════════════════════════════════════════════════════════
   L'ELICA DI FRUTTA
   Le particelle dell'apertura non sono sferette: sono i frutti veri
   ritagliati dal logo del dottore. Fluttuano sparsi, poi si radunano
   e ricompongono l'elica del suo marchio.

   Due popolazioni, come nel logo:
     · i frutti   — pochi e grossi, stanno sui due filamenti
     · i chicchi  — tanti e piccoli, fanno i filamenti e i pioli

   E una parte di entrambi non si raduna mai: resta a fluttuare
   attorno. Nel logo stampato è così, ed è quel disordine residuo
   a impedire che sembri un rendering di plastica.
   ═══════════════════════════════════════════════════════════════ */

import { campoProspettico } from '../lib/nuvola'

const BASE_FRUTTI = 40
const BASE_CHICCHI = 620

/* Le proporzioni contano più di tutto il resto: con i frutti troppo
   grossi, o troppi, i due filamenti si toccano e l'elica diventa una
   colonna. Deve restare il vuoto in mezzo — è quello a farla leggere
   come un'elica invece che come un grappolo.

   E i chicchi devono essere fitti al punto da toccarsi: due filamenti
   punteggiati sembrano due file di puntini, due filamenti continui
   sembrano due corde che si avvitano. La distanza fra un chicco e
   l'altro è 0,15 unità contro una misura di 0,18 — si sovrappongono
   appena, ed è esattamente quello che serve. */
const GIRI = 2.2
const ALTEZZA = 8.2
const RAGGIO = 1.78
const PIOLI = 9

export function caso(i) {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

const suElica = (t, filo) => {
  const a = t * GIRI * Math.PI * 2 + (filo ? Math.PI * 0.66 : 0)
  return [Math.cos(a) * RAGGIO, (t - 0.5) * ALTEZZA, Math.sin(a) * RAGGIO]
}

export function costruisciElica(fattore = 1) {
  const N_FRUTTI = Math.max(18, Math.round(BASE_FRUTTI * Math.sqrt(fattore)))
  const N_CHICCHI = Math.max(180, Math.round(BASE_CHICCHI * fattore))
  const LIBERI_FRUTTI = Math.round(N_FRUTTI * 0.3)
  const LIBERI_CHICCHI = Math.round(N_CHICCHI * 0.065)

  /* ── quando compare ognuna ────────────────────────────────────
     È questo il pezzo che mancava. Prima le sfere c'erano tutte
     e seicentosessanta dal primo fotogramma, e una nuvola piena
     non ha da dove crescere: si vedeva uno sciame che si stringe,
     non un vuoto che si popola.

     Adesso ognuna ha un momento in cui nasce. I frutti per primi
     — sono pochi e grossi, e quattro sfere grandi in mezzo al
     nero reggono uno schermo, quattro granelli no. I chicchi
     arrivano dopo, e sono loro a portare la densità. */
  const fNascita = new Float32Array(N_FRUTTI)
  const cNascita = new Float32Array(N_CHICCHI)
  for (let i = 0; i < N_FRUTTI; i++) fNascita[i] = caso(i * 3.7 + 91) * 0.55
  /* I chicchi tardi, e con una curva: sono seicentoventi, e se
     entrano in fila indiana riempiono lo schermo in un attimo.
     L'esponente li accumula verso la fine. */
  for (let i = 0; i < N_CHICCHI; i++) {
    cNascita[i] = 0.10 + Math.pow(caso(i * 5.3 + 92), 0.38) * 0.90
  }

  /* ── il campo sparso ──────────────────────────────────────────
     La telecamera in apertura sta a una ventina di unità. I frutti
     vanno da nove a trentaquattro: quello a nove riempie mezzo
     schermo, quello a trentaquattro è un puntino nella nebbia. È
     quello scarto a fare il campo profondo del video.

     I chicchi cominciano più lontano — sono già piccoli di loro, e
     uno grosso in primo piano si legge come un frutto sbagliato. */
  /* costruito per una telecamera a 18: è lì che sta nel primo
     fotogramma, prima di arretrare a 22,5 mentre l'elica si forma */
  const fCaos = campoProspettico(N_FRUTTI, 11, 18, 8.5, 32, 1.16)
  const cCaos = campoProspettico(N_CHICCHI, 41, 18, 12.0, 36, 1.16)

  /* ── i frutti sui filamenti ── */
  const fElica = new Float32Array(N_FRUTTI * 3)
  const attaccati = N_FRUTTI - LIBERI_FRUTTI
  for (let i = 0; i < attaccati; i++) {
    const filo = i % 2
    const j = Math.floor(i / 2)
    const perFilo = Math.ceil(attaccati / 2)
    const t = (j + 0.5) / perFilo
    const [x, y, z] = suElica(t, filo)
    /* un filo fuori asse: i frutti non sono infilzati su un tubo */
    const sp = 0.22
    fElica[i * 3] = x * (1 + (caso(i * 2.3 + 5) - 0.5) * 0.16)
    fElica[i * 3 + 1] = y + (caso(i * 4.1 + 6) - 0.5) * sp
    fElica[i * 3 + 2] = z * (1 + (caso(i * 6.7 + 7) - 0.5) * 0.16)
  }
  /* quelli che restano a fluttuare, vicini ma staccati */
  for (let i = attaccati; i < N_FRUTTI; i++) {
    const k = i - attaccati
    const a = caso(k * 7.3 + 21) * Math.PI * 2
    const r = 2.4 + caso(k * 3.9 + 22) * 2.6
    fElica[i * 3] = Math.cos(a) * r
    fElica[i * 3 + 1] = (caso(k * 5.1 + 23) - 0.5) * ALTEZZA * 1.15
    fElica[i * 3 + 2] = Math.sin(a) * r * 0.7
  }

  /* ── i chicchi: i filamenti e i pioli ── */
  const cElica = new Float32Array(N_CHICCHI * 3)
  const legati = N_CHICCHI - LIBERI_CHICCHI
  const suiFili = Math.round(legati * 0.60)
  const perFilo = Math.floor(suiFili / 2)
  let k = 0
  const metti = (x, y, z) => {
    cElica[k * 3] = x; cElica[k * 3 + 1] = y; cElica[k * 3 + 2] = z; k++
  }

  for (let filo = 0; filo < 2; filo++) {
    for (let j = 0; j < perFilo; j++) {
      const t = (j + 0.5) / perFilo
      const [x, y, z] = suElica(t, filo)
      const s = 0.085
      metti(
        x + (caso(k * 1.3 + 31) - 0.5) * s,
        y + (caso(k * 2.7 + 32) - 0.5) * s,
        z + (caso(k * 4.1 + 33) - 0.5) * s
      )
    }
  }
  const suiPioli = legati - k
  for (let j = 0; j < suiPioli; j++) {
    const nodo = Math.floor((j / suiPioli) * PIOLI)
    const t = (nodo + 0.5) / PIOLI
    const A = suElica(t, 0), B = suElica(t, 1)
    const u = (j % Math.ceil(suiPioli / PIOLI) + 0.5) / Math.ceil(suiPioli / PIOLI)
    metti(
      A[0] + (B[0] - A[0]) * u,
      A[1] + (B[1] - A[1]) * u + (caso(j * 9.4 + 34) - 0.5) * 0.07,
      A[2] + (B[2] - A[2]) * u
    )
  }
  for (let j = k; j < N_CHICCHI; j++) {
    const a = caso(j * 7.7 + 51) * Math.PI * 2
    const r = 2.2 + caso(j * 3.3 + 52) * 3.4
    cElica[j * 3] = Math.cos(a) * r
    cElica[j * 3 + 1] = (caso(j * 5.9 + 53) - 0.5) * ALTEZZA * 1.3
    cElica[j * 3 + 2] = Math.sin(a) * r * 0.7
  }

  /* misure e appartenenza allo sprite dell'atlante */
  const fMisura = new Float32Array(N_FRUTTI)
  const cMisura = new Float32Array(N_CHICCHI)
  for (let i = 0; i < N_FRUTTI; i++) fMisura[i] = 0.44 + caso(i * 8.1 + 61) * 0.26
  for (let i = 0; i < N_CHICCHI; i++) cMisura[i] = 0.13 + caso(i * 9.7 + 62) * 0.10

  return {
    nF: N_FRUTTI, nC: N_CHICCHI,
    fCaos, fElica, fMisura, fNascita,
    cCaos, cElica, cMisura, cNascita,
  }
}
