import React from "react";
import { useNavigate } from "react-router-dom";
import PixelatedButton from "./common/PixelatedButton";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b-2 border-black z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 flex flex-wrap flex-shrink-0">
            <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-tl-lg"></div>
            <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-tr-lg"></div>
            <div className="w-4 h-4 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-bl-lg"></div>
            <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-sky-500 rounded-br-lg"></div>
          </div>
          <span className="font-bold text-lg sm:text-xl text-black">
            Slack Connect
          </span>
        </div>

        {user == null ? (
          <PixelatedButton onClick={() => navigate("/auth")}>
            Login / Register
          </PixelatedButton>
        ) : (
          <PixelatedButton onClick={handleLogout}>Logout</PixelatedButton>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
