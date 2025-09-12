import express from "express";
import authController from "../controllers/auth.controller.js";
import { asyncHandler } from "../auth/checkAuth.js";
import passport from "passport";

const router = express.Router();

router.post("/signUp", asyncHandler(authController.signUp));
router.post("/login", asyncHandler(authController.login));
router.post("/verifyOtp", asyncHandler(authController.verifyOtp));
router.post("/logout", asyncHandler(authController.logout));
router.post("/forgotPassword", asyncHandler(authController.forgotPassword));
router.post(
    "/verifyResetPasswordOtp",
    asyncHandler(authController.verifyResetPasswordOtp)
);
router.post("/resetPassword", asyncHandler(authController.resetPassword));

//Google OAuth Routes
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    async (req, res, next) => {
        try {
            const user = req.user; // ✅ use req.user from Passport
            console.log('ACCESSTOKEN IN CALLABCK', user.accessToken)
            if (user && user.accessToken) {
                res.cookie("accessToken", user.accessToken, {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000 * 30, // 30 days
                });
            }

            res.redirect("/page/landingPage"); // redirect to homepage/dashboard
        } catch (error) {
            next(error);
        }
    }
);

export default router;
