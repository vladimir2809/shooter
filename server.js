// Зависимости
const { randomInt } = require('crypto');
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
//var func= require('function');
var server = http.Server(app);
var io = socketIO(server);
var countId = 0;
var pi = 3.1415926;
var screenWidth = 800;
var screenHeight = 600;
var mapSize=40;
var radius = 10;
console.log(__dirname);
app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
//app.use(express.static('static'))
// Маршруты
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
   // response.sendFile(path.join(__dirname, '/static/'));
});
var Bullets = function () {
    this.bullet = {
        being:false,
        x:null,
        y:null,
        angle:null,
        DMG:null,
    }
    this.speed = 10;
    this.bulletArr = [];
    this.shot=function(x,y,angle,DMG)
    {
        let bullet = clone(this.bullet);
        bullet.being = true;
        bullet.x = x;
        bullet.y = y;
        bullet.angle = angle;
        bullet.DMG = DMG;
        this.bulletArr.push(bullet);
    }
    this.update=function()
    {
        for (let i = 0; i < this.bulletArr.length;i++)
        {
            if (this.bulletArr[i].being==true)
            {
                let dx = 0;
                let dy = 0;
                dy = this.speed * Math.sin(pi*(this.bulletArr[i].angle - 90) / 180) ;
                dx = this.speed * Math.cos(pi * (this.bulletArr[i].angle - 90) / 180) ;
                this.bulletArr[i].x += dx;
                this.bulletArr[i].y += dy;
            }
        }
    }
    this.kill =function(num)
    {
        if (this.bulletArr[num].being==true)
        {
            this.bulletArr[num].being = false;
        }
    }
    this.collisionWalls=function(walls)
    {
        for (let i = 0; i < walls.length;i++)
        {

            let wall = walls[i];
            for (let j = 0; j < this.bulletArr.length;j++)
            {
                bullet = this.bulletArr[j];
                if (bullet.being==true)
                if (bullet.x>wall.x && bullet.x<wall.x+wall.width &&
                    bullet.y>wall.y && bullet.y<wall.y+wall.height)
                {
                    this.kill(j);
                    io.sockets.emit('newBurst',{x:bullet.x,y:bullet.y});
                }
            }
        }
        for (let i = 0; i < this.bulletArr.length;i++)
        {
            bullet = this.bulletArr[i];
            if (bullet.x>screenWidth || bullet.y>screenHeight ||  bullet.x<0 || bullet.y<0   )
            {
                this.kill(i);
            }
        }
    }

}
var Walls=function()
{
    this.quantity = 40;
    this.wallArr = [];
    this.size = mapSize;
    this.wall = {
        being: false,
        x:null,
        y:null,
        width: null,
        height:null,
    }
    this.init= function()
    {
        for (let i = 0;i< this.quantity;i++)
        {
            let wall = clone(this.wall);
            wall.width = this.size;
            wall.height = this.size;
            wall.x = randomInteger(0, Math.trunc(screenWidth / this.size)) * this.size;
            wall.y = randomInteger(0, Math.trunc(screenHeight / this.size)) * this.size;
            wall.being = true;
            this.wallArr.push(wall);
        }
    }
}
var bullets = new Bullets();
var walls = new Walls();;


// Запуск сервера
server.listen(5000, function() {
    console.log('Запускаю сервер на порте 5000');
    walls.init();
});
// Обработчик веб-сокетов
io.on('connection', function(socket) {
    socket.on('disconnect', function() {
        // удаляем отключившегося игрока
        delete players[socket.id];
  });
});
setInterval(function () {
    io.sockets.emit('message', 'hi!');
}, 1000);
var players = {};
io.on('connection', function(socket) {
    socket.on('new player', function() {
        let color="rgb("+randomInteger(0,255)+","+randomInteger(0,255)+","+randomInteger(0,255)+")";
        console.log(color);
        players[socket.id] = {
        id: countId,
        maxHP:100,
        HP:100,
        x: 300,
        y: 300,
        x1:0,
        y1:0,
        color: color,
        angle: 0,
    };
    let coordXY = calcNewCoordinates();
    players[socket.id].x = coordXY.x;
    players[socket.id].y = coordXY.y;
    io.to(socket.id).emit('getId', countId);
    io.to(socket.id).emit('walls', walls.wallArr);
    countId++;
    });

    socket.on('movement', function(data) {
        var player = players[socket.id] || {};
        let dx = 0;
        let dy = 0;
        if (data.left) {
          dx -= 5;
        }
        if (data.up) {
          dy -= 5;
        }
        if (data.right) {
          dx += 5;
        }
        if (data.down) {
          dy += 5;
        }
        player.x += dx;
        player.y += dy;
        if (collisionPlayerWalls(player)==true)
        {
            player.x -= dx;
            player.y -= dy;
        }
        player.angle = data.angle;
  }); 
  socket.on('shot', function (data) {
      var accuracy = 5;
      bullets.shot(data.x,data.y,data.angle+accuracy-randomInteger(0,accuracy*2),20);
      console.log('shot');
  });

});
function calcNewCoordinates()
{
    let x = 0;
    let y = 0;
    let flag = false;
    do {
        flag = false;
        x = randomInteger(0, Math.trunc(screenWidth / mapSize)-1) * mapSize + mapSize / 2;
        y = randomInteger(0, Math.trunc(screenHeight / mapSize)-1) * mapSize + mapSize / 2;
        for (let i = 0; i<walls.wallArr.length;i++)
        {

            wall = walls.wallArr[i];
            if (x+radius>wall.x && x-radius<wall.x+wall.width &&
                y+radius>wall.y && y-radius<wall.y+wall.height)
            {
                flag = true;
            }
        }
    } while (flag==true);
    return { x: x, y: y };
}
function collisionPlayerBullets(player)
{
    for (var attr in players)
    {
        let player = players[attr];
        for (let i = 0; i < bullets.bulletArr.length;i++)
        {
            bullet = bullets.bulletArr[i];
            if (bullet.being==true)
            if (calcDist(player.x,player.y,bullet.x,bullet.y)<radius+2)
            {
                players[attr].HP -= bullet.DMG;
                if (players[attr].HP<=0)
                {
                    let coordXY = calcNewCoordinates();
                    players[attr].x = coordXY.x;
                    players[attr].y = coordXY.y;
                    players[attr].HP = players[attr].maxHP;
                }
                bullets.kill(i);
                io.sockets.emit('newBurst',{x:bullet.x,y:bullet.y});

            }
        }
    }
}
function collisionPlayerWalls(player)
{
    for (let i = 0; i < walls.wallArr.length;i++)
    {

        let wall = walls.wallArr[i];
        if (player.x+radius>wall.x && player.x-radius<wall.x+wall.width &&
            player.y+radius>wall.y && player.y-radius<wall.y+wall.height)
        {
            return true;
        }
    }
    if (player.x+radius>screenWidth || player.y+radius>screenHeight ||
        player.x-radius<0 || player.y-radius<0   )
    {
        return true;
    }
    return false;
}

setInterval(function() {
    bullets.update();
    bullets.collisionWalls(walls.wallArr);
    collisionPlayerBullets();
    io.sockets.emit('stateBullets', bullets.bulletArr);

}, 1000 / 60);
setInterval(function() {
  io.sockets.emit('statePlayers', players);
}, 1000 / 60);


//функция получения случайного числа от мин да макс
function randomInteger(min, max) {
  // получить случайное число от (min-0.5) до (max+0.5)
  let rand = min - 0.5 +/* Math.random()*/MyRandom() * (max - min + 1);
  return Math.round(rand);
}
var XR =15100;
function MyRandom()// моя функция генерации псевдо случайных чисел
{
    let a = 1664525;
    let c = 1013904223;
    let m = Math.pow(2, 32);
    XR=(a*XR+c) % m;
    return XR *(1/ Math.pow(2, 32));
}
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}
function calcDist(x,y,x1,y1)// посчитать дистанцию между 2 точками
{
    let dx=x-x1;
    let dy=y-y1;
    return Math.sqrt(dx*dx+dy*dy);
}