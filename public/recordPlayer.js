function displayRecordPlayer(){
    push()
    fill("#f2f2f2")
    rect(200,70,300,300,9)

    imageMode(CENTER)
    image(record,350,240,200,200)
    push()
    translate(350,240)
    rotate(radians(recordRot))
    image(recordImgs[currTrack-1],0,0,200,200)
    pop()

    push()
    translate(460,210)
    rotate(radians(needleRot))
    image(needle,0,0,200,200)
    pop()

    pop()

    fill(0,216,221)
    rect(210,80,35,35,9)

    fill(226,51,193)
    rect(255,80,35,35,9)

    fill(255,201,67)
    rect(300,80,35,35,9)

    fill(178,97,242)
    rect(345,80,35,35,9)

    push()
    fill(0)
    ellipse(460,110,50)
    stroke(255)
    noFill()
    rectMode(CENTER)
    
    playTrack = tracks[currTrack-1]
    
    if(playing){
        rect(460, 110, 15)
        recordRot += recordSpeed
        if(needleRot <= 25){
            needleRot++
        }

        if(currTrack != 4){
            if(!tracks[currTrack-1].isPlaying()){
                currTrack += 1
                tracks[currTrack-1].play()
            }
        } else if(currTrack == 4){
            if(!tracks[currTrack-1].isPlaying()){
                currTrack = 1
                tracks[currTrack-1].play()
            }
        }

    } else {
        triangle(455, 100, 470, 110, 455, 120)
        if(needleRot >= 0){
            needleRot--
        }
    }
    pop()

    if(mouseX>=210 && mouseX<=210+35 && mouseY>=80 && mouseY<=80+35 && mouseIsPressed){
        mouseIsPressed = false
        currTrack = 1
        playing = true

        tracks[0].stop()
        tracks[1].stop()
        tracks[2].stop()
        tracks[3].stop()

        tracks[0].play()
    }

    if(mouseX>=255 && mouseX<=255+35 && mouseY>=80 && mouseY<=80+35 && mouseIsPressed){
        mouseIsPressed = false
        currTrack = 2
        playing = true

        tracks[0].stop()
        tracks[1].stop()
        tracks[2].stop()
        tracks[3].stop()

        tracks[1].play()
    }

    if(mouseX>=300 && mouseX<=300+35 && mouseY>=80 && mouseY<=80+35 && mouseIsPressed){
        mouseIsPressed = false
        currTrack = 3
        playing = true

        tracks[0].stop()
        tracks[1].stop()
        tracks[2].stop()
        tracks[3].stop()

        tracks[2].play()
    }

    if(mouseX>=345 && mouseX<=345+35 && mouseY>=80 && mouseY<=80+35 && mouseIsPressed){
        mouseIsPressed = false
        currTrack = 4
        playing = true

        tracks[0].stop()
        tracks[1].stop()
        tracks[2].stop()
        tracks[3].stop()

        tracks[3].play()
    }

    if(dist(mouseX,mouseY, 460,110)<=25 && mouseIsPressed){
        mouseIsPressed = false
        if(playing){
            tracks[0].stop()
            tracks[1].stop()
            tracks[2].stop()
            tracks[3].stop()
        } else {
            tracks[currTrack-1].play()
        }
        playing = !playing

    }
}
