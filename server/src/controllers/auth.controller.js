import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios'
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import role from '../middlewares/rbac.middleware.js';
import { User } from '../models/user.model.js';
import { BadRequestError, NotFoundError } from '../core/error.response.js';
import ForgotPasswordOTP from '../models/forgotPasswordOTP.model.js';
import UserOTPVerification from '../models/userOTPVerification.model.js';
import brevoSendEmail from '../configs/brevo.config.js';

class AuthController {
    signUp = async (req, res) => {
        console.log('START');
        const recaptchaToken = Array.isArray(req.body['g-recaptcha-response'])
        ? req.body['g-recaptcha-response'][0] 
        : req.body['g-recaptcha-response'];
        const secretKey = process.env.CAPTCHA_SECRET_KEY;
    
        try {
            // Validate the reCAPTCHA token with Google's API
            const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
    
            const response = await axios.get(verificationUrl);  // Use GET request as reCAPTCHA verification uses GET
            const data = response.data;
    
            if (!data.success) {
                console.error('Captcha failed:', data['error-codes']);
                return res.status(500).render('signUp', { error: 'Captcha failed. Please try again.' });
            }
            const { email, password, displayName } = req.body;
    
            // 1. Check if email already exists
            const user = await User.findOne({ email });
            if (user) {
                // Render the signup page with an error message
                return res.status(400).render('signUp', { error: 'User already exists' });
            }
    
            // 2. Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
    
            // 3. Check if there is an existing OTP for the email
            const oldOtp = await UserOTPVerification.findOne({ email });
            if (oldOtp) {
                await UserOTPVerification.findByIdAndDelete(oldOtp._id);
            }
    
            // 4. Generate a new OTP
            const otp = crypto.randomInt(100000, 999999).toString();
            const userOTP = new UserOTPVerification({
                email,
                password: hashedPassword,
                displayName,
                otp,
                expiredAt: new Date(Date.now() + 30 * 60 * 1000), // OTP expiration in 30 minutes
            });
            await userOTP.save();
            
            // 5. Send the OTP to the user's email
            await brevoSendEmail(email, 'Verify Email', 'Verify Email', otp, '', 'otpTemplate');
    
            // 6. Redirect to OTP verification page with email as query parameter
            const redirectUrl = `/page/otpVerification?email=${encodeURIComponent(email)}`;
            return res.redirect(redirectUrl);
        } catch (error) {
            console.error('Error during sign-up:', error);
            // Render the signup page with a generic error message
            return res.status(500).render('signUp', { error: 'Sign-up failed. Please try again later.' });
        }
    };    

    verifyOtp = async (req, res, next) => {
        try {
            const { email, otp } = req.body;
    
            // 1. Check OTP
            const otpRecord = await UserOTPVerification.findOne({ email });
    
            if (!otpRecord || otpRecord.otp !== otp) {
                return res.status(400).json({ error: 'Invalid OTP' });
            }
    
            if (otpRecord.expiredAt < new Date()) {
                return res.status(400).json({ error: 'OTP has expired' });
            }
    
            // 2. Create a new user
            const newUser = await User.create({
                email: otpRecord.email,
                password: otpRecord.password,
                displayName: otpRecord.displayName === undefined ? null : otpRecord.displayName,
                role: "member"
            });
    
            // 3. Delete the OTP record
            await UserOTPVerification.deleteOne({ email });
    
            // 4. Create token
            const token = jwt.sign(
                {
                    id: newUser._id,
                    email: newUser.email
                },
                process.env.JWT_SECRET,
                { expiresIn: '7d' } // You can adjust the token expiration time
            );
    
            // 5. Save token in the database (optional, since it's a JWT)
            newUser.accessToken = token;
            await newUser.save();

            // 6. Set the accessToken in a cookie
            res.cookie('accessToken', token, {
                httpOnly: true, // Cookie can't be accessed via JavaScript (helps prevent XSS attacks)
                secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                sameSite: 'strict', // Protect against CSRF attacks
                maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expires in 7 days
            });
    
            // 7. Redirect to the landing page
            return res.redirect("/");
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'OTP verification failed' });
        }
    };    

    login = async (req, res) => {
        try {
            const { email, password } = req.body;
    
            // 1. Check if the user exists with the given email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).render('login', { error: 'User not found' });
            }
            if(user.status == 'block'){
                return res.status(404).render('login', { error: 'User is blocked' });
            }
    
            // 2. Check if the password matches
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).render('login', { error: 'Email or password is incorrect' });
            }
    
            // 3. Create JWT token
            const token = jwt.sign(
                {
                    id: user._id,
                    email: user.email
                },
                process.env.JWT_SECRET,
                { expiresIn: '7d' } // Token expiration time
            );
    
            // 4. Save the token in the user's record
            user.accessToken = token;
            user.isActive = true
            await user.save();
    
            // 5. Set accessToken as an HTTP-only cookie
            res.cookie('accessToken', token, {
                httpOnly: true, // Secure the cookie to prevent access via JavaScript
                secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                sameSite: 'strict', // Protect against CSRF attacks
                maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expires in 7 days
            });
    
            // 6. Redirect to the landing page
            return res.redirect('/');
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).render('login', { error: 'Login failed. Please try again later.' });
        }
    };    

    logout = async (req, res) => {
        try {
            // Clear the accessToken cookie
            res.clearCookie('accessToken', {
                httpOnly: true,     // Ensures the cookie is only accessible by the web server
                secure: true,       // Ensures the cookie is sent only over HTTPS (should be true in production)
                sameSite: 'strict', // Prevents the cookie from being sent with cross-site requests
                path: '/'           // Clear the cookie for the whole domain
            });
    
            // Send a successful logout response
            return res.status(200).json({ message: 'Logout successful' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Logout failed' });
        }
    };

    forgotPassword = async (req, res) => {
        try {
            const { email } = req.body;

            // 1. Find the user with the email
            const user = await User.findOne({ email });
            if (!user) {
                return { error: 'User not found' };
            }

            // 2. Check if there is an existing OTP
            const oldOtp = await ForgotPasswordOTP.findOne({ email });
            if (oldOtp) {
                // Delete the old OTP
                await ForgotPasswordOTP.findByIdAndDelete(oldOtp._id);
            }

            // 3. Generate a new OTP
            const otp = crypto.randomInt(100000, 999999).toString();
            const forgotPasswordOTP = new ForgotPasswordOTP({
                email,
                otp,
                expiredAt: new Date(Date.now() + 30 * 60 * 1000),
            });
            await forgotPasswordOTP.save();

            // 4. Send the OTP to the user's email
            brevoSendEmail(email, 'Reset Password OTP', 'Reset Password OTP', otp, '', 'otpTemplate');

            // 5. Return the OTP data
            return res.redirect(`/page/otpReset?email=${encodeURIComponent(email)}`);
        } catch (error) {
            throw new Error('Forgot password failed');
        }
    };

    verifyResetPasswordOtp = async (req, res) => {
        try {
            const { email, otp } = req.body;

            // 1. Check the OTP and user in the database
            const otpRecord = await ForgotPasswordOTP.findOne({ email });
            const user = await User.findOne({ email });

            // 2. Check if the OTP is valid
            if (!otpRecord || otpRecord.otp !== otp) {
                return { error: 'Invalid OTP' };
            }
            if (otpRecord.expiredAt < new Date()) {
                return { error: 'OTP has expired' };
            }
            if (!user) {
                return { error: 'User not found' };
            }

            // 3. Mark the OTP as verified
            otpRecord.isVerified = true;
            await otpRecord.save();

            // 4. Return success message
            return res.redirect(`/page/resetPassword?email=${encodeURIComponent(email)}`);
        } catch (error) {
            throw new Error('OTP verification failed');
        }
    };

    resetPassword = async (req, res) => {
        try {
            const { email, password } = req.body;
            console.log(req.body)
            // 1. Check OTP and user
            const otpRecord = await ForgotPasswordOTP.findOne({ email });
            const user = await User.findOne({ email });

            // 2. Check if the OTP is correct
            if (!otpRecord) {
                return { error: 'OTP not found' };
            }
            if (otpRecord.expiredAt < new Date()) {
                return { error: 'OTP has expired' };
            }
            if (!otpRecord.isVerified) {
                return { error: 'OTP is not verified' };
            }
            if (!user) {
                return { error: 'User not found' };
            }

            // 3. Hash the new password
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
            await user.save();

            // 4. Delete the OTP
            await ForgotPasswordOTP.deleteOne({ email });

            const { password: hiddenPassword, ...userWithoutPassword } = user.toObject();

            // 5. Return success message and user data
            return res.redirect('/page/login');
        } catch (error) {
            throw new Error('Password reset failed');
        }
    };

    grantAccess = (action, resource) => {
        return async (req, res, next) => {
            try {
                const userInfo = await User.findById(req.userId).lean()
                const userRole = userInfo.role
                const permission = role.can(userRole)[action](resource)
                if (!permission.granted) {
                    return res.status(401).json({
                        error: "Bạn không có quyền thực hiện thao tác này",
                    })
                }
                next()
            } catch (error) {
                next(error)
            }
        }
    };
}

export default new AuthController();
