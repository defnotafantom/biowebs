# Mettere il sito online

Tutto quello che serve è già nella cartella. Qui c'è cosa fare, nell'ordine.

---

## Prima di tutto: quattro cose che mancano

Queste vanno riempite **prima** di pubblicare. Le prime due sono obbligatorie per legge sul sito di un professionista.

| Cosa | Dove si scrive |
|---|---|
| **Partita IVA** | `src/testi.js` → `contatti.piva` |
| **Iscrizione all'Ordine dei Biologi** (sezione e numero) | `src/testi.js` → `contatti.albo` |
| Indirizzo del sito, quando avrai il dominio | `index.html` (in tre punti, sono segnalati) + `public/robots.txt` + `public/sitemap.xml` + `src/testi.js` → `contatti.sito` |
| Link Instagram, se c'è | `src/testi.js` → `contatti.instagram` |

Appena scrivi P. IVA e albo, compaiono da soli in fondo alla pagina: il codice li aspetta già.

**Manca anche la pagina privacy e cookie.** Il sito così com'è non usa cookie e non raccoglie dati — nessun modulo, nessuna statistica — quindi non serve la fascia del consenso. Ma appena aggiungi Google Analytics, un modulo di contatto o il pixel di Facebook, serve. Se vuoi la aggiungiamo prima.

---

## 1. Costruire il sito

Nella cartella `biowebs`, apri il terminale (Shift + tasto destro → "Apri finestra PowerShell qui") e scrivi:

```
npm run build
```

Dopo una decina di secondi compare una cartella nuova, **`dist`**. È il sito finito: sono quelli i file che vanno online. Non serve caricare né `src`, né `node_modules`, né gli altri.

Per controllarlo prima di pubblicare:

```
npm run preview
```

Apre il sito costruito su `http://localhost:4173`. È esattamente quello che vedranno gli altri.

---

## 2. Metterlo online su Netlify — la strada corta

1. Vai su **netlify.com** e registrati (basta l'email o l'account Google).
2. Nella pagina principale cerca il riquadro tratteggiato che dice di trascinare una cartella.
3. **Trascina dentro la cartella `dist`** — non `biowebs`, proprio `dist`.
4. Aspetta una ventina di secondi. Il sito è online, su un indirizzo tipo `qualcosa-a-caso-123.netlify.app`.
5. Da *Site configuration → Change site name* gli dai un nome più decente.

HTTPS e certificato di sicurezza: automatici, gratis, non devi fare niente.

**Per aggiornarlo** ripeti: `npm run build`, poi trascini di nuovo `dist`.

### La strada lunga ma più comoda (GitHub)

Se metti la cartella su GitHub e la colleghi a Netlify, ogni volta che cambi qualcosa il sito si aggiorna da solo. Il file `netlify.toml` che trovi nella cartella dice già a Netlify come costruirlo: non devi configurare nulla.

---

## 3. Vercel, se preferisci

Stessa storia: **vercel.com**, importi il progetto, riconosce Vite da solo. Il file `vercel.json` è già pronto.

---

## 4. Attaccare il dominio

1. Compra il dominio dove preferisci (Aruba, Namecheap, Cloudflare…). Un `.it` costa sui 10–15 € l'anno.
2. Su Netlify: *Domain management → Add a domain*, scrivi il dominio.
3. Netlify ti dà due o quattro indirizzi di *name server*. Vai nel pannello di chi ti ha venduto il dominio e sostituisci i suoi name server con quelli di Netlify.
4. Aspetta. Di solito un'ora, a volte un giorno.

**Appena il dominio funziona**, torna nei file e sostituisci `https://www.antoniotoscanonutrizionista.it/` con quello vero, in:

- `index.html` — canonical, `og:url`, e dentro il blocco dei dati strutturati (URL, immagine, logo)
- `public/robots.txt`
- `public/sitemap.xml`

Poi rifai `npm run build` e ricarica.

---

## 5. Farsi trovare su Google

Nell'ordine di quanto contano davvero:

**a) Profilo dell'attività su Google** — vai su *business.google.com* e rivendica o crea la scheda dello studio. Categoria: "Nutrizionista". Indirizzo, orari, telefono e **l'indirizzo del sito**. Per un professionista locale questo vale più di tutto il resto del sito messo insieme: è quello che fa comparire lo studio nella mappa quando qualcuno cerca "nutrizionista Reggio Calabria".

**b) Search Console** — *search.google.com/search-console*. Aggiungi il sito, verifica la proprietà (Netlify permette di farlo con un record DNS), e manda la sitemap: `https://iltuodominio.it/sitemap.xml`. Da lì vedi cosa cercano le persone che ti trovano.

**c) Le coordinate** — nei dati strutturati in `index.html` manca il campo `geo`, perché non conosco la posizione esatta di Via Italia 83. Aprila su Google Maps, clic destro sul punto, copia i due numeri, e aggiungi dentro il blocco `application/ld+json`:

```json
"geo": { "@type": "GeoCoordinates", "latitude": 38.xxxxx, "longitude": 15.xxxxx },
```

**d) Le recensioni** — non le ho messe nei dati strutturati apposta. Google penalizza le stelline dichiarate dal sito stesso quando non arrivano da una piattaforma vera. Le recensioni vanno raccolte sul profilo Google: da lì le stelline compaiono da sole, e valgono.

**e) Le pagine di approfondimento** — nessuno cerca "Antonio Toscano". Cercano "dieta colon irritabile Reggio Calabria" o "nutrizionista sportivo Reggio Calabria". Quattro pagine leggere, una per percorso, sono il passo successivo più utile.

---

## 6. Controlli prima di dire che è fatta

| Cosa | Dove |
|---|---|
| I dati strutturati sono validi | `search.google.com/test/rich-results` |
| Velocità e Core Web Vitals | `pagespeed.web.dev` |
| L'anteprima quando mandi il link | mandalo a te stesso su WhatsApp |
| Come si vede sul telefono | aprilo dal telefono, non solo rimpicciolendo la finestra |

Sul punteggio di PageSpeed: **non aspettarti 100**. Il file di Three.js pesa 680 KB e la scena 3D costa. Un sito così sta fra 70 e 90 sul telefono, ed è normale — il confronto giusto non è con un sito di solo testo, è con quello che il sito fa.

---

## Cosa NON caricare online

- La cartella `node_modules` (enorme e inutile online)
- La cartella `src` (è il sorgente, il sito costruito sta in `dist`)
- Il vecchio `admin.html`, se dovesse ricomparire: non ha una password vera
