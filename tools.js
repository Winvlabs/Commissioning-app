/* EDP Reports - drawing on photos (annotate) and satellite overview maps (mapCapture). Shared by all reports. */
(function (global) {
  'use strict';
  const t = (k, v) => global.I18N.t(k, v);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = src; });

  /* ======================= Drawing editor ======================= */
  const COLORS = ['#e5322d', '#ffd400', '#2fae4e', '#1e88e5', '#ffffff', '#111111'];
  const TOOLS = [['pen', '✏️'], ['arrow', '➜'], ['rect', '▭'], ['text', 'T'], ['num', '①']];

  /* Opens a full-screen editor. Resolves with a JPEG data URL, or null when cancelled. */
  function annotate(src, opts = {}) {
    return new Promise(async resolve => {
      let base;
      try { base = await loadImg(src); } catch (e) { resolve(null); return; }
      const max = opts.max || 1800, s = Math.min(1, max / Math.max(base.width, base.height));
      const W = Math.round(base.width * s), H = Math.round(base.height * s);
      const ops = []; let tool = 'pen', color = COLORS[0], width = 'm', cur = null;
      const lw = () => Math.max(2, Math.round(Math.max(W, H) * ({ s: 0.003, m: 0.006, l: 0.011 }[width])));
      const m = document.createElement('div'); m.className = 'draw-modal';
      m.innerHTML = `<div class="draw-top"><button type="button" class="draw-btn" data-act="cancel" title="${esc(t('drawCancel'))}">✕</button>
          <div class="draw-tools">${TOOLS.map(([k, ic]) => `<button type="button" class="draw-btn tool" data-tool="${k}" title="${esc(t('drawTool_' + k))}">${ic}</button>`).join('')}</div>
          <button type="button" class="draw-btn" data-act="undo" title="${esc(t('drawUndo'))}">↶</button>
          <button type="button" class="draw-btn save" data-act="save">✓ ${esc(t('drawSave'))}</button></div>
        <div class="draw-stage"><canvas></canvas></div>
        <div class="draw-bottom"><div class="draw-colors">${COLORS.map(c => `<button type="button" class="swatch" data-color="${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}</div>
          <div class="draw-widths">${['s', 'm', 'l'].map(w => `<button type="button" class="draw-btn wbtn" data-w="${w}"><i class="w-${w}"></i></button>`).join('')}</div>
          <button type="button" class="draw-btn" data-act="clear">${esc(t('drawClear'))}</button></div>
        <p class="draw-hint">${esc(opts.hint || t('drawHint'))}</p>`;
      document.body.appendChild(m); document.body.classList.add('no-scroll');
      const cv = m.querySelector('canvas'); cv.width = W; cv.height = H; const cx = cv.getContext('2d');
      const fitCanvas = () => { const st = m.querySelector('.draw-stage'); const k = Math.min(st.clientWidth / W, st.clientHeight / H); cv.style.width = W * k + 'px'; cv.style.height = H * k + 'px'; };
      fitCanvas(); global.addEventListener('resize', fitCanvas);
      const nextNum = () => ops.filter(o => o.t === 'num').length + 1;
      function drawOp(o) {
        cx.save(); cx.strokeStyle = o.c; cx.fillStyle = o.c; cx.lineWidth = o.w; cx.lineCap = 'round'; cx.lineJoin = 'round';
        if (o.t === 'pen') { cx.beginPath(); o.p.forEach(([x, y], i) => i ? cx.lineTo(x, y) : cx.moveTo(x, y)); if (o.p.length === 1) cx.lineTo(o.p[0][0] + .1, o.p[0][1]); cx.stroke(); }
        if (o.t === 'rect') { cx.strokeRect(Math.min(o.a[0], o.b[0]), Math.min(o.a[1], o.b[1]), Math.abs(o.b[0] - o.a[0]), Math.abs(o.b[1] - o.a[1])); }
        if (o.t === 'arrow') {
          const [x1, y1] = o.a, [x2, y2] = o.b, ang = Math.atan2(y2 - y1, x2 - x1), hl = Math.max(14, o.w * 4);
          cx.beginPath(); cx.moveTo(x1, y1); cx.lineTo(x2 - Math.cos(ang) * hl * .6, y2 - Math.sin(ang) * hl * .6); cx.stroke();
          cx.beginPath(); cx.moveTo(x2, y2); cx.lineTo(x2 - hl * Math.cos(ang - .45), y2 - hl * Math.sin(ang - .45)); cx.lineTo(x2 - hl * Math.cos(ang + .45), y2 - hl * Math.sin(ang + .45)); cx.closePath(); cx.fill();
        }
        if (o.t === 'text' || o.t === 'num') {
          const fs = Math.max(16, o.w * 5); cx.font = `bold ${fs}px Arial, sans-serif`; cx.textBaseline = 'middle';
          const light = ['#ffffff', '#ffd400'].includes(o.c), txtCol = light ? '#111111' : '#ffffff';
          if (o.t === 'num') {
            const r = fs * .8; cx.beginPath(); cx.arc(o.a[0], o.a[1], r, 0, Math.PI * 2); cx.fill(); cx.lineWidth = Math.max(2, fs * .1); cx.strokeStyle = light ? '#111111' : '#ffffff'; cx.stroke();
            cx.fillStyle = txtCol; cx.textAlign = 'center'; cx.fillText(String(o.n), o.a[0], o.a[1] + 1);
          } else {
            const pad = fs * .3, tw = cx.measureText(o.s).width; cx.globalAlpha = .9; cx.fillRect(o.a[0] - pad, o.a[1] - fs * .65, tw + pad * 2, fs * 1.3); cx.globalAlpha = 1;
            cx.fillStyle = txtCol; cx.textAlign = 'left'; cx.fillText(o.s, o.a[0], o.a[1]);
          }
        }
        cx.restore();
      }
      function redraw() { cx.clearRect(0, 0, W, H); cx.drawImage(base, 0, 0, W, H); ops.forEach(drawOp); if (cur) drawOp(cur); }
      function pos(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; }
      function setTool(k) { tool = k; m.querySelectorAll('.tool').forEach(b => b.classList.toggle('on', b.dataset.tool === k)); }
      function setColor(c) { color = c; m.querySelectorAll('.swatch').forEach(b => b.classList.toggle('on', b.dataset.color === c)); }
      function setWidth(w) { width = w; m.querySelectorAll('.wbtn').forEach(b => b.classList.toggle('on', b.dataset.w === w)); }
      setTool(opts.tool || 'pen'); setColor(COLORS[0]); setWidth('m'); redraw();
      cv.addEventListener('pointerdown', e => {
        e.preventDefault(); const p = pos(e);
        if (tool === 'text') { const s = prompt(t('drawTextPrompt')); if (s && s.trim()) { ops.push({ t: 'text', a: p, s: s.trim(), c: color, w: lw() }); redraw(); } return; }
        if (tool === 'num') { ops.push({ t: 'num', a: p, n: nextNum(), c: color, w: lw() }); redraw(); return; }
        cv.setPointerCapture(e.pointerId);
        cur = tool === 'pen' ? { t: 'pen', p: [p], c: color, w: lw() } : { t: tool, a: p, b: p, c: color, w: lw() };
        redraw();
      });
      cv.addEventListener('pointermove', e => { if (!cur) return; e.preventDefault(); const p = pos(e); if (cur.t === 'pen') cur.p.push(p); else cur.b = p; redraw(); });
      const end = () => { if (!cur) return; if (cur.t === 'pen' || Math.hypot(cur.b[0] - cur.a[0], cur.b[1] - cur.a[1]) > 4) ops.push(cur); cur = null; redraw(); };
      cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
      const close = v => { global.removeEventListener('resize', fitCanvas); m.remove(); document.body.classList.remove('no-scroll'); resolve(v); };
      m.querySelectorAll('.tool').forEach(b => b.onclick = () => setTool(b.dataset.tool));
      m.querySelectorAll('.swatch').forEach(b => b.onclick = () => setColor(b.dataset.color));
      m.querySelectorAll('.wbtn').forEach(b => b.onclick = () => setWidth(b.dataset.w));
      m.querySelector('[data-act=undo]').onclick = () => { ops.pop(); redraw(); };
      m.querySelector('[data-act=clear]').onclick = () => { if (!ops.length || confirm(t('drawClearConfirm'))) { ops.length = 0; redraw(); } };
      m.querySelector('[data-act=cancel]').onclick = () => { if (!ops.length || confirm(t('drawDiscard'))) close(null); };
      m.querySelector('[data-act=save]').onclick = () => { cur = null; redraw(); close(cv.toDataURL('image/jpeg', opts.quality || 0.82)); };
    });
  }

  /* ======================= Satellite overview map ======================= */
  const LAYERS = {
    sat: { url: (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`, max: 19, credit: 'Esri, Maxar, Earthstar Geographics' },
    map: { url: (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`, max: 19, credit: '© OpenStreetMap contributors' }
  };
  const TS = 256;
  const lon2x = (lon, z) => (lon + 180) / 360 * Math.pow(2, z) * TS;
  const lat2y = (lat, z) => { const r = lat * Math.PI / 180; return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * Math.pow(2, z) * TS; };
  const x2lon = (x, z) => x / (Math.pow(2, z) * TS) * 360 - 180;
  const y2lat = (y, z) => { const n = Math.PI - 2 * Math.PI * y / (Math.pow(2, z) * TS); return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))); };
  const tileCache = new Map();
  function tile(layer, z, x, y) {
    const n = Math.pow(2, z); x = ((x % n) + n) % n; if (y < 0 || y >= n) return null;
    const key = layer + z + '/' + x + '/' + y;
    if (!tileCache.has(key)) { const im = new Image(); im.crossOrigin = 'anonymous'; im.src = LAYERS[layer].url(z, x, y); tileCache.set(key, im); }
    return tileCache.get(key);
  }

  /* Opens a map picker; resolves with an annotated JPEG data URL of the chosen area (or null). */
  function mapCapture(opts = {}) {
    return new Promise(resolve => {
      const st = { lat: opts.lat ?? 50.85, lon: opts.lon ?? 4.35, z: opts.lat != null ? 18 : 8, layer: 'sat' };
      const m = document.createElement('div'); m.className = 'draw-modal map-modal';
      m.innerHTML = `<div class="draw-top"><button type="button" class="draw-btn" data-act="cancel">✕</button>
          <form class="map-search"><input type="search" placeholder="${esc(t('mapSearchPh'))}" value="${esc(opts.query || '')}"><button type="submit" class="draw-btn">🔍</button></form>
          <button type="button" class="draw-btn" data-act="gps" title="${esc(t('mapMyLocation'))}">📍</button></div>
        <div class="draw-stage map-stage"><canvas></canvas><div class="map-zoom"><button type="button" class="draw-btn" data-z="1">＋</button><button type="button" class="draw-btn" data-z="-1">－</button></div>
          <div class="map-layer"><button type="button" class="draw-btn" data-layer="sat">${esc(t('mapSat'))}</button><button type="button" class="draw-btn" data-layer="map">${esc(t('mapStreet'))}</button></div>
          <div class="map-credit"></div><div class="map-msg"></div></div>
        <div class="draw-bottom"><span class="draw-hint">${esc(t('mapHint'))}</span><button type="button" class="draw-btn save" data-act="use">✓ ${esc(t('mapUse'))}</button></div>`;
      document.body.appendChild(m); document.body.classList.add('no-scroll');
      const stage = m.querySelector('.map-stage'), cv = m.querySelector('canvas'), cx = cv.getContext('2d');
      const msg = s => { const el = m.querySelector('.map-msg'); el.textContent = s || ''; el.style.display = s ? 'block' : 'none'; };
      let raf = 0;
      function size() { const r = stage.getBoundingClientRect(), d = Math.min(2, global.devicePixelRatio || 1); cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px'; draw(); }
      function render(ctx, w, h, scale) {
        const z = st.z, cxp = lon2x(st.lon, z), cyp = lat2y(st.lat, z), tsz = TS * scale;
        const x0 = cxp - w / 2 / scale, y0 = cyp - h / 2 / scale;
        ctx.fillStyle = '#c9d3dc'; ctx.fillRect(0, 0, w, h);
        let pending = 0;
        for (let ty = Math.floor(y0 / TS); ty <= Math.floor((y0 + h / scale) / TS); ty++)
          for (let tx = Math.floor(x0 / TS); tx <= Math.floor((x0 + w / scale) / TS); tx++) {
            const im = tile(st.layer, z, tx, ty); if (!im) continue;
            if (im.complete && im.naturalWidth) ctx.drawImage(im, Math.round((tx * TS - x0) * scale), Math.round((ty * TS - y0) * scale), Math.ceil(tsz), Math.ceil(tsz));
            else { pending++; if (!im._hooked) { im._hooked = true; im.onload = () => draw(); im.onerror = () => { im._failed = true; draw(); }; } }
          }
        return pending;
      }
      function draw() {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const d = cv.width / (parseFloat(cv.style.width) || cv.width);
          render(cx, cv.width, cv.height, d);
          m.querySelector('.map-credit').textContent = LAYERS[st.layer].credit;
          m.querySelectorAll('[data-layer]').forEach(b => b.classList.toggle('on', b.dataset.layer === st.layer));
          const failed = [...tileCache.values()].some(i => i._failed);
          msg(failed && !navigator.onLine ? t('mapOffline') : '');
        });
      }
      /* pan with one finger / mouse, zoom with buttons, wheel or pinch */
      const pts = new Map(); let pinch0 = null;
      cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: st.z }; } });
      cv.addEventListener('pointermove', e => {
        if (!pts.has(e.pointerId)) return; e.preventDefault();
        const prev = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
        if (pts.size === 1) { const z = st.z; st.lon = x2lon(lon2x(st.lon, z) - (e.clientX - prev[0]), z); st.lat = Math.max(-85, Math.min(85, y2lat(lat2y(st.lat, z) - (e.clientY - prev[1]), z))); draw(); }
        else if (pts.size === 2 && pinch0) { const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); const nz = Math.max(3, Math.min(LAYERS[st.layer].max, pinch0.z + Math.round(Math.log2(d / pinch0.d)))); if (nz !== st.z) { st.z = nz; draw(); } }
      });
      const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch0 = null; };
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
      cv.addEventListener('wheel', e => { e.preventDefault(); st.z = Math.max(3, Math.min(LAYERS[st.layer].max, st.z + (e.deltaY < 0 ? 1 : -1))); draw(); }, { passive: false });
      m.querySelectorAll('[data-z]').forEach(b => b.onclick = () => { st.z = Math.max(3, Math.min(LAYERS[st.layer].max, st.z + Number(b.dataset.z))); draw(); });
      m.querySelectorAll('[data-layer]').forEach(b => b.onclick = () => { st.layer = b.dataset.layer; draw(); });
      async function search(q) {
        if (!q.trim()) return;
        msg(t('mapSearching'));
        try {
          const r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(q), { headers: { 'Accept-Language': global.I18N.lang } });
          const j = await r.json();
          if (j && j[0]) { st.lat = Number(j[0].lat); st.lon = Number(j[0].lon); st.z = 18; msg(''); draw(); } else msg(t('mapNotFound'));
        } catch (e) { msg(t('mapOffline')); }
      }
      m.querySelector('.map-search').onsubmit = e => { e.preventDefault(); search(m.querySelector('.map-search input').value); };
      m.querySelector('[data-act=gps]').onclick = () => {
        if (!navigator.geolocation) { msg(t('mapNoGps')); return; }
        msg(t('mapLocating'));
        navigator.geolocation.getCurrentPosition(p => { st.lat = p.coords.latitude; st.lon = p.coords.longitude; st.z = 18; msg(''); draw(); }, () => msg(t('mapNoGps')), { enableHighAccuracy: true, timeout: 15000 });
      };
      const close = v => { global.removeEventListener('resize', size); m.remove(); document.body.classList.remove('no-scroll'); resolve(v); };
      m.querySelector('[data-act=cancel]').onclick = () => close(null);
      m.querySelector('[data-act=use]').onclick = async () => {
        /* render a large, sharp image of the visible area (2x), then open the drawing editor */
        const r = stage.getBoundingClientRect(), k = Math.min(2, 1800 / Math.max(r.width, r.height));
        const out = document.createElement('canvas'); out.width = Math.round(r.width * k); out.height = Math.round(r.height * k);
        const oc = out.getContext('2d');
        let tries = 0; while (render(oc, out.width, out.height, k) > 0 && tries++ < 30) await new Promise(res => setTimeout(res, 150));
        const fs = Math.max(12, out.width * 0.012); oc.font = `${fs}px Arial`; oc.fillStyle = 'rgba(255,255,255,.75)';
        const credit = LAYERS[st.layer].credit, tw = oc.measureText(credit).width; oc.fillRect(out.width - tw - fs, out.height - fs * 1.6, tw + fs, fs * 1.6);
        oc.fillStyle = '#333'; oc.textBaseline = 'middle'; oc.fillText(credit, out.width - tw - fs / 2, out.height - fs * .8);
        let data;
        try { data = out.toDataURL('image/jpeg', 0.85); } catch (e) { msg(t('mapCaptureFail')); return; }
        m.style.display = 'none';
        const drawn = await annotate(data, { tool: 'num', hint: t('mapDrawHint') });
        if (drawn) close({ data: drawn, lat: st.lat, lon: st.lon, z: st.z }); else m.style.display = '';
      };
      global.addEventListener('resize', size); size();
      if (opts.query && opts.lat == null) search(opts.query);
    });
  }

  global.EDPTools = { annotate, mapCapture };
})(window);
