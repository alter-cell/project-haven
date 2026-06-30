const KEYS = {
  secret: "petal-pages-secret",
  progress: "petal-pages-progress",
  library: "petal-pages-library",
  readerPreferences: "petal-pages-reader-preferences"
};

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export const loadSecret = () => read(KEYS.secret, null);
export const saveSecret = (configuration) => write(KEYS.secret, configuration);
export const deleteSecret = () => localStorage.removeItem(KEYS.secret);
export const loadProgress = () => read(KEYS.progress, {});
export const saveProgress = (progress) => write(KEYS.progress, progress);
export const loadLibrary = () => read(KEYS.library, []);
export const saveLibrary = (books) => write(KEYS.library, books);
export const loadReaderPreferences = () => read(KEYS.readerPreferences, {});
export const saveReaderPreferences = (preferences) => write(KEYS.readerPreferences, preferences);

const openFiles = () => new Promise((resolve, reject) => {
  const request = indexedDB.open("petal-pages-files", 1);
  request.onupgradeneeded = () => request.result.createObjectStore("files", { keyPath: "id" });
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

export async function saveImportedFile(id, file) {
  const db = await openFiles();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction("files", "readwrite");
    transaction.objectStore("files").put({ id, file });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function loadImportedFile(id) {
  const db = await openFiles();
  const result = await new Promise((resolve, reject) => {
    const request = db.transaction("files").objectStore("files").get(id);
    request.onsuccess = () => resolve(request.result?.file || null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return result;
}

export function backup() {
  return JSON.stringify({
    format: "petal-pages-backup",
    version: 1,
    createdAt: new Date().toISOString(),
    secret: loadSecret(),
    progress: loadProgress(),
    library: loadLibrary(),
    readerPreferences: loadReaderPreferences()
  }, null, 2);
}

export function restore(rawBackup) {
  const data = JSON.parse(rawBackup);
  if (data?.format !== "petal-pages-backup" || data.version !== 1 || !data.secret) {
    throw new Error("This is not a valid Petal Pages backup.");
  }
  saveSecret(data.secret);
  saveProgress(data.progress || {});
  saveLibrary(data.library || []);
  saveReaderPreferences(data.readerPreferences || {});
  return data;
}
