(function () {
  if (!UI.guard('owner')) return;
  var $ = UI.$, h = UI.h, current = 'houses';

  function sum(list, fn) { return list.reduce(function (s, x) { return s + fn(x); }, 0); }

  var REPORTS = {
    houses: function (db) {
      var occ = db.houses.filter(function (x) { return x.status === 'occupied'; }).length;
      return {
        title: 'House report',
        summary: [['Total houses', db.houses.length], ['Occupied', occ], ['Vacant', db.houses.length - occ],
                  ['Occupancy', db.houses.length ? Math.round(occ / db.houses.length * 100) + '%' : '0%']],
        head: ['House', 'Type', 'Location', 'Monthly rent', 'Status', 'Tenant'],
        rows: db.houses.map(function (x) { var t = DB.tenantOf(x.id); return [x.number, x.type, x.location, UI.kes(x.rent), x.status, t ? t.name : '—']; })
      };
    },
    tenants: function (db) {
      var owing = db.tenants.filter(function (t) { return DB.balanceFor(t.id) > 0; }).length;
      return {
        title: 'Tenant report',
        summary: [['Tenants', db.tenants.length], ['Owing rent', owing], ['Total owed', UI.kes(sum(db.tenants, function (t) { return DB.balanceFor(t.id); }))]],
        head: ['Name', 'Phone', 'Email', 'House', 'Move-in', 'Balance', 'Status'],
        rows: db.tenants.map(function (t) {
          var hs = DB.houseOf(t.id), bal = DB.balanceFor(t.id);
          return [t.name, t.phone, t.email || '—', hs ? hs.number : '—', UI.date(t.moveIn), UI.kes(bal), DB.isOverdue(t.id) ? 'overdue' : (bal > 0 ? 'pending' : 'paid')];
        })
      };
    },
    payments: function (db) {
      var paid = db.payments.filter(function (p) { return p.status === 'paid'; });
      var pend = db.payments.filter(function (p) { return p.status === 'pending'; });
      return {
        title: 'Payment report',
        summary: [['Collected', UI.kes(sum(paid, function (p) { return p.amount; }))], ['Awaiting confirmation', UI.kes(sum(pend, function (p) { return p.amount; }))],
                  ['Payments', db.payments.length],
                  ['Outstanding', UI.kes(sum(db.tenants, function (t) { return DB.balanceFor(t.id); }))]],
        head: ['Date', 'Tenant', 'House', 'Amount', 'Method', 'Reference', 'Status'],
        rows: db.payments.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; })
          .map(function (p) { return [UI.date(p.date), p.tenantName, p.houseNumber, UI.kes(p.amount), p.method, p.ref || '—', p.status]; })
      };
    },
    maintenance: function (db) {
      function n(s) { return db.requests.filter(function (r) { return r.status === s; }).length; }
      return {
        title: 'Maintenance report',
        summary: [['Requests', db.requests.length], ['Pending', n('pending')], ['In progress', n('in progress')], ['Resolved', n('resolved')]],
        head: ['Date', 'Tenant', 'House', 'Category', 'Priority', 'Description', 'Status'],
        rows: db.requests.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; })
          .map(function (r) { return [UI.date(r.date), r.tenantName, r.houseNumber, r.category, r.priority, r.desc, r.status]; })
      };
    }
  };

  var data;
  function render() {
    data = REPORTS[current](DB.get());
    $('reportTitle').textContent = data.title;
    $('reportDate').textContent = 'Generated ' + UI.date(DB.today());
    var s = $('summary'); s.textContent = '';
    data.summary.forEach(function (x) {
      s.appendChild(h('div', { 'class': 'stat' }, [h('div', { 'class': 'label' }, [x[0]]), h('div', { 'class': 'value' }, [String(x[1])])]));
    });
    var th = $('reportHead'); th.textContent = '';
    th.appendChild(h('tr', {}, data.head.map(function (c) { return h('th', {}, [c]); })));
    var tb = $('reportBody'); tb.textContent = '';
    data.rows.forEach(function (r) { tb.appendChild(h('tr', {}, r.map(function (c) { return UI.cell(String(c)); }))); });
    $('reportEmpty').hidden = data.rows.length > 0;
    document.querySelectorAll('.tabs button').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-tab') === current); });
  }

  document.querySelectorAll('.tabs button').forEach(function (b) {
    b.addEventListener('click', function () { current = b.getAttribute('data-tab'); render(); });
  });
  $('printBtn').addEventListener('click', function () { window.print(); });
  $('csvBtn').addEventListener('click', function () { UI.csv(current + '-report.csv', data.head, data.rows); });

  render();
})();
