import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import '../styles.css';

const LogoutDropdown = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="logout-dropdown">
      <button 
        onClick={handleLogout} 
        className="logout-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          border: 'none',
          padding: '10px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease, transform 0.3s ease',
        }}
      >
        <LogoutIcon 
          style={{
            fontSize: '24px',
            color: '#d32f2f',
            transition: 'color 0.3s ease',
          }}
        />
      </button>
    </div>
  );
};

export default LogoutDropdown;
