var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

server.listen(8080);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/indexSurviving2.html');
});


app.get('/surviving2.js', function(req, res) {
    res.sendFile(__dirname + '/surviving2.js');
});

// app.get('/socket.io/socket.io.js', function(req, res) {
//     res.sendFile(__dirname + '/socket.io/socket.io.js');
// });

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////


var jeu = {
  sizeX: 2000,
  sizeY : 2000,
  listeJoueur: [],
}

setInterval(sendUpdate, 50)

function sendUpdate(){
  //console.log(jeu.listeJoueur)
  io.emit('update', jeu.listeJoueur)
}

function Joueur(){
  this.x = Math.random()*jeu.sizeX
  this.y = Math.random()*jeu.sizeY
  this.size = 50
  this.speedX = 0
  this.speedY = 0
  this.canonOrientation = Math.random()*360
  this.color = getRandomColor()
}

io.on('connection', function (socket){
  console.log("connection : " + socket.id);
  console.log("//////////////////////////////////////////////////")
  jeu.listeJoueur.push(new Joueur())
  console.log(jeu.listeJoueur)


  socket.on('position', function(message){
    console.log("le client : " + socket.id + " envoie : "  + message);
    io.emit('mess', "un client donne sa position : " + message);
    //socket.broadcast.emit('modBoule', boules);
    //socket.emit('modBoule', boules);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected : ' + socket.id);
  });
});


function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
