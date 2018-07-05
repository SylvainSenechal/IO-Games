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

  sizeX: 1000,
  sizeY: 1000,
  listJoueur: [],
  listBullet: [],
  nbJoueur: 0,
}



Joueur = function(id, width, height){
  this.id = id

  let x = Math.random()*jeu.sizeX
  let y = Math.random()*jeu.sizeY
  this.x = x
  this.y = y
  this.cibleX = x
  this.cibleY = y

  this.translateX = width/2 - x,
  this.translateY = height/2 - y,

  this.size = 50
  this.speedX = 0
  this.speedY = 0
  this.canonOrientation = Math.random()*360
  this.color = getRandomColor()
}

Bullet = function(valX, valY, valOrientation){
  this.speed = 20
  this.x = valX
  this.y = valY
  this.size = 5
  this.orientation = valOrientation
}

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////


// io.emit : tout le monde
// socket.broadcast.emit : tout le monde sauf soit
// socket.emit : juste à soit non fonctionnel ?


const sendUpdate = () => {
  io.emit('update', jeu.listJoueur)
}
setInterval(sendUpdate, 32) // ne pas oublier l'autre update du client

io.on('connection', function (socket){
  console.log("Connection d'un joueur : " + socket.id);

  socket.on('nouveauJoueur', function(width, height){
    let joueur = new Joueur(socket.id, width, height)
    jeu.listJoueur.push(joueur)
    console.log(jeu.listJoueur)
    io.sockets.connected[socket.id].emit('playerConnection', joueur, jeu.sizeX, jeu.sizeY)
  })
  socket.on('updatePlayerPosition', function(player){
    let found = jeu.listJoueur.find( element => element.id == player.id )
    if(found != undefined){
      found.x = player.x
      found.y = player.y
      found.cibleX = player.x
      found.cibleY = player.y
    }

    //socket.broadcast.emit('update', player)
  })


  socket.on('tir', function(x, y, canonOrientation){
    jeu.listBullet.push(new Bullet(x, y, canonOrientation))
    socket.broadcast.emit('bulletShot', new Bullet(x, y, canonOrientation))
  })






















  socket.on('disconnect', function(){
    console.log('user disconnected : ' + socket.id);
    jeu.listJoueur = jeu.listJoueur.filter( arr => arr.id != socket.id )
  });
});


// function initJoueurs(){
//   for(i=0; i<jeu.nbBlobs; i++){
//     jeu.listBlob.push(new Blob())
//   }
//   let x = Math.random()*4000
//   let y = Math.random()*2000
//   jeu.listJoueur[0].x = x
//   jeu.listJoueur[0].y = y
//   jeu.translateX = width/2 - x
//   jeu.translateY = height/2 - y
// }

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
