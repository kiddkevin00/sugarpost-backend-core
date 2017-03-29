exports.ERROR_NAMES = {
  CAUGHT_ERROR_IN_DATABASE_SERVICE: 'CAUGHT_ERROR_IN_DATABASE_SERVICE',
  STORAGE_TYPE_NOT_FOUND: 'STORAGE_TYPE_NOT_FOUND',
  INTERFACE_NOT_IMPLEMENTED: 'INTERFACE_NOT_IMPLEMENTED',
};

exports.ERROR_MSG = {
  CAUGHT_ERROR_IN_DATABASE_SERVICE: 'There is an error being caught in Database Service.',
  STORAGE_TYPE_NOT_FOUND: 'The requesting storage type is not found.',
  INTERFACE_NOT_IMPLEMENTED: 'The implementation for the requested interface is not found.',
};

exports.TYPES = {
  MONGO_DB: 'mongo-store',
  POSTGRES: 'postgres-store',
};

exports.OPERATIONS = {
  INSERT: 'insert',
  SELECT: 'select',
  UPDATE: 'update',
  DELETE: 'delete',
};

exports.TABLE_NAMES = {
  USER: 'user',
  SUBSCRIBER: 'subscriber',
};
