var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');

app.use("/js", express.static(__dirname + '/js'));
app.use("/css", express.static(__dirname + '/css'));
app.use("/assets", express.static(__dirname + '/assets'));

app.get('/', function(req, res){
  res.sendfile('index.html');
});
app.get('/room/:code', function(req, res){
  var options = {
    url: "https://api.backand.com/1/query/data/getRoom?parameters=%7B%22room%22:%22"+req.params.code+"%22%7D",
    headers: {
      'AnonymousToken': '4fb475a7-6a1a-45d3-92ba-ad8aecf44f71'
    }
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var obj = JSON.parse(body);
      if(obj.length > 0){
        var nsp = io.of('/' + obj[0].code);
        nsp.on('connection', function(socket){
          socket.on('user connected', function(msg){
            nsp.emit('user connected', msg);
          });
          socket.on('disconnect', function(msg){
            console.log("user disconnect")
            nsp.emit('disconnect', msg);
          });
          socket.on('chat message', function(msg){
            nsp.emit('chat message', msg);
          });
        });
        res.sendfile('room.html');
      }
      else{
        res.sendfile('404.html');
      }
    }
  })
  //
});

http.listen(8080, function(){
  console.log('listening on *:8080');
});

function findClientsSocket(roomId, namespace) {
    var res = []
    // the default namespace is "/"
    , ns = io.of(namespace ||"/");

    if (ns) {
        for (var id in ns.connected) {
            if(roomId) {
                var index = ns.connected[id].rooms.indexOf(roomId);
                if(index !== -1) {
                    res.push(ns.connected[id]);
                }
            } else {
                res.push(ns.connected[id]);
            }
        }
    }
    return res;
}