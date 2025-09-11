import dotenv from 'dotenv'
dotenv.config()
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
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
        const mockUser = {
            name: 'Hello'
        }
        
        res.render('landingPage', mockUser);
    }

    bloodRecords = async (req, res) => {
        const mockUser = {
            name: 'Hello'
        }
        
        res.render('bloodRecords', mockUser);
    }
}

export default new PageController()