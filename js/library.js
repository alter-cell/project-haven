import { loadImportedFile, loadLibrary, saveImportedFile, saveLibrary } from "./storage.js";

const page = (id, paragraphs) => ({ id, paragraphs });

const makeChapter = (id, title, pages) => ({ id, title, pages });

const richPages = (world) => [
  page("page-1", [
    `${world.hero} noticed the morning before the village bells did. It entered quietly through ${world.place}, touching the corners of familiar things until each one seemed to remember its own importance. The cup beside the window, the folded note, the line of dust along the sill—nothing had changed, and yet the room felt as if someone had turned a hidden page.`,
    `For several minutes ${world.hero} did nothing but listen. There was comfort in the small domestic noises: a kettle gathering courage, floorboards answering a careful step, birds arguing in the hedge with all the confidence of tiny judges. Then ${world.sign} appeared, ordinary enough to be dismissed and strange enough to remain in the mind.`,
    `${world.hero} had become skilled at ignoring invitations. Work, weather, and old disappointments had taught a tidy caution. But this invitation did not demand bravery all at once. It only asked for one step, then another, and it carried the particular gentleness of something that had waited a long time without growing bitter.`,
    `By the time the sun climbed higher, ${world.hero} had packed almost nothing: a scarf, a pencil, a heel of bread, and the private hope that the day might prove larger than it looked. At the threshold, the world smelled of ${world.scent}. ${world.hero} closed the door softly, as though not to wake the life being left behind.`,
    `There are days that begin with thunder, and days that begin with a list. This one began with a pause. ${world.hero} looked back once, not from doubt but gratitude, and understood that leaving gently can still be leaving. The first step made no dramatic sound. It was only a foot on a path, which is how most adventures disguise themselves.`
  ]),
  page("page-2", [
    `The path did not announce itself. It slipped between the usual roads, keeping close to walls and hedges before opening into ${world.secretPlace}. There, light behaved differently. It pooled in patient shapes, rested on leaves, and caught in the air like pollen. ${world.hero} felt the old hurry loosen from the shoulders one thread at a time.`,
    `Someone had been there before. There were marks of care everywhere: a swept stone, a mended latch, a ribbon tied where a branch might catch the unwary. ${world.companion} had left no signature, but the kindness of the place had a handwriting of its own. ${world.hero} followed it with growing trust.`,
    `At noon, a wind moved through ${world.secretPlace} and carried voices without quite becoming words. They seemed to speak in remembered feelings: the relief after an apology, the ache of a letter never sent, the bright surprise of being welcomed back. ${world.hero} sat on a warm stone and let the memories arrive without arranging them.`,
    `The discovery waited in plain sight. ${world.discovery} was smaller than expected, worn at the edges, and beautiful because of its use rather than despite it. When ${world.hero} touched it, the whole place grew still. Not silent, exactly—more like a library when everyone inside has reached the best part of a book.`,
    `${world.hero} did not understand everything immediately, which was a mercy. Some meanings need dusk, tea, and several attempts before they agree to be known. For now it was enough to sit with the object in both hands and feel how carefully the day had arranged itself around this one modest revelation.`
  ]),
  page("page-3", [
    `Evening changed the color of every decision. What had seemed impossible at breakfast now looked merely unfinished. ${world.hero} carried ${world.discovery} back through the fading path, and the village received the return without ceremony. Lamps were being lit. Bread was being sliced. Somewhere, a child laughed too loudly and was not corrected.`,
    `The real magic, ${world.hero} understood, was not that the day had opened a secret. It was that the secret made ordinary life more visible. The chipped bowl was still chipped; the work would still be waiting; the old griefs had not politely vanished. Yet everything had gained a margin wide enough for tenderness.`,
    `Before sleep, ${world.hero} wrote down what had happened, leaving spaces where certainty would have sounded false. Some stories are harmed by being explained too quickly. They need room for doubt, for breath, for the reader to lean closer. The pencil moved until the candle bent low and the house settled around the page.`,
    `In the morning, there would be choices. A letter might be answered. A visit might be made. A door that had been avoided for years might finally open. For now, ${world.hero} placed ${world.discovery} beside the bed and listened to the night. It sounded less like an ending than a book gently waiting to be continued.`,
    `Long after the candle went out, the room kept a soft brightness. It did not shine from the window or the hearth, but from the new arrangement of courage inside ${world.hero}'s chest. Nothing had been solved completely. That was all right. A life can change first as a whisper, then as a habit, then as a door left open.`
  ])
];

const makeBook = ({ id, title, author, synopsis, coverClass, coverMark, chapters, hero, place, scent }) => ({
  id,
  builtIn: true,
  title,
  author,
  synopsis,
  coverClass,
  coverMark,
  chapters: chapters.map((chapter) => makeChapter(chapter.id, chapter.title, richPages({
    hero,
    place,
    scent,
    ...chapter
  })))
});

export const builtInBooks = {
  "summer-bloom": makeBook({
    id: "summer-bloom",
    title: "Summer Bloom",
    author: "Lila Hart",
    synopsis: "A gentle story of a garden in bloom, warmth, and friendships that blossom during quiet afternoons.",
    coverClass: "book-cover--peach",
    coverMark: "Petal",
    hero: "Mara",
    place: "the lavender room",
    scent: "wet soil, peaches, and roses opening in the heat",
    chapters: [
      { id: "dawn-garden", title: "Dawn on the Garden", sign: "a blue envelope beneath the lavender", secretPlace: "a greenhouse glazed with gold", companion: "her oldest friend", discovery: "a pressed daisy inside a silver frame" },
      { id: "tea-porch", title: "Tea on the Porch", sign: "two cups waiting on the porch rail", secretPlace: "the shade behind the climbing roses", companion: "Aunt Sora", discovery: "a teapot warm with unsent stories" },
      { id: "evening-letters", title: "Evening Letters", sign: "a stack of letters tied in garden twine", secretPlace: "the writing desk by the rain barrel", companion: "the memory of her mother", discovery: "one blank envelope addressed in familiar ink" }
    ]
  }),
  "willow-ink": makeBook({
    id: "willow-ink",
    title: "Willow & Ink",
    author: "June Alder",
    synopsis: "A warm tale of memory, inked letters, and the gentle rhythm of small-town afternoons.",
    coverClass: "book-cover--sage",
    coverMark: "Willow",
    hero: "Nell",
    place: "the stationery shop",
    scent: "paper, rain, and dark blue ink",
    chapters: [
      { id: "ink-dawn", title: "Ink-Stained Dawn", sign: "a letter in her own handwriting", secretPlace: "the lane beneath the willow", companion: "the old clockmaker", discovery: "a bottle of ink that dried into memories" },
      { id: "postcards", title: "Postcards from Home", sign: "a tin of postcards hidden under the counter", secretPlace: "the bakery, bridge, and library lane", companion: "everyone her mother had once helped", discovery: "a map drawn across seven unsent cards" },
      { id: "blue-bottle", title: "The Last Blue Bottle", sign: "a blue bottle caught in the reeds", secretPlace: "the riverbank below the mill", companion: "a child collecting smooth stones", discovery: "one final note asking for an answer" }
    ]
  }),
  "midnight-orchard": makeBook({
    id: "midnight-orchard",
    title: "Midnight Orchard",
    author: "Elise Rowan",
    synopsis: "A dreamy escape into moonlit orchards where pages turn like leaves and the world feels hushed.",
    coverClass: "book-cover--rose",
    coverMark: "Midnight",
    hero: "Iris",
    place: "the room where moonlight crossed the floorboards",
    scent: "silver apples, damp grass, and candle smoke",
    chapters: [
      { id: "moonlit", title: "Moonlit Branches", sign: "a gate daylight could not see", secretPlace: "the orchard beyond midnight", companion: "a fox with white paws", discovery: "a small apple holding her grandmother's kitchen" },
      { id: "whispers", title: "Whispers Among Leaves", sign: "leaves calling her name in borrowed voices", secretPlace: "the bare tree at the orchard's heart", companion: "old friends speaking through the branches", discovery: "a warm brass key on a blue ribbon" },
      { id: "morning-gate", title: "The Morning Gate", sign: "blossoms scattered across the morning grass", secretPlace: "the mist where the gate had stood", companion: "the first bird before dawn", discovery: "a music box that remembered its song" }
    ]
  }),
  "gentle-pages": makeBook({
    id: "gentle-pages",
    title: "Gentle Pages",
    author: "Mae Rivers",
    synopsis: "A cozy collection of simple moments, warm tea, and pages soft enough to soothe the busiest mind.",
    coverClass: "book-cover--cocoa",
    coverMark: "Gentle",
    hero: "Mae",
    place: "the window seat",
    scent: "cardamom tea, wool blankets, and rain on stone",
    chapters: [
      { id: "soft-morning", title: "Soft Morning", sign: "a candle flame leaning toward the rain", secretPlace: "the quiet kitchen before breakfast", companion: "a cat who approved of stillness", discovery: "a list of three good things" },
      { id: "window-seat", title: "The Window Seat", sign: "a raindrop crossing the glass like a traveler", secretPlace: "the small theatre of umbrellas below", companion: "a neighbor carrying tulips", discovery: "ten pages that returned an hour to her" },
      { id: "quiet-light", title: "A Quiet Light", sign: "gold arriving without asking anything", secretPlace: "the room between afternoon and evening", companion: "the kettle's patient song", discovery: "a sprig of thyme marking tomorrow's page" }
    ]
  }),
  "petal-harvest": makeBook({
    id: "petal-harvest",
    title: "Petal Harvest",
    author: "Aria Bloom",
    synopsis: "A seasonal story wrapped in petal-soft prose and warm candlelit pages.",
    coverClass: "book-cover--blush",
    coverMark: "Harvest",
    hero: "Wren",
    place: "the drying room beneath the rafters",
    scent: "rose petals, beeswax, and late summer straw",
    chapters: [
      { id: "amber", title: "Amber Afternoon", sign: "the last roses leaning heavily in amber light", secretPlace: "the garden wall where summer thinned", companion: "her grandmother's careful journal", discovery: "a basket carrying the whole season" },
      { id: "drying-room", title: "The Drying Room", sign: "one unfamiliar bloom blue as twilight", secretPlace: "the rafters where petals rested on linen", companion: "a moth dusted in gold", discovery: "a wishing flower pressed between recipes" },
      { id: "candlelit", title: "Candlelit Stories", sign: "blue petals inside a paper lantern", secretPlace: "the village square after sunset", companion: "neighbors carrying matches and bread", discovery: "a lantern that planted warmth wherever it shone" }
    ]
  }),
  "honeyed-stories": makeBook({
    id: "honeyed-stories",
    title: "Honeyed Stories",
    author: "Nova Clay",
    synopsis: "An anthology of honeyed memories, warm voices, and quiet evenings under soft lamplight.",
    coverClass: "book-cover--terra",
    coverMark: "Honeyed",
    hero: "Nova",
    place: "Aunt Sora's pantry",
    scent: "toast, clover honey, and cedar shelves",
    chapters: [
      { id: "golden-jar", title: "The Golden Jar", sign: "one jar of honey saved for important stories", secretPlace: "the pantry where summers were kept", companion: "Aunt Sora", discovery: "a golden drop carrying her father's laugh" },
      { id: "lamp-letters", title: "Lamplight Letters", sign: "scraps of brown paper by the lamp", secretPlace: "the table after supper", companion: "cousins trading brave apologies", discovery: "a jar filling with folded memories" },
      { id: "winter-breakfast", title: "Breakfast in Winter", sign: "snow sealing the road with quiet authority", secretPlace: "the kitchen warm before noon", companion: "everyone who had meant to leave early", discovery: "ordinary honey bright enough to hold summer" }
    ]
  }),
  "rosewood-trails": makeBook({
    id: "rosewood-trails",
    title: "Rosewood Trails",
    author: "Elodie Shaw",
    synopsis: "A journey through rosewood forests, lantern-lit paths, and quiet conversations beneath the stars.",
    coverClass: "book-cover--mauve",
    coverMark: "Rosewood",
    hero: "Elodie",
    place: "the edge of the unmapped woods",
    scent: "rosewood bark, night air, and lantern oil",
    chapters: [
      { id: "lantern-path", title: "Lantern Path", sign: "lanterns brightening at every true word", secretPlace: "woods no map admitted existed", companion: "a traveler with silver buttons", discovery: "a lantern seed warm in her palm" },
      { id: "bridge", title: "The Listening Bridge", sign: "a bridge crossing a river of reflected stars", secretPlace: "the listening place above the water", companion: "a stranger asking what she could leave", discovery: "an old regret made light enough to set down" },
      { id: "starlight", title: "North by Starlight", sign: "one star pulsing like a patient compass", secretPlace: "a hill full of wind", companion: "the trees opening their dark hands", discovery: "a way home that did not shrink the journey" }
    ]
  }),
  "soft-linen": makeBook({
    id: "soft-linen",
    title: "Soft Linen",
    author: "June Vale",
    synopsis: "A polished tale of linen-soft afternoons, intentional pauses, and the comfort of a trusted story.",
    coverClass: "book-cover--coffee",
    coverMark: "Linen",
    hero: "June",
    place: "the sunlit sewing room",
    scent: "linen, peaches, and coffee cooling in a blue cup",
    chapters: [
      { id: "linen-light", title: "Linen Light", sign: "afternoon divided into a thousand soft squares", secretPlace: "the table where a novel and peach waited", companion: "a bee worrying the window", discovery: "the permission to choose one good thing slowly" },
      { id: "paused-pages", title: "Paused Pages", sign: "a sentence asking for silence", secretPlace: "the paragraph where she had left herself", companion: "the quiet that stayed five minutes", discovery: "a story made deeper because she had changed" },
      { id: "mended-sleeve", title: "The Mended Sleeve", sign: "a blue cuff worn thin at the elbow", secretPlace: "the garden after the last stitch", companion: "an unfinished book under her arm", discovery: "visible mending bright as honesty" }
    ]
  })
};

export const getBuiltInBooks = () => Object.values(builtInBooks);
export const getBook = (id) => builtInBooks[id] || loadLibrary().find((book) => book.id === id);

const titleFromFile = (name) => name.replace(/\.(epub|pdf|txt)$/i, "").replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const splitTextIntoPages = (text) => {
  const paragraphs = text.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
  const pages = [];
  let current = [];
  let words = 0;
  paragraphs.forEach((paragraph) => {
    const paragraphWords = paragraph.split(/\s+/).filter(Boolean).length;
    if (words >= 300 && current.length) {
      pages.push(current);
      current = [];
      words = 0;
    }
    current.push(paragraph);
    words += paragraphWords;
  });
  if (current.length) pages.push(current);
  return pages.length ? pages : [["This text file is empty."]];
};

export async function importBook(file) {
  const extension = file.name.split(".").pop().toLowerCase();
  if (!["epub", "pdf", "txt"].includes(extension)) throw new Error("Choose an EPUB, PDF, or TXT file.");
  const id = `imported-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const record = {
    id, builtIn: false, title: titleFromFile(file.name), author: "My Library",
    synopsis: `Imported ${extension.toUpperCase()} · ${Math.max(1, Math.round(file.size / 1024))} KB`,
    format: extension, coverClass: "book-cover--imported", coverMark: extension,
    chapters: []
  };
  if (extension === "txt") {
    const text = await file.text();
    const pages = splitTextIntoPages(text);
    record.chapters = [{ id: "imported-text", title: "Imported Text", pages: pages.map((paragraphs, index) => ({ id: `page-${index + 1}`, paragraphs })) }];
  }
  await saveImportedFile(id, file);
  const current = loadLibrary();
  current.push(record);
  saveLibrary(current);
  return record;
}

export async function openOriginalFile(book) {
  const file = await loadImportedFile(book.id);
  if (!file) throw new Error("The original file could not be found.");
  const url = URL.createObjectURL(file);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
