import React, { useState, useEffect } from "react";

const LeadsConsultationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  const token = localStorage.getItem("authToken");

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/consultations`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Failed to load requests");
      }
      const data = await res.json();
      setRequests((data?.data || []).map((item) => ({ ...item, id: item._id || item.id })));
    } catch (err) {
      console.error("Failed to load consultation requests:", err);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoomById = async (roomId) => {
    if (!roomId) return;
    setRoomLoading(true);
    setRoomError(null);
    try {
      const res = await fetch(`${baseUrl}/api/publishrooms/${roomId}`);
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Failed to load room");
      }
      const data = await res.json();
      setSelectedRoom(data?.data || null);
    } catch (err) {
      console.error("Failed to load room details:", err);
      setRoomError(err.message || "Unable to load room");
      setSelectedRoom(null);
    } finally {
      setRoomLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openRoomDetails = async (request) => {
    setSelectedRequest(request);
    await fetchRoomById(request.roomId);
  };

  const closeRoomDetails = () => {
    setSelectedRoom(null);
    setSelectedRequest(null);
    setRoomError(null);
  };

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gradient-to-r from-orange-50 via-white to-orange-50 rounded-2xl p-6 shadow-sm border border-orange-200">
        <div>
          <h1 className="text-2xl font-bold text-orange-900">Consultation Requests</h1>
          <p className="text-orange-600 mt-1">
            Review incoming consultation requests. Use this page to follow up with leads and track status.
          </p>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow-lg border border-orange-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900">Requests</h2>
        <p className="text-slate-600 mt-2 leading-relaxed">
          These are the requests submitted by users from the room booking popup. Click a row to view details and copy contact info.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-orange-50 text-sm text-orange-600">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">State</th>
                <th className="px-6 py-3">City</th>
                <th className="px-6 py-3">Check-in</th>
                <th className="px-6 py-3">Check-out</th>
                <th className="px-6 py-3">Guests</th>
                <th className="px-6 py-3">Submitted</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-sm text-orange-600">
                    Loading consultation requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-sm text-orange-600">
                    No consultation requests yet.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-orange-50">
                    <td className="px-6 py-4 font-medium text-orange-900">{r.name}</td>
                    <td className="px-6 py-4 text-orange-700">{r.phone}</td>
                    <td className="px-6 py-4 text-orange-700">{r.email}</td>
                    <td className="px-6 py-4 text-orange-700">{r.state}</td>
                    <td className="px-6 py-4 text-orange-700">{r.city}</td>
                    <td className="px-6 py-4 text-orange-700">{r.checkIn ? new Date(r.checkIn).toLocaleDateString() : "-"}</td>
                    <td className="px-6 py-4 text-orange-700">{r.checkOut ? new Date(r.checkOut).toLocaleDateString() : "-"}</td>
                    <td className="px-6 py-4 text-orange-700">{r.guests || "-"}</td>
                    <td className="px-6 py-4 text-orange-700">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => openRoomDetails(r)}
                        className="px-3 py-1 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition"
                        disabled={!r.roomId}
                      >
                        View room
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={closeRoomDetails}
            aria-hidden="true"
          />
          <div className="relative z-50 w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Room Details</h2>
                <p className="text-sm text-gray-600">
                  Information for room ID: <span className="font-medium">{selectedRoom._id || selectedRoom.id}</span>
                </p>
              </div>
              <button
                onClick={closeRoomDetails}
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
            <div className="p-6">
              {roomLoading ? (
                <div className="text-center text-sm text-gray-600">Loading room details...</div>
              ) : roomError ? (
                <div className="text-center text-sm text-red-600">{roomError}</div>
              ) : (
                <div className="space-y-6">
                  {/* Room Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{selectedRoom.name}</h4>
                          <p className="text-sm text-gray-600">{selectedRoom.description || "No description available."}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-lg bg-orange-50 p-4">
                            <div className="text-xs font-semibold text-orange-600">Price</div>
                            <div className="text-lg font-bold text-orange-900">{selectedRoom.price || "-"}</div>
                          </div>
                          <div className="rounded-lg bg-orange-50 p-4">
                            <div className="text-xs font-semibold text-orange-600">Capacity</div>
                            <div className="text-lg font-bold text-orange-900">{selectedRoom.capacity || "-"}</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-gray-500">Features</div>
                          {selectedRoom.features?.length ? (
                            <ul className="list-disc list-inside text-sm text-gray-700">
                              {selectedRoom.features.map((feature) => (
                                <li key={feature}>{feature}</li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-sm text-gray-600">No features available.</div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        {selectedRoom.mainImage?.url ? (
                          <img
                            src={selectedRoom.mainImage.url}
                            alt={selectedRoom.name}
                            className="h-48 w-full rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-48 w-full rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                            No image available
                          </div>
                        )}
                        <div className="rounded-lg bg-orange-50 p-4">
                          <div className="text-xs font-semibold text-orange-600">Room category</div>
                          <div className="text-sm text-orange-800">{selectedRoom.category || "Standard"}</div>
                        </div>
                        <div className="rounded-lg bg-orange-50 p-4">
                          <div className="text-xs font-semibold text-orange-600">Created</div>
                          <div className="text-sm text-orange-800">
                            {selectedRoom.createdAt ? new Date(selectedRoom.createdAt).toLocaleString() : "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Consultation Request Details */}
                  {selectedRequest && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Consultation Request Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-semibold text-gray-700">Name:</span> {selectedRequest.name}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-700">Phone:</span> {selectedRequest.phone}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-700">Email:</span> {selectedRequest.email}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-700">State:</span> {selectedRequest.state}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-700">City:</span> {selectedRequest.city}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-semibold text-gray-700">Check-in:</span> {selectedRequest.checkIn ? new Date(selectedRequest.checkIn).toLocaleDateString() : "-"}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-700">Check-out:</span> {selectedRequest.checkOut ? new Date(selectedRequest.checkOut).toLocaleDateString() : "-"}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-700">Guests:</span> {selectedRequest.guests}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-700">Submitted:</span> {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString() : "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsConsultationRequests;
