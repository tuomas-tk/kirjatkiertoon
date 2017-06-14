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
    CREATE TABLE actions (
      id     SERIAL PRIMARY KEY,
      type   INTEGER NOT NULL,
      "user" INTEGER NOT NULL,
      object INTEGER,
      time   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      email_waiting BOOLEAN NOT NULL DEFAULT TRUE,
      email_sent    TIMESTAMP WITH TIME ZONE
    )`
  );
};

exports.down = function(db) {
  return db.dropTable('actions');
};

exports._meta = {
  "version": 1
};
