# 3D Modeller

Bu dizin, uygulamanın URL parametresiyle (`?model=assets/models/...`) yükleyeceği 3D mutfak modellerini barındırır.

## Model Yükleme Kuralları ve Öneriler:

- **Format:** Modellerin tek parçalı `.glb` formatında olması önerilir. `.gltf` formatı çalışır ancak ek dosyalara (`.bin`, dokular) ihtiyaç duyduğu için aktarımı daha zordur.
- **Optimizasyon:** Web performansı için modeller dışa aktarılmadan önce optimize edilmelidir. Poligon sayısı düşürülmeli (decimation) ve görünmeyen kısımlar silinmelidir.
- **Dokular:** Mümkün olan tüm kaplamaların (textures) `GLB` dosyasının içine gömülü (embedded) ve sıkıştırılmış olması gerekir. Yüksek çözünürlüklü dokular mobil cihazlarda bellek yetersizliğine neden olabilir.
- **Dosya Yolu:** URL ile açılacak tüm statik mutfak modelleri bu klasör (`assets/models/`) altında tutulmalıdır.
