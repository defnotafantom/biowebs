import { useEffect, useRef } from 'react'
import Scena from './scene/Scena'
import Apertura from './ui/Apertura'
import Sezioni from './ui/Sezioni'
import Indice from './ui/Indice'
import Chiusura from './ui/Chiusura'
import { avviaScroll, scroll } from './lib/scroll'
import { avviaSchermo, schermo } from './lib/schermo'
import { CAPITOLI, inizioDi, TOTALE_SCHERMATE } from './lib/capitoli'
import { marchio, contatti } from './testi'

/* ═══════════════════════════════════════════════════════════════
   PASSO 5 — un corpo che esiste solo come misura.

   Impianto: la scena 3D sta fissa dietro e non si ricarica mai.
   Il documento le scorre sopra; lo scorrimento porta gli stessi
   duemila punti dal caos all'elica del logo, dall'elica a una
   persona, e dentro quella persona a ciò che gli strumenti vedono.
   ═══════════════════════════════════════════════════════════════ */

export default function App() {
  const mouse = useRef({ x: 0, y: 0 })
  const barra = useRef()

  useEffect(() => {
    avviaSchermo()
    avviaScroll()

    if (contatti.provvisori) {
      /* finché i dati sono di prova il sito non deve finire su Google:
         è una rete di sicurezza, non una scelta di stile */
      const m = document.createElement('meta')
      m.name = 'robots'; m.content = 'noindex, nofollow'
      document.head.appendChild(m)
      console.warn(
        '%c⚠ Dati di esempio in uso',
        'color:#E8A33A;font-weight:bold',
        '\nPartita IVA, numero d\'albo e Instagram sono inventati.' +
        '\nSostituiscili in src/testi.js e metti provvisori: false prima di pubblicare.'
      )
    }

    /* l'intestazione è fissa: quando comincia la parte scritta in
       fondo si toglie, altrimenti resta piantata sopra il testo */
    const testata = document.querySelector('.testata')
    const guarda = new IntersectionObserver(
      ([v]) => testata?.classList.toggle('via', v.isIntersecting),
      { rootMargin: '-70px 0px 0px 0px' }
    )
    const chiusa = document.querySelector('.chiusa')
    if (chiusa) guarda.observe(chiusa)

    /* la barra entra dopo la prima schermata e si toglie quando
       arrivano i pulsanti veri, per non averne due uguali a schermo */
    let vivo = true
    const seguiBarra = () => {
      if (!vivo) return
      const b = barra.current
      if (b) {
        const s = scroll.schermate
        const fine = TOTALE_SCHERMATE - CAPITOLI[CAPITOLI.length - 1].h
        b.classList.toggle('su', s > 0.9 && s < fine + 0.25)
      }
      requestAnimationFrame(seguiBarra)
    }
    requestAnimationFrame(seguiBarra)

    const muovi = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', muovi, { passive: true })

    /* frecce e Pagina su/giù saltano di capitolo:
       con una pagina così lunga, scorrere a mano è faticoso */
    const tasti = (e) => {
      if (e.target.tagName === 'INPUT') return
      const giu = e.key === 'ArrowDown' || e.key === 'PageDown'
      const su = e.key === 'ArrowUp' || e.key === 'PageUp'
      if (!giu && !su) return
      e.preventDefault()
      const corsa = window.innerHeight
      const ora = window.scrollY / corsa
      let obiettivo = 0
      for (let i = 0; i < CAPITOLI.length; i++) {
        const inizio = inizioDi(i)
        if (giu && inizio > ora + 0.15) { obiettivo = inizio; break }
        if (su && inizio < ora - 0.15) obiettivo = inizio
      }
      if (giu && obiettivo === 0) obiettivo = inizioDi(CAPITOLI.length - 1)
      window.scrollTo({ top: obiettivo * corsa + 4, behavior: 'smooth' })
    }
    window.addEventListener('keydown', tasti)

    return () => {
      window.removeEventListener('pointermove', muovi)
      window.removeEventListener('keydown', tasti)
      guarda.disconnect()
      vivo = false
    }
  }, [])

  return (
    <>
      <Scena mouse={mouse} />

      {/* griglia di riferimento: quasi invisibile, ma è ciò che
          fa sembrare la pagina costruita invece che appoggiata */}
      <div className="reticolo" aria-hidden="true">
        <span /><span /><span /><span />
      </div>

      {/* Due gesti sempre a portata di pollice. Compare dopo la
          prima schermata, così non rovina l'apertura, e sparisce
          quando si arriva ai pulsanti veri della sezione prenota. */}
      <div className="azione-fissa" ref={barra}>
        <a className="btn btn-pieno" href={`https://wa.me/${contatti.telefonoInternazionale}`}
           target="_blank" rel="noopener">Prenota</a>
        <a className="btn btn-linea" href={`tel:+${contatti.telefonoInternazionale}`}>Chiama</a>
      </div>

      <Apertura />
      <Sezioni />
      <Chiusura />
      <Indice />

      {/* presente dal primo fotogramma: nome, mestiere, città e
          il numero di telefono. Non copre la scena e non ruba
          il titolo, ma dice subito dove sei finito. */}
      <header className="testata">
        <a className="testata-marchio" href="#prenota">
          <span className="testata-segno" aria-hidden="true"><i /><i /><i /></span>
          <span className="testata-testo">
            <b>{marchio.nome}</b>
            <em>{marchio.ruolo}<span className="testata-citta"> · {marchio.luogo}</span></em>
          </span>
        </a>
        <a className="testata-tel" href={`tel:+${contatti.telefonoInternazionale}`}>
          {contatti.telefono}
        </a>
      </header>
    </>
  )
}
