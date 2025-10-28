// server/src/sockets/index.js
const { Server } = require('socket.io');

let io;
const initSockets = (server) => {
  io = new Server(server, { cors: { origin: process.env.CLIENT_URL } });
  io.on('connection', socket => {
    socket.on('join_project', (projectId) => socket.join(projectId));
  });
};
const emitToProject = (projectId, event, payload) => {
  io.to(projectId).emit(event, payload);
};

module.exports = { initSockets, emitToProject };
