import { Filter, LayoutGrid } from "lucide-react";
import { motion } from "motion/react";

import { cardVariants, createStagger } from "../../animations/variants";
import type { CameraFeed } from "../../data/dashboard";
import { ActionButton } from "../shared/ActionButton";
import { GlassPanel } from "../shared/GlassPanel";
import { SectionTitle } from "../shared/SectionTitle";
import { CameraFeedCard } from "./CameraFeedCard";

interface CameraGridProps {
  cameras: CameraFeed[];
  focusedCameraId: string;
  alertCount: number;
  onFocusCamera: (cameraId: string) => void;
}

export function CameraGrid({
  cameras,
  focusedCameraId,
  alertCount,
  onFocusCamera,
}: CameraGridProps) {
  return (
    <GlassPanel variants={cardVariants} className="p-5">
      <div className="space-y-5">
        <SectionTitle
          eyebrow="Tower network"
          title="Live tower monitoring"
          description="Temperature, gas, and humidity anomalies are visualized in real time for early fire detection."
          action={
            <div className="flex flex-wrap items-center gap-3">
              <ActionButton icon={Filter} variant="secondary">Sensor filters</ActionButton>
              <ActionButton icon={LayoutGrid} variant="secondary">
                {alertCount} fire alerts
              </ActionButton>
            </div>
          }
        />

        <motion.div
          variants={createStagger(0.08, 0.06)}
          initial="hidden"
          animate="visible"
          className="grid gap-3 xl:grid-cols-2"
        >
          {cameras.map((camera) => (
            <CameraFeedCard
              key={camera.id}
              camera={camera}
              isFocused={camera.id === focusedCameraId}
              onFocus={onFocusCamera}
            />
          ))}
        </motion.div>
      </div>
    </GlassPanel>
  );
}
