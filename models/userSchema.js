import mongoose from "mongoose";

/*
  ~ Storing verificationToken is necessary in the database, you can verify it when the user clicks the link.
  ~ The resetPasswordToken stored in the database, can then be checked to ensure the user has permission to reset the password.
  ~ Storing resetPasswordExpiresAt and verificationTokenExpiresAt helps manage token expiration. This allows you to validate the token only if it is still valid and hasn’t expired.
*/

const userSchema = new mongoose.Schema({
    email : {
        type: String,
        required: true,
        unique: true,
    },
    password : {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);