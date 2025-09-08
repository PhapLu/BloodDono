import express from "express"
import authController from "../controllers/auth.controller.js"
import {asyncHandler} from '../auth/checkAuth.js'
import passport from "passport"

const router = express.Router()

router.post('/signUp', asyncHandler(authController.signUp))
router.post('/login', asyncHandler(authController.login))
router.post("/verifyOtp", asyncHandler(authController.verifyOtp));
router.post('/logout', asyncHandler(authController.logout))
router.post('/forgotPassword', asyncHandler(authController.forgotPassword))
router.post('/verifyResetPasswordOtp', asyncHandler(authController.verifyResetPasswordOtp))
router.post('/resetPassword', asyncHandler(authController.resetPassword))

//Google OAuth Routes
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
)

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    async (req, res, next) => {
        try {
            const { user } = req
            if (user && user.accessToken) {
                res.cookie("accessToken", user.accessToken, {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000 * 30,
                })
            }

            res.redirect("/")
        } catch (error) {
            next(error)
        }
    },
    (err, req, res, next) => {
        console.error("Error during Google OAuth callback:", err)
        res.status(500).json({
            status: "error",
            code: 500,
            message: "Failed to obtain access token",
            error: err.message,
        })
    }
)

export default router