import { apiFetch, escapeHtml } from "../api.js";
import { showToast } from "../toast.js";

export function renderAccountPanel(user) {
  const el = document.getElementById("panel-account");

  el.innerHTML = `
    <p class="lede">Manage your login and security — separate from your public page content.</p>

    <div class="card">
      <div class="card-head"><h3>Profile</h3></div>
      <div class="avatar-row">
        <div class="avatar">${escapeHtml((user.email || "?")[0].toUpperCase())}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h3>Change login email</h3></div>

      <div class="field">
        <label>New email</label>
        <input type="email" id="email-new" value="${escapeHtml(user.email)}">
      </div>

      <div class="field">
        <label>Confirm with your current password</label>
        <div style="display:flex; gap:8px;">
          <input type="password" id="email-pw" style="flex:1;">
          <button type="button" class="btn btn-ghost btn-sm" id="showEmailPw">Show</button>
        </div>
      </div>

      <div id="emailError" class="form-error"></div>
      <button class="btn btn-primary btn-sm" id="updateEmailBtn">Update email</button>
    </div>

    <div class="card">
      <div class="card-head"><h3>Change password</h3></div>

      <div class="field">
        <label>Current password</label>
        <div style="display:flex; gap:8px;">
          <input type="password" id="pw-current" style="flex:1;">
          <button type="button" class="btn btn-ghost btn-sm" id="showCurrentPw">Show</button>
        </div>
      </div>

      <div class="row2">
        <div class="field">
          <label>New password</label>
          <div style="display:flex; gap:8px;">
            <input type="password" id="pw-new" style="flex:1;">
            <button type="button" class="btn btn-ghost btn-sm" id="showNewPw">Show</button>
            <button type="button" class="btn btn-ghost btn-sm" id="copyNewPw">Copy</button>
          </div>
        </div>

        <div class="field">
          <label>Confirm new password</label>
          <div style="display:flex; gap:8px;">
            <input type="password" id="pw-confirm" style="flex:1;">
            <button type="button" class="btn btn-ghost btn-sm" id="showConfirmPw">Show</button>
          </div>
        </div>
      </div>

      <div id="pwError" class="form-error"></div>
      <button class="btn btn-primary btn-sm" id="updatePwBtn">Update password</button>
    </div>

    <div class="card">
      <div class="card-head">
        <h3>Two-factor authentication</h3>
        <span class="sub">Google Authenticator</span>
      </div>

      <div class="switch-row">
        <div class="label">
          <b>Require a verification code at sign-in</b>
          <span>Adds a 6-digit code on top of your password</span>
        </div>

        <label class="switch">
          <input type="checkbox" id="twofaToggle" ${user.twoFactorEnabled ? "checked" : ""}>
          <span class="slider"></span>
        </label>
      </div>

      <div id="twofaSetup" style="display:none; margin-top:16px; border-top:1px solid var(--border); padding-top:16px;">
        <div class="row2">
          <div>
            <div class="field"><label>1. Scan this QR code</label></div>
            <img id="qrImg" style="width:100%; border-radius:8px;">
          </div>

          <div>
            <div class="field">
              <label>2. Or enter this key manually</label>
              <input id="manualKey" readonly>
            </div>

            <div class="field">
              <label>3. Enter the 6-digit code shown in the app right now</label>
              <input id="confirmOtp" maxlength="6" placeholder="000000">
            </div>

            <div id="twofaError" class="form-error"></div>
            <button class="btn btn-primary btn-sm" id="confirm2faBtn">Confirm & enable</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h3>Navigation</h3></div>

      <div style="display:flex; gap:12px;">
        <a class="btn btn-ghost btn-sm" id="backToPublicBtn" target="_blank" rel="noopener">
          Back to public page
        </a>

        <button class="btn btn-ghost btn-sm" id="signOutBtn2">
          Sign out
        </button>
      </div>
    </div>
  `;

  function setupPasswordToggle(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);

    button.addEventListener("click", () => {
      const hidden = input.type === "password";
      input.type = hidden ? "text" : "password";
      button.textContent = hidden ? "Hide" : "Show";
    });
  }

  setupPasswordToggle("email-pw", "showEmailPw");
  setupPasswordToggle("pw-current", "showCurrentPw");
  setupPasswordToggle("pw-new", "showNewPw");
  setupPasswordToggle("pw-confirm", "showConfirmPw");

  document.getElementById("copyNewPw").addEventListener("click", async () => {
    const newPassword = document.getElementById("pw-new").value;

    if (!newPassword) {
      showToast("Enter a new password first", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(newPassword);
      showToast("New password copied");
    } catch {
      showToast("Unable to copy password", "error");
    }
  });

  document.getElementById("updateEmailBtn").addEventListener("click", async () => {
    const newEmail = document.getElementById("email-new").value;
    const currentPassword = document.getElementById("email-pw").value;
    const err = document.getElementById("emailError");

    err.textContent = "";

    try {
      const res = await apiFetch("/auth/email", {
        method: "PUT",
        body: JSON.stringify({ newEmail, currentPassword }),
      });

      document.getElementById("sidebarName").textContent = res.email;
      document.getElementById("email-pw").value = "";
      showToast("Email updated");
    } catch (e) {
      err.textContent = e.message;
      showToast(e.message, "error");
    }
  });

  document.getElementById("updatePwBtn").addEventListener("click", async () => {
    const currentPassword = document.getElementById("pw-current").value;
    const newPassword = document.getElementById("pw-new").value;
    const confirm = document.getElementById("pw-confirm").value;
    const err = document.getElementById("pwError");

    err.textContent = "";

    if (newPassword !== confirm) {
      err.textContent = "New passwords don't match.";
      showToast("New passwords don't match.", "error");
      return;
    }

    try {
      await apiFetch("/auth/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      document.getElementById("pw-current").value = "";
      document.getElementById("pw-new").value = "";
      document.getElementById("pw-confirm").value = "";

      document.getElementById("pw-current").type = "password";
      document.getElementById("pw-new").type = "password";
      document.getElementById("pw-confirm").type = "password";

      document.getElementById("showCurrentPw").textContent = "Show";
      document.getElementById("showNewPw").textContent = "Show";
      document.getElementById("showConfirmPw").textContent = "Show";

      showToast("Password updated");
    } catch (e) {
      err.textContent = e.message;
      showToast(e.message, "error");
    }
  });

  document.getElementById("twofaToggle").addEventListener("change", async (e) => {
    if (e.target.checked) {
      try {
        const res = await apiFetch("/auth/setup-2fa", {
          method: "POST",
        });

        document.getElementById("qrImg").src = res.qrDataUrl;
        document.getElementById("manualKey").value = res.manualKey;
        document.getElementById("twofaSetup").style.display = "block";
      } catch (err) {
        e.target.checked = false;
        showToast(err.message, "error");
      }
    } else {
      try {
        await apiFetch("/auth/disable-2fa", {
          method: "POST",
        });

        document.getElementById("twofaSetup").style.display = "none";
        showToast("Two-factor authentication disabled");
      } catch (err) {
        e.target.checked = true;
        showToast(err.message, "error");
      }
    }
  });

  document.getElementById("confirm2faBtn").addEventListener("click", async () => {
    const otp = document.getElementById("confirmOtp").value;
    const err = document.getElementById("twofaError");

    err.textContent = "";

    try {
      await apiFetch("/auth/confirm-2fa", {
        method: "POST",
        body: JSON.stringify({ otp }),
      });

      document.getElementById("twofaSetup").style.display = "none";
      document.getElementById("confirmOtp").value = "";
      showToast("Two-factor authentication enabled");
    } catch (e) {
      err.textContent = e.message;
      showToast(e.message, "error");
    }
  });

  const publicUrl =
    import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:5173";

  document.getElementById("backToPublicBtn").href = publicUrl;

  document.getElementById("signOutBtn2").addEventListener("click", () => {
    window.__signOut();
  });
}