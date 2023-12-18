let mode = 2
let offsetX = 0;
let offsetY = 0;
let dragging = false;
const canvasWidth = 1000;
const canvasHeight = 700;
const gridSize = 20;

let karlaFont;

let handMode = false //hand mode = draggable canvas

let currSelecting = false //currently selecting a graphic?

let showShapes = false //show shapes
let showStickies = false //show sticky note colors
let showStickers = false //show stickers
let showRecordPlayer = false //show record player

let shapeCols = [] //array for shape color
let stickyCols = [] //array for sticky note colors
let foodStickerImgs = [] //array for food sticker images
let doodlesStickersImgs = [] //array for doodles sticker images
let reactionsStickersImgs = [] //array for reactions sticker images
let wordsStickersImgs = [] //array for words sticker images

let tabOffset2 = 0 //y offset to display secondary toolbar tab items
let tabOffset3 = 0 //y offset to display secondary toolbar tab items
let stickerOffset = 0 //padding in sticker toolbar, column 1
let stickerOffset2 = 0 //padding in sticker toolbar, column 2

let selectedTabColor = '#eaeaea'
let unselectedTabColor = '#d4d4d4'

let foodTabColor
let doodlesTabColor
let reactionsTabColor
let wordsTabColor

let currTxt = "" //current content of text being edited

let layers = new Map(); // map for layers with graphics
let users = [] //array for users

let category; //sticker category: food, doodle, reaction, or word

//tool images
let handTool;
let lineTool;
let selectTool;
let shapeTool;
let stickerTool;
let stickyTool;
let textTool;
let userIcon;

let showFoodStickers = true;
let showDoodlesStickers = false;
let showReactionsStickers = false;
let showWordsStickers = false;

let creatorName;
let nicknameDiv;
let hasNameInput = true
let activeUsers = [] //array for active user icons 

// room previews
let numRooms = 3;
let rectWidth = 310;
let rectHeight = 220;

let homeIcon;

//record player variables
let record;
let needle;
let recordImgs = []
let recordPlayerIcon;

let playTrack;
let tracks = []

let currTrack = 1
let playing = false

let recordRot = 0;
let recordSpeed = 0.6;

let needleRot = 0;

function preload() {
   // send messages to all other clients in the canvas
   socket = io();

   // tell all other users that we have joined the canvas
   socket.emit('new_user', {
     // x: x,
     // y: y,
     // color: currentColor
   });
 
   // listen for any new users that may have joined
   socket.on('new_user', function (message) {
     console.log("A new user has joined!");
     console.log(message);
 
     // store the newly joined user in our object
     users[message.id] = message;
   });
 
     // TODO: listen for all previous users
     socket.on('all_previous_users', function(message) {
       console.log("Got all previous users!");
       console.log(message);
 
     // store these users
     for (let id in message) {
       users[id] = message[id];
     }
     console.log(users);
   });
 
 //   // TODO: listen for all layers in the canvas
 //   socket.on('initial_layers', (layersArray) => {
 //     layers = new Map(layersArray);
 //     console.log(layers);
 //     // Now layers is a Map populated with the data from the server
 // });
 
   // listen for any new stickers that may have been added
   socket.on('new_sticky', function(msg) {
     console.log("A new sticky has been added!");
     console.log(msg);
     newSticky = createGraphics(width + gridSize, height + gridSize);
 
     // Assuming msg.col is an array [r, g, b]
     let col = color(msg.layer.col[0], msg.layer.col[1], msg.layer.col[2]);
     newSticky.content = new Sticky(col, msg.layer.x, msg.layer.y, msg.layer.s, "other", msg.uniqueID);
     newSticky.content.selected = false;
     // newSticky.content.txtInput.hide()
     newSticky.content.txtInput.hide()
     currSelecting = false;
 
     layers.set(msg.uniqueID, newSticky);
 
     console.log(layers);
   });
 
   // listen for any new stickers that may have been added
   socket.on('new_sticker', function(msg) {
     console.log("A new sticker has been added!");
     console.log(msg);
     newSticker = createGraphics(width + gridSize, height + gridSize);
     newSticker.content = new Sticker(msg.layer.stickerID, msg.layer.x, msg.layer.y, msg.layer.s, msg.layer.category, msg.uniqueID);
     newSticker.content.selected = false;
     currSelecting = false;
 
     layers.set(msg.uniqueID, newSticker);
 
     console.log(layers);
   });
 
   // listen for any new shapes that may have been added
   socket.on('new_shape', function(msg) {
     console.log("A new shape has been added!");
     console.log(msg);
     newShape = createGraphics(width + gridSize, height + gridSize);
     newShape.content = new Shape(msg.layer.shapeID, msg.layer.col, msg.layer.x, msg.layer.y, msg.layer.s, msg.uniqueID);
     newShape.content.selected = false;
     currSelecting = false;
 
     layers.set(msg.uniqueID, newShape);
 
     console.log(layers);
   });
 
   // listen for any new lines that may have been added
   socket.on('new_line', function(msg) {
     console.log("A new line has been added!");
     console.log(msg);
     newLine = createGraphics(width + gridSize, height + gridSize);
     newLine.content = new Line(msg.layer.col, msg.layer.x1, msg.layer.y1, msg.layer.x2, msg.layer.y2, msg.uniqueID);
     newLine.content.selected = false;
     currSelecting = false;
 
     layers.set(msg.uniqueID, newLine);
 
     console.log(layers);
   });
 
   // listen for any new text that may have been added
   socket.on('new_text', function(msg) {
     console.log("A new text has been added!");
     console.log(msg);
     newText = createGraphics(width + gridSize, height + gridSize);
     newText.content = new TextBoxComp(msg.layer.x, msg.layer.y, msg.layer.w, msg.layer.h, msg.uniqueID);
     newText.content.selected = false;
     newText.content.txtInput.hide()
     currSelecting = false;
 
     layers.set(msg.uniqueID, newText);
 
     console.log(layers);
   });
 
   // listen for text resize
   socket.on('text_resize', function(msg) {
     console.log("A text is being resized");
     console.log(msg);
 
     // update the layer in our layers map
     let layer = layers.get(msg.id);
     layer.content.txtSz = msg.txtSz;
   });
 
   // listen for text border resize
   socket.on('text_border_resize', function(msg) {
     console.log("A text border is being resized");
     console.log(msg);
 
     let layer = layers.get(msg.id);
     layer.content.w = msg.w;
     layer.content.h = msg.h;
   });
 
   // listen for movement of layers: need keyvalue, x, y
   socket.on('move_layer', function (msg) {
     console.log("a layer is being moved");
     console.log(msg);
 
     // update the layer in our layers map
     let layer = layers.get(msg.id);
     layer.content.x = msg.x;
     layer.content.y = msg.y;
   });
 
   // listen for resizing of layers: need keyvalue, s
   socket.on('resize_layer', function(msg) {
     console.log("a layer is being resized");
     console.log(msg);
 
     // update the layer in our layers map
     let layer = layers.get(msg.id);
     layer.content.s = msg.s;
   });
 
   // listen for color changes of layers
   socket.on('change_color_layer', function(msg) {
     console.log("a layer is being changed color");
     console.log(msg);
 
     // update the layer in our layers map
     let layer = layers.get(msg.id);
     layer.content.col = msg.col;
   });
   
   // listen for layer deletions
   socket.on('delete_layer', function(msg) {
     console.log("a layer is being deleted");
     console.log(msg);
 
     // delete the layer from our layers map
     layers.delete(msg.id);
   });
 
   // listen for text edits
   socket.on('change_text', function(msg) {
     console.log("a text is being edited");
     console.log(msg);
     layers.get(msg.id).content.txt = msg.txt;
   });
 
   // listen for weight changes
   socket.on('change_weight', function(msg) {
     console.log("a weight is being changed");
     console.log(msg);
     layers.get(msg.id).content.wt = msg.wt;
   });
 
   // listen for line movements
   socket.on('move_line', function(msg) {
     console.log("a line is being moved");
     console.log(msg);
     let layer = layers.get(msg.id);
     layer.content.x1 = msg.x1;
     layer.content.y1 = msg.y1;
     layer.content.x2 = msg.x2;
     layer.content.y2 = msg.y2;
   }); 

  //load food images into array
  for (let i = 0; i < 7; i++) {
    let filename = "stickers/food/" + nf(i) + ".png"
    foodStickerImgs.push(loadImage(filename))
  }

  //load doodles images into array
  for (let i = 0; i < 8; i++) {
    let filename = "stickers/doodle/" + nf(i) + ".png"
    doodlesStickersImgs.push(loadImage(filename))
  }

  //load reactions images into array
  for (let i = 0; i < 6; i++) {
    let filename = "stickers/reactions/" + nf(i) + ".png"
    reactionsStickersImgs.push(loadImage(filename))
  }

  //load words images into array
  for (let i = 0; i < 6; i++) {
    let filename = "stickers/words/" + nf(i) + ".png"
    wordsStickersImgs.push(loadImage(filename))
  }

  //load record images into array
  for(let i=1; i<5; i++){
    let filename = "recordImages/" + nf(i) + ".png"
    recordImgs.push(loadImage(filename))
  }

  record = loadImage("recordImages/record.png")
  needle = loadImage("recordImages/needle.png")
  recordPlayerIcon = loadImage("recordImages/recordPlayerIcon.png")

  //load record soundtracks into array
  for (let i = 1; i < 5; i++) {
    let filename = "tracks/track" + nf(i) + ".mp3"
    tracks.push(loadSound(filename))
  }


  handTool = loadImage("icons/handTool.png");
  lineTool = loadImage("icons/lineTool.png");
  selectTool = loadImage("icons/selectTool.png");
  shapeTool = loadImage("icons/shapeTool.png");
  stickerTool = loadImage("icons/stickerTool.png");
  stickyTool = loadImage("icons/stickyTool.png");
  textTool = loadImage("icons/textTool.png");

  userIcon = loadImage("icons/userIcon.png")
  homeIcon = loadImage("icons/homeIcon.png")

  karlaFont = loadFont('fonts/Karla-Regular.ttf');

}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // buffer to pre-render the dot grid
  gridBuffer = createGraphics(width + gridSize, height + gridSize);
  drawGridBuffer();
  noStroke()
  strokeCap(ROUND)

  nicknameDiv = createDiv('')
  nicknameDiv.position(width / 2 - 10, height / 2 - 15)

  creatorName = createInput("")
  creatorName.style('font-size', '25px', 'color', '#ff0000', 'border-radius', '9px');
  creatorName.parent(nicknameDiv)

  //add colors to sticky array & shape array
  stickyCols = [color(255, 115, 115), color(255, 178, 115), color(255, 241, 115), color(155, 255, 115), color(115, 236, 255), color(183, 151, 252)]
  shapeCols = [color(50), color(128), color(255, 46, 46), color(255, 126, 46), color(255, 210, 46), color(46, 255, 95), color(46, 182, 255), color(164, 46, 255), color(255, 46, 144)]

}

function draw() {

  if (mode == 0) {
    background(255)
    textFont(karlaFont);
    //draw the visible portion of the grid from the buffer
    image(gridBuffer, offsetX % gridSize - gridSize, offsetY % gridSize - gridSize);

    push()
    textSize(30)
    textFont("bigsmalls-bold")
    text("jigjam", 50, 70)
    pop()

    //nickname container
    push()
    let rectWidth = 800;
    let rectHeight = 500;
    let rectX = width / 2 - rectWidth / 2;
    let rectY = height / 2 - rectHeight / 2;

    fill('#eaeaea');
    strokeWeight(1)
    stroke('black')
    rect(rectX, rectY, rectWidth, rectHeight, 9);

    textAlign(CENTER, CENTER);
    fill('black');
    textSize(30);
    noStroke()
    push()
    textFont("bigsmalls-bold")
    text("jigjam", width / 2, height / 2 - 150);
    pop()
    textSize(25);
    text("Enter your nickname", width / 2 - 150, height / 2);

    //create button
    fill('#D3FF8A')
    strokeWeight(1)
    stroke('black')
    rect(width / 2 - 100, height / 2 + 80, 200, 40, 9)
    fill('black')
    noStroke()
    text("Create!", width / 2, height / 2 + 95)
    pop()

    // click create button
    if (mouseX >= width / 2 - 100 && mouseX <= width / 2 - 100 + 200 && mouseY >= height / 2 + 80 && mouseY <= height / 2 + 80 + 40 && mouseIsPressed) {
      if (creatorName.value() == "") {
        hasNameInput = false
      } else {
        //create active users
        for (let i = 0; i < 3; i++) {
          const x = width - (i + 1) * (40 + 15);
          activeUsers.push(new activeUser(creatorName.value(),x))

        }

        hasNameInput = true
        mouseIsPressed = false
        mode = 1
        nicknameDiv.style('display', 'none');
      }
    }

    if (hasNameInput == false) {
      push()
      fill("red")
      textSize(18)
      text("Please enter your name!", width / 2 - 10, height / 2 + 40)
      pop()

    }

  } else if (mode == 1) {
    background(255)
    textFont(karlaFont);
    nicknameDiv.style('display', 'none');

    //draw the visible portion of the grid from the buffer
    image(gridBuffer, offsetX % gridSize - gridSize, offsetY % gridSize - gridSize);

    push()
    textSize(30)
    push()
    textFont("bigsmalls-bold")
    text("jigjam", 50, 70)
    pop()

    textSize(50)
    if(creatorName.value() == ""){
      text("Welcome", 50, 200)
    } else {
      text("Welcome, " + creatorName.value(), 50, 200)

    }
    
    //Calculate the total width of the row
    //Adjust the spacing between rectangles
    let totalRowWidth = numRooms * (rectWidth + 70);
    //Calculate starting position to center the row
    let startX = width / 2 - totalRowWidth / 2;

    //ROOMS
    for (let i = 0; i < numRooms; i++) {
      let x = startX + i * (rectWidth + 70); //Adjust spacing between rectangles
      let y = 330;

      stroke("#afafaf")
      strokeWeight(1)
      fill('white');
      rect(x, y, rectWidth, rectHeight, 9);
      fill('#d9d9d9')
      rect(x, y, rectWidth, 40, 9, 9, 0, 0)
      fill('#D3FF8A')
      rect(x + rectWidth - 70, y + 5, 60, 30, 9)
      image(userIcon, x + rectWidth - 67, y + 5, 26, 26)

      textSize(25)
      noStroke()
      fill('black')

      if (i % 3 === 0) { //room 1
        text("Room 1", x + 15, y + 27) //document title
        text("3", x + rectWidth - 40, y + 27) //num users in room
        //[insert preview here]

        if(mouseIsPressed && mouseX > x && mouseX < x + rectWidth && mouseY > y && mouseY < y + rectHeight){
          mouseIsPressed = false
          mode = 2
        
        }

      } else if (i % 3 === 1) { //room 2
        text("Room 2", x + 15, y + 27)
        text("0", x + rectWidth - 40, y + 27)
        push()
        textSize(14)
        text("Multi room feature coming soon!", x + 50, y + 120)
        pop()
        //[insert preview here]

      } else { //room 3
        text("Room 3", x + 15, y + 27)
        text("0", x + rectWidth - 40, y + 27)
        push()
        textSize(14)
        text("Multi room feature coming soon!", x + 50, y + 120)
        pop()
        //[insert preview here]

      }
      
    }
    pop()


  } else if (mode == 2) {
    background(255)
    textFont(karlaFont);
    nicknameDiv.style('display', 'none');

    // Draw the visible portion of the grid from the buffer
    image(gridBuffer, offsetX % gridSize - gridSize, offsetY % gridSize - gridSize);

    // render each layer
    layers.forEach((layer, id) => {
      image(layer, offsetX % gridSize - gridSize, offsetY % gridSize - gridSize);

      let deleteThis = layer.content.display();

      // If user deletes the item, delete the layer from the map
      if (deleteThis) {
        layers.delete(id);
        currSelecting = false;
      }
    });

    // To go over all layers in reverse for selecting and unselecting,
    // we convert the Map values to an array and then reverse it
    Array.from(layers.values()).reverse().forEach(layer => {
      layer.content.unselecting();

      // If not selecting something & not dragging canvas, allow to select something else
      if (!currSelecting && !handMode) {
        layer.content.selecting();
      }
    });

    //HOME BUTTON
    push()
    fill('#f2f2f2')
    stroke('#afafaf')
    strokeWeight(1)
    rect(20, 20, 40, 40, 9)
    image(homeIcon, 22.5, 20, 35, 35)
    pop()

    //return to landing page
    if (mouseX >= 20 && mouseX <= 60 && mouseY >= 20 && mouseY <= 60 && mouseIsPressed) {
      console.log('home button pressed')
      mouseIsPressed = false
      mode = 1
    }

    //DOCUMENT TITLE
    push()
    fill('#f2f2f2')
    stroke('#afafaf')
    strokeWeight(1)
    rect(80, 20, 100, 40, 9)
    textSize(20)
    fill('black')
    noStroke()
    text("Room 1", 95, 47)
    pop()

    //record player button
    push()
    stroke('#afafaf')
    fill('#f2f2f2')
    rect(200, 20, 40, 40, 9)
    fill(209, 254, 145)
    ellipse(219, 41, 20, 20)
    image(recordPlayerIcon, 203, 22, 35, 35)
    pop()

    //check if record player button has been pressed
    if (mouseIsPressed && mouseX > 200 && mouseX < 240 && mouseY > 20 && mouseY < 60) {
      mouseIsPressed = false
      if (showRecordPlayer == false) {
        showRecordPlayer = true
      } else {
        showRecordPlayer = false
      }

      showShapes = false
      showStickies = false
      showStickers = false
      handMode = false
    }

    if (showRecordPlayer) {
      displayRecordPlayer()

    }

    //ACTIVE USERS
    for(let i=0; i<activeUsers.length; i++){
      activeUsers[i].display()
    }
    // user1.display()

    //sticker background
    push()
    fill('#f2f2f2')
    stroke('#afafaf')
    strokeWeight(1)
    rect(0, 80, 100, 640, 0, 9, 9, 0)
    pop()

    //1 LINE TOOL
    image(lineTool, 10, 90, 80, 80)

    if (mouseX >= 10 && mouseX <= 90 && mouseY >= 90 && mouseY <= 170 && mouseIsPressed && !currSelecting) {
      mouseIsPressed = false

      temp = createGraphics(width + gridSize, height + gridSize)
      let uniqueID = createUniqueID();
      temp.content = new Line(round(random(0, shapeCols.length - 1)), width / 2 - offsetX - 50, height / 2 - offsetY - 50, width / 2 - offsetX + 50, height / 2 - offsetY + 50, uniqueID)
      layers.set(uniqueID, temp);
  
      socket.emit('new_line', {
        uniqueID: uniqueID, 
        layer: {
          col: temp.content.col,
          x1: temp.content.x1,
          y1: temp.content.y1,
          x2: temp.content.x2,
          y2: temp.content.y2
        }
      });

      showStickies = false
      showStickers = false
      showShapes = false
      handMode = false
      showRecordPlayer = false

    }

    //2 SHAPE TOOL
    image(shapeTool, 10, 180, 80, 80)

    //shapes toolbar
    if (showShapes) {
      push()
      fill('#f2f2f2')
      stroke('#afafaf')
      strokeWeight(1)
      rect(100, 180, 100, (70 * 4) + (5 * 4), 0, 9, 9, 0)
      pop()

      tabOffset2 = 10

      //show shapes, add new shape when picked
      for (let i = 0; i < 4; i++) {
        push()
        noFill()
        strokeWeight(1)
        stroke('black')
        fill('#bababa')
        noStroke()
        // rectMode(CENTER)
        // rect(80,180+tabOffset2,50)
        if (i == 0) {
          ellipseMode(CORNER)
          ellipse(120, 180 + tabOffset2, 60)
        } else if (i == 1) {
          rectMode(CENTER)
          rect(150, 210 + tabOffset2, 57)
        } else if (i == 2) {
          triangle(150, 200 + tabOffset2 - 20, 150 + 35, 200 + tabOffset2 + 35, 150 - 35, 200 + tabOffset2 + 35)
        } else if (i == 3) {
          push()
          translate(150, 435)
          rotate(radians(45))
          rectMode(CENTER)
          rect(0, 0, 50)
          pop()
        }
        pop()

        if (mouseX >= 110 && mouseX <= 190 && mouseY >= 180 + tabOffset2 && mouseY <= 180 + tabOffset2 + 65 && mouseIsPressed && !currSelecting) {
          mouseIsPressed = false

          temp = createGraphics(width + gridSize, height + gridSize)
          temp.content = new Shape(i, round(random(0, shapeCols.length - 1)), width / 2 - 50 - offsetX, height / 2 - 50 - offsetY, 100)
          
          // Generate a unique ID for the new layer
          let uniqueID = createUniqueID();
          let randomColorIndex = round(random(0, shapeCols.length - 1));
          temp = createGraphics(width + gridSize, height + gridSize)
          temp.content = new Shape(i, randomColorIndex, width / 2 - 50 - offsetX, height / 2 - 50 - offsetY, 100, uniqueID)
        
          layers.set(uniqueID, temp);
  
          socket.emit('new_shape', {
            uniqueID: uniqueID, 
            layer: {
              shapeID: temp.content.shapeID,
              col: randomColorIndex,
              x: temp.content.x,
              y: temp.content.y,
              s: temp.content.s
            }
          });   
        }

        tabOffset2 += 70
      }
    }

    //3 STICKY TOOL
    image(stickyTool, 10, 270, 80, 80)

    //sticky note toolbar
    if (showStickies) {
      push()
      fill('#f2f2f2')
      stroke('#afafaf')
      strokeWeight(1)
      rect(100, 270, 100, (50 * 6) + (5 * 6) + 107, 0, 9, 9, 0)
      pop()

      tabOffset2 = 0

      //show sticky note colors, add a new sticky note on new layer once select color
      for (let i = 0; i < 6; i++) {
        push()
        fill(stickyCols[i])
        noStroke()
        rect(120, 285 + tabOffset2, 57)
        pop()

        if (mouseX >= 120 && mouseX <= 120 + 57 && mouseY >= 285 + tabOffset2 && mouseY <= 285 + tabOffset2 + 57 && mouseIsPressed && !currSelecting) {
          mouseIsPressed = false

        let uniqueID = createUniqueID();
        temp = createGraphics(width + gridSize, height + gridSize)
        temp.content = new Sticky(stickyCols[i], width / 2 - 50 - offsetX, height / 2 - 50 - offsetY, 100, creatorName, uniqueID);
        layers.set(uniqueID, temp);
        
        temp.content.id = uniqueID;

          socket.emit('new_sticky', {
            uniqueID: uniqueID,
            layer: {
              col: [temp.content.col.levels[0], temp.content.col.levels[1], temp.content.col.levels[2]], // Convert the color to an RGB array
              x: temp.content.x,
              y: temp.content.y,
              s: temp.content.s
            }
          });
        }

        tabOffset2 += 70
      }
    }

    //4 STICKER TOOL 
    image(stickerTool, 10, 360, 80, 80)

    //stickers toolbar
    if (showStickers) {
      push()
      fill('#f2f2f2')
      stroke('#afafaf')
      strokeWeight(1)
      rect(100, 359, 100 + 90 + 35, (50 * 6) + (5 * 6) + 25, 0, 9, 9, 0)
      pop()

      if (category == 'foods') {
        foodTabColor = selectedTabColor
        doodlesTabColor = unselectedTabColor
        reactionsTabColor = unselectedTabColor
        wordsTabColor = unselectedTabColor
      } else if (category == 'doodles') {
        foodTabColor = unselectedTabColor
        doodlesTabColor = selectedTabColor
        reactionsTabColor = unselectedTabColor
        wordsTabColor = unselectedTabColor
      } else if (category == 'reactions') {
        foodTabColor = unselectedTabColor
        doodlesTabColor = unselectedTabColor
        reactionsTabColor = selectedTabColor
        wordsTabColor = unselectedTabColor
      } else if (category == 'words') {
        foodTabColor = unselectedTabColor
        doodlesTabColor = unselectedTabColor
        reactionsTabColor = unselectedTabColor
        wordsTabColor = selectedTabColor
      }

      //clicking on sticker tabs
      //food tab
      if (typeof foodTabColor === 'string') {
        fill(foodTabColor)
        stroke('#afafaf')
        rect(200 + 90, 359, 35, 88.75, 0, 9, 0, 0)
        push()
        translate(300, 380)
        rotate(radians(90))
        fill('black')
        strokeWeight(0.2)
        textSize(16)
        text("Foods", 0, 0)
        pop()
      } else {
        console.log('Invalid color for foodTabColor:', foodTabColor);
      }

      //doodles tab
      if (typeof doodlesTabColor === 'string') {
        fill(doodlesTabColor)
        rect(200 + 90, 359 + 88.75, 35, 88.75, 0, 0, 0, 0)
        push()
        translate(300, 460)
        rotate(radians(90))
        fill('black')
        strokeWeight(0.2)
        stroke('#afafaf')
        textSize(16)
        text("Doodles", 0, 0)
        pop()
      } else {
        console.log('Invalid color for doodlesTabColor:', doodlesTabColor);
      }

      //reactions tab
      if (typeof reactionsTabColor === 'string') {
        fill(reactionsTabColor)
        rect(200 + 90, 359 + 88.75 + 88.75, 35, 88.75, 0, 0, 0, 0)
        push()
        translate(300, 545)
        rotate(radians(90))
        fill('black')
        strokeWeight(0.2)
        stroke('#afafaf')
        textSize(16)
        text("Reactions", 0, 0)
        pop()
      } else {
        console.log('Invalid color for reactionsTabColor:', reactionsTabColor);
      }

      //words tab
      if (typeof wordsTabColor === 'string') {
        fill(wordsTabColor)
        rect(200 + 90, 359 + 88.75 + 88.75 + 88.75, 35, 88.75, 0, 0, 9, 0)
        push()
        translate(300, 645)
        rotate(radians(90))
        fill('black')
        strokeWeight(0.2)
        stroke('#afafaf')
        textSize(16)
        text("Words", 0, 0)
        pop()
      } else {
        console.log('Invalid color for wordsTabColor:', wordsTabColor);
      }

      //show food stickers, add new sticker when picked
      if (showFoodStickers) {
        tabOffset2 = 0
        stickerOffset = 0
        tabOffset3 = 0
        stickerOffset2 = 0
        category = "foods"
        for (let i = 0; i < foodStickerImgs.length; i++) {
          if (i < 4) {
            image(foodStickerImgs[i], 110, 370 + tabOffset2 + stickerOffset, 75, 75)
            if (mouseX >= 110 && mouseX <= 110 + 75 && mouseY >= 370 + tabOffset2 + stickerOffset && mouseY <= 370 + tabOffset2 + stickerOffset + 75 && mouseIsPressed && !currSelecting) {
              mouseIsPressed = false
              createSticker(i, category);
            }
          } else {
            image(foodStickerImgs[i], 200, 30 + tabOffset3 + stickerOffset2, 75, 75)
            if (mouseX >= 200 && mouseX <= 200 + 75 && mouseY >= 30 + tabOffset3 + stickerOffset2 && mouseY <= 30 + tabOffset3 + stickerOffset2 + 75 && mouseIsPressed && !currSelecting) {
              mouseIsPressed = false
              createSticker(i, category);
            }
          }

          tabOffset2 += 75
          stickerOffset += 10
          tabOffset3 += 75
          stickerOffset2 += 10
        }
      }

      if (showDoodlesStickers) {
        tabOffset2 = 0
        stickerOffset = 0
        tabOffset3 = 0
        stickerOffset2 = 0
        category = "doodles"
        for (let i = 0; i < doodlesStickersImgs.length; i++) {
          if (i < 4) {
            image(doodlesStickersImgs[i], 110, 370 + tabOffset2 + stickerOffset, 75, 75)
            if (mouseX >= 110 && mouseX <= 110 + 75 && mouseY >= 370 + tabOffset2 + stickerOffset && mouseY <= 370 + tabOffset2 + stickerOffset + 75 && mouseIsPressed && !currSelecting) {
              mouseIsPressed = false
              createSticker(i, category);
            }
          } else {
            image(doodlesStickersImgs[i], 200, 30 + tabOffset3 + stickerOffset2, 75, 75)
            if (mouseX >= 200 && mouseX <= 200 + 75 && mouseY >= 30 + tabOffset3 + stickerOffset2 && mouseY <= 30 + tabOffset3 + stickerOffset2 + 75 && mouseIsPressed && !currSelecting) {
              mouseIsPressed = false
              createSticker(i, category);
            }
          }

          tabOffset2 += 75
          stickerOffset += 10
          tabOffset3 += 75
          stickerOffset2 += 10

        }
        tabOffset2 += 55
      }

      if (showReactionsStickers) {
        tabOffset2 = 0
        stickerOffset = 0
        tabOffset3 = 0
        stickerOffset2 = 0
        category = "reactions"
        for (let i = 0; i < reactionsStickersImgs.length; i++) {
          if (i < 4) {
            image(reactionsStickersImgs[i], 110, 370 + tabOffset2 + stickerOffset, 75, 75)
            if (mouseX >= 110 && mouseX <= 110 + 75 && mouseY >= 370 + tabOffset2 + stickerOffset && mouseY <= 370 + tabOffset2 + stickerOffset + 75 && mouseIsPressed && !currSelecting) {
              mouseIsPressed = false
              createSticker(i, category);
            }
          } else {
            image(reactionsStickersImgs[i], 200, 30 + tabOffset3 + stickerOffset2, 75, 75)
            if (mouseX >= 200 && mouseX <= 200 + 75 && mouseY >= 30 + tabOffset3 + stickerOffset2 && mouseY <= 30 + tabOffset3 + stickerOffset2 + 75 && mouseIsPressed && !currSelecting) {
              mouseIsPressed = false
              createSticker(i, category);
            }
  
          }
          tabOffset2 += 75
          stickerOffset += 10
          tabOffset3 += 75
          stickerOffset2 += 10
        }
      }
      if (showWordsStickers) {
        tabOffset2 = 0
        stickerOffset = 0
        tabOffset3 = 0
        stickerOffset2 = 0
        category = "words"
        for (let i = 0; i < wordsStickersImgs.length; i++) {
          if (i < 4) {
            image(wordsStickersImgs[i], 110, 370 + tabOffset2 + stickerOffset, 75, 75)
            if (mouseX >= 110 && mouseX <= 110 + 75 && mouseY >= 370 + tabOffset2 + stickerOffset && mouseY <= 370 + tabOffset2 + stickerOffset + 75 && mouseIsPressed && !currSelecting) {
              mouseIsPressed = false
              createSticker(i, category);
            }
          } else {
            image(wordsStickersImgs[i], 200, 30 + tabOffset3 + stickerOffset2, 75, 75)
            if (mouseX >= 200 && mouseX <= 200 + 75 && mouseY >= 30 + tabOffset3 + stickerOffset2 && mouseY <= 30 + tabOffset3 + stickerOffset2 + 75 && mouseIsPressed && !currSelecting) {
              mouseIsPressed = false
              createSticker(i, category);
            }
  
          }
          tabOffset2 += 75
          stickerOffset += 10
          tabOffset3 += 75
          stickerOffset2 += 10
        }
      }
    }

    

    

    //food sticker button
    if (mouseX >= 290 && mouseX <= 290 + 35 && mouseY >= 359 && mouseY <= 359 + 88.75 && mouseIsPressed && !currSelecting) {
      mouseIsPressed = false
      // console.log('food pressed')
      showFoodStickers = true
      showDoodlesStickers = false
      showReactionsStickers = false
      showWordsStickers = false
    }

    //doodles sticker button
    if (mouseX >= 290 && mouseX <= 290 + 35 && mouseY >= 359 + 88.75 && mouseY <= 359 + 88.75 + 88.75 && mouseIsPressed && !currSelecting) {
      mouseIsPressed = false
      // console.log('doodles pressed')
      showFoodStickers = false
      showDoodlesStickers = true
      showReactionsStickers = false
      showWordsStickers = false
    }

    //reactions sticker button
    if (mouseX >= 290 && mouseX <= 290 + 35 && mouseY >= 359 + 88.75 + 88.75 && mouseY <= 359 + 88.75 + 88.75 + 88.75 && mouseIsPressed && !currSelecting) {
      mouseIsPressed = false
      // console.log('reactions pressed')
      showFoodStickers = false
      showDoodlesStickers = false
      showReactionsStickers = true
      showWordsStickers = false

    }

    //words sticker button
    if (mouseX >= 290 && mouseX <= 290 + 35 && mouseY >= 359 + 88.75 + 88.75 + 88.75 && mouseY <= 359 + 88.75 + 88.75 + 88.75 + 88.75 && mouseIsPressed && !currSelecting) {
      mouseIsPressed = false
      console.log('words pressed')
      showFoodStickers = false
      showDoodlesStickers = false
      showReactionsStickers = false
      showWordsStickers = true

    }

    //5 TEXT TOOL
    image(textTool, 10, 450, 80, 80)

    if (mouseX >= 10 && mouseX <= 90 && mouseY >= 450 && mouseY <= 530 && mouseIsPressed && !currSelecting) {
      mouseIsPressed = false

      temp = createGraphics(width + gridSize, height + gridSize)
      temp.content = new TextBox(width / 2 - 50 - offsetX, height / 2 - 50 - offsetY, 200, 100)

      let uniqueID = Math.floor(Date.now() + Math.random());
      layers.set(uniqueID, temp);

      showStickies = false
      showStickers = false
      showShapes = false
      handMode = false
    }

    //6 SELECT TOOL
    image(selectTool, 10, 540, 80, 80)

    //7 HAND TOOL
    image(handTool, 10, 630, 80, 80)

    //SHAPE BUTTON
    //show or hide shape options from toolbar
    if (mouseX >= 10 && mouseX <= 90 && mouseY >= 180 && mouseY <= 260 && mouseIsPressed && !currSelecting) {
      mouseIsPressed = false
      if (showShapes) {
        showShapes = false
      } else {
        showShapes = true
        showStickies = false
        showStickers = false
        handMode = false
        showRecordPlayer = false

      }
    }

    //STICKY BUTTON
    //show or hide sticky note options from toolbar
    if (mouseX >= 10 && mouseX <= 90 && mouseY >= 270 && mouseY <= 350 && mouseIsPressed && !currSelecting) {
      mouseIsPressed = false
      if (showStickies) {
        showStickies = false
      } else {
        showStickies = true
        showStickers = false
        showShapes = false
        handMode = false
        showRecordPlayer = false

      }
    }

    //STICKER BUTTON 
    //show or hide sticker options from toolbar
    if (mouseX >= 10 && mouseX <= 90 && mouseY >= 360 && mouseY <= 440 && mouseIsPressed && !currSelecting) {
      mouseIsPressed = false
      if (showStickers) {
        showStickers = false
      } else {
        showStickers = true
        showStickies = false
        showShapes = false
        handMode = false
        showRecordPlayer = false

      }
    }

    //change to pointer mode
    if (mouseX >= 10 && mouseX <= 90 && mouseY >= 560 && mouseY <= 640 && mouseIsPressed) {
      mouseIsPressed = false
      handMode = false
    }

    //change to hand mode
    if (mouseX >= 0 && mouseX <= 50 && mouseY >= 650 && mouseY <= 730 && mouseIsPressed) {
      mouseIsPressed = false
      handMode = true
      showStickies = false
      showStickers = false
    }

    //setting cursor
    if (handMode) {
      if (dragging) {
        cursor("grabbing")
      } else {
        cursor("grab")
      }
    } else {
      cursor(ARROW)
    }
  }
}

//get text from text input
function changeText() {
  currTxt = event.currentTarget.value
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

function createUniqueID() {
  return Math.floor(Date.now() + Math.random());
}

function createSticker(i, category) {
  temp = createGraphics(width + gridSize, height + gridSize)
  let uniqueID = createUniqueID();
  temp.content = new Sticker(i, width / 2 - 50 - offsetX, height / 2 - 50 - offsetY, 100, category, uniqueID)
  layers.set(uniqueID, temp);

  // tell all other users that we have added a new layer
  socket.emit('new_sticker', {
    uniqueID: uniqueID, 
    layer: {
      stickerID: i,
      x: temp.content.x,
      y: temp.content.y,
      s: temp.content.s,
      category: category,
    }
  });
}