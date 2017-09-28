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
  return db.createTable('schools', {
    id: {type: 'serial', primaryKey: true},
    name: 'string',
    info: 'string',
    organizer: 'string',
    contact: 'string',
    vat: {type: 'boolean', notNull: true, defaultValue: false}
  });
};

exports.down = function(db) {
  return db.dropTable('schools');
};

exports._meta = {
  "version": 1
};
