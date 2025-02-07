import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);

app.use(cors({
  // origin: 'http://localhost:3000',
  // methods: ['GET', 'POST'],
  // credentials: true,
}));

const io = new Server(server, {
  cors: {
    // origin: 'http://localhost:3000',
    // methods: ['GET', 'POST'],
    // credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('user connected', (username) => {
    io.emit('user connected', `${username} has joined the chat`);
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('user disconnected', (msg) => {
    io.emit('user disconnected', msg);
    socket.disconnect();
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(3001, () => {
  console.log('Server is running on :3001');
});
