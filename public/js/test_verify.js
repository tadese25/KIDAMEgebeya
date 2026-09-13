(() => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const uid = 'vx' + Date.now();
  const results = [];
  const check = (name, cond, extra) => results.push(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' :: ' + extra : ''}`);
  const q = (s) => document.querySelector(s);
  const setVal = (sel, v) => { const el = q(sel); if (el) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); } };
  const click = (sel) => { const el = q(sel); if (!el) { check('click ' + sel, false, 'missing'); return; } el.click(); };
  const submit = async (formSel) => {
    const f = q(formSel);
    if (!f) { check('submit ' + formSel, false, 'missing'); return; }
    f.requestSubmit();
    await sleep(500);
  };
  const waitFor = async (fn, ms = 6000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) { try { if (fn()) return true; } catch {} await sleep(120); }
    return false;
  };
  const inbox = async () => (await (await fetch('/api/dev/inbox')).json()).emails || [];

  setTimeout(async () => {
    try {
      // 1. register -> verify-pending card
      location.hash = '#/account';
      await sleep(400);
      click('[data-auth-tab="register"]');
      await sleep(150);
      setVal('#rName', 'Verify UI'); setVal('#rEmail', `${uid}@test.dev`); setVal('#rPass', 'pass12345');
      await submit('#registerForm');
      check('register shows verify-pending card', await waitFor(() => q('#resendVerifyBtn')));
      check('pending card shows email', document.body.textContent.includes(`${uid}@test.dev`));

      // resend adds a fresh email
      const m0 = await inbox();
      click('#resendVerifyBtn');
      await sleep(700);
      const m1 = await inbox();
      check('resend delivers new email', m1.length > m0.length);

      // 2. verify via link -> auto login
      const vt = m1[m1.length - 1].text.match(/token=([A-Za-z0-9_-]+)/)[1];
      location.hash = '#/verify?token=' + vt;
      check('verify lands on account view', await waitFor(() => location.hash.startsWith('#/account')));
      await sleep(300);
      check('signed in after verify', Nova.isLoggedIn());
      check('account chrome shows auth', q('#accountLink')?.classList.contains('is-auth'));

      // 3. logout
      click('#logoutBtn');
      await sleep(400);
      check('logout works', !Nova.isLoggedIn());

      // 4. unverified login -> EMAIL_UNVERIFIED panel
      const u2 = 'ux' + Date.now() + '@test.dev';
      location.hash = '#/account';
      await sleep(300);
      click('[data-auth-tab="register"]');
      await sleep(150);
      setVal('#rName', 'Unverified UI'); setVal('#rEmail', u2); setVal('#rPass', 'pass12345');
      await submit('#registerForm');
      check('second register pending', await waitFor(() => q('#resendVerifyBtn')));
      click('[data-clear-pending]');
      await sleep(250);
      setVal('#aEmail', u2); setVal('#aPass', 'pass12345');
      await submit('#loginForm');
      check('unverified login shows panel', await waitFor(() => q('#verifyPanel') && !q('#verifyPanel').hidden));
      check('login error is about verify', (q('#loginForm [data-msg]')?.textContent || '').includes('verify'));

      // 5. forgot/reset round trip
      location.hash = '#/forgot';
      await sleep(300);
      setVal('#forgotEmail', u2);
      await submit('#forgotForm');
      check('forgot success state', await waitFor(() => (q('#forgotForm [data-msg]')?.textContent || '').includes('reset link')));
      const mails = await inbox();
      const rmail = mails.filter((e) => String(e.subject).includes('Reset'));
      check('reset email sent', rmail.length >= 1);
      const rt = rmail[rmail.length - 1].text.match(/token=([A-Za-z0-9_-]+)/)[1];

      location.hash = '#/reset?token=' + rt;
      await sleep(300);
      setVal('#rNewPass', 'newpass456'); setVal('#rNewPass2', 'newpass456');
      await submit('#resetForm');
      check('reset lands on account', await waitFor(() => location.hash.startsWith('#/account')));

      // 6. new password works but verification still required
      click('[data-clear-pending]');
      await sleep(250);
      setVal('#aEmail', u2); setVal('#aPass', 'newpass456');
      await submit('#loginForm');
      check('reset password still gated by verify', await waitFor(() => q('#verifyPanel') && !q('#verifyPanel').hidden));
    } catch (err) {
      results.push('FAIL exception :: ' + (err && err.message));
    }

    const passed = results.filter((r) => r.startsWith('PASS')).length;
    const pre = document.createElement('pre');
    pre.id = 'testResults';
    pre.textContent = '#TOTAL ' + results.length + ' #PASS ' + passed + ' :: ' + results.join(' | ');
    document.body.appendChild(pre);
    const mark = document.createElement('div');
    mark.id = 'fsV';
    mark.textContent = 'TEST_VERIFY_DONE';
    document.body.appendChild(mark);
  }, 1200);
})();