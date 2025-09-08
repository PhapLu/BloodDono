import express from "express";
import { verifyToken } from '../middlewares/jwt.middleware.js'
import pageController from "../controllers/page.controller.js";
import {asyncHandler} from '../auth/checkAuth.js'

const router = express.Router()

router.get('/signUp', asyncHandler(pageController.signUp))
router.get('/login', asyncHandler(pageController.login))
router.get('/forgetPassword', asyncHandler(pageController.forgetPassword))
router.get('/search', asyncHandler(pageController.search))
router.get('/userProfile/:userId', asyncHandler(pageController.userProfile))
router.get('/forum', asyncHandler(pageController.forum))
router.get('/verify', asyncHandler(pageController.verify))
router.get('/resetPassword', asyncHandler(pageController.resetPassword))
router.get('/booking', asyncHandler(pageController.booking))
router.get('/hotelDetail/:userId', asyncHandler(pageController.hotelDetail))
router.get('/siteMap', asyncHandler(pageController.siteMap))
router.get('/order/:userId', asyncHandler(pageController.order))
router.get('/error', asyncHandler(pageController.error))
router.get('/otpReset', asyncHandler(pageController.otpReset))
router.get('/hotelRequest', asyncHandler(pageController.hotelRequest))
router.get('/otpVerification', asyncHandler(pageController.otpVerification))
router.get('/thread/:threadId', asyncHandler(pageController.thread))
router.get('/admin', asyncHandler(pageController.admin))
router.get('/changePassword', asyncHandler(pageController.changePassword))

export default router