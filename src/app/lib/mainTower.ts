import type { AlertItem, CameraFeed, CameraStatus, TowerSensor } from "../data/dashboard";

export interface TowerDetectionLog {
  id: string;
  type: "fire" | "smoke";
  confidence: number;
  timestamp: number;
  source: string;
  snapshot: string | null;
  label: string;
  modelId: string;
}

export interface MainTowerTelemetry {
  activeSource: string;
  sourceBadge: string;
  isSourceReady: boolean;
  isAiEnabled: boolean;
  isModelLoaded: boolean;
  detectionsCount: number;
  detectionsToday: number;
  avgConfidence: number;
  latestSnapshot: string | null;
  latestDetection: TowerDetectionLog | null;
  detectionLogs: TowerDetectionLog[];
  modelId: string;
  modelLabel: string;
  runtimeError: string;
  modelError: string;
}

export const EMPTY_MAIN_TOWER_TELEMETRY: MainTowerTelemetry = {
  activeSource: "webcam",
  sourceBadge: "None",
  isSourceReady: false,
  isAiEnabled: false,
  isModelLoaded: false,
  detectionsCount: 0,
  detectionsToday: 0,
  avgConfidence: 0,
  latestSnapshot: null,
  latestDetection: null,
  detectionLogs: [],
  modelId: "",
  modelLabel: "",
  runtimeError: "",
  modelError: "",
};

function formatAlertTime(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(timestamp));
}

function getAlertSeverity(log: TowerDetectionLog): AlertItem["severity"] {
  if (log.type === "fire" && log.confidence >= 0.8) {
    return "critical";
  }

  if (log.type === "fire" || log.confidence >= 0.7) {
    return "high";
  }

  return "medium";
}

export function getTowerStatusFromTelemetry(telemetry: MainTowerTelemetry): CameraStatus {
  if (telemetry.detectionLogs.some((log) => log.type === "fire")) {
    return "fire";
  }

  if (telemetry.detectionLogs.length > 0 || telemetry.runtimeError || telemetry.modelError) {
    return "warning";
  }

  return "safe";
}

export function getTowerConfidence(baseConfidence: number, telemetry: MainTowerTelemetry) {
  if (!telemetry.latestDetection) {
    return baseConfidence;
  }

  return Math.max(baseConfidence, Math.round(telemetry.latestDetection.confidence * 100));
}

export function getTowerTemperature(baseTemperature: number, telemetry: MainTowerTelemetry) {
  if (!telemetry.latestDetection) {
    return baseTemperature;
  }

  return telemetry.latestDetection.type === "fire"
    ? Math.min(baseTemperature + 18, 72)
    : Math.min(baseTemperature + 8, 54);
}

export function getTowerLastSweep(telemetry: MainTowerTelemetry) {
  if (telemetry.isAiEnabled && telemetry.isSourceReady) {
    return "Live";
  }

  if (telemetry.latestDetection) {
    return `Logged ${formatAlertTime(telemetry.latestDetection.timestamp)}`;
  }

  return "Standby";
}

export function getTowerSummary(tower: CameraFeed, telemetry: MainTowerTelemetry) {
  if (telemetry.modelError) {
    return "The OKAB runtime could not load the selected model. Resolve the model issue before starting live hazard detection.";
  }

  if (telemetry.runtimeError) {
    return "The linked camera is present, but the live tower pipeline cannot read frames from the current source yet.";
  }

  if (telemetry.latestDetection?.type === "fire") {
    return "Main Tower confirmed a fire signature on the linked camera. Review the POV, sensor stack, and detection log immediately.";
  }

  if (telemetry.latestDetection?.type === "smoke") {
    return "Main Tower detected smoke on the linked camera and shifted the tower into watch mode for rapid verification.";
  }

  if (telemetry.isAiEnabled && telemetry.isSourceReady) {
    return `Main Tower is actively analyzing the linked camera feed with ${telemetry.modelLabel || "OKAB"} and has no active hazard logs right now.`;
  }

  if (telemetry.isAiEnabled) {
    return "Main Tower AI is initializing and waiting for a readable camera source before hazard analysis can begin.";
  }

  return tower.summary;
}

export function getTowerSensors(sensors: TowerSensor[], telemetry: MainTowerTelemetry) {
  if (telemetry.latestDetection?.type === "fire") {
    return sensors.map((sensor) => {
      if (sensor.type === "Temperature") {
        return {
          ...sensor,
          status: "alert",
          reading: "Rapid thermal escalation detected",
        };
      }

      if (sensor.type === "Smoke") {
        return {
          ...sensor,
          status: "alert",
          reading: "Smoke particle spike confirmed",
        };
      }

      if (sensor.type === "Humidity") {
        return {
          ...sensor,
          status: "watch",
          reading: "Dry air trend under review",
        };
      }

      return sensor;
    });
  }

  if (telemetry.latestDetection?.type === "smoke") {
    return sensors.map((sensor) => {
      if (sensor.type === "Smoke") {
        return {
          ...sensor,
          status: "watch",
          reading: "Elevated smoke particles detected",
        };
      }

      if (sensor.type === "Humidity") {
        return {
          ...sensor,
          status: "watch",
          reading: "Humidity trend drifting low",
        };
      }

      return sensor;
    });
  }

  if (telemetry.modelError || telemetry.runtimeError) {
    return sensors.map((sensor) =>
      sensor.type === "Network"
        ? {
            ...sensor,
            status: "watch",
            reading: "Verifying tower runtime and link stability",
          }
        : sensor,
    );
  }

  return sensors;
}

export function buildTowerAlerts(tower: CameraFeed, telemetry: MainTowerTelemetry): AlertItem[] {
  return telemetry.detectionLogs.slice(0, 8).map((log) => {
    const severity = getAlertSeverity(log);

    return {
      id: log.id,
      severity,
      type: log.type === "fire" ? "Fire signature detected" : "Smoke signature detected",
      location: `${tower.name} · ${tower.location}`,
      cameraId: tower.id,
      timestamp: `Captured ${formatAlertTime(log.timestamp)}`,
      description: `${log.label} was logged on ${tower.linkedCamera.name} with ${Math.round(
        log.confidence * 100,
      )}% confidence using ${telemetry.modelLabel || "OKAB"}.`,
      responseOwner: severity === "critical" ? "Hazard automation" : "Tower operator queue",
      eta: severity === "critical" ? "Immediate review" : "Operator review in 90 sec",
    };
  });
}
