import { categoryLabels } from "../config/app-config.js";
import { getProducts } from "../services/catalog-service.js";
import { getSiteSettings } from "../services/site-settings-service.js";
import { money, normalizeText, slugPhone } from "../utils/format.js";

let products = getProducts().filter((product) => product.active !== false);
let settings = getSiteSettings();
let cart = [];
let activeChip = "all";
let modalProductId = null;

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => Array.from(document.querySelectorAll(selector));

const productGrid = qs("#productGrid");
const categoryFilter = qs("#categoryFilter");
const sortFilter = qs("#sortFilter");
const searchInput = qs("#searchInput");
const weightFilter = qs("#weightFilter");
const stockFilter = qs("#stockFilter");
const productCounter = qs("#productCounter");
const categoryChips = qs("#categoryChips");
const featuredGrid = qs("#featuredGrid");
const cartDrawer = qs("#cartDrawer");
const overlay = qs("#overlay");
const cartOpen = qs("#cartOpen");
const cartClose = qs("#cartClose");
const cartItems = qs("#cartItems");
const cartCount = qs("#cartCount");
const cartTotal = qs("#cartTotal");
const cartShipping = qs("#cartShipping");
const cartProgress = qs("#cartProgress");
const checkoutButton = qs("#checkoutButton");
const menuToggle = qs("#menuToggle");
const mainNav = qs("#mainNav");
const headerActions = qs(".header-actions");
const productModal = qs("#productModal");
const modalClose = qs("#modalClose");
const modalBody = qs("#modalBody");

function setText(selector, value) {
  const element = qs(selector);
  if (element && value !== undefined) element.textContent = value;
}

function applySiteSettings() {
  document.title = settings.pageTitle || settings.brandName;
  const metaDescription = qs('meta[name="description"]');
  if (metaDescription) metaDescription.setAttribute("content", settings.metaDescription || "");

  setText("[data-setting='announcementPrimary']", settings.announcementPrimary);
  setText("[data-setting='announcementSecondary']", settings.announcementSecondary);
  setText("[data-setting='heroEyebrow']", settings.heroEyebrow);
  setText("[data-setting='heroTitle']", settings.heroTitle);
  setText("[data-setting='heroText']", settings.heroText);
  setText("[data-setting='heroPrimaryButton']", settings.heroPrimaryButton);
  setText("[data-setting='heroSecondaryButton']", settings.heroSecondaryButton);
  setText("[data-setting='statOneValue']", settings.statOneValue);
  setText("[data-setting='statOneLabel']", settings.statOneLabel);
  setText("[data-setting='statTwoValue']", settings.statTwoValue);
  setText("[data-setting='statTwoLabel']", settings.statTwoLabel);
  setText("[data-setting='statThreeValue']", settings.statThreeValue);
  setText("[data-setting='statThreeLabel']", settings.statThreeLabel);
  setText("[data-setting='featuredTitle']", settings.featuredTitle);
  setText("[data-setting='featuredText']", settings.featuredText);
  setText("[data-setting='productsText']", settings.productsText);
  setText("[data-setting='storyTitle']", settings.storyTitle);
  setText("[data-setting='storyText']", settings.storyText);

  const phone = slugPhone(settings.whatsappNumber);
  const message = encodeURIComponent(settings.whatsappDefaultMessage || "Merhaba, bilgi almak istiyorum.");
  qsa("[data-whatsapp-link]").forEach((link) => {
    link.href = `https://wa.me/${phone}?text=${message}`;
  });
  qsa("[data-phone-link]").forEach((link) => {
    link.href = `tel:${settings.phoneNumber || settings.whatsappNumber}`;
  });
}

function getVisibleProducts() {
  const category = activeChip || categoryFilter.value;
  const sort = sortFilter.value;
  const term = normalizeText(searchInput?.value || "");
  const weight = weightFilter?.value || "all";
  const onlyStock = Boolean(stockFilter?.checked);

  let list = category === "all" ? [...products] : products.filter((product) => product.category === category);

  if (term) {
    list = list.filter((product) => {
      const haystack = normalizeText([
        product.title,
        product.desc,
        categoryLabels[product.category],
        product.origin,
        product.weight,
        ...(product.tags || [])
      ].join(" "));
      return haystack.includes(term);
    });
  }

  if (weight !== "all") {
    if (weight === "set") list = list.filter((product) => normalizeText(product.weight).includes("set"));
    else list = list.filter((product) => product.weight === weight);
  }

  if (onlyStock) list = list.filter((product) => product.stock > 0);
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
  if (sort === "popular") list.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller) || b.rating - a.rating);
  return list;
}

function renderCategoryChips() {
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
      categoryFilter.value = activeChip;
      renderCategoryChips();
      renderProducts();
    });
  });
}

function renderFeaturedProducts() {
  const featured = products.filter((product) => product.featured).slice(0, 4);
  featuredGrid.innerHTML = featured.map((product) => `
    <button class="featured-card" data-id="${product.id}">
      <img src="${product.image}" alt="${product.title}" />
      <span>${product.badge || "Seçili"}</span>
      <strong>${product.title}</strong>
      <small>${money(product.price)} · ${product.weight}</small>
    </button>
  `).join("");

  qsa(".featured-card").forEach((card) => {
    card.addEventListener("click", () => openProductModal(Number(card.dataset.id)));
  });
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();
  const categoryName = categoryLabels[activeChip] || "Tümü";
  if (productCounter) productCounter.textContent = `${visibleProducts.length} ürün · ${categoryName}`;
  if (!visibleProducts.length) {
    productGrid.innerHTML = `<div class="empty-products">Bu filtrelere uygun ürün bulunamadı. Filtreleri temizleyip tekrar deneyebilirsiniz.</div>`;
    return;
  }

  productGrid.innerHTML = visibleProducts.map((product) => {
    const stockClass = product.stock <= 10 ? "low" : "";
    const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
    return `
      <article class="product-card">
        <div class="product-image">
          <img src="${product.image}" alt="${product.title}" />
          ${product.badge ? `<span class="badge">${product.badge}</span>` : ""}
          ${discount > 0 ? `<span class="discount-badge">%${discount}</span>` : ""}
        </div>
        <div class="product-info">
          <p class="product-category-line">${categoryLabels[product.category]} · ${product.weight}</p>
          <h3>${product.title}</h3>
          <p>${product.desc}</p>
          <div class="product-tags">${(product.tags || []).slice(0, 3).map((tag) => `<span>${tag}</span>`).join("")}</div>
          <div class="stock-line ${stockClass}">
            <span>★ ${product.rating}</span>
            <span>${product.stock <= 0 ? "Stok yok" : product.stock <= 10 ? "Az kaldı" : "Stokta"}</span>
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

  qsa(".add-btn").forEach((button) => button.addEventListener("click", () => addToCart(Number(button.dataset.id))));
  qsa(".detail-btn").forEach((button) => button.addEventListener("click", () => openProductModal(Number(button.dataset.id))));
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product || product.stock <= 0) return;
  const existing = cart.find((item) => item.id === productId);
  if (existing) existing.qty += 1;
  else cart.push({ ...product, qty: 1 });
  renderCart();
  openCart();
}

function updateQty(productId, direction) {
  cart = cart.map((item) => item.id !== productId ? item : { ...item, qty: item.qty + direction }).filter((item) => item.qty > 0);
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  renderCart();
}

function cartTotalValue() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cartTotalValue();
  const freeShippingTarget = Number(settings.freeShippingTarget || 0);
  const remaining = Math.max(freeShippingTarget - total, 0);
  const progress = freeShippingTarget > 0 ? Math.min((total / freeShippingTarget) * 100, 100) : 100;

  cartCount.textContent = count;
  cartTotal.textContent = money(total);
  cartShipping.textContent = !cart.length
    ? "Ücretsiz kargo için ürün ekleyin."
    : remaining === 0
      ? "Ücretsiz soğuk zincir kargo kazandınız."
      : `${money(remaining)} daha ekleyin, ücretsiz soğuk zincir kargo kazanın.`;
  cartProgress.style.width = `${progress}%`;

  if (!cart.length) {
    cartItems.innerHTML = `<div class="empty-cart">Sepetiniz henüz boş.<br />Ürünlerden birini ekleyerek başlayın.</div>`;
    return;
  }

  cartItems.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}" />
      <div>
        <h4>${item.title}</h4>
        <p>${money(item.price)} · ${item.qty} adet · ${item.weight}</p>
      </div>
      <div class="qty-controls">
        <button data-id="${item.id}" data-dir="-1">−</button>
        <span>${item.qty}</span>
        <button data-id="${item.id}" data-dir="1">+</button>
        <button class="remove-cart-item" data-id="${item.id}">×</button>
      </div>
    </div>
  `).join("");

  qsa(".qty-controls button[data-dir]").forEach((button) => button.addEventListener("click", () => updateQty(Number(button.dataset.id), Number(button.dataset.dir))));
  qsa(".remove-cart-item").forEach((button) => button.addEventListener("click", () => removeFromCart(Number(button.dataset.id))));
}

function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

function openProductModal(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  modalProductId = productId;
  modalBody.innerHTML = `
    <div class="modal-product-image"><img src="${product.image}" alt="${product.title}" /></div>
    <div class="modal-product-info">
      <p class="eyebrow">${categoryLabels[product.category]}</p>
      <h2>${product.title}</h2>
      <p>${product.desc}</p>
      <div class="modal-specs">
        <span><strong>Gramaj</strong>${product.weight}</span>
        <span><strong>Menşei</strong>${product.origin}</span>
        <span><strong>Puan</strong>${product.rating}</span>
        <span><strong>Stok</strong>${product.stock} adet</span>
      </div>
      <div class="product-tags modal-tags">${(product.tags || []).map((tag) => `<span>${tag}</span>`).join("")}</div>
      <div class="modal-price-row">
        <div><span class="price">${money(product.price)}</span>${product.oldPrice ? `<small>${money(product.oldPrice)}</small>` : ""}</div>
        <button class="add-btn" id="modalAddToCart" ${product.stock <= 0 ? "disabled" : ""}>Sepete Ekle</button>
      </div>
    </div>`;
  productModal.classList.add("open");
  overlay.classList.add("open");
  productModal.setAttribute("aria-hidden", "false");
  qs("#modalAddToCart")?.addEventListener("click", () => { closeProductModal(); addToCart(productId); });
}

function closeProductModal() {
  productModal.classList.remove("open");
  productModal.setAttribute("aria-hidden", "true");
  modalProductId = null;
  if (!cartDrawer.classList.contains("open")) overlay.classList.remove("open");
}

function buildWhatsAppMessage() {
  if (!cart.length) return encodeURIComponent(settings.whatsappDefaultMessage || "Merhaba, ürünler hakkında bilgi almak istiyorum.");
  const lines = cart.map((item) => `- ${item.title} (${item.weight}) x ${item.qty}: ${money(item.price * item.qty)}`);
  return encodeURIComponent(`Merhaba, sipariş vermek istiyorum.\n\nÜrünler:\n${lines.join("\n")}\n\nToplam: ${money(cartTotalValue())}`);
}

function openCheckout() {
  const phone = slugPhone(settings.whatsappNumber);
  window.open(`https://wa.me/${phone}?text=${buildWhatsAppMessage()}`, "_blank");
}

function bindEvents() {
  categoryFilter.addEventListener("change", () => { activeChip = categoryFilter.value; renderCategoryChips(); renderProducts(); });
  sortFilter.addEventListener("change", renderProducts);
  searchInput?.addEventListener("input", renderProducts);
  weightFilter?.addEventListener("change", renderProducts);
  stockFilter?.addEventListener("change", renderProducts);
  cartOpen.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  overlay.addEventListener("click", () => { closeProductModal(); closeCart(); });
  modalClose?.addEventListener("click", closeProductModal);
  checkoutButton?.addEventListener("click", openCheckout);
  menuToggle.addEventListener("click", () => { mainNav.classList.toggle("open"); headerActions.classList.toggle("open"); });
}

export function initStorefront() {
  applySiteSettings();
  renderCategoryChips();
  renderFeaturedProducts();
  renderProducts();
  renderCart();
  bindEvents();
}
