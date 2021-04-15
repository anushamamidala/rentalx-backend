const MongoClient = require("mongodb").MongoClient;
require("dotenv/config");

// Connect to the Mongo Database cloud using connection string defined
// in the env file.Details like name of the DB and collection are
// also sent to the initialize() method for establishing connection.

function initialize(
  dbName,
  dbCollectionName,
  successCallback,
  failureCallback
) {
  MongoClient.connect(process.env.MONGO_CONNECT, function (err, dbInstance) {
    if (err) {  
      failureCallback(err);
    } else {
      const dbObject = dbInstance.db(dbName);
      const dbCollection = dbObject.collection(dbCollectionName);
      successCallback(dbCollection);
    }
  });
}

module.exports = {
  initialize,
};
