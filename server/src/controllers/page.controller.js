import dotenv from 'dotenv'
dotenv.config()
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import { BadRequestError } from '../core/error.response.js'
import userController from './user.controller.js'
import { checkUserLoggedIn, checkUserActivated } from '../utils/util.js'

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
    
    landingPage = async (req, res) => {
        const mockUser = {
            name: 'Hello'
        }
        
        res.render('landingPage', mockUser);
    }
}

export default new PageController()