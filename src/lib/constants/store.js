exports.TYPES = {
  MONGO_DB: 'mongo-store',
  POSTGRES: 'postgres-store',
};

exports.ERROR_CODES = {
  STORAGE_TYPE_NOT_FOUND: 'STORAGE_TYPE_NOT_FOUND',
  INTERFACE_NOT_IMPLEMENTED: 'INTERFACE_NOT_IMPLEMENTED',
};

exports.ERROR_MSG = {
  STORAGE_TYPE_NOT_FOUND: 'The requesting storage type is not found.',
  INTERFACE_NOT_IMPLEMENTED: 'The implementation for the requested interface is not found.',
};
