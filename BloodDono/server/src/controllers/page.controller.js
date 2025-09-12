import dotenv from 'dotenv'
dotenv.config()
import { User } from '../models/user.model.js'
import { BadRequestError } from '../core/error.response.js'
import userController from './user.controller.js'
import { checkUserLoggedIn, checkUserActivated } from '../utils/util.js'

class PageController {

    signIn = async (req, res) => {
        const mockUser = {
            name: 'Hello'
        }
        res.render('signIn', mockUser);
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
            user: user || null // <— always defined (null or object)
        };
        res.render('landingPage', mockData);
    }

    bloodRecords = async (req, res) => {
        const accessToken = req.cookies.accessToken; // Assuming you store the accessToken in cookies
        const user = await checkUserLoggedIn(accessToken);
        console.log(user)
        res.render("bloodRecords", { user: user || null });
    }
    sendRequest = async (req, res) => {
        const accessToken = req.cookies.accessToken; // Assuming you store the accessToken in cookies
        const user = await checkUserLoggedIn(accessToken);
        console.log(user)
        res.render("sendRequest", { user: user || null });
    }
    confirm = async (req, res) => {
        const accessToken = req.cookies.accessToken; // Assuming you store the accessToken in cookies
        const user = await checkUserLoggedIn(accessToken);
        console.log(user)
        res.render("confirm", { user: user || null });
    }
}

export default new PageController()