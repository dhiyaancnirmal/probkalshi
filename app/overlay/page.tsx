import { Suspense } from "react";
import { OverlayContent } from "./overlay-content";

export const metadata = {
  title: "Overlay | probkalshi.com",
  robots: "noindex, nofollow",
};

export default function OverlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      }
    >
      <OverlayContent />
    </Suspense>
  );
}
