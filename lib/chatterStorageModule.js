var mongoWrapper = require('./mongoWrapper.js');

var _notificationListCollection;
var _keywordsCollection;
var _userKeywordList = [];

module.exports = {
  initializeModule: function(mongoUrl, notificationListName, keywordListName, callback){
      _notificationListCollection = notificationListName;
      _keywordsCollection         = keywordListName;
      mongoWrapper.initializeClient(mongoUrl, function(err, result){
        if(!err) {
          mongoWrapper.findObjectsAsArray(_keywordsCollection, {}, function(err, result){
            result.forEach(function(document){
              _userKeywordList.push(document.keyword);
            });
            var isSucceed = true;
            callback(null, isSucceed);
          });
        } else {
          callback(err, null);
        }
      });
  },
  
  addToNotificationList: function(keyword, userId, callback) {
    var updateCriteria = {"keyword": keyword};
    var updateData = {$push: {'users': parseInt(userId)}};   
    mongoWrapper.updateObject(_notificationListCollection, updateCriteria, updateData, function(err, result){
      if(!err){
        callback(null, result);
      } else {
        callback(err, null);
      }
    });
  },
  
  getNotificationList: function(keyword, callback){
    console.log("hmms umut does not get it");
    mongoWrapper.findObjectsAsArray(_notificationListCollection,{"keyword":keyword}, function(err, result){
      if(!err) {
        console.log("HERERERERER: "+JSON.stringify(result[0]));
        callback(null, result[0].users);
      } else {
        console.log("OOPS ERROR :(");
        callback(err, null);
      }
    })
  },
  
  newKeywordWithUser: function(keyword, userId, callback) {
    var obj = {
      "keyword":  keyword,
      "users":    []
    };
    obj.users.push(userId);
    mongoWrapper.insertObject(_notificationListCollection, obj, function(err, result){
      if(!err) {
        mongoWrapper.insertObject(_keywordsCollection, {"keyword": keyword}, function(err, result){
          if(!err) {
            
            _userKeywordList.push(keyword); //dafuq ???
            callback(null, result);
          } else {
            console.log("err occoured during inserting new keyword. B");
          }
        });
      } else {
        console.log("err occoured during inserting new keyword. A");
      }
    });
  },
  
  isKeywordExist: function(keyword){
    return _userKeywordList.indexOf(keyword) > -1;
  },
  
  getKeywordList: function(){
    return _userKeywordList;
  },
  
  removeUserFromNotificationList: function(keyword, userId, callback) {
    var updateCriteria = {"keyword": keyword};
    var updateData = {$pull: { 'users': parseInt(userId) } }
    mongoWrapper.updateObject(_notificationListCollection, updateCriteria, updateData, function(err, result){
      if(!err){
        callback(null, result);
      } else {
        callback(err, null);
      }
    });
  },
  
  isUserInNotificationList: function(keyword, userId, callback) {
    var findCriteria = {"keyword": keyword, "users": userId};
    console.log("YES?!")
    mongoWrapper.findObjectsAsArray(_notificationListCollection, findCriteria, function(err, result) {
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