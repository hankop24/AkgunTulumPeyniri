import { categoryLabels as fallbackCategoryLabels } from "../config/app-config.js";
import { getProducts } from "../services/catalog-service.js";
import { getSiteSettings } from "../services/site-settings-service.js";
import { getContent } from "../services/content-service.js";
import { money, normalizeText, slugPhone, phoneHref } from "../utils/format.js";

let products = [];
let settings = {};
let content = {};
let categoryLabels = { ...fallbackCategoryLabels };
let cart = [];
let activeChip = "all";
let modalProductId = null;

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => Array.from(document.querySelectorAll(selector));
const byOrder = (items = []) => [...items].filter((item) => item.active !== false).sort((a, b) => Number(a.order || 999) - Number(b.order || 999));

function setText(selector, value) {
  const element = qs(selector);
  if (element && value !== undefined) element.textContent = value;
}

function setCategoryLabels() {
  categoryLabels = { all: "Tümü" };
  byOrder(content.categories || []).forEach((category) => {
    categoryLabels[category.key] = category.label;
  });
  if (Object.keys(categoryLabels).length <= 1) categoryLabels = { ...fallbackCategoryLabels };
}

function applySiteSettings() {
  document.title = settings.pageTitle || settings.brandName || "Akgün";
  const metaDescription = qs('meta[name="description"]');
  if (metaDescription) metaDescription.setAttribute("content", settings.metaDescription || "");

  Object.entries(settings).forEach(([key, value]) => setText(`[data-setting='${key}']`, value));

  const heroImage = qs(".hero-visual img");
  if (heroImage && settings.heroImage) heroImage.src = settings.heroImage;
  const storyImage = qs(".story img");
  if (storyImage && settings.storyImage) storyImage.src = settings.storyImage;
  const topCard = qs(".floating-card.top-card");
  if (topCard && settings.heroTopCard) topCard.textContent = settings.heroTopCard;
  const bottomCard = qs(".floating-card.bottom-card");
  if (bottomCard && settings.heroBottomCard) bottomCard.textContent = settings.heroBottomCard;

  const phone = slugPhone(settings.whatsappNumber || "905000000000");
  const message = encodeURIComponent(settings.whatsappDefaultMessage || "Merhaba, bilgi almak istiyorum.");
  qsa("[data-whatsapp-link]").forEach((link) => {
    link.href = phone ? `https://wa.me/${phone}?text=${message}` : "#";
  });
  const tel = phoneHref(settings.phoneNumber || settings.whatsappNumber || "+905000000000");
  qsa("[data-phone-link]").forEach((link) => { link.href = tel ? `tel:${tel}` : "#"; });
}

function renderNavigation() {
  const nav = qs("#mainNav");
  if (!nav) return;
  nav.innerHTML = byOrder(content.navLinks || []).map((link) => `<a href="${link.href}">${link.label}</a>`).join("");
}

function renderCategoryFilters() {
  const categoryFilter = qs("#categoryFilter");
  if (!categoryFilter) return;
  categoryFilter.innerHTML = Object.entries(categoryLabels).map(([key, label]) => `<option value="${key}">${label}</option>`).join("");
}

function renderBenefits() {
  const container = qs(".benefits");
  if (!container) return;
  container.innerHTML = byOrder(content.benefits || []).map((item) => `
    <article>
      <span>${item.no || ""}</span>
      <h3>${item.title || ""}</h3>
      <p>${item.text || ""}</p>
    </article>
  `).join("");
}

function renderTestimonials() {
  const container = qs(".testimonial-grid");
  if (!container) return;
  container.innerHTML = byOrder(content.testimonials || []).map((item) => `
    <article>
      <p>“${item.text || ""}”</p>
      <strong>${item.name || ""}</strong>
    </article>
  `).join("");
}

function renderFaqs() {
  const faqSection = qs(".faq");
  if (!faqSection) return;
  const heading = faqSection.querySelector(".section-heading");
  faqSection.innerHTML = "";
  if (heading) faqSection.appendChild(heading);
  byOrder(content.faqs || []).forEach((item) => {
    const details = document.createElement("details");
    if (item.open) details.open = true;
    details.innerHTML = `<summary>${item.question || ""}</summary><p>${item.answer || ""}</p>`;
    faqSection.appendChild(details);
  });
}

function getVisibleProducts() {
  const categoryFilter = qs("#categoryFilter");
  const sortFilter = qs("#sortFilter");
  const searchInput = qs("#searchInput");
  const weightFilter = qs("#weightFilter");
  const stockFilter = qs("#stockFilter");

  const category = activeChip || categoryFilter?.value || "all";
  const sort = sortFilter?.value || "popular";
  const term = normalizeText(searchInput?.value || "");
  const weight = weightFilter?.value || "all";
  const onlyStock = Boolean(stockFilter?.checked);

  let list = category === "all" ? [...products] : products.filter((product) => product.category === category);

  if (term) {
    list = list.filter((product) => normalizeText([
      product.title, product.desc, categoryLabels[product.category], product.origin, product.weight, ...(product.tags || [])
    ].join(" ")).includes(term));
  }

  if (weight !== "all") {
    if (weight === "set") list = list.filter((product) => normalizeText(product.weight).includes("set"));
    else list = list.filter((product) => product.weight === weight);
  }

  if (onlyStock) list = list.filter((product) => product.stock > 0);
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (sort === "rating") list.sort((a, b) => Number(a.order || 999) - Number(b.order || 999));
  if (sort === "popular") list.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller) || Number(a.order || 999) - Number(b.order || 999));
  return list;
}

function renderCategoryChips() {
  const categoryChips = qs("#categoryChips");
  const categoryFilter = qs("#categoryFilter");
  if (!categoryChips) return;
  const counts = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    acc.all += 1;
    return acc;
  }, { all: 0 });

  categoryChips.innerHTML = Object.entries(categoryLabels).map(([key, label]) => `
    <button class="category-chip ${key === activeChip ? "active" : ""}" data-category="${key}">
      ${label} <span>${counts[key] || 0}</span>
    </button>
  `).join("");

  qsa(".category-chip").forEach((button) => {
    button.addEventListener("click", () => {
      activeChip = button.dataset.category;
      if (categoryFilter) categoryFilter.value = activeChip;
      renderCategoryChips();
      renderProducts();
    });
  });
}

function normalizeGalleryItem(item, fallback = {}) {
  const url = typeof item === "object" ? item?.url || item?.src || item?.image : item;
  return {
    url: String(url || "").trim(),
    fit: ["cover", "contain"].includes(item?.fit) ? item.fit : (fallback.fit || "cover"),
    position: String(item?.position || fallback.position || "center center")
  };
}

function imageSrc(image) {
  const url = typeof image === "object" ? image?.url : image;
  return url || "assets/product-akgun.png";
}

function productImages(product = {}) {
  const fallback = { fit: product.imageFit || "cover", position: product.imagePosition || "center center" };
  const list = Array.isArray(product.images) ? product.images : [];
  const merged = [...list, product.image].map((item) => normalizeGalleryItem(item, fallback)).filter((item) => item.url);
  const seen = new Set();
  const unique = merged.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
  return unique.length ? unique : [{ url: "assets/product-akgun.png", fit: "cover", position: "center center" }];
}

function mainProductImage(product = {}) {
  return productImages(product)[0]?.url || "assets/product-akgun.png";
}

function imageStyle(imageOrProduct = {}) {
  const image = imageOrProduct.url ? imageOrProduct : productImages(imageOrProduct)[0];
  return `object-fit:${image?.fit || "cover"};object-position:${image?.position || "center center"}`;
}

function renderFeaturedProducts() {
  const featuredGrid = qs("#featuredGrid");
  if (!featuredGrid) return;
  const featured = products.filter((product) => product.featured).slice(0, 4);
  featuredGrid.innerHTML = featured.map((product) => `
    <button class="featured-card" data-id="${product.id}">
      <img src="${imageSrc(productImages(product)[0])}" style="${imageStyle(productImages(product)[0])}" onerror="this.src='assets/product-akgun.png'" alt="${product.title}" />
      <span>${product.campaignActive ? "Kampanya" : product.bestSeller ? "Çok satan" : "Öne çıkan"}</span>
      <strong>${product.title}</strong>
      <small>${money(product.price)} · ${product.weight}</small>
    </button>
  `).join("");
  qsa(".featured-card").forEach((card) => card.addEventListener("click", () => openProductModal(card.dataset.id)));
}

function renderProducts() {
  const productGrid = qs("#productGrid");
  const productCounter = qs("#productCounter");
  if (!productGrid) return;
  const visibleProducts = getVisibleProducts();
  const categoryName = categoryLabels[activeChip] || "Tümü";
  if (productCounter) productCounter.textContent = `${visibleProducts.length} ürün · ${categoryName}`;
  if (!visibleProducts.length) {
    productGrid.innerHTML = `<div class="empty-products">Bu filtrelere uygun ürün bulunamadı. Filtreleri temizleyip tekrar deneyebilirsiniz.</div>`;
    return;
  }

  productGrid.innerHTML = visibleProducts.map((product) => {
    const lowStockLimit = Number(settings.lowStockLimit || 10);
    const stockClass = product.stock <= lowStockLimit ? "low" : "";
    const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
    return `
      <article class="product-card">
        <div class="product-image">
          <img src="${imageSrc(productImages(product)[0])}" style="${imageStyle(productImages(product)[0])}" onerror="this.src='assets/product-akgun.png'" alt="${product.title}" />
          ${product.bestSeller ? `<span class="badge best-seller-badge">Çok satan</span>` : ""}
          ${discount > 0 ? `<span class="discount-badge">%${discount}</span>` : ""}
          ${product.campaignActive ? `<span class="campaign-badge">Kampanya</span>` : ""}
        </div>
        <div class="product-info">
          <p class="product-category-line">${categoryLabels[product.category] || product.category} · ${product.weight}</p>
          <h3>${product.title}</h3>
          <p>${product.desc}</p>
          <div class="product-tags">${(product.tags || []).slice(0, 3).map((tag) => `<span>${tag}</span>`).join("")}</div>
          <div class="stock-line ${stockClass}">
            <span>${product.stock <= 0 ? "Stok yok" : product.stock <= lowStockLimit ? "Az kaldı" : "Stokta"}</span>
          </div>
          <div class="product-meta">
            <div class="price-block">
              <span class="price">${money(product.price)}</span>
              ${product.oldPrice ? `<small>${money(product.oldPrice)}</small>` : ""}
            </div>
            <div class="product-actions-inline">
              <button class="detail-btn" data-id="${product.id}">Detay</button>
              <button class="add-btn" data-id="${product.id}" ${product.stock <= 0 ? "disabled" : ""}>Sepete Ekle</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");

  qsa(".add-btn").forEach((button) => button.addEventListener("click", () => addToCart(button.dataset.id)));
  qsa(".detail-btn").forEach((button) => button.addEventListener("click", () => openProductModal(button.dataset.id)));
}

function addToCart(productId) {
  const product = products.find((item) => String(item.id) === String(productId));
  if (!product || product.stock <= 0) return;
  const existing = cart.find((item) => String(item.id) === String(productId));
  if (existing) existing.qty += 1;
  else cart.push({ ...product, qty: 1 });
  renderCart();
  openCart();
}

function updateQty(productId, direction) {
  cart = cart.map((item) => String(item.id) !== String(productId) ? item : { ...item, qty: item.qty + direction }).filter((item) => item.qty > 0);
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => String(item.id) !== String(productId));
  renderCart();
}

function cartTotalValue() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderCart() {
  const cartCount = qs("#cartCount");
  const cartTotal = qs("#cartTotal");
  const cartShipping = qs("#cartShipping");
  const cartProgress = qs("#cartProgress");
  const cartItems = qs("#cartItems");
  if (!cartItems) return;

  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cartTotalValue();
  const freeShippingTarget = Number(settings.freeShippingTarget || 0);
  const remaining = Math.max(freeShippingTarget - total, 0);
  const progress = freeShippingTarget > 0 ? Math.min((total / freeShippingTarget) * 100, 100) : 100;

  if (cartCount) cartCount.textContent = count;
  if (cartTotal) cartTotal.textContent = money(total);
  if (cartShipping) cartShipping.textContent = !cart.length
    ? "Ücretsiz kargo için ürün ekleyin."
    : remaining === 0
      ? "Ücretsiz soğuk zincir kargo kazandınız."
      : `${money(remaining)} daha ekleyin, ücretsiz soğuk zincir kargo kazanın.`;
  if (cartProgress) cartProgress.style.width = `${progress}%`;

  if (!cart.length) {
    cartItems.innerHTML = `<div class="empty-cart">Sepetiniz henüz boş.<br />Ürünlerden birini ekleyerek başlayın.</div>`;
    return;
  }

  cartItems.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <img src="${imageSrc(productImages(item)[0])}" style="${imageStyle(productImages(item)[0])}" onerror="this.src='assets/product-akgun.png'" alt="${item.title}" />
      <div><h4>${item.title}</h4><p>${money(item.price)} · ${item.qty} adet · ${item.weight}</p></div>
      <div class="qty-controls">
        <button data-id="${item.id}" data-dir="-1">−</button>
        <span>${item.qty}</span>
        <button data-id="${item.id}" data-dir="1">+</button>
        <button class="remove-cart-item" data-id="${item.id}">×</button>
      </div>
    </div>
  `).join("");

  qsa(".qty-controls button[data-dir]").forEach((button) => button.addEventListener("click", () => updateQty(button.dataset.id, Number(button.dataset.dir))));
  qsa(".remove-cart-item").forEach((button) => button.addEventListener("click", () => removeFromCart(button.dataset.id)));
}

function openCart() {
  qs("#cartDrawer")?.classList.add("open");
  qs("#overlay")?.classList.add("open");
  qs("#cartDrawer")?.setAttribute("aria-hidden", "false");
}

function closeCart() {
  qs("#cartDrawer")?.classList.remove("open");
  qs("#overlay")?.classList.remove("open");
  qs("#cartDrawer")?.setAttribute("aria-hidden", "true");
}

function openProductModal(productId) {
  const product = products.find((item) => String(item.id) === String(productId));
  const modalBody = qs("#modalBody");
  const productModal = qs("#productModal");
  if (!product || !modalBody || !productModal) return;
  modalProductId = productId;
  const images = productImages(product);
  modalBody.innerHTML = `
    <div class="modal-gallery">
      <div class="modal-product-image"><img id="modalMainImage" src="${imageSrc(images[0])}" style="${imageStyle(images[0])}" onerror="this.src='assets/product-akgun.png'" alt="${product.title}" /></div>
      ${images.length > 1 ? `<div class="modal-thumbs">${images.map((image, index) => `
        <button class="modal-thumb ${index === 0 ? "active" : ""}" data-modal-image="${index}">
          <img src="${imageSrc(image)}" style="${imageStyle(image)}" onerror="this.src='assets/product-akgun.png'" alt="${product.title} görsel ${index + 1}" />
        </button>`).join("")}</div>` : ""}
    </div>
    <div class="modal-product-info">
      <p class="eyebrow">${categoryLabels[product.category] || product.category}</p>
      <h2>${product.title}</h2>
      <p>${product.desc}</p>
      <div class="modal-specs">
        <span><strong>Gramaj</strong>${product.weight}</span>
        <span><strong>Menşei</strong>${product.origin}</span>
        <span><strong>Stok</strong>${product.stock} adet</span>
        ${product.bestSeller ? `<span><strong>Durum</strong>Çok satan</span>` : ""}
      </div>
      <div class="product-tags modal-tags">${(product.tags || []).map((tag) => `<span>${tag}</span>`).join("")}</div>
      <div class="modal-price-row">
        <div><span class="price">${money(product.price)}</span>${product.oldPrice ? `<small>${money(product.oldPrice)}</small>` : ""}</div>
        <button class="add-btn" id="modalAddToCart" ${product.stock <= 0 ? "disabled" : ""}>Sepete Ekle</button>
      </div>
    </div>`;
  productModal.classList.add("open");
  qs("#overlay")?.classList.add("open");
  productModal.setAttribute("aria-hidden", "false");
  qsa(".modal-thumb").forEach((button) => button.addEventListener("click", () => {
    const index = Number(button.dataset.modalImage || 0);
    const main = qs("#modalMainImage");
    if (main && images[index]) {
      main.src = imageSrc(images[index]);
      main.setAttribute("style", imageStyle(images[index]));
    }
    qsa(".modal-thumb").forEach((thumb) => thumb.classList.toggle("active", thumb === button));
  }));
  qs("#modalAddToCart")?.addEventListener("click", () => { closeProductModal(); addToCart(productId); });
}
function closeProductModal() {
  const productModal = qs("#productModal");
  productModal?.classList.remove("open");
  productModal?.setAttribute("aria-hidden", "true");
  modalProductId = null;
  if (!qs("#cartDrawer")?.classList.contains("open")) qs("#overlay")?.classList.remove("open");
}

function buildWhatsAppMessage() {
  if (!cart.length) return encodeURIComponent(settings.whatsappDefaultMessage || "Merhaba, ürünler hakkında bilgi almak istiyorum.");

  const lines = cart.flatMap((item, index) => ([
    `${index + 1}) ${item.title}${item.weight ? ` - ${item.weight}` : ""}`,
    `   Adet: ${item.qty}`,
    `   Birim fiyat: ${money(item.price)}`,
    `   Ara toplam: ${money(item.price * item.qty)}`
  ]));

  const totalQuantity = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);

  return encodeURIComponent([
    "Merhaba, Akgün Erzincan Tulum Peyniri sitesinden sipariş vermek istiyorum.",
    "",
    "Sipariş detayları:",
    ...lines,
    "",
    `Toplam ürün adedi: ${totalQuantity}`,
    `Genel toplam: ${money(cartTotalValue())}`,
    "",
    "Ad Soyad:",
    "Teslimat adresi:",
    "Not:"
  ].join("\n"));
}

function openCheckout() {
  const phone = slugPhone(settings.whatsappNumber || "905000000000");
  if (!phone) {
    alert("WhatsApp numarası tanımlı değil. Lütfen admin panelinden WhatsApp numarasını ekleyin.");
    return;
  }
  window.open(`https://wa.me/${phone}?text=${buildWhatsAppMessage()}`, "_blank");
}

function bindEvents() {
  qs("#categoryFilter")?.addEventListener("change", (event) => { activeChip = event.target.value; renderCategoryChips(); renderProducts(); });
  qs("#sortFilter")?.addEventListener("change", renderProducts);
  qs("#searchInput")?.addEventListener("input", renderProducts);
  qs("#weightFilter")?.addEventListener("change", renderProducts);
  qs("#stockFilter")?.addEventListener("change", renderProducts);
  qs("#cartOpen")?.addEventListener("click", openCart);
  qs("#cartClose")?.addEventListener("click", closeCart);
  qs("#overlay")?.addEventListener("click", () => { closeProductModal(); closeCart(); });
  qs("#modalClose")?.addEventListener("click", closeProductModal);
  qs("#checkoutButton")?.addEventListener("click", openCheckout);
  qs("#menuToggle")?.addEventListener("click", () => { qs("#mainNav")?.classList.toggle("open"); qs(".header-actions")?.classList.toggle("open"); });
}

export async function initStorefront() {
  [products, settings, content] = await Promise.all([getProducts(), getSiteSettings(), getContent()]);
  products = products.filter((product) => product.active !== false);
  setCategoryLabels();
  applySiteSettings();
  renderNavigation();
  renderCategoryFilters();
  renderBenefits();
  renderTestimonials();
  renderFaqs();
  renderCategoryChips();
  renderFeaturedProducts();
  renderProducts();
  renderCart();
  bindEvents();
}
