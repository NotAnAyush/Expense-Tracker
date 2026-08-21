const request = require('supertest');
const app = require('../src/server');
const geotradeService = require('../src/services/geotradeService');

describe('GeoTrade Geopolitical Alpha Engine & REST API', () => {
  describe('Geotrade Service Methods', () => {
    test('getGlobalGTI returns valid score between 0 and 100 with delta', () => {
      const gtiData = geotradeService.getGlobalGTI();
      expect(gtiData).toBeDefined();
      expect(gtiData.global_gti).toBeGreaterThanOrEqual(0);
      expect(gtiData.global_gti).toBeLessThanOrEqual(100);
      expect(typeof gtiData.status).toBe('string');
      expect(typeof gtiData.delta_24h).toBe('number');
      expect(gtiData.active_hotspots_count).toBeGreaterThan(0);
      expect(gtiData.active_arcs_count).toBeGreaterThan(0);
    });

    test('getCountries returns array of sovereign tension indices', () => {
      const tensions = geotradeService.getCountries();
      expect(Array.isArray(tensions)).toBe(true);
      expect(tensions.length).toBeGreaterThan(0);

      const india = tensions.find((t) => t.iso === 'IN');
      expect(india).toBeDefined();
      expect(india.name).toBe('India');
      expect(india.gti_score).toBeGreaterThanOrEqual(0);
    });

    test('getHotspots returns localized conflict flashpoints', () => {
      const hotspots = geotradeService.getHotspots();
      expect(Array.isArray(hotspots)).toBe(true);
      expect(hotspots.length).toBeGreaterThan(0);
      hotspots.forEach((h) => {
        expect(h).toHaveProperty('id');
        expect(h).toHaveProperty('lat');
        expect(h).toHaveProperty('lng');
        expect(h).toHaveProperty('severity');
      });
    });

    test('getTensionArcs returns 3D trajectories with lat/lng pairs', () => {
      const arcs = geotradeService.getTensionArcs();
      expect(Array.isArray(arcs)).toBe(true);
      arcs.forEach((a) => {
        expect(a).toHaveProperty('startLat');
        expect(a).toHaveProperty('startLng');
        expect(a).toHaveProperty('endLat');
        expect(a).toHaveProperty('endLng');
        expect(a).toHaveProperty('severity');
      });
    });

    test('getSignals returns quantitative setups with 4-step reasoning chains', () => {
      const signals = geotradeService.getSignals();
      expect(Array.isArray(signals)).toBe(true);
      expect(signals.length).toBeGreaterThan(0);

      const goldSig = signals.find((s) => s.symbol === 'XAUUSD');
      expect(goldSig).toBeDefined();
      expect(goldSig.action).toBe('BUY');
      expect(goldSig.trade_setup).toHaveProperty('entry_price');
      expect(goldSig.trade_setup).toHaveProperty('stop_loss');
      expect(goldSig.trade_setup).toHaveProperty('target_price');
      expect(goldSig.trade_setup).toHaveProperty('max_position_pct');
      expect(goldSig.reasoning_chain).toHaveLength(4);
    });

    test('getCountryMarketImpact returns asset quotes, sector exposure, and candles', () => {
      const impact = geotradeService.getCountryMarketImpact('IN');
      expect(impact).toBeDefined();
      expect(impact.iso).toBe('IN');
      expect(impact.quotes.length).toBeGreaterThan(0);
      expect(impact.charts).toHaveProperty('XAUUSD');
      expect(impact.charts.XAUUSD.length).toBeGreaterThan(10);
    });
  });

  describe('GeoTrade Endpoints (/api/geotrade/*)', () => {
    test('GET /api/geotrade/gti returns 200 and global GTI payload', async () => {
      const res = await request(app).get('/api/geotrade/gti');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.global_gti).toBeDefined();
    });

    test('GET /api/geotrade/countries returns 200 and countries list', async () => {
      const res = await request(app).get('/api/geotrade/countries');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('GET /api/geotrade/hotspots returns 200 and active hotspots', async () => {
      const res = await request(app).get('/api/geotrade/hotspots');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('GET /api/geotrade/arcs returns 200 and conflict arcs', async () => {
      const res = await request(app).get('/api/geotrade/arcs');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('GET /api/geotrade/signals returns 200 and AI signals', async () => {
      const res = await request(app).get('/api/geotrade/signals');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('GET /api/geotrade/impact/:iso returns 200 and specific country impact', async () => {
      const res = await request(app).get('/api/geotrade/impact/IN');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.iso).toBe('IN');
    });
  });
});
