var mongoWrapper = require('./mongoWrapper.js');

var _collectionName;

module.exports = {
  initializeModule: function(connectionString, collectionName, callback){
    mongoWrapper.initializeClient(connectionString, callback);
    _collectionName = collectionName;
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
  
  newKeywordWithUser: function(keyword, userId, callback) {
    var obj = {
      "keyword":  keyword,
      "users":    []
    };
    obj.users.push(userId);
    mongoWrapper.insertObject(_collectionName, obj, callback);
  },
  
  isKeywordExist: function(keyword, callback){
    var findCriteria = {"keyword": keyword};
    mongoWrapper.isSpecificKeyExists(_collectionName, findCriteria, function(err, result) {
      if(!err) {
        callback(null, result);
			} else {
				callback(err, null);
      }
    });
  },
  
  removeUserFromNotificationList(keyword, userId, callback) {
    var updateCriteria = {"keyword": keyword};
    var updateData = {$pull: { 'users': parseInt(userId) } }
    mongoWrapper.updateObject(_collectionName, updateCriteria, updateData, function(err, result){
      if(!err){
        callback(null, result);
      } else {
        callback(err, null);
      }
    });
  }
}