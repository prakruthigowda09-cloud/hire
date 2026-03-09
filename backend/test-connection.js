
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
console.log('Testing connection to:', uri.split('@')[1] || uri); // Log without credentials if possible

mongoose.connect(uri)
    .then(() => {
        console.log('✅ MongoDB connection established successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });
