import express from "express";
import { verifyToken } from '../middlewares/jwt.middleware.js'
import pageController from "../controllers/page.controller.js";
import {asyncHandler} from '../auth/checkAuth.js'

const router = express.Router()

router.get('/signUp', asyncHandler(pageController.signUp))
router.get('/signIn', asyncHandler(pageController.signIn))
router.get('/landingPage', asyncHandler(pageController.landingPage))
router.get('/bloodRecords', asyncHandler(pageController.bloodRecords))
// router.get('/userProfile/:userId', asyncHandler(pageController.userProfile))
// router.get('/error', asyncHandler(pageController.error))

export default router