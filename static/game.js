var pi = 3.1415926;
var socket = io();
var mouseLeftPress=false;
socket.on('message', function(data) {
    console.log(data);
});
var movement = {
  id:null,
  up: false,
  down: false,
  left: false,
  right: false,
  x:0,
  y:0,
  x1:0,
  y1:0,
  angle:0,
}
Bullets = function () {
    this.bullet = {
        being:false,
        x:null,
        y:null,
        angle:null,
        DMG:null,
    }
    this.speed = 20;
    this.bulletArr = [];
    this.drawBullets=function(context)
    {
        for (let i = 0; i < this.bulletArr.length;i++)
        {
            if (this.bulletArr[i].being==true)
            {
                context.beginPath();
                context.fillStyle = "#FFFF00";
	            context.arc(this.bulletArr[i].x-2,this.bulletArr[i].y-2, 2, 2*Math.PI, false);
	            context.fill();
	            context.lineWidth = 1;
	            context.strokeStyle = 'red';
	            context.stroke();
            }
        }
    }
}
var imageArr = new Map();
var imageLoad = false;
var nameImageArr = ['Explosion'];
var countLoadImage = 0;
var radius = 10;
function loadImageArr()// загрузить массив изображений
{
    // заполняем массив изображений именами
    for (let value of nameImageArr  )
    {
        let image=new Image();
        image.src="/static/img/"+value+".png";       
        imageArr.set(value,image);
    }
    // проверяем загружены ли все изображения
    for (let pair of imageArr  )
    {
             imageArr.get(pair[0]).onload = function() {
                   countLoadImage++;
                   //console.log(imageArr);
                   console.log(countLoadImage);
                   if (countLoadImage==imageArr.size) 
                   {
                       imageLoad=true;
                    //  console.log(imageArr);
                   } // если загруженны все ищображения
             }
             imageArr.get(pair[0]).onerror = function() {   
                   alert("во время загрузки произошла ошибка");
                   //alert(pair[0].name);
                   
             }
     }  
   // console.log(imageArr);
}
var bullets = new Bullets();
document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = true;
      break;
    case 87: // W
      movement.up = true;
      break;
    case 68: // D
      movement.right = true;
      break;
    case 83: // S
      movement.down = true;
      break;
  }
});
document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = false;
      break;
    case 87: // W
      movement.up = false;
      break;
    case 68: // D
      movement.right = false;
      break;
    case 83: // S
      movement.down = false;
      break;
  }
});
var players = [];
var wallArr = [];
var burstArr = [];
for (let i = 0; i < 20;i++)
{
    let burst = new Burst();
    burst.init();
    burstArr.push(burst);
}
var countShot = 0;
function drawAll() 
{
    context.clearRect(0, 0, 800, 600);
    for (var id in players) 
    {
        var player = players[id];
    
        context.beginPath();
        context.strokeStyle ="#000000"
        context.moveTo(player.x,player.y); //передвигаем перо
        context.lineTo(player.x1, player.y1); //рисуем линию
        context.stroke();

        context.beginPath();
        context.fillStyle = player.color;
        context.arc(player.x, player.y, radius, 0, 2 * Math.PI);
        context.fill();
        context.stroke();
    }
    bullets.drawBullets(context);
    for (let i = 0; i < wallArr.length;i++)
    {
        context.fillStyle = "#AAAAAA";
        context.fillRect(wallArr[i].x,wallArr[i].y,wallArr[i].width,wallArr[i].height);
    }
    for (let i = 0; i < burstArr.length;i++)
    {
        burstArr[i].draw(context);
    }
    for (var id in players) 
    {
        var player = players[id];
        if (player.HP>0)
        {
            context.fillStyle= 'red';
            context.fillRect(player.x-radius, player.y-radius - 7, radius*2,4);
            context.fillStyle= 'green';
            context.fillRect(player.x-radius, player.y-radius - 7, radius*2*player.HP/player.maxHP,4);
        }
    }
}
setInterval(drawAll, 16);

document.addEventListener('mousemove', function (event) {
    movement.angle = angleIm(movement.x, movement.y, event.x, event.y);
    //console.log(movement.x+' '+ movement.y+' '+ event.x+' '+ event.y);
});
//function angleIm(x1,y1, x2,y2)
//{
//}
socket.emit('new player');
setInterval(function() {
    if (mouseLeftPress==true)
    {
        countShot++;
        if (countShot>5)
        {
            socket.emit('shot',{x:movement.x1,y:movement.y1,angle:movement.angle});
            countShot = 0;
        }
    }
    //burstArr[0].start(300,300);
    if (burstArr[0].being==true)   burstArr[0].update();
  socket.emit('movement', movement);
}, 1000 / 60);
var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');
let y1 = null;
let x1 = null;
socket.on('statePlayers', function(data) {
    //context.clearRect(0, 0, 800, 600);
    //context.fillStyle = 'green';
    for (var id in data) 
    {
        var player = data[id];
        if (movement.id==player.id)
        {
            movement.x = player.x;
            movement.y = player.y;  
            movement.y1 = 25 * Math.sin(pi * (player.angle - 90) / 180) + player.y;
            movement.x1 = 25 * Math.cos(pi * (player.angle - 90) / 180) + player.x;
        }
        data[id].y1 = 25 * Math.sin(pi * (player.angle - 90) / 180) + player.y;
        data[id].x1 = 25 * Math.cos(pi * (player.angle - 90) / 180) + player.x;

        //context.beginPath();
        //context.strokeStyle ="#000000"
        //context.moveTo(player.x,player.y); //передвигаем перо
        //context.lineTo(x1, y1); //рисуем линию
        //context.stroke();

        //context.beginPath();
        //context.fillStyle = player.color;
        //context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
        //context.fill();
        //context.stroke();
//        context.closePath();
      
    }
    players = data;
});
socket.on('newBurst', function (data) {
    burstArr[0].start(data.x,data.y);
});
socket.on('stateBullets', function (data) {
   // console.log(data);
    bullets.bulletArr = data;
   
});
socket.on('getId', function (value) {
    movement.id = value;
    loadImageArr();
});
socket.on('walls', function (data) {
    wallArr = data;
    console.log(wallArr)
})
window.addEventListener('mousedown', function () {
    if (event.which==1) mouseLeftPress=true;
});
window.addEventListener('mouseup', function () {
    if (event.which==1)
    {
        mouseLeftPress=false;
        //mouseClick=true;
        //setTimeout(function () {
        //    if (mouseClick == true) mouseClick = false;
        //}, 100);
    } 
});
//// функция расчета угла между 2 точками
//function angleIm(x1,y1, x2,y2){
//  res=Math.atan2(y1-y2,x1-x2)*(180/3.14)-90;
//  if (res >= 180) res -= 360;
//  if (res <= -180) res += 360;
//  return res;
//}