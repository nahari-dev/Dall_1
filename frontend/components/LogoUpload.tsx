"use client";

import { useState, useRef } from "react";

const ALLOWED_FORMATS = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function LogoUpload() {
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!ALLOWED_FORMATS.includes(file.type)) {
      setError("Invalid file type. Allowed: PNG, JPG, WEBP, SVG");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("File too large. Maximum 5MB");
      return;
    }

    await uploadLogo(file);
  };

  const uploadLogo = async (file: File) => {
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/logo", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to upload logo");
      }

      const data = await response.json();
      setLogoUrl(data.logo_url);
      setSuccess(true);
      setError(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setLogoUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete the current logo?")) return;

    try {
      const response = await fetch("/api/admin/logo", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete logo");
      }

      setLogoUrl(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-lg font-semibold text-dall-900 dark:text-dall-100 mb-4">
        System Branding
      </h2>

      <div className="space-y-4">
        {/* Logo preview */}
        {logoUrl && (
          <div className="flex items-center justify-center w-full h-32 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden">
            <img
              src={logoUrl}
              alt="Current logo"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}

        {/* Upload area */}
        <div
          className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-dall-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept=".png,.jpg,.jpeg,.webp,.svg"
            onChange={handleFileSelect}
            disabled={uploading}
          />

          <div className="flex flex-col items-center gap-2">
            <div className="text-2xl">📝</div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {uploading ? "Uploading..." : "Click to upload logo"}
            </div>
            <div className="text-xs text-slate-500">
              PNG, JPG, WEBP, or SVG • Max 5MB
            </div>
          </div>
        </div>

        {/* Status messages */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm rounded-lg">
            ✓ Success
          </div>
        )}

        {/* Delete button */}
        {logoUrl && (
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-sm font-medium transition-colors"
          >
            Delete Logo
          </button>
        )}
      </div>
    </div>
  );
}
