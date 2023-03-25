const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const mongoose = require('mongoose')

app.get('/', (req, res) => {
    res.sendFile('D:\\Programming\\ChatApp\\client\\index.html')
})

const mongooseConnectionString = 'mongodb://localhost:27017/Chat-app'

mongoose.connect(mongooseConnectionString, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    family: 4,
}).then(() => {
    console.log('Database connected')
})

const MessageSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    message: {
        required: true,
        type: String
    },
});

const UserSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    id: {
        required: true,
        type: String
    }
})

MessageModel = mongoose.model('Messages', MessageSchema)
UserModel = mongoose.model('Users', UserSchema)

app.use(express.json())

io.on('connection', (socket) => {
    socket.on('new-user-joined', (name) => {
        user = new UserModel
        user.name = name
        user.id = socket.id
        user.save()
        socket.broadcast.emit('user-joined', name)
    })
    socket.on('send-message', async (message) => {
        messageModel = new MessageModel
        const user = await UserModel.findOne({id: socket.id})
        messageModel.message = message
        messageModel.name = user.name
        messageModel.save()
        socket.broadcast.emit('emit-message', {message: message, name: messageModel.name})
    })
})

app.get('/messages', async (req, res) => {
    try {
        const messages = await MessageModel.find()
        res.status(200).json(messages)
    }
    catch (e) {
        res.json({ message: e.message })
    }
})

server.listen(3000, () => {
    console.log('server listening on http://localhost:3000/')
})