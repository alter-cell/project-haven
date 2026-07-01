import { verifyPin } from "./auth.js";
import { chatModule } from "./chat.js";
import { memoriesModule } from "./gallery.js";
import { openLibraryGuide } from "./libraryGuide.js";
import { openAccountScreen, hideAccountScreen } from "./account.js";
import { setPendingDestination, showIdentityScreen, hideIdentityScreen, isAuthenticated } from "./authFlow.js";
import { loadSecret } from "./storage.js";

let elements;

export function initializeSecretSpace() {
  elements = {
    pinOverlay: document.getElementById("pinOverlay"),
    pinInput: document.getElementById("pinInput"),
    pinMessage: document.getElementById("pinMessage"),
    closePin: document.getElementById("closePinButton"),
    unlock: document.getElementById("unlockButton"),
    secretOverlay: document.getElementById("secretOverlay"),
    secretHome: document.getElementById("secretHome"),
    guide: document.getElementById("libraryGuide"),
    leave: document.getElementById("leaveSecretButton")
  };
  elements.closePin.addEventListener("click", closePin);
  elements.unlock.addEventListener("click", unlock);
  elements.pinInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") unlock();
  });
  elements.leave.addEventListener("click", closeSecretSpace);
  document.querySelectorAll("[data-secret-module]").forEach((button) => {
    button.addEventListener("click", () => openModule(button.dataset.secretModule));
  });
}

export function openPinScreen() {
  elements.pinInput.value = "";
  elements.pinMessage.textContent = "";
  elements.pinOverlay.classList.add("open");
  elements.pinOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("reader-open");
  setTimeout(() => elements.pinInput.focus(), 320);
}

function closePin() {
  elements.pinOverlay.classList.remove("open");
  elements.pinOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("reader-open");
}

async function unlock() {
  const configuration = loadSecret();
  if (!await verifyPin(elements.pinInput.value, configuration?.secret?.auth?.pinHash)) {
    elements.pinMessage.textContent = "That PIN does not open this book.";
    elements.pinInput.select();
    return;
  }
  closePin();
  elements.secretHome.classList.remove("hidden");
  elements.guide.classList.add("hidden");
  elements.secretOverlay.classList.add("open");
  elements.secretOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("reader-open");
}

function openModule(name) {
  if (name === "guide") {
    elements.secretHome.classList.add("hidden");
    hideAccountScreen();
    hideIdentityScreen();
    openLibraryGuide();
    return;
  }
  if (name === "account") {
    if (!isAuthenticated()) {
      setPendingDestination("account");
      showIdentityScreen("account");
      return;
    }
    elements.secretHome.classList.add("hidden");
    hideIdentityScreen();
    openAccountScreen();
    return;
  }
  const module = name === "chat" ? chatModule : memoriesModule;
  if (!isAuthenticated()) {
    const destination = name === "chat" ? "chat" : "memories";
    setPendingDestination(destination);
    showIdentityScreen(destination);
    return;
  }
  window.dispatchEvent(new CustomEvent("petal:feedback", { detail: `${module.title}: ${module.description}` }));
}

export function showSecretHome() {
  elements.guide.classList.add("hidden");
  hideAccountScreen();
  hideIdentityScreen();
  elements.secretHome.classList.remove("hidden");
}

export function closeSecretSpace() {
  elements.secretOverlay.classList.remove("open");
  elements.secretOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("reader-open");
}
