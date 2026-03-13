import React, { useEffect, useMemo, useState } from "react";
import { FiImage, FiTrash2 } from "react-icons/fi";

const MAX_UPLOAD = 50;

const TestimonialsGallery = () => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  const token = localStorage.getItem("authToken");

  const fetchImages = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${baseUrl}/api/gallery`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to load gallery images.");
      }
      const data = await res.json();
      setImages(data?.data ?? []);
    } catch (err) {
      setError(err.message || "Failed to load gallery images.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (event) => {
    const input = event.target;
    const selected = Array.from(input.files || []);

    if (!selected.length) {
      setFiles([]);
      setPreviews([]);
      return;
    }

    const limited = selected.slice(0, MAX_UPLOAD);

    const nextPreviews = limited.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));

    setFiles(limited);
    setPreviews(nextPreviews);
    setSuccess("");
    setError("");

    // Clear the input so the same file(s) can be selected again later
    input.value = null;
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  useEffect(() => {
    return () => {
      previews.forEach((item) => {
        if (item.url) URL.revokeObjectURL(item.url);
      });
    };
  }, [previews]);


  const handleImageClick = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleUpload = async () => {
    if (!files.length) {
      setError("Pick images to upload.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));

      const res = await fetch(`${baseUrl}/api/gallery`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to upload images.");
      }

      await fetchImages();
      setSuccess("Images uploaded successfully.");

      previews.forEach((item) => {
        if (item.url) URL.revokeObjectURL(item.url);
      });

      setFiles([]);
      setPreviews([]);
    } catch (err) {
      setError(err.message || "Failed to upload images.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.size) return;

    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${baseUrl}/api/gallery`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to delete selected images.");
      }

      await fetchImages();
      clearSelection();
      setSuccess("Selected images deleted.");
    } catch (err) {
      setError(err.message || "Failed to delete selected images.");
    }
  };

  const selectedCount = selectedIds.size;

  const sortedImages = useMemo(
    () => [...images].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [images]
  );

  return (
    <div className="p-6 md:p-10">
      <div className="rounded-xl bg-white p-6 shadow-sm border border-orange-200">
        <h1 className="text-2xl font-semibold text-orange-900">Customer Gallery</h1>
        <p className="mt-1 text-sm text-orange-600">Upload New Images (Max {MAX_UPLOAD})</p>

        <div className="relative mt-6 rounded-xl border border-dashed border-orange-200 bg-orange-50 px-4 py-8">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm">
              <FiImage className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-sm font-semibold text-slate-700">Click to upload images</div>
            <div className="text-xs text-slate-500">{files.length} / {MAX_UPLOAD} selected</div>
          </div>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>

        {previews.length > 0 ? (
          <div className="mt-4">
            <div className="text-sm font-medium text-slate-700">Preview selected images:</div>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {previews.map((item) => (
                <div
                  key={item.id}
                  className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                >
                  <img
                    src={item.url}
                    alt={item.name}
                    className="h-32 w-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1 text-xs text-white">
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            onClick={handleUpload}
            disabled={uploading || !files.length}
            className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:from-orange-600 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Upload Images"}
          </button>
          {files.length > 0 ? (
            <div className="text-sm text-slate-500">{files.length} file(s) ready</div>
          ) : null}
        </div>

        {error ? (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</div>
        ) : null}
        {success ? (
          <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-green-700">{success}</div>
        ) : null}
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm border border-orange-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-orange-900">Existing Gallery</h2>
            <p className="mt-1 text-sm text-orange-600">
              Click images to select for bulk deletion.
            </p>
          </div>

          <button
            onClick={handleDeleteSelected}
            disabled={!selectedCount}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiTrash2 />
            Delete ({selectedCount}) Selected
          </button>
        </div>

        {loading ? (
          <div className="mt-6 rounded-lg border border-orange-200 bg-white p-8 text-center text-slate-500">
            Loading gallery...
          </div>
        ) : sortedImages.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-orange-200 bg-white p-8 text-center text-slate-500">
            No images yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {sortedImages.map((image) => {
              const isSelected = selectedIds.has(image._id);
              return (
                <button
                  key={image._id}
                  type="button"
                  onClick={() => handleImageClick(image._id)}
                  className={`relative overflow-hidden rounded-xl border p-0 focus:outline-none ${
                    isSelected ? 'border-orange-600 ring-2 ring-orange-200' : 'border-orange-200'
                  }`}
                >
                  <img
                    src={image.imageUrl}
                    alt="Gallery"
                    className="h-40 w-full object-cover"
                    loading="lazy"
                  />
                  {isSelected ? (
                    <div className="absolute inset-0 bg-black/30" />
                  ) : null}
                  {isSelected ? (
                    <div className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-orange-600">
                      <FiTrash2 className="h-4 w-4" />
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialsGallery;
