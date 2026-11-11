/* Signs in through the server. The server checks the password and decides
   which dashboard this person gets. */
(function () {
  var form = document.getElementById('loginForm');
  var errorBox = document.getElementById('loginError');
  if (!form) return;

  function csrf() {
    var m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
    return m ? decodeURIComponent(m[1]) : '';
  }

  /* Visiting any URL makes the server set the CSRF cookie that the login request must send back. */
  var primed = fetch('/api/auth/me', { credentials: 'same-origin' }).then(function (res) {
    if (res.ok) return res.json().then(go);          // already signed in
  }).catch(function () {});

  function go(me) {
    location.href = me.role === 'owner' ? 'admin-dashboard.html' : 'tenant-dashboard.html';
  }
  function fail(msg) { errorBox.textContent = msg; errorBox.hidden = false; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorBox.hidden = true;
    primed.then(function () {
      return fetch('/api/auth/login', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-XSRF-TOKEN': csrf(), 'Accept': 'application/json' },
        body: new URLSearchParams({ username: form.username.value.trim(), password: form.password.value })
      });
    }).then(function (res) {
      if (res.ok) return res.json().then(go);
      if (res.status === 401) fail('Incorrect username or password. Please try again.');
      else if (res.status === 403) fail('The sign-in was blocked by the security check. Press Ctrl+F5 to reload the page and try again.');
      else fail('The server had a problem (code ' + res.status + '). Look at the window where the application is running for the error.');
    }).catch(function () { fail('Cannot reach the server. Is the application running?'); });
  });
})();
