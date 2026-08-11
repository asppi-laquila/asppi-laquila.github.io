// ============================================================
// ASPPI L'Aquila — Template Attestazione di Rispondenza
// Ex D.M. 16/01/2017 (All. 7)
// Accordo Territoriale L'Aquila depositato 26/09/2025
// ============================================================

var CSS_ATTESTAZIONE = `
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:Arial,Helvetica,sans-serif;font-size:9pt;color:#000;background:#fff;line-height:1.4;}
@page{size:A4;margin:1.5cm 2cm 1.5cm 2cm;}
@media print{.no-print{display:none!important;}}
@media screen{body{background:#888;}.page{width:210mm;min-height:297mm;margin:24px auto;padding:1.5cm 2cm;background:#fff;box-shadow:0 4px 32px rgba(0,0,0,.35);}}

h1{font-size:11pt;font-weight:bold;text-align:center;margin-bottom:14pt;}
h2{font-size:9pt;font-weight:bold;text-align:center;margin:10pt 0 6pt;}
p{font-size:9pt;margin-bottom:5pt;text-align:justify;}

.blank{display:inline-block;border-bottom:1px solid #000;min-width:60px;vertical-align:bottom;}
.blank-lg{min-width:120px;}
.blank-xl{min-width:180px;}
.blank-sm{min-width:40px;}

table{width:100%;border-collapse:collapse;margin-bottom:8pt;font-size:8.5pt;}
table.bordi td,table.bordi th{border:1px solid #000;padding:3pt 5pt;}
table.bordi th{background:#f0f0f0;font-weight:bold;text-align:center;}
td{vertical-align:top;}

.row-line{border-bottom:1px solid #000;padding:2pt 0;margin-bottom:4pt;}
.center{text-align:center;}
.bold{font-weight:bold;}
.underline{text-decoration:underline;}

.page-break{page-break-before:always;}

.print-btn{
  position:fixed;bottom:24px;right:24px;
  background:#E8631A;color:#fff;border:none;border-radius:50px;
  padding:14px 24px;font-size:14px;font-weight:700;cursor:pointer;
  font-family:sans-serif;box-shadow:0 4px 20px rgba(232,99,26,.4);z-index:1000;
}

.sez{font-size:8pt;font-weight:bold;text-align:center;margin:8pt 0 4pt;text-transform:uppercase;}

.check-box{
  display:inline-block;width:10px;height:10px;
  border:1px solid #000;margin-right:3px;
  vertical-align:middle;text-align:center;font-size:8pt;line-height:10px;
}
.check-box.on{background:#000;color:#fff;}

.firma-line{border-top:1px solid #000;width:160px;display:inline-block;margin-top:20pt;}
`;

// ── HELPER ──
function av(val, larghezza, extra) {
  if (val && String(val).trim() !== '') return String(val).trim();
  var px = (larghezza || 80) + 'px';
  var cl = extra ? ' blank-'+extra : '';
  return '<span class="blank'+cl+'" style="min-width:'+px+'">&nbsp;</span>';
}

function avb(val, larghezza) {
  if (val && String(val).trim() !== '') return '<b>'+String(val).trim()+'</b>';
  return '<span class="blank" style="min-width:'+(larghezza||80)+'px">&nbsp;</span>';
}

function chk(checked) {
  return '<span class="check-box'+(checked?' on':'')+'">'+( checked?'✓':'')+'</span>';
}

function fmtDataAtt(d) {
  if (!d) return '';
  var s = String(d).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
  var m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[3]+'/'+m[2]+'/'+m[1];
  return s;
}

// Lista elementi ufficiali dall'Allegato 3
var ELEM_A_LABELS = [
  'Autorimessa singola o posto auto',
  'Doppio vetro',
  'Terrazza o balcone',
  'Appartamento sito in immobile con meno di otto unità abitative',
  'Cucina abitabile',
  'Riscaldamento autonomo o centralizzato con contabilizzatori',
  'Ascensore',
  'Doppi servizi – almeno uno con finestra',
  'Porta blindata e/o serratura di sicurezza',
  'Impianto d\'emergenza d\'illuminazione',
  'Cancello automatico',
  'Impianto di videocitofono',
  'Giardino privato o spazio esclusivo',
  'Dotazione di lavatrice',
  'Dotazione di lavastoviglie',
  'Prossimità dell\'abitazione all\'insieme dei servizi: autobus, negozi, servizi sociali, ecc.',
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
  'Accessibilità – abbattimento barriere architettoniche',
  'Arredamento completo',
];

var MICROZONE_NAMES = {
  1: '1 – Centro',
  2: '2 – Periferia Urbana',
  3: '3 – Assergi-Camarda-Paganica',
  4: '4 – Sassa-Preturo-Arischia',
  5: '5 – Collebrincioni-Camarda-Pescomaggiore',
  6: '6 – Bagno-Roio-Sassa',
  7: '7 – Santi-Casaline-Menzano',
};

// ============================================================
// GENERATORE PRINCIPALE
// ============================================================
function generaAttestazione(dati) {
  var apt = dati.appartamento || {};
  var cnt = dati.contratto   || {};
  var calc = dati.calcolo    || {};
  var locs = dati.locatori   || [];
  var cons = dati.conduttori || [];
  var elemA = dati.elementiA || [];
  var elemB = dati.elementiB || [];
  var pertSep = dati.pertSeparate || [];

  // Locatore principale
  var loc0 = locs[0] || {};
  var locNome = ((loc0.cognome||'')+' '+(loc0.nome||'')).trim() || av('',140);
  var locCF   = loc0.cf || av('',120);
  var locRes  = loc0.comuneResidenza || av('',80);
  var locCAP  = av('',40);
  var locProv = av('',25);
  var locVia  = loc0.viaResidenza || av('',100);

  // Conduttore principale
  var con0 = cons[0] || {};
  var conNome = ((con0.cognome||'')+' '+(con0.nome||'')).trim() || av('',140);
  var conCF   = con0.cf || av('',120);
  var conRes  = con0.comuneResidenza || av('',80);
  var conVia  = con0.viaResidenza || av('',100);

  // Dati immobile
  var comune   = apt.comune || av('',80);
  var via      = apt.via    || av('',100);
  var nCiv     = apt.nCivico || av('',25);
  var piano    = apt.piano   || av('',30);
  var interno  = apt.interno || av('',30);

  // Dati contratto
  var tipoA = cnt.tipo === 'Tipo A';
  var tipoB = cnt.tipo === 'Tipo B';
  var tipoC = cnt.tipo === 'Tipo C';
  var duraDal   = fmtDataAtt(cnt.duraDal) || av('',60);
  var duraAl    = fmtDataAtt(cnt.duraAl)  || av('',60);
  var duraMesi  = cnt.duraMesi || av('',20);

  // Dati calcolo
  var microzona     = calc.microzona || apt.microzona || av('',30);
  var nElemA        = calc.nElemA || elemA.length || 0;
  var nElemB        = calc.nElemB || elemB.length || 0;
  var fascia        = calc.fascia || av('',20);
  var f1min         = calc.fascia1min ? calc.fascia1min.toFixed(2) : av('',40);
  var f1max         = calc.fascia1max ? calc.fascia1max.toFixed(2) : av('',40);
  var f2min         = calc.fascia2min ? calc.fascia2min.toFixed(2) : av('',40);
  var f2max         = calc.fascia2max ? calc.fascia2max.toFixed(2) : av('',40);
  var fasciMin      = fascia == 1 ? f1min : f2min;
  var fasciMax      = fascia == 1 ? f1max : f2max;
  var valoreMqBase  = calc.valoreMqBase  ? calc.valoreMqBase.toFixed(2)  : av('',50);
  var valoreMqFin   = calc.valoreMqFinale? calc.valoreMqFinale.toFixed(2) : av('',50);
  var supConvImm    = calc.supConvImmobile   ? calc.supConvImmobile.toFixed(2)   : av('',40);
  var supConvPert   = calc.supConvPertinenze ? calc.supConvPertinenze.toFixed(2) : av('',40);
  var supConvTot    = calc.supConvTotale     ? calc.supConvTotale.toFixed(2)     : av('',40);
  var supUtile      = calc.supUtileNetta     ? calc.supUtileNetta.toFixed(2)     : (apt.superficieResidenziale || av('',40));
  var massAnn       = calc.massimaleAnnuo    ? calc.massimaleAnnuo.toFixed(2)    : av('',60);
  var massMens      = calc.massimaleMensile  ? calc.massimaleMensile.toFixed(2)  : av('',60);

  var magg          = calc.maggiorazione || 0;
  var maggPct       = magg ? Math.round(magg*100) : 0;
  var rid           = calc.riduzione || 0;
  var ridPct        = rid ? Math.round(rid*100) : 0;

  // Superfici dall'immobile
  var supBass  = apt.superficieAltezzaBassa || 0;
  var supBalc  = apt.supBalconi || 0;
  var supCant  = apt.supCantine || 0;
  var supGar   = apt.supGarage  || 0;
  var supPosto = apt.supPostoAuto || 0;
  var supVerde = apt.supAreaVerde || 0;

  var isSemint = apt.flagSeminterrato === true || String(apt.flagSeminterrato).toLowerCase() === 'true';
  var apeClasse = apt.apeClasse || cnt.apeClasse || av('',25);

  // Canone
  var canoneMens = cnt.canoneMensile  || av('',60);
  var canoneAnn  = cnt.canoneAnnuale  || av('',60);

  // Microzona label
  var mzLabel = MICROZONE_NAMES[parseInt(microzona)] || ('Microzona '+microzona);

  // ── BUILD HTML ──
  var html = '<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"/>';
  html += '<title>Attestazione di Rispondenza</title>';
  html += '<style>'+CSS_ATTESTAZIONE+'</style></head><body>';
  html += '<button class="print-btn no-print" onclick="window.print()">🖨️ Stampa / Salva PDF</button>';
  html += '<div class="page">';

  // ── PAGINA 1 ──
  html += '<h1>ATTESTAZIONE DI RISPONDENZA EX D.M. 16/01/2017&nbsp;&nbsp;&nbsp;(All. 7)</h1>';

  // Intestazione locatore
  html += '<p>Il/la sottoscritto/a Sig./Sig.ra <b>'+locNome+'</b> , C.F. <b>'+locCF+'</b>,</p>';
  html += '<p>residente a <b>'+locRes+'</b> cap '+av('',35)+' (Prov.'+av('',18)+') in Via <b>'+locVia+'</b>, nella sua</p>';
  html += '<p>qualità di locatore dell\'immobile / porzione di immobile sito a <b>'+comune+'</b>, in Via <b>'+via+'</b>, n.</p>';
  html += '<p><b>'+nCiv+'</b>, piano <b>'+piano+'</b>, int. <b>'+interno+'</b>, ha stipulato in data '+av('',70)
    +' un contratto di locazione ad uso abitativo per la</p>';
  html += '<p>propria unità immobiliare, di seguito identificata, con il/la Sig./Sig.ra <b>'+conNome+'</b>,</p>';
  html += '<p>C.F. <b>'+conCF+'</b>, residente in <b>'+conRes+'</b>, Via <b>'+conVia+'</b>, per <u>mesi / anni</u></p>';
  html += '<p><b>'+duraMesi+'</b> con decorrenza dal <b>'+duraDal+'</b> al <b>'+duraAl
    +'</b> e registrato il '+av('',50)+' al n. '+av('',50)+' – serie '+av('',20)+' e</p>';
  html += '<p>codice identificativo '+av('',120)+' / in corso di registrazione, essendo i termini non ancora scaduti,</p>';

  html += '<p class="center bold" style="margin:10pt 0">chiede</p>';

  html += '<p>il rilascio dell\'attestazione ex D.M. 16-1-2017 di rispondenza dei contenuti economici e normativi del contratto</p>';
  html += '<p>allegato all\'Accordo locale per il Comune di L\'Aquila, depositato in data &nbsp;26-09-2025.</p>';
  html += '<p style="margin-top:6pt">A tal fine, consapevole delle sanzioni penali previste dall\'art. 76 del D.P.R. n. 445/2000 per le</p>';
  html += '<p>dichiarazioni mendaci e l\'uso di atti falsi, attesta ai sensi degli artt. 21 comma 2 e 47 dello stesso D.P.R.</p>';
  html += '<p>445/2000, che il contratto di locazione è stato stipulato utilizzando il tipo di contratto allegato al D.M. 16.1.2017</p>';
  html += '<p>e, sempre relativamente al contratto, dichiara i seguenti dati ed elementi:</p>';

  // Tipo contratto
  html += '<table class="bordi" style="margin-top:10pt"><tr>'
    +'<td class="center" style="width:33%"><b>TIPO DI CONTRATTO</b></td>'
    +'<td class="center" style="width:22%">'+chk(tipoA)+' +2 (A)</td>'
    +'<td class="center" style="width:22%">'+chk(tipoB)+' Transitorio (B)</td>'
    +'<td class="center" style="width:23%">'+chk(tipoC)+' Studenti (C)</td>'
    +'</tr></table>';

  // Dati catastali
  html += '<h2>DATI CATASTALI IMMOBILI LOCATI</h2>';
  html += '<table class="bordi"><tr>'
    +'<th style="width:15%">Microzona</th><th style="width:15%">Foglio</th>'
    +'<th style="width:18%">Particella</th><th style="width:12%">Sub.</th>'
    +'<th style="width:25%">Rendita catastale</th><th style="width:15%">Cat.</th>'
    +'</tr>';
  // Riga principale
  html += '<tr>'
    +'<td class="center">'+mzLabel+'</td>'
    +'<td class="center">'+avb(apt.catFoglio,40)+'</td>'
    +'<td class="center">'+avb(apt.catParticella,60)+'</td>'
    +'<td class="center">'+avb(apt.catSubalterno,40)+'</td>'
    +'<td class="center">€ '+avb(apt.catRendita,60)+'</td>'
    +'<td class="center">'+avb(apt.catCategoria,40)+'</td>'
    +'</tr>';
  // Pertinenze separate
  pertSep.forEach(function(p) {
    html += '<tr>'
      +'<td class="center">'+av(p.microzona||microzona,40)+'</td>'
      +'<td class="center">'+avb(p.catFoglio,40)+'</td>'
      +'<td class="center">'+avb(p.catParticella,60)+'</td>'
      +'<td class="center">'+avb(p.catSubalterno,40)+'</td>'
      +'<td class="center">€ '+avb(p.catRendita,60)+'</td>'
      +'<td class="center">'+avb(p.catCategoria,40)+'</td>'
      +'</tr>';
  });
  // Riga vuota extra
  html += '<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>';
  html += '</table>';

  // Calcolo superficie convenzionale
  html += '<h2>CALCOLO SUPERFICIE CONVENZIONALE</h2>';
  html += '<table class="bordi"><tr>'
    +'<th style="width:45%">Superficie</th>'
    +'<th style="width:20%">Superficie utile</th>'
    +'<th style="width:20%">Indici di moltiplicazione</th>'
    +'<th style="width:15%">Superficie convenzionale</th>'
    +'</tr>';

  // Calcola righe superficie
  var supRealeTot = parseFloat(apt.superficieResidenziale || 0);
  var supBassF    = parseFloat(apt.superficieAltezzaBassa || 0);
  var supNorm     = supRealeTot - supBassF;

  function rigaSup(label, mq, coeff, conv) {
    return '<tr>'
      +'<td>'+label+'</td>'
      +'<td class="center">'+(mq>0?mq.toFixed(2):'')+'</td>'
      +'<td class="center">'+coeff+'</td>'
      +'<td class="center">'+(conv>0?conv.toFixed(2):'')+'</td>'
      +'</tr>';
  }

  if (supRealeTot <= 45) {
    html += rigaSup('Unità immobiliare fino a 45 mq', supNorm, 'x 1,30', supNorm*1.30);
  } else if (supRealeTot <= 70) {
    html += rigaSup('Unità immobiliare da 45 a 70 mq', supNorm, 'x 1,10', supNorm*1.10);
  } else if (supRealeTot <= 120) {
    html += rigaSup('Unità immobiliare da 70 a 120 mq', supNorm, 'x 1', supNorm*1.00);
  } else {
    html += rigaSup('Unità immobiliare da 70 a 120 mq', 120-supBassF, 'x 1', (120-supBassF)*1.00);
    html += rigaSup('Superficie superiore a 120 mq', supRealeTot-120, 'x 0,90', (supRealeTot-120)*0.90);
  }
  if (supBassF > 0) {
    html += rigaSup('Superficie con altezza inferiore a 1,70 metri', supBassF, 'x 0,70', supBassF*0.70);
  }
  html += '<tr><td colspan="3" class="bold center">A) TOTALE SUPERFICIE CONVENZIONALE IMMOBILE</td>'
    +'<td class="center bold">'+supConvImm+' MQ</td></tr>';

  // Pertinenze
  html += '<tr><td colspan="4" class="bold center">PERTINENZE</td></tr>';
  var totBalcCant = parseFloat(supBalc||0)+parseFloat(supCant||0);
  if (totBalcCant > 0) {
    var convBC = totBalcCant<=30 ? totBalcCant*0.25 : 30*0.25+(totBalcCant-30)*0.10;
    html += rigaSup('Balconi, terrazze e cantine e simili', totBalcCant, 'x 0,25 - x 0,10', convBC);
  } else {
    html += '<tr><td>Balconi, terrazze e cantine e simili</td><td></td><td class="center">x 0,25 - x 0,10</td><td></td></tr>';
  }
  var supGarF = parseFloat(supGar||0);
  html += rigaSup('Garage', supGarF>0?supGarF:null, 'x 0,50 – x 1', supGarF>0?supGarF*0.50:0);
  var supPostoF = parseFloat(supPosto||0);
  html += rigaSup('Posto auto', supPostoF>0?supPostoF:null, 'x 0,20', supPostoF>0?supPostoF*0.20:0);
  var supVerdeF = parseFloat(supVerde||0);
  html += rigaSup('Area verde esclusiva', supVerdeF>0?supVerdeF:null, 'x 0,05 – x 0,02', supVerdeF>0?(supVerdeF<=300?supVerdeF*0.05:300*0.05+(supVerdeF-300)*0.02):0);

  html += '<tr><td colspan="3" class="bold center">B) TOTALE SUPERFICIE CONVENZIONALE PERTINENZE</td>'
    +'<td class="center bold">'+supConvPert+' MQ</td></tr>';
  html += '<tr><td colspan="3" class="bold center">TOTALE SUPERFICIE CONVENZIONALE (A+B)</td>'
    +'<td class="center bold">'+supConvTot+' MQ</td></tr>';
  html += '</table>';

  // ── PAGINA 2 ──
  html += '<div class="page-break"></div><div class="page">';

  // Locazione intera/parziale
  html += '<table class="bordi"><tr>'
    +'<td class="center" style="width:30%"><b>LOCAZIONE INTERO</b></td>'
    +'<td class="center" style="width:30%"><b>LOCAZIONE PARZIALE</b></td>'
    +'<td class="center" style="width:25%"><b>SUPERFICIE LOCATA</b></td>'
    +'<td class="center" style="width:15%"><b>MQ</b></td>'
    +'</tr><tr>'
    +'<td class="center">'+chk(cnt.tipoLocazione!=='porzione')+'</td>'
    +'<td class="center">'+chk(cnt.tipoLocazione==='porzione')+'</td>'
    +'<td class="center">'+av(cnt.tipoLocazione==='porzione'?cnt.descrizioneLocazione:'',80)+'</td>'
    +'<td class="center">'+av(supUtile,40)+'</td>'
    +'</tr></table>';

  // Elementi tipo A
  html += '<h2>ELEMENTI TIPO A</h2>';
  html += '<table class="bordi"><tr>';
  // Due colonne affiancate
  var metaA = Math.ceil(ELEM_A_LABELS.length/2);
  html += '<td style="width:50%;padding:0"><table style="width:100%;border-collapse:collapse">';
  for (var i=0; i<metaA; i++) {
    var checked = elemA.indexOf(i) > -1;
    html += '<tr><td style="border:1px solid #000;width:25px;text-align:center;padding:2pt">'+(i+1)+'</td>'
      +'<td style="border:1px solid #ccc;width:18px;text-align:center">'+chk(checked)+'</td>'
      +'<td style="border:1px solid #ccc;padding:2pt 4pt;font-size:8pt">'+ELEM_A_LABELS[i]+'</td></tr>';
  }
  html += '</table></td>';
  html += '<td style="width:50%;padding:0"><table style="width:100%;border-collapse:collapse">';
  for (var j=metaA; j<ELEM_A_LABELS.length; j++) {
    var checkedJ = elemA.indexOf(j) > -1;
    html += '<tr><td style="border:1px solid #000;width:25px;text-align:center;padding:2pt">'+(j+1)+'</td>'
      +'<td style="border:1px solid #ccc;width:18px;text-align:center">'+chk(checkedJ)+'</td>'
      +'<td style="border:1px solid #ccc;padding:2pt 4pt;font-size:8pt">'+ELEM_A_LABELS[j]+'</td></tr>';
  }
  html += '</table></td></tr></table>';

  // Elementi tipo B
  html += '<h2>ELEMENTI TIPO B</h2>';
  html += '<table class="bordi"><tr>';
  var metaB = Math.ceil(ELEM_B_LABELS.length/2);
  html += '<td style="width:50%;padding:0"><table style="width:100%;border-collapse:collapse">';
  for (var k=0; k<metaB; k++) {
    var chkB = elemB.indexOf(k) > -1;
    html += '<tr><td style="border:1px solid #000;width:25px;text-align:center;padding:2pt">'+(k+1)+'</td>'
      +'<td style="border:1px solid #ccc;width:18px;text-align:center">'+chk(chkB)+'</td>'
      +'<td style="border:1px solid #ccc;padding:2pt 4pt;font-size:8pt">'+ELEM_B_LABELS[k]+'</td></tr>';
  }
  html += '</table></td>';
  html += '<td style="width:50%;padding:0"><table style="width:100%;border-collapse:collapse">';
  for (var m=metaB; m<ELEM_B_LABELS.length; m++) {
    var chkBm = elemB.indexOf(m) > -1;
    html += '<tr><td style="border:1px solid #000;width:25px;text-align:center;padding:2pt">'+(m+1)+'</td>'
      +'<td style="border:1px solid #ccc;width:18px;text-align:center">'+chk(chkBm)+'</td>'
      +'<td style="border:1px solid #ccc;padding:2pt 4pt;font-size:8pt">'+ELEM_B_LABELS[m]+'</td></tr>';
  }
  html += '</table></td></tr></table>';

  // Riepilogo elementi e fascia
  html += '<table class="bordi" style="margin-top:4pt"><tr>'
    +'<th style="width:18%">N. Microzona</th>'
    +'<th style="width:25%">N. Elementi</th>'
    +'<th style="width:20%">Fascia valore</th>'
    +'<th style="width:37%">Valori fascia di riferimento min/max</th>'
    +'</tr><tr>'
    +'<td class="center">'+av(mzLabel,60)+'</td>'
    +'<td class="center">A <b>'+nElemA+'</b> &nbsp; B <b>'+nElemB+'</b></td>'
    +'<td class="center">'+chk(fascia==1)+' 1 &nbsp;&nbsp; '+chk(fascia==2)+' 2</td>'
    +'<td class="center">€ '+av(fasciMin,40)+' / € '+av(fasciMax,40)+'</td>'
    +'</tr></table>';

  // Calcolo del canone
  html += '<h2>CALCOLO DEL CANONE</h2>';
  html += '<p>Valore canone mq/anno applicabile € <b>'+av(valoreMqFin,60)+'</b></p>';
  html += '<p class="bold">Calcolo canone massimo annuo:</p>';

  if (cnt.tipoLocazione === 'porzione') {
    html += '<p style="padding-left:16pt">– porzione locata mq <b>'+av(supUtile,40)+'</b> X € mq/anno <b>'+av(valoreMqFin,50)+'</b> = € <b>'+av(massAnn,70)+'</b></p>';
  } else {
    html += '<p style="padding-left:16pt">– Intero immobile mq <b>'+av(supConvTot,40)+'</b> X € mq/anno <b>'+av(valoreMqFin,50)+'</b> = € <b>'+av(massAnn,70)+'</b></p>';
    html += '<p style="padding-left:16pt">– porzione locata mq '+av('',40)+' X € mq/anno '+av('',50)+' = € '+av('',70)+'</p>';
  }

  html += '<table style="width:100%;margin-top:4pt"><tr>'
    +'<th style="width:60%;text-align:left;font-size:8.5pt"></th>'
    +'<th style="width:20%;text-align:center;font-size:8.5pt">INTERO</th>'
    +'<th style="width:20%;text-align:center;font-size:8.5pt">PORZIONE</th>'
    +'</tr>';

  // Righe maggiorazioni
  function rigaMagg(label, pct, val) {
    return '<tr><td style="font-size:8.5pt">'+label+'</td>'
      +'<td style="border-bottom:1px solid #ccc;text-align:center">€ '+av(val,60)+'</td>'
      +'<td style="border-bottom:1px solid #ccc;text-align:center">€ '+av('',60)+'</td></tr>';
  }

  var massBase = calc.massimaleAnnuo && calc.maggiorazione
    ? (calc.massimaleAnnuo / (1+calc.maggiorazione) * (1-calc.riduzione)).toFixed(2)
    : massAnn;

  html += '<tr><td style="font-size:8.5pt">con eventuale maggiorazione per la durata (+ '+av('',15)+'%) =</td>'
    +'<td style="border-bottom:1px solid #ccc;text-align:center">€ '+av('',60)+'</td>'
    +'<td style="border-bottom:1px solid #ccc;text-align:center">€ '+av('',60)+'</td></tr>';

  var maggEnPct = (calc.tipoMaggiorazione==='energetica'&&magg>0) ? maggPct : '';
  var maggElPct = (calc.tipoMaggiorazione==='elementi'&&magg>0)   ? maggPct : '';
  var maggEnVal = (calc.tipoMaggiorazione==='energetica'&&calc.massimaleAnnuo) ? calc.massimaleAnnuo.toFixed(2) : '';
  var maggElVal = (calc.tipoMaggiorazione==='elementi'&&calc.massimaleAnnuo)   ? calc.massimaleAnnuo.toFixed(2) : '';

  html += '<tr><td style="font-size:8.5pt">con eventuale maggiorazione classe energetica: <b>'+av(apeClasse,20)+'</b> (+ '+av(maggEnPct,15)+'%) =</td>'
    +'<td style="border-bottom:1px solid #ccc;text-align:center">€ '+av(maggEnVal,60)+'</td>'
    +'<td style="border-bottom:1px solid #ccc;text-align:center">€ '+av('',60)+'</td></tr>';

  html += '<tr><td style="font-size:8.5pt">con eventuale maggiorazione per numero elementi <b>'+nElemA+'A+'+nElemB+'B</b> (+ '+av(maggElPct,15)+'%) =</td>'
    +'<td style="border-bottom:1px solid #ccc;text-align:center">€ '+av(maggElVal,60)+'</td>'
    +'<td style="border-bottom:1px solid #ccc;text-align:center">€ '+av('',60)+'</td></tr>';

  html += '<tr><td style="font-size:8.5pt">con riduzione per seminterrato (- '+av(isSemint?ridPct:'',15)+'%) =</td>'
    +'<td style="border-bottom:1px solid #ccc;text-align:center">€ '+av(isSemint?massAnn:'',60)+'</td>'
    +'<td style="border-bottom:1px solid #ccc;text-align:center">€ '+av('',60)+'</td></tr>';

  html += '<tr><td class="bold" style="font-size:8.5pt">complessivo =</td>'
    +'<td style="border-bottom:2px solid #000;text-align:center"><b>€ '+av(massAnn,60)+'</b></td>'
    +'<td style="border-bottom:2px solid #000;text-align:center">€ '+av('',60)+'</td></tr>';
  html += '</table>';

  // Riepilogo
  html += '<h2 style="margin-top:10pt">RIEPILOGO</h2>';
  html += '<table class="bordi"><tr>'
    +'<td style="width:50%"><b>CANONE PATTUITO: ANNUO €</b> <b>'+av(canoneAnn,70)+'</b></td>'
    +'<td style="width:50%"><b>/ PERIODO €</b> '+av('',70)+'</td>'
    +'</tr><tr>'
    +'<td><b>CANONE MENSILE PATTUITO €</b> <b>'+av(canoneMens,70)+'</b></td>'
    +'<td></td>'
    +'</tr><tr>'
    +'<td><b>SUPERFICIE LOCATA MQ:</b> <b>'+av(supUtile,50)+'</b></td>'
    +'<td></td>'
    +'</tr><tr>'
    +'<td colspan="2" class="center"><b>VALORE CANONE LOCAZIONE MQ/ANNO €</b> <b>'+av(valoreMqFin,60)+'</b></td>'
    +'</tr></table>';

  html += '<p style="font-size:8pt;margin-top:6pt">I calcoli sono eseguiti su dati, valori ed elementi oggettivi dichiarati con la sottoscrizione dell\'attestazione dal locatore.</p>';

  // Firme
  html += '<div style="display:flex;justify-content:flex-end;margin-top:10pt">';
  html += '<div style="text-align:center"><div style="font-size:8.5pt;font-weight:bold">Il locatore dichiarante</div>';
  html += '<div style="margin-top:30pt;border-top:1px solid #000;width:160px;margin-left:auto">&nbsp;</div></div>';
  html += '</div>';

  // Sezione ASPPI
  html += '<p style="margin-top:16pt;text-align:justify;font-size:8.5pt">';
  html += 'Sulla base di dati, valori ed elementi dichiarati, anche ai fini dell\'ottenimento di eventuali ';
  html += 'agevolazioni fiscali, l\'Organizzazione ASPPI,</p>';
  html += '<p class="center bold" style="margin:8pt 0">ATTESTA</p>';
  html += '<p style="text-align:justify;font-size:8.5pt">che i contenuti economici e normativi del contratto allegato corrispondono a quanto previsto dall\'Accordo ';
  html += 'territoriale vigente per il Comune di L\'Aquila depositato in data 26/09/2025.</p>';

  html += '<div style="display:flex;justify-content:space-between;margin-top:14pt;align-items:flex-end">';
  html += '<div><span style="font-size:8.5pt">L\'Aquila, lì </span>'
    +'<span class="blank" style="min-width:100px">&nbsp;</span></div>';
  html += '<div style="text-align:center"><div style="font-size:8.5pt;font-weight:bold">L\'Organizzazione</div>';
  html += '<div style="margin-top:30pt;border-top:1px solid #000;width:160px;margin-left:auto">&nbsp;</div></div>';
  html += '</div>';

  html += '</div>'; // chiude page 2
  html += '</body></html>';
  return html;
}

// ── DISPATCHER ──
if (typeof window !== 'undefined') window.generaAttestazione = generaAttestazione;
if (typeof module !== 'undefined') module.exports = { generaAttestazione: generaAttestazione };
