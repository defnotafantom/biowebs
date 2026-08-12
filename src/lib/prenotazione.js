/* ═══════════════════════════════════════════════════════════════
   LA PRENOTAZIONE
   Tutto quello che riguarda gli appuntamenti sta qui dentro: gli
   orari di studio, il calcolo dei prossimi posti liberi, e il modo
   in cui la richiesta arriva al dottore.

   La scelta di fondo — decisa insieme — è mostrare i PROSSIMI TRE
   POSTI LIBERI e non un calendario mensile. Un calendario vuoto
   dice "qui non prenota nessuno"; tre orari vicini dicono "c'è
   posto giovedì, prendilo". È la stessa ragione per cui i
   ristoranti non ti fanno vedere la sala vuota.

   ─── COME SI COLLEGA ALL'AGENDA VERA ───────────────────────────
   Adesso gli orari nascono dalle regole qui sotto: il sito non sa
   se quel giovedì il dottore è occupato. Va bene finché la
   richiesta passa da lui — infatti il testo dice "richiesta", non
   "prenotato".

   Per farla diventare una prenotazione vera servono due cose,
   entrambe gratuite:
     1. un account su cal.com collegato al suo Google Calendar,
        con i quattro tipi di visita già configurati;
     2. sostituire prossimiPosti() con una chiamata a
        https://api.cal.com/v1/slots?apiKey=…&eventTypeId=…
        e INVIO.modo con 'cal'.
   Il resto dell'interfaccia non cambia di una riga: legge sempre
   un elenco di date.
   ═══════════════════════════════════════════════════════════════ */

import { contatti } from '../testi'

/* ── quando si visita ──────────────────────────────────────────
   Chiave = giorno della settimana (0 domenica … 6 sabato).
   Valori = fasce di apertura, in ore decimali. 15.5 = le 15:30.
   Questi vanno confermati dal dottore: sono la sua agenda tipo. */
export const AGENDA = {
  1: [[15, 19]],           // lunedì
  2: [[9, 13], [15, 19]],  // martedì
  3: [[15, 19]],           // mercoledì
  4: [[9, 13], [15, 19]],  // giovedì
  5: [[9, 13]],            // venerdì
}

/* Quanto preavviso serve. Sotto le ventiquattr'ore il dottore non
   fa in tempo a leggere la richiesta, e proporre un orario che poi
   salta è peggio che non proporlo. */
const ANTICIPO_ORE = 24

/* Ogni quanto comincia una visita: mezz'ora. */
const PASSO = 0.5

/* Chiusure: ferie, festivi, giorni singoli. Formato 'AAAA-MM-GG'. */
export const CHIUSURE = [
  '2026-08-15', // ferragosto
]

const g = (d) => d.toISOString().slice(0, 10)

/**
 * I prossimi posti liberi, uno per giorno.
 *
 * Uno per giorno e non tutti: tre orari lo stesso pomeriggio
 * sembrano uno studio deserto, tre giorni diversi sembrano
 * un'agenda che gira. E chi prenota sceglie il giorno, non
 * il quarto d'ora.
 *
 * @param {number} durataOre  quanto dura la visita
 * @param {number} quanti     quanti posti proporre
 * @param {Date}   adesso     iniettabile, serve alle prove
 */
export function prossimiPosti(durataOre = 1.5, quanti = 3, adesso = new Date()) {
  const minimo = new Date(adesso.getTime() + ANTICIPO_ORE * 3600e3)
  const posti = []

  for (let salto = 0; salto < 40 && posti.length < quanti; salto++) {
    const giorno = new Date(adesso)
    giorno.setDate(giorno.getDate() + salto)
    giorno.setHours(0, 0, 0, 0)

    const fasce = AGENDA[giorno.getDay()]
    if (!fasce || CHIUSURE.includes(g(giorno))) continue

    /* il primo orario del giorno in cui la visita ci sta tutta */
    let trovato = null
    for (const [apre, chiude] of fasce) {
      for (let h = apre; h + durataOre <= chiude + 1e-9; h += PASSO) {
        const q = new Date(giorno)
        q.setHours(Math.floor(h), Math.round((h % 1) * 60), 0, 0)
        if (q >= minimo) { trovato = q; break }
      }
      if (trovato) break
    }
    if (trovato) posti.push(trovato)
  }
  return posti
}

const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato']
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']

/** "giovedì 14 agosto" — e "domani" quando è domani, che si legge prima. */
export function giornoDi(d, adesso = new Date()) {
  const a = new Date(adesso); a.setHours(0, 0, 0, 0)
  const b = new Date(d); b.setHours(0, 0, 0, 0)
  const salto = Math.round((b - a) / 86400e3)
  if (salto === 0) return 'oggi'
  if (salto === 1) return 'domani'
  return `${GIORNI[d.getDay()]} ${d.getDate()} ${MESI[d.getMonth()]}`
}

/** "16:00" */
export function oraDi(d) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/* ── come arriva la richiesta ──────────────────────────────────
   Senza un servizio configurato la richiesta parte su WhatsApp
   già scritta: nessun costo, nessun server, e il dottore la vede
   dove guarda comunque cento volte al giorno.

   Se un giorno si vuole che arrivi via mail, basta mettere qui
   l'indirizzo di un modulo (Formspree, Netlify Forms, Basin) e
   il resto del codice se ne accorge da solo. */
export const INVIO = {
  endpoint: null,   // es. 'https://formspree.io/f/xxxxxxx'
}

/** Il messaggio, in italiano, come lo leggerà lui sul telefono. */
export function messaggio({ prestazione, quando, dati }) {
  const righe = [
    'Richiesta di appuntamento dal sito.',
    '',
    `Visita: ${prestazione.nome} ${prestazione.dove} (${prestazione.durata})`,
    quando
      ? `Preferenza: ${giornoDi(quando)} alle ${oraDi(quando)}`
      : 'Preferenza: nessuna, mi adatto',
    '',
    `Nome: ${dati.nome}`,
    `Telefono: ${dati.telefono}`,
    `E-mail: ${dati.email}`,
  ]
  if (dati.nota?.trim()) righe.push('', `Note: ${dati.nota.trim()}`)
  return righe.join('\n')
}

/**
 * Manda la richiesta. Restituisce una promessa che si risolve
 * quando è partita, o che fallisce con un messaggio leggibile.
 */
export async function invia(richiesta) {
  const testo = messaggio(richiesta)

  if (INVIO.endpoint) {
    const r = await fetch(INVIO.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...richiesta.dati, testo }),
    })
    if (!r.ok) throw new Error('non-inviato')
    return 'mail'
  }

  const url = `https://wa.me/${contatti.telefonoInternazionale}?text=${encodeURIComponent(testo)}`
  window.open(url, '_blank', 'noopener')
  return 'whatsapp'
}

/* ── controlli sul modulo ──────────────────────────────────────
   Si controlla il minimo indispensabile. Un modulo che rifiuta un
   numero di telefono scritto con gli spazi fa perdere più
   prenotazioni di quante ne salvi. */
export function errori(dati) {
  const e = {}
  if (dati.nome.trim().length < 3) e.nome = 'Serve nome e cognome'
  if (dati.telefono.replace(/\D/g, '').length < 8) e.telefono = 'Numero non valido'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(dati.email.trim())) e.email = 'E-mail non valida'
  return e
}
