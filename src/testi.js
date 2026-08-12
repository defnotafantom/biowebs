/* ═══════════════════════════════════════════════════════════════
   TUTTI I TESTI DEL SITO
   Stanno qui, in un punto solo, così si cambiano senza toccare
   né la scena né il layout.
   ═══════════════════════════════════════════════════════════════ */

/* ── l'intestazione, presente dal primo istante ──
   Chi arriva cercando "nutrizionista Reggio Calabria" deve capire
   subito di essere nel posto giusto. Pesa poco e non è il titolo:
   il crescendo dell'apertura resta intatto. */
export const marchio = {
  nome: 'A. Toscano',
  ruolo: 'Biologo Nutrizionista',
  luogo: 'Reggio Calabria',
}

/* ── le battute dell'apertura ──
   "da" e "a" sono il progresso del primo capitolo, da 0 a 1.
   Sono allineate a ciò che succede dietro: nella prima i punti
   sono ancora sparsi, nella seconda si avvitano nell'elica del suo
   logo, nella terza l'elica comincia a srotolarsi in una persona. */
/* Niente slogan. Per un professionista sanitario la sobrietà non è
   una rinuncia: è il tono giusto. Chi cerca un nutrizionista non
   vuole essere conquistato da una frase, vuole capire se sei serio.
   Una sola battuta, che arriva quando l'elica ha finito di comporsi. */
export const battute = [
  {
    da: 0.56, a: 1.00,
    riga: 'Dott. Antonio Toscano',
    forte: 'Biologo Nutrizionista',
    coda: 'Reggio Calabria · nutrizione clinica e sportiva',
  },
]

export const invito = 'scorri'
export const salta = 'vai al contenuto'

/* ── le sezioni ── */

export const sezioni = {
  strumenti: {
    numero: '02',
    etichetta: 'La strumentazione',
    titolo: 'Cinque strumenti che quasi nessuno ha.',
    testo:
      'Ogni strumento risponde a una domanda diversa e misura una parte diversa ' +
      'del corpo. Insieme restituiscono una fotografia che nessuna bilancia, ' +
      'da sola, potrà mai dare — e sono tutti compresi nella prima visita.',
    voci: [
      {
        sigla: 'BIA', nome: 'Akern BIA 101 BIVA PRO',
        breve: 'Bioimpedenziometria',
        nota: 'Una corrente debolissima attraversa il corpo e legge come i tessuti la ostacolano: massa magra, massa grassa, acqua dentro e fuori dalle cellule, angolo di fase.',
        misura: 'tutto il volume',
      },
      {
        sigla: 'ADIPO', nome: 'Adipometro Hosand',
        breve: 'Adipometria',
        nota: 'Ultrasuoni sotto la pelle: non quanto grasso hai, ma dove ce l’hai davvero.',
        misura: 'il guscio sottocutaneo',
      },
      {
        sigla: 'ANTRO', nome: 'NutriGeo8',
        breve: 'Antropometria',
        nota: 'Circonferenze e proporzioni, prese sempre negli stessi punti, confrontate nel tempo.',
        misura: 'quattro circonferenze',
      },
      {
        sigla: 'PLICO', nome: 'Plicometro digitale GIMA',
        breve: 'Plicometria',
        nota: 'Il riferimento storico del settore: quattro pliche cutanee, sempre le stesse, misurate al decimo di millimetro.',
        misura: 'quattro pizzichi',
      },
      {
        sigla: 'FORZA', nome: 'Dinamometro Kern MAP',
        breve: 'Dinamometria',
        nota: 'La forza di presa è un indicatore riconosciuto di stato nutrizionale: dice se il muscolo, oltre a esserci, funziona.',
        misura: 'il muscolo degli arti',
      },
    ],
    chiusa: 'Tutti compresi nella prima visita.',
  },

  chisono: {
    numero: '01',
    etichetta: 'Chi sono',
    titolo: 'Chi tiene in mano gli strumenti?',
    testo:
      'Sono un Biologo Nutrizionista con formazione avanzata in Nutrizione Clinica, ' +
      'mi occupo di educazione alimentare, prevenzione e supporto nutrizionale ' +
      'personalizzato, basato sulle più recenti evidenze scientifiche.',
    titoli: [
      { e: 'Albo', t: 'Ordine dei Biologi della Calabria', n: 'Sezione A · Cal_A2842' },
      { e: 'Master', t: 'Nutrizione Clinica', n: 'Master universitario di II livello' },
      { e: 'Specializzazione', t: 'Dieta Low FODMAP', n: 'Protocollo per l’intestino irritabile' },
    ],
    /* Le verifiche su piattaforme terze valgono più di qualunque
       cosa possa scrivere il sito di sé stesso: è qualcun altro
       che ha controllato. */
    verificatoTitolo: 'Profilo verificato su',
    verificato: [
      { nome: 'MioDottore', url: 'https://www.miodottore.it/profilo/antonio-toscano-2' },
      { nome: 'Nutridoc', url: '' },
    ],
    contattiTitolo: 'Contatti diretti',
  },

  condizioni: {
    numero: '03',
    etichetta: 'La tua condizione',
    titolo: 'Qual è la tua condizione?',
    testo: 'Quattro punti di partenza, quattro modi diversi di lavorare. Qui sotto tutto quello che tratto.',
    voci: [
      {
        breve: 'Intestino',
        titolo: 'Mi gonfio e sto male dopo i pasti',
        nota: 'Intestino irritabile e protocollo Low FODMAP',
        dentro: ['Colon irritabile e dieta Low FODMAP', 'Gonfiore e meteorismo', 'Reflusso, gastrite, disbiosi', 'Celiachia, Crohn, rettocolite', 'Intolleranza al lattosio'],
      },
      {
        breve: 'Peso',
        titolo: 'Voglio perdere peso',
        nota: 'Dimagrimento misurato, non a occhio',
        dentro: ['Sovrappeso e obesità', 'Dimagrimento sostenibile', 'Educazione alimentare', 'Pasti fuori casa', 'Menopausa'],
      },
      {
        breve: 'Sport',
        titolo: 'Mi alleno e voglio migliorare',
        nota: 'Ricomposizione corporea e performance',
        dentro: ['Aumento della massa muscolare', 'Definizione senza perdere forza', 'Timing dei nutrienti', 'Preparazione e recupero'],
      },
      {
        breve: 'Patologie',
        titolo: 'Ho una patologia da gestire',
        nota: 'Nutrizione clinica, in raccordo col medico',
        dentro: ['Diabete e insulinoresistenza', 'Colesterolo e trigliceridi', 'Ovaio policistico', 'Tiroide e autoimmuni', 'Fegato e reni'],
      },
    ],
  },

  prenota: {
    numero: '04',
    etichetta: 'Prenota',
    titolo: 'Scegli la visita e il momento.',
    testo:
      'La prima visita comprende l’intera valutazione strumentale. ' +
      'Ne esci con dei numeri veri e con un piano che puoi seguire.',
    prestazioni: [
      { id: 'prima-studio', nome: 'Prima visita', dove: 'in studio', durata: '90 minuti', prezzo: 70 },
      { id: 'prima-online', nome: 'Prima visita', dove: 'online', durata: '90 minuti', prezzo: 70 },
      { id: 'controllo-studio', nome: 'Visita di controllo', dove: 'in studio', durata: '60 minuti', prezzo: 50 },
      { id: 'controllo-online', nome: 'Visita di controllo', dove: 'online', durata: '60 minuti', prezzo: 50 },
    ],
    incluso: [
      'Anamnesi alimentare, clinica e sportiva',
      'Tutti e cinque gli strumenti',
      'Piano alimentare personalizzato',
    ],
    visitaTitolo: 'La visita',
    inclusoTitolo: 'Comprende',
    quandoTitolo: 'Prossimi posti liberi',
    datiTitolo: 'I tuoi dati',
    campi: {
      nome: 'Nome e cognome',
      telefono: 'Telefono',
      email: 'E-mail',
      nota: 'Vuoi aggiungere qualcosa? (facoltativo)',
      notaAiuto: 'Una condizione, una terapia in corso, una domanda: quello che ti sembra utile.',
    },
    altro: 'Un altro momento',
    altroAiuto: 'Scrivimi quando ti verrebbe comodo e ti propongo io un orario.',
    azione: 'Invia la richiesta',
    attesa: 'Invio…',
    consenso: 'Acconsento al trattamento dei dati per essere ricontattato.',
    nota: 'Nessun pagamento adesso. Ricevi la conferma dal dottore, di solito in giornata.',
    fattoTitolo: 'Richiesta inviata.',
    fattoTesto: 'Il dottore ti risponde per confermare giorno e ora. Se nel frattempo cambia qualcosa, puoi scrivergli allo stesso numero.',
    fattoAncora: 'Fanne un’altra',
    guasto: 'Non è partita. Riprova, oppure scrivi direttamente su WhatsApp.',
  },

  recensioni: {
    numero: '05',
    etichetta: 'Recensioni',
    titolo: 'Chi c’è già passato.',
    testo: 'Recensioni verificate su MioDottore: chi le ha scritte ha lasciato un numero di telefono confermato.',
    fonte: { nome: 'MioDottore', url: 'https://www.miodottore.it/profilo/antonio-toscano-2' },
    voci: [
      {
        chi: 'Alessandro', stelle: 5, quando: '5 giugno 2026',
        tipo: 'visita nutrizionale di controllo',
        t: 'Mi sono rivolto al Dott. Toscano su consiglio del mio gastroenterologo che mi ha indirizzato verso un nutrizionista esperto nella gestione della sindrome dell’intestino irritabile e nella dieta Fodmap. Sono attualmente alla seconda visita e rispetto a prima, la mia sintomatologia è sotto controllo e il momento del pasto non è più una preoccupazione come in passato. Mi sto trovando molto bene perché il piano alimentare è stato elaborato rispettando le mie abitudini quotidiane e i miei orari ed è facile da seguire. Consiglio vivamente il Dott. Toscano a chiunque cerchi un professionista preparato, attento e competente.',
      },
      {
        chi: 'Antonia', stelle: 5, quando: '26 maggio 2026',
        tipo: 'prima visita nutrizionale',
        t: 'Professionista preparato e alla mano. Mi ha messa subito a mio agio e mi ha ascoltata con attenzione. La visita è stata accurata e abbiamo effettuato anche bioimpedenziometria, adipometria e plicometria per valutare bene la composizione corporea. Sono uscita dalla visita con più fiducia e motivazione.',
      },
      {
        chi: 'Riccardo Ciano Albanese', stelle: 5, quando: '9 maggio 2026',
        tipo: 'visita nutrizionale di controllo',
        t: 'Sono arrivato alla quarta visita con Antonio e mi ritengo molto soddisfatto. Ho iniziato con lui un percorso di ricomposizione corporea e i risultati iniziano a vedersi, sia allo specchio che nei numeri. Antonio è un vero esperto nella valutazione della composizione corporea, nel suo studio ho effettuato plicometria, bioimpedenziometria e l’adipometria (una tecnica che non avevo mai provato). Questi esami mi hanno aiutato a capire esattamente come sta cambiando il mio fisico, andando ben oltre il semplice peso sulla bilancia. Consigliatissimo!',
      },
    ],
    verificata: 'Numero di telefono verificato',
  },
}

/* ═══════════════════════════════════════════════════════════════
   LA CHIUSURA
   Questa parte NON è un effetto: è testo vero, sempre visibile,
   in fondo alla pagina. Serve a due tipi di visitatore che il resto
   del sito non serve bene:

     · chi vuole solo i fatti — indirizzo, orari, prezzo, "tratti
       la mia condizione?" — e non ha voglia di scorrere un'esperienza
     · Google, che di tutto il resto vede poco: i testi delle sezioni
       vivono in strati sovrapposti che partono invisibili

   Per le ricerche locali è questa la parte che lavora.
   ═══════════════════════════════════════════════════════════════ */
export const chiusura = {
  titolo: 'Condizioni trattate',
  testo:
    'Studio di nutrizione clinica e sportiva a Reggio Calabria. Percorsi personalizzati ' +
    'costruiti sulla valutazione strumentale della composizione corporea, non su tabelle standard.',
  gruppi: [
    {
      titolo: 'Apparato digerente',
      voci: [
        'Sindrome del colon irritabile', 'Dieta Low FODMAP', 'Gonfiore addominale e meteorismo',
        'Reflusso gastroesofageo', 'Gastrite', 'Disbiosi intestinale', 'Stipsi cronica',
        'Malattia celiaca', 'Morbo di Crohn', 'Rettocolite ulcerosa',
        'Intolleranza al lattosio', 'Diverticolosi',
      ],
    },
    {
      titolo: 'Peso e composizione corporea',
      voci: [
        'Sovrappeso e obesità', 'Dimagrimento localizzato', 'Ricomposizione corporea',
        'Educazione alimentare', 'Gestione dei pasti fuori casa', 'Sindrome metabolica',
        'Disturbi del comportamento alimentare (in équipe)', 'Menopausa e climaterio',
      ],
    },
    {
      titolo: 'Nutrizione sportiva',
      voci: [
        'Aumento della massa muscolare', 'Definizione e periodo di scarico',
        'Alimentazione per sport di endurance', 'Alimentazione per sport di forza',
        'Timing dei nutrienti', 'Integrazione e recupero', 'Idratazione e sudorazione',
      ],
    },
    {
      titolo: 'Nutrizione clinica',
      voci: [
        'Diabete di tipo 2', 'Insulinoresistenza', 'Ipercolesterolemia', 'Ipertrigliceridemia',
        'Ipertensione arteriosa', 'Sindrome dell’ovaio policistico', 'Endometriosi',
        'Ipotiroidismo e tiroidite di Hashimoto', 'Steatosi epatica',
        'Insufficienza renale (in raccordo col nefrologo)', 'Iperuricemia e gotta',
        'Anemia sideropenica', 'Osteoporosi',
      ],
    },
    {
      titolo: 'Fasi della vita',
      voci: [
        'Gravidanza e allattamento', 'Alimentazione pediatrica', 'Adolescenza',
        'Terza età e sarcopenia', 'Alimentazione vegetariana e vegana',
      ],
    },
  ],
  studioTitolo: 'Lo studio',
  /* La strumentazione non è più un blocco a sé: aveva un titolo
     grande quanto "Lo studio" e si contendevano l'attenzione in
     fondo alla pagina. I nomi restano — servono a chi cerca
     "adipometro Reggio Calabria" — ma come una riga sola, sotto
     l'indirizzo, che è il posto dove stanno gli strumenti. */
  strumentiRiga: 'In studio: bioimpedenziometro Akern BIA 101 BIVA PRO · adipometro a ultrasuoni Hosand · antropometro NutriGeo8 · plicometro digitale GIMA · dinamometro Kern MAP.',
  comeArrivare: 'Come arrivare',
  mappaTitolo: 'Guarda la mappa',
  mappaAiuto: 'La mappa arriva da Google: si carica solo se la apri tu, così finché non la chiedi non ti mette niente sul computer.',
  mappaApri: 'Apri in Mappe',
  nota:
    'Le informazioni presenti in questo sito hanno finalità divulgativa e non sostituiscono ' +
    'il parere del medico curante. Il piano alimentare viene elaborato solo dopo visita in studio.',
}

/* ── contatti ── */
export const contatti = {
  telefono: '371 363 8894',
  telefonoInternazionale: '393713638894',
  email: 'antoniotoscanonutrizionista@gmail.com',
  indirizzo: 'Via Italia 83',
  citta: 'Reggio Calabria',
  cap: '89100',
  orari: 'Lun–Ven 9:00–13:00 / 15:00–19:00',
  /* ⚠ DATI DI ESEMPIO — DA SOSTITUIRE PRIMA DI PUBBLICARE
     La partita IVA e il link Instagram sono inventati; il numero
     d'albo invece è quello vero, preso dal biglietto da visita.
     Finché "provvisori" è true, in fondo al sito compare un avviso
     arancione e nella console del browser un messaggio: è una rete
     di sicurezza perché nessuno pubblichi per sbaglio una partita
     IVA inventata, che è un guaio serio. Appena hai quelli veri,
     scrivili qui e metti provvisori: false. */
  provvisori: true,
  piva: '01234567890',
  /* questo è vero: sta sul biglietto da visita */
  albo: 'Ordine dei Biologi della Calabria — Sez. A · Cal_A2842',
  sito: 'https://www.antoniotoscanonutrizionista.it',
  instagram: 'https://www.instagram.com/dott.antoniotoscano/',
  instagramNome: '@dott.antoniotoscano',
}
