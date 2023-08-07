var XR=1;    
var pi=3.1415926;
var sinArr=[];
var accuracyArr=[];
colorsForGate=["rgb(255,0,0)","rgb(0,0,255)","rgb(255,153,51)",
               "rgb(255,0,255)","rgb(0,255,255)","rgb(255,255,0)",
               "rgb(128,255,0)","rgb(255,255,255)",
];
// функция клонирования обьектов
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}
function deleteElemArr(array,elem)// удалить обьект из массива по значению
{
    var index = array.indexOf(elem);
    if (index > -1) 
    {
      array.splice(index, 1);
    }
}
function deleteElemArrToNum(array,num)// удалить обьект из массива по номеру
{
    var index = num;
    if (index > -1) 
    {
      array.splice(index, 1);
    }
}
function checkElemArr(array,elem)// прверить есть ли элемент в массиве
{
    var index = array.indexOf(elem);
    if (index > -1) 
    {
     return true;
    }
    return false;
}
function checkInObj(obj,x,y)
{
    if (x>obj.x && x<obj.x+obj.width &&
            y>obj.y && y<obj.y+obj.height )
    {
        return true;
    }
    return false;
}
function mixingShot(mix)// функция которая генерирует случайные числа с дисперсией mix
{
    if (mix>=100) return 0;
    mix*=0.9;
    mix=100-mix;
    let mult=1000;
    let range=45;//43.25;
    mix=range/100*mix;
    //console.log((-mult*mix/2+randomInteger(0,mix*mult))/mult);
    //console.log((-mult*mix/2+randomInteger(0,mix*mult))/mult);
    
    return (-mult*mix/2+randomInteger(0,mix*mult))/mult;
}
function calcDist(x,y,x1,y1)// посчитать дистанцию между 2 точками
{
    let dx=x-x1;
    let dy=y-y1;
    return Math.sqrt(dx*dx+dy*dy);
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
// функция расчета угла между 2 точками
function angleIm(x1,y1, x2,y2){
  res=Math.atan2(y1-y2,x1-x2)*(180/3.14)-90;
  if (res >= 180) res -= 360;
  if (res <= -180) res += 360;
  return res;
}
function degressToRadian(deg)// перевод градусов в радианы
{
    return pi*deg / 180;
}
function mySinInit(accuracy=1)
{
    accuracy=Math.trunc(accuracy);
    if (sinArr.length==0)
    {
        sinArr.push( {rad:0,value: 0} );
    
        for (let i=0;i<360*accuracy;i++)
        {
            sinArr.push( {rad:degressToRadian (i/accuracy),value: Math.sin ( degressToRadian(i/accuracy) ) } );
           // console.log(sinArr[i]);
        }
        sinArr.push( {rad:pi*2,value: 1} );
    }
}
function myBinSearch(value,arrKeyValue,nameKey,nameValue)
{
    let res=Math.abs(value);
    
    //let mix=index;
//    let mult=1000;
//    let multPi=Math.trunc(pi*mult);
//    let multValue=Math.trunc(value*mult);
//    res=(multValue%(multPi*2))/mult; 
    if (arrKeyValue.length!=0)
    {
        let flag=false;
        let count=0; 
        let min= 0;
        let index=Math.trunc(arrKeyValue.length/2)-1;
        let max=arrKeyValue.length-1;
        while (count<8)
        {
            count++;
         
            if (res>arrKeyValue[min][nameKey] && res<arrKeyValue[index][nameKey])
            {
               max=index;
               index=index-Math.trunc((max-min)/2);
              //  console.log(index+" "+res+" "+mix+" SMALL");
            }
            else if (res>arrKeyValue[index][nameKey] && res<arrKeyValue[max][nameKey])
            {
                min=index;
                index=index+Math.trunc((max-min)/2);
               // console.log(index+" "+res+" "+mix+" BIG");

            }
           // console.log(index+" min "+min+' max '+max+' '+arrKeyValue[index].rad+" "+res/*+" "+arrKeyValue[index]*/)
        }
        return value>=0?arrKeyValue[index][nameValue]:-arrKeyValue[index][nameValue];
    }
}
//функция получения случайного числа от мин да макс
function randomInteger(min, max) {
  // получить случайное число от (min-0.5) до (max+0.5)
  let rand = min - 0.5 +/* Math.random()*/MyRandom() * (max - min + 1);
  return Math.round(rand);
}
function MyRandom()// моя функция генерации псевдо случайных чисел
{
    let a = 1664525;
    let c = 1013904223;
    let m = Math.pow(2, 32);
    XR=(a*XR+c) % m;
    return XR *(1/ Math.pow(2, 32));
}
function srand(value)// установить базу для генерации случайных чисел
{
    XR=Math.trunc(value);
}
 function memorySizeOf( object,format=false ) // посчитать сколько памяти занимает обьект
 {

    var objectList = [];
    var stack = [ object ];
    var bytes = 0;

    while ( stack.length ) {
        var value = stack.pop();

        if ( typeof value === 'boolean' ) {
            bytes += 4;
        }
        else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes += 8;
        }
        else if
        (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        )
        {
            objectList.push( value );

            for( var i in value ) {
                stack.push( value[ i ] );
            }
        }
    }
    return format==false?bytes:formatByteSize(bytes);
}
function formatByteSize(bytes) // перевод значения памяти в человека понятный вид
{
    if(bytes < 1024) return bytes + " bytes";
    else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KiB";
    else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MiB";
    else return(bytes / 1073741824).toFixed(3) + " GiB";
};
function downloadAsFile(data,nameFile='example') 
{
      let a = document.createElement("a");
      let file = new Blob([data], {type: 'application/json'});
      a.href = URL.createObjectURL(file);
      a.download = nameFile+".txt";
      a.click();
}
//function downloadAsFile(data) 
//{
//      let a = document.createElement("a");
//      let file = new Blob([data], {type: 'application/json'});
//      a.href = URL.createObjectURL(file);
//      a.download = "example.txt";
//      a.click();
//    }
function getDataGoogleSheets()
{
    jQuery(document).ready(function() {


        $.getJSON(
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vRR-7IEcj5J9Cpg5PunkAnOrhOOMuHTgF9zN8C-UxCJsJF54Gsp0yJ8TP2hfREgtxO_RrrdsbXfbVoU/pubhtml",
        function(data)        {
            console.log(data);
        });
  });
}