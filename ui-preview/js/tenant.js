/* DEMO ONLY - the tenant screens read and write the shared demo store
   (js/demo-store.js), so what the owner sends (invoices, status updates)
   shows up here. Replace with controller data when the backend is ready. */
(function () {
  var session = UI.guard('tenant');
  if (!session) return;
  var $ = UI.$, h = UI.h;
  var tenant = DB.find('tenants', session.tenantId);
  if (!tenant) { try { sessionStorage.removeItem('demoUser'); } catch (e) {} location.replace('login.html'); return; }

  function render() {
    var house = DB.houseOf(tenant.id), bal = DB.balanceFor(tenant.id), due = DB.nextDue(tenant.id);
    $('tenantName').textContent = tenant.name;
    $('statRent').textContent = house ? UI.kes(house.rent) : '—';
    $('statBalance').textContent = UI.kes(bal);
    $('statDue').textContent = bal > 0 && due ? UI.date(due) : 'Nothing due';
    $('payBalance').textContent = UI.kes(bal);
    $('payAmount').max = bal;

    $('dHouse').textContent = house ? house.number : '—';
    $('dType').textContent = house ? house.type : '—';
    $('dLocation').textContent = house ? house.location : '—';
    $('dLease').textContent = UI.date(tenant.moveIn);

    var ib = $('invoiceBody'); ib.textContent = '';
    var invs = DB.tenantInvoices(tenant.id).sort(function (a, b) { return a.issued < b.issued ? 1 : -1; });
    invs.forEach(function (i) {
      ib.appendChild(h('tr', {}, [UI.cell(i.no), UI.cell(i.period), UI.cell(UI.kes(i.amount)), UI.cell(UI.kes(i.amount - i.paid)),
        UI.cell(UI.date(i.due)), UI.cell([UI.badge(DB.invStatus(i))])]));
    });
    $('invoiceEmpty').hidden = invs.length > 0;

    var hb = $('historyBody'); hb.textContent = '';
    var pays = DB.get().payments.filter(function (p) { return p.tenantId === tenant.id; }).reverse();
    pays.forEach(function (p) {
      hb.appendChild(h('tr', {}, [UI.cell(UI.date(p.date)), UI.cell(UI.kes(p.amount)), UI.cell(p.method), UI.cell(p.ref || '—'), UI.cell([UI.badge(p.status)])]));
    });
    $('historyEmpty').hidden = pays.length > 0;

    var mb = $('maintBody'); mb.textContent = '';
    var reqs = DB.get().requests.filter(function (r) { return r.tenantId === tenant.id; }).reverse();
    reqs.forEach(function (r) {
      mb.appendChild(h('tr', {}, [UI.cell(UI.date(r.date)), UI.cell(r.category), UI.cell(r.priority), UI.cell(r.desc), UI.cell([UI.badge(r.status)])]));
    });
    $('maintEmpty').hidden = reqs.length > 0;
  }

  /* ---------- Panels ---------- */
  var links = document.querySelectorAll('#tenantNav a');
  function show(name) {
    if (!$('panel-' + name)) name = 'rental';
    ['rental', 'pay', 'maintenance'].forEach(function (n) { $('panel-' + n).hidden = (n !== name); });
    links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-panel') === name); });
  }
  links.forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); show(a.getAttribute('data-panel')); history.replaceState(null, '', '#' + a.getAttribute('data-panel')); });
  });
  show(location.hash.replace('#', ''));

  /* ---------- Pay rent ---------- */
  $('payForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var amount = Number($('payAmount').value), bal = DB.balanceFor(tenant.id), method = $('payMethod').value, ref = $('payRef').value.trim();
    if (bal === 0) return UI.err('payError', 'You have nothing due right now. Your landlord will send an invoice when rent is due.');
    if (!(amount >= 1)) return UI.err('payError', 'Enter the amount you are paying, in whole shillings.');
    if (amount > bal) return UI.err('payError', 'The amount is more than your balance of ' + UI.kes(bal) + '. Enter ' + UI.kes(bal) + ' or less.');
    if (method !== 'Cash' && !ref) return UI.err('payError', 'Enter the transaction reference from your ' + method + ' receipt.');
    UI.err('payError', '');
    DB.addPayment({ tenantId: tenant.id, amount: amount, method: method, ref: ref, status: method === 'Cash' ? 'pending' : 'paid' });
    this.reset(); render(); show('rental');
    UI.toast(method === 'Cash' ? 'Payment recorded. Your landlord will confirm the cash.' : 'Payment received: ' + UI.kes(amount));
  });
  $('payReset').addEventListener('click', function () { UI.err('payError', ''); });

  /* ---------- Maintenance ---------- */
  $('maintForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var desc = $('mDesc').value.trim();
    if (desc.length < 10) return UI.err('mError', 'Describe the problem in at least 10 characters so the landlord knows what to fix.');
    UI.err('mError', '');
    DB.addRequest({ tenantId: tenant.id, category: $('mCategory').value, priority: $('mPriority').value, desc: desc });
    this.reset(); render(); UI.toast('Request sent to your landlord.');
  });

  render();
})();
