/*
 * This is the place for exposing module(s) for storage.   
 */

const StoreFactory = require('./repo-factory');
const ConnectionPool = require('../../../lib/storage/connection-pool');

exports.StoreFactory = StoreFactory;
exports.ConnectionPool = ConnectionPool;
