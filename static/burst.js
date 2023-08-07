function Burst()
{
    this.being = false;
    this.oldBeing = false;
    this.nameImage = 'Explosion';
    this.image = null;
    this.spriteWidth = 64;
    this.spriteHeight = 64;
    this.x = 0;
    this.y = 0;
    this.countValue = 0;
    this.countMult = 1;
    this.scale =1;
    this.count = 0;
    this.maxCount = 9*this.countMult;
    this.sprite = {
        x:0,
        y:0,
        width:0,
        height:0,
    }
    this.spriteArr = [];
    this.init=function()
    {
        this.image=new Image();
        this.image.src="/static/img/"+this.nameImage+".png"; 
        let dx = 0;
        let dy = 0;
        for (let i = 0; i < 10;i++)
        {
            let spriteOne = clone(this.sprite);
            dx = this.spriteWidth * (i % 4);
            dy = this.spriteHeight * Math.trunc(i / 4); 
            spriteOne.x = dx;
            spriteOne.y = dy;
            spriteOne.width= this.spriteWidth;
            spriteOne.height= this.spriteHeight;
            this.spriteArr.push(spriteOne);
        }
        //console.log(this.spriteArr);
    }
    this.start = function (xCentr,yCentr)
    {
        this.x = xCentr - (this.spriteWidth+4) * this.scale / 2;
        this.y = yCentr - this.spriteHeight * this.scale / 2;
        this.being = this.oldBeing = true;
    }
    this.draw=function(context)
    {
        let scale = this.scale;
        if (this.being==true)
        {
            context.drawImage(this.image,
                this.spriteArr[this.count].x, this.spriteArr[this.count].y,
                this.spriteArr[this.count].width, this.spriteArr[this.count].height,
                this.x, this.y, this.spriteWidth * scale, this.spriteHeight * scale);
        }
    }
    this.end=function(callback)
    {
        if (this.being == false && this.oldBeing == true) 
        {
            this.oldBeing = false;
            callback();
        }
    }
    this.update=function()
    {
        if (this.countValue <= this.maxCount-1) 
        {
            this.countValue++;
            this.count=Math.trunc(this.countValue/this.countMult);
        }
        else
        {
            this.countValue = 0;
            this.count = 0;
            this.being = false;
        }
       
    }

}