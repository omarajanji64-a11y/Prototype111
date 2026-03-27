export type NavigationId =
  | "overview"
  | "cameras"
  | "alerts"
  | "analytics"
  | "map"
  | "automation"
  | "setup";

export type CameraStatus = "safe" | "warning" | "fire";
export type AlertSeverity = "critical" | "high" | "medium";
export type Tone = "cyan" | "orange" | "green" | "slate";
export type SensorStatus = "online" | "watch" | "alert";

export interface NavigationItem {
  id: NavigationId;
  label: string;
  shortLabel: string;
}

export interface DetectionBox {
  id: string;
  label: string;
  confidence: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface LinkedCamera {
  id: string;
  name: string;
  resolution: string;
  coverage: string;
  streamHint: string;
}

export interface TowerSensor {
  id: string;
  name: string;
  type: string;
  location: string;
  reading: string;
  status: SensorStatus;
}

export interface CameraFeed {
  id: string;
  name: string;
  location: string;
  zone: string;
  status: CameraStatus;
  summary: string;
  imageUrl: string;
  detections: number;
  temperature: number;
  latency: string;
  confidence: number;
  lastSweep: string;
  boxes: DetectionBox[];
  linkedCamera: LinkedCamera;
  sensors: TowerSensor[];
}

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  type: string;
  location: string;
  cameraId: string;
  timestamp: string;
  description: string;
  responseOwner: string;
  eta: string;
}

export interface HeroHighlight {
  label: string;
  value: string;
  detail: string;
}

export interface SystemCard {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: Tone;
}

export interface PerformanceMetric {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  progress: number;
}

export interface ActivityPoint {
  time: string;
  detections: number;
  confidence: number;
}

export interface AlertFrequencyPoint {
  day: string;
  critical: number;
  high: number;
  medium: number;
}

export interface ForestZone {
  id: string;
  name: string;
  cameraId: string;
  status: CameraStatus;
  x: number;
  y: number;
  risk: string;
  note: string;
}

export const navigationItems: NavigationItem[] = [
  { id: "overview", label: "Overview", shortLabel: "Home" },
  { id: "cameras", label: "Main Tower", shortLabel: "Tower" },
  { id: "alerts", label: "Alerts", shortLabel: "Alerts" },
  { id: "analytics", label: "Analytics", shortLabel: "Data" },
  { id: "map", label: "Forest Map", shortLabel: "Map" },
  { id: "automation", label: "UAV Response", shortLabel: "UAV" },
  { id: "setup", label: "Setup", shortLabel: "Setup" },
];

export const heroHighlights: HeroHighlight[] = [
  {
    label: "Deployment",
    value: "1 Main Tower",
    detail: "A single command tower anchors the prototype with one linked camera and modular sensor coverage.",
  },
  {
    label: "Prototype Cost",
    value: "< $400",
    detail: "Maintains a low-cost build while keeping live AI, sensors, and LoRa connectivity in one stack.",
  },
  {
    label: "Mission",
    value: "Early Intervention",
    detail: "Detect smoke and fire early enough for fast field response and better ecosystem protection.",
  },
];

export const systemCards: SystemCard[] = [
  {
    id: "confidence",
    label: "Fire Probability Engine",
    value: "OKAB AI",
    detail: "Single-tower smoke and fire analysis running over the live optical feed.",
    tone: "cyan",
  },
  {
    id: "uptime",
    label: "Tower Availability",
    value: "1 / 1",
    detail: "Main Tower is the only active deployment target in this build.",
    tone: "green",
  },
  {
    id: "latency",
    label: "Detection Latency",
    value: "0.9 sec",
    detail: "Average time from frame capture to hazard classification in the live tower pipeline.",
    tone: "orange",
  },
  {
    id: "sync",
    label: "LoRa Link Health",
    value: "98.6%",
    detail: "Main Tower uplink remains synchronized with remote environmental modules.",
    tone: "slate",
  },
];

export const performanceMetrics: PerformanceMetric[] = [
  {
    label: "Average detection lead time",
    value: "2.1 min",
    change: "-32 sec",
    trend: "down",
    progress: 81,
  },
  {
    label: "Main tower uptime",
    value: "99.1%",
    change: "+1.7%",
    trend: "up",
    progress: 92,
  },
  {
    label: "False alarm ratio",
    value: "4.8%",
    change: "-0.8%",
    trend: "down",
    progress: 67,
  },
];

export const cameraFeeds: CameraFeed[] = [
  {
    id: "TWR-MAIN",
    name: "Main Tower",
    location: "Central Forest Watchline",
    zone: "Primary Hazard Corridor",
    status: "safe",
    summary:
      "Main Tower stands by with one linked camera, live OKAB analysis, LoRa connectivity, and modular environmental sensors ready for hazard detection.",
    detections: 0,
    temperature: 24,
    latency: "0.9 sec",
    confidence: 98,
    lastSweep: "Standby",
    imageUrl:
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400",
    boxes: [],
    linkedCamera: {
      id: "CAM-MAIN-01",
      name: "Main Tower POV",
      resolution: "1920 x 1080",
      coverage: "180 degree optical sweep",
      streamHint: "Webcam or IP camera source",
    },
    sensors: [
      {
        id: "SNS-THERMAL-01",
        name: "Thermal Array",
        type: "Temperature",
        location: "Upper mast",
        reading: "24 C baseline",
        status: "online",
      },
      {
        id: "SNS-HUMID-02",
        name: "Humidity Node",
        type: "Humidity",
        location: "Tower core",
        reading: "41% RH",
        status: "online",
      },
      {
        id: "SNS-GAS-03",
        name: "Smoke Particle Sensor",
        type: "Smoke",
        location: "Wind-facing arm",
        reading: "Nominal particulate range",
        status: "online",
      },
      {
        id: "SNS-LORA-04",
        name: "LoRa Relay",
        type: "Network",
        location: "Antenna bridge",
        reading: "98.6% sync",
        status: "online",
      },
    ],
  },
];

export const initialAlerts: AlertItem[] = [];

export const activitySeries: ActivityPoint[] = [
  { time: "00:00", detections: 0, confidence: 92 },
  { time: "04:00", detections: 1, confidence: 91 },
  { time: "08:00", detections: 1, confidence: 93 },
  { time: "12:00", detections: 2, confidence: 95 },
  { time: "16:00", detections: 3, confidence: 96 },
  { time: "20:00", detections: 2, confidence: 95 },
  { time: "23:59", detections: 1, confidence: 94 },
];

export const alertFrequency: AlertFrequencyPoint[] = [
  { day: "Mon", critical: 0, high: 1, medium: 1 },
  { day: "Tue", critical: 0, high: 1, medium: 2 },
  { day: "Wed", critical: 1, high: 1, medium: 2 },
  { day: "Thu", critical: 0, high: 2, medium: 1 },
  { day: "Fri", critical: 1, high: 2, medium: 2 },
  { day: "Sat", critical: 0, high: 1, medium: 1 },
  { day: "Sun", critical: 0, high: 1, medium: 1 },
];

export const forestZones: ForestZone[] = [
  {
    id: "central-watchline",
    name: "Central Canopy Corridor",
    cameraId: "TWR-MAIN",
    status: "safe",
    x: 46,
    y: 44,
    risk: "32%",
    note: "Main Tower provides the primary camera and sensor coverage for this corridor.",
  },
];
