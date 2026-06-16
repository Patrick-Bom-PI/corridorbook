// ============================================================
// auth-modal.js — login and register modal
// Add after corridorbook.js:
// <script src="auth-modal.js"></script>
// Then call: CB.showAuthModal() on your sign-in button
// ============================================================

(function () {

  // ── Inject modal HTML ──────────────────────────────────────
  const modalHTML = `
<div id="cb-modal-overlay" style="
  display:none;position:fixed;inset:0;z-index:9999;
  background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);
  align-items:center;justify-content:center;
">
  <div style="
    background:#fff;border-radius:14px;width:100%;max-width:420px;
    margin:16px;box-shadow:0 24px 64px rgba(0,0,0,0.22);
    font-family:'DM Sans',-apple-system,sans-serif;overflow:hidden;
  ">
    <!-- Header -->
    <div style="padding:24px 28px 0;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <span style="font-size:17px;font-weight:800;color:#1A1A1A;letter-spacing:-0.5px;">
          Corridor<span style="color:#1565C0;">Book</span>
        </span>
        <button onclick="CB.hideAuthModal()" style="
          background:none;border:none;cursor:pointer;font-size:20px;
          color:#9E9E9E;line-height:1;padding:4px;
        ">&#x2715;</button>
      </div>

      <!-- Tabs -->
      <div style="display:flex;border-bottom:2px solid #F0F0F0;margin:0 -28px;padding:0 28px;">
        <button id="cb-tab-login" onclick="CB.switchTab('login')" style="
          padding:10px 0;margin-right:24px;font-family:inherit;font-size:14px;
          font-weight:700;background:none;border:none;border-bottom:2px solid #1565C0;
          margin-bottom:-2px;color:#1565C0;cursor:pointer;
        ">Sign in</button>
        <button id="cb-tab-register" onclick="CB.switchTab('register')" style="
          padding:10px 0;font-family:inherit;font-size:14px;
          font-weight:700;background:none;border:none;border-bottom:2px solid transparent;
          margin-bottom:-2px;color:#9E9E9E;cursor:pointer;
        ">Create account</button>
      </div>
    </div>

    <!-- Login form -->
    <div id="cb-form-login" style="padding:24px 28px;">
      <div style="margin-bottom:14px;">
        <label style="font-size:11px;font-weight:600;color:#6C757D;text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:5px;">Email</label>
        <input id="cb-login-email" type="email" placeholder="you@company.com" style="
          width:100%;padding:10px 12px;border:1px solid #D0D0D0;border-radius:8px;
          font-family:inherit;font-size:14px;outline:none;
        ">
      </div>
      <div style="margin-bottom:20px;">
        <label style="font-size:11px;font-weight:600;color:#6C757D;text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:5px;">Password</label>
        <input id="cb-login-password" type="password" placeholder="••••••••" style="
          width:100%;padding:10px 12px;border:1px solid #D0D0D0;border-radius:8px;
          font-family:inherit;font-size:14px;outline:none;
        ">
      </div>
      <div id="cb-login-error" style="display:none;background:#FFEBEE;color:#C62828;border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:14px;"></div>
      <button onclick="CB.doLogin()" style="
        width:100%;height:44px;background:#1565C0;color:#fff;border:none;
        border-radius:8px;font-family:inherit;font-size:14px;font-weight:700;
        cursor:pointer;
      ">Sign in</button>
      <p style="text-align:center;font-size:12px;color:#9E9E9E;margin-top:14px;">
        No account? <a onclick="CB.switchTab('register')" style="color:#1565C0;cursor:pointer;font-weight:600;">Create one</a>
      </p>
    </div>

    <!-- Register form -->
    <div id="cb-form-register" style="padding:24px 28px;display:none;">
      <div style="margin-bottom:12px;">
        <label style="font-size:11px;font-weight:600;color:#6C757D;text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:5px;">Company name</label>
        <input id="cb-reg-company" type="text" placeholder="Your company" style="
          width:100%;padding:10px 12px;border:1px solid #D0D0D0;border-radius:8px;
          font-family:inherit;font-size:14px;outline:none;
        ">
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:11px;font-weight:600;color:#6C757D;text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:5px;">Email</label>
        <input id="cb-reg-email" type="email" placeholder="you@company.com" style="
          width:100%;padding:10px 12px;border:1px solid #D0D0D0;border-radius:8px;
          font-family:inherit;font-size:14px;outline:none;
        ">
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:11px;font-weight:600;color:#6C757D;text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:5px;">Password</label>
        <input id="cb-reg-password" type="password" placeholder="Min 6 characters" style="
          width:100%;padding:10px 12px;border:1px solid #D0D0D0;border-radius:8px;
          font-family:inherit;font-size:14px;outline:none;
        ">
      </div>
      <div style="margin-bottom:12px;">
        <label style="font-size:11px;font-weight:600;color:#6C757D;text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:5px;">Account type</label>
        <select id="cb-reg-type" onchange="CB.toggleModalityField()" style="
          width:100%;padding:10px 12px;border:1px solid #D0D0D0;border-radius:8px;
          font-family:inherit;font-size:14px;outline:none;background:#fff;
        ">
          <option value="forwarder">Freight Forwarder</option>
          <option value="operator">Transport Operator</option>
        </select>
      </div>
      <div id="cb-modality-field" style="margin-bottom:12px;display:none;">
        <label style="font-size:11px;font-weight:600;color:#6C757D;text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:5px;">Modality</label>
        <select id="cb-reg-modality" style="
          width:100%;padding:10px 12px;border:1px solid #D0D0D0;border-radius:8px;
          font-family:inherit;font-size:14px;outline:none;background:#fff;
        ">
          <option value="road">Road</option>
          <option value="barge">Barge</option>
          <option value="rail">Rail</option>
        </select>
      </div>
      <div id="cb-reg-error" style="display:none;background:#FFEBEE;color:#C62828;border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:14px;"></div>
      <div id="cb-reg-success" style="display:none;background:#E8F5E9;color:#2E7D32;border-radius:8px;padding:10px 14px;font-size:13px;margin-bottom:14px;"></div>
      <button onclick="CB.doRegister()" style="
        width:100%;height:44px;background:#1565C0;color:#fff;border:none;
        border-radius:8px;font-family:inherit;font-size:14px;font-weight:700;
        cursor:pointer;
      ">Create account</button>
      <p style="text-align:center;font-size:12px;color:#9E9E9E;margin-top:14px;">
        Already have an account? <a onclick="CB.switchTab('login')" style="color:#1565C0;cursor:pointer;font-weight:600;">Sign in</a>
      </p>
    </div>
  </div>
</div>`;

  // Inject into body when DOM is ready
  function injectModal() {
    if (document.getElementById('cb-modal-overlay')) return;
    const div = document.createElement('div');
    div.innerHTML = modalHTML;
    document.body.appendChild(div.firstElementChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectModal);
  } else {
    injectModal();
  }

  // ── Extend CB with modal methods ────────────────────────────
  const waitCB = setInterval(() => {
    if (!window.CB) return;
    clearInterval(waitCB);

    Object.assign(window.CB, {

      showAuthModal() {
        document.getElementById('cb-modal-overlay').style.display = 'flex';
        this.switchTab('login');
      },

      hideAuthModal() {
        document.getElementById('cb-modal-overlay').style.display = 'none';
      },

      switchTab(tab) {
        const isLogin = tab === 'login';
        document.getElementById('cb-form-login').style.display    = isLogin ? 'block' : 'none';
        document.getElementById('cb-form-register').style.display = isLogin ? 'none' : 'block';
        const tLogin = document.getElementById('cb-tab-login');
        const tReg   = document.getElementById('cb-tab-register');
        tLogin.style.color       = isLogin ? '#1565C0' : '#9E9E9E';
        tLogin.style.borderBottomColor  = isLogin ? '#1565C0' : 'transparent';
        tReg.style.color         = isLogin ? '#9E9E9E' : '#1565C0';
        tReg.style.borderBottomColor    = isLogin ? 'transparent' : '#1565C0';
      },

      toggleModalityField() {
        const type = document.getElementById('cb-reg-type').value;
        document.getElementById('cb-modality-field').style.display =
          type === 'operator' ? 'block' : 'none';
      },

      async doLogin() {
        const email    = document.getElementById('cb-login-email').value.trim();
        const password = document.getElementById('cb-login-password').value;
        const errEl    = document.getElementById('cb-login-error');
        errEl.style.display = 'none';

        try {
          await CB.login({ email, password });
          CB.hideAuthModal();
          // Redirect based on user type
          const profile = await CB.getProfile();
          if (profile && profile.user_type === 'operator') {
            window.location.href = 'operator-portal.html';
          } else {
            window.location.href = 'search.html';
          }
        } catch (err) {
          errEl.textContent = err.message || 'Login failed. Check your email and password.';
          errEl.style.display = 'block';
        }
      },

      async doRegister() {
        const company  = document.getElementById('cb-reg-company').value.trim();
        const email    = document.getElementById('cb-reg-email').value.trim();
        const password = document.getElementById('cb-reg-password').value;
        const type     = document.getElementById('cb-reg-type').value;
        const modality = document.getElementById('cb-reg-modality').value;
        const errEl    = document.getElementById('cb-reg-error');
        const sucEl    = document.getElementById('cb-reg-success');
        errEl.style.display = 'none';
        sucEl.style.display = 'none';

        if (!company || !email || !password) {
          errEl.textContent = 'Please fill in all fields.';
          errEl.style.display = 'block';
          return;
        }

        try {
          await CB.register({
            email, password, company_name: company,
            user_type: type,
            modality: type === 'operator' ? modality : null
          });
          sucEl.textContent = 'Account created! Check your email to confirm, then sign in.';
          sucEl.style.display = 'block';
        } catch (err) {
          errEl.textContent = err.message || 'Registration failed.';
          errEl.style.display = 'block';
        }
      }
    });
  }, 100);

})();