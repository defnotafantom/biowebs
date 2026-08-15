/* ═══════════════════════════════════════════════════════════════
   L'INQUADRATURA
   Il ponte fra due sistemi di misura che finora erano tenuti
   insieme a mano — ed è per quello che il sito non teneva su
   schermi diversi.

   ── il difetto che questa funzione toglie ──────────────────────
   La scena piazzava gli oggetti in coordinate assolute del mondo:
   la vetrina a x = 3,3, la colonna alta 2,3 unità. Ma quanto di
   quel mondo entri nello schermo dipende dalla FORMA della
   finestra, non solo dalla sua misura:

     16:9   la scena inquadrata è larga 13,8 unità
     4:3    la stessa scena è larga  9,8 unità

   Quindi lo stesso x = 3,3 cade al 74% dello schermo su un
   monitor largo e all'84% su un portatile quadrato, e su una
   finestra abbastanza stretta esce del tutto. Non è un difetto di
   taratura: è che "3,3 unità a destra" non VUOL DIRE niente
   finché non sai che forma ha la finestra.

   Ho passato una giornata a cercare perché la vetrina non si
   illuminasse abbastanza. Non era la luce: era che non stava dove
   credevo, e dove stava cambiava da schermo a schermo.

   ── il ribaltamento ────────────────────────────────────────────
   Qui si smette di dire DOVE STA nel mondo e si dice DOVE SI
   VEDE sullo schermo: "al 78% di larghezza, al 52% di altezza".
   La conversione in coordinate mondo si rifà a ogni fotogramma
   con il tronco di piramide vero della telecamera.

   Dopo di che un oggetto messo al 78% sta al 78% su qualunque
   schermo, zoom, finestra o rotazione — e non può uscire
   dall'inquadratura, perché è la definizione stessa a impedirlo.
   Non è una taratura che va rifatta per ogni dispositivo: è una
   regola che non ha eccezioni.

   Stesso ragionamento per le misure: "alto un terzo dello
   schermo" invece di "alto 2,3 unità".
   ═══════════════════════════════════════════════════════════════ */

const GRADI = Math.PI / 180

/* Quanto misura il fotogramma, in unità di mondo, sul piano a
   profondità z. Non è una costante: dipende da quanto è lontana
   la telecamera da quel piano e da che forma ha la finestra. */
export function fotogramma(camera, z = 0) {
  const distanza = Math.max(0.001, Math.abs(camera.position.z - z))
  const altezza = 2 * distanza * Math.tan((camera.fov / 2) * GRADI)
  return { altezza, larghezza: altezza * camera.aspect }
}

/**
 * Da frazioni di schermo a coordinate del mondo.
 *
 * @param {number} fx 0 = bordo sinistro, 1 = destro
 * @param {number} fy 0 = bordo alto, 1 = basso
 * @param {number} z  su quale piano di profondità
 * @returns {{x:number,y:number,larghezza:number,altezza:number}}
 */
export function ancora(camera, fx, fy, z = 0) {
  const f = fotogramma(camera, z)
  return {
    x: (fx - 0.5) * f.larghezza,
    y: (0.5 - fy) * f.altezza,
    larghezza: f.larghezza,
    altezza: f.altezza,
  }
}

/**
 * Una misura espressa come frazione dell'altezza inquadrata.
 * Si usa l'altezza e non la larghezza apposta: la larghezza
 * cambia con la forma della finestra, l'altezza no. Un oggetto
 * dimensionato sull'altezza mantiene la stessa presenza su uno
 * schermo panoramico e su uno quadrato; dimensionato sulla
 * larghezza diventerebbe gigantesco sui monitor larghi.
 */
export function misuraSchermo(camera, frazione, z = 0) {
  return fotogramma(camera, z).altezza * frazione
}

/**
 * La stessa cosa di ancora(), ma garantendo che un oggetto largo
 * `mezzaL` e alto `mezzaH` (in unità di mondo, dal centro) resti
 * dentro il fotogramma con un margine.
 *
 * È la rete di sicurezza: anche se qualcuno chiede una posizione
 * assurda, o la finestra diventa una fessura, l'oggetto rientra
 * invece di sparire. Meglio una composizione un po' storta di una
 * cosa che non c'è — e "non c'è" è impossibile da diagnosticare
 * guardando lo schermo, come abbiamo imparato.
 */
export function ancoraDentro(camera, fx, fy, mezzaL, mezzaH, z = 0, margine = 0.02) {
  const f = fotogramma(camera, z)
  const m = margine * f.altezza
  const limiteX = Math.max(0, f.larghezza / 2 - mezzaL - m)
  const limiteY = Math.max(0, f.altezza / 2 - mezzaH - m)
  const x = (fx - 0.5) * f.larghezza
  const y = (0.5 - fy) * f.altezza
  return {
    x: Math.max(-limiteX, Math.min(limiteX, x)),
    y: Math.max(-limiteY, Math.min(limiteY, y)),
    larghezza: f.larghezza,
    altezza: f.altezza,
  }
}
