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
        // ✅ 核心修复：使用相对路径以适配 Base URL
        const [geoRes, no2Res, popRes] = await Promise.all([
          fetch("data/london_boroughs_4326.geojson"),
          fetch("data/no2_london.csv"),
          fetch("data/pop_london.csv")
        ]);

        // 路径报错检查
        if (!geoRes.ok) throw new Error(`GeoJSON missing (404). Check: ${geoRes.url}`);
        if (!no2Res.ok) throw new Error(`NO2 CSV missing (404). Check: ${no2Res.url}`);
        if (!popRes.ok) throw new Error(`Pop CSV missing (404). Check: ${popRes.url}`);

        const geo = await geoRes.json();
        const no2Rows = parseCSV(await no2Res.text());
        const popRows = parseCSV(await popRes.text());

        const no2Map = new Map(no2Rows.map(r => [r.LADCD?.trim(), Number(r.NO2)]));
        const popMap = new Map(popRows.map(r => [r.LADCD?.trim(), Number(r.Population)]));

        // 1. 合并基础数据并计算总暴露量
        let features = geo.features.map(f => {
          const code = f.properties.LAD22CD?.trim();
          const NO2 = no2Map.get(code) || 0;
          const Population = popMap.get(code) || 0;
          
          // Total Exposure 用于 Weighted 模式的排名和地图染色
          // 除以 100000 仅为了让地图阶梯色块的数值更易读
          const totalExposure = (NO2 * Population) / 100000;

          return {
            ...f,
            id: code,
            properties: { 
              ...f.properties, 
              LAD22CD: code,
              NO2, 
              Population,
              totalExposure 
            }
          };
        });

        // 2. 计算用于叙事分析的 Burden Ratio
        const totalPop = features.reduce((sum, f) => sum + f.properties.Population, 0);
        const totalExp = features.reduce((sum, f) => sum + (f.properties.NO2 * f.properties.Population), 0);
        const cityAvgNO2 = totalPop > 0 ? totalExp / totalPop : 1;

        features.forEach(f => {
          const p = f.properties;
          // Burden Ratio = 该区浓度 / 城市加权平均浓度
          p.burdenRatio = cityAvgNO2 > 0 ? p.NO2 / cityAvgNO2 : 0;
        });

        // 3. 🚨 核心排名计算：实现 Distinction 级的排名跳变
        
        // A. Raw Rank: 按 NO2 浓度排序 (浓度高 = 排名靠前/越差)
        const sortedByRaw = [...features].sort((a, b) => b.properties.NO2 - a.properties.NO2);
        sortedByRaw.forEach((f, idx) => { f.properties.rawRank = idx + 1; });

        // B. Weighted Rank: 按总暴露量排序 (NO2 * Population)
        // 只有引入人口变量，排名顺序才会发生打乱
        const sortedByWeighted = [...features].sort((a, b) => b.properties.totalExposure - a.properties.totalExposure);
        sortedByWeighted.forEach((f, idx) => { 
          f.properties.weightedRank = idx + 1;
          // 计算跳变：RawRank - WeightedRank
          // 若原始 17，加权后 5，则 jump = 12 (代表情况变严重)
          f.properties.rankJump = f.properties.rawRank - f.properties.weightedRank;
        });

        console.log("Processing success. Ealing Jump Example:", features.find(f => f.id === "E09000009")?.properties.rankJump);
        
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