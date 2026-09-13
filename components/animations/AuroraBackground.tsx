"use client";

import { useEffect, useState } from "react";

export function AuroraBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <style jsx>{`
        @keyframes aurora-drift-1 {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) scale(1);
          }
          33% {
            transform: translate(-30%, -40%) rotate(120deg) scale(1.1);
          }
          66% {
            transform: translate(-60%, -30%) rotate(240deg) scale(0.9);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) scale(1);
          }
        }

        @keyframes aurora-drift-2 {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) scale(1.1);
          }
          33% {
            transform: translate(-70%, -60%) rotate(-120deg) scale(1);
          }
          66% {
            transform: translate(-40%, -70%) rotate(-240deg) scale(1.2);
          }
          100% {
            transform: translate(-50%, -50%) rotate(-360deg) scale(1.1);
          }
        }

        @keyframes aurora-drift-3 {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) scale(0.9);
          }
          50% {
            transform: translate(-50%, -30%) rotate(180deg) scale(1.1);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) scale(0.9);
          }
        }

        @keyframes aurora-drift-4 {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) scale(1);
          }
          50% {
            transform: translate(-30%, -60%) rotate(-180deg) scale(1.15);
          }
          100% {
            transform: translate(-50%, -50%) rotate(-360deg) scale(1);
          }
        }

        .aurora-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          will-change: transform;
        }
      `}</style>

      {/* Emerald blob */}
      <div
        className="aurora-blob"
        style={{
          width: "60vw",
          height: "60vw",
          maxWidth: "800px",
          maxHeight: "800px",
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0) 70%)",
          top: "20%",
          left: "30%",
          animation: "aurora-drift-1 20s linear infinite",
        }}
      />

      {/* Indigo blob */}
      <div
        className="aurora-blob"
        style={{
          width: "50vw",
          height: "50vw",
          maxWidth: "700px",
          maxHeight: "700px",
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0) 70%)",
          top: "50%",
          left: "60%",
          animation: "aurora-drift-2 25s linear infinite",
        }}
      />

      {/* Teal blob */}
      <div
        className="aurora-blob"
        style={{
          width: "55vw",
          height: "55vw",
          maxWidth: "750px",
          maxHeight: "750px",
          background:
            "radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, rgba(20, 184, 166, 0) 70%)",
          top: "60%",
          left: "20%",
          animation: "aurora-drift-3 22s linear infinite",
        }}
      />

      {/* Amber blob */}
      <div
        className="aurora-blob"
        style={{
          width: "45vw",
          height: "45vw",
          maxWidth: "600px",
          maxHeight: "600px",
          background:
            "radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0) 70%)",
          top: "30%",
          left: "70%",
          animation: "aurora-drift-4 18s linear infinite",
        }}
      />
    </div>
  );
}
