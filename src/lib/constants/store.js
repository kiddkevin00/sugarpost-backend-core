exports.TYPES = {
  MONGO_DB: 'mongo-store',
  POSTGRES: 'postgres-store',
};

exports.ERROR_NAMES = {
  STORAGE_TYPE_NOT_FOUND: 'STORAGE_TYPE_NOT_FOUND',
  INTERFACE_NOT_IMPLEMENTED: 'INTERFACE_NOT_IMPLEMENTED',
  REQUIRED_FIELDS_NOT_UNIQUE: 'REQUIRED_FIELDS_NOT_UNIQUE',
};

exports.ERROR_MSG = {
  STORAGE_TYPE_NOT_FOUND: 'The requesting storage type is not found.',
  INTERFACE_NOT_IMPLEMENTED: 'The implementation for the requested interface is not found.',
  REQUIRED_FIELDS_NOT_UNIQUE: 'The required field(s) should be unique and not empty.',
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
