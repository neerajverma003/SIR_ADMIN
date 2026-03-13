import React, { useEffect, useMemo, useState } from "react";
import { FiTrash2, FiPlus, FiChevronUp, FiVideo, FiEye } from "react-icons/fi";

const emptyForm = {
  title: "",
  showPublic: true,
};

const TestimonialsVideos = () => {
  const [form, setForm] = useState(emptyForm);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  const token = localStorage.getItem("authToken");

  const fetchTestimonials = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${baseUrl}/api/video-testimonials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to load video testimonials.");
      }
      const data = await res.json();
      setTestimonials(data?.data ?? []);
    } catch (err) {
      setError(err.message || "Failed to load video testimonials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (key) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    setVideoFile(file || null);

    if (!file) {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
      setVideoPreview("");
      return;
    }

    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setVideoFile(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview("");
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!videoFile) {
      setError("Please select a video file.");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("showPublic", String(form.showPublic));
      formData.append("video", videoFile);

      const res = await fetch(`${baseUrl}/api/video-testimonials`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to create video testimonial.");
      }

      const data = await res.json();
      setTestimonials((prev) => [data.data, ...prev]);
      setSuccess("Video testimonial created.");
      resetForm();
      setFormOpen(false);
    } catch (err) {
      setError(err.message || "Failed to create video testimonial.");
    } finally {
      setSaving(false);
    }
  };

  const removeTestimonial = async (id) => {
    try {
      const res = await fetch(`${baseUrl}/api/video-testimonials/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to delete video testimonial.");
      }
      setTestimonials((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete video testimonial.");
    }
  };

  const sortedTestimonials = useMemo(
    () => [...testimonials].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [testimonials]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gradient-to-r from-orange-50 via-white to-orange-50 rounded-2xl p-6 shadow-sm border border-orange-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Video Testimonials</h1>
          <p className="text-slate-600 mt-1">
            Upload, manage and review video testimonials from your customers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormOpen((prev) => !prev);
            setError("");
            setSuccess("");
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-orange-600 hover:to-orange-700"
        >
          {formOpen ? <FiChevronUp /> : <FiPlus />}
          {formOpen ? "Close form" : "Create Testimonial"}
        </button>
      </div>

      {formOpen && (
        <section className="rounded-2xl border border-orange-200 bg-white p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-orange-900">Add New Video Testimonial</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Title</span>
                <input
                  value={form.title}
                  onChange={handleChange("title")}
                  className="mt-1 block w-full rounded-lg border border-orange-200 px-4 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-200 focus:ring-2 focus:outline-none"
                  placeholder="e.g., Summer Highlights"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Visibility</span>
                <select
                  value={form.showPublic ? "public" : "private"}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      showPublic: e.target.value === "public",
                    }))
                  }
                  className="mt-1 block w-full rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-200 focus:ring-2 focus:outline-none"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Video File</span>
              <div className="relative mt-1 rounded-lg border border-dashed border-orange-200 bg-white p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-orange-200 bg-orange-50">
                  <FiVideo className="h-7 w-7 text-orange-600" />
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-700">
                  Click to upload or drag & drop
                </div>
                <div className="mt-1 text-xs text-slate-500">A single video file (MP4, WebM)</div>

                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={handleFile}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>

              {videoPreview ? (
                <div className="mt-3">
                  <video
                    src={videoPreview}
                    controls
                    className="h-48 w-full rounded-lg bg-black object-cover"
                  />
                </div>
              ) : null}
            </label>

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</div>
            )}
            {success && (
              <div className="rounded-lg bg-green-50 px-4 py-3 text-green-700">{success}</div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:from-orange-600 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Upload Testimonial"}
            </button>
          </form>
        </section>
      )}

      <section>
        {loading ? (
          <div className="rounded-2xl border border-orange-200 bg-white p-10 text-center text-slate-500">
            Loading video testimonials...
          </div>
        ) : testimonials.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50 p-10 text-center text-slate-500">
            No video testimonials yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedTestimonials.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl border border-orange-200 bg-white p-6 shadow-lg"
              >
                <div className="relative overflow-hidden rounded-lg bg-orange-50">
                  <video
                    src={item.videoUrl}
                    controls
                    className="h-44 w-full object-cover"
                  />
                </div>

                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{item.title}</div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-orange-700">
                      <FiEye className="h-4 w-4" />
                      {item.showPublic ? "Public" : "Private"}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      Uploaded: {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    onClick={() => removeTestimonial(item._id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TestimonialsVideos;
