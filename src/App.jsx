import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import Topbar from "./Components/Topbar";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import PublishRooms from "./Pages/PublishRooms";
import FloorAndRoom from "./Pages/FloorAndRoom";
import Bookings from "./Pages/Bookings";
import Guests from "./Pages/Guests";
import Settings from "./Pages/Settings";
import Terms from "./Pages/Terms";
import PaymentPolicy from "./Pages/PaymentPolicy";
import CancellationPolicy from "./Pages/CancellationPolicy";
import LeadsConsultationRequests from "./Pages/LeadsConsultationRequests";
import LeadsContacts from "./Pages/LeadsContacts";
import LeadsReservations from "./Pages/LeadsReservations";
import LeadsSuggestions from "./Pages/LeadsSuggestions";
import TestimonialsVideos from "./Pages/TestimonialsVideos";
import TestimonialsText from "./Pages/TestimonialsText";
import TestimonialsGallery from "./Pages/TestimonialsGallery";
import Blogs from "./Pages/Blogs";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
      
      {isLoggedIn ? (
        <Route
          path="/*"
          element={
            <div className="flex h-screen overflow-hidden">
              <Sidebar setIsLoggedIn={setIsLoggedIn} />
              <div className="flex-1 flex flex-col">
                <Topbar setIsLoggedIn={setIsLoggedIn} />
                <div className="flex-1 overflow-y-auto bg-gray-100">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/publish-rooms" element={<PublishRooms />} />
                    <Route path="/floor-and-rooms" element={<FloorAndRoom />} />
                    <Route path="/bookings" element={<Bookings />} />
                    <Route path="/guests" element={<Guests />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/payment-policy" element={<PaymentPolicy />} />
                    <Route path="/cancellation-policy" element={<CancellationPolicy />} />

                    <Route
                      path="/leads"
                      element={<Navigate to="/leads/consultation-requests" replace />}
                    />
                    <Route
                      path="/leads/consultation-requests"
                      element={<LeadsConsultationRequests />}
                    />
                    <Route path="/leads/reservations" element={<LeadsReservations />} />
                    <Route path="/leads/contacts" element={<LeadsContacts />} />
                    <Route path="/leads/suggestions" element={<LeadsSuggestions />} />

                    <Route
                      path="/testimonials"
                      element={<Navigate to="/testimonials/videos" replace />}
                    />
                    <Route
                      path="/testimonials/videos"
                      element={<TestimonialsVideos />}
                    />
                    <Route
                      path="/testimonials/text"
                      element={<TestimonialsText />}
                    />
                    <Route
                      path="/testimonials/gallery"
                      element={<TestimonialsGallery />}
                    />
                    <Route path="/blogs" element={<Blogs />} />
                  </Routes>
                </div>
              </div>
            </div>
          }
        />
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
  );
};

export default App;
