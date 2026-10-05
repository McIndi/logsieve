// Regression: result id/level cells must escape hostile values (both renderPage definitions in logsieve.js)

runTest('escapeText coerces and escapes', () => {
    assert.strictEqual(escapeText(null), '');
    assert.strictEqual(escapeText(undefined), '');
    assert.strictEqual(escapeText(42), '42');
    assert.strictEqual(escapeText('"><img src=x onerror=alert(1)>'), '&quot;&gt;&lt;img src=x onerror=alert(1)&gt;');
});
