// test that enableSharding gets audited
// @tags: [rocks_requires_fcv36]

if (TestData.testData !== undefined) {
    load(TestData.testData + '/audit/_audit_helpers.js');
} else {
    load('jstests/audit/_audit_helpers.js');
}

auditTestShard(
    'removeShard',
    function(st) {
        var port = allocatePorts(10)[9];
        var conn1 = MongoRunner.runMongod({dbpath: '/data/db/' + jsTestName() + '-extraShard-' + port, port: port});

        var hostandport = conn1.host;
        assert.commandWorked(st.s0.adminCommand({addshard: hostandport, name: 'removable'}));

        var removeRet;
        do {
            removeRet = st.s0.adminCommand({removeShard: 'removable'});
            assert.commandWorked(removeRet);
        } while (removeRet.state != 'completed');

        beforeLoad = Date.now();
        auditColl = loadAuditEventsIntoCollection(st.s0, getDBPath() + '/auditLog-c0.json', jsTestName(), 'auditEvents');
        assert.eq(1, auditColl.count({
            atype: "removeShard",
            ts: withinFewSecondsBefore(beforeLoad),
            'param.shard': 'removable',
            result: 0,
        }), "FAILED, audit log: " + tojson(auditColl.find().toArray()));
    },
    { /* no special mongod options */ }
);
