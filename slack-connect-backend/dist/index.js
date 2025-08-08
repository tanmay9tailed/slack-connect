import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import slackRoutes from "./routes/slackRoutes.js";
import TokenRefreshJob from "./jobs/tokenRefreshJob.js";
import MessageSchedulerJob from "./jobs/messageSchedulerJob.js";
import { RestartSchedulerChecker } from "./jobs/restartSchedulerChecker.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
connectDB();
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/slack", slackRoutes);
app.use("/health", (req, res) => {
    res.send("All Good!!!");
});
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    TokenRefreshJob();
    MessageSchedulerJob();
    await RestartSchedulerChecker();
});
//# sourceMappingURL=index.js.map