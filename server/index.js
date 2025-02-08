import express from 'express'
import http from 'http'
import {Server} from 'socket.io'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoutes.js' // new to work on this
import chatRoutes from './routes/chatRoutes.js'; // Import Chat Routes
// import {verifyToken} from './middleware/authMiddleware.js' //need to work on this

dotenv.config();

const app = express()
const server = http.createServer(app)

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))

app.use(express.json())
app.use(cookieParser())

// MongoDB Connection
// mongoose.connect(process.env.MONGO_URL, {
//   useNewUrlParse: true,
//   useUnifiedTopology: true,
// }).then(()=>console.log('MongoDB Connected'))
//   .catch(err => console.log(err))
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));


app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)

// Socket.IO Setup
const io = new Server(server, {
  cors:{
    origin: 'http://localhost:3000',
    credentials: true,
  }
})

io.on('connection', (socket)=>{
  console.log('A user is connected');

  socket.on('user connected', (username)=>{
    console.log('usernameIO', username);
    
    io.emit(`user connected`, `${username} has joined the chat`)
  })

  socket.on('chat message', (msg)=>{
    io.emit('chat message', msg)
  })

  socket.on('user disconnected', (msg) => {
    io.emit('user disconnected', msg);
    socket.disconnect();
  });

  socket.on('disconnect', ()=>{
    console.log('A User disconnected');
    
  })
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, ()=>{
  console.log(`Server is running on ${PORT}`);
})