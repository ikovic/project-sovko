const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  origins: '*:*',
  path: '/api/realtime',
  handlePreflightRequest: (req, res) => {
    const headers = {
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Origin': req.headers.origin,
      'Access-Control-Allow-Credentials': true,
    };
    res.writeHead(200, headers);
    res.end();
  },
});

io.on('connection', function(socket) {
  socket.on('chat message', function(msg) {
    console.log('got message', msg);
    socket.broadcast.emit('chat message', msg);
  });
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});
