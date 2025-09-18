import * as dotenv from 'dotenv'
dotenv.config()
import path from 'path'
import url from 'url';
import http from 'http'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

import morgan from 'morgan'
import helmet from 'helmet'
import express from 'express'
import passport from 'passport'
import bodyParser from 'body-parser'
import session from 'express-session'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import './configs/passport.config.js'
import router from './routes/index.js'
import SocketServices from './controllers/socket.service.js';
import sanitizeInputs from './middlewares/sanitize.middleware.js'
const app = express()

// Set EJS as the view engine 
app.set('view engine', 'ejs');

// Set the directory for view templates
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

//Init middlewares
app.use(express.json())
app.use(morgan('dev'))
app.use(compression())
app.use(cookieParser())
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))
app.use(sanitizeInputs);

//Initialize session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
    }
}))

//Initialize passport
app.use(passport.initialize())
app.use(passport.session())

//Init db
import './db/init.mongodb.js'
import configureSocket from './configs/socket.config.js';

//Init routes
app.use('', router)

// Handling 404 errors
app.use((req, res, next) => {
    const error = new Error('API Not Found');
    error.status = 404;
    next(error);
});

// Handling other errors
app.use((error, req, res, next) => {
    const statusCode = error.status || 500;
    // For other errors, send a JSON response
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: error.message || 'Internal Server Error'
    });
});

// Create HTTP server
const server = http.createServer(app);

// Configure Socket.IO
const io = configureSocket(server);

global._io.on('connection', SocketServices.connection);

process.on('SIGINT', () => {
    server.close(() => console.log('Exit Server Express'));
});

export default server;