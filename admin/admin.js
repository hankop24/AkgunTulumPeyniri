import { getProducts, saveProduct, deleteProduct, saveProducts, createEmptyProduct } from "../src/services/catalog-service.js";
import { getSiteSettings, saveSiteSettings } from "../src/services/site-settings-service.js";
import { getContent, saveContent, normalizeContent } from "../src/services/content-service.js";
import { getBackendStatus, seedFirebase, isFirebaseConfigured, signInAdmin, signOutAdmin, onAdminAuthStateChanged, uploadImageFile } from "../src/services/backend-service.js";
import { money, normalizeText, parseTags } from "../src/utils/format.js";
import { defaultProducts } from "../src/data/default-products.js";
import { defaultSiteSettings } from "../src/data/default-site-settings.js";
import { defaultContent } from "../src/data/default-content.js";

let products = [];
let settings = {};
let content = {};
let currentView = "dashboard";
let currentSection = "announcement";
let editingProduct = null;
let isCreatingProduct = false;
let adminEventsBound = false;
let authUnsubscribe = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
const orderItems = (list = []) => [...list].sort((a, b) => Number(a.order || 999) - Number(b.order || 999));
const imageSrc = (image) => !image ? "../assets/product-akgun.png" : image.startsWith("http") || image.startsWith("data:") ? image : `../${image}`;
const productImages = (product = {}) => {
  const list = Array.isArray(product.images) ? product.images : [];
  const legacy = product.image ? [product.image] : [];
  const merged = [...list, ...legacy].map((item) => String(item || "").trim()).filter(Boolean);
  return [...new Set(merged)].length ? [...new Set(merged)] : ["assets/product-akgun.png"];
};
const mainProductImage = (product = {}) => productImages(product)[0] || "assets/product-akgun.png";
const slugifyCategory = (value = "") => normalizeText(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `kategori-${Date.now()}`;

function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2500);
}

function categories(activeOnly = true) {
  return orderItems(content.categories || []).filter((item) => !activeOnly || item.active !== false);
}

function categoryName(key) {
  return categories(false).find((item) => item.key === key)?.label || key || "Kategori yok";
}

function refreshHeader() {
  const view = $(`#${currentView}View`);
  $("#viewTitle").textContent = view?.dataset.title || "Yönetim Paneli";
  $("#viewDescription").textContent = view?.dataset.desc || "";
}

function switchView(viewName) {
  currentView = viewName;
  $$(".view").forEach((view) => view.classList.remove("active"));
  $(`#${viewName}View`)?.classList.add("active");
  $$("#sideNav button").forEach((button) => button.classList.toggle("active", button.dataset.view === viewName));
  refreshHeader();
  if (viewName === "products") renderProductsTable();
  if (viewName === "sections") renderSectionEditor();
  if (viewName === "categories") renderCategoryManager();
}

function renderDashboard() {
  const lowLimit = Number(settings.lowStockLimit || 10);
  $("#statProducts").textContent = products.length;
  $("#statActive").textContent = products.filter((p) => p.active !== false).length;
  $("#statFeatured").textContent = products.filter((p) => p.featured).length;
  $("#statLowStock").textContent = products.filter((p) => Number(p.stock) <= lowLimit).length;
}

function categoryOptions(selected = "") {
  return categories().map((cat) => `<option value="${cat.key}" ${cat.key === selected ? "selected" : ""}>${cat.label}</option>`).join("");
}

function fillProductFilters() {
  $("#productCategoryFilter").innerHTML = `<option value="all">Tüm kategoriler</option>${categoryOptions()}`;
  $("#editorCategory").innerHTML = categoryOptions();
}

function productMatchesFilters(product) {
  const term = normalizeText($("#productSearch")?.value || "");
  const category = $("#productCategoryFilter")?.value || "all";
  const status = $("#productStatusFilter")?.value || "all";
  const haystack = normalizeText([product.title, product.desc, product.badge, product.weight, product.origin, ...(product.tags || [])].join(" "));
  if (term && !haystack.includes(term)) return false;
  if (category !== "all" && product.category !== category) return false;
  if (status === "active" && product.active === false) return false;
  if (status === "passive" && product.active !== false) return false;
  if (status === "featured" && !product.featured) return false;
  if (status === "bestSeller" && !product.bestSeller) return false;
  if (status === "campaign" && !product.campaignActive) return false;
  if (status === "low-stock" && Number(product.stock) > Number(settings.lowStockLimit || 10)) return false;
  return true;
}

function renderProductsTable() {
  const filtered = orderItems(products).filter(productMatchesFilters);
  const rows = filtered.map((product) => {
    const low = Number(product.stock) <= Number(settings.lowStockLimit || 10);
    return `
      <div class="table-row">
        <div class="table-img"><img src="${imageSrc(mainProductImage(product))}" style="object-fit:${product.imageFit || 'cover'};object-position:${product.imagePosition || 'center center'}" onerror="this.src='../assets/product-akgun.png'" alt="${product.title}" /></div>
        <div class="product-title"><strong>${product.title}</strong><span>${categoryName(product.category)} · ${product.weight || "Gramaj yok"}</span></div>
        <div>${money(product.price)}</div>
        <div>${product.stock} adet</div>
        <div class="status-list">
          ${product.active !== false ? `<span class="tag green">Aktif</span>` : `<span class="tag gray">Gizli</span>`}
          ${product.featured ? `<span class="tag">Öne çıkan</span>` : ""}
          ${product.bestSeller ? `<span class="tag blue">Çok satan</span>` : ""}
          ${product.campaignActive ? `<span class="tag orange">Kampanya</span>` : ""}
          ${low ? `<span class="tag orange">Az stok</span>` : ""}
        </div>
        <div class="row-actions">
          <button data-edit-product="${product.id}">Düzenle</button>
          <button class="danger-mini" data-delete-product="${product.id}">Sil</button>
        </div>
      </div>
    `;
  }).join("");

  $("#productsTable").innerHTML = `
    <div class="table-row header"><div>Görsel</div><div>Ürün</div><div>Fiyat</div><div>Stok</div><div>Durum</div><div>İşlem</div></div>
    ${rows || `<div class="empty-state">Bu filtrelere uygun ürün bulunamadı.</div>`}
  `;

  $$('[data-edit-product]').forEach((button) => button.addEventListener("click", () => openProductEditor(button.dataset.editProduct)));
  $$('[data-delete-product]').forEach((button) => button.addEventListener("click", () => removeProduct(button.dataset.deleteProduct)));
}

function openProductEditor(productId = null) {
  if (productId) {
    editingProduct = JSON.parse(JSON.stringify(products.find((item) => String(item.id) === String(productId))));
    isCreatingProduct = false;
  } else {
    editingProduct = createEmptyProduct(products);
    editingProduct.title = "";
    editingProduct.desc = "";
    editingProduct.price = 0;
    editingProduct.oldPrice = 0;
    editingProduct.stock = 0;
    editingProduct.badge = "";
    editingProduct.tags = [];
    editingProduct.image = "";
    isCreatingProduct = true;
  }

  if (!editingProduct) return toast("Ürün bulunamadı.");
  $("#editorTitle").textContent = isCreatingProduct ? "Yeni Ürün Ekle" : "Ürünü Düzenle";
  $("#deleteEditorProductButton").style.display = isCreatingProduct ? "none" : "inline-flex";
  fillProductEditor();
  switchView("productEditor");
}

function fillProductEditor() {
  editingProduct.images = productImages(editingProduct);
  editingProduct.image = mainProductImage(editingProduct);
  editingProduct.imageFit = editingProduct.imageFit || "cover";
  editingProduct.imagePosition = editingProduct.imagePosition || "center center";

  $("#editorTitleInput").value = editingProduct.title || "";
  $("#editorDesc").value = editingProduct.desc || "";
  $("#editorCategory").innerHTML = categoryOptions(editingProduct.category);
  $("#editorCategory").value = editingProduct.category || categories()[0]?.key || "tulum";
  $("#editorWeight").value = editingProduct.weight || "";
  $("#editorOrigin").value = editingProduct.origin || "";
  $("#editorOrder").value = editingProduct.order || products.length + 1;
  $("#editorTags").value = Array.isArray(editingProduct.tags) ? editingProduct.tags.join(", ") : editingProduct.tags || "";
  $("#editorPrice").value = editingProduct.price || 0;
  $("#editorOldPrice").value = editingProduct.oldPrice || 0;
  $("#editorStock").value = editingProduct.stock || 0;
  $("#editorBadge").value = editingProduct.badge || "";
  $("#editorActive").checked = editingProduct.active !== false;
  $("#editorFeatured").checked = Boolean(editingProduct.featured);
  $("#editorBestSeller").checked = Boolean(editingProduct.bestSeller);
  $("#editorCampaign").checked = Boolean(editingProduct.campaignActive);
  $("#editorImageUrl").value = "";
  $("#editorImageFit").value = editingProduct.imageFit || "cover";
  $("#editorImagePosition").value = editingProduct.imagePosition || "center center";
  renderProductPreview();
}
function collectEditorProduct() {
  const images = productImages(editingProduct);
  return {
    ...editingProduct,
    title: $("#editorTitleInput").value.trim(),
    desc: $("#editorDesc").value.trim(),
    category: $("#editorCategory").value,
    weight: $("#editorWeight").value.trim(),
    origin: $("#editorOrigin").value.trim(),
    order: Number($("#editorOrder").value || 999),
    tags: parseTags($("#editorTags").value),
    price: Number($("#editorPrice").value || 0),
    oldPrice: Number($("#editorOldPrice").value || 0),
    stock: Number($("#editorStock").value || 0),
    badge: $("#editorBadge").value.trim(),
    active: $("#editorActive").checked,
    featured: $("#editorFeatured").checked,
    bestSeller: $("#editorBestSeller").checked,
    campaignActive: $("#editorCampaign").checked,
    imageFit: $("#editorImageFit").value,
    imagePosition: $("#editorImagePosition").value,
    image: images[0] || "assets/product-akgun.png",
    images
  };
}
function renderProductPreview() {
  const images = productImages(editingProduct);
  const fit = $("#editorImageFit")?.value || editingProduct?.imageFit || "cover";
  const position = $("#editorImagePosition")?.value || editingProduct?.imagePosition || "center center";
  const main = images[0];
  $("#productImagePreview").innerHTML = main
    ? `<img src="${imageSrc(main)}" style="object-fit:${fit};object-position:${position}" onerror="this.parentElement.textContent='Görsel yüklenemedi'" alt="Ürün görseli" />`
    : "Görsel yok";

  const gallery = $("#productGalleryPreview");
  if (!gallery) return;
  gallery.innerHTML = images.map((image, index) => `
    <div class="gallery-item ${index === 0 ? "cover" : ""}">
      <img src="${imageSrc(image)}" style="object-fit:${fit};object-position:${position}" onerror="this.src='../assets/product-akgun.png'" alt="Ürün görseli ${index + 1}" />
      <div class="gallery-item-actions">
        <button type="button" data-cover-image="${index}" ${index === 0 ? "disabled" : ""}>Kapak yap</button>
        <button type="button" data-remove-image="${index}">Sil</button>
      </div>
    </div>
  `).join("") || `<div class="empty-state">Henüz görsel eklenmedi.</div>`;

  $$('[data-cover-image]').forEach((button) => button.addEventListener("click", () => setCoverImage(Number(button.dataset.coverImage))));
  $$('[data-remove-image]').forEach((button) => button.addEventListener("click", () => removeProductImage(Number(button.dataset.removeImage))));
}

function addProductImage(url) {
  const clean = String(url || "").trim();
  if (!clean) return;
  editingProduct.images = [...new Set([...productImages(editingProduct), clean])];
  editingProduct.image = editingProduct.images[0];
  renderProductPreview();
}

function setCoverImage(index) {
  const images = productImages(editingProduct);
  if (!images[index]) return;
  const [selected] = images.splice(index, 1);
  editingProduct.images = [selected, ...images];
  editingProduct.image = selected;
  renderProductPreview();
}

function removeProductImage(index) {
  const images = productImages(editingProduct).filter((_, imageIndex) => imageIndex !== index);
  editingProduct.images = images.length ? images : [];
  editingProduct.image = images[0] || "";
  renderProductPreview();
}
async function saveEditorProduct() {
  const product = collectEditorProduct();
  if (!product.title) return toast("Ürün adı zorunlu.");
  const saved = await saveProduct(product);
  const exists = products.some((item) => String(item.id) === String(saved.id));
  products = exists ? products.map((item) => String(item.id) === String(saved.id) ? saved : item) : [saved, ...products];
  isCreatingProduct = false;
  editingProduct = saved;
  renderDashboard();
  renderProductsTable();
  toast("Ürün kaydedildi.");
  switchView("products");
}

async function removeProduct(productId) {
  const product = products.find((item) => String(item.id) === String(productId));
  if (!product) return;
  if (!confirm(`“${product.title}” ürünü silinsin mi?`)) return;
  products = await deleteProduct(productId);
  renderDashboard();
  renderProductsTable();
  toast("Ürün silindi.");
}

function readImageFile(input, callback) {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => callback(reader.result, file);
  reader.readAsDataURL(file);
}

async function handleImageFile(input, folder, onReady) {
  const file = input.files?.[0];
  if (!file) return;

  if (isFirebaseConfigured()) {
    try {
      toast("Görsel Firebase Storage'a yükleniyor...");
      const url = await uploadImageFile(file, folder);
      onReady(url);
      toast("Görsel yüklendi.");
      return;
    } catch (error) {
      console.warn("Görsel Storage'a yüklenemedi, veri olarak okunacak.", error);
      toast(error.message || "Görsel yüklenemedi, yerel önizleme kullanılacak.");
    }
  }

  readImageFile(input, (dataUrl) => {
    onReady(dataUrl);
    toast("Görsel önizleme olarak eklendi.");
  });
}

async function handleProductImageFiles(input) {
  const files = Array.from(input.files || []);
  if (!files.length) return;

  for (const file of files) {
    if (isFirebaseConfigured()) {
      try {
        toast(`${file.name} yükleniyor...`);
        const url = await uploadImageFile(file, "product-images");
        addProductImage(url);
        continue;
      } catch (error) {
        console.warn("Görsel Storage'a yüklenemedi, veri olarak okunacak.", error);
      }
    }

    await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => { addProductImage(reader.result); resolve(); };
      reader.readAsDataURL(file);
    });
  }

  input.value = "";
  toast("Görseller galeriye eklendi.");
}

async function quickAddCategory() {
  const label = prompt("Yeni kategori adını yaz:");
  if (!label) return;
  const baseKey = slugifyCategory(label);
  let key = baseKey;
  let counter = 2;
  while ((content.categories || []).some((item) => item.key === key)) key = `${baseKey}-${counter++}`;
  const category = { id: uid("cat"), key, label: label.trim(), active: true, order: (content.categories || []).length + 1 };
  content = normalizeContent({ ...content, categories: [...(content.categories || []), category] });
  content = await saveContent(content);
  fillProductFilters();
  $("#editorCategory").value = key;
  toast("Yeni kategori eklendi.");
}


function fillSettingsForm() {
  $("#settingBrandName").value = settings.brandName || "";
  $("#settingPageTitle").value = settings.pageTitle || "";
  $("#settingWhatsappNumber").value = settings.whatsappNumber || "";
  $("#settingPhoneNumber").value = settings.phoneNumber || "";
  $("#settingFreeShippingTarget").value = settings.freeShippingTarget || 0;
  $("#settingLowStockLimit").value = settings.lowStockLimit || 10;
  $("#settingMetaDescription").value = settings.metaDescription || "";
  $("#settingWhatsappDefaultMessage").value = settings.whatsappDefaultMessage || "";
}

async function saveSettingsForm(event) {
  event.preventDefault();
  settings = await saveSiteSettings({
    ...settings,
    brandName: $("#settingBrandName").value,
    pageTitle: $("#settingPageTitle").value,
    whatsappNumber: $("#settingWhatsappNumber").value,
    phoneNumber: $("#settingPhoneNumber").value,
    freeShippingTarget: Number($("#settingFreeShippingTarget").value || 0),
    lowStockLimit: Number($("#settingLowStockLimit").value || 10),
    metaDescription: $("#settingMetaDescription").value,
    whatsappDefaultMessage: $("#settingWhatsappDefaultMessage").value
  });
  renderDashboard();
  toast("Site ayarları kaydedildi.");
}

const textInput = (id, label, value = "") => `<label>${label}<input data-setting-field="${id}" value="${String(value || "").replaceAll('"', '&quot;')}" /></label>`;
const textArea = (id, label, value = "", rows = 3) => `<label>${label}<textarea data-setting-field="${id}" rows="${rows}">${value || ""}</textarea></label>`;
const imageInput = (id, label, value = "") => `
  <label>${label}<input data-setting-field="${id}" value="${String(value || "").replaceAll('"', '&quot;')}" placeholder="assets/... veya https://..." /></label>
  <label class="file-drop">Görsel dosyası seç<input data-setting-file="${id}" type="file" accept="image/*" /></label>
`;

function renderSectionEditor() {
  $$("#sectionMenu button").forEach((button) => button.classList.toggle("active", button.dataset.section === currentSection));
  const root = $("#sectionsEditor");
  if (currentSection === "announcement") root.innerHTML = renderSettingsBlock("Üst Duyuru", "Sitenin en üstündeki iki kısa duyuru metni.", [
    textInput("announcementPrimary", "Duyuru metni 1", settings.announcementPrimary),
    textInput("announcementSecondary", "Duyuru metni 2", settings.announcementSecondary)
  ]);
  if (currentSection === "hero") root.innerHTML = renderSettingsBlock("Giriş / Hero Alanı", "Ana sayfanın ilk görünen başlık, açıklama, buton, görsel ve küçük kartları.", [
    textInput("heroEyebrow", "Küçük başlık", settings.heroEyebrow),
    textArea("heroTitle", "Ana başlık", settings.heroTitle, 2),
    textArea("heroText", "Açıklama", settings.heroText, 4),
    `<div class="form-grid two">${textInput("heroPrimaryButton", "Birinci buton", settings.heroPrimaryButton)}${textInput("heroSecondaryButton", "İkinci buton", settings.heroSecondaryButton)}</div>`,
    `<div class="form-grid three">${textInput("statOneValue", "İstatistik 1 değer", settings.statOneValue)}${textInput("statTwoValue", "İstatistik 2 değer", settings.statTwoValue)}${textInput("statThreeValue", "İstatistik 3 değer", settings.statThreeValue)}</div>`,
    `<div class="form-grid three">${textInput("statOneLabel", "İstatistik 1 metin", settings.statOneLabel)}${textInput("statTwoLabel", "İstatistik 2 metin", settings.statTwoLabel)}${textInput("statThreeLabel", "İstatistik 3 metin", settings.statThreeLabel)}</div>`,
    imageInput("heroImage", "Hero ürün görseli", settings.heroImage),
    `<div class="form-grid two">${textInput("heroTopCard", "Üst küçük kart", settings.heroTopCard)}${textInput("heroBottomCard", "Alt küçük kart", settings.heroBottomCard)}</div>`
  ]);
  if (currentSection === "quality") root.innerHTML = renderListBlock("Kalite Kutuları", "Katkısız lezzet, ambalaj, teslimat gibi kutuları buradan yönet.", "benefits");
  if (currentSection === "featured") root.innerHTML = renderSettingsBlock("Öne Çıkanlar", "Öne çıkan ürünler bölümünün başlık ve açıklaması. Ürünlerin öne çıkması ürün detayından belirlenir.", [
    textInput("featuredEyebrow", "Küçük başlık", settings.featuredEyebrow),
    textInput("featuredTitle", "Başlık", settings.featuredTitle),
    textArea("featuredText", "Açıklama", settings.featuredText, 3)
  ]);
  if (currentSection === "products") root.innerHTML = renderSettingsBlock("Ürün Alanı", "Online mağaza bölümünün başlık ve açıklama metinleri.", [
    textInput("productsEyebrow", "Küçük başlık", settings.productsEyebrow),
    textInput("productsTitle", "Başlık", settings.productsTitle),
    textArea("productsText", "Açıklama", settings.productsText, 3)
  ]);
  if (currentSection === "story") root.innerHTML = renderSettingsBlock("Marka Hikayesi", "Marka hikayesi başlığı, metni ve görseli.", [
    textInput("storyEyebrow", "Küçük başlık", settings.storyEyebrow),
    textInput("storyTitle", "Başlık", settings.storyTitle),
    textArea("storyText", "Metin", settings.storyText, 5),
    imageInput("storyImage", "Marka hikayesi görseli", settings.storyImage)
  ]);
  if (currentSection === "testimonials") root.innerHTML = renderListWithHeadingBlock("Yorumlar", "Yorum başlığı ve müşteri yorumları.", "testimonials", [
    textInput("testimonialsEyebrow", "Küçük başlık", settings.testimonialsEyebrow),
    textInput("testimonialsTitle", "Başlık", settings.testimonialsTitle)
  ]);
  if (currentSection === "faq") root.innerHTML = renderListWithHeadingBlock("SSS", "Sık sorulan sorular başlığı ve soru-cevap satırları.", "faqs", [
    textInput("faqEyebrow", "Küçük başlık", settings.faqEyebrow),
    textInput("faqTitle", "Başlık", settings.faqTitle)
  ]);
  if (currentSection === "navigation") root.innerHTML = renderListBlock("Menü Linkleri", "Üst menüde görünen bağlantıları yönet.", "navLinks");
  if (currentSection === "footer") root.innerHTML = renderSettingsBlock("Footer", "Sayfanın en altındaki marka metni ve iletişim alanı.", [
    textArea("footerText", "Footer metni", settings.footerText, 3),
    textInput("whatsappDefaultMessage", "Sabit WhatsApp butonu mesajı", settings.whatsappDefaultMessage)
  ]);
  bindSectionEditorEvents();
}

function renderSettingsBlock(title, desc, fields) {
  return `
    <form class="panel-card" id="sectionSettingsForm">
      <div class="block-title"><div><h2>${title}</h2><p>${desc}</p></div><button class="btn primary" type="submit">Bölümü Kaydet</button></div>
      <div class="form-grid">${fields.join("")}</div>
    </form>`;
}

function renderListWithHeadingBlock(title, desc, type, headingFields) {
  return `${renderSettingsBlock(title, desc, headingFields).replace("</form>", "")}
    <hr style="border:0;border-top:1px solid var(--line);margin:18px 0" />
    ${renderListItems(type)}
    <div class="form-footer"><button class="btn soft" type="button" data-add-list="${type}">+ Yeni satır ekle</button></div>
  </form>`;
}

function renderListBlock(title, desc, type) {
  return `
    <div class="panel-card">
      <div class="block-title"><div><h2>${title}</h2><p>${desc}</p></div><button class="btn primary" data-save-list="${type}">Listeyi Kaydet</button></div>
      ${renderListItems(type)}
      <div class="form-footer"><button class="btn soft" data-add-list="${type}">+ Yeni satır ekle</button></div>
    </div>`;
}

function renderListItems(type) {
  const list = orderItems(content[type] || []);
  return `<div class="list-items" data-list-type="${type}">${list.map((item, index) => renderListItem(type, item, index)).join("") || `<div class="empty-state">Bu bölümde satır yok.</div>`}</div>`;
}

function renderListItem(type, item, index) {
  const base = `
    <div class="item-head">
      <strong>${index + 1}. Satır</strong>
      <button class="btn danger" type="button" data-remove-item="${type}:${item.id}">Sil</button>
    </div>
    <input type="hidden" data-list-field="id" value="${item.id || uid(type)}" />
    <div class="form-grid two">
      <label>Sıra<input data-list-field="order" type="number" value="${item.order || index + 1}" /></label>
      <label class="inline-switch"><input data-list-field="active" type="checkbox" ${item.active !== false ? "checked" : ""} /> Aktif</label>
    </div>`;
  if (type === "categories") return `<div class="item-card">${base}<div class="form-grid two"><label>Kategori anahtarı<input data-list-field="key" value="${item.key || ""}" /></label><label>Görünen ad<input data-list-field="label" value="${item.label || ""}" /></label></div></div>`;
  if (type === "benefits") return `<div class="item-card">${base}<div class="form-grid two"><label>No<input data-list-field="no" value="${item.no || ""}" /></label><label>Başlık<input data-list-field="title" value="${item.title || ""}" /></label></div><label>Açıklama<textarea data-list-field="text" rows="3">${item.text || ""}</textarea></label></div>`;
  if (type === "testimonials") return `<div class="item-card">${base}<label>Yorum<textarea data-list-field="text" rows="3">${item.text || ""}</textarea></label><label>Ad Soyad / Kısa isim<input data-list-field="name" value="${item.name || ""}" /></label></div>`;
  if (type === "faqs") return `<div class="item-card">${base}<label>Soru<input data-list-field="question" value="${item.question || ""}" /></label><label>Cevap<textarea data-list-field="answer" rows="3">${item.answer || ""}</textarea></label><label class="inline-switch"><input data-list-field="open" type="checkbox" ${item.open ? "checked" : ""} /> Açık gelsin</label></div>`;
  if (type === "navLinks") return `<div class="item-card">${base}<div class="form-grid two"><label>Menü adı<input data-list-field="label" value="${item.label || ""}" /></label><label>Bağlantı<input data-list-field="href" value="${item.href || "#"}" /></label></div></div>`;
  return "";
}

function bindSectionEditorEvents() {
  $("#sectionSettingsForm")?.addEventListener("submit", saveCurrentSectionSettings);
  $$('[data-save-list]').forEach((button) => button.addEventListener("click", () => saveList(button.dataset.saveList)));
  $$('[data-add-list]').forEach((button) => button.addEventListener("click", () => addListItem(button.dataset.addList)));
  $$('[data-remove-item]').forEach((button) => button.addEventListener("click", () => removeListItem(button.dataset.removeItem)));
  $$('[data-setting-file]').forEach((input) => input.addEventListener("change", () => handleImageFile(input, "site-images", async (imageUrl) => {
    const key = input.dataset.settingFile;
    const target = $(`[data-setting-field="${key}"]`);
    if (target) target.value = imageUrl;
    settings = await saveSiteSettings({ ...settings, [key]: imageUrl });
    toast("Bölüm görseli kaydedildi.");
  })));
}

async function saveCurrentSectionSettings(event) {
  event.preventDefault();
  const next = { ...settings };
  $$('[data-setting-field]').forEach((field) => next[field.dataset.settingField] = field.value);
  settings = await saveSiteSettings(next);
  await saveVisibleListIfAny();
  toast("Bölüm kaydedildi.");
}

async function saveVisibleListIfAny() {
  const holder = $("[data-list-type]");
  if (holder) await saveList(holder.dataset.listType, false);
}

function collectList(type) {
  const cards = $$(`[data-list-type="${type}"] .item-card`);
  return cards.map((card, index) => {
    const item = {};
    card.querySelectorAll("[data-list-field]").forEach((field) => {
      const key = field.dataset.listField;
      if (field.type === "checkbox") item[key] = field.checked;
      else if (key === "order") item[key] = Number(field.value || index + 1);
      else item[key] = field.value;
    });
    return item;
  });
}

async function saveList(type, showToast = true) {
  content = normalizeContent({ ...content, [type]: collectList(type) });
  content = await saveContent(content);
  fillProductFilters();
  if (showToast) toast("Liste kaydedildi.");
  renderSectionEditor();
}

function emptyListItem(type) {
  const order = (content[type] || []).length + 1;
  const id = uid(type);
  const map = {
    categories: { id, key: `kategori-${order}`, label: "Yeni Kategori", active: true, order },
    benefits: { id, no: String(order).padStart(2, "0"), title: "Yeni Özellik", text: "Açıklama", active: true, order },
    testimonials: { id, text: "Yeni yorum metni", name: "Müşteri", active: true, order },
    faqs: { id, question: "Yeni soru", answer: "Cevap metni", open: false, active: true, order },
    navLinks: { id, label: "Yeni Link", href: "#", active: true, order }
  };
  return map[type];
}

async function addListItem(type) {
  content = normalizeContent({ ...content, [type]: [...(content[type] || []), emptyListItem(type)] });
  content = await saveContent(content);
  renderSectionEditor();
  toast("Yeni satır eklendi.");
}

async function removeListItem(payload) {
  const [type, id] = payload.split(":");
  content = normalizeContent({ ...content, [type]: (content[type] || []).filter((item) => String(item.id) !== String(id)) });
  content = await saveContent(content);
  renderSectionEditor();
  toast("Satır silindi.");
}

function renderCategoryManager() {
  const root = $("#categoryManager");
  if (!root) return;
  root.innerHTML = renderListItems("categories");
  root.querySelectorAll('[data-remove-item]').forEach((button) => button.addEventListener("click", () => removeCategoryFromManager(button.dataset.removeItem)));
}

async function saveCategoryManager() {
  content = normalizeContent({ ...content, categories: collectList("categories") });
  content = await saveContent(content);
  fillProductFilters();
  renderCategoryManager();
  toast("Kategoriler kaydedildi.");
}

async function addCategoryFromManager() {
  content = normalizeContent({ ...content, categories: [...(content.categories || []), emptyListItem("categories")] });
  content = await saveContent(content);
  fillProductFilters();
  renderCategoryManager();
  toast("Yeni kategori eklendi.");
}

async function removeCategoryFromManager(payload) {
  const [, id] = payload.split(":");
  content = normalizeContent({ ...content, categories: (content.categories || []).filter((item) => String(item.id) !== String(id)) });
  content = await saveContent(content);
  fillProductFilters();
  renderCategoryManager();
  toast("Kategori silindi.");
}

async function exportData() {
  const data = { products, settings, content, exportedAt: new Date().toISOString() };
  const json = JSON.stringify(data, null, 2);
  $("#dataPreview").value = json;
  const blob = new Blob([json], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `akgun-yedek-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function importData(input) {
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const data = JSON.parse(reader.result);
      if (Array.isArray(data.products)) products = await saveProducts(data.products);
      if (data.settings) settings = await saveSiteSettings(data.settings);
      if (data.content) content = await saveContent(data.content);
      renderAll();
      toast("JSON içe aktarıldı.");
    } catch (error) {
      toast("JSON okunamadı.");
    }
  };
  reader.readAsText(file);
}

async function seedDefaultFirebase() {
  try {
    await seedFirebase({ products: defaultProducts, settings: defaultSiteSettings, content: defaultContent });
    toast("Varsayılan veriler Firebase’e aktarıldı.");
  } catch (error) {
    toast("Firebase aktarımı başarısız. Config dosyasını kontrol et.");
  }
}

function renderDataPreview() {
  const preview = $("#dataPreview");
  if (preview) preview.value = JSON.stringify({ products, settings, content }, null, 2);
}

async function resetLocal() {
  if (!confirm("Yerel tarayıcı verileri sıfırlansın mı? Firebase verisi etkilenmez.")) return;
  localStorage.clear();
  await loadData();
  renderAll();
  toast("Yerel veri sıfırlandı.");
}

async function saveEverything() {
  products = await saveProducts(products);
  settings = await saveSiteSettings(settings);
  content = await saveContent(content);
  toast("Tüm veriler kaydedildi.");
}


function setAdminLocked(isLocked) {
  const loginScreen = $("#loginScreen");
  const adminShell = $("#adminShell");
  if (loginScreen) loginScreen.hidden = !isLocked;
  if (adminShell) adminShell.classList.toggle("is-locked", isLocked);
}

function setAdminInfo(user) {
  const userEl = $("#adminUserEmail");
  if (userEl) userEl.textContent = user?.email || "Giriş yapılmadı";
}

function bindAuthEvents() {
  $("#loginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = $("#loginEmail").value.trim();
    const password = $("#loginPassword").value;
    const message = $("#loginMessage");
    if (message) message.textContent = "Giriş yapılıyor...";

    try {
      await signInAdmin(email, password);
      if (message) message.textContent = "";
      toast("Admin girişi başarılı.");
    } catch (error) {
      console.warn("Admin girişi başarısız.", error);
      if (message) message.textContent = "E-posta veya şifre hatalı olabilir.";
    }
  });

  $("#logoutButton")?.addEventListener("click", async () => {
    try {
      await signOutAdmin();
      toast("Çıkış yapıldı.");
    } catch (error) {
      toast("Çıkış yapılamadı.");
    }
  });
}

async function bootAdminPanel() {
  await loadData();
  renderAll();
  bindEvents();
  switchView("dashboard");
}

function bindEvents() {
  if (adminEventsBound) return;
  adminEventsBound = true;
  $$("#sideNav button").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
  $$('[data-jump]').forEach((button) => button.addEventListener("click", () => switchView(button.dataset.jump)));
  $$('[data-open-product-new]').forEach((button) => button.addEventListener("click", () => openProductEditor()));
  $("#addProductButton").addEventListener("click", () => openProductEditor());
  $("#backToProductsButton").addEventListener("click", () => switchView("products"));
  $("#saveEditorProductButton").addEventListener("click", saveEditorProduct);
  $("#deleteEditorProductButton").addEventListener("click", () => editingProduct && removeProduct(editingProduct.id));
  $("#productSearch").addEventListener("input", renderProductsTable);
  $("#productCategoryFilter").addEventListener("change", renderProductsTable);
  $("#productStatusFilter").addEventListener("change", renderProductsTable);
  $("#addImageUrlButton").addEventListener("click", () => {
    addProductImage($("#editorImageUrl").value);
    $("#editorImageUrl").value = "";
  });
  $("#clearImagesButton").addEventListener("click", () => {
    if (!confirm("Ürün galerisi temizlensin mi?")) return;
    editingProduct.images = [];
    editingProduct.image = "";
    renderProductPreview();
  });
  $("#editorImageFit").addEventListener("change", renderProductPreview);
  $("#editorImagePosition").addEventListener("change", renderProductPreview);
  $("#editorImageFile").addEventListener("change", () => handleProductImageFiles($("#editorImageFile")));
  $("#quickAddCategoryButton").addEventListener("click", quickAddCategory);
  $("#saveCategoriesButton").addEventListener("click", saveCategoryManager);
  $("#addCategoryManagerButton").addEventListener("click", addCategoryFromManager);
  $("#settingsForm").addEventListener("submit", saveSettingsForm);
  $$("#sectionMenu button").forEach((button) => button.addEventListener("click", () => { currentSection = button.dataset.section; renderSectionEditor(); }));
  $("#exportDataButton").addEventListener("click", exportData);
  $("#importDataInput").addEventListener("change", (event) => importData(event.target));
  $("#seedFirebaseButton").addEventListener("click", seedDefaultFirebase);
  $("#resetLocalButton").addEventListener("click", resetLocal);
  $("#refreshButton").addEventListener("click", async () => { await loadData(); renderAll(); toast("Veriler yenilendi."); });
  $("#saveEverythingButton").addEventListener("click", saveEverything);
}

async function showBackendStatus() {
  const status = await getBackendStatus();
  $("#backendMode").textContent = status.mode === "firebase" ? "Canlı Firebase modu" : "Yerel tarayıcı modu";
  $("#backendDetail").textContent = status.message || (status.mode === "firebase" ? "Değişiklikler canlı veritabanına yazılır." : "Firebase ayarlanana kadar kayıtlar bu tarayıcıda kalır.");
}

async function loadData() {
  [products, settings, content] = await Promise.all([getProducts(), getSiteSettings(), getContent()]);
  content = normalizeContent(content);
}

function renderAll() {
  fillProductFilters();
  fillSettingsForm();
  renderDashboard();
  renderProductsTable();
  renderSectionEditor();
  renderCategoryManager();
  renderDataPreview();
}

async function init() {
  bindAuthEvents();
  await showBackendStatus();

  if (!isFirebaseConfigured()) {
    setAdminLocked(false);
    await bootAdminPanel();
    return;
  }

  setAdminLocked(true);
  authUnsubscribe = await onAdminAuthStateChanged(async (user) => {
    setAdminInfo(user);
    if (!user) {
      setAdminLocked(true);
      return;
    }

    setAdminLocked(false);
    await bootAdminPanel();
  });
}

init();
