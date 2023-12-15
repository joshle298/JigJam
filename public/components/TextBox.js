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