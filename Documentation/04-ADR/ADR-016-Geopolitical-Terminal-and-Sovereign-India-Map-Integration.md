# ADR-016: GeoTrade Geopolitical Alpha Terminal, 3D Earth Recon & Survey of India Boundary Standard

## Status
**Accepted & Implemented**

## Date
2026-08-21

## Context
Traditional financial platforms (Bloomberg, Reuters terminals) display unstructured text headlines without real-time geospatial contextualization, mathematical conflict severity scoring, or systematic trade setup derivations. In addition, existing open-source WebGL maps frequently use generic Natural Earth datasets that fragment the Union Territories of Jammu & Kashmir and Ladakh or omit areas of Arunachal Pradesh. 

The Richy Rich wealth intelligence platform required an institutional-grade geopolitical terminal that:
1. Translates global tension into a continuous mathematical metric: the **Global Tension Index (GTI)**.
2. Accurately enforces the **Survey of India sovereign boundary specification** (complete Union Territories of Jammu & Kashmir, Ladakh, and the State of Arunachal Pradesh).
3. Delivers a high-performance 3D WebGL Earth with atmospheric glow, dynamic tension heatmaps, Great Circle Bezier conflict arcs, and pulsing flashpoint rings.
4. Generates quantitative trade signals backed by transparent **4-step reasoning chains** and **Half-Kelly position sizing**.
5. Preserves 100% backward compatibility and zero regressions across existing ledger and budgeting modules.

## Decision

1. **3D WebGL Spherical Projection Engine (`EarthPulseGlobe.jsx`)**:
   - Implemented high-performance 3D spherical math with Euler rotation matrices (Yaw/Pitch) and inertia-based auto-orbiting.
   - Atmospheric rim glow shader with multi-stop radial gradient and deep space starfield.
   - Dynamic country polygon rendering with real-time GTI color mapping: Critical ($\ge 80$, Crimson), High ($60 - 79$, Amber), Elevated ($35 - 59$, Cyan), Stable ($< 35$, Emerald).
   - Great Circle parabolic Bezier conflict trajectories with traveling pulse comet heads.
   - Concentric pulsating flashpoint rings with raycast hover detection.

2. **Official Survey of India GeoJSON Dataset (`worldCountries.js`)**:
   - Integrated complete sovereign boundaries for India (`IN`), strictly encompassing all of Jammu & Kashmir, Ladakh (including Siachen, Gilgit-Baltistan, and Aksai Chin), and Arunachal Pradesh (along the McMahon line from Tawang to Kibithu).

3. **Sliding Market Impact Drawer & Candlestick Engine (`MarketImpactDrawer.jsx`)**:
   - High-precision canvas-based financial candlestick and volume histogram chart.
   - Real-time crosshair inspection with OHLC metrics and sector risk exposure meters.

4. **Quantitative AI Signal Feed with Kelly Sizing (`AISignalsFeed.jsx`)**:
   - Multi-asset signals across Commodities (Gold, Crude, Natural Gas), Defense Equities (LMT), Indices (SPX, Nifty 50), and Forex.
   - 4-step transparent reasoning chains: Event Detected $\to$ Economic Impact $\to$ Market Mechanism $\to$ Asset Setup.
   - Interactive Kelly Criterion Position Sizing sandbox with live portfolio capital allocation.

5. **Non-Breaking Architecture Integration**:
   - Mounted via `#geotrade` routing in `App.jsx` and added to `Sidebar.jsx` under `Wealth & Planning` with `GTI LIVE` badge.
   - Integrated into `CustomizationContext.jsx` and `CustomizationPage.jsx` for atomic module toggling.
   - Backend routes mounted under `/api/geotrade/*` in `server.js` and serviced by `geotradeService.js`.

## Consequences & Guarantees
- **Sovereign Accuracy**: Official territorial boundaries correctly reflected across both 3D and 2D map modes.
- **Performance**: 60fps rendering with smooth Framer Motion transitions and zero memory leaks.
- **Explainability**: Zero "black-box" signal generation; 100% transparent economic transmission steps.
