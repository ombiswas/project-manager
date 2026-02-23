import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Verification from "../models/verification.js";
import { sendEmail } from "../libs/send-email.js";
import aj from "../libs/arcjet.js";

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const decision = await aj.protect(req, { email });
        console.log("Arcjet decision", decision.isDenied());

        if (decision.isDenied()) {
            res.writeHead(403, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Invalid email address" }));

        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            res.status(400).json({
                message: "email address already in use",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            email, password: hashedPassword, name
        });

        const verificationToken = jwt.sign(
            { userId: newUser._id, purpose: "email-verification" },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        await Verification.create({
            userId: newUser._id,
            token: verificationToken,
            expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000)
        });

        // send email
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        const emailBody = `<p>Click <a href="${verificationLink}">here</a> to verify your email</p>`;
        const emailSubject = "Verify you email";

        const isEmailSent = await sendEmail(email, emailSubject, emailBody);

        if (!isEmailSent) {
            return res.status(500).json({
                message: "Failed to send verification email"
            });
        }

        res.status(201).json({
            message: "Verification email sent to your email. Please check and verify account.",
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        if (!user.isEmailVerified) {
            const existingVerification = await Verification.findOne({
                userId: user._id
            });

            if (existingVerification && existingVerification.expiresAt > new Date()) {
                return res.status(400).json({
                    message: "Email not verified. Please check your email for the verification link."
                });
            } else {
                await Verification.findByIdAndDelete(existingVerification._id);

                const verificationToken = jwt.sign(
                    { userId: user._id, purpose: "email-verification" },
                    process.env.JWT_SECRET,
                    { expiresIn: "1h" }
                );

                await Verification.create({
                    userId: user._id,
                    token: verificationToken,
                    expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000)
                });

                // send email
                const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
                const emailBody = `<p>Click <a href="${verificationLink}">here</a> to verify your email</p>`;
                const emailSubject = "Verify you email";

                const isEmailSent = await sendEmail(email, emailSubject, emailBody);

                if (!isEmailSent) {
                    return res.status(500).json({
                        message: "Failed to send verification email"
                    });
                }

                res.status(201).json({
                    message: "Verification email sent to your email. Please check and verify account.",
                });

            }
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { userId: user._id, purpose: "login" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );


        user.lastLogin = new Date();
        await user.save();
        const userData = user.toObject();
        delete userData.password;

        res.status(200).json({
            message: "Login successfully",
            token,
            user: userData
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        if (!payload) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { userId, purpose } = payload;
        if (purpose !== "email-verification") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const verificationDoc = await Verification.findOne({
            userId, token
        });

        if (!verificationDoc) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const isTokenExpired = verificationDoc.expiresAt < new Date();

        if (isTokenExpired) {
            return res.status(401).json({ message: "Token expired" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        user.isEmailVerified = true;
        await user.save();

        await Verification.findByIdAndDelete(verificationDoc._id);

        res.status(200).json({ message: "Email verified successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export { registerUser, loginUser, verifyEmail };