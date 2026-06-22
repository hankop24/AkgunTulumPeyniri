import { STORAGE_KEYS, FIRESTORE_COLLECTIONS } from "../config/app-config.js";
import { defaultContent } from "../data/default-content.js";
import { isFirebaseConfigured, readDoc, writeDoc } from "./backend-service.js";

const clone = (value) => JSON.parse(JSON.stringify(value));

function withIds(list = [], prefix = "item") {
  return list.map((item, index) => ({ id: item.id || `${prefix}-${Date.now()}-${index}`, active: item.active !== false, order: Number(item.order || index + 1), ...item }));
}

export function normalizeContent(content = {}) {
  const merged = { ...clone(defaultContent), ...content };
  return {
    categories: withIds(merged.categories, "cat"),
    benefits: withIds(merged.benefits, "benefit"),
    testimonials: withIds(merged.testimonials, "testimonial"),
    faqs: withIds(merged.faqs, "faq"),
    navLinks: withIds(merged.navLinks, "nav"),
    socialLinks: withIds(merged.socialLinks, "social")
  };
}

function localContent() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.content);
    return stored ? normalizeContent(JSON.parse(stored)) : normalizeContent();
  } catch (error) {
    console.warn("İçerik verisi okunamadı, varsayılan içerikler kullanılıyor.", error);
    return normalizeContent();
  }
}

export async function getContent() {
  if (isFirebaseConfigured()) {
    try {
      const remote = await readDoc(FIRESTORE_COLLECTIONS.site, FIRESTORE_COLLECTIONS.contentDoc);
      if (remote) return normalizeContent(remote);
    } catch (error) {
      console.warn("Firebase içerikleri okunamadı, yerel içerik kullanılıyor.", error);
    }
  }
  return localContent();
}

export async function saveContent(content) {
  const normalized = normalizeContent(content);
  localStorage.setItem(STORAGE_KEYS.content, JSON.stringify(normalized));
  if (isFirebaseConfigured()) await writeDoc(FIRESTORE_COLLECTIONS.site, FIRESTORE_COLLECTIONS.contentDoc, normalized);
  return normalized;
}

export async function resetContent() {
  localStorage.removeItem(STORAGE_KEYS.content);
  return getContent();
}
