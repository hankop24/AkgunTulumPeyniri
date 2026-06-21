# Akgün Erzincan Tulum Peyniri - E-Ticaret + Admin Panel

Bu sürüm mevcut tasarım çizgisi korunarak katmanlı/profesyonel dosya yapısına taşınmıştır.

## Dosya Yapısı

- `index.html`: Müşteri tarafı tek sayfa mağaza
- `styles.css`: Mevcut mağaza tasarımı
- `src/config`: kategori ve storage anahtarları
- `src/data`: varsayılan ürün ve site ayarları
- `src/services`: ürün/site ayarı okuma-yazma servisleri
- `src/utils`: format ve yardımcı fonksiyonlar
- `src/ui`: mağaza arayüzünü oluşturan kod
- `admin/`: ürün, fiyat, stok, kampanya ve site ayarları paneli
- `assets/`: logo ve ürün görselleri

## Admin Panel

`admin/index.html` dosyasını açarak ürünleri, fiyatları, stokları, rozetleri, öne çıkan ürünleri, WhatsApp numarasını, ücretsiz kargo limitini ve ana sayfa metinlerini düzenleyebilirsin.

Bu statik sürüm verileri tarayıcıdaki `localStorage` alanında tutar. Aynı tarayıcıda siteyi açtığında değişiklikleri görürsün. Gerçek canlı yönetim için ileride Firebase/Supabase veya özel backend bağlanmalıdır.

## Yayınlama

Statik dosyalar Netlify/Vercel/GitHub Pages üzerinde doğrudan yayınlanabilir. Build command gerekmez, publish directory proje köküdür.
