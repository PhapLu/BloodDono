import dotenv from 'dotenv'
dotenv.config()
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcrypt'

import { SuccessResponse } from "../core/success.response.js"
import {User} from '../models/user.model.js'
import { BadRequestError, NotFoundError } from '../core/error.response.js'
class UserController {
    
}

export default new UserController()