// ip à rentrer dans url pour co (et pas localhost)
var socket = io.connect('http://192.168.1.132:8080');

socket.on('update', function(liste){


  // !!! Ajouter le retrait
  let trouve = false
  let indexTrouve = 0
  for(i=0; i<liste.length; i++){
    let id = liste[i].id
    trouve = false
    for(j=0; j<jeu.listJoueur.length; j++){
      id2 = jeu.listJoueur[j].id
      if(id2 == id){
        trouve = true
        indexTrouve = j
      }
    }
    if(trouve){
      jeu.listJoueur[indexTrouve].cibleX = liste[i].cibleX
      jeu.listJoueur[indexTrouve].cibleY = liste[i].cibleY
    }
    else{
      jeu.listJoueur.push(liste[i])
    }
  }
})

socket.on('playerConnection', function(player, sizeX, sizeY){
  jeu.sizeX = sizeX
  jeu.sizeY = sizeY

  Me = player
  Me.translateX = width/2 - Me.x
  Me.translateY = height/2 - Me.y
  console.log(Me)
  setInterval(sendUpdate, 32) // ne pas oublier l'autre update du serveur
  loop()
})

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

const init = () => {
  canvas = document.getElementById('mon_canvas')
  ctx = canvas.getContext('2d')

  ctx.canvas.width = width
  ctx.canvas.height = height
	ctx.font = "40px Comic Sans MS"

  socket.emit('nouveauJoueur', width, height);

}
const sendUpdate = () => {
  socket.emit('updatePlayerPosition', Me);
}

const resize = () => {
	height = window.innerHeight;
	width = window.innerWidth;
  ctx.canvas.width = window.innerWidth
  ctx.canvas.height = window.innerHeight
}

const loop = () => { // Voir l'ordre des fonctions
  moveJoueur()
  moveBullet()
  vitesse()
  moveOthers()
  //collisions()

  dessin()
  requestAnimationFrame(loop);
}

var ctx, canvas
var width = window.innerWidth
var height = window.innerHeight
var Me = undefined
var jeu = { // Definir le jeu depuis le serveur qui lui renvoie dans playerConnection
  listJoueur: [],
  listBullet: [],
  nbJoueur: 0,
}



Joueur = function(id){
  this.id = id
  let x = Math.random()*jeu.sizeX
  let y = Math.random()*jeu.sizeY
  this.x = x
  this.y = y
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

const moveOthers = () => {
  jeu.listJoueur.forEach( joueur => {
    joueur.x += (joueur.cibleX - joueur.x) * 0.16
    joueur.y += (joueur.cibleY - joueur.y) * 0.16
  })
}

const moveJoueur = () => {
  Me.x += Me.speedX
  Me.y += Me.speedY
}

const tirJoueur = (x, y, canonOrientation) => {
  jeu.listBullet.push(new Bullet(x, y, canonOrientation))
  console.log(jeu.listJoueur)
}

const moveBullet = () => {
  for(i=0; i<jeu.listBullet.length; i++){
    let bullet = jeu.listBullet[i]
    let plusX = Math.cos(bullet.orientation*Math.PI/180) * bullet.speed
    let plusY = Math.sin(bullet.orientation*Math.PI/180) * bullet.speed
    bullet.x += plusX
    bullet.y += plusY
  }
}

const collisions = () => {
  for(i=0; i<jeu.listBullet.length; i++){
    let bullet = jeu.listBullet[i]
    for(j=1; j<jeu.listBlob.length; j++){ // 1 pour pas compter mon blob
      let blob = jeu.listBlob[j]
      let dst = Math.sqrt( (bullet.x-blob.x) * (bullet.x-blob.x) + (bullet.y-blob.y) * (bullet.y-blob.y) )
      if(dst < blob.size + bullet.size){
        jeu.listBullet.splice(i, 1)
        blob.size--
      }
    }
  }
}



/////////////////////////////
// CREATION DE MAP + DESSINER
/////////////////////////////

document.onmousemove = (e) => { // Utiliser les bords pour bouger
  let a = (e.x-width/2)
  let b = (e.y-height/2)
  //if(Me)
  Me.canonOrientation = Math.atan2(b,a)*180/Math.PI
}

document.onwheel = (e) => { // !! pas trop dezoomer pour pas sortir du cadre
  if(e.deltaY<0){ // zoom
		ctx.scale(1.1, 1.1)
	}
	else{ // dezoom
    ctx.scale(0.9, 0.9)
	}
}

document.onclick = (e) => {
  socket.emit('tir', Me.x, Me.y, Me.canonOrientation);
  tirJoueur(Me.x, Me.y, Me.canonOrientation)
}

socket.on('bulletShot', function(bullet){
  jeu.listBullet.push(bullet)
})

var mouseDown = false
document.onmousedown = (e) => {
  mouseDown = true
}
document.onmouseup = (e) => {
  mouseDown = false
}

var haut, bas, droite, gauche;
var vitesseX = 0;
var vitesseY = 0;
document.onkeydown = (e) => {
	if(e.keyCode == 90){ haut 	= 	true; }
	if(e.keyCode == 68){ droite = 	true; }
	if(e.keyCode == 83){ bas 	= 	true; }
	if(e.keyCode == 81){ gauche = 	true; }
}
document.onkeyup = (e) => {
	if(e.keyCode == 90){ haut 	= 	false; }
	if(e.keyCode == 68){ droite = 	false; }
	if(e.keyCode == 83){ bas 	=	false; }
	if(e.keyCode == 81){ gauche = 	false; }
}

const vitesse = () => {
	if(haut 	== true )	{ Me.translateY+=15;
                        Me.y-=15 }
	if(droite == true )	{ Me.translateX-=15;
                        Me.x+=15}
	if(bas 		== true )	{ Me.translateY-=15;
                        Me.y+=15}
	if(gauche == true )	{ Me.translateX+=15;
                        Me.x-=15}

  if(Me.x > jeu.sizeX) {Me.x = jeu.sizeX; Me.translateX = -(jeu.sizeX - width/2) }
  if(Me.x < 0        ) {Me.x = 0        ; Me.translateX =  width/2               }
  if(Me.y > jeu.sizeY) {Me.y = jeu.sizeX; Me.translateY = -(jeu.sizeY - height/2)}
  if(Me.y < 0        ) {Me.y = 0        ; Me.translateY =  height/2              }
}

const dessin= () => {
  //ctx.translate(-jeu.translateX, -jeu.translateY)
  ctx.clearRect(0, 0, width, height) // clear map

  ctx.strokeStyle = "#000000"
  // Lignes horizontales
  if(Me.translateY>0){ // Gestion < et > 0
    for(i=0; i<height/100; i++){
      ctx.beginPath();
      ctx.moveTo(0, i*100 + Math.abs(Me.translateY%100));
      ctx.lineTo(width, i*100 + Math.abs(Me.translateY%100));
      ctx.stroke();
    }
  }
  else{
    for(i=0; i<height/100; i++){
      ctx.beginPath();
      ctx.moveTo(0, i*100 + Math.abs(-100-Me.translateY%100));
      ctx.lineTo(width, i*100 + Math.abs(-100-Me.translateY%100));
      ctx.stroke();
    }
  }

  // Lignes verticales
  ctx.strokeStyle = "#ff0000"
  if(Me.translateX>0){
    for(i=0; i<width/100; i++){
      ctx.beginPath();
      ctx.moveTo(i*100 + Math.abs(Me.translateX%100), 0);
      ctx.lineTo(i*100 + Math.abs(Me.translateX%100), height);
      ctx.stroke();
    }
  }
  else{
    for(i=0; i<width/100; i++){
      ctx.beginPath();
      ctx.moveTo(i*100 + Math.abs(-100-Me.translateX%100), 0);
      ctx.lineTo(i*100 + Math.abs(-100-Me.translateX%100), height);
      ctx.stroke();
    }
  }


  // Dessin Joueur
  ctx.beginPath()
  ctx.fillStyle = Me.color
  ctx.arc(Me.x+Me.translateX, Me.y+Me.translateY, Me.size, 0, 2*Math.PI)
  ctx.fill()
  // Dessin autres joueurs
  for(i=0; i<jeu.listJoueur.length; i++){
    let blob = jeu.listJoueur[i]
    if(blob.id != Me.id){
      ctx.beginPath()
      ctx.fillStyle = blob.color
      ctx.arc(blob.x+Me.translateX, blob.y+Me.translateY, blob.size, 0, 2*Math.PI)
      ctx.fill()
    }
  }


  ctx.fillStyle = "#000000"
  for(i=0; i<jeu.listBullet.length; i++){
    let bullet = jeu.listBullet[i]
    ctx.beginPath()

    ctx.arc(bullet.x+Me.translateX, bullet.y+Me.translateY, bullet.size, 0, 2*Math.PI)
    ctx.fill()
  }
  //ctx.translate(jeu.translateX, jeu.translateY)
}

const getRandomColor = () => {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}




window.addEventListener('load', init);
window.addEventListener('resize', resize, false);
