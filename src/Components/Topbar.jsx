import React from "react";
import { useNavigate } from "react-router-dom";
const Topbar = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    navigate('/login');
  };
  const token = localStorage.getItem('authToken');
  return (
    <header className="h-16 bg-white shadow flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold">Hotel Admin Panel</h1>

      {token && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Admin</span>
          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center">
            A
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Topbar;
