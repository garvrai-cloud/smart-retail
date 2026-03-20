/* ===== SIGNUP SCRIPTS ===== */

function showError(msg) {
      let el = document.getElementById('signup-error');
      if (!el) {
        el = document.createElement('div');
        el.id = 'signup-error';
        el.style.cssText = 'color:#ef4444;font-size:13px;margin-top:8px;text-align:center;font-weight:600;';
        document.querySelector('form').appendChild(el);
      }
      el.textContent = msg;
    }
    async function handleSignup(event) {
      event.preventDefault();

      const name     = document.getElementById("name").value.trim();
      const email    = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirm  = document.getElementById("confirm").value;
      const role     = 'admin'; // All signups are owner/admin

      if (!name || !email || !password) { showError("❌ All fields are required!"); return; }
      if (!email.includes('@'))          { showError("❌ Enter a valid email address"); return; }
      if (password.length < 4)           { showError("❌ Password must be at least 4 characters"); return; }
      if (password !== confirm)          { showError("❌ Passwords do not match!"); return; }

      const btn = document.querySelector(".signup-btn");
      btn.textContent = "Creating account...";
      btn.disabled = true;

      try {
       const res  = await fetch("https://smart-retail-backend-kvfj.onrender.com/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role })
        });
        const data = await res.json();

        if (data.success) {
          // Also save locally as backup
          localStorage.setItem("registered_user", JSON.stringify({ name, email, password }));

          btn.textContent = '✅ Account Created!';
          btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
          setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        } else {
          showError("❌ " + (data.message || "Registration failed"));
          btn.textContent = "Create Account";
          btn.disabled = false;
        }
      } catch (e) {
        // Backend offline — save locally only
        localStorage.setItem("registered_user", JSON.stringify({ name, email, password }));
        btn.textContent = '✅ Account Created!';
        btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
      }
    }

    // Simple parallax effect: background nodes move slightly with mouse
    const parallaxNodes = document.querySelectorAll("[data-speed]");

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
