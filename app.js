"use strict";

/* =========================================================================
 * PixelBoost — client-side batch image upscaler & enhancer
 *
 * Pipeline (per image):
 *   1. Progressive resampling  — step the image up in ≤2× hops using the
 *      browser's high-quality bicubic resampler. Stepping avoids the blocky
 *      look of a single large jump.
 *   2. Noise reduction         — blend a lightly blurred copy to soften grain.
 *   3. Unsharp masking          — re-introduce crisp edges/detail (clarity).
 *   4. Auto levels              — stretch the histogram so darks/lights pop.
 *   5. Contrast + saturation    — make the result look lively and clear.
 * Everything runs locally on canvas — no uploads, no limits.
 * ========================================================================= */

const MAX_DIM = 12000;        // hard cap per side (browser canvas safety)
const MAX_AREA = 64_000_000;  // ~64MP cap on output area

const state = {
  items: [],          // { id, file, name, srcUrl, status, outBlob, outUrl, outW, outH, srcW, srcH }
  scale: 2,
  busy: false,
};

let nextId = 1;

/* ----------------------------- DOM refs ----------------------------- */
const $ = (sel) => document.querySelector(sel);
const dropzone = $("#dropzone");
const fileInput = $("#fileInput");
const controls = $("#controls");
const gallery = $("#gallery");
const queueStat = $("#queueStat");
const progressWrap = $("#progressWrap");
const progressFill = $("#progressFill");
const progressLabel = $("#progressLabel");

const sharpenEl = $("#sharpen");
const denoiseEl = $("#denoise");
const contrastEl = $("#contrast");
const autoLevelsEl = $("#autoLevels");
const formatEl = $("#format");

/* ----------------------------- File intake ----------------------------- */
function addFiles(fileList) {
  const imgs = [...fileList].filter((f) => f.type.startsWith("image/"));
  if (!imgs.length) return;
  for (const file of imgs) {
    state.items.push({
      id: nextId++,
      file,
      name: file.name,
      srcUrl: URL.createObjectURL(file),
      status: "queued",
      outBlob: null,
      outUrl: null,
    });
  }
  controls.hidden = false;
  render();
  updateStat();
}

["dragenter", "dragover"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  })
);
["dragleave", "drop"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    if (ev === "dragleave" && dropzone.contains(e.relatedTarget)) return;
    dropzone.classList.remove("dragover");
  })
);
dropzone.addEventListener("drop", (e) => addFiles(e.dataTransfer.files));
dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") fileInput.click();
});
$("#browseBtn").addEventListener("click", (e) => {
  e.stopPropagation();
  fileInput.click();
});
$("#addMoreBtn").addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  addFiles(fileInput.files);
  fileInput.value = "";
});

// Allow pasting images from clipboard
window.addEventListener("paste", (e) => {
  if (e.clipboardData?.files?.length) addFiles(e.clipboardData.files);
});

/* ----------------------------- Controls ----------------------------- */
$("#scaleSeg").addEventListener("click", (e) => {
  const btn = e.target.closest(".seg-btn");
  if (!btn) return;
  document.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  state.scale = Number(btn.dataset.scale);
});

const bindVal = (el, label) => {
  const out = $(label);
  const upd = () => (out.textContent = el.value + "%");
  el.addEventListener("input", upd);
  upd();
};
bindVal(sharpenEl, "#sharpenVal");
bindVal(denoiseEl, "#denoiseVal");
bindVal(contrastEl, "#contrastVal");

$("#clearBtn").addEventListener("click", () => {
  state.items.forEach((it) => {
    URL.revokeObjectURL(it.srcUrl);
    if (it.outUrl) URL.revokeObjectURL(it.outUrl);
  });
  state.items = [];
  controls.hidden = true;
  render();
  updateStat();
});

$("#processBtn").addEventListener("click", processAll);
$("#downloadAllBtn").addEventListener("click", downloadAllZip);

/* ----------------------------- Image loading ----------------------------- */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Gagal memuat gambar"));
    img.src = url;
  });
}

/* Progressive high-quality upscale to target size. */
function progressiveResize(img, targetW, targetH) {
  let curW = img.naturalWidth;
  let curH = img.naturalHeight;
  let canvas = document.createElement("canvas");
  canvas.width = curW;
  canvas.height = curH;
  let ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  // Step up by at most 2× each pass for smoother interpolation
  while (curW < targetW || curH < targetH) {
    const nextW = Math.min(targetW, curW * 2);
    const nextH = Math.min(targetH, curH * 2);
    const next = document.createElement("canvas");
    next.width = nextW;
    next.height = nextH;
    const nctx = next.getContext("2d");
    nctx.imageSmoothingEnabled = true;
    nctx.imageSmoothingQuality = "high";
    nctx.drawImage(canvas, 0, 0, curW, curH, 0, 0, nextW, nextH);
    canvas = next;
    ctx = nctx;
    curW = nextW;
    curH = nextH;
  }
  return canvas;
}

/* Get a blurred ImageData copy using the canvas blur filter. */
function blurredData(canvas, radiusPx) {
  const tmp = document.createElement("canvas");
  tmp.width = canvas.width;
  tmp.height = canvas.height;
  const tctx = tmp.getContext("2d");
  tctx.filter = `blur(${radiusPx}px)`;
  tctx.drawImage(canvas, 0, 0);
  return tctx.getImageData(0, 0, canvas.width, canvas.height);
}

/* Core enhancement: unsharp mask + auto levels + contrast + saturation. */
function enhance(canvas, opts) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  // --- Noise reduction: blend a soft blur back over the image ---
  if (opts.denoise > 0) {
    const d = opts.denoise / 100;
    ctx.save();
    ctx.globalAlpha = d * 0.6;
    ctx.filter = `blur(${(1 + d * 1.5).toFixed(2)}px)`;
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();
    ctx.filter = "none";
    ctx.globalAlpha = 1;
  }

  const src = ctx.getImageData(0, 0, w, h);
  const data = src.data;

  // --- Unsharp mask ---
  if (opts.sharpen > 0) {
    const amount = (opts.sharpen / 100) * 1.4;
    const blur = blurredData(canvas, 1.4).data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = clamp(data[i] + amount * (data[i] - blur[i]));
      data[i + 1] = clamp(data[i + 1] + amount * (data[i + 1] - blur[i + 1]));
      data[i + 2] = clamp(data[i + 2] + amount * (data[i + 2] - blur[i + 2]));
    }
  }

  // --- Auto levels (histogram stretch with 0.4% clipping) ---
  if (opts.autoLevels) {
    const hist = new Uint32Array(256);
    for (let i = 0; i < data.length; i += 4) {
      const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) | 0;
      hist[lum]++;
    }
    const total = (data.length / 4);
    const clip = total * 0.004;
    let lo = 0, hi = 255, acc = 0;
    for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc > clip) { lo = v; break; } }
    acc = 0;
    for (let v = 255; v >= 0; v--) { acc += hist[v]; if (acc > clip) { hi = v; break; } }
    if (hi > lo + 5) {
      const sc = 255 / (hi - lo);
      for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp((data[i] - lo) * sc);
        data[i + 1] = clamp((data[i + 1] - lo) * sc);
        data[i + 2] = clamp((data[i + 2] - lo) * sc);
      }
    }
  }

  // --- Contrast + saturation ---
  if (opts.contrast > 0) {
    const c = 1 + (opts.contrast / 100) * 0.6;        // contrast factor
    const s = 1 + (opts.contrast / 100) * 0.5;        // saturation factor
    const intercept = 128 * (1 - c);
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i] * c + intercept;
      let g = data[i + 1] * c + intercept;
      let b = data[i + 2] * c + intercept;
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      r = gray + (r - gray) * s;
      g = gray + (g - gray) * s;
      b = gray + (b - gray) * s;
      data[i] = clamp(r);
      data[i + 1] = clamp(g);
      data[i + 2] = clamp(b);
    }
  }

  ctx.putImageData(src, 0, 0);
  return canvas;
}

function clamp(v) { return v < 0 ? 0 : v > 255 ? 255 : v; }

/* Decide effective output size respecting safety caps. */
function targetSize(img, scale) {
  let w = Math.round(img.naturalWidth * scale);
  let h = Math.round(img.naturalHeight * scale);
  const ratio = Math.min(MAX_DIM / w, MAX_DIM / h, Math.sqrt(MAX_AREA / (w * h)), 1);
  if (ratio < 1) {
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);
  }
  return { w, h };
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/* Process a single item. */
async function processItem(item) {
  item.status = "processing";
  render();
  await new Promise((r) => setTimeout(r, 10)); // let UI paint

  const img = await loadImage(item.srcUrl);
  item.srcW = img.naturalWidth;
  item.srcH = img.naturalHeight;

  const { w, h } = targetSize(img, state.scale);
  let canvas = progressiveResize(img, w, h);

  canvas = enhance(canvas, {
    sharpen: Number(sharpenEl.value),
    denoise: Number(denoiseEl.value),
    contrast: Number(contrastEl.value),
    autoLevels: autoLevelsEl.checked,
  });

  const type = formatEl.value;
  const quality = type === "image/png" ? undefined : 0.92;
  const blob = await canvasToBlob(canvas, type, quality);

  if (item.outUrl) URL.revokeObjectURL(item.outUrl);
  item.outBlob = blob;
  item.outUrl = URL.createObjectURL(blob);
  item.outW = canvas.width;
  item.outH = canvas.height;
  item.status = "done";

  // free memory of the big canvas
  canvas.width = canvas.height = 0;
  render();
}

/* Process the whole queue sequentially (memory-safe for unlimited batches). */
async function processAll() {
  if (state.busy) return;
  const pending = state.items.filter((it) => it.status !== "done");
  if (!pending.length) return;

  state.busy = true;
  $("#processBtn").disabled = true;
  progressWrap.hidden = false;

  let done = 0;
  for (const item of pending) {
    try {
      await processItem(item);
    } catch (err) {
      console.error(err);
      item.status = "error";
      render();
    }
    done++;
    const pct = Math.round((done / pending.length) * 100);
    progressFill.style.width = pct + "%";
    progressLabel.textContent = `${done} / ${pending.length} foto · ${pct}%`;
  }

  progressLabel.textContent = `Selesai! ${done} foto berhasil ditingkatkan ✨`;
  state.busy = false;
  $("#processBtn").disabled = false;
  $("#downloadAllBtn").disabled = !state.items.some((it) => it.status === "done");
  updateStat();
}

/* ----------------------------- Downloads ----------------------------- */
function extFor(type) {
  return type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
}
function outName(item) {
  const base = item.name.replace(/\.[^.]+$/, "");
  return `${base}_${state.scale}x.${extFor(formatEl.value)}`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function downloadAllZip() {
  const done = state.items.filter((it) => it.status === "done" && it.outBlob);
  if (!done.length) return;
  const btn = $("#downloadAllBtn");
  btn.disabled = true;
  btn.textContent = "📦 Mengemas...";

  const used = new Set();
  const entries = [];
  for (const it of done) {
    let name = outName(it);
    let n = 1;
    while (used.has(name)) name = name.replace(/(\.\w+)$/, `_${n++}$1`);
    used.add(name);
    const buf = new Uint8Array(await it.outBlob.arrayBuffer());
    entries.push({ name, data: buf });
  }
  const zip = await PixelZip.createZip(entries);
  downloadBlob(zip, `PixelBoost_${done.length}foto_${state.scale}x.zip`);

  btn.textContent = "⬇️ Unduh Semua (ZIP)";
  btn.disabled = false;
}

/* ----------------------------- Rendering ----------------------------- */
function fmtBytes(b) {
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(0) + " KB";
  return (b / 1048576).toFixed(1) + " MB";
}

const STATUS_LABEL = {
  queued: "Antre",
  processing: "Memproses…",
  done: "Selesai",
  error: "Gagal",
};

function render() {
  gallery.innerHTML = "";
  for (const it of state.items) {
    const card = document.createElement("div");
    card.className = "card";

    const thumbSrc = it.outUrl || it.srcUrl;
    const sizeInfo = it.status === "done"
      ? `${it.outW}×${it.outH}px · ${fmtBytes(it.outBlob.size)}`
      : "Menunggu diproses";

    card.innerHTML = `
      <div class="card-thumb">
        <img src="${thumbSrc}" alt="${escapeHtml(it.name)}" loading="lazy" />
        <span class="card-status ${it.status}">${STATUS_LABEL[it.status]}</span>
        ${it.status === "processing" ? '<div class="card-spinner"><div class="spinner"></div></div>' : ""}
      </div>
      <div class="card-body">
        <div class="card-name" title="${escapeHtml(it.name)}">${escapeHtml(it.name)}</div>
        <div class="card-meta"><span>${sizeInfo}</span></div>
        <div class="card-actions">
          <button data-act="compare" ${it.status !== "done" ? "disabled" : ""}>👁️ Banding</button>
          <button data-act="download" ${it.status !== "done" ? "disabled" : ""}>⬇️ Unduh</button>
          <button data-act="remove">✕</button>
        </div>
      </div>`;

    card.querySelector('[data-act="download"]').addEventListener("click", () => {
      if (it.outBlob) downloadBlob(it.outBlob, outName(it));
    });
    card.querySelector('[data-act="remove"]').addEventListener("click", () => removeItem(it.id));
    card.querySelector('[data-act="compare"]').addEventListener("click", () => openCompare(it));

    gallery.appendChild(card);
  }
}

function removeItem(id) {
  const idx = state.items.findIndex((it) => it.id === id);
  if (idx < 0) return;
  const it = state.items[idx];
  URL.revokeObjectURL(it.srcUrl);
  if (it.outUrl) URL.revokeObjectURL(it.outUrl);
  state.items.splice(idx, 1);
  if (!state.items.length) controls.hidden = true;
  $("#downloadAllBtn").disabled = !state.items.some((x) => x.status === "done");
  render();
  updateStat();
}

function updateStat() {
  const total = state.items.length;
  const done = state.items.filter((it) => it.status === "done").length;
  queueStat.textContent = total ? `${total} foto · ${done} selesai` : "";
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

/* ----------------------------- Compare modal ----------------------------- */
const modal = $("#modal");
const compareImg = $("#compareImg");
const compareSlider = $("#compareSlider");

function openCompare(it) {
  $("#modalTitle").textContent = `${it.name} — ${it.srcW}×${it.srcH} → ${it.outW}×${it.outH}`;
  // Show the upscaled result; slider cross-fades to the original for an A/B view.
  compareImg.src = it.outUrl;
  compareImg.dataset.out = it.outUrl;
  compareImg.dataset.src = it.srcUrl;
  compareSlider.value = 100;
  modal.hidden = false;
}
compareSlider.addEventListener("input", () => {
  const t = compareSlider.value / 100;
  // fade between original (0) and result (100)
  compareImg.src = t > 0.5 ? compareImg.dataset.out : compareImg.dataset.src;
  compareImg.style.opacity = 0.6 + Math.abs(t - 0.5) * 0.8;
});
modal.querySelectorAll("[data-close]").forEach((el) =>
  el.addEventListener("click", () => { modal.hidden = true; compareImg.style.opacity = 1; })
);
window.addEventListener("keydown", (e) => { if (e.key === "Escape") modal.hidden = true; });

console.log("✨ PixelBoost siap — upscale fotomu tanpa batas, langsung di browser.");
