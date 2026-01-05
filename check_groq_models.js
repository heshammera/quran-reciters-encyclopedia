const https = require('https');
const fs = require('fs');
const path = require('path');

// Try to read key from .env.local or process.env
let apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
    try {
        const envPath = path.join(__dirname, '.env.local');
        if (fs.existsSync(envPath)) {
            const env = fs.readFileSync(envPath, 'utf8');
            const match = env.match(/GROQ_API_KEY=(.*)/);
            if (match) apiKey = match[1].trim();
        }
    } catch (e) { }
}

if (!apiKey) {
    try {
        const envPath = path.join(__dirname, 'env.example');
        if (fs.existsSync(envPath)) {
            const env = fs.readFileSync(envPath, 'utf8');
            const match = env.match(/GROQ_API_KEY=(.*)/);
            if (match) apiKey = match[1].trim();
        }
    } catch (e) { }
}


if (!apiKey) {
    console.error("No GROQ_API_KEY found.");
    process.exit(1);
}

const options = {
    hostname: 'api.groq.com',
    path: '/openai/v1/models',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.data) {
                console.log("Available Groq Models:");
                json.data.forEach(m => console.log(`- ${m.id}`));
            } else {
                console.log("Response:", data);
            }
        } catch (e) {
            console.log("Raw:", data);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
