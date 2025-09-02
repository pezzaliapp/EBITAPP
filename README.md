# EBITAPP — PWA per calcolare EBIT & EBITDA (in una sola cartella)

**EBITAPP** è una piccola Progressive Web App open‑source, 100% locale, che ti permette di:
- inserire i dati principali del conto economico (ricavi, COGS, SG&A, ammortamenti, altri proventi/costi),
- calcolare **EBITDA**, **EBIT** e **Utile netto**, con i rispettivi **margini %**,
- salvare più **scenari** in locale, **esportarli** e **importarli** (JSON),
- lavorare **offline** (service worker) e installarla come app.

## File principali
- `index.html` — UI + istruzioni
- `styles.css` — stile minimale, responsive
- `script.js` — logica: calcolo, scenari, export/import
- `manifest.json` — PWA
- `sw.js` — service worker per cache offline
- `icons/` — icone 192/512 + favicon

## Formulae
- **EBITDA** = Ricavi + Altri proventi operativi − COGS − SG&A − Altri costi operativi  
- **EBIT**   = EBITDA − Ammortamenti (e svalutazioni)  
- **Utile netto** = EBIT − Oneri finanziari (netti) − Imposte  
- **Margini %** = Indicatore / Ricavi

> Nota: Inserisci gli **oneri finanziari** come valore positivo se sono un costo; usa valori **negativi** se hai proventi finanziari netti.

## Privacy
Tutto resta **sul dispositivo** (localStorage). Nessun cloud, nessun tracciamento.

## Licenza
MIT — © 2025 Alessandro Pezzali / PezzaliAPP