//shape class
class Shape {
    constructor(shapeID, col, x, y, s, id) {
        this.shapeID = shapeID
        this.col = col
        this.x = x
        this.y = y
        this.s = s
        this.id = id

        this.selected = true //start with it selecting
        currSelecting = true

        this.resizing = false
        this.moving = false
    }

    display() {
        //show shape depending on what is selected
        fill(shapeCols[this.col])
        push()
        noStroke()
        if (this.shapeID == 0) {
        ellipseMode(CORNER)
        ellipse(this.x + offsetX, this.y + offsetY, this.s)
        } else if (this.shapeID == 1) {
        rect(this.x + offsetX, this.y + offsetY, this.s)
        } else if (this.shapeID == 2) {
        triangle(this.x + offsetX + this.s / 2, this.y + offsetY + this.s * 0.05, this.x + offsetX, this.y + offsetY + this.s - this.s * 0.05, this.x + offsetX + this.s, this.y + offsetY + this.s - this.s * 0.05)
        } else if (this.shapeID == 3) {
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

        let colorOff = 0 //offset to display colors

        push() //show color options, change color if picked
        for (let i = 0; i < shapeCols.length; i++) {
            fill(shapeCols[i])
            ellipse(this.x + offsetX + 5 + colorOff, this.y + offsetY + this.s + 25, 20)

            if (dist(mouseX, mouseY, this.x + offsetX + 5 + colorOff, this.y + offsetY + this.s + 25) <= 10 && mouseIsPressed && !this.resizing && !this.moving) {
                 // emit the sticky's new color
                socket.emit('change_color_layer', {
                    col: i,
                    id: this.id
                });

                this.col = i
            }

            colorOff += 25
        }
        pop()

        //start resizing
        if (dist(mouseX, mouseY, this.x + offsetX + this.s, this.y + offsetY + this.s) <= 10 && mouseIsPressed && !this.moving) {
            this.resizing = true

            //delete shape
        } else if (dist(mouseX, mouseY, this.x + offsetX + this.s, this.y + offsetY) <= 10 && mouseIsPressed && !this.resizing && !this.moving || keyIsDown(BACKSPACE)) {
            socket.emit('delete_layer', {
                id: this.id
            });
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

             // emit the sticky's new size
             socket.emit('resize_layer', {
                s: this.s,
                id: this.id
            });

            if (!mouseIsPressed) {
            this.resizing = false
            }
        }

        //move shape when moving
        if (this.moving) {
            this.x += mouseX - pmouseX
            this.y += mouseY - pmouseY

            // emit the sticky's new position
            socket.emit('move_layer', {
                x: this.x,
                y: this.y,
                id: this.id
            });

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