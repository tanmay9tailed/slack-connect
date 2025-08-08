import cron from "node-cron";
import axios from "axios";
import ScheduledMessage from "../models/scheduledMessagesModal.js";
import User from "../models/userModel.js";
import { SlackAPI } from "../config/constans.js";
export const messageMap = new Map();
const MessageSchedulerJob = () => {
    console.log("Message scheduler job running");
    cron.schedule("*/10 * * * *", async () => {
        console.log("---------------Checking Scheduled Messages-------------");
        const now = Date.now();
        const targetScheduledTime = now + 10 * 60 * 1000;
        const messagesToSchedule = await ScheduledMessage.find({
            scheduledTime: { $lt: targetScheduledTime },
            status: "pending",
        });
        console.log(`Found ${messagesToSchedule.length} messages to execute within next 10 mins.`);
        messagesToSchedule.forEach(async (message) => {
            try {
                // Mark message as 'scheduled'
                await ScheduledMessage.findByIdAndUpdate(message._id, {
                    status: "scheduled",
                });
                const user = await User.findById(message.userId);
                const delay = message.scheduledTime - Date.now();
                if (delay < 0) {
                    console.warn(`Message ${message._id} scheduled time already passed. Sending immediately.`);
                }
                // Create the timeout
                const timeoutId = setTimeout(async () => {
                    try {
                        const response = await axios.post(`${SlackAPI}chat.postMessage`, {
                            channel: message.channelId,
                            text: message.content,
                        }, {
                            headers: {
                                Authorization: `Bearer ${user?.slack?.userAccessToken}`,
                                "Content-Type": "application/json",
                            },
                        });
                        console.log("✅ Slack message sent:", response.data);
                        // Remove from DB
                        await ScheduledMessage.findByIdAndDelete(message._id);
                        // Remove from map after sending
                        messageMap.delete(message._id.toString());
                    }
                    catch (err) {
                        console.error("❌ Error sending Slack message:", err.message);
                    }
                }, Math.max(delay, 0));
                // Store timeout ID in the map
                messageMap.set(message._id.toString(), timeoutId);
            }
            catch (err) {
                console.error("❌ Error scheduling message:", err.message);
            }
        });
    });
};
export default MessageSchedulerJob;
//# sourceMappingURL=messageSchedulerJob.js.map