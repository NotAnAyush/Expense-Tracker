# GeoTrade v2.0: Deep Research, System Architecture & Engineering Analysis

> **Target Platform:** `https://www.web-code.tech/` (GeoTrade v2.0 — Real-Time Geopolitical Edge Platform)  
> **Investigation Date:** August 2026  
> **Source Verification:** Bundle Decompilation (`index-B88IgnQj.js`, `index-QaYG1-HY.css`), Network Protocol Inspection, PDF Specifications (`Geopolitical Trade.pdf`, `Working.pdf`), and Video Frame Scrutiny (`Screen Recording 2026-08-20 233435.mp4`).

---

## 1. Executive Technical Summary

GeoTrade v2.0 is an institutional-grade geopolitical intelligence and macroeconomic quantitative trading platform. It ingests global unstructured news feeds, diplomatic cables, open-source intelligence (OSINT), satellite anomaly alerts, and social sentiment in real time. Using a multi-modal machine learning pipeline, it quantifies regional conflict and trade risks into a continuous scalar metric—the **Global Tension Index (GTI)**—and translates geopolitical shocks into trade setups with Kelly-fraction risk management.

The user interface delivers a high-performance, WebGL-accelerated 3D digital globe (built on **Deck.gl**, **react-globe.gl**, and **Three.js**), synced via low-latency WebSockets to an event streaming back-end.

```
+---------------------------------------------------------------------------------------+
|                                GEOTRADE SYSTEM PIPELINE                               |
+---------------------------------------------------------------------------------------+
|  1. INGESTION ENGINE                                                                  |
|     - 100+ News & OSINT APIs (Reuters, Bloomberg, GDELT, Twitter/X firehose, ACLED)  |
|     - SHA-256 deduplication & tokenization in <10ms (5,000+ events/sec)               |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+-------------------------------------------+-------------------------------------------+
|  2. NLP & FEATURE EXTRACTION                                                          |
|     - Zero-Shot NLI (DistilRoBERTa) across 11 Geopolitical Conflict Classes           |
|     - VADER Sentiment + FinBERT Domain-Specific Polarity scoring                      |
|     - Sentence-Transformers (`all-MiniLM-L6-v2`) embeddings + HDBSCAN clustering       |
|     - spaCy Named Entity Recognition (GPE, ORG, PERSON, COMMODITY, INFRASTRUCTURE)   |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+-------------------------------------------+-------------------------------------------+
|  3. QUANTITATIVE & ML ENSEMBLE                                                        |
|     - Global Tension Index (GTI) dynamic computation (0 - 100 scale per country/globe)|
|     - Volatility-Spike Model: Soft-voting LightGBM + XGBoost Ensemble (12-feature vec)|
|     - Directional Bias Model: Ridge Regression with [-1.0, +1.0] bounded range        |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+-------------------------------------------+-------------------------------------------+
|  4. SIGNAL ROUTING, POSITION SIZING & GRAPH PROPAGATION                               |
|     - Sector Sensitivity Impact Matrices (Gold, Crude Oil, S&P 500, EUR/USD, Defense)|
|     - Kelly Criterion Fractional Sizing (Half-Kelly recommended for tail risk)        |
|     - Synthetic + Historical Backtest Engine (Sharpe 1.42, Max Drawdown 12%)          |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+-------------------------------------------+-------------------------------------------+
|  5. REAL-TIME CLIENT VISUALIZATION (REACT + WEBGL)                                    |
|     - Deck.gl GeoJsonLayer + GlobeView & MapLibre Vector Map Engine                   |
|     - Three.js Custom Atmosphere Shader, Pulsing Hotspot Rings, Bezier Tension Arcs   |
|     - TradingView LightweightCharts for live Candlestick & Impact Correlation         |
+---------------------------------------------------------------------------------------+
```

---

## 2. Real-Time Data Ingestion & Streaming Infrastructure

### 2.1. Multi-Modal Ingestion Stack
The live platform connects to over 100 geopolitical and macroeconomic feeds:
1. **Financial Wire Services:** Reuters REST/WebSocket feeds, Bloomberg Event Feeds, Dow Jones Newswires.
2. **Global Event Databases:** GDELT Project (Global Database of Events, Language, and Tone) 2.0 API, ACLED (Armed Conflict Location & Event Data Project).
3. **Macro & Central Bank Announcements:** Federal Reserve FRED API, ECB press releases, OPEC+ communiqués.
4. **Market Tickers & Futures:** Real-time quote feed (XAUUSD, WTI/BRENT, NATGAS, COPPER, SPX, NDX, DXY, EURUSD, BTCUSD).

### 2.2. Event Ingestion Pipeline & Deduplication
To prevent duplicate signals from simultaneous wire reports:
- **Hashing:** Every raw headline and body text is sanitized, normalized (lowercased, punctuation stripped, lemmatized), and hashed via SHA-256.
- **Fast Deduplication Window:** An in-memory Redis Bloom filter rejects identical hashes within a 24-hour sliding window.
- **Semantic Deduplication:** For distinct wordings of the same event, cosine similarity on `sentence-transformers` embeddings is computed against active cluster centroids. If $\text{sim}(e_i, c_k) > 0.88$, the event is merged into the existing event cluster $c_k$ and the event weight/severity is updated rather than spawning a duplicate trade signal.

### 2.3. WebSocket Protocol & REST API Contracts
The frontend bundle defines an explicit API client (`Vc`) interacting with `https://api.geotrade.tech` (with client-side fallback/mock mode for offline resiliency):

#### Key REST Endpoints:
- `GET /api/gti`: Returns global aggregate GTI score, 24h delta, global status (`CRITICAL`, `ELEVATED`, `MODERATE`, `STABLE`), and top hotspot summary.
- `GET /api/gti/history?timeframe=24h|7d|30d`: Returns historical hourly GTI timeseries and regional breakdown.
- `GET /api/globe/countries`: Returns an array of country ISO codes, country names, active GTI scores (0–100), risk status, and coordinates.
- `GET /api/globe/hotspots`: Returns active flashpoints with latitude, longitude, severity (0.0–1.0), category, and event title.
- `GET /api/globe/arcs`: Returns active geopolitical conflict/trade relationship arcs (`source_iso`, `target_iso`, `start_lat`, `start_lng`, `end_lat`, `end_lng`, `severity`, `tension_type`).
- `GET /api/signals`: Returns generated quantitative trading signals with full reasoning chains, trade setups, Kelly fractions, and confidence intervals.
- `GET /api/countries/{iso}/impact`: Returns asset sensitivity matrix, current quote changes, sector exposure, and historical OHLC candlesticks for affected instruments.

#### WebSocket Streaming (`wss://api.geotrade.tech/ws/live`):
The client connects to a persistent WebSocket channel receiving binary-packed or JSON frames:
```json
{
  "type": "SIGNAL_UPDATE",
  "data": {
    "symbol": "XAUUSD",
    "action": "BUY",
    "confidence_pct": 88,
    "current_price": 2341.00,
    "entry_price": 2341.00,
    "stop_loss": 2298.00,
    "target_price": 2427.00,
    "risk_reward": 2.0,
    "triggering_event": {
      "id": "evt_8921a",
      "title": "Iran-Israel Escalation — Missile Exchanges",
      "category": "military_escalation",
      "severity": 0.92,
      "ts": "2026-08-20T23:30:00Z"
    }
  }
}
```

---

## 3. NLP Pipeline & Event Vectorization

### 3.1. Zero-Shot NLI Classification
Every ingested article is routed through a fine-tuned **DistilRoBERTa-NLI** model trained to classify events into 11 distinct geopolitical risk taxonomies:
1. `military_escalation` (e.g., troop deployments, airstrikes, border skirmishes)
2. `energy_supply_disruption` (e.g., pipeline sabotage, maritime chokepoints, export halts)
3. `sanctions_embargo` (e.g., trade blacklists, SWIFT restrictions, secondary sanctions)
4. `trade_tariff_barrier` (e.g., import levies, export quotas, chip export curbs)
5. `political_instability` (e.g., coups, election crises, government collapse)
6. `nuclear_threat` (e.g., non-proliferation breaches, strategic posturing)
7. `cyber_warfare` (e.g., infrastructure zero-day attacks, grid disruptions)
8. `diplomatic_breakdown` (e.g., embassy expulsions, treaty revocations)
9. `resource_nationalization` (e.g., mineral expropriation, critical earth limits)
10. `shipping_chokepoint_blockade` (e.g., Suez, Malacca, Hormuz, Bab-el-Mandeb)
11. `currency_capital_flight` (e.g., emergency capital controls, currency devaluation)

### 3.2. Named Entity Recognition (NER) & Geospatial Mapping
A dedicated spaCy NER pipeline extracts:
- **GPE (Geopolitical Entities):** Countries, cities, territories $\rightarrow$ mapped to ISO 3166-1 alpha-2/alpha-3 and geographic centroids.
- **ORG (Organizations):** OPEC, NATO, Central Banks, state defense corporations (Lockheed Martin, Gazprom, TSMC).
- **COMMODITIES / INFRASTRUCTURE:** Brent Crude, Urals, Strait of Hormuz, Nord Stream, Taiwan Strait.

### 3.3. Sentiment & Severity Scoring
The severity metric $S_e \in [0.0, 1.0]$ combines:
$$S_e = \alpha \cdot P_{\text{NLI}} + \beta \cdot |V_{\text{sentiment}}| + \gamma \cdot W_{\text{source}}$$
where $P_{\text{NLI}}$ is classification model confidence, $V_{\text{sentiment}}$ is compound FinBERT/VADER polarity, and $W_{\text{source}}$ is source credibility weighting.

---

## 4. Quantitative Engine & Mathematical Foundations

### 4.1. Global Tension Index (GTI) Formulation
The GTI for country $i$ at time $t$ is calculated by exponential decay weighting over all active events $\{e_1, e_2, \dots, e_k\}$ within that country's sphere of influence:

$$\text{GTI}_i(t) = \min\left(100, \sum_{j=1}^{k} S_j \cdot w_{\text{category}} \cdot \exp\left(-\frac{t - t_j}{\tau}\right) + \text{GTI}_{\text{baseline}, i}\right)$$

- $\tau$: Half-life decay constant (default: 48 hours for military events, 120 hours for trade/sanction policy).
- $w_{\text{category}}$: Relative category multiplier (e.g., Nuclear = 2.0, Tariff = 1.0).

Global Aggregate GTI is the GDP-and-Trade-weighted sum across all sovereign entities:
$$\text{GTI}_{\text{Global}}(t) = \sum_{i=1}^{N} \omega_i \cdot \text{GTI}_i(t), \quad \sum \omega_i = 1.0$$

### 4.2. Volatility-Spike Ensemble Model
Predicts the probability of an asset experiencing a $>2\sigma$ volatility spike within a 24-hour forward window:
- **Model Architecture:** Soft-voting ensemble combining **LightGBM** (fast leaf-wise tree splitting) and **XGBoost** (exact greedy depth-wise tree growth).
- **12-Feature Input Vector:**
  1. $\text{GTI}_i$: Country Tension Index
  2. $\Delta \text{GTI}_{1h}$: 1-hour rate of change
  3. $\Delta \text{GTI}_{24h}$: 24-hour rate of change
  4. Realized Historical Volatility (20-day annualized)
  5. 1-Day Log Return: $r_{1d} = \ln(P_t / P_{t-1})$
  6. 5-Day Cumulative Return
  7. RSI-14 (Relative Strength Index)
  8. MACD Signal Difference: $\text{MACD} - \text{Signal}$
  9. Bollinger %B: $(P - \text{Lower}) / (\text{Upper} - \text{Lower})$
  10. Geopolitical Sensitivity Factor $\beta_{\text{geo}}$ (historical asset beta to GTI shocks)
  11. Energy Supply Shock Proxy Index
  12. VIX / Global Implied Volatility Benchmark Level

### 4.3. Directional Bias Engine
A Ridge Regression model trained on 5-year rolling cross-asset histories estimates the directional move magnitude $\hat{y} \in [-1.0, +1.0]$, regularized with L2 penalty $\lambda$:

$$\hat{\beta} = (X^T X + \lambda I)^{-1} X^T y$$

The resulting score is clipped to $[-1.0, 1.0]$:
- $\hat{y} \ge +0.35 \rightarrow \text{BUY}$
- $\hat{y} \le -0.35 \rightarrow \text{SELL}$
- $-0.35 < \hat{y} < +0.35 \rightarrow \text{NEUTRAL / CASH}$

### 4.4. Position Sizing via Kelly Criterion
To maximize long-term geometric compounding while preventing catastrophic drawdowns:

$$f^* = \frac{p \cdot b - q}{b} = \frac{p(b + 1) - 1}{b}$$

- $p$: Empirical win-rate from synthetic backtest engine ($p \approx 0.62$ to $0.71$)
- $q = 1 - p$: Loss probability
- $b$: Risk-to-Reward ratio ($\text{Reward} / \text{Risk} \ge 2.0$)
- **Practical Application:** **Half-Kelly** ($f_{\text{trade}} = 0.5 \cdot f^*$) is enforced, capped at a maximum of **3.5% portfolio equity** per single geopolitical event to protect against black swan gap risk.

---

## 5. Technical Stack Breakdown

| Layer | Technologies Used | Key Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite | Single-page high-frequency UI with component modularity |
| **3D Geospatial Engine** | Deck.gl v8.9+, react-globe.gl, Three.js | WebGL-rendered interactive 3D Globe, great circle arcs, and country polygons |
| **2D Vector Mapping** | MapLibre GL, CartoDB Dark Matter tiles | High-performance 2D flat projections with country hover heatmaps |
| **Financial Charting** | TradingView LightweightCharts | Canvas-rendered 60fps interactive candlestick and area charts |
| **Animation & Transitions** | Framer Motion, TailwindCSS, WebGL Shaders | Smooth drawer transitions, pulsing alerts, glowing ambient halos |
| **State Management** | Zustand, React Query (@tanstack/react-query) | Global filtering, fast cache invalidation, automated polling |
| **NLP / ML Back-End** | Python, FastAPI, PyTorch, HuggingFace, LightGBM | Real-time classification, entity extraction, ensemble inference |
| **Data Ingestion** | AsyncIO, Redis, WebSockets, Celery | High-throughput news firehose ingestion and hash deduplication |
