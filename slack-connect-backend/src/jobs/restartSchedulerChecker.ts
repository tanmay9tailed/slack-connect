//  on restart immideately check wheater any message is within the 10 min period or any scheduled msg in db then immideatly execute them

import axios from "axios";
import ScheduledMessage from "../models/scheduledMessagesModal.js";
import User from "../models/userModel.js";
import { SlackAPI } from "../config/constans.js";
import { messageMap } from "./messageSchedulerJob.js";

export const RestartSchedulerChecker = async () => {
  console.log("🔁 RestartSchedulerChecker: Checking for pending scheduled messages...");

  try {
    const now = Date.now();

    const scheduledMessages = await ScheduledMessage.find({
      status: { $in: ["pending", "scheduled"] },
    });

    for (const msg of scheduledMessages) {
      const timeDiff = msg.scheduledTime - now;
      const messageId = msg._id.toString();

      const user = await User.findById(msg.userId);
      if (!user || !user.slack?.userAccessToken) {
        console.warn(`⚠️ Skipping message ${messageId} – user or token not found.`);
        continue;
      }

      // Case 1: Message is overdue – send immediately
      if (timeDiff <= 0) {
        try {
          const response = await axios.post(
            `${SlackAPI}chat.postMessage`,
            {
              channel: msg.channelId,
              text: msg.content,
            },
            {
              headers: {
                Authorization: `Bearer ${user.slack.userAccessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          console.log(`✅ Immediately sent overdue message: ${messageId}`);
          await ScheduledMessage.findByIdAndDelete(msg._id);
        } catch (error) {
          console.error(`❌ Failed to send overdue message ${messageId}:`, error);
        }
      }

      // Case 2: Message is within the next 10 minutes – schedule with setTimeout
      else if (timeDiff <= 10 * 60 * 1000) {
        // Update status to "scheduled" if not already
        if (msg.status !== "scheduled") {
          msg.status = "scheduled";
          await msg.save();
        }

        const timeoutId = setTimeout(async () => {
          try {
            const response = await axios.post(
              `${SlackAPI}chat.postMessage`,
              {
                channel: msg.channelId,
                text: msg.content,
              },
              {
                headers: {
                  Authorization: `Bearer ${user?.slack?.userAccessToken}`,
                  "Content-Type": "application/json",
                },
              }
            );

            console.log(`⏱️ Scheduled message sent: ${messageId}`);
            await ScheduledMessage.findByIdAndDelete(msg._id);
            messageMap.delete(messageId);
          } catch (error) {
            console.error(`❌ Error sending scheduled message ${messageId}:`, error);
          }
        }, timeDiff);

        messageMap.set(messageId, timeoutId);
        console.log(
          `🕒 Scheduled message ${messageId} to be sent in ${Math.round(timeDiff)} seconds.`
        );
      }
    }

    console.log("✅ RestartSchedulerChecker completed.");
  } catch (err) {
    console.error("❌ Error in RestartSchedulerChecker:", err);
  }
};
