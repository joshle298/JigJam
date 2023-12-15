let debounceTimer;

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
  
      this.txtInput = createInput() //text input
      this.txtInput.input(() => handleTextInput());
  
      this.id = id;
    }
  
    display() {
      //sticky bg
      fill(this.col)
      rect(this.x + offsetX, this.y + offsetY, this.s, this.s)
  
      //sticky text
      fill(0)
      textWrap(CHAR)
      textSize(12)
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
  

        // emit the sticky's new text only when the user is done typing
        this.txtInput.input(changeText) //get text from input
        this.txt = currTxt

        this.txtInput.value(this.txt)

        socket.emit('change_text', {
          txt: this.txt,
          id: this.id
        });
  
        //start resizing
        if (dist(mouseX, mouseY, this.x + offsetX + this.s, this.y + offsetY + this.s) <= 10 && mouseIsPressed && !this.moving) {
          this.resizing = true
  
          //delete sticky
        } else if (dist(mouseX, mouseY, this.x + offsetX + this.s, this.y + offsetY) <= 10 && mouseIsPressed && !this.resizing && !this.moving) {
          this.txtInput.hide()
          currTxt = ""

          // delete sticky
          socket.emit('delete_layer', {
            id: this.id
          });

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

          // emit the sticky's new position
          socket.emit('resize_layer', {
            s: this.s,
            id: this.id
          });

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

  function handleTextInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      this.txt = this.txtInput.value();
      socket.emit('change_text', {
        txt: this.txt,
        id: this.id
      });
    }, 500); // Waits for 500 ms of no input before emitting
  }