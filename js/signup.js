// Sends newsletter signups to Kit without leaving the page, then shows a thank-you message.
// If anything goes wrong, the form falls back to a normal submit, so no signup is lost.
document.querySelectorAll('form.signup-form').forEach(function (form) {
  form.addEventListener('submit', function (e) {
    if (!window.fetch || !window.FormData) return;           // very old browser: normal submit
    e.preventDefault();
    var button = form.querySelector('button');
    var status = form.querySelector('.form-status');
    button.disabled = true;
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r; })
      .then(function () {
        form.classList.add('done');
        status.textContent = form.dataset.success;
        status.setAttribute('tabindex', '-1');
        status.focus();
      })
      .catch(function () { form.submit(); });                // fallback: Kit's own confirmation page
  });
});
