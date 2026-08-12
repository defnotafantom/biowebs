import { useEffect, useRef } from 'react'
import { scroll, fascia } from '../lib/scroll'
import { CAPITOLI, inizioDi } from '../lib/capitoli'



/* ═══════════════════════════════════════════════════════════════
   L'INDICE
   A riposo è una colonna di trattini larga venti pixel, appoggiata
   al bordo sinistro. Ci si avvicina col cursore e i nomi escono.

   Prima i nomi erano sempre lì, sei righe di maiuscoletto in
   permanenza sopra la scena. Su un sito che vive di vuoto sei
   righe di interfaccia sono un cartello stradale in mezzo a un
   quadro: dicono "qui c'è un menù" a chi non l'aveva chiesto.

   I trattini restano, perché servono a un'altra cosa — dire a che
   punto sei — e per quello bastano. I nomi arrivano solo a chi li
   sta cercando, cioè a chi ha portato il cursore fin lì.
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
      {/* la zona sensibile è molto più larga della striscia che si
          vede: mirare venti pixel col mouse è un esercizio */}
      <span className="indice-presa" aria-hidden="true" />
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
