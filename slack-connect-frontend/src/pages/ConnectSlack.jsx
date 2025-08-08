import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

const ConnectSlack = () => {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState("");
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("code");
    if (code) {
      axios
      .post(`${import.meta.env.VITE_BackendURI}api/v1/slack/oauth`, {
        code: code,
        userId: user.userId,
      })
      .then((response) => {
        setWorkspace(response.data.workSpace);
      })
      .catch((error) => {
        console.error("OAuth error:", error.response?.data || error.message);
      });
    }
    
    const timer = setTimeout(() => {
      navigate("/home");
    }, 4000);

  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-yellow-100 flex flex-col items-center justify-center text-gray-800">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
        <h1 className="text-2xl font-semibold text-purple-600 mb-4">Connected to Slack...</h1>
        <p className="text-gray-600 text-md">Your workspace name: {workspace}</p>
        <div className="mt-6 text-xl text-blue-500 font-medium animate-pulse">
          Redirecting<span className="animate-bounce inline-block">.</span>
          <span className="animate-bounce inline-block delay-200">.</span>
          <span className="animate-bounce inline-block delay-400">.</span>
        </div>
      </div>
    </div>
  );
};

export default ConnectSlack;
