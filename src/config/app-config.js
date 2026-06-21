export const STORAGE_KEYS = {
  products: "akgun.products.v2",
  settings: "akgun.settings.v2",
  content: "akgun.content.v2"
};

export const FIRESTORE_COLLECTIONS = {
  products: "products",
  site: "site",
  settingsDoc: "settings",
  contentDoc: "content"
};

export const categoryLabels = {
  all: "Tümü",
  tulum: "Tulum Peynirleri",
  bal: "Bal",
  kasar: "Kaşar Peynirleri",
  tereyagi: "Tereyağı",
  salamura: "Salamura Peynirler",
  pekmez: "Pekmezler",
  fasulye: "Fasulye",
  "diger-peynir": "Diğer Peynirler",
  "kuru-meyve": "Kuru Meyve"
};

export const weightOptions = ["500g", "650g", "700g", "800g", "1000g", "Set"];

export const ADMIN_SECTIONS = [
  { id: "dashboard", label: "Genel Bakış" },
  { id: "products", label: "Ürünler" },
  { id: "content", label: "Sayfa İçerikleri" },
  { id: "settings", label: "Site Ayarları" },
  { id: "data", label: "Veri & Yayın" }
];
