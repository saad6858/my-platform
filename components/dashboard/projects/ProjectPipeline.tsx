/* filepath: components/ProjectPipeline.tsx */
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FadeIn } from "@/components/animations/FadeIn";
import { GlassCard } from "@/components/layout/GlassCard";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectModal } from "@/components/ProjectModal";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { Project } from "@/types/index";
import {
  Plus,
  LayoutGrid,
  List,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
} from "lucide-react";

type ProjectStatus = "pending" | "in_progress" | "review" | "delivered" | "paid" | "cancelled";
type ViewMode = "kanban" | "list" | "calendar";

const columns: { id: ProjectStatus; label: string; color: string }[] = [
  { id: "pending", label: "Pending", color: "bg-bg-primary0" },
  { id: "in_progress", label: "In Progress", color: "bg-accent-quaternary" },
  { id: "review", label: "Review", color: "bg-accent-quaternary" },
  { id: "delivered", label: "Delivered", color: "bg-accent-primary" },
  { id: "paid", label: "Paid", color: "bg-accent-quaternary" },
  { id: "cancelled", label: "Cancelled", color: "bg-danger" },
];

const statusConfig: Record<ProjectStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-white/10 text-text-secondary border-white/10" },
  in_progress: { label: "In Progress", color: "bg-accent-quaternary/20 text-accent-quaternary border-accent-quaternary/30" },
  review: { label: "Review", color: "bg-accent-quaternary/20 text-accent-quaternary border-accent-quaternary/30" },
  delivered: { label: "Delivered", color: "bg-accent-primary/20 text-accent-primary border-accent-primary/30" },
  paid: { label: "Paid", color: "bg-accent-quaternary/20 text-accent-quaternary border-accent-quaternary/30" },
  cancelled: { label: "Cancelled", color: "bg-danger/20 text-danger border-danger/30" },
};

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

function getProgress(project: Project): number {
  if (!project.clips || project.clips.length === 0) return 0;
  const approved = project.clips.filter((c) => c.status === "approved").length;
  return Math.round((approved / project.clips.length) * 100);
}

export default function ProjectPipelinePage() : JSX.Element {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Project[] = [];
        snapshot.forEach((docSnap) => {
          data.push({ id: docSnap.id, ...docSnap.data() } as Project);
        });
        setProjects(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching projects:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddProject = async (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    try {
      await addDoc(collection(db, "projects"), {
        ...projectData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const ref = doc(db, "projects", id);
      await updateDoc(ref, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, "projects", id));
      setSelectedProject(null);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleMoveProject = async (project: Project, direction: "left" | "right") => {
    const idx = columns.findIndex((c) => c.id === project.status);
    if (idx === -1) return;
    const newIdx = direction === "left" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= columns.length) return;
    const newStatus = columns[newIdx].id;
    await handleUpdateProject(project.id, { status: newStatus });
  };

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days: { date: number; dateStr: string; projects: Project[] }[] = [];

    for (let i = 0; i < startPadding; i++) {
      days.push({ date: 0, dateStr: "", projects: [] });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayProjects = projects.filter((p) => p.dateDue === dateStr);
      days.push({ date: d, dateStr, projects: dayProjects });
    }

    return days;
  }, [calendarMonth, projects]);

  const calendarSelectedProjects = useMemo(() => {
    if (!calendarSelectedDate) return [];
    return projects.filter((p) => p.dateDue === calendarSelectedDate);
  }, [calendarSelectedDate, projects]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Project Pipeline</h1>
              <p className="text-text-secondary mt-1">Manage your video editing projects</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-bg-secondary border border-white/10 rounded-lg p-1">
                {([
                  { key: "kanban" as ViewMode, icon: LayoutGrid, label: "Kanban" },
                  { key: "list" as ViewMode, icon: List, label: "List" },
                  { key: "calendar" as ViewMode, icon: CalendarDays, label: "Calendar" },
                ]).map((v) => (
                  <button
                    key={v.key}
                    onClick={() => setViewMode(v.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === v.key
                        ? "bg-accent-quaternary/20 text-accent-quaternary"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <v.icon className="w-4 h-4" />
                    {v.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-quaternary hover:bg-[var(--accent-quaternary)] text-text-primary rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            </div>
          </div>
        </FadeIn>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-accent-quaternary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <FadeIn>
            <GlassCard className="flex flex-col items-center justify-center py-16">
              <FolderOpen className="w-16 h-16 text-text-secondary mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">No projects yet</h3>
              <p className="text-text-secondary mb-6">Create your first project to get started.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-quaternary hover:bg-[var(--accent-quaternary)] text-text-primary rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            </GlassCard>
          </FadeIn>
        ) : (
          <>
            {viewMode === "kanban" && (
              <FadeIn>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {columns.map((col) => {
                    const colProjects = projects.filter((p) => p.status === col.id);
                    return (
                      <div
                        key={col.id}
                        className="flex-shrink-0 w-80 bg-bg-secondary/50 border border-white/10 rounded-xl"
                      >
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                          <div className={`w-3 h-3 rounded-full ${col.color}`} />
                          <h3 className="font-semibold text-text-primary">{col.label}</h3>
                          <span className="ml-auto text-xs text-text-secondary bg-white/5 px-2 py-0.5 rounded-full">
                            {colProjects.length}
                          </span>
                        </div>
                        <div className="p-3 space-y-3 min-h-[200px]">
                          <AnimatePresence mode="popLayout">
                            {colProjects.map((project) => (
                              <ProjectCard
                                key={project.id}
                                project={project}
                                onClick={() => setSelectedProject(project)}
                                onMoveLeft={() => handleMoveProject(project, "left")}
                                onMoveRight={() => handleMoveProject(project, "right")}
                              />
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </FadeIn>
            )}

            {viewMode === "list" && (
              <FadeIn>
                <div className="bg-bg-secondary border border-white/10 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Client</th>
                          <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Property</th>
                          <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Photos</th>
                          <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Price</th>
                          <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Due Date</th>
                          <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">Progress</th>
                          <th className="px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((project) => {
                          const progress = getProgress(project);
                          const status = project.status as ProjectStatus;
                          return (
                            <tr
                              key={project.id}
                              className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                              onClick={() => setSelectedProject(project)}
                            >
                              <td className="px-4 py-3">
                                <div>
                                  <span className="font-semibold text-text-primary block">{project.clientName}</span>
                                  <span className="text-xs text-text-secondary">{project.clientPhone}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-text-secondary">{project.propertyName}</td>
                              <td className="px-4 py-3 text-text-secondary">{project.photoCount}</td>
                              <td className="px-4 py-3 text-text-primary">₨{project.price?.toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${
                                    statusConfig[status]?.color || ""
                                  }`}
                                >
                                  {statusConfig[status]?.label || status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-text-secondary text-sm">
                                {project.dateDue ? new Date(project.dateDue).toLocaleDateString() : "—"}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-accent-quaternary rounded-full transition-all"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-text-secondary w-8">{progress}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingProject(project);
                                    }}
                                    className="p-1.5 text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteProject(project.id);
                                    }}
                                    className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </FadeIn>
            )}

            {viewMode === "calendar" && (
              <FadeIn>
                <div className="bg-bg-secondary border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">
                      {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                        className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setCalendarMonth(new Date())}
                        className="px-3 py-1 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
                      >
                        Today
                      </button>
                      <button
                        onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                        className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <div key={d} className="text-center text-xs font-semibold text-text-secondary py-2">
                        {d}
                      </div>
                    ))}
                    {calendarDays.map((day, i) => (
                      <div
                        key={i}
                        className={`min-h-[100px] p-2 rounded-lg border transition-colors ${
                          day.date === 0
                            ? "bg-transparent border-transparent"
                            : calendarSelectedDate === day.dateStr
                            ? "bg-accent-quaternary/10 border-accent-quaternary/30"
                            : "bg-white/10 border-white/5 hover:border-white/10 cursor-pointer"
                        }`}
                        onClick={() => day.date > 0 && setCalendarSelectedDate(day.dateStr)}
                      >
                        {day.date > 0 && (
                          <>
                            <span className="text-sm text-text-primary">{day.date}</span>
                            <div className="mt-1 space-y-1">
                              {day.projects.slice(0, 3).map((p) => (
                                <div
                                  key={p.id}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-accent-quaternary/20 text-accent-quaternary truncate"
                                >
                                  {p.clientName}
                                </div>
                              ))}
                              {day.projects.length > 3 && (
                                <div className="text-[10px] text-text-secondary">+{day.projects.length - 3} more</div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  <AnimatePresence>
                    {calendarSelectedDate && calendarSelectedProjects.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 overflow-hidden"
                      >
                        <div className="border-t border-white/10 pt-4">
                          <h4 className="text-sm font-semibold text-text-primary mb-3">
                            Projects due on {new Date(calendarSelectedDate).toLocaleDateString()}
                          </h4>
                          <div className="space-y-2">
                            {calendarSelectedProjects.map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/5/80 transition-colors"
                                onClick={() => setSelectedProject(p)}
                              >
                                <div>
                                  <span className="font-medium text-text-primary">{p.clientName}</span>
                                  <span className="text-text-secondary text-sm ml-2">{p.propertyName}</span>
                                </div>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs border ${
                                    statusConfig[p.status as ProjectStatus]?.color || ""
                                  }`}
                                >
                                  {statusConfig[p.status as ProjectStatus]?.label || p.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>
            )}
          </>
        )}

        <ProjectModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddProject}
        />

        <ProjectModal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          project={editingProject || undefined}
          onSubmit={(data) => {
            if (editingProject) {
              handleUpdateProject(editingProject.id, data);
              setEditingProject(null);
            }
          }}
        />

        <ProjectSidebar
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onUpdate={(updates) => {
            if (selectedProject) {
              handleUpdateProject(selectedProject.id, updates);
              setSelectedProject({ ...selectedProject, ...updates });
            }
          }}
          onDelete={() => selectedProject && handleDeleteProject(selectedProject.id)}
        />
      </div>
    </DashboardLayout>
  );
}
