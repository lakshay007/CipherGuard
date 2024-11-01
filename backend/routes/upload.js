const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const Doc = require('../models/Doc'); // Import the Doc model instead of redefining it

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//to check if the custom ID is unique
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
        const { customDocId, email, text, isEncrypted, intendedRecipient, selfDestruct } = req.body;
        
        // Create document object with new fields
        const doc = new Doc({
            customDocId,
            email,
            content: text || (req.file ? req.file.buffer.toString() : ''),
            filename: req.file ? req.file.originalname : 'text-document.txt',
            contentType: req.file ? req.file.mimetype : 'text/plain',
            isEncrypted: isEncrypted === 'true',
            intendedRecipient,
            expirationDate: selfDestruct === 'true' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null
        });

        await doc.save();
        res.status(201).json({ id: doc.customDocId });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading document' });
    }
});

router.get('/:customDocId', async (req, res) => {
    try {
        const doc = await Doc.findOne({ customDocId: req.params.customDocId });
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }
        
        // Return all fields
        res.json({
            id: doc.customDocId,
            email: doc.email,
            content: doc.content,
            filename: doc.filename,
            contentType: doc.contentType,
            uploadDate: doc.uploadDate,
            isEncrypted: doc.isEncrypted,
            intendedRecipient: doc.intendedRecipient,
            expirationDate: doc.expirationDate
        });
        
    } catch (error) {
        console.error('Error retrieving document:', error);
        res.status(500).json({ message: 'Error retrieving document' });
    }
});

module.exports = router;