import React, { useEffect, useState } from "react";
import { FiCreditCard, FiSave, FiEdit2 } from "react-icons/fi";

const PaymentPolicy = () => {
  const [category, setCategory] = useState("domestic");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  const token = localStorage.getItem("authToken");

  const fetchPolicy = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${baseUrl}/api/payment-policy?category=${encodeURIComponent(category)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load content.");
      }

      const data = await res.json();
      setContent(data?.data ?? "");
      setEditing(!data?.data);
    } catch (err) {
      setError(err.message || "Failed to load content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const handleSave = async () => {
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${baseUrl}/api/payment-policy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category, content }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to save content.");
      }

      setSuccess("Saved successfully.");
      setEditing(false);
    } catch (err) {
      setError(err.message || "Failed to save content.");
    }
  };

  const handleToggleEdit = () => {
    setEditing((prev) => !prev);
    setSuccess("");
    setError("");
  };

  return (
    <div className="p-6 md:p-10">
      <header className="mb-8 bg-gradient-to-r from-orange-50 via-white to-orange-50 rounded-2xl p-6 shadow-sm border border-orange-200">
        <h1 className="text-3xl font-bold text-orange-900">Payment Policy Management</h1>
        <p className="text-orange-600 mt-1">
          Select a category to view, edit, and manage the payment policy.
        </p>
      </header>

      <section className="bg-white border border-orange-200 rounded-xl shadow-sm p-6 mb-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="text-sm font-semibold text-orange-700 mb-2">
              Select Category
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-slate-900">
                <input
                  type="radio"
                  name="category"
                  value="domestic"
                  checked={category === "domestic"}
                  onChange={() => setCategory("domestic")}
                  className="accent-orange-600"
                />
                Domestic
              </label>
              <label className="flex items-center gap-2 text-slate-900">
                <input
                  type="radio"
                  name="category"
                  value="international"
                  checked={category === "international"}
                  onChange={() => setCategory("international")}
                  className="accent-orange-600"
                />
                International
              </label>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Policy is stored per category. Select a category to edit its rules.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white border border-orange-200 rounded-xl shadow-sm p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2 text-orange-900">
              <FiCreditCard className="text-orange-600" /> Payment Policy
            </h2>
            <p className="text-orange-600">Enter the payment policy for the selected category.</p>
          </div>

          <div className="flex items-center gap-2">
            {success && (
              <span className="text-sm text-orange-700">{success}</span>
            )}
            <button
              onClick={editing ? handleSave : handleToggleEdit}
              disabled={loading}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition ${
                editing
                  ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:from-orange-600 hover:to-orange-500"
                  : "bg-white text-slate-800 border border-orange-200 hover:bg-orange-50"
              }`}
            >
              {editing ? <FiSave /> : <FiEdit2 />}
              {editing ? "Save" : "Edit"}
            </button>
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
              Loading payment policy...
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
              {error}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              readOnly={!editing}
              placeholder="No policy defined yet. Click Edit to add policy."
              className={`w-full min-h-[260px] resize-none rounded-lg border px-4 py-3 text-sm leading-relaxed outline-none transition ${
                editing
                  ? "border-orange-200 bg-white focus:border-orange-500"
                  : "border-orange-200 bg-orange-50 text-slate-700"
              }`}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default PaymentPolicy;
