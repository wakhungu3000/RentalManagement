DB.ready.then(function () {
(function () {
  if (!UI.guard('owner')) return;
  var $ = UI.$, h = UI.h, db = DB.get();

  var occupied = db.houses.filter(function (x) { return x.status === 'occupied'; }).length;
  $('statTotal').textContent = db.houses.length;
  $('statOccupied').textContent = occupied;
  $('statVacant').textContent = db.houses.length - occupied;
  $('statOverdue').textContent = db.tenants.filter(function (t) { return DB.isOverdue(t.id); }).length;
  $('statOpen').textContent = db.requests.filter(function (r) { return r.status !== 'resolved'; }).length;

  var body = $('recentBody'); body.textContent = '';
  db.payments.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }).slice(0, 6).forEach(function (p) {
    body.appendChild(h('tr', {}, [
      UI.cell(p.tenantName), UI.cell(p.houseNumber), UI.cell(UI.kes(p.amount)), UI.cell(UI.date(p.date)), UI.cell([UI.badge(p.status)])
    ]));
  });
  $('recentEmpty').hidden = db.payments.length > 0;
})();
});
