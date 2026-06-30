import { hashPin, isValidPin } from "./auth.js";
import { getBuiltInBooks } from "./library.js";
import { loadSecret, saveSecret } from "./storage.js";

const state = {
  step: 1,
  pin: "",
  pinHash: "",
  editMode: false,
  testMode: false,
  bookId: "",
  chapterId: "",
  pageIndex: 0,
  selected: null,
  paragraphIndex: null,
  wordIndex: null,
  selectedWord: "",
  previewing: false
};
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

const resetState = () => {
  state.step = 1;
  state.pin = "";
  state.pinHash = "";
  state.editMode = false;
  state.testMode = false;
  state.bookId = "";
  state.chapterId = "";
  state.pageIndex = 0;
  state.selected = null;
  state.paragraphIndex = null;
  state.wordIndex = null;
  state.selectedWord = "";
  state.previewing = false;
};

export function openSetupWizard() {
  resetState();
  elements.overlay.classList.add("open");
  elements.overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("reader-open");
  render();
}

export function openTriggerSetup(existingPinHash) {
  resetState();
  state.pinHash = existingPinHash;
  state.editMode = true;
  state.step = 1;
  elements.overlay.classList.add("open");
  elements.overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("reader-open");
  render();
}

export function openTriggerAnimationTest() {
  const selected = getSelectionFromSavedTrigger();
  if (!selected) return false;
  resetState();
  state.editMode = true;
  state.testMode = true;
  state.bookId = selected.bookId;
  state.chapterId = selected.chapterId;
  state.pageIndex = selected.pageIndex;
  state.selected = selected;
  state.step = 4;
  elements.overlay.classList.add("open");
  elements.overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("reader-open");
  render();
  setTimeout(async () => {
    await animateTriggerPreview();
    closeSetupWizard();
  }, 240);
  return true;
}

function render() {
  const totalSteps = state.editMode ? 4 : 6;
  const stepLabel = Math.min(state.step, totalSteps);
  elements.count.textContent = `Step ${stepLabel} of ${totalSteps}`;
  elements.content.replaceChildren();
  elements.actions.replaceChildren();
  elements.message.textContent = "";
  if (state.editMode) {
    if (state.step === 1) renderBooks();
    if (state.step === 2) renderChapters();
    if (state.step === 3) renderPages();
    if (state.step === 4) renderChooseWord();
  } else {
    if (state.step === 1) renderPin();
    if (state.step === 2) renderBooks();
    if (state.step === 3) renderChapters();
    if (state.step === 4) renderReadChapter();
    if (state.step === 5) renderChooseWord();
    if (state.step === 6) renderConfirmation();
  }
}

function renderPin() {
  elements.title.textContent = "Create your Secret Space PIN";
  elements.copy.textContent = "Hide a private place inside an ordinary book.";
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
      elements.message.textContent = "Enter exactly four digits.";
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
  elements.title.textContent = "Choose your book";
  elements.copy.textContent = "Select one built-in story to hold your hidden doorway.";
  const grid = document.createElement("div");
  grid.className = "setup-book-grid";
  getBuiltInBooks().forEach((book) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "setup-book-card";
    card.innerHTML = `
      <span class="book-shell">
        <span class="book-spine"></span>
        <span class="book-cover ${book.coverClass}">
          <span class="bookmark"></span>
          <span class="cover-mark">${book.coverMark}</span>
        </span>
      </span>
      <div class="setup-book-copy">
        <strong>${book.title}</strong>
        <span>${book.author}</span>
        <p>${book.synopsis}</p>
      </div>`;
    card.addEventListener("click", () => {
      state.bookId = book.id;
      state.step = state.editMode ? 2 : 3;
      render();
    });
    grid.append(card);
  });
  elements.content.append(grid);
}

function renderChapters() {
  const book = getBuiltInBooks().find((item) => item.id === state.bookId);
  elements.title.textContent = "Choose a chapter";
  elements.copy.textContent = `${book.title} will carry the hidden entrance to your Secret Space.`;
  const list = document.createElement("div");
  list.className = "setup-choice-list";
  book.chapters.forEach((chapter, index) => {
    const choice = document.createElement("button");
    choice.type = "button";
    choice.className = "chapter-item";
    choice.innerHTML = `<strong>${index + 1}. ${chapter.title}</strong><span>${chapter.pages.length} pages</span>`;
    choice.addEventListener("click", () => {
      state.chapterId = chapter.id;
      state.pageIndex = 0;
      state.step = state.editMode ? 3 : 4;
      render();
    });
    list.append(choice);
  });
  const back = button("Back", "reader-nav");
  back.addEventListener("click", () => {
    state.step = 1;
    render();
  });
  elements.content.append(list);
  elements.actions.append(back);
}

function renderPages() {
  const book = getBuiltInBooks().find((item) => item.id === state.bookId);
  const chapter = book.chapters.find((item) => item.id === state.chapterId);
  elements.title.textContent = "Choose a page";
  elements.copy.textContent = "Open the page where your hidden doorway will live.";
  const list = document.createElement("div");
  list.className = "setup-choice-list";
  chapter.pages.forEach((page, index) => {
    const choice = document.createElement("button");
    choice.type = "button";
    choice.className = "chapter-item";
    choice.innerHTML = `<strong>Page ${index + 1}</strong><span>${page.paragraphs.join(" ").slice(0, 90)}…</span>`;
    choice.addEventListener("click", () => {
      state.pageIndex = index;
      state.step = 4;
      render();
    });
    list.append(choice);
  });
  const back = button("Back", "reader-nav");
  back.addEventListener("click", () => {
    state.step = 2;
    render();
  });
  elements.content.append(list);
  elements.actions.append(back);
}

function renderReadChapter() {
  const book = getBuiltInBooks().find((item) => item.id === state.bookId);
  const chapter = book.chapters.find((item) => item.id === state.chapterId);
  elements.title.textContent = "Read the chapter";
  elements.copy.textContent = `Take your time. The page below is the doorway's setting. When you are ready, choose the trigger word.`;
  const readerArea = createWizardReader(book, chapter, false);
  const previous = button("Previous", "reader-nav");
  const next = button("Next page", "reader-nav");
  const choose = button("Choose trigger word");
  previous.disabled = state.pageIndex === 0;
  next.disabled = state.pageIndex === chapter.pages.length - 1;
  previous.addEventListener("click", () => { state.pageIndex--; render(); });
  next.addEventListener("click", () => { state.pageIndex++; render(); });
  choose.addEventListener("click", () => { state.step = 5; render(); });
  const back = button("Back", "reader-nav");
  back.addEventListener("click", () => { state.step = 3; render(); });
  elements.content.append(readerArea);
  elements.actions.append(previous, next, choose, back);
}

function renderChooseWord() {
  const book = getBuiltInBooks().find((item) => item.id === state.bookId);
  const chapter = book.chapters.find((item) => item.id === state.chapterId);
  elements.title.textContent = "Choose the trigger word";
  elements.copy.textContent = state.editMode
    ? "Tap the word on this page that will become your new Secret Space entrance."
    : "Every word on every page can become the entrance. Tap the one that feels right.";
  const readerArea = createWizardReader(book, chapter, true);

  const prompt = document.createElement("div");
  prompt.className = "setup-trigger-prompt";
  const message = document.createElement("p");
  if (!state.selected) {
    message.textContent = state.editMode
      ? "Select a word to mark your new trigger. Nothing is saved yet."
      : "Tap a single word to see if it feels like the hidden door.";
  } else {
    message.innerHTML = `Selected <strong>“${state.selectedWord || state.selected?.word || state.selected?.selectedWord}”</strong>.`;
  }
  prompt.append(message);

  const back = button("Back", "reader-nav");
const save = button(
    state.editMode ? "Save Trigger" : "Continue"
);

save.disabled = !state.selected;

save.addEventListener("click", async () => {
    if (!state.selected) return;

    if (state.editMode) {
        await saveConfiguration();
    } else {
        state.step = 6;
        render();
    }
});
  
  back.addEventListener("click", () => {
    state.step = state.editMode ? 3 : 4;
    render();
  });

  elements.content.append(readerArea, prompt);
  elements.actions.append(back, save);
}

function renderConfirmation() {
  const book = getBuiltInBooks().find((item) => item.id === state.bookId);
  const chapter = book.chapters.find((item) => item.id === state.chapterId);
  const selected = state.selected;
  const pageNumber = chapter.pages.findIndex((page) => page.id === selected.pageId) + 1;

  elements.title.textContent = "Confirm your Secret Space";
  elements.copy.textContent = "Your hidden doorway will be saved once you finish. Review the details below.";
  const summary = document.createElement("div");
  summary.className = "setup-summary";
  summary.innerHTML = `
    <div><dt>Book</dt><dd>${book.title}</dd></div>
    <div><dt>Chapter</dt><dd>${chapter.title}</dd></div>
    <div><dt>Page</dt><dd>${pageNumber}</dd></div>
    <div><dt>Trigger word</dt><dd>“${selected.word}”</dd></div>
    <div><dt>PIN</dt><dd>••••</dd></div>`;
  const back = button("Back", "reader-nav");
  const finish = button("Finish");
  back.addEventListener("click", () => { state.step = 5; render(); });
  finish.addEventListener("click", async () => { await saveConfiguration(); });
  elements.content.append(summary);
  elements.actions.append(back, finish);
}

function createWizardReader(book, chapter, selectable) {
  const page = chapter.pages[state.pageIndex];
  const wrapper = document.createElement("div");
  wrapper.className = "setup-reader";

  const statePanel = document.createElement("div");
  statePanel.className = "setup-reader-meta";
  statePanel.innerHTML = `
    <div>
      <p class="chapter-label">Chapter</p>
      <strong>${chapter.title}</strong>
    </div>
    <div>
      <p class="chapter-label">Page</p>
      <strong>${state.pageIndex + 1} of ${chapter.pages.length}</strong>
    </div>`;

  const pageWrapper = document.createElement("div");
  pageWrapper.className = "reader-story setup-reader-story";
  pageWrapper.tabIndex = -1;
  pageWrapper.style.position = "relative";
  pageWrapper.style.userSelect = "none";
  pageWrapper.style.webkitUserSelect = "none";

  page.paragraphs.forEach((paragraph, paragraphIndex) => {
    const paragraphElement = document.createElement("p");
    const tokens = paragraph.match(/\S+|\s+/g) || [];
    let wordIndex = 0;
    tokens.forEach((token) => {
      if (/^\s+$/.test(token)) {
        paragraphElement.append(document.createTextNode(token));
        return;
      }
      const wordElement = document.createElement("span");
      wordElement.className = "reader-word setup-reader-word";
      wordElement.textContent = token;
      if (selectable) {
        const currentWordIndex = wordIndex;
        wordElement.classList.add("selectable-word");
        wordElement.tabIndex = 0;
        wordElement.setAttribute("role", "button");
        wordElement.addEventListener("pointerdown", (event) => event.preventDefault());
        wordElement.addEventListener("click", () => selectTriggerWord(page, paragraphIndex, currentWordIndex, token));
        wordElement.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectTriggerWord(page, paragraphIndex, currentWordIndex, token);
          }
        });
      }
      if (state.selected && state.selected.pageId === page.id && state.selected.paragraphIndex === paragraphIndex && state.selected.wordIndex === wordIndex) {
        wordElement.classList.add("selected-trigger-word");
      }
      paragraphElement.append(wordElement);
      wordIndex += 1;
    });
    pageWrapper.append(paragraphElement);
  });

  wrapper.append(statePanel, pageWrapper);
  return wrapper;
}

function selectTriggerWord(page, paragraphIndex, wordIndex, word) {
  if (state.previewing) return;
  state.selected = {
    bookId: state.bookId,
    chapterId: state.chapterId,
    pageId: page.id,
    paragraphIndex,
    wordIndex,
    selectedWord: word,
    word,
    pageIndex: state.pageIndex
  };
  state.paragraphIndex = paragraphIndex;
  state.wordIndex = wordIndex;
  state.selectedWord = word;
  render();
}

async function animateTriggerPreview() {
  const pageStory = elements.content.querySelector(".reader-story.setup-reader-story");
  const selectedWord = pageStory?.querySelector(".selected-trigger-word");
  if (!selectedWord || !pageStory) return;
  state.previewing = true;
  pageStory.classList.add("trigger-preview");
  selectedWord.classList.add("preview-word");
  const layer = document.createElement("div");
  layer.className = "trigger-letter-layer";
  layer.style.position = "absolute";
  layer.style.inset = "0";
  layer.style.pointerEvents = "none";
  pageStory.append(layer);
  const pageRect = pageStory.getBoundingClientRect();
  const wordRect = selectedWord.getBoundingClientRect();
  const letters = Array.from(selectedWord.textContent);
  const letterWidth = wordRect.width / Math.max(letters.length, 1);
  letters.forEach((letter, index) => {
    const letterElement = document.createElement("span");
    letterElement.className = "trigger-preview-letter";
    letterElement.textContent = letter;
    letterElement.style.left = `${wordRect.left - pageRect.left + index * letterWidth}px`;
    letterElement.style.top = `${wordRect.top - pageRect.top}px`;
    letterElement.style.transitionDelay = `${index * 40}ms`;
    layer.append(letterElement);
  });
  await new Promise((resolve) => requestAnimationFrame(resolve));
  layer.classList.add("animate");
  await new Promise((resolve) => setTimeout(resolve, 320));
  pageStory.classList.add("trigger-page-fold");
  await new Promise((resolve) => setTimeout(resolve, 900));
  pageStory.classList.remove("trigger-preview", "trigger-page-fold");
  selectedWord.classList.remove("preview-word");
  layer.remove();
  state.previewing = false;
}

async function saveConfiguration() {
  const selected = state.selected;
  const trigger = {
    bookId: state.bookId,
    chapterId: state.chapterId,
    pageId: selected.pageId,
    paragraphIndex: selected.paragraphIndex,
    wordIndex: selected.wordIndex,
    tapCount: 3
  };
  const existing = loadSecret();
  const configuration = state.editMode && existing
    ? {
      ...existing,
      secret: {
        ...existing.secret,
        enabled: true,
        trigger,
        auth: existing.secret.auth
      }
    }
    : {
      secret: {
        enabled: true,
        trigger,
        auth: { pinHash: state.pinHash || await hashPin(state.pin) }
      }
    };
  saveSecret(configuration);
  closeSetupWizard();
  onComplete();
}

function closeSetupWizard() {
  elements.overlay.classList.remove("open");
  elements.overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("reader-open");
}

function getSelectionFromSavedTrigger() {
  const trigger = loadSecret()?.secret?.trigger;
  if (!trigger) return null;
  const book = getBuiltInBooks().find((item) => item.id === trigger.bookId);
  const chapter = book?.chapters.find((item) => item.id === trigger.chapterId);
  const pageIndex = chapter?.pages.findIndex((page) => page.id === trigger.pageId) ?? -1;
  const page = chapter?.pages[pageIndex];
  const word = page?.paragraphs?.[trigger.paragraphIndex]?.trim().split(/\s+/)?.[trigger.wordIndex];
  if (!book || !chapter || pageIndex < 0 || !page || !word) return null;
  return {
    bookId: trigger.bookId,
    chapterId: trigger.chapterId,
    pageId: trigger.pageId,
    paragraphIndex: trigger.paragraphIndex,
    wordIndex: trigger.wordIndex,
    word,
    pageIndex
  };
}
