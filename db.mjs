import mongoose from 'mongoose';

// layer schema (optional fields scale, author, text, and color)
const layerSchema = new mongoose.Schema({
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
});
