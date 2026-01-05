const fs = require('fs');
const https = require('https');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
let key = null;

try {
    const env = fs.readFileSync(envPath, 'utf8');
    const match = env.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/);
    key = match ? match[1].trim() : null;
} catch (e) {
    console.log("Could not read .env.local");
}

if (!key) {
    console.log("No key found in .env.local");
    process.exit(1);
}

const candidateModels = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-flash-latest',
    'gemini-2.0-flash-lite-preview',
    'gemini-pro-latest'
];

async function testModel(modelName) {
    return new Promise((resolve) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
        const payload = JSON.stringify({
            contents: [{ parts: [{ text: "hi" }] }]
        });

        const req = https.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve({ model: modelName, status: 'OK' });
                } else {
                    try {
                        const json = JSON.parse(data);
                        resolve({ model: modelName, status: 'ERROR', code: res.statusCode, message: json.error?.message || data });
                    } catch (e) {
                        resolve({ model: modelName, status: 'ERROR', code: res.statusCode, message: data });
                    }
                }
            });
        });

        req.on('error', (e) => resolve({ model: modelName, status: 'NETWORK_ERROR', message: e.message }));
        req.write(payload);
        req.end();
    });
}

async function runTests() {
    console.log("Testing model availability and quota...");
    for (const model of candidateModels) {
        process.stdout.write(`Testing ${model}... `);
        const result = await testModel(model);
        if (result.status === 'OK') {
            console.log("✅ OK");
        } else {
            console.log(`❌ ${result.code}: ${result.message.substring(0, 100)}...`);
        }
    }
}

runTests();
