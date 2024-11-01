const mongoose = require('mongoose');

const docSchema = new mongoose.Schema({
    customDocId: { type: String, required: true, unique: true },
    email: { type: String, required: false },
    content: { type: String, required: true },
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    isEncrypted: { type: Boolean, default: false },
    intendedRecipient: { type: String },
    expirationDate: { type: Date }
});

module.exports = mongoose.model('Doc', docSchema);