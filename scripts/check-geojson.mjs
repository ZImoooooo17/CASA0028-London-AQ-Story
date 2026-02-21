import fs from "node:fs";

function scanCoords(coords, acc) {
  if (!coords) return;
  if (typeof coords[0] === "number" && typeof coords[1] === "number") {
    const x = coords[0];
    const y = coords[1];
    acc.count++;
    if (acc.samples.length < 5) acc.samples.push([x, y]);

    acc.minX = Math.min(acc.minX, x);
    acc.maxX = Math.max(acc.maxX, x);
    acc.minY = Math.min(acc.minY, y);
    acc.maxY = Math.max(acc.maxY, y);
    return;
  }
  for (const c of coords) scanCoords(c, acc);
}

function classify(acc) {
  const { minX, maxX, minY, maxY } = acc;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // Rough London bbox in WGS84: lng ~ [-0.6, 0.4], lat ~ [51.2, 51.8]
  const looksWGS84 =
    minX >= -180 && maxX <= 180 && minY >= -90 && maxY <= 90 &&
    centerX > -5 && centerX < 5 && centerY > 45 && centerY < 60;

  const looksFlipped =
    // if "lng" is around 51 and "lat" around -0.x (typical flipped for London)
    centerX > 45 && centerX < 60 && centerY > -5 && centerY < 5;

  const looksBNG =
    // British National Grid often around x 500k, y 150k for London-ish
    centerX > 100000 && centerX < 900000 && centerY > 10000 && centerY < 1400000;

  return { looksWGS84, looksFlipped, looksBNG, centerX, centerY };
}

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/check-geojson.mjs path/to/boroughs.geojson");
  process.exit(1);
}

const gj = JSON.parse(fs.readFileSync(file, "utf8"));

const acc = {
  count: 0,
  samples: [],
  minX: Infinity,
  maxX: -Infinity,
  minY: Infinity,
  maxY: -Infinity
};

for (const f of gj.features ?? []) scanCoords(f.geometry?.coordinates, acc);

const info = classify(acc);

console.log("=== GeoJSON coordinate check ===");
console.log("points:", acc.count);
console.log("bbox:", { minX: acc.minX, minY: acc.minY, maxX: acc.maxX, maxY: acc.maxY });
console.log("center:", { x: info.centerX, y: info.centerY });
console.log("samples:", acc.samples);
console.log("classification:", {
  looksWGS84: info.looksWGS84,
  looksFlippedLatLng: info.looksFlipped,
  looksBritishNationalGrid: info.looksBNG
});

if (info.looksBNG) {
  console.log("\nLikely EPSG:27700 (British National Grid). Reproject to EPSG:4326 before mapping.");
}
if (info.looksFlipped) {
  console.log("\nLikely lat/lng flipped. Coordinates might be [lat, lng] instead of [lng, lat].");
}
if (info.looksWGS84 && !info.looksFlipped) {
  console.log("\nLooks like valid WGS84 lon/lat. Any mismatch is likely data-source/generalisation, not CRS.");
}