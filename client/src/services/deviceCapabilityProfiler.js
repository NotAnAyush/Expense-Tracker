/**
 * Device Capability Profiler & Hardware Inspection Service
 * Non-invasively inspects client hardware, runs a 30ms micro-benchmark,
 * and determines optimal feature tiers (Tier 0 Eco, Tier 1 Balanced, Tier 2 Pro).
 * Adheres to ADR-009.
 */

// 30ms Float32 Matrix Multiplication Micro-Benchmark
export const runWasmComputeBenchmark = () => {
  const size = 128;
  const a = new Float32Array(size * size);
  const b = new Float32Array(size * size);
  const c = new Float32Array(size * size);

  for (let i = 0; i < size * size; i++) {
    a[i] = Math.sin(i);
    b[i] = Math.cos(i);
  }

  const start = performance.now();
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let sum = 0.0;
      for (let k = 0; k < size; k++) {
        sum += a[i * size + k] * b[k * size + j];
      }
      c[i * size + j] = sum;
    }
  }
  const durationMs = performance.now() - start;
  return durationMs;
};

// Check WebGPU availability and memory limits
export const checkWebGpuSupport = async () => {
  if (typeof navigator !== 'undefined' && 'gpu' in navigator && navigator.gpu) {
    try {
      const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
      if (adapter) {
        const info = (await adapter.requestAdapterInfo?.()) || {};
        const maxBufferSize = adapter.limits?.maxStorageBufferBindingSize || 0;
        const isDiscreteGpu = maxBufferSize >= 1073741824; // >= 1GB buffer

        return {
          supported: true,
          vendor: info.vendor || 'Unknown GPU',
          architecture: info.architecture || 'WebGPU Compatible',
          isDiscreteGpu,
          maxStorageBufferBindingSize: maxBufferSize,
        };
      }
    } catch (e) {
      console.warn('[WebGPU Inspection Notice]:', e.message);
    }
  }
  return {
    supported: false,
    vendor: 'Generic Browser Canvas Engine',
    architecture: 'Standard WebGL Fallback',
    isDiscreteGpu: false,
    maxStorageBufferBindingSize: 0,
  };
};

// Evaluate full client hardware metrics and assign feature tier
export const profileDeviceCapabilities = async () => {
  const gpuInfo = await checkWebGpuSupport();
  const ramGb = typeof navigator !== 'undefined' && navigator.deviceMemory ? navigator.deviceMemory : 4;
  const cpuCores = typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4;
  
  let diskStorage = { quotaGb: 20, freeGb: 10 };
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const est = await navigator.storage.estimate();
      const quotaGb = est.quota ? (est.quota / (1024 * 1024 * 1024)).toFixed(1) : 20;
      const usageGb = est.usage ? (est.usage / (1024 * 1024 * 1024)).toFixed(1) : 0;
      const freeGb = Math.max(0, (quotaGb - usageGb)).toFixed(1);
      diskStorage = { quotaGb: Number(quotaGb), freeGb: Number(freeGb) };
    } catch (e) {
      // Storage estimate fallback
    }
  }

  let batteryInfo = { level: 100, charging: true, isLowBattery: false };
  if (typeof navigator !== 'undefined' && navigator.getBattery) {
    try {
      const b = await navigator.getBattery();
      batteryInfo = {
        level: Math.round(b.level * 100),
        charging: b.charging,
        isLowBattery: b.level <= 0.2 && !b.charging,
      };
    } catch (e) {
      // Battery API fallback
    }
  }

  const benchmarkDurationMs = runWasmComputeBenchmark();

  // Tier Classification Logic
  let tier = 1; // Default Balanced
  let tierLabel = 'Balanced Standard';

  if (ramGb <= 3 || cpuCores <= 2 || benchmarkDurationMs > 60 || batteryInfo.isLowBattery) {
    tier = 0; // Tier 0: Eco / Low-Spec
    tierLabel = 'Eco Mode (Low-Resource)';
  } else if (ramGb >= 8 && cpuCores >= 6 && (gpuInfo.supported || benchmarkDurationMs < 25)) {
    tier = 2; // Tier 2: Sovereign Ultra Pro
    tierLabel = 'Sovereign Ultra Pro';
  } else {
    tier = 1; // Tier 1: Balanced
    tierLabel = 'Balanced Standard';
  }

  return {
    tier,
    tierLabel,
    gpu: gpuInfo,
    ramGb,
    cpuCores,
    diskStorage,
    battery: batteryInfo,
    benchmarkDurationMs: Number(benchmarkDurationMs.toFixed(2)),
    optimizations: {
      canRunInBrowserSLM: tier >= 1 && gpuInfo.supported && diskStorage.freeGb >= 2,
      canRunLocalOcr: tier === 2,
      recommendedMonteCarloRuns: tier === 0 ? 100 : tier === 1 ? 500 : 2000,
      enableDeluxeParticles: tier >= 1,
      enableHeavyGlassmorphism: tier >= 1,
    },
  };
};
