/* Talks to the Spring Boot server. It exposes the same DB.* names the page
   scripts already use, so the screens barely changed:
   - reading (DB.get(), DB.balanceFor(), ...) is instant, from a copy the server sent;
   - changing (DB.addHouse(), DB.sendInvoice(), ...) goes to the server and returns a
     Promise; the copy is refreshed afterwards.
   The server decides what each person may see and do. This file only asks. */
(function (w) {
  var snap = null;

  function csrf() {
    var m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
    return m ? decodeURIComponent(m[1]) : '';
  }

  /* One place for every request. Returns parsed JSON, or {error: "..."} for a refused request. */
  function call(method, url, body) {
    var opts = { method: method, credentials: 'same-origin', headers: { 'Accept': 'application/json' } };
    if (method !== 'GET') {
      opts.headers['X-XSRF-TOKEN'] = csrf();
      if (body !== undefined) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    }
    return fetch(url, opts).then(function (res) {
      if (res.status === 401) { location.replace('login.html'); return new Promise(function () {}); }
      return res.json().catch(function () { return null; }).then(function (data) {
        if (!res.ok) return { error: (data && data.error) || 'Something went wrong. Please try again.' };
        return data || { ok: true };
      });
    }, function () {
      return { error: 'Cannot reach the server. Check your connection and try again.' };
    });
  }

  function refresh() {
    return call('GET', '/api/snapshot').then(function (d) { if (!d.error) snap = d; return d; });
  }
  /* Run a change, then refresh our copy so the screen shows the new truth. */
  function change(method, url, body, map) {
    return call(method, url, body).then(function (r) {
      if (r.error) return r;
      return refresh().then(function () { return map ? map(r) : r; });
    });
  }

  function find(list, id) { return get()[list].filter(function (x) { return x.id === id; })[0] || null; }
  function get() { return snap; }
  function today() { var d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }

  /* ---- display-only maths on the data the server sent (the server re-checks every rule) ---- */
  function invStatus(inv) {
    if (inv.paid >= inv.amount) return 'paid';
    if (inv.due < today()) return 'overdue';
    return inv.paid > 0 ? 'partial' : 'pending';
  }
  function tenantInvoices(tid) { return get().invoices.filter(function (i) { return i.tenantId === tid; }); }
  function balanceFor(tid) { return tenantInvoices(tid).reduce(function (s, i) { return s + (i.amount - i.paid); }, 0); }
  function nextDue(tid) {
    var open = tenantInvoices(tid).filter(function (i) { return i.paid < i.amount; }).map(function (i) { return i.due; }).sort();
    return open[0] || null;
  }
  function isOverdue(tid) { return tenantInvoices(tid).some(function (i) { return invStatus(i) === 'overdue'; }); }
  function tenantOf(houseId) { var h = find('houses', houseId); return h && h.tenantId ? find('tenants', h.tenantId) : null; }
  function houseOf(tid) { var t = find('tenants', tid); return t ? find('houses', t.houseId) : null; }

  var DB = {
    me: null,
    get: get, find: find, today: today,
    invStatus: invStatus, tenantInvoices: tenantInvoices, balanceFor: balanceFor, nextDue: nextDue, isOverdue: isOverdue,
    tenantOf: tenantOf, houseOf: houseOf,

    /* houses */
    addHouse: function (f) { return change('POST', '/api/houses', { number: f.number, type: f.type, location: f.location, rent: Number(f.rent) }); },
    updateHouse: function (id, f) { return change('PUT', '/api/houses/' + id, { number: f.number, type: f.type, location: f.location, rent: Number(f.rent) }); },
    deleteHouse: function (id) { return change('DELETE', '/api/houses/' + id); },

    /* tenants */
    addTenant: function (f) {
      return change('POST', '/api/tenants', { name: f.name, phone: f.phone, email: f.email, idNo: f.idNo, houseId: f.houseId, moveIn: f.moveIn });
    },
    removeTenant: function (id) { return change('DELETE', '/api/tenants/' + id); },

    /* invoices and payments */
    sendInvoice: function (f) {
      return change('POST', '/api/invoices', { tenantId: f.tenantId, period: f.period, amount: Number(f.amount), due: f.due, note: f.note || '' });
    },
    invoiceAll: function (period, due) {
      return change('POST', '/api/invoices/bulk', { period: period, due: due }, function (r) { return r.made; });
    },
    addPayment: function (f) {
      return change('POST', '/api/payments', { tenantId: f.tenantId, amount: Number(f.amount), method: f.method, ref: f.ref || '' });
    },
    confirmPayment: function (id) { return change('POST', '/api/payments/' + id + '/confirm'); },

    /* maintenance */
    addRequest: function (f) {
      return change('POST', '/api/requests', { category: f.category, priority: f.priority, desc: f.desc });
    },
    setRequestStatus: function (id, status) { return change('PATCH', '/api/requests/' + id + '/status', { status: status }); },

    logout: function () { return call('POST', '/api/auth/logout'); }
  };

  /* Every page waits for this before it draws: who am I, then my data. */
  DB.ready = call('GET', '/api/auth/me').then(function (me) {
    if (me.error) { location.replace('login.html'); return new Promise(function () {}); }
    DB.me = me;
    return refresh();
  });

  w.DB = DB;
})(window);
