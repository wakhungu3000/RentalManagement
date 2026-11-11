/* DEMO ONLY - a fake database kept in the browser (localStorage) so the owner
   and tenant screens share the same data before the backend exists.
   When Spring Boot + the real DB are ready, delete this file and replace each
   DB.* call with a controller/service call (the method names map 1:1 to the
   operations your backend needs). */
(function (w) {
  var KEY = 'nyumbaDB_v1', db = null;

  function iso(d) { return d.toISOString().slice(0, 10); }
  function today() { var d = new Date(); return iso(new Date(d.getTime() - d.getTimezoneOffset() * 60000)); }
  function uid(p) { return p + Math.random().toString(36).slice(2, 8); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }

  function seed() {
    return {
      nextInvoice: 1007,
      houses: [
        { id: 'h1', number: 'A-01', type: '1-bedroom', location: 'Milimani', rent: 14000, status: 'available', tenantId: null },
        { id: 'h2', number: 'A-04', type: '2-bedroom apartment', location: 'Milimani', rent: 15500, status: 'occupied', tenantId: 't2' },
        { id: 'h3', number: 'B-03', type: 'Bedsitter', location: 'Nyalenda', rent: 9500, status: 'available', tenantId: null },
        { id: 'h4', number: 'B-12', type: '2-bedroom apartment', location: 'Milimani', rent: 18000, status: 'occupied', tenantId: 't1' },
        { id: 'h5', number: 'C-02', type: '3-bedroom maisonette', location: 'Migosi', rent: 24000, status: 'available', tenantId: null },
        { id: 'h6', number: 'C-07', type: '1-bedroom', location: 'Migosi', rent: 12000, status: 'occupied', tenantId: 't3' }
      ],
      tenants: [
        { id: 't1', name: 'Amina Otieno', phone: '0712 345 678', email: 'amina@example.com', idNo: '31245678', houseId: 'h4', moveIn: '2026-02-01', username: 'tenant01', password: 'tenant123' },
        { id: 't2', name: 'James Mwangi', phone: '0722 111 222', email: 'james@example.com', idNo: '29874512', houseId: 'h2', moveIn: '2026-03-01', username: 'tenant02', password: 'tenant123' },
        { id: 't3', name: 'Grace Wekesa', phone: '0733 555 901', email: 'grace@example.com', idNo: '33019944', houseId: 'h6', moveIn: '2026-01-01', username: 'tenant03', password: 'tenant123' }
      ],
      invoices: [
        { id: 'i1', no: 'INV-1001', tenantId: 't1', tenantName: 'Amina Otieno', houseNumber: 'B-12', period: 'October 2026', amount: 18000, paid: 18000, issued: '2026-10-01', due: '2026-10-05', note: '' },
        { id: 'i2', no: 'INV-1002', tenantId: 't1', tenantName: 'Amina Otieno', houseNumber: 'B-12', period: 'November 2026', amount: 18000, paid: 0, issued: '2026-11-01', due: '2026-11-15', note: '' },
        { id: 'i3', no: 'INV-1003', tenantId: 't2', tenantName: 'James Mwangi', houseNumber: 'A-04', period: 'October 2026', amount: 15500, paid: 15500, issued: '2026-10-01', due: '2026-10-05', note: '' },
        { id: 'i4', no: 'INV-1004', tenantId: 't2', tenantName: 'James Mwangi', houseNumber: 'A-04', period: 'November 2026', amount: 15500, paid: 0, issued: '2026-11-01', due: '2026-11-05', note: '' },
        { id: 'i5', no: 'INV-1005', tenantId: 't3', tenantName: 'Grace Wekesa', houseNumber: 'C-07', period: 'October 2026', amount: 12000, paid: 0, issued: '2026-10-01', due: '2026-10-05', note: '' },
        { id: 'i6', no: 'INV-1006', tenantId: 't3', tenantName: 'Grace Wekesa', houseNumber: 'C-07', period: 'November 2026', amount: 12000, paid: 0, issued: '2026-11-01', due: '2026-11-05', note: '' }
      ],
      payments: [
        { id: 'p1', tenantId: 't1', tenantName: 'Amina Otieno', houseNumber: 'B-12', amount: 18000, date: '2026-10-04', method: 'M-Pesa', ref: 'QFA3K81MZ2', status: 'paid' },
        { id: 'p2', tenantId: 't2', tenantName: 'James Mwangi', houseNumber: 'A-04', amount: 15500, date: '2026-10-03', method: 'Bank transfer', ref: 'BNK-77120', status: 'paid' }
      ],
      requests: [
        { id: 'r1', tenantId: 't1', tenantName: 'Amina Otieno', houseNumber: 'B-12', category: 'Plumbing', priority: 'Normal', desc: 'Bathroom sink drains slowly.', date: '2026-10-28', status: 'resolved' },
        { id: 'r2', tenantId: 't3', tenantName: 'Grace Wekesa', houseNumber: 'C-07', category: 'Electrical', priority: 'Urgent', desc: 'Living room socket sparks when a plug goes in.', date: '2026-11-07', status: 'pending' },
        { id: 'r3', tenantId: 't2', tenantName: 'James Mwangi', houseNumber: 'A-04', category: 'Doors and locks', priority: 'Normal', desc: 'The back door lock is stiff.', date: '2026-11-05', status: 'in progress' }
      ]
    };
  }

  function get() {
    if (db) return db;
    try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { db = null; }
    if (!db) { db = seed(); save(); }
    return db;
  }
  function find(list, id) { return get()[list].filter(function (x) { return x.id === id; })[0] || null; }

  /* ---- derived values ---- */
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

  /* ---- helpers ---- */
  function allocate(tid, amount) {
    var left = amount;
    tenantInvoices(tid).filter(function (i) { return i.paid < i.amount; })
      .sort(function (a, b) { return a.due < b.due ? -1 : 1; })
      .forEach(function (i) { var use = Math.min(left, i.amount - i.paid); i.paid += use; left -= use; });
  }
  function makeUsername(name) {
    var base = name.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '') || 'tenant', n = 10 + Math.floor(Math.random() * 89), u;
    do { u = base + n++; } while (get().tenants.some(function (t) { return t.username === u; }));
    return u;
  }
  function makePassword() {
    var c = 'abcdefghjkmnpqrstuvwxyz23456789', p = '';
    for (var i = 0; i < 7; i++) p += c[Math.floor(Math.random() * c.length)];
    return p;
  }
  function numberTaken(num, exceptId) {
    return get().houses.some(function (h) { return h.id !== exceptId && h.number.toLowerCase() === num.toLowerCase(); });
  }

  /* ---- houses ---- */
  function addHouse(f) {
    if (numberTaken(f.number)) return { error: 'House ' + f.number + ' already exists. Use a different house number.' };
    var h = { id: uid('h'), number: f.number, type: f.type, location: f.location, rent: Number(f.rent), status: 'available', tenantId: null };
    get().houses.push(h); save(); return { ok: true, item: h };
  }
  function updateHouse(id, f) {
    var h = find('houses', id);
    if (numberTaken(f.number, id)) return { error: 'House ' + f.number + ' already exists. Use a different house number.' };
    h.number = f.number; h.type = f.type; h.location = f.location; h.rent = Number(f.rent);
    save(); return { ok: true, item: h };
  }
  function deleteHouse(id) {
    var h = find('houses', id);
    if (h.tenantId) return { error: 'House ' + h.number + ' has a tenant. Remove the tenant first.' };
    get().houses = get().houses.filter(function (x) { return x.id !== id; }); save(); return { ok: true };
  }

  /* ---- tenants ---- */
  function addTenant(f) {
    var h = find('houses', f.houseId);
    if (!h || h.tenantId) return { error: 'That house is no longer available. Pick another one.' };
    var t = { id: uid('t'), name: f.name, phone: f.phone, email: f.email, idNo: f.idNo, houseId: h.id, moveIn: f.moveIn,
              username: makeUsername(f.name), password: makePassword() };
    get().tenants.push(t); h.tenantId = t.id; h.status = 'occupied'; save();
    return { ok: true, item: t };
  }
  function removeTenant(id) {
    var t = find('tenants', id), h = t && find('houses', t.houseId);
    if (h) { h.tenantId = null; h.status = 'available'; }
    get().tenants = get().tenants.filter(function (x) { return x.id !== id; }); save(); return { ok: true };
  }

  /* ---- invoices & payments ---- */
  function sendInvoice(f) {
    var t = find('tenants', f.tenantId), h = houseOf(f.tenantId);
    var inv = { id: uid('i'), no: 'INV-' + (get().nextInvoice++), tenantId: t.id, tenantName: t.name, houseNumber: h ? h.number : '—',
                period: f.period, amount: Number(f.amount), paid: 0, issued: today(), due: f.due, note: f.note || '' };
    get().invoices.push(inv); save(); return { ok: true, item: inv };
  }
  function invoiceAll(period, due) {
    var made = 0;
    get().tenants.forEach(function (t) {
      var h = houseOf(t.id);
      var dup = tenantInvoices(t.id).some(function (i) { return i.period === period; });
      if (h && !dup) { sendInvoice({ tenantId: t.id, period: period, amount: h.rent, due: due, note: '' }); made++; }
    });
    save(); return made;
  }
  function addPayment(f) {
    var t = find('tenants', f.tenantId), h = houseOf(f.tenantId);
    var p = { id: uid('p'), tenantId: t.id, tenantName: t.name, houseNumber: h ? h.number : '—', amount: Number(f.amount),
              date: today(), method: f.method, ref: f.ref || '', status: f.status || 'paid' };
    get().payments.push(p);
    if (p.status === 'paid') allocate(t.id, p.amount);
    save(); return { ok: true, item: p };
  }
  function confirmPayment(id) {
    var p = find('payments', id);
    if (p && p.status === 'pending') { p.status = 'paid'; allocate(p.tenantId, p.amount); save(); }
    return { ok: true };
  }

  /* ---- maintenance ---- */
  function addRequest(f) {
    var t = find('tenants', f.tenantId), h = houseOf(f.tenantId);
    var r = { id: uid('r'), tenantId: t.id, tenantName: t.name, houseNumber: h ? h.number : '—', category: f.category,
              priority: f.priority, desc: f.desc, date: today(), status: 'pending' };
    get().requests.push(r); save(); return { ok: true, item: r };
  }
  function setRequestStatus(id, status) { var r = find('requests', id); if (r) { r.status = status; save(); } }

  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} db = null; get(); }

  w.DB = { get: get, save: save, find: find, today: today, reset: reset,
           invStatus: invStatus, tenantInvoices: tenantInvoices, balanceFor: balanceFor, nextDue: nextDue, isOverdue: isOverdue,
           tenantOf: tenantOf, houseOf: houseOf,
           addHouse: addHouse, updateHouse: updateHouse, deleteHouse: deleteHouse,
           addTenant: addTenant, removeTenant: removeTenant,
           sendInvoice: sendInvoice, invoiceAll: invoiceAll, addPayment: addPayment, confirmPayment: confirmPayment,
           addRequest: addRequest, setRequestStatus: setRequestStatus };
})(window);
