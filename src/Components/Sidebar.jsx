import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiGrid,
  FiUsers,
  FiCalendar,
  FiSettings,
  FiLogOut,
  FiFileText,
  FiCreditCard,
  FiShield,
  FiMail,
  FiMessageSquare,
  FiVideo,
  FiImage,
  FiPhone,
} from "react-icons/fi";

const navClass = ({ isActive }) =>
  `block px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm font-medium ${
    isActive
      ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm"
      : "text-slate-800 hover:bg-orange-50"
  }`;

const Sidebar = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-white text-slate-900 flex flex-col border-r border-orange-200">
      <div className="px-6 py-5 text-xl font-semibold border-b border-orange-200 text-orange-900">
        Hotel Admin
      </div>

      <nav className="px-4 py-6 flex-1 space-y-4 overflow-y-auto">
        <div>
          <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">
            Main
          </div>
          <NavLink to="/" end className={navClass}>
            <FiHome className="text-lg" />
            Dashboard
          </NavLink>
        </div>

        <div>
          <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">
            Management
          </div>
          <NavLink to="/publish-rooms" className={navClass}>
            <FiGrid className="text-lg" />
            Publish Rooms
          </NavLink>
          <NavLink to="/bookings" className={navClass}>
            <FiCalendar className="text-lg" />
            Bookings
          </NavLink>
          <NavLink to="/guests" className={navClass}>
            <FiUsers className="text-lg" />
            Guests
          </NavLink>
        </div>

        <div>
          <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">
            Floor &amp; Rooms
          </div>
          <NavLink to="/floor-and-rooms" className={navClass}>
            <FiGrid className="text-lg" />
            Floor &amp; Rooms
          </NavLink>
        </div>

        <div>
          <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">
            Settings
          </div>
          <NavLink to="/settings" className={navClass}>
            <FiSettings className="text-lg" />
            Settings
          </NavLink>
        </div>

        <div>
          <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">
            Options
          </div>
          <NavLink to="/terms" className={navClass}>
            <FiFileText className="text-lg" />
            Terms & Conditions
          </NavLink>
          <NavLink to="/payment-policy" className={navClass}>
            <FiCreditCard className="text-lg" />
            Payment Policy
          </NavLink>
          <NavLink to="/cancellation-policy" className={navClass}>
            <FiShield className="text-lg" />
            Cancellation Policy
          </NavLink>
        </div>

        <div>
          <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">
            Leads
          </div>
          <NavLink to="/leads/reservations" className={navClass}>
            <FiCalendar className="text-lg" />
            Reservation Requests
          </NavLink>
          <NavLink to="/leads/consultation-requests" className={navClass}>
            <FiCalendar className="text-lg" />
            Consultation Requests
          </NavLink>
          <NavLink to="/leads/contacts" className={navClass}>
            <FiMail className="text-lg" />
            Contacts
          </NavLink>
          <NavLink to="/leads/suggestions" className={navClass}>
            <FiMessageSquare className="text-lg" />
            Suggestions
          </NavLink>
        </div>

        <div>
          <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">
            Testimonials
          </div>
          <NavLink to="/testimonials/videos" className={navClass}>
            <FiVideo className="text-lg" />
            Video Testimonials
          </NavLink>
          <NavLink to="/testimonials/text" className={navClass}>
            <FiFileText className="text-lg" />
            Text Testimonials
          </NavLink>
          <NavLink to="/testimonials/gallery" className={navClass}>
            <FiImage className="text-lg" />
            Customer Gallery
          </NavLink>
        </div>

        <div>
          <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">
            Blogs
          </div>
          <NavLink to="/blogs" className={navClass}>
            <FiFileText className="text-lg" />
            Blogs
          </NavLink>
        </div>
      </nav>

      <div className="px-4 py-4 border-t border-orange-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm hover:from-orange-600 hover:to-orange-500 transition"
        >
          <FiLogOut className="text-lg" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
