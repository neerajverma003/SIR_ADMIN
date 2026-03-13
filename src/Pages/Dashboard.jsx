import React from "react";
import BookingTable from "../Components/BookingTable";

const Dashboard = () => {
  return (
    <div className="p-6 space-y-10">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Overview of hotel bookings and revenue
        </p>
      </div>

      {/* UNIQUE STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Rooms */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg hover:-translate-y-1 transition">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-sm opacity-90">Total Rooms</p>
              <span className="text-xl opacity-80">🏨</span>
            </div>
            <h2 className="text-3xl font-bold mt-4">120</h2>
            <p className="text-xs opacity-80 mt-2">All hotel rooms</p>
            <div className="mt-4 h-1 w-12 rounded-full bg-white/60"></div>
          </div>


             </div>

        {/* Available Rooms */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-lg hover:-translate-y-1 transition">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-sm opacity-90">Available Rooms</p>
              <span className="text-xl opacity-80">🟢</span>
            </div>
            <h2 className="text-3xl font-bold mt-4">45</h2>
            <p className="text-xs opacity-80 mt-2">Ready to book</p>
            <div className="mt-4 h-1 w-12 rounded-full bg-white/60"></div>
          </div>
        </div>

        {/* Bookings Today */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-orange-400 to-amber-600 text-white shadow-lg hover:-translate-y-1 transition">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-sm opacity-90">Bookings Today</p>
              <span className="text-xl opacity-80">📅</span>
            </div>
            <h2 className="text-3xl font-bold mt-4">38</h2>
            <p className="text-xs opacity-80 mt-2">New reservations</p>
            <div className="mt-4 h-1 w-12 rounded-full bg-white/60"></div>
          </div>
        </div>
        {/* Revenue */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg hover:-translate-y-1 transition">
          
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-sm opacity-90">Revenue</p>
              <span className="text-xl opacity-80">💰</span>
            </div>
            <h2 className="text-3xl font-bold mt-4">₹1,25,000</h2>
            <p className="text-xs opacity-80 mt-2">Today’s earnings</p>
            <div className="mt-4 h-1 w-12 rounded-full bg-white/60"></div>
          </div>
        </div>
      </div>

      {/* BOOKINGS TABLE */}
      <BookingTable />
    </div>
  );
};

export default Dashboard;
