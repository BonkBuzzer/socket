const express = require('express')
const socketIo = require('socket.io')
const http = require('http')
const PORT = process.env.PORT || 5000
const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:5173'
    }
})

io.on('connection', (socket) => {
    const users = []
    for (let [socket] of io.of("/").sockets) {
        users.push({
            socketId: socket.id,
        });
    }
    socket.emit("users", users);
    // console.log('Client connected , this is the username:', socket.username);
    console.log('Client connected :', socket.id);

    socket.on('message', (msg) => {
        console.log(`Message received from ${socket.id}: ${msg}`);
        // sends something back to the socket which sent a msg
        // socket.emit('message', msg)

        // sends to all other nodes other that one which has sent something if A sends something then other than A , it is broadcasted to everyone
        socket.broadcast.emit('message', msg)

        // message sent by a socket redirected to everyone (inclusively)
        // io.emit('message', msg)
    });

    socket.on('disconnect', (reason) => {
        console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });
});



server.listen(PORT, err => {
    if (err) console.log(err)
    console.log('Server running on Port ', PORT)
})