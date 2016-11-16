const MongoStore = require('../../../../lib/storage/store/mongo-store');

describe('Mongo (low-level) store', () => {
  let conn;
  let saveAsync;
  let findAsync;
  let updateAsync;
  let removeAsync;
  let dropAsync;
  let dropDatabaseAsync;
  let closeAsync;
  let onAsync;
  let collectionName;
  let mockDoc;

  beforeEach(() => {
    saveAsync = stub();
    findAsync = stub();
    updateAsync = stub();
    removeAsync = stub();
    dropAsync = stub();
    dropDatabaseAsync = stub();
    closeAsync = stub();
    onAsync = stub();
    conn = {
      client: {
        dropDatabaseAsync,
        closeAsync,
        onAsync,
        collection: () => ({
          saveAsync,
          findAsync,
          updateAsync,
          removeAsync,
          dropAsync,
        }),
      },
    };
    collectionName = 'foo';
    mockDoc = {};
  });

  it('implements insert functionality', () => {
    expect(MongoStore).to.have.property('insert').that.is.an('function');

    MongoStore.insert(conn, collectionName, mockDoc);

    expect(saveAsync).to.have.been.called;
  });

  it('implements select functionality', () => {
    expect(MongoStore).to.have.property('select').that.is.an('function');

    MongoStore.select(conn, collectionName, mockDoc);

    expect(findAsync).to.have.been.called;
  });

  it('implements update functionality', () => {
    expect(MongoStore).to.have.property('update').that.is.an('function');

    MongoStore.update(conn, collectionName, mockDoc);

    expect(updateAsync).to.have.been.called;
  });

  it('implements delete functionality', () => {
    expect(MongoStore).to.have.property('delete').that.is.an('function');

    MongoStore.delete(conn, collectionName, mockDoc);

    expect(removeAsync).to.have.been.called;
  });

  it('implements configuring index functionality', () => {
    expect(MongoStore).to.have.property('configIndex').that.is.an('function');

  });

  it('implements drop table functionality', () => {
    expect(MongoStore).to.have.property('dropTable').that.is.a('function');

    MongoStore.dropTable(conn, collectionName, mockDoc);

    expect(dropAsync).to.have.been.called;
  });

  it('implements drop DB functionality', () => {
    expect(MongoStore).to.have.property('dropDb').that.is.a('function');

    MongoStore.dropDb(conn, collectionName, mockDoc);

    expect(dropDatabaseAsync).to.have.been.called;
  });

  it('implements close connection functionality', () => {
    expect(MongoStore).to.have.property('close').that.is.a('function');

    MongoStore.close(conn);

    expect(closeAsync).to.have.been.called;
  });

  it('implements event handling functionality', () => {
    expect(MongoStore).to.have.property('on').that.is.a('function');

    const evnet = 'connect';

    MongoStore.on(conn, evnet);

    expect(onAsync).to.have.been.called;
  });

});
