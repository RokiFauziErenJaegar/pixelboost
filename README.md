<div align="center">

# ✨ PixelBoost

### Upscale &amp; perjelas **banyak foto sekaligus — tanpa batas**, langsung di browser.

Tingkatkan resolusi hingga **8×**, pertajam detail, kurangi noise, dan buat warna lebih hidup.
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
| ♾️ | **Tanpa batas** | Proses puluhan, ratusan, atau lebih foto sekaligus dalam satu antrean. |
| 🔍 | **Upscale hingga 8×** | Pilih 2× / 3× / 4× / 6× / 8× sesuai kebutuhan. |
| 🪄 | **Pipeline penjernih** | Progressive resampling + unsharp mask + auto-levels + boost warna. |
| 🔒 | **100% privat** | Semua diproses di browser dengan Canvas — tanpa upload, tanpa server. |
| 📦 | **Unduh massal** | Simpan semua hasil sekaligus dalam satu file `.zip`. |
| 👁️ | **Bandingkan A/B** | Lihat perbedaan sebelum &amp; sesudah dengan slider. |
| 🎨 | **UI modern** | Antarmuka gelap yang elegan, responsif, dan ringan. |
| 🌐 | **Tanpa dependensi** | Tidak butuh `npm install` — cukup Node.js bawaan. |

---

## 🧠 Bagaimana Foto Menjadi Lebih Jelas?

PixelBoost bukan sekadar memperbesar piksel. Setiap foto melewati **5 tahap penyempurnaan**:

1. **Progressive Resampling** — gambar diperbesar bertahap (maksimal 2× tiap langkah) memakai resampler bicubic kualitas tinggi, sehingga hasilnya halus tanpa efek kotak-kotak.
2. **Noise Reduction** — bintik &amp; grain dihaluskan dengan blur lembut yang adaptif.
3. **Unsharp Masking** — tepi dan detail dipertegas kembali agar foto tampak tajam dan jelas.
4. **Auto Levels** — histogram di-stretch otomatis supaya bagian gelap &amp; terang lebih seimbang.
5. **Contrast &amp; Color Boost** — kontras dan saturasi ditingkatkan agar foto terlihat hidup.

> Hasilnya: foto yang **lebih besar, lebih tajam, dan lebih jelas** — semuanya dalam hitungan detik.

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

Lalu **tarik-lepas** foto-fotomu, atur faktor upscale &amp; ketajaman, klik **⚡ Upscale Semua**, dan unduh hasilnya! 🎉

---

## 🎛️ Pengaturan

| Kontrol | Fungsi |
|---|---|
| **Faktor Upscale** | Seberapa besar foto diperbesar (2×–8×). |
| **Ketajaman** | Kekuatan unsharp mask untuk mempertegas detail. |
| **Reduksi Noise** | Menghaluskan bintik &amp; grain pada foto. |
| **Kontras &amp; Warna** | Membuat foto lebih hidup dan jelas. |
| **Auto Levels** | Menyeimbangkan terang–gelap secara otomatis. |
| **Format Hasil** | PNG (terbaik), JPG (ringan), atau WEBP (modern). |

> ℹ️ Demi keamanan memori browser, ukuran keluaran dibatasi ~64 megapiksel per foto. Faktor upscale otomatis menyesuaikan bila melebihi batas.

---

## 🗂️ Struktur Proyek

```
pixelboost/
├── index.html     # Struktur halaman & UI
├── style.css      # Tema gelap modern + animasi
├── app.js         # Mesin upscale & enhancement (Canvas)
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
