
const mongoose = require('mongoose');

const variants = [
    'mongodb://prakruthiggowda09_db_user:hire@ac-wdxqspq-shard-00-00.vjhbjii.mongodb.net:27017,ac-wdxqspq-shard-00-01.vjhbjii.mongodb.net:27017,ac-wdxqspq-shard-00-02.vjhbjii.mongodb.net:27017/hire-drive?ssl=true&replicaSet=atlas-9wdxqp-shard-00&authSource=admin&retryWrites=true&w=majority',
    'mongodb+srv://prakruthiggowda09_db_user:hire@cluster1.vjhbjii.mongodb.net/hire-drive?retryWrites=true&w=majority',
    'mongodb+srv://prakruthiggowda09_db_user:hire@cluster0.vjhbjii.mongodb.net/hire-drive?retryWrites=true&w=majority'
];

async function tryConnect(uri) {
    console.log(`Trying: ${uri.replace(/:[^:]*@/, ':****@')}`);
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ Success!');
        await mongoose.disconnect();
        return true;
    } catch (err) {
        console.log(`❌ Failed: ${err.message}`);
        return false;
    }
}

async function start() {
    for (const v of variants) {
        if (await tryConnect(v)) {
            console.log('FOUND WORKING URI:', v);
            process.exit(0);
        }
    }
    process.exit(1);
}

start();
