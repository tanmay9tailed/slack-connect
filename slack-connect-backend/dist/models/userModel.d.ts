import mongoose from "mongoose";
declare const User: mongoose.Model<{
    email: string;
    password: string;
    isAuthorized?: boolean | null;
    slack?: {
        workspace?: string | null;
        refreshAccessToken?: string | null;
        accessToken?: string | null;
        userAccessToken?: string | null;
        userRefreshToken?: string | null;
        expiresAt?: number | null;
    } | null;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    email: string;
    password: string;
    isAuthorized?: boolean | null;
    slack?: {
        workspace?: string | null;
        refreshAccessToken?: string | null;
        accessToken?: string | null;
        userAccessToken?: string | null;
        userRefreshToken?: string | null;
        expiresAt?: number | null;
    } | null;
}, {}, mongoose.DefaultSchemaOptions> & {
    email: string;
    password: string;
    isAuthorized?: boolean | null;
    slack?: {
        workspace?: string | null;
        refreshAccessToken?: string | null;
        accessToken?: string | null;
        userAccessToken?: string | null;
        userRefreshToken?: string | null;
        expiresAt?: number | null;
    } | null;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    email: string;
    password: string;
    isAuthorized?: boolean | null;
    slack?: {
        workspace?: string | null;
        refreshAccessToken?: string | null;
        accessToken?: string | null;
        userAccessToken?: string | null;
        userRefreshToken?: string | null;
        expiresAt?: number | null;
    } | null;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    email: string;
    password: string;
    isAuthorized?: boolean | null;
    slack?: {
        workspace?: string | null;
        refreshAccessToken?: string | null;
        accessToken?: string | null;
        userAccessToken?: string | null;
        userRefreshToken?: string | null;
        expiresAt?: number | null;
    } | null;
}>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<{
    email: string;
    password: string;
    isAuthorized?: boolean | null;
    slack?: {
        workspace?: string | null;
        refreshAccessToken?: string | null;
        accessToken?: string | null;
        userAccessToken?: string | null;
        userRefreshToken?: string | null;
        expiresAt?: number | null;
    } | null;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default User;
//# sourceMappingURL=userModel.d.ts.map