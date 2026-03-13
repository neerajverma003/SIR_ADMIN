import React from "react";
const bookings = [
  { id: 1, guest: "Rajan", room: "Deluxe", status: "Checked In" },
  { id: 2, guest: "Neeraj Verma", room: "Suite", status: "Booked" },
  { id: 3, guest: "Amit Singh", room: "Family", status: "Checked Out" },
];

const statusStyle = (status) => {
  switch (status) {
    case "Checked In":
      return "bg-green-100 text-green-700";
    case "Booked":
      return "bg-yellow-100 text-yellow-700";
    case "Checked Out":
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const BookingTable = () => {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-8">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">
          Recent Bookings
        </h2>
        <button className="text-sm text-blue-600 hover:underline">
          View all
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm">
              <th className="text-left px-6 py-3 font-medium">Guest</th>
              <th className="text-left px-6 py-3 font-medium">Room</th>
              <th className="text-left px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {bookings.map((b) => (
              <tr
                key={b.id}
                className="hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 font-medium text-gray-800">
                  {b.guest}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {b.room}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(
                      b.status
                    )}`}
                  >
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default BookingTable;
