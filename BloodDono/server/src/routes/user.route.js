import express from "express";
import userController from '../controllers/user.controller.js'
import { uploadDisk } from "../configs/multer.config.js";
import { verifyToken } from "../middlewares/jwt.middleware.js";
import {asyncHandler} from '../auth/checkAuth.js'

const router = express.Router()

router.get('/readUserProfile/:userId', asyncHandler(userController.readUserProfile))
router.get('/readHotels', asyncHandler(userController.readHotels))
router.get('/readUsers', asyncHandler(userController.readUsers))

router.use(verifyToken)
router.post('/updateProfile', asyncHandler(userController.updateProfile))
router.post('/updateAvatar', uploadDisk.single('file'), asyncHandler(userController.updateAvatar))
router.post('/updateBackground', uploadDisk.single('file'), asyncHandler(userController.updateBackground))
router.post('/deActiveAccount', asyncHandler(userController.deActiveAccount))
router.post('/blockUser/:userId', asyncHandler(userController.blockUser))
router.post('/unBlockUser/:userId', asyncHandler(userController.unBlockUser))
router.post('/changeExistingPassword', asyncHandler(userController.changeExistingPassword))
router.post('/archiveThread', asyncHandler(userController.archiveThread))
router.post('/archivePost', asyncHandler(userController.archivePost))

export default router