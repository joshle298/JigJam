const mongoose = require('mongoose');
const dotenv = require("dotenv")
dotenv.config()

// PROD
mongoose.connect(process.env.DATABASE_URL);

// LOCAL/TEST
// mongoose.connect(process.env.TEST_DSN);

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
    layerAttributes: {
        type: Object,
        required: true
    },
    author: {
        type: String,
        required: true
    }
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
