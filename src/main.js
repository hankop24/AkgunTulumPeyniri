import { initStorefront } from "./ui/storefront.js";

function showStorefrontError(error) {
  console.error("Mağaza başlatılamadı:", error);
  const loader = document.getElementById("storefrontLoader");
  if (loader) {
    loader.innerHTML = `
      <div class="storefront-error">
        <strong>Site verileri yüklenemedi.</strong>
        <span>Lütfen internet bağlantını kontrol edip sayfayı yenile. Sorun devam ederse yöneticiyle iletişime geç.</span>
      </div>
    `;
  }
}

initStorefront().catch(showStorefrontError);
