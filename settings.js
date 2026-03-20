/* ===== SETTINGS SCRIPTS ===== */

const API = 'http://localhost:3000';
  const SETTINGS_KEY = 'smart_retail_settings';

  // ── Apply theme instantly ─────────────────────
  function applyTheme(theme, accent) {
    if (theme === 'light') {
      document.body.style.background = '#f1f5f9';
      document.body.style.color = '#0f172a';
      document.querySelectorAll('.card,.danger-card,.tabs').forEach(el => {
        el.style.background = '#ffffff'; el.style.borderColor = '#e2e8f0';
      });
      document.querySelector('.sidebar').style.background = 'rgba(241,245,249,0.98)';
    } else if (theme === 'blue') {
      document.body.style.background = '#0d1f3c';
      document.body.style.color = '#e5e7eb';
      document.querySelectorAll('.card,.danger-card,.tabs').forEach(el => {
        el.style.background = 'rgba(13,31,60,0.9)'; el.style.borderColor = 'rgba(59,130,246,0.2)';
      });
      document.querySelector('.sidebar').style.background = 'rgba(10,20,50,0.98)';
    } else {
      document.body.style.background = '#0a0e1a';
      document.body.style.color = '#e5e7eb';
      document.querySelectorAll('.card,.danger-card,.tabs').forEach(el => {
        el.style.background = ''; el.style.borderColor = '';
      });
      document.querySelector('.sidebar').style.background = 'rgba(15,23,42,0.95)';
    }
    if (accent) {
      document.querySelectorAll('.btn-save-all,.btn-section-save').forEach(el => {
        el.style.background = `linear-gradient(135deg,${accent},${accent}bb)`;
      });
    }
  }

  // ── Load saved settings ───────────────────────
  function loadSettings() {
    // Set ₹ as default currency if not already set
    if (!localStorage.getItem('currency_symbol')) {
      localStorage.setItem('currency_symbol', '₹');
      localStorage.setItem('currency_rate', '1');
      localStorage.setItem('currency_label', '₹ INR');
    }
    // Fix wrong rate: if symbol is ₹ but rate is > 1, reset to 1
    const storedSym  = localStorage.getItem('currency_symbol');
    const storedRate = parseFloat(localStorage.getItem('currency_rate') || '1');
    if (storedSym === '₹' && storedRate > 1) {
      localStorage.setItem('currency_rate', '1');
    }
    if (storedSym === '$' && storedRate >= 1) {
      localStorage.setItem('currency_rate', '0.012');
    }

    const s     = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    const owner = localStorage.getItem('owner_email') || localStorage.getItem('ownerEmail') || '';

    if (s.name)     document.getElementById('p-name').value     = s.name;
    if (s.username) document.getElementById('p-username').value = s.username;
    if (s.email)    document.getElementById('p-email').value    = s.email;
    else if (owner) document.getElementById('p-email').value    = owner;
    if (s.phone)    document.getElementById('p-phone').value    = s.phone;
    if (s.bio)      document.getElementById('p-bio').value      = s.bio;

    const name = s.name || owner.split('@')[0] || 'A';
    document.getElementById('profile-avatar').textContent        = name[0].toUpperCase();
    document.getElementById('profile-display-name').textContent  = s.name || name;
    document.getElementById('profile-display-email').textContent = s.email || owner;

    const n = s.notifications || {};
    ['lowstock','neworder','signup','daily','payment','browser','sound'].forEach(k => {
      const el = document.getElementById('n-'+k);
      if (el && n[k] !== undefined) el.checked = n[k];
    });

    if (s.emailUser)  document.getElementById('e-gmail').value  = s.emailUser;
    if (s.adminEmail) document.getElementById('e-admin').value  = s.adminEmail;
    checkEmailStatus();

    // Restore appearance dropdowns
    if (s.currency)   document.getElementById('a-currency').value = s.currency;
    if (s.dateFormat) document.getElementById('a-date').value     = s.dateFormat;
    if (s.language)   document.getElementById('a-lang').value     = s.language;
    if (s.perPage)    document.getElementById('a-perpage').value  = s.perPage;

    // Restore theme & accent
    const theme  = s.theme  || 'dark';
    const accent = s.accent || '#3b82f6';
    document.querySelectorAll('.theme-card').forEach(c => {
      c.classList.toggle('selected', c.dataset.theme === theme);
    });
    document.querySelectorAll('.accent-dot').forEach(d => {
      d.classList.toggle('selected', d.dataset.color === accent);
    });
    applyTheme(theme, accent);

    document.getElementById('sys-owner').textContent = owner || 'Not logged in';
    document.getElementById('sys-login').textContent = new Date().toLocaleString();
    loadSystemCounts();
  }

  async function loadSystemCounts() {
    try {
      const res  = await fetch(`${API}/api/stats/all`);
      const data = await res.json();
      document.getElementById('sys-products').textContent  = data.products  || '—';
      document.getElementById('sys-orders').textContent    = data.orders    || '—';
      document.getElementById('sys-customers').textContent = data.customers || '—';
      document.getElementById('sys-backend').innerHTML = '<span style="color:#22c55e">✅ Online</span>';
      document.getElementById('sys-db').innerHTML      = '<span style="color:#22c55e">✅ Connected</span>';
    } catch {
      document.getElementById('sys-backend').innerHTML = '<span style="color:#ef4444">❌ Offline</span>';
      document.getElementById('sys-db').innerHTML      = '<span style="color:#ef4444">❌ Disconnected</span>';
    }
  }

  function switchTab(name) {
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.getElementById('tab-' + name).classList.add('active');
  }

  // ── Theme — applies INSTANTLY ─────────────────
  function selectTheme(el, theme) {
    document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    const s = { ...getSetting(), theme };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    applyTheme(theme, s.accent || '#3b82f6');
    showToast('🎨 Theme "' + theme + '" applied!');
  }

  // ── Accent — applies INSTANTLY ────────────────
  function selectAccent(el, color) {
    document.querySelectorAll('.accent-dot').forEach(d => d.classList.remove('selected'));
    el.classList.add('selected');
    const s = { ...getSetting(), accent: color };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    applyTheme(s.theme || 'dark', color);
    showToast('🎨 Accent color applied!');
  }

  function checkEmailStatus() {
    const gmail = document.getElementById('e-gmail').value.trim();
    const pass  = document.getElementById('e-apppass').value.trim();
    const badge = document.getElementById('email-status-badge');
    if (gmail && pass.length >= 16) {
      badge.className = 'email-status configured'; badge.textContent = '✅ Configured';
    } else {
      badge.className = 'email-status not-configured'; badge.textContent = '⚠️ Not Configured';
    }
  }

  async function testEmail() {
    showToast('📨 Sending test email...');
    try {
      const res  = await fetch(`${API}/api/notify/new-signup`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({new_user_name:'Test User',new_user_email:'test@smartretail.com'})
      });
      const data = await res.json();
      showToast(data.sent ? '✅ Test email sent!' : '❌ Email failed — check credentials');
    } catch { showToast('❌ Backend offline — run npm start'); }
  }

  function changeAvatar() { showToast('📷 Avatar upload — coming soon'); }

  // ── Password change — REAL ────────────────────
  function saveProfile() {
    const name     = document.getElementById('p-name').value.trim();
    const oldPass  = document.getElementById('p-old-pass').value;
    const newPass  = document.getElementById('p-new-pass').value;
    const confPass = document.getElementById('p-confirm-pass').value;

    if (newPass || confPass || oldPass) {
      if (!oldPass) { showToast('❌ Enter your current password'); return; }
      const saved = JSON.parse(localStorage.getItem('user') || '{}');
      if (saved.password && saved.password !== oldPass) {
        showToast('❌ Current password is incorrect!'); return;
      }
      if (newPass.length < 8) { showToast('❌ New password must be 8+ characters'); return; }
      if (newPass !== confPass) { showToast('❌ Passwords do not match!'); return; }
      const user = { ...saved, password: newPass };
      localStorage.setItem('user', JSON.stringify(user));
      document.getElementById('p-old-pass').value   = '';
      document.getElementById('p-new-pass').value   = '';
      document.getElementById('p-confirm-pass').value = '';
      showToast('🔐 Password changed successfully!');
    }

    const s = { ...getSetting(), name,
      username: document.getElementById('p-username').value,
      email:    document.getElementById('p-email').value,
      phone:    document.getElementById('p-phone').value,
      bio:      document.getElementById('p-bio').value,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    if (name) {
      document.getElementById('profile-avatar').textContent       = name[0].toUpperCase();
      document.getElementById('profile-display-name').textContent = name;
      document.getElementById('profile-display-email').textContent= document.getElementById('p-email').value;
    }
    if (!newPass) showToast('✅ Profile saved!');
  }

  function saveNotifications() {
    const s = { ...getSetting(), notifications: {
      lowstock: document.getElementById('n-lowstock').checked,
      neworder: document.getElementById('n-neworder').checked,
      signup:   document.getElementById('n-signup').checked,
      daily:    document.getElementById('n-daily').checked,
      payment:  document.getElementById('n-payment').checked,
      browser:  document.getElementById('n-browser').checked,
      sound:    document.getElementById('n-sound').checked,
    }};
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    showToast('✅ Notifications saved!');
  }

  function saveAppearance() {
    const currencyVal = document.getElementById('a-currency').value;
    const symbolMap = { '₹ INR':'₹', '$ USD':'$', '€ EUR':'€', '£ GBP':'£' };
    const symbol = symbolMap[currencyVal] || '₹';

    // Conversion rates FROM INR (base currency)
    // DB prices are in USD. Convert from USD to selected currency.
    // DB prices are in ₹ INR — convert to other currencies
    const rateMap = {
      '₹ INR': 1,       // base — show as-is
      '$ USD': 0.012,   // 1₹ = $0.012  (so ₹2000 = $24)
      '€ EUR': 0.011,   // 1₹ = €0.011
      '£ GBP': 0.0096,  // 1₹ = £0.0096
    };
    const rate = rateMap[currencyVal] || 1;

    localStorage.setItem('currency_symbol', symbol);
    localStorage.setItem('currency_label',  currencyVal);
    localStorage.setItem('currency_rate',   rate);  // ← store rate

    const s = { ...getSetting(),
      dateFormat: document.getElementById('a-date').value,
      currency:   currencyVal,
      language:   document.getElementById('a-lang').value,
      perPage:    document.getElementById('a-perpage').value,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    showToast(`✅ Currency set to ${symbol}`);
  }

  function applyCurrencySymbol(symbol) {
    // Update all elements that show currency on the page
    document.querySelectorAll('[data-currency]').forEach(el => {
      const raw = el.dataset.currency;
      el.textContent = symbol + parseFloat(raw).toLocaleString('en-IN', {minimumFractionDigits:2});
    });
  }

  function saveEmail() {
    const s = { ...getSetting(),
      emailUser:  document.getElementById('e-gmail').value,
      adminEmail: document.getElementById('e-admin').value,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    showToast('✅ Email config saved!');
  }

  function saveAll() {
    saveProfile(); saveNotifications(); saveAppearance(); saveEmail();
    showToast('✅ All settings saved!');
  }

  function getSetting() {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  }

  // ── Danger Zone — REAL backend calls ─────────
  function dangerAction(type) {
    const phrase = type === 'orders' ? 'DELETE_ALL_ORDERS' : 'DELETE_ALL_CUSTOMERS';
    const entered = prompt(`⚠️ DANGER! This permanently deletes ALL ${type}.\n\nType exactly to confirm:\n${phrase}`);
    if (entered !== phrase) { showToast('❌ Cancelled — phrase did not match'); return; }

    const btn = event.target;
    btn.textContent = '⏳ Deleting...'; btn.disabled = true;

    fetch(`${API}/api/danger/clear-${type}`, {
      method: 'DELETE',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ confirm: phrase })
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        showToast(`🗑️ All ${type} deleted from database!`);
        loadSystemCounts();
      } else {
        showToast('❌ ' + (data.error || 'Error occurred'));
      }
    })
    .catch(() => showToast('❌ Backend not reachable — run npm start'))
    .finally(() => {
      const label = type.charAt(0).toUpperCase() + type.slice(1);
      btn.textContent = 'Clear ' + label; btn.disabled = false;
    });
  }

  function resetSettings() {
    if (!confirm('Reset ALL settings to defaults?')) return;
    localStorage.removeItem(SETTINGS_KEY);
    showToast('✅ Settings reset!');
    setTimeout(() => location.reload(), 1000);
  }

  function logoutAll() {
    if (!confirm('Logout from all sessions?')) return;
    localStorage.clear();
    window.location.href = 'login.html';
  }

  function showToast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div'); t.id = 'toast';
      t.style.cssText = `position:fixed;bottom:28px;right:28px;z-index:9999;
        background:rgba(15,23,42,0.97);border:1px solid #22c55e;color:#e5e7eb;
        padding:14px 22px;border-radius:12px;font-size:14px;font-weight:600;
        box-shadow:0 8px 30px rgba(0,0,0,0.4);animation:slideUp 0.3s ease;display:none;`;
      document.body.appendChild(t);
    }
    t.textContent = msg; t.style.display = 'block';
    clearTimeout(t._t);
    t._t = setTimeout(() => t.style.display = 'none', 3500);
  }

  loadSettings();