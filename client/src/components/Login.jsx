import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { login, loginAsync } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log('credentials', credentials)

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginAsync(credentials))
      .then(() => navigate("/chat"))
      .catch((error) => console.error("Login failed:", error));
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Username"
        onChange={(e) =>
          setCredentials({ ...credentials, username: e.target.value })
        }
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setCredentials({ ...credentials, password: e.target.value })
        }
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
