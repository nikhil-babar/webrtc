const express = require('express')
const app = express()
const { createServer } = require('http')
const { Server } = require('socket.io')
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET']
    }
})

app.use(express.json())

server.listen(5000, () => {
    console.log("Server on port 5000")
})

io.on('connection', (socket) => {
    console.log("new user connected")

    socket.emit('response:users', Array.from(io.sockets.sockets.keys()).filter(e => e !== socket.id))

    socket.on('conn:request', ({ to, offer }) => {
        socket.to(to).emit('conn:request', { from: socket.id, offer })
    })

    socket.on('conn:response', ({ to, answer }) => {
        socket.to(to).emit('conn:response', { from: socket.id, answer })
    })
})