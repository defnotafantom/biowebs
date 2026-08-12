import { campoProspettico } from '../lib/nuvola'
/* ═══════════════════════════════════════════════════════════════
   I DISEGNI
   Ogni voce del sito ha la sua illustrazione: puntando "plicometro"
   i punti compongono un plicometro, puntando "colon irritabile"
   un intestino. Sono disegni a filo — un contorno si riconosce
   molto prima di una macchia.

   Sono descritti qui a mano, con quattro primitive soltanto:
   linea, cerchio, arco, curva. Nessun file esterno, nessun SVG da
   caricare: sono numeri, e i numeri si possono correggere.

   Tutti i disegni restituiscono LO STESSO numero di punti, nello
   stesso ordine. È questo che permette di passare da un disegno
   all'altro come se si ridisegnasse da solo.
   ═══════════════════════════════════════════════════════════════ */

/* Quanti punti compongono un disegno. Il numero giusto dipende dalla
   lunghezza del tratto: il disegno più lungo è la bilancia, quaranta
   unità. Con 1200 punti i centri distano 0,035 e i punti hanno un
   diametro di 0,038 — si sfiorano appena, e il tratto resta continuo
   senza diventare una fila di palline. */
/* Da milleduecento a quattrocentoventi.
   Milleduecento punti da un pixel erano una grandinata: coprivano
   mezzo schermo, si muovevano tutti insieme e non somigliavano per
   niente alle sfere dell'elica, che sono poche e grosse. La regola
   della scena è una sola — sfere di frutta — e i disegni devono
   obbedirle come tutto il resto, se no sono due siti diversi
   attaccati con lo scotch.

   Trecentoventi e non quattrocentoventi: l'elica ne ha
   centotrentaquattro, e un disegno che ne usa il triplo torna a
   sembrare uno sciame. Il tratto si fa più punteggiato, ma è il
   prezzo giusto — meglio un disegno fatto di poche sfere
   riconoscibili che una linea continua di polvere. */
export const PUNTI_DISEGNO = 320

/* ── le primitive: ognuna restituisce una spezzata ── */

const linea = (...p) => p

function cerchio(cx, cy, r, n = 64) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
  })
}

function ellisse(cx, cy, rx, ry, n = 64) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]
  })
}

function arco(cx, cy, r, a0, a1, n = 32) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + (a1 - a0) * (i / n)
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
  })
}

/* curva quadratica: partenza, punto di comando, arrivo */
function curva(p0, pc, p1, n = 26) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n, u = 1 - t
    return [
      u * u * p0[0] + 2 * u * t * pc[0] + t * t * p1[0],
      u * u * p0[1] + 2 * u * t * pc[1] + t * t * p1[1],
    ]
  })
}

/* rettangolo con gli angoli smussati */
function scatola(x0, y0, x1, y1, r = 0.18) {
  return [
    ...arco(x1 - r, y1 - r, r, 0, Math.PI / 2, 8),
    ...arco(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, 8),
    ...arco(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5, 8),
    ...arco(x1 - r, y0 + r, r, Math.PI * 1.5, Math.PI * 2, 8),
    [x1, y1 - r],
  ]
}

/* onda: serve per la corrente, gli ultrasuoni, il tracciato */
function onda(x0, x1, y, amp, cicli, n = 60) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n
    return [x0 + (x1 - x0) * t, y + Math.sin(t * Math.PI * 2 * cicli) * amp]
  })
}

/* ── i disegni ── */

const D = {}

/* 01 · BIA — l'apparecchio con i cavi e gli elettrodi.
   La corrente entra da una parte e esce dall'altra: è così che
   funziona davvero, quattro elettrodi e un circuito chiuso. */
D.bia = () => [
  scatola(-2.5, -0.95, -0.5, 0.95, 0.22),
  scatola(-2.2, -0.15, -0.8, 0.62, 0.08),
  onda(-2.05, -0.95, 0.24, 0.22, 1.5, 30),
  linea([-2.1, -0.55], [-1.75, -0.55]),
  linea([-1.55, -0.55], [-1.2, -0.55]),
  curva([-0.5, 0.55], [1.0, 1.35], [1.95, 1.5]),
  curva([-0.5, -0.55], [1.0, -1.35], [1.95, -1.5]),
  scatola(1.95, 1.15, 2.75, 1.85, 0.12),
  scatola(1.95, -1.85, 2.75, -1.15, 0.12),
]

/* 02 · ADIPO — la sonda a ultrasuoni appoggiata sulla pelle,
   e sotto lo spessore che legge: il grasso sottocutaneo. */
D.adipo = () => [
  scatola(-0.62, 0.55, 0.62, 2.4, 0.26),
  linea([-0.62, 0.9], [0.62, 0.9]),
  linea([-0.38, 0.55], [-0.38, 0.2]),
  linea([0.38, 0.55], [0.38, 0.2]),
  linea([-2.7, 0.1], [2.7, 0.1]),
  arco(0, 0.1, 0.75, Math.PI * 1.12, Math.PI * 1.88, 20),
  arco(0, 0.1, 1.15, Math.PI * 1.15, Math.PI * 1.85, 24),
  arco(0, 0.1, 1.55, Math.PI * 1.18, Math.PI * 1.82, 28),
  linea([-2.7, -1.15], [2.7, -1.15]),
  linea([2.05, 0.1], [2.05, -1.15]),
  linea([1.85, -0.1], [2.05, 0.1], [2.25, -0.1]),
  linea([1.85, -0.95], [2.05, -1.15], [2.25, -0.95]),
  linea([-2.7, -2.1], [2.7, -2.1]),
]

/* 03 · ANTRO — il metro a nastro chiuso in circonferenza,
   con le tacche e il capo che pende. */
D.antro = () => {
  const s = [ellisse(0, 0.35, 2.15, 1.5, 72)]
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2
    const l = i % 4 === 0 ? 0.3 : 0.16
    s.push(linea(
      [Math.cos(a) * 2.15, 0.35 + Math.sin(a) * 1.5],
      [Math.cos(a) * (2.15 - l), 0.35 + Math.sin(a) * (1.5 - l * 0.7)]
    ))
  }
  s.push(curva([-2.0, -0.6], [-2.5, -1.6], [-1.5, -2.15]))
  s.push(curva([-1.55, -0.95], [-2.0, -1.5], [-1.15, -1.9]))
  s.push(scatola(-1.55, -2.25, -0.85, -1.75, 0.1))
  return s
}

/* 04 · PLICO — il plicometro che pizzica la plica.
   Due bracci, un perno, e in mezzo la piega di pelle. */
D.plico = () => [
  /* i due bracci incrociati, come una pinza */
  linea([-1.35, 2.25], [0.95, -1.05]),
  linea([1.35, 2.25], [-0.95, -1.05]),
  linea([-1.35, 2.25], [-1.75, 1.95]),
  linea([1.35, 2.25], [1.75, 1.95]),
  cerchio(0, 0.66, 0.2, 18),
  /* le ganasce */
  linea([-1.25, -1.05], [-0.42, -1.05]),
  linea([0.42, -1.05], [1.25, -1.05]),
  linea([-0.95, -1.05], [-0.95, -0.8]),
  linea([0.95, -1.05], [0.95, -0.8]),
  /* la plica pizzicata in mezzo, e la pelle ai lati */
  curva([-0.42, -1.35], [0, -0.35], [0.42, -1.35]),
  linea([-2.5, -1.35], [-0.42, -1.35]),
  linea([0.42, -1.35], [2.5, -1.35]),
  /* la scala graduata fra i bracci */
  arco(0, 0.66, 1.15, Math.PI * 0.28, Math.PI * 0.72, 18),
]

/* 05 · FORZA — il dinamometro da presa: l'impugnatura
   e il quadrante che dice quanti chili. */
D.forza = () => [
  curva([-1.7, 1.5], [0.6, 1.95], [1.7, 0.6]),
  curva([-1.7, -1.3], [0.6, -1.75], [1.7, -0.4]),
  curva([1.7, 0.6], [2.15, 0.1], [1.7, -0.4]),
  linea([-1.7, 1.5], [-1.7, -1.3]),
  linea([-1.25, 1.15], [-1.25, -0.95]),
  /* le due frecce che dicono "stringi" */
  linea([-2.35, 0.55], [-1.85, 0.55]),
  linea([-2.0, 0.7], [-1.85, 0.55], [-2.0, 0.4]),
  linea([-2.35, -0.35], [-1.85, -0.35]),
  linea([-2.0, -0.2], [-1.85, -0.35], [-2.0, -0.5]),
  cerchio(-0.15, 0.1, 1.0, 48),
  cerchio(-0.15, 0.1, 0.09, 12),
  linea([-0.15, 0.1], [0.42, 0.75]),
  ...Array.from({ length: 9 }, (_, i) => {
    const a = Math.PI * (0.82 + (i / 8) * 1.36)
    return linea(
      [-0.15 + Math.cos(a) * 1.0, 0.1 + Math.sin(a) * 1.0],
      [-0.15 + Math.cos(a) * 0.82, 0.1 + Math.sin(a) * 0.82]
    )
  }),
]

/* 06 · intestino — il grande giro del colon e le anse dentro */
/* un tubo, non un filo: due linee parallele e i due tappi tondi.
   Un intestino disegnato con una riga sola sembra uno scarabocchio;
   con due sembra un intestino. È tutta qui la differenza. */
function tubo(centro, r = 0.24) {
  const A = [], B = []
  for (let i = 0; i < centro.length; i++) {
    const p = centro[i]
    const a = centro[Math.max(0, i - 1)], b = centro[Math.min(centro.length - 1, i + 1)]
    let dx = b[0] - a[0], dy = b[1] - a[1]
    const l = Math.hypot(dx, dy) || 1
    dx /= l; dy /= l
    A.push([p[0] - dy * r, p[1] + dx * r])
    B.push([p[0] + dy * r, p[1] - dx * r])
  }
  const tappo = (i, verso) => {
    const c = centro[i]
    const angA = Math.atan2(A[i][1] - c[1], A[i][0] - c[0])
    const angB = Math.atan2(B[i][1] - c[1], B[i][0] - c[0])
    let d = angB - angA
    while (d > Math.PI) d -= Math.PI * 2
    while (d < -Math.PI) d += Math.PI * 2
    return arco(c[0], c[1], r, angA, angA + (verso > 0 ? d : d), 12)
  }
  return [A, B, tappo(0, 1), tappo(centro.length - 1, -1)]
}

D.intestino = () => {
  const R = 0.42, x0 = -1.15, x1 = 1.15
  const y = [1.55, 1.55 - 2 * R, 1.55 - 4 * R, 1.55 - 6 * R]
  const c = [[x1, 2.25], [x1, y[0]], [x0 + R, y[0]]]
  c.push(...arco(x0 + R, y[0] - R, R, Math.PI / 2, Math.PI * 1.5, 14))
  c.push([x1 - R, y[1]])
  c.push(...arco(x1 - R, y[1] - R, R, Math.PI / 2, -Math.PI / 2, 14))
  c.push([x0 + R, y[2]])
  c.push(...arco(x0 + R, y[2] - R, R, Math.PI / 2, Math.PI * 1.5, 14))
  c.push([0.45, y[3]], [0.45, -2.25])
  return tubo(c, 0.26)
}

/* 07 · peso — la bilancia, vista dall'alto */
D.peso = () => [
  scatola(-2.3, -1.75, 2.3, 1.75, 0.3),
  scatola(-2.05, -1.5, 2.05, 1.5, 0.2),
  cerchio(0, 0.1, 1.0, 48),
  arco(0, 0.1, 0.78, Math.PI * 0.78, Math.PI * 2.22, 40),
  linea([0, 0.1], [0.62, 0.72]),
  cerchio(0, 0.1, 0.08, 10),
  ...Array.from({ length: 7 }, (_, i) => {
    const a = Math.PI * (0.78 + (i / 6) * 1.44)
    return linea(
      [Math.cos(a) * 1.0, 0.1 + Math.sin(a) * 1.0],
      [Math.cos(a) * 0.86, 0.1 + Math.sin(a) * 0.86]
    )
  }),
  linea([-1.55, -1.15], [-0.85, -1.15]),
  linea([0.85, -1.15], [1.55, -1.15]),
]

/* 08 · allenamento — il manubrio */
D.allenamento = () => [
  linea([-1.05, 0.3], [1.05, 0.3]),
  linea([-1.05, -0.3], [1.05, -0.3]),
  scatola(-1.7, -1.05, -1.05, 1.05, 0.16),
  scatola(1.05, -1.05, 1.7, 1.05, 0.16),
  scatola(-2.35, -0.7, -1.7, 0.7, 0.14),
  scatola(1.7, -0.7, 2.35, 0.7, 0.14),
  linea([-2.6, -0.35], [-2.35, -0.35]),
  linea([-2.6, 0.35], [-2.35, 0.35]),
  linea([2.35, -0.35], [2.6, -0.35]),
  linea([2.35, 0.35], [2.6, 0.35]),
]

/* 09 · patologie — lo stetoscopio: la nutrizione clinica
   si fa insieme al medico, non al posto suo */
D.patologie = () => [
  linea([-1.55, 2.1], [-1.55, 1.75]),
  linea([1.55, 2.1], [1.55, 1.75]),
  curva([-1.55, 1.75], [-1.75, 0.75], [-0.95, 0.15]),
  curva([1.55, 1.75], [1.75, 0.75], [0.95, 0.15]),
  curva([-0.95, 0.15], [0, -0.35], [0.95, 0.15]),
  curva([0, -0.2], [0.35, -0.95], [0.15, -1.35]),
  cerchio(0.05, -1.75, 0.62, 40),
  cerchio(0.05, -1.75, 0.36, 26),
  linea([-1.7, 2.1], [-1.4, 2.1]),
  linea([1.4, 2.1], [1.7, 2.1]),
]

/* 10 · il marchio — la doppia elica a filo.
   Sta nel capitolo "chi sono": è il suo segno, e mentre lui si
   presenta la scena mostra la firma invece di uno strumento. */
D.marchio = () => {
  const s = []
  const GIRI = 1.85, ALT = 4.4, RAG = 1.15, N = 90
  const filo = (sfasa) => Array.from({ length: N + 1 }, (_, i) => {
    const t = i / N
    const a = t * GIRI * Math.PI * 2 + sfasa
    return [Math.cos(a) * RAG, (t - 0.5) * ALT]
  })
  s.push(filo(0)); s.push(filo(Math.PI * 0.66))
  /* i pioli, e uno su due porta un piccolo cerchio: nel logo
     stampato lì ci sono gli alimenti */
  const PIOLI = 9
  for (let k = 0; k < PIOLI; k++) {
    const t = (k + 0.5) / PIOLI
    const a0 = t * GIRI * Math.PI * 2
    const a1 = a0 + Math.PI * 0.66
    const A = [Math.cos(a0) * RAG, (t - 0.5) * ALT]
    const B = [Math.cos(a1) * RAG, (t - 0.5) * ALT]
    s.push(linea(A, B))
    if (k % 2 === 0) s.push(cerchio((A[0] + B[0]) / 2, (A[1] + B[1]) / 2, 0.19, 16))
  }
  return s
}

/* ── la sezione trasversale della composizione corporea ──
   Non è un disegno fisso: cambia col cursore della sezione 02.
   È la sezione di un arto — pelle, grasso sottocutaneo, muscolo,
   osso. È esattamente quello che leggono l'adipometro e la BIA. */
export function sezione(frazione = 0.22, n = PUNTI_DISEGNO) {
  const f = Math.max(0, Math.min(1, (frazione - 0.10) / 0.28))
  const pelle = 2.15
  const grasso = pelle - (0.16 + f * 0.72)          // spessore del guscio
  const muscolo = grasso - (0.14 + (1 - f) * 0.22)
  const s = [
    cerchio(0, 0, pelle, 72),
    cerchio(0, 0, grasso, 66),
  ]
  /* il muscolo non è un cerchio: sono ventri separati */
  for (let i = 0; i < 3; i++) {
    const a = Math.PI * 0.5 + (i / 3) * Math.PI * 2
    const rc = muscolo * 0.52
    s.push(cerchio(Math.cos(a) * rc, Math.sin(a) * rc, muscolo * 0.46, 34))
  }
  s.push(cerchio(0, 0, 0.36, 22))
  /* le tacche che segnano lo spessore del grasso */
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2
    s.push(linea(
      [Math.cos(a) * pelle, Math.sin(a) * pelle],
      [Math.cos(a) * grasso, Math.sin(a) * grasso]
    ))
  }
  return campiona(s, n)
}

/* ── da spezzate a punti ──
   I punti si distribuiscono lungo la lunghezza totale, non per
   tratto: così una linea lunga non riceve gli stessi punti di una
   corta, e il tratto resta di spessore uniforme. */
export function campiona(strisce, n = PUNTI_DISEGNO) {
  const seg = []
  let tot = 0
  for (const s of strisce) {
    for (let i = 0; i < s.length - 1; i++) {
      const l = Math.hypot(s[i + 1][0] - s[i][0], s[i + 1][1] - s[i][1])
      if (l < 1e-6) continue
      seg.push({ a: s[i], b: s[i + 1], l, da: tot })
      tot += l
    }
  }
  const out = new Float32Array(n * 3)
  let k = 0
  for (let i = 0; i < n; i++) {
    const d = ((i + 0.5) / n) * tot
    while (k < seg.length - 1 && seg[k].da + seg[k].l < d) k++
    const s = seg[k]
    const t = Math.max(0, Math.min(1, (d - s.da) / s.l))
    out[i * 3] = s.a[0] + (s.b[0] - s.a[0]) * t
    out[i * 3 + 1] = s.a[1] + (s.b[1] - s.a[1]) * t
    /* un filo di spessore: senza, il disegno è una decalcomania */
    out[i * 3 + 2] = Math.sin(i * 12.9898) * 0.09
  }
  return out
}

/* Nessuna figura: i punti sparsi in una nuvola. È lo stato di
   riposo del capitolo "la tua condizione" — a mouse fermo la scena
   respira, e prende forma solo quando si punta una voce. */
/* Lo sparso dei disegni: stesso campo prospettico dell'elica.
   Le distanze sono in unità del gruppo, che sta a scala 0,6 — il
   conto della prospettiva però non cambia con la scala, perché
   scala anche la distanza. */
export function sparso(n = PUNTI_DISEGNO) {
  /* L'ultimo parametro è il bordo, cioè quanto il campo deborda
     dall'inquadratura. Per l'elica vale 1,16 perché l'elica
     nell'apertura ha lo schermo tutto per sé. Qui no: a sinistra
     c'è una colonna di testo da leggere, e un campo largo quanto
     lo schermo ci finiva sopra.

     A 0,36 le particelle stanno nella metà destra, che è dove poi
     si comporrà il disegno. Sparse e composte occupano la stessa
     zona: cambia l'ordine, non il posto.

     Anche la profondità è più corta che nell'elica — da dodici a
     ventisette invece che da otto a trentasei. Le lontanissime
     erano puntini nella nebbia sparsi su tutto lo schermo, cioè
     esattamente il disturbo che si voleva togliere. */
  return campoProspettico(n, 77, 20, 12, 27, 0.36)
}


/* tutti i disegni fissi, calcolati una volta sola */
export function costruisciDisegni(n = PUNTI_DISEGNO) {
  const o = {}
  for (const k of Object.keys(D)) o[k] = campiona(D[k](), n)
  return o
}

/* quale disegno per ogni voce dell'elenco */
export const DISEGNI_STRUMENTI = ['bia', 'adipo', 'antro', 'plico', 'forza']
export const DISEGNI_AREE = ['intestino', 'peso', 'allenamento', 'patologie']
