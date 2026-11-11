DB.ready.then(function () {
(function () {
  if (!UI.guard('owner')) return;
  var $ = UI.$, h = UI.h, STATUSES = ['pending', 'in progress', 'resolved'];

  function render() {
    var f = $('statusFilter').value, body = $('maintBody'); body.textContent = '';
    var rows = DB.get().requests.filter(function (r) { return !f || r.status === f; })
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    rows.forEach(function (r) {
      var sel = h('select', { 'class': 'status-select', 'aria-label': 'Status for ' + r.tenantName + ' ' + r.category },
        STATUSES.map(function (s) { var o = h('option', { value: s }, [s]); if (s === r.status) o.selected = true; return o; }));
      sel.addEventListener('change', function () {
        DB.setRequestStatus(r.id, sel.value).then(function (res) {
          UI.toast(res.error || 'Request marked ' + sel.value + '.'); render();
        });
      });
      body.appendChild(h('tr', {}, [
        UI.cell(UI.date(r.date)), UI.cell(r.tenantName), UI.cell(r.houseNumber), UI.cell(r.category),
        UI.cell([h('span', { 'class': r.priority === 'Urgent' ? 'urgent' : '' }, [r.priority])]),
        UI.cell(r.desc), UI.cell([UI.badge(r.status)]), UI.cell([sel])
      ]));
    });
    $('maintEmpty').hidden = rows.length > 0;
  }
  $('statusFilter').addEventListener('change', render);
  render();
})();
});
