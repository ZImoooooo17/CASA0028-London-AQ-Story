// scripts/extract-no2.mjs
import fs from "fs";
import path from "path";

const inputPath = process.argv[2]; // 原始 DEFRA NO2 CSV 路径
const outputPath = process.argv[3] || "public/data/no2_london.csv";

if (!inputPath) {
  console.error("Usage: node scripts/extract-no2.mjs <input.csv> [output.csv]");
  process.exit(1);
}

const isLondon = (code) => typeof code === "string" && code.startsWith("E090");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

// ⚠️ 简单 CSV parser：适用于大多数政府表（无带逗号引号字段）
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",");
    const obj = {};
    headers.forEach((h, i) => (obj[h] = (values[i] ?? "").trim()));
    return obj;
  });
  return { headers, rows };
}

function pickColumn(headers, candidates) {
  return candidates.find((c) => headers.includes(c)) || null;
}

const raw = fs.readFileSync(inputPath, "utf-8");
const { headers, rows } = parseCSV(raw);

// DEFRA 常见列名候选（如果你报错，我们就看 headers 再补）
const codeCol = pickColumn(headers, [
  "LADCD",
  "ladcd",
  "unique_code",
  "Unique_code",
  "local_authority_code",
  "Local_authority_code",
  "Code",
  "code"
]);

const valueCol = pickColumn(headers, [
  "NO2",
  "no2",
  "maximum_value",
  "Maximum_value",
  "annual_mean",
  "Annual_mean",
  "value",
  "Value",
  "mean",
  "Mean"
]);

if (!codeCol || !valueCol) {
  console.error("❌ Cannot auto-detect columns in NO2 file.");
  console.error("Headers:", headers.join(", "));
  console.error("Detected codeCol:", codeCol, "valueCol:", valueCol);
  process.exit(1);
}

const filtered = rows
  .map((r) => {
    const LADCD = r[codeCol];
    const NO2 = Number(String(r[valueCol]).replace(/,/g, ""));
    return { LADCD, NO2 };
  })
  .filter((r) => isLondon(r.LADCD))
  .filter((r) => Number.isFinite(r.NO2));

// 去重：如果同一 LADCD 多行，保留最后一个
const uniq = new Map();
filtered.forEach((r) => uniq.set(r.LADCD, r));

const outRows = [...uniq.values()].sort((a, b) => a.LADCD.localeCompare(b.LADCD));

ensureDir(outputPath);

const outText =
  "LADCD,NO2\n" +
  outRows.map((r) => `${r.LADCD},${r.NO2}`).join("\n");

fs.writeFileSync(outputPath, outText, "utf-8");

console.log(`✅ Using columns: ${codeCol} -> LADCD, ${valueCol} -> NO2`);
console.log(`✅ Wrote ${outRows.length} rows to ${outputPath}`);