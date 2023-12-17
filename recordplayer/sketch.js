let record;
let needle;
let recordImgs =[]

let playTrack;
let tracks =[]

let currTrack = 1
let playing = false

let recordRot = 0;
let recordSpeed = 0.6;

let needleRot = 0;


function preload(){
    for(let i=1; i<5; i++){
        let filename = "recordImages/" + nf(i) + ".png"
        recordImgs.push(loadImage(filename))
    }
    record = loadImage("recordImages/record.png")
    needle = loadImage("recordImages/needle.png")

    for(let i=1; i<5; i++){
        let filename = "tracks/track" + nf(i) + ".mp3"
        tracks.push(loadSound(filename))
    }
}

function setup(){
    createCanvas(400,400)
}

function draw(){
    background(250)

    push()

    imageMode(CENTER)
    image(record,200,200,200,200)
    push()
    translate(200,200)
    rotate(radians(recordRot))
    image(recordImgs[currTrack-1],0,0,200,200)
    pop()

    push()
    translate(300,150)
    rotate(radians(needleRot))
    image(needle,0,0,200,200)
    pop()

    pop()

    fill(0,216,221)
    rect(0,0,50,50)
    fill(226,51,193)
    rect(50,0,50,50)
    fill(255,201,67)
    rect(100,0,50,50)
    fill(178,97,242)
    rect(150,0,50,50)

    push()
    fill(0)
    ellipse(375,25,50)
    stroke(255)
    noFill()
    rectMode(CENTER)
    
    playTrack = tracks[currTrack-1]
    
    if(playing){
        rect(375,25,15)
        recordRot += recordSpeed
        if(needleRot <= 25){
            needleRot++
        }

        fill(0)
        text("currently playing track " + currTrack, 50, 100)

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
        triangle(370,15, 385,25, 370,35)
        if(needleRot >= 0){
            needleRot--
        }
    }
    pop()

    if(mouseX>=0 && mouseX<=50 && mouseY>=0 && mouseY<=50 && mouseIsPressed){
        mouseIsPressed = false
        currTrack = 1
        playing = true

        tracks[0].stop()
        tracks[1].stop()
        tracks[2].stop()
        tracks[3].stop()

        tracks[0].play()
    }

    if(mouseX>=50 && mouseX<=100 && mouseY>=0 && mouseY<=50 && mouseIsPressed){
        mouseIsPressed = false
        currTrack = 2
        playing = true

        tracks[0].stop()
        tracks[1].stop()
        tracks[2].stop()
        tracks[3].stop()

        tracks[1].play()
    }

    if(mouseX>=100 && mouseX<=150 && mouseY>=0 && mouseY<=50 && mouseIsPressed){
        mouseIsPressed = false
        currTrack = 3
        playing = true

        tracks[0].stop()
        tracks[1].stop()
        tracks[2].stop()
        tracks[3].stop()

        tracks[2].play()
    }

    if(mouseX>=150 && mouseX<=200 && mouseY>=0 && mouseY<=50 && mouseIsPressed){
        mouseIsPressed = false
        currTrack = 4
        playing = true

        tracks[0].stop()
        tracks[1].stop()
        tracks[2].stop()
        tracks[3].stop()

        tracks[3].play()
    }

    if(dist(mouseX,mouseY, 375,25)<=25 && mouseIsPressed){
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
