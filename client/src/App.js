import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Chat from './components/Chat';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { refreshTokenAsync } from './redux/authSlice';

function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (token) {
      dispatch(refreshTokenAsync());
      
      const interval = setInterval(() => {
        dispatch(refreshTokenAsync());
      }, 55000);

      return () => clearInterval(interval);
    }
  }, [dispatch, token]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
