// socket.io implementation from https://github.com/IGM-RichMedia-at-RIT/basic-socket-io-done/tree/master
const http = require('http');
// const { disconnect } = require('process');
const { Server } = require('socket.io');

let io;

const socketSetup = (app) => {
  const server = http.createServer(app);
  io = new Server(server);

  io.on('connection', (socket) => {
    console.log('a user connected');
    // player joins
    socket.emit('user-join');

    // player is disconnecting from socket
    socket.on('disconnecting', () => {
      console.log(`socket id ${socket.id} is disconnecting`);
      io.emit('player-disconnecting', socket.id);
    });

    // new player connects
    socket.on('send-new-player', (playerData) => {
      socket.broadcast.emit('new-player', playerData);
    });
    // old players tell new player they exist
    socket.on('send-update-new-player', (oldPlayerData) => {
      socket.broadcast.emit('update-new-player', oldPlayerData);
    });
    // player sends chat message
    socket.on('send-chat', (chatData) => {
      socket.broadcast.emit('chat', chatData);
    });
    // player moves
    socket.on('send-player-movement', (playerMovement) => {
      socket.broadcast.emit('player-movement', playerMovement);
    });
    // player changes avatar
    socket.on('send-color-change', (playerData) => {
      socket.broadcast.emit('color-change', playerData);
    });
  });

  return server;
};

module.exports = socketSetup;
