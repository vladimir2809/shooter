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
var quantityBot = 10;
var quantityWall = 100;
var pi = 3.1415926;
var screenWidth = 1800;
var screenHeight = 1600;
var mapSize=40;
var radius = 10;
var distAttack = 300;
var timeIter = 0;
var line = { x:null, y:null, x1:null, y1:null, numP:null };// линия для вычесления пересечений
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
        dist: 0,
        DMG:null,
    }
    this.speed = 20;
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
                this.bulletArr[i].dist += Math.sqrt(dx * dx + dy * dy);
                if (this.bulletArr[i].dist > distAttack) this.kill(i);
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
    this.quantity = quantityWall;
    this.wallArr = [];
    this.size = mapSize;
    this.wall = {
        being: false,
        type: 0,
        x:null,
        y:null,
        width: null,
        height:null,
        lineArr:[],
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
            wall.lineArr = calcLineArr(wall);
           // console.log (wall.lineArr)
            this.wallArr.push(wall);
        }
    ///    console.log(this.wallArr[2].lineArr);
    }
}
var Player = function(type='Player'){
    this.id = countId;
    this.being = true;
    this.type = type;
    this.maxHP = 100;
    this.HP = 100;
    this.vector = null;
    this.x = 300;
    this.y = 300;
    this.x1 = 0;
    this.y1 = 0;
    this.color = '';
    this.delayAttack = 150;
    this.timeAttack = 0;
    this.accuracy = 5;
    this.angle = 0;
    this.takeAim = false;
    this.lineArr = [];
}
var bullets = new Bullets();
var walls = new Walls();;

// Запуск сервера
server.listen(5000, function() {
    console.log('Запускаю сервер на порте 5000');
    walls.init();
    playerBotInit(quantityBot);
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
        let color="rgb("+randomInteger(0,155)+","+randomInteger(0,255)+","+randomInteger(0,255)+")";
        console.log(color);
        player = new Player();
        player.id = countId;
        player.type = 'Player';
        player.maxHP = 100;
        player.HP = player.maxHP;
        player.x = 0;
        player.y = 0;
        player.x1 = 0;
        player.y1 = 0;
        player.color = color;
        player.angle = 0;
        player.accuracy = 2;
        player.delayAttack = 250;
        players[socket.id] = player;
        //players[socket.id] = {
        //    id: countId,
        //    maxHP:100,
        //    HP:100,
        //    x: 300,
        //    y: 300,
        //    x1:0,
        //    y1:0,
        //    color: color,
        //    angle: 0,
        //};
    let coordXY = calcNewCoordinates();
    players[socket.id].x = coordXY.x;
    players[socket.id].y = coordXY.y;
    io.to(socket.id).emit('getId', countId);
    io.to(socket.id).emit('walls', walls.wallArr);
    console.log(socket.id);
    countId++;
    });

    socket.on('movement', function(data) {
        var player = players[socket.id] || {};
        let dx = 0;
        let dy = 0;
        let speed = 3;
        if (data.left) {
          dx -= speed;
        }
        if (data.up) {
          dy -= speed;
        }
        if (data.right) {
          dx += speed;
        }
        if (data.down) {
            dy += speed;
        }
        player.x += dx;
        player.y += dy;
        if (collisionPlayerWalls(player)==true || collisionPlayerToPlayer(player)==true)
        {
            player.x -= dx;
            player.y -= dy;
        }
        player.angle = data.angle;
  }); 
  socket.on('shot', function (data) {
      for (var attr in players)
      {
          if (players[attr].id==data.id)
          {
             var accuracy = players[attr].accuracy;
             break;
          }
      }
     
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
        for (var attr in players)
        {
            //if (players[attr].id!=id)
            {
                if (calcDist(x,y,players[attr].x,players[attr].y)<radius*2)
                {
                    flag=true;
                }
            }
        }
    } while (flag==true);
    return { x: x, y: y };
}
function playerBotInit(quantity)
{
    quantityBot = quantity;
    for (let i = 0; i < quantity;i++)
    {
        player = new Player();
        player.id = countId;
        player.type = 'Bot';
        player.maxHP = 100;
        player.HP = player.maxHP;
        let coordXY = calcNewCoordinates();
        player.x = coordXY.x;
        player.y = coordXY.y;
        player.x1 = 0;
        player.y1 = 0;
        player.color = "red";
        player.angle = 0;
        players[countId] = player;
        countId++;
    }
}
function playerBotMoving()
{
    var time1 = new Date().getTime();
    for (var attr in players)
    {
        if (players[attr].type=='Bot')
        {
            if (players[attr].vector==null)
            {
                players[attr].vector = randomInteger(0, 3);
            }
            let dx = 0;
            let dy = 0;
            let ang = 0;
            if (players[attr].takeAim==false)
            {
                switch (players[attr].vector)
                {
                    case 0: dy--; ang = 0; break;
                    case 1: dx++; ang = 90;break;
                    case 2: dy++; ang = 180;break;
                    case 3: dx--; ang = 270;break;
                }
                players[attr].x += dx;
                players[attr].y += dy;
                players[attr].angle = ang;
            
                if (collisionPlayerWalls(players[attr])==true || collisionPlayerToPlayer(players[attr])==true)
                {
                    players[attr].vector = null;
                    players[attr].x -= dx;
                    players[attr].y -= dy;
                }
            }
          //  players[attr].angle = 0;
            //console.log('STEPBOT: '+players[attr].id);
            let attackId = null;
            let minHP = 1000000;
            for (var attr2 in players)
            {        
                //var accuracy = 5;
               // bullets.shot(players[attr].x1,players[attr].y1,
             //               players[attr].angle+accuracy-randomInteger(0,accuracy*2),20);
                if (players[attr].type=='Bot' && players[attr2].type=='Player')
                {       
                    if (crossingTwoPoint(players[attr].x,players[attr].y,
                        players[attr2].x,players[attr2].y)==false &&
                        crossLinePlayer(players[attr],players[attr2])==false)

                        
                    {
                        let dist = calcDist(players[attr].x,players[attr].y,
                                            players[attr2].x,players[attr2].y);
                        if (minHP>players[attr2].HP && dist<distAttack)
                        {
                            attackId = attr2;
                            minHP = players[attr2].HP;
                        }
                        
                    }
                }
            }
            if (attackId==null) players[attr].takeAim = false;
            if (attackId!=null)
            {
                players[attr].takeAim = true;
                let angle = angleIm(players[attr].x,players[attr].y,
                            players[attackId].x,players[attackId].y);
                players[attr].angle = movingToAngle(players[attr].angle,angle, 50);
                //players[attr].y1 =  20* Math.sin(pi*(players[attr].angle - 90) / 180)+players[attr].y ;
                //players[attr].x1 =  20 * Math.cos(pi * (players[attr].angle - 90) / 180)+players[attr].x ;
                if (Math.abs(players[attr].angle-angle)<1)
                {
                    players[attr].timeAttack += timeIter;
                    if (players[attr].delayAttack < players[attr].timeAttack)
                    {

                        players[attr].timeAttack = 0;
                        var accuracy = 5;
                        bullets.shot(players[attr].x1,players[attr].y1,
                                    players[attr].angle+accuracy-randomInteger(0,accuracy*2),0);
                       // console.log('SHOTBOT: '+players[attackId].id);
                    }
                }       
            }
            
               
            players[attr].y1 =  25* Math.sin(pi*(players[attr].angle - 90) / 180)+players[attr].y ;
            players[attr].x1 =  25 * Math.cos(pi * (players[attr].angle - 90) / 180)+players[attr].x ;
          //  if (crossingTwoPoint(x1,y1,x2,y2))
        }

        
    }
   
    //console.log(timeIter);
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
function collisionPlayerToPlayer(player)
{
    let id = player.id;
    for (var attr in players)
    {
        if (players[attr].id!=id)
        {
            if (calcDist(player.x,player.y,players[attr].x,players[attr].y)<radius*2)
            {
                return true;
            }
        }
    }
    return false;
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
var timeOld = 0;
setInterval(function() {
    
    var timeNow = new Date().getTime();
    timeIter = timeNow - timeOld;
    timeOld = new Date().getTime();
    bullets.update();
    bullets.collisionWalls(walls.wallArr);
    collisionPlayerBullets();
    for (var attr in players)
    {
        players[attr].lineArr = calcLineArr(players[attr], 'Player', players[attr].id);
    }
    playerBotMoving();
  //  bullets.shot(10,10,0,20);
    io.sockets.emit('stateBullets', bullets.bulletArr);
    io.sockets.emit('statePlayers', players);
    //timeOld = new Date().getTime();
}, 1000 / 60);
//setInterval(function() {
  
//}, 1000 / 60);


//функция получения случайного числа от мин да макс
function randomInteger(min, max) {
  // получить случайное число от (min-0.5) до (max+0.5)
  let rand = min - 0.5 +/* Math.random()*/MyRandom() * (max - min + 1);
  return Math.round(rand);
}
var XR =15152;
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
function angleIm(x1,y1, x2,y2){
    res=Math.atan2(y1-y2,x1-x2)*(180/3.14)-90;
    if (res >= 180) res -= 360;
    if (res <= -180) res += 360;
    return res;
}
function movingToAngle(angle,  angle1, speedRotation=1)// функция плавного изменеия угла (нужна для того что бы прицел был плавным) 
{
	let vector = 0;
        //speedRotation=100;
        //angle1+=90;
	//if (vector==0)
       // angle=+90;
	{
		if (Math.abs(angle1 - angle) >= 180)
		{
			if (angle1 >= angle) vector = 2;
			if (angle1 < angle) vector = 1;
		}
		else
		{
			if (angle1 >= angle) vector = 1;
			if (angle1 < angle) vector = 2;
		}
	}
        //angle=-90;
	if (angle > 180) angle -= 360;
	if (angle < -180) angle += 360;
	//double speedRotation = 1;
        mult=0.1;
        if (Math.abs(angle1 - angle) >= 40) speedRotation *= mult;
        else if (Math.abs(angle1 - angle) >= 20) speedRotation *= mult/2;
        else if (Math.abs(angle1 - angle) >= 10) speedRotation *= mult/4;
         else if (Math.abs(angle1 - angle) >= 5 && Math.abs(angle1 - angle) <= 10) speedRotation *= mult/8;
        else if (Math.abs(angle1 - angle) <= 5) speedRotation *= mult/16;

        
        //angle=-90;
       // console.log ("A0: "+angle+" A1 "+Math.trunc(angle1));
	if (angle <= angle1 + speedRotation && angle >= angle1 - speedRotation) { vector = 0; return angle; };
	if (vector == 1) return angle + speedRotation;
	// unit[n].f++;
	if (vector == 2) return angle - speedRotation;
        
	//unit[n].f--;


}
function crossLinePlayer(P1,P2)
{
    for (var attr in players)
    {
        for (let j = 0; j < players[attr].lineArr.length;j++)
        {
            if (players[attr].being==true)
            {
                let line = players[attr].lineArr[j];
                //let panz1 = panzerArr[numPanz1];
                //let panz2 = panzerArr[numPanz2];
                if (line.numP!=P1.id && line.numP!=P2.id)
                {
                    if (IsCrossing(P1.x,P1.y,P2.x, P2.y,line.x,line.y,line.x1,line.y1)==true)
                    {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}
function crossingTwoPoint(x1,y1,x2,y2)// проверяет могут ли 2 точки соединиться по прямой без препятсвий стен
{
    for (let i = 0; i < walls.wallArr.length;i++)
    {
        if (walls.wallArr[i].type==0)
        {
          //alert(55);
            for (let j = 0; j < walls.wallArr[i].lineArr.length;j++)
            {
            
                let line = walls.wallArr[i].lineArr[j];
                if (IsCrossing(x1, y1, x2, y2,line.x,line.y,line.x1,line.y1)==true)
                {
                    return true;
                }
            }

        }
    }
    return false;
}
function   IsCrossing( x1,  y1,  x2,  y2,  x3,  y3,  x4,  y4)// функция расчета пересечния двух прямых
{
    var a_dx = x2 - x1;
    var a_dy = y2 - y1;
    var b_dx = x4 - x3;
    var b_dy = y4 - y3;
    var s = (-a_dy * (x1 - x3) + a_dx * (y1 - y3)) / (-b_dx * a_dy + a_dx * b_dy);
    var t = (+b_dx * (y1 - y3) - b_dy * (x1 - x3)) / (-b_dx * a_dy + a_dx * b_dy);
    return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
}
function calcLineArr(objOrigin,type="wall",numP=null)// расчитать массив линий для обьекта
{
   let lineArr=[];
   let obj=JSON.parse(JSON.stringify(objOrigin))
   if (type=='Player')
   {
       obj.x = obj.x - radius ;//Math.trunc(obj.x / mapSize) * mapSize;
       obj.y = obj.y - radius ;//Math.trunc(obj.y / mapSize) * mapSize;
       obj.width = radius * 2;
       obj.height = radius * 2;
   }
   for (let j=0;j<4;j++)
    {
        lineArr[j]=JSON.parse(JSON.stringify(line));//clone(line);
            
        if (j==0) lineArr[j]={
            x:obj.x,
            y:obj.y,
            x1:obj.x+obj.width,
            y1:obj.y,
        }
        if (j==1) lineArr[j]={
            x:obj.x+obj.width,
            y:obj.y,
            x1:obj.x+obj.width,
            y1:obj.y+obj.height,
        }
        if (j==2) lineArr[j]={
            x:obj.x+obj.width,
            y:obj.y+obj.height,
            x1:obj.x,
            y1:obj.y+obj.height,
        }
        if (j==3) lineArr[j]={
            x:obj.x,
            y:obj.y+obj.height,
            x1:obj.x,
            y1:obj.y,
        }
       if (type!='wall') 
       {
           lineArr[j].numP = numP;
       }
        ////console.log(wallArr[i].lineArr[j].x);      
    }
    return lineArr;
}