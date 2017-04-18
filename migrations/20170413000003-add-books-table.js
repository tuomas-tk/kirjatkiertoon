'use strict';

var dbm;
var type;
var seed;


exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('books', {
    id: {type: 'serial', primaryKey: true},
    course: 'string',
    name: 'string',
    price: 'integer',
    condition: 'integer',
    status: 'integer',
    info: 'text',
    user: 'serial'
  });
};

exports.down = function(db) {
  return db.dropTable('books');
};

exports._meta = {
  "version": 1
};
