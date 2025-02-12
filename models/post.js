const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageURL: {type:String, required: false},
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('post', postSchema);
