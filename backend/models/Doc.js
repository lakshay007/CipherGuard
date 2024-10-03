const mongoose = require('mongoose');

const docSchema = new mongoose.Schema({
    customDocId: { type: String, required: true, unique: true },
    email: { type: String, required: false }, // Changed to not required
    content: { type: String, required: true },
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doc', docSchema);