'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.runSql(`
    CREATE TABLE receiptlines (
      id      SERIAL PRIMARY KEY,
      receipt INTEGER NOT NULL,
      type    INTEGER NOT NULL,
      object  INTEGER     NULL,
      comment TEXT        NULL,
      amount  INTEGER     NULL
    )`
  );
};

exports.down = function(db) {
  return db.dropTable('receiptlines');
};

exports._meta = {
  "version": 1
};
