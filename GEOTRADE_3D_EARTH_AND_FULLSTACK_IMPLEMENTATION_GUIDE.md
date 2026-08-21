# GeoTrade v2.0: 3D Earth Visualization & Fullstack Implementation Blueprint

> **A Comprehensive, Production-Grade Engineering Guide to Building Accurate 3D Earth Geopolitical Visualizations, Real-Time Streaming Backends, and Financial Trading Terminals.**

---

## 1. Architectural Stack Overview

To replicate or exceed the visual fidelity, performance, and mathematical precision seen on `https://www.web-code.tech/`, the recommended modern technology stack is:

```
[ Frontend: React 18 + Vite + TypeScript ]
  ├── 3D Geospatial Engine: Deck.gl (GlobeView) OR react-globe.gl / Three.js
  ├── 2D Vector Mapping: MapLibre GL + CartoDB Dark Matter Tiles
  ├── Financial Charting: Lightweight Charts (TradingView)
  ├── Styling & Motion: TailwindCSS + Framer Motion
  └── State & Network: Zustand + @tanstack/react-query + Native WebSockets

[ Backend: Python FastAPI + Uvicorn + WebSockets ]
  ├── Ingestion & Deduplication: Celery / AsyncIO + Redis
  ├── NLP & Machine Learning: HuggingFace Transformers (DistilRoBERTa) + LightGBM
  └── Market Quote Provider: Yahoo Finance / Finnhub / AlphaVantage / Interactive Brokers
```

---

## 2. Mathematical Foundation for 3D Globe Projection

### 2.1. Spherical Coordinate Conversion
Converting Geographic Latitude ($\phi$) and Longitude ($\lambda$) to 3D Cartesian coordinates $(x, y, z)$ on a sphere of radius $R$:

$$x = R \cdot \cos(\phi) \cdot \sin(\lambda)$$
$$y = R \cdot \sin(\phi)$$
$$z = R \cdot \cos(\phi) \cdot \cos(\lambda)$$

*(Note: Depending on Three.js camera alignment, polar rotation offsets like $\phi = \frac{\pi}{2} - \text{lat}$ and $\lambda = \text{lng} + \pi$ may be applied).*

### 2.2. Great Circle Distance & 3D Bezier Arc Altitude
To render tension arcs between City A $(\phi_1, \lambda_1)$ and City B $(\phi_2, \lambda_2)$:

1. **Central Angle $\Delta\sigma$ via Haversine / Great Circle:**
$$\Delta\sigma = \arccos\left(\sin \phi_1 \sin \phi_2 + \cos \phi_1 \cos \phi_2 \cos(\lambda_2 - \lambda_1)\right)$$

2. **Distance:**
$$d = R \cdot \Delta\sigma$$

3. **Max Arc Altitude $H_{\max}$:**
$$H_{\max} = R + \kappa \cdot \sin\left(\frac{\Delta\sigma}{2}\right) \cdot \sqrt{\text{severity}}$$
where $\kappa \approx 0.3 \cdot R$ ensures longer, higher-severity conflicts form visually elevated parabolic trajectories above the Earth surface without clipping into sovereign airspace.

---

## 3. High-Fidelity 3D Earth: Complete React Component

Below is a production-ready, self-contained **3D Geopolitical Globe Component** utilizing `react-globe.gl`, `three`, and GeoJSON country boundary datasets.

### 3.1. Installation of Required Dependencies

```bash
npm install react-globe.gl three @types/three framer-motion lucide-react lightweight-charts
```

### 3.2. Production 3D Globe Implementation (`GeopoliticalGlobe.tsx`)

```tsx
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Globe, { GlobeMethods } from "react-globe.gl";
import * as THREE from "three";

// Types
export interface CountryFeature {
  type: string;
  properties: {
    ISO_A2: string;
    NAME: string;
    ADMIN: string;
  };
  geometry: any;
}

export interface Hotspot {
  id: string;
  lat: number;
  lng: number;
  title: string;
  category: string;
  severity: number; // 0.0 to 1.0
  gti_delta: number;
}

export interface TensionArc {
  id: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  sourceIso: string;
  targetIso: string;
  severity: number;
  color: [string, string];
}

interface GeopoliticalGlobeProps {
  countryGtiScores?: Record<string, number>; // ISO_A2 -> GTI score (0-100)
  hotspots?: Hotspot[];
  arcs?: TensionArc[];
  onSelectCountry?: (iso: string, name: string) => void;
  onSelectHotspot?: (hotspot: Hotspot) => void;
}

// Country GeoJSON source
const COUNTRIES_GEOJSON_URL =
  "https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson";

export const GeopoliticalGlobe: React.FC<GeopoliticalGlobeProps> = ({
  countryGtiScores = {},
  hotspots = [],
  arcs = [],
  onSelectCountry,
  onSelectHotspot,
}) => {
  const globeEl = useRef<GlobeMethods>();
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  // 1. Fetch World GeoJSON Boundaries
  useEffect(() => {
    fetch(COUNTRIES_GEOJSON_URL)
      .then((res) => res.json())
      .then((data) => setCountries(data.features))
      .catch((err) => console.error("Failed to load country GeoJSON:", err));
  }, []);

  // 2. Configure Three.js Lighting and Atmosphere
  useEffect(() => {
    if (!globeEl.current) return;
    const scene = globeEl.current.scene();
    
    // Add custom ambient & directional lights
    const ambientLight = new THREE.AmbientLight(0x1a2b4c, 1.2);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
    directionalLight.position.set(150, 100, 150);
    scene.add(ambientLight);
    scene.add(directionalLight);

    // Initial camera position centered on Europe/Middle East
    globeEl.current.pointOfView({ lat: 25, lng: 45, altitude: 2.2 }, 1200);
  }, []);

  // 3. Dynamic Color Interpolation based on GTI Score
  const getCountryColor = useCallback(
    (feat: any) => {
      const iso = feat.properties?.ISO_A2 || "";
      const gti = countryGtiScores[iso] ?? 20; // Default baseline 20
      const isHovered = iso === hoveredCountry;

      // RGBA color calculation based on risk tiers
      if (gti >= 80) {
        return isHovered ? "rgba(239, 68, 68, 0.85)" : "rgba(239, 68, 68, 0.45)"; // Critical (Red)
      } else if (gti >= 60) {
        return isHovered ? "rgba(245, 158, 11, 0.85)" : "rgba(245, 158, 11, 0.40)"; // High (Amber)
      } else if (gti >= 35) {
        return isHovered ? "rgba(14, 165, 233, 0.85)" : "rgba(14, 165, 233, 0.35)"; // Medium (Cyan)
      } else {
        return isHovered ? "rgba(34, 197, 94, 0.70)" : "rgba(34, 197, 94, 0.20)"; // Low (Green)
      }
    },
    [countryGtiScores, hoveredCountry]
  );

  // 4. Hotspot Pulsing Rings Setup
  const ringsData = useMemo(() => {
    return hotspots.map((h) => ({
      lat: h.lat,
      lng: h.lng,
      maxR: h.severity * 6 + 2,
      propagationSpeed: 2.5,
      repeatPeriod: 1200,
      color: (t: number) =>
        h.severity > 0.8
          ? `rgba(239, 68, 68, ${Math.sqrt(1 - t)})`
          : `rgba(245, 158, 11, ${Math.sqrt(1 - t)})`,
      data: h,
    }));
  }, [hotspots]);

  return (
    <div className="relative w-full h-full bg-[#03060f] overflow-hidden select-none">
      {/* 3D Globe Viewport */}
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        // Atmosphere Glow
        atmosphereColor="#00d4ff"
        atmosphereAltitude={0.22}
        
        // Country Polygons
        polygonsData={countries}
        polygonGeoJsonGeometry="geometry"
        polygonCapColor={getCountryColor}
        polygonSideColor={() => "rgba(0, 212, 255, 0.05)"}
        polygonStrokeColor={(feat: any) =>
          feat.properties?.ISO_A2 === hoveredCountry
            ? "#00ffff"
            : "rgba(255, 255, 255, 0.15)"
        }
        polygonAltitude={(feat: any) =>
          feat.properties?.ISO_A2 === hoveredCountry ? 0.03 : 0.008
        }
        onPolygonHover={(feat: any) => {
          setHoveredCountry(feat ? feat.properties?.ISO_A2 : null);
        }}
        onPolygonClick={(feat: any) => {
          if (feat && onSelectCountry) {
            onSelectCountry(
              feat.properties?.ISO_A2,
              feat.properties?.NAME || feat.properties?.ADMIN
            );
          }
        }}

        // Tension Arcs
        arcsData={arcs}
        arcStartLat={(d: any) => d.startLat}
        arcStartLng={(d: any) => d.startLng}
        arcEndLat={(d: any) => d.endLat}
        arcEndLng={(d: any) => d.endLng}
        arcColor={(d: any) => d.color || ["#ef4444", "#3b82f6"]}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcStroke={(d: any) => d.severity * 1.5 + 0.5}
        arcAltitude={(d: any) => d.severity * 0.35 + 0.1}

        // Pulse Rings (Flashpoints)
        ringsData={ringsData}
        ringLat={(d: any) => d.lat}
        ringLng={(d: any) => d.lng}
        ringColor={(d: any) => d.color}
        ringMaxRadius={(d: any) => d.maxR}
        ringPropagationSpeed={(d: any) => d.propagationSpeed}
        ringRepeatPeriod={(d: any) => d.repeatPeriod}
        onRingClick={(ring: any) => {
          if (ring?.data && onSelectHotspot) {
            onSelectHotspot(ring.data);
          }
        }}
      />

      {/* Futuristic HUD Overlay */}
      <div className="absolute top-6 left-6 pointer-events-none z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#07091a]/85 border border-white/15 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-300 uppercase">
            ORBITAL RECON: ACTIVE
          </span>
        </div>
        <div className="px-3 py-2 rounded-md bg-[#07091a]/80 border border-white/10 text-[10px] font-mono text-gray-400 backdrop-blur-md">
          HOTSPOTS ACTIVE: <span className="text-white font-bold">{hotspots.length}</span> | ARCS: <span className="text-white font-bold">{arcs.length}</span>
        </div>
      </div>
    </div>
  );
};
```

---

## 4. Real-Time Financial Candlestick Chart Component

To render high-frequency TradingView charts for affected commodity and equity assets:

```tsx
import React, { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi } from "lightweight-charts";

export interface OHLCData {
  time: string; // "YYYY-MM-DD"
  open: number;
  high: number;
  low: number;
  close: number;
}

interface ImpactChartProps {
  symbol: string;
  data: OHLCData[];
  changePct: number;
}

export const ImpactCandlestickChart: React.FC<ImpactChartProps> = ({
  symbol,
  data,
  changePct,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Initialize LightweightChart
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight || 280,
      layout: {
        background: { color: "transparent" },
        textColor: "#64748b",
        fontSize: 10,
        fontFamily: "JetBrains Mono, monospace",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.04)" },
        horzLines: { color: "rgba(255, 255, 255, 0.04)" },
      },
      crosshair: {
        vertLine: { color: "rgba(0, 212, 255, 0.3)", width: 1 },
        horzLine: { color: "rgba(0, 212, 255, 0.3)", width: 1 },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
    });

    // 2. Add Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    candleSeries.setData(data);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = candleSeries;

    // 3. Responsive Resize Handler
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries[0]?.contentRect) return;
      chart.applyOptions({
        width: entries[0].contentRect.width,
        height: entries[0].contentRect.height,
      });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [data]);

  const isPositive = changePct >= 0;

  return (
    <div className="flex flex-col w-full h-full bg-[#07091a]/60 border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div>
          <span className="font-mono text-sm font-bold text-white">{symbol}</span>
          <span className="ml-2 font-mono text-[10px] text-gray-500">REAL-TIME IMPACT</span>
        </div>
        <div className={`font-mono text-xs font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}>
          {isPositive ? "▲ +" : "▼ "}{changePct.toFixed(2)}%
        </div>
      </div>
      <div ref={containerRef} className="flex-1 w-full min-h-[220px]" />
    </div>
  );
};
```

---

## 5. Back-End Real-Time Ingestion & Streaming Server (FastAPI)

Below is the backend microservice that manages WebSocket streaming, GTI score updates, and signal broadcasting:

```python
# main.py - FastAPI Real-Time Geopolitical Signal Server
import asyncio
import json
import hashlib
from datetime import datetime
from typing import List, Dict, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="GeoTrade API Engine", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

# Data Models
class TradeSignal(BaseModel):
    symbol: str
    action: str  # BUY or SELL
    confidence_pct: int
    entry_price: float
    stop_loss: float
    target_price: float
    risk_reward: float
    kelly_position_pct: float
    headline: str
    category: str
    severity: float

# In-Memory Cache & State
STATE = {
    "global_gti": 74.2,
    "gti_delta_24h": +5.8,
    "countries": {
        "IR": {"iso": "IR", "name": "Iran", "gti_score": 88.5, "status": "CRITICAL"},
        "IL": {"iso": "IL", "name": "Israel", "gti_score": 85.0, "status": "CRITICAL"},
        "RU": {"iso": "RU", "name": "Russia", "gti_score": 82.4, "status": "CRITICAL"},
        "UA": {"iso": "UA", "name": "Ukraine", "gti_score": 84.1, "status": "CRITICAL"},
        "TW": {"iso": "TW", "name": "Taiwan", "gti_score": 72.3, "status": "HIGH"},
        "US": {"iso": "US", "name": "United States", "gti_score": 45.0, "status": "MEDIUM"},
        "CN": {"iso": "CN", "name": "China", "gti_score": 68.2, "status": "HIGH"},
    },
    "hotspots": [
        {
            "id": "h1",
            "lat": 26.56,
            "lng": 56.25,
            "title": "Strait of Hormuz Alert",
            "category": "energy_supply_disruption",
            "severity": 0.92,
            "gti_delta": +6.4,
        },
        {
            "id": "h2",
            "lat": 50.45,
            "lng": 30.52,
            "title": "Eastern European Front",
            "category": "military_escalation",
            "severity": 0.85,
            "gti_delta": +2.1,
        }
    ],
    "arcs": [
        {
            "id": "arc1",
            "startLat": 35.68,
            "startLng": 51.38, # Tehran
            "endLat": 31.76,
            "endLng": 35.21,   # Jerusalem
            "sourceIso": "IR",
            "targetIso": "IL",
            "severity": 0.92,
            "color": ["#ef4444", "#f59e0b"]
        }
    ]
}

@app.get("/api/gti")
async def get_gti():
    return {
        "global_gti": STATE["global_gti"],
        "delta_24h": STATE["gti_delta_24h"],
        "status": "ELEVATED" if STATE["global_gti"] > 60 else "STABLE",
        "timestamp": datetime.utcnow().isoformat(),
    }

@app.get("/api/globe/countries")
async def get_globe_countries():
    return {"countries": list(STATE["countries"].values())}

@app.get("/api/globe/hotspots")
async def get_globe_hotspots():
    return {"hotspots": STATE["hotspots"]}

@app.get("/api/globe/arcs")
async def get_globe_arcs():
    return {"arcs": STATE["arcs"]}

@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep-alive heartbeat
            data = await websocket.receive_text()
            await websocket.send_json({"type": "PONG", "timestamp": datetime.utcnow().isoformat()})
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Background simulated event generator
async def simulate_event_stream():
    while True:
        await asyncio.sleep(8)
        # Emit a simulated live geopolitical trade signal
        signal_payload = {
            "type": "NEW_SIGNAL",
            "signal": {
                "symbol": "XAUUSD",
                "action": "BUY",
                "confidence_pct": 88,
                "entry_price": 2341.50,
                "stop_loss": 2298.00,
                "target_price": 2427.00,
                "risk_reward": 2.0,
                "kelly_position_pct": 3.2,
                "headline": "Missile Activity Detected near Hormuz Shipping Lane",
                "category": "military_escalation",
                "severity": 0.92,
                "timestamp": datetime.utcnow().isoformat(),
            }
        }
        await manager.broadcast(signal_payload)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulate_event_stream())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 6. Performance Optimization & Deployment Checklist

1. **WebGL Canvas Context Sharing:** Do not instantiate multiple heavy Three.js instances simultaneously; share contexts between 2D map views and 3D globe views to prevent GPU VRAM exhaustion.
2. **GeoJSON Polygon Simplification:** Use the **110m** Natural Earth dataset (or 50m for zoomed levels) converted to TopoJSON/GeoJSON with Douglas-Peucker simplification to maintain steady 60fps frame rates on standard laptops.
3. **Instanced Buffer Geometry for Arcs and Rings:** When rendering hundreds of conflict arcs, use `THREE.InstancedMesh` with custom vertex shaders instead of creating individual TubeGeometry objects.
4. **WebSocket Binary Serialization:** For production environments handling $>1,000$ events/second, encode WebSocket payloads with **Protocol Buffers** (Protobuf) or **MessagePack** to cut network overhead by $\sim 70\%$.
