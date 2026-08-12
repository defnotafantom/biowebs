/* ═══════════════════════════════════════════════════════════════
   LA NUVOLA SPARSA
   Come si distribuiscono le particelle quando NON sono radunate.

   Il primo tentativo era una palla: un raggio, una direzione a
   caso, fatto. Sbagliato, e il motivo si vede solo mettendo il
   fotogramma vero accanto al nostro.

   Nel video di riferimento le sfere sparse hanno misure
   completamente diverse fra loro: una grossa come una moneta in
   basso a destra, tre o quattro medie, e una dozzina di puntini
   da due pixel. Non sono sfere di misura diversa: sono la STESSA
   sfera a distanze diverse. È un campo in cui la telecamera sta
   dentro, non una nuvola che le sta davanti.

   Con una palla schiacciata in profondità stanno tutte più o meno
   alla stessa distanza, quindi hanno tutte più o meno la stessa
   misura sullo schermo, e il risultato è una grandinata regolare.
   Manca la profondità, e senza profondità manca lo spazio.

   Quindi qui non si sceglie una posizione nello spazio: si sceglie
   un punto sullo SCHERMO e una DISTANZA, e da quelli si ricava la
   posizione. Due conseguenze, tutte e due volute:

     · nessuna particella finisce fuori inquadratura, perché la
       posizione sullo schermo è il dato di partenza
     · la misura apparente nasce dalla prospettiva, e va da due
       pixel a settanta senza che nessuno la decida

   E la nebbia fa il resto: le lontane si spengono nel fondo
   verde, e sono quelle che nel video si vedono appena.
   ═══════════════════════════════════════════════════════════════ */

const TANG = Math.tan((34 / 2) * Math.PI / 180)

/* Il rapporto di forma su cui si distribuisce. Non è quello dello
   schermo di chi guarda — non lo sappiamo quando costruiamo i dati
   — ma un compromesso: su uno schermo più largo qualcuna resta
   dentro il bordo, su uno più stretto qualcuna esce. Entrambe le
   cose vanno bene, una nuvola sparsa deve sfiorare i bordi. */
const FORMA = 1.7

function casuale(i) {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

/**
 * Un campo di particelle sparse dentro il cono della telecamera.
 *
 * @param {number} n       quante
 * @param {number} seme    per avere campi diversi che non si somigliano
 * @param {number} camZ    dove sta la telecamera, in queste unità
 * @param {number} vicino  distanza minima — sotto, diventano enormi
 * @param {number} lontano distanza massima — oltre, le mangia la nebbia
 * @param {number} bordo   quanto debordano: 1 = a filo, 1,2 = un po' fuori
 * @param {number} vuoto   quanta parte centrale dello schermo lasciare
 *   libera, da 0 a 1. Serve al fondale: le particelle stanno negli
 *   angoli e ai bordi, dove non c'è niente da leggere, e il centro
 *   resta al testo. Senza, un fondo di sfere è solo un fondo sporco.
 */
export function campoProspettico(n, seme, camZ, vicino, lontano, bordo = 1.14, vuoto = 0) {
  const p = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    /* dove sta sullo schermo, da bordo a bordo */
    let u = (casuale(i * 1.7 + seme) * 2 - 1) * bordo
    let v = (casuale(i * 3.1 + seme + 1) * 2 - 1) * bordo
    if (vuoto > 0) {
      /* si spinge tutto verso i bordi lasciando sgombra la fascia
         centrale, senza però ammassare tutti sul filo del bordo:
         la parte casuale resta, cambia solo da dove parte */
      u = Math.sign(u || 1) * (vuoto + (1 - vuoto) * Math.abs(u))
      v = Math.sign(v || 1) * (vuoto * 0.72 + (1 - vuoto * 0.72) * Math.abs(v))
    }

    /* Quanto è lontana. La radice sposta il grosso verso il fondo:
       le vicine devono essere poche — una sfera enorme in primo
       piano è un accento, tre sono un disturbo — e le lontane
       tante, perché sono loro a fare la polvere sul fondo. */
    const g = casuale(i * 5.3 + seme + 2)
    const d = vicino + (lontano - vicino) * Math.sqrt(g)

    /* mezza altezza inquadrata a quella distanza */
    const h = d * TANG

    p[i * 3] = u * h * FORMA
    p[i * 3 + 1] = v * h
    p[i * 3 + 2] = camZ - d
  }
  return p
}
