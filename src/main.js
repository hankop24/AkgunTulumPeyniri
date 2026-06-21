import { initStorefront } from "./ui/storefront.js";

initStorefront().catch((error) => {
  console.error("Mağaza başlatılamadı:", error);
});
