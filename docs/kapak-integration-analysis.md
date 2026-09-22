# Kapak Sitesi Entegrasyon Analizi ve Planlaması

## 1. Mevcut Yapı Analizi (Kapak Sitesi)
- **Teknoloji:** Kapak sitesi Vanilla JS ve `three.js` kullanılarak, herhangi bir ağır framework (React/Vue vb.) olmadan geliştirilmiştir (`type: "module"` yapısıyla).
- **Sayfalar:** `index.html`, `configurator.html` (yönlendirici), `konfigurator/index.html` (ana uygulama).
- **Konfigüratör Yapısı:** Uygulama tek bir kapağı (door) incelemek üzere yüksek düzeyde özelleştirilmiştir. UI ve 3D kamera açıları bu spesifik kullanıma göre (yakın çekim, basit model yükleme) ayarlanmıştır (`js/ui.js` ve `js/viewer.js`).
- **Asset/Model Yükleme:** Modeller GLTF formatında dinamik olarak yüklenmektedir. Çevre ışığı olarak halihazırda hedeflenen `assets/hdr/photo_studio_01_1k.hdr` dosyası kullanılmaktadır.

## 2. Entegrasyon Seçenekleri
Geliştirilecek olan PhotoMobilya (ADEKO mutfak görüntüleyici) için aşağıdaki seçenekler değerlendirilmiştir:

1. **Bağımsız Uygulama / Alt Dizin (Örn: `/mutfak-goruntuleyici/`):** Görüntüleyicinin kendi başına bir web uygulaması olarak Kapak sitesinin bir alt dizininde barındırılması.
2. **Iframe Entegrasyonu:** Kapak sitesindeki herhangi bir mevcut sayfaya (örn: proje detay sayfası) `<iframe src="...">` ile gömülmesi.
3. **Mevcut Koda Doğrudan Ekleme:** Mevcut `konfigurator` koduna yeni bir mod olarak eklenmesi.

## 3. Önerilen Yöntem: Bağımsız Uygulama (Ayrı Sayfa / Alt Dizin)
Entegrasyon için **Bağımsız Uygulama** yöntemi önerilmektedir.

### Nedenleri:
- **Bağımsızlık (Separation of Concerns):** Tek bir kapağı göstermekle, iç mekanda gezinilebilir tam bir ADEKO mutfak projesini göstermek birbirinden tamamen farklı kamera kontrolleri, UI gereksinimleri ve ışık ayarları gerektirir. Mevcut koda doğrudan eklemek ciddi karmaşıklık ve hata riski doğurur.
- **Kolay Geliştirme:** "Önce PhotoMobilya içinde bağımsız geliştirilecek" hedefine en uygun yöntemdir. Geliştirme bitince uygulamanın statik çıktısının bir klasör olarak Kapak sunucusuna kopyalanması yeterlidir.

### Veri Akışı ve Dosya Konumları:
- **Modeller:** ADEKO'dan çıkacak `GLTF/GLB` mutfak projeleri, sunucuda ayrı bir dizinde (`/assets/adeko-projeler/`) tutulabilir ve görüntüleyiciye URL parametresiyle (`?proje=ornek-mutfak`) aktarılabilir.
- **HDRI:** PhotoMobilya ilk aşamada kendi deposunda `Photo Studio 1` 1K HDRI dosyasının bir kopyasını kullanır. Kapak sitesine taşındığında, mevcut `/assets/hdr/photo_studio_01_1k.hdr` dosyasına referans verilebilir.

### Performans ve Mobil Uyumluluk Riskleri:
- **Poligon Sayısı:** Kapak modelleri hafiftir ancak tam bir ADEKO mutfak projesi devasa boyutlarda olabilir. Mobil cihazlarda tarayıcı çökme riskini engellemek için dışa aktarılan modellerin optimize edilmiş (decimated, texture compression) olması şarttır.
- **Yükleme Süresi:** Dosya boyutları büyük olacağı için ilerleme çubuğu olan şeffaf ve net bir yükleme ekranı (Loader) tasarlanmalıdır.

## Sonuç ve İlk Adım
PhotoMobilya tamamen bağımsız bir Vanilla JS projesi (veya hafif bir derleyici ile) olarak ayağa kaldırılmalıdır. İlk adım olarak; Three.js yüklü, basit bir OrbitControls kamerasına ve HDRI ışığına sahip temiz bir web ortamı kurulması gerekmektedir.
