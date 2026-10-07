import React from "react";
import ReactDOM from "react-dom/client";
import CourseMap, { type MapPoint } from "./pages/course/components/CourseMap";
import "./index.css";

function readPoints(): MapPoint[] {
  try {
    const raw = new URLSearchParams(window.location.search).get("points");
    const parsed: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(parsed)) return [];

    return parsed.slice(0, 50).filter((point): point is MapPoint => {
      if (typeof point !== "object" || point === null) return false;
      const candidate = point as Record<string, unknown>;
      return (
        typeof candidate.lat === "number" &&
        Number.isFinite(candidate.lat) &&
        candidate.lat >= -90 &&
        candidate.lat <= 90 &&
        typeof candidate.lng === "number" &&
        Number.isFinite(candidate.lng) &&
        candidate.lng >= -180 &&
        candidate.lng <= 180
      );
    });
  } catch {
    return [];
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="h-dvh w-full bg-white">
      <CourseMap points={readPoints()} />
    </div>
  </React.StrictMode>,
);
