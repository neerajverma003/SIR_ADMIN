import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/images/background.jpg";
import shivanshLogo from "../assets/images/shivanshlogo.png";

const Login = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // use base URL from environment variable so it can be changed easily
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

    try {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Store token in localStorage
      localStorage.setItem("authToken", data.token);
      setIsLoggedIn(true);
      
      // Redirect to dashboard
      navigate("/");
    } catch (err) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="mb-6 text-center">
          <img src={shivanshLogo} alt="Shivansh Resort" className="mx-auto mb-4 h-32" />
          <h1 className="text-2xl font-bold text-gray-800">Sign in to your account</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition duration-200"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* <div className="mt-4 text-center text-gray-600 text-sm">
          <p>Demo credentials:</p>
          <p>Email: admin@resort.com</p>
          <p>Password: admin123</p>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
