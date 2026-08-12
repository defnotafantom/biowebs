import { useEffect, useRef } from 'react'
import { scroll, clamp, fascia } from '../lib/scroll'
import { CAPITOLI } from '../lib/capitoli'
import { battute, invito, salta } from '../testi'

/* ═══════════════════════════════════════════════════════════════
   L'APERTURA
   Le battute del primo capitolo. Anche queste non passano da React:
   un solo ciclo scrive direttamente opacità e spostamento.
   ═══════════════════════════════════════════════════════════════ */

export default function Apertura() {
  const righe = useRef([])
  const guida = useRef()
  const pulsante = useRef()

  useEffect(() => {
    let vivo = true
    const passo = () => {
      if (!vivo) return
      const p = scroll.apertura
      const fuori = scroll.capitolo > 0

      battute.forEach((b, i) => {
        const el = righe.current[i]
        if (!el) return
        const durata = b.a - b.da
        /* la prima battuta è già lì al primo fotogramma: con la
           dissolvenza in entrata, chi apre il sito vedeva uno
           schermo nero e basta finché non muoveva la rotellina */
        const entra = b.da <= 0 ? 1 : fascia(p, b.da, b.da + durata * 0.34)
        const esce = i === battute.length - 1
          ? (fuori ? 1 : 0)
          : fascia(p, b.a - durata * 0.26, b.a)
        const op = clamp(entra - esce)
        el.style.opacity = op
        el.style.transform = `translate3d(0, ${(1 - entra) * 34 - esce * 34}px, 0)`
      })

      /* SCORRI se ne va molto più tardi di prima. Con l'apertura a
         tre schermate e otto, sparire al nove per cento voleva dire
         sparire dopo un terzo di schermata: chi arriva non ha
         ancora capito che si scorre, e si trova il nero muto. */
      if (guida.current) guida.current.style.opacity = 1 - fascia(p, 0.14, 0.32)
      if (pulsante.current) {
        const o = (1 - fascia(p, 0.88, 1)) * (fuori ? 0 : 1)
        pulsante.current.style.opacity = o
        pulsante.current.style.pointerEvents = o > 0.4 ? 'auto' : 'none'
      }

      requestAnimationFrame(passo)
    }
    requestAnimationFrame(passo)
    return () => { vivo = false }
  }, [])

  const vaiGiu = () => {
    window.scrollTo({ top: window.innerHeight * CAPITOLI[0].h + 4, behavior: 'smooth' })
  }

  return (
    <div className="apertura">
      <div className="apertura-centro">
        {battute.map((b, i) => (
          <div
            key={i}
            ref={(el) => { righe.current[i] = el }}
            className={`battuta ${i === battute.length - 1 ? 'battuta-firma' : ''}`}
            style={{ opacity: 0 }}
          >
            {/* l'ultima battuta è il titolo vero della pagina:
                deve essere un h1, o per Google questo sito non ha
                un titolo principale. È già visibile, non serve
                nasconderne uno finto da qualche parte. */}
            {i === battute.length - 1 ? (
              <h1 className="battuta-h1">
                <span className="battuta-riga">{b.riga}</span>
                <span className="battuta-forte">{b.forte}</span>
              </h1>
            ) : (
              <>
                <span className="battuta-riga">{b.riga}</span>
                <span className="battuta-forte">{b.forte}</span>
              </>
            )}
            {b.coda && <span className="battuta-coda">{b.coda}</span>}
          </div>
        ))}
      </div>

      <div ref={guida} className="guida">
        <span className="guida-testo">{invito}</span>
        <span className="guida-linea" />
      </div>

      <button ref={pulsante} className="salta" onClick={vaiGiu}>{salta}</button>
    </div>
  )
}
