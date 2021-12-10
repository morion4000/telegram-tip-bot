// const { MongoMemoryServer } = require('mongodb-memory-server');

// https://jestjs.io/docs/configuration#globalsetup-string
module.exports = async () => {
  // const mongoServer = new MongoMemoryServer();
  // const uri = await mongoServer.getUri();
  // const [protocol, , address, db] = uri.split('/');
  // const url = `${protocol}//${address}`;

  // global.__MONGOSERVER__ = mongoServer;

  // process.env.MONGO_URL = url;
  // process.env.MONGO_DB = db;
};
