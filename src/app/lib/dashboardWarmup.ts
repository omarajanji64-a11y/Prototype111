import {
  activitySeries,
  alertFrequency,
  cameraFeeds,
  forestZones,
  initialAlerts,
  performanceMetrics,
  type CameraStatus,
} from "../data/dashboard";

interface TowerTopology {
  cameraIds: string[];
  statusTotals: Record<CameraStatus, number>;
  zoneByCameraId: Record<string, string>;
}

interface EnvironmentalMetrics {
  averageTemperature: number;
  maximumTemperature: number;
  averageRisk: number;
  peakConfidence: number;
}

interface ForestCoverage {
  nodeCount: number;
  alertingZones: number;
  zonesByStatus: Record<CameraStatus, string[]>;
}

interface ResourceEstimate {
  criticalAlerts: number;
  weeklyAlertLoad: number;
  averageConfidence: number;
  readinessScore: number;
}

export interface DashboardWarmupSnapshot {
  towerTopology: TowerTopology;
  environmentalMetrics: EnvironmentalMetrics;
  forestCoverage: ForestCoverage;
  resourceEstimate: ResourceEstimate;
}

let towerTopologyCache: TowerTopology | null = null;
let environmentalMetricsCache: EnvironmentalMetrics | null = null;
let forestCoverageCache: ForestCoverage | null = null;
let resourceEstimateCache: ResourceEstimate | null = null;

export function warmTowerTopology() {
  if (towerTopologyCache) {
    return towerTopologyCache;
  }

  towerTopologyCache = cameraFeeds.reduce<TowerTopology>(
    (snapshot, camera) => {
      snapshot.cameraIds.push(camera.id);
      snapshot.statusTotals[camera.status] += 1;
      snapshot.zoneByCameraId[camera.id] = camera.zone;
      return snapshot;
    },
    {
      cameraIds: [],
      statusTotals: {
        safe: 0,
        warning: 0,
        fire: 0,
      },
      zoneByCameraId: {},
    },
  );

  return towerTopologyCache;
}

export function warmEnvironmentalMetrics() {
  if (environmentalMetricsCache) {
    return environmentalMetricsCache;
  }

  const totalTemperature = cameraFeeds.reduce((sum, camera) => sum + camera.temperature, 0);
  const totalRisk = forestZones.reduce((sum, zone) => sum + Number.parseInt(zone.risk, 10), 0);
  const peakConfidence = Math.max(...cameraFeeds.map((camera) => camera.confidence), 0);

  environmentalMetricsCache = {
    averageTemperature: Math.round(totalTemperature / cameraFeeds.length),
    maximumTemperature: Math.max(...cameraFeeds.map((camera) => camera.temperature), 0),
    averageRisk: Math.round(totalRisk / forestZones.length),
    peakConfidence,
  };

  return environmentalMetricsCache;
}

export function warmForestCoverage() {
  if (forestCoverageCache) {
    return forestCoverageCache;
  }

  forestCoverageCache = forestZones.reduce<ForestCoverage>(
    (snapshot, zone) => {
      snapshot.zonesByStatus[zone.status].push(zone.name);
      if (zone.status !== "safe") {
        snapshot.alertingZones += 1;
      }
      return snapshot;
    },
    {
      nodeCount: forestZones.length,
      alertingZones: 0,
      zonesByStatus: {
        safe: [],
        warning: [],
        fire: [],
      },
    },
  );

  return forestCoverageCache;
}

export function warmResourceEstimate() {
  if (resourceEstimateCache) {
    return resourceEstimateCache;
  }

  const criticalAlerts = initialAlerts.filter((alert) => alert.severity === "critical").length;
  const weeklyAlertLoad = alertFrequency.reduce(
    (sum, point) => sum + point.critical + point.high + point.medium,
    0,
  );
  const averageConfidence =
    activitySeries.reduce((sum, point) => sum + point.confidence, 0) / activitySeries.length;
  const readinessScore = Math.round(
    performanceMetrics.reduce((sum, metric) => sum + metric.progress, 0) / performanceMetrics.length,
  );

  resourceEstimateCache = {
    criticalAlerts,
    weeklyAlertLoad,
    averageConfidence: Math.round(averageConfidence),
    readinessScore,
  };

  return resourceEstimateCache;
}

export function warmDashboardSnapshot(): DashboardWarmupSnapshot {
  return {
    towerTopology: warmTowerTopology(),
    environmentalMetrics: warmEnvironmentalMetrics(),
    forestCoverage: warmForestCoverage(),
    resourceEstimate: warmResourceEstimate(),
  };
}

export function getDashboardWarmupSnapshot() {
  return warmDashboardSnapshot();
}
