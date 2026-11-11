(function () {
  if (!UI.guard('owner')) return;
  var $ = UI.$, h = UI.h;

  function render() {
    var q = $('search').value.trim().toLowerCase(), body = $('tenantsBody'); body.textContent = '';
    var rows = DB.get().tenants.filter(function (t) {
      var hs = DB.houseOf(t.id);
      return (t.name + ' ' + t.phone + ' ' + (hs ? hs.number : '')).toLowerCase().indexOf(q) > -1;
    });
    rows.forEach(function (t) {
      var hs = DB.houseOf(t.id), bal = DB.balanceFor(t.id);
      body.appendChild(h('tr', {}, [
        UI.cell(t.name), UI.cell(t.phone), UI.cell(hs ? hs.number : '—'), UI.cell(UI.date(t.moveIn)),
        UI.cell(bal > 0 ? UI.kes(bal) : 'Cleared'),
        UI.cell([UI.badge(DB.isOverdue(t.id) ? 'overdue' : (bal > 0 ? 'pending' : 'paid'))]),
        UI.cell([
          h('button', { 'class': 'btn-small', type: 'button', onclick: function () { Invoices.open(t.id); } }, ['Send invoice']),
          h('button', { 'class': 'btn-small btn-small-danger', type: 'button', onclick: function () { remove(t, hs, bal); } }, ['Remove'])
        ])
      ]));
    });
    $('tenantsEmpty').hidden = rows.length > 0;
  }
  Invoices.onSent = render;

  function openAdd() {
    var sel = $('tHouse'); sel.textContent = '';
    var free = DB.get().houses.filter(function (x) { return x.status === 'available'; });
    free.forEach(function (x) { sel.appendChild(h('option', { value: x.id }, [x.number + ' · ' + x.type + ' · ' + UI.kes(x.rent)])); });
    ['tName', 'tPhone', 'tEmail', 'tIdNo'].forEach(function (id) { $(id).value = ''; });
    $('tMoveIn').value = DB.today(); $('tInvoice').checked = true;
    UI.err('tenantError', free.length ? '' : 'There are no vacant houses. Add a house first in House Management.');
    $('saveTenantBtn').disabled = !free.length;
    UI.open('tenantDialog');
  }

  function remove(t, hs, bal) {
    var text = t.name + ' will move out of ' + (hs ? hs.number : 'their house') + ', which becomes available. Their login stops working.' +
      (bal > 0 ? ' They still owe ' + UI.kes(bal) + '; payment history is kept.' : '');
    UI.confirm('Remove ' + t.name + '?', text, 'Remove tenant').then(function (ok) {
      if (!ok) return;
      DB.removeTenant(t.id); UI.toast(t.name + ' removed.'); render();
    });
  }

  $('addTenantBtn').addEventListener('click', openAdd);
  $('search').addEventListener('input', render);

  $('tenantForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = { name: $('tName').value.trim(), phone: $('tPhone').value.trim(), email: $('tEmail').value.trim(),
              idNo: $('tIdNo').value.trim(), houseId: $('tHouse').value, moveIn: $('tMoveIn').value };
    if (!f.name) return UI.err('tenantError', 'Enter the tenant’s full name.');
    if (!/^[0-9 +]{9,15}$/.test(f.phone)) return UI.err('tenantError', 'Enter a phone number with 9 to 15 digits, for example 0712 345 678.');
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) return UI.err('tenantError', 'Enter a valid email address, or leave it empty.');
    if (!f.houseId) return UI.err('tenantError', 'Choose a house for the tenant.');
    if (!f.moveIn) return UI.err('tenantError', 'Choose the move-in date.');
    var r = DB.addTenant(f);
    if (r.error) return UI.err('tenantError', r.error);

    var hs = DB.houseOf(r.item.id);
    if ($('tInvoice').checked && hs) {
      DB.sendInvoice({ tenantId: r.item.id, period: UI.monthName(0), amount: hs.rent, due: UI.addDays(7), note: 'First month’s rent' });
    }
    UI.close('tenantDialog');
    $('cName').textContent = r.item.name; $('cHouse').textContent = hs.number;
    $('cUser').textContent = r.item.username; $('cPass').textContent = r.item.password;
    UI.open('credDialog'); render();
  });

  render();
})();
