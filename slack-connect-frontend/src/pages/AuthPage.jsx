import React, { useState } from "react";
import PixelatedBox from "../components/common/PixelatedBox";
import PixelatedButton from "../components/common/PixelatedButton";
import Spinner from "../components/common/Spinner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout, setUser } from "../redux/slices/authSlice";
import { jwtDecode } from "jwt-decode";

const API_BASE = `${import.meta.env.VITE_BackendURI}api/v1/auth`;

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await axios.post(`${API_BASE}/login`, {
        email,
        password,
      });

      const userData = res.data;

      localStorage.setItem("JWT", userData.jwt);
      const decoded = jwtDecode(userData.jwt);
      const response = await axios.get(`${import.meta.env.VITE_BackendURI}api/v1/user/get/${decoded.userId}`);
      if (!response.data?.userEmail) {
        dispatch(logout());
        navigate("/");
      } else {
        dispatch(setUser(response.data));
      }
      navigate("/home");
    } catch (err) {
      console.error("Login error", err);
      setErrorMessage(err.response?.data?.message || "Login failed");
    }
    setIsLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/register`, {
        email,
        password,
      });
      const userData = res.data;

      localStorage.setItem("JWT", userData.jwt);
      const decoded = jwtDecode(userData.jwt);
      const response = await axios.get(`${import.meta.env.VITE_BackendURI}api/v1/user/get/${decoded.userId}`);
      if (!response.data?.userEmail) {
        dispatch(logout());
        navigate("/");
      } else {
        dispatch(setUser(response.data));
      }
      navigate("/home");
    } catch (err) {
      console.error("Register error", err);
      setErrorMessage(err.response?.data?.message || "Registration failed");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center p-4 sm:p-6">
      <PixelatedBox className="w-full max-w-md p-6 sm:p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 flex flex-wrap mx-auto mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-tl-lg"></div>
            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-tr-lg"></div>
            <div className="w-6 h-6 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-bl-lg"></div>
            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-sky-500 rounded-br-lg"></div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-black">
            {isLogin ? "Welcome Back!" : "Create Account"}
          </h2>
          <p className="text-gray-600 mt-1">
            {isLogin ? "Log in to continue." : "Sign up to get started."}
          </p>
        </div>

        {/* 🔴 Show Error */}
        {errorMessage && (
          <div className="mb-4 text-red-600 font-medium text-sm text-center">{errorMessage}</div>
        )}

        <form className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
            />
          </div>
          {!isLogin && (
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-bold text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
            </div>
          )}
          <PixelatedButton
            className="w-full !bg-gradient-to-r !from-purple-500 !to-blue-500 !text-white !mt-6 flex justify-center items-center"
            onClick={isLogin ? handleLogin : handleRegister}
          >
            {isLoading ? <Spinner /> : isLogin ? "Login" : "Register"}
          </PixelatedButton>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMessage("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
            }}
            className="text-sm font-medium text-purple-600 hover:underline"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </PixelatedBox>
    </div>
  );
};

export default AuthPage;
