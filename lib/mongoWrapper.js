var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
var activeDB;
  
// Public
module.exports = {
	initializeClient: function(url, callback)
	{
		mongoClient.connect(url, function(err, db) {
		  if(!err) {
			activeDB = db;
			callback(null, true);
		  } else {
			callback(err, false);
		  }
		});
	},
	getCollectionAsArray: function(collectionName,callback)
	{
		activeDB.collection(collectionName).find().toArray(function(err, result)
		{
			callback(err, result);
		});
	},
	getCollectionAsArrayAndSortByCriteria: function (collectionName, sortCriteria, callback)
	{
		activeDB.collection(collectionName).find().sort(sortCriteria).toArray(function(err, result){
			callback(err, result);
		});
	},
	insertObject: function(collectionName, object, callback)
	{
		activeDB.collection(collectionName).insertOne(object, function(err, result)
		{
			callback(err, result);
		});
	},
	removeObject: function(collectionName, removeCriteria, callback)
	{
		activeDB.collection(collectionName).remove(removeCriteria, function(err, result)
		{
			callback(err, result);
		});
	},
	updateObject: function(collectionName, updateCriteria, updateData,callback){
		activeDB.collection(collectionName).findOneAndUpdate(updateCriteria, updateData, function(err, result){
			callback(err, result);
		});
	},
	isDocumentExist: function(collectionName, queryCriteria, callback){
		activeDB.collection(collectionName).find(queryCriteria).limit(1).toArray(function(err, result){
			if (!err){
				var isDocumentExists = (result.length !== 0);
				callback(null, isDocumentExists);
			} else {
				callback(err, null);
			}
		});
	},
	removeCollection: function(collectionName){
		activeDB.collection(collectionName).drop();
	},
	findObjectsAndSortByCriteriaAsArray: function(collectionName, findCriteria, sortCriteria, callback){
		activeDB.collection(collectionName).find(findCriteria).sort(sortCriteria).toArray(function(err, result){
			callback(err, result);
		});
	},
  isSpecificKeyExists: function(collectionName, queryCriteria, callback){
    activeDB.collection(collectionName).find(queryCriteria).toArray(function(err,result){
      if (!err) {
        var isKeyExists = result.length !== 0;
        callback(null, isKeyExists);
      } else {
        callback(err, null);
      }
    });
  },
	findObjectsAsArray: function(collectionName, findCriteria, callback) {
		activeDB.collection(collectionName).find(findCriteria).toArray(function(err, result){
			callback(err, result);
		});
	}
}