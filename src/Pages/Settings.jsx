import React, { useState } from "react";

const Settings = () => {
  const [settings, setSettings] = useState({
    hotelName: "Shivansh Resort",
    email: "admin@shivanshresort.com",
    phone: "+91 98765 43210",
    checkIn: "12:00",
    checkOut: "11:00",
    notifications: true,
    darkMode: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Saved Settings:", settings);
    alert("Settings saved successfully ✅");
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 via-white to-orange-50 rounded-2xl p-6 shadow-sm border border-orange-200">
        <h1 className="text-2xl font-bold text-orange-900">Settings</h1>
        <p className="text-orange-600 mt-1">
          Manage hotel preferences and system configuration
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Hotel Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-orange-900">Hotel Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="hotelName"
              value={settings.hotelName}
              onChange={handleChange}
              placeholder="Hotel Name"
              className="border border-orange-200 rounded-lg px-4 py-2 focus:border-orange-500 focus:ring-orange-200 focus:ring-2"
            />
            <input
              type="text"
              name="phone"
              value={settings.phone}
              onChange={handleChange}
              placeholder="Contact Number"
              className="border border-orange-200 rounded-lg px-4 py-2 focus:border-orange-500 focus:ring-orange-200 focus:ring-2"
            />

            <input
              type="email"
              name="email"
              value={settings.email}
              onChange={handleChange}
              placeholder="Contact Email"
              className="border border-orange-200 rounded-lg px-4 py-2 focus:border-orange-500 focus:ring-orange-200 focus:ring-2"
            />
          </div>
        </div>

        {/* Check-in / Check-out */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-orange-900">
            Check-in / Check-out Time
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-700">Check-in Time</label>
              <input
                type="time"
                name="checkIn"
                value={settings.checkIn}
                onChange={handleChange}
                className="border border-orange-200 rounded-lg px-4 py-2 w-full focus:border-orange-500 focus:ring-orange-200 focus:ring-2"
              />
            </div>
               <div>
              <label className="text-sm text-slate-700">Check-out Time</label>
              <input
                type="time"
                name="checkOut"
                value={settings.checkOut}
                onChange={handleChange}
                className="border border-orange-200 rounded-lg px-4 py-2 w-full focus:border-orange-500 focus:ring-orange-200 focus:ring-2"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-orange-900">Preferences</h2>

          <div className="flex items-center justify-between py-2">
            <span className="text-slate-700">Enable Notifications</span>
            <input
              type="checkbox"
              name="notifications"
              checked={settings.notifications}
              onChange={handleChange}
              className="w-5 h-5 accent-orange-600"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-slate-700">Dark Mode</span>
            <input
              type="checkbox"
              name="darkMode"
              checked={settings.darkMode}
              onChange={handleChange}
              className="w-5 h-5 accent-orange-600"
            />
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-orange-900">Security</h2>

          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-orange-300 text-orange-900 hover:bg-orange-50 transition"
          >
            Change Password
          </button>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;

