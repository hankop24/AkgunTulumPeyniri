import { FIREBASE_CONFIG } from "../config/firebase-config.js";
import { FIRESTORE_COLLECTIONS } from "../config/app-config.js";

let firebaseReady = null;
let firebaseApi = null;

export function isFirebaseConfigured() {
  return Boolean(FIREBASE_CONFIG?.apiKey && FIREBASE_CONFIG?.projectId && FIREBASE_CONFIG.projectId !== "YOUR_PROJECT_ID");
}

export async function getBackendStatus() {
  if (!isFirebaseConfigured()) {
    return { mode: "local", label: "Yerel mod", detail: "Firebase ayarı yok. Veriler sadece bu tarayıcıda tutulur." };
  }
  try {
    await ensureFirebase();
    return { mode: "firebase", label: "Canlı veritabanı", detail: "Firebase Firestore aktif. Değişiklikler tüm cihazlara yansır." };
  } catch (error) {
    console.warn("Firebase bağlantısı kurulamadı.", error);
    return { mode: "local", label: "Yerel yedek mod", detail: "Firebase bağlantısı başarısız. Sistem localStorage ile çalışıyor." };
  }
}

async function ensureFirebase() {
  if (firebaseReady) return firebaseReady;
  firebaseReady = (async () => {
    const appModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
    const firestoreModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
    const app = appModule.initializeApp(FIREBASE_CONFIG);
    const db = firestoreModule.getFirestore(app);
    firebaseApi = { ...firestoreModule, db };
    return firebaseApi;
  })();
  return firebaseReady;
}

export async function readDoc(collectionName, docId) {
  if (!isFirebaseConfigured()) return null;
  const api = await ensureFirebase();
  const ref = api.doc(api.db, collectionName, docId);
  const snap = await api.getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function writeDoc(collectionName, docId, data) {
  if (!isFirebaseConfigured()) return null;
  const api = await ensureFirebase();
  const ref = api.doc(api.db, collectionName, docId);
  await api.setDoc(ref, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  return data;
}

export async function readCollection(collectionName) {
  if (!isFirebaseConfigured()) return null;
  const api = await ensureFirebase();
  const ref = api.collection(api.db, collectionName);
  const snap = await api.getDocs(ref);
  return snap.docs.map((docSnap) => ({ ...docSnap.data(), id: docSnap.id }));
}

export async function writeCollectionDoc(collectionName, id, data) {
  if (!isFirebaseConfigured()) return null;
  const api = await ensureFirebase();
  const ref = api.doc(api.db, collectionName, String(id));
  await api.setDoc(ref, { ...data, id: String(id), updatedAt: new Date().toISOString() }, { merge: true });
  return data;
}

export async function deleteCollectionDoc(collectionName, id) {
  if (!isFirebaseConfigured()) return null;
  const api = await ensureFirebase();
  await api.deleteDoc(api.doc(api.db, collectionName, String(id)));
  return true;
}

export async function seedFirebase({ products, settings, content }) {
  if (!isFirebaseConfigured()) throw new Error("Firebase ayarları girilmemiş.");
  await writeDoc(FIRESTORE_COLLECTIONS.site, FIRESTORE_COLLECTIONS.settingsDoc, settings);
  await writeDoc(FIRESTORE_COLLECTIONS.site, FIRESTORE_COLLECTIONS.contentDoc, content);
  await Promise.all(products.map((product) => writeCollectionDoc(FIRESTORE_COLLECTIONS.products, product.id, product)));
  return true;
}
