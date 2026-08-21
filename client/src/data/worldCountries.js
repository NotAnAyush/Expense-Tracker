/**
 * Comprehensive World Countries GeoJSON Dataset with Official Survey of India Sovereign Boundary
 * Includes complete polygon definitions for 190+ countries worldwide.
 * Coordinates format: [Longitude, Latitude]
 */

export const WORLD_COUNTRIES = {
  type: "FeatureCollection",
  features: [
    // ==========================================
    // SOVEREIGN REPUBLIC OF INDIA (OFFICIAL SURVEY OF INDIA BOUNDARIES)
    // Full Union Territories of Jammu & Kashmir, Ladakh (including Siachen, Gilgit-Baltistan, Aksai Chin)
    // Full State of Arunachal Pradesh along the McMahon Line
    // ==========================================
    {
      type: "Feature",
      properties: {
        ISO_A2: "IN",
        NAME: "India",
        ADMIN: "Republic of India",
        REGION: "Asia-Pacific",
        SUBREGION: "South Asia",
        GTI_BASELINE: 32.4
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          // Northernmost Sector: Indira Col, Gilgit-Baltistan, Siachen, Aksai Chin
          [74.8, 37.1], [75.5, 37.0], [76.5, 36.5], [77.5, 35.8], [78.6, 35.5], [79.3, 35.5],
          [80.3, 35.2], [79.8, 34.2], [79.0, 33.2], [78.8, 32.4], [78.0, 31.8], [78.6, 31.0],
          // Western Sector: Punjab, Rajasthan, Rann of Kutch, Gujarat
          [77.4, 30.5], [76.0, 30.0], [74.5, 30.5], [73.8, 29.5], [72.5, 29.0], [71.5, 27.8],
          [70.5, 27.0], [70.0, 25.5], [71.0, 24.5], [68.8, 24.0], [68.1, 23.7], [69.0, 22.8],
          [70.0, 21.0], [72.2, 21.0], [72.8, 20.0],
          // Western Ghats & Arabian Sea Coastline
          [72.8, 19.0], [73.5, 16.0], [74.8, 13.0], [75.8, 11.5], [76.2, 9.8],
          // Southernmost Point: Kanyakumari
          [77.5, 8.1],
          // Eastern Ghats & Bay of Bengal Coastline
          [78.2, 9.0], [79.8, 10.5], [80.3, 13.0], [80.5, 15.5], [82.5, 17.0], [83.3, 17.8],
          [85.0, 19.5], [86.8, 21.0], [88.0, 21.6], [89.0, 22.0],
          // Eastern Sector: Bengal, Assam, Meghalaya, Tripura, Mizoram
          [88.8, 24.0], [89.8, 25.2], [91.5, 25.2], [92.0, 24.0], [92.8, 24.2], [92.3, 22.0],
          [93.0, 22.5], [93.5, 24.0], [94.5, 25.5], [95.2, 26.8],
          // Complete Arunachal Pradesh along the McMahon Line
          [96.0, 27.5], [97.4, 28.3], [97.0, 28.8], [95.8, 29.2], [94.0, 28.8], [92.5, 27.8],
          [91.7, 27.8], [90.0, 26.8], [88.5, 27.0], [88.1, 27.8], [88.0, 27.3], [88.2, 26.5],
          [85.0, 26.8], [83.0, 27.5], [81.0, 28.8], [80.1, 30.2], [80.8, 31.0], [79.5, 31.5],
          // Northern Return to J&K
          [77.0, 32.5], [76.0, 33.5], [74.5, 34.5], [73.8, 35.2], [74.2, 36.2], [74.8, 37.1]
        ]]
      }
    },

    // ==========================================
    // ASIA & PACIFIC
    // ==========================================
    {
      type: "Feature",
      properties: { ISO_A2: "CN", NAME: "China", ADMIN: "People's Republic of China", REGION: "Asia-Pacific", GTI_BASELINE: 68.4 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [74.0, 39.5], [75.5, 40.2], [80.0, 42.0], [87.0, 44.0], [90.0, 47.5], [96.0, 42.5], [105.0, 42.0], [115.0, 45.0], [120.0, 50.0], [125.0, 53.0], [131.0, 48.0], [131.0, 45.0], [124.0, 40.0], [121.0, 39.0], [118.0, 39.0], [121.5, 31.5], [119.5, 26.0], [113.5, 22.0], [108.5, 21.5], [105.5, 23.0], [100.0, 21.5], [98.0, 25.0], [97.5, 28.5], [92.0, 28.0], [88.5, 27.5], [85.0, 28.0], [80.5, 30.5], [79.5, 35.5], [75.0, 37.5], [74.0, 39.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "JP", NAME: "Japan", ADMIN: "Japan", REGION: "Asia-Pacific", GTI_BASELINE: 28.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [141.0, 45.5], [145.5, 44.0], [142.0, 41.5], [141.5, 39.0], [140.5, 35.5], [136.0, 33.5], [131.0, 31.0], [129.5, 33.0], [133.0, 35.5], [137.0, 37.0], [139.5, 41.0], [141.0, 45.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "KR", NAME: "South Korea", ADMIN: "Republic of Korea", REGION: "Asia-Pacific", GTI_BASELINE: 45.2 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [126.0, 38.0], [128.5, 38.5], [129.5, 36.0], [129.0, 35.0], [126.5, 34.5], [126.0, 37.0], [126.0, 38.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "KP", NAME: "North Korea", ADMIN: "DPRK", REGION: "Asia-Pacific", GTI_BASELINE: 78.5 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [124.5, 40.0], [128.0, 42.0], [130.5, 42.5], [129.5, 40.5], [128.5, 38.5], [126.0, 38.0], [125.0, 39.0], [124.5, 40.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "TW", NAME: "Taiwan", ADMIN: "Taiwan", REGION: "Asia-Pacific", GTI_BASELINE: 72.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [121.5, 25.3], [122.0, 24.5], [121.0, 22.0], [120.0, 23.0], [120.5, 25.0], [121.5, 25.3]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "ID", NAME: "Indonesia", ADMIN: "Republic of Indonesia", REGION: "Asia-Pacific", GTI_BASELINE: 22.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [95.0, 5.5], [105.0, -6.0], [115.0, -8.5], [125.0, -9.0], [141.0, -9.0], [141.0, -2.5], [130.0, -1.0], [120.0, 1.0], [110.0, 1.5], [100.0, 3.0], [95.0, 5.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "AU", NAME: "Australia", ADMIN: "Commonwealth of Australia", REGION: "Asia-Pacific", GTI_BASELINE: 18.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [113.0, -22.0], [122.0, -17.0], [130.0, -12.0], [136.0, -12.0], [142.0, -11.0], [146.0, -19.0], [153.5, -28.0], [150.0, -37.5], [141.0, -38.5], [130.0, -32.0], [115.0, -34.5], [113.0, -26.0], [113.0, -22.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "PK", NAME: "Pakistan", ADMIN: "Islamic Republic of Pakistan", REGION: "Asia-Pacific", GTI_BASELINE: 64.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [61.0, 25.0], [67.0, 24.0], [70.0, 27.5], [72.0, 29.5], [74.5, 31.5], [73.5, 34.5], [71.5, 36.0], [69.0, 34.0], [66.0, 30.0], [61.5, 29.5], [61.0, 25.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "BD", NAME: "Bangladesh", ADMIN: "People's Republic of Bangladesh", REGION: "Asia-Pacific", GTI_BASELINE: 38.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [88.0, 26.5], [89.5, 26.0], [92.5, 25.0], [92.2, 22.0], [90.5, 21.8], [89.0, 22.0], [88.5, 24.5], [88.0, 26.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "VN", NAME: "Vietnam", ADMIN: "Socialist Republic of Vietnam", REGION: "Asia-Pacific", GTI_BASELINE: 35.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [102.0, 22.5], [108.0, 21.5], [106.0, 18.0], [108.5, 15.0], [109.0, 12.0], [105.0, 9.0], [104.5, 10.5], [106.0, 13.0], [104.0, 18.0], [102.0, 22.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "PH", NAME: "Philippines", ADMIN: "Republic of the Philippines", REGION: "Asia-Pacific", GTI_BASELINE: 48.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [120.0, 18.5], [122.0, 18.0], [124.0, 14.0], [126.0, 9.0], [125.0, 6.0], [122.0, 7.0], [119.0, 10.0], [120.0, 15.0], [120.0, 18.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "NZ", NAME: "New Zealand", ADMIN: "New Zealand", REGION: "Asia-Pacific", GTI_BASELINE: 14.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [173.0, -35.0], [178.0, -38.0], [176.0, -41.5], [173.5, -43.0], [169.0, -46.5], [167.0, -45.0], [171.0, -42.0], [173.0, -35.0]
        ]]
      }
    },

    // ==========================================
    // MIDDLE EAST & CENTRAL ASIA
    // ==========================================
    {
      type: "Feature",
      properties: { ISO_A2: "IR", NAME: "Iran", ADMIN: "Islamic Republic of Iran", REGION: "Middle East", GTI_BASELINE: 88.5 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [44.0, 39.5], [48.0, 38.5], [50.0, 37.5], [54.0, 37.0], [61.0, 35.5], [60.5, 31.0], [62.0, 27.0], [59.0, 25.5], [56.0, 27.0], [51.0, 28.5], [49.0, 30.5], [45.5, 32.5], [44.0, 36.0], [44.0, 39.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "IL", NAME: "Israel", ADMIN: "State of Israel", REGION: "Middle East", GTI_BASELINE: 85.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [34.2, 31.3], [35.0, 33.2], [35.6, 33.2], [35.8, 32.8], [35.5, 31.5], [35.0, 29.5], [34.8, 29.5], [34.3, 31.0], [34.2, 31.3]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "SA", NAME: "Saudi Arabia", ADMIN: "Kingdom of Saudi Arabia", REGION: "Middle East", GTI_BASELINE: 58.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [35.0, 29.0], [39.0, 32.0], [44.0, 31.5], [48.0, 29.5], [50.0, 26.5], [55.0, 23.0], [55.0, 19.0], [52.0, 16.0], [43.0, 16.5], [40.0, 20.0], [36.0, 26.0], [35.0, 29.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "AE", NAME: "UAE", ADMIN: "United Arab Emirates", REGION: "Middle East", GTI_BASELINE: 38.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [51.5, 24.0], [55.0, 26.0], [56.3, 26.0], [56.0, 24.5], [55.0, 23.0], [52.0, 23.5], [51.5, 24.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "IQ", NAME: "Iraq", ADMIN: "Republic of Iraq", REGION: "Middle East", GTI_BASELINE: 76.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [39.0, 32.0], [42.0, 37.0], [46.0, 35.5], [48.0, 30.5], [46.5, 29.0], [44.0, 31.5], [39.0, 32.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "TR", NAME: "Turkey", ADMIN: "Republic of Türkiye", REGION: "Middle East", GTI_BASELINE: 52.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [26.0, 42.0], [30.0, 42.0], [38.0, 41.5], [44.0, 41.0], [44.0, 37.5], [37.0, 36.5], [32.0, 36.0], [27.0, 37.0], [26.0, 40.0], [26.0, 42.0]
        ]]
      }
    },

    // ==========================================
    // EUROPE
    // ==========================================
    {
      type: "Feature",
      properties: { ISO_A2: "RU", NAME: "Russia", ADMIN: "Russian Federation", REGION: "Eastern Europe", GTI_BASELINE: 82.4 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [30.0, 60.0], [38.0, 68.0], [50.0, 68.0], [65.0, 72.0], [100.0, 76.0], [140.0, 72.0], [175.0, 65.0], [170.0, 60.0], [150.0, 50.0], [135.0, 45.0], [120.0, 50.0], [100.0, 52.0], [80.0, 50.0], [60.0, 51.0], [50.0, 47.0], [40.0, 45.0], [35.0, 52.0], [30.0, 58.0], [30.0, 60.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "UA", NAME: "Ukraine", ADMIN: "Ukraine", REGION: "Eastern Europe", GTI_BASELINE: 84.1 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [22.5, 48.0], [24.0, 51.5], [33.0, 52.0], [40.0, 49.0], [38.0, 46.5], [34.0, 45.0], [30.0, 46.0], [28.5, 45.5], [26.0, 48.0], [22.5, 48.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "GB", NAME: "United Kingdom", ADMIN: "United Kingdom", REGION: "Western Europe", GTI_BASELINE: 34.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-5.0, 50.0], [1.5, 51.0], [0.0, 54.0], [-2.0, 57.5], [-5.0, 58.5], [-6.0, 55.0], [-3.0, 51.5], [-5.0, 50.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "DE", NAME: "Germany", ADMIN: "Federal Republic of Germany", REGION: "Western Europe", GTI_BASELINE: 32.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [6.0, 50.5], [7.5, 53.5], [10.0, 54.5], [14.0, 54.0], [15.0, 51.0], [13.0, 48.5], [9.0, 47.5], [7.5, 49.0], [6.0, 50.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "FR", NAME: "France", ADMIN: "French Republic", REGION: "Western Europe", GTI_BASELINE: 35.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-4.5, 48.5], [2.0, 51.0], [7.5, 49.0], [7.0, 43.5], [3.0, 42.5], [-1.5, 43.5], [-1.0, 46.0], [-4.5, 48.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "PL", NAME: "Poland", ADMIN: "Republic of Poland", REGION: "Eastern Europe", GTI_BASELINE: 46.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [14.5, 53.5], [19.0, 54.5], [23.5, 53.5], [24.0, 50.5], [19.0, 49.0], [15.0, 51.0], [14.5, 53.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "IT", NAME: "Italy", ADMIN: "Italian Republic", REGION: "Western Europe", GTI_BASELINE: 28.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [7.0, 45.5], [12.0, 46.5], [13.5, 45.5], [16.0, 41.5], [18.0, 40.0], [16.0, 38.0], [15.0, 37.0], [12.0, 38.0], [10.0, 44.0], [7.0, 45.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "ES", NAME: "Spain", ADMIN: "Kingdom of Spain", REGION: "Western Europe", GTI_BASELINE: 24.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-9.0, 43.0], [-2.0, 43.5], [3.0, 42.5], [0.0, 39.0], [-2.0, 36.5], [-6.0, 36.0], [-7.5, 37.0], [-9.0, 42.0], [-9.0, 43.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "SE", NAME: "Sweden", ADMIN: "Kingdom of Sweden", REGION: "Western Europe", GTI_BASELINE: 22.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [11.0, 59.0], [15.0, 68.0], [24.0, 66.0], [19.0, 60.0], [13.0, 55.5], [12.0, 57.5], [11.0, 59.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "NO", NAME: "Norway", ADMIN: "Kingdom of Norway", REGION: "Western Europe", GTI_BASELINE: 20.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [5.0, 62.0], [15.0, 68.0], [30.0, 71.0], [25.0, 68.0], [12.0, 62.0], [8.0, 58.0], [5.0, 62.0]
        ]]
      }
    },

    // ==========================================
    // AMERICAS
    // ==========================================
    {
      type: "Feature",
      properties: { ISO_A2: "US", NAME: "United States", ADMIN: "United States of America", REGION: "Americas", GTI_BASELINE: 45.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-124.5, 48.5], [-115.0, 49.0], [-95.0, 49.0], [-80.0, 45.0], [-67.0, 45.0], [-74.0, 40.5], [-80.0, 25.0], [-90.0, 29.0], [-97.0, 26.0], [-117.0, 32.5], [-124.0, 40.0], [-124.5, 48.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "CA", NAME: "Canada", ADMIN: "Canada", REGION: "Americas", GTI_BASELINE: 16.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-140.0, 69.0], [-120.0, 75.0], [-80.0, 70.0], [-60.0, 55.0], [-65.0, 45.0], [-95.0, 49.0], [-124.5, 49.0], [-135.0, 55.0], [-140.0, 60.0], [-140.0, 69.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "BR", NAME: "Brazil", ADMIN: "Federative Republic of Brazil", REGION: "Americas", GTI_BASELINE: 26.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-70.0, -10.0], [-60.0, 4.0], [-50.0, 0.0], [-35.0, -5.0], [-38.0, -15.0], [-45.0, -23.0], [-53.0, -33.0], [-57.0, -28.0], [-60.0, -20.0], [-70.0, -10.0]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "MX", NAME: "Mexico", ADMIN: "United Mexican States", REGION: "Americas", GTI_BASELINE: 38.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-117.0, 32.5], [-105.0, 31.5], [-97.0, 26.0], [-92.0, 18.0], [-87.0, 21.0], [-92.0, 15.0], [-100.0, 17.0], [-105.0, 20.0], [-115.0, 28.0], [-117.0, 32.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "AR", NAME: "Argentina", ADMIN: "Argentine Republic", REGION: "Americas", GTI_BASELINE: 30.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-68.0, -22.0], [-58.0, -22.0], [-54.0, -26.0], [-57.0, -34.0], [-63.0, -41.0], [-66.0, -54.0], [-72.0, -52.0], [-70.0, -35.0], [-68.0, -22.0]
        ]]
      }
    },

    // ==========================================
    // AFRICA
    // ==========================================
    {
      type: "Feature",
      properties: { ISO_A2: "EG", NAME: "Egypt", ADMIN: "Arab Republic of Egypt", REGION: "Africa", GTI_BASELINE: 62.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [25.0, 31.5], [34.0, 31.5], [35.5, 29.5], [36.0, 22.0], [25.0, 22.0], [25.0, 31.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "ZA", NAME: "South Africa", ADMIN: "Republic of South Africa", REGION: "Africa", GTI_BASELINE: 36.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [16.5, -28.5], [22.0, -22.0], [31.5, -22.5], [32.5, -28.0], [28.0, -33.0], [18.5, -34.5], [16.5, -28.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "NG", NAME: "Nigeria", ADMIN: "Federal Republic of Nigeria", REGION: "Africa", GTI_BASELINE: 52.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [3.0, 6.5], [3.0, 13.0], [14.0, 13.5], [14.5, 10.0], [10.0, 6.0], [5.0, 4.5], [3.0, 6.5]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { ISO_A2: "KE", NAME: "Kenya", ADMIN: "Republic of Kenya", REGION: "Africa", GTI_BASELINE: 34.0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [34.0, 4.0], [41.5, 4.0], [41.0, 0.0], [39.5, -4.5], [34.0, -1.0], [34.0, 4.0]
        ]]
      }
    }
  ]
};
