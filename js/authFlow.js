let pendingDestination = null;
let isSignedIn = false;

function getIdentityOverlay() {
  return document.getElementById("identityOverlay");
}

function syncReaderOpenState() {
  const openOverlay = document.querySelector(".experience-overlay.open");
  if (openOverlay) {
    document.body.classList.add("reader-open");
  } else {
    document.body.classList.remove("reader-open");
  }
}

function showView(viewId) {
  const overlay = getIdentityOverlay();
  if (!overlay) return;
  overlay.querySelectorAll(".identity-view").forEach((view) => {
    view.classList.toggle("hidden", view.id !== viewId);
  });
}

function setFieldMessage(fieldId, message) {
  const element = document.getElementById(fieldId);
  if (element) {
    element.textContent = message;
  }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getPasswordStrength(password) {
  if (!password) return { label: "Weak", score: 0 };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: "Weak", score };
  if (score === 2) return { label: "Fair", score };
  if (score === 3 || score === 4) return { label: "Good", score };
  return { label: "Strong", score };
}

function renderPasswordStrength(password) {
  const strengthValue = document.getElementById("signupStrengthValue");
  if (!strengthValue) return;
  const { label } = getPasswordStrength(password);
  const filled = password ? Math.min(10, Math.max(1, Math.round((password.length / 8) * 5))) : 0;
  const filledBars = "█".repeat(Math.min(10, filled));
  const emptyBars = "□".repeat(10 - filledBars.length);
  strengthValue.textContent = `${filledBars}${emptyBars} ${label}`;
}

function validateSignupForm() {
  const displayName = document.getElementById("signupDisplayName")?.value.trim() || "";
  const email = document.getElementById("signupEmail")?.value.trim() || "";
  const password = document.getElementById("signupPassword")?.value || "";
  const confirmPassword = document.getElementById("signupConfirmPassword")?.value || "";
  let valid = true;

  if (!displayName) {
    setFieldMessage("signupDisplayNameMessage", "Please enter your display name.");
    valid = false;
  } else {
    setFieldMessage("signupDisplayNameMessage", "");
  }

  if (!email) {
    setFieldMessage("signupEmailMessage", "Please enter your email address.");
    valid = false;
  } else if (!validateEmail(email)) {
    setFieldMessage("signupEmailMessage", "Enter a valid email address.");
    valid = false;
  } else {
    setFieldMessage("signupEmailMessage", "");
  }

  if (!password || password.length < 8) {
    setFieldMessage("signupPasswordMessage", "Password must be at least 8 characters.");
    valid = false;
  } else {
    setFieldMessage("signupPasswordMessage", "");
  }

  if (!confirmPassword) {
    setFieldMessage("signupConfirmPasswordMessage", "Please confirm your password.");
    valid = false;
  } else if (password !== confirmPassword) {
    setFieldMessage("signupConfirmPasswordMessage", "Passwords don't match.");
    valid = false;
  } else {
    setFieldMessage("signupConfirmPasswordMessage", "");
  }

  return valid;
}

export function initializeIdentityFlow() {
  const overlay = getIdentityOverlay();
  if (!overlay) return;

  const backButton = document.getElementById("identityBackButton");
  backButton?.addEventListener("click", () => {
    hideIdentityScreen();
  });

  document.getElementById("identitySignupBackButton")?.addEventListener("click", () => showView("identityIntroView"));
  document.getElementById("identitySigninBackButton")?.addEventListener("click", () => showView("identityIntroView"));

  document.getElementById("continueWithEmailButton")?.addEventListener("click", () => {
    showView("identitySignupView");
  });
  document.getElementById("identitySignInLink")?.addEventListener("click", () => {
    showView("identitySigninView");
  });
  document.getElementById("signupToSignInLink")?.addEventListener("click", () => {
    showView("identitySigninView");
  });
  document.getElementById("signinToSignupLink")?.addEventListener("click", () => {
    showView("identitySignupView");
  });

  const passwordToggle = document.getElementById("signupPasswordToggle");
  const confirmPasswordToggle = document.getElementById("signupConfirmPasswordToggle");
  const signinPasswordToggle = document.getElementById("signinPasswordToggle");

  passwordToggle?.addEventListener("click", () => {
    const input = document.getElementById("signupPassword");
    if (input) input.type = input.type === "password" ? "text" : "password";
  });
  confirmPasswordToggle?.addEventListener("click", () => {
    const input = document.getElementById("signupConfirmPassword");
    if (input) input.type = input.type === "password" ? "text" : "password";
  });
  signinPasswordToggle?.addEventListener("click", () => {
    const input = document.getElementById("signinPassword");
    if (input) input.type = input.type === "password" ? "text" : "password";
  });

  document.getElementById("signupDisplayName")?.addEventListener("input", () => {
    const button = document.getElementById("createIdentityButton");
    button.disabled = !validateSignupForm();
  });
  document.getElementById("signupEmail")?.addEventListener("input", () => {
    const button = document.getElementById("createIdentityButton");
    button.disabled = !validateSignupForm();
  });
  document.getElementById("signupPassword")?.addEventListener("input", () => {
    renderPasswordStrength(document.getElementById("signupPassword").value);
    const button = document.getElementById("createIdentityButton");
    button.disabled = !validateSignupForm();
  });
  document.getElementById("signupConfirmPassword")?.addEventListener("input", () => {
    const button = document.getElementById("createIdentityButton");
    button.disabled = !validateSignupForm();
  });

  document.getElementById("identitySignupView")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = document.getElementById("createIdentityButton");
    if (!validateSignupForm()) return;
    button.disabled = true;
    button.textContent = "Creating your identity...";
    try {
      const { signUp } = await import("./services/authService.js");
      const { error } = await signUp(document.getElementById("signupEmail").value.trim(), document.getElementById("signupPassword").value);
      if (error) throw error;
      await completeIdentityFlow();
    } catch (error) {
      setFieldMessage("signupEmailMessage", error?.message || "We could not create your identity right now.");
      button.disabled = false;
      button.textContent = "Create Identity";
    }
  });

  document.getElementById("identitySigninView")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = document.getElementById("signInButton");
    button.disabled = true;
    button.textContent = "Signing in...";
    try {
      const { signIn } = await import("./services/authService.js");
      const { error } = await signIn(document.getElementById("signinEmail").value.trim(), document.getElementById("signinPassword").value);
      if (error) throw error;
      await completeIdentityFlow();
    } catch (error) {
      setFieldMessage("signinEmailMessage", error?.message || "We could not sign you in right now.");
      button.disabled = false;
      button.textContent = "Sign In";
    }
  });
}

export function setPendingDestination(destination) {
  pendingDestination = destination;
}

export function getPendingDestination() {
  return pendingDestination;
}

export function clearPendingDestination() {
  pendingDestination = null;
}

export function isAuthenticated() {
  return isSignedIn;
}

export function markAuthenticated() {
  isSignedIn = true;
  return true;
}

export function showIdentityScreen(destination = null) {
  if (destination) {
    pendingDestination = destination;
  }

  showView("identityIntroView");
  const overlay = getIdentityOverlay();
  if (!overlay) return;

  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  syncReaderOpenState();
}

export function hideIdentityScreen() {
  const overlay = getIdentityOverlay();
  if (!overlay) return;

  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
  syncReaderOpenState();
}

export async function completeIdentityFlow() {
  markAuthenticated();
  const destination = pendingDestination || "account";
  clearPendingDestination();
  hideIdentityScreen();
  window.dispatchEvent(new CustomEvent("petal:auth-complete", { detail: destination }));
  return { destination };
}
