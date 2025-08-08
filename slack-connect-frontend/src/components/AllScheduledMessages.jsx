import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import PixelatedButton from "./common/PixelatedButton";

const AllScheduledMessages = ({addedMessage}) => {
  const user = useSelector((state) => state.auth.user);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BackendURI}api/v1/slack/get/schedule-messages/${user.userId}`
      );
      setMessages(res.data.messages);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (id) => {
    try {
      await axios.post(`${import.meta.env.VITE_BackendURI}api/v1/slack/delete-scheduled-message`,{
        messageId: id
      });
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
    } catch (err) {
      console.error("Failed to delete message", err);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      fetchMessages();
    }
  }, [user, addedMessage]);

  if (loading) return <p>Loading scheduled messages...</p>;

  if (!messages.length) return <p>No scheduled messages found.</p>;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 mb-2">All Scheduled Messages</h3>
      {messages.map((msg) => (
        <div
          key={msg._id}
          className="p-4 border border-gray-300 rounded-lg shadow-sm bg-white flex justify-between items-center text-start"
        >
          <div>
            <p className="text-gray-800 font-medium">{msg.message}</p>
            <p className="text-gray-500 text-sm">
              Scheduled for: {new Date(msg.scheduledTime).toLocaleString()}
            </p>
            <p className="text-gray-500 text-sm">Channel ID: {msg.channelId}</p>
            <p className="text-gray-500 text-sm">Message: {msg.content}</p>
          </div>
          <PixelatedButton
            onClick={() => deleteMessage(msg._id)}
            className="px-3 py-1 bg-red-500 hover:text-white rounded hover:bg-red-600 transition"
          >
            Delete
          </PixelatedButton>
        </div>
      ))}
    </div>
  );
};

export default AllScheduledMessages;
