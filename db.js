const mongoose = require('mongoose');
const dotenv = require("dotenv")
dotenv.config()
mongoose.connect(process.env.DSN);

// layer schema (optional fields scale, author, text, and color)
const LayerSchema = new mongoose.Schema({
    uniqueID: {
        type: String,
        required: true,
        unique: true
    },
    graphicType: {
        type: String,
        required: true
    },
    x: {
        type: Number,
        required: true
    },
    y: {
        type: Number,
        required: true
    },
    s: Number,
    author: String,
    text: String,
    color: String
}, {timestamps: true});
// by attatching timestamps to each layer when consecutive edits are made, the timestamp that is 
// more recent will take precedence

// user shchema
const UserSchema = new mongoose.Schema({
    username: {type: String, required: true},
    color: {type: String}
    // password: {type: String, required: true},
    // email: {type: String, required: true},
  });

// room shchema
const RoomSchema = new mongoose.Schema({
    username: {type: String, required: true},
    roomNumber: {type: String, required: true},
  });

mongoose.model('Layer', LayerSchema);
mongoose.model('User', UserSchema);
mongoose.model('Room', RoomSchema);
