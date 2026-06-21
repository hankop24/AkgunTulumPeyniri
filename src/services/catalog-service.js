import { STORAGE_KEYS } from "../config/app-config.js";
import { defaultProducts } from "../data/default-products.js";
import { parseTags } from "../utils/format.js";

const clone = (value) => JSON.parse(JSON.stringify(value));

export function getProducts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.products);
    if (!stored) return clone(defaultProducts);
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return clone(defaultProducts);
    return parsed.map(normalizeProduct);
  } catch (error) {
    console.warn("Ürün verisi okunamadı, varsayılan liste kullanılıyor.", error);
    return clone(defaultProducts);
  }
}

export function saveProducts(products) {
  const normalized = products.map(normalizeProduct);
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(normalized));
  return normalized;
}

export function resetProducts() {
  localStorage.removeItem(STORAGE_KEYS.products);
  return getProducts();
}

export function normalizeProduct(product) {
  return {
    id: Number(product.id || Date.now()),
    title: String(product.title || "Yeni Ürün"),
    desc: String(product.desc || ""),
    price: Number(product.price || 0),
    oldPrice: Number(product.oldPrice || 0),
    category: String(product.category || "tulum"),
    badge: String(product.badge || ""),
    image: String(product.image || "assets/product-akgun.png"),
    weight: String(product.weight || "500g"),
    origin: String(product.origin || "Erzincan"),
    stock: Number(product.stock || 0),
    rating: Number(product.rating || 4.5),
    tags: parseTags(product.tags),
    featured: Boolean(product.featured),
    bestSeller: Boolean(product.bestSeller),
    active: product.active !== false
  };
}

export function createEmptyProduct(products = []) {
  const nextId = products.length ? Math.max(...products.map((item) => Number(item.id) || 0)) + 1 : 1;
  return normalizeProduct({
    id: nextId,
    title: "Yeni Ürün",
    desc: "Ürün açıklaması",
    price: 0,
    oldPrice: 0,
    category: "tulum",
    badge: "Yeni",
    image: "assets/product-akgun.png",
    weight: "500g",
    origin: "Erzincan",
    stock: 0,
    rating: 4.5,
    tags: ["Yöresel"],
    featured: false,
    bestSeller: false,
    active: true
  });
}
