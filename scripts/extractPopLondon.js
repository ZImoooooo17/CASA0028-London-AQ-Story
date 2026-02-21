// scripts/extractPopLondon.js
import fs from "fs";
import path from "path";
import xlsx from "xlsx";

const inputPath = process.argv[2];
const outputPath = process.argv[3] || "public/data/pop_london.csv";

if (!inputPath) {
  console.error("Usage: node scripts/extractPopLondon.js <input.xlsx> [output.csv]");
  process.exit(1);
}

const isLondon = (code) => typeof code === "string" && code.startsWith("E090");

// 你想固定使用这一张表没问题
const SHEET_NAME = "MYE2 - Persons";

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function normalizeHeader(h) {
  return String(h ?? "").trim();
}

function pickColumn(headers, candidates) {
  const norm = headers.map((h) => normalizeHeader(h));
  for (const c of candidates) {
    const idx = norm.findIndex((h) => h === c);
    if (idx !== -1) return headers[idx];
  }
  return null;
}

const wb = xlsx.readFile(inputPath);

if (!wb.SheetNames.includes(SHEET_NAME)) {
  console.error(`Sheet "${SHEET_NAME}" not found.`);
  console.error("Available sheets:", wb.SheetNames.join(", "));
  process.exit(1);
}

const ws = wb.Sheets[SHEET_NAME];

// 读成二维数组（包含空值），方便我们找 header 行
const grid = xlsx.utils.sheet_to_json(ws, { header: 1, defval: "" });

if (!grid.length) {
  console.error(`Sheet "${SHEET_NAME}" is empty.`);
  process.exit(1);
}

// 1) 自动找 header 行：包含 "Code" 的那一行
let headerRowIndex = -1;
for (let i = 0; i < Math.min(grid.length, 50); i++) {
  const row = grid[i].map(normalizeHeader);
  if (row.includes("Code")) {
    headerRowIndex = i;
    break;
  }
}

if (headerRowIndex === -1) {
  console.error('Could not find a header row containing "Code".');
  console.error("Tip: open the sheet and find which row contains the column names.");
  process.exit(1);
}

const headers = grid[headerRowIndex].map(normalizeHeader);

// 2) 自动找 code 列 & population 列
const codeColName = "Code";
const popColName =
  pickColumn(headers, ["All ages", "All Ages", "All persons", "All Persons", "Persons", "Total", "Population"]) ||
  null;

if (!popColName) {
  console.error("Could not find a population column among headers.");
  console.error("Detected headers:", headers.filter(Boolean).join(" | "));
  process.exit(1);
}

// 3) 从 header 下一行开始读取数据，转成对象
const dataRows = grid.slice(headerRowIndex + 1);

const codeIdx = headers.findIndex((h) => h === codeColName);
const popIdx = headers.findIndex((h) => h === popColName);

if (codeIdx === -1 || popIdx === -1) {
  console.error("Internal error: column indices not found.");
  process.exit(1);
}

const extracted = dataRows
  .map((row) => {
    const LADCD = String(row[codeIdx] ?? "").trim();
    const Population = Number(String(row[popIdx] ?? "").replace(/,/g, ""));
    return { LADCD, Population };
  })
  .filter((r) => isLondon(r.LADCD))
  .filter((r) => Number.isFinite(r.Population));

// 去重
const uniq = new Map();
extracted.forEach((r) => uniq.set(r.LADCD, r));
const outRows = [...uniq.values()].sort((a, b) => a.LADCD.localeCompare(b.LADCD));

ensureDir(outputPath);

const outText =
  "LADCD,Population\n" +
  outRows.map((r) => `${r.LADCD},${r.Population}`).join("\n");

fs.writeFileSync(outputPath, outText, "utf-8");

console.log(`✅ Sheet: ${SHEET_NAME}`);
console.log(`✅ Header row index: ${headerRowIndex + 1} (1-based)`);
console.log(`✅ Using columns: ${codeColName} -> LADCD, ${popColName} -> Population`);
console.log(`✅ Wrote ${outRows.length} rows to ${outputPath}`);