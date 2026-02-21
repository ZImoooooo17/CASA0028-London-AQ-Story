// scripts/extractLondonLAD.js
import fs from "fs";

const inputPath = process.argv[2];  // 传入原始UK LAD geojson路径
const outputPath = process.argv[3] || "src/data/london_boroughs_lad22.geojson";

if (!inputPath) {
  console.error("Usage: node scripts/extractLondonLAD.js <input.geojson> [output.geojson]");
  process.exit(1);
}

const raw = fs.readFileSync(inputPath, "utf-8");
const geo = JSON.parse(raw);

const features = (geo.features || []).filter((f) => {
  const code = f?.properties?.LAD22CD;
  return typeof code === "string" && code.startsWith("E090");
});

const out = { type: "FeatureCollection", features };

fs.mkdirSync("src/data", { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(out));
console.log(`✅ Wrote ${features.length} features to ${outputPath}`);