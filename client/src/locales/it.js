export default {
  // Navigation
  nav: {
    overview: 'Panoramica',
    inventory: 'Inventario',
    orders: 'Ordini',
    finance: 'Finanza',
    demandForecast: 'Previsione Domanda',
    reports: 'Report',
    restocking: 'Riordino',
    companyName: 'Catalyst Components',
    subtitle: 'Sistema di Gestione Inventario'
  },

  // Restocking
  restocking: {
    title: 'Raccomandazioni di Riordino',
    subtitle: 'L\'algoritmo propone un piano di acquisto; tu decidi cosa ordinare.',
    budgetLabel: 'Budget',
    budgetPlaceholder: 'Inserisci budget massimo',
    resetBudget: 'Ripristina',
    recommendedTotal: 'Totale Raccomandato',
    budgetUsed: 'Budget Utilizzato',
    budgetRemaining: 'Residuo',
    deferred: 'Posticipati (oltre budget)',
    recommendationsTitle: 'Ordini di Acquisto Raccomandati',
    selectAll: 'Seleziona tutti',
    clearSelection: 'Deseleziona',
    generatePOs: 'Genera Ordini',
    empty: 'Nessun riordino necessario — ogni articolo è al di sopra del punto di riordino con la previsione attuale.',
    priority: 'Priorità',
    sku: 'SKU',
    itemName: 'Articolo',
    warehouse: 'Magazzino',
    onHand: 'Disponibile',
    reorderPoint: 'Pt. Riordino',
    forecast: 'Previsione',
    recommendedQty: 'Qtà Racc.',
    unitCost: 'Costo Unit.',
    lineCost: 'Costo Riga',
    summaryTitle: 'Conferma Ordini di Acquisto',
    summaryIntro: 'Stai per generare {count} ordini di acquisto.',
    summaryTotalCost: 'Costo totale',
    summaryByWarehouse: 'Ripartizione per magazzino',
    summaryNote: 'Gli ordini saranno creati come bozze; potrai modificarli prima dell\'invio ai fornitori.',
    cancel: 'Chiudi',
    confirmGenerate: 'Genera',
    submitting: 'Generazione…',
    resultAllOk: '{count} ordini di acquisto creati come bozza.',
    resultAllFailed: 'Errore nella creazione di tutti i {count} ordini di acquisto.',
    resultMixed: '{ok} creati, {failed} falliti.',
    loadError: 'Errore nel caricamento dei dati di riordino'
  },

  // Reports
  reports: {
    title: 'Report di Performance',
    subtitle: 'Metriche trimestrali e tendenze mensili',
    quarterlyTitle: 'Performance Trimestrale',
    monthlyTrendTitle: 'Andamento Ricavi Mensili',
    momTitle: 'Analisi Mese su Mese',
    quarter: 'Trimestre',
    month: 'Mese',
    orders: 'Ordini',
    totalOrders: 'Ordini Totali',
    revenue: 'Ricavi',
    totalRevenue: 'Ricavi Totali',
    avgOrderValue: 'Valore Medio Ordine',
    fulfillmentRate: 'Tasso di Evasione',
    change: 'Variazione',
    growthRate: 'Tasso di Crescita',
    summaryRevenue: 'Ricavi Totali (periodo)',
    summaryAvgMonthly: 'Ricavo Medio Mensile',
    summaryTotalOrders: 'Ordini Totali (periodo)',
    summaryBestQuarter: 'Trimestre Migliore',
    loadError: 'Errore nel caricamento dei report'
  },

  // Dashboard
  dashboard: {
    title: 'Panoramica',
    kpi: {
      title: 'Indicatori Chiave di Performance',
      inventoryTurnover: 'Tasso di Rotazione Inventario',
      ordersFulfilled: 'Ordini Evasi',
      orderFillRate: 'Tasso di Evasione Ordini',
      revenue: 'Ricavi (Ordini)',
      revenueYTD: 'Ricavi (Ordini) da Inizio Anno',
      revenueMTD: 'Ricavi (Ordini) da Inizio Mese',
      avgProcessingTime: 'Tempo Medio di Elaborazione (Giorni)',
      goal: 'Obiettivo'
    },
    summary: {
      title: 'Riepilogo'
    },
    orderHealth: {
      title: 'Stato Ordini',
      totalOrders: 'Ordini Totali',
      revenue: 'Ricavi',
      avgOrderValue: 'Valore Medio Ordine',
      onTimeRate: 'Tasso Puntualità',
      avgFulfillmentDays: 'Giorni Medi di Evasione',
      total: 'Totale'
    },
    ordersByMonth: {
      title: 'Ordini per Mese'
    },
    inventoryValue: {
      title: 'Valore Inventario per Categoria'
    },
    inventoryShortages: {
      title: 'Carenze di Inventario',
      noShortages: 'Nessuna carenza di inventario - tutti gli ordini possono essere evasi!',
      noData: 'Nessun dato di inventario per i filtri selezionati',
      orderId: 'ID Ordine',
      sku: 'SKU',
      itemName: 'Nome Articolo',
      quantityNeeded: 'Quantità Necessaria',
      quantityAvailable: 'Quantità Disponibile',
      shortage: 'Carenza',
      daysDelayed: 'Giorni di Ritardo',
      priority: 'Priorità',
      unitsShort: 'unità mancanti',
      days: 'giorni'
    },
    pareto: {
      title: 'Analisi Pareto / ABC',
      subtitle: 'Ordini classificati — A: 80% del totale, B: 80–95%, C: 95–100%',
      classA: 'Classe A',
      classB: 'Classe B',
      classC: 'Classe C',
      orders: 'Ordini',
      revenue: 'Ricavi',
      cumulative: 'Cumulato %',
      metric: 'Metrica',
      metricOrderValue: 'Valore Ordine',
      metricItemCount: 'Articoli per Ordine',
      xAxis: 'Ordini (classificati)',
      filterActive: 'Filtro per Classe {cls}',
      clearFilter: 'Rimuovi filtro'
    },

    topProducts: {
      title: 'Prodotti Top per Ricavi',
      sku: 'SKU',
      product: 'Prodotto',
      category: 'Categoria',
      warehouse: 'Magazzino',
      stockStatus: 'Stato Scorte',
      revenue: 'Ricavi',
      unitsOrdered: 'Unità Ordinate',
      firstOrder: 'Primo Ordine',
      inStock: 'Disponibile',
      lowStock: 'Scorte Basse'
    }
  },

  // Inventory
  inventory: {
    title: 'Inventario',
    description: 'Traccia e gestisci tutti gli articoli di inventario',
    stockLevels: 'Livelli di Scorte',
    skus: 'SKU',
    searchPlaceholder: 'Cerca per nome articolo...',
    clearSearch: 'Cancella ricerca',
    totalItems: 'Articoli Totali',
    totalValue: 'Valore Totale',
    lowStockItems: 'Articoli con Scorte Basse',
    warehouses: 'Magazzini',
    table: {
      sku: 'SKU',
      itemName: 'Nome Articolo',
      name: 'Nome',
      category: 'Categoria',
      warehouse: 'Magazzino',
      quantity: 'Quantità',
      quantityOnHand: 'Quantità Disponibile',
      reorderPoint: 'Punto di Riordino',
      unitCost: 'Costo Unitario',
      unitPrice: 'Prezzo Unitario',
      totalValue: 'Valore Totale',
      location: 'Ubicazione',
      status: 'Stato'
    }
  },

  // Orders
  orders: {
    title: 'Ordini',
    description: 'Visualizza e gestisci gli ordini dei clienti',
    allOrders: 'Tutti gli Ordini',
    totalOrders: 'Ordini Totali',
    totalRevenue: 'Ricavi Totali',
    avgOrderValue: 'Valore Medio Ordine',
    onTimeDelivery: 'Consegna Puntuale',
    itemsCount: '{count} articoli',
    quantity: 'Qtà',
    table: {
      orderNumber: 'Numero Ordine',
      orderId: 'ID Ordine',
      orderDate: 'Data Ordine',
      date: 'Data',
      customer: 'Cliente',
      category: 'Categoria',
      warehouse: 'Magazzino',
      items: 'Articoli',
      value: 'Valore',
      totalValue: 'Valore Totale',
      status: 'Stato',
      expectedDelivery: 'Consegna Prevista',
      actualDelivery: 'Consegna Effettiva'
    }
  },

  // Finance/Spending
  finance: {
    title: 'Dashboard Finanza',
    description: 'Traccia ricavi, costi e performance finanziaria',
    totalRevenue: 'Ricavi Totali',
    totalCosts: 'Costi Totali',
    netProfit: 'Utile Netto',
    avgOrderValue: 'Valore Medio Ordine',
    fromOrders: 'Da {count} ordini',
    costBreakdown: 'Approvvigionamento + Operativo + Manodopera + Spese Generali',
    margin: 'margine',
    perOrderRevenue: 'Ricavo per ordine',
    revenueVsCosts: {
      title: 'Ricavi Mensili vs Costi',
      revenue: 'Ricavi',
      costs: 'Costi Totali'
    },
    monthlyCostFlow: {
      title: 'Flusso Costi Mensile',
      procurement: 'Approvvigionamento',
      operational: 'Operativo',
      labor: 'Manodopera',
      overhead: 'Spese Generali'
    },
    categorySpending: {
      title: 'Spesa per Categoria',
      ofTotal: 'del totale'
    },
    transactions: {
      title: 'Transazioni Recenti',
      id: 'ID',
      description: 'Descrizione',
      vendor: 'Fornitore',
      date: 'Data',
      amount: 'Importo'
    }
  },

  // Demand Forecast
  demand: {
    title: 'Previsione Domanda',
    description: 'Analizza tendenze della domanda e previsioni',
    increasingDemand: 'Domanda in Crescita',
    stableDemand: 'Domanda Stabile',
    decreasingDemand: 'Domanda in Calo',
    itemsCount: '{count} articoli',
    more: 'altri...',
    demandForecasts: 'Previsioni di Domanda',
    table: {
      sku: 'SKU',
      itemName: 'Nome Articolo',
      currentDemand: 'Domanda Attuale',
      forecastedDemand: 'Domanda Prevista',
      change: 'Variazione',
      trend: 'Tendenza',
      period: 'Periodo'
    }
  },

  // Filters
  filters: {
    timePeriod: 'Periodo',
    location: 'Ubicazione',
    category: 'Categoria',
    orderStatus: 'Stato Ordine',
    all: 'Tutti',
    allMonths: 'Tutti i Mesi',
    from: 'Da',
    to: 'A'
  },

  // Statuses
  status: {
    delivered: 'Consegnato',
    shipped: 'Spedito',
    processing: 'In Elaborazione',
    backordered: 'In Arretrato',
    inStock: 'Disponibile',
    lowStock: 'Scorte Basse',
    adequate: 'Adeguato'
  },

  // Trends
  trends: {
    increasing: 'in crescita',
    stable: 'stabile',
    decreasing: 'in calo'
  },

  // Priority
  priority: {
    high: 'Alta',
    medium: 'Media',
    low: 'Bassa'
  },

  // Categories
  categories: {
    circuitBoards: 'Circuiti Stampati',
    sensors: 'Sensori',
    actuators: 'Attuatori',
    controllers: 'Controller',
    powerSupplies: 'Alimentatori'
  },

  // Spending Categories
  spendingCategories: {
    rawMaterials: 'Materie Prime',
    components: 'Componenti',
    equipment: 'Attrezzatura',
    consumables: 'Materiali di Consumo'
  },

  // Warehouses
  warehouses: {
    sanFrancisco: 'San Francisco',
    london: 'Londra',
    tokyo: 'Tokyo'
  },

  // Months
  months: {
    jan: 'Gen',
    feb: 'Feb',
    mar: 'Mar',
    apr: 'Apr',
    may: 'Mag',
    jun: 'Giu',
    jul: 'Lug',
    aug: 'Ago',
    sep: 'Set',
    oct: 'Ott',
    nov: 'Nov',
    dec: 'Dic',
    january: 'Gennaio',
    february: 'Febbraio',
    march: 'Marzo',
    april: 'Aprile',
    june: 'Giugno',
    july: 'Luglio',
    august: 'Agosto',
    september: 'Settembre',
    october: 'Ottobre',
    november: 'Novembre',
    december: 'Dicembre'
  },

  // Profile Menu
  profile: {
    profileDetails: 'Dettagli Profilo',
    myTasks: 'Le Mie Attività',
    logout: 'Esci'
  },

  // Profile Details Modal
  profileDetails: {
    title: 'Dettagli Profilo',
    email: 'Email',
    department: 'Dipartimento',
    location: 'Sede',
    phone: 'Telefono',
    joinDate: 'Data di Assunzione',
    employeeId: 'ID Dipendente',
    close: 'Chiudi'
  },

  // Tasks Modal
  tasks: {
    title: 'Le Mie Attività',
    taskTitle: 'Titolo Attività',
    taskTitlePlaceholder: 'Inserisci titolo attività...',
    priority: 'Priorità',
    dueDate: 'Scadenza',
    addTask: 'Aggiungi Attività',
    noTasks: 'Nessuna attività. Aggiungi la prima qui sopra!'
  },

  // Language
  language: {
    english: 'Inglese',
    japanese: 'Giapponese',
    italian: 'Italiano',
    selectLanguage: 'Seleziona Lingua'
  },

  // Theme
  theme: {
    switchToDark: 'Passa al tema scuro',
    switchToLight: 'Passa al tema chiaro'
  },

  // Common
  common: {
    loading: 'Caricamento...',
    error: 'Errore',
    noData: 'Nessun dato disponibile',
    viewDetails: 'Visualizza Dettagli',
    close: 'Chiudi',
    save: 'Salva',
    cancel: 'Annulla',
    search: 'Cerca',
    filter: 'Filtra',
    export: 'Esporta',
    items: 'articoli'
  }
}
