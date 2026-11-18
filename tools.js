/* Outils Japon Malin : simulateur JR Pass, détaxe, vols depuis La Réunion, taxes de séjour, liens d'affiliation.
   Données vérifiées le 18 novembre 2026 (sources : JR Group / JR Central / Ekitan, Japan Tourism Agency & JNTO, Air Austral, villes de Tokyo et Kyoto). */
(function(){
  var CSS = '#jtWrap{position:fixed;inset:0;z-index:100003;background:#0f1115;display:none;flex-direction:column;font-family:"Segoe UI",Arial,sans-serif;color:#fff}#jtWrap.on{display:flex}' +
    '#jtTop{display:flex;align-items:center;justify-content:space-between;padding:max(12px,env(safe-area-inset-top)) 16px 10px;font-weight:800;font-size:17px;gap:10px}#jtX{background:#ffffff1f;border:0;color:#fff;border-radius:999px;padding:8px 14px;font-weight:700;font-size:14px;flex:none}' +
    '#jtBody{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;padding:0 16px calc(24px + env(safe-area-inset-bottom));font-size:15px;line-height:1.5}' +
    '#jtBody h4{color:#f0955a;margin:18px 0 6px;font-size:16px}#jtBody p{margin:6px 0}#jtBody .card{background:#1a1d24;border:1px solid #ffffff22;border-radius:14px;padding:12px 14px;margin:10px 0}' +
    '#jtBody .small{font-size:12.5px;opacity:.7}#jtBody .step{display:flex;gap:12px;margin:12px 0}#jtBody .step b.n{flex:none;width:28px;height:28px;border-radius:50%;background:#d35400;display:flex;align-items:center;justify-content:center;font-size:14px}' +
    '#jtBody table{width:100%;border-collapse:collapse;margin:8px 0}#jtBody td,#jtBody th{padding:7px 6px;border-bottom:1px solid #ffffff22;text-align:left;font-size:14px}#jtBody th{color:#f0955a}' +
    '#jtBody label{display:block;font-size:13px;opacity:.8;margin:10px 0 4px}#jtBody input,#jtBody select{width:100%;padding:11px;border-radius:10px;border:1px solid #ffffff33;background:#242424;color:#fff;font-size:16px}' +
    '#jtBody .row{display:flex;align-items:center;gap:10px;margin:8px 0}#jtBody .row span{flex:1}#jtBody .row select{width:76px;flex:none}' +
    '#jtBody .res{border-radius:14px;padding:14px;margin:14px 0;font-weight:700;font-size:16px}#jtBody .ok{background:#12361f;border:1px solid #2e8b57}#jtBody .ko{background:#3a1717;border:1px solid #c0392b}' +
    '#jtBody a.btn{display:block;text-align:center;text-decoration:none;color:#fff;font-weight:700;border-radius:999px;padding:12px;margin:10px 0;background:linear-gradient(135deg,#d35400,#f0955a)}';
  var wrap, title, body;
  function build(){
    if(wrap) return;
    var s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s);
    wrap = document.createElement('div'); wrap.id = 'jtWrap';
    wrap.innerHTML = '<div id="jtTop"><span id="jtTitle"></span><button id="jtX" type="button">Fermer ✕</button></div><div id="jtBody"></div>';
    document.body.appendChild(wrap); title = wrap.querySelector('#jtTitle'); body = wrap.querySelector('#jtBody');
    wrap.querySelector('#jtX').addEventListener('click', close);
  }
  function close(){ wrap.classList.remove('on'); document.documentElement.style.overflow = ''; }
  function rate(){ try{ var r = parseFloat(localStorage.getItem('tm-jpy-rate')); if(r > 50 && r < 500) return r; }catch(e){} return 175; }
  function yen(n){ return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ¥'; }
  function eur(n){ return '≈ ' + Math.round(n / rate()).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €'; }

  /* ---------------- Simulateur JR Pass ---------------- */
  var TRIPS = [
    ['Tokyo ↔ Kyoto', 14300], ['Tokyo ↔ Osaka (Shin-Osaka)', 14700], ['Kyoto → Hiroshima', 11100],
    ['Osaka (Shin-Osaka) → Hiroshima', 10700], ['Tokyo → Hiroshima', 19700]
  ];
  var PASS = { official: { 7: 50000, 14: 80000, 21: 100000 }, agency: { 7: 53000, 14: 84000, 21: 105000 } };
  function jrpass(){
    body.oninput = body.onchange = null;
    title.textContent = '🚄 Simulateur JR Pass';
    var h = '<p>Coche tes trajets longue distance : l’appli compare le total des billets à l’unité au prix du pass.</p>' +
      '<div class="card"><label>Durée du pass</label><select id="jpDur"><option value="7">7 jours</option><option value="14">14 jours</option><option value="21">21 jours</option></select>' +
      '<label>Où l’acheter ?</label><select id="jpSrc"><option value="official">Site officiel JR (50 000 / 80 000 / 100 000 ¥)</option><option value="agency">Revendeur agréé depuis le 1er oct. 2026 (53 000 / 84 000 / 105 000 ¥)</option></select></div>' +
      '<h4>Mes trajets en Shinkansen (aller simple)</h4><div class="card">';
    TRIPS.forEach(function(t, i){ h += '<div class="row"><span>' + t[0] + '<br><small class="small">≈ ' + yen(t[1]) + ' en Nozomi, place réservée</small></span><select data-i="' + i + '"><option>0</option><option>1</option><option>2</option><option>3</option><option>4</option></select></div>'; });
    h += '</div><label>Autres trajets JR à ajouter (en ¥ : aéroport, Nara, Miyajima, Hakone…)</label><input id="jpOther" type="number" inputmode="numeric" placeholder="0">' +
      '<div id="jpRes"></div>' +
      '<div class="card small">Prix indicatifs arrondis (billet plein tarif, place réservée, train Nozomi), relevés en novembre 2026 : ils varient de quelques centaines de yens selon la saison. ' +
      'Le JR Pass ne couvre pas les Nozomi ni les Mizuho : avec le pass tu prends Hikari ou Kodama (un peu plus lents), ou tu paies un supplément (environ 4 960 ¥ Tokyo – Kyoto ou Osaka, 6 500 ¥ Tokyo – Hiroshima). ' +
      'Le pass est réservé aux visiteurs étrangers et ne couvre ni les métros ni les compagnies privées. Les prix du pass viennent de JR Group (avril 2026).</div>';
    body.innerHTML = h;
    function calc(){
      var dur = body.querySelector('#jpDur').value, src = body.querySelector('#jpSrc').value, pass = PASS[src][dur], tot = 0;
      Array.prototype.forEach.call(body.querySelectorAll('select[data-i]'), function(s){ tot += TRIPS[+s.getAttribute('data-i')][1] * parseInt(s.value, 10); });
      tot += parseInt(body.querySelector('#jpOther').value || '0', 10) || 0;
      var d = tot - pass, r = body.querySelector('#jpRes');
      if(tot === 0){ r.innerHTML = ''; return; }
      if(d > 0) r.innerHTML = '<div class="res ok">✅ Le pass est rentable : tu économises environ ' + yen(d) + ' (' + eur(d) + ').<br><span class="small">Billets à l’unité : ' + yen(tot) + ' · pass : ' + yen(pass) + '</span></div>';
      else r.innerHTML = '<div class="res ko">❌ Pas rentable : le pass te coûterait ' + yen(-d) + ' (' + eur(-d) + ') de plus.<br><span class="small">Billets à l’unité : ' + yen(tot) + ' · pass : ' + yen(pass) + '. Achète les billets au fur et à mesure.</span></div>';
    }
    body.oninput = calc; body.onchange = calc; calc();
  }

  /* ---------------- Détaxe ---------------- */
  function detaxe(){
    title.textContent = '🛍️ Détaxe : mode d’emploi';
    body.innerHTML = '<p>Depuis le <b>1er novembre 2026</b>, tu paies le prix toutes taxes comprises en magasin, puis tu te fais rembourser la taxe de consommation (10 %) <b>au moment de quitter le Japon</b>.</p>' +
      '<div class="step"><b class="n">1</b><div><b>Au magasin</b><br>Choisis un magasin « Tax-free ». Il faut au moins <b>5 000 ¥ d’achats avant taxe</b> dans le même magasin le même jour. Montre ton passeport à la caisse.</div></div>' +
      '<div class="step"><b class="n">2</b><div><b>Garde tout ensemble</b><br>Reçus, articles et passeport jusqu’au départ. Les produits consommables n’ont plus besoin d’être scellés, mais ceux que tu utilises ou manges au Japon ne sont pas remboursés.</div></div>' +
      '<div class="step"><b class="n">3</b><div><b>À l’aéroport, avant l’enregistrement des bagages</b><br>Va à la borne « tax-free » du hall des départs internationaux, <b>dans les 90 jours</b> suivant l’achat. Garde les achats avec toi : une valise enregistrée ne peut plus être rouverte. Dans les grands aéroports (Narita, Haneda, Kansai, Chubu, Fukuoka, New Chitose, Naha), tu peux commencer sur Visit Japan Web.</div></div>' +
      '<div class="step"><b class="n">4</b><div><b>Feu vert ou rouge</b><br>Vert : c’est terminé. Rouge : présente tes achats au contrôle de la douane.</div></div>' +
      '<div class="step"><b class="n">5</b><div><b>Remboursement</b><br>La somme correspondant à la taxe t’est reversée une fois la sortie des articles confirmée. Je n’ai pas trouvé de source officielle indiquant le moyen exact (espèces, carte) ni les frais éventuels : demande-le à la caisse du magasin.</div></div>' +
      '<h4>Pièges à éviter</h4><div class="card">• Chaque reçu est traité séparément : si un seul article manque, aucun article de ce reçu n’est remboursé.<br>• Ne termine pas la démarche au dernier moment : rien ne t’est dû si tu rates ton vol à cause de la file.<br>• Si les articles ne sortent pas du Japon, tu peux devoir rembourser la taxe, avec des pénalités.<br>• Les premiers mois du nouveau système, prévois de l’attente.</div>' +
      '<div class="small">Sources : Japan Tourism Agency (MLIT), JNTO, National Tax Agency. Vérifie les règles sur le site de l’Agence du tourisme japonaise avant de partir.</div>' +
      '<a class="btn" target="_blank" rel="noopener" href="https://www.vjw.digital.go.jp/">Visit Japan Web (site officiel)</a>';
  }

  /* ---------------- Vols depuis La Réunion ---------------- */
  function vols(){
    title.textContent = '✈️ Vols depuis La Réunion';
    body.innerHTML = '<div class="card"><b>Option 1 : via Bangkok</b><br>Air Austral relie La Réunion à Bangkok en vol direct : départ vers 20 h, arrivée vers 6 h 55 le lendemain (environ 8 h), 2 à 3 vols par semaine selon la saison. Ensuite, un vol Bangkok – Tokyo ou Osaka d’environ 6 h 30. Compte <b>21 à 28 heures</b> au total avec l’escale.</div>' +
      '<div class="card"><b>Option 2 : via Paris</b><br>Réunion – Paris (environ 11 h en direct), puis Paris – Tokyo ou Osaka (environ 14 h). Plus long, mais Paris – Japon propose plus de départs et de compagnies.</div>' +
      '<h4>Prix repérés (18 novembre 2026)</h4><div class="card">Réunion – Tokyo via Bangkok : environ <b>1 300 à 1 420 € l’aller-retour</b> sur les comparateurs, pour des départs de novembre à février. Pour les vacances scolaires, compte nettement plus.<br>Paris – Tokyo : à partir d’environ 630 € hors vacances et jusqu’à plus de 1 000 € en haute saison.<br><span class="small">Indicatif : les prix changent chaque jour.</span></div>' +
      '<h4>Conseils malins</h4><div class="card">• Compare « Réunion – Bangkok – Japon » et « Réunion – Paris – Japon », puis prends le moins cher.<br>• Avec deux billets séparés, ton bagage n’est pas enregistré jusqu’au bout : prévois une escale confortable.<br>• Pense au vol « open jaw » : arrivée à Tokyo, retour depuis Osaka.</div>' +
      '<a class="btn" target="_blank" rel="noopener sponsored" href="https://fr.trip.com/?Allianceid=9852508&SID=327644129&trip_sub3=D19106369&locale=fr-fr">Comparer les vols (Trip.com)</a>' +
      '<a class="btn" target="_blank" rel="noopener" href="https://www.air-austral.com/">Air Austral (vols directs Bangkok)</a>';
  }

  /* ---------------- Taxes de séjour ---------------- */
  function tokyoTax(p){ return p >= 15000 ? 200 : p >= 10000 ? 100 : 0; }
  function kyotoTax(p){ return p >= 100000 ? 10000 : p >= 50000 ? 4000 : p >= 20000 ? 1000 : p >= 6000 ? 400 : 200; }
  function taxes(){
    title.textContent = '🏨 Taxes de séjour';
    body.innerHTML = '<p>La taxe de séjour se paie <b>à l’hôtel</b> (parfois déjà incluse par le site de réservation), par personne et par nuit. Elle dépend du prix de la chambre <b>hors taxe de consommation</b>, divisé par le nombre de personnes.</p>' +
      '<h4>Tokyo (jusqu’au 31 mars 2027)</h4><table><tr><th>Prix / pers. / nuit</th><th>Taxe</th></tr><tr><td>moins de 10 000 ¥</td><td>0</td></tr><tr><td>10 000 à 14 999 ¥</td><td>100 ¥</td></tr><tr><td>15 000 ¥ et plus</td><td>200 ¥</td></tr></table>' +
      '<div class="small">Annoncé : à partir d’avril 2027, exonération sous 13 000 ¥ par personne et par nuit, puis 3 % du prix au-delà. À vérifier avant ton départ.</div>' +
      '<h4>Kyoto (depuis le 1er mars 2026)</h4><table><tr><th>Prix / pers. / nuit</th><th>Taxe</th></tr><tr><td>moins de 6 000 ¥</td><td>200 ¥</td></tr><tr><td>6 000 à 19 999 ¥</td><td>400 ¥</td></tr><tr><td>20 000 à 49 999 ¥</td><td>1 000 ¥</td></tr><tr><td>50 000 à 99 999 ¥</td><td>4 000 ¥</td></tr><tr><td>100 000 ¥ et plus</td><td>10 000 ¥</td></tr></table>' +
      '<p class="small">Osaka a aussi une taxe de quelques centaines de yens au maximum (rien sous 5 000 ¥ par personne et par nuit).</p>' +
      '<h4>Calcule la tienne</h4><div class="card"><label>Prix de la chambre par nuit (¥, hors taxe de consommation)</label><input id="txP" type="number" inputmode="numeric" placeholder="ex. 14000"><label>Personnes</label><input id="txN" type="number" inputmode="numeric" value="2"><label>Nuits</label><input id="txD" type="number" inputmode="numeric" value="3"><div id="txR" style="margin-top:10px"></div></div>' +
      '<div class="small">Sources : Tokyo Metropolitan Government, Ville de Kyoto, vérifiées en novembre 2026.</div>';
    function calc(){
      var P = parseFloat(body.querySelector('#txP').value) || 0, N = Math.max(1, parseInt(body.querySelector('#txN').value, 10) || 1), D = Math.max(1, parseInt(body.querySelector('#txD').value, 10) || 1), pp = P / N, r = body.querySelector('#txR');
      if(!P){ r.innerHTML = ''; return; }
      var t = tokyoTax(pp) * N * D, k = kyotoTax(pp) * N * D;
      r.innerHTML = 'Par personne et par nuit : ' + yen(pp) + '<br><b>Tokyo : ' + yen(t) + '</b> (' + eur(t) + ') · <b>Kyoto : ' + yen(k) + '</b> (' + eur(k) + ') pour le séjour.';
    }
    body.oninput = calc; body.onchange = null;
  }

  /* ---------------- Liens d'affiliation ---------------- */
  function affil(){
    title.textContent = 'ℹ️ À propos des liens';
    body.innerHTML = '<p>Les boutons de réservation de ce guide (Trip.com, Booking.com, Agoda, Klook, Holafly, Airalo) sont des <b>liens d’affiliation</b>.</p><p>Si tu réserves en passant par eux, Thaï Malin reçoit une petite commission, <b>sans aucun surcoût pour toi</b>. Ça aide à faire vivre le guide et à le mettre à jour.</p><p>Tu es libre de comparer ailleurs : les conseils du guide restent les mêmes.</p><p>Merci pour ta confiance ! 🙏</p>';
  }

  var TOOLS = { jrpass: jrpass, detaxe: detaxe, vols: vols, taxes: taxes, affil: affil };
  window.JaponTools = { open: function(n){ build(); body.oninput = body.onchange = null; if(!TOOLS[n]) return; TOOLS[n](); wrap.classList.add('on'); body.scrollTop = 0; document.documentElement.style.overflow = 'hidden'; } };
})();
