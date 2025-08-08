import React, { useEffect, useState } from "react";
import axios from "axios";
import PixelatedBox from "../components/common/PixelatedBox";
import PixelatedButton from "../components/common/PixelatedButton";
import { useSelector } from "react-redux";
import AllScheduledMessages from "../components/AllScheduledMessages";

const HomePage = () => {
  const [haveAccessToken, setHaveAccessToken] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [message, setMessage] = useState("");
  const [addedMessage, setAddedMessage] = useState(false);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user || !user.userId) return;
    const checkAccessToken = async () => {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BackendURI}api/v1/slack/have-access-token`,
          {
            userId: user.userId,
          }
        );

        if (res.data?.isAuthorized) {
          setHaveAccessToken(true);
          fetchWorkspaceDetails();
        } else {
          setHaveAccessToken(false);
        }
      } catch (err) {
        console.error("Error checking access token:", err);
        setHaveAccessToken(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccessToken();
  }, [user]);

  const fetchWorkspaceDetails = async () => {
    try {
      const workspaceRes = await axios.post(
        `${import.meta.env.VITE_BackendURI}api/v1/slack/workspace`,
        {
          userId: user.userId,
        }
      );

      setWorkspaceName(workspaceRes.data.team.name || "Unknown Workspace");

      const channelsRes = await axios.post(
        `${import.meta.env.VITE_BackendURI}api/v1/slack/channels`,
        {
          userId: user.userId,
        }
      );

      setChannels(channelsRes.data.channels || []);
    } catch (error) {
      console.error("Error fetching workspace details", error);
    }
  };

  const handleSendNow = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BackendURI}api/v1/slack/send-now`, {
        userId: user.userId,
        channelId: selectedChannel,
        message: message,
      });
      alert("Message sent!");
      setMessage("");
      setSelectedChannel(null);
    } catch (err) {
      alert("Failed to send message.");
      console.error(err);
    }
  };

  const handleSchedule = async () => {
    if (!scheduleDate || !scheduleTime) {
      alert("Please enter both date and time.");
      return;
    }
    const scheduleTimeInput = `${scheduleDate}T${scheduleTime}`;
    const parsedDate = new Date(scheduleTimeInput);

    if (isNaN(parsedDate.getTime())) {
      alert("Invalid date/time format.");
      return;
    }

    const currentTime = Date.now();
    const futureTime = parsedDate.getTime();

    if (futureTime <= currentTime) {
      alert("Please choose a future time.");
      return;
    }

    try {
      axios
        .post(`${import.meta.env.VITE_BackendURI}api/v1/slack/schedule-message`, {
          userId: user.userId,
          channelId: selectedChannel,
          message: message,
          scheduleTime: futureTime,
        })
        .then((e) => {
          console.log(e);
        });
      setMessage("");
      setSelectedChannel(null);
      setShowScheduleModal(false);
      setScheduleDate("");
      setScheduleTime("");
      alert("Message scheduled!");
      setAddedMessage(prev => !prev);
    } catch (err) {
      alert("Failed to schedule message.");
      console.error(err);
    }
  };

  if (!user || !user.userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-xl">
        Loading user...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-24 md:pt-32 px-4 sm:px-6">
      <div className="container mx-auto flex flex-col items-center text-center">
        <PixelatedBox className="p-6 sm:p-8 md:p-12 bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 shadow-md rounded-xl w-full max-w-3xl">
          {haveAccessToken ? (
            <>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-black mb-4">
                Connected to {workspaceName}
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 mb-6 max-w-2xl mx-auto">
                Select a channel on the left to start scheduling messages.
              </p>

              <div className="flex flex-col md:flex-row w-full gap-8">
                <div className="w-full md:w-1/3 bg-gradient-to-br from-gray-100 to-blue-100 p-4 rounded-xl shadow-md">
                  <h2 className="text-xl font-semibold mb-4">Your Channels</h2>
                  <div className="flex flex-col gap-2">
                    {channels.length > 0 ? (
                      channels.map((channel) => {
                        const isDisabled = !channel.is_member;
                        return (
                          <PixelatedButton
                            key={channel.id}
                            className={`w-full px-4 py-2 rounded-md text-left ${
                              isDisabled
                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                : selectedChannel === channel.id
                                ? "bg-purple-600 "
                                : "bg-blue-500 hover:bg-blue-600 hover:text-white active:text-black"
                            }`}
                            disabled={isDisabled}
                            onClick={() =>
                              !isDisabled &&
                              setSelectedChannel((prev) =>
                                prev === channel.id ? null : channel.id
                              )
                            }
                          >
                            # {channel.name}{" "}
                            {isDisabled && (
                              <span className="text-red-500 text-sm ml-1">
                                (You are not a member)
                              </span>
                            )}
                          </PixelatedButton>
                        );
                      })
                    ) : (
                      <p>No channels found.</p>
                    )}
                  </div>
                </div>
                <div className="w-full md:w-2/3 flex flex-col gap-6">
                  {selectedChannel && channels.find((c) => c.id === selectedChannel)?.is_member ? (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h3 className="text-xl font-semibold mb-2">
                        Send message to #{channels.find((c) => c.id === selectedChannel)?.name}
                      </h3>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 mb-4"
                        rows={5}
                        placeholder="Type your message here..."
                      />
                      <div className="flex justify-end gap-4">
                        <PixelatedButton
                          className="bg-green-500 hover:bg-green-600 hover:text-white px-4 py-2 rounded-md"
                          onClick={handleSendNow}
                        >
                          Send Now
                        </PixelatedButton>
                        <PixelatedButton
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                          onClick={() => setShowScheduleModal(true)}
                        >
                          Schedule
                        </PixelatedButton>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
                      Select a channel from the left to start.
                    </div>
                  )}
                  <div className="bg-gradient-to-r from-purple-100 via-green-100 to-blue-100 p-6 rounded-lg shadow-md">
                    <AllScheduledMessages addedMessage={addedMessage}/>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-black mb-4">
                Welcome to Your Dashboard
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 mb-6 max-w-2xl">
                Easily manage and schedule your messages directly to Slack channels or users.
                Connect your workspace to get started!
              </p>

              <a
                href={`https://slack.com/oauth/v2/authorize?client_id=${
                  import.meta.env.VITE_ClientID
                }&redirect_uri=${
                  import.meta.env.VITE_RedirectURI
                }&scope=channels:read,chat:write,chat:write.public,users:read&user_scope=chat:write,channels:read,team:read`}
              >
                <PixelatedButton className="bg-purple-500 hover:bg-purple-600 hover:text-white px-6 py-3 rounded-lg cursor-pointer">
                  Connect To Slack WorkSpace
                </PixelatedButton>
              </a>
            </>
          )}
        </PixelatedBox>
      </div>

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Schedule Message</h2>
            <div className="flex flex-col gap-4">
              <input
                type="date"
                className="border border-gray-300 rounded-md p-2"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
              <input
                type="time"
                className="border border-gray-300 rounded-md p-2"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
              <div className="flex justify-end gap-4">
                <PixelatedButton
                  className="bg-gray-400 hover:bg-gray-500 px-4 py-2 rounded-md hover:text-white"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </PixelatedButton>
                <PixelatedButton
                  className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-md text-white"
                  onClick={handleSchedule}
                >
                  Schedule
                </PixelatedButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
