import { useEffect, useMemo, useRef, useState } from 'react'
import { scroll, stato, fascia, clamp } from '../lib/scroll'
import { schermo } from '../lib/schermo'
import { CAPITOLI, CODA } from '../lib/capitoli'
import { prossimiPosti, giornoDi, oraDi, invia, errori } from '../lib/prenotazione'
import { sezioni, contatti } from '../testi'

/* ═══════════════════════════════════════════════════════════════
   LE SEZIONI
   Scorrono sopra la scena. Ognuna occupa esattamente le schermate
   dichiarate nei capitoli, così testo e scena restano sincronizzati.

   L'ordine è: chi sono → la strumentazione → la tua condizione →
   prenota → recensioni. Prima si capisce con chi si ha a che fare,
   poi cosa ha in studio, poi se tratta il tuo problema, e solo
   allora si prenota. Le recensioni chiudono, perché servono a chi
   sta ancora decidendo.
   ═══════════════════════════════════════════════════════════════ */

function useVisibilita(indiceCapitolo) {
  const rif = useRef()
  useEffect(() => {
    let vivo = true
    const passo = () => {
      if (!vivo) return
      const el = rif.current
      if (el) {
        const dentro = scroll.capitolo === indiceCapitolo
        const primaDopo = scroll.capitolo === indiceCapitolo - 1 && scroll.q > 0.72
        const q = dentro ? scroll.q : primaDopo ? -1 + fascia(scroll.q, 0.72, 1) : null

        let op = 0, dy = 34
        if (q !== null) {
          const entra = fascia(q, -0.30, 0.10)
          const esce = fascia(q, 0.88, 1)
          op = clamp(entra - esce)
          dy = (1 - entra) * 34 - esce * 34
        }
        el.style.opacity = op
        el.style.transform = `translate3d(0, ${dy}px, 0)`
        el.style.pointerEvents = op > 0.6 ? 'auto' : 'none'
        el.classList.toggle('dentro', op > 0.5)
      }
      requestAnimationFrame(passo)
    }
    requestAnimationFrame(passo)
    return () => { vivo = false }
  }, [indiceCapitolo])
  return rif
}

function useTocco() {
  const [t, setT] = useState(() => schermo.stretto || schermo.tocco)
  useEffect(() => {
    const guarda = () => setT(schermo.stretto || schermo.tocco)
    guarda()
    window.addEventListener('resize', guarda, { passive: true })
    return () => window.removeEventListener('resize', guarda)
  }, [])
  return t
}

function Testa({ s, largo = false }) {
  return (
    <>
      <span className="filigrana" aria-hidden="true">{s.numero}</span>
      <span className="tag entra" style={{ '--i': 0 }}>
        <i>{s.numero}</i>{s.etichetta}
      </span>
      <span className="linea" aria-hidden="true" />
      <h2 className={`titolo entra ${largo ? 'titolo-largo' : ''}`} style={{ '--i': 1 }}>{s.titolo}</h2>
      <p className="corpo entra" style={{ '--i': 2 }}>{s.testo}</p>
    </>
  )
}

function Pastiglie({ voci, scelta, scegli, etichetta }) {
  return (
    <div className="pastiglie entra" style={{ '--i': 3 }} role="tablist" aria-label={etichetta}>
      {voci.map((v, i) => (
        <button key={i} role="tab" aria-selected={scelta === i}
          className={scelta === i ? 'su' : ''} onClick={() => scegli(i)}>{v}</button>
      ))}
    </div>
  )
}

/* ── 01 · chi sono ─────────────────────────────────────────────
   Titolo e paragrafo a sinistra, e accanto il posto del ritratto
   con le verifiche e i contatti diretti. Qui la scena si ritira:
   l'elica passava sopra le scritte. */
function ChiSono() {
  const rif = useVisibilita(1)
  const s = sezioni.chisono
  const wa = `https://wa.me/${contatti.telefonoInternazionale}`

  return (
    <section ref={rif} className="sez" style={{ opacity: 0 }}>
      <div className="sez-corpo chi-riga">
        <div>
          <Testa s={s} />
          <ul className="titoli entra" style={{ '--i': 3 }}>
            {s.titoli.map((t) => (
              <li key={t.t}>
                <span className="titoli-e">{t.e}</span>
                <span className="titoli-t">{t.t}</span>
                <span className="titoli-n">{t.n}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="chi-lato entra" style={{ '--i': 4 }}>
          {/* Il posto del ritratto. Resta vuoto finché non c'è
              un'immagine che stia bene con il resto: meglio uno
              spazio dichiarato che una foto che stona. */}
          <figure className="chi-vuoto" aria-hidden="true"><span /></figure>

          <div className="chi-blocco">
            <span className="chi-e">{s.verificatoTitolo}</span>
            <ul className="chi-verifiche">
              {s.verificato.map((v) => (
                <li key={v.nome}>
                  {v.url
                    ? <a href={v.url} target="_blank" rel="noopener">{v.nome}</a>
                    : <span>{v.nome}</span>}
                </li>
              ))}
            </ul>
          </div>

          <div className="chi-blocco">
            <span className="chi-e">{s.contattiTitolo}</span>
            <ul className="chi-contatti">
              <li><a href={wa} target="_blank" rel="noopener">WhatsApp · {contatti.telefono}</a></li>
              <li><a href={contatti.instagram} target="_blank" rel="noopener">{contatti.instagramNome}</a></li>
              <li><a href={`mailto:${contatti.email}`}>{contatti.email}</a></li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  )
}

/* ── 02 · la strumentazione ─────────────────────────────────── */
function Strumenti() {
  const rif = useVisibilita(2)
  const tocco = useTocco()
  const s = sezioni.strumenti
  /* Si parte SEMPRE dal primo, anche col cursore.

     Prima da computer si partiva da -1, cioè da nessuno strumento
     puntato, e la vetrina restava una colonna spenta con un filo di
     luce sopra finché non passavi il mouse su una voce. Da telefono
     invece si partiva da zero e l'ologramma c'era. È tutta qui la
     differenza che il committente ha visto — "dal computer la
     vetrina con l'ologramma non si vede, da telefono sì": non era
     un problema di posizione né di schermo, era che su un capo si
     mostrava qualcosa e sull'altro no.

     E la scelta era sbagliata comunque. Una vetrina vuota che si
     riempie solo se indovini di passarci sopra chiede all'utente di
     scoprire un gesto per vedere il contenuto. Meglio mostrare
     subito il primo strumento: il passaggio del cursore diventa
     quello che dev'essere, cioè un modo per cambiare soggetto, non
     per accendere la luce. */
  const [su, setSu] = useState(0)
  /* La scena legge da stato.strumento, che vive fuori da React
     perché il ciclo 3D non può dipendere da un ridisegno. Va
     tenuto in pari qui, e non dentro i gestori: se lo scrivessi
     solo al passaggio del cursore, al primo caricamento resterebbe
     al valore di partenza e la figura si comporrebbe da sola. */
  useEffect(() => { stato.strumento = su }, [su])
  const entra = (i) => setSu(i)
  const v = s.voci[su] || s.voci[0]

  return (
    <section ref={rif} className="sez" style={{ opacity: 0 }}>
      <div className="sez-corpo">
        <Testa s={s} />
        {tocco ? (
          <>
            <Pastiglie voci={s.voci.map((x) => x.sigla)} scelta={su} scegli={entra} etichetta="Gli strumenti" />
            <div className="scheda entra" style={{ '--i': 4 }}>
              <span className="scheda-alto"><b>{v.breve}</b><i>{v.misura}</i></span>
              <span className="scheda-nome">{v.nome}</span>
              <p className="scheda-nota">{v.nota}</p>
            </div>
          </>
        ) : (
          /* Niente onPointerLeave: uscendo col cursore l'ultimo
             strumento guardato resta acceso. Spegnere all'uscita
             vuol dire che per metà del tempo la vetrina è vuota, e
             la vetrina vuota è il difetto che stiamo togliendo. */
          <ul className="strumenti entra" style={{ '--i': 3 }}>
            {s.voci.map((x, i) => (
              <li key={x.sigla} className={su === i ? 'acceso' : 'spento'}
                onPointerEnter={() => entra(i)} onFocus={() => entra(i)} tabIndex={0}>
                <span className="riempi" aria-hidden="true" />
                <span className="str-sigla">{x.sigla}</span>
                <span className="str-testo">
                  <span className="str-breve">{x.breve}</span>
                  <span className="str-nome">{x.nome}</span>
                </span>
                <span className="str-misura">{x.misura}</span>
                <span className="str-nota">{x.nota}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

/* ── 03 · la tua condizione ─────────────────────────────────── */
function Condizioni() {
  const rif = useVisibilita(3)
  const tocco = useTocco()
  const s = sezioni.condizioni
  /* -1 = nessuna voce puntata: nella scena i punti restano sparsi
     e fluttuanti, e si compongono solo quando si punta qualcosa */
  const [su, setSu] = useState(tocco ? 0 : -1)
  useEffect(() => { stato.area = su }, [su])
  const entra = (i) => setSu(i)
  const esci = () => { if (!schermo.tocco) { setSu(-1); stato.area = -1 } }
  const v = s.voci[su] || s.voci[0]

  return (
    <section ref={rif} className="sez" style={{ opacity: 0 }}>
      <div className="sez-corpo">
        <Testa s={s} />
        {tocco ? (
          <>
            <Pastiglie voci={s.voci.map((x) => x.breve)} scelta={su} scegli={entra} etichetta="I percorsi" />
            <div className="scheda entra" style={{ '--i': 4 }}>
              <span className="scheda-alto"><b>{v.titolo}</b></span>
              <span className="scheda-nome">{v.nota}</span>
              <ul className="scheda-elenco">{v.dentro.map((d) => <li key={d}>{d}</li>)}</ul>
            </div>
          </>
        ) : (
          <ul className="percorsi entra" style={{ '--i': 3 }} onPointerLeave={esci}>
            {s.voci.map((x, i) => (
              <li key={x.titolo} className={su === i ? 'aperta' : ''} onPointerEnter={() => entra(i)}>
                <button className="percorso-testa" onClick={() => entra(i)} aria-expanded={su === i}>
                  <span className="riempi" aria-hidden="true" />
                  <span className="percorso-n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="percorso-corpo">
                    <span className="percorso-t">{x.titolo}</span>
                    <span className="percorso-nota">{x.nota}</span>
                  </span>
                  <span className="piu" aria-hidden="true"><i /><i /></span>
                </button>
                <div className="percorso-dentro">
                  <ul>{x.dentro.map((d) => <li key={d}>{d}</li>)}</ul>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

/* ── 04 · prenota ───────────────────────────────────────────────
   Quattro prestazioni, i prossimi posti liberi e i dati. I posti
   qui sotto sono un elenco fisso: quando colleghiamo il calendario
   vero arriveranno da lì, ma la forma è già questa. */
function Prenota() {
  const rif = useVisibilita(4)
  const s = sezioni.prenota
  const [scelta, setScelta] = useState(0)
  const p = s.prestazioni[scelta]

  /* quando: indice del posto scelto, oppure -1 = "un altro momento" */
  const [quando, setQuando] = useState(0)
  const [dati, setDati] = useState({ nome: '', telefono: '', email: '', nota: '' })
  const [consenso, setConsenso] = useState(false)
  const [toccati, setToccati] = useState({})
  const [fase, setFase] = useState('modulo')   // modulo · invio · fatto · guasto

  /* I posti si ricalcolano quando cambia la durata della visita:
     una prima visita di novanta minuti non entra dove ne entra una
     di sessanta, e proporre un orario che poi non c'è è il modo
     più veloce per perdere la fiducia di chi sta prenotando. */
  const durata = parseInt(p.durata, 10) / 60
  const posti = useMemo(() => prossimiPosti(durata, 3), [durata])

  const sbagliati = errori(dati)
  const pronto = Object.keys(sbagliati).length === 0 && consenso

  async function manda(ev) {
    ev.preventDefault()
    setToccati({ nome: 1, telefono: 1, email: 1 })
    if (!pronto) return
    setFase('invio')
    try {
      await invia({ prestazione: p, quando: quando >= 0 ? posti[quando] : null, dati })
      setFase('fatto')
    } catch {
      setFase('guasto')
    }
  }

  function campo(chiave, tipo = 'text') {
    const male = toccati[chiave] && sbagliati[chiave]
    return (
      <label className={`campo ${male ? 'male' : ''}`}>
        <span className="campo-e">{s.campi[chiave]}</span>
        <input
          type={tipo}
          value={dati[chiave]}
          autoComplete={{ nome: 'name', telefono: 'tel', email: 'email' }[chiave]}
          onChange={(e) => setDati({ ...dati, [chiave]: e.target.value })}
          onBlur={() => setToccati({ ...toccati, [chiave]: 1 })}
        />
        {male && <span className="campo-male">{sbagliati[chiave]}</span>}
      </label>
    )
  }

  return (
    <section ref={rif} className="sez" style={{ opacity: 0 }} id="prenota">
      <div className="sez-corpo">
        <Testa s={s} />

        {fase === 'fatto' ? (
          <div className="fatto entra" style={{ '--i': 3 }}>
            <h3 className="fatto-t">{s.fattoTitolo}</h3>
            <p className="fatto-p">{s.fattoTesto}</p>
            <button className="btn btn-filo" onClick={() => { setFase('modulo'); setConsenso(false) }}>
              {s.fattoAncora}
            </button>
          </div>
        ) : (
          <>
            <form className="pren" onSubmit={manda}>
              {/* ── colonna sinistra: che cosa, e quando ── */}
              <div className="pren-col entra" style={{ '--i': 3 }}>
                <p className="pren-t">{s.visitaTitolo}</p>
                <div className="prezzi">
                  {s.prestazioni.map((x, i) => (
                    <button
                      key={x.id}
                      type="button"
                      className={`prezzo ${scelta === i ? 'su' : ''}`}
                      aria-pressed={scelta === i}
                      onClick={() => setScelta(i)}
                    >
                      <span className="prezzo-n">{x.nome}</span>
                      <span className="prezzo-d">{x.dove} · {x.durata}</span>
                      <span className="prezzo-e">{x.prezzo} €</span>
                    </button>
                  ))}
                </div>
                {/* le tre righe di cosa comprende compaiono solo dove
                    hanno senso: sui controlli sarebbero una promessa
                    che quella visita non mantiene */}
                {p.nome === s.prestazioni[0].nome && (
                  <p className="pren-compreso">
                    {s.inclusoTitolo}: {s.incluso.join(' · ').toLowerCase()}.
                  </p>
                )}

                <p className="pren-t">{s.quandoTitolo}</p>
                <div className="posti">
                  {posti.map((d, i) => (
                    <button
                      key={+d}
                      type="button"
                      className={`posto ${quando === i ? 'su' : ''}`}
                      aria-pressed={quando === i}
                      onClick={() => setQuando(i)}
                    >
                      <span className="posto-g">{giornoDi(d)}</span>
                      <span className="posto-o">{oraDi(d)}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`posto posto-altro ${quando === -1 ? 'su' : ''}`}
                    aria-pressed={quando === -1}
                    onClick={() => setQuando(-1)}
                  >
                    <span className="posto-g">{s.altro}</span>
                  </button>
                </div>
                {quando === -1 && <p className="pren-aiuto">{s.altroAiuto}</p>}
              </div>

              {/* ── colonna destra: chi ── */}
              <div className="pren-col entra" style={{ '--i': 4 }}>
                <p className="pren-t">{s.datiTitolo}</p>
                {campo('nome')}
                <div className="campi-due">
                  {campo('telefono', 'tel')}
                  {campo('email', 'email')}
                </div>
                <label className="campo">
                  <span className="campo-e">{s.campi.nota}</span>
                  <textarea
                    rows={2}
                    value={dati.nota}
                    placeholder={s.campi.notaAiuto}
                    onChange={(e) => setDati({ ...dati, nota: e.target.value })}
                  />
                </label>

                <label className="consenso">
                  <input type="checkbox" checked={consenso} onChange={(e) => setConsenso(e.target.checked)} />
                  <span>{s.consenso}</span>
                </label>

                <button type="submit" className="btn btn-pieno pren-invio" disabled={!pronto || fase === 'invio'}>
                  {fase === 'invio' ? s.attesa : s.azione}
                </button>
                {fase === 'guasto' && <p className="pren-guasto">{s.guasto}</p>}
                <p className="pren-nota">{s.nota}</p>
              </div>
            </form>
          </>
        )}
      </div>
    </section>
  )
}

/* ── 05 · recensioni ────────────────────────────────────────── */
/* Le recensioni girano da sole ogni sette secondi, in dissolvenza,
   e si fermano appena ci passi sopra il cursore: chi sta leggendo
   non deve vedersi portare via la riga a metà frase.

   Sette secondi e non quattro: le tre recensioni sono lunghe fra le
   trenta e le cinquanta parole, e si leggono in cinque scarsi. Un
   cambio prima che tu abbia finito è peggio di nessun cambio.

   La dissolvenza è in due tempi — sparisce, cambia, ricompare — e
   non un incrocio: due testi diversi sovrapposti a metà opacità
   sono illeggibili tutti e due. */
const GIRO_REC = 7000
const DISSOLVENZA = 320

function Recensioni() {
  const rif = useVisibilita(5)
  const s = sezioni.recensioni
  const [su, setSu] = useState(0)
  const [dentro, setDentro] = useState(true)
  const fermo = useRef(false)

  useEffect(() => {
    /* chi ha chiesto meno animazioni al sistema operativo non se
       le ritrova addosso lo stesso */
    const quieto = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (quieto) return
    let cambio
    const giro = setInterval(() => {
      if (fermo.current) return
      setDentro(false)
      cambio = setTimeout(() => {
        setSu((x) => (x + 1) % s.voci.length)
        setDentro(true)
      }, DISSOLVENZA)
    }, GIRO_REC)
    return () => { clearInterval(giro); clearTimeout(cambio) }
  }, [s.voci.length])

  const scegli = (i) => { setSu(i); setDentro(true) }
  const v = s.voci[su]

  return (
    <section ref={rif} className="sez" style={{ opacity: 0 }}>
      <div className="sez-corpo sez-stretto">
        <Testa s={s} />

        <div
          className={`rec entra ${dentro ? 'rec-dentro' : ''}`}
          style={{ '--i': 3 }}
          onPointerEnter={() => { fermo.current = true }}
          onPointerLeave={() => { fermo.current = false }}
        >
          <div className="rec-alto">
            <span className="rec-stelle" aria-label={`${v.stelle} stelle su 5`}>
              {'★'.repeat(v.stelle)}
            </span>
            <span className="rec-chi">{v.chi}</span>
            <span className="rec-ver">{s.verificata}</span>
          </div>
          <p className="rec-testo">{v.t}</p>
          <span className="rec-quando">{v.quando} · {v.tipo}</span>
        </div>

        <div className="rec-punti entra" style={{ '--i': 4 }}>
          {s.voci.map((_, i) => (
            <button key={i} className={su === i ? 'su' : ''} onClick={() => scegli(i)}
              aria-label={`Recensione ${i + 1} di ${s.voci.length}`} />
          ))}
          <a className="rec-fonte" href={s.fonte.url} target="_blank" rel="noopener">
            su {s.fonte.nome} →
          </a>
        </div>
      </div>
    </section>
  )
}

export default function Sezioni() {
  return (
    <>
      {CAPITOLI.map((c) => (
        <div key={c.id} id={c.id} style={{ height: `${c.h * 100}vh` }} aria-hidden="true" />
      ))}
      <div style={{ height: `${CODA * 100}vh` }} aria-hidden="true" />

      <div className="strato">
        <ChiSono />
        <Strumenti />
        <Condizioni />
        <Prenota />
        <Recensioni />
      </div>
    </>
  )
}
