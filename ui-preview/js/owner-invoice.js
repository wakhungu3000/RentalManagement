/* Send-invoice dialog + invoice viewer. Used by Tenant Management and Rent Payments. */
(function (w) {
  var $ = UI.$;
  var Invoices = {};

  Invoices.open = function (tenantId, period) {
    var sel = $('iTenant'); sel.textContent = '';
    DB.get().tenants.forEach(function (t) {
      var hs = DB.houseOf(t.id);
      sel.appendChild(UI.h('option', { value: t.id }, [t.name + (hs ? ' (' + hs.number + ')' : '')]));
    });
    if (!sel.options.length) { UI.toast('Add a tenant first, then you can invoice them.'); return; }
    if (tenantId) sel.value = tenantId;
    $('iPeriod').value = period || UI.monthName(1);
    $('iDue').value = UI.addDays(7);
    $('iNote').value = '';
    fillAmount(); UI.err('invError', ''); UI.open('invoiceDialog');
  };

  function fillAmount() {
    var hs = DB.houseOf($('iTenant').value);
    $('iAmount').value = hs ? hs.rent : '';
  }
  $('iTenant').addEventListener('change', fillAmount);

  $('invoiceForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = { tenantId: $('iTenant').value, period: $('iPeriod').value.trim(), amount: $('iAmount').value, due: $('iDue').value, note: $('iNote').value.trim() };
    if (!f.period) return UI.err('invError', 'Enter what the invoice covers, for example December 2026 rent.');
    if (!(Number(f.amount) > 0)) return UI.err('invError', 'Enter an amount greater than 0.');
    if (!f.due) return UI.err('invError', 'Choose a due date.');
    var r = DB.sendInvoice(f);
    UI.close('invoiceDialog');
    UI.toast('Invoice ' + r.item.no + ' sent to ' + r.item.tenantName + '.');
    if (Invoices.onSent) Invoices.onSent(r.item);
  });

  Invoices.view = function (inv) {
    var t = DB.find('tenants', inv.tenantId);
    $('ivNo').textContent = inv.no;
    $('ivIssued').textContent = UI.date(inv.issued);
    $('ivTenant').textContent = inv.tenantName;
    $('ivContact').textContent = t ? t.phone + ' · ' + t.email : '';
    $('ivHouse').textContent = inv.houseNumber;
    $('ivPeriod').textContent = inv.period;
    $('ivAmount').textContent = UI.kes(inv.amount);
    $('ivPaid').textContent = UI.kes(inv.paid);
    $('ivBalance').textContent = UI.kes(inv.amount - inv.paid);
    $('ivDue').textContent = UI.date(inv.due);
    $('ivNote').textContent = inv.note || '';
    var st = $('ivStatus'); st.textContent = ''; st.appendChild(UI.badge(DB.invStatus(inv)));
    UI.open('invoiceView');
  };
  $('printInvoiceBtn').addEventListener('click', UI.printInvoice);

  w.Invoices = Invoices;
})(window);
