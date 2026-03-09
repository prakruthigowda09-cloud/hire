const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
    const uri = process.env.MONGODB_URI;
    console.log('Testing connection to:', uri.replace(/:[^:]*@/, ':****@')); // Hide password

    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
    });

    try {
        await client.connect();
        console.log('✅ Successfully connected to MongoDB!');
        const admin = client.db().admin();
        const info = await admin.serverStatus();
        console.log('Server version:', info.version);
        await client.close();
    } catch (err) {
        console.error('❌ Connection failed!');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        if (err.reason) {
            console.error('Reason:', JSON.stringify(err.reason, null, 2));
        }
    }
}

testConnection();
