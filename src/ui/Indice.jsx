import { useEffect, useRef } from 'react'
import { scroll, fascia } from '../lib/scroll'
import { CAPITOLI, inizioDi } from '../lib/capitoli'



/* ═══════════════════════════════════════════════════════════════
   L'INDICE
   Una colonna di trattini sul bordo destro: dice dove siamo e
   permette di saltare. Sostituisce il menù classico — con una
   scena continua, un menù che ricarica pagine sarebbe fuori luogo.
   ═══════════════════════════════════════════════════════════════ */

export default function Indice() {
  const voci = useRef([])
  const barra = useRef()

  useEffect(() => {
    let vivo = true
    const passo = () => {
      if (!vivo) return
      CAPITOLI.forEach((c, i) => {
        const el = voci.current[i]
        if (!el) return
        const attivo = scroll.capitolo === i
        el.classList.toggle('attivo', attivo)
      })
      if (barra.current) {
        const tot = scroll.totale
        barra.current.style.transform = `scaleY(${Math.min(1, scroll.schermate / tot)})`
      }
      requestAnimationFrame(passo)
    }
    requestAnimationFrame(passo)
    return () => { vivo = false }
  }, [])

  const vai = (i) => {
    window.scrollTo({ top: window.innerHeight * inizioDi(i) + 4, behavior: 'smooth' })
  }

  return (
    <nav className="indice" aria-label="Sezioni">
      <span className="indice-traccia"><span ref={barra} className="indice-barra" /></span>
      <ul>
        {CAPITOLI.map((c, i) => (
          <li key={c.id}>
            <button
              ref={(el) => { voci.current[i] = el }}
              onClick={() => vai(i)}
              aria-label={c.nome}
            >
              <span className="indice-trattino" />
              <span className="indice-nome">{c.nome}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
