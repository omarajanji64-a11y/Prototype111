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

export interface FacilityZone {
  id: string;
  name: string;
  cameraId: string;
  status: CameraStatus;
  x: number;
  y: number;
  load: string;
  note: string;
}

export const navigationItems: NavigationItem[] = [
  { id: "overview", label: "Overview", shortLabel: "Home" },
  { id: "cameras", label: "Cameras", shortLabel: "Cams" },
  { id: "alerts", label: "Alerts", shortLabel: "Alerts" },
  { id: "analytics", label: "Analytics", shortLabel: "Data" },
  { id: "map", label: "Facility Map", shortLabel: "Map" },
  { id: "automation", label: "Automation", shortLabel: "Ops" },
];

export const heroHighlights: HeroHighlight[] = [
  {
    label: "Coverage",
    value: "24 cameras",
    detail: "Thermal + RGB across all critical zones",
  },
  {
    label: "Response SLA",
    value: "38 sec",
    detail: "Median dispatch handoff for active incidents",
  },
  {
    label: "False Positives",
    value: "0.2%",
    detail: "Continuously reduced by adaptive model tuning",
  },
];

export const systemCards: SystemCard[] = [
  {
    id: "confidence",
    label: "AI Confidence",
    value: "99.4%",
    detail: "Ensemble classifier calibrated",
    tone: "cyan",
  },
  {
    id: "uptime",
    label: "Platform Uptime",
    value: "99.98%",
    detail: "No monitoring interruptions this month",
    tone: "green",
  },
  {
    id: "latency",
    label: "Detection Latency",
    value: "1.2 sec",
    detail: "From thermal signal to operator alert",
    tone: "orange",
  },
  {
    id: "sync",
    label: "Edge Sync",
    value: "98.7%",
    detail: "All edge nodes reporting in lockstep",
    tone: "slate",
  },
];

export const performanceMetrics: PerformanceMetric[] = [
  {
    label: "Frames processed per second",
    value: "2,847",
    change: "+8.3%",
    trend: "up",
    progress: 84,
  },
  {
    label: "Average alert response",
    value: "45 sec",
    change: "-5 sec",
    trend: "down",
    progress: 68,
  },
  {
    label: "Thermal anomaly accuracy",
    value: "96.1%",
    change: "+1.9%",
    trend: "up",
    progress: 91,
  },
];

export const cameraFeeds: CameraFeed[] = [
  {
    id: "CAM-01",
    name: "Warehouse Section A",
    location: "North Wing, Zone 1",
    zone: "Storage Corridor",
    status: "fire",
    summary: "Visible flame contours expanding near pallet lane 3.",
    detections: 3,
    temperature: 71,
    latency: "0.8 sec",
    confidence: 98,
    lastSweep: "6 sec ago",
    imageUrl:
      "https://images.unsplash.com/photo-1768752435475-2e55baeed00f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjBpbnRlcmlvciUyMHNlY3VyaXR5fGVufDF8fHx8MTc3NDQ1OTc4MHww&ixlib=rb-4.1.0&q=80&w=1400",
    boxes: [
      { id: "fire-core", label: "Flame core", confidence: 98, left: 18, top: 24, width: 28, height: 38 },
      { id: "smoke-plume", label: "Smoke plume", confidence: 92, left: 48, top: 18, width: 24, height: 26 },
      { id: "heat-spread", label: "Heat spread", confidence: 89, left: 42, top: 48, width: 32, height: 22 },
    ],
  },
  {
    id: "CAM-04",
    name: "Storage Room B-12",
    location: "Building B, Level 2",
    zone: "Chemical Storage",
    status: "warning",
    summary: "Thermal hotspot above baseline threshold near vent stack.",
    detections: 1,
    temperature: 53,
    latency: "1.1 sec",
    confidence: 82,
    lastSweep: "9 sec ago",
    imageUrl:
      "https://images.unsplash.com/photo-1773517458621-0ac22ce01325?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9yYWdlJTIwcm9vbSUyMGluZHVzdHJpYWx8ZW58MXx8fHwxNzc0NDU5NzgxfDA&ixlib=rb-4.1.0&q=80&w=1400",
    boxes: [{ id: "vent-heat", label: "Heat anomaly", confidence: 82, left: 38, top: 20, width: 28, height: 32 }],
  },
  {
    id: "CAM-07",
    name: "Production Floor 2",
    location: "Main Building, Floor 2",
    zone: "Assembly Line",
    status: "warning",
    summary: "Intermittent thermal flicker detected near conveyor relay.",
    detections: 2,
    temperature: 47,
    latency: "1.4 sec",
    confidence: 78,
    lastSweep: "12 sec ago",
    imageUrl:
      "https://images.unsplash.com/photo-1654703680115-4ab46aebebc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWN0b3J5JTIwcHJvZHVjdGlvbiUyMGZsb29yfGVufDF8fHx8MTc3NDQ1OTc4Mnww&ixlib=rb-4.1.0&q=80&w=1400",
    boxes: [
      { id: "relay-1", label: "Thermal flare", confidence: 78, left: 24, top: 36, width: 20, height: 22 },
      { id: "relay-2", label: "Heat cluster", confidence: 75, left: 55, top: 44, width: 18, height: 20 },
    ],
  },
  {
    id: "CAM-03",
    name: "Office Wing",
    location: "East Building",
    zone: "Admin Corridor",
    status: "safe",
    summary: "No anomalies. Occupancy and ambient temperature stable.",
    detections: 0,
    temperature: 24,
    latency: "1.0 sec",
    confidence: 99,
    lastSweep: "4 sec ago",
    imageUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzQ0MDExODl8MA&ixlib=rb-4.1.0&q=80&w=1400",
    boxes: [],
  },
  {
    id: "CAM-05",
    name: "Parking Lot Entrance",
    location: "Main Gate",
    zone: "Exterior Access",
    status: "safe",
    summary: "Perimeter remains clear with low thermal noise.",
    detections: 0,
    temperature: 18,
    latency: "0.9 sec",
    confidence: 97,
    lastSweep: "5 sec ago",
    imageUrl:
      "https://images.unsplash.com/photo-1764684994222-739a69b1d61b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJraW5nJTIwbG90JTIwc3VydmVpbGxhbmNlfGVufDF8fHx8MTc3NDQ1NzYwOHww&ixlib=rb-4.1.0&q=80&w=1400",
    boxes: [],
  },
  {
    id: "CAM-08",
    name: "Exterior Perimeter",
    location: "South Side",
    zone: "Fence Line",
    status: "safe",
    summary: "Environmental conditions nominal with clean thermal profile.",
    detections: 0,
    temperature: 16,
    latency: "1.3 sec",
    confidence: 96,
    lastSweep: "7 sec ago",
    imageUrl:
      "https://images.unsplash.com/photo-1759065456033-9f2d6a400932?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwYnVpbGRpbmclMjBleHRlcmlvcnxlbnwxfHx8fDE3NzQzNDk5Njh8MA&ixlib=rb-4.1.0&q=80&w=1400",
    boxes: [],
  },
];

export const initialAlerts: AlertItem[] = [
  {
    id: "ALT-001",
    severity: "critical",
    type: "Fire Detected",
    location: "Warehouse Section A",
    cameraId: "CAM-01",
    timestamp: "Updated 2 min ago",
    description: "Visible flame with expanding thermal plume around pallet lane 3.",
    responseOwner: "Ops Team Alpha",
    eta: "Dispatch now",
  },
  {
    id: "ALT-002",
    severity: "high",
    type: "Smoke Detected",
    location: "Storage Room B-12",
    cameraId: "CAM-04",
    timestamp: "Updated 5 min ago",
    description: "Smoke density and vent temperature exceeded dynamic threshold.",
    responseOwner: "Safety Team Bravo",
    eta: "2 min",
  },
  {
    id: "ALT-003",
    severity: "medium",
    type: "Heat Anomaly",
    location: "Production Floor 2",
    cameraId: "CAM-07",
    timestamp: "Updated 12 min ago",
    description: "Short thermal spikes detected near relay enclosure on line 2.",
    responseOwner: "Maintenance Queue",
    eta: "6 min",
  },
];

export const activitySeries: ActivityPoint[] = [
  { time: "00:00", detections: 2, confidence: 90 },
  { time: "04:00", detections: 1, confidence: 94 },
  { time: "08:00", detections: 4, confidence: 93 },
  { time: "10:00", detections: 5, confidence: 95 },
  { time: "12:00", detections: 3, confidence: 92 },
  { time: "16:00", detections: 7, confidence: 96 },
  { time: "20:00", detections: 5, confidence: 94 },
  { time: "23:59", detections: 3, confidence: 95 },
];

export const alertFrequency: AlertFrequencyPoint[] = [
  { day: "Mon", critical: 1, high: 3, medium: 5 },
  { day: "Tue", critical: 2, high: 2, medium: 4 },
  { day: "Wed", critical: 3, high: 4, medium: 7 },
  { day: "Thu", critical: 1, high: 2, medium: 3 },
  { day: "Fri", critical: 2, high: 5, medium: 6 },
  { day: "Sat", critical: 0, high: 1, medium: 2 },
  { day: "Sun", critical: 1, high: 2, medium: 3 },
];

export const facilityZones: FacilityZone[] = [
  {
    id: "warehouse-a",
    name: "Warehouse A",
    cameraId: "CAM-01",
    status: "fire",
    x: 24,
    y: 28,
    load: "92%",
    note: "Immediate suppression workflow engaged.",
  },
  {
    id: "storage-b12",
    name: "Storage B-12",
    cameraId: "CAM-04",
    status: "warning",
    x: 61,
    y: 40,
    load: "74%",
    note: "Airflow hotspot escalating slowly.",
  },
  {
    id: "production-floor",
    name: "Production Floor 2",
    cameraId: "CAM-07",
    status: "warning",
    x: 48,
    y: 72,
    load: "68%",
    note: "Repeated anomaly near electrical relay.",
  },
  {
    id: "office-wing",
    name: "Office Wing",
    cameraId: "CAM-03",
    status: "safe",
    x: 38,
    y: 52,
    load: "35%",
    note: "No thermal deviations in occupied corridor.",
  },
  {
    id: "main-gate",
    name: "Main Gate",
    cameraId: "CAM-05",
    status: "safe",
    x: 78,
    y: 24,
    load: "27%",
    note: "Perimeter cameras operating within baseline.",
  },
];

