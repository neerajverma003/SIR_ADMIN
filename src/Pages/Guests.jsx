import React, { useEffect, useState } from "react";

const statusStyle = (status) => {
  switch (status) {
    case "Checked In":
      return "bg-green-100 text-green-700";
    case "Booked":
      return "bg-orange-100 text-orange-700";
    case "Checked Out":
      return "bg-slate-100 text-slate-700";
    case "Cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const Guests = () => {
  const [guests, setGuests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [formData, setFormData] = useState({
    guests: "",
    phones: "",
    roomType: "",
    roomNumber: "",
    checkIn: "",
    checkOut: "",
    status: "Checked Out",
    amount: "",
  });

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  const token = localStorage.getItem("authToken");

  const fetchGuests = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/guests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Failed to load guests");
      }
      const data = await res.json();
      setGuests((data?.data || []).map((g) => ({ ...g, id: g._id || g.id })));
    } catch (err) {
      console.error("Failed to load guests:", err);
      setGuests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openViewModal = (guest) => {
    setSelectedGuest(guest);
    setIsViewOpen(true);
  };

  const closeViewModal = () => {
    setSelectedGuest(null);
    setIsViewOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch(`${baseUrl}/api/guests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Failed to create guest");
      }

      setFormData({
        guests: "",
        phones: "",
        roomType: "",
        roomNumber: "",
        checkIn: "",
        checkOut: "",
        status: "Checked Out",
        amount: "",
      });
      setIsOpen(false);
      fetchGuests();
    } catch (err) {
      console.error("Failed to create guest:", err);
      window.alert(`Failed to create guest: ${err.message}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-orange-50 via-white to-orange-50 rounded-2xl p-6 shadow-sm border border-orange-200">
        <div>
          <h1 className="text-2xl font-bold text-orange-900">Guests</h1>
          <p className="text-orange-600 mt-1">
            Guests that have completed or cancelled their stay. You can also add guests manually.
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 px-5 py-2 text-sm font-semibold text-white shadow transition hover:from-orange-600 hover:to-orange-500"
        >
          + Add Guest
        </button>
      </div>

      {/* Guests Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-orange-50 text-sm text-orange-600">
            <tr>
              <th className="px-6 py-3">Guest</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Room</th>
              <th className="px-6 py-3">Check In</th>
              <th className="px-6 py-3">Check Out</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-orange-600">
                  Loading guests...
                </td>
              </tr>
            ) : guests.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-orange-600">
                  No guests found.
                </td>
              </tr>
            ) : (
              guests.map((g) => (
                <tr key={g.id} className="hover:bg-orange-50">
                  <td className="px-6 py-4 font-medium text-orange-900">
                    {g.guests}
                  </td>
                  <td className="px-6 py-4 text-orange-700">{g.phones}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-orange-900">
                        {g.roomNumber || "—"}
                      </span>
                      <span className="text-xs text-orange-500">
                        {g.roomType || "Room type"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-orange-700">{g.checkIn}</td>
                  <td className="px-6 py-4 text-orange-700">{g.checkOut}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(
                        g.status,
                      )}`}
                    >
                      {g.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-orange-900">{g.amount}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openViewModal(g)}
                      className="border border-orange-200 px-3 py-1 rounded-lg text-sm text-orange-700 hover:bg-orange-50"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-lg border border-orange-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-orange-900">Add Guest</h2>
                <p className="text-sm text-orange-600">
                  Add a new guest to your guest list.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-orange-500 hover:text-orange-700 rounded-full p-2"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Guest Name</span>
                <input
                  type="text"
                  name="guests"
                  placeholder="Guest Name"
                  value={formData.guests}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-orange-200 px-4 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Phone Number</span>
                <input
                  type="text"
                  name="phones"
                  placeholder="Phone Number"
                  value={formData.phones}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-orange-200 px-4 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Room Type</span>
                  <input
                    type="text"
                    name="roomType"
                    placeholder="Room Type"
                    value={formData.roomType}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-orange-200 px-4 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Room Number</span>
                  <input
                    type="text"
                    name="roomNumber"
                    placeholder="Room Number"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-orange-200 px-4 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Check In</span>
                  <input
                    type="date"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-orange-200 px-4 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Check Out</span>
                  <input
                    type="date"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-orange-200 px-4 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Amount</span>
                <input
                  type="text"
                  name="amount"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-orange-200 px-4 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Status</span>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-orange-200 px-4 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                >
                  <option>Checked Out</option>
                  <option>Cancelled</option>
                </select>
              </label>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg border border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm hover:from-orange-600 hover:to-orange-500"
                >
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isViewOpen && selectedGuest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg border border-orange-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-orange-900">Guest Details</h2>
                <p className="text-sm text-orange-600">Review guest information and documents.</p>
              </div>
              <button
                onClick={closeViewModal}
                className="text-orange-500 hover:text-orange-700 rounded-full p-2"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-xl bg-orange-50 p-4">
                <p className="text-sm text-orange-600">Guest</p>
                <p className="text-base font-medium text-orange-900">{selectedGuest.guests}</p>
              </div>

              <div className="rounded-xl bg-orange-50 p-4">
                <p className="text-sm text-orange-600">Contact</p>
                <p className="text-base font-medium text-orange-900">{selectedGuest.phones}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl bg-orange-50 p-4">
                  <p className="text-sm text-orange-600">Room</p>
                  <p className="text-base font-medium text-orange-900">
                    {selectedGuest.roomType} {selectedGuest.roomNumber ? `- ${selectedGuest.roomNumber}` : ''}
                  </p>
                </div>
                <div className="rounded-xl bg-orange-50 p-4">
                  <p className="text-sm text-orange-600">Status</p>
                  <p className="text-base font-medium text-orange-900">{selectedGuest.status}</p>
                </div>
              </div>

              <div className="rounded-xl bg-orange-50 p-4">
                <p className="text-sm text-orange-600">Dates</p>
                <p className="text-base font-medium text-orange-900">
                  {selectedGuest.checkIn} → {selectedGuest.checkOut}
                </p>
              </div>

              <div className="rounded-xl bg-orange-50 p-4">
                <p className="text-sm text-orange-600">Amount</p>
                <p className="text-base font-medium text-orange-900">{selectedGuest.amount}</p>
              </div>

              {(selectedGuest.documents || {}) && (
                <div className="rounded-xl bg-orange-50 p-4">
                  <p className="text-sm text-orange-600 mb-2">Documents</p>
                  <div className="grid grid-cols-1 gap-2">
                    {['aadhar', 'drivingLicense', 'electionCard', 'passport'].map((docKey) => {
                      const doc = selectedGuest.documents?.[docKey];
                      if (!doc || !doc.url) return null;
                      return (
                        <a
                          key={docKey}
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-orange-600 hover:text-orange-800 text-sm"
                        >
                          View {docKey.replace(/([A-Z])/g, ' $1')}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guests;
