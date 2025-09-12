import dotenv from 'dotenv'
dotenv.config()

import { Server } from 'socket.io'

export default function configureSocket(server) {
    const io = new Server(server);

    // Global variable
    global._io = io

    return io;
}
