/* filepath: components/ProjectCard.tsx */
"use client";

import { motion } from "framer-motion";
import { Project } from "@/types/index";
import { Camera, Calendar, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}

function getDueDateColor(dateStr: string): string {
  if (!dateStr) return "border-l-emerald-500";
  const due = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / 86400000);
  if (diffDays < 0) return "border-l-red-500";
  if (diffDays <= 3) return "border-l-amber-500";
  if (diffDays <= 7) return "border-l-yellow-500";
  return "border-l-emerald-500";
}

export function ProjectCard(: JSX.Element { project, onClick, onMoveLeft, onMoveRight }: ProjectCardProps) : JSX.Element {
  const borderColor = getDueDateColor(project.dateDue || "");

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`bg-white/5 border border-white/10 rounded-lg p-3 cursor-pointer hover:border-white/20 transition-colors border-l-4 ${borderColor}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-text-primary text-sm truncate">{project.clientName}</h4>
          <p className="text-xs text-text-secondary truncate">{project.propertyName}</p>
        </div>
        <GripVertical className="w-4 h-4 text-text-secondary/50 flex-shrink-0 ml-1" />
      </div>

      <div className="flex items-center gap-3 text-xs text-text-secondary mb-2">
        <span className="inline-flex items-center gap-1">
          <Camera className="w-3 h-3" />
          {project.photoCount}
        </span>
        <span className="inline-flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {project.dateDue ? new Date(project.dateDue).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-text-primary">
          ₨{project.price?.toLocaleString()}
        </span>
        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onMoveLeft}
            className="p-1 text-text-secondary/50 hover:text-text-primary hover:bg-white/5 rounded transition-colors"
            title="Move left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMoveRight}
            className="p-1 text-text-secondary/50 hover:text-text-primary hover:bg-white/5 rounded transition-colors"
            title="Move right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
