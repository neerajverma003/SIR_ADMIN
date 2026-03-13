import React, { useEffect, useState } from "react";

/* -------------------- INITIAL DATA -------------------- */
const initialBookings = [];
/* -------------------- STATUS STYLE -------------------- */
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

const Bookings = () => {
  const [bookings, setBookings] = useState(initialBookings);
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // new | view | edit
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [floorRooms, setFloorRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [availableRoomNumbers, setAvailableRoomNumbers] = useState([]);
  const [roomNumberOptions, setRoomNumberOptions] = useState([]);

  const [form, setForm] = useState({
    guests: "",
    phones: "",
    roomType: "",
    roomNumber: "",
    checkIn: "",
    checkOut: "",
    status: "Booked",
    amount: "",
    documents: {
      aadhar: null,
      drivingLicense: null,
      electionCard: null,
      passport: null,
    },
  });

  const [removedDocuments, setRemovedDocuments] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  const token = localStorage.getItem("authToken");

  const fetchWithTimeout = async (url, options = {}, timeoutMs = 15000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(id);
    }
  };

  const parseApiError = (payload) => {
    if (!payload) return 'Unknown error';
    if (typeof payload === 'string') return payload;
    return (
      payload.error ||
      payload.message ||
      payload.msg ||
      (payload.details ? `${payload.details}` : null) ||
      JSON.stringify(payload)
    );
  };

  const fetchBookings = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${baseUrl}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to load bookings");
      }
      const data = await res.json();
      setBookings(
        (data?.data || []).map((b) => ({
          ...b,
          id: b._id || b.id,
        })),
      );
    } catch (err) {
      console.error("Failed to load bookings:", err);
      setBookings([]);
    }
  };

  const fetchFloorRooms = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/floor-and-rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to load rooms");
      }
      const data = await res.json();
      setFloorRooms(data?.data ?? []);
    } catch (err) {
      console.error("Failed to load floor and rooms:", err);
      setFloorRooms([]);
    }
  };

  useEffect(() => {
    fetchFloorRooms();
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const types = Array.from(
      new Set(
        floorRooms
          .filter((item) => item.roomNumber)
          .map((item) => item.roomType)
          .filter(Boolean),
      ),
    ).sort();
    setRoomTypes(types);

    if (!form.roomType && types.length > 0) {
      setForm((prev) => ({ ...prev, roomType: types[0] }));
    }
  }, [floorRooms, form.roomType]);

  useEffect(() => {
    if (!form.roomType) {
      setAvailableRoomNumbers([]);
      setRoomNumberOptions([]);
      return;
    }

    const allNumbers = Array.from(
      new Set(
        floorRooms
          .filter((item) => item.roomType === form.roomType && item.roomNumber)
          .map((item) => item.roomNumber),
      ),
    ).sort();

    const occupiedRooms = new Set(
      bookings
        .filter(
          (b) =>
            b.roomType === form.roomType &&
            b.roomNumber &&
            !['Checked Out', 'Cancelled'].includes(b.status),
        )
        .map((b) => b.roomNumber),
    );

    // When editing, allow the current booking's room number even if occupied.
    if (selectedBooking?.roomNumber) {
      occupiedRooms.delete(selectedBooking.roomNumber);
    }

    const available = allNumbers.filter((n) => !occupiedRooms.has(n));

    setAvailableRoomNumbers(available);

    const options = allNumbers.map((num) => ({
      value: num,
      disabled: occupiedRooms.has(num) && num !== form.roomNumber,
    }));
    setRoomNumberOptions(options);

    if (form.roomNumber && !available.includes(form.roomNumber)) {
      setForm((prev) => ({ ...prev, roomNumber: "" }));
    }
  }, [form.roomType, floorRooms, bookings, form.roomNumber, selectedBooking]);

  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previewUrls]);

  /* -------------------- MODAL HANDLERS -------------------- */
  const openModal = (type, booking = null) => {
    setModalType(type);
    setSelectedBooking(booking);

    if (type === "edit" && booking) {
      setForm({
        guests: booking.guests || "",
        phones: booking.phones || "",
        roomType: booking.roomType || "",
        roomNumber: booking.roomNumber || "",
        checkIn: booking.checkIn || "",
        checkOut: booking.checkOut || "",
        status: booking.status || "Booked",
        amount: booking.amount || "",
        documents: {
          aadhar: null,
          drivingLicense: null,
          electionCard: null,
          passport: null,
        },
      });
    }

    if (type === "upload" && booking) {
      setForm((prev) => ({
        ...prev,
        documents: {
          aadhar: null,
          drivingLicense: null,
          electionCard: null,
          passport: null,
        },
      }));
    }

    if (type === "new") {
      setForm((prev) => ({
        ...prev,
        guests: "",
        phones: "",
        roomType: roomTypes[0] || "",
        roomNumber: "",
        checkIn: "",
        checkOut: "",
        status: "Booked",
        amount: "",
        documents: {
          aadhar: null,
          drivingLicense: null,
          electionCard: null,
          passport: null,
        },
      }));
    }

    setIsOpen(true);
    setRemovedDocuments({});
    setPreviewUrls({});
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalType("");
    setSelectedBooking(null);
  };

  /* -------------------- FORM HANDLER -------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // When room type changes, reset room number so user picks a matching option
    if (name === "roomType") {
      setForm((prev) => ({ ...prev, roomType: value, roomNumber: "" }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (name, file) => {
    setForm((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [name]: file,
      },
    }));

    setPreviewUrls((prev) => {
      if (prev[name]) {
        URL.revokeObjectURL(prev[name]);
      }
      return {
        ...prev,
        [name]: file ? URL.createObjectURL(file) : null,
      };
    });

    setRemovedDocuments((prev) => ({
      ...prev,
      [name]: false,
    }));
  };

  const handleRemoveDocument = (name) => {
    setForm((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [name]: null,
      },
    }));

    setRemovedDocuments((prev) => ({
      ...prev,
      [name]: true,
    }));

    setPreviewUrls((prev) => {
      if (prev[name]) {
        URL.revokeObjectURL(prev[name]);
      }
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  /* -------------------- SAVE HANDLERS -------------------- */
  const handleAddBooking = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('guests', form.guests);
      formData.append('phones', form.phones);
      formData.append('roomType', form.roomType);
      formData.append('roomNumber', form.roomNumber);
      formData.append('checkIn', form.checkIn);
      formData.append('checkOut', form.checkOut);
      formData.append('status', form.status);
      formData.append('amount', form.amount);

      Object.entries(form.documents || {}).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      Object.entries(removedDocuments || {}).forEach(([key, removed]) => {
        if (removed) {
          formData.append(`remove_${key}`, 'true');
        }
      });

      const res = await fetchWithTimeout(`${baseUrl}/api/bookings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(`Failed to save booking: ${parseApiError(err)}`);
      }

      const data = await res.json();
      setBookings((prev) => [
        ...prev,
        { ...data.data, id: data.data._id || data.data.id },
      ]);
      closeModal();
    } catch (err) {
      console.error('Failed to save booking:', err);
      window.alert(`Failed to save booking: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateBooking = async () => {
    const bookingId = selectedBooking?.id || selectedBooking?._id;
    if (!bookingId) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('guests', form.guests);
      formData.append('phones', form.phones);
      formData.append('roomType', form.roomType);
      formData.append('roomNumber', form.roomNumber);
      formData.append('checkIn', form.checkIn);
      formData.append('checkOut', form.checkOut);
      formData.append('status', form.status);
      formData.append('amount', form.amount);

      Object.entries(form.documents || {}).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      Object.entries(removedDocuments || {}).forEach(([key, removed]) => {
        if (removed) {
          formData.append(`remove_${key}`, 'true');
        }
      });

      const res = await fetchWithTimeout(`${baseUrl}/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(`Failed to update booking: ${parseApiError(err)}`);
      }

      const data = await res.json();
      if (data?.movedToGuests) {
        // Booking has been moved to Guests; remove it from local state.
        setBookings((prev) => prev.filter((b) => b.id !== bookingId && b._id !== bookingId));
        closeModal();
        window.alert('Booking has been completed and moved to Guests.');
        return;
      }

      const updated = { ...data.data, id: data.data._id || data.data.id };

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId || b._id === bookingId ? updated : b,
        ),
      );

      setSelectedBooking(updated);
      closeModal();
    } catch (err) {
      console.error('Failed to update booking:', err);
      window.alert(`Failed to update booking: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadDocuments = async () => {
    const bookingId = selectedBooking?.id || selectedBooking?._id;
    if (!bookingId) return;

    setIsSaving(true);
    try {
      const formData = new FormData();

      Object.entries(form.documents || {}).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      Object.entries(removedDocuments || {}).forEach(([key, removed]) => {
        if (removed) {
          formData.append(`remove_${key}`, 'true');
        }
      });

      const res = await fetchWithTimeout(`${baseUrl}/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(`Failed to upload documents: ${parseApiError(err)}`);
      }

      const data = await res.json();
      const updated = { ...data.data, id: data.data._id || data.data.id };

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId || b._id === bookingId ? updated : b,
        ),
      );

      setSelectedBooking(updated);
      closeModal();
    } catch (err) {
      console.error('Failed to upload documents:', err);
      window.alert(`Failed to upload documents: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-orange-50 via-white to-orange-50 rounded-2xl p-6 shadow-sm border border-orange-200">
        <div>
          <h1 className="text-2xl font-bold text-orange-900">Bookings</h1>
          <p className="text-orange-600 mt-1">
            View and manage all hotel bookings.
          </p>
        </div>

        <button
          onClick={() => openModal("new")}
          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 px-5 py-2 text-sm font-semibold text-white shadow transition hover:from-orange-600 hover:to-orange-500"
        >
          + New Booking
        </button>
      </div>

      {/* Booking Table */}
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
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-orange-50">
                <td className="px-6 py-4 font-medium text-orange-900">{b.guests}</td>
                <td className="px-6 py-4 text-orange-700">{b.phones}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-orange-900">
                      {b.roomNumber || "—"}
                    </span>
                    <span className="text-xs text-orange-500">
                      {b.roomType || "Room type"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-orange-700">{b.checkIn}</td>
                <td className="px-6 py-4 text-orange-700">{b.checkOut}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(
                      b.status,
                    )}`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-orange-900">{b.amount}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => openModal("view", b)}
                    className="border border-orange-200 px-3 py-1 rounded-lg text-sm text-orange-700 hover:bg-orange-50"
                  >
                    View
                  </button>
                  <button
                    onClick={() => openModal("upload", b)}
                    className="border border-orange-400 text-orange-600 px-3 py-1 rounded-lg text-sm hover:bg-orange-50"
                  >
                    Documents
                  </button>
                  <button
                    onClick={() => openModal("edit", b)}
                    className="bg-gradient-to-r from-orange-500 to-orange-400 text-white px-3 py-1 rounded-lg text-sm hover:from-orange-600 hover:to-orange-500"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden max-h-[90vh]">
            <div className="flex items-start justify-between gap-4 p-6 border-b border-orange-200">
              <div>
                <h2 className="text-xl font-semibold text-orange-900">
                  {modalType === "view"
                    ? "Booking Details"
                    : modalType === "new"
                    ? "New Booking"
                    : modalType === "upload"
                    ? "Upload Documents"
                    : "Edit Booking"}
                </h2>
                <p className="text-sm text-orange-600">
                  {modalType === "view"
                    ? "Review booking information."
                    : modalType === "new"
                    ? "Fill in the details below to create a new booking."
                    : modalType === "upload"
                    ? "Upload or remove documents for this booking."
                    : "Update booking details."}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="text-orange-500 hover:text-orange-700 rounded-full p-2"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 p-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-4">
                {modalType === "view" && selectedBooking ? (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-orange-50 p-4">
                      <p className="text-sm text-orange-600">Guest</p>
                      <p className="text-base font-medium text-orange-900">
                        {selectedBooking.guests}
                      </p>
                    </div>

                    <div className="rounded-xl bg-orange-50 p-4">
                      <p className="text-sm text-orange-600">Contact</p>
                      <p className="text-base font-medium text-orange-900">
                        {selectedBooking.phones}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-xl bg-orange-50 p-4">
                        <p className="text-sm text-orange-600">Room</p>
                        <p className="text-base font-medium text-orange-900">
                          {selectedBooking.roomType}
                          {selectedBooking.roomNumber
                            ? ` - ${selectedBooking.roomNumber}`
                            : ""}
                        </p>
                      </div>
                      <div className="rounded-xl bg-orange-50 p-4">
                        <p className="text-sm text-orange-600">Status</p>
                        <p className="text-base font-medium text-orange-900">
                          {selectedBooking.status}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-orange-50 p-4">
                      <p className="text-sm text-orange-600">Check In</p>
                      <p className="text-base font-medium text-orange-900">
                        {selectedBooking.checkIn}
                      </p>
                    </div>
                    <div className="rounded-xl bg-orange-50 p-4">
                      <p className="text-sm text-orange-600">Check Out</p>
                      <p className="text-base font-medium text-orange-900">
                          {selectedBooking.checkOut}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-orange-50 p-4">
                      <p className="text-sm text-orange-600">Total</p>
                      <p className="text-base font-medium text-orange-900">
                        {selectedBooking.amount}
                      </p>
                    </div>

                    <div className="rounded-xl bg-orange-50 p-4">
                      <p className="text-sm text-orange-600">Documents</p>
                      <div className="mt-2 space-y-2">
                        {['aadhar', 'drivingLicense', 'electionCard', 'passport'].map(
                          (key) => {
                            const doc = selectedBooking.documents?.[key];
                            const label =
                              key === 'aadhar'
                                ? 'Aadhar Card'
                                : key === 'drivingLicense'
                                ? 'Driving License'
                                : key === 'electionCard'
                                ? 'Election Card'
                                : 'Passport';

                            return doc?.url ? (
                              <p key={key} className="text-sm text-gray-700">
                                {label}: 
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-indigo-600 hover:underline"
                                >
                                  View
                                </a>
                              </p>
                            ) : null;
                          },
                        )}
                        {!['aadhar', 'drivingLicense', 'electionCard', 'passport'].some(
                          (key) => selectedBooking.documents?.[key]?.url,
                        ) && (
                          <p className="text-sm text-gray-500">No documents uploaded.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : modalType === "upload" && selectedBooking ? (
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-gray-700">
                        Upload documents (optional)
                      </p>
                      <p className="text-sm text-gray-500">
                        Upload images for Aadhar, driving license, election card or passport.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        {[
                          { key: 'aadhar', label: 'Aadhar Card' },
                          { key: 'drivingLicense', label: 'Driving License' },
                          { key: 'electionCard', label: 'Election Card' },
                          { key: 'passport', label: 'Passport' },
                        ].map(({ key, label }) => (
                          <div key={key}>
                            <label className="block text-sm font-medium text-gray-700">
                              {label}
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileChange(key, e.target.files?.[0] ?? null)
                              }
                              className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />

                            {form.documents?.[key] ? (
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                <span>Selected: {form.documents[key].name}</span>
                                {previewUrls[key] ? (
                                  <button
                                    type="button"
                                    onClick={() => window.open(previewUrls[key], '_blank')}
                                    className="text-indigo-600 hover:underline"
                                  >
                                    Preview
                                  </button>
                                ) : null}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDocument(key)}
                                  className="text-red-600 hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : selectedBooking?.documents?.[key]?.url && !removedDocuments[key] ? (
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                <span>Current:</span>
                                <a
                                  className="text-indigo-600 hover:underline"
                                  href={selectedBooking.documents[key].url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  View
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDocument(key)}
                                  className="text-red-600 hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : removedDocuments[key] ? (
                              <p className="mt-1 text-xs text-gray-500">Removed</p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleUploadDocuments}
                      disabled={isSaving}
                      className={`mt-1 w-full rounded-lg px-4 py-2 text-sm font-medium text-white shadow transition focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                        isSaving
                          ? 'bg-orange-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500'
                      }`}
                    >
                      {isSaving ? 'Saving...' : 'Upload documents'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-orange-700">
                          Guest name(s)
                        </label>
                        <input
                          name="guests"
                          value={form.guests}
                          onChange={handleChange}
                          placeholder="e.g. Rajan, Amit"
                          className="mt-1 block w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-orange-700">
                          Phone number(s)
                        </label>
                        <input
                          name="phones"
                          value={form.phones}
                          onChange={handleChange}
                          placeholder="e.g. 9876543210"
                          className="mt-1 block w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-orange-700">
                        Room type
                      </label>
                      <select
                        name="roomType"
                        value={form.roomType}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      >
                        <option value="">Select room type</option>
                        {roomTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-orange-700">
                        Room number
                      </label>
                      <select
                        name="roomNumber"
                        value={form.roomNumber}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      >
                        <option value="">Select room</option>
                        {roomNumberOptions.length === 0 ? (
                          <option value="" disabled>
                            No rooms available
                          </option>
                        ) : (
                          roomNumberOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                              {opt.value}
                              {opt.disabled ? ' (occupied)' : ''}
                            </option>
                          ))
                        )}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Tip: Select a room type to see available rooms.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Check-in
                        </label>
                        <input
                          type="date"
                          name="checkIn"
                          value={form.checkIn}
                          onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Check-out
                        </label>
                        <input
                          type="date"
                          name="checkOut"
                          value={form.checkOut}
                          onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Amount
                        </label>
                        <input
                          name="amount"
                          value={form.amount}
                          onChange={handleChange}
                          placeholder="₹0.00"
                          className="mt-1 block w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <select
                          name="status"
                          value={form.status}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        >
                          <option>Booked</option>
                          <option>Checked In</option>
                          <option>Checked Out</option>
                          <option>Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={
                        modalType === "new" ? handleAddBooking : handleUpdateBooking
                      }
                      disabled={isSaving}
                      className={`mt-1 w-full rounded-lg px-4 py-2 text-sm font-medium text-white shadow transition focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                        isSaving
                          ? 'bg-orange-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500'
                      }`}
                    >
                      {isSaving ? 'Saving...' : 'Save booking'}
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;

