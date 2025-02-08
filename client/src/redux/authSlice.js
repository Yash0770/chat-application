import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    token: null // Stores accessToken
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { username: user, accessToken: token, refreshToken } = action.payload;
      console.log('refreshToken',refreshToken);
      
      
      if (user && token) {
        state.user = user;
        state.token = token;
        localStorage.setItem('token', token);
      } else {
        console.error('Invalid login data', action.payload);
      }
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },

    refreshAccessToken: (state, action) => {
      state.token = action.payload.accessToken;  // Update the token in Redux
      localStorage.setItem('token', action.payload.accessToken);
    }
  },
});

export const { login, logout, refreshAccessToken } = authSlice.actions;

// Async action creator
export const refreshTokenAsync = () => async (dispatch) => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/refresh-token', {
      method: 'POST',
      credentials: 'include',  // Important: Send cookies for refreshToken
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    console.log('New Access Token:', data.accessToken);

    dispatch(refreshAccessToken(data));  // Update Redux state
    return data.accessToken; // Return new token
  } catch (error) {
    console.error('Error refreshing token:', error);
    dispatch(logout());  // If refresh fails, log the user out
  }
};

export const loginAsync = (credentials) => async (dispatch) => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    const data = await response.json();    

    if (response.ok) {
      dispatch(login(data)); // Save accessToken in Redu
      return data; // Return the data to resolve the promise
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-throw the error to trigger .catch()
  }
};

export const fetchWithAuth = async (url, options, dispatch) => {
  const token = localStorage.getItem('token');

  if (!options.headers) options.headers = {};
  options.headers['Authorization'] = `Bearer ${token}`;

  let response = await fetch(url, options);

  if (response.status === 401) {
    console.warn('Access token expired, trying to refresh...');

    // Refresh the token
    const newToken = await dispatch(refreshTokenAsync());

    if (newToken) {
      options.headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, options);  // Retry the request
    } else {
      console.error('Failed to refresh token, logging out');
      dispatch(logout());
    }
  }

  return response.json();
};


export default authSlice.reducer;