import React, { useMemo, useRef, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const AMENITIES = [
  "High-speed WiFi",
  "Air Conditioning",
  "Smart TV",
  "Coffee Maker",
  "Luxury Bath",
  "In-room Safe",
  "Daily Housekeeping",
  "Room Service",
];

const makePreview = (file) => ({
  file,
  preview: URL.createObjectURL(file),
});

const PublishRooms = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [rooms, setRooms] = useState([]);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  const token = localStorage.getItem("authToken");

  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    overview: "",
    price: "",
    rating: 4,
    guests: 2,
    amenities: AMENITIES.reduce((acc, item) => ({ ...acc, [item]: false }), {}),
    mainImage: null,
    gallery: [],
  });

  const roomCount = useMemo(() => rooms.length, [rooms]);

  const resetForm = () => {
    setForm({
      name: "",
      overview: "",
      price: "",
      rating: 4,
      guests: 2,
      amenities: AMENITIES.reduce((acc, item) => ({ ...acc, [item]: false }), {}),
      mainImage: null,
      gallery: [],
    });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "amenity") {
      setForm((prev) => ({
        ...prev,
        amenities: {
          ...prev.amenities,
          [value]: checked,
        },
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: type === "number" ? Number(value) : value }));
  };

  const handleMainImageSelect = (files) => {
    const file = files[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, mainImage: makePreview(file) }));
  };

  const handleGallerySelect = (files) => {
    if (!files?.length) return;
    const newItems = Array.from(files).map(makePreview);
    setForm((prev) => ({ ...prev, gallery: [...prev.gallery, ...newItems] }));
  };

  const handleDropMain = (event) => {
    event.preventDefault();
    handleMainImageSelect(event.dataTransfer.files);
  };

  const handleDropGallery = (event) => {
    event.preventDefault();
    handleGallerySelect(event.dataTransfer.files);
  };

  const fetchRooms = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${baseUrl}/api/publishrooms`, { headers });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to load published rooms.");
      }

      const data = await res.json();
      setRooms((data?.data || []).map((room) => ({
        ...room,
        id: room._id || room.id,
      })));
    } catch (err) {
      console.error("Failed to load publish rooms:", err);
      setRooms([]);
    }
  };

  React.useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEditRoom = (room) => {
    setEditingRoomId(room.id);
    setActiveTab("create");

    setForm((prev) => ({
      ...prev,
      name: room.name || "",
      overview: room.overview || "",
      price: room.price || "",
      rating: room.rating || 4,
      guests: room.guests || 2,
      amenities: AMENITIES.reduce(
        (acc, item) => ({ ...acc, [item]: room.amenities?.includes(item) || false }),
        {},
      ),
      mainImage: room.mainImage
        ? { preview: room.mainImage.url || room.mainImage.preview }
        : null,
      gallery: (room.gallery || []).map((item) => ({ preview: item.url || item.preview })),
    }));
  };

  const handleAddRoom = async () => {
    if (!form.name.trim()) return;

    setIsPublishing(true);

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("overview", form.overview.trim());
    formData.append("price", form.price.trim());
    formData.append("rating", String(form.rating));
    formData.append("guests", String(form.guests));

    const amenities = Object.entries(form.amenities)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key);

    amenities.forEach((amenity) => formData.append("amenities", amenity));

    if (form.mainImage?.file) {
      formData.append("mainImage", form.mainImage.file);
    }

    (form.gallery || []).forEach((item) => {
      if (item?.file) {
        formData.append("gallery", item.file);
      }
    });

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const url = editingRoomId
        ? `${baseUrl}/api/publishrooms/${editingRoomId}`
        : `${baseUrl}/api/publishrooms`;
      const method = editingRoomId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to publish room.");
      }

      const data = await res.json();
      const created = data.data;

      setRooms((prev) => {
        if (editingRoomId) {
          return prev.map((room) => (room.id === editingRoomId ? created : room));
        }
        return [created, ...prev];
      });

      resetForm();
      setEditingRoomId(null);
      setActiveTab("list");
    } catch (err) {
      console.error("Failed to publish room:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRemoveRoom = async (id) => {
    setDeletingId(id);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${baseUrl}/api/publishrooms/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to delete room.");
      }
      setRooms((prev) => prev.filter((room) => room.id !== id));
    } catch (err) {
      console.error("Failed to delete room:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gradient-to-r from-orange-50 via-white to-orange-50 rounded-2xl p-6 shadow-sm border border-orange-200">
        <div>
          <h1 className="text-2xl font-bold text-orange-900">Publish Rooms</h1>
          <p className="text-orange-600 mt-1">
            Create and manage published rooms for your property.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab("create")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-orange-300 ${
              activeTab === "create"
                ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow"
                : "bg-white text-orange-800 border border-orange-200 hover:bg-orange-50"
            }`}
          >
            Create Room
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-orange-300 ${
              activeTab === "list"
                ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow"
                : "bg-white text-orange-800 border border-orange-200 hover:bg-orange-50"
            }`}
          >
            Rooms List ({roomCount})
          </button>
        </div>
      </div>

      {activeTab === "create" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-orange-200 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-orange-800">Room Details</h2>
              <div className="space-y-4">
                <label className="space-y-1 text-sm text-slate-700">
                  Room Name
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="Deluxe Suite"
                    className="w-full rounded-lg border border-orange-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                  />
                </label>
                <label className="space-y-1 text-sm text-slate-700">
                  Overview
                  <textarea
                    name="overview"
                    value={form.overview}
                    onChange={handleFormChange}
                    rows={4}
                    placeholder="Brief description of the room."
                    className="w-full rounded-lg border border-orange-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                  />
                </label>
              </div>

              <div className="space-y-4 pt-4 border-t border-orange-100">
                <h3 className="text-lg font-semibold text-orange-800">Room Images</h3>
                <div className="space-y-4">
                  <div
                    className="rounded-xl border border-dashed border-gray-300 p-6 text-center cursor-pointer hover:border-slate-400"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDropMain}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {form.mainImage ? (
                      <img
                        src={form.mainImage.preview}
                        alt="Main"
                        className="mx-auto h-40 w-full max-w-sm object-cover rounded-lg"
                      />
                    ) : (
                      <div className="space-y-2">
                        <div className="text-lg font-medium text-orange-800">Upload main image</div>
                        <div className="text-sm text-gray-500">
                          Drag & drop or click to select one image
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleMainImageSelect(e.target.files)}
                    />
                  </div>

                  <div
                    className="rounded-xl border border-dashed border-gray-300 p-6 text-center cursor-pointer hover:border-slate-400"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDropGallery}
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    <div className="space-y-2">
                      <div className="text-lg font-medium text-orange-800">Upload gallery images</div>
                      <div className="text-sm text-gray-500">
                        Drag & drop (multiple) or click to select
                      </div>
                    </div>
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleGallerySelect(e.target.files)}
                    />
                  </div>

                  {form.gallery.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {form.gallery.map((item, index) => (
                        <div
                          key={index}
                          className="relative overflow-hidden rounded-lg border"
                        >
                          <img
                            src={item.preview}
                            alt={`Gallery ${index + 1}`}
                            className="h-24 w-full object-cover"
                          />
                          <button
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                gallery: prev.gallery.filter((_, i) => i !== index),
                              }))
                            }
                            className="absolute top-1 right-1 rounded-full bg-white/80 px-2 py-1 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-orange-200 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-orange-800">Booking Details</h2>
              <div className="space-y-4">
                <label className="space-y-1 text-sm text-slate-700">
                  Price (per night)
                  <input
                    name="price"
                    value={form.price}
                    onChange={handleFormChange}
                    placeholder="₹4,500"
                    className="w-full rounded-lg border border-orange-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                  />
                </label>
                <label className="space-y-1 text-sm text-slate-700">
                  Star Rating
                  <select
                    name="rating"
                    value={form.rating}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-orange-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} star{value > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm text-slate-700">
                  Guests
                  <input
                    name="guests"
                    type="number"
                    value={form.guests}
                    min={1}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-orange-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                  />
                </label>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-orange-200 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-orange-800">Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {AMENITIES.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center gap-2 rounded-lg border border-orange-200 px-3 py-2 cursor-pointer hover:bg-orange-50"
                  >
                    <input
                      name="amenity"
                      type="checkbox"
                      value={amenity}
                      checked={form.amenities[amenity] || false}
                      onChange={handleFormChange}
                      className="h-4 w-4 rounded"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAddRoom}
                disabled={isPublishing}
                className={`rounded-lg px-6 py-2 text-sm font-medium text-white shadow focus:outline-none focus:ring-2 focus:ring-orange-300 transition ${
                  isPublishing
                    ? "bg-orange-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500"
                }`}
              >
                {isPublishing ? "Publishing..." : "Publish Room"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {rooms.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50 p-10 text-center">
              <div className="text-lg font-semibold text-orange-900">No rooms published yet.</div>
              <div className="text-sm text-orange-600 mt-1">
                Use the "Create Room" tab to publish your first room.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
                >
                  <div className="relative">
                    {room.mainImage ? (
                      <img
                        src={room.mainImage.url || room.mainImage.preview}
                        alt={room.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-gray-50 text-gray-400">
                        No Image
                      </div>
                    )}

                    <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow">
                      Popular
                    </span>

                      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                      <button
                        onClick={() => startEditRoom(room)}
                        className="h-9 w-9 flex items-center justify-center rounded-full bg-white/90 text-slate-700 shadow transition hover:bg-sky-50 hover:text-sky-600 focus:outline-none"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleRemoveRoom(room.id)}
                        disabled={deletingId === room.id}
                        className={`h-9 w-9 flex items-center justify-center rounded-full bg-white/90 text-slate-700 shadow transition hover:bg-red-50 hover:text-red-600 focus:outline-none ${
                          deletingId === room.id ? "cursor-not-allowed opacity-70" : ""
                        }`}
                        title="Delete"
                      >
                        {deletingId === room.id ? (
                          <svg
                            className="h-4 w-4 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                          </svg>
                        ) : (
                          <FiTrash2 />
                        )}
                      </button>
                    </div>

                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900">
                          {room.name}
                        </h2>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {room.overview || "Experience luxury and comfort with our meticulously designed rooms offering the best..."}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-sm">
                        {[...Array(5)].map((_, idx) => (
                          <span key={idx}>★</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {room.gallery?.slice(0, 3).map((item, idx) => (
                        <img
                          key={idx}
                          src={item.url || item.preview}
                          alt={`Gallery ${idx + 1}`}
                          className="h-14 w-14 rounded-lg object-cover border border-slate-200"
                        />
                      ))}
                      {room.gallery?.length > 3 && (
                        <div className="h-14 w-14 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-700 border border-slate-200">
                          +{room.gallery.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-slate-900">
                        {room.price || "₹1,999"} <span className="text-sm font-normal text-slate-500">(10% off)</span>
                      </div>
                      <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600 transition">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PublishRooms;
