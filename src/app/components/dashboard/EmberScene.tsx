import Spline from "@splinetool/react-spline";
import { motion } from "motion/react";

import { cardVariants } from "../../animations/variants";
import { GlassPanel } from "../shared/GlassPanel";
import { SectionTitle } from "../shared/SectionTitle";

const EMBER_SCENE_URL = "https://prod.spline.design/3Isx5AaM5wrJ1V27/scene.splinecode";

export function EmberScene() {
  return (
    <GlassPanel variants={cardVariants} className="p-5 sm:p-6">
      <div className="relative">
        <SectionTitle
          eyebrow="Interactive Ember"
          title="3D Incident Visualization"
          description="Explore a live 3D fire-intelligence layer directly inside the command surface."
        />

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          className="relative mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,30,0.94),rgba(7,11,21,0.94))]"
        >
          <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.22),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.18),transparent_48%)]" />
          <div className="relative h-[420px] w-full sm:h-[520px]">
            <Spline scene={EMBER_SCENE_URL} />
          </div>
        </motion.div>
      </div>
    </GlassPanel>
  );
}

