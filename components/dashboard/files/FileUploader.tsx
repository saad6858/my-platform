/* filepath: components/dashboard/files/FileUploader.tsx */
"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Upload,
  X,
  FileImage,
  FileVideo,
  FileText,
  File,
  CheckCircle2,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  url?: string;
  publicId?: string;
  deleteToken?: string;
}

interface FileUploaderProps {
  onUpload?: () => void;
  maxFileSize?: number;
  acceptedTypes?: string;
}

const MAX_FILE_SIZE_DEFAULT = 10;

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
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

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function FileUploader({
  onUpload,
  maxFileSize = MAX_FILE_SIZE_DEFAULT,
  acceptedTypes,
}: FileUploaderProps): JSX.Element {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File must be less than ${maxFileSize}MB`;
    }
    if (acceptedTypes && !acceptedTypes.split(",").some((type) => {
      const trimmed = type.trim();
      return file.type.match(trimmed.replace("*", ".*"));
    })) {
      return "File type not accepted";
    }
    return null;
  };

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const uploads: UploadFile[] = Array.from(newFiles).map((file) => {
      const error = validateFile(file);
      return {
        id: generateId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: error ? "error" : "pending",
        error: error || undefined,
      };
    });
    setFiles((prev) => [...prev, ...uploads]);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadSingleFile = async (uploadFile: UploadFile): Promise<void> => {
    if (uploadFile.status === "error" || uploadFile.status === "completed")
      return;

    setFiles((prev) =>
      prev.map((f) =>
        f.id === uploadFile.id ? { ...f, status: "uploading" } : f
      )
    );

    try {
      const result = await uploadToCloudinary(uploadFile.file, (percent) => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, progress: percent } : f
          )
        );
      });

      await addDoc(collection(db, "files"), {
        name: uploadFile.file.name,
        url: result.secure_url,
        publicId: result.public_id,
        deleteToken: result.delete_token,
        size: result.bytes,
        type: result.resource_type,
        mimeType: uploadFile.file.type,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: "completed",
                url: result.secure_url,
                progress: 100,
                publicId: result.public_id,
                deleteToken: result.delete_token,
              }
            : f
        )
      );
    } catch (err) {
      console.error("Upload error:", err);
      const message = err instanceof Error ? err.message : "Upload failed";
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: "error", error: message }
            : f
        )
      );
    }
  };

  const handleUploadAll = async () => {
    setUploading(true);
    const pendingFiles = files.filter(
      (f) => f.status === "pending" || f.status === "error"
    );

    for (const file of pendingFiles) {
      await uploadSingleFile(file);
    }

    setUploading(false);
    if (onUpload) {
      onUpload();
    }
  };

  const hasPending = files.some(
    (f) => f.status === "pending" || f.status === "error"
  );
  const allCompleted =
    files.length > 0 && files.every((f) => f.status === "completed");

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? "border-accent-primary bg-accent-primary/5"
            : "border-white/20 bg-bg-primary hover:border-white/40 hover:bg-white/5"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
        />
        <motion.div
          animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-primary/10"
        >
          <Upload
            className={`h-7 w-7 ${
              isDragging ? "text-accent-primary" : "text-text-secondary"
            }`}
          />
        </motion.div>
        <p className="mt-4 text-sm font-medium text-text-primary">
          {isDragging ? "Drop files here" : "Drag & drop files here"}
        </p>
        <p className="mt-1 text-xs text-text-secondary">
          or click to browse · Max {maxFileSize}MB per file
        </p>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-bg-primary p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
                    {file.type.startsWith("image/") && file.url ? (
                      <Image
                        src={file.url}
                        alt={file.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <FileIcon className="h-5 w-5 text-text-secondary" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {file.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {formatFileSize(file.size)}
                    </p>

                    {file.status === "uploading" && (
                      <div className="mt-1.5">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <motion.div
                            className="h-full rounded-full bg-accent-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${file.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <p className="mt-0.5 text-xs text-text-secondary">
                          {Math.round(file.progress)}%
                        </p>
                      </div>
                    )}

                    {file.status === "error" && (
                      <p className="mt-0.5 text-xs text-danger">
                        {file.error}
                      </p>
                    )}

                    {file.status === "completed" && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-accent-primary">
                        <CheckCircle2 className="h-3 w-3" />
                        Uploaded
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeFile(file.id)}
                    disabled={file.status === "uploading"}
                    className="shrink-0 rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-white/10 hover:text-text-primary disabled:opacity-30"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      {files.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            {files.filter((f) => f.status === "completed").length} of{" "}
            {files.length} uploaded
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setFiles([])}
              disabled={uploading}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-white/5 disabled:opacity-50"
            >
              Clear
            </button>
            {hasPending && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUploadAll}
                disabled={uploading}
                className="rounded-lg bg-accent-primary px-5 py-2 text-sm font-semibold text-text-primary shadow-lg shadow-accent-primary/20 transition-colors hover:bg-accent-secondary disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload All"}
              </motion.button>
            )}
            {allCompleted && onUpload && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setFiles([]);
                  onUpload();
                }}
                className="rounded-lg bg-accent-primary px-5 py-2 text-sm font-semibold text-text-primary shadow-lg shadow-accent-primary/20 transition-colors hover:bg-accent-secondary"
              >
                Done
              </motion.button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
