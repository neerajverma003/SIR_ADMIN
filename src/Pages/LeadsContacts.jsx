import React, { useEffect, useState } from "react";

const LeadsContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  const token = localStorage.getItem("authToken");

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/contacts`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Failed to load contacts");
      }
      const data = await res.json();
      setContacts((data?.data || []).map((item) => ({ ...item, id: item._id || item.id })));
    } catch (err) {
      console.error("Failed to load contacts:", err);
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gradient-to-r from-orange-50 via-white to-orange-50 rounded-2xl p-6 shadow-sm border border-orange-200">
        <div>
          <h1 className="text-2xl font-bold text-orange-900">Contacts</h1>
          <p className="text-orange-600 mt-1">
            Manage incoming contact submissions. View, filter, and respond to inquiries from this dashboard.
          </p>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow-lg border border-orange-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
        <p className="text-slate-600 mt-2 leading-relaxed">
          Here you can review messages sent through the contact form. Click on a row to view or respond.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-orange-50 text-sm text-orange-600">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Message</th>
                <th className="px-6 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-orange-600">
                    Loading contacts...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-orange-600">
                    No contacts found.
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-orange-50">
                    <td className="px-6 py-4 font-medium text-orange-900">{contact.name}</td>
                    <td className="px-6 py-4 text-orange-700">{contact.email}</td>
                    <td className="px-6 py-4 text-orange-700">{contact.phone}</td>
                    <td className="px-6 py-4 text-orange-700 truncate max-w-[24rem]" title={contact.message}>
                      {contact.message}
                    </td>
                    <td className="px-6 py-4 text-orange-700">
                      {contact.createdAt ? new Date(contact.createdAt).toLocaleString() : "—"}
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

export default LeadsContacts;
