
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
    console.log("Setting up storage buckets...");

    const buckets = ['reciters-images', 'recordings-media'];

    for (const bucketName of buckets) {
        const { data: bucket, error: getError } = await supabase.storage.getBucket(bucketName);

        if (getError) {
            console.log(`Creating bucket: ${bucketName}`);
            const { error: createError } = await supabase.storage.createBucket(bucketName, {
                public: true,
                fileSizeLimit: bucketName === 'recordings-media' ? 50000000 : 5000000, // 50MB for audio, 5MB for images
            });

            if (createError) {
                console.error(`Error creating bucket ${bucketName}:`, createError.message);
            } else {
                console.log(`Bucket ${bucketName} created successfully.`);
            }
        } else {
            console.log(`Bucket ${bucketName} already exists.`);
        }
    }

    console.log("Storage setup complete.");
}

setupStorage();
