// Diagnostic Script - Copy and paste this into the browser console
// This will help identify what's blocking playback

console.log("=== PLAYER DIAGNOSTIC ===");

// 1. Check localStorage for corrupted data
console.log("\n1. Checking localStorage...");
const handoff = localStorage.getItem('offline_handoff');
if (handoff) {
    console.log("⚠️ Found offline_handoff data:", handoff);
    console.log("Removing it now...");
    localStorage.removeItem('offline_handoff');
} else {
    console.log("✅ No offline_handoff data");
}

const playerState = localStorage.getItem('quran_player_state');
if (playerState) {
    try {
        const parsed = JSON.parse(playerState);
        console.log("Current player state:", parsed);
        if (parsed.currentTrack) {
            console.log("Current track source:", parsed.currentTrack.src);
        }
    } catch (e) {
        console.error("❌ Failed to parse player state:", e);
        console.log("Removing corrupted player state...");
        localStorage.removeItem('quran_player_state');
    }
}

// 2. Check if service worker is interfering
console.log("\n2. Checking Service Worker...");
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        console.log(`Found ${registrations.length} service worker(s)`);
        registrations.forEach(reg => {
            console.log("SW Scope:", reg.scope);
            console.log("SW State:", reg.active?.state);
        });
    });
}

// 3. Instructions
console.log("\n3. NEXT STEPS:");
console.log("   a) Press Ctrl+Shift+R (or Cmd+Shift+R on Mac) for hard refresh");
console.log("   b) If still not working, try clicking a recording and check console for errors");
console.log("   c) Report any red errors you see");

console.log("\n=== END DIAGNOSTIC ===");
