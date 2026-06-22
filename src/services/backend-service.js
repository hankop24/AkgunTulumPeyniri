import { FIREBASE_CONFIG } from "../config/firebase-config.js";
import { FIRESTORE_COLLECTIONS } from "../config/app-config.js";

let firebaseReady = null;
let firebaseApi = null;

export function isFirebaseConfigured() {
  return Boolean(
    FIREBASE_CONFIG?.apiKey &&
    FIREBASE_CONFIG?.projectId &&
    FIREBASE_CONFIG.projectId !== "YOUR_PROJECT_ID"
  );
}

export async function getBackendStatus() {
  if (!isFirebaseConfigured()) {
    return {
      mode: "local",
      label: "Yerel mod",
      detail: "Firebase ayarı yok. Veriler sadece bu tarayıcıda tutulur.",
      message: "Firebase ayarı yok. Veriler sadece bu tarayıcıda tutulur."
    };
  }

  try {
    await ensureFirebase();
    return {
      mode: "firebase",
      label: "Canlı Firebase modu",
      detail: "Firestore, Authentication ve Storage bağlantısı aktif.",
      message: "Firestore, Authentication ve Storage bağlantısı aktif."
    };
  } catch (error) {
    console.warn("Firebase bağlantısı kurulamadı.", error);
    return {
      mode: "local",
      label: "Yerel yedek mod",
      detail: "Firebase bağlantısı başarısız. Sistem localStorage ile çalışıyor.",
      message: "Firebase bağlantısı başarısız. Sistem localStorage ile çalışıyor."
    };
  }
}

async function ensureFirebase() {
  if (firebaseReady) return firebaseReady;

  firebaseReady = (async () => {
    const appModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
    const firestoreModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
    const authModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js");
    const storageModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js");

    const app = appModule.getApps().length
      ? appModule.getApp()
      : appModule.initializeApp(FIREBASE_CONFIG);

    const db = firestoreModule.getFirestore(app);
    const auth = authModule.getAuth(app);
    const storage = storageModule.getStorage(app);

    firebaseApi = {
      app,
      db,
      auth,
      storage,
      ...firestoreModule,
      ...authModule,
      ...storageModule
    };

    return firebaseApi;
  })();

  return firebaseReady;
}

export async function getFirebaseApi() {
  return ensureFirebase();
}

export async function signInAdmin(email, password) {
  const api = await ensureFirebase();
  return api.signInWithEmailAndPassword(api.auth, email, password);
}

export async function signOutAdmin() {
  const api = await ensureFirebase();
  return api.signOut(api.auth);
}

export async function getCurrentAdmin() {
  const api = await ensureFirebase();
  return api.auth.currentUser;
}

export async function onAdminAuthStateChanged(callback) {
  const api = await ensureFirebase();
  return api.onAuthStateChanged(api.auth, callback);
}

export async function updateAdminPassword(currentPassword, newPassword) {
  const api = await ensureFirebase();
  const user = api.auth.currentUser;

  if (!user || !user.email) {
    throw new Error("Şifreyi güncellemek için admin girişi yapmalısın.");
  }

  const credential = api.EmailAuthProvider.credential(user.email, currentPassword);
  await api.reauthenticateWithCredential(user, credential);
  await api.updatePassword(user, newPassword);
  return true;
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

function safeFileName(fileName = "image") {
  return String(fileName)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export async function uploadImageFile(file, folder = "product-images") {
  if (!file) throw new Error("Yüklenecek dosya bulunamadı.");
  if (!isFirebaseConfigured()) throw new Error("Firebase Storage ayarı bulunamadı.");

  const api = await ensureFirebase();
  if (!api.auth.currentUser) {
    throw new Error("Görsel yüklemek için admin girişi yapmalısın.");
  }

  const extension = file.name?.split(".").pop() || "jpg";
  const filename = `${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}-${safeFileName(file.name || `image.${extension}`)}`;
  const cleanFolder = String(folder || "images").replace(/^\/+|\/+$/g, "");
  const storageRef = api.ref(api.storage, `${cleanFolder}/${filename}`);

  await api.uploadBytes(storageRef, file, {
    contentType: file.type || "image/jpeg",
    customMetadata: {
      uploadedFrom: "akgun-admin-panel"
    }
  });

  return api.getDownloadURL(storageRef);
}

export async function seedFirebase({ products, settings, content }) {
  if (!isFirebaseConfigured()) throw new Error("Firebase ayarları girilmemiş.");
  await ensureFirebase();
  await writeDoc(FIRESTORE_COLLECTIONS.site, FIRESTORE_COLLECTIONS.settingsDoc, settings);
  await writeDoc(FIRESTORE_COLLECTIONS.site, FIRESTORE_COLLECTIONS.contentDoc, content);
  await Promise.all(products.map((product) => writeCollectionDoc(FIRESTORE_COLLECTIONS.products, product.id, product)));
  return true;
}
