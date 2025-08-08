import axios from "axios";
import User from "../models/userModel.js";
import { getExpireAt } from "../helper/tokenHelper.js";
import ScheduledMessage from "../models/scheduledMessagesModal.js";
import { messageMap } from "../jobs/messageSchedulerJob.js";
import { SlackAPI } from "../config/constans.js";
export const getAccessToken = async (req, res) => {
    const { code, userId } = req.body;
    console.log("started");
    if (!code || !userId) {
        return res.status(400).json({ ok: false, error: "Missing code or userId" });
    }
    try {
        const params = new URLSearchParams({
            code,
            client_id: process.env.SLACK_CLIENT_ID || "",
            client_secret: process.env.SLACK_CLIENT_SECRET || "",
            redirect_uri: process.env.SLACK_REDIRECT_URI || "",
        });
        const response = await axios.post(`${SlackAPI}oauth.v2.access`, params, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        const data = response.data;
        if (!data.ok) {
            return res.status(400).json({ ok: false, error: data.error });
        }
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ ok: false, error: "User not found" });
        }
        const user = await User.findByIdAndUpdate(userId, {
            $set: {
                isAuthorized: true,
                "slack.accessToken": data.access_token,
                "slack.refreshAccessToken": data.refresh_token,
                "slack.userAccessToken": data.authed_user.access_token,
                "slack.userRefreshToken": data.authed_user.refresh_token,
                "slack.workspace": data.team.name,
                "slack.expiresAt": getExpireAt(data.expires_in),
            },
        }, {
            new: true,
            upsert: false,
            runValidators: true,
        });
        if (!user) {
            return res.status(404).json({ ok: false, error: "User not found" });
        }
        res.status(200).json({
            ok: true,
            workSpace: data.team.name,
        });
    }
    catch (error) {
        console.error("Slack OAuth Error:", error.response?.data || error.message);
        res.status(500).json({ ok: false, error: "Internal server error" });
    }
};
export const haveAccessToken = async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user || !user.isAuthorized) {
            return res.status(200).json({ isAuthorized: false });
        }
        return res.status(200).json({
            isAuthorized: user.isAuthorized,
            workspace: user.slack?.workspace || "Unknown",
        });
    }
    catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
};
export const getSlackChannels = async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user || !user.slack?.userAccessToken) {
            return res.status(401).json({ error: "Unauthorized or no Slack token" });
        }
        const response = await axios.get(`${SlackAPI}conversations.list`, {
            headers: {
                Authorization: `Bearer ${user.slack.userAccessToken}`,
            },
        });
        if (!response.data.ok) {
            return res.status(400).json({ error: response.data.error });
        }
        res.status(200).json({ channels: response.data.channels });
    }
    catch (error) {
        console.error("Slack Channel Error:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const sendMessageToSlack = async (req, res) => {
    const { userId, channelId, message } = req.body;
    if (!userId || !channelId || !message) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    try {
        const user = await User.findById(userId);
        if (!user || !user.slack?.userAccessToken) {
            return res.status(401).json({ error: "Slack bot token not found" });
        }
        const response = await axios.post("https://slack.com/api/chat.postMessage", {
            channel: channelId,
            text: message,
        }, {
            headers: {
                Authorization: `Bearer ${user.slack.userAccessToken}`,
                "Content-Type": "application/json",
            },
        });
        if (!response.data.ok) {
            return res.status(400).json({ error: response.data.error });
        }
        res.status(200).json({ message: "Message sent successfully" });
    }
    catch (error) {
        console.error("Slack Send Message Error:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const getWorkSpaceDetails = async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user || !user.slack?.userAccessToken) {
            return res.status(401).json({ error: "User not authorized with Slack" });
        }
        const response = await axios.get(`${SlackAPI}team.info`, {
            headers: {
                Authorization: `Bearer ${user.slack.userAccessToken}`,
            },
        });
        if (!response.data.ok) {
            return res.status(400).json({ error: response.data.error });
        }
        res.status(200).json({ team: response.data.team });
    }
    catch (error) {
        console.error("Workspace info error:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
export const sendScheduleMessageToSlack = async (req, res) => {
    const { userId, channelId, message, scheduleTime } = req.body;
    try {
        if (!userId || !channelId || !message || !scheduleTime) {
            return res.status(400).json({ ok: false, error: "Missing required fields." });
        }
        const user = await User.findById(userId);
        if (!user || !user.slack?.userAccessToken) {
            return res.status(404).json({ ok: false, error: "User or Slack token not found." });
        }
        const now = Date.now();
        const timeDiff = scheduleTime - now;
        // Save message to DB to be handled later by worker/cron if needed
        const newScheduledMessage = await ScheduledMessage.create({
            userId,
            channelId,
            content: message,
            scheduledTime: scheduleTime,
            status: "pending",
        });
        // If the message is to be sent within 10 minutes, handle it immediately
        if (timeDiff <= 10 * 60 * 1000 && timeDiff > 0) {
            await ScheduledMessage.findByIdAndUpdate(newScheduledMessage._id, {
                status: "scheduled",
            });
            const timeoutId = setTimeout(async () => {
                try {
                    const messageId = newScheduledMessage._id.toString();
                    messageMap.set(messageId, timeoutId);
                    const response = await axios.post(`${SlackAPI}chat.postMessage`, {
                        channel: channelId,
                        text: message,
                    }, {
                        headers: {
                            Authorization: `Bearer ${user?.slack?.userAccessToken}`,
                            "Content-Type": "application/json",
                        },
                    });
                    console.log("Slack message sent:", response.data);
                    // Delete from DB and cleanup
                    await ScheduledMessage.findByIdAndDelete(newScheduledMessage._id);
                    messageMap.delete(messageId); // remove timeout from map
                }
                catch (err) {
                    console.error("Error sending Slack message via setTimeout:", err);
                }
            }, timeDiff);
            return res.status(200).json({
                ok: true,
                scheduledWithTimeout: true,
                scheduledTime: new Date(scheduleTime).toISOString(),
            });
        }
        // Else, message is scheduled for a worker or cron job
        return res.status(200).json({
            ok: true,
            scheduledWithWorker: true,
            messageId: newScheduledMessage._id,
        });
    }
    catch (error) {
        console.error("Failed to schedule Slack message:", error.message);
        return res.status(500).json({
            ok: false,
            error: error.message,
        });
    }
};
export const deleteScheduledMessage = async (req, res) => {
    try {
        const { messageId } = req.body;
        if (!messageId) {
            return res.status(400).json({ error: "Message ID is required." });
        }
        await ScheduledMessage.findByIdAndDelete(messageId);
        // Clear the scheduled timeout if exists
        const timeoutId = messageMap.get(messageId);
        if (timeoutId) {
            clearTimeout(timeoutId);
            messageMap.delete(messageId);
        }
        return res.status(200).json({ message: "Scheduled message deleted successfully." });
    }
    catch (error) {
        console.error("Error deleting scheduled message:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};
export const getScheduledMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: "User ID is required." });
        }
        const messages = await ScheduledMessage.find({ userId });
        return res.status(200).json({ messages });
    }
    catch (error) {
        console.error("Error fetching scheduled messages:", error);
        return res.status(500).json({ error: "Failed to retrieve scheduled messages." });
    }
};
//# sourceMappingURL=slackController.js.map