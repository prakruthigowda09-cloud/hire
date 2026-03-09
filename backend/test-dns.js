
const dns = require('dns');

dns.resolveSrv('_mongodb._tcp.cluster0.q3griew.mongodb.net', (err, addresses) => {
    if (err) {
        console.error('DNS Error:', err);
    } else {
        console.log('SRV Addresses:', JSON.stringify(addresses, null, 2));
    }
});
