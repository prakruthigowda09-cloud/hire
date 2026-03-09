
const mongoose = require('mongoose');
const fs = require('fs');

const variants = [
    'mongodb://prakruthiggowda09_db_user:hire@ac-wdxqspq-shard-00-00.vjhbjii.mongodb.net:27017,ac-wdxqspq-shard-00-01.vjhbjii.mongodb.net:27017,ac-wdxqspq-shard-00-02.vjhbjii.mongodb.net:27017/hire-drive?ssl=true&replicaSet=atlas-9wdxqp-shard-00&authSource=admin&retryWrites=true&w=majority',
    'mongodb+srv://prakruthiggowda09_db_user:hire@cluster1.vjhbjii.mongodb.net/hire-drive?retryWrites=true&w=majority',
    'mongodb+srv://prakruthiggowda09_db_user:hire@cluster0.vjhbjii.mongodb.net/hire-drive?retryWrites=true&w=majority'
];

async function tryConnect(uri) {
    const safeUri = uri.replace(/:[^:]*@/, ':****@');
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        const res = `✅ Success: ${safeUri}`;
        await mongoose.disconnect();
        return res;
    } catch (err) {
        return `❌ Failed: ${safeUri} -> ${err.message}`;
    }
}

async function start() {
    let results = [];
    for (const v of variants) {
        results.push(await tryConnect(v));
    }
    fs.writeFileSync('test_results.txt', results.join('\n'));
    process.exit(0);
}

start();
