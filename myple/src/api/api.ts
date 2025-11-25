const https = require('https');
const fs = require('fs');

const options = {
    cert: fs.readFileSync('../../key/myple-mtls_public.crt'),
    key: fs.readFileSync('../../key/myple-mtls_private.key'),
    rejectUnauthorized: true,
};

const req = https.request(
    'https://apps-in-toss-api.toss.im/endpoint',
    { method: 'GET', ...options },
    (res: any) => {
        let data = '';
        res.on('data', (chunk: any) => (data += chunk));
        res.on('end', () => {
            console.log('Response:', data);
        });
    }
);

req.on('error', (e: any) => console.error(e));
req.end();