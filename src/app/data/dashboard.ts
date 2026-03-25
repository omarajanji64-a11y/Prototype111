export type NavigationId =
  | "overview"
  | "cameras"
  | "alerts"
  | "analytics"
  | "map"
  | "automation";

export type CameraStatus = "safe" | "warning" | "fire";
export type AlertSeverity = "critical" | "high" | "medium";
export type Tone = "cyan" | "orange" | "green" | "slate";

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
  { id: "cameras", label: "Tower Network", shortLabel: "Towers" },
  { id: "alerts", label: "Alerts", shortLabel: "Alerts" },
  { id: "analytics", label: "Analytics", shortLabel: "Data" },
  { id: "map", label: "Forest Map", shortLabel: "Map" },
  { id: "automation", label: "UAV Response", shortLabel: "UAV" },
];

export const heroHighlights: HeroHighlight[] = [
  {
    label: "Deployment",
    value: "3 Mini Towers",
    detail: "Sensor towers connected with LoRa in forest and rural zones",
  },
  {
    label: "Prototype Cost",
    value: "< $400",
    detail: "Built with school-level and accessible hardware",
  },
  {
    label: "Social Benefit",
    value: "Early Intervention",
    detail: "Supports farmers, ecosystems, and rural safety",
  },
];

export const systemCards: SystemCard[] = [
  {
    id: "confidence",
    label: "Fire Probability Engine",
    value: "AI + IoT",
    detail: "Raspberry Pi analysis over temperature, gas, and humidity",
    tone: "cyan",
  },
  {
    id: "uptime",
    label: "Tower Availability",
    value: "3 / 3",
    detail: "All prototype towers online",
    tone: "green",
  },
  {
    id: "latency",
    label: "Detection Latency",
    value: "1.4 sec",
    detail: "Average from sensor event to alert message",
    tone: "orange",
  },
  {
    id: "sync",
    label: "LoRa Link Health",
    value: "97.8%",
    detail: "Multi-tower confirmation packets synchronized",
    tone: "slate",
  },
];

export const performanceMetrics: PerformanceMetric[] = [
  {
    label: "Average detection lead time",
    value: "2.6 min",
    change: "-41 sec",
    trend: "down",
    progress: 79,
  },
  {
    label: "Multi-tower confirmation rate",
    value: "94.2%",
    change: "+3.4%",
    trend: "up",
    progress: 86,
  },
  {
    label: "False alarm ratio",
    value: "5.1%",
    change: "-1.2%",
    trend: "down",
    progress: 64,
  },
];

export const cameraFeeds: CameraFeed[] = [
  {
    id: "TWR-01",
    name: "Pine Ridge Tower",
    location: "North Forest Edge",
    zone: "High-Risk Forest Corridor",
    status: "fire",
    summary: "Rapid heat increase and smoke signature detected across two sensor nodes.",
    detections: 2,
    temperature: 67,
    latency: "1.1 sec",
    confidence: 97,
    lastSweep: "5 sec ago",
    imageUrl:
      "https://images.unsplash.com/photo-1473773508845-188df298d2d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400",
    boxes: [
      { id: "smoke-front", label: "Smoke rise", confidence: 96, left: 20, top: 18, width: 28, height: 34 },
      { id: "flame-base", label: "Heat cluster", confidence: 93, left: 47, top: 42, width: 24, height: 28 },
    ],
  },
  {
    id: "TWR-02",
    name: "Olive Farm Tower",
    location: "East Agricultural Belt",
    zone: "Crop Protection Zone",
    status: "warning",
    summary: "Gas sensor spike and low humidity suggest possible pre-fire conditions.",
    detections: 1,
    temperature: 49,
    latency: "1.6 sec",
    confidence: 84,
    lastSweep: "9 sec ago",
    imageUrl:
      "https://images.unsplash.com/photo-1476231682828-37e571bc172f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400",
    boxes: [{ id: "gas-cloud", label: "Gas anomaly", confidence: 84, left: 38, top: 24, width: 26, height: 32 }],
  },
  {
    id: "TWR-03",
    name: "Rural Border Tower",
    location: "South Village Boundary",
    zone: "Rural Safety Zone",
    status: "safe",
    summary: "No abnormal values. Humidity and temperature are within safe thresholds.",
    detections: 0,
    temperature: 27,
    latency: "1.3 sec",
    confidence: 98,
    lastSweep: "7 sec ago",
    imageUrl:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400",
    boxes: [],
  },
];

export const initialAlerts: AlertItem[] = [
  {
    id: "ALT-001",
    severity: "critical",
    type: "High Fire Probability",
    location: "Pine Ridge Tower Zone",
    cameraId: "TWR-01",
    timestamp: "Updated 2 min ago",
    description: "Temperature and smoke thresholds exceeded. Immediate confirmation received from second node.",
    responseOwner: "Field Team A",
    eta: "UAV launch in 40 sec",
  },
  {
    id: "ALT-002",
    severity: "high",
    type: "Gas and Humidity Anomaly",
    location: "Olive Farm Tower Zone",
    cameraId: "TWR-02",
    timestamp: "Updated 6 min ago",
    description: "Methane/CO trend rose while humidity dropped below safe baseline.",
    responseOwner: "Monitoring Team",
    eta: "Tower cross-check in 90 sec",
  },
  {
    id: "ALT-003",
    severity: "medium",
    type: "Heat Spike",
    location: "Rural Border Sector",
    cameraId: "TWR-03",
    timestamp: "Updated 14 min ago",
    description: "Brief thermal increase detected; currently under watch status.",
    responseOwner: "Data Validation Team",
    eta: "Manual review in 5 min",
  },
];

export const activitySeries: ActivityPoint[] = [
  { time: "00:00", detections: 1, confidence: 91 },
  { time: "04:00", detections: 1, confidence: 93 },
  { time: "08:00", detections: 2, confidence: 94 },
  { time: "12:00", detections: 3, confidence: 95 },
  { time: "16:00", detections: 5, confidence: 96 },
  { time: "20:00", detections: 4, confidence: 95 },
  { time: "23:59", detections: 2, confidence: 94 },
];

export const alertFrequency: AlertFrequencyPoint[] = [
  { day: "Mon", critical: 1, high: 2, medium: 3 },
  { day: "Tue", critical: 0, high: 2, medium: 2 },
  { day: "Wed", critical: 1, high: 3, medium: 4 },
  { day: "Thu", critical: 1, high: 2, medium: 3 },
  { day: "Fri", critical: 2, high: 3, medium: 4 },
  { day: "Sat", critical: 0, high: 1, medium: 2 },
  { day: "Sun", critical: 1, high: 1, medium: 2 },
];

export const forestZones: ForestZone[] = [
  {
    id: "pine-ridge",
    name: "Pine Ridge Forest",
    cameraId: "TWR-01",
    status: "fire",
    x: 24,
    y: 27,
    risk: "93%",
    note: "Critical zone confirmed by multi-tower detection.",
  },
  {
    id: "olive-farm",
    name: "Olive Farm Belt",
    cameraId: "TWR-02",
    status: "warning",
    x: 58,
    y: 39,
    risk: "74%",
    note: "Gas and humidity anomalies under continuous observation.",
  },
  {
    id: "village-border",
    name: "Village Border",
    cameraId: "TWR-03",
    status: "safe",
    x: 43,
    y: 61,
    risk: "28%",
    note: "Safe baseline with no active fire indicators.",
  },
  {
    id: "agri-north",
    name: "North Crop Fields",
    cameraId: "TWR-02",
    status: "warning",
    x: 74,
    y: 24,
    risk: "61%",
    note: "Dry wind and low humidity increase preventive risk level.",
  },
  {
    id: "rural-west",
    name: "Rural West Access",
    cameraId: "TWR-03",
    status: "safe",
    x: 30,
    y: 78,
    risk: "22%",
    note: "Routine monitoring only, no intervention needed.",
  },
];
