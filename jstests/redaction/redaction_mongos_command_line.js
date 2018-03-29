// @tags: [rocks_requires_fcv36]
(function() {
    'use strict';

    // turn redaction on on the command line
    var conn = new ShardingTest({
        shards: 2,
        mongos: 1,
        other: {
            mongosOptions: {redactClientLogData: ''},
        }
    });
    var db = conn.getDB('test');

    // compare reported redactClientLogData with the value set on the command line
    {
        var res = db.getSiblingDB('admin').runCommand( { getParameter: 1, "redactClientLogData": 1 } );
        assert.commandWorked(res, "getParameter failed to get redactClientLogData");
        assert.eq(res.redactClientLogData, true);
    }

    conn.stop();
})();
