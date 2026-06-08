/* Minimal ZIP writer — STORE method (no compression).
 * Image blobs (PNG/JPG/WEBP) are already compressed, so storing keeps it
 * fast and dependency-free. Produces a valid .zip Blob. */
(function (global) {
  "use strict";

  // CRC32 lookup table
  const CRC_TABLE = (function () {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) {
      c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function strToBytes(str) {
    return new TextEncoder().encode(str);
  }

  /**
   * Build a ZIP Blob from an array of { name, data: Uint8Array }.
   */
  async function createZip(entries) {
    const chunks = [];
    const central = [];
    let offset = 0;

    for (const entry of entries) {
      const nameBytes = strToBytes(entry.name);
      const data = entry.data;
      const crc = crc32(data);
      const size = data.length;

      // Local file header
      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true); // signature
      local.setUint16(4, 20, true); // version needed
      local.setUint16(6, 0x0800, true); // flag: UTF-8 names
      local.setUint16(8, 0, true); // method: store
      local.setUint16(10, 0, true); // mod time
      local.setUint16(12, 0, true); // mod date
      local.setUint32(14, crc, true);
      local.setUint32(18, size, true); // compressed size
      local.setUint32(22, size, true); // uncompressed size
      local.setUint16(26, nameBytes.length, true);
      local.setUint16(28, 0, true); // extra length

      chunks.push(new Uint8Array(local.buffer), nameBytes, data);

      // Central directory record
      const cd = new DataView(new ArrayBuffer(46));
      cd.setUint32(0, 0x02014b50, true);
      cd.setUint16(4, 20, true);
      cd.setUint16(6, 20, true);
      cd.setUint16(8, 0x0800, true);
      cd.setUint16(10, 0, true);
      cd.setUint16(12, 0, true);
      cd.setUint16(14, 0, true);
      cd.setUint32(16, crc, true);
      cd.setUint32(20, size, true);
      cd.setUint32(24, size, true);
      cd.setUint16(28, nameBytes.length, true);
      cd.setUint16(30, 0, true);
      cd.setUint16(32, 0, true);
      cd.setUint16(34, 0, true);
      cd.setUint16(36, 0, true);
      cd.setUint32(38, 0, true);
      cd.setUint32(42, offset, true);

      central.push(new Uint8Array(cd.buffer), nameBytes);

      offset += 30 + nameBytes.length + size;
    }

    const centralStart = offset;
    let centralSize = 0;
    for (const c of central) centralSize += c.length;

    // End of central directory
    const eocd = new DataView(new ArrayBuffer(22));
    eocd.setUint32(0, 0x06054b50, true);
    eocd.setUint16(4, 0, true);
    eocd.setUint16(6, 0, true);
    eocd.setUint16(8, entries.length, true);
    eocd.setUint16(10, entries.length, true);
    eocd.setUint32(12, centralSize, true);
    eocd.setUint32(16, centralStart, true);
    eocd.setUint16(20, 0, true);

    return new Blob([...chunks, ...central, new Uint8Array(eocd.buffer)], {
      type: "application/zip",
    });
  }

  global.PixelZip = { createZip };
})(window);
