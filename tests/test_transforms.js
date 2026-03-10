
// Tests for Row Transformation Logic in shared.js

runTest('Transform: json-parse with path', () => {
    const rows = [{ raw: '', message: '', fields: { payload: '{"user":{"id":42,"name":"alice"}}' } }];
    if (typeof fieldNames === 'undefined') global.fieldNames = new Set();

    const transforms = [{
        id: 't1',
        name: 'JSON user id',
        sourceField: 'payload',
        targetField: 'userId',
        operation: 'json-parse',
        path: 'user.id',
        enabled: true,
        order: 0
    }];

    const res = runMultipleTransforms(transforms, rows, { unsafeMode: false });
    assert.strictEqual(res.changed, 1);
    assert.strictEqual(rows[0].fields.userId, 42);
});

runTest('Transform: url decode', () => {
    const rows = [{ raw: 'x', message: 'x', fields: { q: 'hello%20world' } }];
    const transforms = [{
        id: 't2',
        sourceField: 'q',
        targetField: 'decoded',
        operation: 'url-decode',
        enabled: true,
        order: 0
    }];

    const res = runMultipleTransforms(transforms, rows, { unsafeMode: false });
    assert.strictEqual(res.changed, 1);
    assert.strictEqual(rows[0].fields.decoded, 'hello world');
});

runTest('Transform: xml tag extract', () => {
    const rows = [{ raw: '', message: '', fields: { xml: '<root><id>abc-123</id></root>' } }];
    const transforms = [{
        id: 't3',
        sourceField: 'xml',
        targetField: 'xmlId',
        operation: 'xml-tag',
        tag: 'id',
        enabled: true,
        order: 0
    }];

    const res = runMultipleTransforms(transforms, rows, { unsafeMode: false });
    assert.strictEqual(res.changed, 1);
    assert.strictEqual(rows[0].fields.xmlId, 'abc-123');
});

runTest('Transform: unsafe JS off skips js transform', () => {
    const rows = [{ raw: '', message: '', fields: { v: 'abc' } }];
    const transforms = [{
        id: 't4',
        sourceField: 'v',
        targetField: 'v2',
        operation: 'js',
        expression: 'value.toUpperCase()',
        enabled: true,
        order: 0
    }];

    const res = runMultipleTransforms(transforms, rows, { unsafeMode: false });
    assert.strictEqual(res.changed, 0);
    assert.strictEqual(rows[0].fields.v2, undefined);
});

runTest('Transform: unsafe JS on applies expression', () => {
    const rows = [{ raw: '', message: '', fields: { v: 'abc' } }];
    const transforms = [{
        id: 't5',
        sourceField: 'v',
        targetField: 'v2',
        operation: 'js',
        expression: 'value.toUpperCase()',
        enabled: true,
        order: 0
    }];

    const res = runMultipleTransforms(transforms, rows, { unsafeMode: true });
    assert.strictEqual(res.changed, 1);
    assert.strictEqual(rows[0].fields.v2, 'ABC');
});
