window.addEventListener('load', init);

var socket = io.connect('http://192.168.1.129:8080');

// document.onclick = function(e){
//   socket.emit('position', e.clientX);
//   socket.emit('newBoule', "ui");
// }
socket.on('update', function(data){
  jeu.listBlob = data
})

socket.on('mess', function(data){
  console.log(data)
})

// Utiliser des couleurs similaire (moyenne des 3 pour engendrer un nouvel individu quand il faut, nécessite case = +/- objet)
// barre html pour ajuster fps

function init(){
  canvas = document.getElementById('mon_canvas')
  ctx = canvas.getContext('2d')

  ctx.canvas.width = width
  ctx.canvas.height = height
	ctx.font = "40px Comic Sans MS"

  initBlobs()
  loop()
}
window.addEventListener('resize', resize, false);
function resize(){
	height = window.innerHeight;
	width = window.innerWidth;
  ctx.canvas.width = window.innerWidth
  ctx.canvas.height = window.innerHeight
}

function loop(){ // Voir l'ordre des fonctions
  moveBlobs()
  moveBullet()
  vitesse()
  //tirBlob()
  collisions()
  dessin()
  requestAnimationFrame(loop);
}

var ctx, canvas
// Faire un canvas de taille normal et dessiner ce qui est important
var width = window.innerWidth  // %3 == 0
var height = window.innerHeight

var jeu = {
  translateX: 0,
  translateY: 0,
  sizeX: 5000,
  sizeY: 5000,
  listBlob: [],
  listBullet: [],
  nbBlobs: 100,
}


Blob = function(){ // Brain : orientation delta avec cible, speed ? ( à dissocier d'orientation ? ..)
                    // Fitness : nb tués + temps survécu ?
                    // Range max, la balle disparaît apres la range max parcourue
                    // Dessiner le canon avec une ligne depuis le centre
  this.x = Math.random()*jeu.sizeX
  this.y = Math.random()*jeu.sizeY
  // this.size= Math.random()*100
  this.size = 50
  this.speedX = 0
  this.speedY = 0
  this.canonOrientation = Math.random()*360 // Brain renvoie entre 0 et 1, * 360 ( > 360: val-360) ( < 360: 360-val)

  this.color = getRandomColor()
}

Bullet = function(valX, valY, valOrientation){
  this.speed = 20
  this.x = valX
  this.y = valY
  this.size = 5
  this.orientation = valOrientation
}

function initBlobs(){
  for(i=0; i<jeu.nbBlobs; i++){
    jeu.listBlob.push(new Blob())
  }

  let x = Math.random()*4000
  let y = Math.random()*2000
  jeu.listBlob[0].x = x
  jeu.listBlob[0].y = y
  jeu.translateX = width/2 - x
  jeu.translateY = height/2 - y
}

function moveBlobs(){
  for(i=0; i<jeu.listBlob.length; i++){
    let blob = jeu.listBlob[i]
    blob.x += blob.speedX
    blob.y += blob.speedY
  }
}



function tirBlob(){
  for(i=0; i<1; i++){//jeu.listBlob.length; i++){
    let blob = jeu.listBlob[i]
    jeu.listBullet.push(new Bullet(blob.x, blob.y, canonOrientation))// Math.random()*360))// blob.canonOrientation))
  }
}

function moveBullet(){
  for(i=0; i<jeu.listBullet.length; i++){
    let bullet = jeu.listBullet[i]
    let plusX = Math.cos(bullet.orientation*Math.PI/180) * bullet.speed
    let plusY = Math.sin(bullet.orientation*Math.PI/180) * bullet.speed
    bullet.x += plusX
    bullet.y += plusY
  }
}

function collisions(){
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
/////////////////////
// ACTION DES BOUTONS
/////////////////////

// function start(){
//   jeu.on = !jeu.on
//
//   if(jeu.on){
//     document.getElementById("on").innerHTML = "Pause"
//   }
//   else{
//     document.getElementById("on").innerHTML = "Start"
//   }
// }


/////////////////////////////
// CREATION DE MAP + DESSINER
/////////////////////////////
var canonOrientation = 0
document.onmousemove = function(e){ // Utiliser les bords pour bouger
  // if(mouseDown == true){
  //   jeu.translateX -= e.movementX
  //   jeu.translateY -= e.movementY
  // }

  let a = (e.x-width/2)
  let b = (e.y-height/2)

  canonOrientation = Math.atan2(b,a)*180/Math.PI
}

document.onwheel = function(e){ // !! pas trop dezoomer pour pas sortir du cadre
  if(e.deltaY<0){ // zoom
		ctx.scale(1.1, 1.1)
	}
	else{ // dezoom
    ctx.scale(0.9, 0.9)
	}
}

document.onclick = function(e){
  tirBlob()
}

var mouseDown = false
document.onmousedown = function(e){
  mouseDown = true
}
document.onmouseup = function(e){
  mouseDown = false
}

var haut, bas, droite, gauche;
var vitesseX = 0;
var vitesseY = 0;
document.onkeydown = function pression(e){
	if(e.keyCode == 90){ haut 	= 	true; }
	if(e.keyCode == 68){ droite = 	true; }
	if(e.keyCode == 83){ bas 	= 	true; }
	if(e.keyCode == 81){ gauche = 	true; }
}
document.onkeyup = function relache(e){
	if(e.keyCode == 90){ haut 	= 	false; }
	if(e.keyCode == 68){ droite = 	false; }
	if(e.keyCode == 83){ bas 	=	false; }
	if(e.keyCode == 81){ gauche = 	false; }
}

function vitesse(){
	if(haut 	== true )	{ jeu.translateY+=15;
                        jeu.listBlob[0].y-=15 }
	if(droite == true )	{ jeu.translateX-=15;
                        jeu.listBlob[0].x+=15}
	if(bas 		== true )	{ jeu.translateY-=15;
                        jeu.listBlob[0].y+=15}
	if(gauche == true )	{ jeu.translateX+=15;
                        jeu.listBlob[0].x-=15}

  if(jeu.listBlob[0].x > jeu.sizeX) {jeu.listBlob[0].x = jeu.sizeX; jeu.translateX = -(jeu.sizeX - width/2) }
  if(jeu.listBlob[0].x < 0        ) {jeu.listBlob[0].x = 0        ; jeu.translateX =  width/2               }
  if(jeu.listBlob[0].y > jeu.sizeY) {jeu.listBlob[0].y = jeu.sizeX; jeu.translateY = -(jeu.sizeY - height/2)}
  if(jeu.listBlob[0].y < 0        ) {jeu.listBlob[0].y = 0        ; jeu.translateY =  height/2              }
}

function dessin(){
  //ctx.translate(-jeu.translateX, -jeu.translateY)
  ctx.clearRect(0, 0, width, height) // clear map

  ctx.strokeStyle = "#000000"
  // Lignes horizontales
  if(jeu.translateY>0){ // Gestion < et > 0
    for(i=0; i<height/100; i++){
      ctx.beginPath();
      ctx.moveTo(0, i*100 + Math.abs(jeu.translateY%100));
      ctx.lineTo(width, i*100 + Math.abs(jeu.translateY%100));
      ctx.stroke();
    }
  }
  else{
    for(i=0; i<height/100; i++){
      ctx.beginPath();
      ctx.moveTo(0, i*100 + Math.abs(-100-jeu.translateY%100));
      ctx.lineTo(width, i*100 + Math.abs(-100-jeu.translateY%100));
      ctx.stroke();
    }
  }

  // Lignes verticales
  ctx.strokeStyle = "#ff0000"
  if(jeu.translateX>0){
    for(i=0; i<width/100; i++){
      ctx.beginPath();
      ctx.moveTo(i*100 + Math.abs(jeu.translateX%100), 0);
      ctx.lineTo(i*100 + Math.abs(jeu.translateX%100), height);
      ctx.stroke();
    }
  }
  else{
    for(i=0; i<width/100; i++){
      ctx.beginPath();
      ctx.moveTo(i*100 + Math.abs(-100-jeu.translateX%100), 0);
      ctx.lineTo(i*100 + Math.abs(-100-jeu.translateX%100), height);
      ctx.stroke();
    }
  }

  for(i=0; i<jeu.listBlob.length; i++){
    let blob = jeu.listBlob[i]
    ctx.beginPath()
    ctx.fillStyle = blob.color
    ctx.arc(blob.x+jeu.translateX, blob.y+jeu.translateY, blob.size, 0, 2*Math.PI)
    ctx.fill()
  }
jeu.listBlob[1].x += 0.5
jeu.listBlob[1].y += 0.8
  ctx.fillStyle = "#000000"
  for(i=0; i<jeu.listBullet.length; i++){
    let bullet = jeu.listBullet[i]
    ctx.beginPath()

    ctx.arc(bullet.x+jeu.translateX, bullet.y+jeu.translateY, bullet.size, 0, 2*Math.PI)
    ctx.fill()
  }
  //ctx.translate(jeu.translateX, jeu.translateY)
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
