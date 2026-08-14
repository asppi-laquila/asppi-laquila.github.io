// ============================================================
// ASPPI L'Aquila — Template Attestazione di Rispondenza
// Ex D.M. 16/01/2017 (All. 7)
// Accordo Territoriale L'Aquila depositato 26/09/2025
// Riscritto per rispettare esattamente il modulo originale
// ============================================================

var CSS_ATTESTAZIONE = `
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:Arial,Helvetica,sans-serif;font-size:9pt;color:#000;background:#fff;line-height:1.35;}
@page{size:A4;margin:1.2cm 1.8cm 1.2cm 1.8cm;}
@media print{.no-print{display:none!important;}}
@media screen{body{background:#888;}.page{width:210mm;min-height:297mm;margin:24px auto;padding:1.2cm 1.8cm;background:#fff;box-shadow:0 4px 32px rgba(0,0,0,.35);}}

h1{font-size:10.5pt;font-weight:bold;text-align:center;margin-bottom:8pt;}
h2{font-size:9pt;font-weight:bold;text-align:center;margin:6pt 0 3pt;text-transform:uppercase;}
p{font-size:8.5pt;margin-bottom:3pt;text-align:justify;}

.blank{display:inline-block;border-bottom:1px solid #000;min-width:50px;vertical-align:bottom;}

table{width:100%;border-collapse:collapse;margin-bottom:4pt;font-size:8pt;}
table.bordi td,table.bordi th{border:1px solid #000;padding:2pt 4pt;}
table.bordi th{font-weight:bold;text-align:center;font-size:8pt;}
td{vertical-align:middle;}

.center{text-align:center;}
.bold{font-weight:bold;}

.print-btn{
  position:fixed;bottom:24px;right:24px;
  background:#E8631A;color:#fff;border:none;border-radius:50px;
  padding:14px 24px;font-size:14px;font-weight:700;cursor:pointer;
  font-family:sans-serif;box-shadow:0 4px 20px rgba(232,99,26,.4);z-index:1000;
}

.check-box{
  display:inline-block;width:10px;height:10px;
  border:1px solid #000;margin-right:2px;
  vertical-align:middle;text-align:center;font-size:7pt;line-height:10px;
}
`;

// ── HELPER ──
function av(val, larghezza) {
  if (val !== null && val !== undefined && String(val).trim() !== '') return String(val).trim();
  return '<span class="blank" style="min-width:'+(larghezza||60)+'px">&nbsp;</span>';
}

function chk(checked) {
  return '<span class="check-box">'+(checked ? '&#10003;' : '&nbsp;')+'</span>';
}

function fmtDataAtt(d) {
  if (!d) return '';
  var s = String(d).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
  var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[3]+'/'+m[2]+'/'+m[1];
  return s;
}

// Elementi ufficiali Allegato 3
var ELEM_A_LABELS = [
  'Autorimessa singola o posto auto',
  'Doppio vetro',
  'Terrazza o balcone',
  'Appartamento sito in immobile con meno di otto unità abitative',
  'Cucina abitabile',
  'Riscaldamento autonomo o centralizzato con contabilizzatori',
  'Ascensore',
  'Doppi servizi \u2013 almeno uno con finestra',
  'Porta blindata e/o serratura di sicurezza',
  'Impianto d\u2019emergenza d\u2019illuminazione',
  'Cancello automatico',
  'Impianto di videocitofono',
  'Giardino privato o spazio esclusivo',
  'Dotazione di lavatrice',
  'Dotazione di lavastoviglie',
  'Prossimit\u00e0 dell\u2019abitazione all\u2019insieme dei servizi: autobus, negozi, servizi sociali, ecc.',
  'Cantina e/o soffitta',
  'Costruzione o completa ristrutturazione negli ultimi 15 anni',
  'Predisposizione linea internet - fibra',
  'Arredamento parziale',
];

var ELEM_B_LABELS = [
  'Domotica',
  'Impianto fotovoltaico attivo',
  'Impianto solare termico attivo',
  'Collegamento attivo internet',
  'Impianto allarme',
  'Impianto condizionamento',
  'Asciugatrice o lavasciuga',
  'Vincolo diretto della Soprintendenza',
  'Accessibilit\u00e0 \u2013 abbattimento barriere architettoniche',
  'Arredamento completo',
];

var MICROZONE_NAMES = {
  1:'1 \u2013 Centro', 2:'2 \u2013 Periferia Urbana',
  3:'3 \u2013 Assergi-Camarda-Paganica', 4:'4 \u2013 Sassa-Preturo-Arischia',
  5:'5 \u2013 Collebrincioni-Camarda-Pescomaggiore',
  6:'6 \u2013 Bagno-Roio-Sassa', 7:'7 \u2013 Santi-Casaline-Menzano',
};

// ============================================================
// GENERATORE PRINCIPALE
// ============================================================
function generaAttestazione(dati) {
  var apt    = dati.appartamento  || {};
  var cnt    = dati.contratto     || {};
  var calc   = dati.calcolo       || {};
  var locs   = dati.locatori      || [];
  var cons   = dati.conduttori    || [];
  var elemA  = dati.elementiA     || [];
  var elemB  = dati.elementiB     || [];

  // ── Locatore principale ──
  var loc0    = locs[0] || {};
  var locNome = ((loc0.cognome||'')+' '+(loc0.nome||'')).trim();
  var locCF   = loc0.cf || '';
  var locRes  = loc0.comuneResidenza || '';
  var locVia  = loc0.viaResidenza || '';

  // ── Conduttore principale ──
  var con0    = cons[0] || {};
  var conNome = ((con0.cognome||'')+' '+(con0.nome||'')).trim();
  var conCF   = con0.cf || '';
  var conRes  = con0.comuneResidenza || '';
  var conVia  = con0.viaResidenza || '';

  // ── Dati immobile ──
  var comune  = apt.comune   || '';
  var via     = apt.via      || '';
  var nCiv    = apt.nCivico  || '';
  var piano   = apt.piano    || '';
  var interno = apt.interno  || '';

  // ── Dati contratto ──
  var tipoA    = cnt.tipo === 'Tipo A';
  var tipoB    = cnt.tipo === 'Tipo B';
  var tipoC    = cnt.tipo === 'Tipo C';
  var duraDal  = fmtDataAtt(cnt.duraDal) || '';
  var duraAl   = fmtDataAtt(cnt.duraAl)  || '';
  var duraMesi = cnt.duraMesi || '';
  var canoneMens = cnt.canoneMensile  || '';
  var canoneAnn  = cnt.canoneAnnuale  || (parseFloat(cnt.canoneMensile||0)*parseInt(cnt.duraMesi||0)||'');
  var isPorzione = cnt.tipoLocazione === 'porzione';
  var mqPorz   = parseFloat(cnt.mqPorzioneLocata || 0) || 0;

  // ── Dati calcolo ──
  var microzona    = calc.microzona || apt.microzona || '';
  var mzLabel      = MICROZONE_NAMES[parseInt(microzona)] || ('Microzona '+microzona);
  var nElemA       = calc.nElemA || elemA.length || 0;
  var nElemB       = calc.nElemB || elemB.length || 0;
  var fascia       = calc.fascia || 0;
  var f1min        = calc.fascia1min || 0;
  var f1max        = calc.fascia1max || 0;
  var f2min        = calc.fascia2min || 0;
  var f2max        = calc.fascia2max || 0;
  var fasciMin     = fascia == 2 ? f2min : f1min;
  var fasciMax     = fascia == 2 ? f2max : f1max;
  var valoreMqFin  = calc.valoreMqFinale  ? parseFloat(calc.valoreMqFinale).toFixed(2)  : '';
  var supConvTot   = calc.supConvTotale   ? parseFloat(calc.supConvTotale).toFixed(2)   : '';
  var supConvImm   = calc.supConvImmobile ? parseFloat(calc.supConvImmobile).toFixed(2) : '';
  var supConvPert  = calc.supConvPertinenze ? parseFloat(calc.supConvPertinenze).toFixed(2) : '';
  var supUtile     = calc.supUtileNetta   ? parseFloat(calc.supUtileNetta).toFixed(2)   : (apt.superficieResidenziale ? parseFloat(apt.superficieResidenziale).toFixed(2) : '');
  var massAnn      = calc.massimaleAnnuo  ? parseFloat(calc.massimaleAnnuo).toFixed(2)  : '';
  var magg         = parseFloat(calc.maggiorazione || 0);
  var maggPct      = magg ? Math.round(magg*100) : 0;
  var rid          = parseFloat(calc.riduzione || 0);
  var ridPct       = rid ? Math.round(rid*100) : 0;
  var isSemint     = apt.flagSeminterrato === true || String(apt.flagSeminterrato).toLowerCase() === 'true';
  var apeClasse    = apt.apeClasse || cnt.apeClasse || '';

  // ── Superfici immobile ──
  var supNetta     = parseFloat(apt.superficieResidenziale || 0);
  var supBassa     = parseFloat(apt.superficieAltezzaBassa || 0);
  var supNormale   = supNetta - supBassa;
  var supBalc      = parseFloat(apt.supBalconi || 0);
  var supCant      = parseFloat(apt.supCantine || 0);
  var supGar       = parseFloat(apt.supGarage  || 0);
  var supPosto     = parseFloat(apt.supPostoAuto || 0);
  var supVerde     = parseFloat(apt.supAreaVerde || 0);
  var mzNum        = parseInt(microzona || 0);
  var coeffGar     = (mzNum === 1) ? 1.00 : 0.50;

  // ── Calcolo massimale porzione ──
  var massAnnPorz = (isPorzione && mqPorz > 0 && calc.valoreMqFinale)
    ? (parseFloat(calc.valoreMqFinale) * mqPorz).toFixed(2) : '';

  // ── Maggiorazioni ──
  var maggEnPct = (calc.tipoMaggiorazione==='energetica' && magg>0) ? maggPct : '';
  var maggElPct = (calc.tipoMaggiorazione==='elementi'   && magg>0) ? maggPct : '';
  var maggEnVal = (calc.tipoMaggiorazione==='energetica' && massAnn) ? massAnn : '';
  var maggElVal = (calc.tipoMaggiorazione==='elementi'   && massAnn) ? massAnn : '';
  var maggEnValPorz = (calc.tipoMaggiorazione==='energetica' && massAnnPorz) ? massAnnPorz : '';
  var maggElValPorz = (calc.tipoMaggiorazione==='elementi'   && massAnnPorz) ? massAnnPorz : '';
  var semintPorz = (isSemint && massAnnPorz) ? (parseFloat(massAnnPorz)*(1-rid)).toFixed(2) : '';

  // ── Superficie locata per riepilogo ──
  var supLocataRiepilogo = isPorzione && mqPorz > 0 ? mqPorz.toFixed(2) : supConvTot;

  // ── Valore €/mq nel riepilogo = massimale applicabile (non canone pattuito) ──
  var valoreMqRiepilogo = valoreMqFin;

  // ============================================================
  // BUILD HTML
  // ============================================================
  var html = '<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"/>';
  html += '<title>Attestazione di Rispondenza</title>';
  html += '<style>'+CSS_ATTESTAZIONE+'</style></head><body>';
  html += '<button class="print-btn no-print" onclick="window.print()">\uD83D\uDDA8\uFE0F Stampa / Salva PDF</button>';
  html += '<div class="page">';

  // ══════════════════════════════════════════
  // INTESTAZIONE
  // ══════════════════════════════════════════
  html += '<h1>ATTESTAZIONE DI RISPONDENZA EX D.M. 16/01/2017&nbsp;&nbsp;&nbsp;(All. 7)</h1>';

  html += '<p>Il/la sottoscritto/a Sig./Sig.ra <b>'+av(locNome,140)+'</b> , C.F. <b>'+av(locCF,120)+'</b>,</p>';
  html += '<p>residente a <b>'+av(locRes,80)+'</b> cap '+av('',35)+' (Prov.'+av('',18)+') in Via <b>'+av(locVia,120)+'</b>, nella sua</p>';
  html += '<p>qualit\u00e0 di locatore dell\'immobile / porzione di immobile sito a <b>'+av(comune,80)+'</b>, in Via <b>'+av(via,100)+'</b>, n.</p>';
  html += '<p><b>'+av(nCiv,25)+'</b>, piano <b>'+av(piano,30)+'</b>, int. <b>'+av(interno,30)+'</b>, ha stipulato in data '+av('',70)+' un contratto di locazione ad uso abitativo per la</p>';
  html += '<p>propria unit\u00e0 immobiliare, di seguito identificata, con il/la Sig./Sig.ra <b>'+av(conNome,140)+'</b>,</p>';
  html += '<p>C.F. <b>'+av(conCF,120)+'</b>, residente in <b>'+av(conRes,80)+'</b>, Via <b>'+av(conVia,120)+'</b>, per <u>mesi / anni</u></p>';
  html += '<p><b>'+av(duraMesi,20)+'</b> con decorrenza dal <b>'+av(duraDal,60)+'</b> al <b>'+av(duraAl,60)+'</b> e registrato il '+av('',50)+' al n. '+av('',50)+' \u2013 serie '+av('',20)+' e</p>';
  html += '<p>codice identificativo '+av('',120)+' / in corso di registrazione, essendo i termini non ancora scaduti,</p>';

  html += '<p style="text-align:center;font-weight:bold;margin:6pt 0">chiede</p>';

  html += '<p>il rilascio dell\'attestazione ex D.M. 16-1-2017 di rispondenza dei contenuti economici e normativi del contratto</p>';
  html += '<p>allegato all\'Accordo locale per il Comune di L\'Aquila, depositato in data &nbsp;26-09-2025.</p>';
  html += '<p style="margin-top:5pt">A tal fine, consapevole delle sanzioni penali previste dall\'art. 76 del D.P.R. n. 445/2000 per le dichiarazioni mendaci e l\'uso di atti falsi, attesta ai sensi degli artt. 21 comma 2 e 47 dello stesso D.P.R. 445/2000, che il contratto di locazione \u00e8 stato stipulato utilizzando il tipo di contratto allegato al D.M. 16.1.2017 e, sempre relativamente al contratto, dichiara i seguenti dati ed elementi:</p>';

  // ══════════════════════════════════════════
  // TIPO CONTRATTO
  // ══════════════════════════════════════════
  html += '<table class="bordi" style="margin-top:6pt"><tr>'
    +'<td class="center bold" style="width:33%">TIPO DI CONTRATTO</td>'
    +'<td class="center" style="width:22%">'+chk(tipoA)+' +2 (A)</td>'
    +'<td class="center" style="width:22%">'+chk(tipoB)+' Transitorio (B)</td>'
    +'<td class="center" style="width:23%">'+chk(tipoC)+' Studenti (C)</td>'
    +'</tr></table>';

  // ══════════════════════════════════════════
  // DATI CATASTALI — sempre 3 righe
  // ══════════════════════════════════════════
  html += '<h2>DATI CATASTALI IMMOBILI LOCATI</h2>';
  html += '<table class="bordi"><tr>'
    +'<th style="width:14%">Microzona</th>'
    +'<th style="width:12%">Foglio</th>'
    +'<th style="width:16%">Particella</th>'
    +'<th style="width:10%">Sub.</th>'
    +'<th style="width:32%">Rendita catastale</th>'
    +'<th style="width:16%">Cat.</th>'
    +'</tr>';
  // Riga 1 — dati reali
  html += '<tr>'
    +'<td class="center">'+av(mzLabel,50)+'</td>'
    +'<td class="center">'+av(apt.catFoglio,40)+'</td>'
    +'<td class="center">'+av(apt.catParticella,40)+'</td>'
    +'<td class="center">'+av(apt.catSubalterno,30)+'</td>'
    +'<td class="center">\u20ac '+av(apt.catRendita,60)+'</td>'
    +'<td class="center">'+av(apt.catCategoria,30)+'</td>'
    +'</tr>';
  // Righe 2 e 3 — vuote
  html += '<tr><td class="center" style="height:18px">'+av('',50)+'</td><td class="center">'+av('',40)+'</td><td class="center">'+av('',40)+'</td><td class="center">'+av('',30)+'</td><td class="center">'+av('',60)+'</td><td class="center">'+av('',30)+'</td></tr>';
  html += '<tr><td class="center" style="height:18px">'+av('',50)+'</td><td class="center">'+av('',40)+'</td><td class="center">'+av('',40)+'</td><td class="center">'+av('',30)+'</td><td class="center">'+av('',60)+'</td><td class="center">'+av('',30)+'</td></tr>';
  html += '</table>';

  // ══════════════════════════════════════════
  // CALCOLO SUPERFICIE CONVENZIONALE
  // Tutte le righe sempre presenti — si compila solo quella usata
  // ══════════════════════════════════════════
  html += '<h2>CALCOLO SUPERFICIE CONVENZIONALE</h2>';
  html += '<table class="bordi"><tr>'
    +'<th style="width:45%">Superficie</th>'
    +'<th style="width:20%">Superficie utile</th>'
    +'<th style="width:18%">Indici di moltiplicazione</th>'
    +'<th style="width:17%">Superficie convenzionale</th>'
    +'</tr>';

  // Riga fino a 45 mq
  var usa45   = supNetta > 0 && supNetta <= 45;
  var supConv45 = usa45 ? (Math.min(supNormale*1.30 + supBassa*0.70, 45)).toFixed(2) : '';
  html += '<tr>'
    +'<td>Unit\u00e0 immobiliare fino a 45 mq</td>'
    +'<td class="center">'+av(usa45 ? supNetta.toFixed(2) : '',50)+'</td>'
    +'<td class="center">x 1,30</td>'
    +'<td class="center">'+av(supConv45,50)+'</td>'
    +'</tr>';

  // Riga da 45 a 70 mq
  var usa4570  = supNetta > 45 && supNetta <= 70;
  var supConv4570 = usa4570 ? (Math.min(supNormale*1.10 + supBassa*0.70, 70)).toFixed(2) : '';
  html += '<tr>'
    +'<td>Unit\u00e0 immobiliare da 45 a 70 mq</td>'
    +'<td class="center">'+av(usa4570 ? supNetta.toFixed(2) : '',50)+'</td>'
    +'<td class="center">x 1,10</td>'
    +'<td class="center">'+av(supConv4570,50)+'</td>'
    +'</tr>';

  // Riga da 70 a 120 mq
  var usa70120 = supNetta > 70 && supNetta <= 120;
  // Per oltre 120: anche questa riga si usa per i primi 120 mq
  var usa70120anche = supNetta > 120;
  var sup70120val = usa70120 ? supNetta.toFixed(2) : (usa70120anche ? '120,00' : '');
  var supConv70120 = usa70120 ? (supNormale*1.00 + supBassa*0.70).toFixed(2)
    : usa70120anche ? (120*1.00).toFixed(2) : '';
  html += '<tr>'
    +'<td>Unit\u00e0 immobiliare da 70 a 120 mq</td>'
    +'<td class="center">'+av(sup70120val,50)+'</td>'
    +'<td class="center">x 1</td>'
    +'<td class="center">'+av(supConv70120,50)+'</td>'
    +'</tr>';

  // Riga oltre 120 mq
  var usa120 = supNetta > 120;
  var eccNorm = usa120 ? Math.max(0, supNormale - 120) : 0;
  var eccBass = usa120 ? Math.max(0, supBassa - 120) : 0;
  var supConv120 = usa120 ? (eccNorm*0.90 + eccBass*0.70).toFixed(2) : '';
  var supEcc120  = usa120 ? (supNetta - 120).toFixed(2) : '';
  html += '<tr>'
    +'<td>Superficie superiore a 120 mq</td>'
    +'<td class="center">'+av(supEcc120,50)+'</td>'
    +'<td class="center">x 0,90</td>'
    +'<td class="center">'+av(supConv120,50)+'</td>'
    +'</tr>';

  // Riga altezza bassa
  var supConvBassa = supBassa > 0 ? (supBassa*0.70).toFixed(2) : '';
  html += '<tr>'
    +'<td>Superficie con altezza inferiore a 1,70 metri</td>'
    +'<td class="center">'+av(supBassa>0?supBassa.toFixed(2):'',50)+'</td>'
    +'<td class="center">x 0,70</td>'
    +'<td class="center">'+av(supConvBassa,50)+'</td>'
    +'</tr>';

  html += '<tr><td class="bold" colspan="3">A) TOTALE SUPERIFICIE CONVENZIONALE IMMOBILE</td>'
    +'<td class="center bold">'+av(supConvImm,50)+' MQ</td></tr>';

  // ── PERTINENZE ──
  html += '<tr><td colspan="4" class="bold" style="background:#f0f0f0;text-align:center">PERTINENZE</td></tr>';

  // Balconi, terrazze, cantine
  var totBalcCant = supBalc + supCant;
  var convBalcCant = totBalcCant > 0
    ? (totBalcCant <= 30 ? (totBalcCant*0.25).toFixed(2) : (30*0.25+(totBalcCant-30)*0.10).toFixed(2))
    : '';
  html += '<tr>'
    +'<td>Balconi, terrazze e cantine e simili</td>'
    +'<td class="center">'+av(totBalcCant>0?totBalcCant.toFixed(2):'',50)+'</td>'
    +'<td class="center">x 0,25 - x 0,10</td>'
    +'<td class="center">'+av(convBalcCant,50)+'</td>'
    +'</tr>';

  // Garage
  var labelGar = mzNum===1 ? 'x 0,50 \u2013 x 1 (mz 1: x 1)' : 'x 0,50 \u2013 x 1';
  var convGar  = supGar > 0 ? (supGar*coeffGar).toFixed(2) : '';
  html += '<tr>'
    +'<td>Garage</td>'
    +'<td class="center">'+av(supGar>0?supGar.toFixed(2):'',50)+'</td>'
    +'<td class="center">'+labelGar+'</td>'
    +'<td class="center">'+av(convGar,50)+'</td>'
    +'</tr>';

  // Posto auto
  var convPosto = supPosto > 0 ? (supPosto*0.20).toFixed(2) : '';
  html += '<tr>'
    +'<td>Posto auto</td>'
    +'<td class="center">'+av(supPosto>0?supPosto.toFixed(2):'',50)+'</td>'
    +'<td class="center">x 0,20</td>'
    +'<td class="center">'+av(convPosto,50)+'</td>'
    +'</tr>';

  // Area verde
  var convVerde = supVerde > 0
    ? (supVerde <= 300 ? (supVerde*0.05).toFixed(2) : (300*0.05+(supVerde-300)*0.02).toFixed(2))
    : '';
  html += '<tr>'
    +'<td>Area verde esclusiva</td>'
    +'<td class="center">'+av(supVerde>0?supVerde.toFixed(2):'',50)+'</td>'
    +'<td class="center">x 0,05 \u2013 x 0,02</td>'
    +'<td class="center">'+av(convVerde,50)+'</td>'
    +'</tr>';

  html += '<tr><td class="bold" colspan="3">B) TOTALE SUPERFICIE CONVENZIONALE PERTINENZE</td>'
    +'<td class="center bold">'+av(supConvPert,50)+' MQ</td></tr>';
  html += '<tr><td class="bold" colspan="3">TOTALE SUPERFICIE CONVENZIONALE (A+B)</td>'
    +'<td class="center bold">'+av(supConvTot,50)+' MQ</td></tr>';

  html += '</table>';

  // ══════════════════════════════════════════
  // LOCAZIONE INTERO / PARZIALE / SUPERFICIE LOCATA MQ
  // ══════════════════════════════════════════
  html += '<table class="bordi"><tr>'
    +'<td class="center" style="width:30%">'+chk(!isPorzione)+' LOCAZIONE INTERO</td>'
    +'<td class="center" style="width:30%">'+chk(isPorzione)+' LOCAZIONE PARZIALE</td>'
    +'<td class="center" style="width:25%">SUPERFICIE LOCATA</td>'
    +'<td class="center bold" style="width:15%">'+av(isPorzione&&mqPorz>0?mqPorz.toFixed(2):'',40)+' MQ</td>'
    +'</tr></table>';

  // ══════════════════════════════════════════
  // ELEMENTI TIPO A — layout 2 colonne come originale
  // ══════════════════════════════════════════
  html += '<h2>ELEMENTI TITPO A</h2>';
  html += '<table style="width:100%;border-collapse:collapse;margin-bottom:3pt"><tr>';
  html += '<td style="width:50%;vertical-align:top"><table style="width:100%;border-collapse:collapse">';
  for (var i=0; i<10; i++) {
    var n = i+1;
    var chkA = elemA.indexOf(n) > -1;
    html += '<tr>'
      +'<td style="border:1px solid #000;width:22px;text-align:center;padding:1pt;font-size:7.5pt">'+n+'</td>'
      +'<td style="border:1px solid #ccc;width:16px;text-align:center">'+chk(chkA)+'</td>'
      +'<td style="border:1px solid #ccc;padding:1pt 3pt;font-size:7.5pt">'+ELEM_A_LABELS[i]+'</td>'
      +'</tr>';
  }
  html += '</table></td>';
  html += '<td style="width:50%;vertical-align:top"><table style="width:100%;border-collapse:collapse">';
  for (var j=10; j<ELEM_A_LABELS.length; j++) {
    var nj = j+1;
    var chkAj = elemA.indexOf(nj) > -1;
    html += '<tr>'
      +'<td style="border:1px solid #000;width:22px;text-align:center;padding:1pt;font-size:7.5pt">'+nj+'</td>'
      +'<td style="border:1px solid #ccc;width:16px;text-align:center">'+chk(chkAj)+'</td>'
      +'<td style="border:1px solid #ccc;padding:1pt 3pt;font-size:7.5pt">'+ELEM_A_LABELS[j]+'</td>'
      +'</tr>';
  }
  html += '</table></td></tr></table>';

  // ══════════════════════════════════════════
  // ELEMENTI TIPO B — layout 2 colonne come originale
  // ══════════════════════════════════════════
  html += '<h2>ELEMENTI TIPO B</h2>';
  html += '<table style="width:100%;border-collapse:collapse;margin-bottom:3pt"><tr>';
  html += '<td style="width:50%;vertical-align:top"><table style="width:100%;border-collapse:collapse">';
  for (var k=0; k<5; k++) {
    var nk = k+1;
    var chkBk = elemB.indexOf(nk) > -1;
    html += '<tr>'
      +'<td style="border:1px solid #000;width:22px;text-align:center;padding:1pt;font-size:7.5pt">'+nk+'</td>'
      +'<td style="border:1px solid #ccc;width:16px;text-align:center">'+chk(chkBk)+'</td>'
      +'<td style="border:1px solid #ccc;padding:1pt 3pt;font-size:7.5pt">'+ELEM_B_LABELS[k]+'</td>'
      +'</tr>';
  }
  html += '</table></td>';
  html += '<td style="width:50%;vertical-align:top"><table style="width:100%;border-collapse:collapse">';
  for (var m=5; m<ELEM_B_LABELS.length; m++) {
    var nm = m+1;
    var chkBm = elemB.indexOf(nm) > -1;
    html += '<tr>'
      +'<td style="border:1px solid #000;width:22px;text-align:center;padding:1pt;font-size:7.5pt">'+nm+'</td>'
      +'<td style="border:1px solid #ccc;width:16px;text-align:center">'+chk(chkBm)+'</td>'
      +'<td style="border:1px solid #ccc;padding:1pt 3pt;font-size:7.5pt">'+ELEM_B_LABELS[m]+'</td>'
      +'</tr>';
  }
  html += '</table></td></tr></table>';

  // ══════════════════════════════════════════
  // RIEPILOGO MICROZONA / FASCIA / VALORI
  // ══════════════════════════════════════════
  html += '<table class="bordi" style="margin-top:3pt"><tr>'
    +'<th style="width:20%">N. Microzona</th>'
    +'<th style="width:25%">N. Elementi</th>'
    +'<th style="width:20%">Fascia valore</th>'
    +'<th style="width:35%">Valori fascia di riferimento min/max</th>'
    +'</tr><tr>'
    +'<td class="center">'+av(mzLabel,60)+'</td>'
    +'<td class="center">A <b>'+nElemA+'</b> &nbsp;&nbsp; B <b>'+nElemB+'</b></td>'
    +'<td class="center">'+chk(fascia==1)+' 1 &nbsp;&nbsp;&nbsp; '+chk(fascia==2)+' 2</td>'
    +'<td class="center">\u20ac '+av(fasciMin?parseFloat(fasciMin).toFixed(2):'',40)+' / \u20ac '+av(fasciMax?parseFloat(fasciMax).toFixed(2):'',40)+'</td>'
    +'</tr></table>';

  // ══════════════════════════════════════════
  // CALCOLO DEL CANONE
  // ══════════════════════════════════════════
  html += '<h2>CALCOLO DEL CANONE</h2>';
  html += '<p>Valore canone mq/anno applicabile \u20ac <b>'+av(valoreMqFin,60)+'</b></p>';
  html += '<p class="bold">Calcolo canone massimo annuo:</p>';

  // Riga intero immobile — sempre presente
  html += '<p style="padding-left:12pt">\u2013 Intero immobile mq <b>'+av(supConvTot,40)+'</b> X \u20ac mq/anno <b>'+av(valoreMqFin,50)+'</b> = \u20ac <b>'+av(massAnn,70)+'</b></p>';
  // Riga porzione — sempre presente, compilata se porzione
  html += '<p style="padding-left:12pt">\u2013 porzione locata mq <b>'+av(isPorzione&&mqPorz>0?mqPorz.toFixed(2):'',40)+'</b> X \u20ac mq/anno <b>'+av(isPorzione&&mqPorz>0?valoreMqFin:'',50)+'</b> = \u20ac <b>'+av(massAnnPorz,70)+'</b></p>';

  // Tabella maggiorazioni
  html += '<table style="width:100%;border-collapse:collapse;margin-top:3pt"><tr>'
    +'<th style="width:60%;text-align:left;font-size:8pt"></th>'
    +'<th style="width:20%;text-align:center;font-size:8pt">INTERO</th>'
    +'<th style="width:20%;text-align:center;font-size:8pt">PORZIONE</th>'
    +'</tr>';

  // Durata
  html += '<tr><td style="font-size:8pt">con eventuale maggiorazione per la durata (+ '+av('',15)+'%) =</td>'
    +'<td style="border-bottom:1px solid #ccc;text-align:center">\u20ac '+av('',60)+'</td>'
    +'<td style="border-bottom:1px solid #ccc;text-align:center">\u20ac '+av('',60)+'</td></tr>';

  // Classe energetica
  html += '<tr><td style="font-size:8pt">con eventuale maggiorazione classe energetica: <b>'+av(apeClasse,20)+'</b> (+ '+av(maggEnPct,15)+'%) =</td>'
    +'<td style="border-bottom:1px solid #ccc;text-align:center">\u20ac '+av(maggEnVal,60)+'</td>'
    +'<td style="border-bottom:1px solid #ccc;text-align:center">\u20ac '+av(maggEnValPorz,60)+'</td></tr>';

  // Numero elementi
  html += '<tr><td style="font-size:8pt">con eventuale maggiorazione per numero elementi <b>'+nElemA+'A+'+nElemB+'B</b> (+ '+av(maggElPct,15)+'%) =</td>'
    +'<td style="border-bottom:1px solid #ccc;text-align:center">\u20ac '+av(maggElVal,60)+'</td>'
    +'<td style="border-bottom:1px solid #ccc;text-align:center">\u20ac '+av(maggElValPorz,60)+'</td></tr>';

  // Seminterrato
  html += '<tr><td style="font-size:8pt">con riduzione per seminterrato (- '+av(isSemint?ridPct:'',15)+'%) =</td>'
    +'<td style="border-bottom:1px solid #ccc;text-align:center">\u20ac '+av(isSemint?massAnn:'',60)+'</td>'
    +'<td style="border-bottom:1px solid #ccc;text-align:center">\u20ac '+av(semintPorz,60)+'</td></tr>';

  // Complessivo
  html += '<tr><td class="bold" style="font-size:8pt">complessivo =</td>'
    +'<td style="border-bottom:2px solid #000;text-align:center"><b>\u20ac '+av(massAnn,60)+'</b></td>'
    +'<td style="border-bottom:2px solid #000;text-align:center">\u20ac '+av(massAnnPorz,60)+'</td></tr>';
  html += '</table>';

  // ══════════════════════════════════════════
  // RIEPILOGO
  // ══════════════════════════════════════════
  html += '<h2 style="margin-top:6pt">RIEPILOGO</h2>';
  html += '<table class="bordi"><tr>'
    +'<td style="width:60%"><b>CANONE PATTUITO: ANNUO \u20ac</b> <b>'+av(canoneAnn,70)+'</b></td>'
    +'<td style="width:40%"><b>/ PERIODO \u20ac</b> '+av('',70)+'</td>'
    +'</tr><tr>'
    +'<td><b>CANONE MENSILE PATTUITO \u20ac</b> <b>'+av(canoneMens,70)+'</b></td>'
    +'<td></td>'
    +'</tr><tr>'
    +'<td><b>SUPERFICIE LOCATA MQ:</b> <b>'+av(supLocataRiepilogo,50)+'</b></td>'
    +'<td></td>'
    +'</tr><tr>'
    +'<td colspan="2" class="center"><b>VALORE CANONE LOCAZIONE MQ/ANNUO \u20ac</b> <b>'+av(valoreMqRiepilogo,60)+'</b></td>'
    +'</tr></table>';

  html += '<p style="font-size:7.5pt;margin-top:4pt">I calcoli sono eseguiti su dati, valori ed elementi oggettivi dichiarati con la sottoscrizione dell\'attestazione dal locatore.</p>';

  // ══════════════════════════════════════════
  // FIRME
  // ══════════════════════════════════════════
  html += '<div style="display:flex;justify-content:flex-end;margin-top:8pt">';
  html += '<div style="text-align:center">';
  html += '<div style="font-size:8pt;font-weight:bold">Il locatore dichiarante</div>';
  html += '<div style="margin-top:24pt;border-top:1px solid #000;width:140px;margin-left:auto">&nbsp;</div>';
  html += '</div></div>';

  // ══════════════════════════════════════════
  // SEZIONE ASPPI — ATTESTA
  // ══════════════════════════════════════════
  html += '<p style="margin-top:10pt;text-align:justify;font-size:8.5pt">Sulla base di dati, valori ed elementi dichiarati, anche ai fini dell\'ottenimento di eventuali agevolazioni fiscali, l\'Organizzazione ASPPI,</p>';
  html += '<p style="text-align:center;font-weight:bold;margin:6pt 0">ATTESTA</p>';
  html += '<p style="text-align:justify;font-size:8.5pt">che i contenuti economici e normativi del contratto allegato corrispondono a quanto previsto dall\'Accordo territoriale vigente per il Comune di L\'Aquila depositato in data 26/09/2025.</p>';

  html += '<div style="display:flex;justify-content:space-between;margin-top:12pt;align-items:flex-end">';
  html += '<div><span style="font-size:8.5pt">L\'Aquila, l\u00ec </span><span class="blank" style="min-width:90px">&nbsp;</span></div>';
  html += '<div style="text-align:center">';
  html += '<div style="font-size:8.5pt;font-weight:bold">L\'Organizzazione</div>';
  html += '<div style="margin-top:24pt;border-top:1px solid #000;width:140px;margin-left:auto">&nbsp;</div>';
  html += '</div></div>';

  html += '</div>'; // chiude .page
  html += '</body></html>';
  return html;
}

// ── DISPATCHER ──
if (typeof window !== 'undefined') window.generaAttestazione = generaAttestazione;
if (typeof module !== 'undefined') module.exports = { generaAttestazione: generaAttestazione };
