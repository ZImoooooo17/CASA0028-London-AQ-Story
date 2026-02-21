import { useEffect, useState } from "react";

// CSV 解析辅助函数
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

export default function useLondonData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        // ✅ 相对路径适配 GitHub Pages base url
        const [geoRes, no2Res, popRes] = await Promise.all([
          fetch("data/london_boroughs_4326.geojson"),
          fetch("data/no2_london.csv"),
          fetch("data/pop_london.csv"),
        ]);

        if (!geoRes.ok) throw new Error(`GeoJSON missing (404). Check: ${geoRes.url}`);
        if (!no2Res.ok) throw new Error(`NO2 CSV missing (404). Check: ${no2Res.url}`);
        if (!popRes.ok) throw new Error(`Pop CSV missing (404). Check: ${popRes.url}`);

        const geo = await geoRes.json();
        const no2Rows = parseCSV(await no2Res.text());
        const popRows = parseCSV(await popRes.text());

        const no2Map = new Map(no2Rows.map((r) => [r.LADCD?.trim(), Number(r.NO2)]));
        const popMap = new Map(popRows.map((r) => [r.LADCD?.trim(), Number(r.Population)]));

        // 1) join 基础数据
        let features = geo.features.map((f) => {
          const code = f.properties.LAD22CD?.trim();
          const NO2 = Number(no2Map.get(code) || 0);
          const Population = Number(popMap.get(code) || 0);

          // totalExposure 仅为了地图显示可读性缩放，不用于 share 计算
          const totalExposure = (NO2 * Population) / 100000;

          return {
            ...f,
            id: code,
            properties: {
              ...f.properties,
              LAD22CD: code,
              NO2,
              Population,
              totalExposure,
            },
          };
        });

        // 2) 计算城市总人口、总暴露（用于 burdenRatio 与 shares）
        const totalPop = features.reduce((sum, f) => sum + (f.properties.Population || 0), 0);

        // 注意：totalExp 用未缩放的 NO2*Population（和 cityAvgNO2 保持一致）
        const totalExp = features.reduce(
          (sum, f) => sum + (f.properties.NO2 * f.properties.Population || 0),
          0
        );

        const cityAvgNO2 = totalPop > 0 ? totalExp / totalPop : 0;

        // ✅ 关键：给每个 borough 写入 burdenRatio + popShare + burdenShare
        features.forEach((f) => {
          const p = f.properties;

          // burdenRatio = NO2 / cityAvgNO2（你原来的定义保留）
          p.burdenRatio = cityAvgNO2 > 0 ? p.NO2 / cityAvgNO2 : 0;

          // ✅ NEW: shares（0~1）
          p.popShare = totalPop > 0 ? p.Population / totalPop : 0;
          p.burdenShare = totalExp > 0 ? (p.NO2 * p.Population) / totalExp : 0;

          // 可选：差值（有时写 narrative 很好用）
          p.shareGap = p.burdenShare - p.popShare;
        });

        // 3) 排名：Raw Rank (按 NO2)
        const sortedByRaw = [...features].sort((a, b) => b.properties.NO2 - a.properties.NO2);
        sortedByRaw.forEach((f, idx) => {
          f.properties.rawRank = idx + 1;
        });

        // 4) 排名：Weighted Rank (按 NO2*Population)
        const sortedByWeighted = [...features].sort(
          (a, b) => b.properties.totalExposure - a.properties.totalExposure
        );

        sortedByWeighted.forEach((f, idx) => {
          f.properties.weightedRank = idx + 1;

          // rankJump = rawRank - weightedRank（你原来的叙事逻辑保留）
          f.properties.rankJump = (f.properties.rawRank || 0) - (f.properties.weightedRank || 0);
        });

        // quick sanity check（Greenwich 应该不会是 0%）
        const g = features.find((x) => x.properties?.LAD22NM === "Greenwich" || x.id === "E09000011");
        if (g) {
          console.log("Greenwich shares:", {
            popShare: g.properties.popShare,
            burdenShare: g.properties.burdenShare,
            burdenRatio: g.properties.burdenRatio,
          });
        }

        setData({ type: "FeatureCollection", features });
      } catch (err) {
        console.error("useLondonData Error:", err.message);
        setError(err);
      }
    }

    load();
  }, []);

  return { data, error };
}