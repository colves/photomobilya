# ADEKO → GLB Dönüşüm Hattı Analizi

Bu belge, ADEKO ile çizilmiş 3D mutfak projelerinin PhotoMobilya web görüntüleyicisinde sorunsuz çalışabilmesi için `.glb` formatına nasıl dönüştürüleceğini ve optimize edileceğini analiz eder.

## Kesin Olarak Bilinenler
- ADEKO, temel olarak AutoCAD (CAD) altyapısına sahip bir mutfak tasarım programıdır ve birincil dışa aktarma formatı **DWG/DXF**'dir.
- ADEKO projelerinin 3ds Max veya SketchUp gibi yazılımlara render (V-Ray/Corona) amacıyla aktarıldığı bilinen ve sıkça uygulanan bir sektörel standarttır.
- Web ortamında WebGL / Three.js ile en verimli, hızlı ve modern kullanım sağlayan 3D formatı **GLB/GLTF**'dir. İçerisinde mesh, kaplama (texture) ve materyal ayarlarını (PBR) tek dosyada tutabilir.
- Web tabanlı bir 3D görüntüleyici, milyonlarca poligonluk render odaklı CAD modellerini doğrudan kaldıramaz; optimizasyon (decimation) ve doku sıkıştırması (texture baking/compression) şarttır.

## Doğrulanması Gerekenler
- Güncel ADEKO sürümünüzün (örn: ADEKO 17, 22 vb.) doğrudan **FBX, OBJ veya 3DS** dışa aktarım menüsü (Dosya > Dışa Aktar) olup olmadığı *(doğrulanmalı)*. Eğer varsa, aracı program iş yükü ciddi oranda azalacaktır.
- ADEKO'dan çıkan 3D modellerde kaplamaların (texture) ve UV haritalarının dışarı aktarılan dosyayla birlikte klasöre çıkıp çıkmadığı *(doğrulanmalı)*. 

## Seçenekler

### Seçenek 1: Ara Yazılımsız / Hızlı Dönüşüm (Eğer ADEKO destekliyorsa)
- **Gerekli Programlar:** ADEKO (FBX/OBJ çıktısı verebiliyorsa) + Herhangi bir ücretsiz web GLB Converter (veya Windows 3D Builder).
- **Yöntem:** ADEKO'dan OBJ/FBX çıktısı alınır, web tabanlı bir çeviriciyle GLB'ye dönüştürülür.
- **Riskler:** Kaplamalar kaybolabilir, sahne ölçeği (scale) bozulabilir ve poligon sayısı çok yüksek olduğu için tarayıcıda kasma yapabilir.

### Seçenek 2: Blender Üzerinden Manuel Dönüşüm (Dengeli ve Ücretsiz)
- **Gerekli Programlar:** ADEKO + Blender (Ücretsiz).
- **Yöntem:** ADEKO'dan FBX, OBJ veya DWG (eklenti ile) çıkarılıp Blender'a alınır. Blender'da materyaller PBR (Principled BSDF) formatına göre düzenlenir. "Decimate" modifier ile poligon sayısı düşürülür ve doğrudan `.glb` olarak dışa aktarılır.
- **Riskler:** Mutfak modelini hazırlayan kişinin her proje için Blender'da 5-10 dakika manuel düzeltme yapmasını gerektirir.

### Seçenek 3: 3ds Max ve Scripting ile Otomasyon (Profesyonel)
- **Gerekli Programlar:** ADEKO + 3ds Max (veya Maya).
- **Yöntem:** DWG/FBX dosyası 3ds Max'e alınır. Max üzerinde yazılacak bir MaxScript veya Python aracı (tool) ile gelen malzemeler otomatik olarak PBR'a çevrilir, poligonlar optimize edilir (ProOptimizer) ve Babylon.js exporter / glTF Exporter ile tek tıkla `.glb` üretilir.
- **Riskler:** Lisans maliyeti (3ds Max) ve ilk kurulumda kod/script yazma maliyeti gerektirir.

## Tavsiye Edilen İlk Yol (Prototip İçin)
**Blender ile Manuel Dönüşüm (Seçenek 2).** 
İlk denemelerde kod yazmadan veya pahalı lisanslar almadan, Blender'ın mükemmel GLTF/GLB desteği kullanılarak en sağlıklı sonuç elde edilebilir. 
1. ADEKO'dan modeli `FBX` veya `OBJ` olarak kaydedin.
2. Blender'a (File > Import) alın.
3. Kaplamaları basitçe kontrol edip (Gerekirse Image Texture bağlayarak) `File > Export > glTF 2.0 (.glb)` seçeneğiyle dışa aktarın.

## Uzun Vadeli Yol (Üretim İçin)
Eğer sistem günde onlarca proje çıkaracaksa; **3ds Max Batch Scripting** veya **Blender Python API (Headless)** ile arka planda çalışan otomatik bir dönüşüm hattı (pipeline) kurulmalıdır. Tasarımcı ADEKO'dan çıktıyı bir klasöre atar, arka plandaki script onu otomatik küçültüp, web'e hazır GLB'ye çevirir ve sunucuya (`assets/models/`) yükler.

## Web Optimizasyon Hedefleri
Sorunsuz bir müşteri deneyimi ve hızlı yükleme (mobil dâhil) için hedeflenmesi gereken GLB kalite standartları:
- **Dosya Boyutu:** Maksimum `15 MB` (İdeal: `5-10 MB`).
- **Poligon Sayısı:** Bütün mutfak için `100.000 - 300.000` üçgen (triangle) sınırını aşmamalı.
- **Doku Çözünürlüğü:** Ahşap ve tezgah detayları hariç, büyük yüzeyler için `1024x1024` veya `512x512` çözünürlük yeterlidir. `4K` kaplamalar web için gereksizdir.
- **Doku Sıkıştırması:** Kesinlikle **Draco Compression** veya **KTX2/BasisU** doku sıkıştırma algoritmaları kullanılarak GLB boyutu yarı yarıya düşürülmelidir.
- **Yükleme Süresi:** Ortalama bir 4G bağlantısıyla sahnede modelin görülmesi 3-5 saniyeyi geçmemelidir.

## İlk Gerçek Model Test Planı
1. Müşteriniz/Tasarımcınız standart ölçülerde bir ADEKO mutfağı çizer.
2. ADEKO'dan dışa aktarma (Export) seçenekleri denenir (hangi formatlar destekleniyor).
3. Kaplamalı (texture) bir dışa aktarım, Blender veya 3ds Max üzerinden `.glb`'ye dönüştürülür.
4. Çıkan dosya PhotoMobilya'ya (`index.html?model=...`) yüklenir. Renkler, ölçek (scale) ve kamera davranışları test edilir.

## Kaynaklar
- [1] ADEKO 3D dışa aktarma yetenekleri ve 3ds Max/Sketchup entegrasyonu (YouTube, DonanımHaber tartışmaları, Sektörel Kullanım).
- [2] WebGL ve Three.js Resmi Dokümantasyonu (GLB formatının PBR ve web optimizasyonu üzerine üstünlüğü).
- [3] Khronos Group glTF 2.0 Best Practices (Draco/KTX2 optimizasyonu).
