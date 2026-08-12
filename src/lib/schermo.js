/* ═══════════════════════════════════════════════════════════════
   LO SCHERMO
   Un solo punto in cui il sito sa su che cosa sta girando.
   Lo leggono sia il CSS (per via delle media query) sia la scena 3D,
   che invece deve saperlo in JavaScript per spostare la telecamera.

   Su telefono il sito cambia impianto, non solo misure: la scena
   sale nella fascia alta dello schermo e il testo scorre sotto.
   Affiancarli, su una colonna da 390 pixel, non sta in piedi.
   ═══════════════════════════════════════════════════════════════ */

export const schermo = {
  stretto: false,     // meno di 900 px: impianto verticale
  tocco: false,       // niente mouse: le voci si toccano
  leggero: false,     // pochi core o schermo piccolo: meno particelle
  ridotto: false,     // l'utente ha chiesto meno animazioni
}

/* Scritti dalla telecamera a ogni fotogramma, letti dai due sistemi
   della scena: dove sta il centro dell'inquadratura e quanto è
   grande. Serve perché su telefono la scena non sta al centro. */
export const scena = { z: 12, alto: 0, larghezza: 13, altezza: 7.3 }

export function misuraSchermo() {
  if (typeof window === 'undefined') return
  const w = window.innerWidth
  schermo.stretto = w < 900
  schermo.tocco = window.matchMedia('(hover: none), (pointer: coarse)').matches
  schermo.ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const core = navigator.hardwareConcurrency || 8
  schermo.leggero = schermo.stretto || core <= 4
}

/* quante particelle reggere: su telefono si dimezzano abbondantemente */
export function quantita() {
  if (schermo.ridotto) return 0.34
  return schermo.leggero ? 0.42 : 1
}

export function avviaSchermo() {
  misuraSchermo()
  window.addEventListener('resize', misuraSchermo, { passive: true })
  window.addEventListener('orientationchange', misuraSchermo)
}
