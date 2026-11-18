// Vatan Dental Center · kaydırmaya bağlı 3B implant sahnesi.
// Model dosyası yok: vida, bağlantı parçası, kron ve diş eti kodla üretilir (three.js yerel kopya).
import * as THREE from '../vendor/three.module.min.js';

const TAU = Math.PI * 2;
const KRON_Y = 0.425; // kronun boyun çizgisi: dar alt ucu bağlantı parçasının omzuna (0.225) oturur
const sm =(a, b, x) => { let t = (x - a) / (b - a); t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); };
const V2 = (x, y) => new THREE.Vector2(x, y);
const aciFark = (a, b) => { let f = (a - b) % TAU; if (f > Math.PI) f -= TAU; if (f < -Math.PI) f += TAU; return f; };

/* ---------- Vida (implant gövdesi) ---------- */
const cekirdekR = (y) => 0.215 + ((y + 1.84) / 1.5) * 0.11; // konik çekirdek yarıçapı

function vidaGovdeGeo() {
  // alt uçtan yukarı: yuvarlak uç + konik gövde
  const p = [V2(0.0001, -2.03), V2(0.09, -2.02), V2(0.16, -1.985), V2(0.198, -1.93), V2(0.215, -1.84), V2(0.325, -0.34), V2(0.345, -0.3)];
  return new THREE.LatheGeometry(p, 72);
}

function vidaBoyunGeo() {
  const p = [V2(0.345, -0.3)];
  for (let i = 0; i < 5; i++) { // mikro yivler
    const y0 = -0.3 + i * 0.03;
    p.push(V2(0.368, y0 + 0.003), V2(0.392, y0 + 0.015), V2(0.368, y0 + 0.027));
  }
  p.push(V2(0.388, -0.148), V2(0.388, -0.148));
  p.push(V2(0.412, -0.11), V2(0.42, -0.03), V2(0.42, -0.012), V2(0.42, -0.012));
  p.push(V2(0.404, 0.0), V2(0.404, 0.0)); // pah
  p.push(V2(0.235, 0.0), V2(0.235, 0.0)); // üst yüz
  p.push(V2(0.17, -0.34), V2(0.0001, -0.34)); // iç yuva
  return new THREE.LatheGeometry(p, 72);
}

function vidaDisGeo() {
  const yUst = -0.365, yAlt = -1.87, adim = 0.19, seg = 80;
  const tur = (yUst - yAlt) / adim;
  const N = Math.ceil(tur * seg);
  const pos = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const aci = t * tur * TAU;
    const y = yUst - t * (yUst - yAlt);
    const rc = cekirdekR(y) - 0.012;
    let der = (0.086 + 0.02 * t) * sm(0, 0.035, t) * sm(1, 0.955, t);
    // uç bölgede üç kesici kanal
    const uc = sm(-1.2, -1.62, y);
    if (uc > 0) {
      let k = 0;
      for (let j = 0; j < 3; j++) k = Math.max(k, Math.exp(-Math.pow(aciFark(aci, j * TAU / 3 + 0.4) / 0.3, 2)));
      der *= 1 - 0.96 * k * uc;
    }
    const taban = 0.125, tepe = 0.026;
    const pts = [
      [rc, y + taban / 2], [rc + der, y + tepe / 2],
      [rc + der, y + tepe / 2], [rc + der, y - tepe / 2],
      [rc + der, y - tepe / 2], [rc, y - taban / 2],
    ];
    const s = Math.sin(aci), c = Math.cos(aci);
    for (const [r, yy] of pts) pos.push(-r * s, yy, r * c); // sağ el dişi
  }
  for (let i = 0; i < N; i++) {
    for (let k = 0; k < 3; k++) {
      const a = i * 6 + k * 2, b = a + 1, c2 = a + 6, d2 = a + 7;
      idx.push(a, c2, b, b, c2, d2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* ---------- Bağlantı parçası (abutment) ---------- */
function abutmentGeo() {
  const p = [
    V2(0.0001, -0.66), V2(0.055, -0.655), V2(0.07, -0.63), V2(0.07, -0.36), V2(0.07, -0.36),
    V2(0.15, -0.33), V2(0.15, -0.33), V2(0.205, -0.03), V2(0.205, -0.03),
    V2(0.395, 0.0), V2(0.395, 0.0), V2(0.405, 0.035), V2(0.44, 0.15), V2(0.452, 0.21), V2(0.452, 0.225), V2(0.452, 0.225),
    V2(0.372, 0.262), V2(0.372, 0.262),
    V2(0.34, 0.5), V2(0.298, 0.86), V2(0.285, 0.93), V2(0.255, 0.972), V2(0.2, 0.99), V2(0.125, 0.992), V2(0.125, 0.992),
    V2(0.105, 0.8), V2(0.0001, 0.8),
  ];
  return new THREE.LatheGeometry(p, 72);
}

/* ---------- Kron (azı dişi) ---------- */
function kronGeo({ a = 0.92, c = 0.84, nu = 128, nv = 84 } = {}) {
  const tepeler = [[0.52, 0.48, 0.235], [-0.49, 0.5, 0.2], [0.52, -0.48, 0.25], [-0.5, -0.48, 0.19]];
  const rBoyun = new THREE.Color('#f0e6d6'), rOrta = new THREE.Color('#faf7f1'), rTepe = new THREE.Color('#ffffff');
  const renk = new THREE.Color();
  const pos = [], col = [], idx = [];
  // yan görünüş: bağlantı parçasına oturan dar boyundan tepeye tek parça yumuşak eğri (yarıçap oranı, yükseklik).
  // Azı dişi gibi: boyunda dar, üst üçte birde en geniş, omuzlar dolgun.
  const profil = new THREE.SplineCurve([
    V2(0.5, -0.2), V2(0.545, -0.14), V2(0.64, -0.055), V2(0.72, 0.03), V2(0.79, 0.12),
    V2(0.89, 0.32), V2(0.96, 0.55), V2(0.995, 0.76), V2(0.985, 0.92), V2(0.93, 1.04),
    V2(0.82, 1.12), V2(0.62, 1.165), V2(0.32, 1.175), V2(0, 1.175),
  ]).getSpacedPoints(nv);
  let enGenis = 0; profil.forEach((p, k) => { if (p.x > profil[enGenis].x) enGenis = k; });
  const nokta = (u, v) => {
    const cu = Math.cos(u), su = Math.sin(u);
    const k = Math.min(nv, Math.round(v * nv)), pr = profil[k];
    let rho = pr.x, y = pr.y;
    const govde = sm(-0.2, 0.18, y);          // boyunda daire, gövdede yuvarlak kare
    const n = 2 + 0.9 * govde, cz = a + (c - a) * govde;
    const rsq = Math.pow(Math.pow(Math.abs(cu), n) + Math.pow(Math.abs(su), n), -1 / n);
    const maske = k > enGenis ? sm(0.94, 0.6, rho) : 0;
    const w = Math.min(1, Math.max(0, y / 0.97));
    // yanak ve dil tarafındaki gelişim olukları
    const oluk = Math.exp(-Math.pow(aciFark(u, Math.PI / 2) / 0.2, 2)) * 0.05 + Math.exp(-Math.pow(aciFark(u, -Math.PI / 2) / 0.2, 2)) * 0.04;
    rho *= 1 - oluk * sm(0.2, 0.95, w);
    let x = a * rho * rsq * cu * (1 + 0.045 * su * govde);
    const z = cz * rho * rsq * su;
    if (maske > 0) {
      const X = x / a, Z = z / c;
      let h = 0;
      for (const [tx, tz, th] of tepeler) h += th * Math.exp(-((X - tx) ** 2 + (Z - tz) ** 2) / 0.18);
      h -= 0.11 * Math.exp(-Math.pow(Z / 0.15, 2)) * (1 - 0.4 * X * X);
      h -= 0.09 * Math.exp(-Math.pow(X / 0.14, 2));
      h -= 0.05 * Math.exp(-(X * X + Z * Z) / 0.07);
      y += h * maske;
    }
    return [x, y, z];
  };
  const renkEkle = (y) => {
    const t = Math.min(1, Math.max(0, y / 1.38));
    if (t < 0.45) renk.copy(rBoyun).lerp(rOrta, sm(0, 0.45, t)); else renk.copy(rOrta).lerp(rTepe, sm(0.45, 1, t));
    col.push(renk.r, renk.g, renk.b);
  };
  for (let j = 0; j < nv; j++) {
    const v = j / nv;
    for (let i = 0; i < nu; i++) { const [x, y, z] = nokta((i / nu) * TAU, v); pos.push(x, y, z); renkEkle(y); }
  }
  const tepeNokta = nokta(0, 1);
  const iTepe = pos.length / 3; pos.push(0, tepeNokta[1], 0); renkEkle(tepeNokta[1]);
  for (let j = 0; j < nv - 1; j++) for (let i = 0; i < nu; i++) {
    const a1 = j * nu + i, b1 = j * nu + (i + 1) % nu, c1 = (j + 1) * nu + i, d1 = (j + 1) * nu + (i + 1) % nu;
    idx.push(a1, c1, b1, b1, c1, d1);
  }
  for (let i = 0; i < nu; i++) idx.push((nv - 1) * nu + i, iTepe, (nv - 1) * nu + (i + 1) % nu);
  // alt kapak (boyun kenarı keskin kalsın diye kendi köşeleriyle)
  const altBas = pos.length / 3;
  const halkalar = [[1, -0.2], [0.82, -0.2], [0.72, -0.12]];
  for (const [olc, yy] of halkalar) for (let i = 0; i < nu; i++) {
    const [x, , z] = nokta((i / nu) * TAU, 0); pos.push(x * olc, yy, z * olc); col.push(rBoyun.r * 0.8, rBoyun.g * 0.78, rBoyun.b * 0.74);
  }
  const iAlt = pos.length / 3; pos.push(0, -0.05, 0); col.push(rBoyun.r * 0.7, rBoyun.g * 0.68, rBoyun.b * 0.64);
  for (let k = 0; k < halkalar.length - 1; k++) for (let i = 0; i < nu; i++) {
    const a1 = altBas + k * nu + i, b1 = altBas + k * nu + (i + 1) % nu, c1 = altBas + (k + 1) * nu + i, d1 = altBas + (k + 1) * nu + (i + 1) % nu;
    idx.push(a1, b1, c1, b1, d1, c1);
  }
  const son = altBas + (halkalar.length - 1) * nu;
  for (let i = 0; i < nu; i++) idx.push(son + i, son + (i + 1) % nu, iAlt);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* ---------- Diş eti ----------
   Kutu değil: uçları ve altı saydamlaşarak kaybolan yumuşak bir sırt. Dişlerin çevresinde hafifçe yükselir. */
export const DISLER = [[-1.73, 0.82, 0.92], [0, 1, 1], [1.87, 1, 1]]; // [x, en ölçeği, derinlik ölçeği]
function disEtiGeo() {
  const L = 8.4, nx = 150, nq = 64, w = 1.03, yUst = 0.3, kemer = 0.95, yAlt = -2.8;
  const pos = [], col = [], idx = [];
  const acik = new THREE.Color('#f4bfb3'), koyu = new THREE.Color('#e8a59c');
  const r = new THREE.Color();
  for (let i = 0; i <= nx; i++) {
    const x = (i / nx - 0.5) * L;
    for (let j = 0; j <= nq; j++) {
      const q = j / nq;
      let z, y, ust = 0;
      const qa = 0.26; // duvar payı
      if (q < qa) { z = -w; y = yAlt + (q / qa) * (yUst - kemer - yAlt); }
      else if (q > 1 - qa) { z = w; y = yAlt + ((1 - q) / qa) * (yUst - kemer - yAlt); }
      else {
        const th = Math.PI * (1 - (q - qa) / (1 - 2 * qa)), cs = Math.cos(th), sn = Math.sin(th);
        z = w * Math.sign(cs) * Math.pow(Math.abs(cs), 0.62);
        y = yUst - kemer + kemer * Math.pow(sn, 0.62);
        ust = sm(0.25, 0.8, sn);
      }
      if (ust > 0) { // diş boyunlarının çevresinde yükselen yaka
        let yaka = 0;
        for (const [dx, sx, sz] of DISLER) {
          const e = Math.hypot((x - dx) / (0.7 * sx), z / (0.64 * sz));
          yaka += e < 1 ? 1 : Math.exp(-Math.pow((e - 1) / 0.3, 2));
        }
        y += 0.115 * Math.min(1.35, yaka) * ust;
      }
      pos.push(x, y, z);
      const alfa = sm(L / 2, L / 2 - 1.5, Math.abs(x)); // uçlarda söner; alt kenar gölgelendiricide (uKes) söner
      r.copy(koyu).lerp(acik, sm(-1.6, 0.3, y));
      col.push(r.r, r.g, r.b, alfa);
    }
  }
  const s = nq + 1;
  for (let i = 0; i < nx; i++) for (let j = 0; j < nq; j++) {
    const a1 = i * s + j, b1 = a1 + 1, c1 = a1 + s, d1 = c1 + 1;
    idx.push(a1, b1, c1, b1, d1, c1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 4));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* ---------- Işık ortamı (stüdyo) ---------- */
function ortamSahnesi() {
  const s = new THREE.Scene();
  const oda = new THREE.Mesh(new THREE.BoxGeometry(44, 26, 44), new THREE.MeshBasicMaterial({ color: new THREE.Color('#e9e2d8').multiplyScalar(0.3), side: THREE.BackSide }));
  oda.position.y = 5; s.add(oda);
  const panel = (w, h, x, y, z, siddet, renk = '#ffffff') => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(renk).multiplyScalar(siddet), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m);
  };
  panel(13, 9, -10, 9, 9, 7.5, '#fffaf2');   // ana ışık: sol üst ön
  panel(4, 16, 13, 3, 5, 5, '#ffffff');      // sağ dikey şerit
  panel(18, 5, 0, 15, -3, 5, '#ffffff');     // tepe
  panel(3.5, 12, -14, 2, -7, 4, '#ffd9ad');  // arka sol sıcak kenar (marka turuncusuna selam)
  panel(5, 5, 7, -2, 12, 1.6, '#fff1e0');    // alt ön dolgu
  panel(34, 34, 0, -8, 0, 1.0, '#f6ecdc');   // zemin yansıması
  return s;
}

function golgeDoku() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(92,62,30,0.55)'); g.addColorStop(0.35, 'rgba(92,62,30,0.28)'); g.addColorStop(0.7, 'rgba(92,62,30,0.07)'); g.addColorStop(1, 'rgba(92,62,30,0)');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ---------- Sahne ---------- */
export function implantSahnesi(canvas, sec = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return null; }
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NeutralToneMapping; // ürün çekimi gibi: beyaz beyaz kalır
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(24, 1, 0.5, 80);
  const pm = new THREE.PMREMGenerator(renderer);
  const ortam = ortamSahnesi();
  scene.environment = pm.fromScene(ortam, 0.03).texture;
  ortam.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  pm.dispose();

  const anahtar = new THREE.DirectionalLight('#fff7ec', 2.0); anahtar.position.set(-5, 8, 7); scene.add(anahtar);
  const dolgu = new THREE.DirectionalLight('#e6ecff', 0.45); dolgu.position.set(7, 1.5, 5); scene.add(dolgu);

  // malzemeler
  const mTitan = new THREE.MeshStandardMaterial({ color: '#a7a5a2', metalness: 1, roughness: 0.46 });
  const mTitanParlak = new THREE.MeshStandardMaterial({ color: '#d2cfca', metalness: 1, roughness: 0.17 });
  const mAbut = new THREE.MeshStandardMaterial({ color: '#d9d5cf', metalness: 1, roughness: 0.2 });
  const kronAyar = { color: '#ffffff', vertexColors: true, roughness: 0.44, metalness: 0, clearcoat: 0.75, clearcoatRoughness: 0.16, ior: 1.55, specularIntensity: 0.9, emissive: '#2e2218', emissiveIntensity: 0.08 };
  const mKron = new THREE.MeshPhysicalMaterial(kronAyar);
  const mKomsu = new THREE.MeshPhysicalMaterial({ ...kronAyar, transparent: true });
  const mEt = new THREE.MeshPhysicalMaterial({ color: '#ffffff', vertexColors: true, roughness: 0.46, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.32, transparent: true, depthWrite: false, emissive: '#5a1f12', emissiveIntensity: 0.1 });
  // diş etinin alt kenarı sert bitmesin: uKes yüksekliğinden aşağısı yumuşakça kaybolur
  const etU = { uKes: { value: -2.8 }, uGecis: { value: 0.6 } };
  mEt.onBeforeCompile = (sh) => {
    sh.uniforms.uKes = etU.uKes; sh.uniforms.uGecis = etU.uGecis;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vEtY;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvEtY = position.y;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vEtY;\nuniform float uKes;\nuniform float uGecis;').replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.a *= smoothstep(uKes, uKes + uGecis, vEtY);');
  };

  const kok = new THREE.Group(); scene.add(kok);
  const imp = new THREE.Group(); kok.add(imp);
  const dizi = new THREE.Group(); kok.add(dizi);

  const vida = new THREE.Group();
  vida.add(new THREE.Mesh(vidaGovdeGeo(), mTitan), new THREE.Mesh(vidaDisGeo(), mTitan), new THREE.Mesh(vidaBoyunGeo(), mTitanParlak));
  const abut = new THREE.Mesh(abutmentGeo(), mAbut);
  const kGeo = kronGeo();
  const kron = new THREE.Mesh(kGeo, mKron);
  imp.add(vida, abut, kron);

  const et = new THREE.Mesh(disEtiGeo(), mEt); et.renderOrder = 3;
  const komsuSol = new THREE.Mesh(kGeo, mKomsu); komsuSol.scale.set(-DISLER[0][1], 0.97, DISLER[0][2]); komsuSol.position.set(DISLER[0][0], KRON_Y, 0); komsuSol.rotation.y = 0.05;
  const komsuSag = new THREE.Mesh(kGeo, mKomsu); komsuSag.position.set(DISLER[2][0], KRON_Y, 0); komsuSag.rotation.y = Math.PI - 0.04;
  komsuSol.renderOrder = komsuSag.renderOrder = 2;
  dizi.add(et, komsuSol, komsuSag);

  const mGolge = new THREE.MeshBasicMaterial({ map: golgeDoku(), transparent: true, depthWrite: false, toneMapped: false });
  const golge = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mGolge);
  golge.rotation.x = -Math.PI / 2; golge.renderOrder = -1; scene.add(golge);

  // durum: site.js bu değerleri kaydırmaya bağlar
  const d = {
    x: 0, y: 0, olcek: 1, kokDon: 0, egX: 0.08, egZ: 0,
    impDon: 0, patla: 0, kronY: 0, abutY: 0, vidaY: 0, vidaDon: 0, ayrikDon: 1,
    dizi: 0, etOpak: 1, komsuOpak: 1, etKes: -2.8,
    kamZ: 15, kamY: -0.3, bos: 1, golge: 1, golgeY: -3.1, golgeOlcek: 5,
    fare: 1,
  };

  let W = 1, H = 1, donus = 0, fx = 0, fy = 0, hfx = 0, hfy = 0, sonT = 0, calisiyor = false, raf = 0;
  const kareSonrasi = [];

  function boyut() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    const dpr = Math.min(window.devicePixelRatio || 1, sec.dprUst || 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    cam.aspect = W / H; cam.updateProjectionMatrix();
  }

  function guncelle(dt, t) {
    donus += dt * 0.32 * d.bos;
    if (d.bos < 0.999) { const hedef = Math.round(donus / TAU) * TAU; donus += (hedef - donus) * Math.min(1, (1 - d.bos) * dt * 5); }
    fx += (hfx - fx) * Math.min(1, dt * 3.5); fy += (hfy - fy) * Math.min(1, dt * 3.5);
    const sal = Math.sin(t * 0.85) * 0.05 * d.bos;
    kok.position.set(d.x, d.y + sal, 0);
    kok.scale.setScalar(d.olcek);
    kok.rotation.set(d.egX + fy * 0.07 * d.fare, d.kokDon + fx * 0.16 * d.fare, d.egZ);
    imp.rotation.y = d.impDon + donus;
    kron.position.y = KRON_Y + d.patla * 1.18 + d.kronY;
    kron.rotation.y = d.patla * 0.5 * d.ayrikDon;
    abut.position.y = d.patla * 0.4 + d.abutY;
    abut.rotation.y = -d.patla * 0.9 * d.ayrikDon;
    vida.position.y = -d.patla * 0.62 + d.vidaY;
    vida.rotation.y = d.vidaDon + d.patla * 1.3 * d.ayrikDon;
    dizi.visible = d.dizi > 0.003;
    if (dizi.visible) {
      mEt.opacity = d.dizi * d.etOpak;
      mKomsu.opacity = d.dizi * d.komsuOpak;
      etU.uKes.value = d.etKes;
    }
    // diş eti tam kapalıyken ve alt kenarı yukarı çekilmişken vida zaten görünmez: çizme (alttan taşmasın)
    vida.visible = !(d.dizi > 0.9 && d.etOpak > 0.985 && d.etKes > -2.75);
    golge.position.set(d.x, d.golgeY, 0); golge.scale.setScalar(d.golgeOlcek * d.olcek); mGolge.opacity = d.golge;
    cam.position.set(0, d.kamY, d.kamZ); cam.lookAt(0, d.kamY, 0);
  }

  function ciz(simdi) {
    const t = (simdi ?? performance.now()) / 1000;
    const dt = Math.min(0.05, sonT ? t - sonT : 0.016); sonT = t;
    guncelle(dt, t);
    renderer.render(scene, cam);
    for (const f of kareSonrasi) f();
  }
  function dongu(simdi) { if (!calisiyor) return; ciz(simdi); raf = requestAnimationFrame(dongu); }
  function calis(ac) {
    if (ac && !calisiyor) { calisiyor = true; sonT = 0; raf = requestAnimationFrame(dongu); }
    else if (!ac && calisiyor) { calisiyor = false; cancelAnimationFrame(raf); }
  }

  // etiketler için: parçanın ekrandaki kenar noktası
  const v3 = new THREE.Vector3(), sag = new THREE.Vector3();
  const parcalar = { kron: [kron, 0.72, 0.9], abut: [abut, 0.55, 0.36], vida: [vida, -1.0, 0.36], boyun: [vida, -0.12, 0.42], tepe: [kron, 1.25, 0] };
  function ekran(ad, yan = 1) {
    const [nesne, yy, r] = parcalar[ad];
    v3.set(0, yy, 0); nesne.localToWorld(v3);
    sag.setFromMatrixColumn(cam.matrixWorld, 0);
    v3.addScaledVector(sag, r * d.olcek * yan);
    v3.project(cam);
    return { x: (v3.x * 0.5 + 0.5) * W, y: (-v3.y * 0.5 + 0.5) * H };
  }

  function fare(nx, ny) { hfx = nx; hfy = ny; }
  function yokEt() { calis(false); renderer.dispose(); }

  boyut();
  return { d, ciz, calis, boyut, ekran, fare, yokEt, kareSonrasi, renderer, THREE, _ic: { scene, cam, mKron, mEt, mTitan, mTitanParlak, mAbut, mKomsu, anahtar, dolgu, kron, abut, vida, et } };
}
