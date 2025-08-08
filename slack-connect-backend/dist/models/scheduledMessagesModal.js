import mongoose from "mongoose";
const scheduledMessageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    content: {
        type: String,
        required: true,
    },
    scheduledTime: {
        type: Number,
        required: true,
    },
    channelId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "scheduled"],
        default: "pending",
    },
}, {
    timestamps: true,
});
scheduledMessageSchema.index({ scheduledTime: 1 });
const ScheduledMessage = mongoose.model("ScheduledMessage", scheduledMessageSchema);
export default ScheduledMessage;
//# sourceMappingURL=scheduledMessagesModal.js.map