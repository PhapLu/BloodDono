import dotenv from 'dotenv'
dotenv.config()
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcrypt'

import { SuccessResponse } from "../core/success.response.js"
import { User } from '../models/user.model.js'
import { BadRequestError, NotFoundError } from '../core/error.response.js'
import Thread from '../models/thread.model.js'
import Post from '../models/post.model.js'
class UserController {
    updateProfile = async(req, res, next) => {
        const body = req.body
        const { userId } = req
        console.log('Start');
        //1. Check user
        const user = await User.findById(userId)
        if (!user) 
            return next(new ErrorResponse('User not found', 404))

        //2. Validate body
        if (body.email) 
            throw new BadRequestError('Email cannot be updated')
        if (body.password)
            throw new BadRequestError('Password cannot be updated here')
        if (body.role)
            throw new BadRequestError('Role cannot be updated here')
        if (body.isActive)
            throw new BadRequestError('isActive cannot be updated here')

        //2. Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { ...body },
            { new: true }
        )

        return res.redirect('/page/userProfile/' + userId)
    }

    updateAvatar = async (req, res, next) => {
        try {
            const { userId } = req;

            // 1. Check if the user and the file exist
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (!req.file) {
                return res.status(400).json({ message: 'Please provide an image file' });
            }

            // 2. Update avatar
            const oldAvatar = user.avatar;  // Store the old avatar path
            const newAvatarPath = `/images/upload/${req.file.filename}`; // Assuming you store files in the uploads folder
    
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { avatar: newAvatarPath },
                { new: true }
            );
    
            // 3. Delete the old avatar file, if it exists and it's not the default one
            if (oldAvatar && oldAvatar !== '/images/systems/default-avatar.png') {
                console.log(oldAvatar);
                const oldAvatarPath = path.resolve(`./public${oldAvatar}`);
                fs.unlink(oldAvatarPath, (err) => {
                    if (err) {
                        console.error(`Failed to delete old avatar: ${oldAvatar}. Error: ${err.message}`);
                    }
                });
            }
            
            // 4. Redirect to the profile page to refresh the view
            return res.redirect(`/page/userProfile/${userId}`); // Assuming /user/profile is the route for the profile page
    
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }
    };

    deActiveAccount = async(req, res, next) => {
        const { userId } = req

        //1. Check user
        const user = await User.findById(userId)
        if (!user) 
            throw new NotFoundError('User not found')

        //2. Deactivate account
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { isActive: false },
            { new: true }
        )

        return res.redirect('/')
    }

    updateBackground = async (req, res, next) => {
        try {
            const { userId } = req;
        
            // 1. Check if the user and the file exist
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (!req.file) {
                return res.status(400).json({ message: 'Please provide an image file' });
            }
        
            // 2. Update background
            const oldBackground = user.bg;  // Store the old background path
            const newBackgroundPath = `/images/upload/${req.file.filename}`; // Assuming you store files in the uploads folder
        
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { bg: newBackgroundPath },
                { new: true }
            );
        
            // 3. Delete the old background file, if it exists and it's not the default one
            if (oldBackground && oldBackground !== '/images/systems/default-background.png') {
                try {
                    const oldBackgroundPath = path.resolve(`./public${oldBackground}`);
                    fs.unlink(oldBackgroundPath, (err) => {
                        if (err) {
                            console.error(`Failed to delete old background: ${oldBackground}. Error: ${err.message}`);
                        }
                    });
                } catch (error) {
                    console.error(`Error while deleting old background: ${error.message}`);
                }
            }
            
            // 4. Redirect to the profile page to refresh the view
            return res.redirect(`/page/userProfile/${userId}`); // Assuming this is the correct route for the profile page
        
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Server error' });
        }
    };

    readUserProfile = async (req, res, next) => {
        const userId = req.params.userId;
    
        // 1. Check user
        const user = await User.findOne({ _id: userId })
            .populate({
                path: 'threadsArchived',
                populate: {
                    path: 'userId', // Assuming 'userId' is the field in 'Thread' that you want to populate
                    model: 'User', // Model name for User (or whatever model you use for users)
                }
            })
            .populate('postsArchived'); // Populate postsArchived as usual
    
        if (!user || user.isActive === false || user.status === 'block') {
            return res.redirect('/');
        }
        console.log(user._id);
        return user;
    };
    
    readHotels = async(req, res, next) => {
        const hotels = await User.find({ role: 'hotel', isActive: true })
        return hotels
    }

    readUsers = async(req, res, next) => {
        const users = await User.find();
        
        // Convert each user document to plain JavaScript object and modify the 'blocked' field
        const usersWithStatus = users.map(user => {
            const userObj = user.toObject(); // Convert to plain object
            userObj.blocked = user.status === 'block' ? true : false;
            return userObj;
        });

        return usersWithStatus;
    }

    blockUser = async(req, res, next) => {
       const adminId = req.userId
        const blockedUserId = req.params.userId

        //1. Check admin, blockedUser
        const admin = await User.findById(adminId)
        const blockedUser = await User.findById(blockedUserId)
        if(!blockedUser)
            throw new NotFoundError('User not found')
        if(!admin) 
            throw new NotFoundError('Admin not found')
        if(admin.role !== 'admin')
            throw new BadRequestError('You are not authorized to perform this action')

        //2. Block user
        blockedUser.status = 'block'
        blockedUser.save()

        return res.redirect('/page/admin')
    }

    unBlockUser = async(req, res, next) => {
        const adminId = req.userId
         const unBlockedUserId = req.params.userId
 
         //1. Check admin, blockedUser
         const admin = await User.findById(adminId)
         const unBlockedUser = await User.findById(unBlockedUserId)
         if(!unBlockedUser)
             throw new NotFoundError('User not found')
         if(!admin) 
             throw new NotFoundError('Admin not found')
         if(admin.role !== 'admin')
             throw new BadRequestError('You are not authorized to perform this action')
 
         //2. Unblock user
         unBlockedUser.status = 'pending'
         unBlockedUser.save()
 
         return res.redirect('/page/admin')
    }

    archivePost = async (req, res, next) => {
        const { userId } = req;
        const postId = req.body.postId;

        // 1. Check if the user and the post exist
        const user = await User.findById(userId);
        const post = await Post.findById(postId);
        if (!user) 
            return res.status(404).json({ message: 'User not found' });
        if(!post)
            return res.status(404).json({ message: 'Post not found' });
        
        if (!user.postsArchived.includes(postId)) {
            user.postsArchived.push(postId);
            await user.save();
        }

        return res.redirect(`/page/userProfile/${userId}`);
    }

    archiveThread = async(req, res, next) => {
        const { userId } = req;
        const threadId = req.body.threadId;

        // 1. Check if the user and the thread exist
        const user = await User.findById(userId);
        const thread = await Thread.findById(threadId);
        if (!user) 
            return res.status(404).json({ message: 'User not found' });
        if(!thread)
            return res.status(404).json({ message: 'Thread not found' });
    
        if (!user.threadsArchived.includes(threadId)) {
            user.threadsArchived.push(threadId);
            await user.save();
        }

        return res.status(200).json({
           ok: true
        });
    }

    archiveCategory = async(req, res, next) => {
        const { userId } = req;
        const categoryId = req.params.categoryId;

        // 1. Check if the user and the category exist
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!user.categoriesArchived.includes(categoryId)) {
            user.categoriesArchived.push(categoryId);
            await user.save();
        }

        return res.redirect(`/page/userProfile/${userId}`);
    }

    changeExistingPassword = async(req, res, next) => {
        const { userId } = req;
        const { oldPassword, newPassword } = req.body;

        // 1. Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Check if the old password is correct
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).render('changePassword', { error: 'Old password is incorrect' });
        }

        // 3. Update the password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.redirect(`/page/userProfile/${userId}`);
    }
}

export default new UserController()