/*
  Firebase bağlantısını aktif etmek için Firebase Console > Project settings > Web app
  kısmındaki firebaseConfig değerlerini buraya yapıştır.

  Bu dosya boş bırakılırsa sistem localStorage ile çalışır.
  Netlify'da tüm cihazlarda canlı güncelleme için Firebase ayarlarını doldurmak gerekir.
*/

export const FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
