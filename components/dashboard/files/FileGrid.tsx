/* filepath: components/dashboard/files/FileGrid.tsx */
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  FileImage,
  FileVideo,
  FileText,
  File,
  Download,
  Link2,
  Trash2,
  Edit3,
  Eye,
  MoreVertical,
  CheckCircle2,
} from "lucide-react";

interface GridFile {
  id: string;
  name: string;
  url: string;
  size: string;
  rawSize: number;
  type: string;
  date: string;
}

interface FileGridProps {
  files: GridFile[];
  onDelete: (id: string) => void;
  onCopyUrl: (url: string) => void;
  onDownload: (id: string) => void;
  onPreview: (id: string) => void;
  onRename: (id: string) => void;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.startsWith("video/")) return FileVideo;
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("doc") ||
    mimeType.includes("txt")
  )
    return FileText;
  return File;
}

function getFileColor(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "text-accent-primary";
  if (mimeType.startsWith("video/")) return "text-danger";
  if (mimeType.includes("pdf")) return "text-danger";
  if (mimeType.includes("doc")) return "text-accent-quaternary";
  return "text-text-secondary";
}

function getFileBg(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "bg-accent-primary/10";
  if (mimeType.startsWith("video/")) return "bg-danger/10";
  if (mimeType.includes("pdf")) return "bg-danger/10";
  if (mimeType.includes("doc")) return "bg-accent-quaternary/10";
  return "bg-white/5";
}

export function FileGrid(: JSX.Element {
  files,
  onDelete,
  onCopyUrl,
  onDownload,
  onPreview,
  onRename,
}: FileGridProps) {
  const [contextMenu, setContextMenu] = useState<{
    open: boolean;
    x: number;
    y: number;
    fileId: string | null;
    fileUrl: string;
  }>({ open: false, x: 0, y: 0, fileId: null, fileUrl: "" });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu((prev) => ({ ...prev, open: false }));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleContextMenu = (
    e: React.MouseEvent,
    file: GridFile
  ) => {
    e.preventDefault();
    setContextMenu({
      open: true,
      x: e.clientX,
      y: e.clientY,
      fileId: file.id,
      fileUrl: file.url,
    });
  };

  const handleCopy = (url: string, id: string) => {
    onCopyUrl(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    setContextMenu((prev) => ({ ...prev, open: false }));
  };

  const isImage = (type: string) => type.startsWith("image/");

  return (
    <div className="relative">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {files.map((file, idx) => {
          const FileIcon = getFileIcon(file.type);
          const colorClass = getFileColor(file.type);
          const bgClass = getFileBg(file.type);
          const imagePreview = isImage(file.type) ? file.url : null;

          return (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              onContextMenu={(e) => handleContextMenu(e, file)}
              className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-bg-secondary transition-all hover:border-white/20 hover:shadow-lg"
            >
              {/* Thumbnail / Icon */}
              <div
                className="relative flex aspect-square items-center justify-center overflow-hidden"
                onClick={() => onPreview(file.id)}
              >
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt={file.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${bgClass}`}
                  >
                    <FileIcon className={`h-8 w-8 ${colorClass}`} />
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(file.id);
                    }}
                    className="rounded-full bg-white/20 p-2.5 text-text-primary backdrop-blur-sm transition-colors hover:bg-white/30"
                  >
                    <Eye className="h-5 w-5" />
                  </motion.button>
                </div>

                {/* Type Badge */}
                <span className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium uppercase text-text-primary backdrop-blur-sm">
                  {file.type.split("/")[1] || "file"}
                </span>
              </div>

              {/* Info */}
              <div className="border-t border-white/5 p-3">
                <p className="truncate text-sm font-medium text-text-primary">
                  {file.name}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-text-secondary">
                  <span>{file.size}</span>
                  <span>{file.date}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContextMenu(e, file);
                  }}
                  className="rounded-full bg-black/50 p-1.5 text-text-primary backdrop-blur-sm transition-colors hover:bg-black/70"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>

              {/* Copied indicator */}
              <AnimatePresence>
                {copiedId === file.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-accent-primary/90 py-1.5 text-xs font-medium text-text-primary backdrop-blur-sm"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    URL Copied
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu.open && contextMenu.fileId && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: "fixed",
              left: contextMenu.x,
              top: contextMenu.y,
              zIndex: 100,
            }}
            className="min-w-[180px] overflow-hidden rounded-lg border border-white/10 bg-bg-secondary py-1 shadow-2xl"
          >
            <button
              onClick={() => {
                onPreview(contextMenu.fileId!);
                setContextMenu((prev) => ({ ...prev, open: false }));
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-text-primary transition-colors hover:bg-white/5"
            >
              <Eye className="h-4 w-4 text-text-secondary" />
              Preview
            </button>
            <button
              onClick={() => {
                handleCopy(contextMenu.fileUrl, contextMenu.fileId!);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-text-primary transition-colors hover:bg-white/5"
            >
              <Link2 className="h-4 w-4 text-text-secondary" />
              Copy URL
            </button>
            <button
              onClick={() => {
                onDownload(contextMenu.fileId!);
                setContextMenu((prev) => ({ ...prev, open: false }));
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-text-primary transition-colors hover:bg-white/5"
            >
              <Download className="h-4 w-4 text-text-secondary" />
              Download
            </button>
            <button
              onClick={() => {
                onRename(contextMenu.fileId!);
                setContextMenu((prev) => ({ ...prev, open: false }));
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-text-primary transition-colors hover:bg-white/5"
            >
              <Edit3 className="h-4 w-4 text-text-secondary" />
              Rename
            </button>
            <div className="my-1 border-t border-white/10" />
            <button
              onClick={() => {
                onDelete(contextMenu.fileId!);
                setContextMenu((prev) => ({ ...prev, open: false }));
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-danger transition-colors hover:bg-danger/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
