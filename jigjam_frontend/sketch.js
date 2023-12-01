let offsetX = 0;
let offsetY = 0;
let dragging = false;
const canvasWidth = 1000;
const canvasHeight = 700;
const gridSize = 20;

let handMode = false //hand mode = draggable canvas

let currSelecting = false //currently selecting a graphic?

let showShapes = false //show shapes
let showStickies = false //show sticky note colors
let showStickers = false //show stickers

let shapeCols = [] //array for shape color
let stickyCols = [] //array for sticky note colors
let stickerImgs = [] //array for sticker images

let tabOffset2 = 0 //y offset to display secondary toolbar tab items

let currTxt = "" //current content of text being edited

let layers = [] //array for layers with graphics

function preload(){
  //load images into array
  for (let i=0; i<7; i++) {
    let filename = "stickers/food/" + nf(i) + ".png"
    stickerImgs.push(loadImage(filename))
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // buffer to pre-render the dot grid
  gridBuffer = createGraphics(width + gridSize, height + gridSize);
  drawGridBuffer();
  noStroke()
  strokeCap(ROUND)
  
  //add colors to sticky array & shape array
  stickyCols = [color(255, 115, 115),color(255, 178, 115),color(255, 241, 115),color(155, 255, 115),color(115, 236, 255),color(183, 151, 252)]
  shapeCols = [color(50),color(128),color(255, 46, 46),color(255, 126, 46),color(255, 210, 46),color(46, 255, 95),color(46, 182, 255),color(164, 46, 255),color(255, 46, 144)]
}

function draw() {
  background(255);
  
  // draw the visible portion of the grid from the buffer
  image(gridBuffer, offsetX % gridSize - gridSize, offsetY % gridSize - gridSize);
  
  //go over all layers and display
  for (let i=0;i<layers.length;i++){
    image(layers[i],offsetX % gridSize - gridSize, offsetY % gridSize - gridSize)
    
    let deleteThis = layers[i].content.display()
    
    //if user deletes the item, delete the layer
    if (deleteThis){
      layers.splice(i,1)
      currSelecting = false
    }
  }

  //go over all layers in reverse and call selecting and unselecting
  for(let i=layers.length-1; i>=0; i--){
    layers[i].content.unselecting()
    
    //if not selecting something & not dragging canvas, allow to select something else
    if(!currSelecting && !handMode){
      layers[i].content.selecting()
    }
  }
  
  fill("green")
  rect(0,0,50)
  
  //sticky note toolbar
  if(showStickies){
    fill("white")
    rect(50,0,60,(50*6)+(5*6)+5)
    
    tabOffset2 = 0
    
    //show sticky note colors, add a new sticky note on new layer once select color
    for(let i=0; i<6; i++){
      fill(stickyCols[i])
      rect(55,5+tabOffset2,50,50)
      
      if(mouseX>=55 && mouseX<=55+50 && mouseY>=5+tabOffset2 && mouseY<=5+tabOffset2+50 && mouseIsPressed && !currSelecting){
        mouseIsPressed = false
        
        temp = createGraphics(width + gridSize, height + gridSize)
        temp.content = new Sticky(stickyCols[i],width/2-50-offsetX,height/2-50-offsetY,100)
        temp.content.txtInput.style.position = "fixed"
        temp.content.txtInput.style.zIndex = String(i)
        console.log(temp.content.txtInput.style.zIndex)
        layers.push(temp)
      }
      
      tabOffset2 += 55
    }
  }
  
  fill("red")
  rect(0,50,50)
  
  //stickers toolbar
  if(showStickers){
    fill("white")
    rect(50,50,60,(50*6)+(5*6)+5)
    
    tabOffset2 = 0
    
    //show stickers, add new sticker when picked
    for(let i=0; i<stickerImgs.length; i++){
      image(stickerImgs[i],55,55+tabOffset2,50,50)
      
      if(mouseX>=55 && mouseX<=55+50 && mouseY>=55+tabOffset2 && mouseY<=55+tabOffset2+50 && mouseIsPressed && !currSelecting){
        mouseIsPressed = false
        
        temp = createGraphics(width + gridSize, height + gridSize)
        temp.content = new Sticker(i,width/2-50-offsetX,height/2-50-offsetY,100)
        layers.push(temp)
      }
      tabOffset2 += 55
    }
  }

  fill("yellow")
  rect(0,100,50)
      
  if(mouseX>=0 && mouseX<=50 && mouseY>=100 && mouseY<=150 && mouseIsPressed && !currSelecting){
    mouseIsPressed = false
    
    temp = createGraphics(width + gridSize, height + gridSize)
    temp.content = new TextBox(width/2-50-offsetX,height/2-50-offsetY,200,100)
    layers.push(temp)

    showStickies = false
    showStickers = false
    showShapes = false
    handMode = false
  }

  fill("orange")
  rect(0,150,50)

  //shapes toolbar
  if(showShapes){
    fill("white")
    rect(50,150,60,(50*4)+(5*4)+5)
    
    tabOffset2 = 0
    
    //show shapes, add new shape when picked
    for(let i=0; i<4; i++){

      push()
      noFill()
      strokeWeight(2)
      stroke(100)
      // rectMode(CENTER)
      // rect(80,180+tabOffset2,50)
      if(i==0){
        ellipse(80,180+tabOffset2,40)
      } else if(i==1){
        rectMode(CENTER)
        rect(80,180+tabOffset2,35)
      } else if(i==2){
        triangle(80,180+tabOffset2-20, 80+20,180+tabOffset2+15, 80-20,180+tabOffset2+15)
      } else if(i==3){
        push()
        translate(80,180+tabOffset2)
        rotate(radians(45))
        rectMode(CENTER)
        rect(0,0,32)
        pop()
      }
      pop()

      if(mouseX>=55 && mouseX<=55+50 && mouseY>=155+tabOffset2 && mouseY<=155+tabOffset2+50 && mouseIsPressed && !currSelecting){
        mouseIsPressed = false
        
        temp = createGraphics(width + gridSize, height + gridSize)
        temp.content = new Shape(i,round(random(0,shapeCols.length-1)),width/2-50-offsetX,height/2-50-offsetY,100)
        layers.push(temp)
      }

      tabOffset2 += 55
    }
  }

  fill("magenta")
  rect(0,200,50)

  if(mouseX>=0 && mouseX<=50 && mouseY>=200 && mouseY<=250 && mouseIsPressed && !currSelecting){
    mouseIsPressed = false
    
    temp = createGraphics(width + gridSize, height + gridSize)
    temp.content = new Line(round(random(0,shapeCols.length-1)),width/2-offsetX-50,height/2-offsetY-50,width/2-offsetX+50,height/2-offsetY+50)
    layers.push(temp)

    showStickies = false
    showStickers = false
    showShapes = false
    handMode = false
  }

  fill("blue")
  rect(0,height-100,50,50)
  fill("pink")
  rect(0,height-50,50,50)

  //show or hide shape options from toolbar
  if(mouseX>=0 && mouseX<=50 && mouseY>=150 && mouseY<=200 && mouseIsPressed && !currSelecting){
    mouseIsPressed = false
    if(showShapes){
      showShapes = false
    } else {
      showShapes = true
      showStickies = false
      showStickers = false
      handMode = false
    }
  }
  
  //show or hide sticky note options from toolbar
  if(mouseX>=0 && mouseX<=50 && mouseY>=0 && mouseY<=50 && mouseIsPressed && !currSelecting){
    mouseIsPressed = false
    if(showStickies){
      showStickies = false
    } else {
      showStickies = true
      showStickers = false
      showShapes = false
      handMode = false
    }
  }
  
  //show or hide sticker options from toolbar
  if(mouseX>=0 && mouseX<=50 && mouseY>=50 && mouseY<=100 && mouseIsPressed && !currSelecting){
    mouseIsPressed = false
    if(showStickers){
      showStickers = false
    } else {
      showStickers = true
      showStickies = false
      showShapes = false
      handMode = false
    }
  }
  
  //change to pointer mode
  if(mouseX>=0 && mouseX<=50 && mouseY>=height-100 && mouseY<=height-50 && mouseIsPressed){
    mouseIsPressed = false
    handMode = false
  }
  
  //change to hand mode
  if(mouseX>=0 && mouseX<=50 && mouseY>=height-50 && mouseY<=height && mouseIsPressed){
    mouseIsPressed = false
    handMode = true
    showStickies = false
    showStickers = false
  }
  
  //setting cursor
  if(handMode){
    if(dragging){
      cursor("grabbing")
    } else {
      cursor("grab")
    }
  } else {
    cursor(ARROW)
  }
}

//get text from text input
function changeText(){
  currTxt = event.currentTarget.value
}

//line class
class Line{
  constructor(col,x1,y1,x2,y2){
    this.col = shapeCols[col]
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
    this.wt = 2
    
    this.selected = true //start with it selecting
    currSelecting = true
    
    this.resizing1 = false
    this.resizing2 = false
    this.moving = false
    
    this.txtInput = createInput("") //text input
  }
  
  display(){
    //show line
    push()
    stroke(this.col)
    strokeWeight(this.wt)
    line(this.x1+offsetX,this.y1+offsetY,this.x2+offsetX,this.y2+offsetY)
    pop()

    //when selected
    if(this.selected){
      push() //selection box
      noFill()
      strokeWeight(4)
      stroke("purple")
      rectMode(RADIUS)
      rect(
        Math.min(this.x1,this.x2)+abs(this.x1-this.x2)/2+offsetX,
        Math.min(this.y1,this.y2)+abs(this.y1-this.y2)/2+offsetY,
        abs(this.x1-this.x2)/2 + 20,
        abs(this.y1-this.y2)/2 + 20
      )
      pop()
      
      push() //delete btn
      fill("red")
      ellipse(Math.max(this.x1,this.x2)+20+offsetX,Math.min(this.y1,this.y2)-20+offsetY,20)
      fill("white")
      rectMode(CENTER)
      rect(Math.max(this.x1,this.x2)+20+offsetX,Math.min(this.y1,this.y2)-20+offsetY,10,2)
      pop()

      push() //resize points
      fill("green")
      ellipse(this.x1+offsetX,this.y1+offsetY,15)
      ellipse(this.x2+offsetX,this.y2+offsetY,15)
      pop()

      let colorOff = 0 //offset to display colors

      push() //show color options, change color if picked
      for(let i=0; i<shapeCols.length; i++){
        fill(shapeCols[i])
        ellipse(Math.min(this.x1,this.x2)+offsetX-15+colorOff,Math.max(this.y1,this.y2)+offsetY+45,20)

        if(dist(mouseX,mouseY,Math.min(this.x1,this.x2)+offsetX-15+colorOff,Math.max(this.y1,this.y2)+offsetY+45) <= 10 && mouseIsPressed && !this.resizing1 && !this.resizing2 && !this.moving){
          this.col = shapeCols[i]
        }
        colorOff += 25
      }
      pop()

      push()
      fill(150) //decrease stroke wt btn
      ellipse(Math.min(this.x1,this.x2)+offsetX-15,Math.max(this.y1,this.y2)+offsetY+45+30,20)
      fill("white")
      rectMode(CENTER)
      rect(Math.min(this.x1,this.x2)+offsetX-15,Math.max(this.y1,this.y2)+offsetY+45+30,10,2)
      fill(150) //increase stroke wt btn
      ellipse(Math.min(this.x1,this.x2)+offsetX-15+25,Math.max(this.y1,this.y2)+offsetY+45+30,20)
      fill("white")
      rectMode(CENTER)
      rect(Math.min(this.x1,this.x2)+offsetX-15+25,Math.max(this.y1,this.y2)+offsetY+45+30,10,2)
      rect(Math.min(this.x1,this.x2)+offsetX-15+25,Math.max(this.y1,this.y2)+offsetY+45+30,2,10)
      pop()
      
      //start resizing pt 1
      if(dist(mouseX,mouseY,this.x1+offsetX,this.y1+offsetY) <= 7.5 && mouseIsPressed && !this.moving){
        this.resizing1 = true

        //start resizing pt 2
      } else if(dist(mouseX,mouseY,this.x2+offsetX,this.y2+offsetY) <= 7.5 && mouseIsPressed && !this.moving){
        this.resizing2 = true
      
        //delete line
      } else if(dist(mouseX,mouseY,Math.max(this.x1,this.x2)+20+offsetX,Math.min(this.y1,this.y2)-20+offsetY) <= 10 && mouseIsPressed && !this.resizing1 && !this.resizing2 && !this.moving){
        return true

        //decrease font size
      } else if(dist(mouseX,mouseY,Math.min(this.x1,this.x2)+offsetX-15,Math.max(this.y1,this.y2)+offsetY+45+30) <= 10 && mouseIsPressed && !this.resizing1 && !this.resizing2 && !this.moving){
        mouseIsPressed = false
        this.wt -= 2
      
        //increase stroke weight
      } else if(dist(mouseX,mouseY,Math.min(this.x1,this.x2)+offsetX-15+25,Math.max(this.y1,this.y2)+offsetY+45+30) <= 10 && mouseIsPressed && !this.resizing1 && !this.resizing2 && !this.moving){
        mouseIsPressed = false
        this.wt += 2
        
        //move line
      } else if(mouseIsPressed && !this.resizing1 && !this.resizing2){
        this.moving = true
      }
      
      //change size when resizing
      if(this.resizing1){
        this.x1 = mouseX
        this.y1 = mouseY
        if(!mouseIsPressed){
          this.resizing1 = false
        }
      }
      if(this.resizing2){
        this.x2 = mouseX
        this.y2 = mouseY
        if(!mouseIsPressed){
          this.resizing2 = false
        }
      }
      
      //move line when moving
      if(this.moving){
        this.x1 += mouseX-pmouseX
        this.y1 += mouseY-pmouseY
        this.x2 += mouseX-pmouseX
        this.y2 += mouseY-pmouseY
        if(!mouseIsPressed){
          this.moving = false
        }
      }
    }
    this.wt = constrain(this.wt,1,20)
  }

  //selecting this line
  selecting(){
    if(
      mouseX>=Math.min(this.x1,this.x2)+abs(this.x1-this.x2)/2+offsetX-(abs(this.x1-this.x2)/2 + 20) &&
      mouseX<=Math.min(this.x1,this.x2)+abs(this.x1-this.x2)/2+offsetX+(abs(this.x1-this.x2)/2 + 20) && 
      mouseY>=Math.min(this.y1,this.y2)+abs(this.y1-this.y2)/2+offsetY-(abs(this.y1-this.y2)/2 + 20) && 
      mouseY<=Math.min(this.y1,this.y2)+abs(this.y1-this.y2)/2+offsetY+(abs(this.y1-this.y2)/2 + 20) && 
      mouseIsPressed
    ){
      this.selected = true
      currSelecting = true
    }
  }
  
  //unselecting this line
  unselecting(){
    if(
      !(
        mouseX>=Math.min(this.x1,this.x2)+abs(this.x1-this.x2)/2+offsetX-(abs(this.x1-this.x2)/2 + 20) &&
        mouseX<=Math.min(this.x1,this.x2)+abs(this.x1-this.x2)/2+offsetX+(abs(this.x1-this.x2)/2 + 20) && 
        mouseY>=Math.min(this.y1,this.y2)+abs(this.y1-this.y2)/2+offsetY-(abs(this.y1-this.y2)/2 + 20) && 
        mouseY<=Math.min(this.y1,this.y2)+abs(this.y1-this.y2)/2+offsetY+(abs(this.y1-this.y2)/2 + 20)) && 
      !(
        mouseX>=Math.min(this.x1,this.x2)+offsetX-15-5 && 
        mouseX<=Math.min(this.x1,this.x2)+offsetX-15-5+(20*9)+(5*8) && 
        mouseY>=Math.max(this.y1,this.y2)+offsetY && 
        mouseY<=Math.max(this.y1,this.y2)+offsetY+45+10) && 

      !(
        mouseX>=Math.min(this.x1,this.x2)+offsetX-15-5 && 
        mouseX<=Math.min(this.x1,this.x2)+offsetX-15-5+(20*2)+5 &&
        mouseY>=Math.max(this.y1,this.y2)+offsetY && 
        mouseY<=Math.max(this.y1,this.y2)+offsetY+45+10+25) &&
        mouseIsPressed && this.selected && !this.resizing1 && !this.resizing2){   
      this.selected = false
      currSelecting = false
    }
  }
}

//shape class
class Shape{
  constructor(id,col,x,y,s){
    this.id = id
    this.col = shapeCols[col]
    this.x = x
    this.y = y
    this.s = s
    
    this.selected = true //start with it selecting
    currSelecting = true
    
    this.resizing = false
    this.moving = false
  }
  
  display(){
    //show shape depending on what is selected
    fill(this.col)
    push()
    if(this.id == 0){
      ellipseMode(CORNER)
      ellipse(this.x+offsetX,this.y+offsetY,this.s)
    } else if(this.id == 1){
      rect(this.x+offsetX,this.y+offsetY,this.s)
    } else if(this.id == 2){
      triangle(this.x+offsetX+this.s/2,this.y+offsetY+this.s*0.05, this.x+offsetX,this.y+offsetY+this.s-this.s*0.05, this.x+offsetX+this.s, this.y+offsetY+this.s-this.s*0.05)
    } else if(this.id == 3){
      push()
      translate(this.x+offsetX+this.s/2,this.y+offsetY+this.s/2)
      rotate(radians(45))
      rectMode(CENTER)
      rect(0,0,this.s*0.7)
      pop()
    }
    pop()
    
    //when selected
    if(this.selected){
      push() //selection box
      noFill()
      strokeWeight(4)
      stroke("purple")
      rect(this.x+offsetX,this.y+offsetY,this.s)
      pop()
      
      push() //delete btn
      fill("red")
      ellipse(this.x+offsetX+this.s,this.y+offsetY,20)
      fill("white")
      rectMode(CENTER)
      rect(this.x+offsetX+this.s,this.y+offsetY,10,2)
      pop()
      
      push() //resize btn
      fill("green")
      ellipse(this.x+offsetX+this.s,this.y+offsetY+this.s,20)
      pop()

      let colorOff = 0 //offset to display colors

      push() //show color options, change color if picked
      for(let i=0; i<shapeCols.length; i++){
        fill(shapeCols[i])
        ellipse(this.x+offsetX+5+colorOff,this.y+offsetY+this.s+25,20)

        if(dist(mouseX,mouseY,this.x+offsetX+5+colorOff,this.y+offsetY+this.s+25) <= 10 && mouseIsPressed && !this.resizing && !this.moving){
          this.col = shapeCols[i]
        }

        colorOff += 25
      }
      pop()
      
      //start resizing
      if(dist(mouseX,mouseY,this.x+offsetX+this.s,this.y+offsetY+this.s) <= 10 && mouseIsPressed && !this.moving){
        this.resizing = true
      
        //delete shape
      } else if(dist(mouseX,mouseY,this.x+offsetX+this.s,this.y+offsetY) <= 10 && mouseIsPressed && !this.resizing && !this.moving){
        return true
        
        //move shape
      } else if(mouseIsPressed && !this.resizing){
        this.moving = true
      }
      
      //change size when resizing
      if(this.resizing){
        // this.s += mouseX-pmouseX
        if(mouseX-this.x > mouseY-this.y){
          this.s = mouseX-this.x
        } else {
          this.s = mouseY-this.y
        }
        if(!mouseIsPressed){
          this.resizing = false
        }
      }
      
      //move shape when moving
      if(this.moving){
        this.x += mouseX-pmouseX
        this.y += mouseY-pmouseY
        if(!mouseIsPressed){
          this.moving = false
        }
      }
      
    }
    this.s = constrain(this.s,20,width)
  }
  
  //selecting this shape
  selecting(){
    if(mouseX>=this.x+offsetX && mouseX<=this.x+offsetX+this.s && mouseY>=this.y+offsetY && mouseY<=this.y+offsetY+this.s && mouseIsPressed){
      this.selected = true
      currSelecting = true
    }
  }
  
  //unselecting this shape
  unselecting(){
    if(!(mouseX>=this.x+offsetX && mouseX<=this.x+offsetX+this.s && mouseY>=this.y+offsetY && mouseY<=this.y+offsetY+this.s+30) && !(mouseX>=this.x+offsetX-5 && mouseX<=this.x+offsetX-5+(20*9)+(5*8) && mouseY>=this.y+offsetY+this.s && mouseY<=this.y+offsetY+this.s+35) && mouseIsPressed && this.selected && !this.resizing){   
      this.selected = false
      currSelecting = false
    }
  }
}

//sticky note class
class Sticky{
  constructor(col,x,y,s){
    this.col = col
    this.txt = ""
    this.x = x
    this.y = y
    this.s = s
    
    this.selected = true //start with it selecting
    currSelecting = true
    
    this.resizing = false
    this.moving = false
    
    this.txtInput = createInput("") //text input
  }
  
  display(){
    //sticky bg
    fill(this.col)
    rect(this.x+offsetX,this.y+offsetY,this.s,this.s)
    
    //sticky text
    fill(0)
    textWrap(CHAR)
    text(this.txt,this.x+offsetX+5,this.y+offsetY+5,this.s-10,this.s-10)
    
    //position text input 
    this.txtInput.position(this.x+offsetX-3,this.y+offsetY+this.s+12)
    this.txtInput.size(this.s,12)
    
    //when selected
    if(this.selected){
      push() //selection box
      noFill()
      strokeWeight(4)
      stroke("purple")
      rect(this.x+offsetX,this.y+offsetY,this.s)
      pop()
      
      push() //delete btn
      fill("red")
      ellipse(this.x+offsetX+this.s,this.y+offsetY,20)
      fill("white")
      rectMode(CENTER)
      rect(this.x+offsetX+this.s,this.y+offsetY,10,2)
      pop()
      
      push() //resize btn
      fill("green")
      ellipse(this.x+offsetX+this.s,this.y+offsetY+this.s,20)
      pop()
      
      this.txtInput.input(changeText) //get text from input
      this.txt = currTxt
      
      //start resizing
      if(dist(mouseX,mouseY,this.x+offsetX+this.s,this.y+offsetY+this.s) <= 10 && mouseIsPressed && !this.moving){
        this.resizing = true
      
        //delete sticky
      } else if(dist(mouseX,mouseY,this.x+offsetX+this.s,this.y+offsetY) <= 10 && mouseIsPressed && !this.resizing && !this.moving){
        this.txtInput.hide()
        currTxt = ""
        return true
        
        //move sticky
      } else if(mouseX>=this.x+offsetX && mouseX<=this.x+offsetX+this.s && mouseY>=this.y+offsetY && mouseY<=this.y+offsetY+this.s && mouseIsPressed && !this.resizing){
        this.moving = true
      }
      
      //change size when resizing
      if(this.resizing){
        // this.s += mouseX-pmouseX
        if(mouseX-this.x > mouseY-this.y){
          this.s = mouseX-this.x
        } else {
          this.s = mouseY-this.y
        }
        if(!mouseIsPressed){
          this.resizing = false
        }
      }
      
      //move sticky when moving
      if(this.moving){
        this.x += mouseX-pmouseX
        this.y += mouseY-pmouseY
        if(!mouseIsPressed){
          this.moving = false
        }
      }
      
    }
    this.s = constrain(this.s,20,width)
  }
  
  //selecting this sticky
  selecting(){
    if(mouseX>=this.x+offsetX && mouseX<=this.x+offsetX+this.s && mouseY>=this.y+offsetY && mouseY<=this.y+offsetY+this.s && mouseIsPressed){
      this.selected = true
      currSelecting = true
      this.txtInput.show()
      currTxt = this.txt
    }
  }
  
  //unselecting this sticky
  unselecting(){
    if(!(mouseX>=this.x+offsetX && mouseX<=this.x+offsetX+this.s && mouseY>=this.y+offsetY && mouseY<=this.y+offsetY+this.s+30) && mouseIsPressed && this.selected && !this.resizing){   
      this.selected = false
      currSelecting = false
      this.txtInput.hide()
      currTxt = ""
    }
  }
}

//sticker class
class Sticker{
  constructor(id,x,y,s){
    this.id = id
    this.x = x
    this.y = y
    this.s = s
    
    this.selected = false
    this.resizing = false
    this.moving = false
  }
  
  display(){
    //show sticker
    image(stickerImgs[this.id],this.x+offsetX,this.y+offsetY,this.s,this.s)
    
    //when selected
    if(this.selected){
      push() //selection box
      noFill()
      strokeWeight(4)
      stroke("purple")
      rect(this.x+offsetX,this.y+offsetY,this.s)
      pop()
      
      push() //delete btn
      fill("red")
      ellipse(this.x+offsetX+this.s,this.y+offsetY,20)
      fill("white")
      rectMode(CENTER)
      rect(this.x+offsetX+this.s,this.y+offsetY,10,2)
      pop()
      
      push() //resize btn
      fill("green")
      ellipse(this.x+offsetX+this.s,this.y+offsetY+this.s,20)
      pop()
      
      //start resizing
      if(dist(mouseX,mouseY,this.x+offsetX+this.s,this.y+offsetY+this.s) <= 10 && mouseIsPressed && !this.moving){
        this.resizing = true
        
        //delete sticker
      } else if(dist(mouseX,mouseY,this.x+offsetX+this.s,this.y+offsetY) <= 10 && mouseIsPressed && !this.resizing && !this.moving){
        return true
        
        //start moving
      } else if(mouseIsPressed && !this.resizing){
        this.moving = true
      }
      
      //resize sticker when resizing
      if(this.resizing){
        // this.s += mouseX-pmouseX
        if(mouseX-this.x > mouseY-this.y){
          this.s = mouseX-this.x
        } else {
          this.s = mouseY-this.y
        }
        if(!mouseIsPressed){
          this.resizing = false
        }
      }
      
      //move sticker when moving
      if(this.moving){
        this.x += mouseX-pmouseX
        this.y += mouseY-pmouseY
        if(!mouseIsPressed){
          this.moving = false
        }
      }
    }
    this.s = constrain(this.s,20,width)
  }
  
  //selecting this sticker
  selecting(){
    if(mouseX>=this.x+offsetX && mouseX<=this.x+offsetX+this.s && mouseY>=this.y+offsetY && mouseY<=this.y+offsetY+this.s && mouseIsPressed){
      this.selected = true
      currSelecting = true
    }
  }
  
  //unselecting this sticker
  unselecting(){
    if(!(mouseX>=this.x+offsetX && mouseX<=this.x+offsetX+this.s && mouseY>=this.y+offsetY && mouseY<=this.y+offsetY+this.s) && mouseIsPressed && this.selected && !this.resizing){   
      this.selected = false
      currSelecting = false
    }
  }
}

//text box class
class TextBox{
  constructor(x,y,w,h){
    this.txt = ""
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.txtSz = 12
    
    this.selected = true //start with it selecting
    currSelecting = true
    
    this.resizing = false
    this.moving = false
    
    this.txtInput = createInput("") //text input
  }
  
  display(){
    //text
    fill(0)
    textWrap(CHAR)
    push()
    textSize(this.txtSz)
    text(this.txt,this.x+offsetX+5,this.y+offsetY+5,this.w-10,this.h-10)
    pop()

    //position text input 
    this.txtInput.position(this.x+offsetX-3,this.y+offsetY+this.h+12)
    this.txtInput.size(this.w,12)
    
    //when selected
    if(this.selected){
      push() //selection box
      noFill()
      strokeWeight(4)
      stroke("purple")
      rect(this.x+offsetX,this.y+offsetY,this.w,this.h)
      pop()
      
      push() //delete btn
      fill("red")
      ellipse(this.x+offsetX+this.w,this.y+offsetY,20)
      fill("white")
      rectMode(CENTER)
      rect(this.x+offsetX+this.w,this.y+offsetY,10,2)
      pop()
      
      push() //resize btn
      fill("green")
      ellipse(this.x+offsetX+this.w,this.y+offsetY+this.h,20)
      pop()

      push()
      fill(150) //decrease font size btn
      ellipse(this.x+offsetX+5,this.y+offsetY+this.h+50,20)
      fill("white")
      rectMode(CENTER)
      rect(this.x+offsetX+5,this.y+offsetY+this.h+50,10,2)
      fill(150) //increase font size btn
      ellipse(this.x+offsetX+5+25,this.y+offsetY+this.h+50,20)
      fill("white")
      rectMode(CENTER)
      rect(this.x+offsetX+5+25,this.y+offsetY+this.h+50,10,2)
      rect(this.x+offsetX+5+25,this.y+offsetY+this.h+50,2,10)
      pop()
      
      this.txtInput.input(changeText) //get text from input
      this.txt = currTxt
      
      //start resizing
      if(dist(mouseX,mouseY,this.x+offsetX+this.w,this.y+offsetY+this.h) <= 10 && mouseIsPressed && !this.moving){
        this.resizing = true
      
        //delete text
      } else if(dist(mouseX,mouseY,this.x+offsetX+this.w,this.y+offsetY) <= 10 && mouseIsPressed && !this.resizing && !this.moving){
        this.txtInput.hide()
        currTxt = ""
        return true
      
        //decrease font size
      } else if(dist(mouseX,mouseY,this.x+offsetX+5,this.y+offsetY+this.h+50) <= 10 && mouseIsPressed && !this.resizing && !this.moving){
        mouseIsPressed = false
        this.txtSz -= 2
        
        //increase font size
      } else if(dist(mouseX,mouseY,this.x+offsetX+5+25,this.y+offsetY+this.h+50) <= 10 && mouseIsPressed && !this.resizing && !this.moving){
        mouseIsPressed = false
        this.txtSz += 2

        //move text
      } else if(mouseX>=this.x+offsetX && mouseX<=this.x+offsetX+this.w && mouseY>=this.y+offsetY && mouseY<=this.y+offsetY+this.h && mouseIsPressed && !this.resizing){
        this.moving = true
      }
      
      //change size when resizing
      if(this.resizing){
        this.w = mouseX-this.x
        this.h = mouseY-this.y
        if(!mouseIsPressed){
          this.resizing = false
        }
      }
      
      //move text when moving
      if(this.moving){
        this.x += mouseX-pmouseX
        this.y += mouseY-pmouseY
        if(!mouseIsPressed){
          this.moving = false
        }
      }
    }
    this.w = constrain(this.w,20,width)
    this.h = constrain(this.h,20,width)
    this.txtSz = constrain(this.txtSz,8,40)
  }
  
  //selecting this textbox
  selecting(){
    if(mouseX>=this.x+offsetX && mouseX<=this.x+offsetX+this.w && mouseY>=this.y+offsetY && mouseY<=this.y+offsetY+this.h && mouseIsPressed){
      this.selected = true
      currSelecting = true
      this.txtInput.show()
      currTxt = this.txt
    }
  }
  
  //unselecting this textbox
  unselecting(){
    if(!(mouseX>=this.x+offsetX && mouseX<=this.x+offsetX+this.w && mouseY>=this.y+offsetY && mouseY<=this.y+offsetY+this.h+60) && mouseIsPressed && this.selected && !this.resizing){   
      this.selected = false
      currSelecting = false
      this.txtInput.hide()
      currTxt = ""
    }
  }
}

function drawGridBuffer() {
  gridBuffer.clear();
  gridBuffer.stroke(128);
  gridBuffer.strokeWeight(1.5)

  // Draw dot grid in the buffer
  for (let x = 0; x < width + gridSize; x += gridSize) {
    for (let y = 0; y < height + gridSize; y += gridSize) {
      gridBuffer.point(x, y);
    }
  }
}

function mousePressed() {
  if (isMouseWithinCanvas() && handMode) {
    dragging = true;
  }
}

function mouseReleased() {
  dragging = false;
}

function mouseDragged() {
  if (dragging && handMode) {
    // Update the canvas position, but keep within bounds 
    // total canvas area is 2000 x 1400
    offsetX = constrain(offsetX - (pmouseX - mouseX), -canvasWidth, canvasWidth);
    offsetY = constrain(offsetY - (pmouseY - mouseY), -canvasHeight, canvasHeight);
  }
}

function isMouseWithinCanvas() {
  return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}