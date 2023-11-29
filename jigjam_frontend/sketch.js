let offsetX = 0;
let offsetY = 0;
let dragging = false;
const canvasWidth = 1000;
const canvasHeight = 700;
const gridSize = 20;

let handMode = false //hand mode = draggable canvas

let currSelecting = false //currently selecting a graphic?

let showStickies = false //show sticky note colors
let showStickers = false //show stickers

let stickyCols = [] //array for sticky note colors
let stickerImgs = [] //array for sticker images

let tabOffset2 = 0 //y offset to display secondary toolbar tab items

let currTxt = "" //current content of text being edited

let layers = [] //array for layers with graphics

function preload(){
  //load images into array
  for (let i=0; i<6; i++) {
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
  
  //add colors to sticky array
  stickyCols = [color(255, 115, 115),color(255, 178, 115),color(255, 241, 115),color(155, 255, 115),color(115, 236, 255),color(183, 151, 252)]
}

function draw() {
  background(255);
  
  // draw the visible portion of the grid from the buffer
  image(gridBuffer, offsetX % gridSize - gridSize, offsetY % gridSize - gridSize);
  
  //go over all layers and display
  for (let i=0;i<layers.length;i++){
    image(layers[i],offsetX % gridSize - gridSize, offsetY % gridSize - gridSize)
    
    let deleteThis = layers[i].content.display()
    
    layers[i].content.unselecting()
    
    //if not selecting something & not dragging canvas, allow to select something else
    if(!currSelecting && !handMode){
      layers[i].content.selecting()
    }
    
    //if user deletes the item, delete the layer
    if (deleteThis){
      layers.splice(i,1)
      currSelecting = false
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
  
  fill("blue")
  rect(0,height-100,50,50)
  fill("pink")
  rect(0,height-50,50,50)
  
  //show or hide sticky note options from toolbar
  if(mouseX>=0 && mouseX<=50 && mouseY>=0 && mouseY<=50 && mouseIsPressed && !currSelecting){
    mouseIsPressed = false
    if(showStickies){
      showStickies = false
    } else {
      showStickies = true
      showStickers = false
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
        return true
        
        //move sticky
      } else if(mouseIsPressed && !this.resizing){
        this.moving = true
      }
      
      //change size when resizing
      if(this.resizing){
        this.s += mouseX-pmouseX
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
    if(mouseX>=this.x+offsetX && mouseX<=this.x+offsetX+this.s && mouseY>=this.y+offsetY && mouseY<=this.y+offsetY+this.s+30 && mouseIsPressed){
      this.selected = true
      currSelecting = true
      this.txtInput.show()
      currTxt = this.txt
    }
  }
  
  //unselecting this sticky
  unselecting(){
    if(!(mouseX>=this.x+offsetX && mouseX<=this.x+offsetX+this.s && mouseY>=this.y+offsetY && mouseY<=this.y+offsetY+this.s) && mouseIsPressed && this.selected && !this.resizing){   
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
        this.s += mouseX-pmouseX
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
  
  //selecting this sticky
  selecting(){
    if(mouseX>=this.x+offsetX && mouseX<=this.x+offsetX+this.s && mouseY>=this.y+offsetY && mouseY<=this.y+offsetY+this.s && mouseIsPressed){
      this.selected = true
      currSelecting = true
    }
  }
  
  //unselecting this sitkcy
  unselecting(){
    if(!(mouseX>=this.x+offsetX && mouseX<=this.x+offsetX+this.s && mouseY>=this.y+offsetY && mouseY<=this.y+offsetY+this.s) && mouseIsPressed && this.selected && !this.resizing){   
      this.selected = false
      currSelecting = false
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