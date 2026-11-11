/* DEMO ONLY - fakes authentication against the demo store. Delete this file
   and its <script> tags once the Spring Boot login is connected. */
(function () {
  var form = document.getElementById('loginForm');
  var errorBox = document.getElementById('demoError');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var u = form.username.value.trim(), p = form.password.value, session = null, page = null;

    if (u === 'owner01' && p === 'admin123') {
      session = { role: 'owner', name: 'Property Owner' }; page = 'admin-dashboard.html';
    } else {
      var t = DB.get().tenants.filter(function (x) { return x.username === u && x.password === p; })[0];
      if (t) { session = { role: 'tenant', name: t.name, tenantId: t.id }; page = 'tenant-dashboard.html'; }
    }

    if (session) {
      try { sessionStorage.setItem('demoUser', JSON.stringify(session)); } catch (err) {}
      window.location.href = page;
    } else {
      errorBox.style.display = 'block';
    }
  });
})();
