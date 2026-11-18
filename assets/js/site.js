/* Vatan Dental Center · site.js
   Bölümler: araçlar · izin (çerez) · pencereler (WhatsApp, tema, sanal tur/film) · seslendirme · menü ·
   kaydırma (Lenis + GSAP) · girişler · ana sayfa (implant filmi, yatay galeri) · formlar.
   Her bölüm kendi içinde korunur: biri hata verirse diğerleri çalışmaya devam eder. */
(function () {
  'use strict';
  var kok = document.documentElement;
  var betik = document.currentScript;
  var TABAN = betik && betik.src ? betik.src.replace(/site\.js.*$/, '') : 'assets/js/';
  var V = window.VATAN || {};
  var hareketAz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dokunmatik = window.matchMedia('(pointer: coarse)').matches;
  var q = function (s, c) { return (c || document).querySelector(s); };
  var qa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var sm = function (a, b, x) { var t = (x - a) / (b - a); t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); };
  var iki = function (n) { return (n < 10 ? '0' : '') + n; };
  var lenis = null;
  var gsapVar = !!(window.gsap && window.ScrollTrigger);
  function dene(ad, f) { try { f(); } catch (e) { if (window.console) console.error('[vatan] ' + ad, e); kok.classList.add('hepsi-acik'); } }
  if (!gsapVar || hareketAz) kok.classList.add('hepsi-acik');

  /* ---------- izin (çerez ve dış içerik) ---------- */
  var IZIN = 'vatan-cerez', izin = null;
  function izinOku() { try { var v = JSON.parse(localStorage.getItem(IZIN)); if (v && Date.now() - v.t < 180 * 864e5) return v; } catch (e) {} return null; }
  function haritaYukle(el) {
    if (el.dataset.yuklu) return; el.dataset.yuklu = '1';
    var f = document.createElement('iframe'); f.src = el.dataset.harita; f.title = el.dataset.baslik || 'Harita'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
    el.appendChild(f); var bos = q('.harita-bos', el); if (bos) bos.hidden = true;
  }
  function izinUygula() {
    if (izin && izin.dis) qa('.harita[data-harita]').forEach(haritaYukle);
    // Site analizi: yayına alınırken ölçüm etiketleri yalnız `izin.analiz` doğruysa burada yüklenir. Önizlemede ölçüm yoktur.
  }
  function izinYaz(dis, analiz) { izin = { dis: !!dis, analiz: !!analiz, t: Date.now() }; try { localStorage.setItem(IZIN, JSON.stringify(izin)); } catch (e) {} izinUygula(); return izin; }
  dene('izin', function () {
    izin = izinOku();
    var kutu = q('#cerez'); if (!kutu) return;
    var ayar = q('#cerez-ayar'), dis = q('#cerez-dis'), analiz = q('#cerez-analiz'), ayarDugme = q('[data-cerez="ayar"]', kutu);
    function goster(ayarAcik) { dis.checked = !!(izin && izin.dis); analiz.checked = !!(izin && izin.analiz); ayar.hidden = !ayarAcik; ayarDugme.textContent = ayarAcik ? 'Tercihlerimi kaydet' : 'Tercihler'; kutu.hidden = false; }
    kutu.addEventListener('click', function (e) {
      var d = e.target.closest('[data-cerez]'); if (!d) return;
      var ne = d.dataset.cerez;
      if (ne === 'kabul') izinYaz(true, true); else if (ne === 'ret') izinYaz(false, false);
      else if (ayar.hidden) { goster(true); return; } else izinYaz(dis.checked, analiz.checked);
      kutu.hidden = true;
    });
    qa('[data-cerez-ac]').forEach(function (b) { b.addEventListener('click', function () { goster(true); }); });
    document.addEventListener('click', function (e) { var b = e.target.closest('[data-harita-ac]'); if (!b) return; izinYaz(true, izin ? izin.analiz : false); kutu.hidden = true; });
    window.vatanCerezGizle = function () { kutu.hidden = true; };
    if (!izin) setTimeout(function () { if (!izin) goster(false); }, 1800);
    izinUygula();
  });

  /* ---------- pencereler ---------- */
  function pencereAc(p) { if (p.showModal) { if (!p.open) p.showModal(); } else p.setAttribute('open', ''); if (lenis) lenis.stop(); }
  dene('pencere', function () {
    document.addEventListener('click', function (e) { var k = e.target.closest('[data-kapat]'); if (k) { var d = k.closest('dialog'); if (d) d.close(); } });
    qa('dialog.pencere').forEach(function (d) {
      d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
      d.addEventListener('close', function () { if (lenis) lenis.start(); });
    });
  });

  var mobilKapat = function () {};
  dene('tema', function () {
    var p = q('#tema-pencere'); if (!p) return;
    var dugmeler = qa('.tema-sec', p), meta = q('meta[name="theme-color"]');
    function isaret() { var su = kok.getAttribute('data-tema') || 'vatan'; dugmeler.forEach(function (d) { d.setAttribute('aria-pressed', d.dataset.temaId === su ? 'true' : 'false'); }); if (meta) meta.content = getComputedStyle(kok).getPropertyValue('--zemin').trim() || '#FAF6EF'; }
    function uygula(id) { if (!id || id === 'vatan') kok.removeAttribute('data-tema'); else kok.setAttribute('data-tema', id); try { localStorage.setItem('vatan-tema', id || 'vatan'); } catch (e) {} isaret(); }
    dugmeler.forEach(function (d) { d.addEventListener('click', function () { uygula(d.dataset.temaId); }); });
    q('#tema-sifirla').addEventListener('click', function () { uygula('vatan'); });
    qa('#tema-dugme,[data-tema-ac]').forEach(function (b) { b.addEventListener('click', function () { mobilKapat(); pencereAc(p); }); });
    isaret();
  });

  dene('whatsapp', function () {
    var p = q('#wa-pencere'); if (!p) return;
    var form = q('#wa-form'), ozet = q('#wa-ozet'), konu = q('#wa-konu'), konuAlan = q('#wa-konu-alan'), mesaj = q('#wa-mesaj'), etiket = q('#wa-mesaj-etiket'), durum = q('#wa-durum'), giris = q('#wa-giris');
    var randevu = null;
    function ac(sec) {
      sec = sec || {}; randevu = sec.randevu || null; durum.textContent = ''; mesaj.value = ''; konu.value = '';
      qa('input[name="wa-sube"]', form).forEach(function (r) { r.checked = !!(randevu && randevu.sube && r.value === randevu.sube); });
      if (randevu) {
        ozet.hidden = false; konuAlan.hidden = true; etiket.textContent = 'Ek mesajınız (isteğe bağlı)';
        giris.textContent = 'Form bilgileriniz korunur. Devam etmek için şubenizi seçin.';
        ozet.textContent = 'Randevu talebiniz\nAd Soyad: ' + randevu.ad + '\nTelefon: ' + randevu.tel + '\nTercih edilen tarih: ' + (randevu.tarih || 'Belirtilmedi') + '\nTedavi alanı: ' + (randevu.tedavi || 'Belirtilmedi');
      } else {
        ozet.hidden = true; konuAlan.hidden = false; etiket.textContent = 'Mesajınız'; giris.textContent = 'Şubenizi seçin, ardından mesajınızı hazırlayın.';
        if (sec.konu) { konu.value = 'Tedavi hakkında bilgi'; mesaj.value = sec.konu + ' hakkında bilgi almak istiyorum.'; }
      }
      pencereAc(p);
    }
    document.addEventListener('click', function (e) { var a = e.target.closest('[data-wa]'); if (!a) return; e.preventDefault(); mobilKapat(); ac({ konu: a.dataset.waKonu }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var sube = q('input[name="wa-sube"]:checked', form), ek = mesaj.value.trim(), metin;
      if (!sube) { durum.textContent = 'Lütfen bir şube seçin.'; return; }
      if (randevu) {
        metin = 'Merhaba, randevu talebi oluşturmak istiyorum.\nŞube: ' + sube.value + ' Şubesi\nAd Soyad: ' + randevu.ad + '\nTelefon: ' + randevu.tel + '\nTercih edilen tarih: ' + (randevu.tarih || 'Belirtilmedi') + '\nTedavi alanı: ' + (randevu.tedavi || 'Belirtilmedi') + (ek ? '\nMesaj: ' + ek : '');
      } else {
        if (!ek) { durum.textContent = 'Lütfen mesajınızı yazın.'; mesaj.focus(); return; }
        metin = 'Merhaba, ' + sube.value + ' Şubesi için yazıyorum.' + (konu.value ? '\nKonu: ' + konu.value : '') + '\nMesaj: ' + ek;
      }
      window.open('https://api.whatsapp.com/send?phone=' + V.wa + '&text=' + encodeURIComponent(metin), '_blank', 'noopener');
      if (randevu && randevu.bitti) randevu.bitti();
      p.close();
    });
    window.vatanWa = ac;
  });

  dene('medya', function () {
    var p = q('#medya-pencere'); if (!p) return;
    var ekran = q('#medya-ekran'), dis = q('#medya-dis'), baslik = q('#medya-baslik');
    function ac(tur) {
      var adres = tur === 'tur' ? V.tur : V.film;
      dis.href = adres; baslik.textContent = tur === 'tur' ? 'Vatan Dental Center sanal turu' : 'Vatan Dental Center tanıtım filmi';
      function yukle() {
        ekran.textContent = '';
        var f = document.createElement('iframe');
        f.src = tur === 'tur' ? V.tur : 'https://www.youtube-nocookie.com/embed/' + V.filmId + '?autoplay=1&rel=0';
        f.title = baslik.textContent; f.allow = 'autoplay; fullscreen; picture-in-picture; gyroscope; accelerometer'; f.allowFullscreen = true;
        ekran.appendChild(f);
      }
      if (izin && izin.dis) yukle();
      else {
        ekran.innerHTML = '<div class="medya-izin"><p>Bu içerik dış bir hizmetten yüklenir. Görüntülemek için izin verin ya da aşağıdaki bağlantıdan yeni sekmede açın.</p><button class="dugme dugme-vurgu dugme-k" type="button">İçeriği göster</button></div>';
        q('button', ekran).addEventListener('click', function () { izinYaz(true, izin ? izin.analiz : false); if (window.vatanCerezGizle) window.vatanCerezGizle(); yukle(); });
      }
      pencereAc(p);
    }
    p.addEventListener('close', function () { ekran.textContent = ''; });
    document.addEventListener('click', function (e) { var a = e.target.closest('[data-medya]'); if (!a) return; e.preventDefault(); mobilKapat(); ac(a.dataset.medya); });
  });

  dene('ses', function () {
    var d = q('#ses-dugme'); if (!d) return;
    var ses = null;
    function yaz(calar) { d.setAttribute('aria-pressed', calar ? 'true' : 'false'); var m = calar ? 'Seslendirmeyi duraklat' : 'Seslendirmeyi dinle'; d.setAttribute('aria-label', m); d.title = m; }
    function degis() {
      if (!ses) {
        ses = new Audio(d.dataset.ses); ses.preload = 'none';
        ses.addEventListener('play', function () { yaz(true); }); ses.addEventListener('pause', function () { yaz(false); }); ses.addEventListener('ended', function () { yaz(false); });
        ses.addEventListener('error', function () { yaz(false); d.title = 'Ses dosyası yüklenemedi.'; });
      }
      if (ses.paused) { var s = ses.play(); if (s && s.catch) s.catch(function () { yaz(false); }); } else ses.pause();
    }
    d.addEventListener('click', degis);
    qa('[data-ses-ac]').forEach(function (b) { b.addEventListener('click', degis); });
  });

  /* ---------- üst menü ---------- */
  dene('menu', function () {
    var ust = q('#ust'), ac = q('.menu-ac'), mm = q('#mobil-menu');
    var acilirlar = qa('.acilir');
    function kapatHepsi(haric) { acilirlar.forEach(function (a) { if (a === haric) return; var b = q('button', a), k = q('.acilir-kutu', a); b.setAttribute('aria-expanded', 'false'); k.hidden = true; }); }
    acilirlar.forEach(function (a) {
      var b = q('button', a), k = q('.acilir-kutu', a), zaman;
      function durum(acik) { kapatHepsi(a); b.setAttribute('aria-expanded', acik ? 'true' : 'false'); k.hidden = !acik; }
      // Fareli cihazda üstüne gelince açılır; tıklamak açık tutar (aç-kapa yapıp menüyü kaçırmaz). Dokunmatikte tıklama aç-kapadır.
      b.addEventListener('click', function () { durum(dokunmatik ? k.hidden : true); });
      if (!dokunmatik) {
        a.addEventListener('mouseenter', function () { clearTimeout(zaman); durum(true); });
        a.addEventListener('mouseleave', function () { zaman = setTimeout(function () { durum(false); }, 220); });
      }
      a.addEventListener('focusout', function (e) { if (!a.contains(e.relatedTarget)) durum(false); });
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.acilir')) kapatHepsi(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { kapatHepsi(); mobilKapat(); } });
    if (ac && mm) {
      var mobilDurum = function (acik) {
        ac.setAttribute('aria-expanded', acik ? 'true' : 'false'); mm.hidden = !acik; document.body.style.overflow = acik ? 'hidden' : '';
        if (lenis) { if (acik) lenis.stop(); else lenis.start(); }
        if (acik) { ust.classList.remove('gizli'); ust.classList.add('dolu'); }
        if (acik && gsapVar && !hareketAz) window.gsap.fromTo(qa('nav > *, .mobil-menu-alt', mm), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05 });
      };
      mobilKapat = function () { if (!mm.hidden) mobilDurum(false); };
      ac.addEventListener('click', function () { mobilDurum(mm.hidden); });
      mm.addEventListener('click', function (e) { if (e.target.closest('a')) mobilDurum(false); });
    }
    var son = 0, bekle = false;
    function kaydi() {
      bekle = false;
      var y = window.pageYOffset;
      ust.classList.toggle('dolu', y > 46 || (mm && !mm.hidden));
      if (mm && !mm.hidden) return;
      if (y > 640 && y > son + 6) ust.classList.add('gizli'); else if (y < son - 6 || y < 640) ust.classList.remove('gizli');
      son = y;
    }
    window.addEventListener('scroll', function () { if (!bekle) { bekle = true; requestAnimationFrame(kaydi); } }, { passive: true });
    kaydi();
    var yil = q('#yil'); if (yil) yil.textContent = new Date().getFullYear();
  });

  /* ---------- formlar ---------- */
  dene('form', function () {
    function gun(d) { return d.getFullYear() + '-' + iki(d.getMonth() + 1) + '-' + iki(d.getDate()); }
    qa('.randevu-form').forEach(function (f) {
      var durum = q('.form-durum', f), tarih = q('[name="tarih"]', f);
      tarih.min = gun(new Date());
      qa('[data-gun]', f).forEach(function (b) { b.addEventListener('click', function () { var d = new Date(); d.setDate(d.getDate() + (+b.dataset.gun)); tarih.value = gun(d); }); });
      f.addEventListener('input', function (e) { var a = e.target.closest('.alan'); if (a) a.classList.remove('hata'); });
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var ad = q('[name="ad"]', f), tel = q('[name="tel"]', f), sube = q('[name="sube"]', f), tedavi = q('[name="tedavi"]', f), ilk = null;
        [[ad, ad.value.trim().length >= 3], [tel, tel.value.replace(/\D/g, '').length >= 10], [sube, !!sube.value]].forEach(function (c) { c[0].closest('.alan').classList.toggle('hata', !c[1]); if (!c[1] && !ilk) ilk = c[0]; });
        if (ilk) { durum.textContent = 'Lütfen adınızı, telefon numaranızı ve şubeyi eksiksiz girin.'; ilk.focus(); return; }
        durum.textContent = '';
        var t = tarih.value ? tarih.value.split('-').reverse().join('.') : '';
        var veri = { ad: ad.value.trim(), tel: tel.value.trim(), sube: sube.value, tarih: t, tedavi: tedavi.value, bitti: function () { durum.textContent = 'WhatsApp açıldı. Talebinizin ulaşması için mesajı orada göndermeyi unutmayın.'; } };
        if (window.vatanWa) window.vatanWa({ randevu: veri });
      });
    });
  });

  /* ---------- sayfa içi küçük işler ---------- */
  dene('kayan', function () {
    qa('.kayan-sira').forEach(function (s) { qa('li', s).forEach(function (li) { var k = li.cloneNode(true); k.setAttribute('aria-hidden', 'true'); s.appendChild(k); }); });
  });
  dene('icindekiler', function () {
    var baglar = qa('.icindekiler a'); if (!baglar.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (gir) { gir.forEach(function (g) { if (g.isIntersecting) baglar.forEach(function (a) { a.classList.toggle('aktif', a.getAttribute('href') === '#' + g.target.id); }); }); }, { rootMargin: '-30% 0px -60% 0px' });
    qa('.yazi-bolum[id]').forEach(function (b) { io.observe(b); });
  });

  if (!gsapVar) return;
  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- kaydırma ---------- */
  dene('kaydirma', function () {
    if (window.Lenis && !hareketAz && !dokunmatik) {
      lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]'); if (!a) return;
      var id = a.getAttribute('href'); if (id.length < 2) return;
      var hedef = q(id); if (!hedef) return;
      e.preventDefault(); mobilKapat();
      var pay = id === '#film' || id === '#ust-nokta' ? 0 : -88;
      if (lenis) lenis.scrollTo(hedef, { offset: pay, duration: 1.5 });
      else window.scrollTo({ top: hedef.getBoundingClientRect().top + window.pageYOffset + pay, behavior: hareketAz ? 'auto' : 'smooth' });
    });
    var cubuk = q('.ilerleme span');
    if (cubuk) ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (s) { cubuk.style.transform = 'scaleX(' + s.progress + ')'; } });
  });

  /* ---------- kaydırınca beliren öğeler ---------- */
  dene('girisler', function () {
    if (hareketAz) return;
    qa('[data-satir]').forEach(function (el) {
      el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map(function (p) { return '<span class="st"><span>' + p + '</span></span>'; }).join('');
      var cizgi = q('.alt-cizgi path', el);
      var tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
      tl.to(qa('.st > span', el), { y: 0, duration: 1.15, ease: 'expo.out', stagger: 0.09 });
      if (cizgi) tl.to(cizgi, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.out' }, 0.55);
    });
    ScrollTrigger.batch('[data-gir]', { start: 'top 92%', once: true, onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 0.95, ease: 'power3.out', stagger: 0.07, overwrite: true }); } });
    qa('[data-ac]').forEach(function (el) {
      var img = q('img', el), yuvarlak = getComputedStyle(el).borderTopLeftRadius || '22px';
      var st = { trigger: el, start: 'top 90%', once: true };
      gsap.to(el, { clipPath: 'inset(0% 0% 0% 0% round ' + yuvarlak + ')', duration: 1.4, ease: 'expo.out', scrollTrigger: st, onComplete: function () { el.style.clipPath = 'none'; } });
      if (img) gsap.fromTo(img, { scale: 1.2 }, { scale: 1, duration: 1.8, ease: 'expo.out', scrollTrigger: st });
    });
    qa('.klinik-g img').forEach(function (img) { gsap.fromTo(img, { yPercent: -13 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } }); });
    qa('.gulus-ciz').forEach(function (svg) {
      if (svg.classList.contains('sahne-gulus')) return;
      gsap.to(q('.gulus-iz', svg), { strokeDashoffset: 0, duration: 1.7, ease: 'power2.inOut', scrollTrigger: { trigger: svg, start: 'top 88%', once: true } });
    });
    var vip = q('.vip-gorsel');
    if (vip) gsap.fromTo(vip, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: vip.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    var soz = q('#soz');
    if (soz) {
      soz.innerHTML = soz.textContent.trim().split(/\s+/).map(function (k) { return '<span class="k">' + k + '</span>'; }).join(' ');
      gsap.to(qa('.k', soz), { opacity: 1, ease: 'none', stagger: 0.12, scrollTrigger: { trigger: soz, start: 'top 80%', end: 'bottom 52%', scrub: 0.4 } });
    }
    qa('[data-say]').forEach(function (el) {
      var hedef = +el.dataset.say, o = { v: 0 };
      gsap.to(o, { v: hedef, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true }, onUpdate: function () { el.textContent = Math.round(o.v); } });
    });
    var sayfaG = q('.sayfa-gulus');
    if (sayfaG) gsap.to(sayfaG, { yPercent: 26, rotate: 4, ease: 'none', scrollTrigger: { trigger: sayfaG.parentNode, start: 'top top', end: 'bottom top', scrub: true } });
    var yG = q('.yaklasim-gulus');
    if (yG) gsap.fromTo(yG, { xPercent: 10, yPercent: 14 }, { xPercent: -4, yPercent: -4, ease: 'none', scrollTrigger: { trigger: yG.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ---------- ana sayfa: giriş ---------- */
  dene('giris', function () {
    var bas = q('.giris-baslik'); if (!bas || hareketAz) return;
    var tl = gsap.timeline({ delay: 0.15 });
    tl.to(qa('.satir > span', bas), { y: 0, duration: 1.3, ease: 'expo.out', stagger: 0.11 })
      .to(qa('[data-g]'), { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.09 }, 0.35);
    var g = q('.sahne-gulus .gulus-iz'); if (g) tl.to(g, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, 0.5);
  });

  /* ---------- ana sayfa: yatay galeri ---------- */
  dene('galeri', function () {
    var bolum = q('#galeri'), serit = q('#galeri-serit'); if (!bolum || !serit) return;
    var no = q('#galeri-no'), dolgu = q('#galeri-dolgu'), adet = qa('.g-kart', serit).length;
    function yaz(p) { if (no) no.textContent = iki(Math.min(adet, Math.floor(p * adet) + 1)); if (dolgu) dolgu.style.transform = 'scaleX(' + Math.max(0.08, p) + ')'; }
    var mm = gsap.matchMedia();
    mm.add('(min-width: 1001px)', function () {
      if (hareketAz) return;
      var yol = function () { return Math.max(0, serit.scrollWidth - window.innerWidth); };
      var boy = function () { bolum.style.height = (window.innerHeight + yol() * 0.62) + 'px'; }; // 1 birim dikey kaydırma, 1,6 birim yatay ilerletir
      boy(); ScrollTrigger.addEventListener('refreshInit', boy);
      var tw = gsap.to(serit, { x: function () { return -yol(); }, ease: 'none', scrollTrigger: { trigger: bolum, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true, onUpdate: function (s) { yaz(s.progress); } } });
      qa('.g-gorsel img', serit).forEach(function (img) {
        gsap.fromTo(img, { xPercent: -5 }, { xPercent: 5, ease: 'none', scrollTrigger: { trigger: img.closest('.g-kart'), containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } });
      });
      return function () { ScrollTrigger.removeEventListener('refreshInit', boy); bolum.style.height = ''; gsap.set(serit, { clearProps: 'transform' }); };
    });
    mm.add('(max-width: 1000px)', function () {
      var h = function () { yaz(serit.scrollLeft / Math.max(1, serit.scrollWidth - serit.clientWidth)); };
      serit.addEventListener('scroll', h, { passive: true }); h();
      return function () { serit.removeEventListener('scroll', h); };
    });
  });

  /* ---------- ana sayfa: kaydırmaya bağlı 3B implant filmi ---------- */
  dene('film', function () {
    var tuval = q('#implant-tuval'); if (!tuval) return;
    var sahneEl = q('#sahne'), film = q('#film');
    var bolumler = qa('.film-bolum'), adimlar = qa('.film-adim li'), etiketler = qa('.etiket'), tarama = q('.tarama'), sGulus = q('.sahne-gulus');
    function glVar() { try { var c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }
    function yedek() { kok.classList.remove('gl-var'); kok.classList.add('gl-yok'); ScrollTrigger.refresh(); }
    if (hareketAz || /[?&]gl=yok/.test(location.search) || !glVar()) { yedek(); return; }

    // Bölüm yazıları: filmin kaydırma ilerlemesine göre sırayla belirir (3B yüklenmese de çalışır)
    var genisMi = window.matchMedia('(min-width: 1001px)');
    function bolumYaz(p) {
      var n = bolumler.length, f = p * n;
      bolumler.forEach(function (b, i) {
        var y = f - i;
        var gir = i === 0 ? 1 : sm(0.03, 0.24, y), cik = i === n - 1 ? 0 : sm(0.8, 0.98, y), a = gir * (1 - cik);
        var kay = (1 - gir) * 46 - cik * 46;
        b.style.opacity = a; b.style.visibility = a < 0.01 ? 'hidden' : 'visible';
        b.style.transform = genisMi.matches ? 'translateY(calc(-50% + ' + kay + 'px))' : 'translateY(' + kay + 'px)';
      });
      var akt = Math.max(0, Math.min(n - 1, Math.floor(f)));
      adimlar.forEach(function (li, i) { li.classList.toggle('aktif', i === akt); });
    }
    ScrollTrigger.create({ trigger: film, start: 'top top', end: 'bottom bottom', onUpdate: function (s) { bolumYaz(s.progress); }, onRefresh: function (s) { bolumYaz(s.progress); } });
    bolumYaz(0);

    import(TABAN + 'implant3d.js?' + (V.damga || '')).then(function (m) {
      var s = m.implantSahnesi(tuval, { dprUst: dokunmatik ? 1.75 : 2 });
      if (!s) throw new Error('webgl');
      kur(s);
    }).catch(function (e) { if (window.console) console.warn('[vatan] 3B sahne açılamadı, sabit görsellere geçildi', e); yedek(); });

    function kur(s) {
      var d = s.d, ui = { etiket: 0, gulus: 1, tarama: 0, taramaY: 0 };
      var olcu = [], tH = 1;
      function olc() { olcu = etiketler.map(function (el) { return [el.offsetWidth, el.offsetHeight]; }); tH = tuval.clientHeight; }
      var etiketAcik = false;
      s.kareSonrasi.push(function () {
        if (ui.etiket < 0.01) { if (etiketAcik) { etiketler.forEach(function (el) { el.style.opacity = 0; }); etiketAcik = false; } }
        else {
          etiketAcik = true;
          etiketler.forEach(function (el, i) {
            var yan = +el.dataset.yan, p = s.ekran(el.dataset.parca, yan);
            el.style.opacity = ui.etiket;
            el.style.transform = 'translate3d(' + (yan > 0 ? p.x + 4 : p.x - olcu[i][0] - 4) + 'px,' + (p.y - olcu[i][1] / 2) + 'px,0)';
          });
        }
        if (sGulus) sGulus.style.opacity = ui.gulus;
        if (tarama) { tarama.style.opacity = ui.tarama; tarama.style.transform = 'translate3d(0,' + (tH * (0.16 + ui.taramaY * 0.5)) + 'px,0)'; }
      });

      var mm = gsap.matchMedia();
      mm.add({ genis: '(min-width: 1001px)', dar: '(max-width: 1000px)' }, function (c) {
        var G = c.conditions.genis;
        Object.assign(d, { kokDon: -0.25, egX: 0.1, egZ: 0, impDon: 0, patla: 0, kronY: 0, abutY: 0, vidaY: 0, vidaDon: 0, ayrikDon: 1, dizi: 0, etOpak: 0.34, komsuOpak: 1, etKes: -2.8, kamZ: 15, kamY: -0.3, bos: 1 },
          G ? { x: 2.55, y: 0.25, olcek: 1, golge: 0.5, golgeY: -3.0, golgeOlcek: 4.4, fare: 1 } : { x: 0, y: 1.06, olcek: 0.5, golge: 0, golgeY: -0.3, golgeOlcek: 2.4, fare: 0 });
        Object.assign(ui, { etiket: 0, gulus: 1, tarama: 0, taramaY: 0 });
        var tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
        // 0 – 1: girişten ilk bölüme. Gülümseme söner, implant yerine geçer ve üç parçaya ayrılır.
        tl.to(ui, { gulus: 0, duration: 0.3, ease: 'power1.out' }, 0.06)
          .to(d, { bos: 0, duration: 0.3 }, 0.08)
          .to(d, Object.assign({ kokDon: 0, impDon: 0.55, duration: 0.9 }, G ? { x: 2.0, y: 0.02, olcek: 0.84, golge: 0.3, golgeY: -3.2 } : { y: 0.78, olcek: 0.4 }), 0.1)
          .to(d, { patla: 1, duration: 0.7 }, 0.34)
          .to(ui, { etiket: 1, duration: 0.22 }, 0.94)
          .to(d, { impDon: 0.95, duration: 0.9, ease: 'none' }, 1.0)
          .to(ui, { etiket: 0, duration: 0.18 }, 1.7)
        // 2. bölüm: vidaya yaklaş, çevresinde dön
          .to(d, Object.assign({ patla: 1.25, kokDon: 0.15, golge: 0, duration: 0.55 }, G ? { x: 1.9, y: 3.25, olcek: 2.0 } : { y: 2.36, olcek: 0.85 }), 1.72)
          .to(d, { impDon: 3.55, duration: 1.1, ease: 'none' }, 1.72)
        // 3. bölüm: diş dizisi belirir, implant boşluğun üstünde bekler, tarama çizgisi geçer
          .to(d, Object.assign({ patla: 0, ayrikDon: 0, impDon: Math.PI * 2, kokDon: -0.42, egX: 0.2, vidaY: 2.6, duration: 0.56 }, G ? { x: 1.7, y: -0.55, olcek: 0.56, abutY: 3.1, kronY: 3.5 } : { y: 0, olcek: 0.46, abutY: 4.8, kronY: 6.4 }), 2.64)
          .to(d, { dizi: 1, duration: 0.4 }, 2.84)
          .to(d, G ? { golge: 0.26, golgeY: -2.35, golgeOlcek: 6, duration: 0.3 } : { golge: 0.2, golgeY: -1.5, golgeOlcek: 3.6, duration: 0.3 }, 2.9)
          .to(ui, { tarama: 1, duration: 0.1, ease: 'none' }, 3.12)
          .fromTo(ui, { taramaY: 0 }, { taramaY: 1, duration: 0.46, ease: 'none', immediateRender: false }, 3.12)
          .to(ui, { tarama: 0, duration: 0.1, ease: 'none' }, 3.5)
        // 4. bölüm: vida döne döne yerine iner, bağlantı parçası oturur
          .to(d, { vidaY: 0, vidaDon: -Math.PI * 8, duration: 0.56, ease: 'power1.inOut' }, 3.7)
          .to(d, { kokDon: -0.2, duration: 0.9, ease: 'none' }, 3.7)
          .to(d, { kronY: G ? 2.4 : 3.2, duration: 0.5 }, 4.06)
          .to(d, { abutY: 0, duration: 0.38 }, 4.22)
        // 5. bölüm: kron oturur, diş eti kapanır, kadraj açılır
          .to(d, { kronY: 0, duration: 0.42 }, 4.62)
          .to(d, Object.assign({ kokDon: 0.3, egX: 0.24, duration: 0.88, ease: 'power1.inOut' }, G ? { olcek: 0.68, y: -0.2, x: 1.6 } : { olcek: 0.5, y: 0.2 }), 4.7)
          .to(d, { etOpak: 1, duration: 0.3 }, 4.98)
          .to(d, { etKes: -1.55, duration: 0.3 }, 5.26)
          .set({}, {}, 5.6);
        // Zaman eşlemesi: 0–1 giriş bölümünün kaydırması (boyu ne olursa olsun), 1–5,6 film bölümü. Böylece yazılarla 3B hep aynı anda ilerler.
        var stG, stF, yumusat = G ? 0.7 : 0.45;
        var it = function () { if (!stG || !stF) return; gsap.to(tl, { time: stG.progress + stF.progress * 4.6, duration: yumusat, ease: 'power2.out', overwrite: true }); };
        stG = ScrollTrigger.create({ trigger: sahneEl, start: 'top top', endTrigger: film, end: 'top top', onUpdate: it, onRefresh: it });
        stF = ScrollTrigger.create({ trigger: film, start: 'top top', end: 'bottom bottom', onUpdate: it, onRefresh: it });
        tl.time(stG.progress + stF.progress * 4.6);
        var yazi = q('.giris-yazi'), serit = q('.giris-serit');
        var cikis = gsap.to([yazi, serit], { opacity: 0, y: G ? -50 : -30, ease: 'none', immediateRender: false, scrollTrigger: { trigger: q('.giris'), start: 'top top', end: function () { return '+=' + window.innerHeight * (G ? 0.7 : 0.42); }, scrub: true } });
        return function () { stG.kill(); stF.kill(); tl.kill(); if (cikis.scrollTrigger) cikis.scrollTrigger.kill(); cikis.kill(); gsap.set([yazi, serit], { clearProps: 'opacity,transform' }); };
      });

      var gor = ScrollTrigger.create({ trigger: sahneEl, start: 'top bottom', end: 'bottom top', onToggle: function (t) { s.calis(t.isActive); } });
      s.calis(gor.isActive || window.pageYOffset < window.innerHeight);
      window.addEventListener('resize', function () { s.boyut(); olc(); });
      if (!dokunmatik) window.addEventListener('mousemove', function (e) { s.fare(e.clientX / window.innerWidth * 2 - 1, e.clientY / window.innerHeight * 2 - 1); }, { passive: true });
      document.addEventListener('visibilitychange', function () { s.calis(!document.hidden && gor.isActive); });
      olc(); s.boyut();
      kok.classList.add('gl-var');
      window.vatanSahne = s;
      // Zayıf cihaz: kare süresi uzunsa çözünürlüğü düşür
      var say = 0, bas = 0;
      s.kareSonrasi.push(function olcum() {
        var t = performance.now(); if (!bas) { bas = t; return; }
        if (++say === 70) { if ((t - bas) / 70 > 30) { s.renderer.setPixelRatio(1); s.boyut(); } s.kareSonrasi.splice(s.kareSonrasi.indexOf(olcum), 1); }
      });
    }
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
