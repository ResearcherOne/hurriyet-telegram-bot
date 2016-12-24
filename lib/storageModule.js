var mongoWrapper = require('./mongoWrapper.js');

var _collectionName;

module.exports = {
  initializeModule: function(connectionString, collectionName, callback){
    //if not initialized
      mongoWrapper.initializeClient(connectionString, callback);
      _collectionName = collectionName;
      //fetchedKeywordList = fetchKeywordList
    //else
      //call the callback instantly
  },
  
  addToNotificationList: function(keyword, userId, callback) {
    var updateCriteria = {"keyword": keyword};
    var updateData = {$push: {'users': parseInt(userId)}};   
    mongoWrapper.updateObject(_collectionName, updateCriteria, updateData, function(err, result){
      if(!err){
        callback(null, result);
      } else {
        callback(err, null);
      }
    });
  },
  
  getNotificationList: function(keyword, callback){
    mongoWrapper.findObjectsAsArray(keyword, function(err, result){
      callback(err, result[0].users);
    })
  },
  
  newKeywordWithUser: function(keyword, userId, callback) {
    var obj = {
      "keyword":  keyword,
      "users":    []
    };
    obj.users.push(userId);
    mongoWrapper.insertObject(_collectionName, obj, callback);
    //addKeywordToKeywordList
    //addToFetchedKeywordList
  },
  
  isKeywordExist: function(keyword, callback){
    /*
    var findCriteria = {"keyword": keyword};
    mongoWrapper.isSpecificKeyExists(_collectionName, findCriteria, callback);
    */
    //findIn fetchedKeywordList
  },
  
  getKeywordList: function(){
    //return fetchedKeywordList
  },
  
  removeUserFromNotificationList: function(keyword, userId, callback) {
    var updateCriteria = {"keyword": keyword};
    var updateData = {$pull: { 'users': parseInt(userId) } }
    mongoWrapper.updateObject(_collectionName, updateCriteria, updateData, function(err, result){
      if(!err){
        callback(null, result);
      } else {
        callback(err, null);
      }
    });
  },
  
  isUserInNotificationList: function(keyword, userId, callback) {
    var findCriteria = {"keyword": keyword, "users": userId};
    mongoWrapper.findObjectsAsArray(_collectionName, findCriteria, function(err, result) {
      if(!err) {
        var isUserFound = false;
        if(result.length !== 0) {
          isUserFound = true;
          callback(null, isUserFound);
        } else {
          callback(null, isUserFound);
        }
      } else {
        callback(err, null);
      }
    });
  }
}