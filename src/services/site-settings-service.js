import { STORAGE_KEYS, FIRESTORE_COLLECTIONS } from "../config/app-config.js";
import { defaultSiteSettings } from "../data/default-site-settings.js";
import { isFirebaseConfigured, readDoc, writeDoc } from "./backend-service.js";

const clone = (value) => JSON.parse(JSON.stringify(value));

function normalizeSettings(settings = {}) {
  const normalized = { ...clone(defaultSiteSettings), ...settings };
  delete normalized.freeShippingTarget;
  delete normalized.lowStockLimit;
  delete normalized.footerText;
  return normalized;
}

function localSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.settings);
    return stored ? normalizeSettings(JSON.parse(stored)) : normalizeSettings();
  } catch (error) {
    console.warn("Site ayarları okunamadı, varsayılan ayarlar kullanılıyor.", error);
    return normalizeSettings();
  }
}

export async function getSiteSettings() {
  if (isFirebaseConfigured()) {
    try {
      const remote = await readDoc(FIRESTORE_COLLECTIONS.site, FIRESTORE_COLLECTIONS.settingsDoc);
      if (remote) return normalizeSettings(remote);
    } catch (error) {
      console.warn("Firebase site ayarları okunamadı, yerel ayarlar kullanılıyor.", error);
    }
  }
  return localSettings();
}

export async function saveSiteSettings(settings) {
  const normalized = normalizeSettings(settings);
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(normalized));
  if (isFirebaseConfigured()) await writeDoc(FIRESTORE_COLLECTIONS.site, FIRESTORE_COLLECTIONS.settingsDoc, normalized);
  return normalized;
}

export async function resetSiteSettings() {
  localStorage.removeItem(STORAGE_KEYS.settings);
  return getSiteSettings();
}
