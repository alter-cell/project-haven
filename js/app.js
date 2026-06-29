import { getBook, importBook } from "./library.js";
import { initializeLibraryGuide } from "./libraryGuide.js";
import { fadeReaderForSecret, initializeReader, openBook } from "./reader.js";
import { registerRoute } from "./router.js";
import { initializeSecretSpace, openPinScreen, showSecretHome } from "./secretSpace.js";
import { initializeSetupWizard, openSetupWizard, openTriggerSetup } from "./setupWizard.js";
import { loadLibrary, loadSecret } from "./storage.js";

const feedback = document.getElementById("feedbackBanner");
const search = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchCard = document.getElementById("searchCard");
const fileInput = document.getElementById("bookFileInput");
const myLibraryBooks = document.getElementById("myLibraryBooks");
const emptyShelf = document.getElementById("emptyShelfMessage");

function showFeedback(message) {
  feedback.textContent = message;
  clearTimeout(showFeedback.timer);
  showFeedback.timer = setTimeout(() => { feedback.textContent = ""; }, 3000);
}

function bindBookButtons(root = document) {
  root.querySelectorAll(".book:not([data-bound])").forEach((button) => {
    button.dataset.bound = "true";
    button.addEventListener("click", () => openBook(button.dataset.bookId));
  });
}

function createBookButton(book) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "book imported-book";
  button.dataset.bookId = book.id;
  button.dataset.title = book.title;
  button.dataset.author = book.author;
  button.innerHTML = `
    <span class="book-shell">
      <span class="book-spine"></span>
      <span class="book-cover ${book.coverClass}">
        <span class="bookmark"></span>
        <span class="cover-mark">${book.coverMark}</span>
      </span>
    </span>
    <span class="book-label"><strong></strong><span></span></span>`;
  button.querySelector("strong").textContent = book.title;
  button.querySelector(".book-label span").textContent = book.author;
  return button;
}

function renderMyLibrary() {
  const imported = loadLibrary();
  myLibraryBooks.replaceChildren(...imported.map(createBookButton));
  emptyShelf.hidden = imported.length > 0;
  bindBookButtons(myLibraryBooks);
}

async function handleImports() {
  const files = [...fileInput.files];
  if (!files.length) return;
  let imported = 0;
  for (const file of files) {
    try {
      await importBook(file);
      imported++;
    } catch (error) {
      showFeedback(error.message);
    }
  }
  fileInput.value = "";
  renderMyLibrary();
  if (imported) showFeedback(`${imported} ${imported === 1 ? "book" : "books"} added to My Library.`);
}

function runSearch() {
  const query = search.value.trim().toLowerCase();
  const buttons = [...document.querySelectorAll(".book")];
  let matches = 0;
  buttons.forEach((button) => {
    const book = getBook(button.dataset.bookId);
    const match = !query || `${book.title} ${book.author}`.toLowerCase().includes(query);
    button.hidden = !match;
    if (match) matches++;
  });
  showFeedback(query ? `${matches} ${matches === 1 ? "book" : "books"} found.` : "Showing the full library.");
}

function revealPinScreen() {
  fadeReaderForSecret();
  setTimeout(openPinScreen, 430);
}

initializeReader({ onSecretTrigger: revealPinScreen });
initializeSetupWizard({ onComplete: () => showFeedback("Your library is ready.") });
initializeSecretSpace();
initializeLibraryGuide({
  onBack: showSecretHome,
  onChangeTrigger: () => {
    document.getElementById("secretOverlay").classList.remove("open");
    document.getElementById("secretOverlay").setAttribute("aria-hidden", "true");
    openTriggerSetup(loadSecret().secret.auth.pinHash);
  },
  onRestored: renderMyLibrary
});

registerRoute("library", () => {});
registerRoute("reader", ({ bookId }) => openBook(bookId));
bindBookButtons();
renderMyLibrary();

document.getElementById("addToShelfButton").addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", handleImports);
searchButton.addEventListener("click", runSearch);
search.addEventListener("input", runSearch);
search.addEventListener("keydown", (event) => {
  if (event.key === "Enter") runSearch();
});
window.addEventListener("petal:feedback", (event) => showFeedback(event.detail));
window.addEventListener("scroll", () => {
  const modalOpen = document.querySelector(".experience-overlay.open, .reader-overlay.open");
  searchCard.classList.toggle("pill-mode", window.scrollY > 120 && !modalOpen);
}, { passive: true });

if (!loadSecret()) openSetupWizard();
