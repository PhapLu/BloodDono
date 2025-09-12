let users = []

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId })
}

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId)
}

const getUser = (userId) => {
    return users.find((user) => user.userId === userId)
}

class SocketServices {
    connection(socket) {
        socket.on("addUser", (userId) => {
            console.log("User connected with id:", socket.id)
            addUser(userId, socket.id)
            global._io.emit("getUsers", users)
        })

        socket.on("disconnect", () => {
            console.log("User disconnected with id:", socket.id)
            removeUser(socket.id)
            global._io.emit("getUsers", users)
        })

        // New: Handle sending comments
        socket.on("sendComment", (commentData) => {
            // Broadcast the comment to all users
            console.log("Comment received:", commentData)
            global._io.emit("receiveComment", commentData);
        });
    }
}

export default new SocketServices()
