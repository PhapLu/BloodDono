import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import {User} from "../models/user.model.js"
import axios from "axios"
import { generateToken } from "../utils/token.util.js"
import dotenv from 'dotenv'
dotenv.config()

const callbackURL =
  process.env.NODE_ENV === "production"
    ? `${process.env.PRODUCTION_URL}/auth/google/callback`
    : `${process.env.LOCAL_URL}/auth/google/callback`;
console.log("Google OAuth Callback URL:", callbackURL);
// Set axios timeout
axios.defaults.timeout = 10000 // 10 seconds

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: callbackURL
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Find or create user in your database
                let user = await User.findOne({ googleId: profile.id })
                if (!user || user.status === 'block') {
                    user = new User({
                        googleId: profile.id,
                        fullName: profile.displayName,
                        email: profile.emails[0].value,
                        password: "",
                    })
                }
                const jwtToken = generateToken(user)
                console.log(jwtToken)
                user.isActive = true
                user.accessToken = jwtToken
                await user.save()

                return done(null, user)
            } catch (err) {
                console.error("Error during authentication:", err)
                console.error("Detailed error:", JSON.stringify(err, null, 2))
                return done(err, null)
            }
        }
    )
)

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id)
        done(null, user)
    } catch (err) {
        console.error("Error during deserialization:", err)
        done(err, null)
    }
})
