/* ===== LOGIN SCRIPTS ===== */

const API_URL = 'https://smart-retail-backend-kvfj.onrender.com';

    // ── Hardcoded demo credentials (change these to yours) ──
    const VALID_EMAIL    = 'admin@smartretail.com';
    const VALID_PASSWORD = 'admin123';

    function showError(msg) {
      let el = document.getElementById('login-error');
      if (!el) {
        el = document.createElement('div');
        el.id = 'login-error';
        el.style.cssText = 'color:#ef4444;font-size:13px;margin-top:8px;text-align:center;font-weight:600;';
        document.querySelector('.login-card form').appendChild(el);
      }
      el.textContent = msg;
    }

    async function handleLogin(event) {
      event.preventDefault();
      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      if (!email || !password) { showError('Please fill in all fields'); return; }
      if (!email.includes('@')) { showError('Enter a valid email address'); return; }

      try {
        // Try DB login first
        const res  = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.success) {
          localStorage.setItem('owner_email',     data.email);
          localStorage.setItem('owner_name',      data.name);
          localStorage.setItem('user_role', data.role || 'user');  // admin/manager/user
          localStorage.setItem('currency_symbol', '₹');
          localStorage.setItem('currency_rate',   '1');
          await fetch(`${API_URL}/api/automation/set-owner`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          }).catch(() => {});
          window.location.href = 'dashboard_dynamic.html';
        } else {
          showError('❌ ' + (data.message || 'Invalid email or password'));
          document.getElementById('password').value = '';
        }

      } catch (e) {
        // Backend offline — fallback to localStorage
        const savedUser = JSON.parse(localStorage.getItem('registered_user') || '{}');
        const isAdmin   = email === VALID_EMAIL && password === VALID_PASSWORD;
        const isLocal   = savedUser.email === email && savedUser.password === password;

        if (isAdmin || isLocal) {
          localStorage.setItem('owner_email',     email);
          localStorage.setItem('owner_name',      savedUser.name || email.split('@')[0]);
          localStorage.setItem('currency_symbol', '₹');
          localStorage.setItem('currency_rate',   '1');
          window.location.href = 'dashboard_dynamic.html';
        } else {
          showError('❌ Invalid email or password!');
          document.getElementById('password').value = '';
        }
      }
    }

    // ── Google Login Modal ────────────────────────────────
    function showGoogleModal() {
      const modal = document.getElementById('google-modal');
      modal.style.display = 'flex';
      setTimeout(() => document.getElementById('google-email-input').focus(), 100);
    }

    function closeGoogleModal() {
      document.getElementById('google-modal').style.display = 'none';
      document.getElementById('google-email-input').value = '';
      document.getElementById('google-modal-error').style.display = 'none';
    }

    async function confirmGoogleLogin() {
      const email = document.getElementById('google-email-input').value.trim();
      const errEl = document.getElementById('google-modal-error');

      if (!email || !email.includes('@')) {
        errEl.textContent = '❌ Please enter a valid Gmail address';
        errEl.style.display = 'block';
        return;
      }

      const name = email.split('@')[0];

      try {
        // Try login first, register if not exists
        const loginRes = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: 'google_' + email })
        });
        const loginData = await loginRes.json();

        if (!loginData.success) {
          await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password: 'google_' + email, role: 'admin' })
          });
        }
      } catch(e) {}

      localStorage.setItem('owner_email',     email);
      localStorage.setItem('owner_name',      name);
      localStorage.setItem('user_role',       'admin');
      localStorage.setItem('currency_symbol', '₹');
      localStorage.setItem('currency_rate',   '1');

      try {
        await fetch(`${API_URL}/api/automation/set-owner`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
      } catch(e) {}

      closeGoogleModal();
      window.location.href = 'dashboard_dynamic.html';
    }

    async function forgotPassword() {
      const email = document.getElementById('email').value.trim();
      if (!email) { showError('Enter your email first'); return; }

      const el = document.getElementById('login-error') || document.createElement('div');
      el.id = 'login-error';
      el.style.cssText = 'font-size:13px;margin-top:8px;text-align:center;font-weight:600;';
      document.querySelector('.login-card form').appendChild(el);
      el.style.color = '#64748b';
      el.textContent = '⏳ Sending temporary password...';

      try {
        const res  = await fetch(`${API_URL}/api/notify/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();

        if (data.sent) {
          el.style.color = '#22c55e';
          el.textContent = '✅ Temporary password sent to your email! Check inbox.';
        } else if (data.tempPass) {
          // Email failed but password was reset — show it on screen
          el.style.color = '#f59e0b';
          el.innerHTML = `⚠️ Email not configured.<br>Your temporary password is:<br>
            <span style="font-size:20px;letter-spacing:3px;color:#f59e0b;background:rgba(245,158,11,0.1);padding:6px 16px;border-radius:8px;display:inline-block;margin-top:6px">${data.tempPass}</span><br>
            <span style="font-size:11px;color:#64748b">Use this to login, then change in Settings</span>`;
        } else {
          el.style.color = '#ef4444';
          el.textContent = '❌ ' + (data.message || 'No account found with this email');
        }
      } catch(e) {
        el.style.color = '#ef4444';
        el.textContent = '❌ Backend offline. Run npm start first.';
      }
    }

    // Simple parallax effect: background nodes move slightly with mouse
    const parallaxNodes = document.querySelectorAll("[data-speed]");

    document.addEventListener("mousemove", (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / innerWidth;
      const y = (e.clientY - innerHeight / 2) / innerHeight;

      parallaxNodes.forEach((node) => {
        const speed = parseFloat(node.getAttribute("data-speed")) || 1;
        const translateX = -x * speed * 16; // adjust strength
        const translateY = -y * speed * 16;
        node.style.transform += ` translate3d(${translateX}px, ${translateY}px, 0)`;
      });
    });

    // Reset transforms every frame to avoid infinite concatenation
    document.addEventListener("mousemove", (() => {
      const baseTransforms = new WeakMap();

      return (e) => {
        const { innerWidth, innerHeight } = window;
        const x = (e.clientX - innerWidth / 2) / innerWidth;
        const y = (e.clientY - innerHeight / 2) / innerHeight;

        parallaxNodes.forEach((node) => {
          if (!baseTransforms.has(node)) {
            baseTransforms.set(node, getComputedStyle(node).transform === "none"
              ? ""
              : getComputedStyle(node).transform);
          }
          const base = baseTransforms.get(node);
          const speed = parseFloat(node.getAttribute("data-speed")) || 1;
          const tx = -x * speed * 16;
          const ty = -y * speed * 16;
          node.style.transform = `${base} translate3d(${tx}px, ${ty}px, 0)`;
        });
      };
    })());
