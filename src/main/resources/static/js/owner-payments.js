DB.ready.then(function () {
(function () {
  if (!UI.guard('owner')) return;
  var $ = UI.$, h = UI.h, tab = 'invoices';

  function match(q, text) { return text.toLowerCase().indexOf(q) > -1; }

  function render() {
    var q = $('search').value.trim().toLowerCase(), db = DB.get();

    var ib = $('invoicesBody'); ib.textContent = '';
    var inv = db.invoices.filter(function (i) { return match(q, i.tenantName + ' ' + i.houseNumber + ' ' + i.no); })
      .sort(function (a, b) { return a.issued < b.issued ? 1 : -1; });
    inv.forEach(function (i) {
      ib.appendChild(h('tr', {}, [
        UI.cell(i.no), UI.cell(i.tenantName), UI.cell(i.houseNumber), UI.cell(i.period), UI.cell(UI.kes(i.amount)),
        UI.cell(UI.kes(i.paid)), UI.cell(UI.date(i.due)), UI.cell([UI.badge(DB.invStatus(i))]),
        UI.cell([h('button', { 'class': 'btn-small', type: 'button', onclick: function () { Invoices.view(i); } }, ['View'])])
      ]));
    });
    $('invoicesEmpty').hidden = inv.length > 0;

    var pb = $('paymentsBody'); pb.textContent = '';
    var pay = db.payments.filter(function (p) { return match(q, p.tenantName + ' ' + p.houseNumber + ' ' + p.ref); })
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    pay.forEach(function (p) {
      var action = p.status === 'pending'
        ? h('button', { 'class': 'btn-small', type: 'button', onclick: function () {
          DB.confirmPayment(p.id).then(function (r) { UI.toast(r.error || 'Payment confirmed.'); render(); });
        } }, ['Confirm received'])
        : '';
      pb.appendChild(h('tr', {}, [
        UI.cell(UI.date(p.date)), UI.cell(p.tenantName), UI.cell(p.houseNumber), UI.cell(UI.kes(p.amount)),
        UI.cell(p.method), UI.cell(p.ref || '—'), UI.cell([UI.badge(p.status)]), UI.cell([action])
      ]));
    });
    $('paymentsEmpty').hidden = pay.length > 0;
  }
  Invoices.onSent = render;

  function setTab(name) {
    tab = name;
    $('panel-invoices').hidden = name !== 'invoices';
    $('panel-payments').hidden = name !== 'payments';
    document.querySelectorAll('.tabs button').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-tab') === name);
    });
  }
  document.querySelectorAll('.tabs button').forEach(function (b) {
    b.addEventListener('click', function () { setTab(b.getAttribute('data-tab')); });
  });

  $('search').addEventListener('input', render);
  $('sendInvoiceBtn').addEventListener('click', function () { Invoices.open(); });

  $('invoiceAllBtn').addEventListener('click', function () {
    var n = DB.get().tenants.length, period = UI.monthName(1);
    if (!n) return UI.toast('Add a tenant first, then you can invoice them.');
    UI.confirm('Invoice all tenants?', 'Send ' + period + ' rent invoices (due in 7 days) to ' + n + ' tenant' + (n === 1 ? '' : 's') + '. Anyone who already has one is skipped.', 'Send invoices').then(function (ok) {
      if (!ok) return;
      DB.invoiceAll(period, UI.addDays(7)).then(function (made) {
        if (made && made.error) return UI.toast(made.error);
        UI.toast(made ? made + ' invoice' + (made === 1 ? '' : 's') + ' sent for ' + period + '.' : 'Everyone already has a ' + period + ' invoice.');
        setTab('invoices'); render();
      });
    });
  });

  /* Record a payment the owner received (cash, bank, M-Pesa) */
  $('recordPayBtn').addEventListener('click', function () {
    var sel = $('pTenant'); sel.textContent = '';
    DB.get().tenants.forEach(function (t) { sel.appendChild(h('option', { value: t.id }, [t.name + ' (balance ' + UI.kes(DB.balanceFor(t.id)) + ')'])); });
    if (!sel.options.length) return UI.toast('Add a tenant first, then you can record payments.');
    $('pAmount').value = ''; $('pRef').value = ''; UI.err('payError', ''); UI.open('payDialog');
  });

  $('payForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var tid = $('pTenant').value, amount = Number($('pAmount').value), method = $('pMethod').value, ref = $('pRef').value.trim();
    var bal = DB.balanceFor(tid);
    if (!(amount > 0)) return UI.err('payError', 'Enter the amount received as a number greater than 0.');
    if (bal === 0) return UI.err('payError', 'This tenant has no balance due. Send an invoice first.');
    if (amount > bal) return UI.err('payError', 'The amount is more than the balance of ' + UI.kes(bal) + '. Enter ' + UI.kes(bal) + ' or less.');
    if (method !== 'Cash' && !ref) return UI.err('payError', 'Enter the transaction reference for this ' + method + ' payment.');
    DB.addPayment({ tenantId: tid, amount: amount, method: method, ref: ref }).then(function (r) {
      if (r.error) return UI.err('payError', r.error);
      UI.close('payDialog'); UI.toast('Payment of ' + UI.kes(amount) + ' recorded.'); setTab('payments'); render();
    });
  });

  render();
})();
});
