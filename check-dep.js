
try {
    console.log('Resolving @ai-sdk/react...');
    console.log(require.resolve('@ai-sdk/react'));
    console.log('Success!');
} catch (e) {
    console.error('Resolution failed:', e.message);
}
