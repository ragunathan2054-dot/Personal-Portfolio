import { apiFetch } from "./api.js";
import { showToast } from "./toast.js";

let pendingUserId = null;

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("loginError");
  errorEl.textContent = "";

  try {
    const res = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    if (res.requiresTwoFactor) {
      pendingUserId = res.userId;
      document.getElementById("loginForm").style.display = "none";
      document.getElementById("otpForm").style.display = "block";
    } else {
      showToast("Signed in");
      window.location.href = "/dashboard.html";
    }
  } catch (err) {
    errorEl.textContent = err.message;
    showToast(err.message, "error");
  }
});

document.getElementById("otpForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const otp = document.getElementById("otp").value;
  const errorEl = document.getElementById("otpError");
  errorEl.textContent = "";

  try {
    await apiFetch("/auth/verify-2fa", { method: "POST", body: JSON.stringify({ userId: pendingUserId, otp }) });
    showToast("Signed in");
    window.location.href = "/dashboard.html";
  } catch (err) {
    errorEl.textContent = err.message;
    showToast(err.message, "error");
  }
});