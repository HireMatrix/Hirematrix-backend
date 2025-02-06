import { User } from "../models/userSchema.js";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendForgotPasswordEmail, sendResetPasswordSuccess, sendVerificationEmail, sendWelcomeEmail } from "../nodemailer/email.js";

export const checkAuth = async (req, res) => {

    console.log(req.userId);

    try {
        const user = await User.findById(req.userId).select("-password");

        if(!user){
            return res.status(400).json({success: false, message: "user doesn't exits"})
        }

        res.status(200).json({success:true, user});
    } catch (error) {
        console.log("Error in checkAuth", error);
        res.status(400).json({success: false, message: error.message});
    }
}

export const signUp = async (req, res) => {
    const {email, password, name} = req.body;

    try {

        if(!email || !password || !name){
            throw new Error("All fields are required");
        }

        const userAlreadyExits = await User.findOne({email});

        if(userAlreadyExits){
            return res.status(400).json({success: false, message: 'User already exits'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const temporaryRouteToken = crypto.randomBytes(20).toString("hex");
        const temporaryRouteTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;

        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + (1 * 60 * 60 * 1000),
            temporaryRouteToken,
            temporaryRouteTokenExpiresAt
        });

        await user.save();

        generateTokenAndSetCookie(res, user._id);

        await sendVerificationEmail(user.email, verificationToken, `${process.env.CLIENT_URL}/verify-email/${temporaryRouteToken}`);

        res.status(201).json({
            success: true,
            message: "user created successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        });

    } catch (error) {
        res.status(400).json({success: false, message: error.message});
    }
}

export const verifyEmail = async (req, res) => {
    const {token} = req.body;
    const {temporaryToken} = req.params;

    try {
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpiresAt: { $gt: Date.now() },
            temporaryRouteToken: temporaryToken,
            temporaryRouteTokenExpiresAt: { $gt: Date.now() }
        })

        if(!user || user == null){
            return res.status(400).json({success: false, message: "Invalid Otp"})
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        user.temporaryRouteToken = undefined;
        user.temporaryRouteTokenExpiresAt = undefined;

        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        res.status(201).json({success: true, message: "User verified successfully"})

    } catch (error) {
        console.log("Error in sending the email", error);
        res.status(400).json({
            success: false,
            user: {
                ...user._doc,
                password: undefined
            }, 
            message: "Server Error"})
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({ success : false, message : "User doesn't exits please signUp"});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
            return res.status(400).json({ success : false, message : "Invalid credentials"});
        }

        generateTokenAndSetCookie(res, user._id);

        user.lastLogin = Date.now();
        await user.save();

        res.status(200).json({ 
            success : true, 
            message : "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch (error) {
        console.log("Error in Login", error);
        res.status(400).json({ success : false, message : error });
    }
}

export const logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({success: true, message: "Logged out successfully"})
}

export const forgotPassword = async(req, res) => {
    const {email} = req.body;

    console.log(email)

    try {
        const user = await User.findOne({ email });

        if(!user || user == null){
            if(!user.isAuthenticated) {
                return res.status(400).json({
                    success : false,
                    message: 'Please very your email id for changing the password'
                })
            }
            return res.status(400).json({ success : false, message: 'User not found' })
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpriesAt = Date.now() + 1 * 60 * 60 * 1000;

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpriesAt;

        await user.save();

        await sendForgotPasswordEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        res.status(200).json({ success : true,
            user: {
                ...user._doc,
                password: undefined,
            },
            message : "Password reset link sent successfully" });
    } catch (error) {
        console.log("Error in forgot password", error);
        res.status(400).json({success : false, message : error.message});
    }
};

export const resetPassword = async(req, res) => {
    const {password} = req.body;
    const {token} = req.params;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() }
        })

        if(!user) {
            return res.status(400).json({ success : false, message : "Invalid or expired reset token" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;

        await user.save();

        await sendResetPasswordSuccess(user.email);

        res.status(200).json({ success : true, message : "Password reset successful" });
    } catch (error) {
        console.log("error at password reset", error);
        res.status(400).json({ success : false, message : "Error at password reset" });
    }
};