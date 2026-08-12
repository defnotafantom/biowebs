# Biowebs — come avviarlo

Progetto React + Three.js. Non si apre con doppio clic: una scena 3D ha bisogno di un server locale.

## Le due volte che serve il terminale

1. Apri la cartella `biowebs`, tieni premuto **Shift** e fai **tasto destro** in un punto vuoto → **Apri finestra PowerShell qui** (oppure "Apri nel terminale").
2. Scrivi, una volta sola:

```
npm install
```

Ci mette un paio di minuti: sta scaricando Three.js e il resto.

3. Poi, ogni volta che vuoi guardare il sito:

```
npm run dev
```

Si apre da solo il browser su `http://localhost:5173`. Lascialo aperto: ogni modifica che faccio si vede **subito**, senza ricaricare niente.

Per fermarlo: `Ctrl + C` nel terminale.

---

## Se `npm` non esiste

Vuol dire che manca Node.js. Si scarica da [nodejs.org](https://nodejs.org) — versione **LTS**, installazione avanti-avanti. Poi chiudi e riapri il terminale.

---

## L'idea del sito

Le particelle non sono sferette astratte: **sono i frutti veri del suo logo**, ritagliati uno per uno dall'immagine originale. Fluttuano sparsi, poi si radunano e ricompongono l'elica del marchio.

Poi, nel corpo del sito, cambiano mestiere: diventano **disegni tecnici che seguono il cursore**. Passi il mouse su "plicometro" e i punti compongono un plicometro; passi su "colon irritabile" e diventano un intestino. L'illustrazione anticipa il contenuto prima ancora che tu legga la riga.

## I sei capitoli

| # | Capitolo | La scena | Schermate |
|---|---|---|---|
| — | Apertura | i frutti si radunano nell'elica | 0 → 2,4 |
| 01 | Il metodo | il disegno dello strumento puntato | 2,4 → 4,4 |
| 02 | **Chi sono** | **la scena si ritira: c'è la fotografia** | 4,4 → 6,2 |
| 03 | Perché misuro | la sezione trasversale, col cursore | 6,2 → 8,2 |
| 04 | Di cosa mi occupo | il disegno del percorso puntato | 8,2 → 10,1 |
| 05 | Prenota | i frutti tornano e richiudono l'elica | 10,1 → 11,7 |

Chi comanda la scena è `lib/capitoli.js`, tabella `SCENA`: una riga per capitolo, e per ognuna se ci sono i frutti e se c'è il disegno. Prima questi tempi erano numeri assoluti sparsi in due file — *"i frutti escono alla schermata 3,25"* — e bastava aggiungere un capitolo per sfasare tutto.

## Cosa succede scorrendo

| Schermata | La scena | Il testo |
|---|---|---|
| 0 → 1 | i frutti fluttuano sparsi | *La bilancia dice un numero.* |
| 1 → 2,4 | si radunano nell'elica: il logo | *Io ti dico cosa c'è dentro.* + la firma |
| 2,4 → 3,3 | i frutti si disperdono, entra il disegno | **01 · Il metodo** |
| 3,3 → 4,4 | il disegno segue lo strumento puntato | i cinque strumenti |
| 4,4 → 6,4 | la sezione trasversale segue il cursore | **02 · Perché misuro** |
| 6,4 → 8,3 | il disegno segue il percorso puntato | **03 · Di cosa mi occupo** |
| 8,3 → 9,9 | i frutti tornano e richiudono l'elica | **04 · Prenota** |

Dal primo fotogramma, in alto, c'è già **nome, mestiere, città e telefono**. Pesa poco e non ruba il titolo, ma chi arriva cercando "nutrizionista Reggio Calabria" capisce subito di essere nel posto giusto. Un sito d'agenzia può permettersi tre secondi di mistero; un professionista locale no.

## I dodici disegni

Cinque strumenti, quattro percorsi di cura, e una sezione trasversale che cambia col cursore.

| Voce | Il disegno |
|---|---|
| BIA | l'apparecchio, i due cavi, gli elettrodi e la corrente che passa |
| ADIPO | la sonda a ultrasuoni sulla pelle e lo spessore che legge |
| ANTRO | il metro a nastro chiuso in circonferenza, con le tacche |
| PLICO | la pinza che pizzica la plica |
| FORZA | il dinamometro da presa, col quadrante |
| intestino · peso · allenamento · patologie | un intestino, una bilancia, un manubrio, uno stetoscopio |
| composizione | la sezione di un arto: pelle, grasso, muscolo, osso — **il guscio si ingrossa muovendo il cursore** |

Sono descritti a mano in `scene/disegni.js`, con quattro primitive soltanto: linea, cerchio, arco, curva. Nessun SVG da caricare, nessun file esterno: sono numeri, e i numeri si correggono.

## Il file per file

```
biowebs/
  public/
    frutti.png          l'atlante: 18 frutti e 10 chicchi ritagliati dal logo
  src/
    App.jsx             impianto, intestazione, griglia, tasti freccia
    testi.js            TUTTI I TESTI — si cambiano qui, in un punto solo
    index.css           il sistema visivo
    lib/
      capitoli.js       quanto dura ogni testo, e il ritmo della scena
      scroll.js         lo scorrimento + il canale fra pagina e scena
    scene/
      Scena.jsx         telecamera, luci, atmosfera, effetti
      Frutti.jsx        i frutti: aprono e chiudono il sito
      elica.js          la geometria dell'elica del logo
      Disegno.jsx       i punti che seguono il cursore
      disegni.js        I DODICI DISEGNI — descritti a mano
    ui/
      Apertura.jsx      le battute del primo capitolo
      Sezioni.jsx       le quattro sezioni
      Indice.jsx        i trattini sul bordo destro
```

## I numeri che si possono girare

| Dove | Cosa |
|---|---|
| `lib/capitoli.js` | quanto spazio occupa ogni testo, e il ritmo dei due sistemi |
| `testi.js` | tutte le parole, e l'intestazione |
| `index.css` → `:root` | colori, filetti, curva del movimento |
| `index.css` → `--colonna` | quanto è larga la colonna di testo |
| `scene/elica.js` | giri, altezza, raggio dell'elica e quanti frutti |
| `scene/disegni.js` | ogni disegno, riga per riga |
| `scene/Scena.jsx` → `INQUADRATURE` | quanto è lontana la telecamera |

## Tre vincoli da non rompere

**La coda.** In fondo al documento c'è una schermata vuota (`CODA`): senza, l'ultimo capitolo non arriverebbe mai a compimento, perché l'ultima schermata si vede ma non si scorre.

**Le proporzioni dell'elica.** Con i frutti troppo grossi o troppo numerosi i due filamenti si toccano e l'elica diventa una colonna. E i chicchi devono essere fitti al punto da sfiorarsi: due filamenti punteggiati sembrano due file di puntini, due filamenti continui sembrano due corde che si avvitano.

**Le distanze della telecamera.** Non sono a occhio: con un obiettivo da 34 gradi l'altezza inquadrata vale 0,61 volte la distanza. L'elica è alta quasi 9 unità e ne chiede almeno 15; i disegni sono alti 5 e stanno comodi a 12. Lo stacco fra il bordo del testo e il bordo della scena è verificato in pixel su 1366, 1440 e 1920: non scende mai sotto i 58.

## Sul telefono è un altro impianto

Non una riduzione: un montaggio diverso. Sul computer scena e testo stanno affiancati; su una colonna da 390 pixel non ci stanno.

- la scena sale nella **fascia alta** dello schermo, il testo le scorre sotto;
- le voci **si toccano** invece di passarci sopra il mouse, e quella toccata resta accesa;
- le altezze sono in `dvh`: con `vh`, la barra degli indirizzi che compare e scompare farebbe saltare tutto;
- i bersagli da toccare non scendono sotto i 46 px, cursore compreso;
- **57% di particelle in meno** e **52% di punti in meno**, niente bagliore, risoluzione limitata a 1,5×.

La telecamera lo sa da sola: la distanza si ricava dalla larghezza dello schermo, e non scende mai sotto 16 — altrimenti in orizzontale la scena diventerebbe minuscola. Sta tutto in `lib/schermo.js`.

Chi ha chiesto al sistema **meno animazioni** le vede sparire tutte, e le particelle scendono a un terzo.

## Come si fa trovare

Il problema c'era ed era serio: i testi delle sezioni vivono in strati sovrapposti che partono invisibili, e di quella roba Google vede poco. La soluzione non è un trucco, è una sezione in più.

**In fondo alla pagina c'è testo vero**, in flusso normale, sempre visibile: 262 parole, 3 titoli h2, 5 h3, 50 condizioni elencate, indirizzo marcato `<address>`, telefono ed email cliccabili. Serve a Google e serve a chi vuole solo i fatti senza scorrere un racconto.

Più:

- **dati strutturati** di tipo `Nutritionist` — indirizzo, orari in due fasce, telefono, prezzo, area servita, quindici argomenti dichiarati. È questo che fa comparire la scheda nel riquadro laterale di Google;
- **titolo** scritto per chi cerca (`Nutrizionista a Reggio Calabria`), 54 caratteri, non viene tagliato;
- **anteprima social** 1200×630 con l'elica vera, per quando il link si manda su WhatsApp;
- `robots.txt`, `sitemap.xml`, favicon, icona per iOS, `<noscript>` con i recapiti;
- un **h1 vero**: è la firma nell'apertura, che era già visibile — non ne ho nascosto uno finto da qualche parte.

> **Cosa manca ancora:** partita IVA e iscrizione all'albo (obbligatorie per legge), le coordinate esatte dello studio, e il dominio. Tutto spiegato in `ISTRUZIONI-ONLINE.md`.

## Le prestazioni

Sul computer 660 particelle di frutta in **28 disegni** che condividono una sola immagine da 350 KB — clonare una texture in three.js non ricarica il file, cambia solo il ritaglio. I 900 punti dei disegni stanno in **un solo disegno** da 32 000 triangoli, con le matrici scritte a mano invece che con `compose()`.

Il sito costruito pesa **1,7 MB** in tutto, che diventano circa 320 KB compressi per il codice più le immagini. Three.js sta in un file suo: chi torna sul sito non lo riscarica quando cambiamo un testo.

## Metterlo online

Sta tutto in **`ISTRUZIONI-ONLINE.md`**, scritto passo per passo. In breve: `npm run build`, poi si trascina la cartella `dist` su Netlify. I file di configurazione (`netlify.toml`, `vercel.json`) sono già pronti e non vanno toccati.


## Per capire cosa sta succedendo

Dalla console del browser: `window.bio.scroll` dice a che capitolo sei, quanto sei dentro e a che schermata. `window.bio.stato` dice quale strumento e quale percorso sono selezionati. Serve quando qualcosa non si vede e non si capisce perché.

E `localhost:5173/prova-telefono.html` mostra il sito affiancato a tre misure — iPhone 14, iPhone SE, iPad — senza usare gli strumenti da sviluppatore.

> **Attenzione quando provi.** Se la finestra del browser finisce in secondo piano, Chrome sospende le animazioni: la pagina resta ferma al primo fotogramma e sembra rotta. Non lo è — basta riportarla davanti.
