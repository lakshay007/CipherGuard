const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const url = `https://cipherguard.onrender.com/`;
const interval = 300000; // Interval in milliseconds

// Add this new route
app.get('/keep-alive', (req, res) => {
    res.status(200).send('Server is alive');
});

// Add this at the end of your file
const keepAliveInterval = 14 * 60 * 1000; // 14 minutes

function keepAlive() {
    fetch(url + 'keep-alive')
        .then(response => console.log('Keep-alive response:', response.status))
        .catch(error => console.error('Keep-alive error:', error));
}

setInterval(keepAlive, keepAliveInterval);









