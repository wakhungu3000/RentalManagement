/* Shared UI helpers (not demo-specific; safe to keep after the backend arrives). */
(function (w) {
  var UI = {};
  UI.$ = function (id) { return document.getElementById(id); };

  /* Safe element builder: text goes in as text nodes, never as HTML. */
  UI.h = function (tag, props, kids) {
    var e = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      var v = props[k];
      if (k === 'class') e.className = v;
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    });
    (kids || []).forEach(function (c) { e.append(c); });
    return e;
  };

  UI.kes = function (n) { return 'KES ' + Number(n).toLocaleString('en-KE'); };
  UI.date = function (iso) {
    if (!iso) return '—';
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  UI.addDays = function (n) {
    var d = new Date(); d.setDate(d.getDate() + n);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };
  UI.monthName = function (offset) {
    var d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + (offset || 0));
    return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  };
  UI.badge = function (status) {
    return UI.h('span', { 'class': 'badge badge-' + String(status).replace(/\s+/g, '-') }, [status]);
  };
  UI.cell = function (kids) { return UI.h('td', {}, Array.isArray(kids) ? kids : [kids]); };

  /* ---- session (demo) ---- */
  UI.session = function () { try { return JSON.parse(sessionStorage.getItem('demoUser')); } catch (e) { return null; } };
  UI.guard = function (role) {
    var s = UI.session();
    if (!s || s.role !== role) { location.replace('login.html'); return null; }
    return s;
  };

  /* ---- toast ---- */
  var tt;
  UI.toast = function (msg) {
    var t = UI.$('toast'); if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(tt); tt = setTimeout(function () { t.hidden = true; }, 3400);
  };

  /* ---- dialogs ---- */
  UI.open = function (id) { var d = UI.$(id); if (d && !d.open) d.showModal(); };
  UI.close = function (id) { var d = UI.$(id); if (d && d.open) d.close(); };
  UI.err = function (id, msg) { var e = UI.$(id); e.textContent = msg || ''; e.hidden = !msg; };

  UI.confirm = function (title, text, okLabel) {
    return new Promise(function (resolve) {
      UI.$('confirmTitle').textContent = title;
      UI.$('confirmText').textContent = text;
      UI.$('confirmOk').textContent = okLabel || 'Confirm';
      var d = UI.$('confirmDialog');
      function done(v) { d.close(); UI.$('confirmOk').onclick = null; UI.$('confirmCancel').onclick = null; resolve(v); }
      UI.$('confirmOk').onclick = function () { done(true); };
      UI.$('confirmCancel').onclick = function () { done(false); };
      d.addEventListener('cancel', function once() { d.removeEventListener('cancel', once); resolve(false); });
      d.showModal();
    });
  };

  /* ---- print & CSV ---- */
  UI.printInvoice = function () {
    document.body.classList.add('print-invoice');
    w.print();
    document.body.classList.remove('print-invoice');
  };
  UI.csv = function (filename, head, rows) {
    function q(v) { return '"' + String(v).replace(/"/g, '""') + '"'; }
    var text = [head].concat(rows).map(function (r) { return r.map(q).join(','); }).join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
    a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  };

  /* ---- wiring that every page needs ---- */
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]'); if (o) { e.preventDefault(); UI.open(o.getAttribute('data-open')); }
    var c = e.target.closest('[data-close]'); if (c) { var d = c.closest('dialog'); if (d) d.close(); }
    var l = e.target.closest('#logoutLink'); if (l) { try { sessionStorage.removeItem('demoUser'); } catch (x) {} }
  });

  w.UI = UI;
})(window);
