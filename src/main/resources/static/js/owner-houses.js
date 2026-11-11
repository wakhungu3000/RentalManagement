DB.ready.then(function () {
(function () {
  if (!UI.guard('owner')) return;
  var $ = UI.$, h = UI.h, editingId = null;

  function render() {
    var q = $('search').value.trim().toLowerCase(), f = $('statusFilter').value, body = $('housesBody');
    body.textContent = '';
    var rows = DB.get().houses.filter(function (x) {
      var hit = (x.number + ' ' + x.location + ' ' + x.type).toLowerCase().indexOf(q) > -1;
      return hit && (!f || x.status === f);
    });
    rows.forEach(function (x) {
      var t = DB.tenantOf(x.id);
      body.appendChild(h('tr', {}, [
        UI.cell(x.number), UI.cell(x.type), UI.cell(x.location), UI.cell(UI.kes(x.rent)),
        UI.cell([UI.badge(x.status)]), UI.cell(t ? t.name : '—'),
        UI.cell([
          h('button', { 'class': 'btn-small', type: 'button', onclick: function () { openForm(x); } }, ['Edit']),
          h('button', { 'class': 'btn-small btn-small-danger', type: 'button', onclick: function () { del(x); } }, ['Delete'])
        ])
      ]));
    });
    $('housesEmpty').hidden = rows.length > 0;
  }

  function openForm(x) {
    editingId = x ? x.id : null;
    $('houseDialogTitle').textContent = x ? 'Edit house ' + x.number : 'Add house';
    $('hNumber').value = x ? x.number : '';
    $('hType').value = x ? x.type : '2-bedroom apartment';
    $('hLocation').value = x ? x.location : '';
    $('hRent').value = x ? x.rent : '';
    UI.err('houseError', '');
    UI.open('houseDialog');
  }

  function del(x) {
    UI.confirm('Delete house ' + x.number + '?', 'This removes the house from your list. This cannot be undone.', 'Delete house').then(function (ok) {
      if (!ok) return;
      DB.deleteHouse(x.id).then(function (r) {
        if (r.error) UI.toast(r.error); else { UI.toast('House ' + x.number + ' deleted.'); render(); }
      });
    });
  }

  $('addHouseBtn').addEventListener('click', function () { openForm(null); });
  $('search').addEventListener('input', render);
  $('statusFilter').addEventListener('change', render);

  $('houseForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = { number: $('hNumber').value.trim(), type: $('hType').value, location: $('hLocation').value.trim(), rent: $('hRent').value };
    if (!f.number) return UI.err('houseError', 'Enter the house number, for example B-12.');
    if (!f.location) return UI.err('houseError', 'Enter where the house is, for example Milimani.');
    if (!(Number(f.rent) > 0)) return UI.err('houseError', 'Enter the monthly rent as a number greater than 0.');
    var wasEdit = !!editingId;
    (wasEdit ? DB.updateHouse(editingId, f) : DB.addHouse(f)).then(function (r) {
      if (r.error) return UI.err('houseError', r.error);
      UI.close('houseDialog');
      UI.toast(wasEdit ? 'House saved.' : 'House ' + f.number + ' added.');
      render();
    });
  });

  render();
})();
});
