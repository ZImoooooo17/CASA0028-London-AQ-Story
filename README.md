
# Average Air, Uneven Burdens

**Changing how we measure NO₂ exposure reshapes who appears most at risk in London**

---

## Project Overview

This interactive web project demonstrates how changing the metric used to assess air pollution reorganises spatial hierarchies of risk across London boroughs.

When we move from ranking boroughs by **average NO₂ concentration** to ranking them by **population-weighted exposure burden**, the ordering of “most affected” areas shifts systematically.

**Measurement frameworks actively shape the spatial visibility of risk and the allocation of policy attention.**

---

## Research Question

Air quality assessments in London commonly rely on borough-level mean NO₂ concentration to identify the “most polluted” areas.

But does this average-value perspective adequately represent the distribution of health burden?

This project compares two ranking regimes:

### Average View

Boroughs are ranked purely by mean annual NO₂ concentration (μg/m³), from highest to lowest.

### Burden View

Boroughs are ranked by a relative exposure burden index:

```
Burden = mean NO₂ × population
```

This is used as a **comparative ranking metric**, rather than an absolute exposure estimate, allowing exploration of how incorporating population size reorganises perceived risk.

---

## Core Metric Construction

### 1. Concentration Rank

Boroughs are sorted in descending order based on mean annual NO₂ concentration.

### 2. Burden Rank

Boroughs are sorted in descending order based on the population-weighted burden index.

### 3. Rank Jump

```
Rank Jump = Burden Rank − Concentration Rank
```

* A **positive value** indicates that the borough rises in ranking under the population-weighted regime.
* A **negative value** indicates that the borough falls in ranking under the population-weighted regime.

Rank Jump captures how measurement choice reorganises spatial ordering.

---

## Key Insight

Changing the metric does not simply change colour.

It changes who appears most at risk.

Population-weighted ranking foregrounds densely inhabited boroughs that may not have the highest average concentration, but collectively bear a larger share of cumulative exposure.

This highlights how metric selection redistributes visibility, urgency, and potentially policy priority.

---

## Data Sources

* **NO₂ concentration data:**
  London Datastore – London Atmospheric Emissions Inventory (LAEI) 2019, annual mean NO₂ at borough level

* **Population data:**
  Office for National Statistics (ONS) Mid-2020 Population Estimates, borough level

* **Geographic boundaries:**
  London Borough Boundaries (Generalised Clipped), ONS Open Geography Portal

---

## Conceptual Positioning

This project does not claim to provide a definitive assessment of environmental injustice.

Rather, it demonstrates how alternative measurement regimes reorganise spatial hierarchies and redistribute perceived urgency.

It is an exploratory comparative exercise focused on metric framing and visibility.

---

## Limitations

* Analysis is conducted at borough scale and does not account for intra-borough spatial heterogeneity.
* Socioeconomic variables, vulnerable populations, and exposure duration are not incorporated.
* The burden metric is a comparative index and does not constitute a causal estimate of health impact.
* Data reflect 2019–2020 conditions (pre-COVID baseline) and do not represent current emissions patterns.

---

## Technical Stack

* Frontend: React + Vite
* Mapping: Mapbox GL JS
* Charting: Chart.js
* State Management: React hooks (useState, useMemo)
* Data Processing: Python scripts used for cleaning, merging, and constructing derived metrics (see `/data-processing` directory)

---

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build production version
npm run build
```

---

## Final Reflection

By making visible how rankings shift under alternative measurement regimes, this project underscores a broader methodological principle:

Data does not merely describe spatial reality.
It participates in constructing it.

