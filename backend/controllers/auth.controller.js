import bcryptjs from "bcryptjs";
import crypto from "crypto";

import { User } from "../modles/user.modle.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } from "../mailtrap/email.js";

export const signup = async (req, res) => {
	const { email, password, name } = req.body;
	try {
		if (!email || !password || !name) {
			throw new Error("Please fill all the fields");
		}

		const userAlreadyExists = await User.findOne({ email });
		if (userAlreadyExists) { return res.status(400).json({success: false, message: "User already exists" }) }

		const hashedPassword = await bcryptjs.hash(password, 10);
		// 12345 = $2a$10$jhgjhgjhgjhgjhgjhgjhgjhgjhgjhgjhgjhgjhgjhgjhgjhgjhgjhg
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
		const user = new User({ 
			email, 
			password: hashedPassword, 
			name,
			verificationToken,
			varificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
		})

		await user.save();

		// jwt
		generateTokenAndSetCookie(res, user._id);

		sendVerificationEmail(user.email, verificationToken)

		res.status(201).json({
			 success: true,
			  message: "User created successfully",
			   user: {
				...user._doc,
			    password: undefined
			},
	 });

	} catch (error) {
		res.status(400).json({ success: false, message: error.message })
	}


};

export const verifyEmail = async (req, res) => {
	const { code } = req.body;
    
	try {
		const user = await User.findOne({ verificationToken: code, varificationTokenExpiresAt: { $gt: Date.now() } })

		if (!user) { return res.status(400).json({ success: false, message: "Invalid or expired verification code" }) }

		user.isVerified = true;
		user.verificationToken = undefined;
		user.varificationTokenExpiresAt = undefined;
		await user.save();

		await sendWelcomeEmail(user.email, user.name);
		res.status(200).json({ 
			success: true, 
			message: "Email verified successfully",
			user: {
				...user._doc,
				password: undefined,
			}
		})

	} catch (error) {
		console.log("error in verify email", error)
		res.status(500).json({ success: false, message: "server error" });
	}
};


export const login = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) { 
			return res.status(400).json({ success: false, message: "User does not exist" }) 
		}
		const isPasswordValid = await bcryptjs.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ success: false, message: "Invalid password" })
		}

		generateTokenAndSetCookie(res, user._id); 
		user.lastLogin = new Date(Date.now());
		await user.save();

		res.status(200).json({
			success: true,
			message: "Logged in successfully",
			user: {
				...user._doc,
				password: undefined
			}
		})
	} catch (error) {
		console.log("error in Login", error);
		res.status(500).json({ success: false, message: error.message });
	}
}


export const logout = async (req, res) => {
	res.clearCookie("token");
	res.status(200).json({ success: true, message: "Logged out successfully" });
}

export const forgotPassword = async (req, res) => {
	const { email } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) { 
			return res.status(400).json({ success: false, message: "User does not exist" }) 
		}

		// Generate 6 digit reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;  // 1 hour from now

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt;

		await user.save();

		// Send email with reset token
		await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset email sent" })

	} catch (error) {
		console.log("error ForgotPassword",error)
		res.status(500).json({ success: false, message: error.message});
	}
}

export const resetPassword = async (req, res) => {
	
	try {
		const { token } = req.params;
		const { password } = req.body;
		const user = await User.findOne({ 
			resetPasswordToken: token, 
			resetPasswordExpiresAt: { $gt: Date.now() } 
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" })
		}

		// update password and reset token fields in the database
		const hashedPassword = await bcryptjs.hash(password, 10);
		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
 
		await user.save();

		await sendResetSuccessEmail(user.email);
		res.status(200).json({ success: true, message: "Password reset successful" })

	} catch (error) {
		console.log("error in resetPassword",error)
		res.status(400).json({ success: false, message: error.message});
	}
}

export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};