import React, { useEffect, useMemo, useState } from "react";

const statusStyles = {
  available: "bg-orange-100 text-orange-700",
  occupied: "bg-red-100 text-red-700",
  maintenance: "bg-slate-100 text-slate-700",
};

const roomTypeOptions = [
  "Super Deluxe Family Room With 2 Washroom",
  "Superior DBL Room",
  "Superior Family Room",
  "Super Delux Family Room With 2 Washroom",
  "Super Deluxe DBL Room With Private Balcony",
  "Super Deluxe Family 6 Bed Room With 2 Washwashroom",
  "Executive TPL Room Mountain View",
];

const hallTypeOptions = ["Conference Hall", "Yoga Hall"];

const FloorAndRoom = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("floor");
  const [selectedFloorId, setSelectedFloorId] = useState("");

  const floorOptions = React.useMemo(
    () => items.filter((item) => item.roomType === "Floor"),
    [items]
  );

  const [form, setForm] = useState({
    floorNumber: "",
    roomNumber: "",
    hallName: "",
    roomType: "Floor",
    status: "available",
    price: "",
    notes: "",
  });

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  const token = localStorage.getItem("authToken");

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${baseUrl}/api/floor-and-rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to load data.");
      }
      const data = await res.json();
      setItems(data?.data ?? []);
    } catch (err) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const getTabFromType = (type) => {
    const normalized = String(type || "").toLowerCase();
    if (normalized === "floor") return "floor";
    if (normalized === "hall") return "hall";
    return "rooms";
  };

  const getTypeFromTab = (tab) => {
    if (tab === "floor") return "Floor";
    if (tab === "hall") return "Hall";
    return "Room";
  };

  const openModal = (item = null) => {
    if (item) {
      const tab = getTabFromType(item.roomType);
      setMode("edit");
      setSelected(item);
      setActiveTab(tab);

      const matchingFloor = floorOptions.find(
        (f) => String(f.floorNumber) === String(item.floorNumber)
      );
      setSelectedFloorId(matchingFloor?._id || "");

      setForm({
        floorNumber: item.floorNumber ?? "",
        roomNumber: item.roomNumber ?? "",
        hallName: item.hallName ?? "",
        roomType: item.roomType ?? getTypeFromTab(tab),
        status: item.status ?? "available",
        price: item.price ?? "",
        notes: item.notes ?? "",
      });
    } else {
      setMode("create");
      setSelected(null);

      const initialFloor = floorOptions[0];
      setSelectedFloorId(initialFloor?._id || "");

      setForm({
        floorNumber: activeTab === "floor" ? "" : initialFloor?.floorNumber ?? "",
        roomNumber: "",
        hallName: "",
        roomType:
          activeTab === "floor"
            ? "Floor"
            : activeTab === "hall"
            ? hallTypeOptions[0]
            : roomTypeOptions[0],
        status: "available",
        price: "",
        notes: "",
      });
    }
    setError("");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelected(null);
    setError("");
  };

  const updateForm = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSelectFloor = (event) => {
    const floorId = event.target.value;
    setSelectedFloorId(floorId);
    const floor = floorOptions.find((f) => f._id === floorId);
    if (floor) {
      setForm((prev) => ({ ...prev, floorNumber: floor.floorNumber }));
    }
  };

  const handleSave = async () => {
    setError("");

    if (!form.floorNumber && activeTab !== "floor") {
      setError("Please select a floor first.");
      return;
    }

    if (!form.floorNumber && activeTab === "floor") {
      setError("Floor number is required.");
      return;
    }

    const payload = {
      floorNumber: String(form.floorNumber),
      roomNumber: activeTab === "rooms" ? String(form.roomNumber) : "",
      hallName: activeTab === "hall" ? String(form.hallName) : "",
      roomType: activeTab === "floor" ? "Floor" : String(form.roomType),
      status: String(form.status),
    };

    try {
      const url =
        mode === "edit"
          ? `${baseUrl}/api/floor-and-rooms/${selected._id}`
          : `${baseUrl}/api/floor-and-rooms`;
      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to save.");
      }

      const data = await res.json();
      if (mode === "edit") {
        setItems((prev) => prev.map((item) => (item._id === data.data._id ? data.data : item)));
      } else {
        setItems((prev) => [...prev, data.data]);
      }
      closeModal();
    } catch (err) {
      setError(err.message || "Failed to save.");
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Delete this floor/room entry?")) return;
    try {
      const res = await fetch(`${baseUrl}/api/floor-and-rooms/${item._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to delete.");
      }
      setItems((prev) => prev.filter((x) => x._id !== item._id));
    } catch (err) {
      setError(err.message || "Failed to delete.");
    }
  };

  const tabs = [
    { id: "floor", label: "Floor" },
    { id: "rooms", label: "Rooms" },
    { id: "hall", label: "Hall" },
  ];

  const activeLabel = tabs.find((t) => t.id === activeTab)?.label || "Floor";

  return (
    <div className="p-6 md:p-10">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-gradient-to-r from-orange-50 via-white to-orange-50 rounded-2xl p-6 shadow-sm border border-orange-200">
        <div>
          <h1 className="text-3xl font-bold text-orange-900">Floor &amp; Rooms</h1>
          <p className="text-orange-600 mt-1">
            Manage floors, rooms, and hall entries.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-2 text-sm font-semibold text-white shadow transition hover:from-orange-600 hover:to-orange-500"
        >
          + Add {activeLabel}
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white"
                : "bg-orange-50 text-orange-700 hover:bg-orange-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      ) : (
        (() => {
          const visibleItems = items.filter((item) => {
            const type = getTabFromType(item.roomType);
            return type === activeTab;
          });

          if (visibleItems.length === 0) {
            return (
              <div className="rounded-lg border border-dashed border-orange-200 bg-white p-8 text-center text-orange-600">
                No {activeLabel.toLowerCase()} entries yet.
              </div>
            );
          }

          return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleItems.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-orange-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-slate-900">
                        {item.roomType === "Floor"
                          ? item.floorNumber
                          : item.roomType === "Hall"
                          ? item.hallName
                          : item.roomNumber}
                      </div>
                      <div className="mt-2 text-sm text-slate-600">
                        Type: {item.roomType || "Standard"}
                      </div>
                      {activeTab !== "floor" ? (
                        <div className="mt-1 flex items-center gap-2 text-xs">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 ${
                              statusStyles[item.status] || "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => openModal(item)}
                        className="rounded-lg bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {item.notes ? (
                    <div className="mt-4 text-sm text-slate-600">{item.notes}</div>
                  ) : null}
                </div>
              ))}
            </div>
          );
        })()
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-black/10 border border-orange-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-orange-900">
                  {mode === "edit" ? `Edit ${activeLabel}` : `Add ${activeLabel}`}
                </h2>
                <p className="mt-1 text-base text-orange-600">
                  {mode === "edit"
                    ? `Update ${activeLabel.toLowerCase()} details.`
                    : `Create a new ${activeLabel.toLowerCase()} entry.`}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full px-4 py-2 text-sm font-semibold text-orange-500 transition hover:bg-orange-50 hover:text-orange-700"
              >
                ×
              </button>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {activeTab === "floor" ? (
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Floor number
                  </span>
                  <input
                    type="text"
                    value={form.floorNumber}
                    onChange={updateForm("floorNumber")}
                    className="mt-1 block w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-base shadow-sm transition focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </label>
              ) : (
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Select floor
                  </span>
                  <div className="relative mt-1">
                    <select
                      value={selectedFloorId}
                      onChange={handleSelectFloor}
                      className="block w-full appearance-none rounded-xl border border-orange-200 bg-white px-4 py-3 pr-10 text-base shadow-sm transition focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200"
                    >
                      <option value="" disabled>
                        Choose a floor
                      </option>
                      {floorOptions.map((floor) => (
                        <option key={floor._id} value={floor._id}>
                          {floor.floorNumber}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-orange-400">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 8l4 4 4-4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </label>
              )}

              {activeTab !== "floor" && (
                <>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      {activeTab === "rooms" ? "Room number" : "Hall name"}
                    </span>
                    <input
                      type="text"
                      value={activeTab === "rooms" ? form.roomNumber : form.hallName}
                      onChange={
                        activeTab === "rooms"
                          ? updateForm("roomNumber")
                          : updateForm("hallName")
                      }
                        className="mt-1 block w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-base shadow-sm transition focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200"
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="text-sm font-medium text-slate-700">
                        {activeTab === "rooms" ? "Room type" : "Hall type"}
                      </span>
                      <div className="relative mt-1">
                        <select
                          value={form.roomType}
                          onChange={updateForm("roomType")}
                          className="block w-full appearance-none rounded-xl border border-orange-200 bg-white px-4 py-3 pr-10 text-base shadow-sm transition focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200"
                        >
                          {(activeTab === "rooms" ? roomTypeOptions : hallTypeOptions).map(
                            (option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            )
                          )}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-orange-400">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6 8l4 4 4-4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </label>

                    <label className="block md:col-span-2">
                      <span className="text-sm font-medium text-slate-700">
                        Status
                      </span>
                      <div className="relative mt-1">
                        <select
                          value={form.status}
                          onChange={updateForm("status")}
                          className="block w-full appearance-none rounded-xl border border-orange-200 bg-white px-4 py-3 pr-10 text-base shadow-sm transition focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200"
                        >
                          <option value="available">Available</option>
                          <option value="occupied">Occupied</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-orange-400">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6 8l4 4 4-4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </label>
                  </>
              )}

            </div>

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={closeModal}
                className="w-full rounded-xl border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-orange-600 hover:to-orange-500 sm:w-auto"
              >
                {mode === "edit" ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloorAndRoom;
