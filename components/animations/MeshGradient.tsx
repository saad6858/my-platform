"use client";

import { useEffect, useState } from "react";

export function MeshGradient() {
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
        @keyframes mesh-float-1 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(10%, 15%) scale(1.05);
          }
          50% {
            transform: translate(-5%, 10%) scale(0.95);
          }
          75% {
            transform: translate(15%, -5%) scale(1.02);
          }
        }

        @keyframes mesh-float-2 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(-15%, 10%) scale(0.98);
          }
          50% {
            transform: translate(10%, -10%) scale(1.05);
          }
          75% {
            transform: translate(-5%, 15%) scale(1);
          }
        }

        @keyframes mesh-float-3 {
          0%,
          100% {
            transform: translate(0, 0) scale(1.02);
          }
          33% {
            transform: translate(20%, -10%) scale(0.95);
          }
          66% {
            transform: translate(-10%, 20%) scale(1.05);
          }
        }

        @keyframes mesh-float-4 {
          0%,
          100% {
            transform: translate(0, 0) scale(0.98);
          }
          33% {
            transform: translate(-20%, -15%) scale(1.05);
          }
          66% {
            transform: translate(15%, 5%) scale(1);
          }
        }

        @keyframes mesh-float-5 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-10%, -20%) scale(1.03);
          }
        }

        .mesh-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          will-change: transform;
        }
      `}</style>

      <div
        className="mesh-blob"
        style={{
          width: "50vw",
          height: "50vw",
          maxWidth: "700px",
          maxHeight: "700px",
          background: "rgba(16, 185, 129, 0.2)",
          top: "10%",
          left: "20%",
          animation: "mesh-float-1 30s ease-in-out infinite",
        }}
      />

      <div
        className="mesh-blob"
        style={{
          width: "45vw",
          height: "45vw",
          maxWidth: "650px",
          maxHeight: "650px",
          background: "rgba(99, 102, 241, 0.2)",
          top: "40%",
          left: "50%",
          animation: "mesh-float-2 35s ease-in-out infinite",
        }}
      />

      <div
        className="mesh-blob"
        style={{
          width: "55vw",
          height: "55vw",
          maxWidth: "750px",
          maxHeight: "750px",
          background: "rgba(20, 184, 166, 0.2)",
          top: "60%",
          left: "10%",
          animation: "mesh-float-3 28s ease-in-out infinite",
        }}
      />

      <div
        className="mesh-blob"
        style={{
          width: "40vw",
          height: "40vw",
          maxWidth: "600px",
          maxHeight: "600px",
          background: "rgba(245, 158, 11, 0.1)",
          top: "20%",
          left: "60%",
          animation: "mesh-float-4 32s ease-in-out infinite",
        }}
      />

      <div
        className="mesh-blob"
        style={{
          width: "48vw",
          height: "48vw",
          maxWidth: "680px",
          maxHeight: "680px",
          background: "rgba(16, 185, 129, 0.15)",
          top: "50%",
          left: "30%",
          animation: "mesh-float-5 25s ease-in-out infinite",
        }}
      />

      <div
        className="absolute inset-0"
        style={{ backdropFilter: "blur(100px)" }}
      />
    </div>
  );
}
