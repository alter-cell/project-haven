const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchCard = document.getElementById('searchCard');
const feedbackBanner = document.getElementById('feedbackBanner');
const readerOverlay = document.getElementById('readerOverlay');
const readerTitle = document.getElementById('readerTitle');
const readerAuthor = document.getElementById('readerAuthor');
const readerSynopsis = document.getElementById('readerSynopsis');
const detailCover = document.getElementById('detailCover');
const detailView = document.getElementById('detailView');
const readerView = document.getElementById('readerView');
const chapterList = document.getElementById('chapterList');
const resumeLabel = document.getElementById('resumeLabel');
const startReadingButton = document.getElementById('startReadingButton');
const chapterTitle = document.getElementById('chapterTitle');
const pageCounter = document.getElementById('pageCounter');
const bookProgress = document.getElementById('bookProgress');
const readerText = document.getElementById('readerText');
const prevPageButton = document.getElementById('prevPageButton');
const nextPageButton = document.getElementById('nextPageButton');
const backButton = document.getElementById('backButton');
const books = [...document.querySelectorAll('.book')];

const library = {
  'summer-bloom': {
    title: 'Summer Bloom',
    author: 'Lila Hart',
    synopsis: 'A gentle story of a garden in bloom, warmth, and friendships that blossom during quiet afternoons.',
    coverClass: 'book-cover--peach',
    chapters: [
      {
        title: 'Dawn on the Garden',
        pages: [
          'The morning unfolded like petals, soft and slow, as the sun painted the garden in pale gold.',
          'Lila wandered between lavender and roses, each breath carrying the memory of summer rain.'
        ]
      },
      {
        title: 'Tea on the Porch',
        pages: [
          'Warm tea cooled at the edge of her cup while the world outside hummed with quiet conversation.',
          'Stories of old friends and favorite books drifted in the afternoon light like dust motes.'
        ]
      },
      {
        title: 'Evening Letters',
        pages: [
          'She traced ink with a thoughtful finger, writing letters that felt like little promises.',
          'Outside, the garden settled into shadow, and each line she wrote became part of her gentle evening ritual.'
        ]
      }
    ]
  },
  'willow-ink': {
    title: 'Willow & Ink',
    author: 'June Alder',
    synopsis: 'A warm hardcover tale of memory, inked letters, and the gentle rhythm of small town afternoons.',
    coverClass: 'book-cover--sage',
    chapters: [
      {
        title: 'Ink-Stained Dawn',
        pages: [
          'By the window, ink pooled like quiet stars on paper, each letter carrying the weight of something true.',
          'The willow outside bent with the breeze, listening to the soft scratch of pen on paper.'
        ]
      },
      {
        title: 'Postcards from Home',
        pages: [
          'Postcards arrived with stamps and stories, folded like soft whispers from far away places.',
          'She smiled as she read, feeling the warm tether of home across the miles.'
        ]
      }
    ]
  },
  'midnight-orchard': {
    title: 'Midnight Orchard',
    author: 'Elise Rowan',
    synopsis: 'A dreamy hardcover escape into moonlit orchards where pages turn like leaves and the world feels hushed.',
    coverClass: 'book-cover--rose',
    chapters: [
      {
        title: 'Moonlit Branches',
        pages: [
          'The orchard shimmered beneath a moon that felt soft as silk, each branch bowing with quiet secrets.',
          'Night air tasted of apples and jasmine, and every footstep felt like a story unfolding.'
        ]
      },
      {
        title: 'Whispers Among Leaves',
        pages: [
          'Leaves whispered old stories in the breeze, letting her wander deeper into the magic of the night.',
          'She followed the sound until the orchard felt like a memory she had only just remembered.'
        ]
      }
    ]
  },
  'gentle-pages': {
    title: 'Gentle Pages',
    author: 'Mae Rivers',
    synopsis: 'A cozy hardcover collection of simple moments, warm tea, and pages soft enough to soothe the busiest mind.',
    coverClass: 'book-cover--cocoa',
    chapters: [
      {
        title: 'Soft Morning',
        pages: [
          'Morning arrived in hushed tones, with a candle flicker and the gentle turning of a new page.',
          'Each sentence was a quiet invitation to breathe slower and savor the warmth of being present.'
        ]
      },
      {
        title: 'Quiet Pages',
        pages: [
          'She read by the window, where rain traced slow patterns on the glass and time softened around her.',
          'The book felt cozy in her hands, comforting as a warm scarf on a cool evening.'
        ]
      }
    ]
  },
  'petal-harvest': {
    title: 'Petal Harvest',
    author: 'Aria Bloom',
    synopsis: 'A hardcover seasonal story wrapped in petal-soft prose and warm candlelit pages.',
    coverClass: 'book-cover--blush',
    chapters: [
      {
        title: 'Amber Afternoon',
        pages: [
          'The air was sweet with late summer petals, their color deepening in the warm afternoon light.',
          'She wandered through rows of blossoms, collecting moments like pressed flowers.'
        ]
      },
      {
        title: 'Candlelit Stories',
        pages: [
          'Stories glowed gently in the candlelight, each word a soft beacon in the dusky room.',
          'As evening fell, she listened to the quiet rhythm of the harvest season.'
        ]
      }
    ]
  },
  'honeyed-stories': {
    title: 'Honeyed Stories',
    author: 'Nova Clay',
    synopsis: 'A hardcover anthology of honeyed memories, warm voices, and quiet evenings under soft lamplight.',
    coverClass: 'book-cover--terra',
    chapters: [
      {
        title: 'Warm Memories',
        pages: [
          'Golden memories spilled across the page like honey, sweet and easy to savor.',
          'Each story was a quiet comfort, carrying the warmth of gentle evenings shared together.'
        ]
      },
      {
        title: 'Lamplight Letters',
        pages: [
          'Lamplight made the ink glow softly while voices from the past felt close enough to touch.',
          'She turned each page slowly, feeling the gentle pulse of stories told in quiet corners.'
        ]
      }
    ]
  },
  'rosewood-trails': {
    title: 'Rosewood Trails',
    author: 'Elodie Shaw',
    synopsis: 'A hardcover journey through rosewood forests, lantern-lit paths, and quiet conversations beneath the stars.',
    coverClass: 'book-cover--mauve',
    chapters: [
      {
        title: 'Lantern Path',
        pages: [
          'Lantern light traced the trail through rosewood trees, each step softened by moss and moonlight.',
          'Her heart felt steady as she walked, guided by the gentle glow ahead.'
        ]
      },
      {
        title: 'Night Conversations',
        pages: [
          'Conversations under the stars were warm and hushed, like secrets shared by old friends.',
          'The forest listened, its silence making each word feel more precious.'
        ]
      }
    ]
  },
  'soft-linen': {
    title: 'Soft Linen',
    author: 'June Vale',
    synopsis: 'A polished hardcover tale of linen-soft afternoons, intentional pauses, and the comfort of a trusted story.',
    coverClass: 'book-cover--coffee',
    chapters: [
      {
        title: 'Linen Light',
        pages: [
          'Afternoons folded into linen-soft light, with gentle pauses between every thought.',
          'The cadence of the room was calm, comfortable as a favorite sweater.'
        ]
      },
      {
        title: 'Paused Pages',
        pages: [
          'Pages turned with intention, giving her time to linger over words that felt like home.',
          'In the quiet, she found a gentle ease that settled in like a soft breeze.'
        ]
      }
    ]
  }
};

let activeBookId = null;
let activeChapterIndex = 0;
let activePageIndex = 0;

const STORAGE_KEY = 'petal-pages-progress';

const loadProgress = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

const saveProgress = (progress) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

const progressData = loadProgress();

const showFeedback = (message) => {
  feedbackBanner.textContent = message;
  feedbackBanner.style.opacity = '1';
  window.clearTimeout(showFeedback.timeoutId);
  showFeedback.timeoutId = window.setTimeout(() => {
    feedbackBanner.style.opacity = '0';
  }, 2400);
};

const getBookData = (bookId) => library[bookId];

const getBookProgress = (bookId) => progressData[bookId] || { chapter: 0, page: 0 };

const setBookProgress = (bookId, chapter, page) => {
  progressData[bookId] = { chapter, page };
  saveProgress(progressData);
};

const renderChapterList = (bookId) => {
  const book = getBookData(bookId);
  chapterList.innerHTML = '';

  book.chapters.forEach((chapter, index) => {
    const chapterButton = document.createElement('button');
    chapterButton.type = 'button';
    chapterButton.className = 'chapter-item';
    chapterButton.textContent = `${index + 1}. ${chapter.title}`;
    chapterButton.addEventListener('click', () => openChapter(bookId, index));
    chapterList.appendChild(chapterButton);
  });
};

const updateResumeLabel = (bookId) => {
  const progress = getBookProgress(bookId);
  const book = getBookData(bookId);

  if (progress.chapter !== undefined && book.chapters[progress.chapter]) {
    resumeLabel.textContent = `Resume from chapter ${progress.chapter + 1}`;
  } else {
    resumeLabel.textContent = '';
  }
};

const renderReader = () => {
  const book = getBookData(activeBookId);
  const chapter = book.chapters[activeChapterIndex];
  const totalPages = chapter.pages.length;

  chapterTitle.textContent = chapter.title;
  readerText.innerHTML = `<p>${chapter.pages[activePageIndex]}</p>`;
  pageCounter.textContent = `Page ${activePageIndex + 1} of ${totalPages}`;
  bookProgress.max = totalPages;
  bookProgress.value = activePageIndex + 1;

  prevPageButton.disabled = activePageIndex === 0;
  nextPageButton.textContent = activePageIndex < totalPages - 1 ? 'Next page' : 'Finish chapter';

  setBookProgress(activeBookId, activeChapterIndex, activePageIndex);
};

const showDetailView = () => {
  detailView.classList.remove('hidden');
  readerView.classList.add('hidden');
};

const showReaderView = () => {
  detailView.classList.add('hidden');
  readerView.classList.remove('hidden');
};

const openBook = (bookId) => {
  const book = getBookData(bookId);
  activeBookId = bookId;
  activeChapterIndex = 0;
  activePageIndex = 0;

  readerTitle.textContent = book.title;
  readerAuthor.textContent = book.author;
  readerSynopsis.textContent = book.synopsis;
  detailCover.className = `detail-cover ${book.coverClass}`;

  renderChapterList(bookId);
  updateResumeLabel(bookId);
  showDetailView();
  readerOverlay.classList.add('open');
  readerOverlay.setAttribute('aria-hidden', 'false');

  showFeedback(`Opened “${book.title}”.`);
};

const openChapter = (bookId, chapterIndex) => {
  if (activeBookId !== bookId) {
    openBook(bookId);
  }

  activeChapterIndex = chapterIndex;
  activePageIndex = 0;
  renderReader();
  showReaderView();
};

const startReading = () => {
  if (!activeBookId) return;
  const progress = getBookProgress(activeBookId);
  activeChapterIndex = progress.chapter || 0;
  activePageIndex = progress.page || 0;
  renderReader();
  showReaderView();
};

const closeReader = () => {
  readerOverlay.classList.remove('open');
  readerOverlay.setAttribute('aria-hidden', 'true');
};

books.forEach((book) => {
  book.addEventListener('click', () => openBook(book.dataset.bookId));
});

backButton.addEventListener('click', closeReader);
startReadingButton.addEventListener('click', startReading);

prevPageButton.addEventListener('click', () => {
  if (!activeBookId) return;
  if (activePageIndex > 0) {
    activePageIndex -= 1;
    renderReader();
  }
});

nextPageButton.addEventListener('click', () => {
  if (!activeBookId) return;
  const book = getBookData(activeBookId);
  const chapter = book.chapters[activeChapterIndex];

  if (activePageIndex < chapter.pages.length - 1) {
    activePageIndex += 1;
    renderReader();
    return;
  }

  if (activeChapterIndex < book.chapters.length - 1) {
    activeChapterIndex += 1;
    activePageIndex = 0;
    renderReader();
    return;
  }

  showFeedback(`You finished ${book.title}.`);
  showDetailView();
});

searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (!query) {
    showFeedback('Type a title or author to explore the shelves.');
    return;
  }

  const matches = books.filter((book) => {
    const text = `${book.dataset.title} ${book.dataset.author}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  if (matches.length) {
    showFeedback(`${matches.length} book(s) matched “${query}”.`);
    matches.forEach((match) => match.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  } else {
    showFeedback(`No matches found for “${query}”. Try another title.`);
  }
});

searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    searchButton.click();
  }
});

const updateSearchPill = () => {
  const threshold = 120;
  if (window.scrollY > threshold && !readerOverlay.classList.contains('open')) {
    searchCard.classList.add('pill-mode');
  } else {
    searchCard.classList.remove('pill-mode');
  }
};

window.addEventListener('scroll', updateSearchPill);
window.addEventListener('resize', updateSearchPill);
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && readerOverlay.classList.contains('open')) {
    closeReader();
  }
});

updateSearchPill();
