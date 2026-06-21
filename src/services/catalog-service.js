import { STORAGE_KEYS, FIRESTORE_COLLECTIONS } from "../config/app-config.js";
import { defaultProducts } from "../data/default-products.js";
import { parseTags } from "../utils/format.js";
import { isFirebaseConfigured, readCollection, writeCollectionDoc, deleteCollectionDoc } from "./backend-service.js";

const clone = (value) => JSON.parse(JSON.stringify(value));

function localProducts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.products);
    if (!stored) return clone(defaultProducts).map(normalizeProduct);
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.map(normalizeProduct) : clone(defaultProducts).map(normalizeProduct);
  } catch (error) {
    console.warn("Ürün verisi okunamadı, varsayılan liste kullanılıyor.", error);
    return clone(defaultProducts).map(normalizeProduct);
  }
}

export async function getProducts() {
  if (isFirebaseConfigured()) {
    try {
      const remote = await readCollection(FIRESTORE_COLLECTIONS.products);
      if (Array.isArray(remote) && remote.length) return remote.map(normalizeProduct).sort((a, b) => Number(a.order || 9999) - Number(b.order || 9999));
    } catch (error) {
      console.warn("Firebase ürünleri okunamadı, yerel veri kullanılıyor.", error);
    }
  }
  return localProducts();
}

export async function saveProducts(products) {
  const normalized = products.map(normalizeProduct);
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(normalized));
  if (isFirebaseConfigured()) {
    await Promise.all(normalized.map((product) => writeCollectionDoc(FIRESTORE_COLLECTIONS.products, product.id, product)));
  }
  return normalized;
}

export async function saveProduct(product) {
  const normalized = normalizeProduct(product);

  // Kritik düzeltme:
  // Firebase koleksiyonu ilk başta boş olduğunda getProducts() varsayılan ürünleri döndürür.
  // Yeni ürün eklerken bu varsayılan listeyi de Firebase'e yazarız. Böylece site sadece yeni ürünü
  // gösterip diğer varsayılan ürünleri kaybetmez.
  const products = await getProducts();
  const exists = products.some((item) => String(item.id) === String(normalized.id));
  const next = exists
    ? products.map((item) => String(item.id) === String(normalized.id) ? normalized : item)
    : [normalized, ...products];

  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(next));

  if (isFirebaseConfigured()) {
    await Promise.all(next.map((item) => writeCollectionDoc(FIRESTORE_COLLECTIONS.products, item.id, item)));
  }

  return normalized;
}

export async function deleteProduct(productId) {
  const current = await getProducts();
  const next = current.filter((item) => String(item.id) !== String(productId));

  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(next));

  if (isFirebaseConfigured()) {
    await deleteCollectionDoc(FIRESTORE_COLLECTIONS.products, productId);
  }

  return next;
}

export async function resetProducts() {
  localStorage.removeItem(STORAGE_KEYS.products);
  return getProducts();
}


function normalizeProductImages(product) {
  const fallback = {
    fit: ["cover", "contain"].includes(product.imageFit) ? product.imageFit : "cover",
    position: String(product.imagePosition || "center center")
  };

  const toImageObject = (item) => {
    const url = typeof item === "object" ? item?.url || item?.src || item?.image : item;
    return {
      url: String(url || "").trim(),
      fit: ["cover", "contain"].includes(item?.fit) ? item.fit : fallback.fit,
      position: String(item?.position || fallback.position)
    };
  };

  const fromImages = Array.isArray(product.images) ? product.images : [];
  const fromLegacy = product.image ? [product.image] : [];
  const list = [...fromImages, ...fromLegacy].map(toImageObject).filter((item) => item.url);
  const seen = new Set();
  const unique = list.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });

  return unique.length ? unique : [{ url: "assets/product-akgun.png", fit: "cover", position: "center center" }];
}

export function normalizeProduct(product) {
  return {
    id: String(product.id || Date.now()),
    title: String(product.title || "Yeni Ürün"),
    desc: String(product.desc || ""),
    price: Number(product.price || 0),
    oldPrice: Number(product.oldPrice || 0),
    category: String(product.category || "tulum"),
    badge: "",
    image: normalizeProductImages(product)[0]?.url || "assets/product-akgun.png",
    images: normalizeProductImages(product),
    imageFit: normalizeProductImages(product)[0]?.fit || "cover",
    imagePosition: normalizeProductImages(product)[0]?.position || "center center",
    weight: String(product.weight || "500g"),
    origin: String(product.origin || "Erzincan"),
    stock: Number(product.stock || 0),
    rating: Number(product.rating || 0),
    tags: parseTags(product.tags),
    featured: Boolean(product.featured),
    bestSeller: Boolean(product.bestSeller),
    active: product.active !== false,
    campaignActive: Boolean(product.campaignActive),
    order: Number(product.order || 999)
  };
}

export function createEmptyProduct(products = []) {
  const numericIds = products.map((item) => Number(item.id)).filter(Boolean);
  const nextId = numericIds.length ? Math.max(...numericIds) + 1 : Date.now();
  return normalizeProduct({
    id: String(nextId),
    title: "Yeni Ürün",
    desc: "Ürün açıklaması",
    price: 0,
    oldPrice: 0,
    category: "tulum",
    badge: "",
    image: "",
    images: [],
    imageFit: "cover",
    imagePosition: "center center",
    weight: "500g",
    origin: "Erzincan",
    stock: 0,
    rating: 0,
    tags: ["Yöresel"],
    featured: false,
    bestSeller: false,
    active: true,
    campaignActive: false,
    order: products.length + 1
  });
}
