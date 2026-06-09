<div align="center">

# ✨ PixelBoost

### Perbaiki kualitas **banyak foto sekaligus dengan AI** — langsung di browser.

Buat foto buram jadi **jernih &amp; tajam**. AI **merekonstruksi detail yang hilang** (bukan sekadar memperbesar piksel), menghilangkan blur, noise, dan artefak JPEG — lalu disempurnakan dengan penajaman klasik.
Semua diproses **100% di perangkatmu** — foto **tidak pernah** diupload ke server mana pun. 🔒

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-7c5cff?style=for-the-badge)

</div>

---

## 🚀 Fitur Unggulan

| | Fitur | Keterangan |
|---|---|---|
| 🧠 | **Restorasi AI** | Model ESRGAN (TensorFlow.js) merekonstruksi detail &amp; menghilangkan buram — bukan sekadar memperbesar. |
| ♾️ | **Tanpa batas** | Proses puluhan, ratusan, atau lebih foto sekaligus dalam satu antrean. |
| 🔍 | **Perbesar 2× / 4×** | Naikkan resolusi sekaligus kualitas; gambar besar diproses per-tile agar hemat memori. |
| ⚡ | **Mode Cepat** | Tanpa AI/internet — resampling kualitas tinggi + penajaman klasik, instan. |
| 🔒 | **100% privat** | AI &amp; semua proses berjalan di browser — tanpa upload, tanpa server. |
| 📦 | **Unduh massal** | Simpan semua hasil sekaligus dalam satu file `.zip`. |
| 👁️ | **Bandingkan A/B** | Lihat perbedaan sebelum &amp; sesudah dengan slider. |
| 🎨 | **UI modern** | Antarmuka gelap yang elegan, responsif, dan ringan. |

---

## 🧠 Bagaimana Foto Menjadi Lebih Jelas?

PixelBoost memakai pendekatan **restorasi citra dua tahap** yang berbasis riset:

### Tahap 1 — Rekonstruksi detail dengan AI (Neural Super-Resolution)
Model **GAN super-resolution** (keluarga **ESRGAN / Real-ESRGAN**) dijalankan langsung di browser via **TensorFlow.js** dengan akselerasi **WebGL**. Berbeda dengan interpolasi biasa yang hanya "menebak rata-rata" piksel, jaringan ini **menghasilkan (mensintesis) tekstur dan detail** yang konsisten secara perseptual — sehingga foto buram menjadi tajam dan terlihat alami. Gambar besar dipecah menjadi **tile** yang saling tumpang-tindih lalu dijahit kembali (teknik tiling Real-ESRGAN) agar tidak kehabisan memori GPU.

### Tahap 2 — Penyempurnaan klasik (Post-processing)
Hasil AI dirapikan dengan teknik baku pengolahan citra:
1. **Noise Reduction** — menghaluskan bintik &amp; grain (edge-preserving).
2. **Unsharp Masking** — mempertegas acutance/ketajaman tepi.
3. **Auto Levels** — histogram di-stretch otomatis (mirip CLAHE) agar gelap–terang seimbang.
4. **Contrast &amp; Color Boost** — kontras &amp; saturasi dinaikkan agar foto lebih hidup.

> Hasilnya: foto yang **lebih jernih, lebih tajam, dan lebih berkualitas** — bukan sekadar lebih besar.

---

## 📚 Referensi Jurnal &amp; Metode

Konsep PixelBoost berlandaskan literatur berikut:

- **ESRGAN** — Wang et al., *"ESRGAN: Enhanced Super-Resolution Generative Adversarial Networks"*, ECCV Workshops 2018. [arXiv:1809.00219](https://arxiv.org/abs/1809.00219)
- **Real-ESRGAN** — Wang et al., *"Real-ESRGAN: Training Real-World Blind Super-Resolution with Pure Synthetic Data"*, ICCV Workshops 2021. [arXiv:2107.10833](https://arxiv.org/abs/2107.10833)
- **SRGAN** — Ledig et al., *"Photo-Realistic Single Image Super-Resolution Using a Generative Adversarial Network"*, CVPR 2017. [arXiv:1609.04802](https://arxiv.org/abs/1609.04802)
- **SRCNN** — Dong et al., *"Image Super-Resolution Using Deep Convolutional Networks"*, TPAMI 2016. [arXiv:1501.00092](https://arxiv.org/abs/1501.00092)
- **CLAHE** — Zuiderveld, *"Contrast Limited Adaptive Histogram Equalization"*, Graphics Gems IV, 1994.
- Mesin AI di browser: [UpscalerJS](https://upscalerjs.com) + [TensorFlow.js](https://www.tensorflow.org/js).

> Catatan: untuk menjaga ukuran unduhan tetap ringan, build ini memakai model ESRGAN ringkas bawaan UpscalerJS. Arsitekturnya **pluggable** — model Real-ESRGAN/Real-CUGAN (ONNX/WebGPU) dapat dipasang untuk kualitas lebih tinggi.

---

## ⚡ Cara Menjalankan

Butuh **Node.js** (versi 14+). Tidak ada dependensi yang perlu diinstal.

```bash
# 1. Klon repositori
git clone https://github.com/RokiFauziErenJaegar/pixelboost.git
cd pixelboost

# 2. Jalankan server
npm start
#   atau:  node server.js

# 3. Buka di browser
#   http://localhost:5173
```

Lalu **tarik-lepas** foto-fotomu, pilih **mode perbaikan**, klik **✨ Perbaiki Semua**, dan unduh hasilnya! 🎉

> ℹ️ Saat pertama memakai mode AI, model (±5&nbsp;MB) diunduh dari CDN lalu **disimpan di browser (IndexedDB)** sehingga pemakaian berikutnya bisa offline.

---

## 🎛️ Pengaturan

| Kontrol | Fungsi |
|---|---|
| **Mode Perbaikan** | 🧠 AI 2× / AI 4× (restorasi neural) atau ⚡ Cepat 2× / 4× (klasik, tanpa internet). |
| **Ketajaman** | Kekuatan unsharp mask untuk mempertegas detail. |
| **Reduksi Noise** | Menghaluskan bintik &amp; grain pada foto. |
| **Kontras &amp; Warna** | Membuat foto lebih hidup dan jelas. |
| **Auto Levels** | Menyeimbangkan terang–gelap secara otomatis. |
| **Format Hasil** | PNG (terbaik), JPG (ringan), atau WEBP (modern). |

> ℹ️ Demi keamanan memori browser, ukuran keluaran dibatasi ~64 megapiksel per foto; faktor perbesaran otomatis menyesuaikan bila melebihi batas. Jika WebGL/AI tak tersedia, app otomatis beralih ke **Mode Cepat**.

---

## 🗂️ Struktur Proyek

```
pixelboost/
├── index.html     # Struktur halaman, UI, & pemuatan pustaka AI (CDN)
├── style.css      # Tema gelap modern + animasi
├── app.js         # Mesin restorasi: AI (UpscalerJS/TF.js) + pipeline klasik
├── zip.js         # Penulis ZIP minimal (tanpa dependensi)
├── server.js      # Static server Node.js tanpa dependensi
└── package.json
```

---

## 🤝 Kontribusi

Pull request &amp; ide baru sangat diterima! Buka issue untuk diskusi fitur atau laporan bug.

## 📄 Lisensi

Dirilis di bawah lisensi [MIT](LICENSE). Bebas digunakan, dimodifikasi, dan dibagikan.

<div align="center">

**Dibuat dengan ❤️ — privasimu, prioritas kami.**

⭐ Beri bintang jika proyek ini bermanfaat!

</div>
