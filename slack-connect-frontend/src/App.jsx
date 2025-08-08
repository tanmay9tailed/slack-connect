import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ConnectSlack from './pages/ConnectSlack';
import { setUser, logout } from './redux/slices/authSlice';
import axios from 'axios';

export default function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const user = useSelector((state) => state.auth.user); // 👈 track auth state

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('JWT');
      if (!token) {
        setLoading(false);
        navigate('/');
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const res = await axios.get(`${import.meta.env.VITE_BackendURI}api/v1/user/get/${decoded.userId}`);
        if (!res.data?.userEmail) {
          dispatch(logout());
          navigate('/');
        } else {
          dispatch(setUser(res.data));
          if (location.pathname === '/' || location.pathname === '/auth') {
            navigate('/home');
          }
        }
      } catch (err) {
        dispatch(logout());
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="font-sans antialiased">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route
          path="/connect-slack"
          element={
            user ? (
              <ConnectSlack />
            ) : (
              <div className="text-center mt-10 text-red-500">
                Unauthorized – Please log in to access this page.
              </div>
            )
          }
        />
      </Routes>
    </div>
  );
}
