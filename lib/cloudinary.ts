/* filepath: lib/cloudinary.ts */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

if (typeof window !== "undefined" && (!CLOUD_NAME || !UPLOAD_PRESET)) {
  console.warn(
    "[Cloudinary] NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is not set. File uploads will fail."
  );
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  delete_token: string;
  bytes: number;
  resource_type: string;
  format: string;
  original_filename: string;
}

/**
 * Upload a file to Cloudinary using unsigned upload preset.
 * No API secret required — safe for client-side use.
 * Uses XMLHttpRequest for real progress tracking.
 */
export function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "my-platform/uploads");

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result: CloudinaryUploadResult = JSON.parse(xhr.responseText);
          resolve(result);
        } catch {
          reject(new Error("Invalid response from Cloudinary"));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error?.message || `Upload failed (${xhr.status})`));
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload aborted"));
    });

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`
    );
    xhr.send(formData);
  });
}

/**
 * Delete a file from Cloudinary using the delete token.
 * No API secret required — safe for client-side use.
 */
export async function deleteFromCloudinary(deleteToken: string): Promise<void> {
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: deleteToken }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || "Failed to delete file from Cloudinary");
  }
}
