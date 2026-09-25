export type WorkLetterRecord = {
  id: string;
  companyId: string;
  language: "ar" | "en";
  savedAt: string;
  data: WorkLetterData;
};

export type WorkLetterData = {
  companyId: string;
  employeeName: string;
  jobTitle: string;
  salary: string;
  salaryWords: string;
  passportNo?: string;
  identityNo?: string;
  birthPlace: string;
  birthDate: string;
  joiningDate: string;
  issueDate: string;
  reference: string;
  internalNo: string;
  issuerName: string;
};

const DB_NAME = "work-letters-independent-db";
const DB_VERSION = 1;
const STORE = "work_letter_records";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error("Database open failed"));
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("companyId", "companyId", { unique: false });
        store.createIndex("savedAt", "savedAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

export async function saveWorkLetter(data: WorkLetterData, language: "ar" | "en") {
  const db = await openDatabase();
  const record: WorkLetterRecord = {
    id: `${data.companyId}-${language}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
    companyId: data.companyId,
    language,
    savedAt: new Date().toISOString(),
    data,
  };
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, "readwrite").objectStore(STORE).put(record);
    request.onerror = () => reject(request.error ?? new Error("Save failed"));
    request.onsuccess = () => resolve();
  });
  db.close();
  return record;
}

export async function listWorkLetters(companyId?: string, language?: "ar" | "en") {
  const db = await openDatabase();
  const records = await new Promise<WorkLetterRecord[]>((resolve, reject) => {
    const request = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    request.onerror = () => reject(request.error ?? new Error("Read failed"));
    request.onsuccess = () => resolve((request.result as WorkLetterRecord[]).sort((a, b) => b.savedAt.localeCompare(a.savedAt)));
  });
  db.close();
  return records.filter(record => (!companyId || record.companyId === companyId) && (!language || record.language === language));
}

export async function deleteWorkLetter(id: string) {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, "readwrite").objectStore(STORE).delete(id);
    request.onerror = () => reject(request.error ?? new Error("Delete failed"));
    request.onsuccess = () => resolve();
  });
  db.close();
}

export function draftKey(companyId: string, language: "ar" | "en") {
  return `work-letters:draft:${companyId}:${language}`;
}

export function recordsKey(companyId: string, language: "ar" | "en") {
  return `work-letters:records:${companyId}:${language}`;
}
