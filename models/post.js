const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    source: { type: [String], required: true },
    content: { type: String, required: true },
    attachments : { type: [String], required: false }
}, { timestamps: true }); // ✅ timestamps 추가

module.exports = mongoose.model('Post', postSchema);
