import { User } from "../models/user.model.js";
import jwt from 'jsonwebtoken';

const checkUserLoggedIn = async (accessToken) => {
    if (accessToken) {
        try {
            const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET); // Use your secret key here
            const user = await User.findOne({_id:decodedToken.id, isActive: true})
            return user
        } catch (error) {
            console.error('Error verifying token or finding user:', error);
            return null; // In case of error, return null to indicate the user is not logged in
        }
    }
    return null; // No accessToken provided, return null
}

const checkUserActivated = async (isActive) => {
    if(isActive){
        return true
    }
    return false
}
export {
    checkUserLoggedIn,
    checkUserActivated
}
