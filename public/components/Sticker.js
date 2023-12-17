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
        strokeWeight(1)
        stroke("#d4d4d4")
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