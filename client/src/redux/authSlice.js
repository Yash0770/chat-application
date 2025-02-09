import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    refreshToken: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        const { username, accessToken, refreshToken } = action.payload;
        state.user = username;
        state.token = accessToken;
        state.refreshToken = refreshToken;
        state.loading = false;

        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        state.token = action.payload; // Update token from refresh
        localStorage.setItem("token", action.payload);
      })
      .addCase(refreshTokenAsync.rejected, (state) => {
        state.token = null;
        state.refreshToken = null;
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      });
  },
});

export const refreshTokenAsync = createAsyncThunk(
  "auth/refreshTokenAsync",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        console.error("No refresh token available");
        throw new Error("No refresh token available");
      }

      const response = await fetch(
        "http://localhost:3001/api/auth/refresh-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Send cookies (if applicable)
          body: JSON.stringify({ refreshToken }), // Send refresh token explicitly
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Refresh token error:", errorData);
        throw new Error(errorData.message || "Failed to refresh token");
      }

      const data = await response.json();

      return data.accessToken; // Return the new access token
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginAsync = createAsyncThunk(
  "auth/loginAsync",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "include", // Send cookies (if applicable)
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || "Login failed");
      }

      return data; // { username, accessToken, refreshToken }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchWithAuth = async (url, options, dispatch) => {
  let token = localStorage.getItem("token");

  if (!options.headers) options.headers = {};
  options.headers["Authorization"] = `Bearer ${token}`;

  let response = await fetch(url, options);

  if (response.status === 401) {
    // Token expired
    console.warn("Access token expired, trying to refresh...");

    const newToken = await dispatch(refreshTokenAsync()).unwrap(); // 🔹 Use unwrap() to wait for new token

    if (newToken) {
      options.headers["Authorization"] = `Bearer ${newToken}`;
      response = await fetch(url, options); // Retry request
    } else {
      console.error("Failed to refresh token, logging out");
      dispatch(logout());
    }
  }

  return response.json();
};

export const { logout } = authSlice.actions;
// export { loginAsync, refreshTokenAsync }; // Export async thunks
export default authSlice.reducer;
// export default authSlice.reducer;
