const fs = require('fs');
const https = require('https');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
let key = null;

try {
    const env = fs.readFileSync(envPath, 'utf8');
    const match = env.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/);
    if (match) {
        const fullValue = match[1].trim();
        // Handle comma-separated keys
        key = fullValue.split(',')[0].trim();
    }
} catch (e) {
    console.log("Could not read .env.local");
}

if (!key) {
    console.log("No key found in .env.local");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                console.log("Available Models:");
                json.models.forEach(m => console.log(`- ${m.name}`));
            } else {
                console.log("Error response:", data);
            }
        } catch (e) {
            console.log("Raw output:", data);
        }
    });
}).on('error', (err) => {
    console.error(err);
});
