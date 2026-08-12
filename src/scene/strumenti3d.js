/* ═══════════════════════════════════════════════════════════════
   I CINQUE STRUMENTI, IN VOLUMI
   Ognuno è un elenco di solidi elementari: parallelepipedi,
   cilindri, sfere, anelli. Niente file da scaricare, niente
   modellatore: sono una sessantina di numeri in tutto.

   La scelta non è per pigrizia. Un modello scaricato pesa qualche
   megabyte, va caricato, e soprattutto ha una sua estetica che
   con questa scena non c'entra niente. Cinque forme costruite a
   mano sono povere di dettaglio ma sono NOSTRE: hanno lo stesso
   materiale delle sfere, la stessa luce, e si leggono per quello
   che sono — la sagoma dell'oggetto, non l'oggetto.

   E siccome escono da un fascio di luce come un ologramma, la
   sagoma è esattamente il livello di dettaglio giusto: un
   ologramma iperrealista sarebbe una fotografia storta.

   Le misure sono in unità di scena. Il cuscino sta a y = 0, gli
   oggetti gli stanno sopra, alti circa due unità.

   Ogni pezzo:
     f    forma — 'scatola' · 'cilindro' · 'sfera' · 'anello'
     p    posizione [x, y, z]
     m    misure — dipende dalla forma:
            scatola  [larghezza, altezza, profondità]
            cilindro [raggio sopra, raggio sotto, altezza]
            sfera    [raggio, schiacciamento verticale]
            anello   [raggio, spessore, apertura in giri]
     r    rotazione [x, y, z] in radianti — facoltativa
   ═══════════════════════════════════════════════════════════════ */

const G = Math.PI / 180

export const STRUMENTI_3D = {
  /* ── 1 · BIOIMPEDENZIOMETRO ──────────────────────────────────
     Una scatola con il display, due cavi che escono di lato e due
     elettrodi piatti appoggiati più in basso. Il gesto
     riconoscibile è quello: la scatoletta e i due fili. */
  bia: [
    { f: 'scatola', p: [0, 0.62, 0], m: [1.5, 0.95, 0.42] },
    { f: 'scatola', p: [0, 0.78, 0.23], m: [1.02, 0.44, 0.03] },   // display
    { f: 'scatola', p: [-0.28, 0.34, 0.23], m: [0.2, 0.12, 0.03] }, // tasti
    { f: 'scatola', p: [0.02, 0.34, 0.23], m: [0.2, 0.12, 0.03] },
    { f: 'scatola', p: [0.32, 0.34, 0.23], m: [0.2, 0.12, 0.03] },
    /* i due cavi: mezzi anelli che scendono ai lati */
    { f: 'anello', p: [-1.02, 0.5, 0], m: [0.46, 0.035, 0.42], r: [0, 0, 40 * G] },
    { f: 'anello', p: [1.02, 0.5, 0], m: [0.46, 0.035, 0.42], r: [0, 0, 140 * G] },
    /* gli elettrodi adesivi */
    { f: 'scatola', p: [-1.36, 0.06, 0.1], m: [0.4, 0.05, 0.28], r: [0, 12 * G, 0] },
    { f: 'scatola', p: [1.36, 0.06, -0.1], m: [0.4, 0.05, 0.28], r: [0, -12 * G, 0] },
  ],

  /* ── 2 · ADIPOMETRO A ULTRASUONI ─────────────────────────────
     Una sonda a penna con la testa arrotondata, il cavo che le
     esce dietro, e la centralina appoggiata. */
  adipo: [
    { f: 'cilindro', p: [-0.15, 1.02, 0], m: [0.14, 0.14, 1.15], r: [0, 0, 18 * G] },
    { f: 'cilindro', p: [-0.34, 0.44, 0], m: [0.2, 0.17, 0.2], r: [0, 0, 18 * G] },
    { f: 'sfera', p: [-0.4, 0.3, 0], m: [0.19, 0.72] },            // testa della sonda
    { f: 'cilindro', p: [0.05, 1.62, 0], m: [0.06, 0.06, 0.22], r: [0, 0, 18 * G] },
    { f: 'anello', p: [0.52, 1.3, 0], m: [0.5, 0.032, 0.4], r: [0, 0, 200 * G] },
    /* la centralina */
    { f: 'scatola', p: [0.92, 0.2, -0.05], m: [0.8, 0.38, 0.5] },
    { f: 'scatola', p: [0.92, 0.3, 0.2], m: [0.5, 0.16, 0.03] },
  ],

  /* ── 3 · ANTROPOMETRO ────────────────────────────────────────
     L'asta graduata con il braccio fisso in basso e quello
     scorrevole più su. Le tacche sono quello che lo rende
     riconoscibile, quindi ci sono. */
  antro: [
    { f: 'scatola', p: [0, 1.05, 0], m: [0.13, 2.3, 0.13] },        // asta
    { f: 'scatola', p: [-0.5, 0.12, 0], m: [1.0, 0.11, 0.16] },     // braccio fisso
    { f: 'scatola', p: [-0.5, 1.42, 0], m: [1.0, 0.11, 0.16] },     // braccio mobile
    { f: 'scatola', p: [0, 1.42, 0], m: [0.26, 0.3, 0.22] },        // cursore
    { f: 'scatola', p: [-0.98, 0.12, 0], m: [0.09, 0.26, 0.16] },   // puntale
    { f: 'scatola', p: [-0.98, 1.42, 0], m: [0.09, 0.26, 0.16] },
    /* le tacche della scala */
    ...Array.from({ length: 11 }, (_, i) => ({
      f: 'scatola', p: [0.1, 0.28 + i * 0.16, 0.02],
      m: [i % 5 === 0 ? 0.15 : 0.09, 0.016, 0.1],
    })),
  ],

  /* ── 4 · PLICOMETRO ──────────────────────────────────────────
     La pinza: due bracci che si chiudono su una piega, il corpo
     con la scala, e i due puntali che si guardano. */
  plico: [
    { f: 'scatola', p: [0, 1.28, 0], m: [0.86, 0.6, 0.16] },        // corpo
    { f: 'scatola', p: [0, 1.34, 0.09], m: [0.56, 0.3, 0.03] },     // scala
    { f: 'scatola', p: [-0.42, 0.62, 0], m: [0.11, 1.1, 0.13], r: [0, 0, -13 * G] },
    { f: 'scatola', p: [0.42, 0.62, 0], m: [0.11, 1.1, 0.13], r: [0, 0, 13 * G] },
    { f: 'scatola', p: [-0.28, 0.1, 0], m: [0.2, 0.1, 0.16] },      // puntale
    { f: 'scatola', p: [0.28, 0.1, 0], m: [0.2, 0.1, 0.16] },
    { f: 'cilindro', p: [0, 0.98, 0], m: [0.07, 0.07, 0.22], r: [90 * G, 0, 0] }, // perno
  ],

  /* ── 5 · DINAMOMETRO ─────────────────────────────────────────
     Quello da stringere in mano: il corpo con il quadrante e la
     maniglia a staffa che si tira verso l'impugnatura. */
  forza: [
    { f: 'scatola', p: [0, 1.02, 0], m: [1.0, 0.78, 0.4] },         // corpo
    { f: 'scatola', p: [0, 1.14, 0.22], m: [0.66, 0.36, 0.03] },    // quadrante
    { f: 'scatola', p: [0.3, 0.76, 0.22], m: [0.16, 0.1, 0.03] },
    /* la staffa: due montanti e la traversa */
    { f: 'scatola', p: [-0.62, 0.72, 0], m: [0.13, 1.1, 0.3] },
    { f: 'scatola', p: [0.62, 0.72, 0], m: [0.13, 1.1, 0.3] },
    { f: 'scatola', p: [0, 0.22, 0], m: [1.36, 0.15, 0.3] },        // impugnatura
    { f: 'cilindro', p: [0, 0.22, 0], m: [0.1, 0.1, 1.2], r: [0, 0, 90 * G] },
  ],
}

/* l'ordine con cui compaiono nella sezione */
export const ORDINE_3D = ['bia', 'adipo', 'antro', 'plico', 'forza']
