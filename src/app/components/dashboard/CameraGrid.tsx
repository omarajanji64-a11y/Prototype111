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
    <GlassPanel variants={cardVariants} className="p-5 sm:p-6">
      <div className="relative">
        <SectionTitle
          eyebrow="Camera wall"
          title="AI-enhanced live feeds"
          description="Smoothly animated overlays highlight flames, smoke, and thermal drift without obscuring the feed."
          action={
            <div className="flex flex-wrap items-center gap-3">
              <ActionButton icon={Filter}>Priority filters</ActionButton>
              <ActionButton icon={LayoutGrid} variant="secondary">
                {alertCount} incidents surfaced
              </ActionButton>
            </div>
          }
        />

        <motion.div
          variants={createStagger(0.08, 0.06)}
          initial="hidden"
          animate="visible"
          className="mt-6 grid gap-4 xl:grid-cols-2"
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

