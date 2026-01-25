import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Custom fetch with retry logic and longer timeout
const fetchWithRetry = async (url: RequestInfo | URL, options: RequestInit = {}): Promise<Response> => {
    const TIMEOUT_MS = 30000; // 30 seconds
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;

    let lastError: any;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            // Retry on server errors
            if (response.status >= 500 && response.status < 600) {
                throw new Error(`Server error: ${response.status}`);
            }

            return response;
        } catch (error: any) {
            clearTimeout(timeoutId);
            lastError = error;

            // Don't retry if aborted by user (though here it's our timeout)
            // Actually, ConnectTimeout (Abort) IS what we want to retry if it's flaky.
            // But if it's our own timeout, maybe we shouldn't retry? 
            // Let's retry anyway as it might be a temporary congestion.
            console.warn(`Attempt ${attempt + 1} failed: ${error.message}. Retrying in ${RETRY_DELAY}ms...`);

            if (attempt < MAX_RETRIES - 1) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (attempt + 1))); // Exponential backoff
            }
        }
    }

    throw lastError;
};

// Browser client with automatic session management
// The proxy.ts file handles server-side session refresh
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    global: {
        fetch: fetchWithRetry,
    },
});
