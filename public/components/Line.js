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
        strokeWeight(1)
        stroke("#d4d4d4")
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