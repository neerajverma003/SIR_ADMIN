import React, { useState, useEffect } from "react";

const LeadsSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  const token = localStorage.getItem("authToken");

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/suggestions`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Failed to load suggestions");
      }
      const data = await res.json();
      setSuggestions((data?.data || []).map((item) => ({ ...item, id: item._id || item.id })));
    } catch (err) {
      console.error("Failed to load suggestions:", err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gradient-to-r from-orange-50 via-white to-orange-50 rounded-2xl p-6 shadow-sm border border-orange-200">
        <div>
          <h1 className="text-2xl font-bold text-orange-900">Suggestions</h1>
          <p className="text-orange-600 mt-1">
            Review guest suggestions. Use this page to track statuses, follow up, and improve guest experience.
          </p>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow-lg border border-orange-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
        <p className="text-slate-600 mt-2 leading-relaxed">
          This page lists suggestions submitted by guests. Click a row to view details and take action.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-orange-50 text-sm text-orange-600">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Suggestion</th>
                <th className="px-6 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-orange-600">
                    Loading suggestions...
                  </td>
                </tr>
              ) : suggestions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-orange-600">
                    No suggestions yet.
                  </td>
                </tr>
              ) : (
                suggestions.map((s) => (
                  <tr key={s.id} className="hover:bg-orange-50">
                    <td className="px-6 py-4 font-medium text-orange-900">{s.name}</td>
                    <td className="px-6 py-4 text-orange-700">{s.phone}</td>
                    <td className="px-6 py-4 text-orange-700">{s.email}</td>
                    <td className="px-6 py-4 text-orange-700 truncate max-w-[20rem]" title={s.message}>
                      {s.message}
                    </td>
                    <td className="px-6 py-4 text-orange-700">
                      {s.createdAt ? new Date(s.createdAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeadsSuggestions;
