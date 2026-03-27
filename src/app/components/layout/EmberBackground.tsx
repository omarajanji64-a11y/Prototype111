import { lazy, Suspense } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

const EMBER_SCENE_URL = "https://prod.spline.design/3Isx5AaM5wrJ1V27/scene.splinecode";

export function EmberBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.14] saturate-0">
        <Suspense fallback={null}>
          <Spline scene={EMBER_SCENE_URL} />
        </Suspense>
      </div>
      <div className="command-app-bg pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,13,20,0.68),rgba(10,13,20,0.9))]" />
    </div>
  );
}
