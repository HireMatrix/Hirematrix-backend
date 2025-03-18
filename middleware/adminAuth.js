import { User } from "../models/userSchema.js"

export const adminAuth = async (req, res, next) => {
    try {
        if(!req.userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - user id missing"
            })
        }

        const user = await User.findById(req.userId);

        if(!user) {
            return res.status(404).json({ success: false, message: "user not found" })
        }

        if(user.userType !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied - Admin only"
            })
        }

        next();
    } catch (error) {
        console.log("Error in adminAuth middleware:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}