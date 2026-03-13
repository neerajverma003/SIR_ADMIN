import React, { useEffect, useState } from "react";

const LeadsReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  const token = localStorage.getItem("authToken");

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/reservations`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Failed to load reservations");
      }

      const data = await res.json();
      setReservations((data?.data || []).map((item) => ({ ...item, id: item._id || item.id })));
    } catch (err) {
      console.error("Failed to load reservations:", err);
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gradient-to-r from-orange-50 via-white to-orange-50 rounded-2xl p-6 shadow-sm border border-orange-200">
        <div>
          <h1 className="text-2xl font-bold text-orange-900">Reservation Requests</h1>
          <p className="text-orange-600 mt-1">
            View and manage reservation requests submitted via the booking form.
          </p>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow-lg border border-orange-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
        <p className="text-slate-600 mt-2 leading-relaxed">
          Browse reservation requests from guests. Click each row to view the full details and update the status as needed.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-orange-50 text-sm text-orange-600">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Stay</th>
                <th className="px-6 py-3">Room</th>
                <th className="px-6 py-3">Persons</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-orange-600">
                    Loading reservation requests...
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-orange-600">
                    No reservation requests found.
                  </td>
                </tr>
              ) : (
                reservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-orange-50">
                    <td className="px-6 py-4 font-medium text-orange-900">{reservation.name}</td>
                    <td className="px-6 py-4 text-orange-700">{reservation.phone}</td>
                    <td className="px-6 py-4 text-orange-700">{reservation.email}</td>
                    <td className="px-6 py-4 text-orange-700">{reservation.arrivalDate} → {reservation.departureDate}</td>
                    <td className="px-6 py-4 text-orange-700">{reservation.roomType} x {reservation.rooms}</td>
                    <td className="px-6 py-4 text-orange-700">{reservation.totalPersons || reservation.adults + reservation.children}</td>
                    <td className="px-6 py-4 text-orange-700">{reservation.status || "Pending"}</td>
                    <td className="px-6 py-4 text-orange-700">
                      {reservation.createdAt ? new Date(reservation.createdAt).toLocaleString() : "—"}
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

export default LeadsReservations;
