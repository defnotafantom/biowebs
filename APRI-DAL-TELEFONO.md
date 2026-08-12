# Aprire il sito dal telefono

Due strade. La prima funziona **adesso**, in mezzo minuto. La seconda dà un indirizzo vero, da mandare a chi vuoi.

---

## 1 · Subito, dalla tua rete di casa

Il telefono e il computer devono essere sulla **stessa rete WiFi**. Nient'altro.

Nella cartella `biowebs`, apri il terminale (Shift + tasto destro → *Apri finestra PowerShell qui*) e scrivi:

```
npm run build
npm run preview -- --host
```

Il terminale risponde con due indirizzi, tipo:

```
➜  Local:   http://localhost:4173/
➜  Network: http://192.168.1.47:4173/
```

**Quello che ti serve è il secondo**, quello che comincia per `192.168`. Scrivilo nel browser del telefono e il sito si apre.

Due avvertenze oneste:

- il numero cambia se cambi rete o se il router riassegna gli indirizzi;
- se non si apre, quasi sempre è il **firewall di Windows**: la prima volta compare una finestra che chiede se autorizzare Node.js sulle reti private — vai di sì. Se l'hai già negata, cercala in *Windows Defender Firewall → Consenti app*.

Uso `preview` e non `dev` di proposito: `preview` serve il sito **costruito**, cioè esattamente com'è online. `dev` è più lento e sul telefono si sente.

---

## 2 · Un indirizzo vero, senza aprirlo al mondo

Vai su **[app.netlify.com/drop](https://app.netlify.com/drop)** e trascina dentro la cartella **`dist`** (quella creata da `npm run build`, non `biowebs`).

Non serve registrarsi. In una ventina di secondi ti dà un indirizzo tipo `https://parola-a-caso-123456.netlify.app` che funziona da qualunque telefono, ovunque.

**Sul "privato":** quell'indirizzo è casuale e non lo conosce nessuno finché non lo mandi tu. In più, finché in `src/testi.js` c'è `provvisori: true`, il sito **dice ai motori di ricerca di non indicizzarlo** — l'ho collegato apposta a quell'interruttore, così non si può sbagliare. Non è una password: è un indirizzo che nessuno indovina e che Google ignora. Per una prova basta e avanza.

Se ti serve una password vera, Netlify la offre nel piano a pagamento (circa 19 $ al mese). Per far vedere il sito a tre persone non ne vale la pena.

> **Perché non lo faccio io:** creare account e caricare file a tuo nome è una cosa che devi fare tu. Il trascinamento su Netlify Drop dura meno di quanto ci ho messo a scriverlo.

---

## Quando sarà quello definitivo

1. Metti la partita IVA vera e il link Instagram in `src/testi.js`, e cambia `provvisori: true` in `false` — sparisce l'avviso arancione in fondo e il sito torna indicizzabile.
2. Sostituisci `https://www.antoniotoscanonutrizionista.it/` col dominio vero in `index.html`, `public/robots.txt` e `public/sitemap.xml`.
3. `npm run build` e ricarichi.

Il resto — dominio, HTTPS, Search Console — sta in `ISTRUZIONI-ONLINE.md`.
