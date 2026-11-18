# RAPOR · v1 · 18 Kasım 2026

## Ne yapıldı

Mevcut sitenin 65 Türkçe sayfasının tamamı, aynı adreslerle, yeni tasarımda kuruldu.

- **Ana sayfa:** kaydırmaya bağlı 3B implant filmi. Giriş, üç parçaya ayrılma (etiketli), vida yakın planı,
  diş dizisi ve tarama, vidanın yerine inmesi, kronun oturması. Model dosyası yok; implant, kron ve diş eti
  kodla çizilir. Altında logodaki gülümseme kendini çizer.
- **Diğer bölümler:** implant ailesi (4 kart), yatay kayan tedavi galerisi (8 kart), 24 tedavinin listesi,
  bilgi merkezi, turuncu yaklaşım bölümü (kelime kelime beliren söz, sayılar), klinik görselleri, ulaşım,
  hekimler, 16 yorum özeti, çalışma ortakları, iletişim ve randevu formu.
- **Alt sayfalar:** Kurumsal, Hakkımızda, Tedaviler, 24 tedavi, Kadromuz, 8 hekim, İletişim, 2 şube,
  Bilgi Merkezi, 21 yazı, Anlaşmalı Kurumlar, Kullanım Koşulları, Çerez Politikası.

## Referansla karşılaştırma

| Referans sitede | Bizde |
|---|---|
| Üst bant (İzmir · Bayraklı, adres, telefon) | Var |
| Menü: Ana Sayfa, Kurumsal (5 alt başlık), Tedaviler, Kadromuz, İletişim | Var, aynı sıra |
| Dil menüsü (8 dil) | Menü var; yabancı diller şimdilik mevcut sitedeki sayfaya gider (açık konu 1) |
| Tema seçici (8 tema) | Var. Varsayılan tema logonun renkleri |
| Seslendirme düğmesi | Var (mevcut Türkçe kayıt) |
| Şube seçmeli WhatsApp penceresi | Var |
| Giriş slaytı (10 tedavi, ulaşım, poliklinik) | İçeriğin hepsi var; slayt yerine 3B film + galeri + bölümler |
| Telefon, WhatsApp, Tanıtım filmi düğmeleri | Var |
| Tedavilerimiz, Tüm tedaviler | Var |
| "Sağlığınız için doğru adım" afişi, Bilgi Merkezi tanıtımı | Var |
| Kadromuz (7 hekim, profil bağlantılı) | Var |
| "Sağlığınız için buradayız", 360° sanal tur | Var (pencerede açılır) |
| Hasta yorumları (16 özet, Google bağlantısı) | Var |
| Çalışma ortakları, iletişim, alt bilgi bağlantıları | Var |
| Çerez tercihleri, harita ve video izni | Var |
| 65 Türkçe sayfa | 65 sayfa, adresler birebir aynı |

## Doğrulama (bu bilgisayarda, başsız Edge ile)

- `python kontrol.py tara`: 65 sayfa, masaüstü + telefon. Konsol hatası, kırık bağlantı, eksik görsel, yatay taşma: 0.
- `python araclar/islev_testi.py`: 29 testin 29'u geçti (menüler, pencereler, form, tema, çerez, seslendirme, 3B yedeği).
- Film masaüstünde (1440) ve telefonda (390) adım adım çekilip gözle kontrol edildi.

Doğrulanmadı:
- Gerçek telefonda (Tecno) denenmedi. Kare hızı yalnız bu bilgisayarın ekran kartında ölçüldü.
- Safari / iPhone denenmedi.

## Açık konular

1. **Yabancı diller.** Referansta 7 yabancı dilin her birinde ayrı sayfalar var. Yeni tasarıma çevrilmedi;
   dil menüsü mevcut sitedeki karşılığına gidiyor. Site aynı alan adına taşınırsa bu bağlantılar kırılır.
2. **Metinler yeniden yazıldı.** Mevcut sitenin metinleri kopyalanmadı; aynı başlıklar altında kısa ve
   temkinli yeni metinler yazıldı. Sağlık metni olduğu için kliniğin onayından geçmeli. Özgün metinler
   istenirse içerik dosyalarına elle aktarılabilir.
3. **Yorum özetlerinde soyadlar baş harfe indirildi** (referansta tam ad). İstenirse `icerik_genel.py` içinden değişir.
4. **Hekim bilgileri** mevcut sitedeki bilgilerdir ("10.000'in üzerinde implant" dahil); klinikten teyit edilmedi.
5. **Ölçüm etiketleri yok.** Önizleme olduğu için Google Analytics ve reklam dönüşüm etiketleri eklenmedi.
6. **Yayın yeri ve alan adı** kararlaştırılmadı. Sayfalarda `noindex` var.

## Mevcut siteden alınanlar

- 61 görsel, 3,7 MB (`kaynak/mevcut_site_gorseller/`)
- Türkçe seslendirme, 1 dosya, 2,7 MB (`kaynak/mevcut_site_ses/`)
- Dil adres tablosu (`uret/dil_yollari.json`)
