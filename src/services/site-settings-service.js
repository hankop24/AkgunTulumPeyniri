import { STORAGE_KEYS } from "../config/app-config.js";
import { defaultSiteSettings } from "../data/default-site-settings.js";

const clone = (value) => JSON.parse(JSON.stringify(value));

export function getSiteSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.settings);
    if (!stored) return clone(defaultSiteSettings);
    return { ...clone(defaultSiteSettings), ...JSON.parse(stored) };
  } catch (error) {
    console.warn("Site ayarları okunamadı, varsayılan ayarlar kullanılıyor.", error);
    return clone(defaultSiteSettings);
  }
}

export function saveSiteSettings(settings) {
  const normalized = { ...clone(defaultSiteSettings), ...settings };
  normalized.freeShippingTarget = Number(normalized.freeShippingTarget || 0);
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(normalized));
  return normalized;
}

export function resetSiteSettings() {
  localStorage.removeItem(STORAGE_KEYS.settings);
  return getSiteSettings();
}
