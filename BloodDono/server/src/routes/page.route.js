import express from "express";
import { verifyToken } from '../middlewares/jwt.middleware.js'
import pageController from "../controllers/page.controller.js";
import {asyncHandler} from '../auth/checkAuth.js'

const router = express.Router()

router.get('/signIn', asyncHandler(pageController.signIn))
router.get('/landingPage', asyncHandler(pageController.landingPage))
router.get('/bloodRecords', asyncHandler(pageController.bloodRecords))
router.get('/sendRequest', asyncHandler(pageController.sendRequest))
router.get('/confirm', asyncHandler(pageController.confirm))
router.get("/bloodRecords/data", pageController.bloodRecordsData);
router.get('/details/:hospitalId', asyncHandler(pageController.details))

export default router