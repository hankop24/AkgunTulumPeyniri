import { categoryLabels } from "../src/config/app-config.js";
import { getProducts, saveProducts, resetProducts, createEmptyProduct, normalizeProduct } from "../src/services/catalog-service.js";
import { getSiteSettings, saveSiteSettings, resetSiteSettings } from "../src/services/site-settings-service.js";
import { money, normalizeText, parseTags } from "../src/utils/format.js";

let products = getProducts();
let settings = getSiteSettings();
let selectedId = products[0]?.id || null;

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => Array.from(document.querySelectorAll(selector));

function toast(message) {
  const el = qs("#toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}

function fillCategorySelects() {
  const options = Object.entries(categoryLabels).filter(([key]) => key !== "all").map(([key, label]) => `<option value="${key}">${label}</option>`).join("");
  qs("#productCategory").innerHTML = options;
  qs("#adminCategoryFilter").innerHTML = `<option value="all">Tüm kategoriler</option>${options}`;
}

function renderDashboard() {
  qs("#statProducts").textContent = products.length;
  qs("#statActive").textContent = products.filter((p) => p.active !== false).length;
  qs("#statFeatured").textContent = products.filter((p) => p.featured).length;
  qs("#statLowStock").textContent = products.filter((p) => Number(p.stock) <= 10).length;
}

function imagePath(image) {
  return String(image || "").startsWith("http") ? image : `../${image || "assets/product-akgun.png"}`;
}

function renderTable() {
  const term = normalizeText(qs("#adminSearch").value);
  const category = qs("#adminCategoryFilter").value;
  let list = [...products];
  if (category !== "all") list = list.filter((p) => p.category === category);
  if (term) list = list.filter((p) => normalizeText([p.title, p.desc, p.badge, p.weight, p.origin].join(" ")).includes(term));
  qs("#productTable").innerHTML = list.map((product) => `
    <button class="product-row ${product.id === selectedId ? "active" : ""}" data-id="${product.id}">
      <img src="${imagePath(product.image)}" onerror="this.src='../assets/product-akgun.png'" alt="${product.title}" />
      <span><h4>${product.title}</h4><p>${categoryLabels[product.category]} · ${product.weight} · ${money(product.price)} · Stok: ${product.stock}</p></span>
      <i class="status-pill ${product.active === false ? "passive" : ""}">${product.active === false ? "Pasif" : "Aktif"}</i>
    </button>
  `).join("");
  qsa(".product-row").forEach((row) => row.addEventListener("click", () => { selectedId = Number(row.dataset.id); renderTable(); fillForm(); }));
}

function selectedProduct() {
  return products.find((p) => p.id === selectedId) || products[0];
}

function fillForm() {
  const p = selectedProduct();
  if (!p) return;
  qs("#formTitle").textContent = `Ürün Düzenle #${p.id}`;
  qs("#productId").value = p.id;
  qs("#productTitle").value = p.title;
  qs("#productDesc").value = p.desc;
  qs("#productCategory").value = p.category;
  qs("#productWeight").value = p.weight;
  qs("#productPrice").value = p.price;
  qs("#productOldPrice").value = p.oldPrice || 0;
  qs("#productStock").value = p.stock;
  qs("#productRating").value = p.rating;
  qs("#productOrigin").value = p.origin;
  qs("#productBadge").value = p.badge;
  qs("#productImage").value = p.image;
  qs("#productTags").value = (p.tags || []).join(", ");
  qs("#productFeatured").checked = Boolean(p.featured);
  qs("#productBestSeller").checked = Boolean(p.bestSeller);
  qs("#productActive").checked = p.active !== false;
}

function productFromForm() {
  return normalizeProduct({
    id: Number(qs("#productId").value),
    title: qs("#productTitle").value,
    desc: qs("#productDesc").value,
    category: qs("#productCategory").value,
    weight: qs("#productWeight").value,
    price: Number(qs("#productPrice").value),
    oldPrice: Number(qs("#productOldPrice").value),
    stock: Number(qs("#productStock").value),
    rating: Number(qs("#productRating").value),
    origin: qs("#productOrigin").value,
    badge: qs("#productBadge").value,
    image: qs("#productImage").value,
    tags: parseTags(qs("#productTags").value),
    featured: qs("#productFeatured").checked,
    bestSeller: qs("#productBestSeller").checked,
    active: qs("#productActive").checked
  });
}

function fillSettings() {
  Object.entries(settings).forEach(([key, value]) => {
    const input = qs(`#${key}`);
    if (!input) return;
    input.value = value ?? "";
  });
}

function settingsFromForm() {
  const next = { ...settings };
  Object.keys(next).forEach((key) => {
    const input = qs(`#${key}`);
    if (!input) return;
    next[key] = input.type === "number" ? Number(input.value) : input.value;
  });
  return next;
}

function saveAll() {
  products = saveProducts(products);
  settings = saveSiteSettings(settings);
  renderDashboard();
  renderTable();
  toast("Değişiklikler kaydedildi.");
}

function switchTab(tabName) {
  qsa(".nav-tab").forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tabName));
  qsa(".tab-panel").forEach((panel) => panel.classList.remove("active"));
  qs(`#${tabName}Panel`).classList.add("active");
}

function bindEvents() {
  qsa(".nav-tab").forEach((btn) => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));
  qs("#adminSearch").addEventListener("input", renderTable);
  qs("#adminCategoryFilter").addEventListener("change", renderTable);
  qs("#productForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const next = productFromForm();
    products = products.map((p) => p.id === next.id ? next : p);
    saveProducts(products);
    renderDashboard();
    renderTable();
    toast("Ürün kaydedildi.");
  });
  qs("#newProductButton").addEventListener("click", () => {
    const p = createEmptyProduct(products);
    products.unshift(p);
    selectedId = p.id;
    renderDashboard();
    renderTable();
    fillForm();
    switchTab("products");
  });
  qs("#deleteProductButton").addEventListener("click", () => {
    if (!selectedId || !confirm("Bu ürünü silmek istiyor musun?")) return;
    products = products.filter((p) => p.id !== selectedId);
    selectedId = products[0]?.id || null;
    saveProducts(products);
    renderDashboard();
    renderTable();
    fillForm();
    toast("Ürün silindi.");
  });
  qs("#settingsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    settings = saveSiteSettings(settingsFromForm());
    fillSettings();
    toast("Site ayarları kaydedildi.");
  });
  qs("#saveAllButton").addEventListener("click", saveAll);
  qs("#resetAllButton").addEventListener("click", () => {
    if (!confirm("Tüm ürün ve site ayarları varsayılana dönsün mü?")) return;
    products = resetProducts();
    settings = resetSiteSettings();
    selectedId = products[0]?.id || null;
    fillSettings();
    renderDashboard();
    renderTable();
    fillForm();
    toast("Varsayılan veriler yüklendi.");
  });
  qs("#exportButton").addEventListener("click", () => {
    const data = { exportedAt: new Date().toISOString(), products, settings };
    const text = JSON.stringify(data, null, 2);
    qs("#dataPreview").value = text;
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "akgun-admin-yedek.json";
    a.click();
    URL.revokeObjectURL(url);
  });
  qs("#importInput").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data.products) || !data.settings) return alert("Geçersiz yedek dosyası.");
    products = saveProducts(data.products);
    settings = saveSiteSettings(data.settings);
    selectedId = products[0]?.id || null;
    fillSettings();
    renderDashboard();
    renderTable();
    fillForm();
    qs("#dataPreview").value = JSON.stringify({ products, settings }, null, 2);
    toast("Yedek içe aktarıldı.");
  });
}

function init() {
  fillCategorySelects();
  fillSettings();
  renderDashboard();
  renderTable();
  fillForm();
  bindEvents();
}

init();
