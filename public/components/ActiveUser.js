class activeUser {
    constructor(username, x) {
        this.x = x
        this.size = 40
        this.color = random(["#d3ff8a", "#FDBCBC", "#FFC978", "#99D4FF", "#E7B3FF"])
        // this.initial = username.value().charAt(0)
        this.initial = username.charAt(0).toUpperCase()

    }
    display() {
        push()
        stroke("#afafaf")
        strokeWeight(1)
        fill(this.color)
        // rect(windowWidth - 60, 20, 40, 40, 9)
        rect(this.x, 20, 40, 40, 9)
        fill('black')
        textSize(22)
        text(this.initial, this.x + 11.5, 47)
        pop()
    }

}