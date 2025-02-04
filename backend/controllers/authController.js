import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";

// API for user registration
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !password || !email) {
            return res.json({ success: false, message: "Missing details" });
        }

        // if (!validator.isEmail(email)) {
        //     return res.json({ success: false, message: 'Enter a valid email address' })
        // }

        if (password.length < 6) {
            return res.json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        const existingUser = await userModel.exists({ email });
        if (existingUser) {
            return res.json({
                success: false,
                message: "User with this email already exists",
            });
        }

        // Hashing password with bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPwd = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPwd,
        };

        const newUser = new userModel(userData);
        const user = await newUser.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        //send welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to Citadel Tech-Hub",
            text: `Hi ${name}, welcome to Citadel Tech-Hub website. Your account has been created with email id: ${email}`,
        };

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "Registration Successful!" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API for user login
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({
            success: false,
            message: "Email and password are required",
        });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "Invalid email" });
        }

        const pwdMatch = await bcrypt.compare(password, user.password);

        if (!pwdMatch) {
            return res.json({ success: false, message: "Invalid password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({ success: true });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API for user logout
export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });

        return res.json({ success: true, message: "Logged Out" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


//API for sending verification otp
export const sendVerifyOtp = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId);

        if (user.isAccountVerified) {
            return res.json({
                success: false,
                message: "Account Already Verified",
            });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpires = Date.now() + 24 * 60 * 60 * 1000; //24 hours

        await user.save();

        //send account verification email
        const mailOptions = {
            from: `CITADEL TECH-HUB <${process.env.SENDER_EMAIL}>`,
            to: user.email,
            subject: "Account Verification OTP",
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", email)
        };

        await transporter.sendMail(mailOptions);

      res.json({
            success: true,
            message: "Verification OTP sent to your email.",
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

//API for verifying email using OTP
export const verifyEmail = async (req, res) => {
    const { userId, otp } = req.body;

    if (!userId) {
        return res.json({ success: false, message: "Login again" });
    }
    if (!otp) {
        return res.json({ success: false, message: "OTP is required" });
    }

    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User Not Found!" });
        }

        if (user.verifyOtp === "" || user.verifyOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }
        if (user.verifyOtpExpires < Date.now()) {
            return res.json({ success: false, message: "Expired OTP" });
        }

        user.isAccountVerified = true;
        user.verifyOtp = "";
        user.verifyOtpExpires = 0;

        await user.save();

      return  res.json({ success: true, message: "Email verified successfully!"});
    } catch (error) {
        console.log(error);
      return  res.json({ success: false, message: error.message });
    }
};
//API for checking if user is authenticated
export const isAuthenticated = async (req, res) => {
    try {
            return res.json({ success: true});
       
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

//API for sending password reset otp
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: "Email is required"})
    }
    try {

        const user = await userModel.findOne({email});

        if (!user) {
            return res.json({
                success: false,
                message: "User not found",
            });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpires = Date.now() + 10 *  60 * 1000; //10 minutes

        await user.save();

        //send account verification email
        const mailOptions = {
            from: `CITADEL TECH-HUB <${process.env.SENDER_EMAIL}>`,
            to: user.email,
            subject: "Password Reset  OTP",
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", email)
        };

        await transporter.sendMail(mailOptions);

        return res.json({
            success: true,
            message: "OTP sent to your email.",
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

//API for resetting password using OTP
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: "Email, OTP, new password are required" });
    }
    if (!otp) {
        return res.json({ success: false, message: "OTP is required!" });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User Not Found!" });
        }

        if (user.resetOtp === "" || user.resetOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }
        if (user.resetOtpExpires < Date.now()) {
            return res.json({ success: false, message: "OTP Expired" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        user.password = hashedPassword
        user.resetOtp = "";
        user.resetOtpExpires = 0;

        await user.save();

        return res.json({
            success: true,
            message: "Password reset successfully!",
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
