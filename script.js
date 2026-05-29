const products = [
  {
    id: 1,
    title: "Akgün Erzincan Tulum Peyniri Kavanoz",
    desc: "1000g aile boyu, yoğun aromalı klasik Erzincan tulum peyniri.",
    price: 690,
    oldPrice: 760,
    category: "tulum",
    badge: "Çok satan",
    image: "assets/product-tub.png",
    weight: "1000g",
    origin: "Erzincan",
    stock: 18,
    rating: 4.9,
    tags: ["Kavanoz", "Aile boyu", "Soğuk zincir"],
    featured: true,
    bestSeller: true
  },
  {
    id: 2,
    title: "Vakum Paket Erzincan Tulum Peyniri",
    desc: "500g pratik paket, tazeliğini koruyan günlük kullanım ürünü.",
    price: 385,
    oldPrice: 430,
    category: "tulum",
    badge: "Yeni",
    image: "assets/product-vacuum.png",
    weight: "500g",
    origin: "Erzincan",
    stock: 24,
    rating: 4.8,
    tags: ["Vakum", "Pratik", "Kahvaltılık"],
    featured: true,
    bestSeller: true
  },
  {
    id: 3,
    title: "Gurme Sarım Tulum Peyniri",
    desc: "Hediye ve sunumlar için özel etiketli kraft sarım konsepti.",
    price: 520,
    oldPrice: 590,
    category: "tulum",
    badge: "Premium",
    image: "assets/product-wrap.png",
    weight: "650g",
    origin: "Erzincan",
    stock: 11,
    rating: 4.8,
    tags: ["Gurme", "Hediye", "Özel sarım"],
    featured: true,
    bestSeller: false
  },
  {
    id: 4,
    title: "Akgün Ürün Ailesi Paketi",
    desc: "Kavanoz, vakum paket ve marka kutusundan oluşan set tasarımı.",
    price: 1190,
    oldPrice: 1370,
    category: "tulum",
    badge: "Set",
    image: "assets/product-family.png",
    weight: "Set",
    origin: "Erzincan",
    stock: 8,
    rating: 5.0,
    tags: ["Hediye seti", "Kutu", "3 ürün"],
    featured: true,
    bestSeller: true
  },
  {
    id: 5,
    title: "Dilimlenebilir Tulum Blok",
    desc: "Sunum tahtaları ve kahvaltı tabakları için blok form peynir.",
    price: 470,
    oldPrice: 520,
    category: "tulum",
    badge: "Önerilen",
    image: "assets/product-wheel.png",
    weight: "700g",
    origin: "Erzincan",
    stock: 14,
    rating: 4.7,
    tags: ["Blok", "Sunumluk", "Dilimlenir"],
    featured: true,
    bestSeller: false
  },
  {
    id: 6,
    title: "Bal",
    desc: "Kahvaltı sofraları için doğal, yöresel bal seçeneği.",
    price: 299,
    oldPrice: 340,
    category: "bal",
    badge: "Doğal",
    image: "https://source.unsplash.com/900x700/?honey,jar",
    weight: "450g",
    origin: "Yöresel",
    stock: 16,
    rating: 4.6,
    tags: ["Kahvaltılık", "Doğal", "Cam kavanoz"],
    featured: false,
    bestSeller: false
  },
  {
    id: 7,
    title: "Kaşar Peyniri",
    desc: "Kahvaltı ve yemeklerde kullanılabilecek klasik kaşar peyniri.",
    price: 279,
    oldPrice: 320,
    category: "kasar",
    badge: "Kahvaltılık",
    image: "https://source.unsplash.com/900x700/?kashar,cheese",
    weight: "500g",
    origin: "Yöresel",
    stock: 21,
    rating: 4.5,
    tags: ["Kaşar", "Kahvaltı", "Yemeklik"],
    featured: false,
    bestSeller: false
  },
  {
    id: 8,
    title: "Göbek Kaşar",
    desc: "Yoğun aromalı, özel formda yöresel göbek kaşar.",
    price: 329,
    oldPrice: 370,
    category: "kasar",
    badge: "Yöresel",
    image: "https://source.unsplash.com/900x700/?cheese,wheel",
    weight: "500g",
    origin: "Yöresel",
    stock: 9,
    rating: 4.6,
    tags: ["Yoğun", "Göbek", "Yöresel"],
    featured: false,
    bestSeller: false
  },
  {
    id: 9,
    title: "Kolot Kaşar",
    desc: "Eriyebilir yapısı ve yöresel aromasıyla kolot kaşar.",
    price: 319,
    oldPrice: 360,
    category: "kasar",
    badge: "Gurme",
    image: "https://source.unsplash.com/900x700/?cheese,dairy",
    weight: "500g",
    origin: "Yöresel",
    stock: 13,
    rating: 4.5,
    tags: ["Kolot", "Eriyen", "Gurme"],
    featured: false,
    bestSeller: false
  },
  {
    id: 10,
    title: "Karadaş Tost Kaşar",
    desc: "Tost ve sıcak sandviçler için uygun lezzetli kaşar.",
    price: 249,
    oldPrice: 290,
    category: "kasar",
    badge: "Tostluk",
    image: "https://source.unsplash.com/900x700/?toast,cheese",
    weight: "500g",
    origin: "Yöresel",
    stock: 30,
    rating: 4.4,
    tags: ["Tostluk", "Eriyen", "Günlük"],
    featured: false,
    bestSeller: false
  },
  {
    id: 11,
    title: "Karadaş Yemeklik Tereyağı",
    desc: "Yemeklerde kullanılabilecek doğal aromalı tereyağı.",
    price: 269,
    oldPrice: 310,
    category: "tereyagi",
    badge: "Yemeklik",
    image: "https://source.unsplash.com/900x700/?butter",
    weight: "500g",
    origin: "Yöresel",
    stock: 19,
    rating: 4.5,
    tags: ["Yemeklik", "Tereyağı", "Doğal"],
    featured: false,
    bestSeller: false
  },
  {
    id: 12,
    title: "Yayık Yağı",
    desc: "Geleneksel yöntemlerle üretilmiş yoğun lezzetli yayık yağı.",
    price: 349,
    oldPrice: 399,
    category: "tereyagi",
    badge: "Geleneksel",
    image: "https://source.unsplash.com/900x700/?butter,dairy",
    weight: "800g",
    origin: "Yöresel",
    stock: 12,
    rating: 4.7,
    tags: ["Yayık", "Geleneksel", "Yoğun"],
    featured: false,
    bestSeller: false
  },
  {
    id: 13,
    title: "Erzincan Salamura İnek Peyniri",
    desc: "Kahvaltı sofraları için klasik Erzincan salamura inek peyniri.",
    price: 239,
    oldPrice: 280,
    category: "salamura",
    badge: "Salamura",
    image: "https://source.unsplash.com/900x700/?white,cheese",
    weight: "650g",
    origin: "Erzincan",
    stock: 20,
    rating: 4.4,
    tags: ["Salamura", "İnek sütü", "Kahvaltı"],
    featured: false,
    bestSeller: false
  },
  {
    id: 14,
    title: "Erzurum Göğermiş Peyniri",
    desc: "Karakteristik aromasıyla yöresel göğermiş peynir.",
    price: 299,
    oldPrice: 350,
    category: "diger-peynir",
    badge: "Yöresel",
    image: "https://source.unsplash.com/900x700/?blue,cheese",
    weight: "500g",
    origin: "Erzurum",
    stock: 7,
    rating: 4.4,
    tags: ["Aromalı", "Yöresel", "Özel"],
    featured: false,
    bestSeller: false
  },
  {
    id: 15,
    title: "Çeçil Peyniri",
    desc: "Lifli yapısı ve hafif lezzetiyle kahvaltılık çeçil peyniri.",
    price: 229,
    oldPrice: 270,
    category: "diger-peynir",
    badge: "Kahvaltılık",
    image: "https://source.unsplash.com/900x700/?string,cheese",
    weight: "500g",
    origin: "Yöresel",
    stock: 22,
    rating: 4.3,
    tags: ["Lifli", "Kahvaltılık", "Hafif"],
    featured: false,
    bestSeller: false
  },
  {
    id: 16,
    title: "Dil Peyniri",
    desc: "Yumuşak yapılı, kahvaltı ve sıcak servisler için dil peyniri.",
    price: 239,
    oldPrice: 279,
    category: "diger-peynir",
    badge: "Taze",
    image: "https://source.unsplash.com/900x700/?mozzarella,cheese",
    weight: "500g",
    origin: "Yöresel",
    stock: 18,
    rating: 4.3,
    tags: ["Taze", "Yumuşak", "Sıcak servis"],
    featured: false,
    bestSeller: false
  },
  {
    id: 17,
    title: "Örgü Peyniri",
    desc: "Şık sunumlu, yöresel örgü peynir çeşidi.",
    price: 259,
    oldPrice: 300,
    category: "diger-peynir",
    badge: "Özel",
    image: "https://source.unsplash.com/900x700/?braided,cheese",
    weight: "500g",
    origin: "Yöresel",
    stock: 16,
    rating: 4.5,
    tags: ["Örgü", "Sunumluk", "Yöresel"],
    featured: false,
    bestSeller: false
  },
  {
    id: 18,
    title: "Van Otlu Peyniri",
    desc: "Ot aromasıyla öne çıkan geleneksel Van otlu peyniri.",
    price: 289,
    oldPrice: 330,
    category: "diger-peynir",
    badge: "Aromalı",
    image: "https://source.unsplash.com/900x700/?herb,cheese",
    weight: "500g",
    origin: "Van",
    stock: 10,
    rating: 4.6,
    tags: ["Otlu", "Aromalı", "Van"],
    featured: false,
    bestSeller: false
  },
  {
    id: 19,
    title: "Koyun Ezine Peyniri",
    desc: "Koyun sütünden üretilen yoğun lezzetli Ezine peyniri.",
    price: 329,
    oldPrice: 380,
    category: "diger-peynir",
    badge: "Yoğun",
    image: "https://source.unsplash.com/900x700/?feta,cheese",
    weight: "500g",
    origin: "Ezine",
    stock: 14,
    rating: 4.5,
    tags: ["Koyun sütü", "Ezine", "Yoğun"],
    featured: false,
    bestSeller: false
  },
  {
    id: 20,
    title: "İnek Ezine Peyniri",
    desc: "Daha yumuşak içimli klasik inek Ezine peyniri.",
    price: 289,
    oldPrice: 330,
    category: "diger-peynir",
    badge: "Klasik",
    image: "https://source.unsplash.com/900x700/?cheese,block",
    weight: "500g",
    origin: "Ezine",
    stock: 17,
    rating: 4.4,
    tags: ["İnek sütü", "Ezine", "Klasik"],
    featured: false,
    bestSeller: false
  },
  {
    id: 21,
    title: "Erzincan Dut Pekmezi",
    desc: "Kahvaltı ve tatlı tüketimi için yöresel dut pekmezi.",
    price: 179,
    oldPrice: 220,
    category: "pekmez",
    badge: "Doğal",
    image: "https://source.unsplash.com/900x700/?molasses,mulberry",
    weight: "700g",
    origin: "Erzincan",
    stock: 15,
    rating: 4.5,
    tags: ["Dut", "Pekmez", "Kahvaltı"],
    featured: false,
    bestSeller: false
  },
  {
    id: 22,
    title: "Erzincan Karadut Pekmezi",
    desc: "Yoğun aromalı, yöresel karadut pekmezi.",
    price: 199,
    oldPrice: 240,
    category: "pekmez",
    badge: "Yoğun",
    image: "https://source.unsplash.com/900x700/?mulberry,syrup",
    weight: "700g",
    origin: "Erzincan",
    stock: 11,
    rating: 4.6,
    tags: ["Karadut", "Yoğun", "Pekmez"],
    featured: false,
    bestSeller: false
  },
  {
    id: 23,
    title: "Erzincan Dermason Fasulye",
    desc: "Yemeklik kullanıma uygun yöresel dermason fasulye.",
    price: 149,
    oldPrice: 180,
    category: "fasulye",
    badge: "Yöresel",
    image: "https://source.unsplash.com/900x700/?white,beans",
    weight: "1000g",
    origin: "Erzincan",
    stock: 28,
    rating: 4.4,
    tags: ["Dermason", "Yemeklik", "Yöresel"],
    featured: false,
    bestSeller: false
  },
  {
    id: 24,
    title: "Erzincan Şeker Fasulye",
    desc: "Lezzetli, iri taneli Erzincan şeker fasulye.",
    price: 159,
    oldPrice: 190,
    category: "fasulye",
    badge: "Seçili",
    image: "https://source.unsplash.com/900x700/?beans",
    weight: "1000g",
    origin: "Erzincan",
    stock: 24,
    rating: 4.4,
    tags: ["Şeker", "İri taneli", "Yemeklik"],
    featured: false,
    bestSeller: false
  },
  {
    id: 25,
    title: "Erzincan Kuru Kayısı",
    desc: "Doğal kurutulmuş Erzincan kuru kayısı.",
    price: 189,
    oldPrice: 230,
    category: "kuru-meyve",
    badge: "Doğal",
    image: "https://source.unsplash.com/900x700/?dried,apricots",
    weight: "500g",
    origin: "Erzincan",
    stock: 19,
    rating: 4.5,
    tags: ["Kuru meyve", "Kayısı", "Doğal"],
    featured: false,
    bestSeller: false
  }
];

let cart = [];
let activeChip = "all";
let modalProductId = null;

const categoryLabels = {
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

const productGrid = document.getElementById("productGrid");
const categoryFilter = document.getElementById("categoryFilter");
const sortFilter = document.getElementById("sortFilter");
const searchInput = document.getElementById("searchInput");
const weightFilter = document.getElementById("weightFilter");
const stockFilter = document.getElementById("stockFilter");
const productCounter = document.getElementById("productCounter");
const categoryChips = document.getElementById("categoryChips");
const featuredGrid = document.getElementById("featuredGrid");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const cartOpen = document.getElementById("cartOpen");
const cartClose = document.getElementById("cartClose");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const cartShipping = document.getElementById("cartShipping");
const cartProgress = document.getElementById("cartProgress");
const checkoutButton = document.getElementById("checkoutButton");

const checkoutModal = document.getElementById("checkoutModal");
const checkoutClose = document.getElementById("checkoutClose");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutTotal = document.getElementById("checkoutTotal");
const checkoutWhatsapp = document.getElementById("checkoutWhatsapp");

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const headerActions = document.querySelector(".header-actions");
const productModal = document.getElementById("productModal");
const modalClose = document.getElementById("modalClose");
const modalBody = document.getElementById("modalBody");

const money = (value) => new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0
}).format(value);

function getVisibleProducts() {
  const category = activeChip || categoryFilter.value;
  const sort = sortFilter.value;
  const term = (searchInput?.value || "").trim().toLocaleLowerCase("tr-TR");
  const weight = weightFilter?.value || "all";
  const onlyStock = Boolean(stockFilter?.checked);

  let list = category === "all"
    ? [...products]
    : products.filter((product) => product.category === category);

  if (term) {
    list = list.filter((product) => {
      const haystack = [
        product.title,
        product.desc,
        categoryLabels[product.category],
        product.origin,
        product.weight,
        ...(product.tags || [])
      ].join(" ").toLocaleLowerCase("tr-TR");

      return haystack.includes(term);
    });
  }

  if (weight !== "all") {
    if (weight === "set") {
      list = list.filter((product) => product.weight.toLocaleLowerCase("tr-TR").includes("set"));
    } else {
      list = list.filter((product) => product.weight === weight);
    }
  }

  if (onlyStock) {
    list = list.filter((product) => product.stock > 0);
  }

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

  document.querySelectorAll(".category-chip").forEach((button) => {
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
      <span>${product.badge}</span>
      <strong>${product.title}</strong>
      <small>${money(product.price)} · ${product.weight}</small>
    </button>
  `).join("");

  document.querySelectorAll(".featured-card").forEach((card) => {
    card.addEventListener("click", () => openProductModal(Number(card.dataset.id)));
  });
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();
  const categoryName = categoryLabels[activeChip] || "Tümü";

  if (productCounter) {
    productCounter.textContent = `${visibleProducts.length} ürün · ${categoryName}`;
  }

  if (!visibleProducts.length) {
    productGrid.innerHTML = `<div class="empty-products">Bu filtrelere uygun ürün bulunamadı. Filtreleri temizleyip tekrar deneyebilirsin.</div>`;
    return;
  }

  productGrid.innerHTML = visibleProducts.map((product) => {
    const stockClass = product.stock <= 10 ? "low" : "";
    const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

    return `
      <article class="product-card">
        <div class="product-image">
          <img src="${product.image}" alt="${product.title}" />
          <span class="badge">${product.badge}</span>
          ${discount > 0 ? `<span class="discount-badge">%${discount}</span>` : ""}
        </div>
        <div class="product-info">
          <p class="product-category-line">${categoryLabels[product.category]} · ${product.weight}</p>
          <h3>${product.title}</h3>
          <p>${product.desc}</p>
          <div class="product-tags">
            ${(product.tags || []).slice(0, 3).map((tag) => `<span>${tag}</span>`).join("")}
          </div>
          <div class="stock-line ${stockClass}">
            <span>★ ${product.rating}</span>
            <span>${product.stock <= 10 ? "Az kaldı" : "Stokta"}</span>
          </div>
          <div class="product-meta">
            <div class="price-block">
              <span class="price">${money(product.price)}</span>
              ${product.oldPrice ? `<small>${money(product.oldPrice)}</small>` : ""}
            </div>
            <div class="product-actions-inline">
              <button class="detail-btn" data-id="${product.id}">Detay</button>
              <button class="add-btn" data-id="${product.id}">Sepete Ekle</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".add-btn").forEach((button) => {
    button.addEventListener("click", () => addToCart(Number(button.dataset.id)));
  });

  document.querySelectorAll(".detail-btn").forEach((button) => {
    button.addEventListener("click", () => openProductModal(Number(button.dataset.id)));
  });
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  renderCart();
  openCart();
}

function updateQty(productId, direction) {
  cart = cart.map((item) => {
    if (item.id !== productId) return item;
    return { ...item, qty: item.qty + direction };
  }).filter((item) => item.qty > 0);

  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  renderCart();
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const freeShippingTarget = 2500;
  const remaining = Math.max(freeShippingTarget - total, 0);
  const progress = Math.min((total / freeShippingTarget) * 100, 100);

  cartCount.textContent = count;
  cartTotal.textContent = money(total);
  if (checkoutTotal) checkoutTotal.textContent = money(total);

  if (cartShipping) {
    cartShipping.textContent = remaining === 0
      ? "Ücretsiz soğuk zincir kargo kazandınız."
      : `${money(remaining)} daha ekleyin, ücretsiz soğuk zincir kargo kazanın.`;
  }

  if (cartProgress) {
    cartProgress.style.width = `${progress}%`;
  }

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

  document.querySelectorAll(".qty-controls button[data-dir]").forEach((button) => {
    button.addEventListener("click", () => updateQty(Number(button.dataset.id), Number(button.dataset.dir)));
  });

  document.querySelectorAll(".remove-cart-item").forEach((button) => {
    button.addEventListener("click", () => removeFromCart(Number(button.dataset.id)));
  });
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
    <div class="modal-product-image">
      <img src="${product.image}" alt="${product.title}" />
    </div>
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
      <div class="product-tags modal-tags">
        ${(product.tags || []).map((tag) => `<span>${tag}</span>`).join("")}
      </div>
      <div class="modal-price-row">
        <div>
          <span class="price">${money(product.price)}</span>
          ${product.oldPrice ? `<small>${money(product.oldPrice)}</small>` : ""}
        </div>
        <button class="add-btn" id="modalAddToCart">Sepete Ekle</button>
      </div>
    </div>
  `;

  productModal.classList.add("open");
  overlay.classList.add("open");
  productModal.setAttribute("aria-hidden", "false");

  document.getElementById("modalAddToCart").addEventListener("click", () => {
    closeProductModal();
    addToCart(productId);
  });
}

function closeProductModal() {
  productModal.classList.remove("open");
  productModal.setAttribute("aria-hidden", "true");
  modalProductId = null;
  if (!cartDrawer.classList.contains("open")) {
    overlay.classList.remove("open");
  }
}


function cartTotalValue() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function openCheckout() {
  if (!cart.length) {
    openCart();
    return;
  }
  if (checkoutTotal) checkoutTotal.textContent = money(cartTotalValue());
  checkoutModal?.classList.add("open");
  overlay.classList.add("open");
  checkoutModal?.setAttribute("aria-hidden", "false");
}

function closeCheckout() {
  checkoutModal?.classList.remove("open");
  checkoutModal?.setAttribute("aria-hidden", "true");
  if (!cartDrawer.classList.contains("open") && !productModal.classList.contains("open")) {
    overlay.classList.remove("open");
  }
}

function buildDetailedWhatsAppMessage() {
  const name = document.getElementById("customerName")?.value || "";
  const phone = document.getElementById("customerPhone")?.value || "";
  const address = document.getElementById("customerAddress")?.value || "";
  const lines = cart.map((item) => `- ${item.title} (${item.weight}) x ${item.qty}: ${money(item.price * item.qty)}`);
  const total = money(cartTotalValue());

  return encodeURIComponent(
    `Merhaba, Akgün Erzincan Tulum Peyniri sitesinden demo sipariş vermek istiyorum.\n\n` +
    `Müşteri: ${name}\nTelefon: ${phone}\nAdres: ${address}\n\n` +
    `Ürünler:\n${lines.join("\n")}\n\nToplam: ${total}`
  );
}

function buildWhatsAppMessage() {
  if (!cart.length) return "Merhaba, ürünler hakkında bilgi almak istiyorum.";

  const lines = cart.map((item) => `- ${item.title} (${item.weight}) x ${item.qty}: ${money(item.price * item.qty)}`);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  return `Merhaba, sipariş vermek istiyorum.%0A%0A${encodeURIComponent(lines.join("\n"))}%0A%0AToplam: ${encodeURIComponent(money(total))}`;
}

categoryFilter.addEventListener("change", () => {
  activeChip = categoryFilter.value;
  renderCategoryChips();
  renderProducts();
});
sortFilter.addEventListener("change", renderProducts);
searchInput?.addEventListener("input", renderProducts);
weightFilter?.addEventListener("change", renderProducts);
stockFilter?.addEventListener("change", renderProducts);
cartOpen.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
overlay.addEventListener("click", () => {
  closeProductModal();
  closeCheckout();
  closeCart();
});
modalClose?.addEventListener("click", closeProductModal);
checkoutButton?.addEventListener("click", openCheckout);


checkoutClose?.addEventListener("click", closeCheckout);
checkoutWhatsapp?.addEventListener("click", () => {
  window.open(`https://wa.me/905000000000?text=${buildDetailedWhatsAppMessage()}`, "_blank");
});
checkoutForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  alert("Demo sipariş oluşturuldu. Gerçek ödeme alınmadı. Sipariş özeti WhatsApp’a aktarılabilir.");
});

menuToggle.addEventListener("click", () => {
  mainNav.classList.toggle("open");
  headerActions.classList.toggle("open");
});

renderCategoryChips();
renderFeaturedProducts();
renderProducts();
renderCart();
