import express from "express";
import {
  getAccessToken,
  haveAccessToken,
  sendMessageToSlack,
  getSlackChannels,
  getWorkSpaceDetails,
  sendScheduleMessageToSlack,
  deleteScheduledMessage,
  getScheduledMessages,
} from "../controllers/slackController.js";

const router = express.Router();

router.post("/oauth", getAccessToken);
router.post("/have-access-token", haveAccessToken);
router.post("/send-now", sendMessageToSlack);
router.post("/schedule-message", sendScheduleMessageToSlack);
router.post("/channels", getSlackChannels);
router.post("/workspace", getWorkSpaceDetails);
router.post("/delete-scheduled-message", deleteScheduledMessage);
router.get("/get/schedule-messages/:userId", getScheduledMessages);

export default router;
