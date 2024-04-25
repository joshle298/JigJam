require('./db.js');
const mongoose = require('mongoose');
const sanitize = require('mongo-sanitize');
const dotenv = require("dotenv")
dotenv.config()
// define the port that this project should listen on
const port = process.env.PORT || 3000;
// set up express
const express = require('express');
const app = express();

app.use(express.json());

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

const Layer = mongoose.model('Layer');
const User = mongoose.model('User');
const Room = mongoose.model('Room');

let currentSong = -1;

// tell the server to send out the HTML file for this demo when it gets contacted
app.get("/", function(request, response) {
    // tell the user they should expect HTML
    response.type('html');

    // send the HTML file to the browser
    response.write(htmlFile);

    // tell the browser we are done!
    response.end();
});

app.post("/api/room/join", async (req, res) => {
    try {
        const roomJoin = new Room({
            username: sanitize(req.body.username),
            roomNumber: sanitize(req.body.roomNumber),
        });

        await roomJoin.save();
        console.log(`User ${roomJoin.username} joined room ${roomJoin.roomNumber}`);
        res.status(201).json({ message: 'User successfully joined the room' });
    } catch (error) {
        console.error('Error joining room:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get("/api/rooms", async (req, res) => {
    try {
        const rooms = await Room.find();
        if (rooms.length === 0) {
            // no entries found
            return res.status(404).json({ message: 'No room join entries found' });
        }

        // filter for only users in room 1 and log in server
        const filterByRoomNumber = (arr) => {
            return arr.filter((entry) => entry.roomNumber === '1');
          };          

        console.log(filterByRoomNumber(rooms));

        res.status(200).json(rooms);  // sends list of room join entries as JSON
    } catch (error) {
        console.error('Error retrieving room join entries:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post("/api/user/create", async (req, res) => {
    try {
        // console.log(req.body.color);
        const user = new User({
            username: sanitize(req.body.username),
            color: sanitize(req.body.color)
        });

        await user.save();
        console.log(`User ${user.username} added`);
        res.status(201).json({ message: 'User successfully created' });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get("/api/users", async (req, res) => {
    try {
        const users = await User.find(); 
        if (users.length === 0) {
            // no users found
            return res.status(404).json({ message: 'No users found' });
        }

        // filter for only users with a username of 3 characters or less and log in server
        const filterByUsernameSize = (arr) => {
            return arr.filter((entry) => entry.username.length <= 3);
            };          

        console.log(filterByUsernameSize(users));
        
        res.status(200).json(users);  // sends list of users as JSON
    } catch (error) {
        console.error('Error retrieving users: ', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get("/api/layers", async (req, res) => {
    try {
        const layers = await Layer.find();
        // handle no layers
        if (layers.length === 0) {
            // no layers found
            return res.status(404).json({ message: 'No layers found' });
        }

        // filter for layers with the colorId of 5 and log in server
        const filterByColorFive = (arr) => {
            return arr.filter((entry) => entry.layerAttributes.col === 5);
        };          

        console.log(filterByColorFive(layers));
        
        return res.status(200).json(layers);
    } catch(err) {
        console.error('Error retrieving layers: ', err);
        res.status(500).json({ message: 'Internal server error'});
    }
});

app.get("/api/track", (req, res) => {
    try {
        if(currentSong === -1 || users.size === 0) {
            return res.status(200).json({ message: 'No current song playing'});
        } else {
            const track = currentSong + 1;
            return res.status(200).json({ 'Current track playing': track });
        }
    } catch (err) {
        console.error('Error retrieving current track playing: ', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post("/api/layers/create", async (req, res) => {
    try {
        const layer = new Layer({
            uniqueID: sanitize(req.body.uniqueID),
            graphicType: sanitize(req.body.graphicType),
            layerAttributes: sanitize(req.body.layerAttributes),
            author: sanitize(req.body.author)
        });

        await layer.save();
        console.log(`Layer added: ${layer}`);
        res.status(201).json({ message: 'Layer successfully posted' });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

async function fetchPrevLayers() {
    // init all layers from db
    const prevLayers = await Layer.find();
    prevLayers.forEach((layer) => {
        layers.set(layer.uniqueID,layer.layerAttributes);
    });
}

// start up the server (go to your browser and visit localhost:port)
server.listen(port, () => {
    console.log(`Heigh-Ho, Heigh-Ho, off to the internet we go! 🚀 Listening on port ${port}`);
});

// keep track of all users in canvas
let users = new Map();

// keep track of all layers within canvas
let layers = new Map();
fetchPrevLayers();

// whenever a client connects to the server
io.sockets.on('connection', function(socket) {
    console.log('a user connected');

    let userArr = JSON.stringify(Array.from(users));
    socket.emit('user_join', userArr);

    // remove from map
    socket.on('disconnect', function() {
        users.delete(socket.id);
        let userArr = JSON.stringify(Array.from(users));
        socket.broadcast.emit('user_join', userArr);
    });

    // create a unique id for this user
    let id = uniqid();

    // tell this player about any other players in the canvas
    socket.emit('all_previous_users', users);

    // Convert Map to an Array of entries
    let layersArray = Array.from(layers.entries());

    // Emit the layersArray to the new user
    socket.emit('initial_layers', layersArray);

    socket.on('user_join', function(user) {
        const userObj = JSON.parse(user.userData)
        users.set(userObj.socket, userObj);
        const userArr = JSON.stringify(Array.from(users))
        socket.broadcast.emit('user_join', userArr);
    });

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

    socket.on('song_selected', function(msg) {
        console.log(`a new song has started playing by one of our clients: track ${msg.trackNumber}`);
        currentSong = msg.trackNumber;
        socket.broadcast.emit('song_selected', msg);
    });

    // listen for new stickies that are added
    socket.on('new_sticky', function(msg) {
        console.log("a new sticky has been added by one of our clients: ", msg);
        // store new layer in our layers array
        layers.set(msg.uniqueID, msg.layer);

        // send this out to all other clients along with the layer id
        socket.broadcast.emit('new_sticky', msg);
    });

    // listen for new stickers that are added
    socket.on('new_sticker', function(msg) {
        console.log("a new sticker has been added by one of our clients: ", msg);
        // store new layer in our layers array
        layers.set(msg.uniqueID, msg.layer);

        // send this out to all other clients along with the layer id
        socket.broadcast.emit('new_sticker', msg);
    });

    // listen for new shapes that are added
    socket.on('new_shape', function(msg) {
        console.log("a new shape has been added by one of our clients: ", msg);
        // store new layer in our layers array
        layers.set(msg.uniqueID, msg.layer);

        // send this out to all other clients along with the layer id
        socket.broadcast.emit('new_shape', msg);
    });

    // listen for new lines that are added
    socket.on('new_line', function(msg) {
        console.log("a new line has been added by one of our clients: ", msg);
        // store new layer in our layers array
        layers.set(msg.uniqueID, msg.layer);

        // send this out to all other clients along with the layer id
        socket.broadcast.emit('new_line', msg);
    });

    // listen for new text that is added
    socket.on('new_text', function(msg) {
        console.log("a new text has been added by one of our clients: ", msg);
        // store new layer in our layers array
        layers.set(msg.uniqueID, msg.layer);

        // send this out to all other clients along with the layer id
        socket.broadcast.emit('new_text', msg);
    });

    // listen for layer movements
    socket.on('move_layer', function(msg) {
        // console.log("a layer has been moved by one of our clients: ", msg);
        console.log(layers);
        // update the layer in our layers array
        let layer = layers.get(msg.id);
        layer.x = msg.x;
        layer.y = msg.y;

        // send this out to all other clients along with the layer id
        socket.broadcast.emit('move_layer', msg);
    });

    // listen for line movements
    socket.on('move_line', function(msg) {
        // console.log("a line has been moved by one of our clients: ", msg);
        // update the layer in our layers array
        let layer = layers.get(msg.id);
        layer.x1 = msg.x1;
        layer.y1 = msg.y1;
        layer.x2 = msg.x2;
        layer.y2 = msg.y2;
        // send this out to all other clients along with the layer id
        socket.broadcast.emit('move_line', msg);

        // update in db
        Layer.findOneAndUpdate(
            { uniqueID: msg.id }, // This filters the document to find by uniqueID
            { $set: { 
                    "layerAttributes.col": layer.col,
                    "layerAttributes.x1": layer.x1,
                    "layerAttributes.y1": layer.y1,
                    "layerAttributes.x2": layer.x2,
                    "layerAttributes.y2": layer.y2,
                } 
            }, // This sets the new values for layerAttributes
            { new: true } // This option returns the document after the update has been applied
        ).catch(err => {
            console.error("Error updating the document:", err);
        });        
    });

    // listen for line weight changes
    socket.on('change_weight', function(msg) {
        console.log("a line has been changed weight by one of our clients: ", msg);
        console.log(layers);
        // update the layer in our layers array
        let layer = layers.get(msg.id);
        console.log(msg.id);
        layer.wt = msg.wt;

        // send this out to all other clients along with the layer id
        socket.broadcast.emit('change_weight', msg);

        Layer.findOneAndUpdate(
            { uniqueID: msg.id }, // This filters the document to find by uniqueID
            { $set: { "layerAttributes.wt": msg.wt } }, // This sets the new values for layerAttributes
            { new: true } // This option returns the document after the update has been applied
        ).catch(err => {
            console.error("Error updating the document:", err);
        });       
    });

    // listen for color changes
    socket.on('change_color_layer', function(msg) {
        console.log("a layer has been changed color by one of our clients: ", msg);
        console.log(layers);
        // update the layer in our layers array
        let layer = layers.get(msg.id);
        console.log(msg.id);
        layer.col = msg.col;

        // send this out to all other clients along with the layer id
        socket.broadcast.emit('change_color_layer', msg);
    });

    // listen for layer resizes
    socket.on('resize_layer', function(msg) {
        console.log("a layer has been resized by one of our clients: ", msg);
        console.log(layers);
        // update the layer in our layers array
        let layer = layers.get(msg.id);
        console.log(msg.id);
        layer.s = msg.s;

        // send this out to all other clients along with the layer id
        socket.broadcast.emit('resize_layer', msg);
    });

    // listen for layer deletions
    socket.on('delete_layer', function(msg) {
        console.log("a layer has been deleted by one of our clients: ", msg);
        console.log(layers);
        // delete the layer in our layers array
        layers.delete(msg.id);

        // send this out to all other clients along with the layer id
        socket.broadcast.emit('delete_layer', msg);
    });

    // listen for text changes
    socket.on('change_text', function(msg) {
        console.log("a text has been changed by one of our clients: ", msg);
        console.log(layers);
        // update the layer in our layers array
        let layer = layers.get(msg.id);
        console.log(msg.id);
        layer.txt = msg.txt;

        // send this out to all other clients along with the layer id
        socket.broadcast.emit('change_text', msg);
    });

    // listen for text resizes
    socket.on('text_resize', function(msg) {
        console.log("a text has been resized by one of our clients: ", msg);
        console.log(layers);
        // update the layer in our layers array
        let layer = layers.get(msg.id);
        console.log(msg.id);
        layer.txtSz = msg.txtSz;

        // send this out to all other clients along with the layer id
        socket.broadcast.emit('text_resize', msg);
    });

    // listen for text border resize
    socket.on('text_border_resize', function(msg) {
        console.log("a text border has been resized by one of our clients: ", msg);
        console.log(layers);
        // update the layer in our layers array
        let layer = layers.get(msg.id);
        console.log(msg.id);
        layer.w = msg.w;
        layer.h = msg.h;

        // send this out to all other clients along with the layer id
        socket.broadcast.emit('text_border_resize', msg);
    });
});