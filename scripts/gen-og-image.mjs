import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, "..", "public", "og-image.png");

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b090a"/>
      <stop offset="100%" stop-color="#2a0a0b"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.2" r="0.6">
      <stop offset="0%" stop-color="#a4161a" stop-opacity="0.7"/>
      <stop offset="60%" stop-color="#660708" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- Logo circle -->
  <g transform="translate(80, 110)">
    <circle r="58" fill="#a4161a"/>
    <text x="0" y="14" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="56" font-weight="800" fill="#fff" text-anchor="middle">T</text>
  </g>

  <!-- Brand -->
  <text x="170" y="125" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="64" font-weight="800" fill="#ffffff">TurnOn</text>
  <text x="172" y="170" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="22" font-weight="500" fill="#a4161a">Software para restaurantes</text>

  <!-- Headline -->
  <text x="80" y="340" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="68" font-weight="800" fill="#ffffff">Mesas, domicilios y caja</text>
  <text x="80" y="420" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="68" font-weight="800" fill="#ffffff">en un solo sistema.</text>

  <!-- Tagline -->
  <text x="80" y="490" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="26" font-weight="400" fill="#d3d3d3">Pensado para el ritmo real del local.</text>

  <!-- Pill -->
  <g transform="translate(80, 540)">
    <rect width="320" height="48" rx="24" fill="#a4161a"/>
    <text x="160" y="31" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="20" font-weight="600" fill="#ffffff" text-anchor="middle">turnon.app</text>
  </g>

  <!-- Accent corner -->
  <circle cx="1120" cy="560" r="120" fill="#a4161a" fill-opacity="0.08"/>
</svg>
`;

const png = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync(out, png);
console.log("ok", out, png.length, "bytes");
