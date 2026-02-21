import { useEffect, useState } from "react";

// --- helpers ---
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    const row = {};
    headers.forEach((h, i) => (row[h] = cols[i]));
    return row;
  });
}

function num(x, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

export default function useLondonData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [geoRes, no2Res, popRes] = await Promise.all([
          fetch("data/london_boroughs_4326.geojson"),
          fetch("data/no2_london.csv"),
          fetch("data/pop_london.csv"),
        ]);

        if (!geoRes.ok) throw new Error(`GeoJSON missing. Check path: ${geoRes.url}`);
        if (!no2Res.ok) throw new Error(`NO2 CSV missing. Check path: ${no2Res.url}`);
        if (!popRes.ok) throw new Error(`Population CSV missing. Check path: ${popRes.url}`);

        const geo = await geoRes.json();
        const no2Rows = parseCSV(await no2Res.text());
        const popRows = parseCSV(await popRes.text());

        // ✅ 兼容不同列名
        // NO2 CSV: LADCD, NO2
        const no2Map = new Map(
          no2Rows.map((r) => [
            (r.LADCD || r.ladcd || r.code || r.GSS_CODE || "").trim(),
            num(r.NO2 ?? r.no2),
          ])
        );

        // Pop CSV: LADCD, Population
        const popMap = new Map(
          popRows.map((r) => [
            (r.LADCD || r.ladcd || r.code || r.GSS_CODE || "").trim(),
            num(r.Population ?? r.population ?? r.pop),
          ])
        );

        // 1) join 基础数据
        let features = (geo.features || []).map((f) => {
          const code = (f.properties?.LAD22CD || f.properties?.LADCD || f.properties?.GSS_CODE || "").trim();

          const NO2 = num(no2Map.get(code), 0);
          const Population = num(popMap.get(code), 0);

          // ✅ Population Burden = total exposure
          const totalExposure = NO2 * Population; // 用于排序/排名

          return {
            ...f,
            id: code, // App/Map/Chart 都用 f.id
            properties: {
              ...f.properties,
              LAD22CD: code,
              NO2,
              Population,
              totalExposure,
            },
          };
        });

        // 2) totals
        const totalPop = features.reduce((sum, f) => sum + num(f.properties.Population, 0), 0);
        const totalExp = features.reduce((sum, f) => sum + num(f.properties.totalExposure, 0), 0);

        // exposure index 平均值：Avg = 100%
        const avgTotalExposure = features.length > 0 ? totalExp / features.length : 0;

        // 3) shares + ratio（用于不平等解释）
        features.forEach((f) => {
          const p = f.properties;

          p.popShare = totalPop > 0 ? p.Population / totalPop : 0;
          p.burdenShare = totalExp > 0 ? p.totalExposure / totalExp : 0;

          // ✅ 不平等解释：burdenShare / popShare
          p.burdenRatio = p.popShare > 0 ? p.burdenShare / p.popShare : 0;

          p.shareGap = p.burdenShare - p.popShare;

          // ✅ 给榜单显示用（Avg=100%）
          p.exposureIndex = avgTotalExposure > 0 ? (p.totalExposure / avgTotalExposure) * 100 : 0;
        });

        // 4) Raw Rank：按 NO2（高->低）
        const sortedByRaw = [...features].sort((a, b) => num(b.properties.NO2) - num(a.properties.NO2));
        sortedByRaw.forEach((f, idx) => {
          f.properties.rawRank = idx + 1;
        });

        // 5) Weighted Rank：按 totalExposure（高->低）
        const sortedByWeighted = [...features].sort((a, b) => num(b.properties.totalExposure) - num(a.properties.totalExposure));
        sortedByWeighted.forEach((f, idx) => {
          f.properties.weightedRank = idx + 1;

          // rankJump = rawRank − weightedRank
          f.properties.rankJump = num(f.properties.rawRank) - num(f.properties.weightedRank);
        });

        // 6) Spotlight candidates for mode-switch dramaturgy
        // positive rankJump -> moves up (more concerning) when population exposure is considered
        let maxAbsJumpId = null;
        let maxAbs = -Infinity;
        let maxUpJumpId = null;
        let maxUpJumpValue = -Infinity;

        for (const f of features) {
          const j = num(f.properties.rankJump, 0);
          const absj = Math.abs(j);

          if (absj > maxAbs) {
            maxAbs = absj;
            maxAbsJumpId = f.id;
          }
          if (j > maxUpJumpValue) {
            maxUpJumpValue = j;
            maxUpJumpId = f.id;
          }
        }

        setData({
          type: "FeatureCollection",
          features,
          meta: {
            totalPop,
            totalExp,
            avgTotalExposure,
            maxAbsJumpId,
            maxUpJumpId,
            maxUpJumpValue,
          },
        });
      } catch (err) {
        console.error("useLondonData Error:", err);
        setError(err);
      }
    }

    load();
  }, []);

  return { data, error };
}