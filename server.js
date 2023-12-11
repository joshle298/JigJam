// define the port that this project should listen on
const port = 3000;

// set up express
const express = require('express');
const app = express();

// set up the 'public' folder to serve static content to the user
app.use( express.static('public') );

// set up socket io for bidirectional communication with the client
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// set up the uniqid library so we can create unique identifiers for our players
const uniqid = require('uniqid');

// read the HTML file for this demo into memory from the 'public' directory
const fs = require('fs');
const htmlFile = fs.readFileSync('./public/sketch.js', 'utf-8');

// tell the server to send out the HTML file for this demo when it gets contacted
app.get("/", function(request, response) {
    // tell the user they should expect HTML
    response.type('html');

    // send the HTML file to the browser
    response.write(htmlFile);

    // tell the browser we are done!
    response.end();
});

// start up the server (go to your browser and visit localhost:port)
server.listen(port, () => {
    console.log(`Heigh-Ho, Heigh-Ho, off to the internet we go! 🚀`);
});

// your custom code for faciltating communication with clients can be written below

// keep track of all users in canvas
let users = {};

// keep track of all layers within canvas
let layers = new Map();

// whenever a client connects to the server
io.on('connection', function(socket) {
    console.log('a user connected');

    // create a unique id for this user
    let id = uniqid();

    // tell this player about any other players in the canvas
    socket.emit('all_previous_users', users);

    // tell this player about any layers in the canvas
    socket.emit('all_previous_layers', layers);

    // listen for new user messages
    socket.on('new_user', function(msg) {
        // // store the message in our allPlayers array
        // allPlayers[myId] = {
        //     x: msg.x,
        //     y: msg.y,
        //     color: msg.color,
        //     id: myId,
        //     points: 0
        // }

        // // send this out to all other clients
        // socket.broadcast.emit('new_player', allPlayers[myId]);
    });

    // listen for new layers that are added
    socket.on('new_layer', function(msg) {
        console.log("a new layer has been added by one of our clients: ", msg);
        // store new layer in our layers array
        layers.set(msg.uniqueID, msg.layer);

        // send this out to all other clients along with the layer id
        socket.broadcast.emit('new_layer', msg);
    });

    // listen for layer movements
    socket.on('move_layer', function(msg) {
        console.log("a layer has been moved by one of our clients: ", msg);
        console.log(layers);
        // update the layer in our layers array
        let layer = layers.get(msg.id);
        console.log(msg.id);
        layer.x = msg.x;
        layer.y = msg.y;

        // send this out to all other clients along with the layer id
        socket.broadcast.emit('move_layer', msg);
    });
});