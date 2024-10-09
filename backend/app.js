const cron = require('node-cron');
const Doc = require('./models/Doc'); // Adjust the path as needed

//run every hour
cron.schedule('0 * * * *', async () => {
    try {
        const now = new Date();
        await Doc.deleteMany({ expirationDate: { $lte: now } });
        console.log('Expired documents deleted');
    } catch (error) {
        console.error('Error deleting expired documents:', error);
    }
});