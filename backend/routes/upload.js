const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Update the schema to include the custom document ID
const DocSchema = new mongoose.Schema({
    customDocId: { type: String, unique: true, required: true },
    email: String,
    content: String,
    filename: String,
    contentType: String,
    uploadDate: { type: Date, default: Date.now },
});

const Doc = mongoose.model('Doc', DocSchema);

// Add a new route to check if the custom ID is unique
router.get('/check-id/:customDocId', async (req, res) => {
    try {
        const doc = await Doc.findOne({ customDocId: req.params.customDocId });
        res.json({ isUnique: !doc });
    } catch (error) {
        console.error('Error checking document ID:', error);
        res.status(500).json({ message: 'Error checking document ID' });
    }
});

router.post('/', upload.single('file'), async (req, res) => {
    try {
        let doc;

        // Check if the custom ID is unique
        const existingDoc = await Doc.findOne({ customDocId: req.body.customDocId });
        if (existingDoc) {
            return res.status(400).json({ message: 'This document ID is already in use' });
        }

        if (req.body.text) {
            // Handle text upload
            doc = new Doc({
                customDocId: req.body.customDocId,
                email: req.body.email,
                content: req.body.text,
                filename: 'text_' + Date.now() + '.txt',
                contentType: 'text/plain',
            });
        } else if (req.file) {
            // Handle file upload
            doc = new Doc({
                customDocId: req.body.customDocId,
                email: req.body.email,
                content: req.file.buffer.toString('base64'),
                filename: req.file.originalname,
                contentType: req.file.mimetype,
            });
        } else {
            return res.status(400).json({ message: 'No content provided' });
        }

        await doc.save();
        res.status(201).json({ id: doc.customDocId, message: 'Upload successful' });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'Error uploading document' });
    }
});

// Add a new route to retrieve a document by its custom ID
router.get('/:customDocId', async (req, res) => {
    try {
        const doc = await Doc.findOne({ customDocId: req.params.customDocId });
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json({
            id: doc.customDocId,
            email: doc.email,
            content: doc.content,
            filename: doc.filename,
            contentType: doc.contentType,
            uploadDate: doc.uploadDate
        });
    } catch (error) {
        console.error('Error retrieving document:', error);
        res.status(500).json({ message: 'Error retrieving document' });
    }
});

module.exports = router;