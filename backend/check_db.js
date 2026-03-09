const mongoose = require('mongoose');
const AdminUser = require('./models/AdminUser');
require('dotenv').config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        const users = await AdminUser.find({});
        console.log('Current Admin Users in DB:');
        users.forEach(u => console.log(`- ${u.username} (Password Hash: ${u.password_hash.substring(0, 10)}...)`));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

run();
