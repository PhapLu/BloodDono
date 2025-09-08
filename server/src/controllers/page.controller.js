import dotenv from 'dotenv'
dotenv.config()
import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'
import { BadRequestError } from '../core/error.response.js'
import userController from './user.controller.js'
import { checkUserLoggedIn, checkUserActivated } from '../utils/util.js'
import threadController from './thread.controller.js'
import postController from './post.controller.js'
import hotelRequestController from './hotelRequest.controller.js'
import categoryController from './category.controller.js'

class PageController {
    signUp = async (req, res) => {
        const user = await checkUserLoggedIn(req.cookies.accessToken);
        if(user){
            return res.redirect('/');
        }
        res.render('signUp', user);
    }

    login = async (req, res) => {
        const user = await checkUserLoggedIn(req.cookies.accessToken);
        
        if(user){
            return res.redirect('/');
        }
        res.render('login', user);
    }

    forgetPassword = async (req, res) => {
        const mockData = { title: 'FW', message: 'Welcome to the Log in Page' };
        res.render('forgetPassword', mockData);
    }

    landingPage = async (req, res) => {
        const accessToken = req.cookies.accessToken; // Assuming you store the accessToken in cookies
        const user = await checkUserLoggedIn(accessToken);
        
        const mockData = {
            totalCustomers: 1000,
            yearsExperience: 10,
            totalDestinations: 50,
            averageRating: 4.5,
            popularDestinations: [
                { name: 'Hanoi', image: '/images/hanoi.jpg' },
                { name: 'Ho Chi Minh City', image: '/images/hcmc.jpg' },
                { name: 'Da Nang', image: '/images/danang.jpg' },
            ],
            user
        };
        res.render('landingPage', mockData);
    }

    userProfile = async (req, res) => {
        const currentUser = await checkUserLoggedIn(req.cookies.accessToken)
        const user = await userController.readUserProfile(req, res)
        const categories = await categoryController.readCategories(req, res)
        console.log('CURRENTUSER', currentUser);
        if(user.role == 'hotel' && currentUser._id.toString() != user._id.toString()){
            return res.redirect('/page/hotelDetail/' + user._id);
        }
        const threads = await threadController.readThreadsOfUsers(req, res)
        let isOwner
        if(currentUser){
            isOwner = currentUser._id.toString() == req.params.userId;
        }
        res.render('userProfile', {user, threads, isOwner, currentUser, categories});
    }

    forum = async (req, res) => {
        const accessToken = req.cookies.accessToken; // Assuming you store the accessToken in cookies
        const categories = await categoryController.readCategories(req, res)
        let currentUser = null;
        currentUser = await checkUserLoggedIn(accessToken);
        const threads = await threadController.readThreads(req, res)
        res.render('forum', {forumContent: { threads, currentUser, categories }});
    }

    booking = async (req, res) => {
        const currentUser = await checkUserLoggedIn(req.cookies.accessToken)
        
        const hotels = await userController.readHotels(req, res)
        
        res.render('booking', {bookingContent: {currentUser, hotels}});
    }

    hotelDetail = async (req, res) => {
        const currentUser = await checkUserLoggedIn(req.cookies.accessToken)
        const hotel = await userController.readUserProfile(req, res)
        res.render('hotelDetail', {hotelDetailContent: { currentUser, hotel }});
    }

    hotelRequest = async (req, res) => {
        const user = await checkUserLoggedIn(req.cookies.accessToken)
        if(!user){
            return res.redirect('/page/login');
        }
        if(user.role == 'hotel'){
            return res.redirect('/');
        }
        const mockData = { title: 'Sign Up', message: 'Welcome to the Sign Up Page' };
        res.render('hotelRequest', mockData);
    }

    // siteMap = async (req, res) => {
    //     const currentUser = await checkUserLoggedIn(req.cookies.accessToken)
    //     console.log(currentUser);
    //     res.render('sitemap', {currentUser});
    // }

    order = async (req, res) => {
        const currentUser = await checkUserLoggedIn(req.cookies.accessToken)
        if(!currentUser){
            res.redirect('/page/login');
        }
        const hotel = await userController.readUserProfile(req, res)
        res.render('order', {orderContent: {hotel, currentUser}});
    }

    resetPassword = async(req, res) => {
        const mockData = { title: 'Sign Up', message: 'Welcome to the Sign Up Page' };
        res.render('resetPassword', mockData);
    }

    otpReset = async(req, res) => {
        const mockData = { title: 'Sign Up', message: 'Welcome to the Sign Up Page' };
        res.render('otpReset', mockData);
    }

    verify = async(req, res) => {
    }
    
    error = async(req, res) => {
        const mockData = { title: 'FW', message: 'Welcome to the Error Page' };
        res.render('error', mockData);
    }

    otpVerification = async (req, res) => {
        const mockData = { title: 'FW', message: 'Welcome to the OTP Verification Page' };
        res.render('otpVerification', mockData);
    }

    thread = async (req, res) => {
        const thread = await threadController.readThread(req, res)
        const user = await User.findById(thread.userId)
        if(!user.isActive || user.status == 'block'){
            console.log('REDDDEEE');
            return res.redirect('/');
        }

        const currentUser = await checkUserLoggedIn(req.cookies.accessToken);
        const categories = await categoryController.readCategories(req, res)
        const posts = await postController.readPosts(req, res)
        res.render('thread', {threadContent: {thread, currentUser, posts, categories}});
    }

    admin = async (req, res) => {
        const hotelRequests = await hotelRequestController.readHotelRequests(req, res)
        const users = await userController.readUsers(req, res)
        console.log(users);
        const currentUser = await checkUserLoggedIn(req.cookies.accessToken);
        if(currentUser.role !== 'admin'){
            return res.redirect('/');
        }
        
        res.render('admin', {adminContent: {hotelRequests, users, currentUser}})
    }

    search = async (req, res) => {
        let currentUser = null;
        currentUser = await checkUserLoggedIn(req.cookies.accessToken);
        const threads = await threadController.searchThreads(req, res)
        const categories = await categoryController.readCategories(req, res)
        console.log('SEARCHING');
        res.render('search', {searchContent: {threads, currentUser, categories}})
    }
    changePassword = async (req, res) => {
        const currentUser = await checkUserLoggedIn(req.cookies.accessToken)
        if(!currentUser){
            res.redirect('/')
        }
        res.render('changePassword', {currentUser})
    }
}

export default new PageController()