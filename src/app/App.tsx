import { Sidebar } from "./components/Sidebar";
import { TopNavbar } from "./components/TopNavbar";
import { CameraFeedCard } from "./components/CameraFeedCard";
import { AlertPanel } from "./components/AlertPanel";
import { AnalyticsChart } from "./components/AnalyticsChart";
import { MapCard } from "./components/MapCard";
import { SystemStatus } from "./components/SystemStatus";

const cameraFeeds = [
  {
    id: "CAM-01",
    name: "Warehouse Section A",
    location: "North Wing, Zone 1",
    status: "fire" as const,
    detections: 3,
    imageUrl: "https://images.unsplash.com/photo-1768752435475-2e55baeed00f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjBpbnRlcmlvciUyMHNlY3VyaXR5fGVufDF8fHx8MTc3NDQ1OTc4MHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "CAM-04",
    name: "Storage Room B-12",
    location: "Building B, Level 2",
    status: "warning" as const,
    detections: 1,
    imageUrl: "https://images.unsplash.com/photo-1773517458621-0ac22ce01325?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9yYWdlJTIwcm9vbSUyMGluZHVzdHJpYWx8ZW58MXx8fHwxNzc0NDU5NzgxfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "CAM-07",
    name: "Production Floor 2",
    location: "Main Building, Floor 2",
    status: "warning" as const,
    detections: 2,
    imageUrl: "https://images.unsplash.com/photo-1654703680115-4ab46aebebc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWN0b3J5JTIwcHJvZHVjdGlvbiUyMGZsb29yfGVufDF8fHx8MTc3NDQ1OTc4Mnww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "CAM-03",
    name: "Office Wing",
    location: "East Building",
    status: "safe" as const,
    imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzQ0MDExODl8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "CAM-05",
    name: "Parking Lot Entrance",
    location: "Main Gate",
    status: "safe" as const,
    imageUrl: "https://images.unsplash.com/photo-1764684994222-739a69b1d61b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJraW5nJTIwbG90JTIwc3VydmVpbGxhbmNlfGVufDF8fHx8MTc3NDQ1NzYwOHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "CAM-08",
    name: "Exterior Perimeter",
    location: "South Side",
    status: "safe" as const,
    imageUrl: "https://images.unsplash.com/photo-1759065456033-9f2d6a400932?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwYnVpbGRpbmclMjBleHRlcmlvcnxlbnwxfHx8fDE3NzQzNDk5Njh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

export default function App() {
  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Top Navbar */}
      <TopNavbar />

      {/* Main Content */}
      <main className="ml-20 pt-20 p-8">
        <div className="max-w-[1920px] mx-auto space-y-8">
          {/* System Status */}
          <SystemStatus />

          {/* Main Grid */}
          <div className="grid grid-cols-3 gap-8">
            {/* Left Column: Camera Feeds */}
            <div className="col-span-2 space-y-6">
              {/* Camera Grid */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Live Camera Feeds</h2>
                    <p className="text-sm text-gray-400 mt-1">Real-time AI-powered monitoring</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 bg-[#FF5A1F]/20 border border-[#FF5A1F]/30 rounded-lg text-sm text-[#FF5A1F] font-medium">
                      3 Active Alerts
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {cameraFeeds.map((camera) => (
                    <CameraFeedCard key={camera.id} {...camera} />
                  ))}
                </div>
              </div>

              {/* Analytics */}
              <div className="mt-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">Analytics</h2>
                  <p className="text-sm text-gray-400 mt-1">Detection trends and insights</p>
                </div>
                <AnalyticsChart />
              </div>

              {/* Map */}
              <div className="mt-8">
                <MapCard />
              </div>
            </div>

            {/* Right Column: Alerts */}
            <div className="col-span-1">
              <AlertPanel />
            </div>
          </div>
        </div>
      </main>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#FF5A1F]/10 rounded-full blur-[150px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#3ABEFF]/10 rounded-full blur-[120px] opacity-20" />
      </div>
    </div>
  );
}
