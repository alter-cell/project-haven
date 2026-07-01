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

export function initializeIdentityFlow() {
  const overlay = getIdentityOverlay();
  if (!overlay) return;

  const backButton = document.getElementById("identityBackButton");
  backButton?.addEventListener("click", () => {
    hideIdentityScreen();
  });

  overlay.querySelectorAll("button, a").forEach((element) => {
    element.addEventListener("click", async (event) => {
      if (element.id === "identitySignInLink") {
        event.preventDefault();
      }
      if (element.id === "continueWithGoogleButton" || element.id === "continueWithEmailButton" || element.id === "identitySignInLink") {
        await completeIdentityFlow();
      }
    });
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
