// script.js — EBITAPP
(function(){
  'use strict';

  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  const fields = {
    ricavi:            $('#ricavi'),
    cogs:              $('#cogs'),
    sga:               $('#sga'),
    ammortamenti:      $('#ammortamenti'),
    altriProventiOp:   $('#altriProventiOp'),
    altriCostiOp:      $('#altriCostiOp'),
    oneriFin:          $('#oneriFin'),
    imposte:           $('#imposte'),
    note:              $('#note'),
    valuta:            $('#valuta'),
    decimali:          $('#decimali')
  };

  const outputs = {
    ebitda: $('#ebitda'), ebitdaPct: $('#ebitdaPct'),
    ebit:   $('#ebit'),   ebitPct:   $('#ebitPct'),
    utile:  $('#utile'),  utilePct:  $('#utilePct'),
    barEbitda: $('#barEbitda'),
    barEbit:   $('#barEbit'),
    barUtile:  $('#barUtile')
  };

  const scenarioSel   = $('#scenarioSel');
  const newBtn        = $('#newBtn');
  const saveBtn       = $('#saveBtn');
  const dupBtn        = $('#dupBtn');
  const delBtn        = $('#delBtn');
  const exportBtn     = $('#exportBtn');
  const importBtn     = $('#importBtn');
  const importFile    = $('#importFile');
  const resetBtn      = $('#resetBtn');
  const checkBtn      = $('#checkBtn');

  const currencyDefault = '€';
  const stateKey = 'ebitapp_scenarios_v1';
  const prefsKey = 'ebitapp_prefs_v1';

  function getNumber(el){
    const v = parseFloat((el.value || '').replace(',', '.'));
    return isFinite(v) ? v : 0;
  }

  function formatCurrency(v){
    const d = parseInt(fields.decimali.value || '0', 10);
    const cur = fields.valuta.value || currencyDefault;
    const f = v.toLocaleString(undefined, {minimumFractionDigits: d, maximumFractionDigits: d});
    return `${cur} ${f}`;
  }

  function pct(part, total){
    if (total === 0) return 0;
    return (part / total) * 100;
  }

  function compute(){
    const ricavi = getNumber(fields.ricavi);
    const cogs   = getNumber(fields.cogs);
    const sga    = getNumber(fields.sga);
    const amm    = getNumber(fields.ammortamenti);
    const apo    = getNumber(fields.altriProventiOp);
    const aco    = getNumber(fields.altriCostiOp);
    const onfin  = getNumber(fields.oneriFin);
    const tax    = getNumber(fields.imposte);

    const ebitda = (ricavi + apo) - (cogs + sga + aco);
    const ebit   = ebitda - amm;
    const utile  = ebit - onfin - tax; // oneriFin positivi = costo; se vuoi netti, inserisci negativo per proventi

    const ebitdaPct = pct(ebitda, ricavi);
    const ebitPct   = pct(ebit, ricavi);
    const utilePct  = pct(utile, ricavi);

    outputs.ebitda.textContent = formatCurrency(ebitda);
    outputs.ebit.textContent   = formatCurrency(ebit);
    outputs.utile.textContent  = formatCurrency(utile);

    outputs.ebitdaPct.textContent = (isFinite(ebitdaPct)? ebitdaPct.toFixed(1): '0.0') + '%';
    outputs.ebitPct.textContent   = (isFinite(ebitPct)? ebitPct.toFixed(1): '0.0') + '%';
    outputs.utilePct.textContent  = (isFinite(utilePct)? utilePct.toFixed(1): '0.0') + '%';

    outputs.barEbitda.style.width = Math.max(0, Math.min(100, ebitdaPct)) + '%';
    outputs.barEbit.style.width   = Math.max(0, Math.min(100, ebitPct)) + '%';
    outputs.barUtile.style.width  = Math.max(0, Math.min(100, utilePct)) + '%';
  }

  // Load & Save
  function loadScenarios(){
    const raw = localStorage.getItem(stateKey);
    const scenarios = raw ? JSON.parse(raw) : {};
    return scenarios;
  }
  function saveScenarios(obj){
    localStorage.setItem(stateKey, JSON.stringify(obj));
  }

  function fillScenarioList(selectId){
    const scenarios = loadScenarios();
    const names = Object.keys(scenarios);
    scenarioSel.innerHTML = '';
    names.forEach(n => {
      const opt = document.createElement('option');
      opt.value = n; opt.textContent = n;
      scenarioSel.appendChild(opt);
    });
    if (selectId && scenarios[selectId]) scenarioSel.value = selectId;
  }

  function collectForm(){
    return {
      ricavi: fields.ricavi.value,
      cogs: fields.cogs.value,
      sga: fields.sga.value,
      ammortamenti: fields.ammortamenti.value,
      altriProventiOp: fields.altriProventiOp.value,
      altriCostiOp: fields.altriCostiOp.value,
      oneriFin: fields.oneriFin.value,
      imposte: fields.imposte.value,
      note: fields.note.value
    };
  }
  function applyForm(data){
    fields.ricavi.value = data.ricavi || '';
    fields.cogs.value = data.cogs || '';
    fields.sga.value = data.sga || '';
    fields.ammortamenti.value = data.ammortamenti || '';
    fields.altriProventiOp.value = data.altriProventiOp || '';
    fields.altriCostiOp.value = data.altriCostiOp || '';
    fields.oneriFin.value = data.oneriFin || '';
    fields.imposte.value = data.imposte || '';
    fields.note.value = data.note || '';
    compute();
  }

  function toast(msg){
    const t = $('#toast'); t.textContent = msg; t.style.display='block';
    setTimeout(()=> t.style.display='none', 1800);
  }

  function newScenario(){
    applyForm({});
    $('#scenarioName').value = '';
    toast('Nuovo scenario');
  }

  function saveScenario(asCopy=false){
    let name = $('#scenarioName').value.trim();
    if (!name){
      name = prompt('Nome scenario? es. "Budget 2025"');
      if (!name) return;
      $('#scenarioName').value = name;
    } else if (asCopy){
      name = name + ' (copia)';
    }
    const scenarios = loadScenarios();
    scenarios[name] = collectForm();
    saveScenarios(scenarios);
    fillScenarioList(name);
    toast('Scenario salvato');
  }

  function deleteScenario(){
    const current = scenarioSel.value;
    if (!current) return;
    if (!confirm(`Eliminare lo scenario "${current}"?`)) return;
    const scenarios = loadScenarios();
    delete scenarios[current];
    saveScenarios(scenarios);
    fillScenarioList();
    applyForm({});
    $('#scenarioName').value = '';
    toast('Scenario eliminato');
  }

  function selectScenario(){
    const name = scenarioSel.value;
    const scenarios = loadScenarios();
    if (name && scenarios[name]){
      $('#scenarioName').value = name;
      applyForm(scenarios[name]);
      toast('Scenario caricato');
    }
  }

  function exportScenario(){
    const data = {
      meta: { app: 'EBITAPP', v: 1 },
      name: $('#scenarioName').value.trim() || 'scenario',
      scenario: collectForm()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${data.name}.ebitapp.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(()=> URL.revokeObjectURL(a.href), 1000);
    a.remove();
  }

  function importScenario(file){
    const reader = new FileReader();
    reader.onload = (e)=>{
      try{
        const data = JSON.parse(e.target.result);
        if (!data || !data.scenario) throw new Error('Formato non valido');
        applyForm(data.scenario);
        $('#scenarioName').value = data.name || 'importato';
        toast('Scenario importato');
      }catch(err){
        alert('Import fallito: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function resetAll(){
    if (!confirm('Ripristinare i campi ai valori di esempio?')) return;
    applyForm(exampleData());
    $('#scenarioName').value = 'Esempio';
  }

  function checkLogic(){
    // Quick consistency: ricavi should be >= 0, costs typically >=0
    const ricavi = getNumber(fields.ricavi);
    if (ricavi <= 0){
      alert('Attenzione: inserisci Ricavi > 0 per calcolare le percentuali.');
      return;
    }
    alert('Controllo rapido ok: dati coerenti per il calcolo.');
  }

  function exampleData(){
    return {
      ricavi: '1000000',
      cogs: '600000',
      sga: '200000',
      ammortamenti: '50000',
      altriProventiOp: '0',
      altriCostiOp: '0',
      oneriFin: '30000',
      imposte: '24000',
      note: 'Esempio base tratto dalla conversazione: EBITDA 200k, EBIT 150k, utile 96k.'
    };
  }

  function loadPrefs(){
    const raw = localStorage.getItem(prefsKey);
    const p = raw ? JSON.parse(raw) : {valuta:'€', decimali:0};
    fields.valuta.value = p.valuta || '€';
    fields.decimali.value = p.decimali ?? 0;
  }
  function savePrefs(){
    const p = { valuta: fields.valuta.value || '€', decimali: parseInt(fields.decimali.value || '0',10)};
    localStorage.setItem(prefsKey, JSON.stringify(p));
  }

  // Register SW
  if ('serviceWorker' in navigator){
    window.addEventListener('load', ()=> {
      navigator.serviceWorker.register('./sw.js');
    });
  }

  // Events
  ['input','change'].forEach(ev => {
    $$('.calc').forEach(el => el.addEventListener(ev, compute));
    [fields.valuta, fields.decimali].forEach(el => el.addEventListener(ev, ()=>{ savePrefs(); compute(); }));
  });
  newBtn.addEventListener('click', newScenario);
  saveBtn.addEventListener('click', ()=> saveScenario(false));
  dupBtn.addEventListener('click', ()=> saveScenario(true));
  delBtn.addEventListener('click', deleteScenario);
  exportBtn.addEventListener('click', exportScenario);
  importBtn.addEventListener('click', ()=> importFile.click());
  importFile.addEventListener('change', (e)=> {
    if (e.target.files && e.target.files[0]) importScenario(e.target.files[0]);
    e.target.value = '';
  });
  resetBtn.addEventListener('click', resetAll);
  checkBtn.addEventListener('click', checkLogic);
  scenarioSel.addEventListener('change', selectScenario);

  // Init
  loadPrefs();
  applyForm(exampleData());
  fillScenarioList();
  compute();
})();