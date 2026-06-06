const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const toIco = require("to-ico");

const SVG_PATH = path.join(__dirname, "..", "public", "favicon.svg");
const OUT_DIR = path.join(__dirname, "..", "public");
const SIZES = [16, 32, 48, 64, 128, 256];

async function main() {
  const svg = fs.readFileSync(SVG_PATH);

  const pngs = [];
  for (const size of SIZES) {
    const buf = await sharp(svg, { density: 384 })
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    pngs.push(buf);
    if (size === 180) {
      fs.writeFileSync(path.join(OUT_DIR, "apple-touch-icon.png"), buf);
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, "apple-touch-icon.png"), pngs[5]);

  const ico = await toIco(pngs.slice(0, 4));
  fs.writeFileSync(path.join(OUT_DIR, "favicon.ico"), ico);

  fs.writeFileSync(path.join(OUT_DIR, "favicon-32.png"), pngs[1]);

  console.log("OK: favicon.ico (" + ico.length + " bytes, 16/32/48/64),");
  console.log("     apple-touch-icon.png (256x256),");
  console.log("     favicon-32.png (32x32).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
