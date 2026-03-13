import React, { useEffect, useMemo, useState } from "react";
import { FiTrash2, FiCheckCircle, FiXCircle, FiPlus, FiChevronUp } from "react-icons/fi";

const emptyForm = {
    name: "",
    rating: 5,
    showPublic: true,
    message: "",
};

const TestimonialsText = () => {
    const [form, setForm] = useState(emptyForm);
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [profilePreview, setProfilePreview] = useState("");
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
            const res = await fetch(`${baseUrl}/api/testimonials`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err?.error || "Failed to load testimonials.");
            }
            const data = await res.json();
            setTestimonials(data?.data ?? []);
        } catch (err) {
            setError(err.message || "Failed to load testimonials.");
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
        setProfileImageFile(file || null);

        if (!file) {
            if (profilePreview) {
                URL.revokeObjectURL(profilePreview);
            }
            setProfilePreview("");
            return;
        }

        if (profilePreview) {
            URL.revokeObjectURL(profilePreview);
        }

        const previewUrl = URL.createObjectURL(file);
        setProfilePreview(previewUrl);
    };

    const resetForm = () => {
        setForm(emptyForm);
        setProfileImageFile(null);
        if (profilePreview) {
            URL.revokeObjectURL(profilePreview);
        }
        setProfilePreview("");
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!form.name.trim() || !form.message.trim()) {
            setError("Name and message are required.");
            return;
        }

        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("message", form.message);
            formData.append("rating", String(form.rating));
            formData.append("showPublic", String(form.showPublic));
            if (profileImageFile) {
                formData.append("profileImage", profileImageFile);
            }

            const res = await fetch(`${baseUrl}/api/testimonials`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err?.error || "Failed to create testimonial.");
            }

            const data = await res.json();
            setTestimonials((prev) => [data.data, ...prev]);
            setSuccess("Testimonial created.");
            resetForm();
            setFormOpen(false);
        } catch (err) {
            setError(err.message || "Failed to create testimonial.");
        } finally {
            setSaving(false);
        }
    };

    const toggleVerified = async (id) => {
        try {
            const res = await fetch(`${baseUrl}/api/testimonials/${id}/verify`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err?.error || "Failed to update testimonial.");
            }
            const data = await res.json();
            setTestimonials((prev) =>
                prev.map((item) => (item._id === id ? data.data : item))
            );
        } catch (err) {
            setError(err.message || "Failed to update testimonial.");
        }
    };

    const removeTestimonial = async (id) => {
        try {
            const res = await fetch(`${baseUrl}/api/testimonials/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err?.error || "Failed to delete testimonial.");
            }
            setTestimonials((prev) => prev.filter((item) => item._id !== id));
        } catch (err) {
            setError(err.message || "Failed to delete testimonial.");
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
                    <h1 className="text-2xl font-bold text-slate-900">Text Testimonials</h1>
                    <p className="text-slate-600 mt-1">
                        Create and manage text testimonials on your site.
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
                    <h2 className="text-xl font-semibold mb-4 text-orange-900">Add New Testimonial</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Name</span>
                                <input
                                    value={form.name}
                                    onChange={handleChange("name")}
                                    className="mt-1 block w-full rounded-lg border border-orange-200 px-4 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-200 focus:ring-2 focus:outline-none"
                                    placeholder="Enter full name"
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Rating</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={5}
                                    value={form.rating}
                                    onChange={handleChange("rating")}
                                    className="mt-1 block w-full rounded-lg border border-orange-200 px-4 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-200 focus:ring-2 focus:outline-none"
                                />
                            </label>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={form.showPublic}
                                    onChange={handleChange("showPublic")}
                                    className="h-4 w-4 rounded border-orange-300 text-orange-600"
                                />
                                <span className="text-sm text-slate-700">Show publicly</span>
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Profile Image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFile}
                                    className="mt-1 block w-full text-sm text-slate-600"
                                />
                                {profilePreview ? (
                                    <img
                                        src={profilePreview}
                                        alt="Preview"
                                        className="mt-3 h-20 w-20 rounded-full object-cover"
                                    />
                                ) : null}
                            </label>
                        </div>

                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Message</span>
                            <textarea
                                value={form.message}
                                onChange={handleChange("message")}
                                className="mt-1 block w-full min-h-[140px] rounded-lg border border-orange-200 px-4 py-3 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-200 focus:ring-2 focus:outline-none"
                                placeholder="Share your experience..."
                            />
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
                            {saving ? "Saving..." : "Save Testimonial"}
                        </button>
                    </form>
                </section>
            )}

            <section>
                {loading ? (
                    <div className="rounded-2xl border border-orange-200 bg-white p-10 text-center text-slate-500">
                        Loading testimonials...
                    </div>
                ) : testimonials.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50 p-10 text-center text-slate-500">
                        No testimonials yet.
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {sortedTestimonials.map((item) => (
                            <div
                                key={item._id}
                                className="rounded-2xl border border-orange-200 bg-white p-6 shadow-lg"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 overflow-hidden rounded-full bg-orange-50">
                                            {item.profileImage ? (
                                                <img
                                                    src={item.profileImage}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-orange-400">
                                                    <span className="text-lg">👤</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900">{item.name}</div>
                                            <div className="text-xs text-slate-500">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </div>
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

                                <p className="mt-4 text-sm leading-relaxed text-slate-700">
                                    {item.message}
                                </p>

                                <div className="mt-4 flex items-center justify-between">
                                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs text-orange-700">
                                        Rating: {item.rating} ⭐
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        Public: {item.showPublic ? "Yes" : "No"}
                                    </span>
                                </div>

                                <div className="mt-4 flex w-full items-center justify-between gap-4">
                                    <div className="relative flex-1">
                                        <div
                                            className={`h-14 w-full rounded-full transition-colors duration-500 ${item.verified
                                                    ? 'bg-emerald-600/20'
                                                    : 'bg-orange-600/20'
                                                }`}
                                        >
                                            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                                                <span className="text-xs font-semibold text-orange-700">
                                                    UNVERIFIED
                                                </span>
                                            </div>
                                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                                                <span className="text-xs font-semibold text-emerald-700">
                                                    VERIFIED
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => toggleVerified(item._id)}
                                            aria-label={item.verified ? 'Set unverified' : 'Set verified'}
                                            className={`absolute top-1/2 h-12 w-28 -translate-y-1/2 rounded-full bg-white shadow-lg transition-all duration-300 ease-out ${item.verified ? 'right-1' : 'left-1'
                                                }`}
                                        >
                                            <span
                                                className={`flex h-full w-full items-center justify-center text-sm font-semibold transition-colors duration-300 ease-out ${item.verified ? 'text-emerald-700' : 'text-orange-700'
                                                    }`}
                                            >
                                                {item.verified ? 'VERIFIED' : 'UNVERIFIED'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default TestimonialsText;
