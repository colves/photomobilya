# Mutfak Deneme 1 — GLB Yapı İncelemesi

Bu rapor, yerel olarak test edilen `mutfakdeneme1.glb` mutfak modelinin iç yapısını analiz ederek, bir sonraki aşamada yapılacak malzeme (materyal) atama stratejisini belirlemek için hazırlanmıştır.

## Dosya Özeti
- **Dosya Adı:** mutfakdeneme1.glb
- **Dosya Boyutu:** ~340 KB
- **Toplam Düğüm (Node):** 143
- **Toplam Mesh:** 46
- **Toplam Üçgen (Triangle):** 5,736 (Web için olağanüstü derecede iyi bir optimizasyon).

## Sahne ve Obje Yapısı
GLB dosyası içerisinde mutfağı oluşturan her bir parça belirli hiyerarşik gruplar (nodes) halinde tanımlanmış. Her obje bir blok adı (Örn: `Block:KCK-0447X0185$1`) ve bu bloğun bağlı olduğu bir Mesh taşıyor. Mesh isimleri, AutoCAD (ADEKO) katman sistemini yansıtacak şekilde çok düzenli isimlendirilmiş.

## Materyal ve Doku Durumu
- **Materyal Sayısı:** 0
- **Doku (Texture/Image) Sayısı:** 0
- Dosya tamamen saf geometriden ibarettir (geometry-only). Bu durum, ADEKO'dan (veya aracı 3ds Max / Blender programından) malzeme verisinin veya kaplamaların aktarılmadığını veya kasten çıkarıldığını gösteriyor.

## Ölçek Gözlemi
- **Bounding Box Min:** (-0.29, -0.11, -0.20)
- **Bounding Box Max:** (0.29, 0.11, 0.20)
- **Model Boyutları:** X: 0.58, Y: 0.23, Z: 0.41 (Birim)
- **Sonuç:** Mutfak tavan yüksekliği genellikle 2.3 metre civarındadır (Y eksenindeki 0.23 birim ile uyuşuyor). Modelin boyutlarının 5.8 metre x 4.1 metre olduğu düşünülürse, model **1 Birim = 10 Metre** olacak şekilde (yani orijinal boyutun onda biri küçüklüğünde) dışa aktarılmış görünüyor. Web'de gösterirken modelin `scale.set(10, 10, 10)` ile çarpılarak standart metre birimine getirilmesi gerekecektir.

## Bileşen Sınıflandırması
Mesh isimlerindeki etiketler (Layer) mutfak parçalarını çok temiz biçimde sınıflandırıyor:
- `Layer:FLOOR` (Zemin)
- `Layer:CEILING` (Tavan)
- `Layer:WALLS` (Duvarlar)
- `Layer:WORKTOPS` (Tezgâh)
- `Layer:CAB_DOORS` (Dolap Kapakları)
- `Layer:CAB_BODY_BASE` / `Layer:CAB_BODY_WALL` (Alt ve Üst Dolap Gövdeleri)
- `Layer:PLINTH_LEGS` / `Layer:PLINTHS` (Baza ve Ayaklar)
- `Layer:HANDLES_AND_KNOBS` (Kulplar)
- `Layer:APPLIANCES` / `Layer:APP_BODY_BASE` (Beyaz Eşyalar ve Gövdeleri)
- `Layer:ARMATURE` / `Layer:SINKS` (Eviye ve Batarya)
- `Layer:DOOR_WINDOW` / `Layer:WINDOW_GLASSES` (Kapı, Pencere ve Camları)
- `Layer:CAB_DOOR_GLASS` / `Layer:SHELVES_GLASS` (Cam Kapaklar ve Cam Raflar)

## PhotoMobilya İçin Malzeme Eşleme Önerisi
Modelde gömülü malzeme ve kaplama bulunmadığından, kaplama işlemi tamamen dinamik kodla (Three.js) yapılmalıdır.
**Önerilen Yöntem:**
1. PhotoMobilya içerisinde bir "Materyal Kütüphanesi" (Material Library) objesi oluşturulmalı (Örn: Mat Ahşap, Parlak Beyaz, Metal, Cam, Tezgâh Mermeri).
2. Model yüklendiğinde `.traverse()` fonksiyonu ile tüm meshler dönülmeli.
3. Mesh adı `CAB_DOORS` içeriyorsa ona kapak materyali, `HANDLES_AND_KNOBS` içeriyorsa metal kulp materyali, `WINDOW_GLASSES` içeriyorsa şeffaf cam materyali atanmalıdır.
4. Bu yöntem, uygulamanın ileride "Kapak Rengini Değiştir" gibi interaktif varyant (configurator) özelliklerini eklemeyi inanılmaz derecede kolaylaştıracaktır.

## Performans Riski
- **Poligon Açısından:** Hiçbir risk yok. 5,736 üçgen (triangle) mobil cihazlarda bile 60 FPS (kare/saniye) garanti edecek kadar düşüktür.
- **Malzeme Açısından:** GLB dosyasında 0 materyal var, yani dosya çok hafif (340KB). Malzemeler kod tarafında ekleneceği için yükleme süresi çok hızlı olacaktır. Eğer ileride PBR (kaliteli) ahşap/mermer resimleri (texture) Three.js ile sonradan indirtilirse, bu resimlerin dosya boyutuna dikkat edilmelidir.

## Sonraki Uygulama Adımı
1. Görüntüleyici kodunda, model yüklendiği anda (traverse edilirken) mesh isimlerine (Layer) göre standart (geçiçi) renk/materyal atayacak bir haritalama (Material Mapping) sisteminin kodlanması.
2. Modelin ekranda doğru ölçülerde (1.6m göz hizası vs.) gezilebilmesi için `scale.set(10, 10, 10)` çarpımının modele eklenmesi.
