//text box class
class TextBox {
    constructor(x, y, w, h, id) {
        this.txt = ""
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.txtSz = 12
        this.id = id

        this.selected = true //start with it selecting
        currSelecting = true

        this.resizing = false
        this.moving = false

        this.txtInput = createInput() //text input
        this.txtInput.input(() => handleTextInput());

        this.deleteBtnOffset
        this.selectBoxOffset

    }

    display() {
        //text
        fill(0)
        textWrap(CHAR)
        push()
        noStroke()
        textSize(this.txtSz)
        text(this.txt, this.x + offsetX + 5, this.y + offsetY + 15, this.w - 10, this.h - 10)
        pop()

        //position text input 
        this.txtInput.position(this.x + offsetX - 3, this.y + offsetY + this.h + 12)
        this.txtInput.size(this.w, 12)

        //when selected
        if (this.selected) {
            push() //selection box
            noFill()
            strokeWeight(1)
            stroke("#d4d4d4")
            if (this.txtSz > 20) {
                this.selectBoxOffset = 13
                this.deleteBtnOffset = 15

            } else {
                this.selectBoxOffset = 0
                this.deleteBtnOffset = 0
            }
            rect(this.x + offsetX, this.y + offsetY - this.selectBoxOffset, this.w, this.h)


            pop()

            push() //delete btn
            fill("red")
            ellipse(this.x + offsetX + this.w, this.y + offsetY - this.deleteBtnOffset, 20)
            fill("white")
            rectMode(CENTER)
            rect(this.x + offsetX + this.w, this.y + offsetY - this.deleteBtnOffset, 10, 2)
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

            // emit the sticky's new text only when the user is done typing
            this.txtInput.input(changeText) //get text from input
            this.txt = currTxt

            this.txtInput.value(this.txt)

            socket.emit('change_text', {
                txt: this.txt,
                id: this.id
            });

            //start resizing
            if (dist(mouseX, mouseY, this.x + offsetX + this.w, this.y + offsetY + this.h) <= 10 && mouseIsPressed && !this.moving) {
                this.resizing = true

                //delete text
            } else if (dist(mouseX, mouseY, this.x + offsetX + this.w, this.y + offsetY - this.deleteBtnOffset) <= 10 && mouseIsPressed && !this.resizing && !this.moving) {
                this.txtInput.hide()
                currTxt = ""

                // delete sticky
                socket.emit('delete_layer', {
                    id: this.id
                });
                return true

                //decrease font size
            } else if (dist(mouseX, mouseY, this.x + offsetX + 5, this.y + offsetY + this.h + 50) <= 10 && mouseIsPressed && !this.resizing && !this.moving) {
                mouseIsPressed = false
                this.txtSz -= 2

                // emit text's new size
                socket.emit('text_resize', {
                    txtSz: this.txtSz,
                    id: this.id
                });

                //increase font size
            } else if (dist(mouseX, mouseY, this.x + offsetX + 5 + 25, this.y + offsetY + this.h + 50) <= 10 && mouseIsPressed && !this.resizing && !this.moving) {
                mouseIsPressed = false
                this.txtSz += 2

                socket.emit('text_resize', {
                    txtSz: this.txtSz,
                    id: this.id
                });

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

                // emit text's new size
                socket.emit('text_border_resize', {
                    w: this.w,
                    h: this.h,
                    id: this.id
                });
            }

            //move text when moving
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

        this.w = constrain(this.w, 50, width)
        this.h = constrain(this.h, 25, width)
        this.txtSz = constrain(this.txtSz, 8, 40)
    }

    //selecting this textbox
    selecting() {
        if (mouseX >= this.x + offsetX && mouseX <= this.x + offsetX + this.w && mouseY >= this.y + offsetY - this.selectBoxOffset && mouseY <= this.y + offsetY + this.h && mouseIsPressed) {
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