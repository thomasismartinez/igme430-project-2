const http = require('http');
// const { disconnect } = require('process');
const { Server } = require('socket.io');

let io;

const socketSetup = (app) => {
  const server = http.createServer(app);
  io = new Server(server);

  io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit('user-join');

    socket.on('disconnecting', () => {
      console.log(`socket id ${socket.id} is disconnecting`);
      io.emit('player-disconnecting', socket.id);
    });

    socket.on('send-new-player', (playerData) => {
      //console.log(`new socket id: ${playerData.socketId}`);
      socket.broadcast.emit('new-player', playerData);
    });
    socket.on('send-update-new-player', (oldPlayerData) => {
      socket.broadcast.emit('update-new-player', oldPlayerData);
    });
    socket.on('send-chat', (chatData) => {
      socket.broadcast.emit('chat', chatData);
    });
    socket.on('send-player-movement', (playerMovement) => {
      socket.broadcast.emit('player-movement', playerMovement);
    });
    socket.on('send-color-change', (playerData) => {
      socket.broadcast.emit('color-change', playerData);
    });
  });

  return server;
};

module.exports = socketSetup;
