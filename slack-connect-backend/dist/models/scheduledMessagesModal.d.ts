import mongoose from "mongoose";
declare const ScheduledMessage: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: mongoose.Types.ObjectId;
    content: string;
    scheduledTime: number;
    channelId: string;
    status: "pending" | "scheduled";
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: mongoose.Types.ObjectId;
    content: string;
    scheduledTime: number;
    channelId: string;
    status: "pending" | "scheduled";
}, {}, {
    timestamps: true;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: mongoose.Types.ObjectId;
    content: string;
    scheduledTime: number;
    channelId: string;
    status: "pending" | "scheduled";
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: mongoose.Types.ObjectId;
    content: string;
    scheduledTime: number;
    channelId: string;
    status: "pending" | "scheduled";
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: mongoose.Types.ObjectId;
    content: string;
    scheduledTime: number;
    channelId: string;
    status: "pending" | "scheduled";
}>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: mongoose.Types.ObjectId;
    content: string;
    scheduledTime: number;
    channelId: string;
    status: "pending" | "scheduled";
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default ScheduledMessage;
//# sourceMappingURL=scheduledMessagesModal.d.ts.map