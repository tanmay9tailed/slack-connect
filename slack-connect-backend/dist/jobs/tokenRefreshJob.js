import cron from "node-cron";
import User from "../models/userModel.js";
import axios from "axios";
import { getExpireAt } from "../helper/tokenHelper.js";
import { SlackAPI } from "../config/constans.js";
const TokenRefreshJob = () => {
    console.log("token refresh job Started");
    cron.schedule("*/30 * * * *", async () => {
        console.log("-------------Refreshing Tokens-------------");
        const targetExpirationTime = Date.now() + 30 * 60 * 1000;
        const usersWithExpiringTokens = await User.find({
            "slack.expiresAt": { $lt: targetExpirationTime },
        }).exec();
        console.log(`Found ${usersWithExpiringTokens.length} users with expiring tokens.`);
        const refreshRequest = usersWithExpiringTokens.map((user) => {
            const params = new URLSearchParams({
                "grant-type": "refresh_token",
                refresh_token: user.slack?.userRefreshToken ?? "",
            });
            return axios.post(`${SlackAPI}oauth.v2.access`, params, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
        });
        const refreshResponse = await Promise.all(refreshRequest);
        usersWithExpiringTokens.forEach((user, i) => {
            const userRefreshResponse = refreshResponse[i]?.data;
            User.findByIdAndUpdate(user.id, {
                $set: {
                    "slack.userAccessToken": userRefreshResponse.authed_user.access_token,
                    "slack.userRefreshToken": userRefreshResponse.authed_user.refresh_token,
                    "slack.expiresAt": getExpireAt(userRefreshResponse.expires_in),
                },
            }, {
                new: true,
                upsert: false,
                runValidators: true,
            });
        });
    });
};
export default TokenRefreshJob;
//# sourceMappingURL=tokenRefreshJob.js.map