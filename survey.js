/* EDP Reports - Site Survey (project report). Structure follows the Enerdeal/EDP "Site Survey" Excel sheet. */
(() => {
  'use strict';
  const { t, esc, today, uid, toast } = EDP;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const KEY = 'edp-survey';
  const LI = () => ({ en: 0, nl: 1, fr: 2 }[I18N.lang] ?? 0);

  /* ---------- Texts for this report: [EN, NL, FR] ---------- */
  const L = {
    tabInfo: ['Project', 'Project', 'Projet'], tabGeneral: ['General', 'Algemeen', 'Général'], tabLog: ['Logistics & safety', 'Logistiek & veiligheid', 'Logistique & sécurité'],
    tabAerial: ['Aerial view', 'Luchtfoto', 'Vue aérienne'], tabRoof: ['Roof', 'Dak', 'Toiture'], tabAc: ['AC design', 'AC-ontwerp', 'Conception AC'], tabNotes: ['Notes', 'Notities', 'Notes'],
    title: ['SITE SURVEY', 'SITE SURVEY', 'VISITE DE SITE'],
    project: ['Project', 'Project', 'Projet'], client: ['Client', 'Klant', 'Client'], address: ['Site address', 'Adres site', 'Adresse du site'], date: ['Date', 'Datum', 'Date'],
    clientContacts: ['Client contact persons', 'Contactpersonen klant', 'Contacts client'], cp1: ['Contact person 1', 'Contactpersoon 1', 'Contact 1'], cp2: ['Contact person 2', 'Contactpersoon 2', 'Contact 2'], cp3: ['Contact person 3', 'Contactpersoon 3', 'Contact 3'],
    edpContacts: ['EDP contact persons', 'Contactpersonen EDP', 'Contacts EDP'], ed1: ['Contact person 1', 'Contactpersoon 1', 'Contact 1'], ed2: ['Contact person 2', 'Contactpersoon 2', 'Contact 2'],
    kwp: ['System size (kWp)', 'Systeemgrootte (kWp)', 'Puissance (kWc)'], surveyor: ['Survey done by', 'Survey uitgevoerd door', 'Visite réalisée par'],
    genInfo: ['General information', 'Algemene informatie', 'Informations générales'],
    hours: ['Working hours EDP team', 'Werkuren EDP-team', 'Heures de travail équipe EDP'], hoursWe: ['Working hours EDP team (weekend)', 'Werkuren EDP-team (weekend)', 'Heures de travail équipe EDP (week-end)'],
    siteAccess: ['Accessibility to site during installation', 'Toegang tot de site tijdens installatie', 'Accès au site pendant l’installation'],
    toilets: ['Toilets for workers', 'Toiletten voor werknemers', 'Toilettes pour les ouvriers'], lunch: ['Lunch room for workers', 'Refter voor werknemers', 'Réfectoire pour les ouvriers'],
    roofInst: ['Accessibility to the roof during installation', 'Toegang tot het dak tijdens installatie', 'Accès à la toiture pendant l’installation'],
    roofMaint: ['Accessibility to the roof during maintenance', 'Toegang tot het dak tijdens onderhoud', 'Accès à la toiture pendant la maintenance'],
    collProt: ['Collective protection', 'Collectieve bescherming', 'Protection collective'], remarks: ['Remarks', 'Opmerkingen', 'Remarques'],
    docs: ['Available documentation', 'Beschikbare documentatie', 'Documentation disponible'],
    docInvoice: ['Invoice for electrical consumption', 'Factuur elektriciteitsverbruik', 'Facture de consommation électrique'], docDrawings: ['Building drawings (dwg, pdf)', 'Bouwplannen (dwg, pdf)', 'Plans du bâtiment (dwg, pdf)'],
    docStability: ['Stability study', 'Stabiliteitsstudie', 'Étude de stabilité'], docNet: ['Net study', 'Netstudie', 'Étude de réseau'], docSchematics: ['Electrical schematics (dwg, pdf)', 'Elektrische schema’s (dwg, pdf)', 'Schémas électriques (dwg, pdf)'],
    docCert: ['Certification RGIE/AREI', 'Keuring AREI/RGIE', 'Certification RGIE/AREI'],
    logIntro: ['The overview plan indicates the location of the following (use the numbered markers ① on the map):', 'Het overzichtsplan duidt de locatie aan van het volgende (gebruik de genummerde markeringen ① op de kaart):', 'Le plan indique l’emplacement des éléments suivants (utilisez les repères numérotés ① sur la carte) :'],
    lRoofAccess: ['Roof access', 'Toegang dak', 'Accès toiture'], lLunch: ['Lunch room + toilets', 'Refter + toiletten', 'Réfectoire + toilettes'], lDelivery: ['Delivery zone', 'Leveringszone', 'Zone de livraison'],
    lVertical: ['Vertical transport', 'Verticaal transport', 'Transport vertical'], lContainer: ['Material container', 'Materiaalcontainer', 'Conteneur matériel'], lOutdoor: ['Outdoor storage', 'Opslag buiten', 'Stockage extérieur'],
    lRssIncl: ['RSS inclined roof', 'RSS hellend dak', 'RSS toiture inclinée'], lRssFlat: ['RSS flat roof', 'RSS plat dak', 'RSS toiture plate'], lHeras: ['Heras fencing', 'Heras-hekken', 'Clôtures Heras'],
    lWaste: ['Waste container (2 pcs – 6 m × 2.4 m)', 'Afvalcontainer (2 st – 6 m × 2,4 m)', 'Conteneur à déchets (2 pcs – 6 m × 2,4 m)'],
    gutter: ['Gutter', 'Dakgoot', 'Gouttière'], gutterMat: ['Gutter material', 'Materiaal dakgoot', 'Matériau gouttière'], gutterX: ['Gutter dimension x', 'Afmeting dakgoot x', 'Dimension gouttière x'],
    gutterY: ['Gutter dimension y', 'Afmeting dakgoot y', 'Dimension gouttière y'], gutterDist: ['Distance between gutter brackets', 'Afstand tussen goothaken', 'Distance entre crochets'],
    aerIntro: ['The overview plan indicates the location of the following (use the numbered markers ① on the map):', 'Het overzichtsplan duidt de locatie aan van het volgende (gebruik de genummerde markeringen ① op de kaart):', 'Le plan indique l’emplacement des éléments suivants (utilisez les repères numérotés ① sur la carte) :'],
    aHead: ['Head cabin', 'Hoofdcabine', 'Cabine de tête'], aHv: ['High/medium voltage cabinet', 'Hoog-/middenspanningscabine', 'Cabine haute/moyenne tension'], aConn: ['Cabin connection PV', 'Cabine aansluiting PV', 'Cabine raccordement PV'],
    aBidir: ['Bidirectional counter', 'Bidirectionele teller', 'Compteur bidirectionnel'], aElec: ['Electrical cabinet (TGBT, ALSB)', 'Elektrische kast (TGBT, ALSB)', 'Armoire électrique (TGBT, ALSB)'],
    aDecoup: ['Decoupling cabinet', 'Ontkoppelingskast', 'Armoire de découplage'], aGreen: ['Green counter', 'Groene meter', 'Compteur vert'], aInv: ['Inverters', 'Omvormers', 'Onduleurs'], aMod: ['Modules', 'Modules', 'Modules'],
    aEv: ['EV charging station', 'Laadpaal EV', 'Borne de recharge VE'], aEss: ['ESS battery storage', 'ESS-batterijopslag', 'Stockage batterie ESS'],
    roofType: ['Roof type', 'Type dak', 'Type de toiture'], inclination: ['Inclination (°)', 'Helling (°)', 'Inclinaison (°)'], terrain: ['Terrain category', 'Terreincategorie', 'Catégorie de terrain'],
    roofHeight: ['Roof height (m)', 'Dakhoogte (m)', 'Hauteur de toiture (m)'], flatRoof: ['Flat roof', 'Plat dak', 'Toiture plate'], slopedRoof: ['Sloped roof', 'Hellend dak', 'Toiture inclinée'],
    beamSpacing: ['Beam spacing', 'Afstand liggers', 'Entraxe des poutres'], beamOrient: ['Beam orientation', 'Oriëntatie liggers', 'Orientation des poutres'], roofMat: ['Roof material', 'Dakmateriaal', 'Matériau de toiture'],
    roofShape: ['Roof shape', 'Dakvorm', 'Forme de toiture'], roofing: ['Roofing type', 'Type dakbedekking', 'Type de couverture'], trap: ['Trapezoidal sheet metal roof details', 'Details trapeziumplaat', 'Détails tôle trapézoïdale'],
    trapA: ['Material thickness (a)', 'Materiaaldikte (a)', 'Épaisseur matériau (a)'], trapB: ['Bead spacing (b)', 'Afstand ribben (b)', 'Entraxe nervures (b)'], trapC: ['Width high beading (c)', 'Breedte hoge rib (c)', 'Largeur nervure haute (c)'], trapD: ['Panel thickness (d)', 'Paneeldikte (d)', 'Épaisseur panneau (d)'],
    acIntro: ['Fill in the AC design directly on the schema: tap it to write with the pencil or type text (zoom in with two fingers).', 'Vul het AC-ontwerp rechtstreeks in op het schema: tik erop om met het potlood te schrijven of tekst te typen (inzoomen met twee vingers).', 'Complétez la conception AC directement sur le schéma : touchez-le pour écrire au crayon ou taper du texte (zoom à deux doigts).'],
    acSchema: ['AC schema', 'AC-schema', 'Schéma AC'], acEdit: ['✏️ Fill in / draw on schema', '✏️ Schema invullen / tekenen', '✏️ Compléter / dessiner le schéma'], acReset: ['Start from empty schema', 'Opnieuw met leeg schema', 'Recommencer avec un schéma vide'],
    mainTransfo: ['Main transformer', 'Hoofdtransformator', 'Transformateur principal'], connType: ['Connection type', 'Aansluitingstype', 'Type de raccordement'],
    gprs: ['GPRS signal (in decoupling cabinet area)', 'GPRS-signaal (bij ontkoppelingskast)', 'Signal GPRS (zone armoire de découplage)'], ethernet: ['Ethernet connection available', 'Ethernetaansluiting beschikbaar', 'Connexion Ethernet disponible'],
    transfoPower: ['Transformer power (kVA)', 'Vermogen transfo (kVA)', 'Puissance transfo (kVA)'], transfoCool: ['Cooling', 'Koeling', 'Refroidissement'], transfoV: ['Voltage primary / secondary (V)', 'Spanning primair / secundair (V)', 'Tension primaire / secondaire (V)'],
    ucc: ['Ucc (%)', 'Ucc (%)', 'Ucc (%)'], mainBreaker: ['Main breaker TGBT (poles / A)', 'Hoofdschakelaar TGBT (polen / A)', 'Disjoncteur principal TGBT (pôles / A)'],
    eanNr: ['Cabin nr / EAN', 'Cabinenr. / EAN', 'N° cabine / EAN'], invInfo: ['Inverters (number × brand / type / kVA)', 'Omvormers (aantal × merk / type / kVA)', 'Onduleurs (nombre × marque / type / kVA)'],
    cableInfo: ['Cable info (length, installation way, type, section)', 'Kabelinfo (lengte, plaatsing, type, sectie)', 'Infos câble (longueur, pose, type, section)'],
    notes: ['Notes', 'Notities', 'Notes'], photos: ['Photos', 'Foto’s', 'Photos'], overview: ['Overview plan', 'Overzichtsplan', 'Plan d’ensemble'],
    addMap: ['🗺️ Satellite map', '🗺️ Satellietkaart', '🗺️ Carte satellite'], addPlan: ['🖼️ Image / screenshot + draw', '🖼️ Afbeelding / screenshot + tekenen', '🖼️ Image / capture + dessin'],
    mapNote: ['Tip: you can also use a Google Maps / Google Earth screenshot via “Image / screenshot”.', 'Tip: je kan ook een screenshot van Google Maps / Google Earth gebruiken via “Afbeelding / screenshot”.', 'Astuce : vous pouvez aussi utiliser une capture Google Maps / Google Earth via « Image / capture ».'],
    caption: ['Description', 'Beschrijving', 'Description'], confirmNew: ['Start a new site survey? All entered data and photos are cleared.', 'Nieuwe site survey starten? Alle ingevulde gegevens en foto’s worden gewist.', 'Démarrer une nouvelle visite ? Toutes les données et photos sont effacées.'],
    loading: ['Loading…', 'Laden…', 'Chargement…'], none: ['—', '—', '—'], note: ['Detail', 'Detail', 'Détail'],
    o_key: ['Key', 'Sleutel', 'Clé'], o_badge: ['Badge', 'Badge', 'Badge'], o_other: ['Other', 'Andere', 'Autre'], o_avail: ['Available', 'Beschikbaar', 'Disponible'], o_provide: ['To be provided', 'Te voorzien', 'À prévoir'],
    o_yes: ['Yes', 'Ja', 'Oui'], o_no: ['No', 'Nee', 'Non'], o_crane: ['Crane (17 × 9 m)', 'Kraan (17 × 9 m)', 'Grue (17 × 9 m)'], o_manitou: ['Manitou', 'Manitou', 'Manitou'],
    o_existing: ['Existing', 'Bestaand', 'Existant'], o_new: ['New', 'Nieuw', 'Nouveau'], o_flat: ['Flat roof', 'Plat dak', 'Toiture plate'], o_sloped: ['Sloped roof', 'Hellend dak', 'Toiture inclinée'],
    o_t0: ['0 – coastal area, open to sea', '0 – kustgebied, open zee', '0 – zone côtière, mer'], o_t1: ['I – open land, hardly any obstacles', 'I – open land, nauwelijks obstakels', 'I – terrain dégagé, peu d’obstacles'],
    o_t2: ['II – cultivated land, few obstacles', 'II – landbouwgrond, weinig obstakels', 'II – terres cultivées, quelques obstacles'], o_t3: ['III – suburb, commercial area, forest', 'III – voorstad, bedrijventerrein, bos', 'III – banlieue, zone commerciale, forêt'],
    o_t4: ['IV – city centre', 'IV – stadscentrum', 'IV – centre-ville'], o_bitum: ['Bituminous', 'Bitumen', 'Bitume'], o_pvc: ['PVC', 'PVC', 'PVC'], o_epdm: ['EPDM', 'EPDM', 'EPDM'], o_tpo: ['TPO', 'TPO', 'TPO'],
    o_ridge: ['Ridge roof', 'Zadeldak', 'Toit à deux pans'], o_hip: ['Hip roof', 'Schilddak', 'Toit à quatre pans'], o_shed: ['Shed roof', 'Lessenaarsdak', 'Toit en appentis'],
    o_steel: ['Steel', 'Staal', 'Acier'], o_alu: ['Aluminium', 'Aluminium', 'Aluminium'], o_corr: ['Corrugated roof', 'Golfplaat', 'Tôle ondulée'], o_trap: ['Trapezoidal sheet metal', 'Trapeziumplaat', 'Tôle trapézoïdale'],
    o_sandw: ['Sandwich roof', 'Sandwichpaneel', 'Panneau sandwich'], o_tt: ['TT', 'TT', 'TT'], o_tnc: ['TN-C', 'TN-C', 'TN-C'], o_tns: ['TN-S', 'TN-S', 'TN-S'], o_fast: ['Fast', 'Snel', 'Rapide'], o_slow: ['Slow', 'Traag', 'Lent'],
    o_oil: ['Oil', 'Olie', 'Huile'], o_dry: ['Dry', 'Droog', 'Sec']
  };
  const tx = k => (L[k] ? (L[k][LI()] || L[k][0]) : t(k));

  /* ---------- Form definition ---------- */
  const AVAIL = ['avail', 'provide'], YN = ['yes', 'no'];
  const SECTIONS = [
    { id: 'info', tab: 'tabInfo', items: [
      { k: 'project', type: 'text', req: true }, { k: 'client', type: 'text' }, { k: 'address', type: 'text' }, { k: 'date', type: 'date' }, { k: 'surveyor', type: 'text' }, { k: 'kwp', type: 'text', mode: 'decimal' },
      { head: 'clientContacts' }, { k: 'cp1', type: 'text' }, { k: 'cp2', type: 'text' }, { k: 'cp3', type: 'text' },
      { head: 'edpContacts' }, { k: 'ed1', type: 'text' }, { k: 'ed2', type: 'text' }] },
    { id: 'general', tab: 'tabGeneral', items: [
      { head: 'genInfo' }, { k: 'hours', type: 'text' }, { k: 'hoursWe', type: 'text' },
      { k: 'siteAccess', type: 'choice', opts: ['key', 'badge', 'other'], note: true }, { k: 'toilets', type: 'choice', opts: AVAIL }, { k: 'lunch', type: 'choice', opts: AVAIL },
      { k: 'roofInst', type: 'choice', opts: AVAIL, note: true }, { k: 'roofMaint', type: 'choice', opts: AVAIL, note: true }, { k: 'collProt', type: 'choice', opts: AVAIL, note: true },
      { k: 'genRemarks', label: 'remarks', type: 'textarea' },
      { head: 'docs' }, { k: 'docInvoice', type: 'choice', opts: YN }, { k: 'docDrawings', type: 'choice', opts: YN }, { k: 'docStability', type: 'choice', opts: YN }, { k: 'docNet', type: 'choice', opts: YN },
      { k: 'docSchematics', type: 'choice', opts: YN }, { k: 'docCert', type: 'choice', opts: YN }, { k: 'docRemarks', label: 'remarks', type: 'textarea' }] },
    { id: 'log', tab: 'tabLog', items: [
      { overview: 'logMaps', intro: 'logIntro' },
      { k: 'lRoofAccess', type: 'note', n: 1 }, { k: 'lLunch', type: 'note', n: 2 }, { k: 'lDelivery', type: 'note', n: 3 }, { k: 'lVertical', type: 'choice', opts: ['crane', 'manitou'], note: true, n: 4 },
      { k: 'lContainer', type: 'note', n: 5 }, { k: 'lOutdoor', type: 'note', n: 6 }, { k: 'lRssIncl', type: 'note', n: 7 }, { k: 'lRssFlat', type: 'note', n: 8 }, { k: 'lHeras', type: 'note', n: 9 }, { k: 'lWaste', type: 'note', n: 10 },
      { head: 'gutter', img: 'assets/survey-gutter.png' }, { k: 'gutterMat', type: 'text' }, { k: 'gutterX', type: 'text' }, { k: 'gutterY', type: 'text' }, { k: 'gutterDist', type: 'text' },
      { photos: 'logPhotos' }, { k: 'logRemarks', label: 'remarks', type: 'textarea' }] },
    { id: 'aerial', tab: 'tabAerial', items: [
      { overview: 'aerMaps', intro: 'aerIntro' },
      { k: 'aHead', type: 'choice', opts: ['existing', 'new'], note: true, n: 1 }, { k: 'aHv', type: 'note', n: 2 }, { k: 'aConn', type: 'choice', opts: ['existing', 'new'], note: true, n: 3 },
      { k: 'aBidir', type: 'note', n: 4 }, { k: 'aElec', type: 'note', n: 5 }, { k: 'aDecoup', type: 'note', n: 6 }, { k: 'aGreen', type: 'note', n: 7 }, { k: 'aInv', type: 'note', n: 8 }, { k: 'aMod', type: 'note', n: 9 },
      { k: 'aEv', type: 'note', n: 10 }, { k: 'aEss', type: 'note', n: 11 },
      { photos: 'aerPhotos' }, { k: 'aerRemarks', label: 'remarks', type: 'textarea' }] },
    { id: 'roof', tab: 'tabRoof', items: [
      { k: 'roofType', type: 'choice', opts: ['flat', 'sloped'] }, { k: 'inclination', type: 'text', mode: 'decimal', show: s => s.roofType === 'sloped' },
      { k: 'terrain', type: 'choice', opts: ['t0', 't1', 't2', 't3', 't4'], col: true }, { k: 'roofHeight', type: 'text', mode: 'decimal' },
      { head: 'flatRoof', show: s => s.roofType !== 'sloped' }, { k: 'beamSpacing', type: 'text', show: s => s.roofType !== 'sloped' }, { k: 'beamOrient', type: 'text', show: s => s.roofType !== 'sloped' },
      { k: 'flatMat', label: 'roofMat', type: 'choice', opts: ['bitum', 'pvc', 'epdm', 'tpo', 'other'], note: true, show: s => s.roofType !== 'sloped' },
      { head: 'slopedRoof', show: s => s.roofType !== 'flat' }, { k: 'roofShape', type: 'choice', opts: ['ridge', 'hip', 'shed'], imgs: { ridge: 'assets/survey-roof-ridge.png', hip: 'assets/survey-roof-hip.png', shed: 'assets/survey-roof-shed.png' }, show: s => s.roofType !== 'flat' },
      { k: 'slopedMat', label: 'roofMat', type: 'choice', opts: ['steel', 'alu', 'other'], note: true, show: s => s.roofType !== 'flat' },
      { k: 'roofing', type: 'choice', opts: ['corr', 'trap', 'sandw'], show: s => s.roofType !== 'flat' },
      { head: 'trap', img: 'assets/survey-trapezoid.png', show: s => s.roofing === 'trap' }, { k: 'trapA', type: 'text', show: s => s.roofing === 'trap' }, { k: 'trapB', type: 'text', show: s => s.roofing === 'trap' },
      { k: 'trapC', type: 'text', show: s => s.roofing === 'trap' }, { k: 'trapD', type: 'text', show: s => s.roofing === 'trap' },
      { photos: 'roofPhotos' }, { k: 'roofRemarks', label: 'remarks', type: 'textarea' }] },
    { id: 'ac', tab: 'tabAc', items: [
      { schema: true },
      { photos: 'acPhotos' }, { k: 'acRemarks', label: 'remarks', type: 'textarea' }] },
    { id: 'notes', tab: 'tabNotes', items: [{ k: 'notesText', label: 'notes', type: 'textarea', rows: 8 }, { photos: 'notePhotos' }] }
  ];

  /* ---------- State (IndexedDB: room for many photos) ---------- */
  let state = null, logo = null, acTemplate = null, me = null;
  const blank = () => ({ id: uid(), v: { date: today() }, c: {}, n: {}, logMaps: [], aerMaps: [], logPhotos: [], aerPhotos: [], roofPhotos: [], acPhotos: [], notePhotos: [], schema: null });
  let saveTimer = null;
  const save = () => { clearTimeout(saveTimer); saveTimer = setTimeout(() => EDP.bigSave(KEY, state), 250); };
  const val = k => state.v[k] || '';
  const flat = () => Object.assign({}, state.v, state.c);

  /* ---------- Rendering ---------- */
  let active = 'info';
  function renderTabs() {
    $('#tabs').innerHTML = SECTIONS.map(s => `<button class="tab ${s.id === active ? 'active' : ''}" data-tab="${s.id}">${esc(tx(s.tab))}</button>`).join('');
    $$('#tabs .tab').forEach(b => b.onclick = () => { active = b.dataset.tab; renderTabs(); renderPanel(); window.scrollTo(0, 0); });
  }
  const label = it => tx(it.label || it.k);
  function itemHtml(it) {
    if (it.show && !it.show(flat())) return '';
    if (it.head) return `<h3 class="sv-head">${esc(tx(it.head))}</h3>${it.img ? `<img class="sv-illu" src="${it.img}" alt="">` : ''}`;
    if (it.overview) return `<div class="sv-overview" data-ov="${it.overview}"><h3 class="sv-head">${esc(tx('overview'))}</h3><p class="muted small">${esc(tx(it.intro))}</p>
        <div class="photo-actions"><button type="button" class="btn compact" data-map="${it.overview}">${esc(tx('addMap'))}</button><label class="btn secondary compact"><span>${esc(tx('addPlan'))}</span><input type="file" accept="image/*" data-plan="${it.overview}" hidden></label></div>
        <p class="muted small">${esc(tx('mapNote'))}</p>${mapsHtml(it.overview)}</div>`;
    if (it.photos) return `<div class="sv-photos" data-ph="${it.photos}"><h3 class="sv-head">${esc(tx('photos'))}</h3>${EDP.photoPicker()}<div class="photos">${state[it.photos].map((p, i) => `<div class="photo" data-i="${i}"><img src="${p.data}" alt=""><button type="button" class="ed" title="${esc(t('drawEdit'))}">✏️</button><button type="button" class="x" title="${esc(t('removePhoto'))}">×</button><input value="${esc(p.caption || '')}" placeholder="${esc(tx('caption'))}"></div>`).join('')}</div></div>`;
    if (it.schema) return `<div class="sv-schema"><p class="muted">${esc(tx('acIntro'))}</p><div class="schema-box" id="schemaBox"><img src="${state.schema || 'assets/survey-ac-schema.jpg'}" alt="${esc(tx('acSchema'))}"></div>
        <div class="photo-actions"><button type="button" class="btn" id="schemaEdit">${esc(tx('acEdit'))}</button>${state.schema ? `<button type="button" class="btn secondary compact" id="schemaReset">${esc(tx('acReset'))}</button>` : ''}</div></div>`;
    const num = it.n ? `<span class="sv-num">${it.n}</span>` : '';
    const lab = `<span class="sv-label">${num}${esc(label(it))}${it.req ? ' *' : ''}</span>`;
    if (it.type === 'text' || it.type === 'date') return `<label class="sv-field">${lab}<input type="${it.type}" ${it.mode ? `inputmode="${it.mode}"` : ''} data-v="${it.k}" ${it.req ? 'id="projectField" required' : ''} value="${esc(val(it.k))}"></label>`;
    if (it.type === 'textarea') return `<label class="sv-field wide">${lab}<textarea rows="${it.rows || 3}" data-v="${it.k}">${esc(val(it.k))}</textarea></label>`;
    if (it.type === 'note') return `<label class="sv-field wide">${lab}<input type="text" data-v="${it.k}" value="${esc(val(it.k))}" placeholder="${esc(tx('note'))}"></label>`;
    if (it.type === 'choice') {
      const cur = state.c[it.k] || '';
      const opts = it.opts.map(o => `<button type="button" class="chip ${cur === o ? 'on' : ''}" data-c="${it.k}" data-o="${o}">${it.imgs ? `<img src="${it.imgs[o]}" alt="">` : ''}${esc(tx('o_' + o))}</button>`).join('');
      return `<div class="sv-field wide">${lab}<div class="chips ${it.col ? 'col' : ''}">${opts}</div>${it.note ? `<input type="text" class="sv-note" data-n="${it.k}" value="${esc(state.n[it.k] || '')}" placeholder="${esc(tx('note'))}">` : ''}</div>`;
    }
    return '';
  }
  function mapsHtml(key) {
    return `<div class="maps">${state[key].map((p, i) => `<div class="map-item" data-i="${i}"><div class="pc-img"><img src="${p.data}" alt=""><button type="button" class="ed" title="${esc(t('drawEdit'))}">✏️</button></div><button type="button" class="x" title="${esc(t('removePhoto'))}">×</button><input value="${esc(p.caption || '')}" placeholder="${esc(tx('caption'))}"></div>`).join('')}</div>`;
  }
  function renderPanel() {
    const sec = SECTIONS.find(s => s.id === active);
    $('#panels').innerHTML = `<section class="card sv"><h2>${esc(tx(sec.tab))}</h2><div class="sv-grid">${sec.items.map(itemHtml).join('')}</div></section>`;
    bind();
  }
  function bind() {
    $$('[data-v]').forEach(el => el.oninput = el.onchange = () => { state.v[el.dataset.v] = el.value; el.classList.remove('invalid'); save(); });
    $$('[data-n]').forEach(el => el.oninput = () => { state.n[el.dataset.n] = el.value; save(); });
    $$('[data-c]').forEach(b => b.onclick = () => {
      const k = b.dataset.c; state.c[k] = state.c[k] === b.dataset.o ? '' : b.dataset.o; save();
      const y = window.scrollY; renderPanel(); window.scrollTo(0, y);
    });
    $$('.sv-photos').forEach(box => {
      const arr = state[box.dataset.ph];
      EDP.bindPicker(box, async added => { arr.push(...added.map(p => ({ data: p.data, caption: '' }))); save(); keep(renderPanel); });
      box.querySelectorAll('.photo').forEach(ph => {
        const i = Number(ph.dataset.i);
        ph.querySelector('.x').onclick = () => { arr.splice(i, 1); save(); keep(renderPanel); };
        ph.querySelector('.ed').onclick = () => EDP.editPhoto(arr[i].data, d => { arr[i].data = d; save(); keep(renderPanel); });
        ph.querySelector('input').oninput = e => { arr[i].caption = e.target.value; save(); };
      });
    });
    $$('.sv-overview').forEach(box => {
      const arr = state[box.dataset.ov];
      box.querySelector('[data-map]').onclick = async () => {
        const r = await EDPTools.mapCapture({ query: val('address'), lat: state.geo && state.geo.lat, lon: state.geo && state.geo.lon });
        if (r) { arr.push({ data: r.data, caption: '' }); state.geo = { lat: r.lat, lon: r.lon }; save(); keep(renderPanel); }
      };
      box.querySelector('[data-plan]').onchange = async e => {
        const f = [...e.target.files]; e.target.value = ''; if (!f.length) return;
        const [p] = await EDP.readPhotos(f.slice(0, 1)); if (!p) return;
        const d = await EDPTools.annotate(p.data, { tool: 'num', hint: t('mapDrawHint') });
        arr.push({ data: d || p.data, caption: '' }); save(); keep(renderPanel);
      };
      box.querySelectorAll('.map-item').forEach(mi => {
        const i = Number(mi.dataset.i);
        mi.querySelector('.x').onclick = () => { arr.splice(i, 1); save(); keep(renderPanel); };
        mi.querySelector('.ed').onclick = () => EDP.editPhoto(arr[i].data, d => { arr[i].data = d; save(); keep(renderPanel); });
        mi.querySelector('input').oninput = e => { arr[i].caption = e.target.value; save(); };
      });
    });
    const se = $('#schemaEdit');
    if (se) {
      const edit = async () => {
        /* keep the separate texts/lines so they can still be moved or changed later */
        const editable = !state.schema || Array.isArray(state.schemaOps); let newOps = null;
        const d = await EDPTools.annotate(editable ? 'assets/survey-ac-schema.jpg' : state.schema, { max: 2400, tool: 'pen', form: true, ops: editable ? state.schemaOps : null, keepOps: o => { newOps = o; } });
        if (d) { state.schema = d; state.schemaOps = editable ? newOps : null; save(); keep(renderPanel); }
      };
      se.onclick = edit; $('#schemaBox').onclick = edit;
      const sr = $('#schemaReset'); if (sr) sr.onclick = () => { if (confirm(t('drawClearConfirm'))) { state.schema = null; state.schemaOps = null; save(); keep(renderPanel); } };
    }
  }
  const keep = fn => { const y = window.scrollY; fn(); window.scrollTo(0, y); };

  /* ---------- PDF ---------- */
  function pdfBlob() {
    const title = tx('title'), doc = new TinyPDF({ title: 'Site Survey' });
    const C = { navy: '#272e3b', teal: '#14a9bb', ink: '#17212b', muted: '#5f6c78', line: '#d9e1e7' }, M = 15, W = 180;
    let y = 0;
    const page = () => { EDP.pdfHeader(doc, title + (val('project') ? ' – ' + val('project') : ''), logo); y = 34; };
    const ensure = h => { if (y + h > 278) { doc.addPage(); page(); } };
    const heading = (s, need = 30) => { ensure(need); y += 2; doc.rect(M, y - 5, W, 8, '#eef2f5'); doc.text(s.toUpperCase(), M + 3, y + .5, 10.5, 'bold', C.navy); y += 9; };
    const sub = s => { ensure(14); doc.text(s, M, y, 9.5, 'bold', C.teal); y += 6; };
    const row = (k, v, n) => {
      const lines = doc.wrap(v || '—', 108, 9); ensure(Math.min(lines.length * 4 + 4, 60));
      const kl = doc.wrap((n ? n + ') ' : '') + k, 66, 8); kl.forEach((ln, i) => doc.text(ln, M, y + i * 3.6, 8, 'bold', C.muted));
      lines.forEach((ln, i) => { ensure(5); doc.text(ln, M + 70, y + i * 4, 9, 'normal', C.ink); });
      y += Math.max(kl.length * 3.6, lines.length * 4) + 2.5;
      doc.line(M, y - 1.4, M + W, y - 1.4, C.line, .1);
    };
    const img = (data, maxH, cap) => { const j = EDP.jpegSync(data); if (!j) return; ensure(maxH + 8); try { y += doc.addJpegFit(j, M, y, W, maxH) + 2; } catch (e) {} if (cap) { doc.text(cap, M, y + 2, 8, 'normal', C.muted); y += 5; } y += 3; };
    page();
    SECTIONS.forEach(sec => {
      const first = sec.items[0]; heading(tx(sec.tab), (first.overview && state[first.overview].length) || first.schema ? 150 : 30);
      sec.items.forEach(it => {
        const s = flat();
        if (it.show && !it.show(s)) return;
        if (it.head) { sub(tx(it.head)); return; }
        if (it.overview) { state[it.overview].forEach(p => img(p.data, 150, p.caption)); return; }
        if (it.photos) { const a = state[it.photos]; if (a.length) { sub(tx('photos')); a.forEach(p => img(p.data, 80, p.caption)); } return; }
        if (it.schema) { img(state.schema || acTemplate, 175, state.schema ? '' : tx('acSchema')); return; }
        let v = '';
        if (it.type === 'choice') { v = state.c[it.k] ? tx('o_' + state.c[it.k]) : ''; if (it.note && state.n[it.k]) v = (v ? v + ' – ' : '') + state.n[it.k]; }
        else if (it.type === 'date' && val(it.k)) v = new Date(val(it.k)).toLocaleDateString(I18N.lang);
        else v = val(it.k);
        row(label(it), v, it.n);
      });
      y += 3;
    });
    EDP.pdfFooter(doc);
    return doc.output();
  }
  const pdfName = () => EDP.safeName(`Site_Survey_${val('project') || today()}.pdf`);
  async function makePdf() {
    if (!val('project').trim()) {
      toast(t('projectRequired'), 3500); active = 'info'; renderTabs(); renderPanel();
      const f = $('#projectField'); if (f) { f.classList.add('invalid'); f.focus(); } return null;
    }
    /* make sure every image is a JPEG for the PDF */
    const all = [...state.logMaps, ...state.aerMaps, ...state.logPhotos, ...state.aerPhotos, ...state.roofPhotos, ...state.acPhotos, ...state.notePhotos].map(p => p.data);
    if (state.schema) all.push(state.schema);
    await Promise.all(all.map(d => EDP.ensureJpeg(d)));
    try { return pdfBlob(); } catch (e) { console.error(e); toast(t('pdfFailed')); return null; }
  }
  $('#pdfBtn').onclick = async () => { const b = await makePdf(); if (b) EDP.download(b, pdfName()); };
  $('#shareBtn').onclick = async () => { const b = await makePdf(); if (b) EDP.deliver(b, pdfName(), 'Site Survey').catch(e => { if (e && e.name !== 'AbortError') EDP.download(b, pdfName()); else toast(t('sharingCancelled')); }); };
  $('#resetBtn').onclick = () => { if (!confirm(tx('confirmNew'))) return; state = blank(); if (me && me.full_name) state.v.surveyor = me.full_name; save(); active = 'info'; renderTabs(); renderPanel(); };

  function renderAll() { renderTabs(); renderPanel(); }
  I18N.onChange(renderAll);
  EDP.initShell();
  $('#panels').innerHTML = `<p class="muted">${esc(tx('loading'))}</p>`;
  EDP.imageData('assets/edp-logo.jpg').then(d => { logo = d; });
  EDP.imageData('assets/survey-ac-schema.jpg').then(d => { acTemplate = d; });
  (async () => {
    state = Object.assign(blank(), (await EDP.bigLoad(KEY)) || {});
    renderAll();
    EDPAuth.require().then(p => { me = p; if (p && p.full_name && !state.v.surveyor) { state.v.surveyor = p.full_name; save(); if (active === 'info') keep(renderPanel); } });
  })();
})();
