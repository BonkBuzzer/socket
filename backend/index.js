require('dotenv').config();

const cors = require('cors')
const express = require('express');
const socketIo = require('socket.io');
const http = require('http');
const { default: mongoose } = require('mongoose');
const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const authRoutes = require('./routes/auth.routes')
const userRoutes = require('./routes/user.routes')
const io = socketIo(server, {
    cors: {
        origin: 'http://192.168.29.138:5173'
    }
});

app.use(express.json())
app.use(cors())
app.use('/', authRoutes)
app.use('/', userRoutes)

const users = [];

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

io.on('connection', (socket) => {
    const username = socket.handshake.auth.username;
    const mongoId = socket.handshake.auth.mongoId;
    if (username) {
        users.push({ socketId: socket.id, username, mongoId });

        socket.emit("users", users);
        socket.broadcast.emit("users", users);

        console.log('Client connected:', socket.id, 'Username:', username);

        socket.on('message', (msg) => {
            console.log(`Message received from ${socket.id}: ${msg}`);
            socket.broadcast.emit('message', msg);
        });

        socket.on('private message', ({ content, to }) => {
            socket.to(to).emit("private message", {
                content,
                from: socket.id,
            });
        });

        socket.on('disconnect', (reason) => {
            console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
            const index = users.findIndex(user => user.socketId === socket.id);
            if (index !== -1) {
                users.splice(index, 1);
            }
            io.emit("users", users);
        });
    } else {
        console.log('Client connection failed due to missing username');
        socket.disconnect();
    }
});

server.listen(PORT, err => {
    if (err) console.log(err);
    console.log('Server running on Port', PORT);
});
