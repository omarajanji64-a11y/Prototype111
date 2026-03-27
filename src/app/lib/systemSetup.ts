import type { CameraFeed, TowerSensor } from "../data/dashboard";

export type CameraSourceId = "webcam" | "ip" | "screen";
export type UavResponseMode = "assessment" | "suppression" | "escort";

export interface TowerSetupConfig {
  cameraConfigured: boolean;
  cameraName: string;
  cameraSource: CameraSourceId;
  ipCameraUrl: string;
  aiEnabled: boolean;
  modelId: string;
  resolution: string;
  coverage: string;
}

export interface SensorSetupItem extends TowerSensor {
  enabled: boolean;
}

export interface UavSetupConfig {
  enabled: boolean;
  autoDispatch: boolean;
  callsign: string;
  launchPad: string;
  responseMode: UavResponseMode;
  patrolAltitude: string;
}

export interface SystemSetupState {
  tower: TowerSetupConfig;
  sensors: SensorSetupItem[];
  uav: UavSetupConfig;
}

const STORAGE_KEY = "okab-system-setup-v1";

export function getCameraSourceLabel(source: CameraSourceId) {
  if (source === "ip") {
    return "IP Camera";
  }

  if (source === "screen") {
    return "Screen Share";
  }

  return "Webcam";
}

export function createDefaultSystemSetup(tower: CameraFeed, defaultModelId: string): SystemSetupState {
  return {
    tower: {
      cameraConfigured: true,
      cameraName: tower.linkedCamera.name,
      cameraSource: "webcam",
      ipCameraUrl: "",
      aiEnabled: true,
      modelId: defaultModelId,
      resolution: tower.linkedCamera.resolution,
      coverage: tower.linkedCamera.coverage,
    },
    sensors: tower.sensors.map((sensor) => ({
      ...sensor,
      enabled: true,
    })),
    uav: {
      enabled: true,
      autoDispatch: true,
      callsign: "OKAB-UAV-01",
      launchPad: "Main Tower Deck",
      responseMode: "assessment",
      patrolAltitude: "120 m",
    },
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function readStoredSystemSetup(tower: CameraFeed, defaultModelId: string) {
  const fallback = createDefaultSystemSetup(tower, defaultModelId);

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return fallback;
    }

    const parsedValue = JSON.parse(rawValue);

    if (!isObject(parsedValue)) {
      return fallback;
    }

    const towerConfig = isObject(parsedValue.tower) ? parsedValue.tower : {};
    const sensorsConfig = Array.isArray(parsedValue.sensors) ? parsedValue.sensors : [];
    const uavConfig = isObject(parsedValue.uav) ? parsedValue.uav : {};

    const nextSensors = fallback.sensors.map((sensor) => {
      const storedSensor = sensorsConfig.find(
        (candidate) => isObject(candidate) && candidate.id === sensor.id,
      ) as Record<string, unknown> | undefined;

      return {
        ...sensor,
        enabled: typeof storedSensor?.enabled === "boolean" ? storedSensor.enabled : sensor.enabled,
      };
    });

    return {
      tower: {
        ...fallback.tower,
        cameraConfigured:
          typeof towerConfig.cameraConfigured === "boolean"
            ? towerConfig.cameraConfigured
            : fallback.tower.cameraConfigured,
        cameraName:
          typeof towerConfig.cameraName === "string" && towerConfig.cameraName.trim()
            ? towerConfig.cameraName
            : fallback.tower.cameraName,
        cameraSource:
          towerConfig.cameraSource === "ip" || towerConfig.cameraSource === "screen" || towerConfig.cameraSource === "webcam"
            ? towerConfig.cameraSource
            : fallback.tower.cameraSource,
        ipCameraUrl:
          typeof towerConfig.ipCameraUrl === "string" ? towerConfig.ipCameraUrl : fallback.tower.ipCameraUrl,
        aiEnabled:
          typeof towerConfig.aiEnabled === "boolean" ? towerConfig.aiEnabled : fallback.tower.aiEnabled,
        modelId:
          typeof towerConfig.modelId === "string" && towerConfig.modelId.trim()
            ? towerConfig.modelId
            : fallback.tower.modelId,
        resolution:
          typeof towerConfig.resolution === "string" && towerConfig.resolution.trim()
            ? towerConfig.resolution
            : fallback.tower.resolution,
        coverage:
          typeof towerConfig.coverage === "string" && towerConfig.coverage.trim()
            ? towerConfig.coverage
            : fallback.tower.coverage,
      },
      sensors: nextSensors,
      uav: {
        ...fallback.uav,
        enabled: typeof uavConfig.enabled === "boolean" ? uavConfig.enabled : fallback.uav.enabled,
        autoDispatch:
          typeof uavConfig.autoDispatch === "boolean" ? uavConfig.autoDispatch : fallback.uav.autoDispatch,
        callsign:
          typeof uavConfig.callsign === "string" && uavConfig.callsign.trim()
            ? uavConfig.callsign
            : fallback.uav.callsign,
        launchPad:
          typeof uavConfig.launchPad === "string" && uavConfig.launchPad.trim()
            ? uavConfig.launchPad
            : fallback.uav.launchPad,
        responseMode:
          uavConfig.responseMode === "suppression" ||
          uavConfig.responseMode === "escort" ||
          uavConfig.responseMode === "assessment"
            ? uavConfig.responseMode
            : fallback.uav.responseMode,
        patrolAltitude:
          typeof uavConfig.patrolAltitude === "string" && uavConfig.patrolAltitude.trim()
            ? uavConfig.patrolAltitude
            : fallback.uav.patrolAltitude,
      },
    };
  } catch {
    return fallback;
  }
}

export function persistSystemSetup(setup: SystemSetupState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(setup));
  } catch {
    // Ignore storage failures so the dashboard can continue using in-memory setup.
  }
}

export function getConfiguredSensors(sensors: SensorSetupItem[]): TowerSensor[] {
  return sensors
    .filter((sensor) => sensor.enabled)
    .map(({ enabled, ...sensor }) => sensor);
}
