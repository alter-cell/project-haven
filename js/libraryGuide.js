import { hashPin, isValidPin } from "./auth.js";
import { backup, loadSecret, restore, saveSecret } from "./storage.js";

let host;
let onBack = () => {};
let onChangeTrigger = () => {};
let onRestored = () => {};

export function initializeLibraryGuide(options = {}) {
  host = document.getElementById("libraryGuide");
  onBack = options.onBack || onBack;
  onChangeTrigger = options.onChangeTrigger || onChangeTrigger;
  onRestored = options.onRestored || onRestored;
}

const guideButton = (title, description, action) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "guide-page";
  button.innerHTML = `<strong>${title}</strong><span>${description}</span>`;
  button.addEventListener("click", action);
  return button;
};

export function openLibraryGuide() {
  host.classList.remove("hidden");
  host.replaceChildren();
  const back = document.createElement("button");
  back.type = "button";
  back.className = "back-button";
  back.textContent = "← Between The Pages";
  back.addEventListener("click", onBack);
  const heading = document.createElement("div");
  heading.innerHTML = `<span class="reader-tag">Reference volume</span><h2>Library Guide</h2><p class="experience-copy">Useful chapters for caring for your private collection.</p>`;
  const pages = document.createElement("div");
  pages.className = "guide-pages";
  pages.append(
    guideButton("Change PIN", "Set a new four-digit reading PIN.", renderChangePin),
    guideButton("Change Secret Trigger", "Choose a new built-in page and word position.", onChangeTrigger),
    guideButton("Backup", "Download configuration, progress, and shelf metadata.", downloadBackup),
    guideButton("Restore", "Restore from a Petal Pages backup.", chooseRestore),
    guideButton("Future Settings", "More guide chapters will be added later.", () => showGuideMessage("This chapter has not been written yet."))
  );
  const message = document.createElement("p");
  message.id = "guideMessage";
  message.className = "form-message";
  host.append(back, heading, pages, message);
}

function showGuideMessage(message) {
  const target = document.getElementById("guideMessage");
  if (target) target.textContent = message;
}

function renderChangePin() {
  host.replaceChildren();
  const heading = document.createElement("div");
  heading.innerHTML = `<span class="reader-tag">Library Guide</span><h2>Change PIN</h2><p class="experience-copy">Choose four new digits.</p>`;
  const input = document.createElement("input");
  input.type = "password";
  input.inputMode = "numeric";
  input.maxLength = 4;
  input.className = "pin-input";
  const message = document.createElement("p");
  message.className = "form-message";
  const actions = document.createElement("div");
  actions.className = "experience-actions";
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "reader-nav";
  cancel.textContent = "Cancel";
  cancel.addEventListener("click", openLibraryGuide);
  const save = document.createElement("button");
  save.type = "button";
  save.className = "reader-nav primary";
  save.textContent = "Save PIN";
  save.addEventListener("click", async () => {
    if (!isValidPin(input.value)) {
      message.textContent = "Enter exactly four digits.";
      return;
    }
    const configuration = loadSecret();
    configuration.secret.auth.pinHash = await hashPin(input.value);
    saveSecret(configuration);
    openLibraryGuide();
    showGuideMessage("Your PIN has been changed.");
  });
  actions.append(cancel, save);
  host.append(heading, input, message, actions);
  input.focus();
}

function downloadBackup() {
  const blob = new Blob([backup()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `petal-pages-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  showGuideMessage("Your backup has been prepared.");
}

function chooseRestore() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.addEventListener("change", async () => {
    try {
      restore(await input.files[0].text());
      onRestored();
      openLibraryGuide();
      showGuideMessage("Your library data has been restored.");
    } catch (error) {
      showGuideMessage(error.message);
    }
  });
  input.click();
}
