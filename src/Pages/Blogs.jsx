import React, { useEffect, useMemo, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FiPlus, FiTrash2, FiImage, FiEye, FiEdit2 } from "react-icons/fi";

const emptyForm = {
  title: "",
  visibility: "private",
  content: "",
};

const Blogs = () => {
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  const token = localStorage.getItem("authToken");

  const fetchBlogs = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${baseUrl}/api/blogs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to load blogs.");
      }
      const data = await res.json();
      setBlogs(data?.data ?? []);
    } catch (err) {
      setError(err.message || "Failed to load blogs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
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
    setCoverFile(file || null);

    if (!file) {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      setCoverPreview("");
      return;
    }

    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setCoverFile(null);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview("");
    setError("");
    setSuccess("");
    setEditingBlogId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("visibility", form.visibility);
      formData.append("content", form.content);
      if (coverFile) formData.append("coverImage", coverFile);

      const url = editingBlogId ? `${baseUrl}/api/blogs/${editingBlogId}` : `${baseUrl}/api/blogs`;
      const method = editingBlogId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to save blog.");
      }

      const data = await res.json();
      if (editingBlogId) {
        setBlogs((prev) =>
          prev.map((blog) => (blog._id === data.data._id ? data.data : blog))
        );
        setSuccess("Blog updated.");
      } else {
        setBlogs((prev) => [data.data, ...prev]);
        setSuccess("Blog created.");
      }
      resetForm();
      setFormOpen(false);
    } catch (err) {
      setError(err.message || "Failed to create blog.");
    } finally {
      setSaving(false);
    }
  };

  const removeBlog = async (id) => {
    try {
      const res = await fetch(`${baseUrl}/api/blogs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to delete blog.");
      }
      setBlogs((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete blog.");
    }
  };

  const startEditBlog = (blog) => {
    setForm({
      title: blog.title || "",
      visibility: blog.visibility || "private",
      content: blog.content || "",
    });
    setCoverFile(null);
    setCoverPreview(blog.coverImageUrl || "");
    setEditingBlogId(blog._id);
    setFormOpen(true);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stripHtml = (html) => {
    if (!html) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const truncate = (text, length = 120) => {
    if (!text) return "";
    if (text.length <= length) return text;
    return `${text.slice(0, length).trim()}...`;
  };

  const sortedBlogs = useMemo(
    () => [...blogs].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [blogs]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gradient-to-r from-orange-50 via-white to-orange-50 rounded-2xl p-6 shadow-sm border border-orange-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blogs</h1>
          <p className="text-slate-600 mt-1">
            Create and manage blog posts for your site.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (formOpen) {
              resetForm();
              setFormOpen(false);
            } else {
              setFormOpen(true);
              setError("");
              setSuccess("");
            }
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-orange-600 hover:to-orange-700"
        >
          {formOpen ? <FiPlus /> : <FiPlus />}
          {formOpen ? "Close form" : "Create New Blog"}
        </button>
      </div>

      {formOpen && (
        <section className="rounded-2xl border border-orange-200 bg-white p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-orange-900">
            {editingBlogId ? "Edit Blog Post" : "Create a New Blog Post"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Title</span>
                <input
                  value={form.title}
                  onChange={handleChange("title")}
                  className="mt-1 block w-full rounded-lg border border-orange-200 px-4 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-200 focus:ring-2 focus:outline-none"
                  placeholder="Enter Blog Title"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Visibility</span>
                <select
                  value={form.visibility}
                  onChange={handleChange("visibility")}
                  className="mt-1 block w-full rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-200 focus:ring-2 focus:outline-none"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </label>
            </div>

            <div>
              <span className="text-sm font-medium text-slate-700">Cover Image</span>
              <div className="relative mt-2 rounded-lg border border-dashed border-orange-200 bg-orange-50 p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm">
                  <FiImage className="h-6 w-6 text-orange-600" />
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-700">
                  Click to upload or drag & drop
                </div>
                <div className="mt-1 text-xs text-slate-500">PNG, JPG, or GIF</div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>

              {coverPreview ? (
                <div className="mt-4">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="h-48 w-full rounded-lg object-cover"
                  />
                </div>
              ) : null}
            </div>

            <div>
              <span className="text-sm font-medium text-slate-700">Content</span>
              <div className="mt-1 rounded-lg border border-orange-200 bg-white">
                <ReactQuill
                  value={form.content}
                  onChange={(value) => setForm((prev) => ({ ...prev, content: value }))}
                  theme="snow"
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ["bold", "italic", "underline", "strike"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["blockquote", "code-block"],
                      ["link", "image"],
                      ["clean"],
                    ],
                  }}
                  formats={[
                    "header",
                    "bold",
                    "italic",
                    "underline",
                    "strike",
                    "list",
                    "bullet",
                    "blockquote",
                    "code-block",
                    "link",
                    "image",
                  ]}
                  placeholder="Write your blog content here..."
                  className="h-72 rounded-b-lg"
                  style={{
                    borderBottomLeftRadius: "0.5rem",
                    borderBottomRightRadius: "0.5rem",
                  }}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</div>
            )}
            {success && (
              <div className="rounded-lg bg-green-50 px-4 py-3 text-green-700">{success}</div>
            )}

            <div className="mt-20 flex justify-start">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:from-orange-600 hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving
                  ? editingBlogId
                    ? "Updating..."
                    : "Saving..."
                  : editingBlogId
                  ? "Update Post"
                  : "Publish Post"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section>
        {loading ? (
          <div className="rounded-2xl border border-orange-200 bg-white p-10 text-center text-slate-500">
            Loading blog posts...
          </div>
        ) : blogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50 p-10 text-center text-slate-500">
            No blog posts yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedBlogs.map((item) => (
              <div
                key={item._id}
                className="group relative overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-lg"
              >
                {item.coverImageUrl ? (
                  <div className="relative">
                    <img
                      src={item.coverImageUrl}
                      alt={item.title}
                      className="h-44 w-full object-cover"
                    />
                    <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => startEditBlog(item)}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-orange-700 shadow-sm hover:bg-white"
                        title="Edit"
                      >
                        <FiEdit2 className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBlog(item._id)}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-red-600 shadow-sm hover:bg-white"
                        title="Delete"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="px-5 pb-6 pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-slate-900 line-clamp-2">
                        {item.title}
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-orange-700">
                        <FiEye className="h-4 w-4" />
                        {item.visibility === "public" ? "Public" : "Private"}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</div>
                  </div>

                  <div className="mt-4 text-sm leading-relaxed text-slate-700">
                    {truncate(stripHtml(item.content), 120)}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <button
                      type="button"
                      className="text-sm font-semibold text-orange-700 hover:text-orange-800"
                    >
                      Read More →
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

export default Blogs;
