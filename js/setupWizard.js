import { hashPin, isValidPin } from "./auth.js";
import { getBuiltInBooks } from "./library.js";
import { saveSecret } from "./storage.js";

const state = { step: 1, pin: "", pinHash: "", bookId: "", chapterId: "", pageIndex: 0 };
let elements;
let onComplete = () => {};

export function initializeSetupWizard(options = {}) {
  onComplete = options.onComplete || onComplete;
  elements = {
    overlay: document.getElementById("setupOverlay"),
    count: document.getElementById("setupStepCount"),
    title: document.getElementById("setupTitle"),
    copy: document.getElementById("setupCopy"),
    content: document.getElementById("setupContent"),
    actions: document.getElementById("setupActions"),
    message: document.getElementById("setupMessage")
  };
}

const button = (label, className = "reader-nav primary") => {
  const control = document.createElement("button");
  control.type = "button";
  control.className = className;
  control.textContent = label;
  return control;
};

export function openSetupWizard() {
  state.pinHash = "";
  state.step = 1;
  elements.overlay.classList.add("open");
  elements.overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("reader-open");
  render();
}

export function openTriggerSetup(existingPinHash) {
  state.pinHash = existingPinHash;
  state.step = 2;
  elements.overlay.classList.add("open");
  elements.overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("reader-open");
  render();
}

function render() {
  elements.count.textContent = `Step ${state.step} of 4`;
  elements.content.replaceChildren();
  elements.actions.replaceChildren();
  elements.message.textContent = "";
  if (state.step === 1) renderPin();
  if (state.step === 2) renderBooks();
  if (state.step === 3) renderChapters();
  if (state.step === 4) renderWordPage();
}

function renderPin() {
  elements.title.textContent = "Create your reading PIN";
  elements.copy.textContent = "Choose four digits you will remember.";
  const input = document.createElement("input");
  input.className = "pin-input";
  input.type = "password";
  input.inputMode = "numeric";
  input.maxLength = 4;
  input.autocomplete = "new-password";
  input.value = state.pin;
  const next = button("Continue");
  next.addEventListener("click", () => {
    if (!isValidPin(input.value)) {
      elements.message.textContent = "Your PIN must contain exactly four digits.";
      return;
    }
    state.pin = input.value;
    state.step = 2;
    render();
  });
  elements.content.append(input);
  elements.actions.append(next);
  input.focus();
}

function renderBooks() {
  elements.title.textContent = "Choose a book";
  elements.copy.textContent = "Pick one built-in book for your private bookmark.";
  const list = document.createElement("div");
  list.className = "setup-choice-list";
  getBuiltInBooks().forEach((book) => {
    const choice = button(`${book.title} — ${book.author}`, "chapter-item");
    choice.addEventListener("click", () => {
      state.bookId = book.id;
      state.step = 3;
      render();
    });
    list.append(choice);
  });
  elements.content.append(list);
}

function renderChapters() {
  const book = getBuiltInBooks().find((item) => item.id === state.bookId);
  elements.title.textContent = "Choose a chapter";
  elements.copy.textContent = `${book.title} will hold your private bookmark.`;
  const list = document.createElement("div");
  list.className = "setup-choice-list";
  book.chapters.forEach((chapter, index) => {
    const choice = button(`${index + 1}. ${chapter.title}`, "chapter-item");
    choice.addEventListener("click", () => {
      state.chapterId = chapter.id;
      state.pageIndex = 0;
      state.step = 4;
      render();
    });
    list.append(choice);
  });
  elements.content.append(list);
}

function renderWordPage() {
  const book = getBuiltInBooks().find((item) => item.id === state.bookId);
  const chapter = book.chapters.find((item) => item.id === state.chapterId);
  const page = chapter.pages[state.pageIndex];
  elements.title.textContent = chapter.title;
  elements.copy.textContent = `Page ${state.pageIndex + 1} of ${chapter.pages.length}. Tap exactly one word. Later, tap that position three times to open your private space.`;
  const pageElement = document.createElement("div");
  pageElement.className = "reader-story setup-word-page";
  page.paragraphs.forEach((paragraph, paragraphIndex) => {
    const line = document.createElement("p");
    paragraph.split(/\s+/).forEach((word, wordIndex) => {
      if (wordIndex) line.append(" ");
      const wordButton = document.createElement("button");
      wordButton.type = "button";
      wordButton.className = "setup-word";
      wordButton.textContent = word;
      wordButton.addEventListener("click", () => completeSetup(page, paragraphIndex, wordIndex));
      line.append(wordButton);
    });
    pageElement.append(line);
  });
  const previous = button("Previous", "reader-nav");
  const next = button("Next page");
  previous.disabled = state.pageIndex === 0;
  next.disabled = state.pageIndex === chapter.pages.length - 1;
  previous.addEventListener("click", () => { state.pageIndex--; render(); });
  next.addEventListener("click", () => { state.pageIndex++; render(); });
  elements.content.append(pageElement);
  elements.actions.append(previous, next);
}

async function completeSetup(page, paragraphIndex, wordIndex) {
  const configuration = {
    secret: {
      enabled: true,
      trigger: {
        bookId: state.bookId,
        chapterId: state.chapterId,
        pageId: page.id,
        paragraphIndex,
        wordIndex,
        tapCount: 3
      },
      auth: { pinHash: state.pinHash || await hashPin(state.pin) }
    }
  };
  saveSecret(configuration);
  elements.overlay.classList.remove("open");
  elements.overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("reader-open");
  onComplete();
}
