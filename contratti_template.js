// ============================================================
// ASPPI L'Aquila — Template Contratti
// Genera HTML stampabile da dati wizard
// ============================================================

var CSS_CONTRATTO = `
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:Verdana,Geneva,sans-serif;font-size:9pt;color:#000;background:#fff;line-height:1.35;}
@page{size:A4;margin:1.5cm 2.8cm 1.75cm 2.8cm;}
@media print{.no-print{display:none!important;}}
@media screen{body{background:#888;}.page{width:210mm;min-height:297mm;margin:24px auto;padding:1.5cm 2.8cm 1.75cm 2.8cm;background:#fff;box-shadow:0 4px 32px rgba(0,0,0,.35);}}
.hdr{border-bottom:2pt solid #1F3864;padding-bottom:3pt;margin-bottom:14pt;}
.hdr table{width:100%;border-collapse:collapse;}
.hdr td{font-size:9pt;font-family:Verdana,Geneva,sans-serif;white-space:nowrap;}
.hdr td:last-child{text-align:right;font-weight:bold;}
p{text-align:justify;margin-bottom:6pt;font-size:9pt;font-family:Verdana,Geneva,sans-serif;line-height:1.35;}
.sp{margin-bottom:10pt;}
.ctr{text-align:center;margin-bottom:6pt;font-size:9pt;}
.art{text-align:center;font-weight:bold;font-size:9pt;margin-top:9pt;margin-bottom:0;}
.art-sub{text-align:center;font-style:italic;font-size:9pt;margin-bottom:4pt;}
.frow{display:flex;justify-content:space-between;margin-top:6pt;margin-bottom:28pt;}
.fcol{width:42%;font-size:9pt;}
.approv{text-align:center;font-weight:bold;font-size:9pt;margin-top:10pt;margin-bottom:4pt;}
.blank{display:inline-block;border-bottom:1px solid #000;min-width:80px;}
.print-btn{position:fixed;bottom:24px;right:24px;background:#E8631A;color:#fff;border:none;border-radius:50px;padding:14px 24px;font-size:14px;font-weight:700;cursor:pointer;font-family:sans-serif;box-shadow:0 4px 20px rgba(232,99,26,.4);z-index:1000;}
`;

// ── HELPER ──
function fmtData(d) {
  if (!d) return '';
  var s = String(d).trim();
  // Già in formato gg/mm/aaaa — restituisci as-is
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
  // Formato ISO: 2026-07-01T22:00:00.000Z o 2026-07-01
  // Leggi solo la parte data (yyyy-mm-dd) senza conversione fuso orario
  var isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return isoMatch[3] + '/' + isoMatch[2] + '/' + isoMatch[1];
  }
  return s;
}

function v(val, larghezza) {
  // Se il valore c'è → lo restituisce
  // Se manca → una riga tratteggiata della larghezza giusta
  if (val && String(val).trim() !== '') return String(val).trim();
  var px = (larghezza || 120) + 'px';
  return '<span class="blank" style="min-width:' + px + '">&nbsp;</span>';
}

function vb(val, larghezza) {
  // Come v() ma in grassetto se presente
  if (val && String(val).trim() !== '') return '<b>' + String(val).trim() + '</b>';
  return '<span class="blank" style="min-width:' + (larghezza||120) + 'px">&nbsp;</span>';
}

function persona(p, titolo, idx, tipo) {
  var nome    = vb((p.cognome && p.nome) ? p.cognome + ' ' + p.nome : (p.nome || ''), 180);
  var luogo   = v(p.luogoNascita, 120);
  var data    = v(p.dataNascita, 80);
  var cf      = vb(p.cf, 160);
  var res     = v(p.comuneResidenza, 100);
  var via     = v(p.viaResidenza, 160);
  var docTipo = v(p.docTipo, 100);
  var docNum  = v(p.docNum, 100);
  var docEnte = v(p.docEnte, 120);
  var docRil  = v(p.docRilascio, 80);
  var docSca  = v(p.docScadenza, 80);
  var suf = ';';
  return '<p>' + titolo + ' <b>' + nome + '</b>, nato/a a ' + luogo + ' il ' + data +
    ', <b>C.F.: ' + cf + '</b>, residente in ' + res + ', Via ' + via +
    ', identificato/a mediante ' + docTipo + ' n°' + docNum +
    ' rilasciata dal ' + docEnte + ' il ' + docRil +
    ', scadente in data ' + docSca + suf + '</p>';
}

function garante(g, artRif) {
  if (!g || (!g.nome && !g.cognome)) return '';
  var nome = vb((g.cognome && g.nome) ? g.cognome + ' ' + g.nome : g.nome, 160);
  var luogo = v(g.luogoNascita, 100);
  var data  = v(g.dataNascita, 80);
  var cf    = vb(g.cf, 160);
  var res   = v(g.comuneResidenza, 100);
  var via   = v(g.viaResidenza, 160);
  var condRef = v(g.cr2, 140);
  var canone  = v('', 60);
  return '<p><i>Il/la Sig./Sig.ra ' + nome + ', nato/a a ' + luogo + ' il ' + data +
    '., <b>CF:</b> ' + cf + ', residente in ' + res + ', Via ' + via +
    ', <b>si costituisce nel presente atto irrevocabilmente GARANTE personale e solidale' +
    ' e senza condizione alcuna per le obbligazioni assunte con il contratto</b>' +
    ' del/la Sig./Sig.ra ' + condRef + ' come meglio specificato nel successivo art. ' + artRif + ')</i></p>';
}

function bloccoImmobile(d, allegato) {
  // I dati immobile vengono dall'appartamento (curApt) mergiato nei dati contratto
  var apt = d.appartamento || {};
  var comune  = vb(d.comune  || apt.comune  || '', 100);
  var via     = vb(d.via     || apt.via     || '', 160);
  var nciv    = v(d.nCivico  || apt.nCivico || '', 40);
  var piano   = v(d.piano    || apt.piano   || '', 60);
  var scala   = v(d.scala    || apt.scala   || '', 40);
  var interno = v(d.interno  || apt.interno || '', 40);
  var vani    = v(d.compCamere || d.nVani || apt.nVani || apt.compCamere || '', 40);
  var acc     = (d.elemAccessori && String(d.elemAccessori||'').trim()) ? d.elemAccessori.trim() : 'nessuno';
  var arred   = d.ammobiliata === 'si' ? 'ammobiliata' : 'non ammobiliata';
  var sezione = v(d.catSezione || apt.catSezione || '', 40);
  var foglio  = vb(d.catFoglio  || apt.catFoglio  || '', 40);
  var plla    = vb(d.catParticella || apt.catParticella || '', 40);
  var sub     = vb(d.catSubalterno || apt.catSubalterno || '', 40);
  var cat     = vb(d.catCategoria  || apt.catCategoria  || '', 40);
  var rendita = vb(d.catRendita    || apt.catRendita    || '', 60);
  var classe  = v(d.apeClasse  || '', 30);
  var tabProp = v(d.tabMillProp || apt.tabMillProp || '', 60);
  var tabRisc = v(d.tabMillRisc || apt.tabMillRisc || '', 60);
  var statoImm = v(d.statoImmobile, 200);

  var introImm = (d.tipoLocazione === 'porzione')
    ? 'porzione dell\'unità immobiliare'
    : 'l\'unità immobiliare';

  var pertTxt = 'nessuna';
  if (d.pertinenze && d.pertinenze.length) {
    var tipi = d.pertinenze.map(function(p){ return p.tipo || ''; }).filter(Boolean);
    if (tipi.length) pertTxt = tipi.join(', ');
  }

  var html = '';
  html += '<p class="ctr">' + introImm + '</p>';
  html += '<p>posta in ' + comune + ', Via ' + via + ' n°' + nciv +
    ', piano ' + piano + ', scala ' + scala + ', int. ' + interno +
    ', composta di n. ' + vani + ' vani (vani effettivi non catastali escluso bagni, cucina e ripostigli),' +
    ' oltre cucina e servizi, e dotata altresì dei seguenti elementi accessori: ' + acc +
    ', e delle seguenti pertinenze: ' + pertTxt +
    ', ' + arred + ' come da separato elenco sottoscritto dalle parti.</p>';

  html += '<p>a) estremi catastali identificativi dell\'unità immobiliare: ' +
    '<b>Sezione ' + sezione + '. Foglio ' + foglio + '. p.lla ' + plla +
    '. sub ' + sub + '. cat. ' + cat + '. rendita Euro ' + rendita + ';</b></p>';

  if (d.pertinenze && d.pertinenze.length) {
    d.pertinenze.forEach(function(p, i) {
      var ptipo = v(p.tipo, 80); var psez = v(p.catSezione, 40);
      var pfog  = vb(p.catFoglio, 40); var ppar = vb(p.catParticella, 40);
      var psub  = vb(p.catSubalterno, 40); var pcat = vb(p.catCategoria, 40);
      var prend = vb(p.catRendita, 60);
      html += '<p>a.' + (i+1) + ') pertinenza – ' + ptipo +
        ': <b>Sezione ' + psez + '. Foglio ' + pfog + '. p.lla ' + ppar +
        '. sub ' + psub + '. cat. ' + pcat + '. rendita Euro ' + prend + ';</b></p>';
    });
  }

  var apeNum = v(d.apeNumero, 120);
  var _apeN = d.apeNumero ? String(d.apeNumero).trim() : '';
  html += '<p>b) prestazione energetica: classe ' + classe +
    ' (come da informazioni ricevute dal conduttore già in sede di trattative)' +
    (_apeN ? ', attestato n. <b>' + apeNum + '</b>' : '') + ';</p>';
  html += '<p>c) sicurezza impianti: rispondenti alle normative in materia di sicurezza vigenti' +
    ' all\'epoca in cui gli stessi sono stati realizzati, che il conduttore accetta nello stato' +
    ' in cui si trovano;</p>';
  html += '<p>d) tabelle millesimali: proprietà ' + tabProp +
    ' riscaldamento ' + tabRisc + ' acqua a consumo;</p>';
  html += '<p>La locazione è regolata dalle pattuizioni seguenti.</p>';
  return html;
}


function bloccoOneri(d, allegato) {
  var html = '';
  html += '<p>Per gli oneri accessori le parti fanno applicazione della Tabella oneri accessori,' +
    ' allegato D al decreto emanato dal Ministro delle infrastrutture e dei trasporti di concerto' +
    ' con il Ministro dell\'economia e delle finanze ai sensi dell\'articolo 4, comma 2, della' +
    ' legge n. 431/1998 e di cui il presente contratto costituisce l\'allegato ' + allegato +
    ', così come integrato da quanto previsto dall\'Allegato D all\'Accordo territoriale' +
    ' richiamato al precedente Articolo 2.</p>';
  html += '<p>In sede di consuntivo, il pagamento degli oneri anzidetti, per la quota parte di quelli' +
    ' condominiali/comuni a carico del conduttore, deve avvenire entro sessanta giorni dalla richiesta.' +
    ' Prima di effettuare il pagamento, il conduttore ha diritto di ottenere l\'indicazione specifica' +
    ' delle spese anzidette e dei criteri di ripartizione. Ha inoltre diritto di prendere visione' +
    ' - anche tramite organizzazioni sindacali - presso il locatore (o il suo amministratore o' +
    ' l\'amministratore condominiale, ove esistente), dei documenti giustificativi delle spese' +
    ' effettuate. Insieme con il pagamento della prima rata del canone annuale, il conduttore' +
    ' versa una quota di acconto non superiore a quella di sua spettanza risultante dal rendiconto' +
    ' dell\'anno precedente.</p>';

  if (d.oneriMensili && String(d.oneriMensili).trim() !== '') {
    var om = v(d.oneriMensili, 60);
    var oml = v(d.oneriMensiliLettere, 100);
    html += '<p>Per le spese di cui sopra il conduttore si obbliga a versare mensilmente,' +
      ' unitamente al canone di locazione, una quota di <b>euro ' + om +
      ' (' + oml + '/00)</b> mensili salvo conguaglio al termine di ciascun anno.</p>';
  } else {
    html += '<p>Per le spese di cui al presente articolo il conduttore si obbliga a versare' +
      ' gli importi dovuti per quanto di competenza entro 15 gg dalla presentazione del' +
      ' consuntivo delle stesse.</p>';
  }
  html += '<p>Sono interamente a carico del conduttore le spese relative ad ogni utenza' +
    ' (energia elettrica, acqua, gas, telefono e Tari).</p>';
  return html;
}

function bloccoFirme(hasGarante, artGarante) {
  var html = '';
  html += '<p style="margin-top:10pt;">Letto, approvato e sottoscritto in L\'Aquila lì, ' + v('', 80) + '</p>';
  html += '<div class="frow"><div class="fcol"><p>Il locatore</p></div><div class="fcol"><p>Il conduttore</p></div></div>';
  if (hasGarante) {
    html += '<p>Il Garante di cui all\'art.' + artGarante + '</p>';
  }
  return html;
}

function bloccoBollo() {
  return '<p>L\'applicazione del regime fiscale denominato "cedolare secca" di cui al D.L. 23/2011' +
    ' è sostitutivo dell\'IRPEF e delle relative addizionali, nonché delle imposte di bollo e' +
    ' registro, ivi comprese quelle sulla risoluzione e sulle proroghe del contratto. Nel caso' +
    ' in cui il locatore rinunzi al predetto regime fiscale, le spese di bollo per il presente' +
    ' contratto e per le ricevute conseguenti, ove dovute, saranno integralmente a carico del' +
    ' conduttore mentre saranno a carico di entrambe le parti in egual misura le spese di' +
    ' registrazione.</p>' +
    '<p>Il locatore provvederà nel termine perentorio di giorni trenta dalla sottoscrizione del' +
    ' presente contratto alla sua registrazione, dandone documentata comunicazione entro e non' +
    ' oltre giorni sessanta al conduttore ed all\'Amministratore del Condominio, ai sensi dell\'art.' +
    ' 13 comma 1 della Legge 431/1998. Le parti possono delegare alla registrazione del contratto' +
    ' una delle organizzazioni sindacali che abbia prestato assistenza ai fini della stipula del' +
    ' contratto medesimo.</p>';
}

function bloccoAccesso(modalita) {
  var mod = v(modalita, 200);
  return '<p>Il conduttore deve consentire l\'accesso all\'unità immobiliare al locatore, al suo' +
    ' amministratore nonché ai loro incaricati ove gli stessi ne abbiano - motivandola - ragione.</p>' +
    '<p>Nel caso in cui il locatore intenda vendere l\'unità immobiliare ovvero locarla a seguito' +
    ' di recesso anticipato del conduttore o di disdetta del locatore stesso, questi deve' +
    ' consentirne la visita una volta la settimana, per almeno due ore, con esclusione dei giorni' +
    ' festivi con le seguenti modalità: ' + mod + '.</p>';
}

function bloccoCommissione() {
  return '<p>La Commissione di cui all\'articolo 6 del decreto del Ministro delle infrastrutture e' +
    ' dei trasporti di concerto con il Ministro dell\'economia e delle finanze, emanato ai sensi' +
    ' dell\'articolo 4, comma 2, della legge 431 del 1998, è composta da due membri scelti fra' +
    ' appartenenti alle rispettive organizzazioni firmatarie dell\'Accordo territoriale sulla base' +
    ' delle designazioni, rispettivamente, del locatore e del conduttore. L\'operato della' +
    ' Commissione è disciplinato dal documento "Procedure di negoziazione e conciliazione' +
    ' stragiudiziale nonché modalità di funzionamento della Commissione", Allegato E al citato' +
    ' decreto. La richiesta di intervento della Commissione non determina la sospensione delle' +
    ' obbligazioni contrattuali. La richiesta di attivazione della Commissione non comporta oneri.</p>';
}

function bloccoVarie() {
  return '<p>A tutti gli effetti del presente contratto, compresa la notifica degli atti esecutivi,' +
    ' e ai fini della competenza a giudicare, il conduttore elegge domicilio nei locali a lui' +
    ' locati e, ove egli più non li occupi o comunque detenga, presso l\'ufficio di segreteria del' +
    ' Comune ove è situato l\'immobile locato. Qualunque modifica al presente contratto non può aver' +
    ' luogo, e non può essere provata, se non con atto scritto. Il locatore ed il conduttore si' +
    ' autorizzano reciprocamente a comunicare a terzi i propri dati personali in relazione ad' +
    ' adempimenti connessi col rapporto di locazione, in conformità a quanto previsto dal' +
    ' Regolamento Europeo (UE) 2016/679 (GDPR) in materia di trattamento dei dati personali e' +
    ' sensibili. Per quanto non previsto dal presente contratto le parti rinviano a quanto in' +
    ' materia disposto dal Codice civile, dalle leggi n. 392/1978 e n. 431 del 1998 o comunque' +
    ' dalle norme vigenti e dagli usi locali nonché alla normativa ministeriale emanata in' +
    ' applicazione della legge n. 431 del 1998 ed all\'Accordo definito in sede locale.</p>';
}

function bloccoAltreClausole() {
  return '<p>Le parti convengono che in caso di furto nell\'unità immobiliare locata, il conduttore' +
    ' in quanto custode risponde degli eventuali danni cagionati all\'immobile e sono a suo carico' +
    ' le relative riparazioni.</p>';
}

// ── ACCORDO TERRITORIALE (fisso per tutti i tipi) ─────────────
var ACCORDO = 'FEDERPROPRIETA\'- ARPE, U.P.P.I., CONFABITARE, CONFEDILIZIA, ASPPI, UNIONCASA,' +
  ' FAPI CASA, SICET, MUTUA STUDENTESCA, UDU, CONIA – FEDERAZIONE NAZIONALE INQUILINI ASSOCIATI,' +
  ' ASSOCASA, EOLO L\'AQUILA, sottoscritto in data 18/09/2025 e depositato in data 26/09/2025' +
  ' con prot. n° 0109441 presso il Comune dell\'Aquila';

var ACCORDO_B = 'FEDERPROPRIETA\' – ARPE, U.P.P.I., CONFABITARE, CONFEDILIZIA, ASPPI, UNIONCASA,' +
  ' FAPI CASA, SICET, MUTUA STUDENTENSCA – UDU, CONIA- CONFEDERAZIONE NAZIONALE INQUILINI ASSOCIATI' +
  ' sottoscritto in data 18/09/2025 e depositato in data 26/09/2025, prot. n°0109441 presso il' +
  ' Comune dell\'Aquila';

// ── PREPARA DATI ──────────────────────────────────────────────
function prepDati(d) {
  // Normalizza date ISO in gg/mm/aaaa
  d.duraDal = fmtData(d.duraDal);
  d.duraAl  = fmtData(d.duraAl);

  // Campi immobile: leggi anche da appartamento annidato se presenti
  if (!d.comune      && d.appartamento) d.comune       = d.appartamento.comune;
  if (!d.via         && d.appartamento) d.via          = d.appartamento.via;
  if (!d.nCivico     && d.appartamento) d.nCivico      = d.appartamento.nCivico;
  if (!d.piano       && d.appartamento) d.piano        = d.appartamento.piano;
  if (!d.scala       && d.appartamento) d.scala        = d.appartamento.scala;
  if (!d.interno     && d.appartamento) d.interno      = d.appartamento.interno;
  if (!d.compCamere  && d.appartamento) d.compCamere   = d.appartamento.nVani || d.appartamento.compCamere;
  if (!d.catSezione  && d.appartamento) d.catSezione   = d.appartamento.catSezione;
  if (!d.catFoglio   && d.appartamento) d.catFoglio    = d.appartamento.catFoglio;
  if (!d.catParticella && d.appartamento) d.catParticella = d.appartamento.catParticella;
  if (!d.catSubalterno && d.appartamento) d.catSubalterno = d.appartamento.catSubalterno;
  if (!d.catCategoria  && d.appartamento) d.catCategoria  = d.appartamento.catCategoria;
  if (!d.catRendita    && d.appartamento) d.catRendita    = d.appartamento.catRendita;

  // n° vani: leggi da nVani o compCamere
  if (!d.compCamere) d.compCamere = d.nVani || '';

  // Helper pertinenze
  d.pertTesto = function() {
    if (!d.pertinenze || !d.pertinenze.length) return 'nessuna';
    return d.pertinenze.map(function(p) {
      return (p.tipo || '') + (p.catFoglio ? ' (Fg.' + p.catFoglio + ' p.' + p.catParticella + ' sub.' + p.catSubalterno + ')' : '');
    }).join(', ');
  };
  return d;
}

// ══════════════════════════════════════════════════════════════
// TIPO A — Locazione agevolata 3+2
// ══════════════════════════════════════════════════════════════
function generaContratto_A(raw) {
  var d = prepDati(raw);
  var locs = d.locatori || [{}];
  var cons  = d.conduttori || [{}];
  var gars  = d.garanti || [];
  var hasGarante = gars.length > 0 && (gars[0].nome || gars[0].cognome);

  var canAnn = vb(d.canoneAnnuale, 80);
  var canAnnL= v(d.canoneAnnualeLettere, 140);
  var canMes = vb(d.canoneMensile, 60);
  var canMesL= v(d.canoneMensileLettere, 120);
  var depImp = vb(d.depositoImporto, 80);
  var depImpL= v(d.depositoImportoLettere, 140);
  var conviventi = (d.conviventi && d.conviventi.trim() && d.conviventi.trim().toLowerCase() !== 'nessuno') ? d.conviventi.trim() : 'nessuno';
  var statoImm   = v(d.statoImmobile, 200);
  var dataDal = vb(fmtData(d.duraDal), 80);
  var dataAl  = vb(fmtData(d.duraAl), 80);

  var html = '<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"/>';
  html += '<title>' + (d.nomeContratto || 'Contratto Tipo A') + '</title>';
  html += '<style>' + CSS_CONTRATTO + '</style></head><body>';
  html += '<button class="print-btn no-print" onclick="window.print()">🖨️ Stampa / Salva PDF</button>';
  html += '<div class="page">';

  // HEADER
  html += '<div class="hdr"><table><tr>';
  html += '<td>Associazione Sindacale Piccoli Proprietari Immobiliari (A.S.P.P.I.)</td>';
  html += '<td><b>ALLEGATO A - D.M. 16.01.2017</b></td>';
  html += '</tr></table></div>';

  html += '<p class="sp"> </p>';
  html += '<p class="ctr"><b>LOCAZIONE ABITATIVA AGEVOLATA</b></p>';
  html += '<p class="ctr"><i>(Legge 9 dicembre 1998, n. 431, articolo 2, comma 3)</i></p>';
  html += '<p class="sp"> </p>';

  // LOCATORI
  locs.forEach(function(l, i) {
    var tit = i === 0 ? 'Il/la Sig./Sig.ra' : 'Il/la Sig./Sig.ra';
    html += persona(l, tit, i, 'A');
  });
  if (locs.length > 1) html += '<p>di seguito denominato/a/i "locatore",</p>';
  else html += '<p>di seguito denominato/a "locatore",</p>';

  html += '<p class="ctr">concede' + (locs.length > 1 ? '/concedono' : '') + ' in locazione</p>';

  // CONDUTTORI
  cons.forEach(function(c, i) {
    var tit = i === 0 ? 'al/alla Sig./Sig.ra' : 'Sig./Sig.ra';
    html += persona(c, tit, i, 'A');
  });

  // GARANTE (se presente)
  if (hasGarante) {
    html += garante(gars[0], '3');
  }

  if (cons.length > 1) html += '<p>che accetta/no, per sè e suoi/loro aventi causa, di seguito denominata/o/i "conduttore"</p>';
  else html += '<p>che accetta, per sè e suoi aventi causa, di seguito denominata/o/i "conduttore"</p>';

  // IMMOBILE
  html += bloccoImmobile(d, 'A');

  // ART 1
  html += '<p class="art">Articolo 1</p><p class="art-sub">(Durata)</p>';
  html += '<p>Il contratto è stipulato per la durata di <b>TRE ANNI</b>, dal ' + dataDal +
    ' al ' + dataAl + ', e alla prima scadenza, ove le parti non concordino sul rinnovo del' +
    ' medesimo, il contratto è prorogato di diritto di <b>DUE ANNI</b>, fatta salva la facoltà' +
    ' di disdetta da parte del locatore che intenda adibire l\'immobile agli usi o effettuare' +
    ' sullo stesso le opere di cui all\'articolo 3 della legge n. 431/98, ovvero vendere' +
    ' l\'immobile alle condizioni e con le modalità di cui al citato articolo 3. Alla scadenza' +
    ' del periodo di proroga biennale ciascuna parte ha diritto di attivare la procedura per' +
    ' il rinnovo a nuove condizioni ovvero per la rinuncia al rinnovo del contratto, comunicando' +
    ' la propria intenzione con lettera raccomandata da inviare all\'altra parte almeno sei mesi' +
    ' prima della scadenza. In mancanza della comunicazione, il contratto è rinnovato tacitamente' +
    ' alle stesse condizioni. Nel caso in cui il locatore abbia riacquistato la disponibilità' +
    ' dell\'alloggio alla prima scadenza e non lo adibisca, nel termine di dodici mesi dalla data' +
    ' in cui ha riacquistato tale disponibilità, agli usi per i quali ha esercitato la facoltà di' +
    ' disdetta, il conduttore ha diritto al ripristino del rapporto di locazione alle stesse' +
    ' condizioni di cui al contratto disdettato o, in alternativa, ad un risarcimento pari a' +
    ' trentasei mensilità dell\'ultimo canone di locazione corrisposto.</p>';

  // ART 2
  html += '<p class="art">Articolo 2</p><p class="art-sub">(Canone – Cedolare secca)</p>';
  html += '<p>Il canone annuo di locazione, secondo quanto stabilito dall\'Accordo locale definito' +
    ' tra il Comune dell\'Aquila e ' + ACCORDO + ', è convenuto in' +
    ' <b>euro ' + canAnn + ' (' + canAnnL + '/00)</b>,' +
    ' che il conduttore si obbliga a corrispondere nel domicilio del locatore ovvero a mezzo' +
    ' bonifico bancario in n°12 rate eguali anticipate di' +
    ' <b>euro ' + canMes + ' (' + canMesL + '/00)</b> ciascuna, con scadenza il giorno 5' +
    ' (cinque/00) di ciascun mese' + (d.canoneIBAN&&d.canoneIBAN.trim()?', da versare sul conto corrente bancario IBAN: <b>'+d.canoneIBAN.trim()+'</b>':'') + '. Il locatore dichiara di volersi avvalere della modalità di' +
    ' tassazione sui redditi da locazione prevista dal D.lgs. n. 23 del 14 marzo 2011 denominata' +
    ' "cedolare secca". Pertanto la registrazione fiscale di tale contratto non comporterà alcun' +
    ' pagamento di imposta di registro o imposta di bollo. Non verrà inoltre applicata negli anni' +
    ' di vigenza del contratto alcuna maggiorazione di canone a qualsiasi titolo compreso' +
    ' l\'aggiornamento ISTAT. Nel caso di revoca dell\'opzione per il predetto regime fiscale, il' +
    ' canone verrà aggiornato annualmente nella misura del 75% della variazione ISTAT dell\'indice' +
    ' dei prezzi al consumo per le famiglie di operai ed impiegati (indice FOI).</p>';

  // ART 3
  html += '<p class="art">Articolo 3</p><p class="art-sub">(Deposito cauzionale e altre forme di garanzia)</p>';
  html += '<p>A garanzia delle obbligazioni assunte con il presente contratto, il conduttore versa' +
    ' al locatore (che con la firma del contratto ne rilascia, in caso, quietanza) una somma pari' +
    ' ad <b>euro ' + depImp + ' (' + depImpL + '/00)</b>,' +
    ' pari a due mensilità del canone, non imputabile in conto canoni e produttiva di interessi' +
    ' legali, riconosciuti al conduttore al termine di ogni anno di locazione, salvo che la durata' +
    ' contrattuale minima non sia, ferma la proroga del contratto per due anni, di almeno 5 anni' +
    ' o superiore. Il deposito cauzionale così costituito viene reso al termine della locazione,' +
    ' previa verifica sia dello stato dell\'unità immobiliare sia dell\'osservanza di ogni' +
    ' obbligazione contrattuale. <b>Eventuali altre forme di garanzia:</b> ';
  if (hasGarante) {
    var g = gars[0];
    var gNome = vb((g.cognome && g.nome) ? g.cognome + ' ' + g.nome : g.nome, 140);
    var gCond = v(g.cr2 || (cons[0] && (cons[0].cognome + ' ' + cons[0].nome)), 140);
    var gCan  = v(d.canoneMensile, 60);
    html += '<i>Il/la Sig./Sig.ra ' + gNome + '., si impegna solidalmente e senza condizione' +
      ' alcuna, per tutta la durata e per le obbligazioni assunte con il presente contratto dal' +
      ' conduttore Sig./Sig.ra ' + gCond + ' al pagamento del canone di locazione pari a ' +
      gCan + ' Euro mensili, nonché, per al pagamento degli oneri accessori, interessi e penalità' +
      ' per il ritardato pagamento ed indennità di occupazione ed eventuale risarcimento dei danni' +
      ' all\'immobile, sia nell\'eventualità di rescissione e/o risoluzione del contratto, sia al' +
      ' momento della riconsegna dell\'immobile.</i>';
  } else {
    html += '<i>nessuna</i>';
  }
  html += '</p>';

  // ART 4
  html += '<p class="art">Articolo 4</p><p class="art-sub">(Oneri accessori)</p>';
  html += bloccoOneri(d, 'A');

  // ART 5
  html += '<p class="art">Articolo 5</p><p class="art-sub">(Spese di bollo e di registrazione)</p>';
  html += bloccoBollo();

  // ART 6
  html += '<p class="art">Articolo 6</p><p class="art-sub">(Pagamento)</p>';
  html += '<p>Il pagamento del canone o di quant\'altro dovuto anche per oneri accessori non può' +
    ' venire sospeso o ritardato da pretese o eccezioni del conduttore, quale ne sia il titolo.' +
    ' Il mancato puntuale pagamento, per qualsiasi causa, anche di una sola rata del canone,' +
    ' nonché di quant\'altro dovuto, ove di importo pari almeno ad una mensilità del canone,' +
    ' costituisce in mora il conduttore, fatto salvo quanto previsto dall\'articolo 55 della' +
    ' Legge 27 luglio 1978, n. 392.</p>';

  // ART 7
  html += '<p class="art">Articolo 7</p><p class="art-sub">(Uso)</p>';
  html += '<p>L\'immobile deve essere destinato esclusivamente ad uso di civile abitazione del' +
    ' conduttore e delle seguenti persone attualmente con lui conviventi: <i>' + conviventi + '</i>.' +
    ' Salvo espresso patto scritto contrario, è fatto divieto di sublocazione e di comodato sia' +
    ' totale sia parziale. Per la successione nel contratto si applica l\'articolo 6 della Legge' +
    ' n. 392/78, nel testo vigente a seguito della sentenza della Corte costituzionale n. 404/1988.</p>';

  // ART 8
  html += '<p class="art">Articolo 8</p><p class="art-sub">(Recesso del conduttore)</p>';
  html += '<p>E\' facoltà del conduttore recedere dal contratto per gravi motivi, previo avviso da' +
    ' recapitarsi tramite lettera raccomandata a.r. almeno sei mesi prima.</p>';

  // ART 9
  html += '<p class="art">Articolo 9</p><p class="art-sub">(Consegna)</p>';
  html += '<p>Il conduttore dichiara di aver attentamente visitato l\'unità immobiliare locatagli,' +
    ' di averla trovata adatta all\'uso convenuto e, pertanto, di prenderla in consegna ad ogni' +
    ' effetto con il ritiro delle chiavi, costituendosi da quel momento custode della stessa ad' +
    ' ogni effetto di legge. Il conduttore si impegna a riconsegnare l\'unità immobiliare nello' +
    ' stato in cui la ha ricevuta, salvo il deperimento d\'uso, pena il risarcimento del danno;' +
    ' si impegna, altresì, a rispettare le norme del regolamento dello stabile ove esistente,' +
    ' accusando in tal caso ricevuta dello stesso con la firma del presente contratto, così come' +
    ' si impegna ad osservare le deliberazioni dell\'assemblea dei condomini. È in ogni caso' +
    ' vietato al conduttore compiere atti e tenere comportamenti che possano recare molestia agli' +
    ' altri abitanti dello stabile. Le parti danno atto, in relazione allo stato dell\'unità' +
    ' immobiliare, ai sensi dell\'articolo 1590 del Codice civile di quanto segue: ' + statoImm + '.</p>';

  // ART 10
  html += '<p class="art">Articolo 10</p><p class="art-sub">(Modifiche e danni)</p>';
  html += '<p>Il conduttore non può apportare alcuna modifica, innovazione, miglioria o addizione' +
    ' ai locali locati ed alla loro destinazione, o agli impianti esistenti, senza il preventivo' +
    ' consenso scritto del locatore. Il conduttore esonera espressamente il locatore da ogni' +
    ' responsabilità per danni diretti o indiretti che possano derivargli da fatti dei dipendenti' +
    ' del locatore medesimo nonché per interruzioni incolpevoli dei servizi.</p>';

  // ART 11
  html += '<p class="art">Articolo 11</p><p class="art-sub">(Assemblee)</p>';
  html += '<p>Il conduttore ha diritto di voto, in luogo del proprietario dell\'unità immobiliare' +
    ' locatagli, nelle deliberazioni dell\'assemblea condominiale relative alle spese ed alle' +
    ' modalità di gestione dei servizi di riscaldamento e di condizionamento d\'aria. Ha inoltre' +
    ' diritto di intervenire, senza voto, sulle deliberazioni relative alla modificazione degli' +
    ' altri servizi comuni.</p>';
  html += '<p>Quanto stabilito in materia di riscaldamento e di condizionamento d\'aria si applica' +
    ' anche ove si tratti di edificio non in condominio. In tale caso (e con l\'osservanza, in' +
    ' quanto applicabili, delle disposizioni del codice civile sull\'assemblea dei condomini) i' +
    ' conduttori si riuniscono in apposita assemblea, convocata dalla proprietà o da almeno tre' +
    ' conduttori.</p>';

  // ART 12
  html += '<p class="art">Articolo 12</p><p class="art-sub">(Impianti - APE)</p>';
  html += '<p>Il conduttore -in caso d\'installazione sullo stabile di antenna televisiva' +
    ' centralizzata- si obbliga a servirsi unicamente dell\'impianto relativo, restando sin' +
    ' d\'ora il locatore, in caso di inosservanza, autorizzato a far rimuovere e demolire ogni' +
    ' antenna individuale a spese del conduttore, il quale nulla può pretendere a qualsiasi' +
    ' titolo, fatte salve le eccezioni di legge. Per quanto attiene all\'impianto termico' +
    ' autonomo, ove presente, ai sensi della normativa del D.Lgs n. 192/05, con particolare' +
    ' riferimento all\'art. 7 comma 1, il conduttore subentra per la durata della detenzione' +
    ' alla figura del proprietario nell\'onere di adempiere alle operazioni di controllo e di' +
    ' manutenzione. Il conduttore dichiara di aver ricevuto già in sede di trattative le' +
    ' informazioni ed in sede di stipula la documentazione, comprensiva dell\'attestato, in' +
    ' ordine all\'attestazione della prestazione energetica dell\'immobile.</p>';

  // ART 13
  var modAccA = (d.modalitaAccesso && String(d.modalitaAccesso||'').trim()) ? d.modalitaAccesso.trim() : v('', 180);
  html += '<p class="art">Articolo 13</p><p class="art-sub">(Accesso)</p>';
  html += '<p>Il conduttore deve consentire l\'accesso all\'unità immobiliare al locatore, al suo' +
    ' amministratore nonché ai loro incaricati ove gli stessi ne abbiano - motivandola - ragione.' +
    ' Nel caso in cui il locatore intenda vendere l\'unità immobiliare ovvero locarla a seguito' +
    ' di recesso anticipato del conduttore o di disdetta del locatore stesso, questi deve' +
    ' consentirne la visita una volta la settimana, per almeno due ore, con esclusione dei giorni' +
    ' festivi, con le seguenti modalità: ' + modAccA + '.</p>';

  // ART 14
  html += '<p class="art">Articolo 14</p>';
  html += '<p class="art-sub">(Commissione di negoziazione paritetica e conciliazione stragiudiziale)</p>';
  html += bloccoCommissione();

  // ART 15
  html += '<p class="art">Articolo 15</p><p class="art-sub">(Varie)</p>';
  html += bloccoVarie();

  // ART 16
  html += '<p class="art">Articolo 16</p><p class="art-sub">(Altre clausole)</p>';
  html += bloccoAltreClausole();

  // FIRME
  html += bloccoFirme(hasGarante, '3');

  // APPROVAZIONE
  html += '<p class="approv">Approvazione specifica</p>';
  html += '<p>A mente degli articoli 1341 e 1342 del codice civile, le parti specificamente' +
    ' approvano i patti di cui agli articoli 3 <i>(Deposito cauzionale e altre forme di garanzia)</i>,' +
    ' 4 <i>(Oneri accessori)</i>, 6 <i>(Pagamento, risoluzione)</i>, 9 <i>(Consegna)</i>,' +
    ' 10 <i>(Modifiche e danni)</i>, 12 <i>(Impianti)</i>, 13 <i>(Accesso)</i>,' +
    ' 14 <i>(Commissione di negoziazione paritetica e conciliazione stragiudiziale)</i>,' +
    ' 15 <i>(Varie)</i> e 16 <i>(Altre clausole)</i>, del presente contratto.</p>';
  html += '<div class="frow" style="margin-top:8pt;"><div class="fcol"><p>Il locatore</p></div>';
  html += '<div class="fcol"><p>Il conduttore</p></div></div>';
  if (hasGarante) html += '<p>Il Garante di cui all\'art.3</p>';

  html += '</div></body></html>';
  return html;
}

// ══════════════════════════════════════════════════════════════
// TIPO B — Transitorio cedolare
// ══════════════════════════════════════════════════════════════
function generaContratto_B(raw) {
  var d = prepDati(raw);
  var locs = d.locatori || [{}];
  var cons  = d.conduttori || [{}];
  var gars  = d.garanti || [];
  var hasGarante = gars.length > 0 && (gars[0].nome || gars[0].cognome);

  var canAnn  = vb(d.canoneAnnuale, 80);
  var canAnnL = v(d.canoneAnnualeLettere, 140);
  var canMes  = vb(d.canoneMensile, 60);
  var canMesL = v(d.canoneMensileLettere, 120);
  var depImp  = vb(d.depositoImporto, 80);
  var depImpL = v(d.depositoImportoLettere, 140);
  var depMesi = v(d.depositoMesi, 30);
  var mesiDur = vb(d.duraMesi, 40);
  var mesiDurL= v(d.duraMesiLettere, 100);
  var dataDal = vb(fmtData(d.duraDal), 80);
  var dataAl  = vb(fmtData(d.duraAl), 80);
  var esigente= v(d.esigenzaTipo, 80);  // 'locatore' o 'conduttore'
  var esigenzaTesto = v(d.esigenzaMotivazione, 300);
  var conviventi = (d.conviventi && d.conviventi.trim() && d.conviventi.trim().toLowerCase() !== 'nessuno') ? d.conviventi.trim() : 'nessuno';
  var statoImm   = v(d.statoImmobile, 200);
  var modalAccesso = v(d.modalitaAccesso, 200);

  var html = '<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"/>';
  html += '<title>' + (d.nomeContratto || 'Contratto Tipo B') + '</title>';
  html += '<style>' + CSS_CONTRATTO + '</style></head><body>';
  html += '<button class="print-btn no-print" onclick="window.print()">🖨️ Stampa / Salva PDF</button>';
  html += '<div class="page">';

  // HEADER
  html += '<div class="hdr"><table><tr>';
  html += '<td>Associazione Sindacale Piccoli Proprietari Immobiliari (A.S.P.P.I.)</td>';
  html += '<td><b>ALLEGATO B - D.M. 16.01.2017</b></td>';
  html += '</tr></table></div>';

  html += '<p class="sp"> </p>';
  html += '<p class="ctr"><b>LOCAZIONE ABITATIVA DI NATURA TRANSITORIA</b></p>';
  html += '<p class="ctr"><i>(Legge 9 dicembre 1998, n. 431, articolo 5, comma 1)</i></p>';
  html += '<p class="sp"> </p>';

  // LOCATORI
  locs.forEach(function(l, i) {
    html += persona(l, 'Il/la Sig./Sig.ra', i, 'B');
  });
  html += '<p>di seguito denominato/a/i "locatore",</p>';
  html += '<p class="ctr">concede' + (locs.length > 1 ? '/concedono' : '') + ' in locazione</p>';

  // CONDUTTORI
  cons.forEach(function(c, i) {
    html += persona(c, i === 0 ? 'al/alla Sig./Sig.ra' : 'Sig./Sig.ra', i, 'B');
  });
  if (hasGarante) html += garante(gars[0], '5');
  html += '<p>che accetta' + (cons.length > 1 ? '/no' : '') + ', per sè e suoi/loro aventi causa, di seguito denominata/o/i "conduttore"</p>';

  // IMMOBILE
  html += bloccoImmobile(d, 'B');

  // ART 1
  html += '<p class="art">Articolo 1</p><p class="art-sub">(Durata)</p>';
  html += '<p>Il contratto è stipulato per la durata di <b>MESI ' + mesiDur +
    ' (' + mesiDurL + ')</b> (non meno di un mese e max 18 mesi), dal ' + dataDal +
    ' al ' + dataAl + ', allorché, fatto salvo quanto previsto dall\'articolo 2, cessa senza' +
    ' bisogno di alcuna disdetta.</p>';

  // ART 2
  var esigente = (d.esigenzaTipo && String(d.esigenzaTipo||'').trim()) ? d.esigenzaTipo.trim() : v('', 80);
  var esigenzaFrase;
  if (d.esigenzaMotivazione === 'altro_loc' || d.esigenzaMotivazione === 'altro_con') {
    esigenzaFrase = (d.esigenzaAltroTesto && String(d.esigenzaAltroTesto||'').trim()) ? d.esigenzaAltroTesto.trim() : v('', 300);
  } else {
    esigenzaFrase = (d.esigenzaMotivazione && String(d.esigenzaMotivazione||'').trim()) ? d.esigenzaMotivazione.trim() : v('', 300);
  }
  html += '<p class="art">Articolo 2</p>';
  html += '<p class="art-sub">(Esigenza del ' + esigente + ')</p>';
  html += '<p>Il ' + esigente + ', nel rispetto di quanto previsto dal decreto del Ministro delle' +
    ' infrastrutture e dei trasporti di concerto con il Ministro dell\'economia e delle finanze,' +
    ' emanato ai sensi dell\'articolo 4, comma 2, della legge n. 431/98 - di cui il presente tipo' +
    ' di contratto costituisce l\'Allegato B - e secondo quanto stabilito dall\'Accordo locale' +
    ' definito tra il Comune dell\'Aquila e ' + ACCORDO_B + ', dichiara la seguente esigenza che' +
    ' giustifica la transitorietà del contratto: ' + esigenzaFrase + '.</p>';

  // ART 3
  html += '<p class="art">Articolo 3</p><p class="art-sub">(Inadempimento delle modalità di stipula)</p>';
  html += '<p>Il presente contratto è ricondotto alla durata prevista dall\'art. 2 comma 1 della' +
    ' Legge 9 dicembre 1998, n. 431, in caso di inadempimento delle modalità di stipula previste' +
    ' dall\'art. 2, commi 1, 2, 3, 4, 5 e 6 del decreto dei Ministri delle infrastrutture e' +
    ' dell\'economia e delle finanze ex art. 4 comma 2 della legge 431/98.</p>';
  html += '<p>In ogni caso, ove il locatore abbia riacquistato la disponibilità dell\'alloggio' +
    ' alla scadenza dichiarando di volerlo adibire ad un uso determinato e non lo adibisca, senza' +
    ' giustificato motivo, nel termine di sei mesi dalla data in cui ha riacquistato la detta' +
    ' disponibilità, a tale uso, il conduttore ha diritto al ripristino del rapporto di locazione' +
    ' alle condizioni di cui all\'articolo 2, comma 1, della legge n. 431/98 o, in alternativa,' +
    ' ad un risarcimento in misura pari a trentasei mensilità dell\'ultimo canone di locazione' +
    ' corrisposto.</p>';

  // ART 4
  html += '<p class="art">Articolo 4</p><p class="art-sub">(Canone – Cedolare secca)</p>';
  html += '<p>Il canone di locazione, secondo quanto stabilito dall\'Accordo locale definito tra' +
    ' il Comune dell\'Aquila e ' + ACCORDO_B + ', è convenuto in' +
    ' <b>euro ' + canAnn + ' (' + canAnnL + '/00)</b>' +
    ' annuali o se inferiore all\'anno per il periodo della locazione, che il conduttore si' +
    ' obbliga a corrispondere nel domicilio del locatore ovvero a mezzo bonifico bancario in' +
    ' rate mensili eguali anticipate di <b>euro ' + canMes + ' (' + canMesL + '/00)</b> ciascuna,' +
    ' con scadenza il giorno 5 (cinque) di ciascun mese' + (d.canoneIBAN&&d.canoneIBAN.trim()?', da versare sul conto corrente bancario IBAN: <b>'+d.canoneIBAN.trim()+'</b>':'') + '. Il locatore dichiara di volersi avvalere' +
    ' della modalità di tassazione sui redditi da locazione prevista dal D.lgs. n. 23 del 14 marzo' +
    ' 2011 denominata "cedolare secca". Pertanto la registrazione fiscale di tale contratto non' +
    ' comporterà alcun pagamento di imposta di registro o imposta di bollo. Non verrà inoltre' +
    ' applicata negli anni di vigenza del contratto alcuna maggiorazione di canone a qualsiasi' +
    ' titolo compreso l\'aggiornamento ISTAT. Nel caso di revoca dell\'opzione per il predetto' +
    ' regime fiscale, il canone verrà aggiornato annualmente nella misura del 75% della variazione' +
    ' ISTAT dell\'indice dei prezzi al consumo per le famiglie di operai ed impiegati (indice FOI).</p>';

  // ART 5
  html += '<p class="art">Articolo 5</p><p class="art-sub">(Deposito cauzionale e altre forme di garanzia)</p>';
  html += '<p>A garanzia delle obbligazioni assunte con il presente contratto, il conduttore versa' +
    ' al locatore (che con la firma del contratto ne rilascia, in caso, quietanza) una somma pari' +
    ' ad <b>euro ' + depImp + ' (' + depImpL + '/00)</b>, pari a n° ' + depMesi +
    ' mensilità del canone, non imputabile in conto canoni e produttiva di interessi legali,' +
    ' riconosciuti al conduttore al termine della locazione. Il deposito cauzionale così costituito' +
    ' viene reso al termine della locazione, previa verifica sia dello stato dell\'unità immobiliare' +
    ' sia dell\'osservanza di ogni obbligazione contrattuale. <b>Eventuali altre forme di garanzia:</b> ';
  if (hasGarante) {
    var g = gars[0];
    var gNome = vb((g.cognome && g.nome) ? g.cognome + ' ' + g.nome : g.nome, 140);
    var gCond = v(g.cr2 || (cons[0] && (cons[0].cognome + ' ' + cons[0].nome)), 140);
    html += '<i>Il/la Sig./Sig.ra ' + gNome + '., si impegna solidalmente e senza condizione' +
      ' alcuna, per tutta la durata e per le obbligazioni assunte con il presente contratto dal' +
      ' conduttore Sig./Sig.ra ' + gCond + ' al pagamento del canone di locazione pari a ' +
      v(d.canoneMensile, 60) + ' Euro mensili, nonché, per al pagamento degli oneri accessori,' +
      ' interessi e penalità per il ritardato pagamento ed indennità di occupazione ed eventuale' +
      ' risarcimento dei danni all\'immobile, sia nell\'eventualità di rescissione e/o risoluzione' +
      ' del contratto, sia al momento della riconsegna dell\'immobile.</i>';
  } else {
    html += '<i>nessuna</i>';
  }
  html += '</p>';

  // ART 6
  html += '<p class="art">Articolo 6</p><p class="art-sub">(Oneri accessori)</p>';
  html += bloccoOneri(d, 'B');

  // ART 7
  html += '<p class="art">Articolo 7</p><p class="art-sub">(Spese di bollo e di registrazione)</p>';
  html += bloccoBollo();

  // ART 8
  html += '<p class="art">Articolo 8</p><p class="art-sub">(Pagamento)</p>';
  html += '<p>Il pagamento del canone o di quant\'altro dovuto anche per oneri accessori non può' +
    ' venire sospeso o ritardato da pretese o eccezioni del conduttore, quale ne sia il titolo.' +
    ' Il mancato puntuale pagamento, per qualsiasi causa, anche di una sola rata del canone,' +
    ' nonché di quant\'altro dovuto, ove di importo pari almeno ad una mensilità del canone,' +
    ' costituisce in mora il conduttore, fatto salvo quanto previsto dall\'articolo 55 della' +
    ' Legge 27 luglio 1978, n. 392.</p>';

  // ART 9
  html += '<p class="art">Articolo 9</p><p class="art-sub">(Uso)</p>';
  html += '<p>L\'immobile deve essere destinato esclusivamente ad uso di civile abitazione del' +
    ' conduttore e delle seguenti persone attualmente con lui conviventi: <i>' + conviventi + '</i>.' +
    ' Salvo espresso patto scritto contrario, è fatto divieto di sublocazione e di comodato sia' +
    ' totale sia parziale. Per la successione nel contratto si applica l\'articolo 6 della Legge' +
    ' n. 392/78, nel testo vigente a seguito della sentenza della Corte costituzionale n. 404/1988.</p>';

  // ART 10
  html += '<p class="art">Articolo 10</p><p class="art-sub">(Recesso del conduttore)</p>';
  html += '<p>E\' facoltà del conduttore recedere dal contratto per gravi motivi, previo avviso da' +
    ' recapitarsi tramite lettera raccomandata a.r. almeno tre mesi prima.</p>';

  // ART 11
  html += '<p class="art">Articolo 11</p><p class="art-sub">(Consegna)</p>';
  html += '<p>Il conduttore dichiara di aver attentamente visitato l\'unità immobiliare locatagli,' +
    ' di averla trovata adatta all\'uso convenuto e, pertanto, di prenderla in consegna ad ogni' +
    ' effetto con il ritiro delle chiavi, costituendosi da quel momento custode della stessa ad' +
    ' ogni effetto di legge. Il conduttore si impegna a riconsegnare l\'unità immobiliare nello' +
    ' stato in cui la ha ricevuta, salvo il deperimento d\'uso, pena il risarcimento del danno;' +
    ' si impegna, altresì, a rispettare le norme del regolamento dello stabile ove esistente,' +
    ' accusando in tal caso ricevuta dello stesso con la firma del presente contratto, così come' +
    ' si impegna ad osservare le deliberazioni dell\'assemblea dei condomini. È in ogni caso' +
    ' vietato al conduttore compiere atti e tenere comportamenti che possano recare molestia agli' +
    ' altri abitanti dello stabile. Le parti danno atto, in relazione allo stato dell\'unità' +
    ' immobiliare, ai sensi dell\'articolo 1590 del Codice civile di quanto segue: ' + statoImm + '.</p>';

  // ART 12
  html += '<p class="art">Articolo 12</p><p class="art-sub">(Modifiche e danni)</p>';
  html += '<p>Il conduttore non può apportare alcuna modifica, innovazione, miglioria o addizione' +
    ' ai locali locati ed alla loro destinazione, o agli impianti esistenti, senza il preventivo' +
    ' consenso scritto del locatore. Il conduttore esonera espressamente il locatore da ogni' +
    ' responsabilità per danni diretti o indiretti che possano derivargli da fatti dei dipendenti' +
    ' del locatore medesimo nonché per interruzioni incolpevoli dei servizi.</p>';

  // ART 13
  html += '<p class="art">Articolo 13</p><p class="art-sub">(Assemblee)</p>';
  html += '<p>Il conduttore ha diritto di voto, in luogo del proprietario dell\'unità immobiliare' +
    ' locatagli, nelle deliberazioni dell\'assemblea condominiale relative alle spese ed alle' +
    ' modalità di gestione dei servizi di riscaldamento e di condizionamento d\'aria. Ha inoltre' +
    ' diritto di intervenire, senza voto, sulle deliberazioni relative alla modificazione degli' +
    ' altri servizi comuni.</p>';
  html += '<p>Quanto stabilito in materia di riscaldamento e di condizionamento d\'aria si applica' +
    ' anche ove si tratti di edificio non in condominio. In tale caso (e con l\'osservanza, in' +
    ' quanto applicabili, delle disposizioni del codice civile sull\'assemblea dei condomini) i' +
    ' conduttori si riuniscono in apposita assemblea, convocata dalla proprietà o da almeno tre' +
    ' conduttori.</p>';

  // ART 14
  html += '<p class="art">Articolo 14</p><p class="art-sub">(Impianti - APE)</p>';
  html += '<p>Il conduttore -in caso d\'installazione sullo stabile di antenna televisiva' +
    ' centralizzata- si obbliga a servirsi unicamente dell\'impianto relativo, restando sin' +
    ' d\'ora il locatore, in caso di inosservanza, autorizzato a far rimuovere e demolire ogni' +
    ' antenna individuale a spese del conduttore, il quale nulla può pretendere a qualsiasi' +
    ' titolo, fatte salve le eccezioni di legge. Per quanto attiene all\'impianto termico autonomo,' +
    ' ove presente, ai sensi della normativa del D.Lgs n. 192/05, con particolare riferimento' +
    ' all\'art. 7 comma 1, il conduttore subentra per la durata della detenzione alla figura del' +
    ' proprietario nell\'onere di adempiere alle operazioni di controllo e di manutenzione. Il' +
    ' conduttore dichiara di aver ricevuto già in sede di trattative le informazioni ed in sede' +
    ' di stipula la documentazione, comprensiva dell\'attestato, in ordine all\'attestazione della' +
    ' prestazione energetica dell\'immobile.</p>';

  // ART 15
  html += '<p class="art">Articolo 15</p><p class="art-sub">(Accesso)</p>';
  html += bloccoAccesso(modalAccesso);

  // ART 16
  html += '<p class="art">Articolo 16</p>';
  html += '<p class="art-sub">(Commissione di negoziazione paritetica e conciliazione stragiudiziale)</p>';
  html += bloccoCommissione();

  // ART 17
  html += '<p class="art">Articolo 17</p><p class="art-sub">(Varie)</p>';
  html += bloccoVarie();

  // ART 18
  html += '<p class="art">Articolo 18</p><p class="art-sub">(Altre clausole)</p>';
  html += bloccoAltreClausole();

  // FIRME
  html += bloccoFirme(hasGarante, '5');

  // APPROVAZIONE
  html += '<p class="approv">Approvazione specifica</p>';
  html += '<p>A mente degli articoli 1341 e 1342 del Codice civile, le parti specificamente' +
    ' approvano i patti di cui agli articoli 2 <i>(Esigenza del ' + esigente + ')</i>,' +
    ' 3 <i>(Inadempimento delle modalità di stipula)</i>, 4 <i>(Canone – cedolare secca)</i>,' +
    ' 5 <i>(Deposito cauzionale e altre forme di garanzia)</i>, 6 <i>(Oneri accessori)</i>,' +
    ' 8 <i>(Pagamento)</i>, 9 <i>(Uso)</i>, 10 <i>(Recesso del conduttore)</i>,' +
    ' 11 <i>(Consegna)</i>, 12 <i>(Modifiche e danni)</i>, 14 <i>(Impianti)</i>,' +
    ' 15 <i>(Accesso)</i>, 16 <i>(Commissione di negoziazione paritetica e conciliazione' +
    ' stragiudiziale)</i>, 17 <i>(Varie)</i> e 18 <i>(Altre clausole)</i> del presente contratto.</p>'; 
  html += '<div class="frow" style="margin-top:8pt;"><div class="fcol"><p>Il locatore</p></div>';
  html += '<div class="fcol"><p>Il conduttore</p></div></div>';
  if (hasGarante) html += '<p>Il Garante di cui all\'art.5</p>';

  html += '</div></body></html>';
  return html;
}

// ══════════════════════════════════════════════════════════════
// TIPO C — Transitorio studenti
// ══════════════════════════════════════════════════════════════
function generaContratto_C(raw) {
  var d = prepDati(raw);
  var locs = d.locatori || [{}];
  var cons  = d.conduttori || [{}];

  var canAnn  = vb(d.canoneAnnuale, 80);
  var canAnnL = v(d.canoneAnnualeLettere, 140);
  var primaRata    = vb(d.primaRataImporto || d.canoneMensile, 60);
  var primaRataL   = v(d.primaRataLettere || d.canoneMensileLettere, 120);
  var rateSucc     = vb(d.rateSuccessiveImporto || d.canoneMensile, 60);
  var rateSuccL    = v(d.rateSuccessiveLettere || d.canoneMensileLettere, 120);
  var nRateSucc    = v(d.nRateSuccessive || '___', 30);
  var depImp  = vb(d.depositoImporto, 80);
  var depImpL = v(d.depositoImportoLettere, 140);
  var depMesi = v(d.depositoMesi, 30);
  var mesiDur = vb(d.duraMesi, 60);
  var dataDal = vb(fmtData(d.duraDal), 80);
  var dataAl  = vb(fmtData(d.duraAl), 80);
  var ateneo  = v(d.ateneo, 160);
  var facolta = v(d.facolta, 160);
  var mesiMax = v(d.mesiMax || '12', 30);
  var statoImm = v(d.statoImmobile, 200);
  var modalAccesso = v(d.modalitaAccesso, 200);

  var html = '<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"/>';
  html += '<title>' + (d.nomeContratto || 'Contratto Tipo C') + '</title>';
  html += '<style>' + CSS_CONTRATTO + '</style></head><body>';
  html += '<button class="print-btn no-print" onclick="window.print()">🖨️ Stampa / Salva PDF</button>';
  html += '<div class="page">';

  // HEADER
  html += '<div class="hdr"><table><tr>';
  html += '<td>Associazione Sindacale Piccoli Proprietari Immobiliari (A.S.P.P.I)</td>';
  html += '<td><b>ALLEGATO C - D.M. 16.01.2017</b></td>';
  html += '</tr></table></div>';

  html += '<p class="sp"> </p>';
  html += '<p class="ctr"><b>LOCAZIONE ABITATIVA DI NATURA TRANSITORIA STUDENTI</b></p>';
  html += '<p class="ctr"><i>(Legge 9 dicembre 1998, n. 431, articolo 5, comma 2)</i></p>';
  html += '<p class="sp"> </p>';

  // LOCATORI (Tipo C)
  locs.forEach(function(l, i) {
    var nome    = vb((l.cognome && l.nome) ? l.cognome.toUpperCase() + ' ' + l.nome.toUpperCase() : (l.nome || ''), 180);
    var luogo   = v(l.luogoNascita, 100);
    var data    = v(l.dataNascita, 80);
    var cf      = vb(l.cf, 160);
    var res     = v(l.comuneResidenza, 100);
    var via     = v(l.viaResidenza, 160);
    var docTipo = v(l.docTipo, 100);
    var docNum  = v(l.docNum, 100);
    var docEnte = v(l.docEnte, 120);
    var docRil  = v(l.docRilascio, 80);
    var docSca  = v(l.docScadenza, 80);
    html += '<p>La sig.' + (l.sesso==='F'?'ra':'') + ' ' + nome + ', nata/o a ' + luogo + ' il ' + data +
      ', C.F.: ' + cf + ', residente in ' + res + ', Via ' + via +
      ', identificato/a mediante ' + docTipo + ' n°' + docNum +
      ' rilasciata da ' + docEnte + ' il ' + docRil + ', scadente in data ' + docSca +
      ' in qualità di "<b>Locatore</b>".</p>';
  });

  html += '<p class="ctr">concede in locazione ai sig.ri</p>';

  // CONDUTTORI (Tipo C: formato diverso — nome tutto maiuscolo, "Conduttore" tra virgolette)
  cons.forEach(function(c, i) {
    var nome    = vb((c.cognome && c.nome) ? c.cognome.toUpperCase() + ' ' + c.nome.toUpperCase() : (c.nome || ''), 180);
    var luogo   = v(c.luogoNascita, 100);
    var data    = v(c.dataNascita, 80);
    var cf      = vb(c.cf, 160);
    var res     = v(c.comuneResidenza, 100);
    var via     = v(c.viaResidenza, 160);
    var docTipo = v(c.docTipo, 100);
    var docNum  = v(c.docNum, 100);
    var docEnte = v(c.docEnte, 120);
    var docRil  = v(c.docRilascio, 80);
    var docSca  = v(c.docScadenza, 80);
    html += '<p>' + nome + ', nato/a a ' + luogo + ' il ' + data +
      ', <b>C.F. ' + cf + '</b>, residente a ' + res + ' in via ' + via +
      ', identificato/a mediante ' + docTipo + ' n° ' + docNum +
      ' rilasciata dal ' + docEnte + ' in data ' + docRil +
      ', scadente in data ' + docSca + ',il quale accetta per sè ed i suoi aventi causa,' +
      ' di seguito denominato "<b>Conduttore</b>"</p>';
  });

  // IMMOBILE (Tipo C)
  var comune  = vb(d.comune || '', 100);
  var via2    = vb(d.via || '', 160);
  var nciv2   = v(d.nCivico || '', 40);
  var piano   = v(d.piano || '', 60);
  var scala2  = v(d.scala || '', 40);
  var interno2= v(d.interno || '', 40);
  var vani    = v(d.compCamere || '', 40);
  var acc2    = (d.elemAccessori && String(d.elemAccessori||'').trim()) ? d.elemAccessori.trim() : 'nessuno';
  var arred   = d.ammobiliata === 'si' ? 'ammobiliata' : 'non ammobiliata';
  var sezione = v(d.catSezione, 40);
  var foglio  = vb(d.catFoglio, 40);
  var plla    = vb(d.catParticella, 40);
  var sub     = vb(d.catSubalterno, 40);
  var cat     = vb(d.catCategoria, 40);
  var rendita = vb(d.catRendita, 60);
  var classe  = vb(d.apeClasse, 30);
  var tabProp = v(d.tabMillProp, 60);
  var tabRisc2= v(d.tabMillRisc, 60);
  var pertTxtC = 'nessuna';
  if (d.pertinenze && d.pertinenze.length) {
    var tipiC = d.pertinenze.map(function(p){ return p.tipo||''; }).filter(Boolean);
    if (tipiC.length) pertTxtC = tipiC.join(', ');
  }

  var introImm = (d.tipoLocazione === 'porzione') ? 'porzione di unità immobiliare' : 'l\'unità immobiliare';
  html += '<p class="ctr">' + introImm + '</p>';
  html += '<p>posta in ' + comune + ', via ' + via2 + ' n°' + nciv2 +
    ', piano ' + piano + ', scala ' + scala2 + ', int. ' + interno2 +
    ', composta di n. ' + vani + ' vani e servizi, dotata dei seguenti elementi accessori: ' + acc2 +
    ', e delle seguenti pertinenze: ' + pertTxtC +
    ', ' + arred + ' come da separato elenco sottoscritto dalle parti.</p>';
  html += '<p>a) estremi catastali identificativi dell\'unità immobiliare: <b>Sezione ' + sezione +
    '. Foglio ' + foglio + '. p.lla ' + plla + '. sub ' + sub +
    '. cat. ' + cat + '. rendita Euro ' + rendita + ';</b></p>';
  if (d.pertinenze && d.pertinenze.length) {
    d.pertinenze.forEach(function(p, i) {
      var ptipo = v(p.tipo, 80); var psez = v(p.catSezione, 40);
      var pfog  = vb(p.catFoglio, 40); var ppar = vb(p.catParticella, 40);
      var psub  = vb(p.catSubalterno, 40); var pcat = vb(p.catCategoria, 40);
      var prend = vb(p.catRendita, 60);
      html += '<p>a.' + (i+1) + ') pertinenza – ' + ptipo +
        ': <b>Sezione ' + psez + '. Foglio ' + pfog + '. p.lla ' + ppar +
        '. sub ' + psub + '. cat. ' + pcat + '. rendita Euro ' + prend + ';</b></p>';
    });
  }
  html += '<p>b) prestazione energetica: <b>classe ' + classe + '</b>' +
    ' (come da informazioni ricevute dal conduttore già in sede di trattative)' +
    (d.apeNumero && d.apeNumero.trim() ? ', attestato n. <b>' + v(d.apeNumero,120) + '</b>' : '') + ';</p>';
  html += '<p>c) sicurezza impianti: rispondenti alle normative in materia di sicurezza vigenti' +
    ' all\'epoca in cui gli stessi sono stati realizzati, che il conduttore accetta nello stato' +
    ' in cui si trovano;</p>';
  html += '<p>d) tabelle millesimali: proprietà ' + tabProp +
    ' riscaldamento ' + tabRisc2 + ' acqua secondo i consumi.</p>';
  html += '<p>La locazione è regolata dalle pattuizioni seguenti.</p>';

  // ART 1
  html += '<p class="art">Articolo 1</p><p class="art-sub">(Durata)</p>';
  html += '<p>Il contratto è stipulato per la durata di <b>' + mesiDur + '</b> dal ' + dataDal +
    ' al ' + dataAl + ', alla prima scadenza il contratto si rinnova automaticamente per uguale' +
    ' periodo se il conduttore non comunica al locatore disdetta almeno un mese e non oltre tre' +
    ' mesi prima della data di scadenza del contratto.</p>';

  // ART 2
  html += '<p class="art">Articolo 2</p><p class="art-sub">(Natura Transitoria)</p>';
  html += '<p>Secondo quanto previsto dall\'Accordo territoriale stipulato ai sensi dell\'articolo' +
    ' 5, comma 3, della legge n. 431/98, tra il Comune dell\'Aquila e ' + ACCORDO_B + ',' +
    ' le parti concordano che la presente locazione ha natura transitoria in quanto il conduttore' +
    ' espressamente ha l\'esigenza di abitare l\'immobile per un periodo non eccedente i mesi ' +
    mesiMax + ' frequentando il Corso di Studi presso ' + ateneo +
    (facolta ? ' – ' + facolta : '') + '.</p>';

  // ART 3
  html += '<p class="art">Articolo 3</p><p class="art-sub">(Canone)</p>';
  html += '<p>Il canone annuo di locazione, secondo quanto stabilito dall\'Accordo locale definito' +
    ' tra il Comune dell\'Aquila e ' + ACCORDO_B + ', è convenuto in' +
    ' <b>euro ' + canAnn + ' (' + canAnnL + '/00)</b>, che il conduttore si obbliga a' +
    ' corrispondere nel domicilio del locatore ovvero a mezzo di bonifico bancario, sul conto' +
    ' corrente indicato dal locatore, in n. 1 rata anticipata di' +
    ' <b>euro ' + primaRata + ' (' + primaRataL + '/00)</b> e le seguenti ' + nRateSucc +
    ' rate da <b>euro ' + rateSucc + ' (' + rateSuccL + '/00)</b> ciascuna, alle seguenti' +
    ' date: entro il giorno 5 (cinque) di ogni mese' + (d.canoneIBAN&&d.canoneIBAN.trim()?', da versare sul conto corrente bancario IBAN: <b>'+d.canoneIBAN.trim()+'</b>':'') + '.</p>';

  // ART 4
  html += '<p class="art">Articolo 4</p><p class="art-sub">(Deposito cauzionale e altre forme di garanzia)</p>';
  html += '<p>A garanzia delle obbligazioni assunte con il presente contratto, il conduttore versa' +
    ' al locatore (che con la firma del contratto ne rilascia, in caso, quietanza) una somma pari' +
    ' ad <b>euro ' + depImp + ' (' + depImpL + '/00)</b>, pari a n°' + depMesi +
    ' mensilità del canone, non imputabile in conto canoni e produttiva di interessi legali,' +
    ' riconosciuti al conduttore al termine della locazione. Il deposito cauzionale così costituito' +
    ' viene reso al termine della locazione, previa verifica sia dello stato dell\'unità immobiliare' +
    ' sia dell\'osservanza di ogni obbligazione contrattuale.' +
    ' <b>Eventuali altre forme di garanzia:</b> <i>nessuna</i>.</p>';

  // ART 5
  html += '<p class="art">Articolo 5</p><p class="art-sub">(Oneri accessori)</p>';
  html += bloccoOneri(d, 'C');

  // ART 6
  html += '<p class="art">Articolo 6</p><p class="art-sub">(Spese di bollo e di registrazione)</p>';
  html += bloccoBollo();

  // ART 7
  html += '<p class="art">Articolo 7</p><p class="art-sub">(Pagamento)</p>';
  html += '<p>Il pagamento del canone o di quant\'altro dovuto anche per oneri accessori non può' +
    ' venire sospeso o ritardato da pretese o eccezioni del conduttore, quale ne sia il titolo.' +
    ' Il mancato puntuale pagamento, per qualsiasi causa, anche di una sola rata del canone,' +
    ' nonché di quant\'altro dovuto, ove di importo pari almeno ad una mensilità del canone,' +
    ' costituisce in mora il conduttore, fatto salvo quanto previsto dall\'articolo 55 della' +
    ' Legge 27 luglio 1978, n. 392.</p>';

  // ART 8
  html += '<p class="art">Articolo 8</p><p class="art-sub">(Uso)</p>';
  html += '<p>L\'immobile deve essere destinato esclusivamente ad uso di civile abitazione del' +
    ' conduttore. Salvo espresso patto scritto contrario, è fatto divieto di sublocazione e di' +
    ' comodato sia totale sia parziale.</p>';

  // ART 9
  html += '<p class="art">Articolo 9</p><p class="art-sub">(Recesso del conduttore)</p>';
  html += '<p>E\' facoltà del conduttore recedere dal contratto per gravi motivi, previo avviso' +
    ' da recapitarsi tramite lettera raccomandata a.r. almeno tre mesi prima. Tale facoltà è' +
    ' consentita anche ad uno o più dei conduttori firmatari ed in tal caso, dal mese' +
    ' dell\'intervenuto recesso, la locazione prosegue nei confronti degli altri, ferma restando' +
    ' la solidarietà del conduttore recedente per i pregressi periodi di conduzione.</p>';
  html += '<p>Le modalità di cessione del contratto sono così concordate tra le parti: previo' +
    ' accordo scritto tra cedente, cessionario e sottoscritto per approvazione dal Locatore.</p>';

  // ART 10
  html += '<p class="art">Articolo 10</p><p class="art-sub">(Consegna)</p>';
  html += '<p>Il conduttore dichiara di aver attentamente visitato l\'unità immobiliare locatagli,' +
    ' di averla trovata adatta all\'uso convenuto e, pertanto, di prenderla in consegna ad ogni' +
    ' effetto con il ritiro delle chiavi, costituendosi da quel momento custode della stessa ad' +
    ' ogni effetto di legge. Il conduttore si impegna a riconsegnare l\'unità immobiliare nello' +
    ' stato in cui la ha ricevuta, salvo il deperimento d\'uso, pena il risarcimento del danno;' +
    ' si impegna, altresì, a rispettare le norme del regolamento dello stabile ove esistente,' +
    ' accusando in tal caso ricevuta dello stesso con la firma del presente contratto, così come' +
    ' si impegna ad osservare le deliberazioni dell\'assemblea dei condomini. È in ogni caso' +
    ' vietato al conduttore compiere atti e tenere comportamenti che possano recare molestia agli' +
    ' altri abitanti dello stabile. Le parti danno atto, in relazione allo stato dell\'unità' +
    ' immobiliare, ai sensi dell\'articolo 1590 del Codice civile di quanto segue: ' + statoImm + '.</p>';

  // ART 11
  html += '<p class="art">Articolo 11</p><p class="art-sub">(Modifiche e danni)</p>';
  html += '<p>Il conduttore non può apportare alcuna modifica, innovazione, miglioria o addizione' +
    ' ai locali locati ed alla loro destinazione, o agli impianti esistenti, senza il preventivo' +
    ' consenso scritto del locatore. Il conduttore esonera espressamente il locatore da ogni' +
    ' responsabilità per danni diretti o indiretti che possano derivargli da fatti dei dipendenti' +
    ' del locatore medesimo nonché per interruzioni incolpevoli dei servizi.</p>';

  // ART 12
  html += '<p class="art">Articolo 12</p><p class="art-sub">(Assemblee)</p>';
  html += '<p>Il conduttore ha diritto di voto, in luogo del proprietario dell\'unità immobiliare' +
    ' locatagli, nelle deliberazioni dell\'assemblea condominiale relative alle spese ed alle' +
    ' modalità di gestione dei servizi di riscaldamento e di condizionamento d\'aria. Ha inoltre' +
    ' diritto di intervenire, senza voto, sulle deliberazioni relative alla modificazione degli' +
    ' altri servizi comuni.</p>';
  html += '<p>Quanto stabilito in materia di riscaldamento e di condizionamento d\'aria si applica' +
    ' anche ove si tratti di edificio non in condominio. In tale caso (e con l\'osservanza, in' +
    ' quanto applicabili, delle disposizioni del codice civile sull\'assemblea dei condomini) i' +
    ' conduttori si riuniscono in apposita assemblea, convocata dalla proprietà o da almeno tre' +
    ' conduttori.</p>';

  // ART 13
  html += '<p class="art">Articolo 13</p><p class="art-sub">(Impianti - APE)</p>';
  html += '<p>Il conduttore -in caso d\'installazione sullo stabile di antenna televisiva' +
    ' centralizzata- si obbliga a servirsi unicamente dell\'impianto relativo, restando sin' +
    ' d\'ora il locatore, in caso di inosservanza, autorizzato a far rimuovere e demolire ogni' +
    ' antenna individuale a spese del conduttore, il quale nulla può pretendere a qualsiasi' +
    ' titolo, fatte salve le eccezioni di legge. Per quanto attiene all\'impianto termico autonomo,' +
    ' ove presente, ai sensi della normativa del D.Lgs n. 192/05, con particolare riferimento' +
    ' all\'art. 7 comma 1, il conduttore subentra per la durata della detenzione alla figura del' +
    ' proprietario nell\'onere di adempiere alle operazioni di controllo e di manutenzione. Il' +
    ' conduttore dichiara di aver ricevuto già in sede di trattative le informazioni ed in sede' +
    ' di stipula la documentazione, comprensiva dell\'attestato, in ordine all\'attestazione della' +
    ' prestazione energetica dell\'immobile.</p>';

  // ART 14
  var modAccC = (d.modalitaAccesso && String(d.modalitaAccesso||'').trim()) ? d.modalitaAccesso.trim() : v('', 180);
  html += '<p class="art">Articolo 14</p><p class="art-sub">(Accesso)</p>';
  html += '<p>Il conduttore deve consentire l\'accesso all\'unità immobiliare al locatore, al suo' +
    ' amministratore nonché ai loro incaricati ove gli stessi ne abbiano - motivandola - ragione.' +
    ' Nel caso in cui il locatore intenda vendere l\'unità immobiliare ovvero locarla a seguito' +
    ' di recesso anticipato del conduttore o di disdetta del locatore stesso, questi deve' +
    ' consentirne la visita una volta la settimana, per almeno due ore, con esclusione dei giorni' +
    ' festivi, con le seguenti modalità: ' + modAccC + '.</p>';

  // ART 15
  html += '<p class="art">Articolo 15</p>';
  html += '<p class="art-sub">(Commissione di negoziazione paritetica e conciliazione stragiudiziale)</p>';
  html += bloccoCommissione();

  // ART 16
  html += '<p class="art">Articolo 16</p><p class="art-sub">(Varie)</p>';
  html += bloccoVarie();

  // FIRME
  html += '<p style="margin-top:10pt;">Letto, approvato e sottoscritto in L\'Aquila lì, ' + v('', 80) + '</p>';
  html += '<div class="frow"><div class="fcol"><p>Il locatore</p></div><div class="fcol"><p>Il conduttore</p></div></div>';

  // APPROVAZIONE
  html += '<p class="approv">Approvazione specifica</p>';
  html += '<p>A mente degli articoli 1341 e 1342 del Codice civile, le parti specificamente' +
    ' approvano i patti di cui agli articoli 2 <i>(Natura transitoria)</i>,' +
    ' 3 <i>(Canone)</i>, 4 <i>(Deposito cauzionale e altre forme di garanzia)</i>,' +
    ' 5 <i>(Oneri accessori)</i>, 7 <i>(pagamento)</i>, 8 <i>(Uso)</i>,' +
    ' 9 <i>(Recesso del conduttore)</i>, 10 <i>(Consegna)</i>, 11 <i>(Modifiche e danni)</i>,' +
    ' 13 <i>(Impianti)</i>, 14 <i>(Accesso)</i>,' +
    ' 15 <i>(Commissione di negoziazione paritetica e conciliazione stragiudiziale)</i>' +
    ' e 16 <i>(Varie)</i> del presente contratto.</p>';
  html += '<div class="frow" style="margin-top:8pt;"><div class="fcol"><p>Il locatore</p></div>';
  html += '<div class="fcol"><p>Il conduttore</p></div></div>';

  html += '</div></body></html>';
  return html;
}

// ── DISPATCHER ────────────────────────────────────────────────
function generaContratto(dati, tipo) {
  if (tipo === 'Tipo A') return generaContratto_A(dati);
  if (tipo === 'Tipo B') return generaContratto_B(dati);
  if (tipo === 'Tipo C') return generaContratto_C(dati);
  return '<p>Tipo contratto non riconosciuto: ' + tipo + '</p>';
}

// Esporta per uso nel portale
if (typeof window !== 'undefined') window.generaContratto = generaContratto;
if (typeof module !== 'undefined') module.exports = { generaContratto: generaContratto };
