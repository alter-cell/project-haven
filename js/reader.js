import { getBook, openOriginalFile } from "./library.js";
import { loadProgress, loadReaderPreferences, loadSecret, saveProgress, saveReaderPreferences } from "./storage.js";
import { checkTrigger, resetTrigger } from "./triggerEngine.js";

const elements = {};
const defaults = {
  fontSize: "medium",
  theme: "light",
  lineHeight: "comfortable",
  margins: "balanced"
};

let activeBook;
let chapterIndex = 0;
let pageIndex = 0;
let lastFocus;
let touchStartX = 0;
let touchStartY = 0;
let chapterStartedAt = 0;
let showingCompletion = false;
let pageDirection = 1;
let preferences = { ...defaults };
let onSecretTrigger = () => {};

export function initializeReader(options = {}) {
  onSecretTrigger = options.onSecretTrigger || onSecretTrigger;
  Object.assign(elements, {
    overlay: document.getElementById("readerOverlay"),
    card: document.querySelector(".reader-card"),
    detail: document.getElementById("detailView"),
    reader: document.getElementById("readerView"),
    title: document.getElementById("readerTitle"),
    author: document.getElementById("readerAuthor"),
    synopsis: document.getElementById("readerSynopsis"),
    cover: document.getElementById("detailCover"),
    chapters: document.getElementById("chapterList"),
    resume: document.getElementById("resumeLabel"),
    start: document.getElementById("startReadingButton"),
    back: document.getElementById("backButton"),
    chapterTitle: document.getElementById("chapterTitle"),
    counter: document.getElementById("pageCounter"),
    percentage: document.getElementById("readerPercentage"),
    timeRemaining: document.getElementById("chapterTimeRemaining"),
    progress: document.getElementById("bookProgress"),
    text: document.getElementById("readerText"),
    previous: document.getElementById("prevPageButton"),
    next: document.getElementById("nextPageButton"),
    settingsButton: document.getElementById("readerSettingsButton"),
    settingsPanel: document.getElementById("readerSettingsPanel"),
    fontSize: document.getElementById("fontSizeSelect"),
    theme: document.getElementById("themeSelect"),
    lineHeight: document.getElementById("lineHeightSelect"),
    margins: document.getElementById("marginSelect"),
    completion: document.getElementById("chapterComplete"),
    completedTitle: document.getElementById("completedChapterTitle"),
    completedTime: document.getElementById("completedTimeRead"),
    continueChapter: document.getElementById("continueChapterButton"),
    returnLibrary: document.getElementById("returnLibraryButton")
  });

  preferences = { ...defaults, ...loadReaderPreferences() };
  syncPreferenceControls();
  applyReaderPreferences();

  elements.start.addEventListener("click", startReading);
  elements.back.addEventListener("click", () => elements.reader.classList.contains("hidden") ? closeReader() : showDetails());
  elements.previous.addEventListener("click", () => changePage(-1));
  elements.next.addEventListener("click", () => showingCompletion ? finishCurrentChapter() : changePage(1));
  elements.settingsButton.addEventListener("click", toggleSettings);
  elements.continueChapter.addEventListener("click", finishCurrentChapter);
  elements.returnLibrary.addEventListener("click", showDetails);
  [elements.fontSize, elements.theme, elements.lineHeight, elements.margins].forEach((control) => {
    control.addEventListener("change", updatePreferenceFromControls);
  });
  elements.overlay.addEventListener("click", (event) => {
    if (event.target === elements.overlay) closeReader();
  });
  elements.text.addEventListener("touchstart", handleTouchStart, { passive: true });
  elements.text.addEventListener("touchend", handleTouchEnd, { passive: true });
  document.addEventListener("keydown", handleKeys);
}

const getTotalPages = (book = activeBook) => book.chapters.reduce((sum, chapter) => sum + chapter.pages.length, 0);
const getPagesBeforeChapter = (book = activeBook, index = chapterIndex) => book.chapters.slice(0, index).reduce((sum, chapter) => sum + chapter.pages.length, 0);
const getCurrentAbsolutePage = () => getPagesBeforeChapter() + pageIndex + 1;
const getChapter = () => activeBook.chapters[chapterIndex];
const getPage = () => getChapter().pages[pageIndex];
const countWords = (page) => page.paragraphs.join(" ").trim().split(/\s+/).filter(Boolean).length;
const formatDateTime = (value) => value ? new Date(value).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Never";
const estimateMinutes = (pages) => Math.max(1, Math.ceil(pages.reduce((sum, page) => sum + countWords(page), 0) / 210));

const getSavedPosition = () => {
  const saved = loadProgress()[activeBook.id] || {};
  const chapter = Math.min(Math.max(Number(saved.chapter) || 0, 0), Math.max(activeBook.chapters.length - 1, 0));
  const page = activeBook.chapters[chapter]
    ? Math.min(Math.max(Number(saved.page) || 0, 0), activeBook.chapters[chapter].pages.length - 1)
    : 0;
  return { ...saved, chapter, page };
};

const getProgressSnapshot = (book, saved = {}) => {
  if (!book.chapters.length) return null;
  const chapter = Math.min(Math.max(Number(saved.chapter) || 0, 0), book.chapters.length - 1);
  const page = Math.min(Math.max(Number(saved.page) || 0, 0), book.chapters[chapter].pages.length - 1);
  const current = book.chapters.slice(0, chapter).reduce((sum, item) => sum + item.pages.length, 0) + page + 1;
  const total = getTotalPages(book);
  const pagesLeftInChapter = Math.max(0, book.chapters[chapter].pages.length - page - 1);
  return {
    chapter,
    page,
    current,
    total,
    percent: Math.min(100, Math.round((current / total) * 100)),
    pagesLeftInChapter,
    minutesLeft: estimateMinutes(book.chapters[chapter].pages.slice(page + 1)),
    lastOpened: saved.lastOpened
  };
};

const persistPosition = () => {
  const progress = loadProgress();
  const current = getCurrentAbsolutePage();
  const total = getTotalPages();
  progress[activeBook.id] = {
    chapter: chapterIndex,
    page: pageIndex,
    currentPage: current,
    totalPages: total,
    percent: Math.round((current / total) * 100),
    chapterTitle: getChapter().title,
    lastOpened: new Date().toISOString()
  };
  saveProgress(progress);
};

function renderResumeCard(saved) {
  elements.detail.querySelector(".continue-card")?.remove();
  if (!activeBook.chapters.length) return;
  const snapshot = getProgressSnapshot(activeBook, saved);
  const card = document.createElement("div");
  card.className = "continue-card";
  card.innerHTML = `
    <span class="mini-cover ${activeBook.coverClass}" aria-hidden="true"></span>
    <div>
      <p class="continue-kicker">Continue Reading</p>
      <h3></h3>
      <dl class="continue-stats">
        <div><dt>Chapter</dt><dd></dd></div>
        <div><dt>Page</dt><dd>${snapshot.current} of ${snapshot.total}</dd></div>
        <div><dt>Progress</dt><dd>${snapshot.percent}%</dd></div>
        <div><dt>Last opened</dt><dd>${formatDateTime(snapshot.lastOpened)}</dd></div>
        <div><dt>Time left</dt><dd>${snapshot.minutesLeft} min in chapter</dd></div>
      </dl>
    </div>`;
  card.querySelector("h3").textContent = activeBook.title;
  card.querySelector("dd").textContent = activeBook.chapters[snapshot.chapter].title;
  elements.detail.insertBefore(card, elements.detail.querySelector(".chapter-panel"));
}

function renderChapters() {
  elements.chapters.replaceChildren();
  const saved = getSavedPosition();
  activeBook.chapters.forEach((chapter, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chapter-item${index === saved.chapter ? " chapter-current" : ""}`;
    button.textContent = `${index + 1}. ${chapter.title} · ${chapter.pages.length} pages · ${estimateMinutes(chapter.pages)} min`;
    button.addEventListener("click", () => openChapter(index, 0));
    elements.chapters.append(button);
  });
}

export function openBook(bookId) {
  const book = getBook(bookId);
  if (!book) return;
  activeBook = book;
  lastFocus = document.activeElement;
  elements.title.textContent = book.title;
  elements.author.textContent = book.author;
  elements.synopsis.textContent = book.synopsis;
  elements.cover.className = `detail-cover ${book.coverClass}`;
  elements.detail.classList.remove("hidden");
  elements.reader.classList.add("hidden");
  elements.reader.setAttribute("aria-hidden", "true");
  elements.back.textContent = "← Back to shelf";
  hideCompletion();
  elements.detail.querySelector(".continue-card")?.remove();

  if (!book.chapters.length) {
    elements.chapters.replaceChildren();
    elements.resume.textContent = book.format.toUpperCase();
    elements.start.textContent = "Open Original File";
    elements.start.onclick = () => openOriginalFile(book).catch((error) => optionsFeedback(error.message));
  } else {
    const saved = getSavedPosition();
    const snapshot = getProgressSnapshot(book, saved);
    elements.resume.textContent = saved.chapter || saved.page ? `${snapshot.percent}% · ${book.chapters[saved.chapter].title}` : "Not started";
    elements.start.textContent = saved.chapter || saved.page ? "Continue Reading" : "Start Reading";
    elements.start.onclick = null;
    renderResumeCard(saved);
    renderChapters();
  }
  elements.overlay.classList.add("open");
  elements.overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("reader-open");
  elements.card.scrollTop = 0;
  setTimeout(() => elements.start.focus(), 320);
}

function startReading() {
  if (!activeBook?.chapters.length) return;
  const saved = getSavedPosition();
  openChapter(saved.chapter, saved.page);
}

function showDetails() {
  resetTrigger();
  hideCompletion();
  elements.detail.classList.remove("hidden");
  elements.reader.classList.add("hidden");
  elements.reader.setAttribute("aria-hidden", "true");
  elements.back.textContent = "← Back to shelf";
  renderResumeCard(getSavedPosition());
  renderChapters();
  elements.start.focus();
}

function closeReader() {
  resetTrigger();
  hideCompletion();
  elements.overlay.classList.remove("open");
  elements.overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("reader-open");
  setTimeout(() => lastFocus?.focus(), 300);
}

function syncPreferenceControls() {
  elements.fontSize.value = preferences.fontSize;
  elements.theme.value = preferences.theme;
  elements.lineHeight.value = preferences.lineHeight;
  elements.margins.value = preferences.margins;
}

function applyReaderPreferences() {
  if (!elements.reader) return;
  elements.reader.dataset.fontSize = preferences.fontSize;
  elements.reader.dataset.theme = preferences.theme;
  elements.reader.dataset.lineHeight = preferences.lineHeight;
  elements.reader.dataset.margins = preferences.margins;
}

function updatePreferenceFromControls() {
  preferences = {
    fontSize: elements.fontSize.value,
    theme: elements.theme.value,
    lineHeight: elements.lineHeight.value,
    margins: elements.margins.value
  };
  saveReaderPreferences(preferences);
  applyReaderPreferences();
}

function toggleSettings() {
  const open = elements.settingsPanel.classList.toggle("hidden") === false;
  elements.settingsButton.setAttribute("aria-expanded", String(open));
}

function renderWords(page) {
  elements.text.replaceChildren();
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
      const paragraphWordIndex = wordIndex;
      wordElement.className = "reader-word";
      wordElement.textContent = token;
      wordElement.addEventListener("pointerdown", (event) => event.preventDefault());
      wordElement.addEventListener("click", () => checkTrigger({
        bookId: activeBook.id,
        chapterId: getChapter().id,
        pageId: page.id,
        paragraphIndex,
        wordIndex: paragraphWordIndex
      }, loadSecret(), onSecretTrigger));
      paragraphElement.append(wordElement);
      wordIndex += 1;
    });
    elements.text.append(paragraphElement);
  });
}

function renderPage() {
  hideCompletion();
  const chapter = getChapter();
  const page = getPage();
  const current = getCurrentAbsolutePage();
  const total = getTotalPages();
  const percent = Math.round((current / total) * 100);
  const chapterPagesLeft = chapter.pages.slice(pageIndex + 1);
  elements.chapterTitle.textContent = chapter.title;
  elements.counter.textContent = `Page ${pageIndex + 1} of ${chapter.pages.length}`;
  elements.percentage.textContent = `${percent}% read`;
  elements.timeRemaining.textContent = `${estimateMinutes(chapterPagesLeft)} min left in chapter`;
  elements.progress.max = total;
  elements.progress.value = current;
  elements.progress.setAttribute("aria-label", `${percent}% of book read`);
  renderWords(page);
  elements.text.classList.remove("page-enter-forward", "page-enter-back");
  void elements.text.offsetWidth;
  elements.text.classList.add(pageDirection < 0 ? "page-enter-back" : "page-enter-forward");
  elements.previous.disabled = chapterIndex === 0 && pageIndex === 0;
  elements.next.textContent = pageIndex === chapter.pages.length - 1 ? "Complete chapter" : "Next page";
  persistPosition();
  preloadNextPage();
}

function preloadNextPage() {
  const nextChapterIndex = pageIndex < getChapter().pages.length - 1 ? chapterIndex : chapterIndex + 1;
  const nextPageIndex = pageIndex < getChapter().pages.length - 1 ? pageIndex + 1 : 0;
  const nextPage = activeBook.chapters[nextChapterIndex]?.pages[nextPageIndex];
  if (!nextPage) return;
  const warmPage = () => nextPage.paragraphs.join(" ");
  if (window.requestIdleCallback) window.requestIdleCallback(warmPage);
  else window.setTimeout(warmPage, 0);
}

function openChapter(nextChapter, nextPage) {
  chapterIndex = nextChapter;
  pageIndex = nextPage;
  chapterStartedAt = Date.now();
  pageDirection = 1;
  resetTrigger();
  hideCompletion();
  elements.detail.classList.add("hidden");
  elements.reader.classList.remove("hidden");
  elements.reader.setAttribute("aria-hidden", "false");
  elements.back.textContent = "← Book details";
  elements.card.scrollTop = 0;
  renderPage();
  elements.text.focus({ preventScroll: true });
}

function showChapterCompletion() {
  showingCompletion = true;
  resetTrigger();
  const minutes = Math.max(1, Math.round((Date.now() - chapterStartedAt) / 60000));
  elements.text.classList.add("hidden");
  elements.completion.classList.remove("hidden");
  elements.completedTitle.textContent = getChapter().title;
  elements.completedTime.textContent = `Time Read: ${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  elements.next.textContent = chapterIndex < activeBook.chapters.length - 1 ? "Next chapter" : "Finish book";
  elements.previous.disabled = false;
  elements.continueChapter.textContent = chapterIndex < activeBook.chapters.length - 1 ? "Continue to Next Chapter" : "Finish Book";
  elements.continueChapter.focus();
}

function hideCompletion() {
  showingCompletion = false;
  elements.text?.classList.remove("hidden");
  elements.completion?.classList.add("hidden");
}

function finishCurrentChapter() {
  if (chapterIndex < activeBook.chapters.length - 1) {
    openChapter(chapterIndex + 1, 0);
    return;
  }
  showDetails();
}

function changePage(direction) {
  if (!activeBook?.chapters.length) return;
  if (showingCompletion) {
    if (direction < 0) {
      pageDirection = -1;
      renderPage();
    } else {
      finishCurrentChapter();
    }
    return;
  }
  const chapter = getChapter();
  resetTrigger();
  pageDirection = direction;
  if (direction > 0 && pageIndex < chapter.pages.length - 1) pageIndex++;
  else if (direction > 0 && pageIndex === chapter.pages.length - 1) { showChapterCompletion(); return; }
  else if (direction < 0 && pageIndex > 0) pageIndex--;
  else if (direction < 0 && chapterIndex > 0) { chapterIndex--; pageIndex = activeBook.chapters[chapterIndex].pages.length - 1; chapterStartedAt = Date.now(); }
  else return;
  renderPage();
}

function handleKeys(event) {
  if (!elements.overlay?.classList.contains("open")) return;
  if (event.target?.matches?.("input, select, textarea")) return;
  if (event.key === "Escape") elements.reader.classList.contains("hidden") ? closeReader() : showDetails();
  if (!elements.reader.classList.contains("hidden") && event.key === "ArrowRight") changePage(1);
  if (!elements.reader.classList.contains("hidden") && event.key === "ArrowLeft") changePage(-1);
}

function handleTouchStart(event) {
  touchStartX = event.changedTouches[0].screenX;
  touchStartY = event.changedTouches[0].screenY;
}

function handleTouchEnd(event) {
  const dx = event.changedTouches[0].screenX - touchStartX;
  const dy = event.changedTouches[0].screenY - touchStartY;
  if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
  changePage(dx < 0 ? 1 : -1);
}

function optionsFeedback(message) {
  window.dispatchEvent(new CustomEvent("petal:feedback", { detail: message }));
}

export function fadeReaderForSecret() {
  elements.card.classList.add("reader-fade");
  setTimeout(() => {
    closeReader();
    elements.card.classList.remove("reader-fade");
  }, 420);
}
