import mongoose from "mongoose";
const Schema = mongoose.Schema;

const DOCUMENT_NAME = "User";
const COLLECTION_NAME = "Users";

const UserSchema = new Schema(
    {
        googleId: { type: String, default: "" },
        fullName: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, unique: true },
        password: { type: String, default: "" },
        role: {
            type: String,
            enum: ["member", "talent", "admin"],
            default: "member",
        },
        gender: { type: String, enum: ["male", "female", "other"], trim: true },
        avatar: {
            type: String,
            default: "/images/systems/default-avatar.png",
        },
        phone: { type: String },
        address: { type: String, default: "" },
        country: { type: String, default: "Vietnam" },
        dob: { type: Date, default: null },
        status: {
            type: String,
            default: "pending",
            enum: ["pending", "active", "block"],
        },
        accessToken: { type: String, default: "" },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);

UserSchema.index({ domainName: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ "comments.userId": 1, "comments.createdAt": -1 });

const User = mongoose.model(DOCUMENT_NAME, UserSchema);

export { User};
