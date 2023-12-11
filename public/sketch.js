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
let foodStickerImgs = [] //array for food sticker images
let doodlesStickersImgs = [] //array for doodles sticker images
let reactionsStickersImgs = [] //array for reactions sticker images
let wordsStickersImgs = [] //array for words sticker images

let tabOffset2 = 0 //y offset to display secondary toolbar tab items
let tabOffset3 = 0 //y offset to display secondary toolbar tab items
let stickerOffset = 0 //padding in sticker toolbar, column 1
let stickerOffset2 = 0 //padding in sticker toolbar, column 2

let currTxt = "" //current content of text being edited

let layers = new Map(); // map for layers with graphics
let users = [] //array for users

let category;

//tool images
let handTool;
let lineTool;
let selectTool;
let shapeTool;
let stickerTool;
let stickyTool;
let textTool;

let showFoodStickers = true;
let showDoodlesStickers = false;
let showReactionsStickers = false;
let showWordsStickers = false;
let creatorName = "Kaitlyn Zou" //temporary var for user input name

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
    socket.on('new_user', function(message) {
      console.log("A new user has joined!");
      console.log(message);

      // store the newly joined user in our object
      users[message.id] = message;
  });

    // listen for all previous users
    socket.on('all_previous_users', function(message) {
      console.log("Got all previous users!");
      console.log(message);

      // store these users
      for (let id in message) {
          users[id] = message[id];
      }
      console.log(users);
  });

  // listen for all layers in the canvas
  socket.on('all_previous_layers', function(message) {
    console.log("Got all previous layers!");
    console.log(message);

    for(let layer in message) {
      console.log(layer);
      layers.set(layer.uniqueID, layer.layer);
    }
    // // store these layers
    // for (let id in message) {
    //     layers[id] = message[id];
    // }

    console.log(layers);
  });

  // listen for any new layers that may have been added
  socket.on('new_layer', function(msg) {
    console.log("A new layer has been added!");
    console.log(msg);
    newSticky = createGraphics(width + gridSize, height + gridSize);
    
    // Assuming msg.col is an array [r, g, b]
    let col = color(msg.layer.col[0], msg.layer.col[1], msg.layer.col[2]);
    newSticky.content = new Sticky(col, msg.layer.x, msg.layer.y, msg.layer.s, "other", msg.uniqueID);
    newSticky.content.selected = false;
    currSelecting = false;
    // use the info to add new stickies to canvas
    // temp = createGraphics(width + gridSize, height + gridSize)
    // temp.content = new Shape(color(msg.id, msg.col.levels[0], msg.col.levels[1], msg.col.levels[2]), msg.x, msg.y, msg.s)
    // store the newly added layer in our object
    layers.set(msg.uniqueID, newSticky);

    console.log(layers);
  });

  // listen for movement of layers: need keyvalue, x, y
  socket.on('move_layer', function(msg) {
    console.log("a layer is being moved");
    console.log(msg);

    // update the layer in our layers map
    let layer = layers.get(msg.id);
    layer.content.x = msg.x;
    layer.content.y = msg.y;
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


  handTool = loadImage("icons/handTool.png");
  lineTool = loadImage("icons/lineTool.png");
  selectTool = loadImage("icons/selectTool.png");
  shapeTool = loadImage("icons/shapeTool.png");
  stickerTool = loadImage("icons/stickerTool.png");
  stickyTool = loadImage("icons/stickyTool.png");
  textTool = loadImage("icons/textTool.png");



}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // buffer to pre-render the dot grid
  gridBuffer = createGraphics(width + gridSize, height + gridSize);
  drawGridBuffer();
  noStroke()
  strokeCap(ROUND)

  //add colors to sticky array & shape array
  stickyCols = [color(255, 115, 115), color(255, 178, 115), color(255, 241, 115), color(155, 255, 115), color(115, 236, 255), color(183, 151, 252)]
  shapeCols = [color(50), color(128), color(255, 46, 46), color(255, 126, 46), color(255, 210, 46), color(46, 255, 95), color(46, 182, 255), color(164, 46, 255), color(255, 46, 144)]
}

function draw() {
  background(255);

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
  fill('#f2f2f2')
  stroke('black')
  strokeWeight(1)
  rect(20, 20, 40, 40, 9)

  //DOCUMENT TITLE
  fill('#f2f2f2')
  stroke('black')
  strokeWeight(1)
  rect(80, 20, 200, 40, 9)
  textSize(20)
  fill('black')
  noStroke()
  text("Untitled", 95, 47)

  //ACTIVE USERS
  fill('#d3ff8a')
  stroke('black')
  strokeWeight(1)
  rect(windowWidth - 60, 20, 40, 40, 9)

  //sticker background
  fill('#f2f2f2')
  rect(0, 80, 100, 640, 0, 9, 9, 0)

  //1 LINE TOOL
  image(lineTool, 10, 90, 80, 80)

  if (mouseX >= 10 && mouseX <= 90 && mouseY >= 90 && mouseY <= 170 && mouseIsPressed && !currSelecting) {
    mouseIsPressed = false

    temp = createGraphics(width + gridSize, height + gridSize)
    temp.content = new Line(round(random(0, shapeCols.length - 1)), width / 2 - offsetX - 50, height / 2 - offsetY - 50, width / 2 - offsetX + 50, height / 2 - offsetY + 50)
    let uniqueID = Math.floor(Date.now() + Math.random());
    layers.set(uniqueID, temp);

    showStickies = false
    showStickers = false
    showShapes = false
    handMode = false
  }

  //2 SHAPE TOOL
  image(shapeTool, 10, 180, 80, 80)

  //shapes toolbar
  if (showShapes) {
    fill("#eaeaea")
    rect(100, 180, 100, (70 * 4) + (5 * 4), 0, 9, 9, 0)

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
        let uniqueID = Math.floor(Date.now() + Math.random());
        layers.set(uniqueID, temp);
        
        // // tell all other users that we have added a new layer
        // socket.emit('new_layer', {uniqueID: uniqueID, layer:  {
        //   id: temp.content.id,
        //   col: temp.content.col,
        //   x: temp.content.x,
        //   y: temp.content.y,
        //   s: temp.content.s
        // }});
      }

      // tabOffset2 += 55
      tabOffset2 += 70
    }
  }

  //3 STICKY TOOL
  image(stickyTool, 10, 270, 80, 80)

  //sticky note toolbar
  if (showStickies) {
    fill("#eaeaea")
    rect(100, 270, 100, (50 * 6) + (5 * 6) + 107, 0, 9, 9, 0)

    tabOffset2 = 0

    //show sticky note colors, add a new sticky note on new layer once select color
    for (let i = 0; i < 6; i++) {
      fill(stickyCols[i])
      noStroke()
      rect(120, 285 + tabOffset2, 57)

      if (mouseX >= 120 && mouseX <= 120 + 57 && mouseY >= 285 + tabOffset2 && mouseY <= 285 + tabOffset2 + 57 && mouseIsPressed && !currSelecting) {
        mouseIsPressed = false

        let uniqueID = Math.floor(Date.now() + Math.random());
        temp = createGraphics(width + gridSize, height + gridSize)
        temp.content = new Sticky(stickyCols[i], width / 2 - 50 - offsetX, height / 2 - 50 - offsetY, 100, creatorName, uniqueID);
        // temp.content.txtInput.style.position = "fixed"
        // temp.content.txtInput.style.zIndex = String(i)
        // console.log(temp.content.txtInput.style.zIndex)
        layers.set(uniqueID, temp);
        
        temp.content.id = uniqueID;

        socket.emit('new_layer', {
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

    let selectedTabColor = '#eaeaea'
    let unselectedTabColor = '#bababa'

    let foodTabColor
    let doodlesTabColor
    let reactionsTabColor
    let wordsTabColor

    fill("#eaeaea")
    strokeWeight(1)
    rect(100, 359, 100 + 90 + 35, (50 * 6) + (5 * 6) + 25, 0, 9, 9, 0)

    // if (category == 'foods') {
    //   foodTabColor = selectedTabColor
    //   doodlesTabColor = unselectedTabColor
    //   reactionsTabColor = unselectedTabColor
    //   wordsTabColor = unselectedTabColor
    // } else if (category == 'doodles') {
    //   foodTabColor = unselectedTabColor
    //   doodlesTabColor = selectedTabColor
    //   reactionsTabColor = unselectedTabColor
    //   wordsTabColor = unselectedTabColor
    // } else if (category == 'reactions') {
    //   foodTabColor = unselectedTabColor
    //   doodlesTabColor = selectedTabColor
    //   reactionsTabColor = unselectedTabColor
    //   wordsTabColor = unselectedTabColor
    // }

    //food tab
    fill(selectedTabColor)
    rect(200 + 90, 359, 35, 88.75, 0, 9, 0, 0)
    push()
    translate(300, 380)
    rotate(radians(90))
    fill('black')
    strokeWeight(0.2)
    textSize(16)
    text("Foods", 0, 0)
    pop()

    //doodles tab
    fill(unselectedTabColor)
    rect(200 + 90, 359 + 88.75, 35, 88.75, 0, 0, 0, 0)
    push()
    translate(300, 460)
    rotate(radians(90))
    fill('black')
    strokeWeight(0.2)
    textSize(16)
    text("Doodles", 0, 0)
    pop()

    //reactions tab
    fill(unselectedTabColor)
    rect(200 + 90, 359 + 88.75 + 88.75, 35, 88.75, 0, 0, 0, 0)
    push()
    translate(300, 545)
    rotate(radians(90))
    fill('black')
    strokeWeight(0.2)
    textSize(16)
    text("Reactions", 0, 0)
    pop()

    //words tab
    fill(unselectedTabColor)
    rect(200 + 90, 359 + 88.75 + 88.75 + 88.75, 35, 88.75, 0, 0, 9, 0)
    push()
    translate(300, 645)
    rotate(radians(90))
    fill('black')
    strokeWeight(0.2)
    textSize(16)
    text("Words", 0, 0)
    pop()

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
            temp = createGraphics(width + gridSize, height + gridSize)
            temp.content = new Sticker(i, width / 2 - 50 - offsetX, height / 2 - 50 - offsetY, 100, category)
            let uniqueID = Math.floor(Date.now() + Math.random());
            layers.set(uniqueID, temp);
          }
        } else {
          image(foodStickerImgs[i], 200, 30 + tabOffset3 + stickerOffset2, 75, 75)
          if (mouseX >= 200 && mouseX <= 200 + 75 && mouseY >= 30 + tabOffset3 + stickerOffset2 && mouseY <= 30 + tabOffset3 + stickerOffset2 + 75 && mouseIsPressed && !currSelecting) {
            mouseIsPressed = false

            temp = createGraphics(width + gridSize, height + gridSize)
            temp.content = new Sticker(i, width / 2 - 50 - offsetX, height / 2 - 50 - offsetY, 100, category)
            let uniqueID = Math.floor(Date.now() + Math.random());
            layers.set(uniqueID, temp);
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

            temp = createGraphics(width + gridSize, height + gridSize)
            temp.content = new Sticker(i, width / 2 - 50 - offsetX, height / 2 - 50 - offsetY, 100, category)
            let uniqueID = Math.floor(Date.now() + Math.random());
            layers.set(uniqueID, temp);
          }
        } else {
          image(doodlesStickersImgs[i], 200, 30 + tabOffset3 + stickerOffset2, 75, 75)
          if (mouseX >= 200 && mouseX <= 200 + 75 && mouseY >= 30 + tabOffset3 + stickerOffset2 && mouseY <= 30 + tabOffset3 + stickerOffset2 + 75 && mouseIsPressed && !currSelecting) {
            mouseIsPressed = false

            temp = createGraphics(width + gridSize, height + gridSize)
            temp.content = new Sticker(i, width / 2 - 50 - offsetX, height / 2 - 50 - offsetY, 100, category)
            let uniqueID = Math.floor(Date.now() + Math.random());
            layers.set(uniqueID, temp);
          }
        }

        tabOffset2 += 75
        stickerOffset += 10
        tabOffset3 += 75
        stickerOffset2 += 10

      }
      tabOffset2 += 55
    }
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

          temp = createGraphics(width + gridSize, height + gridSize)
          temp.content = new Sticker(i, width / 2 - 50 - offsetX, height / 2 - 50 - offsetY, 100, category)
          let uniqueID = Math.floor(Date.now() + Math.random());
          layers.set(uniqueID, temp);
        }
      } else {
        image(reactionsStickersImgs[i], 200, 30 + tabOffset3 + stickerOffset2, 75, 75)
        if (mouseX >= 200 && mouseX <= 200 + 75 && mouseY >= 30 + tabOffset3 + stickerOffset2 && mouseY <= 30 + tabOffset3 + stickerOffset2 + 75 && mouseIsPressed && !currSelecting) {
          mouseIsPressed = false

          temp = createGraphics(width + gridSize, height + gridSize)
          temp.content = new Sticker(i, width / 2 - 50 - offsetX, height / 2 - 50 - offsetY, 100, category)
          let uniqueID = Math.floor(Date.now() + Math.random());
          layers.set(uniqueID, temp);
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

          temp = createGraphics(width + gridSize, height + gridSize)
          temp.content = new Sticker(i, width / 2 - 50 - offsetX, height / 2 - 50 - offsetY, 100, category)
          let uniqueID = Math.floor(Date.now() + Math.random());
          layers.set(uniqueID, temp);
        }
      } else {
        image(wordsStickersImgs[i], 200, 30 + tabOffset3 + stickerOffset2, 75, 75)
        if (mouseX >= 200 && mouseX <= 200 + 75 && mouseY >= 30 + tabOffset3 + stickerOffset2 && mouseY <= 30 + tabOffset3 + stickerOffset2 + 75 && mouseIsPressed && !currSelecting) {
          mouseIsPressed = false

          temp = createGraphics(width + gridSize, height + gridSize)
          temp.content = new Sticker(i, width / 2 - 50 - offsetX, height / 2 - 50 - offsetY, 100, category)
          let uniqueID = Math.floor(Date.now() + Math.random());
          layers.set(uniqueID, temp);
        }

      }
      tabOffset2 += 75
      stickerOffset += 10
      tabOffset3 += 75
      stickerOffset2 += 10
    }
  }

  //food sticker button
  if (mouseX >= 290 && mouseX <= 290 + 35 && mouseY >= 359 && mouseY <= 359 + 88.75 && mouseIsPressed && !currSelecting) {
    mouseIsPressed = false
    console.log('food pressed')
    showFoodStickers = true
    showDoodlesStickers = false
    showReactionsStickers = false
    showWordsStickers = false
  }

  //doodles sticker button
  if (mouseX >= 290 && mouseX <= 290 + 35 && mouseY >= 359 + 88.75 && mouseY <= 359 + 88.75 + 88.75 && mouseIsPressed && !currSelecting) {
    mouseIsPressed = false
    console.log('doodles pressed')
    showFoodStickers = false
    showDoodlesStickers = true
    showReactionsStickers = false
    showWordsStickers = false
  }

  //reactions sticker button
  if (mouseX >= 290 && mouseX <= 290 + 35 && mouseY >= 359 + 88.75 + 88.75 && mouseY <= 359 + 88.75 + 88.75 + 88.75 && mouseIsPressed && !currSelecting) {
    mouseIsPressed = false
    console.log('reactions pressed')
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

//get text from text input
function changeText() {
  currTxt = event.currentTarget.value
}

//line class
class Line {
  constructor(col, x1, y1, x2, y2) {
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

    // this.txtInput = createInput("") //text input
  }

  display() {
    //show line
    push()
    stroke(this.col)
    strokeWeight(this.wt)
    line(this.x1 + offsetX, this.y1 + offsetY, this.x2 + offsetX, this.y2 + offsetY)
    pop()

    //when selected
    if (this.selected) {
      push() //selection box
      noFill()
      strokeWeight(4)
      stroke("purple")
      rectMode(RADIUS)
      rect(
        Math.min(this.x1, this.x2) + abs(this.x1 - this.x2) / 2 + offsetX,
        Math.min(this.y1, this.y2) + abs(this.y1 - this.y2) / 2 + offsetY,
        abs(this.x1 - this.x2) / 2 + 20,
        abs(this.y1 - this.y2) / 2 + 20
      )
      pop()

      push() //delete btn
      fill("red")
      ellipse(Math.max(this.x1, this.x2) + 20 + offsetX, Math.min(this.y1, this.y2) - 20 + offsetY, 20)
      fill("white")
      rectMode(CENTER)
      rect(Math.max(this.x1, this.x2) + 20 + offsetX, Math.min(this.y1, this.y2) - 20 + offsetY, 10, 2)
      pop()

      push() //resize points
      fill("green")
      ellipse(this.x1 + offsetX, this.y1 + offsetY, 15)
      ellipse(this.x2 + offsetX, this.y2 + offsetY, 15)
      pop()

      let colorOff = 0 //offset to display colors

      push() //show color options, change color if picked
      for (let i = 0; i < shapeCols.length; i++) {
        fill(shapeCols[i])
        ellipse(Math.min(this.x1, this.x2) + offsetX - 15 + colorOff, Math.max(this.y1, this.y2) + offsetY + 45, 20)

        if (dist(mouseX, mouseY, Math.min(this.x1, this.x2) + offsetX - 15 + colorOff, Math.max(this.y1, this.y2) + offsetY + 45) <= 10 && mouseIsPressed && !this.resizing1 && !this.resizing2 && !this.moving) {
          this.col = shapeCols[i]
        }
        colorOff += 25
      }
      pop()

      push()
      fill(150) //decrease stroke wt btn
      ellipse(Math.min(this.x1, this.x2) + offsetX - 15, Math.max(this.y1, this.y2) + offsetY + 45 + 30, 20)
      fill("white")
      rectMode(CENTER)
      rect(Math.min(this.x1, this.x2) + offsetX - 15, Math.max(this.y1, this.y2) + offsetY + 45 + 30, 10, 2)
      fill(150) //increase stroke wt btn
      ellipse(Math.min(this.x1, this.x2) + offsetX - 15 + 25, Math.max(this.y1, this.y2) + offsetY + 45 + 30, 20)
      fill("white")
      rectMode(CENTER)
      rect(Math.min(this.x1, this.x2) + offsetX - 15 + 25, Math.max(this.y1, this.y2) + offsetY + 45 + 30, 10, 2)
      rect(Math.min(this.x1, this.x2) + offsetX - 15 + 25, Math.max(this.y1, this.y2) + offsetY + 45 + 30, 2, 10)
      pop()

      //start resizing pt 1
      if (dist(mouseX, mouseY, this.x1 + offsetX, this.y1 + offsetY) <= 7.5 && mouseIsPressed && !this.moving) {
        this.resizing1 = true

        //start resizing pt 2
      } else if (dist(mouseX, mouseY, this.x2 + offsetX, this.y2 + offsetY) <= 7.5 && mouseIsPressed && !this.moving) {
        this.resizing2 = true

        //delete line
      } else if (dist(mouseX, mouseY, Math.max(this.x1, this.x2) + 20 + offsetX, Math.min(this.y1, this.y2) - 20 + offsetY) <= 10 && mouseIsPressed && !this.resizing1 && !this.resizing2 && !this.moving || keyIsDown(BACKSPACE)) {
        return true

        //decrease font size
      } else if (dist(mouseX, mouseY, Math.min(this.x1, this.x2) + offsetX - 15, Math.max(this.y1, this.y2) + offsetY + 45 + 30) <= 10 && mouseIsPressed && !this.resizing1 && !this.resizing2 && !this.moving) {
        mouseIsPressed = false
        this.wt -= 2

        //increase stroke weight
      } else if (dist(mouseX, mouseY, Math.min(this.x1, this.x2) + offsetX - 15 + 25, Math.max(this.y1, this.y2) + offsetY + 45 + 30) <= 10 && mouseIsPressed && !this.resizing1 && !this.resizing2 && !this.moving) {
        mouseIsPressed = false
        this.wt += 2

        //move line
      } else if (mouseIsPressed && !this.resizing1 && !this.resizing2) {
        this.moving = true
      }

      //change size when resizing
      if (this.resizing1) {
        this.x1 = mouseX
        this.y1 = mouseY
        if (!mouseIsPressed) {
          this.resizing1 = false
        }
      }
      if (this.resizing2) {
        this.x2 = mouseX
        this.y2 = mouseY
        if (!mouseIsPressed) {
          this.resizing2 = false
        }
      }

      //move line when moving
      if (this.moving) {
        this.x1 += mouseX - pmouseX
        this.y1 += mouseY - pmouseY
        this.x2 += mouseX - pmouseX
        this.y2 += mouseY - pmouseY
        if (!mouseIsPressed) {
          this.moving = false
        }
      }
    }
    this.wt = constrain(this.wt, 1, 20)
  }

  //selecting this line
  selecting() {
    if (
      mouseX >= Math.min(this.x1, this.x2) + abs(this.x1 - this.x2) / 2 + offsetX - (abs(this.x1 - this.x2) / 2 + 20) &&
      mouseX <= Math.min(this.x1, this.x2) + abs(this.x1 - this.x2) / 2 + offsetX + (abs(this.x1 - this.x2) / 2 + 20) &&
      mouseY >= Math.min(this.y1, this.y2) + abs(this.y1 - this.y2) / 2 + offsetY - (abs(this.y1 - this.y2) / 2 + 20) &&
      mouseY <= Math.min(this.y1, this.y2) + abs(this.y1 - this.y2) / 2 + offsetY + (abs(this.y1 - this.y2) / 2 + 20) &&
      mouseIsPressed
    ) {
      this.selected = true
      currSelecting = true
    }
  }

  //unselecting this line
  unselecting() {
    if (
      !(
        mouseX >= Math.min(this.x1, this.x2) + abs(this.x1 - this.x2) / 2 + offsetX - (abs(this.x1 - this.x2) / 2 + 20) &&
        mouseX <= Math.min(this.x1, this.x2) + abs(this.x1 - this.x2) / 2 + offsetX + (abs(this.x1 - this.x2) / 2 + 20) &&
        mouseY >= Math.min(this.y1, this.y2) + abs(this.y1 - this.y2) / 2 + offsetY - (abs(this.y1 - this.y2) / 2 + 20) &&
        mouseY <= Math.min(this.y1, this.y2) + abs(this.y1 - this.y2) / 2 + offsetY + (abs(this.y1 - this.y2) / 2 + 20)) &&
      !(
        mouseX >= Math.min(this.x1, this.x2) + offsetX - 15 - 5 &&
        mouseX <= Math.min(this.x1, this.x2) + offsetX - 15 - 5 + (20 * 9) + (5 * 8) &&
        mouseY >= Math.max(this.y1, this.y2) + offsetY &&
        mouseY <= Math.max(this.y1, this.y2) + offsetY + 45 + 10) &&

      !(
        mouseX >= Math.min(this.x1, this.x2) + offsetX - 15 - 5 &&
        mouseX <= Math.min(this.x1, this.x2) + offsetX - 15 - 5 + (20 * 2) + 5 &&
        mouseY >= Math.max(this.y1, this.y2) + offsetY &&
        mouseY <= Math.max(this.y1, this.y2) + offsetY + 45 + 10 + 25) &&
      mouseIsPressed && this.selected && !this.resizing1 && !this.resizing2) {
      this.selected = false
      currSelecting = false
    }
  }
}

//shape class
class Shape {
  constructor(id, col, x, y, s) {
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

  display() {
    //show shape depending on what is selected
    fill(this.col)
    push()
    if (this.id == 0) {
      ellipseMode(CORNER)
      ellipse(this.x + offsetX, this.y + offsetY, this.s)
    } else if (this.id == 1) {
      rect(this.x + offsetX, this.y + offsetY, this.s)
    } else if (this.id == 2) {
      triangle(this.x + offsetX + this.s / 2, this.y + offsetY + this.s * 0.05, this.x + offsetX, this.y + offsetY + this.s - this.s * 0.05, this.x + offsetX + this.s, this.y + offsetY + this.s - this.s * 0.05)
    } else if (this.id == 3) {
      push()
      translate(this.x + offsetX + this.s / 2, this.y + offsetY + this.s / 2)
      rotate(radians(45))
      rectMode(CENTER)
      rect(0, 0, this.s * 0.7)
      pop()
    }
    pop()

    //when selected
    if (this.selected) {
      push() //selection box
      noFill()
      strokeWeight(4)
      stroke("purple")
      rect(this.x + offsetX, this.y + offsetY, this.s)
      pop()

      push() //delete btn
      fill("red")
      ellipse(this.x + offsetX + this.s, this.y + offsetY, 20)
      fill("white")
      rectMode(CENTER)
      rect(this.x + offsetX + this.s, this.y + offsetY, 10, 2)
      pop()

      push() //resize btn
      fill("green")
      ellipse(this.x + offsetX + this.s, this.y + offsetY + this.s, 20)
      pop()

      let colorOff = 0 //offset to display colors

      push() //show color options, change color if picked
      for (let i = 0; i < shapeCols.length; i++) {
        fill(shapeCols[i])
        ellipse(this.x + offsetX + 5 + colorOff, this.y + offsetY + this.s + 25, 20)

        if (dist(mouseX, mouseY, this.x + offsetX + 5 + colorOff, this.y + offsetY + this.s + 25) <= 10 && mouseIsPressed && !this.resizing && !this.moving) {
          this.col = shapeCols[i]
        }

        colorOff += 25
      }
      pop()

      //start resizing
      if (dist(mouseX, mouseY, this.x + offsetX + this.s, this.y + offsetY + this.s) <= 10 && mouseIsPressed && !this.moving) {
        this.resizing = true

        //delete shape
      } else if (dist(mouseX, mouseY, this.x + offsetX + this.s, this.y + offsetY) <= 10 && mouseIsPressed && !this.resizing && !this.moving || keyIsDown(BACKSPACE)) {
        return true

        //move shape
      } else if (mouseIsPressed && !this.resizing) {
        this.moving = true
      }

      //change size when resizing
      if (this.resizing) {
        // this.s += mouseX-pmouseX
        if (mouseX - this.x > mouseY - this.y) {
          this.s = mouseX - this.x
        } else {
          this.s = mouseY - this.y
        }
        if (!mouseIsPressed) {
          this.resizing = false
        }
      }

      //move shape when moving
      if (this.moving) {
        this.x += mouseX - pmouseX
        this.y += mouseY - pmouseY
        if (!mouseIsPressed) {
          this.moving = false
        }
      }

    }
    this.s = constrain(this.s, 20, width)
  }

  //selecting this shape
  selecting() {
    if (mouseX >= this.x + offsetX && mouseX <= this.x + offsetX + this.s && mouseY >= this.y + offsetY && mouseY <= this.y + offsetY + this.s && mouseIsPressed) {
      this.selected = true
      currSelecting = true
    }
  }

  //unselecting this shape
  unselecting() {
    if (!(mouseX >= this.x + offsetX && mouseX <= this.x + offsetX + this.s && mouseY >= this.y + offsetY && mouseY <= this.y + offsetY + this.s + 30) && !(mouseX >= this.x + offsetX - 5 && mouseX <= this.x + offsetX - 5 + (20 * 9) + (5 * 8) && mouseY >= this.y + offsetY + this.s && mouseY <= this.y + offsetY + this.s + 35) && mouseIsPressed && this.selected && !this.resizing) {
      this.selected = false
      currSelecting = false
    }
  }
}

//sticky note class
class Sticky {
  constructor(col, x, y, s, name, id) {
    this.col = col
    this.txt = ""
    this.x = x
    this.y = y
    this.s = s
    this.name = name

    this.selected = true //start with it selecting
    currSelecting = true

    this.resizing = false
    this.moving = false

    this.txtInput = createInput("") //text input

    this.id = id;
  }

  display() {
    //sticky bg
    fill(this.col)
    rect(this.x + offsetX, this.y + offsetY, this.s, this.s)

    //sticky text
    fill(0)
    textWrap(CHAR)
    text(this.txt, this.x + offsetX + 5, this.y + offsetY + 5, this.s - 10, this.s - 20)

    //creator name
    push()
    fill(80)
    textSize(10)
    text(this.name, this.x + offsetX + 5, this.y + offsetY + this.s - 14, this.s - 10, this.s - 10)
    pop()

    //position text input 
    this.txtInput.position(this.x + offsetX - 3, this.y + offsetY + this.s + 12)
    this.txtInput.size(this.s, 12)

    //when selected
    if (this.selected) {
      push() //selection box
      noFill()
      strokeWeight(4)
      stroke("purple")
      rect(this.x + offsetX, this.y + offsetY, this.s)
      pop()

      push() //delete btn
      fill("red")
      ellipse(this.x + offsetX + this.s, this.y + offsetY, 20)
      fill("white")
      rectMode(CENTER)
      rect(this.x + offsetX + this.s, this.y + offsetY, 10, 2)
      pop()

      push() //resize btn
      fill("green")
      ellipse(this.x + offsetX + this.s, this.y + offsetY + this.s, 20)
      pop()

      this.txtInput.input(changeText) //get text from input
      this.txt = currTxt

      //start resizing
      if (dist(mouseX, mouseY, this.x + offsetX + this.s, this.y + offsetY + this.s) <= 10 && mouseIsPressed && !this.moving) {
        this.resizing = true

        //delete sticky
      } else if (dist(mouseX, mouseY, this.x + offsetX + this.s, this.y + offsetY) <= 10 && mouseIsPressed && !this.resizing && !this.moving) {
        this.txtInput.hide()
        currTxt = ""
        return true

        //move sticky
      } else if (mouseX >= this.x + offsetX && mouseX <= this.x + offsetX + this.s && mouseY >= this.y + offsetY && mouseY <= this.y + offsetY + this.s && mouseIsPressed && !this.resizing) {
        this.moving = true
      }

      //change size when resizing
      if (this.resizing) {
        // this.s += mouseX-pmouseX
        if (mouseX - this.x > mouseY - this.y) {
          this.s = mouseX - this.x
        } else {
          this.s = mouseY - this.y
        }
        if (!mouseIsPressed) {
          this.resizing = false
        }
      }

      //move sticky when moving
      if (this.moving) {
        this.x += mouseX - pmouseX
        this.y += mouseY - pmouseY
        if (!mouseIsPressed) {
          this.moving = false
        }

        // emit the sticky's new position
        socket.emit('move_layer', {
          x: this.x,
          y: this.y,
          id: this.id
        });
      }

    }
    this.s = constrain(this.s, 100, width)
  }

  //selecting this sticky
  selecting() {
    if (mouseX >= this.x + offsetX && mouseX <= this.x + offsetX + this.s && mouseY >= this.y + offsetY && mouseY <= this.y + offsetY + this.s && mouseIsPressed) {
      this.selected = true
      currSelecting = true
      this.txtInput.show()
      currTxt = this.txt
    }
  }

  //unselecting this sticky
  unselecting() {
    if (!(mouseX >= this.x + offsetX && mouseX <= this.x + offsetX + this.s && mouseY >= this.y + offsetY && mouseY <= this.y + offsetY + this.s + 30) && mouseIsPressed && this.selected && !this.resizing) {
      this.selected = false
      currSelecting = false
      this.txtInput.hide()
      currTxt = ""
    }
  }
}

//sticker class
class Sticker {
  constructor(id, x, y, s, category) {
    this.id = id
    this.x = x
    this.y = y
    this.s = s
    this.c = category

    this.selected = false
    this.resizing = false
    this.moving = false

  }

  display() {
    //show sticker
    if (this.c == "foods") {
      image(foodStickerImgs[this.id], this.x + offsetX, this.y + offsetY, this.s, this.s)

    } else if (this.c == "doodles") {
      image(doodlesStickersImgs[this.id], this.x + offsetX, this.y + offsetY, this.s, this.s)

    } else if (this.c == "reactions") {
      image(reactionsStickersImgs[this.id], this.x + offsetX, this.y + offsetY, this.s, this.s)

    } else if (this.c == "words") {
      image(wordsStickersImgs[this.id], this.x + offsetX, this.y + offsetY, this.s, this.s)

    }

    //when selected
    if (this.selected) {
      push() //selection box
      noFill()
      strokeWeight(4)
      stroke("purple")
      rect(this.x + offsetX, this.y + offsetY, this.s)
      pop()

      push() //delete btn
      fill("red")
      ellipse(this.x + offsetX + this.s, this.y + offsetY, 20)
      fill("white")
      rectMode(CENTER)
      rect(this.x + offsetX + this.s, this.y + offsetY, 10, 2)
      pop()

      push() //resize btn
      fill("green")
      ellipse(this.x + offsetX + this.s, this.y + offsetY + this.s, 20)
      pop()

      //start resizing
      if (dist(mouseX, mouseY, this.x + offsetX + this.s, this.y + offsetY + this.s) <= 10 && mouseIsPressed && !this.moving) {
        this.resizing = true

        //delete sticker
      } else if (dist(mouseX, mouseY, this.x + offsetX + this.s, this.y + offsetY) <= 10 && mouseIsPressed && !this.resizing && !this.moving || keyIsDown(BACKSPACE)) {
        return true

        //start moving
      } else if (mouseIsPressed && !this.resizing) {
        this.moving = true
      }

      //resize sticker when resizing
      if (this.resizing) {
        // this.s += mouseX-pmouseX
        if (mouseX - this.x > mouseY - this.y) {
          this.s = mouseX - this.x
        } else {
          this.s = mouseY - this.y
        }
        if (!mouseIsPressed) {
          this.resizing = false
        }
      }

      //move sticker when moving
      if (this.moving) {
        this.x += mouseX - pmouseX
        this.y += mouseY - pmouseY
        if (!mouseIsPressed) {
          this.moving = false
        }
      }
    }
    this.s = constrain(this.s, 20, width)
  }

  //selecting this sticker
  selecting() {
    if (mouseX >= this.x + offsetX && mouseX <= this.x + offsetX + this.s && mouseY >= this.y + offsetY && mouseY <= this.y + offsetY + this.s && mouseIsPressed) {
      this.selected = true
      currSelecting = true
    }
  }

  //unselecting this sticker
  unselecting() {
    if (!(mouseX >= this.x + offsetX && mouseX <= this.x + offsetX + this.s && mouseY >= this.y + offsetY && mouseY <= this.y + offsetY + this.s) && mouseIsPressed && this.selected && !this.resizing) {
      this.selected = false
      currSelecting = false
    }
  }
}

//text box class
class TextBox {
  constructor(x, y, w, h) {
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

  display() {
    //text
    fill(0)
    textWrap(CHAR)
    push()
    textSize(this.txtSz)
    text(this.txt, this.x + offsetX + 5, this.y + offsetY + 5, this.w - 10, this.h - 10)
    pop()

    //position text input 
    this.txtInput.position(this.x + offsetX - 3, this.y + offsetY + this.h + 12)
    this.txtInput.size(this.w, 12)

    //when selected
    if (this.selected) {
      push() //selection box
      noFill()
      strokeWeight(4)
      stroke("purple")
      rect(this.x + offsetX, this.y + offsetY, this.w, this.h)
      pop()

      push() //delete btn
      fill("red")
      ellipse(this.x + offsetX + this.w, this.y + offsetY, 20)
      fill("white")
      rectMode(CENTER)
      rect(this.x + offsetX + this.w, this.y + offsetY, 10, 2)
      pop()

      push() //resize btn
      fill("green")
      ellipse(this.x + offsetX + this.w, this.y + offsetY + this.h, 20)
      pop()

      push()
      fill(150) //decrease font size btn
      ellipse(this.x + offsetX + 5, this.y + offsetY + this.h + 50, 20)
      fill("white")
      rectMode(CENTER)
      rect(this.x + offsetX + 5, this.y + offsetY + this.h + 50, 10, 2)
      fill(150) //increase font size btn
      ellipse(this.x + offsetX + 5 + 25, this.y + offsetY + this.h + 50, 20)
      fill("white")
      rectMode(CENTER)
      rect(this.x + offsetX + 5 + 25, this.y + offsetY + this.h + 50, 10, 2)
      rect(this.x + offsetX + 5 + 25, this.y + offsetY + this.h + 50, 2, 10)
      pop()

      this.txtInput.input(changeText) //get text from input
      this.txt = currTxt

      //start resizing
      if (dist(mouseX, mouseY, this.x + offsetX + this.w, this.y + offsetY + this.h) <= 10 && mouseIsPressed && !this.moving) {
        this.resizing = true

        //delete text
      } else if (dist(mouseX, mouseY, this.x + offsetX + this.w, this.y + offsetY) <= 10 && mouseIsPressed && !this.resizing && !this.moving) {
        this.txtInput.hide()
        currTxt = ""
        return true

        //decrease font size
      } else if (dist(mouseX, mouseY, this.x + offsetX + 5, this.y + offsetY + this.h + 50) <= 10 && mouseIsPressed && !this.resizing && !this.moving) {
        mouseIsPressed = false
        this.txtSz -= 2

        //increase font size
      } else if (dist(mouseX, mouseY, this.x + offsetX + 5 + 25, this.y + offsetY + this.h + 50) <= 10 && mouseIsPressed && !this.resizing && !this.moving) {
        mouseIsPressed = false
        this.txtSz += 2

        //move text
      } else if (mouseX >= this.x + offsetX && mouseX <= this.x + offsetX + this.w && mouseY >= this.y + offsetY && mouseY <= this.y + offsetY + this.h && mouseIsPressed && !this.resizing) {
        this.moving = true
      }

      //change size when resizing
      if (this.resizing) {
        this.w = mouseX - this.x
        this.h = mouseY - this.y
        if (!mouseIsPressed) {
          this.resizing = false
        }
      }

      //move text when moving
      if (this.moving) {
        this.x += mouseX - pmouseX
        this.y += mouseY - pmouseY
        if (!mouseIsPressed) {
          this.moving = false
        }
      }
    }

    this.w = constrain(this.w, 50, width)
    this.h = constrain(this.h, 25, width)
    this.txtSz = constrain(this.txtSz, 8, 40)
  }

  //selecting this textbox
  selecting() {
    if (mouseX >= this.x + offsetX && mouseX <= this.x + offsetX + this.w && mouseY >= this.y + offsetY && mouseY <= this.y + offsetY + this.h && mouseIsPressed) {
      this.selected = true
      currSelecting = true
      this.txtInput.show()
      currTxt = this.txt
    }
  }

  //unselecting this textbox
  unselecting() {
    if (!(mouseX >= this.x + offsetX && mouseX <= this.x + offsetX + this.w && mouseY >= this.y + offsetY && mouseY <= this.y + offsetY + this.h + 60) && mouseIsPressed && this.selected && !this.resizing) {
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