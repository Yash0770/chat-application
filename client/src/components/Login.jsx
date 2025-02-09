import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginAsync } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null); // Track login errors
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error before new login attempt

    try {
      const data = await dispatch(loginAsync(credentials)).unwrap(); // Ensure proper error handling
      if (data.accessToken) {
        localStorage.setItem("refreshToken", data.refreshToken); // Store refreshToken
        navigate("/chat");
      }
    } catch (err) {
      setError(err.message || "Login failed"); // Show error message
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={credentials.username}
        onChange={(e) =>
          setCredentials({ ...credentials, username: e.target.value })
        } 
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={credentials.password}
        onChange={(e) =>
          setCredentials({ ...credentials, password: e.target.value })
        }
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
