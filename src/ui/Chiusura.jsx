import { useState } from 'react'
import { chiusura, contatti, sezioni, marchio } from '../testi'

/* ═══════════════════════════════════════════════════════════════
   LA CHIUSURA
   Testo vero, in flusso normale, sempre visibile. È l'unica parte
   del sito che non dipende dallo scorrimento né dalla scena 3D.

   Ci sono due motivi, e valgono entrambi:
     · chi cerca solo indirizzo, orari, prezzo o "tratti la mia
       condizione?" lo trova qui senza dover scorrere un racconto
     · di tutto il resto Google vede poco, perché i testi delle
       sezioni stanno in strati sovrapposti che partono invisibili

   I titoli sono h2 e h3 veri, gli elenchi sono elenchi veri,
   l'indirizzo è marcato in modo che i motori lo riconoscano.
   ═══════════════════════════════════════════════════════════════ */

const indirizzoPieno = `${contatti.indirizzo}, ${contatti.cap} ${contatti.citta}`

/* Il collegamento alle mappe si costruisce dall'indirizzo scritto,
   non da latitudine e longitudine. Non ho le coordinate vere dello
   studio, e inventarle vorrebbe dire mettere il segnaposto sulla
   strada sbagliata: su un sito di uno studio medico è il tipo di
   errore che fa arrivare la gente da un'altra parte. Google
   risolve l'indirizzo da sé, e se un domani l'indirizzo cambia si
   corregge in testi.js e basta. */
const perMappe = encodeURIComponent(`${indirizzoPieno}, Italia`)
const LINK_MAPPE = `https://www.google.com/maps/search/?api=1&query=${perMappe}`
const EMBED_MAPPE = `https://www.google.com/maps?q=${perMappe}&hl=it&z=16&output=embed`

/* La mappa non si carica da sola. Un iframe di Google che parte
   all'apertura della pagina scarica trecento chilobyte e lascia i
   suoi cookie a chi magari voleva solo leggere gli orari. Qui c'è
   un riquadro finto, e la mappa vera arriva se la si chiede. */
function Mappa() {
  const [aperta, setAperta] = useState(false)

  return (
    <div className="mappa">
      {aperta ? (
        <iframe
          className="mappa-vera"
          src={EMBED_MAPPE}
          title={`Mappa · ${indirizzoPieno}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <button type="button" className="mappa-finta" onClick={() => setAperta(true)}>
          {/* una pianta stilizzata, disegnata a mano: non è la vera
              topografia, è solo il disegno di un riquadro di città */}
          <svg viewBox="0 0 320 200" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
            <g stroke="currentColor" fill="none" strokeWidth="1" opacity="0.28">
              <path d="M-10 46 L340 30" /><path d="M-10 104 L340 96" />
              <path d="M-10 162 L340 158" />
              <path d="M62 -10 L54 210" /><path d="M148 -10 L152 210" />
              <path d="M236 -10 L232 210" />
            </g>
            <g stroke="currentColor" fill="none" strokeWidth="2.5" opacity="0.5">
              <path d="M-10 104 L340 96" />
            </g>
            <circle cx="160" cy="100" r="20" fill="currentColor" opacity="0.10" />
            <circle cx="160" cy="100" r="6" fill="currentColor" opacity="0.9" />
          </svg>
          <span className="mappa-sopra">
            <b>{chiusura.mappaTitolo}</b>
            <i>{indirizzoPieno}</i>
          </span>
        </button>
      )}
      <p className="mappa-nota">
        {chiusura.mappaAiuto}{' '}
        <a href={LINK_MAPPE} target="_blank" rel="noopener">{chiusura.mappaApri}</a>
      </p>
    </div>
  )
}

export default function Chiusura() {
  const wa = `https://wa.me/${contatti.telefonoInternazionale}`
  /* il prezzo non è più un numero solo: si prende quello della
     prima visita dall'elenco delle prestazioni, così se cambia
     lì cambia anche qui */
  const prima = sezioni.prenota.prestazioni[0]

  return (
    <footer className="chiusa" id="informazioni">
      <div className="chiusa-dentro">

        <section className="chiusa-blocco">
          <h2 className="chiusa-titolo">{chiusura.titolo}</h2>
          <p className="chiusa-testo">{chiusura.testo}</p>

          <div className="chiusa-griglia">
            {chiusura.gruppi.map((g) => (
              <div key={g.titolo} className="chiusa-gruppo">
                <h3>{g.titolo}</h3>
                <ul>{g.voci.map((v) => <li key={v}>{v}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>

        <section className="chiusa-blocco chiusa-due">
          <div>
            <h2 className="chiusa-titolo">{chiusura.studioTitolo}</h2>
            <address className="chiusa-recapiti">
              <span className="chiusa-nome">Dott. {marchio.nome.replace('A.', 'Antonio')}</span>
              <span>{marchio.ruolo}</span>
              <span>{contatti.indirizzo} — {contatti.cap} {contatti.citta}</span>
              <span>{contatti.orari}</span>
              <a href={`tel:+${contatti.telefonoInternazionale}`}>{contatti.telefono}</a>
              <a href={`mailto:${contatti.email}`}>{contatti.email}</a>
            </address>

            <p className="chiusa-strumenti-riga">{chiusura.strumentiRiga}</p>

            <p className="chiusa-prezzo">
              <b>Prima visita {prima.prezzo} €</b>
              <span>{prima.durata} · valutazione strumentale completa inclusa</span>
            </p>

            <div className="chiusa-azioni">
              <a className="btn btn-pieno" href="#prenota">Prenota una visita</a>
              <a className="btn btn-linea" href={wa} target="_blank" rel="noopener">
                Scrivi su WhatsApp
              </a>
            </div>
          </div>

          <div>
            <h2 className="chiusa-titolo">{chiusura.comeArrivare}</h2>
            <Mappa />
          </div>
        </section>

        <p className="chiusa-nota">{chiusura.nota}</p>

        <div className="chiusa-piede">
          <span>© {new Date().getFullYear()} Dott. Antonio Toscano — Biologo Nutrizionista</span>
          {contatti.piva && <span>P. IVA {contatti.piva}</span>}
          {contatti.albo && <span>{contatti.albo}</span>}
          {contatti.instagram && (
            <a href={contatti.instagram} target="_blank" rel="noopener">Instagram</a>
          )}
        </div>

        {/* la rete di sicurezza: finché i dati sono finti si vede,
            e non si può pubblicare per distrazione */}
        {contatti.provvisori && (
          <p className="chiusa-avviso">
            <b>Dati di esempio.</b> La partita IVA e il link Instagram qui sopra sono
            inventati. Il numero d'albo invece è quello vero, preso dal biglietto da visita.
            Correggi gli altri due in <code>src/testi.js</code> e metti
            <code>provvisori: false</code> prima di pubblicare.
          </p>
        )}
      </div>
    </footer>
  )
}
