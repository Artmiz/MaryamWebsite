/* maryamghodrat.com — newsletter signups (Kit form 10128531)
   1. Sends every signup form on the page to Kit without leaving the page.
   2. Shows a small subscription pop-up once per visitor, a few seconds after they arrive.
      It is not shown again for 30 days after it is closed, and never again after someone subscribes.
   If anything goes wrong, forms fall back to a normal submit, so no signup is lost. */
(function () {
  var KIT = 'https://app.kit.com/forms/10128531/subscriptions';
  var DELAY_MS = 8000;                       // how long to wait before the pop-up appears
  var SNOOZE_DAYS = 30;                      // how long to wait after someone closes it
  var KEY_SUBSCRIBED = 'mg_subscribed';
  var KEY_DISMISSED = 'mg_popup_closed';

  function store(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }
  function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }

  // ---------- send a form to Kit ----------
  function bind(form) {
    form.addEventListener('submit', function (e) {
      if (!window.fetch || !window.FormData) return;          // very old browser: normal submit
      e.preventDefault();
      var button = form.querySelector('button[type="submit"]');
      var status = form.querySelector('.form-status');
      button.disabled = true;
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); })
        .then(function () {
          store(KEY_SUBSCRIBED, '1');
          form.classList.add('done');
          status.textContent = form.dataset.success;
          status.setAttribute('tabindex', '-1');
          status.focus();
        })
        .catch(function () { store(KEY_SUBSCRIBED, '1'); form.submit(); });   // fallback: Kit's own page
    });
  }

  // ---------- the pop-up ----------
  var TEXT = {
    en: {
      title: 'Stay in touch',
      body: 'Be the first to hear about the English translation of Maryam’s novel, readings, and events.',
      label: 'Email address', button: 'Subscribe', close: 'Close', later: 'No thanks',
      ok: 'Thank you! Please check your inbox (and your spam folder) to confirm your subscription.'
    },
    fa: {
      title: 'در ارتباط بمانیم',
      body: 'نخستین کسی باشید که از ترجمه‌ی انگلیسی رمان مریم، کتاب‌خوانی‌ها و رویدادها باخبر می‌شود.',
      label: 'نشانی ایمیل', button: 'عضویت', close: 'بستن', later: 'نه، سپاس',
      ok: 'سپاس! لطفاً ایمیل خود (و پوشه‌ی هرزنامه) را بررسی کنید و عضویتتان را تأیید کنید.'
    }
  };

  function shouldShow() {
    if (!window.HTMLDialogElement) return false;              // browser without pop-up support
    if (read(KEY_SUBSCRIBED)) return false;
    var closed = parseInt(read(KEY_DISMISSED) || '0', 10);
    return !closed || (Date.now() - closed) > SNOOZE_DAYS * 864e5;
  }

  function addStyles() {
    var css =
      '.mg-pop{border:0;padding:0;border-radius:6px;background:var(--bg,#F6F2EA);color:var(--ink,#2F3A34);' +
      'width:min(460px,calc(100vw - 32px));box-shadow:0 12px 40px rgba(47,58,52,.25)}' +
      '.mg-pop::backdrop{background:rgba(47,58,52,.45)}' +
      '.mg-pop .inner{padding:36px 32px 28px;display:grid;gap:14px}' +
      '.mg-pop h2{margin:0;font-size:30px}' +
      '.mg-pop .x{position:absolute;top:10px;inset-inline-end:10px;width:44px;height:44px;border:0;background:none;' +
      'font-size:28px;line-height:1;color:var(--muted,#535C56);cursor:pointer;border-radius:4px}' +
      '.mg-pop .x:hover{color:var(--ink,#2F3A34)}' +
      '.mg-pop .later{justify-self:center;background:none;border:0;font:inherit;font-size:16px;color:var(--muted,#535C56);' +
      'text-decoration:underline;cursor:pointer;padding:8px}' +
      '.mg-pop .signup-form{display:grid;gap:10px}' +
      '@media (prefers-reduced-motion:no-preference){.mg-pop[open]{animation:mgIn .25s ease-out}}' +
      '@keyframes mgIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}';
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
  }

  function showPopup() {
    var lang = document.documentElement.lang === 'fa' ? 'fa' : 'en';
    var t = TEXT[lang];
    addStyles();
    var d = document.createElement('dialog');
    d.className = 'mg-pop';
    d.setAttribute('aria-labelledby', 'mg-pop-title');
    d.innerHTML =
      '<button type="button" class="x" aria-label="' + t.close + '">&times;</button>' +
      '<div class="inner">' +
        '<h2 id="mg-pop-title">' + t.title + '</h2>' +
        '<p class="muted">' + t.body + '</p>' +
        '<form class="signup-form" action="' + KIT + '" method="post">' +
          '<label for="mg-pop-email">' + t.label + '</label>' +
          '<div class="row">' +
            '<input id="mg-pop-email" name="email_address" type="email" autocomplete="email" placeholder="you@example.com" dir="ltr" required>' +
            '<button type="submit" class="btn">' + t.button + '</button>' +
          '</div>' +
          '<p class="form-status" role="status" aria-live="polite"></p>' +
        '</form>' +
        '<button type="button" class="later">' + t.later + '</button>' +
      '</div>';
    d.querySelector('form').dataset.success = t.ok;
    document.body.appendChild(d);
    bind(d.querySelector('form'));

    function close() { d.close(); }
    d.querySelector('.x').addEventListener('click', close);
    d.querySelector('.later').addEventListener('click', close);
    d.addEventListener('click', function (e) { if (e.target === d) close(); });   // click outside
    d.addEventListener('close', function () { if (!read(KEY_SUBSCRIBED)) store(KEY_DISMISSED, String(Date.now())); });

    d.showModal();
    d.querySelector('#mg-pop-email').focus();
  }

  document.querySelectorAll('form.signup-form').forEach(bind);
  if (shouldShow()) setTimeout(function () { if (shouldShow()) showPopup(); }, DELAY_MS);
})();
