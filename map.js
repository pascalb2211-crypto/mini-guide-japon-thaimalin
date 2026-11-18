/* Carte interactive du Japon — Japon Malin (SVG stylisé, hors ligne) */
(function(){
  var CITIES = {
    tokyo:{n:'Tokyo',la:35.68,lo:139.69,p:20,t:'La capitale : quartiers très différents, musées, nourriture partout. Compte 3 à 4 jours.'},
    hakone:{n:'Hakone et mont Fuji',la:35.23,lo:139.02,p:22,t:'La nature à une ou deux heures de Tokyo. Compte 1 à 2 jours, avec une nuit en onsen.'},
    kyoto:{n:'Kyoto',la:35.01,lo:135.77,p:23,t:'Temples, quartiers traditionnels, jardins. Compte 3 à 4 jours avec Nara.'},
    nara:{n:'Nara',la:34.69,lo:135.84,p:25,t:'Les temples et les daims, facile en demi-journée depuis Kyoto ou Osaka.'},
    osaka:{n:'Osaka',la:34.69,lo:135.50,p:25,t:'La ville gourmande, base pratique pour Nara et Hiroshima.'},
    hiroshima:{n:'Hiroshima et Miyajima',la:34.39,lo:132.46,p:25,t:'Une étape mémoire et nature. Environ 1 h 35 d’Osaka en Shinkansen.'}
  };
  var ROUTES = {
    28:{t:'Itinéraire 10 jours',s:['tokyo','hakone','kyoto','nara','osaka'],note:'Arrivée à Tokyo, vol retour depuis Osaka (Kansai) : vol « open jaw ».'},
    29:{t:'Itinéraire 15 jours',s:['tokyo','hakone','kyoto','nara','osaka','hiroshima','osaka'],note:'Arrivée à Tokyo, vol retour depuis Osaka (Kansai) : vol « open jaw ».'}
  };
  var LAND = [
    [[140.0,41.4],[141.2,41.8],[141.9,42.6],[143.3,42.0],[145.5,43.3],[145.2,44.0],[143.0,44.4],[141.7,45.4],[141.6,44.2],[140.3,43.3],[139.9,42.3]],
    [[140.5,41.2],[141.5,40.5],[141.9,39.5],[141.5,38.2],[141.0,37.0],[140.9,36.0],[140.8,35.7],[139.9,35.0],[139.8,35.3],[138.9,34.7],[138.2,34.6],[137.2,34.6],[136.9,34.4],[136.3,33.8],[135.8,33.45],[135.1,33.9],[135.2,34.5],[134.3,34.7],[133.0,34.3],[132.2,34.0],[131.0,33.9],[130.9,34.4],[131.6,34.7],[132.5,35.4],[133.8,35.5],[135.3,35.6],[136.0,35.7],[136.7,36.4],[137.3,37.4],[138.3,37.1],[139.0,37.9],[139.9,39.2],[140.0,40.0],[140.0,40.6]],
    [[130.9,33.9],[131.7,33.6],[131.9,32.8],[131.4,31.4],[130.7,31.0],[130.2,31.3],[130.2,32.5],[129.8,33.2],[130.3,33.6]],
    [[132.4,33.9],[133.7,34.3],[134.6,34.2],[134.2,33.5],[133.0,32.8],[132.5,33.3]]
  ];
  var LO0 = 131.2, LO1 = 141.4, LA0 = 33.3, LA1 = 36.9, KX = 70, KY = 84, W = (LO1 - LO0) * KX, H = (LA1 - LA0) * KY;
  function X(lo){ return (lo - LO0) * KX; }
  function Y(la){ return (LA1 - la) * KY; }
  function pts(a){ return a.map(function(c){ return X(c[0]).toFixed(1) + ',' + Y(c[1]).toFixed(1); }).join(' '); }
  var css = '#jmWrap{position:fixed;inset:0;z-index:100002;background:rgba(15,17,21,.97);display:none;flex-direction:column;font-family:"Segoe UI",Arial,sans-serif;color:#fff}' +
    '#jmWrap.on{display:flex}#jmTop{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;font-weight:800;font-size:17px}' +
    '#jmX{background:#ffffff1f;border:0;color:#fff;border-radius:999px;padding:8px 14px;font-weight:700;font-size:14px}' +
    '#jmSvg{flex:0 0 auto;width:100%;height:auto;max-height:46vh}#jmInfo{background:#1a1d24;border-top:1px solid #d35400;padding:14px 16px calc(14px + env(safe-area-inset-bottom));min-height:96px;font-size:14px;line-height:1.45}' +
    '#jmInfo b{color:#f0955a;font-size:16px;display:block;margin-bottom:4px}#jmInfo a{display:inline-block;margin-top:8px;background:linear-gradient(135deg,#d35400,#f0955a);color:#fff;text-decoration:none;font-weight:700;border-radius:999px;padding:8px 16px}' +
    '.jmc{cursor:pointer}.jmc circle{fill:#d35400;stroke:#fff;stroke-width:3}.jmc text{fill:#fff;font-size:17px;font-weight:700;paint-order:stroke;stroke:#0f1115;stroke-width:4px}#jmChips{display:flex;flex-wrap:wrap;gap:8px;padding:0 16px 12px}#jmChips button{background:#ffffff14;border:1px solid #ffffff33;color:#fff;border-radius:999px;padding:8px 13px;font-size:14px;font-weight:600}.jmc circle{stroke-width:2.5}';
  var wrap, svg, info, route;
  function build(){
    if(wrap) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    wrap = document.createElement('div'); wrap.id = 'jmWrap';
    wrap.innerHTML = '<div id="jmTop"><span id="jmTitle">Carte du Japon</span><button id="jmX" type="button">Fermer ✕</button></div><svg id="jmSvg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet"></svg><div id="jmChips"></div><div id="jmInfo">Touche une ville pour en savoir plus.</div>';
    document.body.appendChild(wrap);
    svg = wrap.querySelector('#jmSvg'); info = wrap.querySelector('#jmInfo');
    wrap.querySelector('#jmX').addEventListener('click', function(){ wrap.classList.remove('on'); document.documentElement.style.overflow = ''; });
  }
  function draw(r){
    var s = '<rect width="' + W + '" height="' + H + '" fill="#10202e" rx="14"/>';
    LAND.forEach(function(a){ s += '<polygon points="' + pts(a) + '" fill="#2b3a2f" stroke="#7fae86" stroke-width="2" stroke-linejoin="round"/>'; });
    if(r){
      var line = r.s.map(function(k){ return X(CITIES[k].lo).toFixed(1) + ',' + Y(CITIES[k].la).toFixed(1); }).join(' ');
      s += '<polyline points="' + line + '" fill="none" stroke="#f0955a" stroke-width="5" stroke-dasharray="12 8" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    var order = {};
    if(r) r.s.forEach(function(k, i){ if(order[k] === undefined) order[k] = i + 1; });
    Object.keys(CITIES).forEach(function(k){
      var c = CITIES[k]; if(r && order[k] === undefined) return;
      var L = {tokyo:[12,-10,'start'],hakone:[10,22,'start'],kyoto:[-10,-10,'end'],nara:[12,20,'start'],osaka:[-10,22,'end'],hiroshima:[0,-16,'middle']}[k], dx = L[0], dy = L[1], anchor = L[2];
      s += '<g class="jmc" data-k="' + k + '"><circle cx="' + X(c.lo).toFixed(1) + '" cy="' + Y(c.la).toFixed(1) + '" r="' + (r ? 9 : 8) + '"/><text x="' + (X(c.lo) + dx).toFixed(1) + '" y="' + (Y(c.la) + dy).toFixed(1) + '" text-anchor="' + anchor + '">' + (r ? order[k] + '. ' : '') + c.n.split(' et ')[0] + '</text></g>';
    });
    svg.innerHTML = s;
    function pick(k){ var c = CITIES[k]; info.innerHTML = '<b>' + c.n + '</b>' + c.t + '<br><a href="page' + c.p + '.html">Voir la page du guide →</a>'; }
    Array.prototype.forEach.call(svg.querySelectorAll('.jmc'), function(g){ g.addEventListener('click', function(){ pick(g.getAttribute('data-k')); }); });
    var chips = wrap.querySelector('#jmChips'); chips.innerHTML = '';
    var seen = {}; (r ? r.s : Object.keys(CITIES)).forEach(function(k, i){ if(seen[k]) return; seen[k] = 1; var b = document.createElement('button'); b.type = 'button'; b.textContent = (r ? (i + 1) + '. ' : '') + CITIES[k].n; b.addEventListener('click', function(){ pick(k); }); chips.appendChild(b); });
  }
  window.JaponMap = { open: function(n){
    build(); route = n ? ROUTES[n] : null; draw(route);
    wrap.querySelector('#jmTitle').textContent = route ? '🗺️ ' + route.t : '🗺️ Carte du Japon';
    info.innerHTML = route ? 'Dans l’ordre du trajet.<br><span style="opacity:.7">' + route.note + '</span>' : 'Touche une ville pour en savoir plus.';
    wrap.classList.add('on'); document.documentElement.style.overflow = 'hidden';
  } };
})();
